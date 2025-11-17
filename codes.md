# Context for Project: optimal-routing-app

## File: `.gitignore`

```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

```

---

## File: `eslint.config.js`

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import {defineConfig, globalIgnores} from 'eslint/config'

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
            // reactRefresh.configs.vite,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
    },
])

```

---

## File: `index.html`

```html
<!doctype html>
<html lang="fa" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Optimal Routing App</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

```

---

## File: `vite.config.ts`

```ts
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import {defineConfig} from "vite"

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss()
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})
```

---

## File: `src/app.tsx`

```tsx
import {useEffect, Suspense, lazy} from 'react';

import {useMapStore} from '@/store/use-map-store';
import SearchBox from '@/components/features/map/search-box.tsx';
import {RoutePanel} from '@/components/features/map/route-panel.tsx';
import {PlaceInfoCard} from '@/components/features/map/place-info-card.tsx';
import {formatDistancePersian, formatDurationPersian} from '@/lib/utils';
import {Button} from "@/components/ui/button.tsx";

const MapBox = lazy(() => import('@/components/features/map/map-box.tsx'));

function MapLoadingFallback() {
    return (
        <div className="w-screen h-screen flex items-center justify-center bg-muted">
            <p className="text-lg text-muted-foreground animate-pulse">
                در حال بارگذاری نقشه...
            </p>
        </div>
    );
}

export default function App() {
    const {
        routeInfo,
        resetRoute,
        setRoutingOpen,
    } = useMapStore();

    // Global keyboard shortcut: Ctrl/Cmd + K to open routing panel
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setRoutingOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setRoutingOpen]);

    const distanceText = routeInfo ? formatDistancePersian(routeInfo.mainRoute.distance) : '';
    const durationText = routeInfo ? formatDurationPersian(routeInfo.mainRoute.duration) : '';

    return (
        <main className="w-screen h-screen relative">
            {/* Search box */}
            <SearchBox/>

            {/* Action buttons */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Button
                    variant="outline"
                    className="shadow-xl"
                    onClick={() => setRoutingOpen(true)}
                    aria-label="Open routing panel"
                >
                    مسیریابی
                </Button>
                {routeInfo && (
                    <Button
                        variant="default"
                        className="shadow-xl"
                        onClick={resetRoute}
                        title="ریست مسیر"
                        aria-label="Reset route"
                    >
                        بازنشانی مسیریابی
                    </Button>
                )}
            </div>

            {/* Route summary badge - responsive position */}
            {routeInfo && (<div
                className="fixed w-full max-w-max text-center bottom-14 sm:absolute sm:bottom-4 sm:top-auto left-1/2 -translate-x-1/2 z-30 rounded-md bg-black/80 text-white px-4 py-2 text-sm shadow-xl backdrop-blur-sm">{distanceText} • {durationText}</div>)}

            {/* Main map component */}
            <Suspense fallback={<MapLoadingFallback/>}>
                <MapBox/>
            </Suspense>

            {/* Routing panel dialog */}
            <RoutePanel/>

            {/* Place information bottom sheet */}
            <PlaceInfoCard/>
        </main>
    );
}
```

---

## File: `src/index.css`

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

html, body, #root {
    font-family: 'Vazirmatn', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}

@theme inline {
    --radius-sm: calc(var(--radius) - 4px);
    --radius-md: calc(var(--radius) - 2px);
    --radius-lg: var(--radius);
    --radius-xl: calc(var(--radius) + 4px);
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --color-card: var(--card);
    --color-card-foreground: var(--card-foreground);
    --color-popover: var(--popover);
    --color-popover-foreground: var(--popover-foreground);
    --color-primary: var(--primary);
    --color-primary-foreground: var(--primary-foreground);
    --color-secondary: var(--secondary);
    --color-secondary-foreground: var(--secondary-foreground);
    --color-muted: var(--muted);
    --color-muted-foreground: var(--muted-foreground);
    --color-accent: var(--accent);
    --color-accent-foreground: var(--accent-foreground);
    --color-destructive: var(--destructive);
    --color-border: var(--border);
    --color-input: var(--input);
    --color-ring: var(--ring);
    --color-chart-1: var(--chart-1);
    --color-chart-2: var(--chart-2);
    --color-chart-3: var(--chart-3);
    --color-chart-4: var(--chart-4);
    --color-chart-5: var(--chart-5);
    --color-sidebar: var(--sidebar);
    --color-sidebar-foreground: var(--sidebar-foreground);
    --color-sidebar-primary: var(--sidebar-primary);
    --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
    --color-sidebar-accent: var(--sidebar-accent);
    --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
    --color-sidebar-border: var(--sidebar-border);
    --color-sidebar-ring: var(--sidebar-ring);
}

:root {
    --radius: 0.625rem;
    --background: oklch(1 0 0);
    --foreground: oklch(0.129 0.042 264.695);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.129 0.042 264.695);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.129 0.042 264.695);
    --primary: oklch(0.208 0.042 265.755);
    --primary-foreground: oklch(0.984 0.003 247.858);
    --secondary: oklch(0.968 0.007 247.896);
    --secondary-foreground: oklch(0.208 0.042 265.755);
    --muted: oklch(0.968 0.007 247.896);
    --muted-foreground: oklch(0.554 0.046 257.417);
    --accent: oklch(0.968 0.007 247.896);
    --accent-foreground: oklch(0.208 0.042 265.755);
    --destructive: oklch(0.577 0.245 27.325);
    --border: oklch(0.929 0.013 255.508);
    --input: oklch(0.929 0.013 255.508);
    --ring: oklch(0.704 0.04 256.788);
    --chart-1: oklch(0.646 0.222 41.116);
    --chart-2: oklch(0.6 0.118 184.704);
    --chart-3: oklch(0.398 0.07 227.392);
    --chart-4: oklch(0.828 0.189 84.429);
    --chart-5: oklch(0.769 0.188 70.08);
    --sidebar: oklch(0.984 0.003 247.858);
    --sidebar-foreground: oklch(0.129 0.042 264.695);
    --sidebar-primary: oklch(0.208 0.042 265.755);
    --sidebar-primary-foreground: oklch(0.984 0.003 247.858);
    --sidebar-accent: oklch(0.968 0.007 247.896);
    --sidebar-accent-foreground: oklch(0.208 0.042 265.755);
    --sidebar-border: oklch(0.929 0.013 255.508);
    --sidebar-ring: oklch(0.704 0.04 256.788);
}

.dark {
    --background: oklch(0.129 0.042 264.695);
    --foreground: oklch(0.984 0.003 247.858);
    --card: oklch(0.208 0.042 265.755);
    --card-foreground: oklch(0.984 0.003 247.858);
    --popover: oklch(0.208 0.042 265.755);
    --popover-foreground: oklch(0.984 0.003 247.858);
    --primary: oklch(0.929 0.013 255.508);
    --primary-foreground: oklch(0.208 0.042 265.755);
    --secondary: oklch(0.279 0.041 260.031);
    --secondary-foreground: oklch(0.984 0.003 247.858);
    --muted: oklch(0.279 0.041 260.031);
    --muted-foreground: oklch(0.704 0.04 256.788);
    --accent: oklch(0.279 0.041 260.031);
    --accent-foreground: oklch(0.984 0.003 247.858);
    --destructive: oklch(0.704 0.191 22.216);
    --border: oklch(1 0 0 / 10%);
    --input: oklch(1 0 0 / 15%);
    --ring: oklch(0.551 0.027 264.364);
    --chart-1: oklch(0.488 0.243 264.376);
    --chart-2: oklch(0.696 0.17 162.48);
    --chart-3: oklch(0.769 0.188 70.08);
    --chart-4: oklch(0.627 0.265 303.9);
    --chart-5: oklch(0.645 0.246 16.439);
    --sidebar: oklch(0.208 0.042 265.755);
    --sidebar-foreground: oklch(0.984 0.003 247.858);
    --sidebar-primary: oklch(0.488 0.243 264.376);
    --sidebar-primary-foreground: oklch(0.984 0.003 247.858);
    --sidebar-accent: oklch(0.279 0.041 260.031);
    --sidebar-accent-foreground: oklch(0.984 0.003 247.858);
    --sidebar-border: oklch(1 0 0 / 10%);
    --sidebar-ring: oklch(0.551 0.027 264.364);
}

@layer base {
    * {
        @apply border-border outline-ring/50;
    }

    body {
        @apply bg-background text-foreground;
    }
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.5;
        transform: scale(1.1);
    }
}

@keyframes pulseHighlight {
    0%, 100% {
        opacity: 1;
        transform: scale(1);
        box-shadow: 0 0 40px rgba(0, 124, 191, 0.8), inset 0 0 20px rgba(0, 124, 191, 0.3);
    }
    50% {
        opacity: 0.7;
        transform: scale(1.15);
        box-shadow: 0 0 60px rgba(0, 124, 191, 1), inset 0 0 30px rgba(0, 124, 191, 0.5);
    }
}


```

