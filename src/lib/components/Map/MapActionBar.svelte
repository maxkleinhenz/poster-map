<script context="module" lang="ts">
	export type DrawMode = 'move' | 'pen' | 'highlighter' | 'circle' | 'polygon';
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Slider } from '$lib/components/ui/slider';
	import { drawColor, drawMode, drawOpacity, drawWidth } from '$lib/stores/useMapDrawingStore';
	import {
		ChevronsLeft,
		Eraser,
		Highlighter,
		Move,
		PenLine,
		Radius,
		Save,
		Settings,
		Share2,
		Undo,
		Waypoints
	} from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import AppContainer from '../App/AppContainer.svelte';
	import MapColorButton from './MapColorButton.svelte';
	import { DrawWidthMax } from './useMapDrawing';

	const dispatch = createEventDispatcher<{
		undo: null;
		save: null;
	}>();
</script>

<AppContainer
	id="map-action-bar"
	class="h-full grid grid-col-[auto,1fr,auto] gap-2 overflow-y-hidden"
>
	<div class="grid">
		<Button href="/" variant="ghost" size="icon" title="Zurück zum Dashboard"
			><ChevronsLeft /></Button
		>
		<div class="h-min border-b border-primary"></div>
	</div>

	<ScrollArea class="self-center">
		<div class="flex flex-col flex-1 gap-2">
			<Button
				title="Karte bewegen"
				variant={$drawMode === 'move' ? 'default' : 'ghost'}
				size="icon"
				on:click={() => {
					drawMode.set('move');
				}}
			>
				<Move />
			</Button>
			<Popover portal="#map-action-bar">
				<PopoverTrigger asChild let:builder>
					<Button
						title="Stift"
						builders={[builder]}
						variant={$drawMode === 'pen' ? 'default' : 'ghost'}
						size="icon"
						on:click={() => drawMode.set('pen')}
					>
						<PenLine />
					</Button>
				</PopoverTrigger>
				<PopoverContent class="w-[17rem]" align="start" side="right" sideOffset={12}>
					<div class="grid gap-8">
						<section class="space-y-3">
							<h4 class="font-medium leading-none">Farben</h4>
							<div class="flex flex-wrap gap-2">
								<MapColorButton
									color="black"
									on:click={() => drawColor.set('#000')}
									active={$drawColor === '#000'}
								/>
								<MapColorButton
									color="white"
									on:click={() => drawColor.set('#FFF')}
									active={$drawColor === '#FFF'}
								/>
								<MapColorButton
									color="gray-200"
									on:click={() => drawColor.set('#e5e7eb')}
									active={$drawColor === '#e5e7eb'}
								/>
								<MapColorButton
									color="gray-500"
									on:click={() => drawColor.set('#6b7280')}
									active={$drawColor === '#6b7280'}
								/>
								<MapColorButton
									color="gray-800"
									on:click={() => drawColor.set('#1f2937')}
									active={$drawColor === '#1f2937'}
								/>
								<MapColorButton
									color="purple-200"
									on:click={() => drawColor.set('#e9d5ff')}
									active={$drawColor === '#e9d5ff'}
								/>
								<MapColorButton
									color="purple-500"
									on:click={() => drawColor.set('#a855f7')}
									active={$drawColor === '#a855f7'}
								/>
								<MapColorButton
									color="purple-800"
									on:click={() => drawColor.set('#6b21a8')}
									active={$drawColor === '#6b21a8'}
								/>
								<MapColorButton
									color="red-200"
									on:click={() => drawColor.set('#fecaca')}
									active={$drawColor === '#fecaca'}
								/>
								<MapColorButton
									color="red-500"
									on:click={() => drawColor.set('#ef4444')}
									active={$drawColor === '#ef4444'}
								/>
								<MapColorButton
									color="red-800"
									on:click={() => drawColor.set('#991b1b')}
									active={$drawColor === '#991b1b'}
								/>
								<MapColorButton
									color="blue-200"
									on:click={() => drawColor.set('#bfdbfe')}
									active={$drawColor === '#bfdbfe'}
								/>
								<MapColorButton
									color="blue-500"
									on:click={() => drawColor.set('#3b82f6')}
									active={$drawColor === '#3b82f6'}
								/>
								<MapColorButton
									color="blue-800"
									on:click={() => drawColor.set('#1e40af')}
									active={$drawColor === '#1e40af'}
								/>
								<MapColorButton
									color="green-200"
									on:click={() => drawColor.set('#bbf7d0')}
									active={$drawColor === '#bbf7d0'}
								/>
								<MapColorButton
									color="green-500"
									on:click={() => drawColor.set('#22c55e')}
									active={$drawColor === '#22c55e'}
								/>
								<MapColorButton
									color="green-800"
									on:click={() => drawColor.set('#166534')}
									active={$drawColor === '#166534'}
								/>
							</div>
						</section>
						<section class="space-y-3">
							<h4 class="font-medium leading-none">Stärke ({$drawWidth})</h4>
							<div class="flex flex-wrap gap-3">
								<Slider
									min={1}
									max={DrawWidthMax}
									value={[$drawWidth]}
									onValueChange={(v) => drawWidth.set(v[0])}
									step={1}
								></Slider>
							</div>
						</section>
						<section class="space-y-3">
							<h4 class="font-medium leading-none">Deckkraft ({$drawOpacity}%)</h4>
							<div class="flex flex-wrap gap-3">
								<!-- <Slider
									min={10}
									max={100}
									value={[$drawOpacity]}
									onValueChange={(v) => drawOpacity.set(v[0])}
									step={10}
								></Slider> -->
							</div>
						</section>
					</div>
				</PopoverContent>
			</Popover>

			<Button
				title="Textmarker"
				variant={$drawMode === 'highlighter' ? 'default' : 'ghost'}
				size="icon"
				on:click={() => drawMode.set('highlighter')}
			>
				<Highlighter />
			</Button>

			<Button
				title="Kreis"
				variant={$drawMode === 'circle' ? 'default' : 'ghost'}
				size="icon"
				on:click={() => drawMode.set('circle')}
			>
				<Radius />
			</Button>

			<Button
				title="Polygon"
				variant={$drawMode === 'polygon' ? 'default' : 'ghost'}
				size="icon"
				on:click={() => drawMode.set('polygon')}
			>
				<Waypoints />
			</Button>

			<div class="h-min border-b border-primary"></div>
			<Button
				variant={$drawMode === 'erase' ? 'default' : 'ghost'}
				size="icon"
				title="Löschen"
				on:click={() => drawMode.set('erase')}
			>
				<Eraser />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				title="Rückgängig machen"
				on:click={() => dispatch('undo')}
			>
				<Undo />
			</Button>
		</div>
	</ScrollArea>

	<div class="grid gap-2">
		<div class="h-min border-b border-primary"></div>
		<Popover portal={null}>
			<PopoverTrigger asChild let:builder>
				<Button
					title="Speichern"
					builders={[builder]}
					variant="ghost"
					size="icon"
					on:click={() => dispatch('save')}
				>
					<Save />
				</Button>
			</PopoverTrigger>
			<PopoverContent class="w-min" align="center" side="right" sideOffset={12}>
				<div class="grid gap-8">Speichern...</div>
			</PopoverContent>
		</Popover>
		<Button title="Teilen" size="icon" variant="ghost">
			<Share2 />
		</Button>
		<Button title="Einstellungen" size="icon" variant="ghost">
			<Settings />
		</Button>
	</div>
</AppContainer>
