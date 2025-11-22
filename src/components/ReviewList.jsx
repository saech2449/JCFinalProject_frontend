// frontend/src/components/ReviewList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000'; 

// Componente para mostrar las estrellas (reutilizando la lógica)
const DisplayRating = ({ rating }) => {
    return (
        <div style={{ color: '#FFD700' }}>
            {[...Array(rating)].map((_, i) => <span key={`filled-${i}`}>★</span>)}
            {[...Array(5 - rating)].map((_, i) => <span key={`empty-${i}`} style={{ color: '#808080' }}>★</span>)}
        </div>
    );
};

// 🚨 Se añade `onEditReview` como prop para pasar la reseña al formulario de edición 🚨
const ReviewList = ({ juegoId, reloadReviews, onEditReview }) => { 
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteError, setDeleteError] = useState(null);

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/reviews/${juegoId}`);
            setReviews(response.data);
            setLoading(false);
            setDeleteError(null); 
        } catch (error) {
            console.error("Error al cargar las reseñas:", error);
            setLoading(false);
        }
    };

    // 🚨 NUEVA FUNCIÓN: Manejar la eliminación 🚨
    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
            return;
        }

        setDeleteError(null);
        try {
            await axios.delete(`${API_URL}/api/reviews/${reviewId}`);
            
            // Actualiza el estado localmente
            setReviews(reviews.filter(review => review._id !== reviewId));
            
            // Notifica al padre (para recargar el promedio si es necesario)
            if (reloadReviews) reloadReviews(); 
        } catch (error) {
            console.error("Error al eliminar reseña:", error);
            setDeleteError('Error al eliminar la reseña. Revisa la consola.');
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [juegoId, reloadReviews]);

    if (loading) return <p>Cargando comentarios...</p>;
    
    return (
        <div className="review-list-container" style={{ marginTop: '20px' }}>
            {deleteError && <p className="error">{deleteError}</p>} 
            <h4>Comentarios ({reviews.length})</h4>
            {reviews.length === 0 ? (
                <p>Aún no hay comentarios.</p>
            ) : (
                reviews.map(review => (
                    <div key={review._id} style={{ border: '1px solid #444', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <DisplayRating rating={review.rating} />
                            <small style={{ color: '#aaa', fontSize: '0.8rem' }}>
                                {new Date(review.createdAt).toLocaleDateString()}
                            </small>
                        </div>
                        <p style={{ margin: '5px 0' }}>{review.comment}</p>
                        
                        {/* 🚨 BOTONES DE ACCIÓN 🚨 */}
                        <div className="review-actions" style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={() => onEditReview(review)} // 🚨 Llama a la función de edición del padre 🚨
                                className="button edit-button"
                                style={{ padding: '5px 10px', backgroundColor: '#ffc107', color: '#333', border: 'none', cursor: 'pointer' }}
                            >
                                Editar
                            </button>
                            <button 
                                onClick={() => handleDeleteReview(review._id)} 
                                className="button delete-button"
                                style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default ReviewList;