---

## File: `src/main.tsx`

```tsx
import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'

import '@/index.css'
import App from '@/app.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App/>
    </StrictMode>,
)

```

---

## File: `src/components/features/map/geocode-search.tsx`

```tsx
import {useEffect, useMemo, useState} from 'react';

import type {LngLat} from 'mapbox-gl';

import type {GeocodingResult} from '@/types/map-types.ts';
import {useMapStore} from '@/store/use-map-store.ts';
import {GEOCODING_CONFIG} from '@/config/constants.ts';
import {getGeocoding} from '@/services/mapbox-geocoding.ts';
import {getOSMBoundaryByName, getBoundaryForPoint, createBufferPolygon, getAdminBoundaryFromAddressString} from '@/services/mapbox-boundary.ts';

interface GeocodeSearchProps {
    label: string;
    onPick: (payload: { center: LngLat; name: string; placeName: string }) => void;
    autoFocus?: boolean;
    disabled?: boolean;
    valueLabel?: string | null;
}

export function GeocodeSearch({label, onPick, autoFocus, disabled, valueLabel}: GeocodeSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<GeocodingResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [displayValue, setDisplayValue] = useState('');

    const {setFlyToCoords, setHighlightCoords, setHighlightGeometry} = useMapStore();

    const inputValue = query || displayValue || (valueLabel ?? '');

    // Fetch geocoding results with debounce
    useEffect(() => {
        if (!query || disabled) return;

        let cancelled = false;
        const timer = setTimeout(() => {
            setIsLoading(true);
            (async () => {
                const geocodingResults = await getGeocoding(query);
                if (!cancelled) {
                    setResults(geocodingResults);
                    setIsLoading(false);
                }
            })();
        }, GEOCODING_CONFIG.DEBOUNCE_DELAY);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [query, disabled]);

    const hint = useMemo(() => {
        if (disabled) return 'ابتدا مبدا را مشخص کنید';
        if (!query) return valueLabel ? '' : 'حداقل ۳ کاراکتر تایپ کنید…';
        if (query.length <= 2) return 'در حال تایپ…';
        if (isLoading) return 'در حال جستجو…';
        if (!results.length) return 'نتیجه‌ای یافت نشد.';
        return null;
    }, [query, isLoading, results.length, disabled, valueLabel]);

    // Set highlight for selected result using multiple strategies
    const setHighlightForResult = async (result: GeocodingResult) => {
        setFlyToCoords(result.center);
        setHighlightCoords(result.center);

        const nameForOSM = result.placeName || result.name;

        // Strategy 1: Admin boundary from full address
        const adminByAddress = await getAdminBoundaryFromAddressString(nameForOSM, result.center);

        if (adminByAddress && (adminByAddress.type === 'Polygon' || adminByAddress.type === 'MultiPolygon')) {
            setHighlightGeometry(adminByAddress);
            return;
        }

        // Strategy 2: OSM boundary by name
        const byName = await getOSMBoundaryByName(nameForOSM, {countryCodes: 'ir', limit: 3});
        if (byName && (byName.type === 'Polygon' || byName.type === 'MultiPolygon')) {
            setHighlightGeometry(byName);
            return;
        }

        // Strategy 3: Geometry from result
        if (result.geometry && (result.geometry.type === 'Polygon' || result.geometry.type === 'MultiPolygon')) {
            setHighlightGeometry(result.geometry);
            return;
        }

        // Strategy 4: Boundary by point
        const byPoint = await getBoundaryForPoint(result.center);
        if (byPoint && (byPoint.type === 'Polygon' || byPoint.type === 'MultiPolygon')) {
            setHighlightGeometry(byPoint);
            return;
        }

        // Strategy 5: Bbox to polygon
        if (result.bbox) {
            const [minLng, minLat, maxLng, maxLat] = result.bbox;
            const bboxPolygon: GeoJSON.Polygon = {
                type: 'Polygon',
                coordinates: [
                    [
                        [minLng, minLat],
                        [maxLng, minLat],
                        [maxLng, maxLat],
                        [minLng, maxLat],
                        [minLng, minLat],
                    ],
                ],
            };
            setHighlightGeometry(bboxPolygon);
            return;
        }

        // Strategy 6: Fallback buffer
        const buffer = createBufferPolygon(result.center);
        setHighlightGeometry(buffer.geometry);
    };

    const handlePick = async (result: GeocodingResult) => {
        onPick({center: result.center, name: result.name, placeName: result.placeName});
        await setHighlightForResult(result);
        setDisplayValue(result.name);
        setQuery('');
        setResults([]);
    };

    const handleInputChange = (value: string) => {
        setQuery(value);
        if (!value) setResults([]);
        if (displayValue) setDisplayValue('');
    };

    const handleFocus = () => {
        if (displayValue && !query) setDisplayValue('');
    };

    return (
        <div className="w-full rounded-md border p-2 space-y-2">
            <label className="text-xs text-muted-foreground">{label}</label>
            <input
                className="w-full rounded border px-3 py-2 text-sm disabled:bg-muted disabled:cursor-not-allowed"
                placeholder={disabled ? 'ابتدا مبدا را مشخص کنید' : 'نام مکان یا آدرس'}
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={handleFocus}
                disabled={disabled}
                autoFocus={autoFocus}
            />

            {!query && !displayValue && hint && (
                <div className="text-xs text-muted-foreground">{hint}</div>
            )}

            {query && hint && <div className="text-xs text-muted-foreground">{hint}</div>}

            {query && !hint && (
                <div className="max-h-52 overflow-y-auto divide-y border rounded">
                    {results.map((result) => (
                        <button
                            key={result.id}
                            className="w-full text-start p-2 hover:bg-accent transition-colors cursor-pointer"
                            type="button"
                            onClick={() => handlePick(result)}>
                            <div className="text-sm font-medium">{result.name}</div>
                            <div className="text-xs text-muted-foreground">{result.placeName}</div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

```

