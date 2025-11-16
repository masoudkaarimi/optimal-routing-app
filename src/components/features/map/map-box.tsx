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
