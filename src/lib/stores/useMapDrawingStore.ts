import type { DrawMode } from '$lib/components/Map/useMapDrawing';
import type { FeatureCollection } from 'geojson';
import { writable } from 'svelte/store';

export const featureCollection = writable<FeatureCollection>({
	type: 'FeatureCollection',
	features: []
});
export const drawMode = writable<DrawMode>('move');
export const drawColor = writable<string>('#000');
export const drawWidth = writable<number>(5);
export const drawOpacity = writable<number>(70);
export const isDrawing = writable<boolean>(false);