---

## File: `src/components/features/map/map-box.tsx`

```tsx
import {useRef, useEffect, useState} from 'react';

import * as turf from '@turf/turf';
import type {LngLat, Map, MapMouseEvent} from 'mapbox-gl';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

import {MAP_CONFIG, MAP_STYLES, MARKER_COLORS, API_URLS} from '@/config/constants.ts';
import {useMapStore} from '@/store/use-map-store.ts';
import {getRoute} from '@/services/mapbox-directions.ts';
import {reverseGeocode} from '@/services/mapbox-reverse-geocoding.ts';
import {
    formatDurationPersian,
    formatDistancePersian,
    clearRouteLayers,
    clearHighlightLayers,
    addMainRouteLayer,
    addAlternativeRouteLayer,
    addHighlightLayers,
    startHighlightAnimation,
    createRouteLabelElement
} from '@/lib/utils';

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Load RTL plugin
mapboxgl.setRTLTextPlugin(API_URLS.MAPBOX_RTL_PLUGIN, undefined, true);

export default function MapBox() {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<Map | null>(null);
    const mapLoadedRef = useRef(false);

    const startMarkerRef = useRef<mapboxgl.Marker | null>(null);
    const endMarkerRef = useRef<mapboxgl.Marker | null>(null);
    const labelMarkerRef = useRef<mapboxgl.Marker | null>(null);
    const alternativeMarkersRef = useRef<mapboxgl.Marker[]>([]);

    const [ctxLngLat, setCtxLngLat] = useState<LngLat | null>(null);
    const [ctxTitle, setCtxTitle] = useState<string>('');
    const [ctxOpen, setCtxOpen] = useState(false);
    const [ctxPos, setCtxPos] = useState<{ x: number; y: number }>({x: 0, y: 0});

    const {
        startPoint,
        setStartPoint,
        endPoint,
        setEndPoint,
        routeInfo,
        setRouteInfo,
        setStartLabel,
        setEndLabel,
        flyToCoords,
        selectingMode,
        setSelectingMode,
        mode,
        setCurrentPlace,
        highlightCoords,
        highlightGeometry
    } = useMapStore();

    // Menu ref for outside click detection
    const menuRef = useRef<HTMLDivElement | null>(null);
    const lastContextTimeRef = useRef<number>(0);

    // Initialize map
    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        const m = new mapboxgl.Map({
            container: mapContainer.current,
            style: MAP_STYLES.STREETS,
            center: [MAP_CONFIG.INITIAL_LNG, MAP_CONFIG.INITIAL_LAT],
            zoom: MAP_CONFIG.INITIAL_ZOOM,
        });
        map.current = m;

        // Add map controls
        m.addControl(new mapboxgl.NavigationControl({showCompass: true, showZoom: true}), 'top-left');
        m.addControl(new mapboxgl.FullscreenControl(), 'top-left');
        m.addControl(new mapboxgl.GeolocateControl({positionOptions: {enableHighAccuracy: true}, trackUserLocation: true, showUserHeading: true,}), 'top-left');

        const handleLoad = () => {
            mapLoadedRef.current = true;
            const center = m.getCenter();
            try {
                useMapStore.getState().setMapCenter(center);
            } catch (error) {
                console.warn('setMapCenter failed', error);
            }
        };
        m.on('load', handleLoad);

        const handleMoveEnd = () => {
            const center = m.getCenter();
            const setCenter = useMapStore.getState().setMapCenter;
            if (setCenter) setCenter(center);
        };
        m.on('moveend', handleMoveEnd);

        return () => {
            m.off('load', handleLoad);
            m.off('moveend', handleMoveEnd);
            m.remove();
            map.current = null;
            mapLoadedRef.current = false;
        };
    }, []);

    // Click to set start/end points when selecting mode is active
    useEffect(() => {
        if (!map.current) return;
        const m = map.current;

        const handleMapClick = (e: MapMouseEvent) => {
            if (selectingMode === 'start') {
                setStartPoint(e.lngLat);
                setSelectingMode?.('none');
            } else if (selectingMode === 'end') {
                setEndPoint(e.lngLat);
                setSelectingMode?.('none');
            }
        };

        m.on('click', handleMapClick);
        return () => {
            m.off('click', handleMapClick);
        };
    }, [selectingMode, setSelectingMode, setStartPoint, setEndPoint]);

    // Fetch route when both points are set
    useEffect(() => {
        let cancelled = false;

        const fetchRoute = async () => {
            if (!startPoint || !endPoint) {
                setRouteInfo(null);
                return;
            }

            try {
                const info = await getRoute(startPoint, endPoint, mode);
                if (!cancelled) setRouteInfo(info);
            } catch (err) {
                console.error('Failed to fetch route:', err);
                setRouteInfo(null);
            }
        };

        fetchRoute();
        return () => {
            cancelled = true;
        };
    }, [startPoint, endPoint, setRouteInfo, mode]);

    // Start marker
    useEffect(() => {
        if (startMarkerRef.current) {
            startMarkerRef.current.remove();
            startMarkerRef.current = null;
        }

        if (startPoint && map.current) {
            startMarkerRef.current = new mapboxgl.Marker({color: MARKER_COLORS.START}).setLngLat(startPoint).addTo(map.current);
        }
    }, [startPoint]);

    // End marker
    useEffect(() => {
        if (endMarkerRef.current) {
            endMarkerRef.current.remove();
            endMarkerRef.current = null;
        }

        if (endPoint && map.current) {
            endMarkerRef.current = new mapboxgl.Marker({color: MARKER_COLORS.END}).setLngLat(endPoint).addTo(map.current);
        }
    }, [endPoint]);

    // Draw route and fit bounds with label markers
    useEffect(() => {
        if (!map.current || !mapLoadedRef.current) return;
        const m = map.current;

        clearRouteLayers(m);

        // Clean up label markers
        if (labelMarkerRef.current) {
            labelMarkerRef.current.remove();
            labelMarkerRef.current = null;
        }

        alternativeMarkersRef.current.forEach((marker) => marker.remove());
        alternativeMarkersRef.current = [];

        if (routeInfo) {
            try {
                // Draw alternative routes (behind main route)
                routeInfo.alternativeRoutes.forEach((altRoute, index) => {
                    addAlternativeRouteLayer(m, altRoute.geometry, index);

                    // Add label marker for alternative route
                    const altGeom = altRoute.geometry as GeoJSON.LineString;
                    const altCoords = Array.isArray(altGeom.coordinates) ? altGeom.coordinates : [];

                    if (altCoords.length >= 2) {
                        const altLine = turf.lineString(altCoords as [number, number][]);
                        const altTotalKm = turf.length(altLine, {units: 'kilometers'});
                        const altMid = turf.along(altLine, altTotalKm / 2, {units: 'kilometers'});

                        const altTimeText = formatDurationPersian(altRoute.duration || 0);
                        const altDistText = formatDistancePersian(altRoute.distance || 0);
                        const labelText = `${altTimeText} • ${altDistText}`;

                        const altElement = createRouteLabelElement(labelText, true);
                        const [altLng, altLat] = altMid.geometry.coordinates as [number, number];

                        const altMarker = new mapboxgl.Marker({element: altElement, draggable: false}).setLngLat([altLng, altLat]).addTo(m);

                        alternativeMarkersRef.current.push(altMarker);
                    }
                });

                // Draw main route (on top)
                addMainRouteLayer(m, routeInfo.mainRoute.geometry);

                // Add label marker for main route
                const geom = routeInfo.mainRoute.geometry as GeoJSON.LineString;
                const coords = Array.isArray(geom.coordinates) ? geom.coordinates : [];

                if (coords.length >= 2) {
                    const line = turf.lineString(coords as [number, number][]);
                    const totalKm = turf.length(line, {units: 'kilometers'});
                    const mid = turf.along(line, totalKm / 2, {units: 'kilometers'});

                    const timeText = formatDurationPersian(routeInfo.mainRoute.duration || 0);
                    const distText = formatDistancePersian(routeInfo.mainRoute.distance || 0);
                    const labelText = `${timeText} • ${distText}`;

                    const element = createRouteLabelElement(labelText, false);
                    const [lng, lat] = mid.geometry.coordinates as [number, number];

                    labelMarkerRef.current = new mapboxgl.Marker({element, draggable: false}).setLngLat([lng, lat]).addTo(m);
                }

                // Fit bounds to show entire route
                if (startPoint && endPoint) {
                    const bounds = new mapboxgl.LngLatBounds(startPoint, endPoint);
                    m.fitBounds(bounds, {
                        padding: MAP_CONFIG.DEFAULT_PADDING,
                        duration: MAP_CONFIG.FIT_BOUNDS_DURATION,
                    });
                }
            } catch (error) {
                console.error('Error adding route layer:', error);
            }
        }
    }, [routeInfo, startPoint, endPoint]);

    // Fly to searched coordinates
    useEffect(() => {
        if (flyToCoords && map.current && mapLoadedRef.current) {
            map.current.flyTo({
                center: flyToCoords,
                zoom: 15,
                duration: MAP_CONFIG.FLY_DURATION,
            });
        }
    }, [flyToCoords]);

    // Permanent highlight layer controlled by highlightCoords and highlightGeometry
    useEffect(() => {
        if (!map.current || !mapLoadedRef.current) return;
        const m = map.current;

        clearHighlightLayers(m);

        if (highlightCoords) {
            let sourceData: GeoJSON.Feature;

            // Use actual geometry if available
            if (highlightGeometry && (highlightGeometry.type === 'Polygon' || highlightGeometry.type === 'MultiPolygon')
            ) {
                sourceData = {type: 'Feature', properties: {}, geometry: highlightGeometry};
            } else {
                // Fallback: create buffer circle
                sourceData = turf.circle([highlightCoords.lng, highlightCoords.lat], 0.3, {steps: 64, units: 'kilometers'});
            }

            // Add highlight layers
            addHighlightLayers(m, sourceData.geometry);

            // Start pulsing animation
            const stopAnimation = startHighlightAnimation(m);

            return () => {
                stopAnimation();
            };
        }
    }, [highlightCoords, highlightGeometry]);

    // Right-click manual context menu (reliable with Mapbox)
    useEffect(() => {
        if (!map.current) return;
        const m = map.current;

        const handleContext = async (e: MapMouseEvent) => {
            e.preventDefault();
            const now = performance.now();
            if (now - lastContextTimeRef.current < 180) {
                return; // debounce rapid right-clicks
            }
            lastContextTimeRef.current = now;

            setCtxLngLat(e.lngLat);
            setCtxPos({x: e.point.x, y: e.point.y});

            let name: string | null = null;
            try {
                const feats = m.queryRenderedFeatures(e.point);
                const best = feats.find(f => f.properties?.name_fa || f.properties?.name);
                name = (best?.properties?.name_fa as string) || (best?.properties?.name as string) || null;
            } catch {
                // ignore
            }
            if (!name) {
                const info = await reverseGeocode(e.lngLat);
                name = info?.name ?? null;
            }
            setCtxTitle(name || 'معبر بدون نام');
            setCtxOpen(true);
        };

        const handleMapLeftClick = () => setCtxOpen(false);

        m.on('contextmenu', handleContext);
        m.on('click', handleMapLeftClick);

        return () => {
            m.off('contextmenu', handleContext);
            m.off('click', handleMapLeftClick);
        };
    }, []);

    // Close on outside click (document level)
    useEffect(() => {
        if (!ctxOpen) return;
        const handleDocClick = (ev: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(ev.target as Node)) {
                setCtxOpen(false);
            }
        };
        document.addEventListener('mousedown', handleDocClick);
        return () => document.removeEventListener('mousedown', handleDocClick);
    }, [ctxOpen]);

    const takeAsStart = async () => {
        if (!ctxLngLat) return;
        setStartPoint(ctxLngLat);
        const info = await reverseGeocode(ctxLngLat);
        setStartLabel(info?.name || ctxTitle || 'نقطه انتخاب‌شده');
        setCtxOpen(false);
    };

    const takeAsEnd = async () => {
        if (!ctxLngLat) return;
        setEndPoint(ctxLngLat);
        const info = await reverseGeocode(ctxLngLat);
        setEndLabel(info?.name || ctxTitle || 'نقطه انتخاب‌شده');
        setCtxOpen(false);
    };

    const showInfo = async () => {
        if (!ctxLngLat) return;
        const info = await reverseGeocode(ctxLngLat);
        if (info) setCurrentPlace(info);
        else setCurrentPlace({name: ctxTitle || 'معبر بدون نام', placeName: '', center: ctxLngLat});
        setCtxOpen(false);
    };

    const copyCoords = () => {
        if (!ctxLngLat) return;
        const txt = `${ctxLngLat.lat.toFixed(6)}, ${ctxLngLat.lng.toFixed(6)}`;
        navigator.clipboard?.writeText(txt).catch(() => {
        });
        setCtxOpen(false);
    };

    return (
        <div
            ref={mapContainer}
            className="map-container relative"
            style={{width: '100%', height: '100%'}}
            onContextMenu={(e) => e.preventDefault()} // prevent browser default
        >
            {ctxOpen && (
                <div
                    ref={menuRef}
                    className="absolute z-40 min-w-42 rounded-md border bg-white shadow animate-in fade-in"
                    style={{left: ctxPos.x, top: ctxPos.y, fontFamily: 'Vazirmatn, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif'}}
                >
                    <div className="px-3 py-2 text-xs text-muted-foreground border-b">{ctxTitle}</div>
                    <button
                        className="w-full text-right px-3 py-2 hover:bg-accent transition-colors cursor-pointer"
                        onClick={takeAsStart}
                        disabled={!ctxLngLat}
                    >
                        انتخاب به عنوان مبدا
                    </button>
                    <button
                        className="w-full text-right px-3 py-2 hover:bg-accent transition-colors cursor-pointer"
                        onClick={takeAsEnd}
                        disabled={!ctxLngLat}
                    >
                        انتخاب به عنوان مقصد
                    </button>
                    <button
                        className="w-full text-right px-3 py-2 hover:bg-accent transition-colors cursor-pointer"
                        onClick={showInfo}
                        disabled={!ctxLngLat}
                    >
                        نمایش اطلاعات نقطه
                    </button>
                    <button
                        className="w-full text-right px-3 py-2 hover:bg-accent transition-colors cursor-pointer"
                        onClick={copyCoords}
                        disabled={!ctxLngLat}
                    >
                        کپی مختصات
                    </button>
                </div>
            )}
        </div>
    );
}

```

