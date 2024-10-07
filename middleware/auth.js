export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser();

  if (user.value) {
    await navigateTo('/');
  } else if (!user.value) {
    await navigateTo('/login');
  }
})
