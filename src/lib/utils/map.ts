import type {Map as MapboxMap} from 'mapbox-gl';

import {MAP_LAYERS, ROUTE_COLORS, ROUTE_STYLES, ANIMATION_CONFIG} from '@/config/constants.ts';

// Remove all route layers and sources from map
export function clearRouteLayers(map: MapboxMap): void {
    // Remove main route
    if (map.getLayer(MAP_LAYERS.ROUTE_LINE)) {
        map.removeLayer(MAP_LAYERS.ROUTE_LINE);
    }

    if (map.getSource(MAP_LAYERS.ROUTE_SOURCE)) {
        map.removeSource(MAP_LAYERS.ROUTE_SOURCE);
    }

    // Remove alternative routes (up to 5)
    for (let i = 0; i < 5; i++) {
        const layerId = `${MAP_LAYERS.ALT_ROUTE_LINE}-${i}`;
        const sourceId = `${MAP_LAYERS.ALT_ROUTE_SOURCE}-${i}`;

        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
    }
}

// Remove all highlight layers and sources from map
export function clearHighlightLayers(map: MapboxMap): void {
    const layers = [
        MAP_LAYERS.HIGHLIGHT_FILL,
        MAP_LAYERS.HIGHLIGHT_OUTLINE,
        MAP_LAYERS.HIGHLIGHT_GLOW,
    ];

    layers.forEach((layerId) => {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
    });

    if (map.getSource(MAP_LAYERS.HIGHLIGHT_SOURCE)) {
        map.removeSource(MAP_LAYERS.HIGHLIGHT_SOURCE);
    }
}

// Add main route layer to map
export function addMainRouteLayer(map: MapboxMap, geometry: GeoJSON.Geometry): void {
    map.addSource(MAP_LAYERS.ROUTE_SOURCE, {
        type: 'geojson',
        data: {
            type: 'Feature',
            properties: {},
            geometry,
        },
    });
    map.addLayer({
        id: MAP_LAYERS.ROUTE_LINE,
        type: 'line',
        source: MAP_LAYERS.ROUTE_SOURCE,
        layout: {'line-join': 'round', 'line-cap': 'round'},
        paint: {
            'line-color': ROUTE_COLORS.MAIN,
            'line-width': ROUTE_STYLES.MAIN_WIDTH,
            'line-opacity': ROUTE_STYLES.MAIN_OPACITY,
        },
    });
}

// Add alternative route layer to map
export function addAlternativeRouteLayer(map: MapboxMap, geometry: GeoJSON.Geometry, index: number): void {
    const sourceId = `${MAP_LAYERS.ALT_ROUTE_SOURCE}-${index}`;
    const layerId = `${MAP_LAYERS.ALT_ROUTE_LINE}-${index}`;

    map.addSource(sourceId, {
        type: 'geojson',
        data: {
            type: 'Feature',
            properties: {},
            geometry,
        },
    });
    map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {'line-join': 'round', 'line-cap': 'round'},
        paint: {
            'line-color': ROUTE_COLORS.ALTERNATIVE,
            'line-width': ROUTE_STYLES.ALT_WIDTH,
            'line-opacity': ROUTE_STYLES.ALT_OPACITY,
            'line-dasharray': [...ROUTE_STYLES.ALT_DASH_ARRAY],
        },
    });
}

