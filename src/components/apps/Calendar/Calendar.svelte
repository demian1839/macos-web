<script>
  import { onMount } from "svelte";

  // Tage der Woche
  const days = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];

  // #################################
  // #      DATENSTRUKTUR & LOGIK    #
  // #################################

  let weekData = {}; // Daten für die aktuelle Woche (Hausaufgaben, Noten)
  let timetableData = {}; // Daten für den Stundenplan
  
  let currentDate = new Date();
  let currentYear;
  let currentWeekNumber;

  // Hilfsfunktion: Eine leere Wochenstruktur erstellen
  function initWeek() {
    let newWeek = {};
    days.forEach(day => {
      newWeek[day] = {
        tasks: [], // Leere Aufgabenliste
        extra: ""
      };
    });
    newWeek["Noten"] = { fächer: "", notizen: "" };
    return newWeek;
  }

  // Hilfsfunktion: Einen leeren Stundenplan erstellen
  function initTimetable() {
    let newTimetable = {};
    days.forEach(day => {
      newTimetable[day] = Array(8).fill(""); // 8 Schulstunden
    });
    return newTimetable;
  }

  // #################################
  // #      WOCHEN-MANAGEMENT        #
  // #################################
  
  // Funktion zum Ermitteln der ISO-Kalenderwoche
  function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  // Aktualisiert die Anzeige und lädt die Daten für die aktuelle Woche
  function updateAndLoadWeek() {
    currentYear = currentDate.getFullYear();
    currentWeekNumber = getWeekNumber(currentDate);
    loadData();
  }

  function changeWeek(direction) {
    currentDate.setDate(currentDate.getDate() + 7 * direction);
    updateAndLoadWeek();
  }

  // #################################
  // #      SPEICHERN & LADEN        #
  // #################################

  // Lädt Wochen- und Stundenplandaten aus dem localStorage
  function loadData() {
    const weekKey = `logbuch-${currentYear}-${currentWeekNumber}`;
    const savedWeek = localStorage.getItem(weekKey);
    weekData = savedWeek ? JSON.parse(savedWeek) : initWeek();

    const savedTimetable = localStorage.getItem("stundenplan");
    timetableData = savedTimetable ? JSON.parse(savedTimetable) : initTimetable();
  }

  // Speichert die aktuellen Daten im localStorage
  function saveData() {
    const weekKey = `logbuch-${currentYear}-${currentWeekNumber}`;
    localStorage.setItem(weekKey, JSON.stringify(weekData));
    localStorage.setItem("stundenplan", JSON.stringify(timetableData));
    
    // Erzwingt eine Aktualisierung der UI nach dem Speichern
    weekData = weekData; 
    timetableData = timetableData;
  }

  // onMount: Wird ausgeführt, wenn die Komponente geladen wird
  onMount(() => {
    updateAndLoadWeek();
  });

  // #################################
  // #      AUFGABEN-FUNKTIONEN      #
  // #################################

  function addTask(day) {
    weekData[day].tasks.push({ fach: "", aufgabe: "", done: false });
    saveData();
  }

  function removeTask(day, index) {
    weekData[day].tasks.splice(index, 1);
    saveData();
  }

  function resetCurrentWeek() {
    if (confirm("Möchtest du wirklich alle Aufgaben und Notizen für diese Woche löschen?")) {
        weekData = initWeek();
        saveData();
    }
  }

</script>

