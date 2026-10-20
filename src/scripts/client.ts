import { copy, type CopyKey, type Locale } from "../lib/i18n";
import { runCommand, periodSummary } from "../lib/terminal.mjs";

let locale: Locale = "en";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let motionPaused = reducedMotion.matches;
const motionButton = document.querySelector<HTMLButtonElement>(
  "[data-motion-toggle]",
);
function updateMotion() {
  document.documentElement.dataset.motion = motionPaused ? "paused" : "running";
  if (motionButton) {
    motionButton.disabled = reducedMotion.matches;
    motionButton.setAttribute("aria-pressed", String(motionPaused));
    motionButton.textContent =
      copy[locale][
        reducedMotion.matches
          ? "reducedMotion"
          : motionPaused
            ? "resumeMotion"
            : "pauseMotion"
      ];
  }
}
motionButton?.addEventListener("click", () => {
  motionPaused = !motionPaused;
  updateMotion();
});
reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) motionPaused = true;
  updateMotion();
});
const output = document.querySelector<HTMLElement>("#terminal-output");
const input = document.querySelector<HTMLInputElement>("#terminal-input");
let executed = ["help"];
const history: string[] = [];
let historyIndex = 0;

function renderTerminal() {
  if (!output) return;
  output.replaceChildren();
  for (const command of executed) {
    const prompt = document.createElement("div");
    prompt.className = "terminal-command";
    const symbol = document.createElement("span");
    symbol.textContent = "$";
    prompt.append(symbol, document.createTextNode(" " + command));
    output.append(prompt);
    for (const line of runCommand(command, locale).lines) {
      const row = document.createElement("div");
      row.className = "terminal-line";
      if (line.href) {
        const link = document.createElement("a");
        link.href = line.href;
        link.textContent = line.text;
        if (line.href.startsWith("https:")) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }
        row.append(link);
      } else row.textContent = line.text;
      output.append(row);
    }
  }
  const screen = output.closest<HTMLElement>(".terminal-screen");
  if (screen) screen.scrollTop = screen.scrollHeight;
}

function execute(command: string, focus = false) {
  const text = command.trim().slice(0, 160);
  if (!text) return;
  if (runCommand(text, locale).action === "clear") executed = [];
  else executed = [...executed, text].slice(-20);
  history.push(text);
  if (history.length > 50) history.shift();
  historyIndex = history.length;
  if (input) input.value = "";
  renderTerminal();
  if (focus && input) {
    input
      .closest(".terminal")
      ?.scrollIntoView({
        behavior: reducedMotion.matches ? "auto" : "smooth",
        block: "center",
      });
    input.focus({ preventScroll: true });
  }
}

document
  .querySelector<HTMLFormElement>("#terminal-form")
  ?.addEventListener("submit", (event) => {
    event.preventDefault();
    execute(input?.value || "");
  });
input?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
    event.preventDefault();
    historyIndex = Math.max(
      0,
      Math.min(
        history.length,
        historyIndex + (event.key === "ArrowUp" ? -1 : 1),
      ),
    );
    input.value = history[historyIndex] || "";
  }
});
document.querySelector("#terminal-clear")?.addEventListener("click", () => {
  executed = [];
  renderTerminal();
  input?.focus();
});
document
  .querySelectorAll<HTMLButtonElement>("[data-command]")
  .forEach((button) =>
    button.addEventListener("click", () =>
      execute(button.dataset.command || "", !button.closest(".terminal")),
    ),
  );
document
  .querySelector("[data-open-terminal]")
  ?.addEventListener("click", () => input?.focus({ preventScroll: true }));

