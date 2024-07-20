import Vue3Signature from "vue3-signature";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Vue3Signature);
})
