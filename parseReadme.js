export function parseReadme(md) {
  const lines = md.split(/\r?\n/);

  let title = "";
  for (const l of lines) {
    const m = l.match(/^#\s+(.+)\s*$/);
    if (m) {
      title = m[1].trim();
      break;
    }
  }

  let description = "";
  let started = false;
  let buf = [];

  for (const l of lines) {
    if (!started) {
      if (title && l.startsWith("#")) continue;
      if (l.trim() === "") continue;
      started = true;
    }

    if (started) {
      if (l.trim() === "") break;
      buf.push(l.trim());
    }
  }

  description = buf.join(" ").trim();
  return { title, description };
}
