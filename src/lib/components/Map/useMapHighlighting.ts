import { get, readonly, writable, type Readable } from 'svelte/store';
import type { Map, MapMouseEvent } from 'maplibre-gl';
import type { Feature } from 'geojson';
import { featureCollection } from '$lib/stores/useMapDrawingStore';

const highlight = writable<Feature | undefined>(undefined);

export function useMapHighlighting(isDrawing: Readable<boolean>) {
	let _routeLayer: string;
	let _hightlightLayer: string;

	function onMousemove(ev: MapMouseEvent & Object) {
		if (get(isDrawing)) {
			return;
		}

		const map = ev.target;
		const features = map.queryRenderedFeatures(
			[
				[ev.point.x - 5, ev.point.y - 5],
				[ev.point.x + 5, ev.point.y + 5]
			],
			{ layers: [_routeLayer], validate: true }
		);

		if (features && features?.length > 0) {
			setHightlight(map, features[0]);
		} else {
			removeHightlight(map);
		}
	}

	function setHightlight(map: Map, feature: Feature) {
		const id = feature.id;
		if (id) {
			const toHighlight = get(featureCollection).features.find((f) => f.id == id);
			map.setFilter(_hightlightLayer, ['==', ['id'], id]);
			highlight.set(toHighlight);
		}
	}

	function removeHightlight(map: Map) {
		map.setFilter(_hightlightLayer, ['==', ['id'], 0]);
		highlight.set(undefined);
	}

	function initHighlighting(map: Map, routeLayer: string, hightlightLayer: string) {
		_routeLayer = routeLayer;
		_hightlightLayer = hightlightLayer;

		map.on('mousemove', onMousemove);
	}

	return {
		highlight: readonly(highlight),
		initHighlighting
	};
}
