<script lang="ts">
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { Map } from 'maplibre-gl';
	import { onDestroy, onMount } from 'svelte';
	import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';
	import { Locate, LocateFixed, ZoomIn, ZoomOut } from 'lucide-svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import MapActionBar from '$lib/components/Map/MapActionBar.svelte';
	import { usePositionStore } from '$lib/stores/usePositionStore';
	import type { Unsubscriber } from 'svelte/store';
	import type { MapSchema } from '$lib/db/schema';
	import { useMapPosition } from './useMapPosition';
	import { useMapDrawing, type MyGeometry } from './useMapDrawing';
	import type { FeatureCollection } from 'geojson';

	let map: Map | undefined;
	const featureCollection: FeatureCollection<MyGeometry> = {
		type: 'FeatureCollection',
		features: []
	};

	const routeSource = 'route-source';
	const routeLayer = 'route-layer';
	const hightlightLayer = 'route-hover';

	const { drawMode, initDrawing, undoLastFeature, initHighlighting } = useMapDrawing(
		featureCollection,
		routeSource
	);
	const { positionStore, errorStore, startWatch } = usePositionStore();
	const { setMarker, removeMarker } = useMapPosition();

	export let campaign: MapSchema;

	drawMode.subscribe((drawMode) => {
		if (!map) return;

		if (drawMode === 'move') {
			map.dragPan.enable();
			map.getCanvas().style.cursor = 'grab';
		} else {
			map.dragPan.disable();
			map.getCanvas().style.cursor = 'default';
		}
	});

	let positionUnsubscriber: Unsubscriber | undefined = undefined;
	let positionErrorUnsubscriber: Unsubscriber | undefined;
	let positionError: GeolocationPositionError | undefined = undefined;
	function startWatchingPosition() {
		positionUnsubscriber = positionStore.subscribe((pos) => {
			if (!pos || !map) return;

			if (!positionUnsubscriber) {
				// fly to point only fro the first time
				map.flyTo({
					center: { lng: pos.coords.longitude, lat: pos.coords.latitude },
					animate: true
				});
			}

			setMarker(map, pos.coords);
		});
		positionErrorUnsubscriber = errorStore.subscribe((err) => {
			positionError = err;
			if (err) {
				stopWatchingPosition();
			}
		});

		startWatch();
	}

	function stopWatchingPosition() {
		if (positionErrorUnsubscriber) {
			positionErrorUnsubscriber();
			positionErrorUnsubscriber = undefined;
		}

		if (positionUnsubscriber) {
			positionUnsubscriber();
			positionUnsubscriber = undefined;
		}

		if (map) {
			removeMarker(map);
		}
	}

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
				data: featureCollection
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
		stopWatchingPosition();
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
			variant={positionUnsubscriber ? 'default' : 'ghost'}
			on:click={() => (positionUnsubscriber ? stopWatchingPosition() : startWatchingPosition())}
		>
			{#if positionUnsubscriber}
				<LocateFixed />
			{:else}
				<Locate />{/if}
		</Button>
	</div>
</div>

<AlertDialog.Root
	open={!!positionError}
	onOpenChange={(value) => {
		if (!value) {
			positionError = undefined;
		}
	}}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Position konnte nicht ermittelt werden</AlertDialog.Title>
			<AlertDialog.Description>
				{positionError?.code}: {positionError?.message}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Ok</AlertDialog.Cancel>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
