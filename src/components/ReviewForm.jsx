// frontend/src/components/ReviewForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000'; // Define API_URL aquí

// Componente para manejar visualmente las estrellas
const StarRating = ({ rating, setRating }) => {
    return (
        <div style={{ fontSize: '24px', cursor: 'pointer', display: 'flex' }}>
            {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <span 
                        key={index} 
                        style={{ color: starValue <= rating ? '#FFD700' : '#808080' }} 
                        onClick={() => setRating(starValue)}
                    >
                        ★
                    </span>
                );
            })}
        </div>
    );
};

// 🚨 Se añaden los nuevos props: reviewToEdit y onCancelEdit 🚨
const ReviewForm = ({ juegoId, onReviewSubmitted, reviewToEdit, onCancelEdit }) => {
    const [rating, setRating] = useState(0); 
    const [comment, setComment] = useState('');
    const [message, setMessage] = useState('');

    // 🚨 useEffect para precargar datos al editar 🚨
    useEffect(() => {
        if (reviewToEdit) {
            setRating(reviewToEdit.rating);
            setComment(reviewToEdit.comment);
            setMessage(`Estás editando la reseña.`);
        } else {
            // Limpiar el formulario para un nuevo envío
            setRating(0);
            setComment('');
            setMessage('');
        }
    }, [reviewToEdit]); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (rating === 0) {
            setMessage('❌ Por favor, selecciona una calificación.');
            return;
        }

        const reviewData = {
            rating: rating,
            comment: comment,
            // Si el backend espera un campo 'user', se podría añadir aquí
        };
        
        try {
            if (reviewToEdit) {
                // 🚨 Modo EDICIÓN: PUT a /api/reviews/:id 🚨
                const reviewId = reviewToEdit._id;
                await axios.put(`${API_URL}/api/reviews/${reviewId}`, reviewData);
                setMessage('✅ Reseña actualizada con éxito.');
                
            } else {
                // Modo CREACIÓN: POST a /api/reviews
                reviewData.juego = juegoId; 
                await axios.post(`${API_URL}/api/reviews`, reviewData);
                setMessage('✅ Reseña enviada con éxito.');
            }

            // Limpiar formulario y notificar al padre
            setRating(0); 
            setComment(''); 
            onReviewSubmitted(); // Dispara la recarga de reseñas en el padre
            
        } catch (error) {
            console.error("Error al enviar/actualizar reseña:", error.response?.data || error);
            setMessage('❌ Error al procesar reseña. Revisa la consola.');
        }
    };

    return (
        <div className="review-form-container">
            <h3>{reviewToEdit ? 'Editar tu Reseña' : 'Añadir Nueva Reseña'}</h3> 
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
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="submit" style={{ flex: 1 }}>
                        {reviewToEdit ? 'Guardar Cambios' : 'Enviar Reseña'}
                    </button>
                    {reviewToEdit && ( // Botón de cancelar visible solo en modo edición
                        <button 
                            type="button" 
                            onClick={onCancelEdit} 
                            style={{ flex: 1, backgroundColor: '#6c757d', border: 'none', cursor: 'pointer' }}
                        >
                            Cancelar Edición
                        </button>
                    )}
                </div>
            </form>
            {message && <p className={message.startsWith('✅') ? 'success' : 'error'}>{message}</p>}
        </div>
    );
};

export default ReviewForm;