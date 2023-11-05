<script lang="ts">
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { Map, GeoJSONSource, LngLat, type LngLatLike } from 'maplibre-gl';
	import { onMount } from 'svelte';
	import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';
	import type { Feature, LineString } from 'geojson';
	import MapActionBar, { type DrawMode } from './MapActionBar.svelte';

	let route: Feature<LineString> = {
		type: 'Feature',
		geometry: { type: 'LineString', coordinates: [] },
		properties: []
	};

	let drawMode: DrawMode = 'move';

	onMount(() => {
		const map = new Map({
			container: 'map',
			style: `https://api.maptiler.com/maps/streets/style.json?key=${PUBLIC_MAPTILER_API_KEY}`,
			center: [13.7373, 51.0504],
			zoom: 12
		});

		// map.addControl(
		// 	new NavigationControl({
		// 		visualizePitch: true
		// 	})
		// );

		map.on('load', (ev) => {
			ev.target.addSource('route', {
				type: 'geojson',
				data: route
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
					'line-color': '#888',
					'line-width': 8
				}
			});
		});

		map.on('mousemove', (ev) => {
			if (drawMode != 'pen') return;

			const lastPoint = route.geometry.coordinates.length
				? route.geometry.coordinates[route.geometry.coordinates.length - 1]
				: undefined;
			const lnglat = ev.lngLat;
			const distance = lastPoint
				? lnglat.distanceTo(LngLat.convert(lastPoint as LngLatLike))
				: Number.MAX_SAFE_INTEGER;

			if (distance > 5) {
				route.geometry.coordinates?.push(ev.lngLat.toArray());
				(map.getSource('route') as GeoJSONSource)?.setData(route);
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
		<MapActionBar bind:drawMode />
	</div>
</div>
