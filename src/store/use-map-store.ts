import {create} from 'zustand';

import type {MapStore} from '@/types/map-types';

export const useMapStore = create<MapStore>((set, get) => ({
    // Initial state
    startPoint: null,
    endPoint: null,
    startLabel: null,
    endLabel: null,
    flyToCoords: null,
    highlightCoords: null,
    highlightGeometry: null,
    routeInfo: null,
    mode: 'driving',
    selectingMode: 'none',
    currentPlace: null,
    routingOpen: false,
    mapCenter: null,

    // Point setters
    setStartPoint: (point) => set({startPoint: point}),
    setEndPoint: (point) => set({endPoint: point}),

    // Label setters
    setStartLabel: (label) => set({startLabel: label}),
    setEndLabel: (label) => set({endLabel: label}),

    // Navigation setters
    setFlyToCoords: (coords) => set({flyToCoords: coords}),
    setMapCenter: (center) => set({mapCenter: center}),

    // Highlight setters
    setHighlightCoords: (coords) => set({highlightCoords: coords}),
    setHighlightGeometry: (geometry) => set({highlightGeometry: geometry}),

    // Route setters
    setRouteInfo: (info) => set({routeInfo: info}),
    setMode: (mode) => set({mode}),

    // UI setters
    setSelectingMode: (mode) => set({selectingMode: mode}),
    setCurrentPlace: (place) => set({currentPlace: place}),
    setRoutingOpen: (open) => set({routingOpen: open}),

    // Utility actions
    resetRoute: () =>
        set({
            startPoint: null,
            endPoint: null,
            startLabel: null,
            endLabel: null,
            routeInfo: null,
            flyToCoords: null,
            highlightCoords: null,
            highlightGeometry: null,
            selectingMode: 'none',
        }),

    swapStartEnd: () => {
        const {startPoint, endPoint, startLabel, endLabel} = get();
        set({
            startPoint: endPoint,
            endPoint: startPoint,
            startLabel: endLabel,
            endLabel: startLabel,
        });
    },
}));
