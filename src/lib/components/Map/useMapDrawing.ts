import type { Feature, LineString, FeatureCollection } from 'geojson';
import {
	LngLat,
	type GeoJSONSource,
	type Map,
	type MapMouseEvent,
	type LngLatLike
} from 'maplibre-gl';
import ShortUniqueId from 'short-unique-id';
import { get, readonly, writable } from 'svelte/store';

export type DrawMode = 'move' | 'pen' | 'highlighter' | 'circle' | 'polygon';

const featureCollection = writable<FeatureCollection<LineString>>({
	type: 'FeatureCollection',
	features: []
});
const drawMode = writable<DrawMode>('move');
const drawColor = writable<string>('#000');
const drawWidth = writable<number>(8);
const isDrawing = writable<boolean>(false);

const isDrawMouseButton = (ev: MapMouseEvent) => ev.originalEvent.buttons === 1;

const uid = new ShortUniqueId({
	length: 10,
	dictionary: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
});

const minPixelDistances = 15;
const pixelDistance = (pointOne: { x: number; y: number }, pointTwo: { x: number; y: number }) => {
	const { x: x1, y: y1 } = pointOne;
	const { x: x2, y: y2 } = pointTwo;
	const y = x2 - x1;
	const x = y2 - y1;
	return Math.sqrt(x * x + y * y);
};
function calcNextCoordinate(
	ev: MapMouseEvent & Object,
	map: Map,
	featureCollection: FeatureCollection<LineString>
) {
	const route = featureCollection.features[featureCollection.features.length - 1];

	const lastPosition = route.geometry.coordinates.length
		? route.geometry.coordinates[route.geometry.coordinates.length - 1]
		: undefined;

	if (!lastPosition) {
		return ev.lngLat;
	} else {
		const lastPoint = map?.project(LngLat.convert(lastPosition as LngLatLike));
		const distance = pixelDistance(lastPoint, { x: ev.point.x, y: ev.point.y });

		if (distance >= minPixelDistances) {
			return ev.lngLat;
		}
	}

	return undefined;
}

export function useMapDrawing() {
	let mymap: Map | undefined;

	function setFeatureCollection(newCollection: FeatureCollection<LineString>) {
		featureCollection.set({ ...newCollection });
		(mymap?.getSource('route-source') as GeoJSONSource)?.setData(newCollection);
	}

	function createNewRoute() {
		const route: Feature<LineString> = {
			type: 'Feature',
			geometry: { type: 'LineString', coordinates: [] },
			id: uid.rnd(),
			properties: {
				appearance: {
					color: get(drawColor),
					width: get(drawWidth)
				}
			}
		};

		const featureColl = get(featureCollection);
		featureColl.features.push(route);
		setFeatureCollection(featureColl);

		isDrawing.set(true);
	}

	function onMoveDrawing(ev: MapMouseEvent & Object) {
		if (
			!get(isDrawing) ||
			get(drawMode) != 'pen' ||
			get(featureCollection).features.length < 1 ||
			!mymap
		) {
			return;
		}

		const nextCoords = calcNextCoordinate(ev, mymap, get(featureCollection));
		if (!nextCoords) {
			return;
		}

		const featureColl = get(featureCollection);
		const currentRoute = featureColl.features[featureColl.features.length - 1];
		currentRoute.geometry.coordinates?.push(nextCoords.toArray());
		setFeatureCollection(featureColl);
	}

	function finishNewRoute() {
		isDrawing.set(false);
		mymap?.off('mousemove', onMoveDrawing);
	}

	function undoLastFeature() {
		const featureColl = get(featureCollection);
		if (featureColl.features.length <= 0) return;

		finishNewRoute();

		featureColl.features = featureColl.features.slice(0, -1);
		setFeatureCollection(featureColl);
	}

	function initDrawing(map: Map) {
		mymap = map;

		map.on('mousedown', (ev) => {
			if (get(drawMode) === 'pen' && isDrawMouseButton(ev) && !get(isDrawing)) {
				createNewRoute();

				map?.on('mousemove', onMoveDrawing);
				map?.once('mouseup', (ev) => {
					finishNewRoute();
				});

				map?.once('mouseout', (ev) => {
					finishNewRoute();
				});
			}
		});
	}

	return {
		featureCollection,
		drawMode,
		drawColor,
		drawWidth,
		isDrawing: readonly(isDrawing),
		initDrawing,
		undoLastFeature
	};
}
