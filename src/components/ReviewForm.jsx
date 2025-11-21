// frontend/src/components/ReviewForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

// Componente para manejar visualmente las estrellas
const StarRating = ({ rating, setRating }) => {
    return (
        <div style={{ fontSize: '24px', cursor: 'pointer', display: 'flex' }}>
            {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <span 
                        key={index} 
                        style={{ color: starValue <= rating ? '#FFD700' : '#808080' }} // Dorado si está activa
                        onClick={() => setRating(starValue)}
                    >
                        ★
                    </span>
                );
            })}
        </div>
    );
};

const ReviewForm = ({ juegoId, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0); // Calificación inicial (0)
    const [comment, setComment] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (rating === 0) {
            setMessage('❌ Por favor, selecciona una calificación.');
            return;
        }

        const reviewData = {
            juego: juegoId, // El ID del juego que estamos reseñando
            rating: rating,
            comment: comment,
        };

        try {
            await axios.post('http://localhost:3000/api/reviews', reviewData);
            setMessage('✅ Reseña enviada con éxito.');
            setRating(0); // Limpiar estrellas
            setComment(''); // Limpiar comentario
            onReviewSubmitted(); // Notifica al padre que debe recargar la lista de reseñas
        } catch (error) {
            console.error("Error al enviar reseña:", error.response || error);
            setMessage('❌ Error al enviar reseña. Revisa la consola.');
        }
    };

    return (
        <div className="review-form-container">
            <h3>Tu Opinión</h3>
            <form onSubmit={handleSubmit}>
                <label>Calificación (1-5 Estrellas):</label>
                <StarRating rating={rating} setRating={setRating} />
                
                <label style={{marginTop: '15px'}}>Comentario:</label>
                <textarea
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                ></textarea>
                
                <button type="submit" style={{marginTop: '10px'}}>Enviar Reseña</button>
            </form>
            {message && <p className={message.startsWith('✅') ? 'success' : 'error'}>{message}</p>}
        </div>
    );
};

export default ReviewForm;