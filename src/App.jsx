// frontend/src/App.jsx (Implementando React Router DOM y CORREGIDO)
import { useState } from 'react';
// Asegúrate de que useNavigate esté importado aquí
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Formulario from './components/Formulario';
import ListaJuegos from './components/ListaJuegos'; 
import './App.css'; 

// Componente para la barra de navegación
const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Función para alternar el estado (abrir/cerrar)
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="navbar">
            <Link to="/" className="nav-title" onClick={() => setIsOpen(false)}>
                GameTracker App
            </Link>
            
            {/* Botón de Hamburguesa para móvil */}
            <button className="hamburger-menu" onClick={toggleMenu}>
                ☰
            </button>
            
            {/* El menú de enlaces que se oculta/muestra */}
            <div className={`nav-links ${isOpen ? 'open' : ''}`}> 
                <Link to="/" onClick={toggleMenu}>
                    Lista de Juegos
                </Link>
                <Link to="/add" onClick={toggleMenu}>
                    Añadir Nuevo
                </Link>
            </div>
        </nav>
    );
};

function App() {
    const [reloadKey, setReloadKey] = useState(0); 
    const [editingGame, setEditingGame] = useState(null); 
    
    // Función para forzar la recarga de la lista y limpiar el formulario
    const handleGameAction = () => {
        setReloadKey(prevKey => prevKey + 1); // Recarga ListaJuegos
        setEditingGame(null); // Limpia el estado de edición
    };

    // 🚨 CORRECCIÓN: Usamos 'juego' y 'navigate' 🚨
    const handleEdit = (juego, navigate) => {
        setEditingGame(juego); // Establece el objeto 'juego' en el estado de edición
        navigate('/add'); // Usa el navigate que le pasamos desde ListaJuegos
    };

    return (
        <Router>
            <div className="App">
                <NavBar />
                
                <main>
                    <Routes>
                        {/* Ruta principal: Muestra solo la Lista de Juegos */}
                        <Route 
                            path="/" 
                            element={
                                <ListaJuegos 
                                    key={reloadKey} 
                                    onEdit={handleEdit} 
                                />
                            } 
                        />
                        
                        {/* Ruta para Añadir o Editar Juegos */}
                        <Route 
                            path="/add" 
                            element={
                                <Formulario 
                                    gameToEdit={editingGame} 
                                    onGameSaved={handleGameAction} 
                                />
                            } 
                        />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
