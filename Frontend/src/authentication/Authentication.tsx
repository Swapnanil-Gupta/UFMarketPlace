import { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import './Authentication.css';
import { authService } from '../AuthService';

interface AnimatedInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AnimatedInput: React.FC<AnimatedInputProps> = ({ label, type = 'text', value, onChange }) => {
  const [focused, setFocused] = useState(false);
  const labelAnim = useSpring({
    transform: focused || value ? 'translateY(-25px) scale(0.8)' : 'translateY(0) scale(1)',
    color: focused ? '#4a5568' : '#718096',
  });

  return (
    <div className="input-container">
      <animated.label style={labelAnim}>{label}</animated.label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
};

interface FormData {
  name: string,
  email: string;
  password: string;
  confirmPassword: string;
}

const Authentication: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === '/login';
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear form when switching between login/signup
  useEffect(() => {
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setError(null);
    setLoading(false);
  }, [location.pathname]);

  const formAnimation = useSpring({
    opacity: 1,
    transform: 'translateY(0)',
    from: { opacity: 0, transform: 'translateY(40px)' },
  });

  const underlineAnimation = useSpring({
    left: isLogin ? '0%' : '50%',
    width: '50%',
  });

  const isFormValid = () => {
    
    if (isLogin) {
      return formData.email.trim() !== '' && formData.password.trim() !== '';
    }
    return (
      formData.name.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.password.trim() !== '' &&
      formData.confirmPassword.trim() !== ''
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if(!formData.email.includes("ufl.edu")) {
        throw new Error('Only UF emailId is allowed');
      }
      if (!isLogin && formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (isLogin) {
        await authService.login({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        navigate('/dashboard');
      } else {
        await authService.signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        });
        navigate('/dashboard');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <animated.form style={formAnimation} onSubmit={handleSubmit}>
        <div className="form-header">
          <div className="tabs">
            <Link to="/login" className={`tab ${isLogin ? 'active' : ''}`}>
              Login
            </Link>
            <Link to="/signup" className={`tab ${!isLogin ? 'active' : ''}`}>
              Sign Up
            </Link>
            <animated.div className="underline" style={underlineAnimation} />
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      {!isLogin && (
      <AnimatedInput
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      )}
        <AnimatedInput
          label="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <AnimatedInput
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />

        {!isLogin && (
          <AnimatedInput
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />
        )}

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading || !isFormValid()}
          style={{
            background: loading || !isFormValid() 
              ? 'linear-gradient(45deg, #cccccc, #999999)'
              : 'linear-gradient(45deg, #667eea, #764ba2)',
            cursor: loading || !isFormValid() ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
        </button>
      </animated.form>
    </div>
  );
};

export default Authentication;
