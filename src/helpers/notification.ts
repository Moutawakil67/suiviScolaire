import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export const showSuccessMessage = (message: string): void => {
  toast.success(message, {
    autoClose: 3000,
    position: toast.POSITION.TOP_RIGHT,
  });
};

export const showErrorMessage = (message: string): void => {
  toast.error(message, {
    autoClose: 3000,
    position: toast.POSITION.TOP_RIGHT,
  });
};