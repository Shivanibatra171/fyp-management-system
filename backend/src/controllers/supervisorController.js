const {
  User,
  Proposal,
  Project,
  Feedback,
  Marks,
  ProgressUpdate,
  Document,
} = require('../models');

// @desc    List all students assigned to this supervisor
// @route   GET /api/supervisor/students
// @access  Supervisor only
const getAssignedStudents = async (req, res, next) => {
  try {
    const supervisorId = req.user._id;

    // 1. Find students directly assigned via User profile
    const directStudents = await User.find({
      role: 'student',
      assignedSupervisor: supervisorId,
    }).select('-password');

    // 2. Find students via active projects under this supervisor
    const supervisorProjects = await Project.find({ supervisor: supervisorId })
      .populate('students', '-password')
      .populate('proposal', 'title status');

    const projectStudentIds = [];
    const projectStudentMap = new Map();

    for (const proj of supervisorProjects) {
      for (const stu of proj.students) {
        projectStudentIds.push(stu._id.toString());
        projectStudentMap.set(stu._id.toString(), {
          project: {
            id: proj._id,
            title: proj.title,
            status: proj.status,
            currentMilestone: proj.currentMilestone,
            finalMarks: proj.finalMarks,
          },
        });
      }
    }

    // Combine distinct students
    const allStudentIds = new Set([
      ...directStudents.map((s) => s._id.toString()),
      ...projectStudentIds,
    ]);

    const combinedStudents = await User.find({
      _id: { $in: Array.from(allStudentIds) },
    }).select('-password');

    const result = combinedStudents.map((stu) => {
      const extra = projectStudentMap.get(stu._id.toString()) || {};
      return {
        _id: stu._id,
        name: stu.name,
        email: stu.email,
        studentId: stu.studentId,
        department: stu.department,
        batch: stu.batch,
        phone: stu.phone,
        isActive: stu.isActive,
        projectInfo: extra.project || null,
      };
    });

    res.status(200).json({
      success: true,
      count: result.length,
      students: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List all proposals submitted to or assigned to this supervisor
// @route   GET /api/supervisor/proposals
// @access  Supervisor only
const getAssignedProposals = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {
      $or: [{ supervisor: req.user._id }, { supervisor: null }],
    };

    if (status) {
      query.status = status;
    }

    const proposals = await Proposal.find(query)
      .populate('submittedBy', 'name email studentId department batch')
      .populate('supervisor', 'name email designation department')
      .populate('similarityResult')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: proposals.length,
      proposals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject a proposal with remarks
// @route   PUT /api/supervisor/proposals/:id/review
// @access  Supervisor only
const reviewProposal = async (req, res, next) => {
  try {
    const { status, remarks = '' } = req.body;

    if (!status || !['approved', 'rejected', 'changes_requested'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'approved', 'rejected', or 'changes_requested'.",
      });
    }

    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found.',
      });
    }

    // Assign supervisor if not yet assigned
    if (!proposal.supervisor) {
      proposal.supervisor = req.user._id;
    }

    proposal.status = status;
    proposal.supervisorRemarks = remarks;
    await proposal.save();

    let project = null;

    // If approved, create or activate corresponding Project record
    if (status === 'approved') {
      project = await Project.findOne({ proposal: proposal._id });

      if (!project) {
        project = await Project.create({
          proposal: proposal._id,
          title: proposal.title,
          abstract: proposal.abstract,
          domain: proposal.domain,
          technologies: proposal.technologies,
          students: [proposal.submittedBy],
          supervisor: req.user._id,
          status: 'in-progress',
          currentMilestone: 'srs',
        });
      } else {
        project.status = 'in-progress';
        project.supervisor = req.user._id;
        await project.save();
      }

      // Also ensure student has assignedSupervisor set
      await User.findByIdAndUpdate(proposal.submittedBy, {
        assignedSupervisor: req.user._id,
      });
    }

    // Automatically record a Feedback entry
    await Feedback.create({
      proposal: proposal._id,
      project: project ? project._id : null,
      author: req.user._id,
      content: remarks || `Proposal has been reviewed with status: ${status}.`,
      feedbackType: 'proposal_feedback',
    });

    const populatedProposal = await Proposal.findById(proposal._id)
      .populate('submittedBy', 'name email studentId')
      .populate('supervisor', 'name email designation');

    res.status(200).json({
      success: true,
      message: `Proposal has been ${status} successfully.`,
      proposal: populatedProposal,
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Give feedback on project or proposal
// @route   POST /api/supervisor/feedback
// @access  Supervisor only
const giveFeedback = async (req, res, next) => {
  try {
    const {
      projectId,
      proposalId,
      content,
      milestoneKey = 'general',
      feedbackType = 'milestone_review',
    } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Feedback content cannot be empty.',
      });
    }

    if (!projectId && !proposalId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a projectId or proposalId.',
      });
    }

    // Verify ownership/assignment
    if (projectId) {
      const proj = await Project.findById(projectId);
      if (!proj) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }
    }

    if (proposalId) {
      const prop = await Proposal.findById(proposalId);
      if (!prop) {
        return res.status(404).json({ success: false, message: 'Proposal not found.' });
      }
    }

    const feedback = await Feedback.create({
      project: projectId || null,
      proposal: proposalId || null,
      author: req.user._id,
      content: content.trim(),
      milestoneKey,
      feedbackType,
    });

    const populated = await Feedback.findById(feedback._id).populate(
      'author',
      'name email designation'
    );

    res.status(201).json({
      success: true,
      message: 'Feedback recorded successfully.',
      feedback: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all feedback for a project
// @route   GET /api/supervisor/projects/:id/feedback
// @access  Supervisor only
const getProjectFeedback = async (req, res, next) => {
  try {
    const feedbackList = await Feedback.find({ project: req.params.id })
      .populate('author', 'name email designation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbackList.length,
      feedback: feedbackList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add progress update as supervisor
// @route   POST /api/supervisor/progress-updates
// @access  Supervisor only
const addProgressUpdate = async (req, res, next) => {
  try {
    const {
      projectId,
      title,
      description,
      weekNumber,
      tasksCompleted,
      nextWeekPlan,
      blockers,
      status = 'reviewed',
      supervisorNote,
    } = req.body;

    if (!projectId || !title || !description || !weekNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide projectId, title, description, and weekNumber.',
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Default student to the first team member if not given
    const leadStudent = project.students[0];

    const progress = await ProgressUpdate.create({
      project: projectId,
      student: leadStudent,
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
      status,
      supervisorNote: supervisorNote || 'Logged and reviewed by supervisor.',
    });

    res.status(201).json({
      success: true,
      message: 'Progress update logged successfully.',
      progressUpdate: progress,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Review/comment on a student progress update
// @route   PUT /api/supervisor/progress-updates/:id/review
// @access  Supervisor only
const reviewStudentProgress = async (req, res, next) => {
  try {
    const { supervisorNote, status = 'reviewed' } = req.body;

    const progress = await ProgressUpdate.findById(req.params.id);
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress update not found.',
      });
    }

    if (supervisorNote !== undefined) {
      progress.supervisorNote = supervisorNote.trim();
    }
    progress.status = status;
    await progress.save();

    res.status(200).json({
      success: true,
      message: 'Progress update reviewed successfully.',
      progressUpdate: progress,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign marks for a milestone
// @route   POST /api/supervisor/marks
// @access  Supervisor only
const assignMarks = async (req, res, next) => {
  try {
    const {
      projectId,
      milestoneKey,
      marksAwarded,
      maxMarks = 100,
      remarks = '',
      studentId = null,
    } = req.body;

    const validMilestones = [
      'proposal_defense',
      'srs',
      'mid_evaluation',
      'final_defense',
      'final_thesis',
    ];

    if (!projectId || !milestoneKey || marksAwarded === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide projectId, milestoneKey, and marksAwarded.',
      });
    }

    if (!validMilestones.includes(milestoneKey)) {
      return res.status(400).json({
        success: false,
        message: `Invalid milestoneKey. Must be one of: [${validMilestones.join(', ')}]`,
      });
    }

    const marksNum = parseFloat(marksAwarded);
    const maxMarksNum = parseFloat(maxMarks);

    if (isNaN(marksNum) || marksNum < 0 || marksNum > maxMarksNum) {
      return res.status(400).json({
        success: false,
        message: `Marks awarded must be a positive number between 0 and maxMarks (${maxMarksNum}).`,
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Upsert Marks record
    const filter = {
      project: projectId,
      milestoneKey,
      student: studentId || null,
    };

    const updateDoc = {
      marksAwarded: marksNum,
      maxMarks: maxMarksNum,
      remarks: remarks.trim(),
      gradedBy: req.user._id,
    };

    const marksRecord = await Marks.findOneAndUpdate(filter, updateDoc, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }).populate('gradedBy', 'name email designation');

    // If final milestone, calculate grade
    if (milestoneKey === 'final_defense' || milestoneKey === 'final_thesis') {
      project.finalMarks = marksNum;
      const percentage = (marksNum / maxMarksNum) * 100;
      if (percentage >= 85) project.finalGrade = 'A+';
      else if (percentage >= 80) project.finalGrade = 'A';
      else if (percentage >= 75) project.finalGrade = 'B+';
      else if (percentage >= 70) project.finalGrade = 'B';
      else if (percentage >= 60) project.finalGrade = 'C';
      else if (percentage >= 50) project.finalGrade = 'D';
      else project.finalGrade = 'F';

      project.status = 'completed';
      project.currentMilestone = 'completed';
      await project.save();
    }

    res.status(200).json({
      success: true,
      message: `Marks assigned for milestone '${milestoneKey}' successfully.`,
      marks: marksRecord,
      projectStatus: {
        currentMilestone: project.currentMilestone,
        status: project.status,
        finalMarks: project.finalMarks,
        finalGrade: project.finalGrade,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all marks for a project
// @route   GET /api/supervisor/projects/:id/marks
// @access  Supervisor only
const getProjectMarks = async (req, res, next) => {
  try {
    const marks = await Marks.find({ project: req.params.id })
      .populate('gradedBy', 'name email designation')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: marks.length,
      marks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List all active projects assigned to this supervisor
// @route   GET /api/supervisor/projects
// @access  Supervisor only
const getAssignedProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ supervisor: req.user._id })
      .populate('students', 'name email studentId department batch')
      .populate('proposal', 'title status similarityScore')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List all progress updates for projects supervised by this user
// @route   GET /api/supervisor/progress-updates
// @access  Supervisor only
const getSupervisorProgressUpdates = async (req, res, next) => {
  try {
    const supervisorId = req.user._id;

    // Find all projects supervised by this supervisor
    const projects = await Project.find({ supervisor: supervisorId }).select('_id title');
    const projectIds = projects.map((p) => p._id);

    const progressUpdates = await ProgressUpdate.find({
      project: { $in: projectIds },
    })
      .populate('project', 'title status currentMilestone')
      .populate('student', 'name email studentId department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: progressUpdates.length,
      progressUpdates,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssignedStudents,
  getAssignedProposals,
  reviewProposal,
  giveFeedback,
  getProjectFeedback,
  addProgressUpdate,
  reviewStudentProgress,
  getSupervisorProgressUpdates,
  assignMarks,
  getProjectMarks,
  getAssignedProjects,
};
