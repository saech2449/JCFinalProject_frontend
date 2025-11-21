// frontend/src/components/Formulario.jsx (Versión Final Corregida)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Asegúrate de tenerlo importado si lo usas

// URL base de tu Backend, donde Express está escuchando
const API_URL = 'http://localhost:3000/api/juegos';
const UPLOAD_URL = 'http://localhost:3000/api/upload/image'; // Endpoint de subida

const Formulario = ({ gameToEdit, onGameSaved }) => {
    const navigate = useNavigate(); // Inicializar useNavigate
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
            // Asegúrate de que platform es un string si lo guardas como array
            setPlatform(Array.isArray(gameToEdit.platform) ? gameToEdit.platform.join(', ') : gameToEdit.platform);
            setHoursPlayed(gameToEdit.hoursPlayed);
            setCompleted(gameToEdit.completed);
            setImageUrl(gameToEdit.imageUrl || '');
            setIsEditing(true);
        } else {
            // Limpiar formulario si es un juego nuevo
            setTitle('');
            setPlatform('');
            setHoursPlayed(0);
            setCompleted(false);
            setImageUrl('');
            setImageFile(null); // Asegurar que no hay archivo cargado
            setIsEditing(false);
        }
        setMessage('');
        setError(null);
    }, [gameToEdit]);

    // Maneja la selección del archivo de imagen
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        // Mostrar una previsualización local (no la que viene del servidor)
        if (file) {
            setImageUrl(URL.createObjectURL(file)); 
        } else if (!gameToEdit) {
             // Si no hay archivo y no estamos editando, limpiar la URL
            setImageUrl('');
        }
    };

    // 2. FUNCIÓN DE SUBIDA (Paso 1 del Submit)
    const uploadImage = async (file) => {
        setImageUploading(true);
        const formData = new FormData();
        formData.append('image', file); // 'image' debe coincidir con upload.single('image')

        try {
            const response = await axios.post(UPLOAD_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setImageUploading(false);
            // Devuelve la URL relativa /uploads/nombre.png
            return response.data.imageUrl; 
        } catch (err) {
            setImageUploading(false);
            setError('❌ Error al subir la imagen. Revisa el tamaño y el Backend.');
            console.error("Error de subida:", err);
            return null; // Devuelve null si falla
        }
    };

    // 3. FUNCIÓN DE ENVÍO FINAL (Paso 2 del Submit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError(null);

        let finalImageUrl = isEditing ? gameToEdit.imageUrl : ''; // Empieza con la URL antigua si estamos editando

        // 🚨 PASO CRÍTICO: Si hay un NUEVO archivo, primero lo subimos.
        if (imageFile) {
            const uploadedUrl = await uploadImage(imageFile);
            if (!uploadedUrl) {
                // Si la subida falló, detenemos el proceso de guardado
                return; 
            }
            finalImageUrl = uploadedUrl; // Usamos la nueva URL
        }

        // Prepara los datos del juego para guardar
        const gameData = {
            title,
            platform: platform.split(',').map(p => p.trim()).filter(p => p),
            hoursPlayed,
            completed,
            imageUrl: finalImageUrl, // Incluimos la URL final (nueva o antigua)
        };
        
        try {
            if (isEditing) {
                await axios.put(`${API_URL}/${gameToEdit._id}`, gameData);
                setMessage('✅ Juego actualizado con éxito.');
            } else {
                await axios.post(API_URL, gameData);
                setMessage('✅ Juego añadido con éxito.');
            }
            
            // Limpiar y notificar al padre
            onGameSaved();
            // Redirigir a la lista de juegos
            navigate('/');

        } catch (err) {
            console.error("Error al guardar juego:", err.response ? err.response.data : err);
            setError(`❌ Error al guardar el juego: ${err.response?.data?.message || err.message}`);
        }
    };


    // 4. EL CÓDIGO JSX
    return (
        <div className="game-form-container">
            <h2>{isEditing ? 'Editar Juego' : 'Añadir Nuevo Juego'}</h2>
            <form onSubmit={handleSubmit}>
                <label>Título:</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                
                {/* 🚨 CAMPO DE SUBIDA DE ARCHIVO 🚨 */}
                <label>Portada (Imagen):</label>
                <input 
                    type="file"
                    accept="image/*" // Solo acepta archivos de imagen
                    onChange={handleFileChange}
                />

                {/* Previsualización y manejo de estado de subida */}
                {/* MUY IMPORTANTE: La URL de previsualización debe ser http://localhost:3000 + imageUrl */}
                {(imageUrl && !imageUploading) && (
                    <img 
                        // Utilizamos el puerto 3000 solo si la URL es relativa (/uploads/...)
                        src={imageUrl.startsWith('/uploads') ? `http://localhost:3000${imageUrl}` : imageUrl} 
                        alt="Portada" 
                        style={{ maxWidth: '100px', margin: '10px 0', border: '1px solid #444' }} 
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
            {message && <p className={message.startsWith('✅') ? 'success' : 'error'}>{message}</p>}
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default Formulario;
