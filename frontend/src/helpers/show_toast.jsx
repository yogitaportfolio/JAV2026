import { toast } from 'react-toastify';

const showToast = (message, type = 'info') => {
  // console.log(message);
  
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'warning':
      toast.warn(message);
      break;
    case 'info':
    default:
      toast.info(message);
      break;
  }
};

export default showToast;
