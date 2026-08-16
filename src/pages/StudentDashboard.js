import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';
import {
  getCurrentStudent,
  getStudentEducation,
  getStudentParents,
  getStudentSocieties,
  getStudentMarks,
  getStudentAttendance,
  getStudentFees,
  getStudentPlacement,
  getStudentGrievances,
  raiseGrievance,
  getStudentNotifications,
  getStudentMentor,
  getStudentMentorMeetings,
} from '../services/api';


/* =====================================================
   SIDEBAR MENU
   ===================================================== */

const menuItems = [
  {
    key: 'overview',
    label: '🏠 Overview',
  },
  {
    key: 'profile',
    label: '👤 My Profile',
    children: [
      'Personal Info',
      'Address Details',
      'Previous Education',
      'Parent Details',
      'Societies',
    ],
  },
  {
    key: 'academics',
    label: '📊 Academics',
    children: [
      'Semester Marks',
      'Attendance',
      'Exam Schedule',
    ],
  },
  {
    key: 'fees',
    label: '💰 Fees',
  },
  {
    key: 'placement',
    label: '🏢 Placement',
  },
  {
    key: 'mentor',
    label: '👨‍🏫 Mentor',
  },
  {
    key: 'grievance',
    label: '📝 Grievance Portal',
  },
  {
    key: 'notifications',
    label: '🔔 Notifications',
  },
  {
    key: 'ai',
    label: '🤖 AI Report',
  },
];


/* =====================================================
   MAIN DASHBOARD
   ===================================================== */

