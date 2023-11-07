<script context="module" lang="ts">
	export type DrawMode = 'move' | 'pen' | 'highlighter' | 'circle' | 'polygon';
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		ChevronLeft,
		Highlighter,
		Move,
		PenLine,
		Radius,
		Settings,
		Share2,
		Undo,
		Waypoints
	} from 'lucide-svelte';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
	import MapColorButton from './MapColorButton.svelte';
	import { Slider } from '$lib/components/ui/slider';
	import { createEventDispatcher } from 'svelte';

	export let drawMode: DrawMode = 'move';
	export let drawColor = '';
	export let drawWidth = 8;

	const dispatch = createEventDispatcher<{
		undo: null;
	}>();
</script>

<div class="w-full flex bg-white shadow-md p-2 rounded-lg items-center gap-5">
	<div>
		<Button href="/" variant="ghost"><ChevronLeft /> Zum Dashboard</Button>
	</div>
	<div class="flex-1 flex gap-2">
		<div class="flex gap-2">
			<Button
				title="Karte bewegen"
				variant={drawMode === 'move' ? 'default' : 'ghost'}
				size="icon"
				on:click={() => (drawMode = 'move')}
			>
				<Move />
			</Button>
			<Popover portal={null}>
				<PopoverTrigger asChild let:builder>
					<Button
						title="Stift"
						builders={[builder]}
						variant={drawMode === 'pen' ? 'default' : 'ghost'}
						size="icon"
						on:click={() => (drawMode = 'pen')}
					>
						<PenLine />
					</Button>
				</PopoverTrigger>
				<PopoverContent class="w-[17rem]">
					<div class="grid gap-8">
						<section class="space-y-3">
							<h4 class="font-medium leading-none">Farben</h4>
							<div class="flex flex-wrap gap-2">
								<MapColorButton
									color="black"
									on:click={() => (drawColor = '#000')}
									active={drawColor === '#000'}
								/>
								<MapColorButton
									color="white"
									on:click={() => (drawColor = '#FFF')}
									active={drawColor === '#FFF'}
								/>
								<MapColorButton
									color="gray-200"
									on:click={() => (drawColor = '#e5e7eb')}
									active={drawColor === '#e5e7eb'}
								/>
								<MapColorButton
									color="gray-500"
									on:click={() => (drawColor = '#6b7280')}
									active={drawColor === '#6b7280'}
								/>
								<MapColorButton
									color="gray-800"
									on:click={() => (drawColor = '#1f2937')}
									active={drawColor === '#1f2937'}
								/>
								<MapColorButton
									color="purple-200"
									on:click={() => (drawColor = '#e9d5ff')}
									active={drawColor === '#e9d5ff'}
								/>
								<MapColorButton
									color="purple-500"
									on:click={() => (drawColor = '#a855f7')}
									active={drawColor === '#a855f7'}
								/>
								<MapColorButton
									color="purple-800"
									on:click={() => (drawColor = '#6b21a8')}
									active={drawColor === '#6b21a8'}
								/>
								<MapColorButton
									color="red-200"
									on:click={() => (drawColor = '#fecaca')}
									active={drawColor === '#fecaca'}
								/>
								<MapColorButton
									color="red-500"
									on:click={() => (drawColor = '#ef4444')}
									active={drawColor === '#ef4444'}
								/>
								<MapColorButton
									color="red-800"
									on:click={() => (drawColor = '#991b1b')}
									active={drawColor === '#991b1b'}
								/>
								<MapColorButton
									color="blue-200"
									on:click={() => (drawColor = '#bfdbfe')}
									active={drawColor === '#bfdbfe'}
								/>
								<MapColorButton
									color="blue-500"
									on:click={() => (drawColor = '#3b82f6')}
									active={drawColor === '#3b82f6'}
								/>
								<MapColorButton
									color="blue-800"
									on:click={() => (drawColor = '#1e40af')}
									active={drawColor === '#1e40af'}
								/>
								<MapColorButton
									color="green-200"
									on:click={() => (drawColor = '#bbf7d0')}
									active={drawColor === '#bbf7d0'}
								/>
								<MapColorButton
									color="green-500"
									on:click={() => (drawColor = '#22c55e')}
									active={drawColor === '#22c55e'}
								/>
								<MapColorButton
									color="green-800"
									on:click={() => (drawColor = '#166534')}
									active={drawColor === '#166534'}
								/>
							</div>
						</section>
						<section class="space-y-3">
							<h4 class="font-medium leading-none">Stärke ({drawWidth})</h4>
							<div class="flex flex-wrap gap-3">
								<Slider
									min={1}
									max={25}
									value={[drawWidth]}
									onValueChange={(v) => (drawWidth = v[0])}
									step={1}
								></Slider>
							</div>
						</section>
					</div>
				</PopoverContent>
			</Popover>

			<Button
				title="Textmarker"
				variant={drawMode === 'highlighter' ? 'default' : 'ghost'}
				size="icon"
				on:click={() => (drawMode = 'highlighter')}
			>
				<Highlighter />
			</Button>

			<Button
				title="Kreis"
				variant={drawMode === 'circle' ? 'default' : 'ghost'}
				size="icon"
				on:click={() => (drawMode = 'circle')}
			>
				<Radius />
			</Button>

			<Button
				title="Polygon"
				variant={drawMode === 'polygon' ? 'default' : 'ghost'}
				size="icon"
				on:click={() => (drawMode = 'polygon')}
			>
				<Waypoints />
			</Button>
		</div>
		<div class="border-l border-primary flex gap-2 pl-2">
			<Button
				variant="ghost"
				size="icon"
				title="Rückgängig machen"
				on:click={() => dispatch('undo')}
			>
				<Undo />
			</Button>
		</div>
	</div>

	<div class="flex gap-2">
		<Button title="Teilen" size="icon" variant="ghost">
			<Share2 />
		</Button>
		<Button title="Einstellungen" size="icon" variant="ghost">
			<Settings />
		</Button>
	</div>
</div>
