// student-details.js
document.addEventListener("DOMContentLoaded", () => {

  // Elements
  const form = document.getElementById("studentForm");
  const statusInput = document.getElementById("option");
  const infoInput = document.getElementById("info");
  const countrySelect = document.getElementById("country");
  const otherCountryDiv = document.getElementById("otherCountryDiv");
  const otherCountryInput = document.getElementById("otherCountry");

  // Show/hide "Other Country" input
  function handleCountryChange() {
    if (countrySelect.value === "Other") {
      otherCountryDiv.style.display = "block";
      otherCountryInput.required = true;
    } else {
      otherCountryDiv.style.display = "none";
      otherCountryInput.required = false;
    }
  }

  countrySelect.addEventListener("change", handleCountryChange);

  // Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const status = statusInput.value.trim();
    const info = infoInput.value.trim();
    const country = countrySelect.value;
    const otherCountry = otherCountryInput.value.trim();
    const finalCountry = country === "Other" ? otherCountry : country;

    // Simple validation
    if (!status || !info || !finalCountry) {
      alert("Please fill all required fields.");
      return;
    }

    // Payload to send to backend
    const payload = {
      currentStatus: status,
      organization: info,
      country: finalCountry
    };

    try {
      const token = localStorage.getItem("token"); // if using auth
      const res = await fetch("/student-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": "Bearer " + token })
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        alert("Details submitted successfully!");
        form.reset();
        handleCountryChange(); // reset country input visibility
      } else {
        alert(data.message || "Submission failed. Please try again.");
      }

    } catch (err) {
      console.error(err);
      alert("Server error. Please try again later.");
    }
  });
});