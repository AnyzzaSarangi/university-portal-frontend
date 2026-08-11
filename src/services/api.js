import axios from 'axios';

const API = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api`,
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// ── AUTH ──────────────────────────────────────────
export const login = (email, password) =>
    API.post('/auth/login', { email, password });

// ── STUDENTS ──────────────────────────────────────
export const getStudents = () => API.get('/students');
export const getStudentById = (id) => API.get(`/students/${id}`);
export const getStudentByRollNo = (rollNo) => API.get(`/students/roll/${rollNo}`);
export const getStudentsBySemester = (sem) => API.get(`/students/semester/${sem}`);
export const getStudentsByBranch = (branch) => API.get(`/students/branch/${branch}`);
export const getTopStudents = (minCgpa = 8.0) => API.get(`/students/top?minCgpa=${minCgpa}`);
export const getTopStudentsByBranch = (branch) => API.get(`/students/top/branch/${branch}`);
export const suspendStudent = (id) => API.put(`/students/${id}/suspend`);
export const reinstateStudent = (id) => API.put(`/students/${id}/reinstate`);
export const updateStudent = (id, data) => API.put(`/students/${id}`, data);

// ── STUDENT SUB-RESOURCES ─────────────────────────
export const getStudentEducation = (id) => API.get(`/students/${id}/education`);
export const getStudentParents = (id) => API.get(`/students/${id}/parents`);
export const getStudentSocieties = (id) => API.get(`/students/${id}/societies`);
export const getStudentMarks = (id) => API.get(`/students/${id}/marks`);
export const getStudentMarksBySemester = (id, sem) => API.get(`/students/${id}/marks/${sem}`);
export const getStudentAttendance = (id) => API.get(`/students/${id}/attendance`);
export const getStudentAttendanceBySemester = (id, sem) =>
    API.get(`/students/${id}/attendance/${sem}`);
export const getAttendancePercentage = (id, courseId) =>
    API.get(`/students/${id}/attendance/percentage/${courseId}`);
export const getStudentFees = (id) => API.get(`/students/${id}/fees`);
export const getStudentPlacement = (id) => API.get(`/students/${id}/placement`);
export const getStudentGrievances = (id) => API.get(`/students/${id}/grievances`);
export const raiseGrievance = (id, data) =>
    API.post(`/students/${id}/grievances`, data);
export const getStudentNotifications = (id) =>
    API.get(`/students/${id}/notifications`);
export const getStudentMentor = (id) =>
    API.get(`/students/${id}/mentor`);
export const getStudentMentorMeetings = (id) =>
    API.get(`/students/${id}/mentor-meetings`);

// ── FACULTY ───────────────────────────────────────
export const getFaculty = () => API.get('/faculty');
export const getFacultyById = (id) => API.get(`/faculty/${id}`);
export const getFacultyMentees = (id) =>
    API.get(`/faculty/${id}/mentees/students`);
export const getFacultyCourses = (id) =>
    API.get(`/faculty/${id}/courses`);
export const getFacultyMeetings = (id) =>
    API.get(`/faculty/${id}/meetings`);
export const getFacultyGrievances = () =>
    API.get('/faculty/grievances');
export const respondGrievance = (id, data) =>
    API.put(`/faculty/grievances/${id}/respond`, data);
export const enterMarks = (data) =>
    API.post('/faculty/marks', data);
export const getCourseMarks = (courseId, sem) =>
    API.get(`/faculty/course/${courseId}/marks/${sem}`);
export const getTopStudentsForFaculty = () =>
    API.get('/faculty/top-students');
export const sendNotification = (data) =>
    API.post('/faculty/notifications', data);

// ── ADMIN ─────────────────────────────────────────
export const getAdminStats = () => API.get('/admin/stats');
export const getAllStudentsAdmin = () => API.get('/admin/students');
export const getStudentsByBranchAdmin = (branch) =>
    API.get(`/admin/students/branch/${branch}`);
export const getTopStudentsAdmin = () =>
    API.get('/admin/students/top');
export const getSuspendedStudents = () =>
    API.get('/admin/students/suspended');
export const suspendStudentAdmin = (id) =>
    API.put(`/admin/students/${id}/suspend`);
export const reinstateStudentAdmin = (id) =>
    API.put(`/admin/students/${id}/reinstate`);
export const getAllFacultyAdmin = () =>
    API.get('/admin/faculty');
export const promoteFaculty = (id, data) =>
    API.put(`/admin/faculty/${id}/promote`, data);
export const getAllGrievances = () =>
    API.get('/admin/grievances');
export const getOpenGrievances = () =>
    API.get('/admin/grievances/open');
export const resolveGrievance = (id, data) =>
    API.put(`/admin/grievances/${id}/resolve`, data);
export const rejectGrievance = (id, data) =>
    API.put(`/admin/grievances/${id}/reject`, data);
export const getAllPlacements = () =>
    API.get('/admin/placements');
export const getTopPlacements = () =>
    API.get('/admin/placements/top');
export const getUnpaidFees = () =>
    API.get('/admin/fees/unpaid');
export const broadcastNotification = (data) =>
    API.post('/admin/notifications/broadcast', data);

export default API;