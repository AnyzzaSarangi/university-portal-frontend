import './AdminDashboard.css';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import {
  getAdminStats,
  getAllStudentsAdmin,
  getAllFacultyAdmin,
  getAllGrievances,
  getAllPlacements,
  getUnpaidFees,
  suspendStudentAdmin,
  reinstateStudentAdmin,
  promoteFaculty,
  broadcastNotification,
  getTopStudentsAdmin,
  getTopStudentsByBranch,
  resolveGrievance,
  rejectGrievance,
} from '../services/api';

import './AdminDashboard.css';


// =====================================================
// MENU
// =====================================================

const menuItems = [
  {
    key: 'overview',
    label: '🏠 Overview'
  },
  {
    key: 'students',
    label: '👥 Students',
    children: [
      'All Students',
      'Top Students',
      'By Branch',
      'Suspended'
    ]
  },
  {
    key: 'faculty',
    label: '👨‍🏫 Faculty',
    children: [
      'All Faculty',
      'Promote Faculty'
    ]
  },
  {
    key: 'grievances',
    label: '📋 Grievances',
    children: [
      'Open Grievances',
      'All Grievances'
    ]
  },
  {
    key: 'placements',
    label: '🏢 Placements'
  },
  {
    key: 'fees',
    label: '💰 Fees'
  },
  {
    key: 'broadcast',
    label: '📢 Broadcast'
  }
];

const BRANCHES = [
  'CSE',
  'ECE',
  'EEE',
  'Mechanical',
  'Civil',
  'Aeronautics',
  'MBA',
  'BCA'
];


// =====================================================
// MAIN ADMIN DASHBOARD
// =====================================================

export default function AdminDashboard() {

  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const [active, setActive] = useState('overview');
  const [open, setOpen] = useState({});

  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [unpaidFees, setUnpaidFees] = useState([]);
  const [topStudents, setTopStudents] = useState([]);

  const [loading, setLoading] = useState(true);


  // ===================================================
  // FETCH ADMIN DATA
  // ===================================================

  useEffect(() => {

    const fetchAll = async () => {

      try {

        const [
          st,
          stu,
          fac,
          grv,
          plc,
          fee,
          top
        ] = await Promise.all([

          getAdminStats(),
          getAllStudentsAdmin(),
          getAllFacultyAdmin(),
          getAllGrievances(),
          getAllPlacements(),
          getUnpaidFees(),
          getTopStudentsAdmin()

        ]);

        setStats(st.data);
        setStudents(stu.data);
        setFaculty(fac.data);
        setGrievances(grv.data);
        setPlacements(plc.data);
        setUnpaidFees(fee.data);
        setTopStudents(top.data);

      } catch (err) {

        console.error(
          'Failed to load admin dashboard:',
          err
        );

      } finally {

        setLoading(false);

      }
    };

    fetchAll();

  }, []);


  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout = () => {

    logoutUser();
    navigate('/');

  };


  // ===================================================
  // MENU TOGGLE
  // ===================================================

  const toggleMenu = (key) => {

    setOpen(prev => ({
      ...prev,
      [key]: !prev[key]
    }));

  };


  // ===================================================
  // LOADING SCREEN
  // ===================================================

  if (loading) {

    return (

      <div className="admin-loading">

        <div className="admin-loading-content">

          <div className="admin-loading-icon">
            🛡️
          </div>

          <p className="admin-loading-text">
            Loading admin portal...
          </p>

        </div>

      </div>

    );

  }


  // ===================================================
  // MAIN UI
  // ===================================================

  return (

    <div className="admin-container">

      {/* =================================================
          NAVBAR
          ================================================= */}

      <nav className="admin-nav">

        <div className="admin-nav-left">

          <span className="admin-logo">
            🛡️
          </span>

          <div>

            <div className="admin-uni-name">
              University Admin Portal
            </div>

            <div className="admin-uni-sub">
              Administrator Dashboard
            </div>

          </div>

        </div>


        <div className="admin-nav-right">

          <span className="admin-welcome">
            {user?.email}
          </span>

          <button
            onClick={handleLogout}
            className="admin-logout"
          >
            Log off
          </button>

        </div>

      </nav>


      {/* =================================================
          BODY
          ================================================= */}

      <div className="admin-body">


        {/* =================================================
            SIDEBAR
            ================================================= */}

        <aside className="admin-sidebar">

          <div className="admin-sidebar-title">
            Admin Panel
          </div>


          {menuItems.map(item => (

            <div key={item.key}>

              {/* MAIN MENU ITEM */}

              <div
                className={`admin-menu-item ${
                  active === item.key
                    ? 'admin-menu-active'
                    : ''
                }`}
                onClick={() => {

                  if (item.children) {

                    toggleMenu(item.key);

                  } else {

                    setActive(item.key);

                  }

                }}
              >

                {item.children && (

                  <span className="admin-arrow">
                    {open[item.key]
                      ? '▼'
                      : '▶'}
                  </span>

                )}

                {item.label}

              </div>


              {/* SUBMENU */}

              {item.children &&
                open[item.key] &&
                item.children.map(child => (

                  <div
                    key={child}
                    className={`admin-submenu-item ${
                      active === child
                        ? 'admin-submenu-active'
                        : ''
                    }`}
                    onClick={() => setActive(child)}
                  >

                    • {child}

                  </div>

                ))}

            </div>

          ))}

        </aside>


        {/* =================================================
            MAIN CONTENT
            ================================================= */}

        <main className="admin-main">

          {active === 'overview' && (

            <Overview
              stats={stats}
              students={students}
              faculty={faculty}
              grievances={grievances}
              placements={placements}
            />

          )}


          {active === 'All Students' && (

            <AllStudents
              students={students}
              setStudents={setStudents}
            />

          )}


          {active === 'Top Students' && (

            <TopStudentsSection
              topStudents={topStudents}
            />

          )}


          {active === 'By Branch' && (

            <ByBranch
              students={students}
            />

          )}


          {active === 'Suspended' && (

            <SuspendedStudents
              students={students}
              setStudents={setStudents}
            />

          )}


          {active === 'All Faculty' && (

            <AllFaculty
              faculty={faculty}
            />

          )}


          {active === 'Promote Faculty' && (

            <PromoteFacultySection
              faculty={faculty}
              setFaculty={setFaculty}
            />

          )}


          {active === 'Open Grievances' && (

            <GrievancesSection
              grievances={grievances.filter(
                g => g.status === 'OPEN'
              )}
              setGrievances={setGrievances}
            />

          )}


          {active === 'All Grievances' && (

            <GrievancesSection
              grievances={grievances}
              setGrievances={setGrievances}
            />

          )}


          {active === 'placements' && (

            <PlacementsSection
              placements={placements}
            />

          )}


          {active === 'fees' && (

            <FeesSection
              unpaidFees={unpaidFees}
            />

          )}


          {active === 'broadcast' && (

            <BroadcastSection />

          )}

        </main>

      </div>

    </div>

  );

}


