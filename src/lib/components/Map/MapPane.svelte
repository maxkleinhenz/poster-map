<script lang="ts">
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { Map } from 'maplibre-gl';
	import { onDestroy, onMount } from 'svelte';
	import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';
	import { Locate, LocateFixed, Radar, ZoomIn, ZoomOut } from 'lucide-svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import MapActionBar from '$lib/components/Map/MapActionBar.svelte';
	import type { MapSchema } from '$lib/db/schema';
	import { useMapPosition } from './useMapPosition';
	import { useMapDrawing } from './useMapDrawing';
	import { featureCollection } from '$lib/stores/useMapDrawingStore';
	import { get } from 'svelte/store';

	let map: Map | undefined;

	const routeSource = 'route-source';
	const routeLayer = 'route-layer';
	const hightlightLayer = 'route-hover';

	const { drawMode, initDrawing, undoLastFeature, initHighlighting } = useMapDrawing(routeSource);
	const {
		positionStore,
		positionStateStore,
		errorStore,
		startWatchingPosition,
		stopWatchingPosition,
		clearError
	} = useMapPosition();

	export let campaign: MapSchema;

	const drawModeUnsubscriber = drawMode.subscribe((drawMode) => {
		if (!map) return;

		if (drawMode === 'move') {
			map.dragPan.enable();
			map.getCanvas().style.cursor = 'grab';
		} else {
			map.dragPan.disable();
			map.getCanvas().style.cursor = 'default';
		}
	});

	$: hasPositionError = !!$errorStore;

	const positionStateUnsubscriber = positionStateStore.subscribe((positionState) => {
		const pos = get(positionStore);
		if (positionState === 'active' && pos && map) {
			map.flyTo({
				center: { lng: pos.coords.longitude, lat: pos.coords.latitude },
				animate: true
			});
		}
	});

	onMount(() => {
		map = new Map({
			container: 'map',
			style: `https://api.maptiler.com/maps/streets/style.json?key=${PUBLIC_MAPTILER_API_KEY}`,
			center: [campaign.lat, campaign.lng],
			zoom: 12
		});

		// map.addControl(
		// 	new NavigationControl({
		// 		visualizePitch: true
		// 	})
		// );

		map.on('load', (ev): void => {
			map?.dragRotate.disable();
			map?.keyboard.disableRotation();
			map?.touchPitch.disable();

			ev.target.addSource(routeSource, {
				type: 'geojson',
				data: $featureCollection
			});

			ev.target.addLayer({
				id: hightlightLayer,
				type: 'line',
				source: routeSource,
				layout: {
					'line-join': 'round',
					'line-cap': 'round'
				},
				paint: {
					'line-color': ['get', 'color', ['get', 'appearance']],
					'line-width': ['+', ['get', 'width', ['get', 'appearance']], 10],
					'line-opacity': 0.3
				}
			});

			ev.target.addLayer({
				id: routeLayer,
				type: 'line',
				source: routeSource,
				layout: {
					'line-join': 'round',
					'line-cap': 'round',
					'line-sort-key': 99
				},
				paint: {
					'line-color': ['get', 'color', ['get', 'appearance']],
					'line-width': ['get', 'width', ['get', 'appearance']]
				}
			});

			initDrawing(ev.target);
			initHighlighting(ev.target, routeLayer, hightlightLayer);
		});

		map.on('touchmove', (ev) => {
			console.log('touchmove', ev.lngLat, ev.originalEvent.touches.length);
		});
	});

	onDestroy(() => {
		if (map) {
			stopWatchingPosition(map);
		}

		drawModeUnsubscriber();
		positionStateUnsubscriber();
	});
</script>

<div class="h-full relative">
	<div id="map" class="h-full" />
	<div class="flex flex-col absolute top-3 inset-x-3 space-y-4">
		<MapActionBar on:undo={() => undoLastFeature()} />
	</div>
	<div class="absolute top-20 right-3 flex flex-col bg-white p-2 rounded-lg shadow-md gap-2">
		<Button size="icon" variant="ghost" on:click={() => map?.zoomIn()}><ZoomIn /></Button>
		<Button size="icon" variant="ghost" on:click={() => map?.zoomOut()}><ZoomOut /></Button>
		<Button
			size="icon"
			variant={$positionStateStore === 'inactive' ? 'ghost' : 'default'}
			on:click={() =>
				$positionStateStore === 'inactive' ? startWatchingPosition(map) : stopWatchingPosition(map)}
		>
			{#if $positionStateStore === 'active'}
				<LocateFixed />
			{:else if $positionStateStore === 'searching'}
				<Radar />
			{:else}
				<Locate />
			{/if}
		</Button>
	</div>
</div>

<AlertDialog.Root open={hasPositionError} onOpenChange={(value) => clearError()}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Position konnte nicht ermittelt werden</AlertDialog.Title>
			<AlertDialog.Description>
				{$errorStore?.code}: {$errorStore?.message}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Ok</AlertDialog.Cancel>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
