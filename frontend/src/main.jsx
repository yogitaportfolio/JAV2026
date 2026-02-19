import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import * as serviceWorker from "./serviceWorker"
import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux"
import store  from "./store";
import { ToastContainer } from 'react-toastify';

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <Provider store={store}>
    <BrowserRouter>
      <App />
      <ToastContainer 
      position="top-right"
      autoClose={3000}
      newestOnTop={true}
      closeOnClick
      draggable
      pauseOnHover
      />
    </BrowserRouter>
  </Provider>
  </>
);

serviceWorker.unregister()