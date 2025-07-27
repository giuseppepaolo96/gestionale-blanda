import React, { useRef, useState, useEffect } from "react";
import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { useNavigate } from 'react-router-dom';
import { LABEL_CONSTANT } from "constants/label_costant";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import './register.scss';
import { categoria, registrazione, squadra, roles as fetchRoles } from "services/UserService";
import { Categoria, RegistrazioneForm, Role, Squadra } from "models/models";

export default function Register() {
  const [FirstName, setFirstname] = useState('');
  const [LastName, setLastname] = useState('');
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const [Squadre, setSquadre] = useState<Squadra[]>([]);
  const [Categorie, setCategorie] = useState<Categoria[]>([]);
  const [Roles, setRoles] = useState<Role[]>([]);
  const navigate = useNavigate();
  const labelConstant = LABEL_CONSTANT;
  const stepperRef = useRef<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const toast = useRef<Toast>(null);
  const [selectedSquadra, setSelectedSquadra] = useState<Squadra | null>(null);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const formatPassword = (password: string) => '*'.repeat(password.length);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    squadra: '',
    categoria: '',
    role: ''
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
    firstName: false,
    lastName: false,
  });

  type ToastSeverity = 'error' | 'success' | 'info' | 'warn';

  interface ToastMessage {
    severity: ToastSeverity;
    detail: React.ReactNode;
  }

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);


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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const squadreResponse = await squadra();
        setSquadre(squadreResponse);

        const categorieResponse = await categoria();
        setCategorie(categorieResponse);

        const roleResponse = await fetchRoles();
        setRoles(roleResponse);
      } catch (error) {
        console.error('Errore durante il recupero delle squadre, categorie o ruoli:', error);
      }
    };

    fetchData();
  }, []);

  const validateEmail = () => {
    let emailError = '';
    if (!Email) {
      emailError = 'Email obbligatoria';
    } else if (!/\S+@\S+\.\S+/.test(Email)) {
      emailError = 'Email non valida';
    }
    setErrors(prevErrors => ({ ...prevErrors, email: emailError }));
  };

  const validatePassword = () => {
    let passwordError = '';
    const minLength = 8;
    const hasDigit = /\d/;
    const hasLowercase = /[a-z]/;
    const hasUppercase = /[A-Z]/;
    const hasNonAlphanumeric = /[^a-zA-Z0-9]/;

    if (!Password) {
      passwordError = 'Password obbligatoria';
    } else if (Password.length < minLength) {
      passwordError = 'La password non rispetta la lunghezza minima di 8 caratteri';
    } else if (!hasDigit.test(Password)) {
      passwordError = 'La password deve contenere almeno un numero';
    } else if (!hasLowercase.test(Password)) {
      passwordError = 'La password deve contenere almeno una lettera minuscola';
    } else if (!hasUppercase.test(Password)) {
      passwordError = 'La password deve contenere almeno una lettera maiuscola';
    } else if (!hasNonAlphanumeric.test(Password)) {
      passwordError = 'La password deve contenere almeno un carattere speciale';
    }
    setErrors(prevErrors => ({ ...prevErrors, password: passwordError }));
  };

  const validateFirstName = () => {
    let firstNameError = '';
    const nameRegex = /^[a-zA-Z]+$/;
    if (!FirstName) {
      firstNameError = 'Nome obbligatorio';
    } else if (!nameRegex.test(FirstName)) {
      firstNameError = 'Il nome può contenere solo lettere';
    }
    setErrors(prevErrors => ({ ...prevErrors, firstName: firstNameError }));
  };

  const validateLastName = () => {
    let lastNameError = '';
    const nameRegex = /^[a-zA-Z]+$/;
    if (!LastName) {
      lastNameError = 'Cognome obbligatorio';
    } else if (!nameRegex.test(LastName)) {
      lastNameError = 'Il cognome può contenere solo lettere';
    }
    setErrors(prevErrors => ({ ...prevErrors, lastName: lastNameError }));
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
    } else if (type === 'firstName') {
      setFirstname(value);
      if (touched.firstName) validateFirstName();
    } else if (type === 'lastName') {
      setLastname(value);
      if (touched.lastName) validateLastName();
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
    } else if (touched.firstName) {
      const validateFirstName = () => {
        let firstNameError = '';
        const nameRegex = /^[a-zA-Z]+$/;
        if (!FirstName) {
          firstNameError = 'Nome obbligatorio';
        } else if (!nameRegex.test(FirstName)) {
          firstNameError = 'Il nome può contenere solo lettere';
        }
        setErrors(prevErrors => ({ ...prevErrors, firstName: firstNameError }));
      };
      validateFirstName();
    } else if (touched.lastName) {
      const validateLastName = () => {
        let lastNameError = '';
        const nameRegex = /^[a-zA-Z]+$/;
        if (!LastName) {
          lastNameError = 'Cognome obbligatorio';
        } else if (!nameRegex.test(LastName)) {
          lastNameError = 'Il cognome può contenere solo lettere';
        }
        setErrors(prevErrors => ({ ...prevErrors, lastName: lastNameError }));
      };
      validateLastName();
    }
  }, [Password, touched.password, Email, touched.email, FirstName, touched.firstName, LastName, touched.lastName]);


  const handleDropdownChange = (e: { value: any }, type: 'squadra' | 'categoria' | 'role') => {
    if (type === 'squadra') {
      setSelectedSquadra(e.value);
      if (e.value) {
        setErrors(prevErrors => ({ ...prevErrors, squadra: '' })); // Rimuovi l'errore se un valore valido è selezionato
      } else {
        setErrors(prevErrors => ({ ...prevErrors, squadra: 'Squadra obbligatoria' }));
      }
    } else if (type === 'categoria') {
      setSelectedCategoria(e.value);
      if (e.value) {
        setErrors(prevErrors => ({ ...prevErrors, categoria: '' })); // Rimuovi l'errore se un valore valido è selezionato
      } else {
        setErrors(prevErrors => ({ ...prevErrors, categoria: 'Categoria obbligatoria' }));
      }
    } else if (type === 'role') {
      setSelectedRole(e.value);
      if (e.value) {
        setErrors(prevErrors => ({ ...prevErrors, role: '' })); // Rimuovi l'errore se un valore valido è selezionato
      } else {
        setErrors(prevErrors => ({ ...prevErrors, role: 'Ruolo obbligatorio' }));
      }
    }
  };
  console.log(selectedSquadra);


  const validateStep1 = () => {
    return FirstName && LastName &&
      !errors.firstName && !errors.lastName;
  };

  const validateStep2 = () => {
    return Email &&
      !errors.email;
  };

  const validateStep3 = () => {
    return selectedSquadra && selectedCategoria && selectedRole &&
      !errors.squadra && !errors.categoria && !errors.role;
  };

  const isFormValid = () => {
    switch (currentStep) {
      case 0:
        return validateStep1();
      case 1:
        return validateStep1() && validateStep2();
      case 2:
        return validateStep1() && validateStep2() && validateStep3();
      case 3:
        return validateStep1() && validateStep2() && validateStep3();
      default:
        return false;
    }
  };


  const handleNext = async () => {
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
  };

  const handlePrev = () => {
    if (currentStep < 1) {
      navigate('/login');
    } else {
      if (stepperRef.current) {
        stepperRef.current.prevCallback();
      }
      setCurrentStep(prevStep => prevStep - 1);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getHeaderContent = () => {
    let title, subTitle;
    switch (currentStep) {
      case 0:
        title = labelConstant.registrati_title;
        subTitle = labelConstant.insert_dati_registrazione_step_1;
        break;
      case 1:
        title = labelConstant.credenziali;
        subTitle = labelConstant.insert_credenziali;
        break;
      case 2:
        title = labelConstant.squadra;
        subTitle = labelConstant.insert_squadra;
        break;
      case 3:
        title = labelConstant.riepilogo;
        subTitle = labelConstant.verifica_riepilogo;
        break;
      default:
        title = labelConstant.riepilogo;
        subTitle = labelConstant.insert_dati_registrazione_step_1;
    }
    return { title, subTitle };
  };

  const { title, subTitle } = getHeaderContent();

  const footer = (
    <>
    
      <div className={`button-group ${currentStep === 0 ? 'step-0' : ''} ${currentStep === 1 ? 'step-1' : ''} ${currentStep === 2 ? 'step-2' : ''} ${currentStep === 3 ? 'step-3' : ''} `}>
        <Button label="Indietro" onClick={handlePrev} severity="secondary" icon="pi pi-arrow-left" className="prev-button" />
        <Button label={currentStep === 3 ? "Conferma" : "Avanti"} onClick={handleNext} className="next-button" disabled={!isFormValid()}  />
      </div>
    </>
  );

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
                  <img src={require('../../assets/images/Logo_scritta.svg').default} alt="Logo" className="logo-image-col" />
                </div>
              </div>
            </div>
            /* </div> */

          }>
            <div style={{ width: '50rem' }}>

              <Stepper ref={stepperRef}>
                <StepperPanel header="Dati personali">
                  <div className="flex flex-column h-12rem">
                    <div className="step-content-res">
                      <div className="input-group">
                        <input
                          type="text"
                          className={`input-field-res ${errors.firstName ? 'error' : ''}`}
                          placeholder="Nome*"
                          value={FirstName}
                          onChange={(e) => handleInputChange(e, 'firstName')}
                          required
                          autoComplete="given-name"
                        />
                        {errors.firstName && <div className="error">{errors.firstName}</div>}
                      </div>
                      <div className="input-group">
                        <input
                          type="text"
                          className={`input-field-res ${errors.lastName ? 'error' : ''}`}
                          placeholder="Cognome*"
                          value={LastName}
                          onChange={(e) => handleInputChange(e, 'lastName')}
                          required
                          autoComplete="family-name"
                        />
                        {errors.lastName && <div className="error">{errors.lastName}</div>}
                      </div>
                    </div>
                  </div>
                </StepperPanel>
                <StepperPanel header="Credenziali">
                  <div className="flex flex-column h-12rem">
                    <div className="step-content-res">
                      <div className="input-group">
                        <input
                          type="email"
                          className={`input-field-res ${errors.email ? 'error' : ''}`}
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
                <StepperPanel header="Squadra e categoria">
                  <div className="flex flex-column h-12rem">
                    <div className="step-content-dropdwon">
                      <div className="input-group">
                        <Dropdown
                          value={selectedSquadra}
                          onChange={(e) => handleDropdownChange(e, 'squadra')}
                          options={Squadre || []}
                          optionLabel="tipologia"
                          placeholder="Seleziona la squadra*"
                          panelClassName="custom-dropdown"
                          className="input-field-dropdown"
                        />
                        {errors.squadra && <div className="error">{errors.squadra}</div>}
                      </div>
                      <div className="input-group">
                        <Dropdown
                          value={selectedCategoria}
                          onChange={(e) => handleDropdownChange(e, 'categoria')}
                          options={Categorie || []}
                          optionLabel="nome"
                          placeholder="Seleziona la categoria*"
                          panelClassName="custom-dropdown"
                          className="input-field-dropdown"
                        />
                        {errors.categoria && <div className="error">{errors.categoria}</div>}
                      </div>
                      <div className="input-group">
                        <Dropdown
                          value={selectedRole}
                          onChange={(e) => handleDropdownChange(e, 'role')}
                          options={Roles || []}
                          optionLabel="ruolo"
                          placeholder="Seleziona il ruolo*"
                          panelClassName="custom-dropdown"
                          className="input-field-dropdown"
                        />
                        {errors.role && <div className="error">{errors.role}</div>}
                      </div>
                    </div>
                  </div>
                </StepperPanel>
                 <StepperPanel header="Riepilogo">
                  <div className="flex flex-column h-12rem">
                    <div className="step-content-riep">
                      <p className="data-field"><strong>{LABEL_CONSTANT.nome}:</strong> {FirstName ? FirstName.toUpperCase() : LABEL_CONSTANT.nonSpecificato}</p>
                      <p className="data-field"><strong>{LABEL_CONSTANT.cognome}:</strong> {LastName ? LastName.toUpperCase() : LABEL_CONSTANT.nonSpecificato}</p>
                      <p className="data-field"><strong>{LABEL_CONSTANT.email_riep}:</strong> {Email ? Email.toUpperCase() : LABEL_CONSTANT.nonSpecificato}</p>
                      <p className="data-field"><strong>{LABEL_CONSTANT.squadra}:</strong> {selectedSquadra ? selectedSquadra.tipologia.toUpperCase() : LABEL_CONSTANT.nessunoSelezionato}</p>
                      <p className="data-field"><strong>{LABEL_CONSTANT.categoria}:</strong> {selectedCategoria ? selectedCategoria.nome.toUpperCase() : LABEL_CONSTANT.nessunoSelezionato}</p>
                      <p className="data-field"><strong>{LABEL_CONSTANT.ruolo}:</strong> {selectedRole ? selectedRole.ruolo.toUpperCase() : LABEL_CONSTANT.nessunoSelezionato}</p>
                    </div>
                  </div>
                </StepperPanel>
              </Stepper>
            </div>


          </Card>
        </div>
      </div>
     
    </div >

  );
}
