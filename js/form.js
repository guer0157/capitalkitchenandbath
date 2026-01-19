const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const setUpContactUsForm = () => {
  const nameContactUs = document.getElementById("name");
  const emailContactUs = document.getElementById("email");
  const phoneContactUs = document.getElementById("phone");
  const projectType = document.getElementById("project-type");
  const propertyType = document.getElementById("property-type");
  const startTimeframe = document.getElementById("start-timeframe");
  const budgetRange = document.getElementById("budget-range");
  const projectScope = document.getElementById("project-scope");
  const decisionMaker = document.getElementById("decision-maker");
  const condoRules = document.getElementById("condo-rules");
  const priority = document.getElementById("priority");
  const message = document.getElementById("message");

  // Errors
  const nameErrorContactUs = document.getElementById("nameErrorContactUs");
  const missingEmailErrorContactUs = document.getElementById(
    "missingEmailErrorContactUs",
  );
  const invalidEmailErrorContactUs = document.getElementById(
    "invalidEmailErrorContactUs",
  );
  const phoneErrorContactUs = document.getElementById("phoneErrorContactUs");
  const projectTypeErrorContactUs = document.getElementById(
    "projectTypeErrorContactUs",
  );
  const startTimeframeErrorContactUs = document.getElementById(
    "startTimeframeErrorContactUs",
  );
  const propertyTypeErrorContactUs = document.getElementById(
    "propertyTypeErrorContactUs",
  );
  const budgetRangeErrorContactUs = document.getElementById(
    "budgetRangeErrorContactUs",
  );

  const projectScopeErrorContactUs = document.getElementById(
    "projectScopeErrorContactUs",
  );
  const decisionMakerErrorContactUs = document.getElementById(
    "decisionMakerErrorContactUs",
  );
  const condoRulesErrorContactUs = document.getElementById(
    "condoRulesErrorContactUs",
  );
  const priorityErrorContactUs = document.getElementById(
    "priorityErrorContactUs",
  );
  const messageErrorContactUs = document.getElementById(
    "messageErrorContactUs",
  );
  const submitErrorMessage = document.getElementById("submitErrorMessage");
  const submitSuccessMessageContactUs = document.getElementById(
    "submitSuccessMessageContactUs",
  );
  const submitButtonContactUs = document.getElementById(
    "submitButtonContactUs",
  );

  propertyType.addEventListener("change", (e) => {
    if (e.target.value !== "condo-apartment") {
      condoRules.parentElement.classList.add("d-none");
    } else {
      condoRules.parentElement.classList.remove("d-none");
    }
  });

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
    if (projectType.value.length === 0) {
      projectTypeErrorContactUs.classList.add("d-block");
      hasErrors = true;
    } else {
      projectTypeErrorContactUs.classList.remove("d-block");
    }
    if (propertyType.value.length === 0) {
      propertyTypeErrorContactUs.classList.add("d-block");
      hasErrors = true;
    } else {
      propertyTypeErrorContactUs.classList.remove("d-block");
    }
    if (startTimeframe.value.length === 0) {
      startTimeframeErrorContactUs.classList.add("d-block");
      hasErrors = true;
    } else {
      startTimeframeErrorContactUs.classList.remove("d-block");
    }
    if (budgetRange.value.length === 0) {
      budgetRangeErrorContactUs.classList.add("d-block");
      hasErrors = true;
    } else {
      budgetRangeErrorContactUs.classList.remove("d-block");
    }
    if (projectScope.value.length === 0) {
      projectScopeErrorContactUs.classList.add("d-block");
      hasErrors = true;
    } else {
      projectScopeErrorContactUs.classList.remove("d-block");
    }
    if (decisionMaker.value.length === 0) {
      decisionMakerErrorContactUs.classList.add("d-block");
      hasErrors = true;
    } else {
      decisionMakerErrorContactUs.classList.remove("d-block");
    }
    if (condoRules.value.length === 0) {
      condoRulesErrorContactUs.classList.add("d-block");
      hasErrors = true;
    } else {
      condoRulesErrorContactUs.classList.remove("d-block");
    }
    if (priority.value.length === 0) {
      priorityErrorContactUs.classList.add("d-block");
      hasErrors = true;
    } else {
      priorityErrorContactUs.classList.remove("d-block");
    }
    if (message.value.length === 0) {
      messageErrorContactUs.classList.add("d-block");
      hasErrors = true;
    } else {
      messageErrorContactUs.classList.remove("d-block");
    }
    if (hasErrors) {
      submitErrorMessage.classList.add("d-none");
      submitErrorMessage.classList.add("d-block");
      submitSuccessMessageContactUs.classList.remove("d-block");
      submitButtonContactUs.classList.remove("disabled");
      return;
    } else {
      submitErrorMessage.classList.remove("d-block");
      submitSuccessMessageContactUs.classList.remove("d-none");
      submitSuccessMessageContactUs.classList.add("d-block");
      await fetch(
        "https://askcharly.ca/api/email/capitalkitchenandbath/contact-us",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: nameContactUs.value,
            email: emailContactUs.value,
            phone: phoneContactUs.value,
            projectType: projectType.value,
            propertyType: propertyType.value,
            startTimeframe: startTimeframe.value,
            budgetRange: budgetRange.value,
            projectScope: projectScope.value,
            decisionMaker: decisionMaker.value,
            condoRules: condoRules.value,
            priority: priority.value,
            message: message.value,
          }),
        },
      );
      // clear form
      nameContactUs.value = "";
      emailContactUs.value = "";
      phoneContactUs.value = "";
      projectType.value = "";
      propertyType.value = "";
      startTimeframe.value = "";
      budgetRange.value = "";
      projectScope.value = "";
      decisionMaker.value = "";
      condoRules.value = "";
      priority.value = "";
      message.value = "";
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
