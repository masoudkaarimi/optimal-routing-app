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