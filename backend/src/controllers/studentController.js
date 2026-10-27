const path = require('path');
const fs = require('fs');
const {
  Proposal,
  Project,
  PreviousFYP,
  Document,
  Feedback,
  Marks,
  ProgressUpdate,
  User,
  SimilarityResult,
} = require('../models');
const { checkProposalSimilarity } = require('../services/aiService');

// @desc    Submit FYP Proposal
// @route   POST /api/student/proposals
// @access  Student only
const submitProposal = async (req, res, next) => {
  try {
    const { title, abstract, domain, technologies, groupMembers, supervisor } = req.body;

    if (!title || !abstract || !domain) {
      return res.status(400).json({
        success: false,
        message: 'Please provide proposal title, abstract, and domain.',
      });
    }

    // Check if student already has an active pending or approved proposal
    const existingActive = await Proposal.findOne({
      submittedBy: req.user._id,
      status: { $in: ['pending', 'approved'] },
    });

    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: `You already have an active proposal '${existingActive.title}' with status '${existingActive.status}'.`,
      });
    }

    // Parse technologies
    let techArray = [];
    if (Array.isArray(technologies)) {
      techArray = technologies;
    } else if (typeof technologies === 'string') {
      techArray = technologies
        .split(/[,;|]/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    }

    // Parse group members cleanly
    let membersArray = [];
    if (Array.isArray(groupMembers)) {
      membersArray = groupMembers
        .map((m) => {
          if (typeof m === 'string') return { name: m.trim(), studentId: '', email: '' };
          return {
            name: (m.name || '').trim(),
            studentId: (m.studentId || '').trim(),
            email: (m.email || '').trim(),
          };
        })
        .filter((m) => m.name.length > 0);
    } else if (typeof groupMembers === 'string') {
      const trimmed = groupMembers.trim();
      if (trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            membersArray = parsed
              .map((m) => {
                if (typeof m === 'string') return { name: m.trim(), studentId: '', email: '' };
                return {
                  name: (m.name || '').trim(),
                  studentId: (m.studentId || '').trim(),
                  email: (m.email || '').trim(),
                };
              })
              .filter((m) => m.name.length > 0);
          }
        } catch (e) {
          membersArray = [];
        }
      }
      if (membersArray.length === 0 && trimmed.length > 0) {
        membersArray = trimmed
          .split(/[,;|]/)
          .map((m) => ({ name: m.trim(), studentId: '', email: '' }))
          .filter((m) => m.name.length > 0);
      }
    }

    // Determine supervisor: passed in body OR student's assigned supervisor
    let targetSupervisor = supervisor || req.user.assignedSupervisor || null;

    if (targetSupervisor) {
      const supUser = await User.findOne({ _id: targetSupervisor, role: 'supervisor' });
      if (!supUser) {
        targetSupervisor = null;
      }
    }

    // Run AI similarity check against historical FYP projects
    const aiResult = await checkProposalSimilarity(title, abstract);

    const proposal = await Proposal.create({
      title: title.trim(),
      abstract: abstract.trim(),
      domain: domain.trim(),
      technologies: techArray,
      submittedBy: req.user._id,
      groupMembers: membersArray,
      supervisor: targetSupervisor,
      status: 'pending',
      similarityScore: aiResult.max_similarity || 0,
      similarityWarning: aiResult.has_warning || false,
    });

    // Save detailed AI similarity report
    const similarityResultDoc = await SimilarityResult.create({
      proposal: proposal._id,
      maxSimilarity: aiResult.max_similarity || 0,
      hasWarning: aiResult.has_warning || false,
      warningMessage: aiResult.warning_message || '',
      topMatches: (aiResult.top_matches || []).map((m) => ({
        previousFypId: m.id,
        title: m.title,
        year: m.year,
        domain: m.domain,
        similarityPercentage: m.similarity_percentage,
      })),
    });

    proposal.similarityResult = similarityResultDoc._id;
    await proposal.save();

    const populatedProposal = await Proposal.findById(proposal._id)
      .populate('submittedBy', 'name email studentId department')
      .populate('supervisor', 'name email designation department')
      .populate('similarityResult');

    const warningMsg = aiResult.has_warning
      ? `High similarity detected (${aiResult.max_similarity}%). This proposal is similar to existing completed projects.`
      : null;

    res.status(201).json({
      success: true,
      message: aiResult.has_warning
        ? `Proposal submitted with HIGH SIMILARITY WARNING (${aiResult.max_similarity}%).`
        : 'Proposal submitted successfully and is pending supervisor review.',
      hasWarning: aiResult.has_warning || false,
      warning: warningMsg,
      similarityReport: {
        maxSimilarity: aiResult.max_similarity || 0,
        hasWarning: aiResult.has_warning || false,
        warningMessage: aiResult.warning_message,
        topMatches: aiResult.top_matches || [],
        totalCompared: aiResult.total_compared || 0,
      },
      proposal: populatedProposal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    View own proposal, project status, and assigned supervisor
// @route   GET /api/student/my-project
// @access  Student only
const getMyProjectStatus = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // 1. Fetch user's profile with assigned supervisor
    const currentUser = await User.findById(studentId).populate(
      'assignedSupervisor',
      'name email designation department phone'
    );

    // 2. Find student's proposal(s)
    const proposals = await Proposal.find({
      $or: [{ submittedBy: studentId }, { 'groupMembers.user': studentId }],
    })
      .populate('supervisor', 'name email designation department phone')
      .populate('submittedBy', 'name email studentId department')
      .populate('similarityResult')
      .sort({ createdAt: -1 });

    const activeProposal = proposals[0] || null;

    // 3. Find active project if proposal is approved
    let project = null;
    let documents = [];
    let feedback = [];
    let marks = [];
    let progressUpdates = [];

    if (activeProposal) {
      project = await Project.findOne({
        $or: [{ proposal: activeProposal._id }, { students: studentId }],
      })
        .populate('students', 'name email studentId department batch')
        .populate('supervisor', 'name email designation department phone');

      const projectId = project ? project._id : null;

      // Fetch related records
      const docQuery = {
        $or: [
          { uploadedBy: studentId },
          ...(projectId ? [{ project: projectId }] : []),
          { proposal: activeProposal._id },
        ],
      };
      documents = await Document.find(docQuery).sort({ createdAt: -1 });

      const feedbackQuery = {
        $or: [
          { proposal: activeProposal._id },
          ...(projectId ? [{ project: projectId }] : []),
        ],
      };
      feedback = await Feedback.find(feedbackQuery)
        .populate('author', 'name email designation role')
        .sort({ createdAt: -1 });

      if (projectId) {
        marks = await Marks.find({ project: projectId })
          .populate('gradedBy', 'name email designation')
          .sort({ createdAt: 1 });

        progressUpdates = await ProgressUpdate.find({ project: projectId })
          .populate('student', 'name email studentId')
          .sort({ weekNumber: -1 });
      }
    }

    res.status(200).json({
      success: true,
      studentProfile: {
        id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
        studentId: currentUser.studentId,
        department: currentUser.department,
        assignedSupervisor: currentUser.assignedSupervisor,
      },
      proposal: activeProposal,
      allProposals: proposals,
      project,
      documents,
      feedback,
      marks,
      progressUpdates,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search and filter previous FYPs
// @route   GET /api/student/previous-fyps
// @access  Student (or Authenticated)
const searchPreviousFyps = async (req, res, next) => {
  try {
    const { search, keyword, year, technology, domain, page = 1, limit = 10 } = req.query;

    const query = {};

    const searchTerm = search || keyword;
    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { abstract: searchRegex },
        { supervisorName: searchRegex },
        { studentNames: searchRegex },
        { technologies: searchRegex },
        { domain: searchRegex },
      ];
    }

    if (year) {
      query.year = parseInt(year, 10);
    }

    if (domain) {
      query.domain = new RegExp(domain.trim(), 'i');
    }

    if (technology) {
      query.technologies = { $elemMatch: { $regex: technology.trim(), $options: 'i' } };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [records, total] = await Promise.all([
      PreviousFYP.find(query)
        .sort({ year: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      PreviousFYP.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload Project Document (PDF/DOCX only, max 10MB)
// @route   POST /api/student/documents
// @access  Student only
const uploadDocumentFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a file to upload (PDF or DOCX format, max 10MB).',
      });
    }

    const { title, milestoneKey = 'proposal_doc', projectId, proposalId } = req.body;

    let targetProjectId = projectId || null;
    let targetProposalId = proposalId || null;

    // Auto-resolve project or proposal if not passed explicitly
    if (!targetProjectId && !targetProposalId) {
      const activeProj = await Project.findOne({ students: req.user._id, status: 'in-progress' });
      if (activeProj) {
        targetProjectId = activeProj._id;
        targetProposalId = activeProj.proposal;
      } else {
        const activeProp = await Proposal.findOne({
          submittedBy: req.user._id,
          status: { $in: ['pending', 'approved'] },
        });
        if (activeProp) {
          targetProposalId = activeProp._id;
        }
      }
    }

    const newDocument = await Document.create({
      project: targetProjectId,
      proposal: targetProposalId,
      title: title ? title.trim() : req.file.originalname,
      milestoneKey,
      originalFileName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully.',
      document: newDocument,
    });
  } catch (error) {
    // Clean up file from disk if creation fails
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {}
    }
    next(error);
  }
};

// @desc    List own uploaded documents
// @route   GET /api/student/documents
// @access  Student only
const getMyDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ uploadedBy: req.user._id })
      .populate('project', 'title status currentMilestone')
      .populate('proposal', 'title status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download project document securely
// @route   GET /api/student/documents/:id/download
// @access  Authenticated
const downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document record not found.',
      });
    }

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Document file not found on disk server.',
      });
    }

    res.download(document.filePath, document.originalFileName);
  } catch (error) {
    next(error);
  }
};