---

## File: `src/components/features/map/place-info-card.tsx`

```tsx
import {useMemo} from 'react';

import {X as XIcon} from 'lucide-react';

import {useMapStore} from '@/store/use-map-store.ts';
import {Button} from '@/components/ui/button.tsx';

export function PlaceInfoCard() {
    const {
        currentPlace,
        setCurrentPlace,
        setStartPoint,
        setEndPoint,
        setRoutingOpen,
        setStartLabel,
        setEndLabel,
        startPoint,
    } = useMapStore();

    const title = useMemo(() => currentPlace?.name || 'معبر بدون نام', [currentPlace]);
    const subtitle = useMemo(() => currentPlace?.placeName || '', [currentPlace]);

    if (!currentPlace) return null;

    const handleRouteFromHere = () => {
        setStartPoint(currentPlace.center);
        setStartLabel(title);
        setCurrentPlace(null); // Close bottom sheet
        setRoutingOpen(true);
    };

    const handleRouteToHere = () => {
        if (!startPoint) return;
        setEndPoint(currentPlace.center);
        setEndLabel(title);
        setCurrentPlace(null); // Close bottom sheet
        setRoutingOpen(true);
    };

    const handleClose = () => {
        setCurrentPlace(null);
    };

    return (
        <div className="fixed inset-x-0 bottom-0 z-30">
            <div className="mx-auto w-[min(100vw,500px)] px-3 pb-[calc(env(safe-area-inset-bottom,0)+8px)]">
                <div className="relative rounded-xl border bg-white shadow-lg p-4 space-y-3">
                    {/* Close button in the top corner */}
                    <button aria-label="بستن" className="absolute top-3 left-3 rounded-xs opacity-80 hover:opacity-100 transition-opacity cursor-pointer" onClick={handleClose}>
                        <XIcon className="size-5"/>
                    </button>

                    <div className="h-1 w-10 bg-muted mx-auto rounded-full"/>
                    <div className="text-sm font-bold text-center sm:text-right">{title}</div>
                    {subtitle && (<div className="text-xs text-muted-foreground text-center sm:text-right">{subtitle}</div>)}

                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <Button size="lg" variant="default" onClick={handleRouteFromHere} className="flex-1">مسیریابی از اینجا</Button>
                        <Button size="lg" variant="default" disabled={!startPoint} onClick={handleRouteToHere} className="flex-1">مسیریابی به اینجا</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

```

