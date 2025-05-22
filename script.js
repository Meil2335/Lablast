let data = {};

function renderHeader() {
  const c = document.getElementById("header-container");
  const [firstName, ...rest] = data.name.split(" ");
  c.innerHTML = `<h2><strong>${firstName}</strong> ${rest.join(" ")}</h2><h4>${data.title}</h4>`;
}

function renderProfile() {
  document.getElementById("profile").innerHTML = `<p>${data.profile}</p>`;
}

function renderContact() {
  const c = document.getElementById("contact-container");
  c.innerHTML = `
    <h3>Contact</h3>
    <p><img src="https://img.icons8.com/ios-filled/50/000000/phone.png" class="icon" /> ${data.contact.phone}</p>
    <p><img src="https://img.icons8.com/ios-filled/50/000000/new-post.png" class="icon" /> ${data.contact.email}</p>
    <p><img src="https://img.icons8.com/ios-filled/50/000000/marker.png" class="icon" /> ${data.contact.location}</p>
  `;
}

function renderSection(id) {
  const container = document.getElementById(id);
  container.innerHTML = "";
  container.style.display = "block";

  data[id].forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "entry";

    const span = document.createElement("span");
    span.textContent = item;

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => {
      const v = prompt("Dəyişmək ucun mətni yazın:", item);
      if (v) {
        data[id][i] = v;
        localStorage.setItem("cvData", JSON.stringify(data));
        renderSection(id);
      }
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => {
      data[id].splice(i, 1);
      localStorage.setItem("cvData", JSON.stringify(data));
      renderSection(id);
    };

    div.append(span, editBtn, deleteBtn);
    container.appendChild(div);
  });
}

function toggleSection(id, btn) {
  const section = document.getElementById(id);
  const isHidden = section.style.display === "none";
  section.style.display = isHidden ? "block" : "none";
  btn.textContent = (isHidden ? "[-] " : "[+] ") + btn.textContent.slice(4);
}

function addEntry(id) {
  const value = prompt("Yeni məlumat daxil et:");
  if (value) {
    data[id].push(value);
    localStorage.setItem("cvData", JSON.stringify(data));
    renderSection(id);
  }
}

async function init() {
  await getData();

  const storedData = localStorage.getItem("cvData");
  if (storedData) {
    data = JSON.parse(storedData);
  }

  renderHeader();
  renderContact();
  renderProfile();
  ["education", "skills", "languages", "experience", "references"].forEach(renderSection);
}

async function getData() {
  const response = await fetch("melumat.json");
  data = await response.json();
}

function resetToDefault() {
  localStorage.clear();
  location.reload();
}

function validateInput() {
  const name = document.getElementById("form-name").value.trim();
  const email = document.getElementById("form-email").value.trim();
  const date = document.getElementById("form-date").value;
  const desc = document.getElementById("form-description").value.trim();

  let valid = true;
  const today = new Date().toISOString().split("T")[0];

  showError("name", name.length < 2 ? "Ad minimum 5 simvol olmalıdır." : "");
  if (name.length < 2) valid = false;

  const emailValid = /^[^\s@]+@gmail\.com$/.test(email);
  showError("email", !emailValid ? "Email '@gmail.com' formatında olmalıdır." : "");
  if (!emailValid) valid = false;

  showError("date", date === "" || date >= today ? "" : "Tarix yalnız bu gün və gələcək ola bilər.");
  if (date && date < today) valid = false;

  showError("description", desc.length < 10 ? "Təsvir minimum 10 simvol olmalıdır." : "");
  if (desc.length < 10) valid = false;

  return valid;
}

["form-name", "form-email", "form-date", "form-description"].forEach(id => {
  document.getElementById(id).addEventListener("input", validateInput);
});

function showError(id, message) {
  const errorEl = document.getElementById("error-" + id);
  errorEl.textContent = message;
}

function toggleForm() {
  const btn = document.getElementById("toggle-button");
  const form = document.getElementById("cvForm");

  Array.from(form.querySelectorAll("input, textarea")).forEach(el => {
    el.disabled = !el.disabled;
  });

  btn.textContent = btn.textContent === "Düzəliş et" ? "Formu söndür" : "Düzəlt";
}

window.addEventListener("DOMContentLoaded", () => {
  init();

  const saved = localStorage.getItem("cvFormData");
  if (saved) {
    const { name, email, date, desc } = JSON.parse(saved).formData[0];
    document.getElementById("form-name").value = name;
    document.getElementById("form-email").value = email;
    document.getElementById("form-date").value = date;
    document.getElementById("form-description").value = desc;
  }

  document.getElementById("cvForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const status = document.getElementById("form-status");
    const isValid = validateInput();

    if (isValid) {
      const formData = {
        name: document.getElementById("form-name").value.trim(),
        email: document.getElementById("form-email").value.trim(),
        date: document.getElementById("form-date").value,
        desc: document.getElementById("form-description").value.trim()
      };

      if (data.formData) {
        data.formData.push(formData);
      } else {
        data.formData = [formData];
      }

      localStorage.setItem("cvFormData", JSON.stringify(data));
      status.textContent = " yadda saxlanıldı!";
      status.style.color = "green";
      document.getElementById("cvForm").reset();
      ["name", "email", "date", "description"].forEach(id => showError(id, ""));
    } else {
      status.textContent = " dost formu düzgün doldur";
      status.style.color = "red";
    }
  });
});
