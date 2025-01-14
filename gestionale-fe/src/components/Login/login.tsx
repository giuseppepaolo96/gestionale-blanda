import { LABEL_CONSTANT } from "constants/label_costant";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import './login.scss';

const Login = () => {
    const navigate = useNavigate();
  
    const handleLogin = (e: { preventDefault: () => void; }) => {
      e.preventDefault();
      // Naviga alla dashboard
      navigate('/dashboard');
    };
  
    return (
      <div className="login-container">
        <div className="logo-container">
          <img
            src={require('../../assets/images/FAAM-MATESE_black.svg').default}
            alt="Logo"
            className="logo-image"
          />
        </div>
        <div className="login-box">
          <form onSubmit={handleLogin}>
            <div className="login-title">
              {LABEL_CONSTANT.accedi_guest}
            </div>
            <div className="step-login">
              <div className="input-group">
                <Button
                  label={LABEL_CONSTANT.accedi}
                  className="login-button"
                  type="submit"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  export default Login;
  