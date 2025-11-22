import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// NOTA: Se ha simplificado la URL de la API para evitar advertencias de compilación.
// DEBES cambiar 'http://localhost:3000' por la URL de tu backend en producción (ej: Render).
const API_URL = 'http://localhost:3000';

const ListaJuegos = ({ onSelectGame }) => {
    // Variables renombradas: games -> juegos
    const [juegos, setJuegos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchJuegos(); // Función renombrada
    }, []);

    const fetchJuegos = async () => { // Función renombrada
        setLoading(true);
        try {
            // Se asume que el endpoint en el backend también fue renombrado a /api/juegos
            const response = await fetch(`${API_URL}/api/juegos`); 
            if (!response.ok) {
                throw new Error('Error al cargar los juegos');
            }
            const data = await response.json();
            setJuegos(data); // Estado actualizado
            setError(null);
        } catch (err) {
            console.error("Error fetching juegos:", err);
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
            const response = await fetch(`${API_URL}/api/juegos/${id}`, { // Endpoint renombrado
                method: 'DELETE',
            });
            
            if (!response.ok) {
                throw new Error('Error al eliminar el juego');
            }

            // Actualiza la lista de juegos después de eliminar
            setJuegos(juegos.filter(juego => juego._id !== id)); // Estado actualizado
            console.log('Juego eliminado con éxito.'); 

        } catch (err) {
            console.error("Error deleting juego:", err);
            setError('No se pudo eliminar el juego. Verifica tu conexión y permisos.');
        }
    };

    // Componente auxiliar para mostrar la calificación promedio (BARRA DE PROGRESO)
    const AverageRating = ({ reviews }) => {
        if (!reviews || reviews.length === 0) {
            return <p className="average-rating-text">Sin Calificaciones</p>;
        }
        
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const avg = (totalRating / reviews.length).toFixed(1);
        
        // Calculamos el porcentaje, asumiendo una escala de 5 (avg * 20%)
        const percentage = (avg / 5) * 100; 

        return (
            <div className="average-rating-container">
                <p className="average-rating-text">
                    Calificación: <span className="rating-value">{avg} / 5</span> ({reviews.length} Reseñas)
                </p>
                
                {/* ESTRUCTURA DE LA BARRA DE PROGRESO */}
                <div className="progress-bar-base">
                    {/* El estilo in-line es CRÍTICO para pasar el ancho de la barra */}
                    <div 
                        className="progress-bar-fill" 
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>
        );
    };


    if (loading) {
        return <div className="loading-message">Cargando juegos...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (juegos.length === 0) {
        return <div className="no-juegos-message">Aún no hay juegos en la lista. ¡Añade uno para empezar!</div>;
    }

    return (
        <div className="juego-list-section">
            <h2 className="section-title">Tu Colección de Juegos</h2>
            
            {/* INICIO DEL CONTENEDOR DE CUADRÍCULA (CSS Grid) */}
            <div className="juego-grid-container">
                {juegos.map(juego => ( // Mapeo de 'juegos'
                    <div key={juego._id} className="juego-card">
                        {/* Muestra la imagen si existe, o un placeholder si no */}
                        {juego.image && (
                            <img 
                                src={`${API_URL}/uploads/${juego.image}`} 
                                alt={`Imagen de ${juego.title}`} 
                                className="juego-image" 
                                onError={(e) => e.target.src = 'https://placehold.co/400x200/333333/FFFFFF?text=Sin+Imagen'} // Fallback
                            />
                        )}
                        
                        <div className="juego-info">
                            <h3 className="juego-title">{juego.title}</h3>
                            <p className="juego-genre">Género: {juego.genre}</p>
                            <p className="juego-developer">Desarrollador: {juego.developer}</p>
                            
                            {/* Mostrar calificación promedio */}
                            <AverageRating reviews={juego.reviews} />

                            <div className="card-actions">
                                {/* Botón para ver reseña */}
                                <Link 
                                    to={`/review/${juego._id}`} 
                                    className="button review-button"
                                >
                                    Ver Reseñas
                                </Link>
                                
                                {/* Botón para editar */}
                                <button 
                                    onClick={() => onSelectGame(juego)} 
                                    className="button edit-button"
                                >
                                    Editar
                                </button>
                                
                                {/* Botón para eliminar */}
                                <button 
                                    onClick={() => handleDelete(juego._id)} 
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