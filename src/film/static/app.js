const filmsEndpoint = "/rest/filme";
const movieGrid = document.querySelector("#movie-grid");
const statusMessage = document.querySelector("#status-message");
const searchInput = document.querySelector("#film-search");
const resultCount = document.querySelector("#result-count");
const totalCount = document.querySelector("#total-count");
const detailDialog = document.querySelector("#detail-dialog");
const dialogContent = document.querySelector("#dialog-content");
const closeDialogButton = document.querySelector("#dialog-close");

let films = [];
let currentQuery = "";

const icons = {
  people: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"></circle><path d="M3.5 19v-1.5a5.5 5.5 0 0 1 11 0V19zM16 5.5a3 3 0 0 1 0 5.8M18 14a4.5 4.5 0 0 1 2.5 4v1"></path></svg>',
  book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5zM4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8M8 10h6"></path></svg>',
};

function setStatus(message, { error = false, retry = false } = {}) {
  statusMessage.replaceChildren();
  statusMessage.hidden = false;
  statusMessage.classList.toggle("error", error);

  if (!error) {
    const spinner = document.createElement("span");
    spinner.className = "loading-spinner";
    spinner.setAttribute("aria-hidden", "true");
    statusMessage.append(spinner);
  }

  statusMessage.append(document.createTextNode(message));

  if (retry) {
    const button = document.createElement("button");
    button.className = "retry-button";
    button.type = "button";
    button.textContent = "Erneut versuchen";
    button.addEventListener("click", loadFilms);
    statusMessage.append(button);
  }
}

function clearStatus() {
  statusMessage.hidden = true;
  statusMessage.classList.remove("error");
  statusMessage.replaceChildren();
}

function normalized(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("de");
}

function filteredFilms() {
  const query = normalized(currentQuery.trim());
  if (!query) return films;

  return films.filter((film) => {
    const actorNames = (film.schauspieler ?? [])
      .map((actor) => `${actor.vorname} ${actor.nachname}`)
      .join(" ");
    const searchable = [
      film.titel,
      film.erscheinungsjahr,
      actorNames,
      film.drehbuch?.titel,
      film.drehbuch?.autor,
    ].join(" ");
    return normalized(searchable).includes(query);
  });
}

function makeAction(label, icon, onClick) {
  const button = document.createElement("button");
  button.className = "card-action";
  button.type = "button";
  button.innerHTML = icon;
  const text = document.createElement("span");
  text.textContent = label;
  button.append(text);
  button.addEventListener("click", onClick);
  return button;
}

function makeMovieCard(film, index) {
  const card = document.createElement("article");
  card.className = "movie-card";

  const poster = document.createElement("div");
  poster.className = `poster poster-${index % 5}`;
  poster.setAttribute("aria-hidden", "true");

  const posterNumber = document.createElement("span");
  posterNumber.className = "poster-number";
  posterNumber.textContent = `FILM NO. ${String(index + 1).padStart(2, "0")}`;

  const posterTitle = document.createElement("span");
  posterTitle.className = "poster-title";
  posterTitle.textContent = film.titel;
  poster.append(posterNumber, posterTitle);

  const content = document.createElement("div");
  content.className = "card-content";
  const titleRow = document.createElement("div");
  titleRow.className = "card-title-row";

  const title = document.createElement("h3");
  title.className = "movie-title";
  title.textContent = film.titel;
  const year = document.createElement("span");
  year.className = "movie-year";
  year.textContent = String(film.erscheinungsjahr).slice(0, 4);
  titleRow.append(title, year);

  const metadata = document.createElement("div");
  metadata.className = "card-meta";
  const actorCount = document.createElement("span");
  const numberOfActors = film.schauspieler?.length ?? 0;
  actorCount.textContent = `${numberOfActors} Schauspieler`;
  const separator = document.createElement("span");
  separator.className = "meta-dot";
  separator.setAttribute("aria-hidden", "true");
  const screenplay = document.createElement("span");
  screenplay.textContent = "1 Drehbuch";
  metadata.append(actorCount, separator, screenplay);

  const actions = document.createElement("div");
  actions.className = "card-actions";
  actions.append(
    makeAction("Schauspieler", icons.people, () => showActors(film)),
    makeAction("Drehbuch", icons.book, () => showScreenplay(film)),
  );
  content.append(titleRow, metadata, actions);
  card.append(poster, content);
  return card;
}

function renderFilms() {
  const visibleFilms = filteredFilms();
  movieGrid.replaceChildren();
  resultCount.textContent =
    currentQuery.trim() && visibleFilms.length !== films.length
      ? `${visibleFilms.length} von ${films.length} Filmen`
      : `${films.length} ${films.length === 1 ? "Film" : "Filme"}`;

  if (visibleFilms.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    const symbol = document.createElement("span");
    symbol.className = "empty-state-symbol";
    symbol.setAttribute("aria-hidden", "true");
    symbol.textContent = "⌕";
    const title = document.createElement("strong");
    title.textContent = films.length ? "Kein Film gefunden" : "Noch keine Filme";
    const description = document.createElement("span");
    description.textContent = films.length
      ? "Versuche einen anderen Suchbegriff."
      : "Sobald Filme in der Sammlung sind, erscheinen sie hier.";
    empty.append(symbol, title, description);
    movieGrid.append(empty);
    return;
  }

  const cards = visibleFilms.map((film, index) => makeMovieCard(film, index));
  movieGrid.append(...cards);
}

