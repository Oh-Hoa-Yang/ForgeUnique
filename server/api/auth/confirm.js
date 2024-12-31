import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  // Parse query parameters
  const query = getQuery(event);
  const { token_hash, type, next = '/' } = query;

  // Redirect to error page if no token_hash or type provided
  if (!token_hash || !type) {
    return sendRedirect(event, '/auth/auth-code-error', 303);
  }

  // Create Supabase client
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY // Service key for server-side verification
  );

  try {
    // Verify the token with Supabase
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (error) {
      console.error('Error verifying token:', error);
      return sendRedirect(event, '/auth/auth-code-error', 303);
    }

    // Redirect to the intended destination after successful verification
    return sendRedirect(event, next, 303);
  } catch (err) {
    console.error('Unexpected error during token verification:', err);
    return sendRedirect(event, '/auth/auth-code-error', 303);
  }
});