function setLocale(next: Locale) {
  locale = next;
  document.documentElement.lang = next;
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n as CopyKey;
    if (key in copy[next]) element.textContent = copy[next][key];
  });
  document
    .querySelectorAll<HTMLElement>("[data-i18n-aria]")
    .forEach((element) => {
      const key = element.dataset.i18nAria as CopyKey;
      if (key in copy[next])
        element.setAttribute("aria-label", copy[next][key]);
    });
  document
    .querySelectorAll<HTMLElement>("[data-language]")
    .forEach((element) =>
      element.setAttribute(
        "aria-pressed",
        String(element.dataset.language === next),
      ),
    );
  const formatter = new Intl.DateTimeFormat(next, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  document
    .querySelectorAll<HTMLElement>("[data-format-date]")
    .forEach((element) => {
      const raw = element.dataset.formatDate || "";
      element.textContent = formatter.format(
        new Date(raw.includes("T") ? raw : raw + "T00:00:00Z"),
      );
    });
  document
    .querySelectorAll<SVGTextElement>("[data-month-date]")
    .forEach((element) => {
      element.textContent = new Intl.DateTimeFormat(next, {
        month: "short",
        timeZone: "UTC",
      }).format(new Date(element.dataset.monthDate + "T00:00:00Z"));
    });
  renderTerminal();
  updateMotion();
  updateActivityLabels();
  try {
    localStorage.setItem("portfolio-language", next);
  } catch {
    /* The site works without browser storage. */
  }
}
document
  .querySelectorAll<HTMLButtonElement>("[data-language]")
  .forEach((button) =>
    button.addEventListener("click", () =>
      setLocale(button.dataset.language === "es" ? "es" : "en"),
    ),
  );
let saved: string | null = null;
try {
  saved = localStorage.getItem("portfolio-language");
} catch {
  /* Optional preference. */
}
setLocale(saved === "es" ? "es" : "en");

const calendar = document.querySelector<HTMLElement>("[data-calendar-end]");
const cells = [...document.querySelectorAll<SVGRectElement>("[data-day]")];
const activityDays = cells.map((cell) => ({
  date: cell.dataset.day || "",
  count: Number(cell.dataset.count),
}));
function updateActivityLabels() {
  document
    .querySelectorAll<HTMLElement>("[data-stat-label]")
    .forEach((label) => {
      const count = Number(
        label.parentElement?.querySelector("strong")?.textContent,
      );
      const plural = label.dataset.statLabel as
        "contributions" | "repositories" | "activeDays";
      const singular = {
        contributions: "contribution",
        repositories: "repository",
        activeDays: "activeDay",
      } as const;
      label.textContent = copy[locale][count === 1 ? singular[plural] : plural];
    });
}
document
  .querySelectorAll<HTMLButtonElement>("[data-period]")
  .forEach((button) =>
    button.addEventListener("click", () => {
      const period = button.dataset.period || "year";
      const summary = periodSummary(
        activityDays,
        calendar?.dataset.calendarEnd || "",
        period,
      );
      const total = document.querySelector("[data-activity-total]");
      const active = document.querySelector("[data-activity-days]");
      if (total) total.textContent = String(summary.total);
      if (active) active.textContent = String(summary.activeDays);
      updateActivityLabels();
      const description = document.querySelector("#calendar-description");
      if (description)
        description.textContent =
          locale === "es"
            ? `${summary.total} contribuciones en ${summary.activeDays} días del período seleccionado. Captura pública de GitHub.`
            : `${summary.total} contributions across ${summary.activeDays} active days in the selected period. Public GitHub snapshot.`;
      document
        .querySelectorAll("[data-period]")
        .forEach((control) =>
          control.setAttribute("aria-pressed", String(control === button)),
        );
      cells.forEach((cell) =>
        cell.classList.toggle(
          "outside-period",
          Date.parse(cell.dataset.day + "T00:00:00Z") < summary.start,
        ),
      );
      document
        .querySelectorAll<HTMLElement>("[data-activity-row]")
        .forEach((row) => {
          row.hidden =
            Date.parse(row.dataset.activityRow + "T00:00:00Z") < summary.start;
        });
      const empty = document.querySelector<HTMLElement>(".no-dates");
      if (empty) empty.hidden = summary.activeDays !== 0;
    }),
  );

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries)
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
    },
    { threshold: 0.08 },
  );
  document
    .querySelectorAll("[data-reveal]")
    .forEach((element) => observer.observe(element));
  document.documentElement.dataset.enhanced = "true";
}

if (
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !reducedMotion.matches
) {
  document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((panel) => {
    panel.addEventListener("pointermove", (event) => {
      const rect = panel.getBoundingClientRect();
      panel.style.setProperty(
        "--tilt-x",
        `${((event.clientY - rect.top - rect.height / 2) / rect.height) * -3}deg`,
      );
      panel.style.setProperty(
        "--tilt-y",
        `${((event.clientX - rect.left - rect.width / 2) / rect.width) * 3}deg`,
      );
    });
    panel.addEventListener("pointerleave", () => {
      panel.style.setProperty("--tilt-x", "0deg");
      panel.style.setProperty("--tilt-y", "0deg");
    });
  });
}
