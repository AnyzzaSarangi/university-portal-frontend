import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  getAdminStats,
  getAllStudentsAdmin,
  getAllFacultyAdmin,
  getAllGrievances,
  getOpenGrievances,
  resolveGrievance,
  rejectGrievance,
  getAllPlacements,
  getTopPlacements,
  getUnpaidFees,
  suspendStudentAdmin,
  reinstateStudentAdmin,
  promoteFaculty,
  broadcastNotification,
  getTopStudentsAdmin,
  getTopStudentsByBranch,
} from '../services/api';

const menuItems = [
  { key: 'overview',      label: '🏠 Overview' },
  { key: 'students',      label: '👥 Students',  children: ['All Students', 'Top Students', 'By Branch', 'Suspended'] },
  { key: 'faculty',       label: '👨‍🏫 Faculty',   children: ['All Faculty', 'Promote Faculty'] },
  { key: 'grievances',    label: '📋 Grievances', children: ['Open Grievances', 'All Grievances'] },
  { key: 'placements',    label: '🏢 Placements' },
  { key: 'fees',          label: '💰 Fees' },
  { key: 'broadcast',     label: '📢 Broadcast' },
];

const BRANCHES = ['CSE','ECE','EEE','Mechanical','Civil','Aeronautics','MBA','BCA'];

export default function AdminDashboard() {
  const { user, logoutUser } = useAuth();
  const [active,      setActive]      = useState('overview');
  const [open,        setOpen]        = useState({});
  const [stats,       setStats]       = useState(null);
  const [students,    setStudents]    = useState([]);
  const [faculty,     setFaculty]     = useState([]);
  const [grievances,  setGrievances]  = useState([]);
  const [placements,  setPlacements]  = useState([]);
  const [unpaidFees,  setUnpaidFees]  = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [st, stu, fac, grv, plc, fee, top] = await Promise.all([
          getAdminStats(),
          getAllStudentsAdmin(),
          getAllFacultyAdmin(),
          getAllGrievances(),
          getAllPlacements(),
          getUnpaidFees(),
          getTopStudentsAdmin(),
        ]);
        setStats(st.data);
        setStudents(stu.data);
        setFaculty(fac.data);
        setGrievances(grv.data);
        setPlacements(plc.data);
        setUnpaidFees(fee.data);
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
  const toggleMenu  = (key) => setOpen(p => ({ ...p, [key]: !p[key] }));

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛡️</div>
        <p style={{ color: '#1a3c6e', fontWeight: 'bold' }}>Loading admin portal...</p>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <span style={styles.logo}>🛡️</span>
          <div>
            <div style={styles.uniName}>University Admin Portal</div>
            <div style={styles.uniSub}>Administrator Dashboard</div>
          </div>
        </div>
        <div style={styles.navRight}>
          <span style={styles.welcome}>{user?.email}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Log off</button>
        </div>
      </nav>

      <div style={styles.body}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarTitle}>Admin Panel</div>
          {menuItems.map(item => (
            <div key={item.key}>
              <div
                style={{
                  ...styles.menuItem,
                  background: active === item.key ? '#d0e4f7' : 'transparent',
                  fontWeight: active === item.key ? '600' : '400',
                }}
                onClick={() => {
                  if (item.children) toggleMenu(item.key);
                  else setActive(item.key);
                }}
              >
                {item.children && (
                  <span style={styles.arrow}>{open[item.key] ? '▼' : '▶'}</span>
                )}
                {item.label}
              </div>
              {item.children && open[item.key] && item.children.map(child => (
                <div
                  key={child}
                  style={{
                    ...styles.subMenuItem,
                    background: active === child ? '#d0e4f7' : 'transparent',
                  }}
                  onClick={() => setActive(child)}
                >
                  • {child}
                </div>
              ))}
            </div>
          ))}
        </aside>

        <main style={styles.main}>
          {active === 'overview'         && <Overview stats={stats} students={students} faculty={faculty} grievances={grievances} placements={placements} />}
          {active === 'All Students'     && <AllStudents students={students} setStudents={setStudents} />}
          {active === 'Top Students'     && <TopStudentsSection topStudents={topStudents} />}
          {active === 'By Branch'        && <ByBranch students={students} />}
          {active === 'Suspended'        && <SuspendedStudents students={students} setStudents={setStudents} />}
          {active === 'All Faculty'      && <AllFaculty faculty={faculty} />}
          {active === 'Promote Faculty'  && <PromoteFacultySection faculty={faculty} setFaculty={setFaculty} />}
          {active === 'Open Grievances'  && <GrievancesSection grievances={grievances.filter(g => g.status === 'OPEN')} setGrievances={setGrievances} />}
          {active === 'All Grievances'   && <GrievancesSection grievances={grievances} setGrievances={setGrievances} />}
          {active === 'placements'       && <PlacementsSection placements={placements} />}
          {active === 'fees'             && <FeesSection unpaidFees={unpaidFees} />}
          {active === 'broadcast'        && <BroadcastSection />}
        </main>
      </div>
    </div>
  );
}

