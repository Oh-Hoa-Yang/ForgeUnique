export const useAppToast = () => {
  const toast = useToast()

  return{
    toastSuccess: ({ title, description = null }) => {
      toast.add({
        title,
        description,
        icon: 'i-heroicons-check-circle',
        color:'green',
        duration: 5000, // 5 seconds
        dismissible: true, // Allow swipe to dismiss
      })
    },
    toastError: ({ title, description = null }) => {
      toast.add({
        title,
        description,
        icon: 'i-heroicons-exclamation-circle',
        color: 'red',
        duration: 5000, // 5 seconds
        dismissible: true, // Allow swipe to dismiss
      })
    }
  }
}
