<script>
	import AppNavBar from '$lib/components/App/AppNavBar.svelte';
	import '../app.css';
</script>

<div class="app flex flex-col h-screen">
	<header>
		<AppNavBar />
	</header>

	<main class="flex-1">
		<slot />
	</main>

	<footer />
</div>
