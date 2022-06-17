import 'https://deno.land/x/dotenv@v3.2.0/load.ts';
import { snakeCase } from 'https://deno.land/x/case/mod.ts';
import { Destination, download } from 'https://deno.land/x/download/mod.ts';

type Component = {
	key: string;
	name: string;
	description: string;
	documentationLinks: string[];
};

const headers = new Headers({
	'X-FIGMA-TOKEN': Deno.env.get('FIGMA_API_KEY') || '',
});

const getComponents = async () => {
	const query = new URLSearchParams({
		ids: decodeURIComponent('1107%3A465'),
	});
	const res = await fetch(
		`https://api.figma.com/v1/files/${Deno.env.get('FIGMA_FILE_KEY')}?${query}`,
		{ method: 'GET', headers },
	);
	const data = await res.json() as {
		components: { [key: string]: Component };
	};
	const { components } = data;
	return components;
};

const getComponentImagePaths = async (
	components: { [key: string]: Component },
): Promise<Array<{ name: string; src: string }>> => {
	const ids = Object.keys(components).map((k: string) => decodeURIComponent(k)).join(',');
	const query = new URLSearchParams({ format: 'svg', ids });
	const res = await fetch(
		`https://api.figma.com/v1/images/${Deno.env.get('FIGMA_FILE_KEY')}?${query}`,
		{ method: 'GET', headers },
	);
	const data = await res.json();
	const { images } = data;
	return Object.entries(components).map(([key, value]) => ({
		name: snakeCase(value.name),
		src: images[key],
	}));
};

try {
	const components = await getComponents();
	const imageList = await getComponentImagePaths(components);

	await Promise.all(imageList.map(async ({ name, src }) => {
		const destination: Destination = {
			file: `${name}.svg`,
			dir: './out',
		};
		await download(src, destination);
	}));
} catch (e) {
	console.error(e);
}
