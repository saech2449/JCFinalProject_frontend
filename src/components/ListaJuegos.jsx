import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; 

// URL base de tu Backend
const API_URL = 'http://localhost:3000';

// 🚨 NUEVO: Custom Hook para obtener la calificación promedio 🚨
const useGameRating = (juegoId) => {
    const [averageRating, setAverageRating] = useState(null);
    const [reviewCount, setReviewCount] = useState(0);

    useEffect(() => {
        if (!juegoId) return;

        const fetchRating = async () => {
            try {
                // Llama al nuevo endpoint GET /api/reviews/average/:juegoId
                const response = await axios.get(`${API_URL}/api/reviews/average/${juegoId}`);
                setAverageRating(response.data.averageRating);
                setReviewCount(response.data.reviewCount);
            } catch (error) {
                setAverageRating(null); 
                setReviewCount(0);
            }
        };
        fetchRating();
    }, [juegoId]); 

    return { averageRating, reviewCount };
};

// Componente para mostrar 5 estrellas
const StarDisplay = ({ rating = 0 }) => {
    const roundedRating = Math.round(parseFloat(rating)); 
    return (
        <div style={{ color: '#FFD700', fontSize: '1.2rem', margin: '5px 0' }}>
            {[...Array(roundedRating)].map((_, i) => <span key={`filled-${i}`}>★</span>)}
            {[...Array(5 - roundedRating)].map((_, i) => <span key={`empty-${i}`} style={{ color: '#808080' }}>★</span>)}
        </div>
    );
};

// 🚨 NUEVO: Componente Tarjeta para encapsular la lógica de calificación 🚨
const GameCard = ({ juego, onEdit, handleDelete }) => {
    const { averageRating, reviewCount } = useGameRating(juego._id);
    const navigate = useNavigate(); 

    return (
        <div className={`juego-card ${juego.completed ? 'completed' : ''}`}>
            <div className="card-image">
                <img 
                    src={juego.imageUrl || 'https://placehold.co/400x300/1e293b/ffffff?text=Juego'} 
                    alt={juego.title} 
                    onError={(e) => {e.target.onerror = null; e.target.src="https://placehold.co/400x300/1e293b/ffffff?text=Juego"}}
                />
            </div>
            <div className="card-content">
                <h3>{juego.title}</h3>
                <p className="platform-tag">{juego.platform.join(', ')}</p>
                <p className="hours-tag">{juego.hoursPlayed} horas jugadas</p>

                {/* 🚨 AQUÍ SE MUESTRA EL PROMEDIO REAL 🚨 */}
                {averageRating !== null && reviewCount > 0 ? (
                    <>
                        <StarDisplay rating={averageRating} />
                        <small style={{ color: '#aaa', display: 'block', fontSize: '0.8rem' }}>
                            {/* Muestra el número con un decimal */}
                            {averageRating} ({reviewCount} reseñas)
                        </small>
                    </>
                ) : (
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Sin reseñas</p>
                )}
                

                <div className="card-actions">
                    {/* 🚨 ENLACE A LA PÁGINA DE RESEÑAS (Ruta genérica) 🚨 */}
                    <Link 
                        to={`/reviews/${juego._id}`} 
                        className="button review-button"
                    >
                        Ver Reseñas
                    </Link>
                    
                    <button 
                        onClick={() => onEdit(juego, navigate)} 
                        className="button edit-button"
                    >
                        Editar
                    </button>
                    <button 
                        onClick={() => handleDelete(juego._id)} 
                        className="button delete-button"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// Componente principal de ListaJuegos
// ----------------------------------------------------------------------
const ListaJuegos = ({ onEdit }) => {
    const navigate = useNavigate(); // Necesario si no está en tu original
    const [juegos, setJuegos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchJuegos = async () => { 
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/juegos`); 
            setJuegos(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching juegos:", err);
            setError('No se pudieron cargar los juegos. Inténtalo de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJuegos();
    }, []);


    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este juego?')) {
            try {
                await axios.delete(`${API_URL}/api/juegos/${id}`);
                fetchJuegos(); // Recargar la lista después de eliminar
            } catch (error) {
                console.error("Error al eliminar juego:", error);
                alert('Error al eliminar el juego.');
            }
        }
    };

    if (loading) return <p>Cargando lista de juegos...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="juego-list-wrapper">
            <div className="juego-grid-container">
                {juegos.map(juego => (
                    <GameCard 
                        key={juego._id} 
                        juego={juego} 
                        onEdit={onEdit} 
                        handleDelete={handleDelete} 
                    />
                ))}
            </div>
        </div>
    );
};

export default ListaJuegos;