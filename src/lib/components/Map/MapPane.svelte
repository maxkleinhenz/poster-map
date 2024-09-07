<script lang="ts">
	import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';
	import MapActionBar from '$lib/components/Map/MapActionBar.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import type { MapSchema } from '$lib/db/schema';
	import { featureCollection, isDrawing } from '$lib/stores/useMapDrawingStore';
	import { cn } from '$lib/utils';
	import { Locate, LocateFixed, Radar, ZoomIn, ZoomOut } from 'lucide-svelte';
	import { Map } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { onDestroy, onMount } from 'svelte';
	import { get } from 'svelte/store';
	import AppContainer from '../App/AppContainer.svelte';
	import { useMapDrawing, type DrawMode } from './useMapDrawing';
	import { useMapPosition } from './useMapPosition';

	let map: Map | undefined;

	const routeSource = 'route-source';
	const routeLayer = 'route-layer';
	const hightlightLayer = 'route-hover';

	const { drawMode, initDrawing, undoLastFeature, initHighlighting } = useMapDrawing(routeSource);
	const {
		positionStateStore,
		errorStore,
		startWatchingPosition,
		stopWatchingPosition,
		enableFollow,
		clearError
	} = useMapPosition();

	export let campaign: MapSchema;

	let tempDrawMode: DrawMode | undefined = undefined;
	function onKeyDown(e: KeyboardEvent) {
		const d = get(drawMode);
		if (d !== 'move' && e.code === 'Space') {
			tempDrawMode = d;
			drawMode.set('move');
		}
	}
	function onKeyUp(e: KeyboardEvent) {
		if (tempDrawMode) {
			drawMode.set(tempDrawMode);
			tempDrawMode = undefined;
		}
	}

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

	function onLocationButtonClick() {
		if ($positionStateStore === 'inactive') {
			startWatchingPosition(map);
		} else if ($positionStateStore === 'active') {
			enableFollow(map);
		} else {
			stopWatchingPosition(map);
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
					'line-width': ['get', 'width', ['get', 'appearance']],
					'line-opacity': ['get', 'opacity', ['get', 'appearance']]
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
	});
</script>

<svelte:window
	on:keydown|preventDefault|stopPropagation={onKeyDown}
	on:keyup|preventDefault|stopPropagation|={onKeyUp}
/>

<div class="h-full relative">
	<div id="map" class="h-full" />
	<div class="flex flex-col absolute inset-y-0 p-2 space-y-4 pointer-events-none">
		<div class={cn('h-full', $isDrawing ? 'pointer-events-none' : 'pointer-events-auto')}>
			<MapActionBar on:undo={() => undoLastFeature()} on:save={() => {}} />
		</div>
	</div>
	<div class="absolute top-3 right-3 flex self-end gap-4 items-start pointer-events-none">
		<AppContainer
			class={cn('flex flex-col gap-2', $isDrawing ? 'pointer-events-none' : 'pointer-events-auto')}
		>
			<Button size="icon" variant="ghost" on:click={() => map?.zoomIn()}><ZoomIn /></Button>
			<Button size="icon" variant="ghost" on:click={() => map?.zoomOut()}><ZoomOut /></Button>
			<Button
				size="icon"
				variant={$positionStateStore === 'follow' ? 'default' : 'ghost'}
				on:click={onLocationButtonClick}
			>
				{#if $positionStateStore === 'inactive'}
					<Locate />
				{:else if $positionStateStore === 'searching'}
					<Radar />
				{:else}
					<LocateFixed />
				{/if}
			</Button>
		</AppContainer>
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
