export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser();
  const router = useRouter();

  console.log('Middleware triggered for route:', to.path);
  console.log('Authenticated user:', user.value);

  const publicRoutes = ['/login', '/register', '/forgot_password', '/reset-password'];
  
  if (publicRoutes.includes(to.path)) {
    console.log('Skipping middleware for public route:', to.path);

    // Allow access to /reset-password if token exists
    if (to.path === '/reset-password') {
      const token = to.query.token;
      if (token) {
        console.log('Valid token found for reset-password:', token);
        return; // Let the user access the page
      } else {
        console.warn('Missing token for reset-password. Redirecting to /login.');
        return router.push('/login'); // Redirect to /login if no token
      }
    }

    return; // Skip middleware for other public routes
  }

  if (!user.value) {
    console.log('No authenticated user. Redirecting to /login...');
    return router.push('/login');
  }
});

