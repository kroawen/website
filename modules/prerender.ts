/* eslint-disable no-console */

import { createDirectus, readItems, rest, staticToken } from '@directus/sdk';
import { defineNuxtModule, extendRouteRules } from '@nuxt/kit';
import { withoutTrailingSlash } from 'ufo';
import type { Schema } from '~/types/schema';

export default defineNuxtModule({
	async setup(_moduleOptions, nuxt) {
		const directusUrl = nuxt.options.runtimeConfig.public.directusUrl as string | undefined;
		const directusTvUrl = nuxt.options.runtimeConfig.public.tvUrl as string | undefined;

		if (!directusUrl || !directusTvUrl) {
			console.warn('Missing directusUrl or directusTvUrl in runtimeConfig');
			return;
		}

		const directus = createDirectus<Schema>(directusUrl)
			.with(staticToken('_62qR5qHgTsk8ZboF7baGTzWZWTUDaoj'))
			.with(rest());

		const permalinks = [];

		const projects = await directus.request(readItems('app', { fields: ['appid'], limit: -1 }));

		permalinks.push(...projects.map((project) => `/built-with-directus/${project.appid}`));

		// Add RSS feed to prerender
		permalinks.push('/rss.xml');

		for (const link of permalinks) {
			extendRouteRules(withoutTrailingSlash(link), {
				prerender: true,
			});
		}
	},
});
