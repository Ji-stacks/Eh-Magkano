export const calculateFare = (distance, vehicle) => {
    if (!vehicle || !distance) return 0;
    
    let total = vehicle.base;
    
    // Logic: Base fare covers first 4km. Add perKm for every km after 4.
    if (distance > 4) {
        total += (distance - 4) * vehicle.perKm;
    }
    
    return Math.round(total);
};