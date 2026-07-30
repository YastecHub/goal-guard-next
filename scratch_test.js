const payload = {
  firstName: "Test123456",
  email: "yasir@goalguard.io",
  phoneNumber: "+234312364728"
};

fetch("https://goalguard.onrender.com/api/onboarding/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
})
.then(async res => {
  console.log("Status:", res.status);
  try {
    const json = await res.json();
    console.log("Body:", JSON.stringify(json, null, 2));
  } catch (err) {
    console.log("Failed to parse JSON:", await res.text());
  }
})
.catch(err => {
  console.error("Error:", err);
});
