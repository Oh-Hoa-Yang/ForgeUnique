export const useSupabaseHelper = () => {
  const { toastError } = useAppToast();

  const handleError = (error, customMessage = 'An error occurred') => {
    if (error) {
      toastError({ title: 'Error', description: `${customMessage}: ${error.message}` });
      return false;
    }
    return true;
  };

  return { handleError };
};
