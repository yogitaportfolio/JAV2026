import axios from "axios";
import showToast from "./show_toast";

const getToken = () => localStorage.getItem("token");

// Error Handling
const handleError = (err) => {
  let message;
  if (err.response && err.response.status) {
    switch (err.response.status) {
      case 400:
        showToast(err.response.data.message, "error");
        break;
      case 404:
        message = "Sorry! the page you are looking for could not be found";
        break;
      case 500:
        message = "Sorry! something went wrong, please contact our support team";
        break;
      case 401:
        message = "Invalid credentials";
        break;
      default:
        message = err[1];
        break;
    }
  }
  throw message;
};

//POST  Submit Form
const postSubmitForm = (url, data) => {
  const config = {
    headers: { Authorization: getToken() },
  };
  return axios
    .post(url, data, config)
    .then((response) => {
      if (response.status >= 200 || response.status <= 299)
        return response.data;
      throw response.data;
    })
    .catch(handleError);
};
export { postSubmitForm };

//PATCH Method
const patchSubmitForm = (url, data) => {
  const config = {
    headers: { Authorization: getToken() },
  };
  return axios.patch(url, data, config)
    .then(response => {
      if (response.status >= 200 && response.status <= 299) {
        return response.data;
      }
      throw response.data;
    })
    .catch(handleError);
};

export { patchSubmitForm }

//PUT Method
const putSubmitForm = (url, data) => {
  const token = getToken();
  const config = {
    headers: { Authorization: token },
  };
  return axios.put(url, data, config)
    .then(response => {
      if (response.status >= 200 && response.status <= 299) {
        return response.data;
      }
      throw response.data;
    })
    .catch(handleError);
};

export { putSubmitForm }

//GET Method
const getSubmitForm = (url,data) => {
  const token = getToken();
  const config = {
    headers: { Authorization: token },
  };

  return axios.get(url, config)
  
    .then(response => {
      if (response.status >= 200 && response.status <= 299) {
        return response.data;
      }
      throw response.data;
    })
    .catch(handleError);
};
export { getSubmitForm }

//DELETE Method
const deleteSubmitForm = (url, data) => {
  const token = getToken();
  const config = {
    headers: { Authorization: token },
    data : data
  };
  return axios.delete(url,config)
    .then(response => {
      if (response.status >= 200 && response.status <= 299) {
        return response.data;
      }
      throw response.data;
    })
    .catch(handleError);
};

export { deleteSubmitForm }

// Submit Form Without Auth
const postSubmitFormNoAuth = (url, data) => {
  return axios
    .post(url, data)
    .then((response) => {
      if (response.status >= 200 || response.status <= 299)
        return response.data;
      throw response.data;
    })
    .catch((err) => {
      var message;
      if (err.response && err.response.status) {
        switch (err.response.status) {
          case 404:
            message = "Sorry! the page you are looking for could not be found";
            break;
          case 500:
            message =
              "Sorry! something went wrong, please contact our support team";
            break;
          case 401:
            message = "Invalid credentials";
            break;
          default:
            message = err[1];
            break;
        }
      }
      throw message;
    });
};
export { postSubmitFormNoAuth };

// Submit Form with form-data
const postSubmitForm_withformdata = (url, data) => {
  const token = localStorage.getItem("token");
  const config = {
    headers: { Authorization: token },
  };
  return axios
    .post(url, data, config)
    .then((response) => {
      if (response.status >= 200 || response.status <= 299)
        return response.data;
      throw response.data;
    })
    .catch((err) => {
      var message;
      if (err.response && err.response.status) {
        switch (err.response.status) {
          case 404:
            message = "Sorry! the page you are looking for could not be found";
            break;
          case 500:
            message =
              "Sorry! something went wrong, please contact our support team";
            break;
          case 401:
            message = "Invalid credentials";
            break;
          default:
            message = err[1];
            break;
        }
      }
      throw message;
    });
};

export { postSubmitForm_withformdata };
