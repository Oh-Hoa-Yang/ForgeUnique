export const useAuthUser = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();  // This is reactive

  const fetchUser = async () => {
    if (!user.value) {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        return null;
      }
      return data.user;
    }
    return user.value; // Reactive user
  };

  return { user, fetchUser };
};
