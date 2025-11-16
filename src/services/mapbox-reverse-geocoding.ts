import mapboxgl, {type LngLat} from 'mapbox-gl';

import {API_URLS} from '@/config/constants';
import type {PlaceInfo} from '@/types/map-types';

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface MapboxFeature {
    text_fa?: string;
    text?: string;
    place_name_fa?: string;
    place_name?: string;
    center?: [number, number];
    context?: Array<{
        text_fa?: string;
        text?: string;
    }>;
}

interface MapboxReverseGeocodeResponse {
    features?: MapboxFeature[];
}

// Reverse geocode a coordinate to get place information
export async function reverseGeocode(lngLat: LngLat): Promise<PlaceInfo | null> {
    const {lng, lat} = lngLat;
    const params = new URLSearchParams({
        access_token: String(MAPBOX_ACCESS_TOKEN ?? ''),
        language: 'fa,en',
        limit: '1',
        types: 'poi,address,place,neighborhood,locality,street,district,region',
    });
    const url = `${API_URLS.MAPBOX_GEOCODING}/${lng},${lat}.json?${params.toString()}`;

    try {
        const response = await fetch(url);
        if (!response.ok) return null;

        const data = (await response.json()) as MapboxReverseGeocodeResponse;
        const feature = data.features?.[0];

        if (!feature) return null;

        // Try to get the best available name
        const text = feature.text_fa || feature.text || '';
        const placeName = feature.place_name_fa || feature.place_name || '';
        let displayName = text || placeName;

        // Fallback to context hierarchy if no name found
        if (!displayName && feature.context) {
            const contextName = feature.context[0]?.text_fa || feature.context[0]?.text;
            if (contextName) displayName = contextName;
        }

        // Final fallback
        if (!displayName) displayName = 'معبر بدون نام';

        return {
            name: displayName,
            placeName,
            center: new mapboxgl.LngLat(
                feature.center?.[0] ?? lng,
                feature.center?.[1] ?? lat
            ),
        };
    } catch (error) {
        console.error('Reverse geocoding failed:', error);
        return null;
    }
}
