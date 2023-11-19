<script lang="ts">
	import MapPane from '$lib/components/Map/MapPane.svelte';

	export let data;
</script>

<section class="flex flex-col h-full">
	<div class="flex-1">
		<MapPane campaign={data.map} />
	</div>
</section>
