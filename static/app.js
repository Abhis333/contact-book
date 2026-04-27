const api = {
  async listContacts(search = "") {
    const url = search ? `/api/contacts?search=${encodeURIComponent(search)}` : "/api/contacts";
    const response = await fetch(url);
    return response.json();
  },
  async createContact(contact) {
    const response = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contact),
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  },
  async updateContact(id, patch) {
    const response = await fetch(`/api/contacts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  },
  async deleteContact(id) {
    const response = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  },
};

const els = {
  form: document.getElementById("contactForm"),
  formTitle: document.getElementById("formTitle"),
  formHint: document.getElementById("formHint"),
  statusText: document.getElementById("statusText"),
  cancelEditBtn: document.getElementById("cancelEditBtn"),
  refreshBtn: document.getElementById("refreshBtn"),

  searchInput: document.getElementById("searchInput"),
  clearSearchBtn: document.getElementById("clearSearchBtn"),

  contactId: document.getElementById("contactId"),
  name: document.getElementById("name"),
  phone: document.getElementById("phone"),
  email: document.getElementById("email"),
  address: document.getElementById("address"),
  notes: document.getElementById("notes"),

  errors: {
    name: document.getElementById("nameError"),
    phone: document.getElementById("phoneError"),
    email: document.getElementById("emailError"),
    address: document.getElementById("addressError"),
    notes: document.getElementById("notesError"),
  },

  tbody: document.getElementById("contactsTbody"),
};

function setStatus(message) {
  els.statusText.textContent = message || "";
}

function clearErrors() {
  Object.values(els.errors).forEach((el) => (el.textContent = ""));
}

function showFieldErrors(fields = {}) {
  for (const [key, message] of Object.entries(fields)) {
    if (els.errors[key]) els.errors[key].textContent = message;
  }
}

function getFormData() {
  return {
    name: els.name.value.trim(),
    phone: els.phone.value.trim(),
    email: els.email.value.trim(),
    address: els.address.value.trim(),
    notes: els.notes.value.trim(),
  };
}

function resetForm() {
  els.contactId.value = "";
  els.formTitle.textContent = "Add Contact";
  els.formHint.textContent = 'Fill details and click "Save".';
  els.cancelEditBtn.hidden = true;
  els.form.reset();
  clearErrors();
}

function startEdit(contact) {
  els.contactId.value = contact.id;
  els.name.value = contact.name || "";
  els.phone.value = contact.phone || "";
  els.email.value = contact.email || "";
  els.address.value = contact.address || "";
  els.notes.value = contact.notes || "";

  els.formTitle.textContent = "Edit Contact";
  els.formHint.textContent = 'Update details and click "Save".';
  els.cancelEditBtn.hidden = false;
  clearErrors();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function createRow(contact) {
  const tr = document.createElement("tr");

  const nameTd = document.createElement("td");
  nameTd.innerHTML = `<strong>${escapeHtml(contact.name || "")}</strong>`;

  const phoneTd = document.createElement("td");
  phoneTd.textContent = contact.phone || "-";

  const emailTd = document.createElement("td");
  emailTd.textContent = contact.email || "-";

  const addressTd = document.createElement("td");
  addressTd.className = "hide-sm";
  addressTd.textContent = contact.address || "-";

  const actionsTd = document.createElement("td");
  const wrap = document.createElement("div");
  wrap.className = "rowActions";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "btn btn--ghost";
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", () => startEdit(contact));

  const delBtn = document.createElement("button");
  delBtn.type = "button";
  delBtn.className = "btn btn--danger";
  delBtn.textContent = "Delete";
  delBtn.addEventListener("click", async () => {
    const ok = confirm(`Delete "${contact.name}"?`);
    if (!ok) return;
    setStatus("Deleting...");
    const result = await api.deleteContact(contact.id);
    if (!result.ok) {
      setStatus(result.data?.error || "Delete failed.");
      return;
    }
    setStatus("Deleted.");
    await loadContacts();
    setTimeout(() => setStatus(""), 1200);
  });

  wrap.append(editBtn, delBtn);
  actionsTd.appendChild(wrap);

  tr.append(nameTd, phoneTd, emailTd, addressTd, actionsTd);
  return tr;
}

function renderTable(items) {
  els.tbody.innerHTML = "";

  if (!items || items.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="5" class="empty">No contacts yet. Add your first one!</td>`;
    els.tbody.appendChild(tr);
    return;
  }

  for (const item of items) {
    els.tbody.appendChild(createRow(item));
  }
}

async function loadContacts() {
  const search = els.searchInput.value.trim();
  setStatus("Loading...");
  const data = await api.listContacts(search);
  renderTable(data.items);
  setStatus("");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

els.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();

  const id = els.contactId.value.trim();
  const payload = getFormData();

  setStatus(id ? "Updating..." : "Saving...");

  const result = id ? await api.updateContact(id, payload) : await api.createContact(payload);

  if (!result.ok) {
    setStatus(result.data?.error || "Request failed.");
    if (result.data?.fields) showFieldErrors(result.data.fields);
    return;
  }

  setStatus(id ? "Updated." : "Saved.");
  resetForm();
  await loadContacts();
  setTimeout(() => setStatus(""), 1200);
});

els.cancelEditBtn.addEventListener("click", () => {
  resetForm();
  setStatus("Edit cancelled.");
  setTimeout(() => setStatus(""), 1200);
});

let searchTimer = null;
els.searchInput.addEventListener("input", () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(loadContacts, 250);
});

els.clearSearchBtn.addEventListener("click", async () => {
  els.searchInput.value = "";
  await loadContacts();
  els.searchInput.focus();
});

els.refreshBtn.addEventListener("click", loadContacts);

loadContacts();
