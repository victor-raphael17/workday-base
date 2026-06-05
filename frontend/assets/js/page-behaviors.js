const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const statusTone = {
  in: "status-success",
  low: "status-warning",
  out: "status-danger",
  expiring: "status-warning",
  controlled: "status-controlled",
  draft: "status-neutral",
  submitted: "status-info",
  transit: "status-warning",
  received: "status-success",
};

function swapStatusBadge(element, tone, label) {
  if (!element) {
    return;
  }

  element.className = `status-badge ${statusTone[tone] || "status-neutral"}`;
  element.textContent = label;
}

function bindInventory() {
  const rows = Array.from(document.querySelectorAll("[data-inventory-row]"));
  const search = document.querySelector("[data-inventory-search]");
  const chips = Array.from(document.querySelectorAll("[data-stock-filter]"));
  let activeFilter = "all";
  let selectedRow = rows[0] || null;

  const detailFields = {
    title: document.querySelector("[data-detail='name']"),
    subtitle: document.querySelector("[data-detail='subtitle']"),
    onHand: document.querySelector("[data-detail='onHand']"),
    reorder: document.querySelector("[data-detail='reorder']"),
    expiry: document.querySelector("[data-detail='expiry']"),
    price: document.querySelector("[data-detail='price']"),
    badge: document.querySelector("[data-detail='badge']"),
  };

  const matchesFilter = (row) => {
    const status = row.dataset.status;
    if (activeFilter === "low") {
      return status === "low" || status === "out";
    }
    if (activeFilter === "expiring") {
      return status === "expiring";
    }
    if (activeFilter === "controlled") {
      return row.dataset.controlled === "true";
    }
    return true;
  };

  const matchesSearch = (row) => {
    const term = search?.value.trim().toLowerCase() || "";
    if (!term) {
      return true;
    }

    return [row.dataset.name, row.dataset.sku, row.dataset.category]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(term);
  };

  const selectRow = (row) => {
    if (!row) {
      return;
    }

    selectedRow = row;
    rows.forEach((item) => item.classList.toggle("table-active", item === row));
    detailFields.title.textContent = row.dataset.name;
    detailFields.subtitle.textContent = `${row.dataset.strength} · ${row.dataset.form} · ${row.dataset.category}`;
    detailFields.onHand.textContent = `${row.dataset.onHand} packs`;
    detailFields.reorder.textContent = `${row.dataset.reorder} packs`;
    detailFields.expiry.textContent = row.dataset.expiry;
    detailFields.price.textContent = row.dataset.price;
    swapStatusBadge(detailFields.badge, row.dataset.status, row.dataset.badgeLabel);
  };

  const applyFilters = () => {
    const visibleRows = rows.filter((row) => {
      const visible = matchesFilter(row) && matchesSearch(row);
      row.classList.toggle("d-none", !visible);
      return visible;
    });

    if (!visibleRows.includes(selectedRow)) {
      selectRow(visibleRows[0] || null);
    }
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      activeFilter = chip.dataset.stockFilter;
      chips.forEach((item) => item.classList.toggle("active", item === chip));
      applyFilters();
    });
  });

  search?.addEventListener("input", applyFilters);
  rows.forEach((row) => row.addEventListener("click", () => selectRow(row)));
  selectRow(selectedRow);
  applyFilters();
}

function bindPos() {
  const rows = Array.from(document.querySelectorAll("[data-cart-row]"));
  const subtotalEl = document.querySelector("[data-pos='subtotal']");
  const taxEl = document.querySelector("[data-pos='tax']");
  const totalEl = document.querySelector("[data-pos='total']");
  const controlledEl = document.querySelector("[data-pos='controlled-warning']");

  const updateTotals = () => {
    let subtotal = 0;
    let hasControlled = false;

    rows.forEach((row) => {
      const price = Number(row.dataset.price);
      const qty = Number(row.dataset.qty);
      subtotal += price * qty;
      hasControlled = hasControlled || (row.dataset.controlled === "true" && qty > 0);
      row.querySelector("[data-role='qty']").textContent = qty;
      row.querySelector("[data-role='line-total']").textContent = currency.format(price * qty);
    });

    const tax = subtotal * 0.05;
    subtotalEl.textContent = currency.format(subtotal);
    taxEl.textContent = currency.format(tax);
    totalEl.textContent = currency.format(subtotal + tax);
    controlledEl.classList.toggle("d-none", !hasControlled);
  };

  rows.forEach((row) => {
    row.querySelectorAll("[data-cart-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextQty = Number(row.dataset.qty) + (button.dataset.cartAction === "increase" ? 1 : -1);
        row.dataset.qty = String(Math.max(1, nextQty));
        updateTotals();
      });
    });
  });

  updateTotals();
}

