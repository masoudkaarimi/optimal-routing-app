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
