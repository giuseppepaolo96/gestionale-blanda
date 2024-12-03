import Dashboard from "components/Dashboard/dashboard";
import Diretta from "components/Diretta/diretta";
import GestioneGenerale from "components/Gestione Generale/gestioneGenerale";
import GestionePunteggio from "components/Gestione Punteggio/gestionePunteggio";
import Ledwall from "components/Ledwall/ledwall";
import Login from "components/Login/login";
import Sponsor from "components/Sponsor/sponsor";
import {
  Navigate,
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route>
        <Route path="*" element={<Navigate to="login" />} />
        <Route path="login" element={<Login />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="gestione" element={<GestionePunteggio />} />
        <Route path="gestione-sponsor" element={<Sponsor />} />
        <Route path="ledwall" element={<Ledwall />} />
        <Route path="diretta" element={<Diretta />} />
        <Route path="gestione-generale" element = {<GestioneGenerale/>}/>      
      </Route>
    </>
  )
);

export default router;
