"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface Location {
    province: string;
    municipality: string;
}

const LocationContext = createContext<{
    location: Location;
    setLocation: (location: Location) => void;
} | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
    const [location, setLocationState] = useState<Location>(() => {
        if (typeof window !== "undefined") {
            const savedLocation = localStorage.getItem("location");
            return savedLocation ? JSON.parse(savedLocation) : { province: "", municipality: "" };
        }
        return { province: "", municipality: "" };
    });

    const setLocation = (newLocation: Location) => {
        setLocationState(newLocation);
        localStorage.setItem("location", JSON.stringify(newLocation));
    };

    return (
        <LocationContext.Provider value={{ location, setLocation }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error("useLocation debe usarse dentro de un LocationProvider");
    }
    return context;
}
