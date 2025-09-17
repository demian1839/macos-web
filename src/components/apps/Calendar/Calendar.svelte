<script>
  import { onMount } from "svelte";

  // Woche mit Tagen
  const days = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];

  let weekData = {};

  // beim Laden Daten aus localStorage ziehen
  onMount(() => {
    const saved = localStorage.getItem("logbuch");
    weekData = saved ? JSON.parse(saved) : initWeek();
  });

  // Woche initialisieren
  function initWeek() {
    let d = {};
    days.forEach(day => {
      d[day] = {
        tasks: [
          { fach: "", aufgabe: "", done: null },
          { fach: "", aufgabe: "", done: null },
          { fach: "", aufgabe: "", done: null }
        ],
        extra: ""
      };
    });
    d["Noten"] = { fächer: [], notizen: "" };
    return d;
  }

  // speichern
  function save() {
    localStorage.setItem("logbuch", JSON.stringify(weekData));
  }

  function toggleTask(day, i, status) {
    weekData[day].tasks[i].done = status;
    save();
  }
</script>

<!-- Fenster -->
<div class="window" on:mousedown|self>
  <div class="titlebar" id="drag-bar">
    📘 Hausaufgaben Logbuch
  </div>

  <div class="content">
    {#each days as day}
      <section>
        <h2>{day}</h2>
        <table>
          <thead>
            <tr>
              <th>Fach</th>
              <th>Das nehme ich mir vor</th>
              <th>✅</th>
              <th>❌</th>
            </tr>
          </thead>
          <tbody>
            {#each weekData[day].tasks as task, i}
              <tr>
                <td><input type="text" bind:value={task.fach} on:input={save} /></td>
                <td><input type="text" bind:value={task.aufgabe} on:input={save} /></td>
                <td>
                  <input type="radio" name="{day}{i}" checked={task.done === true} 
                    on:change={() => toggleTask(day,i,true)} />
                </td>
                <td>
                  <input type="radio" name="{day}{i}" checked={task.done === false} 
                    on:change={() => toggleTask(day,i,false)} />
                </td>
              </tr>
            {/each}
            <tr>
              <td colspan="4">
                <textarea placeholder="Noch zu erledigen..." bind:value={weekData[day].extra} on:input={save}></textarea>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    {/each}

    <!-- Notenbereich -->
    <section>
      <h2>Noten der Woche</h2>
      <div class="noten">
        <div class="notenfeld">
          <textarea placeholder="Fach / Note" bind:value={weekData["Noten"].fächer} on:input={save}></textarea>
        </div>
        <div class="notizenfeld">
          <textarea placeholder="✍️ Notizen..." bind:value={weekData["Noten"].notizen} on:input={save}></textarea>
        </div>
      </div>
    </section>
  </div>
</div>

<style>
/* Fenster */
.window {
  width: 90%;
  max-width: 900px;
  margin: 2rem auto;
  border-radius: 1.2rem;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(15px);
  color: white;
}

/* Titelbar (zum Verschieben gedacht) */
.titlebar {
  background: linear-gradient(135deg, #6a00ff, #00a2ff);
  padding: 0.8rem 1rem;
  cursor: move;
  font-weight: bold;
  user-select: none;
}

/* Inhalt */
.content {
  padding: 1rem;
}

h2 {
  margin: 1rem 0 0.5rem;
  font-size: 1.3rem;
  border-bottom: 2px solid rgba(255,255,255,0.2);
  padding-bottom: 0.2rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  background: rgba(255,255,255,0.05);
  border-radius: 0.6rem;
  overflow: hidden;
}

th, td {
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0.5rem;
  text-align: left;
}

input[type="text"], textarea {
  width: 100%;
  padding: 0.4rem;
  border: none;
  border-radius: 0.4rem;
  background: rgba(255,255,255,0.1);
  color: white;
}

textarea {
  min-height: 2.5rem;
  resize: vertical;
}

.noten {
  display: flex;
  gap: 1rem;
}

.notenfeld, .notizenfeld {
  flex: 1;
  background: rgba(255,255,255,0.05);
  padding: 0.6rem;
  border-radius: 0.6rem;
}
</style>
