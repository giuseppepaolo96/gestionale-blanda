import { LABEL_CONSTANT } from "constants/label_costant";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Stepper } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import './resetPassword.scss';


export default function ResetPassword() {

  const [Email, setEmail] = useState('');
  const labelConstant = LABEL_CONSTANT;
  const navigate = useNavigate();
  const stepperRef = useRef<any>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const [errors, setErrors] = useState({
    email: ''
  });
  const [touched, setTouched] = useState({
    email: false,
  });

  const validateEmail = () => {
    let emailError = '';
    if (!Email) {
      emailError = 'Email obbligatoria';
    } else if (!/\S+@\S+\.\S+/.test(Email)) {
      emailError = 'Email non valida';
    }
    setErrors(prevErrors => ({ ...prevErrors, email: emailError }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'email' | 'password' | 'firstName' | 'lastName') => {
    const value = e.target.value;

    setTouched(prevTouched => ({
      ...prevTouched,
      [type]: true, // Imposta touched su true quando l'utente interagisce con il campo
    }));

    if (type === 'email') {
      setEmail(value);
      if (touched.email) validateEmail(); // Esegui la validazione solo se il campo è stato toccato
    }
  };


  useEffect(() => {
    if (touched.email) {
      const validateEmail = () => {
        let emailError = '';
        if (!Email) {
          emailError = 'Email obbligatoria';
        } else if (!/\S+@\S+\.\S+/.test(Email)) {
          emailError = 'Email non valida';
        }
        setErrors(prevErrors => ({ ...prevErrors, email: emailError }));
      };

      validateEmail();
    }
  }, [Email, touched.email]);

  const validateStep1 = () => {
    return Email &&
      !errors.email;
  };

  const isFormValid = () => {
    switch (currentStep) {
      case 0:
        return validateStep1();
      default:
        return false;
    }
  };


  const handlePrev = () => {
    if (currentStep <= 1 ) {
      navigate('/login');
    } else {
      if (stepperRef.current) {
        stepperRef.current.prevCallback();
      }
      setCurrentStep(prevStep => prevStep - 1);
    } 
  };

  

  const handleNext = async () => {
    if (stepperRef.current) {
      stepperRef.current.nextCallback();
    }

    if (currentStep < 3) {
      setCurrentStep(prevStep => prevStep + 1);
    }
  }

  /*   const handleNext = async () => {
        if (stepperRef.current) {
          stepperRef.current.nextCallback();
        }
    
        if (currentStep < 3) {
          setCurrentStep(prevStep => prevStep + 1);
        } else {
          try {
            const payload: RegistrazioneForm = {
              FirstName: FirstName,
              LastName: LastName,
              Email: Email,
              Squadre: selectedSquadra ? [selectedSquadra] : [],
              Categorie: selectedCategoria ? [selectedCategoria] : [],
              Roles: selectedRole ? [selectedRole] : []
            };
    
            const response = await registrazione(payload);
    
            setToastMessage({ severity: 'success', detail: 'Login effettuato con successo!' });
            setToastVisible(true);
            navigate('/dashboard');
          } catch (error) {
            console.error('Errore durante il login:', error);
            setToastMessage({ severity: 'error', detail: 'Credenziali non valide o errore di rete' });
            setToastVisible(true);
          }
        }
      }; */

  const getHeaderContent = () => {
    let title, subTitle;
    switch (currentStep) {
      case 0:
        title = labelConstant.recupero_password;
        subTitle = labelConstant.reset_password;
        break;
    }
    return { title, subTitle };
  };

  const { title, subTitle } = getHeaderContent();

  const footer = (
    <>
      {currentStep !== 1 && (
        <div className="button-group">
          <Button label="Indietro" onClick={handlePrev} severity="secondary" icon="pi pi-arrow-left" className="prev-button" />
          <Button label={currentStep === 3 ? "Conferma" : "Avanti"} onClick={handleNext} className="next-button" disabled={!isFormValid()}  />
        </div>
      )}
      {currentStep == 1 && (
          <Button label="Torna al login" onClick={handlePrev} severity="secondary" icon="pi pi-arrow-left" className="back-to-login"  />
      )

      }
    </>
  );

  //inserimeto email ed invio
  return (
    <div className="background-container">
      <div className="card">
        <div className="card-header">
          <Card footer={footer} header={
            <div className="p-grid p-align-center">
              <div className="p-col">
                <div>
                  <span className="titleClass">{title}</span>
                  <br />
                  {/* <div className="p-col-fixed"> */}
                  <span className="subTitleClass">{subTitle}</span>
                  {currentStep === 0 && (
                    <img src={require('../../assets/images/Logo_scritta.svg').default} alt="Logo" className="logo-image-col" />
                  )}
                </div>
              </div>
            </div>
            /* </div> */

          }>
            <div style={{ width: '50rem' }}>
              <Stepper ref={stepperRef}>
                <StepperPanel header="Email">
                  <div className="flex flex-column h-12rem">
                    <div className="step-content-res">
                      <div className="input-group">
                        <input
                          type="email"
                          className={`input-field-email ${errors.email ? 'error' : ''}`}
                          placeholder="Email*"
                          value={Email}
                          onChange={(e) => handleInputChange(e, 'email')}
                          required
                          autoComplete="email"
                        />
                        {errors.email && <div className="error">{errors.email}</div>}
                      </div>
                    </div>
                  </div>
                </StepperPanel>
                <StepperPanel header="Conferma Email">
                  <div className="flex flex-column h-12rem">
                    <div className="step-content-res">
                      <img src={require('../../assets/images/Logo_scritta.svg').default} alt="Logo" className="logo-image-email" />
                      <i className="pi pi-check-circle icon-result-right" ></i>
                      <div></div>
                      <div className="title-check-email">{labelConstant.verifica_email}</div>
                      <div className="subtitle-check-email">{labelConstant.check_email}</div>
                     {footer}
                    </div>
                  </div>
                </StepperPanel>
              </Stepper>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}