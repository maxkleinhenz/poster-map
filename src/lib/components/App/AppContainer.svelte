<script lang="ts">
	import { cn } from '$lib/utils';

	let className = '';
	export { className as class };
</script>

<div class={cn(`bg-white p-2 rounded-lg shadow-md ${className}`)} {...$$restProps}>
	<slot />
</div>