---

## File: `src/components/features/map/route-panel.tsx`

```tsx
import {useMemo} from 'react';

import type {LngLat} from 'mapbox-gl';

import type {SelectionMode} from '@/types/map-types.ts';
import {useMapStore} from '@/store/use-map-store.ts';
import {Button} from '@/components/ui/button.tsx';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog.tsx';
import {GeocodeSearch} from '@/components/features/map/geocode-search.tsx';
import {formatDistancePersian, formatDurationPersian, formatCoordinates} from '@/lib/utils';

export function RoutePanel() {
    const {
        startPoint,
        setStartPoint,
        endPoint,
        setEndPoint,
        routeInfo,
        setSelectingMode,
        routingOpen,
        setRoutingOpen,
        startLabel,
        endLabel,
        setStartLabel,
        setEndLabel,
        swapStartEnd
    } = useMapStore();

    const distance = routeInfo?.mainRoute.distance ?? null
    const duration = routeInfo?.mainRoute.duration ?? null

    const readableDistance = useMemo(() => (distance != null ? formatDistancePersian(distance) : null), [distance]);
    const readableDuration = useMemo(() => (duration != null ? formatDurationPersian(duration) : null), [duration]);

    const formatPointLabel = (point: LngLat | null, label: string | null): string => {
        if (label) return label;
        if (point) return formatCoordinates(point.lat, point.lng);
        return '—';
    };

    const handleSelectOnMap = (mode: SelectionMode) => {
        setSelectingMode(mode);
        setRoutingOpen(false);
    };

    const handleClearStart = () => {
        setStartPoint(null);
        setStartLabel(null);
    };

    const handleClearEnd = () => {
        setEndPoint(null);
        setEndLabel(null);
    };

    return (
        <Dialog open={routingOpen} onOpenChange={setRoutingOpen}>
            <DialogContent className="w-full max-w-md">
                <DialogHeader>
                    <DialogTitle>مسیریابی</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Start point section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-sm flex-1">
                                <div className="text-muted-foreground">مبدا</div>
                                <div className="font-medium ltr">{formatPointLabel(startPoint, startLabel)}</div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleSelectOnMap('start')}>انتخاب روی نقشه</Button>
                                <Button variant="outline" size="sm" onClick={handleClearStart}>حذف</Button>
                            </div>
                        </div>
                        <GeocodeSearch
                            label="جستجوی مبدا"
                            valueLabel={startLabel}
                            onPick={({center, name, placeName}) => {
                                setStartPoint(center);
                                setStartLabel(name || placeName);
                            }}
                        />
                    </div>

                    {/* End point section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-sm flex-1">
                                <div className="text-muted-foreground">مقصد</div>
                                <div className="font-medium ltr">{formatPointLabel(endPoint, endLabel)}</div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled={!startPoint} onClick={() => startPoint && handleSelectOnMap('end')}>انتخاب روی نقشه</Button>
                                <Button variant="outline" size="sm" onClick={handleClearEnd}>حذف</Button>
                            </div>
                        </div>
                        <GeocodeSearch
                            label="جستجوی مقصد"
                            disabled={!startPoint}
                            valueLabel={endLabel}
                            onPick={({center, name, placeName}) => {
                                setEndPoint(center);
                                setEndLabel(name || placeName);
                            }}
                        />
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" onClick={swapStartEnd} disabled={!startPoint && !endPoint}>جابجایی مبدا/مقصد</Button>
                        {startPoint && endPoint && (
                            <Button size="sm" onClick={() => setRoutingOpen(false)}>مشاهده مسیر روی نقشه</Button>
                        )}
                    </div>

                    {/* Route summary */}
                    {(readableDistance || readableDuration) && (
                        <div className="text-sm rounded-md border p-3">
                            <div>خلاصه مسیر:</div>
                            <div className="text-muted-foreground">
                                {readableDistance && `مسافت: ${readableDistance}`}
                                {readableDistance && readableDuration && ' • '}
                                {readableDuration && `زمان: ${readableDuration}`}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

```

