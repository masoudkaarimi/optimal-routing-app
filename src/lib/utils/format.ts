// Convert number to Persian numerals
export function formatNumberPersian(value: number, fractionDigits = 0): string {
    return new Intl.NumberFormat('fa-IR', {
        maximumFractionDigits: fractionDigits,
        minimumFractionDigits: fractionDigits,
    }).format(value);
}

// Format distance in Persian with appropriate unit
export function formatDistancePersian(meters: number): string {
    if (meters < 1000) {
        return `${formatNumberPersian(Math.round(meters))} متر`;
    }

    const kilometers = meters / 1000;
    return `${formatNumberPersian(kilometers, 1)} کیلومتر`;
}

// Format duration in Persian with appropriate unit
export function formatDurationPersian(seconds: number): string {
    if (seconds < 60) {
        return `${formatNumberPersian(seconds)} ثانیه`;
    }

    const minutes = Math.round(seconds / 60);

    if (minutes < 60) {
        return `${formatNumberPersian(minutes)} دقیقه`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
        return `${formatNumberPersian(hours)} ساعت`;
    }

    return `${formatNumberPersian(hours)} ساعت و ${formatNumberPersian(remainingMinutes)} دقیقه`;
}

// Format coordinates as string
export function formatCoordinates(lat: number, lng: number, precision = 5): string {
    return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
}

