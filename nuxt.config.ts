// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/supabase", "@nuxtjs/ionic", "@nuxt/ui", "@nuxt/icon"],
  ssr: false,
  plugins: ['plugins/signature.js', 'plugins/datepicker.js',],

  supabase: {
    url: "https://otqcodzxgjtfswxviqtx.supabase.co",
    key:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90cWNvZHp4Z2p0ZnN3eHZpcXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjA4MzY4MzEsImV4cCI6MjAzNjQxMjgzMX0.9fXj-L3eKobdQHbReueKkE09i67x158eBLQgoP2bSZY",
    serviceKey:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90cWNvZHp4Z2p0ZnN3eHZpcXR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMDgzNjgzMSwiZXhwIjoyMDM2NDEyODMxfQ.ie8JNpPBpD1hcTYx69QwKKp9oBqsrMPEBJwstH-PCrg",
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      include: undefined,
      exclude: ["/register", "/forgot_password","/reset-password","/finishregistered"], 
      cookieRedirect: false
    },
    clientOptions: {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
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
