import type { Feature, GeoJsonProperties, Geometry } from 'geojson';
import ShortUniqueId from 'short-unique-id';
import { get, readonly } from 'svelte/store';
import { useMapHighlighting } from './useMapHighlighting';
import {
	drawColor,
	drawMode,
	drawWidth,
	featureCollection,
	isDrawing
} from '$lib/stores/useMapDrawingStore';
import { useMapLineDrawing } from './useMapLineDrawing';
import type { GeoJSONSource, LngLat, Map, MapMouseEvent } from 'maplibre-gl';

export type DrawMode = 'move' | 'pen' | 'highlighter' | 'circle' | 'polygon';

const isDrawMouseButton = (ev: MapMouseEvent) => ev.originalEvent.buttons === 1;

const uid = new ShortUniqueId({
	length: 16,
	dictionary: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
});

export type DrawResult = {
	hasCoordinates: boolean;
	isFinished: boolean;
};

export interface Drawer {
	createNewFeature: (id: string, start: LngLat) => Feature<Geometry>;
	draw: (ev: MapMouseEvent, feature: Feature<Geometry, GeoJsonProperties>) => DrawResult;
	canAppend: (feature: Feature<Geometry, GeoJsonProperties>) => boolean;
	startAppend: (
		feature: Feature<Geometry, GeoJsonProperties>
	) => Feature<Geometry, GeoJsonProperties>;
}

const minPixelDistances = 15;
export const pixelDistance = (
	pointOne: { x: number; y: number },
	pointTwo: { x: number; y: number }
) => {
	const { x: x1, y: y1 } = pointOne;
	const { x: x2, y: y2 } = pointTwo;
	const y = x2 - x1;
	const x = y2 - y1;

	const distance = Math.sqrt(x * x + y * y);
	return {
		distance: distance,
		further: distance >= minPixelDistances
	};
};

export function useMapDrawing(routeSource: string) {
	const { highlight, initHighlighting } = useMapHighlighting(readonly(isDrawing));
	let mymap: Map | undefined;

	function setNewFeature(newFeature: Feature<Geometry>) {
		const featureCol = get(featureCollection);
		featureCol.features.push(newFeature);
		setSource(featureCol);
	}

	function refreshSource() {
		const featureCol = get(featureCollection);
		setSource(featureCol);
	}

	function setSource(geoJson: GeoJSON.GeoJSON) {
		const source = mymap?.getSource(routeSource) as GeoJSONSource;
		source?.setData(geoJson);
	}

	async function onMoveDrawing(ev: MapMouseEvent & Object) {
		if (!get(isDrawing) || !drawStrategy || !currentFeature) {
			return;
		}

		const result = drawStrategy.draw(ev, currentFeature);

		if (result.hasCoordinates) {
			refreshSource();
		}
	}

	function finishDrawing() {
		isDrawing.set(false);
		currentFeature = undefined;
		drawStrategy = undefined;
		mymap?.off('mousemove', onMoveDrawing);
	}

	function undoLastFeature() {
		const featureCol = get(featureCollection);
		if (featureCol.features.length <= 0) return;

		finishDrawing();
		featureCol.features = featureCol.features.slice(0, -1);
		setSource(featureCol);
	}

	let currentFeature: Feature<Geometry, GeoJsonProperties> | undefined = undefined;
	let drawStrategy: Drawer | undefined = undefined;

	function initDrawing(map: Map) {
		mymap = map;

		map.on('mousedown', (ev) => {
			if (isDrawMouseButton(ev) && !get(isDrawing) && !currentFeature) {
				switch (get(drawMode)) {
					case 'pen':
						drawStrategy = useMapLineDrawing();
						break;
					default:
						break;
				}

				if (drawStrategy) {
					isDrawing.set(true);
					const id = uid.rnd();

					const highlighted = get(highlight);
					if (highlighted && drawStrategy.canAppend(highlighted)) {
						currentFeature = drawStrategy.startAppend(highlighted);
					} else {
						currentFeature = drawStrategy.createNewFeature(id, ev.lngLat);
						setNewFeature(currentFeature);
					}

					map?.on('mousemove', onMoveDrawing);
					map?.once('mouseup', (ev) => {
						finishDrawing();
					});

					map?.once('mouseout', (ev) => {
						finishDrawing();
					});
				}
			}
		});
	}

	return {
		drawMode,
		drawColor,
		drawWidth,
		isDrawing: readonly(isDrawing),
		initDrawing,
		undoLastFeature,
		initHighlighting
	};
}
