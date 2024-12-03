import "primeicons/primeicons.css";
import { PrimeReactProvider } from "primereact/api";
import "./assets/themes/mytheme/theme.scss";
import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <PrimeReactProvider>
      <Outlet></Outlet>
    </PrimeReactProvider>
  );
}
