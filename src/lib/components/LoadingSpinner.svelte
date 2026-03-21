<script lang="ts">
	interface Props {
		size?: 'sm' | 'md' | 'lg';
	}

	const { size = 'md' }: Props = $props();

	const sizeClasses = {
		sm: 'h-4 w-4 border-2',
		md: 'h-8 w-8 border-2',
		lg: 'h-12 w-12 border-3'
	};
</script>

<div
	class="inline-block animate-spin rounded-full border-current border-t-transparent {sizeClasses[
		size
	]}"
></div>
