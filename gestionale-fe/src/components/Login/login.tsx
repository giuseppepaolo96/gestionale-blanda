import { LABEL_CONSTANT } from "constants/label_costant";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import './login.scss';
import { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { login } from "services/UserService";
import { Checkbox } from "primereact/checkbox";
type ToastSeverity = 'error' | 'success' | 'info' | 'warn';

interface ToastMessage {
  severity: ToastSeverity;
  detail: React.ReactNode;
}

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [checked, setChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    username: '',
    password: '',
  });
  const [touched, setTouched] = useState({
    username: false,
    password: false,
  });
  const [lastLoginAttempt, setLastLoginAttempt] = useState<number | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);

  const validateUsername = () => {
    let userNameError = '';
    if (!username) {
      userNameError = 'Email obbligatoria';
    } else if (!/\S+@\S+\.\S+/.test(username)) {
      userNameError = 'Email non valida';
    }
    setErrors(prevErrors => ({ ...prevErrors, username: userNameError }));
  };

  const validatePasswordlog = (value: string) => {
    let passwordError = '';
    if (!value) {
      passwordError = 'Password obbligatoria';
    }
    setErrors(prevErrors => ({ ...prevErrors, password: passwordError }));
  };

  useEffect(() => {
    if (touched.password) {
      validatePasswordlog(password);
    }
    if (touched.username) {
      validateUsername();
    }
  }, [password, touched.password, username, touched.username]);

  useEffect(() => {
    if (toastVisible && toastMessage && toast.current) {
      toast.current.show({
        severity: toastMessage.severity,
        detail: (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {toastMessage.severity === 'info' && (
              <i className="pi pi-info-circle"></i>
            )}
            {toastMessage.severity === 'error' && (
              <i className="pi pi-times-circle"></i>
            )}
            {toastMessage.severity === 'success' && (
              <i className="pi pi-check-circle"></i>
            )}
            {toastMessage.severity === 'warn' && (
              <i className="pi pi-exclamation-triangle"></i>
            )}
            <span style={{ marginLeft: '8px' }}>{toastMessage.detail}</span>
          </div>
        ),
        className: `custom-toast p-toast-${toastMessage.severity}`,
        life: 0 // Imposta su 0 per evitare che il toast si chiuda automaticamente
      });
    }
  }, [toastVisible, toastMessage]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    validateUsername();
    validatePasswordlog(password);

    const now = Date.now();
    const cooldownPeriod = 60000; // 1 minuto in millisecondi
    const timeSinceLastAttempt = lastLoginAttempt ? now - lastLoginAttempt : cooldownPeriod;

    if (timeSinceLastAttempt < cooldownPeriod) {
      setToastMessage({ severity: 'info', detail: LABEL_CONSTANT.info });
      setToastVisible(true);
      return;
    }

    if (!errors.username && !errors.password && username && password) {
      try {
        const response = await login(username, password, checked);
        console.log('Login success:', response.data);
        setToastMessage({ severity: 'success', detail: 'Login effettuato con successo!' });
        setToastVisible(true);
        navigate('/dashboard');
        setLastLoginAttempt(Date.now());
      } catch (error) {
        console.error('Errore durante il login:', error);
        setToastMessage({ severity: 'error', detail: 'Credenziali non valide o errore di rete' });
        setToastVisible(true);
        setLastLoginAttempt(Date.now());
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'username' | 'password') => {
    const value = e.target.value;

    setTouched(prevTouched => ({
      ...prevTouched,
      [type]: true,
    }));

    if (type === 'username') {
      setUsername(value);
      if (touched.username) validateUsername();
    } else if (type === 'password') {
      setPassword(value);
      if (touched.password) validatePasswordlog(value);
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleResetClick = () => {
    navigate('/resetpassword');
  };

  const handleCheckboxChange = () => {
    setChecked(!checked);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isFormValid = username && password && !errors.username && !errors.password;
   return (
    <div className="background-container">
      <Toast ref={toast} position="bottom-right" className="custom-toast" />
      <div className="logo-container">
        <img src={require('../../assets/images/FAAM-MATESE_black.svg').default} alt="Logo" className="logo-image" />
      </div>
      <div className="login-box">
        <form onSubmit={handleLogin}>
          <div className="login-title">
            {LABEL_CONSTANT.accedi}
          </div>
          <div className="step-login">
            <div className="input-group">
              <input
                type="email"
                className={`input-field-login ${errors.username ? 'error' : ''}`}
                placeholder="Email"
                value={username}
                onChange={(e) => handleInputChange(e, 'username')}
                autoComplete="email"
              />
              {errors.username && <div className="error">{errors.username}</div>}
            </div>
            <div className="input-group">
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`input-pass ${errors.password ? 'error' : ''}`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => handleInputChange(e, 'password')}
                  autoComplete="new-password"
                  style={{ paddingRight: '40px' }} 
                />
                <Button
                  icon={showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'}
                  className="p-button-text"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '0%',
                    transform: 'translateY(-50%)',
                    padding: '0',
                  }}
                  onClick={togglePasswordVisibility}
                  tabIndex={-1}
                  type="button"
                />
              </div>
              {errors.password && <div className="error">{errors.password}</div>}
            </div>
          </div>
          <div className="flex-container">
            <div className="checkbox-group">
              <Checkbox
                inputId="rememberMe"
                onChange={handleCheckboxChange}
                checked={checked}
              />
              <label htmlFor="rememberMe">
                {LABEL_CONSTANT.ricordami}
              </label>
            </div>
            <button type="button" className="reset-button" onClick={handleResetClick}>
              {LABEL_CONSTANT.resetPassword}
            </button>
          </div>
          <button type="submit" className="login-button" disabled={!isFormValid}>
            {LABEL_CONSTANT.accedi_button}
          </button>
          <div className="flex-container-reg">
            {LABEL_CONSTANT.noAccount}
            <button className="register-button" onClick={handleRegisterClick}>
              {LABEL_CONSTANT.registrati_title}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

