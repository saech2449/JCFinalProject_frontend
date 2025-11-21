// frontend/src/components/ListaJuegos.jsx (VERSIÓN FINAL Y CORREGIDA)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewForm from './ReviewForm'; // <-- Importar el formulario
import ReviewList from './ReviewList'; // <-- Importar la lista
import { useNavigate } from 'react-router-dom';

// URL base de tu Backend
const API_URL = 'http://localhost:3000/api/juegos';

// Asegúrate de que onEdit reciba el juego y la función navigate
const ListaJuegos = ({ reloadKey, onEdit }) => { 
    // Usamos useNavigate
    const navigate = useNavigate();
    
    const [juegos, setJuegos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [reloadReviewsKey, setReloadReviewsKey] = useState(0); 

    const fetchJuegos = async () => {
        try {
            const response = await axios.get(API_URL);
            setJuegos(response.data); 
            setLoading(false);
        } catch (err) {
            console.error("Error al cargar los juegos:", err);
            setError("No se pudo conectar al servidor o cargar los datos.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJuegos();
    }, [reloadKey]); 

    const handleReviewSubmitted = () => {
        setReloadReviewsKey(prevKey => prevKey + 1);
    };

    const handleDelete = async (juegoId, title) => {
        if (!window.confirm(`¿Estás seguro de eliminar el juego "${title}"?`)) {
            return; 
        }

        try {
            await axios.delete(`${API_URL}/${juegoId}`);
            setMessage(`✅ Juego "${title}" eliminado correctamente.`);
            setJuegos(juegos.filter(j => j._id !== juegoId));
        } catch (error) {
            console.error("Error al eliminar el juego:", error.response || error);
            setMessage('❌ Error al eliminar el juego.');
        }
    };


    if (loading) return <p>Cargando lista de juegos...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

    return (
        <div className="game-list-container">
            <h1>Mis Juegos Rastreados ({juegos.length})</h1>
            {message && <p className={message.startsWith('✅') ? 'success' : 'error'}>{message}</p>}
            
            {juegos.length === 0 ? (
                <p>No hay juegos registrados. ¡Añade uno!</p>
            ) : (
                <div className="game-cards-wrapper">
                    {juegos.map(juego => (
                        <div key={juego._id} className="game-card">
                            {juego.imageUrl && (
                                <img 
                                    // 🚨 CORRECCIÓN CRÍTICA: Se añade el servidor base (http://localhost:3000) 🚨
                                    src={`http://localhost:3000${juego.imageUrl}`} 
                                    alt={`Portada de ${juego.title}`} 
                                    className="game-cover-image"
                                />
                            )}
                            <div className="game-info">
                                <h2>{juego.title}</h2>
                                <p>Plataforma(s): <strong>{Array.isArray(juego.platform) ? juego.platform.join(', ') : juego.platform}</strong></p>
                                <p>Horas Jugadas: <strong>{juego.hoursPlayed}h</strong></p>
                                <p>Estado: {juego.completed ? '✅ Completado' : '🎮 Pendiente'}</p>
                            </div>
                            
                            <div className="game-actions">
                                {/* onEdit llama a la función en App.jsx y le pasa el juego y la navegación */}
                                <button onClick={() => onEdit(juego, navigate)} className="edit-button">
                                    Editar
                                </button>
                                <button onClick={() => handleDelete(juego._id, juego.title)} className="delete-button">
                                    Eliminar
                                </button>
                            </div>
                            
                            {/* SECCIÓN DE RESEÑAS */}
                            <hr style={{ borderTop: '1px solid #444', margin: '15px 0' }} />
                            
                            {/* Formulario para añadir una nueva reseña */}
                            <ReviewForm 
                                juegoId={juego._id} 
                                onReviewSubmitted={handleReviewSubmitted} 
                            />
                            
                            {/* Lista de reseñas */}
                            <ReviewList 
                                juegoId={juego._id} 
                                reloadReviews={reloadReviewsKey} 
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ListaJuegos;