export default function StudentDashboard() {

  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  /* ---------------------------------------------------
     STUDENT STATE
     --------------------------------------------------- */

  const [student, setStudent] = useState(null);

  const [active, setActive] = useState('overview');

  const [open, setOpen] = useState({});

  /* ---------------------------------------------------
     SUB RESOURCE STATES
     --------------------------------------------------- */

  const [education, setEducation] = useState([]);
  const [parents, setParents] = useState(null);
  const [societies, setSocieties] = useState([]);
  const [marks, setMarks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [fees, setFees] = useState([]);
  const [placement, setPlacement] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [mentor, setMentor] = useState(null);
  const [meetings, setMeetings] = useState([]);

  const [loading, setLoading] = useState(true);


  /* ===================================================
     LOAD CURRENT LOGGED-IN STUDENT
     =================================================== */

  useEffect(() => {

    let cancelled = false;

    const fetchStudentDashboard = async () => {

      try {

        setLoading(true);

        /*
         * Clear old student data first.
         *
         * This is important when switching between
         * Eesha and Bumbhole accounts.
         */

        setStudent(null);
        setEducation([]);
        setParents(null);
        setSocieties([]);
        setMarks([]);
        setAttendance([]);
        setFees([]);
        setPlacement([]);
        setGrievances([]);
        setNotifications([]);
        setMentor(null);
        setMeetings([]);


        /* ---------------------------------------------
           DEBUG: CURRENT AUTHENTICATED USER
           --------------------------------------------- */

        console.log(
          'CURRENT AUTH USER:',
          user
        );


        /* ---------------------------------------------
           GET CURRENT STUDENT
           --------------------------------------------- */

        const response =
          await getCurrentStudent();


        console.log(
          'CURRENT STUDENT RESPONSE:',
          response.data
        );


        if (cancelled) {
          return;
        }


        /*
         * The backend should return the student belonging
         * to the email contained inside the JWT.
         */

        const currentStudent =
          response.data;


        if (!currentStudent) {
          throw new Error(
            'No student profile returned by server.'
          );
        }


        /*
         * Make absolutely sure that the response
         * contains the expected student identity.
         */

        console.log(
          'LOGGED-IN EMAIL:',
          user?.email
        );

        console.log(
          'STUDENT NAME FROM DATABASE:',
          currentStudent?.name
        );

        console.log(
          'STUDENT USER ID:',
          currentStudent?.userId
        );

        console.log(
          'STUDENT ROLL NUMBER:',
          currentStudent?.rollNo
        );


        setStudent(currentStudent);


        /* ---------------------------------------------
           LOAD ALL STUDENT DATA
           --------------------------------------------- */

        const studentId =
          currentStudent.id;

        const userId =
          currentStudent.userId;


        console.log(
          'USING STUDENT ID:',
          studentId
        );

        console.log(
          'USING USER ID:',
          userId
        );


        const [
          edu,
          par,
          soc,
          mrk,
          att,
          fee,
          plc,
          grv,
          ntf,
          men,
          met,
        ] = await Promise.all([

          getStudentEducation(studentId),

          getStudentParents(studentId),

          getStudentSocieties(studentId),

          getStudentMarks(studentId),

          getStudentAttendance(studentId),

          getStudentFees(studentId),

          getStudentPlacement(studentId),

          getStudentGrievances(userId),

          getStudentNotifications(userId),

          getStudentMentor(studentId),

          getStudentMentorMeetings(studentId),

        ]);


        if (cancelled) {
          return;
        }


        /* ---------------------------------------------
           SAVE ALL DATA
           --------------------------------------------- */

        setEducation(edu.data || []);

        setParents(par.data || null);

        setSocieties(soc.data || []);

        setMarks(mrk.data || []);

        setAttendance(att.data || []);

        setFees(fee.data || []);

        setPlacement(plc.data || []);

        setGrievances(grv.data || []);

        setNotifications(ntf.data || []);

        setMentor(men.data || null);

        setMeetings(met.data || []);


      } catch (err) {

        console.error(
          'FAILED TO LOAD STUDENT DASHBOARD:',
          err
        );


        console.error(
          'SERVER RESPONSE:',
          err.response?.data
        );


        /*
         * Unauthorized means the JWT is invalid/expired.
         */

        if (err.response?.status === 401) {

          logoutUser();

          navigate('/');

          return;
        }


        /*
         * If /students/me does not exist.
         */

        if (err.response?.status === 404) {

          console.error(
            'The /students/me endpoint was not found.'
          );

        }


      } finally {

        if (!cancelled) {
          setLoading(false);
        }

      }

    };


    /*
     * Only load when an authenticated user exists.
     */

    if (user) {

      fetchStudentDashboard();

    } else {

      setLoading(false);

    }


    return () => {

      cancelled = true;

    };

  }, [user, logoutUser, navigate]);


  /* ===================================================
     LOGOUT
     =================================================== */

  const handleLogout = () => {

    logoutUser();

    navigate('/');

  };


  /* ===================================================
     SIDEBAR TOGGLE
     =================================================== */

  const toggleMenu = (key) => {

    setOpen((previous) => ({

      ...previous,

      [key]: !previous[key],

    }));

  };


  /* ===================================================
     LOADING SCREEN
     =================================================== */

  if (loading) {

    return (

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#f0f2f5',
        }}
      >

        <div
          style={{
            textAlign: 'center',
          }}
        >

          <div
            style={{
              fontSize: '48px',
              marginBottom: '16px',
            }}
          >
            🎓
          </div>

          <p
            style={{
              color: '#1a3c6e',
              fontWeight: 'bold',
            }}
          >
            Loading your portal...
          </p>

        </div>

      </div>

    );

  }


  /* ===================================================
     NO STUDENT FOUND
     =================================================== */

  if (!student) {

    return (

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#f0f2f5',
          padding: '20px',
        }}
      >

        <div
          style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            textAlign: 'center',
            maxWidth: '500px',
            boxShadow:
              '0 4px 15px rgba(0,0,0,0.1)',
          }}
        >

          <div
            style={{
              fontSize: '40px',
              marginBottom: '10px',
            }}
          >
            ⚠️
          </div>

          <h2
            style={{
              color: '#1a3c6e',
            }}
          >
            Student Profile Not Found
          </h2>

          <p
            style={{
              color: '#666',
            }}
          >
            We could not find a student profile
            associated with the currently logged-in
            account.
          </p>

          <button
            onClick={handleLogout}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              background: '#1a3c6e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Return to Login
          </button>

        </div>

      </div>

    );

  }


  /* ===================================================
     MAIN UI
     =================================================== */

  return (

    <div className="student-container">

      {/* =================================================
          NAVBAR
          ================================================= */}

      <nav className="student-nav">

        <div
          className="student-nav-left"
          style={styles.navLeft}
        >

          <span
            className="student-logo"
            style={styles.logo}
          >
            🎓
          </span>

          <div>

            <div
              className="student-uni-name"
              style={styles.uniName}
            >
              University Student Portal
            </div>

            <div
              className="student-uni-sub"
              style={styles.uniSub}
            >
              {student?.branch} —{' '}
              {student?.admissionYear} Batch
            </div>

          </div>

        </div>


        <div
          className="student-nav-right"
          style={styles.navRight}
        >

          <span
            className="student-welcome"
            style={styles.welcome}
          >
            Welcome, {student?.name}
          </span>

          <button
            className="student-logout"
            onClick={handleLogout}
            style={styles.logoutBtn}
          >
            Log off
          </button>

        </div>

      </nav>


      {/* =================================================
          BODY
          ================================================= */}

      <div className="student-body">


        {/* =================================================
            SIDEBAR
            ================================================= */}

        <aside className="student-sidebar">

          <div
            className="student-sidebar-title"
            style={styles.sidebarTitle}
          >
            Student Self Service
          </div>


          {menuItems.map((item) => (

            <div key={item.key}>

              <div
                className="student-menu-item"
                style={{
                  ...styles.menuItem,

                  background:
                    active === item.key
                      ? '#d0e4f7'
                      : 'transparent',

                  fontWeight:
                    active === item.key
                      ? '600'
                      : '400',
                }}

                onClick={() => {

                  if (item.children) {

                    toggleMenu(item.key);

                  } else {

                    setActive(item.key);

                  }

                }}
              >

                {item.children && (

                  <span style={styles.arrow}>
                    {open[item.key]
                      ? '▼'
                      : '▶'}
                  </span>

                )}

                {item.label}

              </div>


              {item.children &&
                open[item.key] &&
                item.children.map((child) => (

                  <div
                    key={child}
                    className="student-sub-menu"
                    style={{
                      ...styles.subMenuItem,

                      background:
                        active === child
                          ? '#d0e4f7'
                          : 'transparent',
                    }}

                    onClick={() =>
                      setActive(child)
                    }
                  >
                    • {child}
                  </div>

                ))}

            </div>

          ))}

        </aside>


        {/* =================================================
            MAIN
            ================================================= */}

        <main className="student-main">


          {active === 'overview' && (

            <Overview
              student={student}
              marks={marks}
              attendance={attendance}
              notifications={notifications}
            />

          )}


          {active === 'Personal Info' && (

            <PersonalInfo
              student={student}
            />

          )}


          {active === 'Address Details' && (

            <AddressDetails
              student={student}
            />

          )}


          {active === 'Previous Education' && (

            <PreviousEducation
              education={education}
            />

          )}


          {active === 'Parent Details' && (

            <ParentDetailsSection
              parents={parents}
            />

          )}


          {active === 'Societies' && (

            <SocietiesSection
              societies={societies}
            />

          )}


          {active === 'Semester Marks' && (

            <SemesterMarksSection
              marks={marks}
              student={student}
            />

          )}


          {active === 'Attendance' && (

            <AttendanceSection
              attendance={attendance}
            />

          )}


          {active === 'Exam Schedule' && (

            <ExamSchedule
              student={student}
            />

          )}


          {active === 'fees' && (

            <FeesSection
              fees={fees}
            />

          )}


          {active === 'placement' && (

            <PlacementSection
              placement={placement}
              student={student}
            />

          )}


          {active === 'mentor' && (

            <MentorSection
              mentor={mentor}
              meetings={meetings}
            />

          )}


          {active === 'grievance' && (

            <GrievanceSection
              grievances={grievances}
              student={student}
              setGrievances={setGrievances}
            />

          )}


          {active === 'notifications' && (

            <NotificationsSection
              notifications={notifications}
            />

          )}


          {active === 'ai' && (

            <AIReport
              student={student}
              marks={marks}
              attendance={attendance}
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
  student,
  marks,
  attendance,
  notifications,
}) {

  const unread =
    notifications.filter(
      (n) => !n.isRead
    ).length;


  const avgTotal =
    marks.length > 0
      ? (
          marks.reduce(
            (a, m) =>
              a + (Number(m.total) || 0),
            0
          ) / marks.length
        ).toFixed(1)
      : 0;


  const presentCount =
    attendance.filter(
      (a) =>
        a.status === 'PRESENT'
    ).length;


  const attendancePct =
    attendance.length > 0
      ? (
          (presentCount /
            attendance.length) *
          100
        ).toFixed(1)
      : 0;


  return (

    <div>

      <h2
        className="student-page-title"
        style={styles.pageTitle}
      >
        Overview
      </h2>


      <div
        style={{
          background:
            'linear-gradient(135deg, #1a3c6e, #0f3460)',
          borderRadius: '16px',
          padding: '28px',
          color: 'white',
          marginBottom: '24px',
        }}
      >

        <h2
          style={{
            margin: '0 0 8px',
          }}
        >
          👋 Welcome back,{' '}
          {student?.name}!
        </h2>

        <p
          style={{
            margin: 0,
            opacity: 0.85,
          }}
        >
          {student?.branch} · Semester{' '}
          {student?.currentSemester} · Roll No:{' '}
          {student?.rollNo}
        </p>

      </div>


      <div className="student-grid-4">


        <div
          className="student-stat-box"
          style={{
            ...styles.statBox,
            background: '#1a3c6e',
          }}
        >

          <h2>
            {student?.cgpa ?? 0}
          </h2>

          <p>
            Current CGPA
          </p>

        </div>


        <div
          className="student-stat-box"
          style={{
            ...styles.statBox,
            background: '#0f6e3c',
          }}
        >

          <h2>
            {avgTotal}%
          </h2>

          <p>
            Avg Marks
          </p>

        </div>


        <div
          className="student-stat-box"
          style={{
            ...styles.statBox,
            background:
              attendancePct < 75
                ? '#8b1a1a'
                : '#6e4f0f',
          }}
        >

          <h2>
            {attendancePct}%
          </h2>

          <p>
            Attendance
          </p>

        </div>


        <div
          className="student-stat-box"
          style={{
            ...styles.statBox,
            background: '#4a1a6e',
          }}
        >

          <h2>
            {unread}
          </h2>

          <p>
            Unread Alerts
          </p>

        </div>

      </div>


      {attendancePct < 75 && (

        <div
          style={{
            background: '#fff3cd',
            border:
              '1px solid #ffc107',
            padding: '14px',
            borderRadius: '8px',
            marginTop: '16px',
            color: '#856404',
          }}
        >

          ⚠️{' '}

          <b>
            Attendance Warning:
          </b>{' '}

          Your overall attendance is{' '}
          {attendancePct}% which is below
          75%. You may be barred from exams.

        </div>

      )}

    </div>

  );
}


/* =====================================================
   PERSONAL INFO
   ===================================================== */

function PersonalInfo({ student }) {

  const rows = [

    ['Full Name', student?.name],

    ['Roll No', student?.rollNo],

    ['Branch', student?.branch],

    ['Gender', student?.gender],

    ['Date of Birth', student?.dob],

    ['Blood Group', student?.bloodGroup],

    ['Age', student?.age],

    ['Phone', student?.phone],

    ['Semester', student?.currentSemester],

    ['CGPA', student?.cgpa],

    ['Admission Year', student?.admissionYear],

    [
      'Status',
      student?.isSuspended
        ? '🚫 Suspended'
        : '✅ Active',
    ],

  ];


  return (

    <div>

      <h2
        className="student-page-title"
        style={styles.pageTitle}
      >
        Personal Information
      </h2>


      <div
        className="student-info-card"
        style={styles.infoCard}
      >

        <table
          style={styles.infoTable}
        >

          <tbody>

            {rows.map(
              ([label, value]) => (

                <tr
                  key={label}
                  style={styles.infoRow}
                >

                  <td
                    style={styles.infoLabel}
                  >
                    {label}
                  </td>

                  <td
                    style={styles.infoValue}
                  >
                    {value ??
                      '—'}
                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>

  );
}


/* =====================================================
   ADDRESS
   ===================================================== */

function AddressDetails({
  student,
}) {

  return (

    <div>

      <h2
        className="student-page-title"
        style={styles.pageTitle}
      >
        Address Details
      </h2>


      <div className="student-grid-2">


        <div
          className="student-info-card"
          style={styles.infoCard}
        >

          <h3>
            📍 Current Address
          </h3>

          <p
            style={{
              lineHeight: '1.6',
            }}
          >
            {student?.addressCurrent ||
              '—'}
          </p>

        </div>


        <div
          className="student-info-card"
          style={styles.infoCard}
        >

          <h3>
            🏠 Permanent Address
          </h3>

          <p
            style={{
              lineHeight: '1.6',
            }}
          >
            {student?.addressPermanent ||
              '—'}
          </p>

        </div>

      </div>

    </div>

  );
}


/* =====================================================
   PREVIOUS EDUCATION
   ===================================================== */

function PreviousEducation({
  education,
}) {

  return (

    <div>

      <h2
        className="student-page-title"
        style={styles.pageTitle}
      >
        Previous Education
      </h2>


      {education.length === 0 ? (

        <div
          className="student-info-card"
          style={styles.infoCard}
        >

          <p>
            No previous education
            records found.
          </p>

        </div>

      ) : (

        <div className="student-grid-2">

          {education.map(
            (e, i) => (

              <div
                key={i}
                className="student-info-card"
                style={{
                  ...styles.infoCard,
                  borderTop:
                    `4px solid ${
                      e.level ===
                      'CLASS_X'
                        ? '#1a3c6e'
                        : '#e94560'
                    }`,
                }}
              >

                <h3>

                  {e.level ===
                  'CLASS_X'
                    ? '🏫 Class X (Mid School)'
                    : '🎓 Class XII (High School)'}

                </h3>


                <table
                  style={styles.infoTable}
                >

                  <tbody>

                    {[
                      [
                        'School Name',
                        e.schoolName,
                      ],
                      [
                        'Board',
                        e.board,
                      ],
                      [
                        'Stream',
                        e.stream ||
                          'N/A',
                      ],
                      [
                        'Pass Year',
                        e.passYear,
                      ],
                      [
                        'Percentage',
                        e.percentage != null
                          ? `${e.percentage}%`
                          : '—',
                      ],
                    ].map(
                      ([label, value]) => (

                        <tr
                          key={label}
                          style={
                            styles.infoRow
                          }
                        >

                          <td
                            style={
                              styles.infoLabel
                            }
                          >
                            {label}
                          </td>

                          <td
                            style={
                              styles.infoValue
                            }
                          >
                            {value ??
                              '—'}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )
          )}

        </div>

      )}

    </div>

  );
}


/* =====================================================
   PARENTS
   ===================================================== */

function ParentDetailsSection({
  parents,
}) {

  if (!parents) {

    return (

      <div
        className="student-info-card"
        style={styles.infoCard}
      >

        <p>
          No parent details found.
        </p>

      </div>

    );

  }


  const renderParent = (
    title,
    color,
    rows
  ) => (

    <div
      className="student-info-card"
      style={{
        ...styles.infoCard,
        borderTop:
          `4px solid ${color}`,
      }}
    >

      <h3>
        {title}
      </h3>


      <table
        style={styles.infoTable}
      >

        <tbody>

          {rows.map(
            ([label, value]) => (

              <tr
                key={label}
                style={
                  styles.infoRow
                }
              >

                <td
                  style={
                    styles.infoLabel
                  }
                >
                  {label}
                </td>

                <td
                  style={
                    styles.infoValue
                  }
                >
                  {value ??
                    '—'}
                </td>

              </tr>

            )
          )}

        </tbody>

      </table>

    </div>

  );


  return (

    <div>

      <h2
        className="student-page-title"
        style={styles.pageTitle}
      >
        Parent Details
      </h2>


      <div className="student-grid-2">

        {renderParent(
          "👨 Father's Details",
          '#1a3c6e',
          [
            [
              'Name',
              parents.fatherName,
            ],
            [
              'Phone',
              parents.fatherPhone,
            ],
            [
              'Email',
              parents.fatherEmail,
            ],
          ]
        )}


        {renderParent(
          "👩 Mother's Details",
          '#e94560',
          [
            [
              'Name',
              parents.motherName,
            ],
            [
              'Phone',
              parents.motherPhone,
            ],
            [
              'Email',
              parents.motherEmail,
            ],
          ]
        )}


        {parents.guardianName &&

          renderParent(
            "🧑 Guardian's Details",
            '#f59e0b',
            [
              [
                'Name',
                parents.guardianName,
              ],
              [
                'Phone',
                parents.guardianPhone,
              ],
            ]
          )}

      </div>

    </div>

  );
}


/* =====================================================
   SOCIETIES
   ===================================================== */

function SocietiesSection({
  societies,
}) {

  const icons = {

    Reading: '📚',

    Writing: '✍️',

    Singing: '🎵',

    Dancing: '💃',

    Cricket: '🏏',

    Football: '⚽',

    Food: '🍕',

    AI: '🤖',

    Robotics: '🦾',

    Other: '🌟',

  };


  return (

    <div>

      <h2
        className="student-page-title"
        style={styles.pageTitle}
      >
        Societies &
        Extracurriculars
      </h2>


      {societies.length === 0 ? (

        <div
          className="student-info-card"
          style={styles.infoCard}
        >

          <p>
            No societies joined yet.
          </p>

        </div>

      ) : (

        <div className="student-grid-3">

          {societies.map(
            (s, i) => (

              <div
                key={i}
                className="student-info-card"
                style={{
                  background: 'white',
                  borderRadius:
                    '12px',
                  padding:
                    '20px',
                  boxShadow:
                    '0 2px 8px rgba(0,0,0,0.08)',
                  textAlign:
                    'center',
                  borderTop:
                    '4px solid #1a3c6e',
                }}
              >

                <div
                  style={{
                    fontSize:
                      '36px',
                    marginBottom:
                      '8px',
                  }}
                >
                  {icons[s.name] ||
                    '🌟'}
                </div>

                <h3
                  style={{
                    color:
                      '#1a3c6e',
                    margin:
                      '0 0 8px',
                  }}
                >
                  {s.name}
                </h3>

                <p
                  style={{
                    color:
                      '#666',
                    margin:
                      '0 0 4px',
                    fontSize:
                      '13px',
                  }}
                >
                  {s.role}
                </p>

                <p
                  style={{
                    color:
                      '#999',
                    margin: 0,
                    fontSize:
                      '12px',
                  }}
                >
                  Joined{' '}
                  {s.joinedYear}
                </p>

              </div>

            )
          )}

        </div>

      )}

    </div>

  );
}


/* =====================================================
   SEMESTER MARKS
   ===================================================== */

function SemesterMarksSection({
  marks,
  student,
}) {

  const [
    selectedSem,
    setSelectedSem,
  ] = useState(
    student?.currentSemester || 1
  );


  const semesters = [
    ...new Set(
      marks
        .map(
          (m) => m.semester
        )
        .filter(
          (s) => s != null
        )
    ),
  ].sort(
    (a, b) => a - b
  );


  const filtered =
    marks.filter(
      (m) =>
        m.semester ===
        selectedSem
    );


  const getGradeColor =
    (grade) => {

      if (!grade)
        return '#666';

      if (
        grade.startsWith('A')
      )
        return '#22c55e';

      if (
        grade.startsWith('B')
      )
        return '#f59e0b';

      if (
        grade.startsWith('C')
      )
        return '#f97316';

      return '#ef4444';

    };


  return (

    <div>

      <h2
        className="student-page-title"
        style={styles.pageTitle}
      >
        Semester Grade Report
      </h2>


      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom:
            '20px',
          flexWrap:
            'wrap',
        }}
      >

        {semesters.map(
          (sem) => (

            <button
              key={sem}
              onClick={() =>
                setSelectedSem(
                  sem
                )
              }
              style={{
                padding:
                  '8px 16px',
                borderRadius:
                  '8px',
                border:
                  'none',
                background:
                  selectedSem ===
                  sem
                    ? '#1a3c6e'
                    : '#e5e7eb',
                color:
                  selectedSem ===
                  sem
                    ? 'white'
                    : '#333',
                cursor:
                  'pointer',
                fontWeight:
                  selectedSem ===
                  sem
                    ? '600'
                    : '400',
              }}
            >
              Sem {sem}
            </button>

          )
        )}

      </div>


      <div
        className="student-info-card"
        style={styles.infoCard}
      >

        {filtered.length === 0 ? (

          <p>
            No marks data for
            Semester{' '}
            {selectedSem}
          </p>

        ) : (

          <div className="student-table-wrapper">

            <table className="student-table">

              <thead>

                <tr
                  style={{
                    background:
                      '#1a3c6e',
                    color:
                      'white',
                  }}
                >

                  {[
                    'Course ID',
                    'Quiz 1',
                    'Quiz 2',
                    'Assign 1',
                    'Assign 2',
                    'Mid Exam',
                    'End Exam',
                    'Total',
                    'Grade',
                  ].map(
                    (h) => (

                      <th
                        key={h}
                        style={{
                          padding:
                            '10px',
                          textAlign:
                            'left',
                          fontSize:
                            '13px',
                        }}
                      >
                        {h}
                      </th>

                    )
                  )}

                </tr>

              </thead>


              <tbody>

                {filtered.map(
                  (m, i) => (

                    <tr
                      key={m.id}
                      style={{
                        background:
                          i % 2 === 0
                            ? '#f8f9fa'
                            : 'white',
                      }}
                    >

                      <td
                        style={
                          styles.td
                        }
                      >
                        CS
                        {String(
                          m.courseId
                        ).padStart(
                          3,
                          '0'
                        )}
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {m.quiz1}/10
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {m.quiz2}/10
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {m.assignment1}/10
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {m.assignment2}/10
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {m.midExam}/50
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {m.endExam}/100
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        <b>
                          {m.total}/100
                        </b>
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        <b
                          style={{
                            color:
                              getGradeColor(
                                m.grade
                              ),
                          }}
                        >
                          {m.grade}
                        </b>
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}


        <div
          style={{
            marginTop:
              '16px',
            padding:
              '12px',
            background:
              '#e8f4fd',
            borderRadius:
              '8px',
          }}
        >

          <b>
            Overall CGPA:{' '}
            {student?.cgpa}
          </b>

        </div>

      </div>

    </div>

  );
}


/* =====================================================
   ATTENDANCE
   ===================================================== */

function AttendanceSection({
  attendance,
}) {

  const [
    selectedSem,
    setSelectedSem,
  ] = useState(1);


  const semesters = [
    ...new Set(
      attendance
        .map(
          (a) => a.semester
        )
        .filter(
          (s) => s != null
        )
    ),
  ].sort(
    (a, b) => a - b
  );


  const filtered =
    attendance.filter(
      (a) =>
        a.semester ===
        selectedSem
    );


  const byCourse =
    filtered.reduce(
      (acc, a) => {

        if (!acc[a.courseId]) {

          acc[a.courseId] = {
            present: 0,
            total: 0,
          };

        }


        acc[a.courseId]
          .total++;


        if (
          a.status ===
          'PRESENT'
        ) {

          acc[a.courseId]
            .present++;

        }


        return acc;

      },
      {}
    );


  return (

    <div>

      <h2
        className="student-page-title"
        style={styles.pageTitle}
      >
        Attendance Report
      </h2>


      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom:
            '20px',
          flexWrap:
            'wrap',
        }}
      >

        {semesters.map(
          (sem) => (

            <button
              key={sem}
              onClick={() =>
                setSelectedSem(
                  sem
                )
              }
              style={{
                padding:
                  '8px 16px',
                borderRadius:
                  '8px',
                border:
                  'none',
                background:
                  selectedSem ===
                  sem
                    ? '#1a3c6e'
                    : '#e5e7eb',
                color:
                  selectedSem ===
                  sem
                    ? 'white'
                    : '#333',
                cursor:
                  'pointer',
                fontWeight:
                  selectedSem ===
                  sem
                    ? '600'
                    : '400',
              }}
            >
              Sem {sem}
            </button>

          )
        )}

      </div>


      {Object.values(
        byCourse
      ).some(
        (c) =>
          (c.present /
            c.total) *
            100 <
          75
      ) && (

        <div
          style={{
            background:
              '#fff3cd',
            border:
              '1px solid #ffc107',
            padding:
              '12px',
            borderRadius:
              '8px',
            marginBottom:
              '16px',
            color:
              '#856404',
          }}
        >
          ⚠️{' '}

          <b>
            Warning:
          </b>{' '}

          One or more subjects
          have attendance below
          75%.

        </div>

      )}


      <div
        className="student-info-card"
        style={styles.infoCard}
      >

        <div className="student-table-wrapper">

          <table className="student-table">

            <thead>

              <tr
                style={{
                  background:
                    '#1a3c6e',
                  color:
                    'white',
                }}
              >

                {[
                  'Course',
                  'Present',
                  'Total',
                  'Percentage',
                  'Status',
                ].map(
                  (h) => (

                    <th
                      key={h}
                      style={{
                        padding:
                          '10px',
                        textAlign:
                          'left',
                      }}
                    >
                      {h}
                    </th>

                  )
                )}

              </tr>

            </thead>


            <tbody>

              {Object.entries(
                byCourse
              ).map(
                (
                  [
                    courseId,
                    data,
                  ],
                  i
                ) => {

                  const pct = (
                    (data.present /
                      data.total) *
                    100
                  ).toFixed(1);


                  return (

                    <tr
                      key={
                        courseId
                      }
                      style={{
                        background:
                          i % 2 === 0
                            ? '#f8f9fa'
                            : 'white',
                      }}
                    >

                      <td
                        style={
                          styles.td
                        }
                      >
                        CS
                        {String(
                          courseId
                        ).padStart(
                          3,
                          '0'
                        )}
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {
                          data.present
                        }
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {
                          data.total
                        }
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >

                        <b
                          style={{
                            color:
                              pct >=
                              75
                                ? '#22c55e'
                                : '#ef4444',
                          }}
                        >
                          {pct}%
                        </b>

                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >

                        <span
                          style={{
                            padding:
                              '4px 10px',
                            borderRadius:
                              '12px',
                            fontSize:
                              '12px',
                            background:
                              pct >=
                              75
                                ? '#d4edda'
                                : '#f8d7da',
                            color:
                              pct >=
                              75
                                ? '#155724'
                                : '#721c24',
                          }}
                        >
                          {pct >=
                          75
                            ? '✅ Good'
                            : '⚠️ Critical'}
                        </span>

                      </td>

                    </tr>

                  );

                }
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );
}


/* =====================================================
   EXAM SCHEDULE
   ===================================================== */

function ExamSchedule({
  student,
}) {

  const exams = [

    {
      code: 'CS301',
      name: 'Operating Systems',
      date: '2025-05-10',
      time: '10:00 AM',
      room: 'Hall A',
    },

    {
      code: 'CS302',
      name: 'Database Management',
      date: '2025-05-12',
      time: '10:00 AM',
      room: 'Hall B',
    },

    {
      code: 'MA301',
      name: 'Probability Stats',
      date: '2025-05-14',
      time: '02:00 PM',
      room: 'Hall C',
    },

  ];


  return (

    <div>

      <h2
        className="student-page-title"
        style={styles.pageTitle}
      >
        Exam Schedule —
        Semester{' '}
        {student?.currentSemester}
      </h2>


      <div
        className="student-info-card"
        style={styles.infoCard}
      >

        <div className="student-table-wrapper">

          <table className="student-table">

            <thead>

              <tr
                style={{
                  background:
                    '#1a3c6e',
                  color:
                    'white',
                }}
              >

                {[
                  'Course Code',
                  'Course Name',
                  'Date',
                  'Time',
                  'Room',
                ].map(
                  (h) => (

                    <th
                      key={h}
                      style={{
                        padding:
                          '10px',
                        textAlign:
                          'left',
                      }}
                    >
                      {h}
                    </th>

                  )
                )}

              </tr>

            </thead>


            <tbody>

              {exams.map(
                (e, i) => (

                  <tr
                    key={
                      e.code
                    }
                    style={{
                      background:
                        i % 2 === 0
                          ? '#f8f9fa'
                          : 'white',
                    }}
                  >

                    <td
                      style={
                        styles.td
                      }
                    >
                      {e.code}
                    </td>

                    <td
                      style={
                        styles.td
                      }
                    >
                      {e.name}
                    </td>

                    <td
                      style={
                        styles.td
                      }
                    >
                      {e.date}
                    </td>

                    <td
                      style={
                        styles.td
                      }
                    >
                      {e.time}
                    </td>

                    <td
                      style={
                        styles.td
                      }
                    >
                      {e.room}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );
}


/* =====================================================
   FEES
   ===================================================== */

function FeesSection({
  fees,
}) {

  const total =
    fees.reduce(
      (a, f) =>
        a +
        (Number(
          f.amount
        ) || 0),
      0
    );


  const paid =
    fees
      .filter(
        (f) => f.paid
      )
      .reduce(
        (a, f) =>
          a +
          (Number(
            f.amount
          ) || 0),
        0
      );


  const pending =
    total - paid;


  return (

    <div>

      <h2
        className="student-page-title"
        style={styles.pageTitle}
      >
        Fees Details
      </h2>


      <div className="student-grid-3">

        <div
          className="student-stat-box"
          style={{
            ...styles.statBox,
            background:
              '#1a3c6e',
          }}
        >

          <h2>
            ₹
            {total.toLocaleString()}
          </h2>

          <p>
            Total Fees
          </p>

        </div>


        <div
          className="student-stat-box"
          style={{
            ...styles.statBox,
            background:
              '#0f6e3c',
          }}
        >

          <h2>
            ₹
            {paid.toLocaleString()}
          </h2>

          <p>
            Paid
          </p>

        </div>


        <div
          className="student-stat-box"
          style={{
            ...styles.statBox,
            background:
              pending > 0
                ? '#8b1a1a'
                : '#0f6e3c',
          }}
        >

          <h2>
            ₹
            {pending.toLocaleString()}
          </h2>

          <p>
            Pending
          </p>

        </div>

      </div>


      <div
        className="student-info-card"
        style={{
          ...styles.infoCard,
          marginTop:
            '20px',
        }}
      >

        <div className="student-table-wrapper">

          <table className="student-table">

            <thead>

              <tr
                style={{
                  background:
                    '#1a3c6e',
                  color:
                    'white',
                }}
              >

                {[
                  'Semester',
                  'Amount',
                  'Due Date',
                  'Paid Date',
                  'Status',
                ].map(
                  (h) => (

                    <th
                      key={h}
                      style={{
                        padding:
                          '10px',
                        textAlign:
                          'left',
                      }}
                    >
                      {h}
                    </th>

                  )
                )}

              </tr>

            </thead>


            <tbody>

              {fees.map(
                (f, i) => (

                  <tr
                    key={
                      f.id
                    }
                    style={{
                      background:
                        i % 2 === 0
                          ? '#f8f9fa'
                          : 'white',
                    }}
                  >

                    <td
                      style={
                        styles.td
                      }
                    >
                      Semester{' '}
                      {
                        f.semester
                      }
                    </td>

                    <td
                      style={
                        styles.td
                      }
                    >
                      ₹
                      {Number(
                        f.amount ||
                          0
                      ).toLocaleString()}
                    </td>

                    <td
                      style={
                        styles.td
                      }
                    >
                      {f.dueDate ||
                        '—'}
                    </td>

                    <td
                      style={
                        styles.td
                      }
                    >
                      {f.paidDate ||
                        '—'}
                    </td>

                    <td
                      style={
                        styles.td
                      }
                    >

                      <span
                        style={{
                          padding:
                            '4px 10px',
                          borderRadius:
                            '12px',
                          fontSize:
                            '12px',
                          background:
                            f.paid
                              ? '#d4edda'
                              : '#f8d7da',
                          color:
                            f.paid
                              ? '#155724'
                              : '#721c24',
                        }}
                      >
                        {f.paid
                          ? '✅ Paid'
                          : '❌ Pending'}
                      </span>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );
}


/* =====================================================
   PLACEMENT
   ===================================================== */

function PlacementSection({
  placement,
  student,
}) {

  return (

    <div>

      <h2
        className="student-page-title"
        style={styles.pageTitle}
      >
        Placement Details
      </h2>


      {placement.length === 0 ? (

        <div
          className="student-info-card"
          style={styles.infoCard}
        >

          <p
            style={{
              color:
                '#666',
            }}
          >
            No placement offers
            recorded yet.
          </p>


          <div
            style={{
              marginTop:
                '16px',
              padding:
                '16px',
              background:
                '#f0f4ff',
              borderRadius:
                '8px',
            }}
          >

            <b>
              💡 Placement
              Eligibility based
              on CGPA{' '}
              {student?.cgpa}:
            </b>


            <ul
              style={{
                marginTop:
                  '8px',
                color:
                  '#444',
              }}
            >

              {student?.cgpa >=
              8.5 ? (

                <>
                  <li>
                    Google,
                    Microsoft,
                    Amazon
                  </li>

                  <li>
                    Top product
                    companies
                  </li>
                </>

              ) : student?.cgpa >=
                7.0 ? (

                <>
                  <li>
                    Accenture,
                    IBM,
                    Tech Mahindra
                  </li>

                  <li>
                    Mid-tier IT
                    companies
                  </li>
                </>

              ) : (

                <>
                  <li>
                    TCS,
                    Infosys,
                    Wipro
                  </li>

                  <li>
                    Service-based
                    companies
                  </li>
                </>

              )}

            </ul>

          </div>

        </div>

      ) : (

        <div
          style={{
            display:
              'flex',
            flexDirection:
              'column',
            gap:
              '16px',
          }}
        >

          {placement.map(
            (p, i) => (

              <div
                key={i}
                className="student-info-card"
                style={{
                  ...styles.infoCard,
                  borderLeft:
                    `4px solid ${
                      p.offerType ===
                      'Full-Time'
                        ? '#22c55e'
                        : '#f59e0b'
                    }`,
                }}
              >

                <div
                  style={{
                    display:
                      'flex',
                    justifyContent:
                      'space-between',
                    alignItems:
                      'center',
                    flexWrap:
                      'wrap',
                    gap:
                      '12px',
                  }}
                >

                  <div>

                    <h3
                      style={{
                        color:
                          '#1a3c6e',
                        margin:
                          '0 0 8px',
                      }}
                    >
                      🏢{' '}
                      {
                        p.companyName
                      }
                    </h3>

                    <p>
                      Role:{' '}
                      {p.role}
                    </p>

                    <p>
                      Year:{' '}
                      {p.placedYear}
                    </p>

                  </div>


                  <div
                    style={{
                      textAlign:
                        'right',
                    }}
                  >

                    <div
                      style={{
                        fontSize:
                          '24px',
                        fontWeight:
                          'bold',
                        color:
                          '#22c55e',
                      }}
                    >
                      ₹
                      {
                        p.packageLpa
                      }{' '}
                      LPA
                    </div>

                    <span
                      style={{
                        padding:
                          '4px 12px',
                        borderRadius:
                          '12px',
                        fontSize:
                          '12px',
                        background:
                          p.offerType ===
                          'Full-Time'
                            ? '#d4edda'
                            : '#fff3cd',
                        color:
                          p.offerType ===
                          'Full-Time'
                            ? '#155724'
                            : '#856404',
                      }}
                    >
                      {
                        p.offerType
                      }
                    </span>

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>

  );
}


/* =====================================================
   MENTOR
   ===================================================== */

function MentorSection({
  mentor,
  meetings,
}) {

  return (

    <div>

      <h2
        className="student-page-title"
        style={styles.pageTitle}
      >
        Mentor Details
      </h2>


      <div
        className="student-info-card"
        style={styles.infoCard}
      >

        {mentor ? (

          <table
            style={styles.infoTable}
          >

            <tbody>

              <tr
                style={
                  styles.infoRow
                }
              >

                <td
                  style={
                    styles.infoLabel
                  }
                >
                  Faculty ID
                </td>

                <td
                  style={
                    styles.infoValue
                  }
                >
                  {mentor.facultyId ||
                    '—'}
                </td>

              </tr>


              <tr
                style={
                  styles.infoRow
                }
              >

                <td
                  style={
                    styles.infoLabel
                  }
                >
                  Assigned On
                </td>

                <td
                  style={
                    styles.infoValue
                  }
                >
                  {mentor.assignedAt
                    ?.split('T')[0] ||
                    '—'}
                </td>

              </tr>

            </tbody>

          </table>

        ) : (

          <p>
            No mentor assigned yet.
          </p>

        )}

      </div>


      <h3
        style={{
          color:
            '#1a3c6e',
          marginTop:
            '24px',
        }}
      >
        Mentor Meetings
      </h3>


      {meetings.length === 0 ? (

        <div
          className="student-info-card"
          style={styles.infoCard}
        >
          <p>
            No meetings recorded
            yet.
          </p>
        </div>

      ) : (

        <div
          className="student-info-card"
          style={styles.infoCard}
        >

          <div className="student-table-wrapper">

            <table className="student-table">

              <thead>

                <tr
                  style={{
                    background:
                      '#1a3c6e',
                    color:
                      'white',
                  }}
                >

                  {[
                    'Date',
                    'Notes',
                    'Attended',
                  ].map(
                    (h) => (

                      <th
                        key={h}
                        style={{
                          padding:
                            '10px',
                          textAlign:
                            'left',
                        }}
                      >
                        {h}
                      </th>

                    )
                  )}

                </tr>

              </thead>


              <tbody>

                {meetings.map(
                  (m, i) => (

                    <tr
                      key={
                        m.id
                      }
                      style={{
                        background:
                          i % 2 === 0
                            ? '#f8f9fa'
                            : 'white',
                      }}
                    >

                      <td
                        style={
                          styles.td
                        }
                      >
                        {
                          m.meetingDate
                        }
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {m.notes ||
                          '—'}
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >

                        <span
                          style={{
                            padding:
                              '4px 10px',
                            borderRadius:
                              '12px',
                            fontSize:
                              '12px',
                            background:
                              m.attended
                                ? '#d4edda'
                                : '#f8d7da',
                            color:
                              m.attended
                                ? '#155724'
                                : '#721c24',
                          }}
                        >
                          {m.attended
                            ? '✅ Yes'
                            : '❌ No'}
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>

  );
}


/* =====================================================
   GRIEVANCE
   ===================================================== */

function GrievanceSection({
  grievances,
  student,
  setGrievances,
}) {

  const [form, setForm] =
    useState({
      title: '',
      description: '',
      against:
        'FACULTY',
    });


  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  const [
    success,
    setSuccess,
  ] = useState('');


  const handleSubmit =
    async () => {

      if (
        !form.title ||
        !form.description
      ) {

        return;

      }


      setSubmitting(true);


      try {

        const res =
          await raiseGrievance(
            student.userId,
            form
          );


        setGrievances(
          (prev) => [
            res.data,
            ...prev,
          ]
        );


        setForm({
          title: '',
          description: '',
          against:
            'FACULTY',
        });


        setSuccess(
          'Grievance submitted successfully!'
        );


        setTimeout(
          () =>
            setSuccess(''),
          3000
        );


      } catch (err) {

        console.error(
          'Failed to submit grievance:',
          err
        );

      } finally {

        setSubmitting(
          false
        );

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

      <h2
        className="student-page-title"
        style={styles.pageTitle}
      >
        Grievance Portal
      </h2>


      <div
        className="student-info-card"
        style={styles.infoCard}
      >

        <h3
          style={{
            color:
              '#1a3c6e',
            marginTop: 0,
          }}
        >
          📝 Raise a New
          Grievance
        </h3>


        <div
          style={{
            display:
              'flex',
            flexDirection:
              'column',
            gap:
              '12px',
          }}
        >

          <select
            value={
              form.against
            }
            onChange={(e) =>
              setForm(
                (p) => ({
                  ...p,
                  against:
                    e.target.value,
                })
              )
            }
            className="student-input"
            style={
              styles.input
            }
          >

            <option value="FACULTY">
              Against Faculty
            </option>

            <option value="ADMIN">
              Against Admin
            </option>

          </select>


          <input
            className="student-input"
            style={
              styles.input
            }
            placeholder="Title"
            value={
              form.title
            }
            onChange={(e) =>
              setForm(
                (p) => ({
                  ...p,
                  title:
                    e.target.value,
                })
              )
            }
          />


          <textarea
            className="student-input"
            style={{
              ...styles.input,
              height:
                '100px',
              resize:
                'vertical',
            }}
            placeholder="Describe your grievance in detail..."
            value={
              form.description
            }
            onChange={(e) =>
              setForm(
                (p) => ({
                  ...p,
                  description:
                    e.target.value,
                })
              )
            }
          />


          <button
            onClick={
              handleSubmit
            }
            disabled={
              submitting
            }
            style={{
              ...styles.submitBtn,
              opacity:
                submitting
                  ? 0.7
                  : 1,
            }}
          >
            {submitting
              ? 'Submitting...'
              : 'Submit Grievance'}
          </button>


          {success && (

            <p
              style={{
                color:
                  '#22c55e',
                fontWeight:
                  'bold',
              }}
            >
              ✅ {success}
            </p>

          )}

        </div>

      </div>


      <h3
        style={{
          color:
            '#1a3c6e',
        }}
      >
        My Grievances
      </h3>


      {grievances.length === 0 ? (

        <div
          className="student-info-card"
          style={styles.infoCard}
        >

          <p>
            No grievances
            raised yet.
          </p>

        </div>

      ) : (

        <div
          style={{
            display:
              'flex',
            flexDirection:
              'column',
            gap:
              '12px',
          }}
        >

          {grievances.map(
            (g, i) => {

              const color =
                statusColor[
                  g.status
                ] ||
                '#888';


              return (

                <div
                  key={i}
                  className="student-info-card"
                  style={{
                    ...styles.infoCard,
                    borderLeft:
                      `4px solid ${color}`,
                  }}
                >

                  <div
                    style={{
                      display:
                        'flex',
                      justifyContent:
                        'space-between',
                      alignItems:
                        'center',
                      gap:
                        '10px',
                      flexWrap:
                        'wrap',
                    }}
                  >

                    <h4
                      style={{
                        margin:
                          '0 0 8px',
                        color:
                          '#1a3c6e',
                      }}
                    >
                      {
                        g.title
                      }
                    </h4>


                    <span
                      style={{
                        padding:
                          '4px 12px',
                        borderRadius:
                          '12px',
                        fontSize:
                          '12px',
                        background:
                          `${color}20`,
                        color:
                          color,
                        fontWeight:
                          'bold',
                      }}
                    >
                      {
                        g.status
                      }
                    </span>

                  </div>


                  <p
                    style={{
                      color:
                        '#555',
                      margin:
                        '0 0 8px',
                      fontSize:
                        '13px',
                    }}
                  >
                    {
                      g.description
                    }
                  </p>


                  {g.response && (

                    <div
                      style={{
                        padding:
                          '10px',
                        background:
                          '#f0f4ff',
                        borderRadius:
                          '6px',
                        fontSize:
                          '13px',
                      }}
                    >
                      <b>
                        Response:
                      </b>{' '}
                      {
                        g.response
                      }
                    </div>

                  )}


                  <p
                    style={{
                      color:
                        '#999',
                      fontSize:
                        '12px',
                      margin:
                        '8px 0 0',
                    }}
                  >
                    Against:{' '}
                    {
                      g.against
                    }{' '}
                    ·{' '}
                    {
                      g.createdAt
                        ?.split(
                          'T'
                        )[0]
                    }
                  </p>

                </div>

              );

            }
          )}

        </div>

      )}

    </div>

  );
}


/* =====================================================
   NOTIFICATIONS
   ===================================================== */

function NotificationsSection({
  notifications,
}) {

  return (

    <div>

      <h2
        className="student-page-title"
        style={styles.pageTitle}
      >
        Notifications
      </h2>


      {notifications.length === 0 ? (

        <div
          className="student-info-card"
          style={styles.infoCard}
        >

          <p>
            No notifications
            yet.
          </p>

        </div>

      ) : (

        <div
          style={{
            display:
              'flex',
            flexDirection:
              'column',
            gap:
              '12px',
          }}
        >

          {notifications.map(
            (n, i) => (

              <div
                key={i}
                className="student-info-card"
                style={{
                  ...styles.infoCard,
                  borderLeft:
                    `4px solid ${
                      n.isRead
                        ? '#ddd'
                        : '#1a3c6e'
                    }`,
                  opacity:
                    n.isRead
                      ? 0.7
                      : 1,
                }}
              >

                <div
                  style={{
                    display:
                      'flex',
                    justifyContent:
                      'space-between',
                    gap:
                      '10px',
                  }}
                >

                  <h4
                    style={{
                      margin:
                        '0 0 6px',
                      color:
                        '#1a3c6e',
                    }}
                  >
                    {
                      n.title
                    }
                  </h4>


                  {!n.isRead && (

                    <span
                      style={{
                        padding:
                          '2px 8px',
                        background:
                          '#1a3c6e',
                        color:
                          'white',
                        borderRadius:
                          '12px',
                        fontSize:
                          '11px',
                      }}
                    >
                      NEW
                    </span>

                  )}

                </div>


                <p
                  style={{
                    color:
                      '#555',
                    margin:
                      '0 0 6px',
                    fontSize:
                      '13px',
                  }}
                >
                  {
                    n.message
                  }
                </p>


                <p
                  style={{
                    color:
                      '#999',
                    fontSize:
                      '12px',
                    margin: 0,
                  }}
                >
                  {
                    n.createdAt
                      ?.split(
                        'T'
                      )[0]
                  }
                </p>

              </div>

            )
          )}

        </div>

      )}

    </div>

  );
}


/* =====================================================
   AI REPORT
   ===================================================== */

function AIReport({
  student,
  marks,
  attendance,
}) {

  const [report, setReport] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [generated, setGenerated] =
    useState(false);


  const semesters = [
    ...new Set(
      marks
        .map(
          (m) => m.semester
        )
        .filter(
          (s) => s != null
        )
    ),
  ].sort(
    (a, b) => a - b
  );


  const defaultSem1 =
    semesters[0] ||
    student?.currentSemester ||
    1;


  const defaultSem2 =
    semesters[1] ||
    semesters[0] ||
    student?.currentSemester ||
    1;


  const [sem1, setSem1] =
    useState(defaultSem1);

  const [sem2, setSem2] =
    useState(defaultSem2);


  const getMarksBySem =
    (sem) =>
      marks.filter(
        (m) =>
          m.semester ===
          sem
      );


  const getAttendancePct =
    (sem) => {

      const filtered =
        attendance.filter(
          (a) =>
            a.semester ===
            sem
        );


      const present =
        filtered.filter(
          (a) =>
            a.status ===
            'PRESENT'
        ).length;


      return filtered.length >
        0
        ? (
            (present /
              filtered.length) *
            100
          ).toFixed(1)
        : 0;

    };


  const generateReport =
    async () => {

      setLoading(true);

      setError('');

      setReport(null);


      const sem1Marks =
        getMarksBySem(
          sem1
        );

      const sem2Marks =
        getMarksBySem(
          sem2
        );


      const prompt = `
You are an academic counselor AI for Indian engineering students.

Analyze this student's REAL performance data.

Return ONLY valid JSON.

Student:
- Name: ${student?.name}
- CGPA: ${student?.cgpa}
- Branch: ${student?.branch}
- Current Semester: ${student?.currentSemester}

Semester ${sem1} Marks:
${sem1Marks
  .map(
    (m) =>
      `Course ${m.courseId}: Quiz1=${m.quiz1}, Quiz2=${m.quiz2}, Mid=${m.midExam}/50, End=${m.endExam}/100, Total=${m.total}/100, Grade=${m.grade}`
  )
  .join('\n')}

Attendance Sem ${sem1}: ${getAttendancePct(
        sem1
      )}%

Semester ${sem2} Marks:
${sem2Marks
  .map(
    (m) =>
      `Course ${m.courseId}: Quiz1=${m.quiz1}, Quiz2=${m.quiz2}, Mid=${m.midExam}/50, End=${m.endExam}/100, Total=${m.total}/100, Grade=${m.grade}`
  )
  .join('\n')}

Attendance Sem ${sem2}: ${getAttendancePct(
        sem2
      )}%

COMPANY RULES:
- CGPA 6.0-6.9: TCS, Infosys, Wipro, Cognizant, Capgemini
- CGPA 7.0-7.9: Accenture, IBM, Tech Mahindra, Mindtree, LTIMindtree
- CGPA 8.0-8.9: Amazon, Microsoft, Flipkart, Adobe, Paytm
- CGPA 9.0+: Google, Microsoft, Apple, Goldman Sachs, DE Shaw

Return this exact JSON structure:

{
  "summary": "honest assessment using actual numbers and student name",
  "semesterComparison": "specific comparison between both semesters",
  "strengths": [],
  "weaknesses": [],
  "subjectInsights": [],
  "attendanceWarnings": [],
  "placementNow": [],
  "placementIfImproved": [],
  "actionPlan": [],
  "motivationalNote": ""
}
`;


      try {

        const Groq =
          (
            await import(
              'groq-sdk'
            )
          ).default;


        const groq =
          new Groq({

            apiKey:
              process.env
                .REACT_APP_GROQ_API_KEY,

            dangerouslyAllowBrowser:
              true,

          });


        const completion =
          await groq.chat.completions.create({

            model:
              'llama-3.1-8b-instant',

            messages: [

              {
                role:
                  'user',

                content:
                  prompt,

              },

            ],

            temperature:
              0.3,

            max_tokens:
              1500,

          });


        const raw =
          completion
            .choices[0]
            ?.message
            ?.content ||
          '{}';


        const clean =
          raw
            .replace(
              /```json|```/g,
              ''
            )
            .trim();


        const parsed =
          JSON.parse(
            clean
          );


        setReport(
          parsed
        );

        setGenerated(
          true
        );


      } catch (err) {

        console.error(
          'AI REPORT ERROR:',
          err
        );

        setError(
          'Failed to generate report. Check your API key.'
        );

      } finally {

        setLoading(
          false
        );

      }

    };


  const priorityColor = {

    high: '#ef4444',

    medium: '#f59e0b',

    low: '#22c55e',

  };


  const priorityBg = {

    high: '#fef2f2',

    medium: '#fffbeb',

    low: '#f0fdf4',

  };


  return (

    <div>

      <h2
        className="student-page-title"
        style={styles.pageTitle}
      >
        🤖 AI Performance
        Report
      </h2>


      <div
        className="student-info-card"
        style={{
          ...styles.infoCard,
          marginBottom:
            '20px',
        }}
      >

        <h3
          style={{
            color:
              '#1a3c6e',
            margin:
              '0 0 16px',
          }}
        >
          📊 Compare Semesters
        </h3>


        <div
          style={{
            display:
              'flex',
            gap:
              '24px',
            alignItems:
              'center',
            flexWrap:
              'wrap',
          }}
        >

          <div>

            <label
              style={{
                fontSize:
                  '13px',
                color:
                  '#666',
                display:
                  'block',
                marginBottom:
                  '6px',
              }}
            >
              From Semester
            </label>

            <select
              value={
                sem1
              }
              onChange={(e) =>
                setSem1(
                  Number(
                    e.target.value
                  )
                )
              }
              className="student-input"
              style={
                styles.input
              }
            >

              {semesters.map(
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


          <div
            style={{
              fontSize:
                '24px',
              marginTop:
                '16px',
            }}
          >
            →
          </div>


          <div>

            <label
              style={{
                fontSize:
                  '13px',
                color:
                  '#666',
                display:
                  'block',
                marginBottom:
                  '6px',
              }}
            >
              To Semester
            </label>

            <select
              value={
                sem2
              }
              onChange={(e) =>
                setSem2(
                  Number(
                    e.target.value
                  )
                )
              }
              className="student-input"
              style={
                styles.input
              }
            >

              {semesters.map(
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

        </div>


        <div className="student-grid-2">

          <SemesterSummary
            semester={
              sem1
            }
            marks={
              getMarksBySem(
                sem1
              )
            }
            attendance={
              getAttendancePct(
                sem1
              )
            }
            color="#1a3c6e"
          />


          <SemesterSummary
            semester={
              sem2
            }
            marks={
              getMarksBySem(
                sem2
              )
            }
            attendance={
              getAttendancePct(
                sem2
              )
            }
            color="#0f6e3c"
          />

        </div>

      </div>


      {!generated && (

        <div
          style={{
            textAlign:
              'center',
            marginBottom:
              '24px',
          }}
        >

          <button
            onClick={
              generateReport
            }
            disabled={
              loading
            }
            style={{
              padding:
                '16px 40px',
              background:
                loading
                  ? '#94a3b8'
                  : 'linear-gradient(135deg, #1a3c6e, #e94560)',
              color:
                'white',
              border:
                'none',
              borderRadius:
                '12px',
              fontSize:
                '16px',
              fontWeight:
                '700',
              cursor:
                loading
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            {loading
              ? '⏳ AI is analyzing your real data...'
              : '✨ Generate Personalized AI Report'}
          </button>

        </div>

      )}


      {error && (

        <div
          style={{
            padding:
              '14px',
            background:
              '#fef2f2',
            border:
              '1px solid #fecaca',
            borderRadius:
              '10px',
            color:
              '#dc2626',
            marginBottom:
              '16px',
          }}
        >
          ❌ {error}
        </div>

      )}


      {report && (

        <div
          style={{
            display:
              'flex',
            flexDirection:
              'column',
            gap:
              '20px',
          }}
        >

          <div
            style={{
              background:
                'linear-gradient(135deg, #1a3c6e, #0f3460)',
              borderRadius:
                '16px',
              padding:
                '28px',
              color:
                'white',
            }}
          >

            <h3>
              📊 Overall Assessment
            </h3>

            <p
              style={{
                lineHeight:
                  '1.8',
              }}
            >
              {
                report.summary
              }
            </p>

            <div
              style={{
                padding:
                  '12px 16px',
                background:
                  'rgba(255,255,255,0.15)',
                borderRadius:
                  '8px',
              }}
            >
              <b>
                📈 Semester
                Comparison:
              </b>{' '}
              {
                report.semesterComparison
              }
            </div>

          </div>


          <div className="student-grid-2">

            <ReportList
              title="💪 Strengths"
              items={
                report.strengths
              }
              color="#15803d"
              background="#f0fdf4"
            />


            <ReportList
              title="⚠️ Needs Attention"
              items={
                report.weaknesses
              }
              color="#dc2626"
              background="#fef2f2"
            />

          </div>


          <div
            className="student-info-card"
            style={styles.infoCard}
          >

            <h3
              style={{
                color:
                  '#1a3c6e',
              }}
            >
              🔍 Subject
              Insights
            </h3>


            {report.subjectInsights?.map(
              (s, i) => (

                <div
                  key={i}
                  style={{
                    padding:
                      '14px',
                    borderRadius:
                      '10px',
                    marginBottom:
                      '10px',
                    background:
                      priorityBg[
                        s.priority
                      ] ||
                      '#f8f9fa',
                    display:
                      'flex',
                    gap:
                      '14px',
                  }}
                >

                  <div
                    style={{
                      padding:
                        '3px 10px',
                      borderRadius:
                        '999px',
                      fontSize:
                        '11px',
                      fontWeight:
                        'bold',
                      background:
                        priorityColor[
                          s.priority
                        ] ||
                        '#888',
                      color:
                        'white',
                    }}
                  >
                    {
                      s.priority?.toUpperCase()
                    }
                  </div>

                  <div>

                    <b
                      style={{
                        color:
                          '#1a3c6e',
                      }}
                    >
                      Course{' '}
                      {
                        s.courseId
                      }
                    </b>

                    <p>
                      {
                        s.insight
                      }
                    </p>

                  </div>

                </div>

              )
            )}

          </div>


          {report.attendanceWarnings
            ?.length > 0 && (

            <div
              style={{
                background:
                  '#fffbeb',
                border:
                  '1px solid #fcd34d',
                borderRadius:
                  '12px',
                padding:
                  '20px',
              }}
            >

              <h3>
                📅 Attendance
                Warnings
              </h3>

              {report.attendanceWarnings.map(
                (w, i) => (

                  <p
                    key={i}
                    style={{
                      color:
                        '#78350f',
                    }}
                  >
                    ⚠️ {w}
                  </p>

                )
              )}

            </div>

          )}


          <div className="student-grid-2">

            <CompanyList
              title="🏢 Target Now"
              companies={
                report.placementNow
              }
              background="#eff6ff"
              color="#1e40af"
            />


            <CompanyList
              title="🚀 After Improvement"
              companies={
                report.placementIfImproved
              }
              background="#f0fdf4"
              color="#166534"
            />

          </div>


          <div
            style={{
              background:
                'white',
              borderRadius:
                '12px',
              padding:
                '24px',
            }}
          >

            <h3
              style={{
                color:
                  '#1a3c6e',
              }}
            >
              🎯 Action Plan
            </h3>


            {report.actionPlan?.map(
              (a, i) => (

                <div
                  key={i}
                  style={{
                    display:
                      'flex',
                    gap:
                      '16px',
                    padding:
                      '16px',
                    background:
                      '#f8faff',
                    border:
                      '1px solid #e0e7ff',
                    borderRadius:
                      '10px',
                    marginBottom:
                      '12px',
                  }}
                >

                  <div
                    style={{
                      width:
                        '36px',
                      height:
                        '36px',
                      borderRadius:
                        '50%',
                      background:
                        '#1a3c6e',
                      color:
                        'white',
                      display:
                        'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                      fontWeight:
                        'bold',
                    }}
                  >
                    {
                      a.step
                    }
                  </div>


                  <div>

                    <div
                      style={{
                        fontWeight:
                          '600',
                        color:
                          '#1a3c6e',
                      }}
                    >
                      {
                        a.action
                      }
                    </div>

                    <span
                      style={{
                        fontSize:
                          '12px',
                        color:
                          'white',
                        background:
                          '#6366f1',
                        padding:
                          '2px 10px',
                        borderRadius:
                          '999px',
                      }}
                    >
                      📅{' '}
                      {
                        a.deadline
                      }
                    </span>

                  </div>

                </div>

              )
            )}

          </div>


          <div
            style={{
              background:
                'linear-gradient(135deg, #e94560, #1a3c6e)',
              borderRadius:
                '12px',
              padding:
                '24px',
              color:
                'white',
              textAlign:
                'center',
            }}
          >

            <div
              style={{
                fontSize:
                  '28px',
              }}
            >
              💬
            </div>

            <p>
              "{report.motivationalNote}"
            </p>

          </div>


          <div
            style={{
              textAlign:
                'center',
              paddingBottom:
                '24px',
            }}
          >

            <button
              onClick={() => {

                setGenerated(
                  false
                );

                setReport(
                  null
                );

              }}
              style={{
                padding:
                  '10px 24px',
                background:
                  'transparent',
                border:
                  '2px solid #1a3c6e',
                color:
                  '#1a3c6e',
                borderRadius:
                  '8px',
                cursor:
                  'pointer',
              }}
            >
              🔄 Regenerate
              Report
            </button>

          </div>

        </div>

      )}

    </div>

  );
}


/* =====================================================
   SMALL AI COMPONENTS
   ===================================================== */

function SemesterSummary({
  semester,
  marks,
  attendance,
  color,
}) {

  const average =
    marks.length > 0
      ? (
          marks.reduce(
            (sum, m) =>
              sum +
              (Number(
                m.total
              ) || 0),
            0
          ) /
          marks.length
        ).toFixed(1)
      : 0;


  return (

    <div
      style={{
        background:
          '#f8f9fa',
        padding:
          '16px',
        borderRadius:
          '8px',
        marginTop:
          '16px',
      }}
    >

      <b
        style={{
          color,
        }}
      >
        Semester{' '}
        {semester}
      </b>

      <p
        style={{
          fontSize:
            '13px',
          color:
            '#555',
        }}
      >
        Subjects:{' '}
        {marks.length}
        {' | '}
        Attendance:{' '}
        {attendance}%
        {' | '}
        Avg:{' '}
        {average}%
      </p>

    </div>

  );
}


function ReportList({
  title,
  items,
  color,
  background,
}) {

  return (

    <div
      style={{
        background,
        borderRadius:
          '12px',
        padding:
          '20px',
      }}
    >

      <h3
        style={{
          color,
        }}
      >
        {title}
      </h3>


      {items?.map(
        (item, i) => (

          <div
            key={i}
            style={{
              display:
                'flex',
              gap:
                '10px',
              marginBottom:
                '10px',
              fontSize:
                '13px',
            }}
          >

            <span
              style={{
                color,
              }}
            >
              ✓
            </span>

            <span>
              {item}
            </span>

          </div>

        )
      )}

    </div>

  );
}


function CompanyList({
  title,
  companies,
  background,
  color,
}) {

  return (

    <div
      style={{
        background:
          'white',
        borderRadius:
          '12px',
        padding:
          '20px',
        boxShadow:
          '0 2px 12px rgba(0,0,0,0.08)',
      }}
    >

      <h3
        style={{
          color:
            '#1a3c6e',
        }}
      >
        {title}
      </h3>


      {companies?.map(
        (company, i) => (

          <div
            key={i}
            style={{
              padding:
                '10px 14px',
              background,
              borderRadius:
                '8px',
              marginBottom:
                '8px',
              color,
              fontWeight:
                '500',
              fontSize:
                '14px',
            }}
          >
            🏷️ {company}
          </div>

        )
      )}

    </div>

  );
}


/* =====================================================
   STYLES
   ===================================================== */

const styles = {

  navLeft: {
    display:
      'flex',
    alignItems:
      'center',
    gap:
      '12px',
  },

  logo: {
    fontSize:
      '32px',
  },

  uniName: {
    fontWeight:
      'bold',
    fontSize:
      '16px',
  },

  uniSub: {
    fontSize:
      '12px',
    opacity:
      0.8,
  },

  navRight: {
    display:
      'flex',
    alignItems:
      'center',
    gap:
      '16px',
  },

  welcome: {
    fontSize:
      '14px',
  },

  logoutBtn: {
    padding:
      '6px 14px',
    background:
      '#e94560',
    color:
      'white',
    border:
      'none',
    borderRadius:
      '4px',
    cursor:
      'pointer',
  },

  sidebarTitle: {
    background:
      '#1a3c6e',
    color:
      'white',
    padding:
      '12px 16px',
    fontWeight:
      'bold',
    fontSize:
      '13px',
  },

  menuItem: {
    padding:
      '10px 16px',
    cursor:
      'pointer',
    fontSize:
      '13px',
    borderBottom:
      '1px solid #eee',
    display:
      'flex',
    alignItems:
      'center',
    gap:
      '6px',
  },

  subMenuItem: {
    padding:
      '8px 16px 8px 32px',
    cursor:
      'pointer',
    fontSize:
      '12px',
    borderBottom:
      '1px solid #eee',
    color:
      '#333',
  },

  arrow: {
    fontSize:
      '10px',
    color:
      '#666',
  },

  pageTitle: {
    color:
      '#1a3c6e',
    borderBottom:
      '2px solid #1a3c6e',
    paddingBottom:
      '8px',
    marginBottom:
      '20px',
  },

  infoCard: {
    background:
      'white',
    borderRadius:
      '8px',
    padding:
      '24px',
    boxShadow:
      '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom:
      '16px',
  },

  statBox: {
    color:
      'white',
    padding:
      '20px',
    borderRadius:
      '8px',
    textAlign:
      'center',
  },

  infoTable: {
    width:
      '100%',
    borderCollapse:
      'collapse',
  },

  infoRow: {
    borderBottom:
      '1px solid #eee',
  },

  infoLabel: {
    padding:
      '10px',
    fontWeight:
      '600',
    color:
      '#555',
    width:
      '200px',
  },

  infoValue: {
    padding:
      '10px',
    color:
      '#333',
  },

  td: {
    padding:
      '10px',
    borderBottom:
      '1px solid #eee',
  },

  input: {
    padding:
      '10px 14px',
    borderRadius:
      '8px',
    border:
      '1px solid #ddd',
    fontSize:
      '14px',
    width:
      '100%',
    boxSizing:
      'border-box',
  },

  submitBtn: {
    padding:
      '12px 24px',
    background:
      '#1a3c6e',
    color:
      'white',
    border:
      'none',
    borderRadius:
      '8px',
    cursor:
      'pointer',
    fontSize:
      '15px',
    fontWeight:
      '600',
  },
};