import './FacultyDashboard.css';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import {
  getFaculty,
  getFacultyMentees,
  getFacultyCourses,
  getFacultyMeetings,
  getFacultyGrievances,
  respondGrievance,
  enterMarks,
  getTopStudentsForFaculty,
  sendNotification,
  getStudentByRollNo,
  getStudentMarks,
  getStudentAttendance,
  getStudentFees,
  getStudentEducation,
  getStudentParents,
} from '../services/api';

import './FacultyDashboard.css';


const menuItems = [
  { key: 'overview', label: '🏠 Overview' },
  { key: 'profile', label: '👤 My Profile' },
  { key: 'mentees', label: '👥 My Mentees' },
  { key: 'search', label: '🔍 Search Student' },
  { key: 'marks', label: '📝 Enter Marks' },
  { key: 'grievances', label: '📋 Grievances' },
  { key: 'topstudents', label: '🏆 Top Students' },
  { key: 'notify', label: '🔔 Send Notification' },
];


export default function FacultyDashboard() {

  const { user, logoutUser } = useAuth();

  const [active, setActive] = useState('overview');

  const [facultyData, setFacultyData] = useState(null);
  const [mentees, setMentees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [topStudents, setTopStudents] = useState([]);

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();


  useEffect(() => {

    const fetchAll = async () => {

      try {

        const facRes = await getFaculty();

        const fac = facRes.data[0];

        setFacultyData(fac);


        const [
          men,
          crs,
          met,
          grv,
          top
        ] = await Promise.all([
          getFacultyMentees(fac.id),
          getFacultyCourses(fac.id),
          getFacultyMeetings(fac.id),
          getFacultyGrievances(),
          getTopStudentsForFaculty(),
        ]);


        setMentees(men.data);
        setCourses(crs.data);
        setMeetings(met.data);
        setGrievances(grv.data);
        setTopStudents(top.data);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);

      }

    };


    fetchAll();

  }, []);


  const handleLogout = () => {

    logoutUser();
    navigate('/');

  };


  if (loading) {

    return (
      <div className="faculty-loading">

        <div className="faculty-loading-content">

          <div className="faculty-loading-icon">
            👨‍🏫
          </div>

          <p>
            Loading faculty portal...
          </p>

        </div>

      </div>
    );

  }


  return (

    <div className="faculty-container">

      {/* ================= NAVBAR ================= */}

      <nav className="faculty-nav">

        <div className="faculty-nav-left">

          <span className="faculty-logo">
            👨‍🏫
          </span>

          <div>

            <div className="faculty-uni-name">
              University Faculty Portal
            </div>

            <div className="faculty-uni-sub">
              {facultyData?.department} ·{' '}
              {facultyData?.jobTitle}
            </div>

          </div>

        </div>


        <div className="faculty-nav-right">

          <span className="faculty-welcome">
            {facultyData?.name || user?.email}
          </span>

          <button
            onClick={handleLogout}
            className="faculty-logout"
          >
            Log off
          </button>

        </div>

      </nav>


      {/* ================= BODY ================= */}

      <div className="faculty-body">


        {/* ================= SIDEBAR ================= */}

        <aside className="faculty-sidebar">

          <div className="faculty-sidebar-title">
            Faculty Self Service
          </div>


          {menuItems.map((item) => (

            <div
              key={item.key}
              className={`faculty-menu-item ${
                active === item.key
                  ? 'faculty-menu-active'
                  : ''
              }`}
              onClick={() =>
                setActive(item.key)
              }
            >

              {item.label}

            </div>

          ))}

        </aside>


        {/* ================= MAIN ================= */}

        <main className="faculty-main">

          {active === 'overview' && (
            <Overview
              faculty={facultyData}
              mentees={mentees}
              courses={courses}
              grievances={grievances}
            />
          )}


          {active === 'profile' && (
            <FacultyProfile
              faculty={facultyData}
            />
          )}


          {active === 'mentees' && (
            <MenteesSection
              mentees={mentees}
              meetings={meetings}
            />
          )}


          {active === 'search' && (
            <SearchStudent />
          )}


          {active === 'marks' && (
            <EnterMarks
              courses={courses}
              mentees={mentees}
            />
          )}


          {active === 'grievances' && (
            <GrievancesSection
              grievances={grievances}
              setGrievances={setGrievances}
            />
          )}


          {active === 'topstudents' && (
            <TopStudents
              topStudents={topStudents}
            />
          )}


          {active === 'notify' && (
            <SendNotification
              mentees={mentees}
              faculty={facultyData}
            />
          )}

        </main>

      </div>

    </div>

  );

}


