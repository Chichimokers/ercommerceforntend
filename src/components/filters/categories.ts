import {
    FaMusic, FaBook, FaTshirt, FaLaptop, FaHome, FaQuestion,
    FaUtensils, FaHeart, FaDumbbell, FaBaby, FaToolbox, FaSeedling,
    FaCamera, FaCar, FaPaw, FaGamepad, FaPlane, FaBriefcase, FaDragon
} from "react-icons/fa";
import React from "react";

type IconMap = {
    [key: string]: React.ComponentType;
    default: React.ComponentType;
}

// Mapa de palabras clave a iconos
const keywordIconMap: IconMap = {
    musica: FaMusic,
    libro: FaBook,
    ropa: FaTshirt,
    electronica: FaLaptop,
    hogar: FaHome,
    comida: FaUtensils,
    salud: FaHeart,
    deporte: FaDumbbell,
    bebe: FaBaby,
    bricolaje: FaToolbox,
    jardin: FaSeedling,
    foto: FaCamera,
    coche: FaCar,
    mascota: FaPaw,
    juego: FaGamepad,
    viaje: FaPlane,
    trabajo: FaBriefcase,
    juguetes: FaDragon,
    default: FaQuestion
};

// Función de coincidencia aproximada
export const getCategoryIcon = (categoryName: string) => {

    const cleanText = (text: string): string => {
        return text
            .normalize('NFD') // Descompone los caracteres acentuados en su forma base + marca diacrítica
            .replace(/[\u0300-\u036f]/g, '') // Elimina todos los caracteres diacríticos
            .replace(/[^a-zA-Z0-9\s]/g, ''); // Opcional: Elimina cualquier carácter que no sea alfanumérico o espacio
    };

    const lowerName = cleanText(categoryName.toLowerCase());

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