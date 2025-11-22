// frontend/src/App.jsx (Fragmento a actualizar en <Routes>)
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'; // Asegúrate de tener useParams
import Formulario from './components/Formulario';
import ListaJuegos from './components/ListaJuegos'; 
import ReviewForm from './components/ReviewForm'; // Importa el formulario
import ReviewList from './components/ReviewList';   // Importa la lista
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


const ReviewPageWrapper = () => {
    const { id } = useParams(); // id es el juegoId
    // Estado para gestionar si estamos editando una reseña específica
    const [reviewToEdit, setReviewToEdit] = useState(null); 
    // Estado para forzar la recarga de la lista después de una acción
    const [reloadKey, setReloadKey] = useState(0); 

    const handleReviewAction = () => {
        setReviewToEdit(null); // Sale del modo edición
        setReloadKey(prev => prev + 1); // Fuerza la recarga de ReviewList
    };

    const handleEditReview = (review) => {
        setReviewToEdit(review);
        // Opcional: Desplazarse al formulario al iniciar la edición
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="review-page">
            <h2>Reseñas para el Juego ID: {id}</h2> 
            
            <ReviewForm 
                juegoId={id} 
                onReviewSubmitted={handleReviewAction} 
                reviewToEdit={reviewToEdit} 
                onCancelEdit={() => setReviewToEdit(null)}
            />
            
            <ReviewList 
                key={reloadKey} 
                juegoId={id} 
                reloadReviews={handleReviewAction} 
                onEditReview={handleEditReview} 
            />
        </div>
    );
}
// 🚨 FIN DEL COMPONENTE TEMPORAL 🚨


function App() {
    const [reloadKey, setReloadKey] = useState(0); 
    const [editingGame, setEditingGame] = useState(null); 

    const handleGameAction = () => {
        setReloadKey(prev => prev + 1);
        setEditingGame(null); 
    };

    const handleEdit = (juego, navigate) => {
        setEditingGame(juego); 
        navigate('/add'); 
    };

    return (
        <Router>
            <div className="App">
                <NavBar />
                
                <main>
                    <Routes>
                        <Route 
                            path="/" 
                            element={
                                <ListaJuegos 
                                    key={reloadKey} 
                                    onEdit={handleEdit} 
                                />
                            } 
                        />
                        
                        <Route 
                            path="/add" 
                            element={
                                <Formulario 
                                    gameToEdit={editingGame} 
                                    onGameSaved={handleGameAction} 
                                />
                            } 
                        />
                        
                        {/* 🚨 NUEVA RUTA DE RESEÑAS usando el componente temporal 🚨 */}
                        <Route path="/reviews/:id" element={<ReviewPageWrapper />} />
                        
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;