function bindPatients() {
  const rows = Array.from(document.querySelectorAll("[data-patient-row]"));
  const search = document.querySelector("[data-patient-search]");
  let selected = rows[0] || null;

  const fields = {
    name: document.querySelector("[data-patient='name']"),
    summary: document.querySelector("[data-patient='summary']"),
    phone: document.querySelector("[data-patient='phone']"),
    plan: document.querySelector("[data-patient='plan']"),
    active: document.querySelector("[data-patient='active']"),
    allergies: document.querySelector("[data-patient='allergies']"),
    medications: document.querySelector("[data-patient='medications']"),
  };

  const renderChips = (container, items, emptyLabel) => {
    container.innerHTML = "";
    const values = items.filter(Boolean);
    if (!values.length) {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = emptyLabel;
      container.appendChild(chip);
      return;
    }

    values.forEach((item) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = item;
      container.appendChild(chip);
    });
  };

  const selectRow = (row) => {
    if (!row) {
      return;
    }

    selected = row;
    rows.forEach((item) => item.classList.toggle("table-active", item === row));
    fields.name.textContent = row.dataset.name;
    fields.summary.textContent = `${row.dataset.id} · DOB ${row.dataset.dob}`;
    fields.phone.textContent = row.dataset.phone;
    fields.plan.textContent = row.dataset.plan;
    fields.active.textContent = row.dataset.active;
    renderChips(fields.allergies, row.dataset.allergies.split("|"), "None recorded");
    renderChips(fields.medications, row.dataset.meds.split("|"), "No medications");
  };

  const applySearch = () => {
    const term = search?.value.trim().toLowerCase() || "";
    const visibleRows = rows.filter((row) => {
      const text = `${row.dataset.name} ${row.dataset.id} ${row.dataset.plan}`.toLowerCase();
      const visible = !term || text.includes(term);
      row.classList.toggle("d-none", !visible);
      return visible;
    });

    if (!visibleRows.includes(selected)) {
      selectRow(visibleRows[0] || null);
    }
  };

  rows.forEach((row) => row.addEventListener("click", () => selectRow(row)));
  search?.addEventListener("input", applySearch);
  selectRow(selected);
  applySearch();
}

function bindOrders() {
  const rows = Array.from(document.querySelectorAll("[data-order-row]"));
  let selected = rows[0] || null;

  const fields = {
    id: document.querySelector("[data-order='id']"),
    supplier: document.querySelector("[data-order='supplier']"),
    expected: document.querySelector("[data-order='expected']"),
    units: document.querySelector("[data-order='units']"),
    total: document.querySelector("[data-order='total']"),
    badge: document.querySelector("[data-order='badge']"),
    lines: document.querySelector("[data-order='lines']"),
  };

  const selectRow = (row) => {
    if (!row) {
      return;
    }

    selected = row;
    rows.forEach((item) => item.classList.toggle("table-active", item === row));
    fields.id.textContent = row.dataset.id;
    fields.supplier.textContent = row.dataset.supplier;
    fields.expected.textContent = row.dataset.expected;
    fields.units.textContent = row.dataset.units;
    fields.total.textContent = row.dataset.total;
    swapStatusBadge(fields.badge, row.dataset.stateTone, row.dataset.stateLabel);
    fields.lines.innerHTML = row.dataset.lines.split("|").map((line) => `<div class="detail-row"><span class="detail-row-label">${line.split("::")[0]}</span><span class="detail-row-value mono">${line.split("::")[1]}</span></div>`).join("");
  };

  rows.forEach((row) => row.addEventListener("click", () => selectRow(row)));
  selectRow(selected);
}

export function bindPageBehaviors(pageId) {
  if (pageId === "inventory") {
    bindInventory();
  }

  if (pageId === "pos") {
    bindPos();
  }

  if (pageId === "patients") {
    bindPatients();
  }

  if (pageId === "orders") {
    bindOrders();
  }
}