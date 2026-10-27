import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Mail,
  Phone,
  Hash,
  Building,
  Loader2,
  FolderKanban,
  Award,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

const AssignedStudents = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await api.get('/supervisor/students');
        if (res.data?.success) {
          setStudents(res.data.students || []);
        }
      } catch (err) {
        toast.error('Failed to fetch assigned students.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#382115] flex items-center gap-3">
          <Users className="w-7 h-7 text-[#b5743d]" />
          Assigned Students
        </h1>
        <p className="text-[#7a6455] text-sm mt-1">
          Students currently allocated to you for Final Year Project supervision and evaluation.
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#b5743d]" />
          <p className="text-xs font-semibold text-[#8c7a6b]">Loading student roster...</p>
        </div>
      ) : students.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {students.map((student) => {
            const hasProject = Boolean(student.projectInfo);
            const projectTitle = student.projectInfo?.title || 'Proposal Under Review';
            const milestone = student.projectInfo?.currentMilestone || 'proposal';

            return (
              <div
                key={student._id}
                className="bg-white border border-[#ece1d5] rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#f7efe6] border border-[#e2d2c1] flex items-center justify-center text-[#8c4e24] font-black text-lg">
                      {student.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#382115] text-base">{student.name}</h3>
                      <div className="text-xs text-[#8c7a6b]">
                        {student.department || 'Computer Science'} • Batch {student.batch || '2023'}
                      </div>
                    </div>
                  </div>

                  {/* Project Info Pill */}
                  <div className="p-3.5 rounded-2xl bg-[#faf6f0] border border-[#ece1d5] space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#8c7a6b]">
                      Active Project
                    </div>
                    <div className="text-xs font-bold text-[#382115] line-clamp-1">
                      {projectTitle}
                    </div>
                    <div className="text-[10px] text-[#7a6455] font-semibold uppercase">
                      Milestone: {milestone.replace('_', ' ')}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 text-xs text-[#5d4638] pt-1">
                    <div className="flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5 text-[#8c7a6b] shrink-0" />
                      <span>ID: <strong>{student.studentId || 'N/A'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#8c7a6b] shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </div>
                    {student.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#8c7a6b] shrink-0" />
                        <span>{student.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-[#ece1d5] flex items-center justify-between gap-2">
                  <Link
                    to="/supervisor/progress"
                    className="text-xs font-bold text-[#b5743d] hover:text-[#8c4e24] transition"
                  >
                    View Weekly Logs
                  </Link>

                  <Link
                    to="/supervisor/grading"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#faf6f0] hover:bg-[#f7efe6] border border-[#ece1d5] text-xs font-bold text-[#382115] transition"
                  >
                    <Award className="w-3.5 h-3.5 text-[#b5743d]" />
                    <span>Grade</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-[#ece1d5] rounded-3xl p-6 shadow-sm space-y-3">
          <Users className="w-12 h-12 text-[#8c7a6b]/50 mx-auto" />
          <h3 className="font-extrabold text-[#382115] text-lg">No Assigned Students</h3>
          <p className="text-xs text-[#7a6455] max-w-sm mx-auto">
            The FYP Coordinator has not allocated students to your supervision roster yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default AssignedStudents;
