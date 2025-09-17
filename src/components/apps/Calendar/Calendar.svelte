<script>
  import { writable } from "svelte/store";

  // Store für die Aufgaben
  const tasks = writable([]);

  // Input-Variablen
  let subject = "";
  let homework = "";
  let dueDate = "";

  // Aufgabe hinzufügen
  function addTask() {
    if (subject && homework && dueDate) {
      tasks.update(t => [...t, { subject, homework, dueDate, done: false }]);
      subject = homework = dueDate = "";
    }
  }

  // Aufgabe als erledigt markieren
  function toggleDone(i) {
    tasks.update(t => {
      t[i].done = !t[i].done;
      return [...t];
    });
  }

  // Aufgabe löschen
  function deleteTask(i) {
    tasks.update(t => t.filter((_, j) => j !== i));
  }
</script>

<main>
  <header class="header">
    <h1>📘 Hausaufgaben Logbuch</h1>
  </header>

  <div class="input-box">
    <input type="text" placeholder="Fach" bind:value={subject} />
    <input type="text" placeholder="Hausaufgabe" bind:value={homework} />
    <input type="date" bind:value={dueDate} />
    <button on:click={addTask}>➕</button>
  </div>

  <ul class="task-list">
    {#each $tasks as task, i}
      <li class:done={task.done}>
        <div class="task">
          <span><b>{task.subject}</b>: {task.homework}</span>
          <small>Fällig: {task.dueDate}</small>
        </div>
        <div class="actions">
          <button on:click={() => toggleDone(i)}>
            {task.done ? "✔️" : "⏳"}
          </button>
          <button on:click={() => deleteTask(i)}>🗑️</button>
        </div>
      </li>
    {/each}
  </ul>
</main>

<style>
  main {
    font-family: "Inter", sans-serif;
    min-height: 100vh;
    background: linear-gradient(135deg, #6a00ff, #00a2ff);
    color: white;
    padding: 1rem;
  }

  .header {
    text-align: center;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  .header h1 {
    margin: 0;
    font-size: 1.8rem;
  }

  .input-box {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  input {
    flex: 1;
    padding: 0.6rem;
    border-radius: 0.8rem;
    border: none;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    backdrop-filter: blur(10px);
  }

  input::placeholder {
    color: #ddd;
  }

  button {
    background: #6a00ff;
    border: none;
    border-radius: 0.8rem;
    color: white;
    padding: 0.6rem 1rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  button:hover {
    background: #00a2ff;
  }

  .task-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .task-list li {
    background: rgba(255, 255, 255, 0.1);
    margin-bottom: 0.8rem;
    padding: 0.8rem;
    border-radius: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    backdrop-filter: blur(12px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  }

  .task-list li.done {
    opacity: 0.6;
    text-decoration: line-through;
  }

  .actions button {
    margin-left: 0.4rem;
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.1rem;
  }

  .actions button:hover {
    transform: scale(1.2);
  }

  .task span {
    display: block;
    font-size: 1rem;
  }

  .task small {
    font-size: 0.8rem;
    color: #ddd;
  }
</style>
