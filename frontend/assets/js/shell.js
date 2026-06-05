import { branch, inventoryItems, navigation, prescriptionQueue } from "./data.js";

function navCounts(id) {
  if (id === "inventory") {
    return inventoryItems.filter((item) => ["low", "out"].includes(item.status)).length;
  }
  if (id === "prescriptions") {
    return prescriptionQueue.filter((item) => item.state !== "dispensed").length;
  }
  return 0;
}

export function renderShell(pageId) {
  const sidebar = document.getElementById("appSidebar");
  const topbar = document.getElementById("appTopbar");

  if (!sidebar || !topbar) {
    return;
  }

  sidebar.innerHTML = `
    <div class="sidebar-brand">
      <img src="../assets/images/logo-mark.svg" alt="CA Pharmacy">
      <div class="sidebar-brand-title">CA <span>Pharmacy</span></div>
    </div>
    <nav class="sidebar-nav" aria-label="Primary navigation">
      ${navigation.map((item) => {
        const count = navCounts(item.id);
        return `
          <a class="sidebar-link ${pageId === item.id ? "active" : ""}" href="${item.href}">
            <i data-lucide="${item.icon}"></i>
            <span>${item.label}</span>
            ${count ? `<span class="sidebar-link-count">${count}</span>` : ""}
          </a>
        `;
      }).join("")}
    </nav>
    <div class="sidebar-section-label">Current shift</div>
    <div class="sidebar-shift-card d-flex align-items-center gap-3">
      <span class="shift-avatar">JO</span>
      <div>
        <div class="sidebar-shift-name">${branch.shiftLead}</div>
        <div class="sidebar-shift-role">${branch.role} · ${branch.name}</div>
      </div>
    </div>
  `;

  topbar.innerHTML = `
    <button class="topbar-menu" id="mobileNavToggle" type="button" aria-label="Open navigation">
      <i data-lucide="menu"></i>
    </button>
    <label class="topbar-search mb-0">
      <i data-lucide="search"></i>
      <input type="search" placeholder="Search medications, patients, scripts..." aria-label="Search">
      <kbd>/</kbd>
    </label>
    <div class="topbar-actions">
      <div class="topbar-branch">
        <i data-lucide="store"></i>
        <span>${branch.name}</span>
      </div>
      <button class="topbar-icon" type="button" aria-label="Notifications">
        <i data-lucide="bell"></i>
      </button>
      <button class="topbar-icon" type="button" aria-label="Help">
        <i data-lucide="help-circle"></i>
      </button>
    </div>
  `;
}

export function bindShellEvents() {
  const toggle = document.getElementById("mobileNavToggle");
  const scrim = document.getElementById("appScrim");
  const links = document.querySelectorAll(".sidebar-link");

  const closeNav = () => document.body.classList.remove("nav-open");

  toggle?.addEventListener("click", () => {
    document.body.classList.toggle("nav-open");
  });

  scrim?.addEventListener("click", closeNav);
  links.forEach((link) => link.addEventListener("click", closeNav));
}