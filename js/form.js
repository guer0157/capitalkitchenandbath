const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const setUpMailingListForm = () => {
  const nameMailingList = document.getElementById("nameMailingList");
  const emailMailingList = document.getElementById("emailMailingList");
  const submitButtonMailingList = document.getElementById(
    "submitButtonMailingList"
  );
  // errors
  const nameErrorMailingList = document.getElementById("nameErrorMailingList");
  const emailErrorMailingList = document.getElementById(
    "emailErrorMailingList"
  );
  const invalidEmailErrorMailingList = document.getElementById(
    "invalidEmailErrorMailingList"
  );
  const submitErrorMessageMailingList = document.getElementById(
    "submitErrorMessageMailingList"
  );
  const submitSuccessMessageMailingList = document.getElementById(
    "submitSuccessMessageMailingList"
  );
  submitButtonMailingList.addEventListener("click", async (e) => {
    let hasErrors = false;
    e.preventDefault();
    submitButtonMailingList.classList.add("disabled");
    if (nameMailingList.value.length === 0) {
      nameErrorMailingList.classList.add("d-block");
      hasErrors = true;
    } else {
      nameErrorMailingList.classList.remove("d-block");
    }
    if (emailMailingList.value.length === 0) {
      emailErrorMailingList.classList.add("d-block");
      hasErrors = true;
    } else {
      emailErrorMailingList.classList.remove("d-block");
    }
    if (!emailRegex.test(emailMailingList.value)) {
      invalidEmailErrorMailingList.classList.add("d-block");
      hasErrors = true;
    } else {
      invalidEmailErrorMailingList.classList.remove("d-block");
    }

    if (hasErrors) {
      submitErrorMessageMailingList.classList.remove("d-none");
      submitErrorMessageMailingList.classList.add("d-block");
      return;
    } else {
      submitErrorMessageMailingList.classList.remove("d-block");
      submitErrorMessageMailingList.classList.add("d-none");
      submitSuccessMessageMailingList.classList.remove("d-none");
      submitSuccessMessageMailingList.classList.add("d-block");
      await fetch("https://askcharly.ca/api/email/geckodes/mailing-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameMailingList.value,
          email: emailMailingList.value,
        }),
      });
      // clear form
      nameMailingList.value = "";
      emailMailingList.value = "";
      submitButtonMailingList.classList.remove("disabled");
    }
  });
};
const setUpContactUsForm = () => {
  const nameContactUs = document.getElementById("nameContactUs");
  const emailContactUs = document.getElementById("emailContactUs");
  const phoneContactUs = document.getElementById("phoneContactUs");
  const messageContactUs = document.getElementById("messageContactUs");
  // Errors
  const nameErrorContactUs = document.getElementById("nameErrorContactUs");
  const missingEmailErrorContactUs = document.getElementById(
    "missingEmailErrorContactUs"
  );
  const invalidEmailErrorContactUs = document.getElementById(
    "invalidEmailErrorContactUs"
  );
  const phoneErrorContactUs = document.getElementById("phoneErrorContactUs");
  const messageErrorContactUs = document.getElementById(
    "messageErrorContactUs"
  );
  const submitErrorMessageContactUs = document.getElementById(
    "submitErrorMessageContactUs"
  );
  const submitSuccessMessageContactUs = document.getElementById(
    "submitSuccessMessageContactUs"
  );
  const submitButtonContactUs = document.getElementById(
    "submitButtonContactUs"
  );

  submitButtonContactUs.addEventListener("click", async (e) => {
    e.preventDefault();
    submitButtonContactUs.classList.add("disabled");
    let hasErrors = false;
    if (nameContactUs.value.length === 0) {
      nameErrorContactUs.classList.add("d-block");
      hasErrors = true;
    } else {
      nameErrorContactUs.classList.remove("d-block");
    }
    if (emailContactUs.value.length === 0) {
      missingEmailErrorContactUs.classList.add("d-block");
      hasErrors = true;
    } else {
      missingEmailErrorContactUs.classList.remove("d-block");
    }
    if (!emailRegex.test(emailContactUs.value)) {
      invalidEmailErrorContactUs.classList.add("d-block");
      hasErrors = true;
    } else {
      invalidEmailErrorContactUs.classList.remove("d-block");
    }
    if (phoneContactUs.value.length === 0) {
      phoneErrorContactUs.classList.add("d-block");
      hasErrors = true;
    } else {
      phoneErrorContactUs.classList.remove("d-block");
    }
    if (messageContactUs.value.length === 0) {
      messageErrorContactUs.classList.add("d-block");
      hasErrors = true;
    } else {
      messageErrorContactUs.classList.remove("d-block");
    }
    if (hasErrors) {
      submitErrorMessageContactUs.classList.add("d-none");
      submitErrorMessageContactUs.classList.add("d-block");
      submitSuccessMessageContactUs.classList.remove("d-block");
      submitButtonContactUs.classList.remove("disabled");
      return;
    } else {
      submitErrorMessageContactUs.classList.remove("d-block");
      submitSuccessMessageContactUs.classList.remove("d-none");
      submitSuccessMessageContactUs.classList.add("d-block");
      await fetch("https://askcharly.ca/api/email/geckodes/contact-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameContactUs.value,
          email: emailContactUs.value,
          phone: phoneContactUs.value,
          message: messageContactUs.value,
        }),
      });
      // clear form
      nameContactUs.value = "";
      emailContactUs.value = "";
      phoneContactUs.value = "";
      messageContactUs.value = "";
      submitButtonContactUs.classList.remove("disabled");
    }
  });
};
const handleFormEvents = () => {
  try {
    setUpContactUsForm();
  } catch (err) {
    console.error("Error setting up contact us form:", err);
  }
};
