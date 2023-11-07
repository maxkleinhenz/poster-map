<script lang="ts">
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { Map, GeoJSONSource, LngLat, type LngLatLike, MapMouseEvent } from 'maplibre-gl';
	import { onDestroy, onMount } from 'svelte';
	import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';
	import type { Feature, LineString, FeatureCollection } from 'geojson';
	import { Locate, LocateFixed, ZoomIn, ZoomOut } from 'lucide-svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import MapActionBar, { type DrawMode } from '$lib/components/Map/MapActionBar.svelte';
	import { usePositionStore } from '$lib/stores/position-store';
	import type { Unsubscriber } from 'svelte/store';

	const { positionStore, errorStore, startWatch } = usePositionStore();

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
		map?.off('mousemove', mapOnMove);
	}

	function undoLastFeature() {
		if (featureCollection.features.length <= 0) return;

		finishNewRoute();

		featureCollection.features = featureCollection.features.slice(0, -1);
		setMapRoutes(featureCollection);
	}

	function setMapRoutes(newCollection: FeatureCollection<MyGeometry>) {
		featureCollection = { ...newCollection };
		(map?.getSource('route') as GeoJSONSource)?.setData(newCollection);
	}

	let positionUnsubscriber: Unsubscriber | undefined = undefined;
	let positionErrorUnsubscriber: Unsubscriber | undefined;
	let positionError: GeolocationPositionError | undefined = undefined;
	function startWatchingPosition() {
		positionUnsubscriber = positionStore.subscribe((pos) => {
			if (pos && !positionUnsubscriber) {
				map?.setCenter({ lng: pos.coords.longitude, lat: pos.coords.latitude });
			}
		});
		positionErrorUnsubscriber = errorStore.subscribe((err) => {
			positionError = err;
			if (err) {
				stopWatchinPosition();
			}
		});

		startWatch();
	}

	function stopWatchinPosition() {
		if (positionErrorUnsubscriber) {
			positionErrorUnsubscriber();
			positionErrorUnsubscriber = undefined;
		}

		if (positionUnsubscriber) {
			positionUnsubscriber();
			positionUnsubscriber = undefined;
		}
	}

	let map: Map | undefined;

	function mapOnMove(ev: MapMouseEvent & Object) {
		if (!isDrawing || drawMode != 'pen' || featureCollection.features.length < 1) {
			return;
		}

		ev.originalEvent.offsetY;

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
	}

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
			map?.dragRotate.disable();
			map?.keyboard.disableRotation();
			map?.touchPitch.disable();

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

				map?.on('mousemove', mapOnMove);
				map?.once('mouseup', (ev) => {
					finishNewRoute();
				});

				map?.once('mouseout', (ev) => {
					finishNewRoute();
				});
			}
		});

		map.on('touchmove', (ev) => {
			console.log('touchmove', ev.lngLat, ev.originalEvent.touches.length);
		});
	});

	onDestroy(() => {
		stopWatchinPosition();
	});
</script>

<div class="h-full relative">
	<div id="map" class="h-full" />
	<div class="flex flex-col absolute top-3 inset-x-3 space-y-4">
		<MapActionBar bind:drawMode bind:drawColor bind:drawWidth on:undo={undoLastFeature} />
	</div>
	<div class="absolute top-20 right-3 flex flex-col bg-white p-2 rounded-lg shadow-md gap-2">
		<Button size="icon" variant="ghost" on:click={() => map?.zoomIn()}><ZoomIn /></Button>
		<Button size="icon" variant="ghost" on:click={() => map?.zoomOut()}><ZoomOut /></Button>
		<Button
			size="icon"
			variant={positionUnsubscriber ? 'default' : 'ghost'}
			on:click={() => (positionUnsubscriber ? stopWatchinPosition() : startWatchingPosition())}
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
