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