/* =====================================================
   OVERVIEW
   ===================================================== */

function Overview({
  faculty,
  mentees,
  courses,
  grievances
}) {

  const openGrievances =
    grievances.filter(
      (g) => g.status === 'OPEN'
    ).length;


  return (

    <div>

      <h2 className="faculty-page-title">
        Overview
      </h2>


      <div className="faculty-welcome-card">

        <h2>
          👋 Welcome, {faculty?.name}!
        </h2>

        <p>
          {faculty?.department} ·{' '}
          {faculty?.jobTitle} · Joined{' '}
          {faculty?.joiningDate?.split('T')[0]}
        </p>

      </div>


      <div className="faculty-grid-4">

        <div className="faculty-stat-box faculty-stat-blue">
          <h2>{mentees.length}</h2>
          <p>My Mentees</p>
        </div>


        <div className="faculty-stat-box faculty-stat-green">
          <h2>{courses.length}</h2>
          <p>Courses</p>
        </div>


        <div
          className={`faculty-stat-box ${
            openGrievances > 0
              ? 'faculty-stat-red'
              : 'faculty-stat-purple'
          }`}
        >
          <h2>{openGrievances}</h2>
          <p>Open Grievances</p>
        </div>


        <div className="faculty-stat-box faculty-stat-brown">

          <h2>
            ₹{faculty?.salary?.toLocaleString()}
          </h2>

          <p>Salary</p>

        </div>

      </div>

    </div>

  );
}


/* =====================================================
   FACULTY PROFILE
   ===================================================== */

