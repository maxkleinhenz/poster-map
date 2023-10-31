<script setup lang="ts">
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { Map, NavigationControl } from 'maplibre-gl';
	import { onMount } from 'svelte';
	import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';

	onMount(() => {
		const map = new Map({
			container: 'map',
			style: `https://api.maptiler.com/maps/streets/style.json?key=${PUBLIC_MAPTILER_API_KEY}`,
			center: [13.7373, 51.0504],
			zoom: 12
		});

		map.addControl(
			new NavigationControl({
				visualizePitch: true
			})
		);
	});
</script>

<div id="map" class="h-full" />
