import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import API from '../services/api';

export default function Login() {
  const [mode,     setMode]     = useState('login'); // 'login' | 'signup'
  const [loading,  setLoading]  = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.logoCircle}>🎓</div>
          <h1 style={styles.title}>University Portal</h1>
          <p style={styles.subtitle}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your student account'}
          </p>
        </div>

        {/* TABS */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(mode === 'login' ? styles.activeTab : {}) }}
            onClick={() => setMode('login')}
          >
            Sign In
          </button>
          <button
            style={{ ...styles.tab, ...(mode === 'signup' ? styles.activeTab : {}) }}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>

        {mode === 'login'
          ? <LoginForm loginUser={loginUser} navigate={navigate} />
          : <SignupForm setMode={setMode} />
        }
      </div>
    </div>
  );
}

// ── LOGIN FORM ────────────────────────────────────
function LoginForm({ loginUser, navigate }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      loginUser(res.data);
      toast.success('Login successful!');
      const role = res.data.role;
      if (role === 'ADMIN')        navigate('/admin');
      else if (role === 'FACULTY') navigate('/faculty');
      else                         navigate('/student');
    } catch (err) {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email, password) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <form onSubmit={handleLogin}>
      <div style={styles.field}>
        <label style={styles.label}>Email Address</label>
        <input
          style={styles.input}
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Password</label>
        <div style={styles.passwordWrapper}>
          <input
            style={{ ...styles.input, paddingRight: '44px' }}
            type={showPass ? 'text' : 'password'}
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPass(p => !p)}
            style={styles.eyeBtn}
          >
            {showPass ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
      >
        {loading ? '⏳ Signing in...' : '🔐 Sign In'}
      </button>

      {/* DEMO CREDENTIALS */}
      <div style={styles.demoBox}>
        <p style={styles.demoTitle}>🔑 Demo Credentials</p>
        <div style={styles.demoGrid}>
          {[
            { role: 'Admin',   email: 'admin@uni.com',    pass: 'hashed_admin',   color: '#1a1a2e' },
            { role: 'Student', email: 'student1@uni.com', pass: 'hashed_default', color: '#1a3c6e' },
            { role: 'Faculty', email: 'faculty1@uni.com', pass: 'hashed_default', color: '#0f6e3c' },
          ].map(d => (
            <button
              key={d.role}
              type="button"
              onClick={() => fillDemo(d.email, d.pass)}
              style={{ ...styles.demoBtn, background: d.color }}
            >
              {d.role}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}

// ── SIGNUP FORM ───────────────────────────────────
function SignupForm({ setMode }) {
  const [form, setForm] = useState({
    name:            '',
    email:           '',
    password:        '',
    confirmPassword: '',
    phone:           '',
    gender:          '',
    dob:             '',
    bloodGroup:      '',
    branch:          '',
    admissionYear:   new Date().getFullYear(),
    addressCurrent:  '',
    addressPermanent:'',
    rollNo:          '',
  });
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [step,        setStep]        = useState(1);
  const [errors,      setErrors]      = useState({});

  const update = (field, value) => setForm(p => ({ ...p, [field]: value }));

  const validateStep1 = () => {
    const errs = {};
    if (!form.name.trim())            errs.name  = 'Name is required';
    if (!form.email.includes('@'))    errs.email = 'Valid email required';
    if (form.password.length < 6)     errs.password = 'Password must be 6+ characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.rollNo.trim())          errs.rollNo = 'Roll number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!form.branch)  errs.branch = 'Branch is required';
    if (!form.phone)   errs.phone  = 'Phone is required';
    if (!form.gender)  errs.gender = 'Gender is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      // Step 1: Create user
      const userRes = await API.post('/auth/register', {
        email:        form.email,
        passwordHash: form.password,
        role:         'STUDENT',
      });

      // Step 2: Create student profile
      await API.post('/students/register', {
        userId:          userRes.data.id,
        name:            form.name,
        rollNo:          form.rollNo,
        phone:           form.phone,
        gender:          form.gender,
        dob:             form.dob,
        bloodGroup:      form.bloodGroup,
        branch:          form.branch,
        admissionYear:   parseInt(form.admissionYear),
        addressCurrent:  form.addressCurrent,
        addressPermanent:form.addressPermanent,
        cgpa:            0.0,
        currentSemester: 1,
      });

      toast.success('Account created! Please login.');
      setMode('login');
    } catch (err) {
      toast.error(err.response?.data || 'Registration failed. Email or Roll No may already exist.');
    } finally {
      setLoading(false);
    }
  };

  const branches    = ['CSE','ECE','EEE','Mechanical','Civil','Aeronautics','MBA','BCA'];
  const bloodGroups = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];
  const genders     = ['Male','Female','Other'];

  return (
    <div>
      {/* STEP INDICATOR */}
      <div style={styles.stepRow}>
        {[1, 2].map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: step >= s ? '#1a3c6e' : '#e5e7eb',
              color: step >= s ? 'white' : '#999',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 'bold'
            }}>
              {s}
            </div>
            <span style={{ fontSize: '12px', color: step >= s ? '#1a3c6e' : '#999', fontWeight: step === s ? '600' : '400' }}>
              {s === 1 ? 'Account Info' : 'Personal Info'}
            </span>
            {s < 2 && <div style={{ width: '40px', height: '2px', background: step > s ? '#1a3c6e' : '#e5e7eb', margin: '0 4px' }} />}
          </div>
        ))}
      </div>

      {/* STEP 1 — ACCOUNT INFO */}
      {step === 1 && (
        <div>
          <Field label="Full Name" error={errors.name}>
            <input style={inputStyle(errors.name)} placeholder="Anisha Sarangi" value={form.name} onChange={e => update('name', e.target.value)} />
          </Field>
          <Field label="Roll Number" error={errors.rollNo}>
            <input style={inputStyle(errors.rollNo)} placeholder="CS20220001" value={form.rollNo} onChange={e => update('rollNo', e.target.value)} />
          </Field>
          <Field label="Email Address" error={errors.email}>
            <input style={inputStyle(errors.email)} type="email" placeholder="you@uni.com" value={form.email} onChange={e => update('email', e.target.value)} />
          </Field>
          <Field label="Password" error={errors.password}>
            <div style={styles.passwordWrapper}>
              <input
                style={{ ...inputStyle(errors.password), paddingRight: '44px' }}
                type={showPass ? 'text' : 'password'}
                placeholder="Min 6 characters"
                value={form.password}
                onChange={e => update('password', e.target.value)}
              />
              <button type="button" onClick={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </Field>
          <Field label="Confirm Password" error={errors.confirmPassword}>
            <div style={styles.passwordWrapper}>
              <input
                style={{ ...inputStyle(errors.confirmPassword), paddingRight: '44px' }}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={e => update('confirmPassword', e.target.value)}
              />
              <button type="button" onClick={() => setShowConfirm(p => !p)} style={styles.eyeBtn}>
                {showConfirm ? '🙈' : '👁️'}
              </button>
            </div>
          </Field>
          <button
            type="button"
            onClick={() => validateStep1() && setStep(2)}
            style={styles.submitBtn}
          >
            Next →
          </button>
        </div>
      )}

      {/* STEP 2 — PERSONAL INFO */}
      {step === 2 && (
        <div>
          <Field label="Branch" error={errors.branch}>
            <select style={inputStyle(errors.branch)} value={form.branch} onChange={e => update('branch', e.target.value)}>
              <option value="">Select Branch</option>
              {branches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Gender" error={errors.gender}>
            <select style={inputStyle(errors.gender)} value={form.gender} onChange={e => update('gender', e.target.value)}>
              <option value="">Select Gender</option>
              {genders.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="Phone Number" error={errors.phone}>
            <input style={inputStyle(errors.phone)} placeholder="9876543210" value={form.phone} onChange={e => update('phone', e.target.value)} />
          </Field>
          <Field label="Date of Birth">
            <input style={styles.input} type="date" value={form.dob} onChange={e => update('dob', e.target.value)} />
          </Field>
          <Field label="Blood Group">
            <select style={styles.input} value={form.bloodGroup} onChange={e => update('bloodGroup', e.target.value)}>
              <option value="">Select Blood Group</option>
              {bloodGroups.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Admission Year">
            <select style={styles.input} value={form.admissionYear} onChange={e => update('admissionYear', e.target.value)}>
              {[2021,2022,2023,2024,2025].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </Field>
          <Field label="Current Address">
            <textarea style={{ ...styles.input, height: '70px', resize: 'vertical' }} placeholder="Hostel/PG address" value={form.addressCurrent} onChange={e => update('addressCurrent', e.target.value)} />
          </Field>
          <Field label="Permanent Address">
            <textarea style={{ ...styles.input, height: '70px', resize: 'vertical' }} placeholder="Home address" value={form.addressPermanent} onChange={e => update('addressPermanent', e.target.value)} />
          </Field>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={() => setStep(1)} style={{ ...styles.submitBtn, background: '#6c757d', flex: 1 }}>
              ← Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{ ...styles.submitBtn, flex: 2, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? '⏳ Creating account...' : '✅ Create Account'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── HELPER COMPONENTS ─────────────────────────────
function Field({ label, children, error }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {children}
      {error && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{error}</p>}
    </div>
  );
}

const inputStyle = (error) => ({
  width: '100%', padding: '11px 14px', borderRadius: '8px',
  border: `1px solid ${error ? '#ef4444' : '#ddd'}`,
  fontSize: '14px', boxSizing: 'border-box', outline: 'none',
});

// ── STYLES ────────────────────────────────────────
const styles = {
  container: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    padding: '20px',
  },
  card: {
    background: 'white', borderRadius: '20px',
    padding: '36px', width: '100%', maxWidth: '460px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
    maxHeight: '90vh', overflowY: 'auto',
  },
  header:     { textAlign: 'center', marginBottom: '24px' },
  logoCircle: { fontSize: '48px', marginBottom: '8px' },
  title:      { margin: '0 0 6px', color: '#1a1a2e', fontSize: '24px', fontWeight: '700' },
  subtitle:   { margin: 0, color: '#666', fontSize: '14px' },
  tabs:       { display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '4px', marginBottom: '24px' },
  tab:        { flex: 1, padding: '10px', border: 'none', background: 'transparent', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#666' },
  activeTab:  { background: 'white', color: '#1a1a2e', fontWeight: '700', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  field:      { marginBottom: '16px' },
  label:      { display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151', fontSize: '13px' },
  input:      { width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box', outline: 'none' },
  passwordWrapper: { position: 'relative' },
  eyeBtn:     { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '0' },
  submitBtn:  { width: '100%', padding: '13px', background: '#1a3c6e', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '8px' },
  demoBox:    { marginTop: '20px', padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' },
  demoTitle:  { margin: '0 0 10px', fontSize: '13px', color: '#555', fontWeight: '600' },
  demoGrid:   { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' },
  demoBtn:    { padding: '8px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  stepRow:    { display: 'flex', alignItems: 'center', marginBottom: '24px', justifyContent: 'center' },
};