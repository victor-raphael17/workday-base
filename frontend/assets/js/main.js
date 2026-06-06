import { bindPageBehaviors } from "./page-behaviors.js";
import { bindShellEvents, loadNavCounts, renderShell } from "./shell.js";

const pageId = document.body.dataset.page || "dashboard";

renderShell(pageId);
bindShellEvents();
loadNavCounts();
bindPageBehaviors(pageId);

if (window.lucide) {
  window.lucide.createIcons();
}
