// frontend/src/components/Formulario.jsx (Versión Final Corregida)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// URL base de tu Backend, donde Express está escuchando
const API_URL = 'http://localhost:3000/api/juegos';
const UPLOAD_URL = 'http://localhost:3000/api/upload/image'; // Endpoint de subida

const Formulario = ({ gameToEdit, onGameSaved, onCancel }) => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [platform, setPlatform] = useState('');
    const [hoursPlayed, setHoursPlayed] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // ESTADOS DE IMAGEN
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState(''); // URL que se guarda en la DB
    const [imageUploading, setImageUploading] = useState(false);

    // 1. CARGA DE DATOS EXISTENTES PARA EDICIÓN
    useEffect(() => {
        if (gameToEdit) {
            setTitle(gameToEdit.title);
            // Asegúrate de que las plataformas se muestren como cadena, si es un array
            setPlatform(Array.isArray(gameToEdit.platform) ? gameToEdit.platform.join(', ') : gameToEdit.platform);
            setHoursPlayed(gameToEdit.hoursPlayed);
            setCompleted(gameToEdit.completed);
            setImageUrl(gameToEdit.imageUrl || '');
            setIsEditing(true);
            setMessage('');
            setError(null);
        } else {
            // Limpiar formulario si no hay juego para editar
            setTitle('');
            setPlatform('');
            setHoursPlayed(0);
            setCompleted(false);
            setImageFile(null);
            setImageUrl('');
            setIsEditing(false);
        }
    }, [gameToEdit]);


    // 2. FUNCIÓN PARA SUBIR IMAGEN
    const handleImageUpload = async () => {
        if (!imageFile) return imageUrl; // Si no hay archivo nuevo, devuelve la URL existente

        setImageUploading(true);
        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const response = await axios.post(UPLOAD_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const newUrl = response.data.imageUrl;
            setImageUploading(false);
            return newUrl; // Devuelve la URL del archivo subido
        } catch (uploadError) {
            setImageUploading(false);
            setError('Error al subir la imagen. Por favor, inténtalo de nuevo.');
            console.error('Error de subida:', uploadError.response ? uploadError.response.data : uploadError.message);
            return imageUrl; // En caso de error, mantiene la URL anterior si existe
        }
    };


    // 3. FUNCIÓN PARA ENVIAR EL FORMULARIO
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage('');

        // Manejar la subida de imagen antes de guardar los datos del juego
        const finalImageUrl = await handleImageUpload();
        if (imageUploading) return; // Si la subida falló o está en curso (debería ser handled en handleImageUpload)

        // Prepara los datos del juego
        const gameData = {
            title,
            // Convierte la cadena de plataformas a un array
            platform: platform.split(',').map(p => p.trim()).filter(p => p),
            hoursPlayed,
            completed,
            imageUrl: finalImageUrl, // Usa la URL final (nueva o existente)
        };

        try {
            let response;
            if (isEditing) {
                // Modo Edición (PUT)
                response = await axios.put(`${API_URL}/${gameToEdit._id}`, gameData);
                setMessage('✅ Juego actualizado con éxito.');
            } else {
                // Modo Añadir (POST)
                response = await axios.post(API_URL, gameData);
                setMessage('✅ Juego añadido con éxito.');
            }
            
            // Llama a la función de callback para recargar la lista y resetear el estado
            onGameSaved(); 

            // Si estamos en la ruta /add, navegar a la principal después de guardar
            if (!isEditing && navigate) {
                setTimeout(() => navigate('/'), 1500); 
            }

            // Limpia el formulario si no está en modo edición (en la misma página)
            if (!isEditing) {
                setTitle('');
                setPlatform('');
                setHoursPlayed(0);
                setCompleted(false);
                setImageFile(null);
                setImageUrl('');
            }
            
        } catch (submitError) {
            console.error("Error al guardar el juego:", submitError.response || submitError);
            setError(`❌ Error al ${isEditing ? 'actualizar' : 'añadir'} el juego. Asegúrate de que el título no esté vacío.`);
        }
    };

    // Control para el input de archivo
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);

        // Previsualización local (opcional)
        if (file) {
            setImageUrl(URL.createObjectURL(file));
        } else if (!gameToEdit) {
            // Limpia si el usuario cancela la selección y no estaba editando
            setImageUrl(''); 
        }
    };
    
    // Si estamos editando y el juego se seleccionó en la lista principal, permitir cancelar
    const showCancelButton = isEditing && onCancel;

    return (
        <div className="form-container">
            <h2>{isEditing ? 'Editar Juego' : 'Añadir Nuevo Juego'}</h2>
            
            {/* Botón de Cancelar solo visible en el modo edición en la lista principal */}
            {showCancelButton && (
                <button 
                    onClick={onCancel} 
                    style={{ 
                        backgroundColor: '#d32f2f', 
                        color: 'white', 
                        padding: '8px 15px', 
                        borderRadius: '6px', 
                        border: 'none', 
                        cursor: 'pointer',
                        marginBottom: '15px'
                    }}
                >
                    Cancelar Edición
                </button>
            )}

            <form onSubmit={handleSubmit} className="game-form">
                
                <label>Título:</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                
                <label htmlFor="image-upload">Portada del Juego:</label>
                <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                    // No es requerido al editar
                    required={!isEditing}
                />

                {/* Previsualización de la imagen */}
                {(imageUrl && !imageUploading) && (
                    <img 
                        src={imageUrl} 
                        alt="Previsualización de la portada" 
                        className="image-preview" 
                        // El estilo se mueve a App.css con la clase image-preview
                    />
                )}
                {imageUploading && <p>Subiendo imagen...</p>}
                
                <label>Plataforma(s) (separadas por coma):</label>
                <input
                    type="text"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    required
                />

                <label>Horas Jugadas:</label>
                <input
                    type="number"
                    value={hoursPlayed}
                    onChange={(e) => setHoursPlayed(e.target.value)}
                    min="0"
                />

                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={completed}
                        onChange={(e) => setCompleted(e.target.checked)}
                    />
                    Juego Completado
                </label>

                <button type="submit" disabled={imageUploading}>
                    {isEditing ? 'Guardar Cambios' : 'Añadir Juego'}
                </button>
            </form>
            {/* Mensajes de feedback usando las clases 'success' y 'error' */}
            {message && <p className={message.startsWith('✅') ? 'success' : 'error'}>{message}</p>}
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default Formulario;