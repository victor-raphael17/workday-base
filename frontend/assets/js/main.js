import { bindPageBehaviors } from "./page-behaviors.js";
import { bindShellEvents, renderShell } from "./shell.js";

const pageId = document.body.dataset.page || "dashboard";

renderShell(pageId);
bindShellEvents();
bindPageBehaviors(pageId);

if (window.lucide) {
  window.lucide.createIcons();
}