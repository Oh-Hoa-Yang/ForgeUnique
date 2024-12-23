import PullRefresh from 'pull-refresh-vue3';

export default defineNuxtPlugin((useNuxtApp) => {
  useNuxtApp.vueApp.use(PullRefresh);
});