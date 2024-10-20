export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser();
  const router = useRouter();

  if (!user.value) {
    return router.push('/login'); // Redirect to login if user is not authenticated
  }
});