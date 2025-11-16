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
