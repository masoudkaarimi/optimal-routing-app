import type {LngLat} from 'mapbox-gl';
import * as turf from '@turf/turf';

import {API_URLS, HTTP_HEADERS, GEOCODING_CONFIG} from '@/config/constants';

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface OSMNominatimResult {
    geojson?: GeoJSON.Geometry;
    class?: string;
    type?: string;
}

interface OSMSearchOptions {
    countryCodes?: string;
    limit?: number;
}

// Fetch boundary from OpenStreetMap Nominatim reverse geocoding
async function getOSMBoundary(lngLat: LngLat): Promise<GeoJSON.Geometry | null> {
    try {
        const url = `${API_URLS.OSM_NOMINATIM}/reverse?format=json&lat=${lngLat.lat}&lon=${lngLat.lng}&polygon_geojson=1&zoom=14`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': HTTP_HEADERS.USER_AGENT,
            },
        });

        if (!response.ok) return null;

        const data = await response.json();

        if (data.geojson && (data.geojson.type === 'Polygon' || data.geojson.type === 'MultiPolygon')) {
            console.log('Found boundary from OSM Nominatim');
            return data.geojson;
        }

        return null;
    } catch (error) {
        console.error('Error fetching OSM boundary:', error);
        return null;
    }
}

// Get administrative boundary for a point using multiple strategies
export async function getBoundaryForPoint(lngLat: LngLat): Promise<GeoJSON.Geometry | null> {
    try {
        // Strategy 1: Try OSM Nominatim (most accurate)
        const osmBoundary = await getOSMBoundary(lngLat);
        if (osmBoundary) return osmBoundary;

        // Strategy 2: Try Mapbox Tilequery
        const url = `${API_URLS.MAPBOX_TILEQUERY}/${lngLat.lng},${lngLat.lat}.json?layers=place_label,poi_label&limit=10&access_token=${MAPBOX_ACCESS_TOKEN}`;
        const response = await fetch(url);

        if (!response.ok) return null;

        const data = await response.json();
        const features: Array<{ geometry?: GeoJSON.Geometry }> = data.features || [];

        // Find feature with polygon geometry
        const boundaryFeature = features.find((f) => f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'));

        if (boundaryFeature) {
            console.log('Found boundary from Mapbox Tilequery');
            return boundaryFeature.geometry as GeoJSON.Geometry;
        }

        return null;
    } catch (error) {
        console.error('Error fetching boundary:', error);
        return null;
    }
}

// Create a circular buffer polygon around a point
export function createBufferPolygon(lngLat: LngLat, radiusKm: number = GEOCODING_CONFIG.FALLBACK_RADIUS_KM): GeoJSON.Feature {
    const options = {
        steps: GEOCODING_CONFIG.BUFFER_STEPS,
        units: 'kilometers' as const,
    };

    return turf.circle([lngLat.lng, lngLat.lat], radiusKm, options);
}

// Get boundary from OSM Nominatim by place name
export async function getOSMBoundaryByName(placeName: string, options?: OSMSearchOptions): Promise<GeoJSON.Geometry | null> {
    try {
        const params = new URLSearchParams({
            q: placeName,
            format: 'json',
            polygon_geojson: '1',
            addressdetails: '1',
            extratags: '1',
            limit: String(options?.limit ?? 3),
            ...(options?.countryCodes ? {countrycodes: options.countryCodes} : {}),
        });

        const url = `${API_URLS.OSM_NOMINATIM}/search?${params.toString()}`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': HTTP_HEADERS.USER_AGENT,
            },
        });

        if (!response.ok) return null;

        const data = (await response.json()) as OSMNominatimResult[];

        if (!Array.isArray(data) || data.length === 0) return null;

        // Prefer administrative boundaries
        const adminBoundary = data.find((f) => f.class === 'boundary' && (f.type === 'administrative' || f.type === 'political')) || data.find((f) => f.class === 'place' && !!f.type) || data[0];
        const geometry = adminBoundary?.geojson;

        if (geometry && (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon')) {
            return geometry;
        }

        return null;
    } catch (error) {
        console.error('Error fetching OSM boundary by name:', error);
        return null;
    }
}

// Extract admin boundary from full address string with fallback strategies
export async function getAdminBoundaryFromAddressString(address: string, fallbackPoint?: LngLat): Promise<GeoJSON.Geometry | null> {
    // Strategy 1: Try full address string
    let geometry = await getOSMBoundaryByName(address, {
        countryCodes: 'ir',
        limit: 5,
    });

    if (geometry) return geometry;

    // Strategy 2: Try progressively larger area parts (from right to left in Persian)
    const parts = address.split(',').map((s) => s.trim()).filter(Boolean);

    for (let i = parts.length - 1; i >= 0; i--) {
        const areaPart = parts.slice(i).join(', ');
        geometry = await getOSMBoundaryByName(areaPart, {
            countryCodes: 'ir',
            limit: 3,
        });
        if (geometry) return geometry;
    }

    // Strategy 3: Use fallback point if provided
    if (fallbackPoint) {
        const boundaryByPoint = await getBoundaryForPoint(fallbackPoint);
        if (boundaryByPoint) return boundaryByPoint;
    }

    return null;
}
