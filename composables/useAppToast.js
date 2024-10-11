// ~/composables/useToast.js
import { toastController } from '@ionic/vue';

export const useAppToast = () => {
  const showToast = async (message, header = '', color = 'success', duration = 3000) => {
    const toast = await toastController.create({
      message,
      header,
      color,
      duration,
      cssClass: 'toast-class', // Add any custom CSS class if needed
    });
    await toast.present();
  };

  const toastSuccess = (message, header = 'Success') => {
    showToast(message, header, 'success');
  };

  const toastError = (message, header = 'Error') => {
    showToast(message, header, 'danger');
  };

  return {
    toastSuccess,
    toastError,
  };
};


// export const useAppToast = () => {
//   const toast = useToast()

//   return {
//     toastSuccess: ({ title, description = null }) => {
//       toast.add({
//         title,
//         description,
//         icon: 'i-heroicons-check-circle',
//         color: 'green',
//         timeout: 3000, 
//       });
//     },
//     toastError: ({ title, description = null }) => {
//       toast.add({
//         title,
//         description,
//         icon: 'i-heroicons-exclamation-circle',
//         color: 'red',
//         timeout: 3000, 
//       });
//     }
//   };
// };

// export const useAppToast = () => {
//   const toast = useToast();

//   const showToast = (header, message, color, icon) => {
//     toast.add({
//       header,
//       message,
//       color,
//       icon,
//       duration: 3000, // Duration in milliseconds
//       swipeGesture: true, // Allow swipe gesture to dismiss
//     });
//   };

//   const toastSuccess = ({ header, message }) => {
//     showToast(header, message, 'success', 'checkmark-circle-outline');
//   };

//   const toastError = ({ header, message }) => {
//     showToast(header, message, 'danger', 'warning-outline');
//   };

//   return {
//     toastSuccess,
//     toastError,
//   };
// };
