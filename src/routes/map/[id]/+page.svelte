<script lang="ts">
	import MapPane from '$lib/components/Map/MapPane.svelte';

	export let data;
</script>

<section class="flex flex-col h-full">
	<!-- {#if map} -->
	<div class="flex-1">
		<MapPane campaign={data.map} />
	</div>
	<!-- {/if} -->
</section>
