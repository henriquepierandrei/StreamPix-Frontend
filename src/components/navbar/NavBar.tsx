import { Github, Linkedin } from 'lucide-react';
import './Navbar.css';
function NavBar() {
    return (
        <nav className='navbar'>
            <div className='nav-links'>
                <a
                    href="https://github.com/pierandrei"
                    target="_blank"
                    rel="noopener noreferrer"
                    
                >
                    <Github size={14}/> GitHub
                </a>
                <a
                    href="https://www.linkedin.com/in/henrique-pierandrei/"
                    target="_blank"
                    rel="noopener noreferrer"
                   
                >
                    <Linkedin size={14}/> LinkedIn
                </a>
            </div>
        </nav>
    )
}

export default NavBar