<div class="app-container">
  <header>
    <h1>📘 Logbuch</h1>
    <div class="week-navigator">
      <button on:click={() => changeWeek(-1)}>‹ Vorherige</button>
      <span>KW {currentWeekNumber} / {currentYear}</span>
      <button on:click={() => changeWeek(1)}>Nächste ›</button>
    </div>
  </header>

  <main class="main-grid">
    <div class="tasks-column">
      {#each days as day}
        <section class="day-card">
          <h2>{day}</h2>
          <div class="tasks-list">
            {#each weekData[day]?.tasks || [] as task, i}
              <div class="task-item" class:done={task.done}>
                <input type="checkbox" bind:checked={task.done} on:change={saveData} title="Erledigt?">
                <input class="fach-input" type="text" placeholder="Fach" bind:value={task.fach} on:blur={saveData}>
                <input class="aufgabe-input" type="text" placeholder="Meine Aufgabe..." bind:value={task.aufgabe} on:blur={saveData}>
                <button class="remove-btn" on:click={() => removeTask(day, i)} title="Aufgabe löschen">🗑️</button>
              </div>
            {/each}
          </div>
          <button class="add-btn" on:click={() => addTask(day)}>+ Aufgabe hinzufügen</button>
          <textarea placeholder="Zusätzliche Notizen für {day}..." bind:value={weekData[day].extra} on:blur={saveData}></textarea>
        </section>
      {/each}
    </div>
    
    <div class="sidebar-column">
        <section class="sidebar-card">
            <h2>🗓️ Stundenplan</h2>
            <table class="timetable">
                <thead>
                    <tr>
                        <th>Std.</th>
                        {#each days as day}
                            <th>{day.substring(0,2)}</th>
                        {/each}
                    </tr>
                </thead>
                <tbody>
                    {#each Array(8) as _, i}
                        <tr>
                            <td>{i + 1}.</td>
                            {#each days as day}
                                <td><input type="text" bind:value={timetableData[day][i]} on:blur={saveData}></td>
                            {/each}
                        </tr>
                    {/each}
                </tbody>
            </table>
        </section>

        <section class="sidebar-card">
            <h2>📝 Noten & Notizen</h2>
            <div class="noten-grid">
                <textarea placeholder="Fach & Note (z.B. Mathe: 2+)" bind:value={weekData['Noten'].fächer} on:blur={saveData}></textarea>
                <textarea placeholder="Allgemeine Notizen zur Woche..." bind:value={weekData['Noten'].notizen} on:blur={saveData}></textarea>
            </div>
        </section>

        <section class="sidebar-card actions">
            <h2>⚙️ Aktionen</h2>
            <button class="reset-btn" on:click={resetCurrentWeek}>Aktuelle Woche zurücksetzen</button>
        </section>
    </div>
  </main>
</div>

<style>
  :root {
    --bg-color: #1a1a2e;
    --card-color: #16213e;
    --primary-color: #0f3460;
    --accent-color: #e94560;
    --text-color: #e0e0e0;
    --border-color: rgba(255, 255, 255, 0.1);
    --done-opacity: 0.5;
  }

  .app-container {
    width: 95%;
    max-width: 1400px;
    margin: 2rem auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    color: var(--text-color);
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 0 1rem;
  }

  h1 {
    font-size: 2.5rem;
    color: white;
  }
  
  h2 {
    margin-top: 0;
    color: white;
    border-bottom: 2px solid var(--accent-color);
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .week-navigator {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: var(--primary-color);
    padding: 0.5rem 1rem;
    border-radius: 2rem;
  }

  .week-navigator span {
    font-weight: 500;
    min-width: 120px;
    text-align: center;
  }

  .main-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
  }

  .day-card, .sidebar-card {
    background: var(--card-color);
    padding: 1.5rem;
    border-radius: 1rem;
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  }
  
  .day-card:not(:last-child) {
    margin-bottom: 2rem;
  }
  
  .sidebar-card:not(:last-child) {
    margin-bottom: 2rem;
  }

  .task-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    transition: opacity 0.3s ease;
  }
  
  .task-item.done {
    opacity: var(--done-opacity);
  }
  
  .task-item.done .aufgabe-input,
  .task-item.done .fach-input {
      text-decoration: line-through;
  }

  input[type="text"], textarea {
    width: 100%;
    padding: 0.6rem;
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    background: var(--primary-color);
    color: var(--text-color);
    font-size: 1rem;
  }
  
  input[type="text"]:focus, textarea:focus {
      outline: none;
      border-color: var(--accent-color);
  }
  
  input[type="checkbox"] {
      min-width: 20px;
      height: 20px;
      cursor: pointer;
  }

  .fach-input { flex-basis: 25%; }
  .aufgabe-input { flex-basis: 75%; }
  
  button {
    background: var(--primary-color);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    padding: 0.6rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s ease, transform 0.1s ease;
  }
  
  button:hover {
    background-color: #1e457c;
  }
  
  button:active {
      transform: scale(0.98);
  }

  .add-btn {
    width: 100%;
    margin: 0.5rem 0 1rem 0;
    background-color: rgba(233, 69, 96, 0.2);
    border-color: var(--accent-color);
  }
  
  .add-btn:hover {
      background-color: rgba(233, 69, 96, 0.4);
  }

  .remove-btn {
    background: transparent;
    border: none;
    font-size: 1.2rem;
    padding: 0.2rem;
    opacity: 0.6;
  }
  
  .remove-btn:hover {
      opacity: 1;
      color: var(--accent-color);
  }
  
  .reset-btn {
    width: 100%;
    background-color: var(--accent-color);
    border: none;
    color: white;
  }
  
  .reset-btn:hover {
      background-color: #d43d51;
  }
  
  .timetable {
      width: 100%;
      border-collapse: collapse;
      text-align: center;
  }
  .timetable th { padding-bottom: 0.5rem; }
  .timetable td { padding: 0.1rem; }
  .timetable input { padding: 0.4rem; text-align: center; }

  .noten-grid {
      display: grid;
      gap: 1rem;
  }
  
  textarea {
      min-height: 80px;
      resize: vertical;
  }

  /* Responsive Design für kleinere Bildschirme */
  @media (max-width: 1024px) {
    .main-grid {
      grid-template-columns: 1fr;
    }
    .tasks-column { order: 2; }
    .sidebar-column { order: 1; }
  }
  
  @media (max-width: 600px) {
    header {
        flex-direction: column;
        gap: 1rem;
    }
    h1 { font-size: 2rem; }
  }
</style>
