const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const disableSubmitButton = (button, elements) => {
  const errors = [];
  elements.forEach((element) => {
    errors.push(element[0].id);
    element[0].addEventListener("change", (event) => {
      if (event.target.value.length > 0) {
        const idToRemoveFromError = errors.indexOf(element[0].id);
        errors.splice(idToRemoveFromError, 1);
      }
      if (
        event.target.id === "property-type" &&
        event.target.value !== "condo-apartment"
      ) {
        const condoRulesIndex = errors.indexOf("condo-rules");
        if (condoRulesIndex > -1) {
          errors.splice(condoRulesIndex, 1);
        }
      } else if (event.target.id === "property-type") {
        const condoRulesIndex = errors.indexOf("condo-rules");
        console.log("condoRulesIndex:", condoRulesIndex);
        if (condoRulesIndex === -1) {
          errors.push("condo-rules");
        }
      }

      if (errors.length === 0) {
        button.classList.remove("disabled");
      } else {
        button.classList.add("disabled");
      }
      console.log("errors:", errors);
    });
  });
};

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
  const condoRulesErrorContactUs = document.getElementById(
    "condoRulesErrorContactUs",
  );
  const decisionMakerErrorContactUs = document.getElementById(
    "decisionMakerErrorContactUs",
  );
  const priorityErrorContactUs = document.getElementById(
    "priorityErrorContactUs",
  );
  const messageErrorContactUs = document.getElementById(
    "messageErrorContactUs",
  );
  const submitErrorMessage = document.getElementById("submitErrorMessage");
  const submitSuccessMessageContactUs = document.getElementById(
    "submitSuccessMessage",
  );
  const submitButtonContactUs = document.getElementById(
    "submitButtonContactUs",
  );
  const elements = [
    [nameContactUs, nameErrorContactUs],
    [emailContactUs, missingEmailErrorContactUs, invalidEmailErrorContactUs],
    [phoneContactUs, phoneErrorContactUs],
    [projectType, projectTypeErrorContactUs],
    [propertyType, propertyTypeErrorContactUs],
    [startTimeframe, startTimeframeErrorContactUs],
    [budgetRange, budgetRangeErrorContactUs],
    [projectScope, projectScopeErrorContactUs],
    [decisionMaker, decisionMakerErrorContactUs],
    [condoRules, condoRulesErrorContactUs],
    [priority, priorityErrorContactUs],
    [message, messageErrorContactUs],
  ];

  propertyType.addEventListener("change", (e) => {
    if (e.target.value !== "condo-apartment") {
      condoRules.parentElement.classList.add("d-none");
    } else {
      condoRules.parentElement.classList.remove("d-none");
    }
  });
  disableSubmitButton(submitButtonContactUs, elements);

  submitButtonContactUs.addEventListener("click", async (e) => {
    e.preventDefault();
    submitButtonContactUs.classList.add("disabled");
    let hasErrors = false;
    if (!emailRegex.test(emailContactUs.value)) {
      invalidEmailErrorContactUs.classList.add("d-block");
      hasErrors = true;
    } else {
      invalidEmailErrorContactUs.classList.remove("d-block");
    }
    elements.forEach((element) => {
      if (element[0].value.length === 0) {
        if (
          element[0].id === "condo-rules" &&
          propertyType.value !== "condo-apartment"
        ) {
          // skip showing error
          return;
        }
        element[1].classList.add("d-block");
        hasErrors = true;
      } else {
        element[1].classList.remove("d-block");
      }
    });

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
      // nameContactUs.value = "";
      // emailContactUs.value = "";
      // phoneContactUs.value = "";
      // projectType.value = "";
      // propertyType.value = "";
      // startTimeframe.value = "";
      // budgetRange.value = "";
      // projectScope.value = "";
      // decisionMaker.value = "";
      // condoRules.value = "";
      // priority.value = "";
      // message.value = "";
      elements.forEach((element) => {
        element[0].value = "";
      });
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