// =====================================================
// OVERVIEW
// =====================================================

function Overview({
  stats,
  students,
  grievances,
  placements
}) {

  const branchCounts = BRANCHES.map(branch => ({

    branch,

    count: students.filter(
      student => student.branch === branch
    ).length

  }));


  const openGrievances =
    grievances.filter(
      g => g.status === 'OPEN'
    ).length;


  const topPackage =
    placements.length > 0
      ? Math.max(
          ...placements.map(
            p => p.packageLpa || 0
          )
        )
      : 0;


  return (

    <div>

      <h2 className="admin-page-title">
        Admin Overview
      </h2>


      {/* WELCOME CARD */}

      <div className="admin-welcome-card">

        <h2>
          🛡️ University Management System
        </h2>

        <p>
          Full administrative control · Real-time data
        </p>

      </div>


      {/* MAIN STATS */}

      <div className="admin-grid-4">

        <div
          className="admin-stat-box"
          style={{
            background: '#1a3c6e'
          }}
        >

          <h2>
            {stats?.totalStudents?.toLocaleString()}
          </h2>

          <p>
            Total Students
          </p>

        </div>


        <div
          className="admin-stat-box"
          style={{
            background: '#0f6e3c'
          }}
        >

          <h2>
            {stats?.totalFaculty?.toLocaleString()}
          </h2>

          <p>
            Total Faculty
          </p>

        </div>


        <div
          className="admin-stat-box"
          style={{
            background:
              openGrievances > 0
                ? '#8b1a1a'
                : '#4a1a6e'
          }}
        >

          <h2>
            {stats?.openGrievances}
          </h2>

          <p>
            Open Grievances
          </p>

        </div>


        <div
          className="admin-stat-box"
          style={{
            background: '#6e4f0f'
          }}
        >

          <h2>
            {stats?.avgCgpa}
          </h2>

          <p>
            Avg CGPA
          </p>

        </div>

      </div>


      {/* BRANCH + QUICK STATS */}

      <div
        className="admin-grid-2"
        style={{
          marginTop: '24px'
        }}
      >


        {/* BRANCH BREAKDOWN */}

        <div className="admin-info-card admin-branch-card">

          <h3>
            📊 Students by Branch
          </h3>


          {branchCounts.map(branch => (

            <div
              key={branch.branch}
              className="admin-branch-row"
            >

              <div className="admin-branch-row-header">

                <span>
                  {branch.branch}
                </span>

                <span>
                  <b>
                    {branch.count}
                  </b>
                </span>

              </div>


              <div className="admin-progress-track">

                <div
                  className="admin-progress-bar"
                  style={{
                    width: `${
                      students.length > 0
                        ? (
                            branch.count /
                            students.length
                          ) * 100
                        : 0
                    }%`
                  }}
                />

              </div>

            </div>

          ))}

        </div>


        {/* QUICK STATS */}

        <div className="admin-info-card">

          <h3
            style={{
              color: '#1a3c6e',
              margin: '0 0 16px'
            }}
          >
            ⚡ Quick Stats
          </h3>


          <table className="admin-info-table">

            <tbody>

              {[
                [
                  'Total Placements',
                  stats?.placements
                ],

                [
                  'Top Package',
                  `₹${topPackage} LPA`
                ],

                [
                  'Open Grievances',
                  openGrievances
                ],

                [
                  'Resolved Grievances',
                  grievances.filter(
                    g => g.status === 'RESOLVED'
                  ).length
                ],

                [
                  'Active Students',
                  students.filter(
                    s => !s.isSuspended
                  ).length
                ],

                [
                  'Suspended Students',
                  students.filter(
                    s => s.isSuspended
                  ).length
                ]

              ].map(([label, value]) => (

                <tr
                  key={label}
                  className="admin-info-row"
                >

                  <td className="admin-info-label">
                    {label}
                  </td>

                  <td
                    className="admin-info-value"
                    style={{
                      fontWeight: 'bold'
                    }}
                  >
                    {value}
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


// =====================================================
// ALL STUDENTS
// =====================================================

function AllStudents({
  students,
  setStudents
}) {

  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [success, setSuccess] = useState('');


  const filtered = students.filter(student => {

    const searchValue =
      search.toLowerCase();


    const matchSearch =
      student.name
        ?.toLowerCase()
        .includes(searchValue) ||

      student.rollNo
        ?.toLowerCase()
        .includes(searchValue);


    const matchBranch =
      branch
        ? student.branch === branch
        : true;


    return (
      matchSearch &&
      matchBranch
    );

  });


  const handleSuspend = async id => {

    try {

      await suspendStudentAdmin(id);

      setStudents(prev =>
        prev.map(student =>
          student.id === id
            ? {
                ...student,
                isSuspended: true
              }
            : student
        )
      );

      setSuccess(
        'Student suspended!'
      );

      setTimeout(
        () => setSuccess(''),
        2000
      );

    } catch (err) {

      console.error(err);

    }

  };


  const handleReinstate = async id => {

    try {

      await reinstateStudentAdmin(id);

      setStudents(prev =>
        prev.map(student =>
          student.id === id
            ? {
                ...student,
                isSuspended: false
              }
            : student
        )
      );

      setSuccess(
        'Student reinstated!'
      );

      setTimeout(
        () => setSuccess(''),
        2000
      );

    } catch (err) {

      console.error(err);

    }

  };


  return (

    <div>

      <h2 className="admin-page-title">
        All Students ({students.length})
      </h2>


      {success && (

        <p className="admin-success">
          ✅ {success}
        </p>

      )}


      {/* FILTERS */}

      <div className="admin-filter-row">

        <div className="admin-filter-input">

          <input
            className="admin-input"
            placeholder="Search by name or roll no..."
            value={search}
            onChange={e =>
              setSearch(e.target.value)
            }
          />

        </div>


        <div className="admin-filter-select">

          <select
            className="admin-input"
            value={branch}
            onChange={e =>
              setBranch(e.target.value)
            }
          >

            <option value="">
              All Branches
            </option>

            {BRANCHES.map(branch => (

              <option
                key={branch}
                value={branch}
              >
                {branch}
              </option>

            ))}

          </select>

        </div>

      </div>


      {/* TABLE */}

      <div className="admin-info-card">

        <div className="admin-table-wrapper">

          <table className="admin-table">

            <thead>

              <tr
                style={{
                  background: '#1a1a2e',
                  color: 'white'
                }}
              >

                {[
                  'Roll No',
                  'Name',
                  'Branch',
                  'Semester',
                  'CGPA',
                  'Status',
                  'Action'
                ].map(header => (

                  <th key={header}>
                    {header}
                  </th>

                ))}

              </tr>

            </thead>


            <tbody>

              {filtered
                .slice(0, 100)
                .map(student => (

                  <tr key={student.id}>

                    <td>
                      {student.rollNo}
                    </td>

                    <td>
                      {student.name}
                    </td>

                    <td>
                      {student.branch}
                    </td>

                    <td>
                      {student.currentSemester}
                    </td>

                    <td>

                      <b
                        className={
                          student.cgpa >= 8
                            ? 'admin-grade-good'
                            : student.cgpa >= 6
                              ? 'admin-grade-average'
                              : 'admin-grade-poor'
                        }
                      >
                        {student.cgpa}
                      </b>

                    </td>


                    <td>

                      <span
                        className={
                          student.isSuspended
                            ? 'admin-status admin-status-suspended'
                            : 'admin-status admin-status-active'
                        }
                      >

                        {student.isSuspended
                          ? '🚫 Suspended'
                          : '✅ Active'}

                      </span>

                    </td>


                    <td>

                      {student.isSuspended ? (

                        <button
                          onClick={() =>
                            handleReinstate(
                              student.id
                            )
                          }
                          className="admin-action-btn"
                          style={{
                            background: '#22c55e'
                          }}
                        >
                          Reinstate
                        </button>

                      ) : (

                        <button
                          onClick={() =>
                            handleSuspend(
                              student.id
                            )
                          }
                          className="admin-action-btn"
                          style={{
                            background: '#ef4444'
                          }}
                        >
                          Suspend
                        </button>

                      )}

                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        </div>


        <p className="admin-table-note">

          Showing{' '}
          {Math.min(
            100,
            filtered.length
          )}{' '}

          of {filtered.length} results

        </p>

      </div>

    </div>

  );

}


// =====================================================
// TOP STUDENTS
// =====================================================

function TopStudentsSection({
  topStudents
}) {

  const [branch, setBranch] =
    useState('');

  const [filtered, setFiltered] =
    useState(topStudents);


  useEffect(() => {

    const filterStudents = async () => {

      if (!branch) {

        setFiltered(topStudents);
        return;

      }

      try {

        const response =
          await getTopStudentsByBranch(
            branch
          );

        setFiltered(response.data);

      } catch (err) {

        console.error(err);

      }

    };

    filterStudents();

  }, [branch, topStudents]);


  return (

    <div>

      <h2 className="admin-page-title">
        🏆 Top Students
      </h2>


      <div
        className="admin-filter-row"
      >

        <select
          className="admin-input admin-filter-select"
          value={branch}
          onChange={e =>
            setBranch(e.target.value)
          }
        >

          <option value="">
            All Branches
          </option>

          {BRANCHES.map(branch => (

            <option
              key={branch}
              value={branch}
            >
              {branch}
            </option>

          ))}

        </select>

      </div>


      <div className="admin-info-card">

        <div className="admin-table-wrapper">

          <table className="admin-table">

            <thead>

              <tr
                style={{
                  background: '#1a1a2e',
                  color: 'white'
                }}
              >

                {[
                  'Rank',
                  'Name',
                  'Roll No',
                  'Branch',
                  'Semester',
                  'CGPA'
                ].map(header => (

                  <th key={header}>
                    {header}
                  </th>

                ))}

              </tr>

            </thead>


            <tbody>

              {filtered
                .slice(0, 50)
                .map((student, index) => (

                  <tr key={student.id}>

                    <td>

                      {index === 0
                        ? '🥇'
                        : index === 1
                          ? '🥈'
                          : index === 2
                            ? '🥉'
                            : `#${index + 1}`}

                    </td>

                    <td>
                      {student.name}
                    </td>

                    <td>
                      {student.rollNo}
                    </td>

                    <td>
                      {student.branch}
                    </td>

                    <td>
                      {student.currentSemester}
                    </td>

                    <td>

                      <b className="admin-grade-good">
                        {student.cgpa}
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


// =====================================================
// BY BRANCH
// =====================================================

function ByBranch({
  students
}) {

  const [selected, setSelected] =
    useState('CSE');


  const filtered =
    students.filter(
      student =>
        student.branch === selected
    );


  const avgCgpa =
    filtered.length > 0
      ? (
          filtered.reduce(
            (total, student) =>
              total +
              (student.cgpa || 0),
            0
          ) /
          filtered.length
        ).toFixed(2)
      : 0;


  return (

    <div>

      <h2 className="admin-page-title">
        Students by Branch
      </h2>


      {/* BRANCH BUTTONS */}

      <div className="admin-branch-buttons">

        {BRANCHES.map(branch => (

          <button
            key={branch}
            onClick={() =>
              setSelected(branch)
            }
            className={`admin-branch-btn ${
              selected === branch
                ? 'active'
                : ''
            }`}
          >
            {branch}
          </button>

        ))}

      </div>


      {/* STATS */}

      <div className="admin-grid-3">

        <div
          className="admin-stat-box"
          style={{
            background: '#1a3c6e'
          }}
        >

          <h2>
            {filtered.length}
          </h2>

          <p>
            Total Students
          </p>

        </div>


        <div
          className="admin-stat-box"
          style={{
            background: '#0f6e3c'
          }}
        >

          <h2>
            {avgCgpa}
          </h2>

          <p>
            Avg CGPA
          </p>

        </div>


        <div
          className="admin-stat-box"
          style={{
            background: '#6e4f0f'
          }}
        >

          <h2>
            {
              filtered.filter(
                student =>
                  student.cgpa >= 8
              ).length
            }
          </h2>

          <p>
            CGPA ≥ 8
          </p>

        </div>

      </div>


      {/* TABLE */}

      <div
        className="admin-info-card"
        style={{
          marginTop: '20px'
        }}
      >

        <div className="admin-table-wrapper">

          <table className="admin-table">

            <thead>

              <tr
                style={{
                  background: '#1a1a2e',
                  color: 'white'
                }}
              >

                {[
                  'Roll No',
                  'Name',
                  'Semester',
                  'CGPA',
                  'Status'
                ].map(header => (

                  <th key={header}>
                    {header}
                  </th>

                ))}

              </tr>

            </thead>


            <tbody>

              {filtered
                .slice(0, 50)
                .map(student => (

                  <tr key={student.id}>

                    <td>
                      {student.rollNo}
                    </td>

                    <td>
                      {student.name}
                    </td>

                    <td>
                      {student.currentSemester}
                    </td>

                    <td>

                      <b
                        className={
                          student.cgpa >= 8
                            ? 'admin-grade-good'
                            : student.cgpa >= 6
                              ? 'admin-grade-average'
                              : 'admin-grade-poor'
                        }
                      >
                        {student.cgpa}
                      </b>

                    </td>

                    <td>

                      <span
                        className={
                          student.isSuspended
                            ? 'admin-status admin-status-suspended'
                            : 'admin-status admin-status-active'
                        }
                      >

                        {student.isSuspended
                          ? '🚫 Suspended'
                          : '✅ Active'}

                      </span>

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


// =====================================================
// SUSPENDED STUDENTS
// =====================================================

function SuspendedStudents({
  students,
  setStudents
}) {

  const suspended =
    students.filter(
      student =>
        student.isSuspended
    );


  const [success, setSuccess] =
    useState('');


  const handleReinstate = async id => {

    try {

      await reinstateStudentAdmin(id);

      setStudents(prev =>
        prev.map(student =>
          student.id === id
            ? {
                ...student,
                isSuspended: false
              }
            : student
        )
      );

      setSuccess(
        'Student reinstated!'
      );

      setTimeout(
        () => setSuccess(''),
        2000
      );

    } catch (err) {

      console.error(err);

    }

  };


  return (

    <div>

      <h2 className="admin-page-title">
        🚫 Suspended Students (
        {suspended.length}
        )
      </h2>


      {success && (

        <p className="admin-success">
          ✅ {success}
        </p>

      )}


      {suspended.length === 0 ? (

        <div className="admin-info-card">

          <p>
            No suspended students.
          </p>

        </div>

      ) : (

        <div className="admin-info-card">

          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>

                <tr
                  style={{
                    background: '#8b1a1a',
                    color: 'white'
                  }}
                >

                  {[
                    'Roll No',
                    'Name',
                    'Branch',
                    'CGPA',
                    'Action'
                  ].map(header => (

                    <th key={header}>
                      {header}
                    </th>

                  ))}

                </tr>

              </thead>


              <tbody>

                {suspended.map(student => (

                  <tr key={student.id}>

                    <td>
                      {student.rollNo}
                    </td>

                    <td>
                      {student.name}
                    </td>

                    <td>
                      {student.branch}
                    </td>

                    <td>
                      {student.cgpa}
                    </td>

                    <td>

                      <button
                        onClick={() =>
                          handleReinstate(
                            student.id
                          )
                        }
                        className="admin-action-btn"
                        style={{
                          background:
                            '#22c55e'
                        }}
                      >
                        Reinstate
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>

  );

}


// =====================================================
// ALL FACULTY
// =====================================================

function AllFaculty({
  faculty
}) {

  const [search, setSearch] =
    useState('');


  const filtered =
    faculty.filter(member =>

      member.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||

      member.department
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )

    );


  return (

    <div>

      <h2 className="admin-page-title">
        All Faculty ({faculty.length})
      </h2>


      <div
        style={{
          marginBottom: '16px'
        }}
      >

        <input
          className="admin-input"
          placeholder="Search by name or department..."
          value={search}
          onChange={e =>
            setSearch(e.target.value)
          }
        />

      </div>


      <div className="admin-info-card">

        <div className="admin-table-wrapper">

          <table className="admin-table">

            <thead>

              <tr
                style={{
                  background: '#1a1a2e',
                  color: 'white'
                }}
              >

                {[
                  'Name',
                  'Department',
                  'Job Title',
                  'Email',
                  'Phone',
                  'Salary',
                  'Status'
                ].map(header => (

                  <th key={header}>
                    {header}
                  </th>

                ))}

              </tr>

            </thead>


            <tbody>

              {filtered
                .slice(0, 50)
                .map(member => (

                  <tr key={member.id}>

                    <td>
                      {member.name}
                    </td>

                    <td>
                      {member.department}
                    </td>

                    <td>
                      {member.jobTitle}
                    </td>

                    <td>
                      {member.email}
                    </td>

                    <td>
                      {member.phone}
                    </td>

                    <td>
                      ₹
                      {member.salary?.toLocaleString()}
                    </td>

                    <td>

                      <span
                        className={
                          member.isActive
                            ? 'admin-status admin-status-active'
                            : 'admin-status admin-status-suspended'
                        }
                      >

                        {member.isActive
                          ? '✅ Active'
                          : '❌ Inactive'}

                      </span>

                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        </div>


        <p className="admin-table-note">

          Showing{' '}
          {Math.min(
            50,
            filtered.length
          )}{' '}

          of {filtered.length} faculty

        </p>

      </div>

    </div>

  );

}


// =====================================================
// PROMOTE FACULTY
// =====================================================

function PromoteFacultySection({
  faculty,
  setFaculty
}) {

  const [selected, setSelected] =
    useState('');

  const [newTitle, setNewTitle] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const [error, setError] =
    useState('');


  const titles = [
    'Assistant Professor',
    'Associate Professor',
    'Professor',
    'Director',
    'Dean-1',
    'Dean-2'
  ];


  const handlePromote = async () => {

    if (
      !selected ||
      !newTitle
    ) {
      return;
    }


    try {

      const response =
        await promoteFaculty(
          parseInt(selected),
          {
            jobTitle: newTitle
          }
        );


      setFaculty(prev =>
        prev.map(member =>
          member.id ===
          parseInt(selected)
            ? response.data
            : member
        )
      );


      setSuccess(
        'Faculty promoted successfully!'
      );

      setSelected('');
      setNewTitle('');

      setTimeout(
        () => setSuccess(''),
        3000
      );

    } catch (err) {

      console.error(err);

      setError(
        'Failed to promote faculty.'
      );

    }

  };


  const selectedFaculty =
    faculty.find(
      member =>
        member.id ===
        parseInt(selected)
    );


  return (

    <div>

      <h2 className="admin-page-title">
        Promote Faculty
      </h2>


      <div className="admin-info-card">

        <div className="admin-form-stack">


          {/* SELECT FACULTY */}

          <div>

            <label className="admin-label">
              Select Faculty
            </label>

            <select
              className="admin-input"
              value={selected}
              onChange={e =>
                setSelected(
                  e.target.value
                )
              }
            >

              <option value="">
                Select Faculty Member
              </option>

              {faculty
                .slice(0, 100)
                .map(member => (

                  <option
                    key={member.id}
                    value={member.id}
                  >

                    {member.name}
                    {' — '}
                    {member.jobTitle}
                    {' ('}
                    {member.department}
                    {')'}

                  </option>

                ))}

            </select>

          </div>


          {/* CURRENT TITLE */}

          {selectedFaculty && (

            <div className="admin-current-faculty">

              <b>
                Current Title:
              </b>{' '}

              {selectedFaculty.jobTitle}

              {' · '}

              <b>
                Department:
              </b>{' '}

              {selectedFaculty.department}

            </div>

          )}


          {/* NEW TITLE */}

          <div>

            <label className="admin-label">
              Promote To
            </label>

            <select
              className="admin-input"
              value={newTitle}
              onChange={e =>
                setNewTitle(
                  e.target.value
                )
              }
            >

              <option value="">
                Select New Title
              </option>

              {titles.map(title => (

                <option
                  key={title}
                  value={title}
                >
                  {title}
                </option>

              ))}

            </select>

          </div>


          {/* BUTTON */}

          <button
            onClick={handlePromote}
            className="admin-submit-btn"
          >

            ⬆️ Promote Faculty

          </button>


          {success && (

            <p className="admin-success">
              ✅ {success}
            </p>

          )}


          {error && (

            <p className="admin-error">
              {error}
            </p>

          )}

        </div>

      </div>

    </div>

  );

}


// =====================================================
// GRIEVANCES
// =====================================================

function GrievancesSection({
  grievances,
  setGrievances
}) {

  const [response, setResponse] =
    useState({});

  const [success, setSuccess] =
    useState('');


  const handleResolve = async id => {

    if (!response[id]) {
      return;
    }


    try {

      const result =
        await resolveGrievance(
          id,
          {
            response: response[id]
          }
        );


      setGrievances(prev =>
        prev.map(grievance =>
          grievance.id === id
            ? result.data
            : grievance
        )
      );


      setSuccess(
        'Grievance resolved!'
      );

      setTimeout(
        () => setSuccess(''),
        3000
      );

    } catch (err) {

      console.error(err);

    }

  };


  const handleReject = async id => {

    if (!response[id]) {
      return;
    }


    try {

      const result =
        await rejectGrievance(
          id,
          {
            response: response[id]
          }
        );


      setGrievances(prev =>
        prev.map(grievance =>
          grievance.id === id
            ? result.data
            : grievance
        )
      );


      setSuccess(
        'Grievance rejected!'
      );

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

    REJECTED: '#ef4444'

  };


  return (

    <div>

      <h2 className="admin-page-title">
        Grievances ({grievances.length})
      </h2>


      {success && (

        <p className="admin-success">
          ✅ {success}
        </p>

      )}


      {grievances.length === 0 ? (

        <div className="admin-info-card">

          <p>
            No grievances found.
          </p>

        </div>

      ) : (

        <div className="admin-vertical-list">

          {grievances.map(
            (grievance, index) => {

              const color =
                statusColor[
                  grievance.status
                ] || '#ddd';


              return (

                <div
                  key={
                    grievance.id ||
                    index
                  }
                  className="admin-info-card admin-grievance-card"
                  style={{
                    borderLeft:
                      `4px solid ${color}`
                  }}
                >


                  {/* HEADER */}

                  <div className="admin-grievance-header">

                    <div>

                      <h4 className="admin-grievance-title">

                        {grievance.title}

                      </h4>


                      <span className="admin-grievance-meta">

                        Against:{' '}
                        {grievance.against}

                        {' · '}

                        {grievance.raisedRole}

                        {' · '}

                        {grievance.createdAt
                          ?.split('T')[0]}

                      </span>

                    </div>


                    <span
                      className="admin-grievance-status"
                      style={{
                        background:
                          `${color}20`,
                        color: color
                      }}
                    >

                      {grievance.status}

                    </span>

                  </div>


                  {/* DESCRIPTION */}

                  <p className="admin-grievance-description">

                    {grievance.description}

                  </p>


                  {/* RESPONSE */}

                  {grievance.response && (

                    <div className="admin-response-box">

                      <b>
                        Response:
                      </b>{' '}

                      {grievance.response}

                    </div>

                  )}


                  {/* ACTION */}

                  {grievance.status ===
                    'OPEN' && (

                    <div className="admin-response-row">

                      <input
                        className="admin-input"
                        placeholder="Type response..."
                        value={
                          response[
                            grievance.id
                          ] || ''
                        }
                        onChange={e =>
                          setResponse(prev => ({
                            ...prev,
                            [grievance.id]:
                              e.target.value
                          }))
                        }
                      />


                      <button
                        onClick={() =>
                          handleResolve(
                            grievance.id
                          )
                        }
                        className="admin-action-btn"
                        style={{
                          background:
                            '#22c55e',
                          padding:
                            '10px 16px'
                        }}
                      >

                        ✅ Resolve

                      </button>


                      <button
                        onClick={() =>
                          handleReject(
                            grievance.id
                          )
                        }
                        className="admin-action-btn"
                        style={{
                          background:
                            '#ef4444',
                          padding:
                            '10px 16px'
                        }}
                      >

                        ❌ Reject

                      </button>

                    </div>

                  )}

                </div>

              );

            }
          )}

        </div>

      )}

    </div>

  );

}


// =====================================================
// PLACEMENTS
// =====================================================

function PlacementsSection({
  placements
}) {

  const companies = [
    ...new Set(
      placements.map(
        placement =>
          placement.companyName
      )
    )
  ];


  const [filter, setFilter] =
    useState('');


  const filtered =
    filter
      ? placements.filter(
          placement =>
            placement.companyName ===
            filter
        )
      : placements;


  const topPackage =
    placements.length > 0
      ? Math.max(
          ...placements.map(
            placement =>
              placement.packageLpa || 0
          )
        )
      : 0;


  const avgPackage =
    placements.length > 0
      ? (
          placements.reduce(
            (total, placement) =>
              total +
              (placement.packageLpa || 0),
            0
          ) /
          placements.length
        ).toFixed(2)
      : 0;


  return (

    <div>

      <h2 className="admin-page-title">
        Placement Details (
        {placements.length}
        )
      </h2>


      {/* STATS */}

      <div className="admin-grid-3">

        <div
          className="admin-stat-box"
          style={{
            background: '#1a3c6e'
          }}
        >

          <h2>
            {placements.length}
          </h2>

          <p>
            Total Placed
          </p>

        </div>


        <div
          className="admin-stat-box"
          style={{
            background: '#0f6e3c'
          }}
        >

          <h2>
            ₹{topPackage} LPA
          </h2>

          <p>
            Highest Package
          </p>

        </div>


        <div
          className="admin-stat-box"
          style={{
            background: '#6e4f0f'
          }}
        >

          <h2>
            ₹{avgPackage} LPA
          </h2>

          <p>
            Avg Package
          </p>

        </div>

      </div>


      {/* FILTER */}

      <div
        style={{
          marginTop: '20px',
          marginBottom: '16px'
        }}
      >

        <select
          className="admin-input"
          value={filter}
          onChange={e =>
            setFilter(e.target.value)
          }
        >

          <option value="">
            All Companies
          </option>

          {companies.map(company => (

            <option
              key={company}
              value={company}
            >
              {company}
            </option>

          ))}

        </select>

      </div>


      {/* TABLE */}

      <div className="admin-info-card">

        <div className="admin-table-wrapper">

          <table className="admin-table">

            <thead>

              <tr
                style={{
                  background: '#1a1a2e',
                  color: 'white'
                }}
              >

                {[
                  'Student ID',
                  'Company',
                  'Role',
                  'Package',
                  'Year',
                  'Type'
                ].map(header => (

                  <th key={header}>
                    {header}
                  </th>

                ))}

              </tr>

            </thead>


            <tbody>

              {filtered
                .slice(0, 50)
                .map(placement => (

                  <tr key={placement.id}>

                    <td>
                      {placement.studentId}
                    </td>

                    <td>
                      <b>
                        {placement.companyName}
                      </b>
                    </td>

                    <td>
                      {placement.role}
                    </td>

                    <td>

                      <b className="admin-grade-good">

                        ₹
                        {placement.packageLpa}
                        {' '}
                        LPA

                      </b>

                    </td>

                    <td>
                      {placement.placedYear}
                    </td>

                    <td>

                      <span
                        className={
                          placement.offerType ===
                          'Full-Time'
                            ? 'admin-status admin-status-active'
                            : 'admin-status admin-status-pending'
                        }
                      >

                        {placement.offerType}

                      </span>

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


// =====================================================
// FEES
// =====================================================

function FeesSection({
  unpaidFees
}) {

  const totalPending =
    unpaidFees.reduce(
      (total, fee) =>
        total +
        (fee.amount || 0),
      0
    );


  return (

    <div>

      <h2 className="admin-page-title">
        Pending Fees
      </h2>


      {/* STATS */}

      <div className="admin-grid-2">

        <div
          className="admin-stat-box"
          style={{
            background: '#8b1a1a'
          }}
        >

          <h2>
            {unpaidFees.length}
          </h2>

          <p>
            Unpaid Records
          </p>

        </div>


        <div
          className="admin-stat-box"
          style={{
            background: '#1a3c6e'
          }}
        >

          <h2>
            ₹
            {totalPending.toLocaleString()}
          </h2>

          <p>
            Total Pending
          </p>

        </div>

      </div>


      {/* TABLE */}

      <div
        className="admin-info-card"
        style={{
          marginTop: '20px'
        }}
      >

        <div className="admin-table-wrapper">

          <table className="admin-table">

            <thead>

              <tr
                style={{
                  background: '#8b1a1a',
                  color: 'white'
                }}
              >

                {[
                  'Student ID',
                  'Semester',
                  'Amount',
                  'Due Date'
                ].map(header => (

                  <th key={header}>
                    {header}
                  </th>

                ))}

              </tr>

            </thead>


            <tbody>

              {unpaidFees
                .slice(0, 50)
                .map(fee => (

                  <tr key={fee.id}>

                    <td>
                      {fee.studentId}
                    </td>

                    <td>
                      Semester {fee.semester}
                    </td>

                    <td>

                      <b className="admin-grade-poor">

                        ₹
                        {fee.amount?.toLocaleString()}

                      </b>

                    </td>

                    <td>
                      {fee.dueDate || '—'}
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


// =====================================================
// BROADCAST
// =====================================================

function BroadcastSection() {

  const [form, setForm] =
    useState({
      title: '',
      message: ''
    });


  const [success, setSuccess] =
    useState('');

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(false);


  const handleBroadcast = async () => {

    if (
      !form.title ||
      !form.message
    ) {
      return;
    }


    setLoading(true);


    try {

      const response =
        await broadcastNotification(
          form
        );


      setSuccess(
        response.data
      );


      setForm({
        title: '',
        message: ''
      });


      setTimeout(
        () => setSuccess(''),
        5000
      );

    } catch (err) {

      console.error(err);

      setError(
        'Failed to broadcast. Try again.'
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div>

      <h2 className="admin-page-title">
        📢 Broadcast Notification
      </h2>


      <div className="admin-info-card">

        <p className="admin-description">

          Send a notification to ALL users
          (students, faculty, admin) in
          the system.

        </p>


        <div className="admin-form-stack">


          {/* TITLE */}

          <div>

            <label className="admin-label">
              Title
            </label>

            <input
              className="admin-input"
              placeholder="Notification title..."
              value={form.title}
              onChange={e =>
                setForm(prev => ({
                  ...prev,
                  title:
                    e.target.value
                }))
              }
            />

          </div>


          {/* MESSAGE */}

          <div>

            <label className="admin-label">
              Message
            </label>

            <textarea
              className="admin-input admin-textarea"
              placeholder="Write your broadcast message here..."
              value={form.message}
              onChange={e =>
                setForm(prev => ({
                  ...prev,
                  message:
                    e.target.value
                }))
              }
            />

          </div>


          {/* SEND */}

          <button
            onClick={handleBroadcast}
            disabled={loading}
            className="admin-submit-btn"
          >

            {loading
              ? '📡 Broadcasting...'
              : '📢 Send to All Users'}

          </button>


          {success && (

            <p className="admin-success">
              ✅ {success}
            </p>

          )}


          {error && (

            <p className="admin-error">
              {error}
            </p>

          )}

        </div>

      </div>

    </div>

  );
}