---

## File: `src/components/features/map/search-box.tsx`

```tsx
import {useState, useEffect} from 'react';

import {Button} from '@/components/ui/button.tsx';
import {CommandDialog, CommandInput, CommandList, CommandEmpty, CommandItem} from '@/components/ui/command.tsx';
import type {GeocodingResult} from '@/types/map-types.ts';
import {getGeocoding} from '@/services/mapbox-geocoding.ts';
import {getBoundaryForPoint, createBufferPolygon, getOSMBoundaryByName} from '@/services/mapbox-boundary.ts';
import {useMapStore} from '@/store/use-map-store.ts';
import {GEOCODING_CONFIG} from '@/config/constants.ts';

export default function SearchBox() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<GeocodingResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const {
        setFlyToCoords,
        setHighlightCoords,
        setHighlightGeometry,
        setCurrentPlace,
    } = useMapStore();

    // Fetch geocoding results with debounce
    useEffect(() => {
        if (!query) return;

        let cancelled = false;

        const delayDebounceFn = setTimeout(() => {
            setIsLoading(true);
            const fetchResults = async () => {
                const geocodingResults = await getGeocoding(query);
                if (!cancelled) {
                    setResults(geocodingResults);
                    setIsLoading(false);
                }
            };

            fetchResults();
        }, GEOCODING_CONFIG.DEBOUNCE_DELAY);

        return () => {
            cancelled = true;
            clearTimeout(delayDebounceFn);
        };
    }, [query]);

    // Handle result selection with multi-strategy boundary detection Then open bottom sheet by setting currentPlace
    const handleSelectResult = async (result: GeocodingResult) => {
        setFlyToCoords(result.center);
        setHighlightCoords(result.center);

        const nameForOSM = result.placeName || result.name;

        // Strategy 1: Try OSM boundary by name first
        const osmByName = await getOSMBoundaryByName(nameForOSM, {
            countryCodes: 'ir',
            limit: 3,
        });
        if (osmByName && (osmByName.type === 'Polygon' || osmByName.type === 'MultiPolygon')) {
            setHighlightGeometry(osmByName);
        } else if (
            result.geometry &&
            (result.geometry.type === 'Polygon' || result.geometry.type === 'MultiPolygon')
        ) {
            // Strategy 2: Use Mapbox returned geometry if available
            setHighlightGeometry(result.geometry);
        } else {
            // Strategy 3: Try boundary by point
            const boundary = await getBoundaryForPoint(result.center);
            if (boundary && (boundary.type === 'Polygon' || boundary.type === 'MultiPolygon')) {
                setHighlightGeometry(boundary);
            } else if (result.bbox) {
                // Strategy 4: Fallback to bbox if available
                const [minLng, minLat, maxLng, maxLat] = result.bbox;
                const bboxPolygon: GeoJSON.Polygon = {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [minLng, minLat],
                            [maxLng, minLat],
                            [maxLng, maxLat],
                            [minLng, maxLat],
                            [minLng, minLat],
                        ],
                    ],
                };
                setHighlightGeometry(bboxPolygon);
            } else {
                // Strategy 5: Last resort - create buffer circle
                const buffer = createBufferPolygon(result.center);
                setHighlightGeometry(buffer.geometry);
            }
        }

        // Open bottom sheet (PlaceInfoCard)
        setCurrentPlace({name: result.name, placeName: result.placeName, center: result.center});

        // Close search dialog and clear state
        setOpen(false);
        setQuery('');
        setResults([]);
    };

    const handleCloseSearch = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setQuery('');
            setResults([]);
        }
    };

    return (
        <>
            <Button
                variant="outline"
                onClick={() => setOpen(true)}
                className="fixed sm:absolute sm:top-4 sm:left-1/2 sm:-translate-x-1/2 bottom-3 left-1/2 -translate-x-1/2 z-20 w-[min(92vw,22rem)] shadow-xl"
                aria-label="Open search"
            >
                جستجو (مثلاً: تهران)
            </Button>

            <CommandDialog open={open} onOpenChange={handleCloseSearch} shouldFilter={false}>
                <CommandInput
                    placeholder="جستجوی مکان یا آدرس..."
                    value={query}
                    onValueChange={(val) => {
                        setQuery(val);
                        if (!val) {
                            setResults([]);
                            setIsLoading(false);
                        }
                    }}
                />
                <CommandList>
                    {!isLoading && results.length === 0 && query.length <= 2 && (
                        <CommandEmpty>حداقل ۳ کاراکتر تایپ کنید…</CommandEmpty>
                    )}

                    {isLoading && <CommandEmpty>در حال جستجو...</CommandEmpty>}

                    {!isLoading && results.length === 0 && query.length > 2 && (
                        <CommandEmpty>نتیجه‌ای یافت نشد.</CommandEmpty>
                    )}

                    {!isLoading &&
                        results.map((result) => (
                            <CommandItem
                                key={result.id}
                                value={`${result.name} ${result.placeName}`}
                                onSelect={() => handleSelectResult(result)}
                            >
                                <div className="flex flex-col">
                                    <h4 className="font-medium">{result.name}</h4>
                                    <p className="text-xs text-gray-500">{result.placeName}</p>
                                </div>
                            </CommandItem>
                        ))}
                </CommandList>
            </CommandDialog>
        </>
    );
}

```

