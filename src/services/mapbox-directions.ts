import type {LngLat} from 'mapbox-gl';

import {API_URLS} from '@/config/constants';
import type {RouteInfo, RouteMode} from '@/types/map-types';

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface MapboxRoute {
    geometry: GeoJSON.Geometry;
    distance: number;
    duration: number;
}

interface MapboxDirectionsResponse {
    routes?: MapboxRoute[];
}

// Fetch optimal route from Mapbox Directions API
export async function getRoute(start: LngLat, end: LngLat, mode: RouteMode = 'driving'): Promise<RouteInfo | null> {
    const coords = `${start.lng},${start.lat};${end.lng},${end.lat}`;
    const url = `${API_URLS.MAPBOX_DIRECTIONS}/${mode}/${coords}?geometries=geojson&alternatives=true&access_token=${MAPBOX_ACCESS_TOKEN}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Directions API failed with status ${response.status}`);
        }

        const data = (await response.json()) as MapboxDirectionsResponse;

        if (!data.routes || data.routes.length === 0) {
            throw new Error('No routes found');
        }

        // Main route is the first (most optimal)
        const [mainRoute, ...alternativeRoutes] = data.routes;

        return {
            mainRoute: {
                geometry: mainRoute.geometry,
                distance: mainRoute.distance,
                duration: mainRoute.duration,
            },
            alternativeRoutes: alternativeRoutes.map((route) => ({
                geometry: route.geometry,
                distance: route.distance,
                duration: route.duration,
            })),
        };
    } catch (error) {
        console.error('Error fetching route:', error);
        return null;
    }
}