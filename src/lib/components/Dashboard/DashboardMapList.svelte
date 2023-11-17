<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { insertMapSchema, type InsertMapSchema, type MapSchema } from '$lib/db/schema';
	import { trpc } from '$lib/trpc';
	import { ChevronRight, Plus } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import type { SuperValidated } from 'sveltekit-superforms';

	let mapList: MapSchema[] = [];

	onMount(() => {
		trpc.getAllMaps.query().then((maps) => (mapList = maps as MapSchema[]));
	});

	let openNewMapDialog = false;
	let form: SuperValidated<InsertMapSchema>;
	function onSubmit(formData: FormData) {
		const result = insertMapSchema.safeParse(Object.fromEntries(formData));
		if (result.success) {
			trpc.createMap
				.mutate(result.data)
				.then((id) => {
					openNewMapDialog = false;
					goto(`/map/${id}`);
				})
				.catch((err) => console.error(err));
		}
	}
</script>

<div>
	<div class="p-3">
		<Dialog.Root bind:open={openNewMapDialog}>
			<Dialog.Trigger class={buttonVariants({ variant: 'secondary' })}
				><Plus /> Neue Karte</Dialog.Trigger
			>
			<Dialog.Content>
				<Form.Root
					{form}
					schema={insertMapSchema}
					let:config
					options={{
						SPA: true,
						validators: insertMapSchema,
						onSubmit(input) {
							onSubmit(input.formData);
						}
					}}
				>
					<Dialog.Header>
						<Dialog.Title>Neue Karte anlegen</Dialog.Title>
						<Dialog.Description>Erstelle eine neue Karte</Dialog.Description>
					</Dialog.Header>
					<div class="grid gap-4 py-4">
						<Form.Field {config} name="name">
							<Form.Item>
								<Form.Label>Name</Form.Label>
								<Form.Input />
								<Form.Validation />
							</Form.Item>
						</Form.Field>
						<Form.Field {config} name="description">
							<Form.Item>
								<Form.Label>Beschreibung</Form.Label>
								<Form.Input />
								<Form.Validation />
							</Form.Item>
						</Form.Field>
						<div class="flex gap-2">
							<div class="flex-1">
								<Form.Field {config} name="lat">
									<Form.Item>
										<Form.Label>Latitude</Form.Label>
										<Form.Input type="number" />
										<Form.Validation />
									</Form.Item>
								</Form.Field>
							</div>
							<div class="flex-1">
								<Form.Field {config} name="lng">
									<Form.Item>
										<Form.Label>Longitude</Form.Label>
										<Form.Input type="number" />
										<Form.Validation />
									</Form.Item>
								</Form.Field>
							</div>
						</div>
						<Dialog.Footer>
							<Button type="button" variant="secondary" on:click={() => (openNewMapDialog = false)}
								>Abbrechen</Button
							>
							<Form.Button>Anlegen</Form.Button>
						</Dialog.Footer>
					</div>
				</Form.Root>
			</Dialog.Content>
		</Dialog.Root>
	</div>
	<div class="border-2 rounded-lg">
		{#each mapList as item}
			<a
				href="/map/{item.id}"
				class="first:rounded-t-lg last:rounded-b-lg flex p-3 border-t-2 first:border-0 hover:bg-slate-200 items-center"
			>
				<div class="flex-1">
					<div class="font-medium">{item.name}</div>
					{#if item.description}
						<div>{item.description}</div>
					{/if}
				</div>
				<div>
					<Button variant="secondary" href="/map/{item.id}">Anzeigen <ChevronRight /></Button>
				</div>
			</a>
		{/each}
	</div>
</div>
