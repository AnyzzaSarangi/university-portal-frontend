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

const menuItems = [
  { key: 'overview',    label: '🏠 Overview' },
  { key: 'profile',     label: '👤 My Profile' },
  { key: 'mentees',     label: '👥 My Mentees' },
  { key: 'search',      label: '🔍 Search Student' },
  { key: 'marks',       label: '📝 Enter Marks' },
  { key: 'grievances',  label: '📋 Grievances' },
  { key: 'topstudents', label: '🏆 Top Students' },
  { key: 'notify',      label: '🔔 Send Notification' },
];

export default function FacultyDashboard() {
  const { user, logoutUser } = useAuth();
  const [active,       setActive]       = useState('overview');
  const [facultyData,  setFacultyData]  = useState(null);
  const [mentees,      setMentees]      = useState([]);
  const [courses,      setCourses]      = useState([]);
  const [meetings,     setMeetings]     = useState([]);
  const [grievances,   setGrievances]   = useState([]);
  const [topStudents,  setTopStudents]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const facRes = await getFaculty();
        const fac    = facRes.data[0];
        setFacultyData(fac);

        const [men, crs, met, grv, top] = await Promise.all([
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

  const handleLogout = () => { logoutUser(); navigate('/'); };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍🏫</div>
        <p style={{ color: '#1a3c6e', fontWeight: 'bold' }}>Loading faculty portal...</p>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <span style={styles.logo}>👨‍🏫</span>
          <div>
            <div style={styles.uniName}>University Faculty Portal</div>
            <div style={styles.uniSub}>{facultyData?.department} · {facultyData?.jobTitle}</div>
          </div>
        </div>
        <div style={styles.navRight}>
          <span style={styles.welcome}>{facultyData?.name || user?.email}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Log off</button>
        </div>
      </nav>

      <div style={styles.body}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarTitle}>Faculty Self Service</div>
          {menuItems.map(item => (
            <div
              key={item.key}
              style={{
                ...styles.menuItem,
                background: active === item.key ? '#d0e4f7' : 'transparent',
                fontWeight: active === item.key ? '600' : '400',
              }}
              onClick={() => setActive(item.key)}
            >
              {item.label}
            </div>
          ))}
        </aside>

        <main style={styles.main}>
          {active === 'overview'    && <Overview faculty={facultyData} mentees={mentees} courses={courses} grievances={grievances} />}
          {active === 'profile'     && <FacultyProfile faculty={facultyData} />}
          {active === 'mentees'     && <MenteesSection mentees={mentees} meetings={meetings} />}
          {active === 'search'      && <SearchStudent />}
          {active === 'marks'       && <EnterMarks courses={courses} mentees={mentees} />}
          {active === 'grievances'  && <GrievancesSection grievances={grievances} setGrievances={setGrievances} />}
          {active === 'topstudents' && <TopStudents topStudents={topStudents} />}
          {active === 'notify'      && <SendNotification mentees={mentees} faculty={facultyData} />}
        </main>
      </div>
    </div>
  );
}

// ── OVERVIEW ──────────────────────────────────────
function Overview({ faculty, mentees, courses, grievances }) {
  const openGrievances = grievances.filter(g => g.status === 'OPEN').length;
  return (
    <div>
      <h2 style={styles.pageTitle}>Overview</h2>
      <div style={{
        background: 'linear-gradient(135deg, #1a3c6e, #0f3460)',
        borderRadius: '16px', padding: '28px', color: 'white', marginBottom: '24px'
      }}>
        <h2 style={{ margin: '0 0 8px' }}>👋 Welcome, {faculty?.name}!</h2>
        <p style={{ margin: 0, opacity: 0.85 }}>
          {faculty?.department} · {faculty?.jobTitle} · Joined {faculty?.joiningDate?.split('T')[0]}
        </p>
      </div>
      <div style={styles.grid4}>
        <div style={{ ...styles.statBox, background: '#1a3c6e' }}>
          <h2>{mentees.length}</h2><p>My Mentees</p>
        </div>
        <div style={{ ...styles.statBox, background: '#0f6e3c' }}>
          <h2>{courses.length}</h2><p>Courses</p>
        </div>
        <div style={{ ...styles.statBox, background: openGrievances > 0 ? '#8b1a1a' : '#4a1a6e' }}>
          <h2>{openGrievances}</h2><p>Open Grievances</p>
        </div>
        <div style={{ ...styles.statBox, background: '#6e4f0f' }}>
          <h2>₹{faculty?.salary?.toLocaleString()}</h2><p>Salary</p>
        </div>
      </div>
    </div>
  );
}

