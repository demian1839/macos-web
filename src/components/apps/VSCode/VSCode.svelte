<script>
  // Keine reaktiven Variablen oder Logik benötigt.
</script>

<svelte:head>
  <title>WebUntis in Svelte</title>
</svelte:head>

<main>
  <div class="iframe-container">
    <iframe src="https://webuntis.com/" title="WebUntis" frameborder="0"></iframe>
  </div>
</main>

<style>
  :root {
    --background-color: #f0f4f8;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: var(--background-color);
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  main {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .iframe-container {
    width: 100%;
    height: 100%;
  }

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
</style>