---

## File: `src/components/ui/button.tsx`

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

```

---

## File: `src/components/ui/command.tsx`

```tsx
"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = true,
  shouldFilter,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
  shouldFilter?: boolean
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn("overflow-hidden p-0 shadow-2xl", className)}
        showCloseButton={showCloseButton}
      >
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5 transition-all duration-200" shouldFilter={shouldFilter}>
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center gap-2 border-b px-3"
    >
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        className
      )}
      {...props}
    />
  )
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
        className
      )}
      {...props}
    />
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}

```

---

## File: `src/components/ui/dialog.tsx`

```tsx
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 transition-all duration-300",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-[10%] data-[state=open]:slide-in-from-top-[10%] fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-300 sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 left-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg text-right leading-none font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}

```

---

## File: `src/config/constants.ts`

```ts
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


```

---

## File: `src/lib/utils/format.ts`

```ts
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


```

---

## File: `src/lib/utils/index.ts`

```ts
import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export * from '@/lib/utils/format.ts';
export * from '@/lib/utils/map.ts';


```

---

## File: `src/lib/utils/map.ts`

```ts
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

```

---

## File: `src/services/mapbox-boundary.ts`

```ts
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

```

---

## File: `src/services/mapbox-directions.ts`

```ts
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
```

---

## File: `src/services/mapbox-geocoding.ts`

```ts
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

```

---

## File: `src/services/mapbox-reverse-geocoding.ts`

```ts
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

```

---

## File: `src/store/use-map-store.ts`

```ts
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

```

---

## File: `src/types/map-types.ts`

```ts
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

```

---

