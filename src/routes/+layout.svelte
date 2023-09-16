<script>
	import AppNavBar from '$lib/components/App/AppNavBar.svelte';
	import '../app.css';
</script>

<div class="app flex flex-col">
	<header class="pb-3">
		<AppNavBar />
	</header>

	<main class="max-w-5xl p-3 mx-auto w-full">
		<slot />
	</main>

	<footer />
</div>
