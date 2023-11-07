<script lang="ts">
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { Map, GeoJSONSource, LngLat, type LngLatLike, MapMouseEvent } from 'maplibre-gl';
	import { onMount } from 'svelte';
	import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';
	import type { Feature, LineString, FeatureCollection } from 'geojson';
	import MapActionBar, { type DrawMode } from '$lib/components/Map/MapActionBar.svelte';

	let drawMode: DrawMode = 'move';
	let drawColor = '#000';
	let drawWidth = 8;
	function drawModeChanged(drawMode: DrawMode) {
		if (!map) return;

		if (drawMode === 'move') {
			map.dragPan.enable();
			map.getCanvas().style.cursor = 'grab';
		} else {
			map.dragPan.disable();
			map.getCanvas().style.cursor = 'default';
		}
	}

	$: drawModeChanged(drawMode);

	type MyGeometry = LineString; // Point | LineString | Polygon;

	let featureCollection: FeatureCollection<MyGeometry> = {
		type: 'FeatureCollection',
		features: []
	};

	const isDrawMouseButton = (ev: MapMouseEvent) => ev.originalEvent.buttons === 1;
	let isDrawing = false;

	function createNewRoute() {
		const route: Feature<LineString> = {
			type: 'Feature',
			geometry: { type: 'LineString', coordinates: [] },
			properties: {
				appearance: {
					color: drawColor,
					width: drawWidth
				}
			}
		};
		featureCollection.features.push(route);
		isDrawing = true;
	}

	function finishNewRoute() {
		isDrawing = false;
	}

	function undoLastFeature() {
		if (featureCollection.features.length <= 0) return;

		finishNewRoute();

		featureCollection.features = featureCollection.features.slice(0, -1);
		setMapRoutes(featureCollection);
	}

	function setMapRoutes(newCollection: FeatureCollection<MyGeometry>) {
		featureCollection = { ...newCollection };
		(map.getSource('route') as GeoJSONSource)?.setData(newCollection);
	}

	let map: Map;
	onMount(() => {
		map = new Map({
			container: 'map',
			style: `https://api.maptiler.com/maps/streets/style.json?key=${PUBLIC_MAPTILER_API_KEY}`,
			center: [13.7373, 51.0504],
			zoom: 12
		});

		drawModeChanged(drawMode);

		// map.addControl(
		// 	new NavigationControl({
		// 		visualizePitch: true
		// 	})
		// );

		map.on('load', (ev) => {
			map.dragRotate.disable();
			map.keyboard.disableRotation();
			map.touchPitch.disable();

			ev.target.addSource('route', {
				type: 'geojson',
				data: featureCollection
			});

			ev.target.addLayer({
				id: 'route',
				type: 'line',
				source: 'route',
				layout: {
					'line-join': 'round',
					'line-cap': 'round'
				},
				paint: {
					'line-color': ['get', 'color', ['get', 'appearance']],
					'line-width': ['get', 'width', ['get', 'appearance']]
				}
			});
		});

		map.on('mousedown', (ev) => {
			if (drawMode === 'pen' && isDrawMouseButton(ev) && !isDrawing) {
				createNewRoute();
			}
		});

		map.on('mouseup', (ev) => {
			finishNewRoute();
		});

		map.on('mouseout', (ev) => {
			finishNewRoute();
		});

		map.on('mousemove', (ev) => {
			if (!isDrawing || drawMode != 'pen' || featureCollection.features.length < 1) {
				return;
			}

			const route = featureCollection.features[featureCollection.features.length - 1];

			const lastPoint = route.geometry.coordinates.length
				? route.geometry.coordinates[route.geometry.coordinates.length - 1]
				: undefined;
			const lnglat = ev.lngLat;
			const distance = lastPoint
				? lnglat.distanceTo(LngLat.convert(lastPoint as LngLatLike))
				: Number.MAX_SAFE_INTEGER;

			if (distance > 5) {
				route.geometry.coordinates?.push(ev.lngLat.toArray());
				setMapRoutes(featureCollection);
			}
		});

		map.on('touchmove', (ev) => {
			console.log('touchmove', ev.lngLat, ev.originalEvent.touches.length);
		});
	});
</script>

<div class="h-full relative">
	<div id="map" class="h-full" />
	<div class="absolute top-0 inset-x-0 my-5 mx-3">
		<MapActionBar bind:drawMode bind:drawColor bind:drawWidth on:undo={undoLastFeature} />
	</div>
</div>
