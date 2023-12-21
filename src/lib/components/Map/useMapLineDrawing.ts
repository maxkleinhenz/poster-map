import type { Feature, GeoJsonProperties, Geometry, MultiLineString } from 'geojson';
import { type Map, LngLat, type LngLatLike, type MapMouseEvent } from 'maplibre-gl';
import {
	pixelDistance,
	type DrawResult,
	type Drawer,
	type NewFeatureOptions
} from './useMapDrawing';
import * as turf from '@turf/turf';

export function isMultilineStringFeature(feature: Feature): feature is Feature<MultiLineString> {
	return feature.geometry.type === 'MultiLineString';
}

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

		if (distance.further) {
			return ev.lngLat;
		}
	}

	return undefined;
}

export function useMapLineDrawing(): Drawer {
	function draw(ev: MapMouseEvent, feature: Feature<Geometry, GeoJsonProperties>): DrawResult {
		if (feature && isMultilineStringFeature(feature)) {
			const nextCoords = calcNextCoordinate(ev, ev.target, feature.geometry);
			if (nextCoords) {
				const lastCoordIndex = feature.geometry.coordinates.length - 1;
				feature.geometry.coordinates[lastCoordIndex].push(nextCoords.toArray());
				return {
					hasCoordinates: true,
					isFinished: false
				};
			}
		}

		return {
			hasCoordinates: false,
			isFinished: false
		};
	}

	function createNewFeature(opts: NewFeatureOptions): Feature<MultiLineString, GeoJsonProperties> {
		const newRoute: Feature<MultiLineString> = {
			type: 'Feature',
			geometry: { type: 'MultiLineString', coordinates: [[opts.start.toArray()]] },
			id: opts.id,
			properties: {
				appearance: {
					color: opts.color,
					width: opts.width,
					opacity: opts.opacity / 100
				}
			}
		};
		return newRoute;
	}

	function canAppend(lngLat: LngLat, feature: Feature<Geometry, GeoJsonProperties>): boolean {
		return isMultilineStringFeature(feature);
	}

	function startAppend(
		lngLat: LngLat,
		feature: Feature<Geometry, GeoJsonProperties>
	): Feature<Geometry, GeoJsonProperties> {
		if (isMultilineStringFeature(feature)) {
			const nearest = turf.nearestPointOnLine(feature, lngLat.toArray());
			feature.geometry.coordinates.push([nearest.geometry.coordinates]);
		}

		return feature;
	}

	return {
		createNewFeature,
		draw,
		canAppend,
		startAppend
	};
}
