import Dashboard from "components/Dashboard/dashboard";
import Diretta from "components/Diretta/diretta";
import GestioneGenerale from "components/Gestione Generale/gestioneGenerale";
import GestionePunteggio from "components/Gestione Punteggio/gestionePunteggio";
import Ledwall from "components/Ledwall/ledwall";
import Login from "components/Login/login";
import Register from "components/Register/register";
import ResetPassword from "components/Reset Password/resetPassword";
import Sponsor from "components/Sponsor/sponsor";
import Statistics from "components/Statistics/statistics";
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
        <Route path="statistics" element={<Statistics />} />
        <Route path="register" element={<Register />} />
        <Route path="resetPassword" element={<ResetPassword />} />
        <Route path="gestione/:matchId" element={<GestionePunteggio />} />
        <Route path="gestione-sponsor" element={<Sponsor />} />
        <Route path="ledwall/:matchId" element={<Ledwall />} />
        <Route path="diretta/:matchId" element={<Diretta />} />
        <Route path="gestione-generale" element={<GestioneGenerale />} />
      </Route>
    </>
  )
);

export default router;
