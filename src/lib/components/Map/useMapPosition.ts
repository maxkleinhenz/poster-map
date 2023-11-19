import { GeoJSONSource, Map, Marker, type GeoJSONSourceSpecification } from 'maplibre-gl';
import * as turf from '@turf/turf';

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
	let marker: Marker | undefined = undefined;

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
		setMarker,
		removeMarker
	};
};
