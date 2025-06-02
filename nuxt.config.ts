// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/supabase", "@nuxtjs/ionic", "@nuxt/ui", "@nuxt/icon", "@nuxtjs/tailwindcss"],
  ssr: false,
  plugins: ['plugins/signature.js', 'plugins/datepicker.js',],

  // Tailwind configuration
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    injectPosition: 0,
    viewer: true,
  },

  // Supabase configuration
  supabase: {
    redirect: false,
    url: process.env.SUPABASE_URL || "https://otqcodzxgjtfswxviqtx.supabase.co",
    key: process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90cWNvZHp4Z2p0ZnN3eHZpcXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjA4MzY4MzEsImV4cCI6MjAzNjQxMjgzMX0.9fXj-L3eKobdQHbReueKkE09i67x158eBLQgoP2bSZY",
    serviceKey: process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90cWNvZHp4Z2p0ZnN3eHZpcXR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMDgzNjgzMSwiZXhwIjoyMDM2NDEyODMxfQ.ie8JNpPBpD1hcTYx69QwKKp9oBqsrMPEBJwstH-PCrg",
    cookieOptions: {
      maxAge: 60 * 60 * 8,
      sameSite: 'lax',
      secure: true
    },
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ["/register", "/forgot_password","/reset-password","/finishregistered","/forgotpassword_notice"],
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
