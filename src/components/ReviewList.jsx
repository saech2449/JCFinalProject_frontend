// frontend/src/components/ReviewList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Componente para mostrar las estrellas (reutilizando la lógica)
const DisplayRating = ({ rating }) => {
    return (
        <div style={{ color: '#FFD700' }}>
            {/* Rellena estrellas */}
            {[...Array(rating)].map((_, i) => <span key={`filled-${i}`}>★</span>)}
            {/* Estrellas vacías */}
            {[...Array(5 - rating)].map((_, i) => <span key={`empty-${i}`} style={{ color: '#808080' }}>★</span>)}
        </div>
    );
};

const ReviewList = ({ juegoId, reloadReviews }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            // Petición GET a la nueva ruta
            const response = await axios.get(`http://localhost:3000/api/reviews/${juegoId}`);
            setReviews(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error al cargar las reseñas:", error);
            setLoading(false);
        }
    };

    // Se ejecuta al montar y cuando el formulario de reseña pide recargar (reloadReviews)
    useEffect(() => {
        fetchReviews();
    }, [juegoId, reloadReviews]);

    if (loading) return <p>Cargando comentarios...</p>;
    
    return (
        <div className="review-list-container" style={{ marginTop: '20px' }}>
            <h4>Comentarios ({reviews.length})</h4>
            {reviews.length === 0 ? (
                <p>Aún no hay comentarios.</p>
            ) : (
                reviews.map(review => (
                    <div key={review._id} style={{ border: '1px solid #444', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
                        <DisplayRating rating={review.rating} />
                        <p style={{ margin: '5px 0' }}>{review.comment}</p>
                        <small style={{ color: '#aaa' }}>{new Date(review.createdAt).toLocaleDateString()}</small>
                    </div>
                ))
            )}
        </div>
    );
};

export default ReviewList;