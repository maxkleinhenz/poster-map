import { GeoJSONSource, Map, Marker, type GeoJSONSourceSpecification } from 'maplibre-gl';
import * as turf from '@turf/turf';
import { usePositionStore } from '$lib/stores/usePositionStore';
import { writable, type Unsubscriber, readonly, get } from 'svelte/store';

type PositionWatchState = 'inactive' | 'searching' | 'active' | 'follow';

const AccuracyPositionSource = 'accuracy-position';
const AccuracyPositionLayer = 'accuracy-position-circle-layer';
const AccuracyPositionOutlineLayer = 'accuracy-position-circle-outline-layer';

const createNewMarker = () => {
	const el = document.createElement('div');
	el.className = 'position-marker';
	const marker = new Marker({ element: el });
	return marker;
};

export const useMapPosition = () => {
	const positionStateStore = writable<PositionWatchState>('inactive');

	let positionUnsubscriber: Unsubscriber | undefined = undefined;
	let positionErrorUnsubscriber: Unsubscriber | undefined;
	const { positionStore, errorStore, startWatch, clearError } = usePositionStore();

	let marker: Marker | undefined = undefined;

	function onMapDrag() {
		if (get(positionStateStore) === 'follow') {
			positionStateStore.set('active');
		}
	}

	function flyToLocation(map: Map, pos: GeolocationPosition) {
		map.flyTo({
			center: { lng: pos.coords.longitude, lat: pos.coords.latitude },
			animate: true
		});
	}

	function enableFollow(map?: Map) {
		if (!map) return;

		const pos = get(positionStore);

		if (pos && get(positionStateStore) === 'active') {
			positionStateStore.set('follow');
			flyToLocation(map, pos);
		}
	}

	function startWatchingPosition(map?: Map) {
		if (!map) return;

		map.on('drag', onMapDrag);

		positionUnsubscriber = positionStore.subscribe((pos) => {
			if (!pos) return;

			setMarker(map, pos.coords);

			if (get(positionStateStore) !== 'active') {
				positionStateStore.set('follow');
				flyToLocation(map, pos);
			}
		});
		positionErrorUnsubscriber = errorStore.subscribe((err) => {
			if (!err) return;

			stopWatchingPosition(map);
		});

		positionStateStore.set('searching');
		startWatch();
	}

	function stopWatchingPosition(map?: Map) {
		if (!map) return;

		positionStateStore.set('inactive');

		if (positionErrorUnsubscriber) {
			positionErrorUnsubscriber();
		}

		if (positionUnsubscriber) {
			positionUnsubscriber();
		}

		if (map) {
			map.off('drag', onMapDrag);
			removeMarker(map);
		}
	}

	function setMarker(map: Map, position: GeolocationCoordinates) {
		if (!marker) {
			marker = createNewMarker();
		}

		const lon = position?.longitude;
		const lat = position?.latitude;

		marker.setLngLat([lon, lat]).addTo(map);
		setAccuracyCircleSource(map, [position.longitude, position.latitude], position.accuracy);
	}

	function removeMarker(map: Map) {
		marker?.remove();
		setAccuracyCircleSource(map, undefined, undefined);
	}

	function setAccuracyCircleSource(
		map: Map,
		postion: number[] | undefined,
		radius: number | undefined
	) {
		if (postion === undefined || radius === undefined || radius <= 50) {
			if (map.getLayer(AccuracyPositionLayer)) map.removeLayer(AccuracyPositionLayer);
			if (map.getLayer(AccuracyPositionOutlineLayer)) map.removeLayer(AccuracyPositionOutlineLayer);
			if (map.getSource(AccuracyPositionSource)) map.removeSource(AccuracyPositionSource);
		} else {
			const circle = turf.circle(postion, radius, {
				steps: 64,
				units: 'meters'
			});

			const sourceSpec: GeoJSONSourceSpecification = {
				type: 'geojson',
				data: circle,
				cluster: false
			};

			const source = map.getSource(AccuracyPositionSource) as GeoJSONSource;
			if (source) {
				source.setData(sourceSpec.data as GeoJSON.GeoJSON);
			} else {
				map.addSource(AccuracyPositionSource, sourceSpec);
			}

			// Circle
			if (!map.getLayer(AccuracyPositionLayer)) {
				map.addLayer({
					id: AccuracyPositionLayer,
					type: 'fill',
					source: AccuracyPositionSource,
					paint: {
						'fill-color': '#42a5f5',
						'fill-opacity': 0.2
					}
				});
			}

			// Outline
			if (!map.getLayer(AccuracyPositionOutlineLayer)) {
				map.addLayer({
					id: AccuracyPositionOutlineLayer,
					type: 'line',
					source: AccuracyPositionSource,
					paint: {
						'line-color': '#42a5f5',
						'line-width': 3
					}
				});
			}
		}
	}

	return {
		positionStore,
		errorStore,
		positionStateStore: readonly(positionStateStore),
		startWatchingPosition,
		stopWatchingPosition,
		enableFollow,
		clearError
	};
};
