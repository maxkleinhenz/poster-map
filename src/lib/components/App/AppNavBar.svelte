<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Map } from 'lucide-svelte';
</script>

<nav class="bg-primary shadow-lg">
	<div class="px-2 sm:px-6 lg:px-12 xl:px-24">
		<div class="relative flex h-16 items-center justify-between">
			<div class="flex flex-1 items-stretch justify-start gap-5">
				<div class="flex flex-shrink-0 items-center">
					<Button
						variant="ghost"
						href="/"
						class="text-primary-foreground rounded-md px-3 py-2 text-md font-medium flex gap-2"
						aria-current="page"><Map /> Plakat-Karte</Button
					>
				</div>
				<div class="flex space-x-4">
					<Button
						href="/"
						variant="ghost"
						class="text-primary-foreground rounded-md px-3 py-2 text-sm font-medium"
						aria-current="page">Dashboard</Button
					>
				</div>
			</div>
		</div>
	</div>
</nav>
