import { Avatar } from "primereact/avatar";
import { Menu } from "primereact/menu";
import { Menubar } from "primereact/menubar";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import './navbar.scss';

const Navbar = () => {

    const navigate = useNavigate();
    const menuRef = useRef<Menu>(null);
    const handleLogin = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        // Naviga alla dashboard
        navigate('/login');
      };
    const userMenuItems = [
        {
            label: 'Logout',
            command: async () => {
                navigate('/login');
                console.log('Logout clicked');
            }
        }
    ];
    const start = <img src={require('assets/images/Scritta.svg').default} alt="Logo" className="logo-image-col-nav" onClick={handleLogin} />
    const end = (
        <div className="flex align-items-center gap-2">
            <Avatar
                image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png"
                shape="circle"
                style={{ cursor: 'pointer' }}
                onClick={(e) => menuRef.current?.toggle(e)}
            />
            <Menu
                model={userMenuItems}
                popup
                ref={menuRef}
                id="user-menu"
            />
        </div>
    );
    return (
        <div className="navbar-container">
            <Menubar start={start} end={end} />
        </div>
    );
};

export default Navbar;