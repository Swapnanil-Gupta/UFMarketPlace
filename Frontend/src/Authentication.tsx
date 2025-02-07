import { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useLocation, Link } from 'react-router-dom';
import './Authentication.css';

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
  email: string;
  password: string;
  confirmPassword: string;
}

const Authentication: React.FC = () => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const formAnimation = useSpring({
    opacity: 1,
    transform: 'translateY(0)',
    from: { opacity: 0, transform: 'translateY(40px)' },
  });

  const underlineAnimation = useSpring({
    left: isLogin ? '0%' : '50%',
    width: '50%',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log(formData);
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

        <button type="submit" className="submit-btn">
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
      </animated.form>
    </div>
  );
};

export default Authentication;