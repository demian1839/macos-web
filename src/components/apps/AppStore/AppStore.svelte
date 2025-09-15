<script lang="ts">
  // --------- Daten & State ----------
  type Cat = 'Produktivität'|'Spiele'|'Kreativ'|'Tools'|'Lernen'|'Sozial'|'System';
  type App = {
    id: string; name: string; category: Cat; rating: number;
    price?: string; badge?: string; color?: string; icon?: string;
    width?: number; height?: number;
  };

  const CATS = ['Alle','Produktivität','Spiele','Kreativ','Tools','Lernen','Sozial','System'] as const;

  let apps: App[] = [
    { id:'notes',  name:'Oregon Notes', category:'Produktivität', rating:4.8, price:'Gratis', badge:'Top',  color:'#8b5cf6', icon:'📝' },
    { id:'chat',   name:'Oregon Chat',  category:'Sozial',       rating:4.8, price:'Gratis', badge:'Top',  color:'#6366f1', icon:'💬' },
    { id:'tasks',  name:'Flow Tasks',   category:'Produktivität', rating:4.9, price:'Gratis',           color:'#3b82f6', icon:'📋' },
    { id:'browser',name:'Oregon Web',   category:'System',        rating:4.3, price:'Gratis',           color:'#0ea5e9', icon:'🌐' },
    { id:'alarm',  name:'Oregon Clock', category:'Tools',         rating:4.5, price:'Gratis',           color:'#f59e0b', icon:'⏰' },
    { id:'term',   name:'Terminus',     category:'System',        rating:4.6, price:'Gratis',           color:'#10b981', icon:'>_' },
    { id:'studio', name:'Pixel Studio', category:'Kreativ',       rating:4.6, price:'Gratis', badge:'Neu', color:'#06b6d4', icon:'🎨' },
    { id:'Made by Demian',  name:'Made by Demian',  category:'Spiele',        rating:4.2, price:'Gratis',           color:'#a855f7', icon:'🏁' },
     { id:'HeyPuri',  name:'HeyPuri',  category:'Spiele',        rating:4.2, price:'Gratis',           color:'#a855f7', icon:'🏁' },
 { id:'Coming soon',  name:'Coming soon',  category:'Spiele',        rating:4.2, price:'Gratis',           color:'#a855f7', icon:'🏁' },
  ];

  // Suche/Filter/Sortierung
  let q = '';
  let activeCategory: (typeof CATS)[number] = 'Alle';
  let sortMode: 'Beliebt'|'Neu'|'Rating' = 'Beliebt';

  // Installation & Launcher
  let installing: Record<string, boolean> = {};
  let progress:   Record<string, number>  = {};
  let installed:  Record<string, boolean> = loadInstalled();

  function loadInstalled() {
    try { return JSON.parse(localStorage.getItem('os.installed') || '{}'); } catch { return {}; }
  }
  function saveInstalled() {
    try { localStorage.setItem('os.installed', JSON.stringify(installed)); } catch {}
  }

  const sleep = (ms:number)=>new Promise(r=>setTimeout(r,ms));

  async function install(app:App) {
    if (installed[app.id] || installing[app.id]) return;
    installing[app.id] = true;
    progress[app.id] = 0;
    for (let i=0; i<=100; i+= Math.max(4, Math.round(Math.random()*12))) {
      progress[app.id] = Math.min(100, i);
      await sleep(70);
    }
    installing[app.id] = false;
    installed[app.id] = true;
    progress[app.id] = 100;
    saveInstalled();
  }

  // App-Management
  let activeAppId: string | null = null;
  function openApp(id: string) { if (!installed[id]) return; activeAppId = id; }
  function closeApp() { activeAppId = null; }
  function appById(id:string) { return apps.find(a=>a.id===id)!; }

  function filteredApps() {
    let list = apps.filter(a =>
      (activeCategory==='Alle' || a.category===activeCategory) &&
      (a.name.toLowerCase().includes(q.toLowerCase()) || a.category.toLowerCase().includes(q.toLowerCase()))
    );
    if (sortMode==='Rating') list = list.sort((a,b)=> b.rating - a.rating);
    if (sortMode==='Neu')    list = list.sort((a,b)=> (b.badge==='Neu'?1:0) - (a.badge==='Neu'?1:0));
    return list;
  }

  // ----- App-Logik -----

  // Flow Tasks
  type Todo = { id: number; text: string; done: boolean; };
  let todoInput = '';
  let todos: Todo[] = loadTodos();
  function loadTodos(): Todo[] { try { return JSON.parse(localStorage.getItem('os.todos') || '[]'); } catch { return []; } }
  function saveTodos() { try { localStorage.setItem('os.todos', JSON.stringify(todos)); } catch {} }
  function addTodo() {
    const text = todoInput.trim(); if (!text) return;
    todos = [...todos, { id: Date.now(), text, done: false }]; todoInput = ''; saveTodos();
  }
  function delTodo(id: number) { todos = todos.filter(t => t.id !== id); saveTodos(); }
  function toggleTodo(id: number) { saveTodos(); }

  // Notes
  let notes = (localStorage.getItem('os.notes')||'').toString();
  function saveNotes(){ try{ localStorage.setItem('os.notes', notes);}catch{} }

  // Chat
  type Msg = { id:number; who:'du'|'bot'; text:string; t:number };
  let chat: Msg[] = [];
  let input = '';
  function sendChat(){
    const t = Date.now(); const me:Msg = { id:t, who:'du', text:input.trim(), t }; if(!me.text) return;
    chat = [...chat, me]; input = '';
    setTimeout(()=>{
      const reply:Msg = { id:t+1, who:'bot', text:`Echo: ${me.text}`, t:t+1 }; chat = [...chat, reply];
      const scroller = document.querySelector('.chat-log') as HTMLElement;
      scroller?.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' });
    }, 300);
  }

    // ##################################################################
    // #                     TERMINUS V2 LOGIC                          #
    // ##################################################################

    let termOut: string[] = ['Welcome to Terminus v2. Type "help" for a list of commands.'];
    let termIn = '';
    let commandHistory: string[] = [];
    let historyIndex = -1;

    // --- Mock Environment ---
    let currentUser = 'demian';
    let hostname = 'oregon-os';
    const startTime = Date.now();
    let currentPath = '/home/demian';
    type FileNode = { type: 'file'; content: string };
    type DirNode = { type: 'dir'; content: { [key: string]: FileNode | DirNode } };
    let fs: DirNode = {
        type: 'dir',
        content: {
            'home': { type: 'dir', content: {
                'demian': { type: 'dir', content: {
                    'welcome.txt': { type: 'file', content: 'Hello, World!' },
                    'projects': { type: 'dir', content: {
                        'oregon-os': { type: 'file', content: 'Source code for this OS.' }
                    }},
                    'about.txt': { type: 'file', content: 'Made by Demian.' }
                }}
            }},
            'etc': { type: 'dir', content: {
                'config': { type: 'file', content: 'SECRET_KEY=12345' }
            }},
            'usr': { type: 'dir', content: {
                'bin': { type: 'dir', content: {} }
            }}
        }
    };

    // --- Filesystem Helpers ---
    function getNode(path: string): FileNode | DirNode | null {
        const parts = path.split('/').filter(p => p);
        let node: DirNode | FileNode = fs;
        for (const part of parts) {
            if (node.type === 'dir' && node.content[part]) {
                node = node.content[part];
            } else {
                return null;
            }
        }
        return node;
    }

    function resolvePath(path: string): string {
        if (path.startsWith('/')) return path;
        const newPath = new URL(path, `file://${currentPath}/`).pathname;
        return newPath.endsWith('/') && newPath.length > 1 ? newPath.slice(0, -1) : newPath;
    }

    // --- Command Definitions ---
    const commands: Record<string, (args: string[]) => string | string[]> = {
        'help': () => ['Available commands:', Object.keys(commands).concat(['clear']).sort().join(', ')],
        'echo': (args) => args.join(' '),
        'date': () => new Date().toLocaleString('de-DE'),
        'time': () => new Date().toLocaleTimeString('de-DE'),
        'whoami': () => currentUser,
        'hostname': () => hostname,
        'pwd': () => currentPath,
        'uname': () => 'OregonOS 1.0.0 Terminus',
        'uptime': () => {
            const uptime = Math.floor((Date.now() - startTime) / 1000);
            return `up ${uptime} seconds`;
        },
        'ls': (args) => {
            const path = args[0] ? resolvePath(args[0]) : currentPath;
            const node = getNode(path);
            if (node && node.type === 'dir') {
                const content = Object.keys(node.content);
                return content.length > 0 ? content.map(item => getNode(path+'/'+item)?.type === 'dir' ? `${item}/` : item).join('\n') : '(empty)';
            }
            return `ls: cannot access '${path}': No such file or directory`;
        },
        'cd': (args) => {
            if (!args[0]) {
                currentPath = `/home/${currentUser}`;
                return '';
            }
            const newPath = resolvePath(args[0]);
            const node = getNode(newPath);
            if (node && node.type === 'dir') {
                currentPath = newPath;
                return '';
            }
            return `cd: ${args[0]}: No such file or directory`;
        },
        'cat': (args) => {
            if (!args[0]) return 'Usage: cat <file>';
            const path = resolvePath(args[0]);
            const node = getNode(path);
            if (node && node.type === 'file') return node.content;
            if (node && node.type === 'dir') return `cat: ${args[0]}: Is a directory`;
            return `cat: ${args[0]}: No such file or directory`;
        },
        'touch': (args) => {
            if (!args[0]) return 'Usage: touch <file>';
            const path = args[0].split('/');
            const filename = path.pop()!;
            const dirPath = resolvePath(path.join('/'));
            const dirNode = getNode(dirPath);
            if (dirNode && dirNode.type === 'dir') {
                dirNode.content[filename] = { type: 'file', content: '' };
                return '';
            }
            return `touch: cannot create file '${args[0]}': No such directory`;
        },
        'mkdir': (args) => {
            if (!args[0]) return 'Usage: mkdir <directory>';
            const path = args[0].split('/');
            const newDirName = path.pop()!;
            const parentPath = resolvePath(path.join('/'));
            const parentNode = getNode(parentPath);
            if (parentNode && parentNode.type === 'dir') {
                if (parentNode.content[newDirName]) return `mkdir: cannot create directory '${args[0]}': File exists`;
                parentNode.content[newDirName] = { type: 'dir', content: {} };
                return '';
            }
            return `mkdir: cannot create directory '${args[0]}': No such parent directory`;
        },
        'history': () => commandHistory.map((c, i) => `${i + 1}: ${c}`),
        'about': () => 'Terminus v2 - A mock terminal for OregonOS.',
        'cal': () => {
            const d = new Date();
            const year = d.getFullYear();
            const month = d.getMonth();
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            let cal = `   ${d.toLocaleString('default', { month: 'long' })} ${year}\nSu Mo Tu We Th Fr Sa\n`;
            let day = 1;
            for (let i = 0; i < 6; i++) {
                let week = '';
                for (let j = 0; j < 7; j++) {
                    if (i === 0 && j < firstDay) {
                        week += '   ';
                    } else if (day > daysInMonth) {
                        break;
                    } else {
                        week += day.toString().padStart(2, ' ') + ' ';
                        day++;
                    }
                }
                cal += week + '\n';
                if (day > daysInMonth) break;
            }
            return cal;
        },
        'cowsay': (args) => {
            const text = args.join(' ') || 'Moo!';
            return [
                ` < ${text} >`,
                '        \\   ^__^',
                '         \\  (oo)\\_______',
                '            (__)\\       )\\/\\',
                '                ||----w |',
                '                ||     ||'
            ];
        },
        'exit': () => { closeApp(); return 'Closing Terminus...'; },
        'search': (args) => {
            const query = args.join(' ');
            q = query;
            return `Searching app store for: ${query}`;
        },
        'install': (args) => {
            const app = apps.find(a => a.id === args[0] || a.name.toLowerCase() === args.join(' ').toLowerCase());
            if (app) {
                install(app);
                return `Installing ${app.name}...`;
            }
            return `App not found: ${args[0]}`;
        },
        'open': (args) => {
            const appId = args[0];
            if (installed[appId]) {
                openApp(appId);
                return `Opening ${appId}...`;
            }
            return `App '${appId}' is not installed or does not exist.`;
        },
        'list-apps': () => ['Installed Apps:', ...Object.keys(installed)],
        'neofetch': () => [
            "      _______      " + `${currentUser}@${hostname}`,
            "   ,sSSSSs,      -----------",
            "  sSS'   `SSs     OS: OregonOS",
            " SSS     SSS     Kernel: 1.0.0-Terminus",
            " SSS,    `SS'     Uptime: " + Math.floor((Date.now() - startTime) / 1000) + "s",
            "  `sSSs, SSS      Shell: terminus",
            "     `sSSSS'      ",
            "      `sS'",
        ],
        'lorem': (args) => {
            const count = parseInt(args[0]) || 1;
            const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ';
            return text.repeat(count);
        },
        'uuid': () => crypto.randomUUID(),
        'calc': (args) => {
            try {
                // Basic safe eval for calculator
                const expr = args.join('').replace(/[^-()\d/*+.]/g, '');
                return new Function(`return ${expr}`)();
            } catch {
                return 'Invalid expression';
            }
        },
        'random': (args) => {
            const max = parseInt(args[0]) || 100;
            return `Your random number is: ${Math.floor(Math.random() * max)}`;
        },
        'color': (args) => {
            if (!args[0]) return 'Usage: color <hex>';
            const termBox = document.querySelector('.term-box');
            if (termBox instanceof HTMLElement) termBox.style.color = args[0];
            return `Terminal color changed to ${args[0]}`;
        },
        'reboot': () => {
            termOut = ['Rebooting... (Just kidding!)'];
            setTimeout(() => termOut = ['Welcome to Terminus v2...'], 1500);
            return '';
        },
        'shutdown': () => { closeApp(); return 'Shutting down OregonOS... (Not really!)' },
        'ping': (args) => {
            const host = args[0] || 'localhost';
            return `Pinging ${host} with 32 bytes of data:\nReply from ${host}: bytes=32 time<1ms TTL=128\nReply from ${host}: bytes=32 time<1ms TTL=128`;
        },
        'ifconfig': () => 'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 192.168.1.10  netmask 255.255.255.0  broadcast 192.168.1.255',
        'ps': () => '  PID TTY          TIME CMD\n    1 ?        00:00:00 init\n  42 ?        00:00:01 terminus',
        'kill': () => 'This is a simulation. No processes were harmed.',
        'man': (args) => `No manual entry for ${args[0] || 'anything'}`,
        'df': () => 'Filesystem     Size  Used Avail Use% Mounted on\n/dev/mockfs    10G   2G    8G  20% /',
        'du': () => '2.0G    .',
        'grep': (args) => {
            if(args.length < 2) return "usage: grep PATTERN <file>";
            const fileContent = commands['cat']([args[1]]);
            if(typeof fileContent !== 'string' || fileContent.startsWith('cat:')) return fileContent;
            const pattern = new RegExp(args[0], 'g');
            return fileContent.split('\n').filter(line => line.match(pattern)).join('\n') || "(no matches)";
        },
        'wc': (args) => {
            const content = commands['cat'](args);
            if(typeof content !== 'string' || content.startsWith('cat:')) return content;
            const lines = content.split('\n').length;
            const words = content.split(/\s+/).length;
            const chars = content.length;
            return `${lines} ${words} ${chars} ${args[0]}`;
        },
        'rev': (args) => args.join(' ').split('').reverse().join(''),
        'rot13': (args) => args.join(' ').replace(/[a-zA-Z]/g, c => String.fromCharCode(c.charCodeAt(0) + (c.toLowerCase() < 'n' ? 13 : -13))),
        'base64': (args) => btoa(args.join(' ')),
        'unbase64': (args) => atob(args[0] || ''),
        'head': (args) => {
            const content = commands['cat']([args[0]]);
             if(typeof content !== 'string' || content.startsWith('cat:')) return content;
            return content.split('\n').slice(0, 5).join('\n');
        },
        'tail': (args) => {
            const content = commands['cat']([args[0]]);
             if(typeof content !== 'string' || content.startsWith('cat:')) return content;
            return content.split('\n').slice(-5).join('\n');
        },
        'alias': () => 'Alias functionality not implemented.',
        'bg': () => 'No jobs to run in background.',
        'bind': () => 'Key binding not available in this terminal.',
        'break': () => 'Not in a loop.',
        'builtin': () => 'Yes, this is a builtin command.',
        'caller': () => '0',
        'case': () => 'Syntax error: unexpected end of file',
        'compgen': () => '',
        'complete': () => '',
        'compopt': () => '',
        'continue': () => 'Not in a loop.',
        'coproc': () => 'Co-processes not supported.',
        'dirs': () => currentPath,
        'disown': () => 'No jobs to disown.',
        'enable': () => '',
        'eval': () => 'Eval is disabled for security reasons.',
        'exec': () => 'Exec is disabled for security reasons.',
        'export': () => 'No variables to export.',
        'false': () => { throw new Error('Exited with status 1'); },
        'fc': () => 'No previous commands to fix.',
        'fg': () => 'No jobs to bring to foreground.',
        'getopts': () => 'Not available.',
        'hash': () => '',
        'jobs': () => '',
        'let': () => 'Use `calc` for calculations.',
        'local': () => '',
        'logout': () => commands['exit']([]),
        'mapfile': () => 'Not implemented.',
        'popd': () => 'Directory stack empty.',
        'printf': (args) => args.join(' ').replace(/\\n/g, '\n'),
        'pushd': () => 'Not implemented.',
        'read': () => 'Cannot read from stdin here.',
        'readonly': () => '',
        'return': () => 'Not in a function.',
        'set': () => '',
        'shift': () => '',
        'shopt': () => '',
        'source': () => 'Cannot source files in this environment.',
        'suspend': () => 'Cannot suspend this terminal.',
        'test': () => '',
        'times': () => '0m0.000s 0m0.000s',
        'trap': () => '',
        'true': () => '',
        'type': (args) => `${args[0]} is a shell builtin`,
        'ulimit': () => 'unlimited',
        'umask': () => '0022',
        'unalias': () => '',
        'unset': () => '',
        'until': () => 'Syntax error: unexpected end of file',
        'wait': () => '',
        'while': () => 'Syntax error: unexpected end of file',
        'whatis': (args) => `${args[0]}: a mock command in Terminus.`,
        'whereis': (args) => `${args[0]}: /usr/bin/${args[0]}`,
        'which': (args) => `/usr/bin/${args[0]}`,
        'who': () => `${currentUser}  tty1         ${new Date(startTime).toLocaleDateString()} ${new Date(startTime).toLocaleTimeString()}`,
        'yes': (args) => {
            const text = args.join(' ') || 'y';
            return Array(20).fill(text).join('\n');
        },
        'sl': () => [
            '                                       (  ) (   )  (                             ',
            '     (                                  )  ) )  (                                 ',
            '  ) )                                (  (  )                                     ',
            ' ( (   (                               )                                         ',
            '  ) )   )  )              /\\\\         (                                            ',
            ' ( (   (  (              |oo|            )                                        ',
            '  ) )   )  )             |  |           (                                         ',
            ' ( (   (  (             /----\\          )                                        ',
            '  ) )   )  )            /      \\        (                                         ',
            ' ( (   (  (            /        \\       )                  ______________________',
            '  ) )   )  )     |     /          \\     (                  |                      |',
            ' ( (   (  (      O    /            \\     )                 |______________________|',
            '  ) )   )  )          /              \\   (                                         ',
            ' ( (   (  (   ------/----------------\\---)                                        ',
            '  ) )   )  )  (      |                |                                          ',
            ' ( (   (  (   )     |                |                                          ',
            '  ) )   )  ) (      |________________|                                          ',
            ' ( (   (  (   )      | | | | | | | | |                                           ',
            '  ) )   )  ) (       | | | | | | | | |                                           ',
            ' ( (   (  (   )      | | | | | | | | |                                           ',
            '  ) )   )  ) (       |_|_|_|_|_|_|_|_|                                           ',
            ' ( (   (  (                                                                     ',
            '  ) )   )  )                                                                     ',
            ' ( (   (  (                                                                     ',
            '__)))___))_)))___________________________________________________________________'
        ],
    };

    function handleTermKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
            termExec();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length > 0) {
                historyIndex = Math.min(commandHistory.length - 1, historyIndex + 1);
                termIn = commandHistory[commandHistory.length - 1 - historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex >= 0) {
                historyIndex--;
                termIn = historyIndex >= 0 ? commandHistory[commandHistory.length - 1 - historyIndex] : '';
            }
        }
    }

    function termExec() {
        const line = termIn.trim();
        const prompt = `${currentUser}@${hostname}:${currentPath}$`;

        if (!line) {
            termOut = [...termOut, prompt];
        } else {
            termOut = [...termOut, `${prompt} ${line}`];
            commandHistory = [...commandHistory, line];
            historyIndex = -1;

            const [command, ...args] = line.split(/\s+/);

            if (command === 'clear') {
                termOut = [''];
            } else if (command in commands) {
                try {
                    const output = commands[command](args);
                    const outputLines = Array.isArray(output) ? output : [output];
                    if(outputLines.join('').length > 0) termOut = [...termOut, ...outputLines];
                } catch (e: any) {
                    termOut = [...termOut, `Error: ${e.message || 'Command failed'}`];
                }
            } else {
                termOut = [...termOut, `terminus: command not found: ${command}`];
            }
        }

        termIn = '';
        setTimeout(() => {
            const box = document.querySelector('.term-box') as HTMLElement;
            box?.scrollTo({ top: box.scrollHeight });
        }, 10);
    }
    // ##################################################################
    // #                   END TERMINUS V2 LOGIC                        #
    // ##################################################################

  // Wecker / Uhr
  let currentTime = new Date();
  let alarmTime = '';
  let isAlarmSet = false;
  let isAlarmRinging = false;
  let timeInterval: any;

  $: {
    if (activeAppId === 'alarm' && !timeInterval) {
      timeInterval = setInterval(() => {
        currentTime = new Date();
        if (isAlarmSet && !isAlarmRinging) {
          const [h, m] = alarmTime.split(':');
          if (currentTime.getHours() == Number(h) && currentTime.getMinutes() == Number(m) && currentTime.getSeconds() === 0) {
            isAlarmRinging = true;
          }
        }
      }, 1000);
    } else if (activeAppId !== 'alarm' && timeInterval) {
      clearInterval(timeInterval);
      timeInterval = undefined;
    }
  }
  function setAlarm() { if (alarmTime) { isAlarmSet = true; isAlarmRinging = false; } }
  function clearAlarm() { isAlarmSet = false; isAlarmRinging = false; alarmTime = ''; }
  function stopAlarm() { isAlarmRinging = false; }


  // Web Browser
  let browserUrl = 'https://www.bing.com';
  let iframeSrc = browserUrl;
  let browserHistory = [browserUrl];
  let historyIndex = 0;

  function navigateTo() {
    let url = browserUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    iframeSrc = url;
    if (browserHistory[historyIndex] !== url) {
      browserHistory = browserHistory.slice(0, historyIndex + 1);
      browserHistory.push(url);
      historyIndex++;
    }
  }
  function goBack() {
    if (historyIndex > 0) { historyIndex--; iframeSrc = browserHistory[historyIndex]; browserUrl = iframeSrc; }
  }
  function goForward() {
    if (historyIndex < browserHistory.length - 1) { historyIndex++; iframeSrc = browserHistory[historyIndex]; browserUrl = iframeSrc; }
  }
  function reload() { const current = iframeSrc; iframeSrc = ''; setTimeout(() => { iframeSrc = current; }, 50); }


  // Pixel Studio
  let brush = '#7c8cff', pxSize = 16, drawing = false, canvasEl: HTMLCanvasElement;
  function setupCanvas(node:HTMLCanvasElement){
    canvasEl = node; const dpr = window.devicePixelRatio||1; const w=40,h=24;
    node.width = w*pxSize*dpr; node.height = h*pxSize*dpr;
    node.style.width = `${w*pxSize}px`; node.style.height = `${h*pxSize}px`;
    const ctx = node.getContext('2d')!; ctx.scale(dpr,dpr);
    ctx.fillStyle = '#0f1424'; ctx.fillRect(0,0,w*pxSize,h*pxSize);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    for(let x=0;x<=w;x++){ ctx.beginPath();ctx.moveTo(x*pxSize,0);ctx.lineTo(x*pxSize,h*pxSize);ctx.stroke(); }
    for(let y=0;y<=h;y++){ ctx.beginPath();ctx.moveTo(0,y*pxSize);ctx.lineTo(w*pxSize,y*pxSize);ctx.stroke(); }
  }
  function paintAt(ev:MouseEvent){
    const rect = canvasEl.getBoundingClientRect();
    const x = Math.floor((ev.clientX-rect.left)/pxSize)*pxSize, y = Math.floor((ev.clientY-rect.top)/pxSize)*pxSize;
    const ctx = canvasEl.getContext('2d')!; ctx.fillStyle = brush; ctx.fillRect(x,y,pxSize,pxSize);
  }
  function canvasInit(node:HTMLCanvasElement){ setupCanvas(node); return { destroy(){} }; }

  // Arena Animation
  let pos=50, dir=1, speed=2, raf:number|undefined;
  function tickArena(){ pos+=dir*speed; if(pos<0||pos>100){dir*=-1;} raf=requestAnimationFrame(tickArena); }
  function startArena(){ if(!raf) raf=requestAnimationFrame(tickArena); }
  function stopArena(){ if(raf){cancelAnimationFrame(raf); raf=undefined;} }
</script>

{#if !activeAppId}
  <section class="store-root">
    <header class="store-topbar">
      <div class="brand"><div class="logo"></div><strong>Oregon Store</strong></div>
      <div class="search"><input placeholder="Apps suchen …" bind:value={q} aria-label="App-Suche" /></div>
      <nav class="filters">
        <div class="tabs">
          {#each CATS as c}<button class:active={activeCategory===c} on:click={() => activeCategory=c}>{c}</button>{/each}
        </div>
        <select class="sort" bind:value={sortMode} aria-label="Sortieren">
          <option>Beliebt</option><option>Neu</option><option>Rating</option>
        </select>
      </nav>
    </header>
    <section class="grid">
      {#each filteredApps() as app (app.id)}
        <article class="card">
          {#if app.badge}<span class="badge">{app.badge}</span>{/if}
          <div class="row">
            <div class="icon" style={`--accent:${app.color || '#7c8cff'}`}>{app.icon || '🟦'}</div>
            <div class="meta">
              <h3>{app.name}</h3>
              <p class="sub">{app.category} • ★ {app.rating.toFixed(1)}</p>
            </div>
          </div>
          <div class="actions">
            {#if installed[app.id]}
              <button class="primary sm" on:click={() => openApp(app.id)}>Öffnen</button>
              <button class="outline sm" on:click={() => { delete installed[app.id]; saveInstalled(); }}>Deinstallieren</button>
            {:else if installing[app.id]}
              <button class="loading sm" disabled><span class="dot"></span> Lädt… {Math.min(100, (progress[app.id]||0)).toFixed(0)}%</button>
            {:else}
              <button class="primary sm" on:click={() => install(app)}>Installieren {app.price ? `• ${app.price}` : ''}</button>
              <button class="outline sm" on:click={() => alert('Details (Demo)')}>Details</button>
            {/if}
          </div>
        </article>
      {/each}
    </section>
  </section>
{:else}
  {#key activeAppId}
    {@const app = appById(activeAppId)}
    <section class="app-shell">
      <header class="app-titlebar">
        <button class="back" on:click={closeApp} title="Zurück zum Store">←</button>
        <div class="app-head">
          <div class="icon" style={`--accent:${app.color || '#7c8cff'}`}>{app.icon || '🟦'}</div>
          <h2>{app.name}</h2>
        </div>
        <div></div>
      </header>
      <section class="app-body">
        {#if activeAppId==='notes'}
          <section class="notes-wrap">
            <div class="notes-toolbar">
              <button on:click={() => { notes=''; saveNotes(); }}>Leeren</button>
              <button class="primary" on:click={saveNotes}>Speichern</button>
            </div>
            <textarea class="notes-area" bind:value={notes} placeholder="Schreibe Notizen…"></textarea>
          </section>
        {:else if activeAppId==='chat'}
          <section class="chat-wrap">
            <div class="chat-log">
              {#each chat as m (m.id)}<div class="chat-msg {m.who==='du'?'you':'bot'}"><span class="chip {m.who==='du'?'you':'bot'}">{m.text}</span></div>{/each}
            </div>
            <div style="display:flex; gap:8px;">
              <input style="flex:1" placeholder="Nachricht…" bind:value={input} on:keydown={(e)=> e.key==='Enter' && sendChat()} />
              <button class="primary" on:click={sendChat}>Senden</button>
            </div>
          </section>
        {:else if activeAppId==='term'}
          <section class="term-wrap">
              <div class="term-box" on:click|self={() => document.querySelector('.term-input-field')?.focus()}>
                  {#each termOut as line}
                      <div class="term-line">{@html line.replace(/\s/g, '&nbsp;')}</div>
                  {/each}
                  <div class="term-input-line">
                      <span class="term-prompt">{currentUser}@{hostname}:{currentPath}$</span>
                      <input
                          class="term-input-field"
                          bind:value={termIn}
                          on:keydown={handleTermKeyDown}
                          autofocus
                      />
                  </div>
              </div>
          </section>
        {:else if activeAppId==='studio'}
          <section class="studio-wrap">
            <div class="tools">
              <div>Farbe</div>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                {#each ['#7c8cff','#eab308','#22c55e','#06b6d4','#ef4444','#ffffff','#000000'] as c}
                  <div class="color-swatch" style={`background:${c}`} on:click={()=>brush=c} title={c}></div>
                {/each}
              </div>
              <label style="margin-top:10px;">Pixelgröße<input type="range" min="8" max="24" step="2" bind:value={pxSize} /></label>
              <button style="margin-top:8px;" on:click={()=>setupCanvas(canvasEl)}>Neu</button>
            </div>
            <div class="canvas-box">
              <canvas bind:this={canvasEl} on:mousedown={()=>drawing=true} on:mouseup={()=>drawing=false} on:mouseleave={()=>drawing=false} on:mousemove={(e)=>drawing&&paintAt(e)} use:canvasInit />
            </div>
          </section>
        {:else if activeAppId==='arena'}
          <section class="arena-wrap" on:mouseenter={startArena} on:mouseleave={stopArena}>
            <div class="car" style={`--x:${pos}%`}></div>
            <div style="position:absolute; bottom:10px; left:10px; display:flex; gap:8px;">
              <button on:click={()=>{dir=1}}>►</button><button on:click={()=>{dir=-1}}>◄</button>
              <button on:click={()=>{speed=Math.max(1,speed-1)}}>-</button><button on:click={()=>{speed=Math.min(6,speed+1)}}>+</button>
            </div>
          </section>
        {:else if activeAppId==='tasks'}
          <section class="tasks-wrap">
            <div class="tasks-input">
              <input placeholder="Neue Aufgabe…" bind:value={todoInput} on:keydown={(e)=> e.key==='Enter' && addTodo()} />
              <button class="primary" on:click={addTodo}>Hinzufügen</button>
            </div>
            <div class="todo-list">
              {#each todos as t (t.id)}
                <div class="todo-item">
                  <input type="checkbox" bind:checked={t.done} on:change={()=>toggleTodo(t.id)} />
                  <span class:done={t.done}>{t.text}</span>
                  <div style="margin-left:auto;"><button class="outline sm" on:click={()=>delTodo(t.id)}>Löschen</button></div>
                </div>
              {/each}
              {#if !todos.length}<div style="color:var(--muted);">Keine Aufgaben.</div>{/if}
            </div>
          </section>
        {:else if activeAppId==='alarm'}
          <section class="alarm-wrap">
            {#if isAlarmRinging}
              <div class="alarm-ringing-overlay">
                <div class="alarm-ringing-box">
                  <div class="alarm-icon">⏰</div>
                  <h2>Wecker!</h2>
                  <p>Zeit zum Aufstehen.</p>
                  <button class="primary lg" on:click={stopAlarm}>Stopp</button>
                </div>
              </div>
            {/if}
            <div class="clock-display">{currentTime.toLocaleTimeString('de-DE')}</div>
            <div class="alarm-controls">
              <input type="time" bind:value={alarmTime} />
              <button class="primary" on:click={setAlarm}>Stellen</button>
              <button on:click={clearAlarm}>Löschen</button>
            </div>
            <div class="alarm-status">
              {#if isAlarmSet}Wecker gestellt für <strong>{alarmTime}</strong> Uhr.{:else}Kein Wecker gestellt.{/if}
            </div>
          </section>
        {:else if activeAppId==='browser'}
          <section class="browser-wrap">
            <div class="browser-toolbar">
              <button on:click={goBack} disabled={historyIndex === 0}>←</button>
              <button on:click={goForward} disabled={historyIndex >= browserHistory.length - 1}>→</button>
              <button on:click={reload}>⟳</button>
              <input class="address-bar" type="text" placeholder="https://..." bind:value={browserUrl} on:keydown={e => e.key === 'Enter' && navigateTo()} />
              <button class="primary" on:click={navigateTo}>Go</button>
            </div>
            <div class="browser-content">
              <iframe src={iframeSrc} title="Oregon Web" sandbox="allow-scripts allow-same-origin allow-forms" referrerpolicy="no-referrer"></iframe>
            </div>
             <small class="browser-notice">Hinweis: Aus Sicherheitsgründen können viele Webseiten (z.B. Google, YouTube) hier nicht geladen werden.</small>
          </section>
        {:else}
          <div class="placeholder">Diese App hat noch keinen Inhalt.</div>
        {/if}
      </section>
    </section>
  {/key}
{/if}

<style>
  :root {
    --bg: #0d0f16; --panel: #141824; --panel-2: #111522; --border: #242a3a;
    --txt: #e7ebff; --muted: #a9b0c6; --ring: #7c8cff;
  }
  * { box-sizing: border-box; }
  .store-root { display:grid; grid-template-rows:auto 1fr; gap:12px; height:100%; width:100%; padding:14px; background:var(--bg); color:var(--txt); border-radius:16px; }
  .store-topbar { display:grid; grid-template-columns: 1fr 1.1fr auto; align-items:center; gap:10px; }
  .brand { display:flex; align-items:center; gap:8px; }
  .logo { width:18px; height:18px; border-radius:4px; background: linear-gradient(135deg,#7c8cff,#6ee7ff); }
  .search input { width:100%; padding:.7rem .9rem; border-radius:12px; background: var(--panel); border:1px solid var(--border); color: var(--txt); }
  .filters { display:flex; align-items:center; gap:.7rem; }
  .tabs { display:flex; gap:.35rem; overflow:auto; scrollbar-width:none; }
  .tabs::-webkit-scrollbar{ display:none; }
  .tabs button { padding:.45rem .75rem; border-radius:999px; border:1px solid var(--border); background: var(--panel-2); color: var(--txt); }
  .tabs button.active { background:#1a2030; border-color:#2b3550; }
  .sort { padding:.45rem .6rem; border-radius:10px; background: var(--panel-2); border:1px solid var(--border); color: var(--txt); }
  .grid { display:grid; gap:10px; grid-template-columns: repeat( auto-fill, minmax(220px, 1fr) ); }
  .card { position: relative; background: var(--panel); border:1px solid var(--border); border-radius:14px; padding:12px; }
  .badge { position:absolute; top:8px; left:8px; font-size:.7rem; padding:.18rem .45rem; border-radius:999px; background:#1a2030; border:1px solid #2b3550; }
  .row { display:flex; gap:10px; align-items:center; }
  .icon { width:48px; height:48px; border-radius:12px; display:grid; place-items:center; background: color-mix(in oklab, var(--accent, #7c8cff), black 80%); color:white; font-weight:700; }
  .meta h3 { margin:.4rem 0 .1rem; font-size:1rem; }
  .sub { margin:0; color: var(--muted); font-size:.88rem; }
  .actions { margin-top:.6rem; display:flex; gap:.45rem; flex-wrap:wrap; }
  button { cursor:pointer; border:1px solid #2b3550; background:#1a2030; color:var(--txt); padding:.48rem .75rem; border-radius:10px; }
  button.primary { background: var(--accent, #3846ff); border-color:#2b3cff; }
  button.outline { background: transparent; }
  button.sm { padding:.4rem .65rem; font-size:.92rem; }
  button.lg { padding:.6rem 1rem; font-size:1.1rem; }
  .loading .dot { display:inline-block; width:.6em; height:.6em; border-radius:50%; background:#cfd6ff; margin-right:.4em; animation:pulse 1s ease-in-out infinite; vertical-align:middle; }
  @keyframes pulse { 0%,100%{opacity:.4; transform: scale(.9);} 50%{opacity:1; transform: scale(1);} }
  .app-shell { display:grid; grid-template-rows:auto 1fr; height:100%; width:100%; background: var(--bg); border-radius:16px; }
  .app-titlebar { display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:10px; padding:10px 12px; background: var(--panel); border-bottom:1px solid var(--border); border-top-left-radius:16px; border-top-right-radius:16px; }
  .back { border-radius:8px; }
  .app-head { display:flex; align-items:center; gap:8px; }
  .app-head .icon { width:24px; height:24px; border-radius:6px; font-size:.9rem; }
  .app-body { padding:12px; overflow:auto; }
  .placeholder { color:var(--muted); }
  .notes-wrap { display:grid; grid-template-rows:auto 1fr; gap:8px; height:100%; }
  .notes-toolbar { display:flex; gap:8px; }
  .notes-area { width:100%; height:100%; background: var(--panel); border:1px solid var(--border); border-radius:12px; padding:12px; color:var(--txt); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
  .chat-wrap { display:grid; grid-template-rows: 1fr auto; gap:8px; height:100%; }
  .chat-log { background: var(--panel); border:1px solid var(--border); border-radius:12px; padding:10px; overflow:auto; }
  .chat-msg { display:flex; gap:8px; margin-bottom:6px; }
  .chat-msg.you { justify-content:flex-end; }
  .chip { padding:.2rem .5rem; border-radius:999px; font-size:.8rem; color:white; }
  .chip.you { background:#647dee; }
  .chip.bot { background:#50c9c3; }

  .term-wrap { height:100%; }
  .term-box { background:black; color:#aee3a5; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; border-radius:12px; padding:10px; overflow-y:auto; overflow-x:hidden; border:1px solid #2b3550; height:100%; }
  .term-line { white-space: pre-wrap; word-break: break-all; }
  .term-input-line { display: flex; align-items: center; }
  .term-prompt { color: #84e375; margin-right: 8px; white-space: nowrap; }
  .term-input-field { background: transparent; border: none; color: inherit; font-family: inherit; width: 100%; outline: none; padding:0;}

  .studio-wrap { display:grid; grid-template-columns:auto 1fr; gap:12px; }
  .canvas-box { background: var(--panel); border:1px solid var(--border); border-radius:12px; display:grid; place-items:center; padding:12px; }
  .tools { display:grid; gap:8px; align-content:start; }
  .color-swatch { width:28px; height:28px; border-radius:6px; border:1px solid var(--border); cursor:pointer; }
  .arena-wrap { background: var(--panel); border:1px solid var(--border); border-radius:12px; padding:12px; height:360px; position:relative; overflow:hidden; }
  .car { position:absolute; left:var(--x, 50%); top:50%; transform: translate(-50%, -50%); width:60px; height:26px; border-radius:6px; background: linear-gradient(90deg,#a855f7,#7c8cff); }
  .tasks-wrap { display:grid; grid-template-rows:auto 1fr; gap:8px; height:100%; }
  .tasks-input { display:flex; gap:8px; }
  .tasks-input input { flex:1; padding:.6rem .7rem; border-radius:10px; border:1px solid var(--border); background: var(--panel); color: var(--txt); }
  .todo-list { background: var(--panel); border:1px solid var(--border); border-radius:12px; padding:10px; overflow:auto; }
  .todo-item { display:flex; align-items:center; gap:8px; padding:6px 4px; border-bottom:1px dashed #22283a; }
  .todo-item:last-child { border-bottom:none; }
  .todo-item span.done { text-decoration: line-through; color: var(--muted); }
  .alarm-wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; height:100%; text-align:center; position:relative; }
  .clock-display { font-size:3.5rem; font-weight:600; font-family: ui-monospace, monospace; }
  .alarm-controls { display:flex; gap:10px; align-items:center; }
  .alarm-controls input { background:var(--panel); border:1px solid var(--border); color:var(--txt); border-radius:10px; padding:.4rem .6rem; }
  .alarm-status { color:var(--muted); }
  .alarm-ringing-overlay { position:absolute; inset:0; background:rgba(13,15,22,0.8); backdrop-filter:blur(10px); z-index:10; display:grid; place-items:center; }
  .alarm-ringing-box { display:flex; flex-direction:column; align-items:center; gap:10px; background:var(--panel); padding:30px 40px; border-radius:16px; border:1px solid var(--border); }
  .alarm-icon { font-size:3rem; animation: pulse 1s infinite; }
  .browser-wrap { display:grid; grid-template-rows:auto 1fr auto; gap:8px; height:100%; }
  .browser-toolbar { display:flex; gap:8px; align-items:center; }
  .address-bar { flex:1; padding:.6rem .7rem; border-radius:10px; border:1px solid var(--border); background: var(--panel); color: var(--txt); }
  .browser-content { background: var(--panel); border:1px solid var(--border); border-radius:12px; overflow:hidden; }
  .browser-content iframe { width:100%; height:100%; border:none; }
  .browser-notice { color:var(--muted); text-align:center; padding-top:4px; display:block; }
</style>
