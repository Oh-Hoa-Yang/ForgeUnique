import { VueSignaturePad } from "selemondev/vue3-signature-pad";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueSignaturePad);
})
