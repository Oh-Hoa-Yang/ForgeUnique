export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser();
  const router = useRouter();

  console.log('Middleware triggered for route:', to.path);
  console.log('Authenticated user:', user.value);

  const publicRoutes = ['/login', '/register', '/forgot_password', '/reset-password'];
  if (publicRoutes.includes(to.path)) {
    console.log('Skipping middleware for public route:', to.path);
    return; // Skip middleware for public routes
  }

  if (!user.value) {
    console.log('No authenticated user. Redirecting to /login...');
    return router.push('/login');
  }
});

