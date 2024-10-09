export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser();

  if (!user.value) {
    return navigateTo('/login'); // Redirect to login if user is not authenticated
  }
});
