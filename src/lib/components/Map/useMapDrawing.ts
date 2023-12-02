import type { Feature, FeatureCollection, GeoJsonProperties, MultiLineString } from 'geojson';
import {
	LngLat,
	type GeoJSONSource,
	type Map,
	type MapMouseEvent,
	type LngLatLike,
	type GeoJSONFeatureDiff
} from 'maplibre-gl';
import ShortUniqueId from 'short-unique-id';
import { get, readonly, writable } from 'svelte/store';
import { useMapHighlighting } from './useMapHighlighting';
import { drawColor, drawMode, drawWidth, isDrawing } from '$lib/stores/useMapDrawingStore';

export type DrawMode = 'move' | 'pen' | 'highlighter' | 'circle' | 'polygon';
export type MyGeometry = MultiLineString;

const isDrawMouseButton = (ev: MapMouseEvent) => ev.originalEvent.buttons === 1;

const uid = new ShortUniqueId({
	length: 16,
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
function calcNextCoordinate(ev: MapMouseEvent & Object, map: Map, geometry: MultiLineString) {
	const lastPosition = geometry.coordinates.length
		? geometry.coordinates[geometry.coordinates.length - 1]
		: undefined;

	if (!lastPosition || lastPosition.length <= 0) {
		return ev.lngLat;
	} else {
		const lastPositionIndex = lastPosition.length - 1;
		const lastPoint = map?.project(LngLat.convert(lastPosition[lastPositionIndex] as LngLatLike));
		const distance = pixelDistance(lastPoint, { x: ev.point.x, y: ev.point.y });

		if (distance >= minPixelDistances) {
			return ev.lngLat;
		}
	}

	return undefined;
}

function isMultilineStringFeature(feature: Feature): feature is Feature<MultiLineString> {
	return feature.geometry.type === 'MultiLineString';
}

export function useMapDrawing(
	featureCollection: FeatureCollection<MyGeometry>,
	routeSource: string
) {
	const { highlight, initHighlighting } = useMapHighlighting(
		readonly(isDrawing),
		featureCollection
	);
	let mymap: Map | undefined;

	function setFeatureCollection(diff: {
		add?: Feature<MyGeometry>[];
		update?: GeoJSONFeatureDiff[];
	}) {
		if (diff.add) {
			featureCollection.features.push(...diff.add);
		}

		const source = mymap?.getSource(routeSource) as GeoJSONSource;
		source?.updateData(diff);
	}

	function createNewRoute(): Feature<MultiLineString, GeoJsonProperties> {
		const newRoute: Feature<MyGeometry> = {
			type: 'Feature',
			geometry: { type: 'MultiLineString', coordinates: [[]] },
			id: uid.rnd(),
			properties: {
				appearance: {
					color: get(drawColor),
					width: get(drawWidth)
				}
			}
		};

		setFeatureCollection({
			add: [newRoute]
		});
		return newRoute;
	}

	function onMoveDrawing(ev: MapMouseEvent & Object) {
		if (!get(isDrawing) || get(drawMode) != 'pen' || featureCollection.features.length < 1) {
			return;
		}

		const feature = featureCollection.features[featureCollection.features.length - 1];
		draw(ev, feature);
	}

	function onMoveDrawingAppend(ev: MapMouseEvent & Object) {
		if (!get(isDrawing) || get(drawMode) != 'pen') {
			return;
		}

		const geojson = get(highlight);
		if (geojson) {
			if (isMultilineStringFeature(geojson)) {
				draw(ev, geojson);
			}
		}
		if (geojson && isMultilineStringFeature(geojson)) {
			draw(ev, geojson);
		}
	}

	function draw(ev: MapMouseEvent, feature: Feature<MyGeometry>) {
		if (!mymap) {
			return;
		}

		const nextCoords = calcNextCoordinate(ev, mymap, feature.geometry);
		if (!nextCoords) {
			return;
		}

		const lastCoordIndex = feature.geometry.coordinates.length - 1;
		feature.geometry.coordinates[lastCoordIndex].push(nextCoords.toArray());

		setFeatureCollection({
			update: [
				{
					id: feature.id ?? '',
					newGeometry: feature.geometry
				}
			]
		});
	}

	function finishDrawing() {
		isDrawing.set(false);
		mymap?.off('mousemove', onMoveDrawing);
		mymap?.off('mousemove', onMoveDrawingAppend);
	}

	function undoLastFeature() {
		if (featureCollection.features.length <= 0) return;

		finishDrawing();

		featureCollection.features = featureCollection.features.slice(0, -1);
		//setFeatureCollection(featureColl);
	}

	function initDrawing(map: Map) {
		mymap = map;

		map.on('mousedown', (ev) => {
			if (get(drawMode) === 'pen' && isDrawMouseButton(ev) && !get(isDrawing)) {
				isDrawing.set(true);
				const highlighted = get(highlight);
				if (highlighted) {
					if (isMultilineStringFeature(highlighted)) {
						highlighted.geometry.coordinates.push([]);
					}
					map?.on('mousemove', onMoveDrawingAppend);
				} else {
					createNewRoute();
					map?.on('mousemove', onMoveDrawing);
				}

				map?.once('mouseup', (ev) => {
					finishDrawing();
				});

				map?.once('mouseout', (ev) => {
					finishDrawing();
				});
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
