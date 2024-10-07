// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/supabase", "@nuxtjs/ionic", "@nuxt/ui", "@nuxt/icon"],
  ssr: false,
  plugins: ['plugins/signature.js'],

  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      include: undefined,
      exclude: ["/register", "/forgot_password"],
      cookieRedirect: false
    },
    clientOptions: {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true
      }
    }
  },

  // icon: {
  //   clientBundle: {
  //     // list of icons to include in the client bundle
  //     icons: [
  //       'uil:github',
  //       'logos:vitejs'
  //     ],

  //     // include all custom collections in the client bundle
  //     includeCustomCollections: true, 
  //   },
  // },

  compatibilityDate: "2024-08-18",
});
