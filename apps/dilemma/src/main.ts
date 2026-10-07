import "./style.css";

// Boot marker: read by the e2e boot spec and, from T2 on, by the qa overlay.
performance.mark("boot");
console.info(`[dilemma] boot ${__APP_VERSION__}`);
