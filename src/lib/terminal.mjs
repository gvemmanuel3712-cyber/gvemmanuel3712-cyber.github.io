/** Fixed portfolio commands. Input is data, never executable code. */
export function runCommand(input, locale = "en") {
  const command = String(input).trim().toLowerCase().slice(0, 160);
  const es = locale === "es";
  const line = (text, href) => ({ text, ...(href ? { href } : {}) });
  const github = "https://github.com/gvemmanuel3712-cyber";
  if (!command) return { lines: [] };
  if (command === "clear") return { lines: [], action: "clear" };
  const commands = {
    help: [
      line(
        "about     " +
          (es ? "la persona detrás del código" : "the person behind the code"),
      ),
      line(
        "skills    " +
          (es ? "herramientas que estoy aprendiendo" : "tools I am learning"),
      ),
      line(
        "projects  " +
          (es ? "lo que estoy construyendo" : "what I am building"),
      ),
      line("github    " + (es ? "mi perfil público" : "my public profile")),
      line("contact   " + (es ? "conectar por GitHub" : "connect on GitHub")),
      line(
        "clear     " + (es ? "limpiar esta terminal" : "clear this terminal"),
      ),
    ],
    about: [
      line("Emmanuel Guevara Vásquez"),
      line(
        es
          ? "Estudiante de Ingeniería en Desarrollo de Software · ITESO"
          : "Software Engineering student · ITESO",
      ),
      line("Guadalajara, México"),
      line(
        es
          ? "Intereses: arquitectura, automatización, IA, APIs y seguridad."
          : "Interests: architecture, automation, AI, APIs and security.",
      ),
    ],
    skills: [
      line(
        es
          ? "Práctica: Python, TypeScript, JavaScript, SQL y Git."
          : "Project practice: Python, TypeScript, JavaScript, SQL and Git.",
      ),
      line(
        es
          ? "Formación académica: Java / POO; C / estructuras de datos."
          : "Academic foundations: Java / OOP; C / data structures.",
      ),
      line(
        es
          ? "Aprendiendo en proyectos: React, Next.js, Vue, FastAPI, SQLite, PostgreSQL."
          : "Learning through projects: React, Next.js, Vue, FastAPI, SQLite, PostgreSQL.",
      ),
    ],
    projects: [
      line(
        es
          ? "Este portafolio → notas de construcción"
          : "This portfolio → build notes",
        "/projects/portfolio/",
      ),
      line("GitHub Profile → source", github + "/gvemmanuel3712-cyber"),
      line(
        es
          ? "Opero Docs → privado, en desarrollo."
          : "Opero Docs → private, in development.",
      ),
    ],
    github: [line(github, github)],
    contact: [
      line(
        es
          ? "Conectemos por GitHub. Es mi único contacto público aquí."
          : "Let’s connect on GitHub. It is my only public contact here.",
      ),
      line("@gvemmanuel3712-cyber", github),
    ],
  };
  return {
    lines: Object.hasOwn(commands, command)
      ? commands[command]
      : [
          line(
            es
              ? `Comando desconocido: ${command}. Escribe help.`
              : `Unknown command: ${command}. Type help.`,
          ),
        ],
  };
}

export function periodSummary(days, endDate, period = "year") {
  const end = Date.parse(endDate + "T00:00:00Z");
  const start =
    period === "year" ? -Infinity : end - (Number(period) - 1) * 86400000;
  const visible = days.filter(
    (day) => Date.parse(day.date + "T00:00:00Z") >= start,
  );
  return {
    total: visible.reduce((sum, day) => sum + day.count, 0),
    activeDays: visible.filter((day) => day.count > 0).length,
    start,
  };
}
