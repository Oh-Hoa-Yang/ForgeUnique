export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser();
  const router = useRouter();

  // Allow unauthenticated access to specific routes
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  if (publicRoutes.includes(to.path)) {
    return; // Skip middleware for public routes
  }

  // Redirect to login if the user is not authenticated
  if (!user.value) {
    return router.push('/login');
  }
});
