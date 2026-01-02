export const VEHICLES = [
    { 
        id: 'jeep_trad', 
        name: 'Traditional Jeep', 
        icon: 'shuttle-van', // Looks like a Jeepney
        base: 13, 
        perKm: 1.5, 
        color: 'bg-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-500'
    },
    { 
        id: 'jeep_mod', 
        name: 'Modern Jeep', 
        icon: 'bus-alt', // Looks like a Mini-bus/Coaster
        base: 15, 
        perKm: 1.8, 
        color: 'bg-teal-600',
        bg: 'bg-teal-50',
        border: 'border-teal-500'
    },
    { 
        id: 'bus_ord', 
        name: 'Ordinary Bus', 
        icon: 'bus', // Standard Bus
        base: 15, 
        perKm: 2.0, 
        color: 'bg-orange-500',
        bg: 'bg-orange-50',
        border: 'border-orange-500'
    },
    { 
        id: 'bus_ac', 
        name: 'Aircon Bus', 
        icon: 'snowflake', // Distinguishes AC (or use 'bus' if preferred)
        base: 18, 
        perKm: 2.5, 
        color: 'bg-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-500'
    },
];

export const LOCATIONS = [
    "Cubao", "Ayala", "Monumento", "PITX", "Buendia", "Fairview", "Baclaran", "Ortigas"
];