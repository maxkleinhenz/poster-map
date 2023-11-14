<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { insertMapSchema, type InsertMapSchema } from '$lib/db/schema';
	import type { ButtonEventHandler } from 'bits-ui/dist/bits/button';
	import { ChevronRight, Plus } from 'lucide-svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { z } from 'zod';

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

	let openNewMapDialog = false;
	let newMapData: InsertMapSchema = {
		name: '',
		description: undefined,
		lat: 1,
		lng: 2
	};

	let form: SuperValidated<typeof insertMapSchema>;

	function onSubmit(ev: SubmitEvent) {
		ev.preventDefault();

		const result = insertMapSchema.safeParse(form);
		console.log(result);
		if (result.success) openNewMapDialog = false;
	}
</script>

<div>
	<div class="p-3">
		<Dialog.Root bind:open={openNewMapDialog}>
			<Dialog.Trigger class={buttonVariants({ variant: 'secondary' })}
				><Plus /> Neue Karte</Dialog.Trigger
			>
			<Dialog.Content>
				<Form.Root {form} schema={insertMapSchema} let:config on:submit={onSubmit}>
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
