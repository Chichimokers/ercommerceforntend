import { Music, Book, Shirt, Laptop, Home, BoxesIcon, Utensils, Heart, Dumbbell, Baby, Camera, Car, PawPrint, Gamepad2, Plane, Briefcase, BabyIcon, LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

type IconMap = {
    [key: string]: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    default: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

const keywordIconMap: IconMap = {
    musica: Music,
    libro: Book,
    ropa: Shirt,
    electronica: Laptop,
    hogar: Home,
    comida: Utensils,
    salud: Heart,
    deporte: Dumbbell,
    bebe: Baby,
    foto: Camera,
    coche: Car,
    mascota: PawPrint,
    juego: Gamepad2,
    viaje: Plane,
    trabajo: Briefcase,
    juguetes: BabyIcon,
    default: BoxesIcon,
};

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