// @desc    Submit weekly progress update
// @route   POST /api/student/progress-updates
// @access  Student only
const submitStudentProgress = async (req, res, next) => {
  try {
    const { title, description, weekNumber, tasksCompleted, nextWeekPlan, blockers, projectId } =
      req.body;

    if (!title || !description || !weekNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and weekNumber.',
      });
    }

    let targetProjectId = projectId;
    if (!targetProjectId) {
      let activeProject = await Project.findOne({
        students: req.user._id,
      });

      if (!activeProject) {
        // If student has an approved proposal, create/spawn the Project record
        const approvedProposal = await Proposal.findOne({
          submittedBy: req.user._id,
          status: 'approved',
        });
        if (approvedProposal) {
          activeProject = await Project.create({
            proposal: approvedProposal._id,
            title: approvedProposal.title,
            abstract: approvedProposal.abstract,
            domain: approvedProposal.domain,
            technologies: approvedProposal.technologies,
            students: [req.user._id],
            supervisor: approvedProposal.supervisor,
            status: 'in-progress',
            currentMilestone: 'srs',
          });
        }
      }

      if (!activeProject) {
        return res.status(400).json({
          success: false,
          message: 'No active project found for this student to submit progress updates for.',
        });
      }
      targetProjectId = activeProject._id;
    }

    const update = await ProgressUpdate.create({
      project: targetProjectId,
      student: req.user._id,
      title: title.trim(),
      description: description.trim(),
      weekNumber: parseInt(weekNumber, 10),
      tasksCompleted: Array.isArray(tasksCompleted)
        ? tasksCompleted
        : (tasksCompleted || '').split(/[,;|]/).map((t) => t.trim()).filter(Boolean),
      nextWeekPlan: Array.isArray(nextWeekPlan)
        ? nextWeekPlan
        : (nextWeekPlan || '').split(/[,;|]/).map((t) => t.trim()).filter(Boolean),
      blockers: blockers || '',
      status: 'submitted',
    });

    res.status(201).json({
      success: true,
      message: 'Weekly progress update submitted successfully.',
      progressUpdate: update,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Pre-check AI similarity for proposal without saving
// @route   POST /api/student/proposals/check-similarity
// @access  Student only
const checkSimilarityPreSubmit = async (req, res, next) => {
  try {
    const { title, abstract } = req.body;
    if (!title || !abstract) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both proposal title and abstract to check similarity.',
      });
    }

    const aiResult = await checkProposalSimilarity(title, abstract);

    return res.status(200).json({
      success: true,
      data: {
        maxSimilarity: aiResult.max_similarity || 0,
        hasWarning: aiResult.has_warning || false,
        warningMessage: aiResult.warning_message || '',
        topMatches: (aiResult.top_matches || []).map((m) => ({
          id: m.id,
          title: m.title,
          abstract: m.abstract,
          year: m.year,
          domain: m.domain,
          similarityPercentage: m.similarity_percentage,
        })),
        totalCompared: aiResult.total_compared || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of available supervisors for proposal dropdown
// @route   GET /api/student/supervisors
// @access  Student only
const getSupervisorsList = async (req, res, next) => {
  try {
    const supervisors = await User.find({ role: 'supervisor', isActive: true })
      .select('name email designation department phone')
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: supervisors.length,
      supervisors,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitProposal,
  checkSimilarityPreSubmit,
  getSupervisorsList,
  getMyProjectStatus,
  searchPreviousFyps,
  uploadDocumentFile,
  getMyDocuments,
  downloadDocument,
  submitStudentProgress,
};
