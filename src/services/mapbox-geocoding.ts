import mapboxgl from 'mapbox-gl';

import type {GeocodingResult} from '@/types/map-types';
import {API_URLS, GEOCODING_CONFIG, IRAN_BBOX} from '@/config/constants';
import {useMapStore} from '@/store/use-map-store';

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface MapboxFeature {
    id?: string;
    text?: string;
    text_fa?: string;
    place_name?: string;
    place_name_fa?: string;
    center?: [number, number];
    geometry?: GeoJSON.Geometry;
    bbox?: [number, number, number, number];
    place_type?: string[];
}

interface FetchOptions {
    types?: string;
    proximity?: { lng: number; lat: number } | null;
    bbox?: [number, number, number, number] | null;
    limit?: number;
}

// Convert bbox array to API parameter string
function bboxToParam(bbox?: [number, number, number, number]): string | undefined {
    return bbox ? `${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}` : undefined;
}

// Fetch geocoding results from Mapbox API
async function fetchMapboxGeocoding(query: string, options: FetchOptions): Promise<MapboxFeature[]> {
    const params = new URLSearchParams({
        access_token: String(MAPBOX_ACCESS_TOKEN ?? ''),
        autocomplete: 'true',
        language: 'fa,en',
        country: 'IR',
        limit: String(options.limit ?? GEOCODING_CONFIG.DEFAULT_LIMIT),
        types: options.types ?? GEOCODING_CONFIG.SEARCH_TYPES,
        geometry: 'polygon',
    });

    if (options.proximity) {
        params.set('proximity', `${options.proximity.lng},${options.proximity.lat}`);
    }

    if (options.bbox) {
        params.set('bbox', bboxToParam(options.bbox)!);
    }

    const url = `${API_URLS.MAPBOX_GEOCODING}/${encodeURIComponent(query)}.json?${params.toString()}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            console.error('Geocoding failed:', response.status, errorText);
            return [];
        }

        const data = await response.json();
        return Array.isArray(data?.features) ? (data.features as MapboxFeature[]) : [];
    } catch (error) {
        console.error('Geocoding request failed:', error);
        return [];
    }
}

// Map Mapbox feature to GeocodingResult
function mapFeatureToResult(feature: MapboxFeature): GeocodingResult {
    const name = feature.text_fa || feature.text || '';
    const placeName = feature.place_name_fa || feature.place_name || '';
    const displayName = name || placeName || 'معبر بدون نام';

    const center = new mapboxgl.LngLat(
        feature.center?.[0] ?? 0,
        feature.center?.[1] ?? 0
    );

    return {
        id: feature.id ?? `${feature.center?.[0]}-${feature.center?.[1]}-${feature.text}`,
        name: displayName,
        placeName,
        center,
        geometry: feature.geometry,
        bbox: feature.bbox,
        placeTypes: feature.place_type ?? [],
    };
}

// Pick the best area feature from results
function pickAreaFeature(features: MapboxFeature[]): MapboxFeature | undefined {
    const areaTypes = ['place', 'locality', 'district', 'region', 'neighborhood'];
    return features.find((f) => (f.place_type || []).some((type) => areaTypes.includes(type))) || features[0];
}

// Main geocoding function with smart multi-stage search
export async function getGeocoding(query: string): Promise<GeocodingResult[]> {
    if (!query || query.trim() === '') return [];

    // Normalize and detect composite queries
    const parts = query.split(/[,،]/).map((s) => s.trim()).filter(Boolean);

    // Get current map center for proximity bias
    const center = useMapStore.getState().mapCenter;

    // Multi-stage search for composite queries (e.g., "تهران، خیابان انقلاب")
    if (parts.length >= 2) {
        const detail = parts[parts.length - 1]; // street/poi
        const area = parts.slice(0, parts.length - 1).join(', ');

        // Stage 1: Find the area
        const areaFeatures = await fetchMapboxGeocoding(area, {
            types: 'place,locality,district,region,neighborhood',
            proximity: center ? {lng: center.lng, lat: center.lat} : null,
            bbox: IRAN_BBOX,
            limit: 5,
        });

        if (areaFeatures.length > 0) {
            const areaFeature = pickAreaFeature(areaFeatures);
            const areaBbox = areaFeature?.bbox as [number, number, number, number] | undefined;
            const areaCenter = areaFeature?.center
                ? {lng: areaFeature.center[0]!, lat: areaFeature.center[1]!}
                : center
                    ? {lng: center.lng, lat: center.lat}
                    : null;

            // Stage 2: Find detail within area
            const detailFeatures = await fetchMapboxGeocoding(detail, {
                proximity: areaCenter,
                bbox: areaBbox,
                limit: 10,
            });

            if (detailFeatures.length > 0) {
                return detailFeatures.map(mapFeatureToResult);
            }
        }
    }

    // Simple single-query search with proximity bias
    const features = await fetchMapboxGeocoding(query, {
        types: GEOCODING_CONFIG.SEARCH_TYPES,
        proximity: center ? {lng: center.lng, lat: center.lat} : null,
        bbox: IRAN_BBOX,
        limit: GEOCODING_CONFIG.DEFAULT_LIMIT,
    });

    return features.map(mapFeatureToResult);
}
