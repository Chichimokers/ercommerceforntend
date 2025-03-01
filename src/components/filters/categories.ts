import {
    FaMusic, FaBook, FaTshirt, FaLaptop, FaHome, FaQuestion,
    FaUtensils, FaHeart, FaDumbbell, FaBaby, FaToolbox, FaSeedling,
    FaCamera, FaCar, FaPaw, FaGamepad, FaPlane, FaBriefcase
} from "react-icons/fa";

type IconMap = {
    [key: string]: React.ComponentType;
    default: React.ComponentType;
}

// Mapa de palabras clave a iconos
const keywordIconMap: IconMap = {
    música: FaMusic,
    libro: FaBook,
    ropa: FaTshirt,
    electróni: FaLaptop,
    hogar: FaHome,
    comida: FaUtensils,
    salud: FaHeart,
    deporte: FaDumbbell,
    bebé: FaBaby,
    bricolaje: FaToolbox,
    jardín: FaSeedling,
    foto: FaCamera,
    coche: FaCar,
    mascota: FaPaw,
    juego: FaGamepad,
    viaje: FaPlane,
    trabajo: FaBriefcase,
    default: FaQuestion
};

// Función de coincidencia aproximada
export const getCategoryIcon = (categoryName: string) => {
    const lowerName = categoryName.toLowerCase();

    // Buscar coincidencia en palabras clave
    const matchedKey = Object.keys(keywordIconMap).find(key =>
        lowerName.includes(key) && key !== 'default'
    );

    return matchedKey ? keywordIconMap[matchedKey] : keywordIconMap.default;
};

export const getCategoryColor = (categoryName: string) => {
    const colors = [
        'text-red-600', 'text-blue-600', 'text-green-600',
        'text-purple-600', 'text-pink-600', 'text-yellow-600'
    ];
    const hash = Array.from(categoryName).reduce(
        (acc, char) => acc + char.charCodeAt(0), 0
    );
    return colors[hash % colors.length];
};