function FacultyProfile({ faculty }) {

  return (

    <div>

      <h2 className="faculty-page-title">
        My Profile
      </h2>


      <div className="faculty-info-card">

        <div className="faculty-table-wrapper">

          <table className="faculty-info-table">

            <tbody>

              {[
                ['Name', faculty?.name],
                ['Department', faculty?.department],
                ['Job Title', faculty?.jobTitle],
                ['Email', faculty?.email],
                ['Phone', faculty?.phone],
                [
                  'Joining Date',
                  faculty?.joiningDate?.split('T')[0]
                ],
                [
                  'Salary',
                  faculty?.salary
                    ? `₹${faculty.salary.toLocaleString()}`
                    : '—'
                ],
                [
                  'Status',
                  faculty?.isActive
                    ? '✅ Active'
                    : '❌ Inactive'
                ],
              ].map(([label, value]) => (

                <tr
                  key={label}
                  className="faculty-info-row"
                >

                  <td className="faculty-info-label">
                    {label}
                  </td>

                  <td className="faculty-info-value">
                    {value || '—'}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );
}


/* =====================================================
   MENTEES
   ===================================================== */

function MenteesSection({
  mentees,
  meetings
}) {

  const [search, setSearch] =
    useState('');


  const filtered =
    mentees.filter((s) =>
      s.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||
      s.rollNo
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );


  return (

    <div>

      <h2 className="faculty-page-title">
        My Mentees ({mentees.length})
      </h2>


      <div className="faculty-search-container">

        <input
          className="faculty-input"
          placeholder="Search by name or roll no..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>


      <div className="faculty-info-card">

        <div className="faculty-table-wrapper">

          <table className="faculty-table">

            <thead>

              <tr>

                {[
                  'Roll No',
                  'Name',
                  'Branch',
                  'Semester',
                  'CGPA',
                  'Status'
                ].map((h) => (

                  <th key={h}>
                    {h}
                  </th>

                ))}

              </tr>

            </thead>


            <tbody>

              {filtered
                .slice(0, 50)
                .map((s, i) => (

                  <tr key={s.id}>

                    <td>
                      {s.rollNo}
                    </td>

                    <td>
                      {s.name}
                    </td>

                    <td>
                      {s.branch}
                    </td>

                    <td>
                      {s.currentSemester}
                    </td>

                    <td>

                      <b
                        className={
                          s.cgpa >= 8
                            ? 'faculty-grade-good'
                            : s.cgpa >= 6
                              ? 'faculty-grade-average'
                              : 'faculty-grade-poor'
                        }
                      >
                        {s.cgpa}
                      </b>

                    </td>

                    <td>

                      <span
                        className={
                          s.isSuspended
                            ? 'faculty-status-suspended'
                            : 'faculty-status-active'
                        }
                      >
                        {s.isSuspended
                          ? '🚫 Suspended'
                          : '✅ Active'}
                      </span>

                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        </div>


        <p className="faculty-table-note">
          Showing {Math.min(50, filtered.length)} of{' '}
          {filtered.length} mentees
        </p>

      </div>

    </div>

  );
}


/* =====================================================
   SEARCH STUDENT
   ===================================================== */

function SearchStudent() {

  const [query, setQuery] =
    useState('');

  const [student, setStudent] =
    useState(null);

  const [marks, setMarks] =
    useState([]);

  const [attend, setAttend] =
    useState([]);

  const [edu, setEdu] =
    useState([]);

  const [parents, setParents] =
    useState(null);

  const [fees, setFees] =
    useState([]);

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [tab, setTab] =
    useState('profile');


  const handleSearch =
    async () => {

      if (!query.trim()) return;

      setLoading(true);
      setError('');
      setStudent(null);

      try {

        const res =
          await getStudentByRollNo(
            query.trim()
          );

        const s = res.data;

        setStudent(s);


        const [
          m,
          a,
          e,
          p,
          f
        ] = await Promise.all([
          getStudentMarks(s.id),
          getStudentAttendance(s.id),
          getStudentEducation(s.id),
          getStudentParents(s.id),
          getStudentFees(s.id),
        ]);


        setMarks(m.data);
        setAttend(a.data);
        setEdu(e.data);
        setParents(p.data);
        setFees(f.data);

      } catch {

        setError(
          'Student not found. Try a different roll number.'
        );

      } finally {

        setLoading(false);

      }

    };


  const tabs = [
    'profile',
    'marks',
    'attendance',
    'education',
    'parents',
    'fees'
  ];


  return (

    <div>

      <h2 className="faculty-page-title">
        Search Student
      </h2>


      <div className="faculty-search-row">

        <input
          className="faculty-input"
          placeholder="Enter Roll Number (e.g. CS20200001)"
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          onKeyDown={(e) =>
            e.key === 'Enter' &&
            handleSearch()
          }
        />


        <button
          onClick={handleSearch}
          className="faculty-search-btn"
          disabled={loading}
        >
          {loading
            ? 'Searching...'
            : '🔍 Search'}
        </button>

      </div>


      {error && (

        <div className="faculty-error">
          {error}
        </div>

      )}


      {student && (

        <div>

          <div className="faculty-student-header">

            <h3>
              ✅ {student.name}
            </h3>

            <p>
              {student.rollNo} ·{' '}
              {student.branch} · Sem{' '}
              {student.currentSemester} · CGPA:{' '}
              {student.cgpa}
            </p>

          </div>


          <div className="faculty-tabs">

            {tabs.map((t) => (

              <button
                key={t}
                onClick={() =>
                  setTab(t)
                }
                className={
                  tab === t
                    ? 'faculty-tab faculty-tab-active'
                    : 'faculty-tab'
                }
              >
                {t}
              </button>

            ))}

          </div>


          {/* PROFILE */}

          {tab === 'profile' && (

            <div className="faculty-info-card">

              <div className="faculty-table-wrapper">

                <table className="faculty-info-table">

                  <tbody>

                    {[
                      ['Name', student.name],
                      ['Roll No', student.rollNo],
                      ['Branch', student.branch],
                      ['Gender', student.gender],
                      ['DOB', student.dob],
                      ['Blood Grp', student.bloodGroup],
                      ['Phone', student.phone],
                      ['Semester', student.currentSemester],
                      ['CGPA', student.cgpa],
                      ['Adm Year', student.admissionYear],
                      [
                        'Status',
                        student.isSuspended
                          ? '🚫 Suspended'
                          : '✅ Active'
                      ],
                    ].map(([label, value]) => (

                      <tr
                        key={label}
                        className="faculty-info-row"
                      >

                        <td className="faculty-info-label">
                          {label}
                        </td>

                        <td className="faculty-info-value">
                          {value || '—'}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          )}


          {/* MARKS */}

          {tab === 'marks' && (

            <div className="faculty-info-card">

              <div className="faculty-table-wrapper">

                <table className="faculty-table">

                  <thead>

                    <tr>

                      {[
                        'Sem',
                        'Course',
                        'Quiz1',
                        'Quiz2',
                        'Mid',
                        'End',
                        'Total',
                        'Grade'
                      ].map((h) => (

                        <th key={h}>
                          {h}
                        </th>

                      ))}

                    </tr>

                  </thead>


                  <tbody>

                    {marks.map((m, i) => (

                      <tr key={m.id}>

                        <td>{m.semester}</td>

                        <td>
                          CS
                          {String(
                            m.courseId
                          ).padStart(3, '0')}
                        </td>

                        <td>{m.quiz1}</td>
                        <td>{m.quiz2}</td>
                        <td>{m.midExam}</td>
                        <td>{m.endExam}</td>

                        <td>
                          <b>
                            {m.total}
                          </b>
                        </td>

                        <td>

                          <b
                            className={
                              m.grade?.startsWith('A')
                                ? 'faculty-grade-good'
                                : m.grade?.startsWith('B')
                                  ? 'faculty-grade-average'
                                  : 'faculty-grade-poor'
                            }
                          >
                            {m.grade}
                          </b>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          )}


          {/* ATTENDANCE */}

          {tab === 'attendance' && (

            <div className="faculty-info-card">

              <div className="faculty-table-wrapper">

                <table className="faculty-table">

                  <thead>

                    <tr>

                      {[
                        'Semester',
                        'Course',
                        'Date',
                        'Status'
                      ].map((h) => (

                        <th key={h}>
                          {h}
                        </th>

                      ))}

                    </tr>

                  </thead>


                  <tbody>

                    {attend
                      .slice(0, 50)
                      .map((a) => (

                        <tr key={a.id}>

                          <td>
                            {a.semester}
                          </td>

                          <td>
                            CS
                            {String(
                              a.courseId
                            ).padStart(3, '0')}
                          </td>

                          <td>
                            {a.date}
                          </td>

                          <td>

                            <span
                              className={
                                a.status === 'PRESENT'
                                  ? 'faculty-attendance-present'
                                  : a.status === 'LATE'
                                    ? 'faculty-attendance-late'
                                    : 'faculty-attendance-absent'
                              }
                            >
                              {a.status}
                            </span>

                          </td>

                        </tr>

                      ))}

                  </tbody>

                </table>

              </div>

            </div>

          )}


          {/* EDUCATION */}

          {tab === 'education' && (

            <div className="faculty-grid-2">

              {edu.map((e, i) => (

                <div
                  key={i}
                  className="faculty-info-card"
                >

                  <h3>
                    {e.level === 'CLASS_X'
                      ? '🏫 Class X'
                      : '🎓 Class XII'}
                  </h3>


                  <div className="faculty-table-wrapper">

                    <table className="faculty-info-table">

                      <tbody>

                        {[
                          ['School', e.schoolName],
                          ['Board', e.board],
                          ['Stream', e.stream || 'N/A'],
                          ['Pass Year', e.passYear],
                          [
                            'Percentage',
                            e.percentage
                              ? `${e.percentage}%`
                              : '—'
                          ],
                        ].map(([label, value]) => (

                          <tr
                            key={label}
                            className="faculty-info-row"
                          >

                            <td className="faculty-info-label">
                              {label}
                            </td>

                            <td className="faculty-info-value">
                              {value || '—'}
                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                </div>

              ))}

            </div>

          )}


          {/* PARENTS */}

          {tab === 'parents' &&
            parents && (

              <div className="faculty-grid-2">

                <div className="faculty-info-card">

                  <h3>👨 Father</h3>

                  <div className="faculty-table-wrapper">

                    <table className="faculty-info-table">

                      <tbody>

                        {[
                          ['Name', parents.fatherName],
                          ['Phone', parents.fatherPhone],
                          ['Email', parents.fatherEmail],
                        ].map(([l, v]) => (

                          <tr
                            key={l}
                            className="faculty-info-row"
                          >

                            <td className="faculty-info-label">
                              {l}
                            </td>

                            <td className="faculty-info-value">
                              {v || '—'}
                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                </div>


                <div className="faculty-info-card">

                  <h3>👩 Mother</h3>

                  <div className="faculty-table-wrapper">

                    <table className="faculty-info-table">

                      <tbody>

                        {[
                          ['Name', parents.motherName],
                          ['Phone', parents.motherPhone],
                          ['Email', parents.motherEmail],
                        ].map(([l, v]) => (

                          <tr
                            key={l}
                            className="faculty-info-row"
                          >

                            <td className="faculty-info-label">
                              {l}
                            </td>

                            <td className="faculty-info-value">
                              {v || '—'}
                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                </div>

              </div>

            )}


          {/* FEES */}

          {tab === 'fees' && (

            <div className="faculty-info-card">

              <div className="faculty-table-wrapper">

                <table className="faculty-table">

                  <thead>

                    <tr>

                      {[
                        'Semester',
                        'Amount',
                        'Due Date',
                        'Paid Date',
                        'Status'
                      ].map((h) => (

                        <th key={h}>
                          {h}
                        </th>

                      ))}

                    </tr>

                  </thead>


                  <tbody>

                    {fees.map((f) => (

                      <tr key={f.id}>

                        <td>
                          Sem {f.semester}
                        </td>

                        <td>
                          ₹{f.amount?.toLocaleString()}
                        </td>

                        <td>
                          {f.dueDate || '—'}
                        </td>

                        <td>
                          {f.paidDate || '—'}
                        </td>

                        <td>

                          <span
                            className={
                              f.paid
                                ? 'faculty-status-active'
                                : 'faculty-status-suspended'
                            }
                          >
                            {f.paid
                              ? '✅ Paid'
                              : '❌ Pending'}
                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          )}

        </div>

      )}

    </div>

  );
}


/* =====================================================
   ENTER MARKS
   ===================================================== */

function EnterMarks({
  courses,
  mentees
}) {

  const [form, setForm] =
    useState({
      studentId: '',
      courseId: '',
      semester: '',
      quiz1: '',
      quiz2: '',
      assignment1: '',
      assignment2: '',
      midExam: '',
      endExam: '',
    });


  const [success, setSuccess] =
    useState('');

  const [error, setError] =
    useState('');


  const calcTotal = () => {

    const q1 =
      parseFloat(form.quiz1) || 0;

    const q2 =
      parseFloat(form.quiz2) || 0;

    const a1 =
      parseFloat(form.assignment1) || 0;

    const a2 =
      parseFloat(form.assignment2) || 0;

    const mid =
      parseFloat(form.midExam) || 0;

    const end =
      parseFloat(form.endExam) || 0;


    return Math.min(
      (
        (q1 + q2 + a1 + a2) * 0.5 +
        mid * 0.3 +
        end * 0.5
      ),
      100
    ).toFixed(2);

  };


  const getGrade = (total) => {

    if (total >= 90) return 'A+';
    if (total >= 80) return 'A';
    if (total >= 70) return 'B+';
    if (total >= 60) return 'B';
    if (total >= 50) return 'C+';
    if (total >= 40) return 'C';

    return 'F';

  };


  const handleSubmit = async () => {

    try {

      const total =
        parseFloat(calcTotal());


      await enterMarks({

        studentId:
          parseInt(form.studentId),

        courseId:
          parseInt(form.courseId),

        semester:
          parseInt(form.semester),

        quiz1:
          parseFloat(form.quiz1),

        quiz2:
          parseFloat(form.quiz2),

        assignment1:
          parseFloat(form.assignment1),

        assignment2:
          parseFloat(form.assignment2),

        midExam:
          parseFloat(form.midExam),

        endExam:
          parseFloat(form.endExam),

        total,

        grade:
          getGrade(total),

      });


      setSuccess(
        'Marks entered successfully!'
      );


      setForm({
        studentId: '',
        courseId: '',
        semester: '',
        quiz1: '',
        quiz2: '',
        assignment1: '',
        assignment2: '',
        midExam: '',
        endExam: '',
      });


      setTimeout(
        () => setSuccess(''),
        3000
      );

    } catch (err) {

      console.error(err);

      setError(
        'Failed to enter marks. Please check all fields.'
      );

    }

  };


  const fields = [
    ['quiz1', 'Quiz 1 (/10)'],
    ['quiz2', 'Quiz 2 (/10)'],
    ['assignment1', 'Assignment 1 (/10)'],
    ['assignment2', 'Assignment 2 (/10)'],
    ['midExam', 'Mid Exam (/50)'],
    ['endExam', 'End Exam (/100)'],
  ];


  return (

    <div>

      <h2 className="faculty-page-title">
        Enter Student Marks
      </h2>


      <div className="faculty-info-card">

        <div className="faculty-grid-2">


          <div>

            <label className="faculty-label">
              Student
            </label>

            <select
              className="faculty-input"
              value={form.studentId}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  studentId:
                    e.target.value
                }))
              }
            >

              <option value="">
                Select Student
              </option>

              {mentees
                .slice(0, 100)
                .map((s) => (

                  <option
                    key={s.id}
                    value={s.id}
                  >
                    {s.name} ({s.rollNo})
                  </option>

                ))}

            </select>

          </div>


          <div>

            <label className="faculty-label">
              Course
            </label>

            <select
              className="faculty-input"
              value={form.courseId}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  courseId:
                    e.target.value
                }))
              }
            >

              <option value="">
                Select Course
              </option>

              {courses.map((c) => (

                <option
                  key={c.id}
                  value={c.id}
                >
                  {c.courseCode} —{' '}
                  {c.courseName}
                </option>

              ))}

            </select>

          </div>


          <div>

            <label className="faculty-label">
              Semester
            </label>

            <select
              className="faculty-input"
              value={form.semester}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  semester:
                    e.target.value
                }))
              }
            >

              <option value="">
                Select Semester
              </option>

              {[1,2,3,4,5,6,7,8].map(
                (s) => (
                  <option
                    key={s}
                    value={s}
                  >
                    Semester {s}
                  </option>
                )
              )}

            </select>

          </div>


          {fields.map(
            ([field, label]) => (

              <div key={field}>

                <label className="faculty-label">
                  {label}
                </label>

                <input
                  className="faculty-input"
                  type="number"
                  placeholder="0"
                  value={form[field]}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      [field]:
                        e.target.value
                    }))
                  }
                />

              </div>

            )
          )}

        </div>


        {form.endExam && (

          <div className="faculty-calculated">

            <b>
              Calculated Total:{' '}
              {calcTotal()}/100 → Grade:{' '}
              {getGrade(
                parseFloat(calcTotal())
              )}
            </b>

          </div>

        )}


        <button
          onClick={handleSubmit}
          className="faculty-submit-btn"
        >
          ✅ Submit Marks
        </button>


        {success && (
          <p className="faculty-success">
            ✅ {success}
          </p>
        )}


        {error && (
          <p className="faculty-error-text">
            {error}
          </p>
        )}

      </div>

    </div>

  );
}


/* =====================================================
   GRIEVANCES
   ===================================================== */

function GrievancesSection({
  grievances,
  setGrievances
}) {

  const [response, setResponse] =
    useState({});

  const [success, setSuccess] =
    useState('');


  const handleRespond = async (id) => {

    if (!response[id]) return;


    try {

      const res =
        await respondGrievance(
          id,
          {
            response:
              response[id]
          }
        );


      setGrievances((prev) =>
        prev.map((g) =>
          g.id === id
            ? res.data
            : g
        )
      );


      setSuccess(
        'Response submitted!'
      );


      setResponse((p) => ({
        ...p,
        [id]: ''
      }));


      setTimeout(
        () => setSuccess(''),
        3000
      );

    } catch (err) {

      console.error(err);

    }

  };


  const statusColor = {
    OPEN: '#f59e0b',
    IN_PROGRESS: '#3b82f6',
    RESOLVED: '#22c55e',
    REJECTED: '#ef4444',
  };


  return (

    <div>

      <h2 className="faculty-page-title">
        Student Grievances ({grievances.length})
      </h2>


      {success && (
        <p className="faculty-success">
          ✅ {success}
        </p>
      )}


      {grievances.length === 0 ? (

        <div className="faculty-info-card">

          <p>
            No grievances assigned to faculty.
          </p>

        </div>

      ) : (

        <div className="faculty-vertical-list">

          {grievances.map((g, i) => (

            <div
              key={i}
              className="faculty-info-card faculty-grievance-card"
              style={{
                borderLeft:
                  `4px solid ${
                    statusColor[g.status] ||
                    '#ddd'
                  }`
              }}
            >

              <div className="faculty-grievance-header">

                <h4>
                  {g.title}
                </h4>

                <span
                  style={{
                    background:
                      `${statusColor[g.status] || '#ddd'}20`,
                    color:
                      statusColor[g.status] ||
                      '#555'
                  }}
                  className="faculty-status-badge"
                >
                  {g.status}
                </span>

              </div>


              <p className="faculty-grievance-description">
                {g.description}
              </p>


              <p className="faculty-date">
                Raised on:{' '}
                {g.createdAt?.split('T')[0]}
              </p>


              {g.status === 'OPEN' && (

                <div className="faculty-response-row">

                  <input
                    className="faculty-input"
                    placeholder="Type your response..."
                    value={
                      response[g.id] || ''
                    }
                    onChange={(e) =>
                      setResponse((p) => ({
                        ...p,
                        [g.id]:
                          e.target.value
                      }))
                    }
                  />

                  <button
                    onClick={() =>
                      handleRespond(g.id)
                    }
                    className="faculty-search-btn"
                  >
                    Respond
                  </button>

                </div>

              )}


              {g.response && (

                <div className="faculty-response-box">

                  <b>Response:</b>{' '}
                  {g.response}

                </div>

              )}

            </div>

          ))}

        </div>

      )}

    </div>

  );
}


/* =====================================================
   TOP STUDENTS
   ===================================================== */

function TopStudents({
  topStudents
}) {

  return (

    <div>

      <h2 className="faculty-page-title">
        🏆 Top Students (CGPA ≥ 9.0)
      </h2>


      <div className="faculty-info-card">

        <div className="faculty-table-wrapper">

          <table className="faculty-table">

            <thead>

              <tr>

                {[
                  'Rank',
                  'Name',
                  'Roll No',
                  'Branch',
                  'Semester',
                  'CGPA'
                ].map((h) => (

                  <th key={h}>
                    {h}
                  </th>

                ))}

              </tr>

            </thead>


            <tbody>

              {topStudents
                .slice(0, 20)
                .map((s, i) => (

                  <tr key={s.id}>

                    <td>

                      {i === 0
                        ? '🥇'
                        : i === 1
                          ? '🥈'
                          : i === 2
                            ? '🥉'
                            : `#${i + 1}`}

                    </td>

                    <td>
                      {s.name}
                    </td>

                    <td>
                      {s.rollNo}
                    </td>

                    <td>
                      {s.branch}
                    </td>

                    <td>
                      {s.currentSemester}
                    </td>

                    <td>

                      <b className="faculty-grade-good">
                        {s.cgpa}
                      </b>

                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );
}


/* =====================================================
   SEND NOTIFICATION
   ===================================================== */

function SendNotification({
  mentees,
  faculty
}) {

  const [form, setForm] =
    useState({
      title: '',
      message: '',
      userId: ''
    });

  const [success, setSuccess] =
    useState('');

  const [error, setError] =
    useState('');


  const handleSend = async () => {

    if (
      !form.title ||
      !form.message ||
      !form.userId
    ) {
      return;
    }


    try {

      await sendNotification({

        userId:
          parseInt(form.userId),

        title:
          form.title,

        message:
          form.message,

      });


      setSuccess(
        'Notification sent successfully!'
      );


      setForm({
        title: '',
        message: '',
        userId: ''
      });


      setTimeout(
        () => setSuccess(''),
        3000
      );

    } catch (err) {

      console.error(err);

      setError(
        'Failed to send notification.'
      );

    }

  };


  return (

    <div>

      <h2 className="faculty-page-title">
        Send Notification
      </h2>


      <div className="faculty-info-card">

        <div className="faculty-form-stack">


          <div>

            <label className="faculty-label">
              Select Student
            </label>

            <select
              className="faculty-input"
              value={form.userId}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  userId:
                    e.target.value
                }))
              }
            >

              <option value="">
                Select Student
              </option>

              {mentees
                .slice(0, 100)
                .map((s) => (

                  <option
                    key={s.id}
                    value={s.userId}
                  >
                    {s.name} ({s.rollNo})
                  </option>

                ))}

            </select>

          </div>


          <div>

            <label className="faculty-label">
              Title
            </label>

            <input
              className="faculty-input"
              placeholder="Notification title"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  title:
                    e.target.value
                }))
              }
            />

          </div>


          <div>

            <label className="faculty-label">
              Message
            </label>

            <textarea
              className="faculty-input faculty-textarea"
              placeholder="Write your message here..."
              value={form.message}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  message:
                    e.target.value
                }))
              }
            />

          </div>


          <button
            onClick={handleSend}
            className="faculty-submit-btn"
          >
            📨 Send Notification
          </button>


          {success && (
            <p className="faculty-success">
              ✅ {success}
            </p>
          )}


          {error && (
            <p className="faculty-error-text">
              {error}
            </p>
          )}

        </div>

      </div>

    </div>

  );
}