// ── OVERVIEW ──────────────────────────────────────
function Overview({ stats, students, faculty, grievances, placements }) {
  const branchCounts = BRANCHES.map(b => ({
    branch: b,
    count: students.filter(s => s.branch === b).length
  }));
  const openGrievances = grievances.filter(g => g.status === 'OPEN').length;
  const topPackage = placements.length > 0
    ? Math.max(...placements.map(p => p.packageLpa || 0))
    : 0;

  return (
    <div>
      <h2 style={styles.pageTitle}>Admin Overview</h2>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        borderRadius: '16px', padding: '28px', color: 'white', marginBottom: '24px'
      }}>
        <h2 style={{ margin: '0 0 8px' }}>🛡️ University Management System</h2>
        <p style={{ margin: 0, opacity: 0.8 }}>Full administrative control · Real-time data</p>
      </div>

      {/* MAIN STATS */}
      <div style={styles.grid4}>
        <div style={{ ...styles.statBox, background: '#1a3c6e' }}>
          <h2>{stats?.totalStudents?.toLocaleString()}</h2><p>Total Students</p>
        </div>
        <div style={{ ...styles.statBox, background: '#0f6e3c' }}>
          <h2>{stats?.totalFaculty?.toLocaleString()}</h2><p>Total Faculty</p>
        </div>
        <div style={{ ...styles.statBox, background: openGrievances > 0 ? '#8b1a1a' : '#4a1a6e' }}>
          <h2>{stats?.openGrievances}</h2><p>Open Grievances</p>
        </div>
        <div style={{ ...styles.statBox, background: '#6e4f0f' }}>
          <h2>{stats?.avgCgpa}</h2><p>Avg CGPA</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
        {/* BRANCH BREAKDOWN */}
        <div style={styles.infoCard}>
          <h3 style={{ color: '#1a3c6e', margin: '0 0 16px' }}>📊 Students by Branch</h3>
          {branchCounts.map(b => (
            <div key={b.branch} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                <span>{b.branch}</span>
                <span><b>{b.count}</b></span>
              </div>
              <div style={{ background: '#e5e7eb', borderRadius: '999px', height: '8px' }}>
                <div style={{
                  width: `${students.length > 0 ? (b.count/students.length)*100 : 0}%`,
                  height: '100%', background: '#1a3c6e', borderRadius: '999px'
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* QUICK STATS */}
        <div style={styles.infoCard}>
          <h3 style={{ color: '#1a3c6e', margin: '0 0 16px' }}>⚡ Quick Stats</h3>
          <table style={styles.infoTable}>
            <tbody>
              {[
                ['Total Placements',   stats?.placements],
                ['Top Package',        `₹${topPackage} LPA`],
                ['Open Grievances',    openGrievances],
                ['Resolved Grievances', grievances.filter(g => g.status === 'RESOLVED').length],
                ['Active Students',    students.filter(s => !s.isSuspended).length],
                ['Suspended Students', students.filter(s => s.isSuspended).length],
              ].map(([label, value]) => (
                <tr key={label} style={styles.infoRow}>
                  <td style={styles.infoLabel}>{label}</td>
                  <td style={{ ...styles.infoValue, fontWeight: 'bold' }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── ALL STUDENTS ──────────────────────────────────
function AllStudents({ students, setStudents }) {
  const [search,  setSearch]  = useState('');
  const [branch,  setBranch]  = useState('');
  const [success, setSuccess] = useState('');

  const filtered = students.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) ||
                        s.rollNo?.toLowerCase().includes(search.toLowerCase());
    const matchBranch = branch ? s.branch === branch : true;
    return matchSearch && matchBranch;
  });

  const handleSuspend = async (id) => {
    await suspendStudentAdmin(id);
    setStudents(prev => prev.map(s => s.id === id ? { ...s, isSuspended: true } : s));
    setSuccess('Student suspended!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleReinstate = async (id) => {
    await reinstateStudentAdmin(id);
    setStudents(prev => prev.map(s => s.id === id ? { ...s, isSuspended: false } : s));
    setSuccess('Student reinstated!');
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <div>
      <h2 style={styles.pageTitle}>All Students ({students.length})</h2>
      {success && <p style={{ color: '#22c55e', fontWeight: 'bold' }}>✅ {success}</p>}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <input
          style={{ ...styles.input, flex: 1 }}
          placeholder="Search by name or roll no..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          style={{ ...styles.input, width: '200px' }}
          value={branch}
          onChange={e => setBranch(e.target.value)}
        >
          <option value="">All Branches</option>
          {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div style={styles.infoCard}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1a1a2e', color: 'white' }}>
              {['Roll No','Name','Branch','Semester','CGPA','Status','Action'].map(h => (
                <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '12px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map((s, i) => (
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
                <td style={styles.td}>
                  {s.isSuspended ? (
                    <button
                      onClick={() => handleReinstate(s.id)}
                      style={{ ...styles.actionBtn, background: '#22c55e' }}
                    >
                      Reinstate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSuspend(s.id)}
                      style={{ ...styles.actionBtn, background: '#ef4444' }}
                    >
                      Suspend
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ color: '#666', padding: '8px', fontSize: '13px' }}>
          Showing {Math.min(100, filtered.length)} of {filtered.length} results
        </p>
      </div>
    </div>
  );
}

// ── TOP STUDENTS ──────────────────────────────────
function TopStudentsSection({ topStudents }) {
  const [branch, setBranch] = useState('');
  const [filtered, setFiltered] = useState(topStudents);

  const handleFilter = async () => {
    if (!branch) {
      setFiltered(topStudents);
      return;
    }
    try {
      const res = await getTopStudentsByBranch(branch);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { handleFilter(); }, [branch]);

  return (
    <div>
      <h2 style={styles.pageTitle}>🏆 Top Students</h2>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <select
          style={{ ...styles.input, width: '200px' }}
          value={branch}
          onChange={e => setBranch(e.target.value)}
        >
          <option value="">All Branches</option>
          {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div style={styles.infoCard}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1a1a2e', color: 'white' }}>
              {['Rank','Name','Roll No','Branch','Semester','CGPA'].map(h => (
                <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '13px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 50).map((s, i) => (
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

// ── BY BRANCH ─────────────────────────────────────
function ByBranch({ students }) {
  const [selected, setSelected] = useState('CSE');
  const filtered = students.filter(s => s.branch === selected);
  const avgCgpa  = filtered.length > 0
    ? (filtered.reduce((a, s) => a + (s.cgpa || 0), 0) / filtered.length).toFixed(2)
    : 0;

  return (
    <div>
      <h2 style={styles.pageTitle}>Students by Branch</h2>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {BRANCHES.map(b => (
          <button
            key={b}
            onClick={() => setSelected(b)}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: selected === b ? '#1a1a2e' : '#e5e7eb',
              color: selected === b ? 'white' : '#333',
              cursor: 'pointer', fontWeight: selected === b ? '600' : '400'
            }}
          >
            {b}
          </button>
        ))}
      </div>
      <div style={styles.grid3}>
        <div style={{ ...styles.statBox, background: '#1a3c6e' }}>
          <h2>{filtered.length}</h2><p>Total Students</p>
        </div>
        <div style={{ ...styles.statBox, background: '#0f6e3c' }}>
          <h2>{avgCgpa}</h2><p>Avg CGPA</p>
        </div>
        <div style={{ ...styles.statBox, background: '#6e4f0f' }}>
          <h2>{filtered.filter(s => s.cgpa >= 8).length}</h2><p>CGPA ≥ 8</p>
        </div>
      </div>
      <div style={{ ...styles.infoCard, marginTop: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1a1a2e', color: 'white' }}>
              {['Roll No','Name','Semester','CGPA','Status'].map(h => (
                <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '13px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 50).map((s, i) => (
              <tr key={s.id} style={{ background: i % 2 === 0 ? '#f8f9fa' : 'white' }}>
                <td style={styles.td}>{s.rollNo}</td>
                <td style={styles.td}>{s.name}</td>
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
      </div>
    </div>
  );
}

// ── SUSPENDED STUDENTS ────────────────────────────
function SuspendedStudents({ students, setStudents }) {
  const suspended = students.filter(s => s.isSuspended);
  const [success, setSuccess] = useState('');

  const handleReinstate = async (id) => {
    await reinstateStudentAdmin(id);
    setStudents(prev => prev.map(s => s.id === id ? { ...s, isSuspended: false } : s));
    setSuccess('Student reinstated!');
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <div>
      <h2 style={styles.pageTitle}>🚫 Suspended Students ({suspended.length})</h2>
      {success && <p style={{ color: '#22c55e', fontWeight: 'bold' }}>✅ {success}</p>}
      {suspended.length === 0 ? (
        <div style={styles.infoCard}><p>No suspended students.</p></div>
      ) : (
        <div style={styles.infoCard}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#8b1a1a', color: 'white' }}>
                {['Roll No','Name','Branch','CGPA','Action'].map(h => (
                  <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '13px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suspended.map((s, i) => (
                <tr key={s.id} style={{ background: i % 2 === 0 ? '#fff5f5' : 'white' }}>
                  <td style={styles.td}>{s.rollNo}</td>
                  <td style={styles.td}>{s.name}</td>
                  <td style={styles.td}>{s.branch}</td>
                  <td style={styles.td}>{s.cgpa}</td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleReinstate(s.id)}
                      style={{ ...styles.actionBtn, background: '#22c55e' }}
                    >
                      Reinstate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── ALL FACULTY ───────────────────────────────────
function AllFaculty({ faculty }) {
  const [search, setSearch] = useState('');
  const filtered = faculty.filter(f =>
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 style={styles.pageTitle}>All Faculty ({faculty.length})</h2>
      <input
        style={{ ...styles.input, marginBottom: '16px' }}
        placeholder="Search by name or department..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div style={styles.infoCard}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1a1a2e', color: 'white' }}>
              {['Name','Department','Job Title','Email','Phone','Salary','Status'].map(h => (
                <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '12px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 50).map((f, i) => (
              <tr key={f.id} style={{ background: i % 2 === 0 ? '#f8f9fa' : 'white' }}>
                <td style={styles.td}>{f.name}</td>
                <td style={styles.td}>{f.department}</td>
                <td style={styles.td}>{f.jobTitle}</td>
                <td style={styles.td}>{f.email}</td>
                <td style={styles.td}>{f.phone}</td>
                <td style={styles.td}>₹{f.salary?.toLocaleString()}</td>
                <td style={styles.td}>
                  <span style={{
                    padding: '3px 8px', borderRadius: '12px', fontSize: '11px',
                    background: f.isActive ? '#d4edda' : '#f8d7da',
                    color: f.isActive ? '#155724' : '#721c24'
                  }}>
                    {f.isActive ? '✅ Active' : '❌ Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ color: '#666', padding: '8px', fontSize: '13px' }}>
          Showing {Math.min(50, filtered.length)} of {filtered.length} faculty
        </p>
      </div>
    </div>
  );
}

// ── PROMOTE FACULTY ───────────────────────────────
function PromoteFacultySection({ faculty, setFaculty }) {
  const [selected,  setSelected]  = useState('');
  const [newTitle,  setNewTitle]  = useState('');
  const [success,   setSuccess]   = useState('');
  const [error,     setError]     = useState('');

  const titles = ['Assistant Professor','Associate Professor','Professor','Director','Dean-1','Dean-2'];

  const handlePromote = async () => {
    if (!selected || !newTitle) return;
    try {
      const res = await promoteFaculty(parseInt(selected), { jobTitle: newTitle });
      setFaculty(prev => prev.map(f => f.id === parseInt(selected) ? res.data : f));
      setSuccess('Faculty promoted successfully!');
      setSelected('');
      setNewTitle('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to promote faculty.');
    }
  };

  const selectedFaculty = faculty.find(f => f.id === parseInt(selected));

  return (
    <div>
      <h2 style={styles.pageTitle}>Promote Faculty</h2>
      <div style={styles.infoCard}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={styles.label}>Select Faculty</label>
            <select
              style={styles.input}
              value={selected}
              onChange={e => setSelected(e.target.value)}
            >
              <option value="">Select Faculty Member</option>
              {faculty.slice(0, 100).map(f => (
                <option key={f.id} value={f.id}>{f.name} — {f.jobTitle} ({f.department})</option>
              ))}
            </select>
          </div>

          {selectedFaculty && (
            <div style={{ padding: '14px', background: '#f0f4ff', borderRadius: '8px' }}>
              <b>Current Title:</b> {selectedFaculty.jobTitle} · <b>Department:</b> {selectedFaculty.department}
            </div>
          )}

          <div>
            <label style={styles.label}>Promote To</label>
            <select
              style={styles.input}
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
            >
              <option value="">Select New Title</option>
              {titles.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <button onClick={handlePromote} style={styles.submitBtn}>
            ⬆️ Promote Faculty
          </button>
          {success && <p style={{ color: '#22c55e', fontWeight: 'bold' }}>✅ {success}</p>}
          {error   && <p style={{ color: '#ef4444' }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

// ── GRIEVANCES ────────────────────────────────────
function GrievancesSection({ grievances, setGrievances }) {
  const [response, setResponse] = useState({});
  const [success,  setSuccess]  = useState('');

  const handleResolve = async (id) => {
    if (!response[id]) return;
    try {
      const res = await resolveGrievance(id, { response: response[id] });
      setGrievances(prev => prev.map(g => g.id === id ? res.data : g));
      setSuccess('Grievance resolved!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { console.error(err); }
  };

  const handleReject = async (id) => {
    if (!response[id]) return;
    try {
      const res = await rejectGrievance(id, { response: response[id] });
      setGrievances(prev => prev.map(g => g.id === id ? res.data : g));
      setSuccess('Grievance rejected!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { console.error(err); }
  };

  const statusColor = { OPEN: '#f59e0b', IN_PROGRESS: '#3b82f6', RESOLVED: '#22c55e', REJECTED: '#ef4444' };

  return (
    <div>
      <h2 style={styles.pageTitle}>Grievances ({grievances.length})</h2>
      {success && <p style={{ color: '#22c55e', fontWeight: 'bold' }}>✅ {success}</p>}
      {grievances.length === 0 ? (
        <div style={styles.infoCard}><p>No grievances found.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {grievances.map((g, i) => (
            <div key={i} style={{
              ...styles.infoCard,
              borderLeft: `4px solid ${statusColor[g.status] || '#ddd'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px', color: '#1a3c6e' }}>{g.title}</h4>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    Against: {g.against} · {g.raisedRole} · {g.createdAt?.split('T')[0]}
                  </span>
                </div>
                <span style={{
                  padding: '4px 12px', borderRadius: '12px', fontSize: '11px',
                  background: statusColor[g.status] + '20',
                  color: statusColor[g.status], fontWeight: 'bold', height: 'fit-content'
                }}>
                  {g.status}
                </span>
              </div>
              <p style={{ color: '#555', fontSize: '13px', marginBottom: '12px' }}>{g.description}</p>
              {g.response && (
                <div style={{ padding: '10px', background: '#f0f4ff', borderRadius: '6px', fontSize: '13px', marginBottom: '12px' }}>
                  <b>Response:</b> {g.response}
                </div>
              )}
              {g.status === 'OPEN' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    style={{ ...styles.input, flex: 1 }}
                    placeholder="Type response..."
                    value={response[g.id] || ''}
                    onChange={e => setResponse(p => ({ ...p, [g.id]: e.target.value }))}
                  />
                  <button onClick={() => handleResolve(g.id)} style={{ ...styles.actionBtn, background: '#22c55e', padding: '10px 16px' }}>
                    ✅ Resolve
                  </button>
                  <button onClick={() => handleReject(g.id)} style={{ ...styles.actionBtn, background: '#ef4444', padding: '10px 16px' }}>
                    ❌ Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PLACEMENTS ────────────────────────────────────
function PlacementsSection({ placements }) {
  const companies = [...new Set(placements.map(p => p.companyName))];
  const [filter, setFilter] = useState('');
  const filtered = filter ? placements.filter(p => p.companyName === filter) : placements;
  const topPkg   = placements.length > 0 ? Math.max(...placements.map(p => p.packageLpa || 0)) : 0;
  const avgPkg   = placements.length > 0
    ? (placements.reduce((a, p) => a + (p.packageLpa || 0), 0) / placements.length).toFixed(2)
    : 0;

  return (
    <div>
      <h2 style={styles.pageTitle}>Placement Details ({placements.length})</h2>
      <div style={styles.grid3}>
        <div style={{ ...styles.statBox, background: '#1a3c6e' }}>
          <h2>{placements.length}</h2><p>Total Placed</p>
        </div>
        <div style={{ ...styles.statBox, background: '#0f6e3c' }}>
          <h2>₹{topPkg} LPA</h2><p>Highest Package</p>
        </div>
        <div style={{ ...styles.statBox, background: '#6e4f0f' }}>
          <h2>₹{avgPkg} LPA</h2><p>Avg Package</p>
        </div>
      </div>
      <div style={{ marginTop: '20px', marginBottom: '16px' }}>
        <select style={styles.input} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Companies</option>
          {companies.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div style={styles.infoCard}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1a1a2e', color: 'white' }}>
              {['Student ID','Company','Role','Package','Year','Type'].map(h => (
                <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '13px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 50).map((p, i) => (
              <tr key={p.id} style={{ background: i % 2 === 0 ? '#f8f9fa' : 'white' }}>
                <td style={styles.td}>{p.studentId}</td>
                <td style={styles.td}><b>{p.companyName}</b></td>
                <td style={styles.td}>{p.role}</td>
                <td style={styles.td}>
                  <b style={{ color: '#22c55e' }}>₹{p.packageLpa} LPA</b>
                </td>
                <td style={styles.td}>{p.placedYear}</td>
                <td style={styles.td}>
                  <span style={{
                    padding: '3px 8px', borderRadius: '12px', fontSize: '11px',
                    background: p.offerType === 'Full-Time' ? '#d4edda' : '#fff3cd',
                    color: p.offerType === 'Full-Time' ? '#155724' : '#856404'
                  }}>
                    {p.offerType}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── FEES ──────────────────────────────────────────
function FeesSection({ unpaidFees }) {
  const totalPending = unpaidFees.reduce((a, f) => a + (f.amount || 0), 0);

  return (
    <div>
      <h2 style={styles.pageTitle}>Pending Fees</h2>
      <div style={styles.grid2}>
        <div style={{ ...styles.statBox, background: '#8b1a1a' }}>
          <h2>{unpaidFees.length}</h2><p>Unpaid Records</p>
        </div>
        <div style={{ ...styles.statBox, background: '#1a3c6e' }}>
          <h2>₹{totalPending.toLocaleString()}</h2><p>Total Pending</p>
        </div>
      </div>
      <div style={{ ...styles.infoCard, marginTop: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#8b1a1a', color: 'white' }}>
              {['Student ID','Semester','Amount','Due Date'].map(h => (
                <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '13px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {unpaidFees.slice(0, 50).map((f, i) => (
              <tr key={f.id} style={{ background: i % 2 === 0 ? '#fff5f5' : 'white' }}>
                <td style={styles.td}>{f.studentId}</td>
                <td style={styles.td}>Semester {f.semester}</td>
                <td style={styles.td}><b style={{ color: '#ef4444' }}>₹{f.amount?.toLocaleString()}</b></td>
                <td style={styles.td}>{f.dueDate || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── BROADCAST ─────────────────────────────────────
function BroadcastSection() {
  const [form,    setForm]    = useState({ title: '', message: '' });
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleBroadcast = async () => {
    if (!form.title || !form.message) return;
    setLoading(true);
    try {
      const res = await broadcastNotification(form);
      setSuccess(res.data);
      setForm({ title: '', message: '' });
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Failed to broadcast. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={styles.pageTitle}>📢 Broadcast Notification</h2>
      <div style={styles.infoCard}>
        <p style={{ color: '#666', marginTop: 0 }}>
          Send a notification to ALL users (students, faculty, admin) in the system.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={styles.label}>Title</label>
            <input
              style={styles.input}
              placeholder="Notification title..."
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            />
          </div>
          <div>
            <label style={styles.label}>Message</label>
            <textarea
              style={{ ...styles.input, height: '120px', resize: 'vertical' }}
              placeholder="Write your broadcast message here..."
              value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
            />
          </div>
          <button
            onClick={handleBroadcast}
            disabled={loading}
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '📡 Broadcasting...' : '📢 Send to All Users'}
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
  nav:          { background: '#1a1a2e', color: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navLeft:      { display: 'flex', alignItems: 'center', gap: '12px' },
  logo:         { fontSize: '32px' },
  uniName:      { fontWeight: 'bold', fontSize: '16px' },
  uniSub:       { fontSize: '12px', opacity: 0.8 },
  navRight:     { display: 'flex', alignItems: 'center', gap: '16px' },
  welcome:      { fontSize: '14px' },
  logoutBtn:    { padding: '6px 14px', background: '#e94560', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  body:         { display: 'flex', minHeight: 'calc(100vh - 60px)' },
  sidebar:      { width: '220px', background: 'white', borderRight: '1px solid #ddd' },
  sidebarTitle: { background: '#1a1a2e', color: 'white', padding: '12px 16px', fontWeight: 'bold', fontSize: '13px' },
  menuItem:     { padding: '10px 16px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '6px' },
  subMenuItem:  { padding: '8px 16px 8px 32px', cursor: 'pointer', fontSize: '12px', borderBottom: '1px solid #eee', color: '#333' },
  arrow:        { fontSize: '10px', color: '#666' },
  main:         { flex: 1, padding: '24px', overflowY: 'auto' },
  pageTitle:    { color: '#1a1a2e', borderBottom: '2px solid #1a1a2e', paddingBottom: '8px', marginBottom: '20px' },
  infoCard:     { background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '16px' },
  grid2:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' },
  grid3:        { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '16px' },
  grid4:        { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginTop: '16px' },
  statBox:      { color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' },
  infoTable:    { width: '100%', borderCollapse: 'collapse' },
  infoRow:      { borderBottom: '1px solid #eee' },
  infoLabel:    { padding: '10px', fontWeight: '600', color: '#555', width: '200px' },
  infoValue:    { padding: '10px', color: '#333' },
  td:           { padding: '10px', borderBottom: '1px solid #eee', fontSize: '13px' },
  input:        { padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
  label:        { display: 'block', marginBottom: '6px', fontWeight: '600', color: '#555', fontSize: '13px' },
  submitBtn:    { padding: '12px 24px', background: '#1a1a2e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' },
  actionBtn:    { padding: '6px 12px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
};