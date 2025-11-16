// Initial map view settings
export const MAP_CONFIG = {
    INITIAL_LNG: 51.3890,
    INITIAL_LAT: 35.6892,
    INITIAL_ZOOM: 10,
    DEFAULT_PADDING: 80,
    FLY_DURATION: 2000,
    FIT_BOUNDS_DURATION: 1000,
} as const;

// Map style URLs
export const MAP_STYLES = {
    STREETS: 'mapbox://styles/mapbox/streets-v12',
    SATELLITE: 'mapbox://styles/mapbox/satellite-v9',
    LIGHT: 'mapbox://styles/mapbox/light-v11',
    DARK: 'mapbox://styles/mapbox/dark-v11',
} as const;

// Map layer IDs
export const MAP_LAYERS = {
    ROUTE_LINE: 'route-line',
    ROUTE_SOURCE: 'route-source',
    ALT_ROUTE_LINE: 'alt-route-line',
    ALT_ROUTE_SOURCE: 'alt-route-source',
    HIGHLIGHT_FILL: 'highlight-fill',
    HIGHLIGHT_OUTLINE: 'highlight-outline',
    HIGHLIGHT_GLOW: 'highlight-glow',
    HIGHLIGHT_SOURCE: 'highlight-source',
} as const;

// Marker colors
export const MARKER_COLORS = {
    START: '#717FFC',
    END: '#d30000',
    DEFAULT: '#3FB1CE',
} as const;

// Route colors
export const ROUTE_COLORS = {
    MAIN: '#8A1EF7',
    ALTERNATIVE: '#37474f',
    HIGHLIGHT: '#6d9df1',
    HIGHLIGHT_BORDER: '#1A73E8',
} as const;

// Route styling
export const ROUTE_STYLES = {
    MAIN_WIDTH: 8,
    MAIN_OPACITY: 0.95,
    ALT_WIDTH: 7,
    ALT_OPACITY: 0.75,
    ALT_DASH_ARRAY: [0.5, 1.5],
    HIGHLIGHT_WIDTH: 2.5,
    HIGHLIGHT_GLOW_WIDTH: 6,
    HIGHLIGHT_GLOW_BLUR: 3,
} as const;

// Animation settings
export const ANIMATION_CONFIG = {
    HIGHLIGHT_MIN_OPACITY: 0.15,
    HIGHLIGHT_MAX_OPACITY: 0.35,
    HIGHLIGHT_OPACITY_STEP: 0.01,
    HIGHLIGHT_WIDTH_STEP: 0.25,
    HIGHLIGHT_INTERVAL: 50,
} as const;

// Geocoding settings
export const GEOCODING_CONFIG = {
    DEBOUNCE_DELAY: 300,
    MIN_QUERY_LENGTH: 3,
    DEFAULT_LIMIT: 10,
    SEARCH_TYPES: 'poi,address,place,locality,neighborhood,region,district,country',
    POI_TYPES: 'poi',
    AREA_TYPES: 'place,locality,district,region,neighborhood',
    FALLBACK_RADIUS_KM: 0.5,
    BUFFER_STEPS: 64,
} as const;

// Iran bounding box
export const IRAN_BBOX: [number, number, number, number] = [44.0, 24.0, 63.5, 40.5];

// API URLs
export const API_URLS = {
    MAPBOX_DIRECTIONS: 'https://api.mapbox.com/directions/v5/mapbox',
    MAPBOX_GEOCODING: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
    MAPBOX_TILEQUERY: 'https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery',
    OSM_NOMINATIM: 'https://nominatim.openstreetmap.org',
    MAPBOX_RTL_PLUGIN: 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
} as const;

// HTTP Headers
export const HTTP_HEADERS = {
    USER_AGENT: 'OptimalRoutingApp/1.0',
} as const;