function addDetailItem(list, label, value) {
  const item = document.createElement("div");
  item.className = "detail-item";
  const term = document.createElement("dt");
  term.textContent = label;
  const description = document.createElement("dd");
  description.textContent = value === undefined || value === null || value === ""
    ? "Keine Angabe"
    : String(value);
  item.append(term, description);
  list.append(item);
}

function setDialogHeading(label, title, subtitle) {
  const eyebrow = document.createElement("p");
  eyebrow.className = "dialog-eyebrow";
  eyebrow.textContent = label;

  const heading = document.createElement("h2");
  heading.className = "dialog-title";
  heading.id = "dialog-title";
  heading.textContent = title;

  const subheading = document.createElement("p");
  subheading.className = "dialog-subtitle";
  subheading.textContent = subtitle;
  dialogContent.append(eyebrow, heading, subheading);
}

function addDialogFooter(text) {
  const footer = document.createElement("div");
  footer.className = "dialog-footer";
  const dot = document.createElement("span");
  dot.className = "dialog-footer-dot";
  dot.setAttribute("aria-hidden", "true");
  const label = document.createElement("span");
  label.textContent = text;
  footer.append(dot, label);
  dialogContent.append(footer);
}

function openDialog() {
  if (!detailDialog.open) detailDialog.showModal();
}

function showActors(film) {
  dialogContent.replaceChildren();
  setDialogHeading(
    "Besetzung",
    "Wer spielt mit?",
    `Die Schauspielerinnen und Schauspieler aus „${film.titel}“.`,
  );

  const list = document.createElement("div");
  list.className = "actor-list";
  (film.schauspieler ?? []).forEach((actor) => {
    const button = document.createElement("button");
    button.className = "actor-button";
    button.type = "button";
    button.addEventListener("click", () => showActor(actor, film));

    const avatar = document.createElement("span");
    avatar.className = "actor-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = `${actor.vorname?.[0] ?? ""}${actor.nachname?.[0] ?? ""}`;

    const name = document.createElement("span");
    name.className = "actor-button-label";
    name.textContent = `${actor.vorname} ${actor.nachname}`;

    const arrow = document.createElement("span");
    arrow.className = "actor-button-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "›";
    button.append(avatar, name, arrow);
    list.append(button);
  });

  dialogContent.append(list);
  addDialogFooter(`${film.schauspieler?.length ?? 0} Schauspieler im Film`);
  openDialog();
}

function showActor(actor, film) {
  dialogContent.replaceChildren();
  const back = document.createElement("button");
  back.className = "detail-back";
  back.type = "button";
  back.textContent = "← Zurück zur Besetzung";
  back.addEventListener("click", () => showActors(film));
  dialogContent.append(back);

  setDialogHeading("Schauspieler-Profil", `${actor.vorname} ${actor.nachname}`, `Im Film „${film.titel}“`);
  const details = document.createElement("dl");
  details.className = "detail-list";
  addDetailItem(details, "Vorname", actor.vorname);
  addDetailItem(details, "Nachname", actor.nachname);
  addDetailItem(details, "Schauspieler-ID", actor.id);
  addDetailItem(details, "Film", film.titel);
  dialogContent.append(details);
  addDialogFooter("Schauspieler-Details");
}

function showScreenplay(film) {
  const screenplay = film.drehbuch;
  dialogContent.replaceChildren();
  setDialogHeading(
    "Das Drehbuch",
    screenplay.titel,
    `Die Geschichte hinter „${film.titel}“.`,
  );

  const details = document.createElement("dl");
  details.className = "detail-list";
  addDetailItem(details, "Autor", screenplay.autor);
  addDetailItem(details, "Seitenzahl", `${screenplay.seitenzahl} Seiten`);
  addDetailItem(details, "Drehbuch-ID", screenplay.id);
  addDetailItem(details, "Erscheinungsjahr", String(film.erscheinungsjahr).slice(0, 4));
  dialogContent.append(details);
  addDialogFooter(`Verfasst von ${screenplay.autor}`);
  openDialog();
}

async function loadFilms() {
  movieGrid.replaceChildren();
  setStatus("Filme werden geladen …");

  try {
    const response = await fetch(filmsEndpoint, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Die Filmliste konnte nicht geladen werden (HTTP ${response.status}).`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Die Antwort des Servers enthält keine gültige Filmliste.");
    }

    films = data;
    totalCount.textContent = String(films.length).padStart(2, "0");
    clearStatus();
    renderFilms();
  } catch (error) {
    console.error("Filme konnten nicht geladen werden:", error);
    setStatus(
      error instanceof Error ? error.message : "Die Filmliste konnte nicht geladen werden.",
      { error: true, retry: true },
    );
    totalCount.textContent = "—";
    resultCount.textContent = "";
  }
}

searchInput.addEventListener("input", (event) => {
  currentQuery = event.currentTarget.value;
  if (films.length || !statusMessage.hidden) {
    clearStatus();
    renderFilms();
  }
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "/" &&
    !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)
  ) {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === "Escape" && detailDialog.open) detailDialog.close();
});

closeDialogButton.addEventListener("click", () => detailDialog.close());
detailDialog.addEventListener("click", (event) => {
  if (event.target === detailDialog) detailDialog.close();
});
loadFilms();
