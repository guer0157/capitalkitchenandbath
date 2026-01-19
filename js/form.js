const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const setUpContactUsForm = () => {
  const nameContactUs = document.getElementById("nameContactUs");
  const emailContactUs = document.getElementById("emailContactUs");
  const phoneContactUs = document.getElementById("phoneContactUs");
  const messageContactUs = document.getElementById("messageContactUs");
  // Errors
  const nameErrorContactUs = document.getElementById("nameErrorContactUs");
  const missingEmailErrorContactUs = document.getElementById(
    "missingEmailErrorContactUs",
  );
  const invalidEmailErrorContactUs = document.getElementById(
    "invalidEmailErrorContactUs",
  );
  const phoneErrorContactUs = document.getElementById("phoneErrorContactUs");
  const messageErrorContactUs = document.getElementById(
    "messageErrorContactUs",
  );
  const submitErrorMessageContactUs = document.getElementById(
    "submitErrorMessageContactUs",
  );
  const submitSuccessMessageContactUs = document.getElementById(
    "submitSuccessMessageContactUs",
  );
  const submitButtonContactUs = document.getElementById(
    "submitButtonContactUs",
  );

  submitButtonContactUs.addEventListener("click", async (e) => {
    e.preventDefault();
    // submitButtonContactUs.classList.add("disabled");
    // let hasErrors = false;
    // if (nameContactUs.value.length === 0) {
    //   nameErrorContactUs.classList.add("d-block");
    //   hasErrors = true;
    // } else {
    //   nameErrorContactUs.classList.remove("d-block");
    // }
    // if (emailContactUs.value.length === 0) {
    //   missingEmailErrorContactUs.classList.add("d-block");
    //   hasErrors = true;
    // } else {
    //   missingEmailErrorContactUs.classList.remove("d-block");
    // }
    // if (!emailRegex.test(emailContactUs.value)) {
    //   invalidEmailErrorContactUs.classList.add("d-block");
    //   hasErrors = true;
    // } else {
    //   invalidEmailErrorContactUs.classList.remove("d-block");
    // }
    // if (phoneContactUs.value.length === 0) {
    //   phoneErrorContactUs.classList.add("d-block");
    //   hasErrors = true;
    // } else {
    //   phoneErrorContactUs.classList.remove("d-block");
    // }
    // if (messageContactUs.value.length === 0) {
    //   messageErrorContactUs.classList.add("d-block");
    //   hasErrors = true;
    // } else {
    //   messageErrorContactUs.classList.remove("d-block");
    // }
    // if (hasErrors) {
    //   submitErrorMessageContactUs.classList.add("d-none");
    //   submitErrorMessageContactUs.classList.add("d-block");
    //   submitSuccessMessageContactUs.classList.remove("d-block");
    //   submitButtonContactUs.classList.remove("disabled");
    //   return;
    // } else {
    //   submitErrorMessageContactUs.classList.remove("d-block");
    //   submitSuccessMessageContactUs.classList.remove("d-none");
    //   submitSuccessMessageContactUs.classList.add("d-block");
    //   await fetch(
    //     "https://askcharly.ca/api/email/capitalkitchenandbath/contact-us",
    //     {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       // body: JSON.stringify({
    //       //   name: nameContactUs.value,
    //       //   email: emailContactUs.value,
    //       //   phone: phoneContactUs.value,
    //       //   message: messageContactUs.value,
    //       // }),
    //       body: JSON.stringify({
    //         name: "The name is here",
    //         email: "The email too is here",
    //         phone: "1111111111",
    //         message: "My message is here",
    //       }),
    //     },
    //   );
    //   // clear form
    //   nameContactUs.value = "";
    //   emailContactUs.value = "";
    //   phoneContactUs.value = "";
    //   messageContactUs.value = "";
    //   submitButtonContactUs.classList.remove("disabled");
    // }
    await fetch(
      "https://askcharly.ca/api/email/capitalkitchenandbath/contact-us",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // body: JSON.stringify({
        //   name: nameContactUs.value,
        //   email: emailContactUs.value,
        //   phone: phoneContactUs.value,
        //   message: messageContactUs.value,
        // }),
        body: JSON.stringify({
          name: "The name is here",
          email: "The email too is here",
          phone: "1111111111",
          message: "My message is here",
        }),
      },
    );
  });
};
const handleFormEvents = () => {
  try {
    setUpContactUsForm();
  } catch (err) {
    console.error("Error setting up contact us form:", err);
  }
};
