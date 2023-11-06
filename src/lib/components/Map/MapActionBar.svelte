<script context="module" lang="ts">
	export type DrawMode = 'move' | 'pen' | 'highlighter' | 'street' | 'circle' | 'polygon';
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		ChevronLeft,
		Highlighter,
		Move,
		PenLine,
		Radius,
		Route,
		Settings,
		Share2,
		Undo,
		Waypoints
	} from 'lucide-svelte';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

	export let drawMode: DrawMode = 'move';
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
				<PopoverContent class="w-80">
					<div class="grid gap-4">
						<div class="space-y-2">
							<h4 class="font-medium leading-none">Dimensions</h4>
							<p class="text-sm text-muted-foreground">Set the dimensions for the layer.</p>
						</div>
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
				title="Straßen folgen"
				variant={drawMode === 'street' ? 'default' : 'ghost'}
				size="icon"
				on:click={() => (drawMode = 'street')}
			>
				<Route />
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
			<Button variant="ghost" size="icon" title="Rückgängig machen">
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
