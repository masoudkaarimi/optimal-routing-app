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
