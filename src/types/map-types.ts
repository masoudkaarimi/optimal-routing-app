import type {LngLat} from 'mapbox-gl';

// Route mode types for different transportation methods
export type RouteMode = 'driving' | 'walking' | 'cycling';

// Selection mode for setting start/end points
export type SelectionMode = 'none' | 'start' | 'end';

// Represents a single route with geometry and metrics
export interface SingleRoute {
    geometry: GeoJSON.Geometry;
    distance: number; // in meters
    duration: number; // in seconds
}

// Route information including main route and alternatives
export interface RouteInfo {
    mainRoute: SingleRoute;
    alternativeRoutes: SingleRoute[];
}

// Place information for location cards
export interface PlaceInfo {
    name: string;
    placeName: string;
    center: LngLat;
}

// Geocoding result from search
export interface GeocodingResult {
    id: string;
    name: string;
    placeName: string;
    center: LngLat;
    geometry?: GeoJSON.Geometry;
    bbox?: [number, number, number, number];
    placeTypes?: string[];
}

// Map state interface
export interface MapState {
    // Location points
    startPoint: LngLat | null;
    endPoint: LngLat | null;

    // Labels for locations
    startLabel: string | null;
    endLabel: string | null;

    // Map navigation
    flyToCoords: LngLat | null;
    mapCenter: LngLat | null;

    // Highlighting
    highlightCoords: LngLat | null;
    highlightGeometry: GeoJSON.Geometry | null;

    // Route information
    routeInfo: RouteInfo | null;
    mode: RouteMode;

    // UI states
    selectingMode: SelectionMode;
    currentPlace: PlaceInfo | null;
    routingOpen: boolean;
}

// Map actions interface
export interface MapActions {
    // Point setters
    setStartPoint: (point: LngLat | null) => void;
    setEndPoint: (point: LngLat | null) => void;

    // Label setters
    setStartLabel: (label: string | null) => void;
    setEndLabel: (label: string | null) => void;

    // Navigation setters
    setFlyToCoords: (coords: LngLat | null) => void;
    setMapCenter: (center: LngLat) => void;

    // Highlight setters
    setHighlightCoords: (coords: LngLat | null) => void;
    setHighlightGeometry: (geometry: GeoJSON.Geometry | null) => void;

    // Route setters
    setRouteInfo: (info: RouteInfo | null) => void;
    setMode: (mode: RouteMode) => void;

    // UI setters
    setSelectingMode: (mode: SelectionMode) => void;
    setCurrentPlace: (place: PlaceInfo | null) => void;
    setRoutingOpen: (open: boolean) => void;

    // Utility actions
    resetRoute: () => void;
    swapStartEnd: () => void;
}

// Combined store type
export type MapStore = MapState & MapActions;
