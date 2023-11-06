<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { tv, type VariantProps } from 'tailwind-variants';
	import { cn } from '$lib/utils';

	const buttonVariants = tv({
		base: 'rounded-full border-slate-700 hover:scale-110 transition-transform',
		variants: {
			color: {
				black: 'bg-black hover:bg-black',
				white: 'bg-white hover:bg-white border border-slate-400',
				'gray-200': 'bg-gray-200 hover:bg-gray-200',
				'gray-500': 'bg-gray-500 hover:bg-gray-500',
				'gray-800': 'bg-gray-800 hover:bg-gray-800',
				'purple-200': 'bg-purple-200 hover:bg-purple-200',
				'purple-500': 'bg-purple-500 hover:bg-purple-500',
				'purple-800': 'bg-purple-800 hover:bg-purple-800',
				'red-200': 'bg-red-200 hover:bg-red-200',
				'red-500': 'bg-red-500 hover:bg-red-500',
				'red-800': 'bg-red-800 hover:bg-red-800',
				'blue-200': 'bg-blue-200 hover:bg-blue-200',
				'blue-500': 'bg-blue-500 hover:bg-blue-500',
				'blue-800': 'bg-blue-800 hover:bg-blue-800',
				'green-200': 'bg-green-200 hover:bg-green-200',
				'green-500': 'bg-green-500 hover:bg-green-500',
				'green-800': 'bg-green-800 hover:bg-green-800'
			},
			defaultVariants: {
				color: 'black'
			}
		}
	});

	type Color = VariantProps<typeof buttonVariants>['color'];

	export let color: Color = 'black';
	export let active = false;
</script>

<Button
	class={cn(
		buttonVariants({ color }),
		active ? 'hover:ring-2 ring-2 ring-black ring-offset-2 ' : ''
	)}
	size="icon"
	variant="ghost"
	on:click
></Button>