// ── FACULTY PROFILE ───────────────────────────────
function FacultyProfile({ faculty }) {
  return (
    <div>
      <h2 style={styles.pageTitle}>My Profile</h2>
      <div style={styles.infoCard}>
        <table style={styles.infoTable}>
          <tbody>
            {[
              ['Name',         faculty?.name],
              ['Department',   faculty?.department],
              ['Job Title',    faculty?.jobTitle],
              ['Email',        faculty?.email],
              ['Phone',        faculty?.phone],
              ['Joining Date', faculty?.joiningDate?.split('T')[0]],
              ['Salary',       faculty?.salary ? `₹${faculty.salary.toLocaleString()}` : '—'],
              ['Status',       faculty?.isActive ? '✅ Active' : '❌ Inactive'],
            ].map(([label, value]) => (
              <tr key={label} style={styles.infoRow}>
                <td style={styles.infoLabel}>{label}</td>
                <td style={styles.infoValue}>{value || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── MENTEES ───────────────────────────────────────
function MenteesSection({ mentees, meetings }) {
  const [search, setSearch] = useState('');
  const filtered = mentees.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 style={styles.pageTitle}>My Mentees ({mentees.length})</h2>
      <div style={{ marginBottom: '16px' }}>
        <input
          style={styles.input}
          placeholder="Search by name or roll no..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div style={styles.infoCard}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1a3c6e', color: 'white' }}>
              {['Roll No','Name','Branch','Semester','CGPA','Status'].map(h => (
                <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '13px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 50).map((s, i) => (
              <tr key={s.id} style={{ background: i % 2 === 0 ? '#f8f9fa' : 'white' }}>
                <td style={styles.td}>{s.rollNo}</td>
                <td style={styles.td}>{s.name}</td>
                <td style={styles.td}>{s.branch}</td>
                <td style={styles.td}>{s.currentSemester}</td>
                <td style={styles.td}>
                  <b style={{ color: s.cgpa >= 8 ? '#22c55e' : s.cgpa >= 6 ? '#f59e0b' : '#ef4444' }}>
                    {s.cgpa}
                  </b>
                </td>
                <td style={styles.td}>
                  <span style={{
                    padding: '3px 8px', borderRadius: '12px', fontSize: '11px',
                    background: s.isSuspended ? '#f8d7da' : '#d4edda',
                    color: s.isSuspended ? '#721c24' : '#155724'
                  }}>
                    {s.isSuspended ? '🚫 Suspended' : '✅ Active'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ color: '#666', padding: '8px', fontSize: '13px' }}>
          Showing {Math.min(50, filtered.length)} of {filtered.length} mentees
        </p>
      </div>
    </div>
  );
}

// ── SEARCH STUDENT ────────────────────────────────
function SearchStudent() {
  const [query,   setQuery]   = useState('');
  const [student, setStudent] = useState(null);
  const [marks,   setMarks]   = useState([]);
  const [attend,  setAttend]  = useState([]);
  const [edu,     setEdu]     = useState([]);
  const [parents, setParents] = useState(null);
  const [fees,    setFees]    = useState([]);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [tab,     setTab]     = useState('profile');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setStudent(null);
    try {
      const res = await getStudentByRollNo(query.trim());
      const s   = res.data;
      setStudent(s);

      const [m, a, e, p, f] = await Promise.all([
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
      setError('Student not found. Try a different roll number.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = ['profile', 'marks', 'attendance', 'education', 'parents', 'fees'];

  return (
    <div>
      <h2 style={styles.pageTitle}>Search Student</h2>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <input
          style={{ ...styles.input, flex: 1 }}
          placeholder="Enter Roll Number (e.g. CS20200001)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} style={styles.searchBtn} disabled={loading}>
          {loading ? 'Searching...' : '🔍 Search'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#dc2626', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {student && (
        <div>
          {/* Student Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1a3c6e, #0f3460)',
            borderRadius: '12px', padding: '20px', color: 'white', marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 8px' }}>✅ {student.name}</h3>
            <p style={{ margin: 0, opacity: 0.85 }}>
              {student.rollNo} · {student.branch} · Sem {student.currentSemester} · CGPA: {student.cgpa}
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {tabs.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none',
                  background: tab === t ? '#1a3c6e' : '#e5e7eb',
                  color: tab === t ? 'white' : '#333',
                  cursor: 'pointer', fontSize: '13px',
                  fontWeight: tab === t ? '600' : '400',
                  textTransform: 'capitalize'
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {tab === 'profile' && (
            <div style={styles.infoCard}>
              <table style={styles.infoTable}>
                <tbody>
                  {[
                    ['Name',      student.name],
                    ['Roll No',   student.rollNo],
                    ['Branch',    student.branch],
                    ['Gender',    student.gender],
                    ['DOB',       student.dob],
                    ['Blood Grp', student.bloodGroup],
                    ['Phone',     student.phone],
                    ['Semester',  student.currentSemester],
                    ['CGPA',      student.cgpa],
                    ['Adm Year',  student.admissionYear],
                    ['Status',    student.isSuspended ? '🚫 Suspended' : '✅ Active'],
                  ].map(([label, value]) => (
                    <tr key={label} style={styles.infoRow}>
                      <td style={styles.infoLabel}>{label}</td>
                      <td style={styles.infoValue}>{value || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'marks' && (
            <div style={styles.infoCard}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#1a3c6e', color: 'white' }}>
                    {['Sem','Course','Quiz1','Quiz2','Mid','End','Total','Grade'].map(h => (
                      <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '12px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {marks.map((m, i) => (
                    <tr key={m.id} style={{ background: i % 2 === 0 ? '#f8f9fa' : 'white' }}>
                      <td style={styles.td}>{m.semester}</td>
                      <td style={styles.td}>CS{String(m.courseId).padStart(3,'0')}</td>
                      <td style={styles.td}>{m.quiz1}</td>
                      <td style={styles.td}>{m.quiz2}</td>
                      <td style={styles.td}>{m.midExam}</td>
                      <td style={styles.td}>{m.endExam}</td>
                      <td style={styles.td}><b>{m.total}</b></td>
                      <td style={styles.td}>
                        <b style={{ color: m.grade?.startsWith('A') ? '#22c55e' : m.grade?.startsWith('B') ? '#f59e0b' : '#ef4444' }}>
                          {m.grade}
                        </b>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'attendance' && (
            <div style={styles.infoCard}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#1a3c6e', color: 'white' }}>
                    {['Semester','Course','Date','Status'].map(h => (
                      <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '12px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attend.slice(0, 50).map((a, i) => (
                    <tr key={a.id} style={{ background: i % 2 === 0 ? '#f8f9fa' : 'white' }}>
                      <td style={styles.td}>{a.semester}</td>
                      <td style={styles.td}>CS{String(a.courseId).padStart(3,'0')}</td>
                      <td style={styles.td}>{a.date}</td>
                      <td style={styles.td}>
                        <span style={{
                          padding: '3px 8px', borderRadius: '12px', fontSize: '11px',
                          background: a.status === 'PRESENT' ? '#d4edda' : a.status === 'LATE' ? '#fff3cd' : '#f8d7da',
                          color: a.status === 'PRESENT' ? '#155724' : a.status === 'LATE' ? '#856404' : '#721c24'
                        }}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'education' && (
            <div style={styles.grid2}>
              {edu.map((e, i) => (
                <div key={i} style={{ ...styles.infoCard, borderTop: `4px solid ${e.level === 'CLASS_X' ? '#1a3c6e' : '#e94560'}` }}>
                  <h3>{e.level === 'CLASS_X' ? '🏫 Class X' : '🎓 Class XII'}</h3>
                  <table style={styles.infoTable}>
                    <tbody>
                      {[
                        ['School',      e.schoolName],
                        ['Board',       e.board],
                        ['Stream',      e.stream || 'N/A'],
                        ['Pass Year',   e.passYear],
                        ['Percentage',  e.percentage ? `${e.percentage}%` : '—'],
                      ].map(([label, value]) => (
                        <tr key={label} style={styles.infoRow}>
                          <td style={styles.infoLabel}>{label}</td>
                          <td style={styles.infoValue}>{value || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {tab === 'parents' && parents && (
            <div style={styles.grid2}>
              <div style={{ ...styles.infoCard, borderTop: '4px solid #1a3c6e' }}>
                <h3>👨 Father</h3>
                <table style={styles.infoTable}>
                  <tbody>
                    {[['Name', parents.fatherName], ['Phone', parents.fatherPhone], ['Email', parents.fatherEmail]].map(([l, v]) => (
                      <tr key={l} style={styles.infoRow}>
                        <td style={styles.infoLabel}>{l}</td>
                        <td style={styles.infoValue}>{v || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ ...styles.infoCard, borderTop: '4px solid #e94560' }}>
                <h3>👩 Mother</h3>
                <table style={styles.infoTable}>
                  <tbody>
                    {[['Name', parents.motherName], ['Phone', parents.motherPhone], ['Email', parents.motherEmail]].map(([l, v]) => (
                      <tr key={l} style={styles.infoRow}>
                        <td style={styles.infoLabel}>{l}</td>
                        <td style={styles.infoValue}>{v || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'fees' && (
            <div style={styles.infoCard}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#1a3c6e', color: 'white' }}>
                    {['Semester','Amount','Due Date','Paid Date','Status'].map(h => (
                      <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '12px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fees.map((f, i) => (
                    <tr key={f.id} style={{ background: i % 2 === 0 ? '#f8f9fa' : 'white' }}>
                      <td style={styles.td}>Sem {f.semester}</td>
                      <td style={styles.td}>₹{f.amount?.toLocaleString()}</td>
                      <td style={styles.td}>{f.dueDate || '—'}</td>
                      <td style={styles.td}>{f.paidDate || '—'}</td>
                      <td style={styles.td}>
                        <span style={{
                          padding: '3px 8px', borderRadius: '12px', fontSize: '11px',
                          background: f.paid ? '#d4edda' : '#f8d7da',
                          color: f.paid ? '#155724' : '#721c24'
                        }}>
                          {f.paid ? '✅ Paid' : '❌ Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── ENTER MARKS ───────────────────────────────────
function EnterMarks({ courses, mentees }) {
  const [form, setForm] = useState({
    studentId: '', courseId: '', semester: '',
    quiz1: '', quiz2: '', assignment1: '', assignment2: '',
    midExam: '', endExam: '',
  });
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');

  const calcTotal = () => {
    const q1  = parseFloat(form.quiz1)  || 0;
    const q2  = parseFloat(form.quiz2)  || 0;
    const a1  = parseFloat(form.assignment1) || 0;
    const a2  = parseFloat(form.assignment2) || 0;
    const mid = parseFloat(form.midExam) || 0;
    const end = parseFloat(form.endExam) || 0;
    return Math.min(((q1+q2+a1+a2)*0.5 + mid*0.3 + end*0.5), 100).toFixed(2);
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
      const total = parseFloat(calcTotal());
      await enterMarks({
        studentId:   parseInt(form.studentId),
        courseId:    parseInt(form.courseId),
        semester:    parseInt(form.semester),
        quiz1:       parseFloat(form.quiz1),
        quiz2:       parseFloat(form.quiz2),
        assignment1: parseFloat(form.assignment1),
        assignment2: parseFloat(form.assignment2),
        midExam:     parseFloat(form.midExam),
        endExam:     parseFloat(form.endExam),
        total,
        grade: getGrade(total),
      });
      setSuccess('Marks entered successfully!');
      setForm({ studentId: '', courseId: '', semester: '', quiz1: '', quiz2: '', assignment1: '', assignment2: '', midExam: '', endExam: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to enter marks. Please check all fields.');
    }
  };

  return (
    <div>
      <h2 style={styles.pageTitle}>Enter Student Marks</h2>
      <div style={styles.infoCard}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={styles.label}>Student</label>
            <select
              style={styles.input}
              value={form.studentId}
              onChange={e => setForm(p => ({ ...p, studentId: e.target.value }))}
            >
              <option value="">Select Student</option>
              {mentees.slice(0, 100).map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={styles.label}>Course</label>
            <select
              style={styles.input}
              value={form.courseId}
              onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))}
            >
              <option value="">Select Course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.courseCode} — {c.courseName}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={styles.label}>Semester</label>
            <select
              style={styles.input}
              value={form.semester}
              onChange={e => setForm(p => ({ ...p, semester: e.target.value }))}
            >
              <option value="">Select Semester</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>
          {[
            ['quiz1',       'Quiz 1 (/10)'],
            ['quiz2',       'Quiz 2 (/10)'],
            ['assignment1', 'Assignment 1 (/10)'],
            ['assignment2', 'Assignment 2 (/10)'],
            ['midExam',     'Mid Exam (/50)'],
            ['endExam',     'End Exam (/100)'],
          ].map(([field, label]) => (
            <div key={field}>
              <label style={styles.label}>{label}</label>
              <input
                style={styles.input}
                type="number"
                placeholder="0"
                value={form[field]}
                onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        {form.endExam && (
          <div style={{ marginTop: '16px', padding: '14px', background: '#e8f4fd', borderRadius: '8px' }}>
            <b>Calculated Total: {calcTotal()}/100 → Grade: {getGrade(parseFloat(calcTotal()))}</b>
          </div>
        )}

        <button onClick={handleSubmit} style={{ ...styles.submitBtn, marginTop: '16px' }}>
          ✅ Submit Marks
        </button>
        {success && <p style={{ color: '#22c55e', fontWeight: 'bold', marginTop: '8px' }}>✅ {success}</p>}
        {error   && <p style={{ color: '#ef4444', marginTop: '8px' }}>{error}</p>}
      </div>
    </div>
  );
}

// ── GRIEVANCES ────────────────────────────────────
function GrievancesSection({ grievances, setGrievances }) {
  const [response, setResponse] = useState({});
  const [success,  setSuccess]  = useState('');

  const handleRespond = async (id) => {
    if (!response[id]) return;
    try {
      const res = await respondGrievance(id, { response: response[id] });
      setGrievances(prev => prev.map(g => g.id === id ? res.data : g));
      setSuccess('Response submitted!');
      setResponse(p => ({ ...p, [id]: '' }));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const statusColor = { OPEN: '#f59e0b', IN_PROGRESS: '#3b82f6', RESOLVED: '#22c55e', REJECTED: '#ef4444' };

  return (
    <div>
      <h2 style={styles.pageTitle}>Student Grievances ({grievances.length})</h2>
      {success && <p style={{ color: '#22c55e', fontWeight: 'bold' }}>✅ {success}</p>}
      {grievances.length === 0 ? (
        <div style={styles.infoCard}><p>No grievances assigned to faculty.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {grievances.map((g, i) => (
            <div key={i} style={{
              ...styles.infoCard,
              borderLeft: `4px solid ${statusColor[g.status] || '#ddd'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, color: '#1a3c6e' }}>{g.title}</h4>
                <span style={{
                  padding: '3px 10px', borderRadius: '12px', fontSize: '11px',
                  background: statusColor[g.status] + '20',
                  color: statusColor[g.status], fontWeight: 'bold'
                }}>
                  {g.status}
                </span>
              </div>
              <p style={{ color: '#555', fontSize: '13px', marginBottom: '8px' }}>{g.description}</p>
              <p style={{ color: '#999', fontSize: '12px', marginBottom: '12px' }}>
                Raised on: {g.createdAt?.split('T')[0]}
              </p>
              {g.status === 'OPEN' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    style={{ ...styles.input, flex: 1 }}
                    placeholder="Type your response..."
                    value={response[g.id] || ''}
                    onChange={e => setResponse(p => ({ ...p, [g.id]: e.target.value }))}
                  />
                  <button
                    onClick={() => handleRespond(g.id)}
                    style={styles.searchBtn}
                  >
                    Respond
                  </button>
                </div>
              )}
              {g.response && (
                <div style={{ padding: '10px', background: '#f0f4ff', borderRadius: '6px', marginTop: '8px', fontSize: '13px' }}>
                  <b>Response:</b> {g.response}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── TOP STUDENTS ──────────────────────────────────
function TopStudents({ topStudents }) {
  return (
    <div>
      <h2 style={styles.pageTitle}>🏆 Top Students (CGPA ≥ 9.0)</h2>
      <div style={styles.infoCard}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1a3c6e', color: 'white' }}>
              {['Rank','Name','Roll No','Branch','Semester','CGPA'].map(h => (
                <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '13px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topStudents.slice(0, 20).map((s, i) => (
              <tr key={s.id} style={{ background: i % 2 === 0 ? '#f8f9fa' : 'white' }}>
                <td style={styles.td}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                </td>
                <td style={styles.td}>{s.name}</td>
                <td style={styles.td}>{s.rollNo}</td>
                <td style={styles.td}>{s.branch}</td>
                <td style={styles.td}>{s.currentSemester}</td>
                <td style={styles.td}>
                  <b style={{ color: '#22c55e' }}>{s.cgpa}</b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── SEND NOTIFICATION ─────────────────────────────
function SendNotification({ mentees, faculty }) {
  const [form,    setForm]    = useState({ title: '', message: '', userId: '' });
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');

  const handleSend = async () => {
    if (!form.title || !form.message || !form.userId) return;
    try {
      await sendNotification({
        userId:  parseInt(form.userId),
        title:   form.title,
        message: form.message,
      });
      setSuccess('Notification sent successfully!');
      setForm({ title: '', message: '', userId: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to send notification.');
    }
  };

  return (
    <div>
      <h2 style={styles.pageTitle}>Send Notification</h2>
      <div style={styles.infoCard}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={styles.label}>Select Student</label>
            <select
              style={styles.input}
              value={form.userId}
              onChange={e => setForm(p => ({ ...p, userId: e.target.value }))}
            >
              <option value="">Select Student</option>
              {mentees.slice(0, 100).map(s => (
                <option key={s.id} value={s.userId}>{s.name} ({s.rollNo})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={styles.label}>Title</label>
            <input
              style={styles.input}
              placeholder="Notification title"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            />
          </div>
          <div>
            <label style={styles.label}>Message</label>
            <textarea
              style={{ ...styles.input, height: '100px', resize: 'vertical' }}
              placeholder="Write your message here..."
              value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
            />
          </div>
          <button onClick={handleSend} style={styles.submitBtn}>
            📨 Send Notification
          </button>
          {success && <p style={{ color: '#22c55e', fontWeight: 'bold' }}>✅ {success}</p>}
          {error   && <p style={{ color: '#ef4444' }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

// ── STYLES ────────────────────────────────────────
const styles = {
  container:    { minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Arial, sans-serif' },
  nav:          { background: '#1a3c6e', color: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navLeft:      { display: 'flex', alignItems: 'center', gap: '12px' },
  logo:         { fontSize: '32px' },
  uniName:      { fontWeight: 'bold', fontSize: '16px' },
  uniSub:       { fontSize: '12px', opacity: 0.8 },
  navRight:     { display: 'flex', alignItems: 'center', gap: '16px' },
  welcome:      { fontSize: '14px' },
  logoutBtn:    { padding: '6px 14px', background: '#e94560', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  body:         { display: 'flex', minHeight: 'calc(100vh - 60px)' },
  sidebar:      { width: '220px', background: 'white', borderRight: '1px solid #ddd' },
  sidebarTitle: { background: '#1a3c6e', color: 'white', padding: '12px 16px', fontWeight: 'bold', fontSize: '13px' },
  menuItem:     { padding: '12px 16px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #eee' },
  main:         { flex: 1, padding: '24px', overflowY: 'auto' },
  pageTitle:    { color: '#1a3c6e', borderBottom: '2px solid #1a3c6e', paddingBottom: '8px', marginBottom: '20px' },
  infoCard:     { background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '16px' },
  grid2:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  grid4:        { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginTop: '16px' },
  statBox:      { color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' },
  infoTable:    { width: '100%', borderCollapse: 'collapse' },
  infoRow:      { borderBottom: '1px solid #eee' },
  infoLabel:    { padding: '10px', fontWeight: '600', color: '#555', width: '160px' },
  infoValue:    { padding: '10px', color: '#333' },
  td:           { padding: '10px', borderBottom: '1px solid #eee', fontSize: '13px' },
  input:        { padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
  label:        { display: 'block', marginBottom: '6px', fontWeight: '600', color: '#555', fontSize: '13px' },
  submitBtn:    { padding: '12px 24px', background: '#1a3c6e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' },
  searchBtn:    { padding: '10px 20px', background: '#1a3c6e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap' },
};