import { useState, useEffect, FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import './Header.css';
import { useNavigate } from 'react-router-dom';

const Header: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const email = sessionStorage.getItem('email') || 'mani@gmail.com';
    const userName = sessionStorage.getItem('name') || '';
    setUserEmail(email);
    setName(userName);
  }, []);

  const handleLogout = (): void => {
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <header className="header-container">
      <div className="header-content">
        <h1 className="logo">
          <span className="logo-uf">UF</span>
          <span className="logo-marketplace">Marketplace</span>
        </h1>
        
        <div className="user-section">
          <button 
            className="user-icon-btn" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="User menu"
          >
            <FontAwesomeIcon 
              icon={faUser} 
              className={`user-icon ${isMenuOpen ? 'icon-active' : ''}`}
            />
          </button>

          <div className={`user-menu ${isMenuOpen ? 'active' : ''}`}>
            <div className="user-info">
              <p className="user-name">{name}</p>
              <p className="user-email">{userEmail}</p>
            </div>
            <button 
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;