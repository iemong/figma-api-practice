import 'https://deno.land/x/dotenv@v3.2.0/load.ts';

const headers = new Headers({
	'X-FIGMA-TOKEN': Deno.env.get('FIGMA_API_KEY') || '',
});

const query = new URLSearchParams({
	ids: decodeURIComponent('1107%3A465'),
});

const res = await fetch(
	`https://api.figma.com/v1/files/${Deno.env.get('FIGMA_FILE_KEY')}?${query}`,
	{
		method: 'GET',
		headers,
	},
);

const data = await res.json();
const { components } = data;

console.log(components);
