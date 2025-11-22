import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// NOTA: Se ha simplificado la URL de la API para evitar advertencias de compilación.
// DEBES cambiar 'http://localhost:3000' por la URL de tu backend en producción (ej: Render).
const API_URL = 'http://localhost:3000';

const ListaJuegos = ({ onSelectGame }) => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/games`);
            if (!response.ok) {
                throw new Error('Error al cargar los juegos');
            }
            const data = await response.json();
            setGames(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching games:", err);
            setError('No se pudieron cargar los juegos. Inténtalo de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        // En el futuro, reemplaza window.confirm con un modal de confirmación personalizado
        if (!window.confirm('¿Estás seguro de que quieres eliminar este juego?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/games/${id}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                throw new Error('Error al eliminar el juego');
            }

            // Actualiza la lista de juegos después de eliminar
            setGames(games.filter(game => game._id !== id));
            console.log('Juego eliminado con éxito.'); 

        } catch (err) {
            console.error("Error deleting game:", err);
            setError('No se pudo eliminar el juego. Verifica tu conexión y permisos.');
        }
    };

    // Componente auxiliar para mostrar la calificación promedio
    const AverageRating = ({ reviews }) => {
        if (!reviews || reviews.length === 0) {
            return <p className="average-rating-text">Sin Calificaciones</p>;
        }
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const avg = (totalRating / reviews.length).toFixed(1);

        // NOTA: En este punto, la calificación sigue usando estrellas por defecto. 
        // La cambiaremos a barra de progreso en el Commit #5.
        return (
            <p className="average-rating-text">
                Calificación: <span className="rating-value">{avg} ★</span> ({reviews.length} Reseñas)
            </p>
        );
    };


    if (loading) {
        return <div className="loading-message">Cargando juegos...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (games.length === 0) {
        return <div className="no-games-message">Aún no hay juegos en la lista. ¡Añade uno para empezar!</div>;
    }

    return (
        <div className="game-list-section">
            <h2 className="section-title">Tu Colección de Juegos</h2>
            
            {/* INICIO DEL CONTENEDOR DE CUADRÍCULA (CSS Grid) */}
            {/* La clase 'game-grid-container' es CRÍTICA para que el CSS funcione */}
            <div className="game-grid-container"> 
                {games.map(game => (
                    <div key={game._id} className="game-card">
                        {/* Muestra la imagen si existe, o un placeholder si no */}
                        {game.image && (
                            <img 
                                src={`${API_URL}/uploads/${game.image}`} 
                                alt={`Imagen de ${game.title}`} 
                                className="game-image" 
                                onError={(e) => e.target.src = 'https://placehold.co/400x200/333333/FFFFFF?text=Sin+Imagen'} // Fallback
                            />
                        )}
                        
                        <div className="game-info">
                            <h3 className="game-title">{game.title}</h3>
                            <p className="game-genre">Género: {game.genre}</p>
                            <p className="game-developer">Desarrollador: {game.developer}</p>
                            
                            {/* Mostrar calificación promedio */}
                            <AverageRating reviews={game.reviews} />

                            <div className="card-actions">
                                {/* Botón para ver reseña */}
                                <Link 
                                    to={`/review/${game._id}`} 
                                    className="button review-button"
                                >
                                    Ver Reseñas
                                </Link>
                                
                                {/* Botón para editar */}
                                <button 
                                    onClick={() => onSelectGame(game)} 
                                    className="button edit-button"
                                >
                                    Editar
                                </button>
                                
                                {/* Botón para eliminar */}
                                <button 
                                    onClick={() => handleDelete(game._id)} 
                                    className="button delete-button"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
             {/* FIN DEL CONTENEDOR DE CUADRÍCULA */}
        </div>
    );
};

export default ListaJuegos;
