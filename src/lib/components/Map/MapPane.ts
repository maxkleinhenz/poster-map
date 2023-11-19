import type { FeatureCollection, LineString } from 'geojson';
import { type Map, type LngLatLike, type MapMouseEvent, LngLat } from 'maplibre-gl';

export type MyGeometry = LineString; // Point | LineString | Polygon;

export const minPixelDistances = 15;
export const pixelDistance = (
	pointOne: { x: number; y: number },
	pointTwo: { x: number; y: number }
) => {
	const { x: x1, y: y1 } = pointOne;
	const { x: x2, y: y2 } = pointTwo;
	const y = x2 - x1;
	const x = y2 - y1;
	return Math.sqrt(x * x + y * y);
};

export function calcNextCoordinate(
	ev: MapMouseEvent & Object,
	map: Map,
	featureCollection: FeatureCollection<MyGeometry>
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
