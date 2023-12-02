import type { DrawMode } from '$lib/components/Map/useMapDrawing';
import { writable } from 'svelte/store';

export const drawMode = writable<DrawMode>('move');
export const drawColor = writable<string>('#000');
export const drawWidth = writable<number>(8);
export const isDrawing = writable<boolean>(false);