// Add highlight layers with geometry to map
export function addHighlightLayers(map: MapboxMap, geometry: GeoJSON.Geometry): void {
    map.addSource(MAP_LAYERS.HIGHLIGHT_SOURCE, {
        type: 'geojson',
        data: {
            type: 'Feature',
            properties: {},
            geometry,
        },
    });

    // Fill layer
    map.addLayer({
        id: MAP_LAYERS.HIGHLIGHT_FILL,
        type: 'fill',
        source: MAP_LAYERS.HIGHLIGHT_SOURCE,
        paint: {
            'fill-color': ROUTE_COLORS.HIGHLIGHT,
            'fill-opacity': ANIMATION_CONFIG.HIGHLIGHT_MIN_OPACITY + 0.05,
        },
    });

    // Glow layer
    map.addLayer({
        id: MAP_LAYERS.HIGHLIGHT_GLOW,
        type: 'line',
        source: MAP_LAYERS.HIGHLIGHT_SOURCE,
        paint: {
            'line-color': ROUTE_COLORS.HIGHLIGHT,
            'line-width': ROUTE_STYLES.HIGHLIGHT_GLOW_WIDTH,
            'line-blur': ROUTE_STYLES.HIGHLIGHT_GLOW_BLUR,
            'line-opacity': 0.4,
        },
    });

    // Outline layer
    map.addLayer({
        id: MAP_LAYERS.HIGHLIGHT_OUTLINE,
        type: 'line',
        source: MAP_LAYERS.HIGHLIGHT_SOURCE,
        paint: {
            'line-color': ROUTE_COLORS.HIGHLIGHT_BORDER,
            'line-width': ROUTE_STYLES.HIGHLIGHT_WIDTH,
            'line-opacity': 1,
        },
    });
}

// Start pulsing animation for highlight layers
export function startHighlightAnimation(map: MapboxMap): () => void {
    let fillOpacity = ANIMATION_CONFIG.HIGHLIGHT_MIN_OPACITY + 0.05;
    let glowWidth = ROUTE_STYLES.HIGHLIGHT_GLOW_WIDTH;
    let increasing = true;

    const animationInterval = setInterval(() => {
        if (!map.getLayer(MAP_LAYERS.HIGHLIGHT_FILL)) {
            clearInterval(animationInterval);
            return;
        }

        if (increasing) {
            fillOpacity += ANIMATION_CONFIG.HIGHLIGHT_OPACITY_STEP;
            glowWidth += ANIMATION_CONFIG.HIGHLIGHT_WIDTH_STEP;

            if (fillOpacity >= ANIMATION_CONFIG.HIGHLIGHT_MAX_OPACITY) {
                increasing = false;
            }
        } else {
            fillOpacity -= ANIMATION_CONFIG.HIGHLIGHT_OPACITY_STEP;
            glowWidth -= ANIMATION_CONFIG.HIGHLIGHT_WIDTH_STEP;

            if (fillOpacity <= ANIMATION_CONFIG.HIGHLIGHT_MIN_OPACITY) {
                increasing = true;
            }
        }

        try {
            map.setPaintProperty(MAP_LAYERS.HIGHLIGHT_FILL, 'fill-opacity', fillOpacity);
            map.setPaintProperty(MAP_LAYERS.HIGHLIGHT_GLOW, 'line-width', glowWidth);
        } catch {
            clearInterval(animationInterval);
        }
    }, ANIMATION_CONFIG.HIGHLIGHT_INTERVAL);

    return () => clearInterval(animationInterval);
}

// Create a route label marker element
export function createRouteLabelElement(text: string, isAlternative: boolean = false): HTMLDivElement {
    const element = document.createElement('div');

    element.style.fontFamily = "Vazirmatn, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    element.style.direction = 'rtl';
    element.style.color = '#fff';
    element.style.padding = isAlternative ? '6px 10px' : '8px 12px';
    element.style.borderRadius = '8px';
    element.style.fontSize = isAlternative ? '11px' : '12px';
    element.style.boxShadow = isAlternative ? '0 2px 6px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.3)';
    element.style.whiteSpace = 'nowrap';

    if (isAlternative) {
        element.style.background = 'rgba(0, 0, 0, 0.9)';
        element.style.border = '2px solid #fff';
    } else {
        element.style.background = 'rgba(139, 92, 246, 0.95)';
        element.style.fontWeight = '600';
        element.style.border = '2px solid #fff';
    }

    element.textContent = text;

    return element;
}
