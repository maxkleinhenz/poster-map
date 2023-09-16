<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ChevronRight } from 'lucide-svelte';

	type MapItem = {
		id: number;
		title: string;
		desc: string;
	};

	let mapList: MapItem[] = [
		{ id: 1, title: 'Kommunalwahl Flyer', desc: 'Flyergebiet für die Kommunalwahl' },
		{ id: 2, title: 'Kommunalwahl Plakate', desc: 'Plakatgebiet für die Kommunalwahl' },
		{ id: 3, title: 'Kommunalwahl Plakate', desc: 'Plakatgebiet für die Kommunalwahl' }
	];
</script>

<div>
	<div class="border-2 rounded-lg">
		{#each mapList as item}
			<a
				href="/map/{item.id}"
				class="first:rounded-t-lg last:rounded-b-lg flex p-3 border-t-2 first:border-0 hover:bg-slate-200"
			>
				<div class="flex-1">
					<div class="font-medium">{item.title}</div>
					<div>{item.desc}</div>
				</div>
				<div>
					<Button variant="secondary" href="/map/{item.id}">Anzeigen <ChevronRight /></Button>
				</div>
			</a>
		{/each}
	</div>
</div>
