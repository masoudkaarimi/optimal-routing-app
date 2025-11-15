import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export * from '@/lib/utils/format.ts';
export * from '@/lib/utils/map.ts';

