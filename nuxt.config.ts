// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },
	modules: ["@nuxtjs/supabase", "@nuxtjs/ionic"],
	ssr: false,
  plugins: ['plugins/signature.js'],
	supabase: {
		redirectOptions: {
			login: "/login",
			callback: "/confirm",
			exclude: ["/register"],
		},
	}
})