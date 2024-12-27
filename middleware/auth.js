export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser();
  const router = useRouter();

  if (to.path === '/reset-password') {
    // Allow access to reset-password even without authentication
    console.log('Allowing access to /reset-password');
    return;
  }

  if (!user.value) {
    console.log('No authenticated user. Redirecting to /login...');
    return router.push('/login');
  }
});
