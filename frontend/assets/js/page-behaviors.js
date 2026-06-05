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

function bindRowSelection(rows, onSelect) {
  rows.forEach((row) => {
    row.setAttribute("role", "button");
    row.setAttribute("tabindex", "0");
    row.addEventListener("click", () => onSelect(row));
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect(row);
      }
    });
  });
}

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

  const rowMatchesFilter = (row, filter) => {
    const status = row.dataset.status;
    if (filter === "low") {
      return status === "low" || status === "out";
    }
    if (filter === "expiring") {
      return status === "expiring";
    }
    if (filter === "controlled") {
      return row.dataset.controlled === "true";
    }
    return true;
  };

  const matchesFilter = (row) => rowMatchesFilter(row, activeFilter);

  const updateChipCounts = () => {
    chips.forEach((chip) => {
      const countEl = chip.querySelector(".mono");
      if (countEl) {
        countEl.textContent = rows.filter((row) => rowMatchesFilter(row, chip.dataset.stockFilter)).length;
      }
    });
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
  bindRowSelection(rows, selectRow);
  updateChipCounts();
  selectRow(selectedRow);
  applyFilters();
}

function bindPos() {
  const list = document.querySelector("[data-cart-list]");
  const products = Array.from(document.querySelectorAll("[data-product]"));
  const clearButton = document.querySelector("[data-cart-clear]");
  const scanInput = document.querySelector("[data-scan-input]");
  const subtotalEl = document.querySelector("[data-pos='subtotal']");
  const taxEl = document.querySelector("[data-pos='tax']");
  const totalEl = document.querySelector("[data-pos='total']");
  const controlledEl = document.querySelector("[data-pos='controlled-warning']");

  if (!list) {
    return;
  }

  const cart = [
    { name: "Amoxicillin 500 mg", price: 12.4, controlled: false, qty: 2 },
    { name: "Oxycodone 5 mg", price: 28.9, controlled: true, qty: 1 },
    { name: "Paracetamol 500 mg", price: 3.8, controlled: false, qty: 2 },
  ];

  const changeQty = (index, delta) => {
    const item = cart[index];
    item.qty += delta;
    if (item.qty <= 0) {
      cart.splice(index, 1);
    }
    render();
  };

  const buildRow = (item, index) => {
    const row = document.createElement("div");
    row.className = "cart-row";

    const info = document.createElement("div");
    info.className = "flex-grow-1";
    const title = document.createElement("div");
    title.className = "cart-item-title";
    title.textContent = item.name;
    const meta = document.createElement("div");
    meta.className = "cart-item-meta mono";
    meta.textContent = `${currency.format(item.price)} each`;
    info.append(title, meta);

    const stepper = document.createElement("div");
    stepper.className = "stepper";
    const decrease = document.createElement("button");
    decrease.type = "button";
    decrease.textContent = "-";
    decrease.setAttribute("aria-label", `Decrease ${item.name} quantity`);
    decrease.addEventListener("click", () => changeQty(index, -1));
    const qty = document.createElement("span");
    qty.className = "stepper-value";
    qty.textContent = item.qty;
    const increase = document.createElement("button");
    increase.type = "button";
    increase.textContent = "+";
    increase.setAttribute("aria-label", `Increase ${item.name} quantity`);
    increase.addEventListener("click", () => changeQty(index, 1));
    stepper.append(decrease, qty, increase);

    const lineTotal = document.createElement("div");
    lineTotal.className = "mono fw-semibold";
    lineTotal.textContent = currency.format(item.price * item.qty);

    row.append(info, stepper, lineTotal);
    return row;
  };

  const updateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const tax = subtotal * 0.05;
    const hasControlled = cart.some((item) => item.controlled && item.qty > 0);
    subtotalEl.textContent = currency.format(subtotal);
    taxEl.textContent = currency.format(tax);
    totalEl.textContent = currency.format(subtotal + tax);
    controlledEl.classList.toggle("d-none", !hasControlled);
  };

  const render = () => {
    list.innerHTML = "";
    if (!cart.length) {
      const empty = document.createElement("div");
      empty.className = "muted-note m-4";
      empty.textContent = "Cart is empty. Add a product to start a sale.";
      list.appendChild(empty);
    } else {
      cart.forEach((item, index) => list.appendChild(buildRow(item, index)));
    }
    updateTotals();
  };

  const addToCart = (name, price, controlled) => {
    const existing = cart.find((item) => item.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name, price, controlled, qty: 1 });
    }
    render();
  };

  products.forEach((card) => {
    const activate = () => addToCart(card.dataset.name, Number(card.dataset.price), card.dataset.controlled === "true");
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.addEventListener("click", activate);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  });

  clearButton?.addEventListener("click", () => {
    cart.length = 0;
    render();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "F2") {
      event.preventDefault();
      scanInput?.focus();
    }
  });

  render();
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

  bindRowSelection(rows, selectRow);
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

    fields.lines.innerHTML = "";
    row.dataset.lines.split("|").forEach((line) => {
      const [label, value] = line.split("::");
      const wrap = document.createElement("div");
      wrap.className = "detail-row";
      const labelEl = document.createElement("span");
      labelEl.className = "detail-row-label";
      labelEl.textContent = label;
      const valueEl = document.createElement("span");
      valueEl.className = "detail-row-value mono";
      valueEl.textContent = value;
      wrap.append(labelEl, valueEl);
      fields.lines.appendChild(wrap);
    });
  };

  bindRowSelection(rows, selectRow);
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