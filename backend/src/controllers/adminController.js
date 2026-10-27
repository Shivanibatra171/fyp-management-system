const bcrypt = require('bcryptjs');
const { User, PreviousFYP, Proposal, Project } = require('../models');
const { parsePreviousFypCsv } = require('../services/csvService');

// ==========================================
// 1. USER MANAGEMENT (STUDENTS & SUPERVISORS)
// ==========================================

// @desc    Get all users with search, filter, and pagination
// @route   GET /api/admin/users
// @access  Admin only
const getUsers = async (req, res, next) => {
  try {
    const { role, search, status, page = 1, limit = 10 } = req.query;

    const query = {};

    if (role && ['student', 'supervisor', 'admin'].includes(role)) {
      query.role = role;
    }

    if (status !== undefined) {
      query.isActive = status === 'active' || status === 'true';
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { studentId: searchRegex },
        { employeeId: searchRegex },
        { department: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .populate('assignedSupervisor', 'name email designation department')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by ID
// @route   GET /api/admin/users/:id
// @access  Admin only
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate(
      'assignedSupervisor',
      'name email designation department'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create student, supervisor, or admin user
// @route   POST /api/admin/users
// @access  Admin only
const createUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'student',
      department,
      studentId,
      batch,
      employeeId,
      designation,
      phone,
      assignedSupervisor,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    if (!['student', 'supervisor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Role must be 'student', 'supervisor', or 'admin'.",
      });
    }

    // Check email uniqueness
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Validate supervisor if assigned
    if (assignedSupervisor) {
      const supExists = await User.findOne({ _id: assignedSupervisor, role: 'supervisor' });
      if (!supExists) {
        return res.status(400).json({
          success: false,
          message: 'The assigned supervisor ID does not exist or is not a supervisor.',
        });
      }
    }

    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      role,
      department: department || 'Computer Science',
      phone: phone || '',
      assignedSupervisor: assignedSupervisor || null,
    };

    if (role === 'student') {
      if (studentId) {
        const idExists = await User.findOne({ studentId });
        if (idExists) {
          return res.status(400).json({
            success: false,
            message: 'Student ID already registered to another user.',
          });
        }
        userData.studentId = studentId;
      }
      userData.batch = batch || '';
    } else if (role === 'supervisor') {
      if (employeeId) {
        const empExists = await User.findOne({ employeeId });
        if (empExists) {
          return res.status(400).json({
            success: false,
            message: 'Employee ID already registered to another supervisor.',
          });
        }
        userData.employeeId = employeeId;
      }
      userData.designation = designation || 'Assistant Professor';
    }

    const newUser = await User.create(userData);

    // Exclude password in response
    const createdUser = await User.findById(newUser._id).select('-password');

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully.`,
      user: createdUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/admin/users/:id
// @access  Admin only
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const {
      name,
      email,
      password,
      role,
      department,
      studentId,
      batch,
      employeeId,
      designation,
      phone,
      isActive,
      assignedSupervisor,
    } = req.body;

    // Check email conflict if changing email
    if (email && email.toLowerCase() !== user.email) {
      const emailConflict = await User.findOne({ email: email.toLowerCase() });
      if (emailConflict) {
        return res.status(400).json({
          success: false,
          message: 'The new email is already in use by another user.',
        });
      }
      user.email = email.toLowerCase();
    }

    if (name !== undefined) user.name = name;
    if (role !== undefined) user.role = role;
    if (department !== undefined) user.department = department;
    if (studentId !== undefined) user.studentId = studentId;
    if (batch !== undefined) user.batch = batch;
    if (employeeId !== undefined) user.employeeId = employeeId;
    if (designation !== undefined) user.designation = designation;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;
    if (assignedSupervisor !== undefined) user.assignedSupervisor = assignedSupervisor || null;

    if (password && password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('assignedSupervisor', 'name email designation');

    res.status(200).json({
      success: true,
      message: 'User details updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin only
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Prevent deleting self (admin deleting own account)
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account.',
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: `User '${user.name}' (${user.email}) deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active/inactive status
// @route   PATCH /api/admin/users/:id/toggle-status
// @access  Admin only
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own admin account.',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account is now ${user.isActive ? 'Active' : 'Deactivated'}.`,
      isActive: user.isActive,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. SUPERVISOR ALLOCATION
// ==========================================

// @desc    Assign supervisor to student directly
// @route   PUT /api/admin/assign-supervisor/student
// @access  Admin only
const assignSupervisorToStudent = async (req, res, next) => {
  try {
    const { studentId, supervisorId } = req.body;

    if (!studentId || !supervisorId) {
      return res.status(400).json({
        success: false,
        message: 'Both studentId and supervisorId are required.',
      });
    }

    // Verify student
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Valid student user not found with specified studentId.',
      });
    }

    // Verify supervisor
    const supervisor = await User.findById(supervisorId);
    if (!supervisor || supervisor.role !== 'supervisor') {
      return res.status(404).json({
        success: false,
        message: 'Valid supervisor user not found with specified supervisorId.',
      });
    }

    student.assignedSupervisor = supervisor._id;
    await student.save();

    // Also update any active proposals or projects where this student is the lead
    await Proposal.updateMany(
      { submittedBy: student._id },
      { $set: { supervisor: supervisor._id } }
    );

    await Project.updateMany(
      { students: student._id },
      { $set: { supervisor: supervisor._id } }
    );

    res.status(200).json({
      success: true,
      message: `Supervisor '${supervisor.name}' assigned to student '${student.name}' successfully.`,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        assignedSupervisor: {
          id: supervisor._id,
          name: supervisor.name,
          email: supervisor.email,
          designation: supervisor.designation,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign supervisor to project
// @route   PUT /api/admin/assign-supervisor/project
// @access  Admin only
const assignSupervisorToProject = async (req, res, next) => {
  try {
    const { projectId, supervisorId } = req.body;

    if (!projectId || !supervisorId) {
      return res.status(400).json({
        success: false,
        message: 'Both projectId and supervisorId are required.',
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    const supervisor = await User.findById(supervisorId);
    if (!supervisor || supervisor.role !== 'supervisor') {
      return res.status(404).json({
        success: false,
        message: 'Valid supervisor not found with specified supervisorId.',
      });
    }

    project.supervisor = supervisor._id;
    await project.save();

    if (project.proposal) {
      await Proposal.findByIdAndUpdate(project.proposal, { supervisor: supervisor._id });
    }

    const updatedProject = await Project.findById(projectId)
      .populate('supervisor', 'name email designation department')
      .populate('students', 'name email studentId');

    res.status(200).json({
      success: true,
      message: `Supervisor '${supervisor.name}' assigned to project '${project.title}' successfully.`,
      project: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign supervisor to proposal
// @route   PUT /api/admin/assign-supervisor/proposal
// @access  Admin only
const assignSupervisorToProposal = async (req, res, next) => {
  try {
    const { proposalId, supervisorId } = req.body;

    if (!proposalId || !supervisorId) {
      return res.status(400).json({
        success: false,
        message: 'Both proposalId and supervisorId are required.',
      });
    }

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found.',
      });
    }

    const supervisor = await User.findById(supervisorId);
    if (!supervisor || supervisor.role !== 'supervisor') {
      return res.status(404).json({
        success: false,
        message: 'Valid supervisor not found with specified supervisorId.',
      });
    }

    proposal.supervisor = supervisor._id;
    await proposal.save();

    const updatedProposal = await Proposal.findById(proposalId)
      .populate('supervisor', 'name email designation')
      .populate('submittedBy', 'name email studentId');

    res.status(200).json({
      success: true,
      message: `Supervisor '${supervisor.name}' assigned to proposal '${proposal.title}' successfully.`,
      proposal: updatedProposal,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. CRUD FOR PREVIOUS FYP RECORDS
// ==========================================

// @desc    Get PreviousFYP records with search, filter, and pagination
// @route   GET /api/admin/previous-fyps
// @access  Admin only
const getPreviousFyps = async (req, res, next) => {
  try {
    const { search, domain, year, page = 1, limit = 10 } = req.query;

    const query = {};

    if (domain) {
      query.domain = new RegExp(domain.trim(), 'i');
    }

    if (year) {
      query.year = parseInt(year, 10);
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { abstract: searchRegex },
        { supervisorName: searchRegex },
        { studentNames: searchRegex },
        { technologies: searchRegex },
        { domain: searchRegex },
      ];
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

// @desc    Get single PreviousFYP record
// @route   GET /api/admin/previous-fyps/:id
// @access  Admin only
const getPreviousFypById = async (req, res, next) => {
  try {
    const record = await PreviousFYP.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Previous FYP record not found.',
      });
    }

    res.status(200).json({
      success: true,
      record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create single PreviousFYP record
// @route   POST /api/admin/previous-fyps
// @access  Admin only
const createPreviousFyp = async (req, res, next) => {
  try {
    const {
      title,
      abstract,
      domain,
      year,
      supervisorName,
      studentNames,
      technologies,
      grade,
      documentUrl,
    } = req.body;

    if (!title || !abstract || !domain || !year || !supervisorName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, abstract, domain, year, and supervisorName.',
      });
    }

    // Normalize studentNames
    let studentsArray = [];
    if (Array.isArray(studentNames)) {
      studentsArray = studentNames;
    } else if (typeof studentNames === 'string') {
      studentsArray = studentNames
        .split(/[,;|]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }
    if (studentsArray.length === 0) {
      studentsArray = ['FYP Student Team'];
    }

    // Normalize technologies
    let techArray = [];
    if (Array.isArray(technologies)) {
      techArray = technologies;
    } else if (typeof technologies === 'string') {
      techArray = technologies
        .split(/[,;|]/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    }

    const record = await PreviousFYP.create({
      title: title.trim(),
      abstract: abstract.trim(),
      domain: domain.trim(),
      year: parseInt(year, 10),
      supervisorName: supervisorName.trim(),
      studentNames: studentsArray,
      technologies: techArray,
      grade: grade || 'A',
      documentUrl: documentUrl || '',
    });

    res.status(201).json({
      success: true,
      message: 'Previous FYP record created successfully.',
      record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update single PreviousFYP record
// @route   PUT /api/admin/previous-fyps/:id
// @access  Admin only
const updatePreviousFyp = async (req, res, next) => {
  try {
    const record = await PreviousFYP.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Previous FYP record not found.',
      });
    }

    const {
      title,
      abstract,
      domain,
      year,
      supervisorName,
      studentNames,
      technologies,
      grade,
      documentUrl,
    } = req.body;

    if (title !== undefined) record.title = title.trim();
    if (abstract !== undefined) record.abstract = abstract.trim();
    if (domain !== undefined) record.domain = domain.trim();
    if (year !== undefined) record.year = parseInt(year, 10);
    if (supervisorName !== undefined) record.supervisorName = supervisorName.trim();
    if (grade !== undefined) record.grade = grade.trim();
    if (documentUrl !== undefined) record.documentUrl = documentUrl.trim();

    if (studentNames !== undefined) {
      if (Array.isArray(studentNames)) {
        record.studentNames = studentNames;
      } else if (typeof studentNames === 'string') {
        record.studentNames = studentNames
          .split(/[,;|]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }
    }

    if (technologies !== undefined) {
      if (Array.isArray(technologies)) {
        record.technologies = technologies;
      } else if (typeof technologies === 'string') {
        record.technologies = technologies
          .split(/[,;|]/)
          .map((t) => t.trim())
          .filter((t) => t.length > 0);
      }
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: 'Previous FYP record updated successfully.',
      record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete single PreviousFYP record
// @route   DELETE /api/admin/previous-fyps/:id
// @access  Admin only
const deletePreviousFyp = async (req, res, next) => {
  try {
    const record = await PreviousFYP.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Previous FYP record not found.',
      });
    }

    await record.deleteOne();

    res.status(200).json({
      success: true,
      message: `Previous FYP record '${record.title}' deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. BULK CSV IMPORT FOR PREVIOUS FYPS
// ==========================================

// @desc    Bulk import PreviousFYP records via CSV file upload
// @route   POST /api/admin/previous-fyps/import-csv
// @access  Admin only
const importPreviousFypsCsv = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a CSV file with field name "file".',
      });
    }

    const { validRecords, invalidRows, totalProcessed } = await parsePreviousFypCsv(
      req.file.buffer
    );

    if (validRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid records found in the uploaded CSV file.',
        totalProcessed,
        skippedCount: invalidRows.length,
        errors: invalidRows,
      });
    }

    const inserted = await PreviousFYP.insertMany(validRecords);

    res.status(201).json({
      success: true,
      message: `Successfully imported ${inserted.length} Previous FYP records from CSV.`,
      importedCount: inserted.length,
      skippedCount: invalidRows.length,
      totalProcessed,
      errors: invalidRows.length > 0 ? invalidRows : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. LIST PROPOSALS & PROJECTS WITH FILTERS
// ==========================================

// @desc    List all proposals with filters, search, and pagination
// @route   GET /api/admin/proposals
// @access  Admin only
const getAllProposals = async (req, res, next) => {
  try {
    const { status, domain, supervisor, search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (domain) {
      query.domain = new RegExp(domain.trim(), 'i');
    }

    if (supervisor) {
      query.supervisor = supervisor;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { abstract: searchRegex },
        { domain: searchRegex },
        { technologies: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [proposals, total] = await Promise.all([
      Proposal.find(query)
        .populate('submittedBy', 'name email studentId department')
        .populate('supervisor', 'name email designation department')
        .populate('similarityResult')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Proposal.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: proposals.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      proposals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List all projects with filters, search, and pagination
// @route   GET /api/admin/projects
// @access  Admin only
const getAllProjects = async (req, res, next) => {
  try {
    const { status, domain, supervisor, search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (domain) {
      query.domain = new RegExp(domain.trim(), 'i');
    }

    if (supervisor) {
      query.supervisor = supervisor;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { abstract: searchRegex },
        { domain: searchRegex },
        { technologies: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('students', 'name email studentId department batch')
        .populate('supervisor', 'name email designation department')
        .populate('proposal', 'title status similarityScore')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Project.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: projects.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics for Admin
// @route   GET /api/admin/stats
// @access  Admin only
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalSupervisors,
      totalProposals,
      pendingProposals,
      approvedProposals,
      rejectedProposals,
      totalProjects,
      activeProjects,
      completedProjects,
      totalPreviousFyps,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'supervisor' }),
      Proposal.countDocuments(),
      Proposal.countDocuments({ status: 'pending' }),
      Proposal.countDocuments({ status: 'approved' }),
      Proposal.countDocuments({ status: 'rejected' }),
      Project.countDocuments(),
      Project.countDocuments({ status: 'in-progress' }),
      Project.countDocuments({ status: 'completed' }),
      PreviousFYP.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          students: totalStudents,
          supervisors: totalSupervisors,
          total: totalStudents + totalSupervisors,
        },
        proposals: {
          total: totalProposals,
          pending: pendingProposals,
          approved: approvedProposals,
          rejected: rejectedProposals,
        },
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
        },
        previousFyps: {
          total: totalPreviousFyps,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // Users
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  // Supervisors
  assignSupervisorToStudent,
  assignSupervisorToProject,
  assignSupervisorToProposal,
  // PreviousFYP
  getPreviousFyps,
  getPreviousFypById,
  createPreviousFyp,
  updatePreviousFyp,
  deletePreviousFyp,
  importPreviousFypsCsv,
  // Proposals & Projects
  getAllProposals,
  getAllProjects,
  getDashboardStats,
};
