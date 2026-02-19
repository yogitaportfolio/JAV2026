import swal from "sweetalert2";

function showNotification(message, type) {
  if (type === "Success") swal.fire(type, message, "success");
  else if(type === "Warning")swal.fire(type, message, "warning");
  else swal.fire(type, message, "error");
}

export function showLogoutAlert() {
  let timerInterval;
  const totalTime = 20 * 60; // 20 minutes in seconds
  let remainingTime = totalTime;
  swal.fire({
    title: "<strong>Idle Warning</strong>",
    html: `<p>You have been idle for 40 minutes and will be redirected to the login page in: <b></b></p>`,
    timer: totalTime * 1000, 
    icon: "warning",
    timerProgressBar: true,
    didOpen: () => {
      swal.showLoading();
      const timer = swal.getPopup().querySelector("b");
      // let remainingSeconds = 5;

      timerInterval = setInterval(() => {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        timer.textContent = `${minutes}m ${seconds}s`;
        remainingTime--;
        if (remainingTime < 0) {
          clearInterval(timerInterval);
        }
      }, 1000); 
    },
    willClose: () => {
      clearInterval(timerInterval);
    }
  }).then((result) => {
    if (result.dismiss === swal.DismissReason.timer) {
      console.log("I was closed by the timer");
    }
  });
}

export default showNotification;
