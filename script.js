document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Elements ---
    const landingScreen = document.getElementById('landingScreen');
    const launchTerminalBtn = document.getElementById('launchTerminalBtn');
    const terminalWindow = document.getElementById('terminalWindow');
    const terminalOutput = document.getElementById('terminalOutput');
    const commandInput = document.getElementById('commandInput');
    const promptUserElem = document.getElementById('promptUser');
    const promptPathElem = document.getElementById('promptPath');
    const currentYearLandingElem = document.getElementById('currentYearLanding');
    const landingLinksContainer = document.getElementById('landingLinks');
    const terminalCloseBtn = document.getElementById('terminalCloseBtn');

    // --- Configuration ---
    const USERNAME = "idosom";
    const HOSTNAME = "cmd";
    let CURRENT_PATH = "~";

    const commonLinksData = [
        {
            name: "linkedin",
            displayText: "LinkedIn",
            icon: "assets/images/linkedin.png",
            terminalText: "LinkedIn @ Ido Somekh",
            url: "https://www.linkedin.com/in/idosom/"
        },
        {
            name: "github",
            displayText: "GitHub",
            icon: "assets/images/github.png",
            terminalText: "GitHub @ idosom",
            url: "https://github.com/idosom"
        },
        {
            name: "instagram",
            displayText: "Instagram",
            icon: "assets/images/instagram.png",
            terminalText: "Instagram @ ido.png",
            url: "https://www.instagram.com/ido.png"
        },
    ];

    const profileInfo = {
        name: "Ido Somekh",
        title: "Entrepreneur | Developer | Music Enthusiast",
        bio: "Welcome to my terminal. Type 'help' to see available commands.",
        contact: "Find my links using the 'links' or 'ls' command."
    };

    let commandHistory = [];
    let historyIndex = -1;
    let terminalInitialized = false;

    // --- Landing Page Setup ---
    function setupLandingPage() {
        if (!landingScreen || !launchTerminalBtn || !currentYearLandingElem || !landingLinksContainer) {
            console.error("CRITICAL: One or more landing page elements not found. Check IDs.");
            return;
        }

        document.body.classList.add('landing-active');
        currentYearLandingElem.textContent = new Date().getFullYear();

        landingLinksContainer.innerHTML = ''; // Clear any previous links
        commonLinksData.forEach(link => {
            const anchor = document.createElement('a');
            anchor.href = link.url;
            anchor.target = '_blank';
            anchor.rel = 'noopener noreferrer';
            if (link.icon) {
                const img = document.createElement('img');
                img.src = link.icon; // Assuming trusted asset paths
                img.alt = link.displayText;
                anchor.appendChild(img);
            }
            anchor.appendChild(document.createTextNode(link.displayText));
            landingLinksContainer.appendChild(anchor);
        });

        const landingTitle = document.querySelector('.landing-content h1');
        if (landingTitle) landingTitle.textContent = profileInfo.name;
        const landingBio = document.querySelector('.landing-content .landing-bio');
        if (landingBio) landingBio.textContent = profileInfo.title;

        launchTerminalBtn.addEventListener('click', launchTerminal);
    }

    // --- Terminal Logic ---
    function sanitizeText(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    function displayOutput(content, type = '', isHtml = false) {
        const line = document.createElement('div');
        line.classList.add('output-line');
        if (type) line.classList.add(type);
        if (isHtml) line.innerHTML = content;
        else line.textContent = content;
        terminalOutput.appendChild(line);
        scrollToBottom();
    }

    function displayPromptAndCommand(commandStr) {
        const sanitizedCommand = sanitizeText(commandStr);
        const promptHtml =
            `<span class="prompt-user">${USERNAME}@${HOSTNAME}</span>` +
            `:<span class="prompt-path">${CURRENT_PATH}</span>` +
            `<span class="prompt-symbol">$</span> ${sanitizedCommand}`;
        displayOutput(promptHtml, 'command-echo', true);
    }

    function scrollToBottom() {
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    function clearInput() {
        commandInput.value = '';
    }

    function executeCommand(commandStr) {
        displayPromptAndCommand(commandStr);
        if (commandStr.trim() === '') return;
        commandHistory.push(commandStr);
        historyIndex = commandHistory.length;
        const [command, ...args] = commandStr.trim().split(/\s+/);

        switch (command.toLowerCase()) {
            case 'help':
                const helpText =
                    `Available commands:<br>` +
                    `  help             - Show this help message<br>` +
                    `  whoami           - Display user information<br>` +
                    `  links / ls       - List available links<br>` +
                    `  open [link_name] - Open a specific link (e.g., 'open github')<br>` +
                    `  date             - Show current date and time<br>` +
                    `  echo [message]   - Display a line of text<br>` +
                    `  clear / cls      - Clear the terminal screen<br>` +
                    `  motd             - Display the message of the day<br>` +
                    `  exit             - Close the terminal<br>`+
                    `  neofetch         - The classic<br>`;
                displayOutput(helpText, '', true);
                break;
            case 'whoami':
                const whoamiOutput =
                    `User: ${profileInfo.name} (${USERNAME})<br>` +
                    `Title: ${sanitizeText(profileInfo.title)}<br>` +
                    `${sanitizeText(profileInfo.contact)}`;
                displayOutput(whoamiOutput, '', true);
                break;
            case 'links':
            case 'ls':
                if (commonLinksData.length === 0) {
                    displayOutput("No links configured.", "warning");
                    break;
                }
                let linksHtml = "Available links:<br>";
                commonLinksData.forEach(link => {
                    linksHtml += `<span class="link-item-output">`; // No icon in terminal output
                    linksHtml += `<a href="${sanitizeText(link.url)}" target="_blank">${sanitizeText(link.terminalText || link.displayText)}</a></span>`;
                });
                displayOutput(linksHtml, '', true);
                break;
            case 'neofetch':
                const neofetchOutput =
                    `<span class="ctp-mauve">OS:</span> I use Arch BTW<br>` +
                    `<span class="ctp-blue">Uptime:</span> 22 minutes<br>` +
                    `<span class="ctp-green">CPU:</span> Ryzen 7 9700x<br>` +
                    `<span class="ctp-yellow">GPU:</span> RTX 3080<br>` +
                    `<span class="ctp-peach">Resolution:</span> 2560x1440<br>` +
                    `<span class="ctp-pink">WM:</span> Hyprland<br>` +
                    `<span class="ctp-red">Terminal:</span> kitty`;
                displayOutput(neofetchOutput, '', true);
                break;
            case 'open':
                if (args.length === 0) {
                    displayOutput("Usage: open [link_name]<br>Example: open github", "error", true);
                    break;
                }
                const linkNameToOpen = args[0].toLowerCase();
                const linkToOpen = commonLinksData.find(l => l.name.toLowerCase() === linkNameToOpen);
                if (linkToOpen) {
                    displayOutput(`Opening ${sanitizeText(linkToOpen.terminalText || linkToOpen.displayText)}...`, "success");
                    window.open(linkToOpen.url, '_blank');
                } else {
                    displayOutput(`Link '${sanitizeText(linkNameToOpen)}' not found. Type 'links' to see available links.`, "error");
                }
                break;
            case 'date': displayOutput(new Date().toString()); break;
            case 'echo': displayOutput(args.join(' ')); break;
            case 'clear': case 'cls': terminalOutput.innerHTML = ''; break;
            case 'motd': welcomeMessage(); break;
            case 'exit':
                closeTerminal();
                break;
            case 'repo': displayOutput('Repository link not configured.', 'warning'); break;
            default:
                displayOutput(`command not found: ${sanitizeText(command)}. Type 'help' or 'exit'.`, "error");
        }
    }

    function initializeTerminal() {
        if (terminalInitialized) {
            commandInput.focus(); // Just re-focus if already set up
            return;
        }
        if (!commandInput || !terminalWindow || !promptUserElem || !promptPathElem || !terminalCloseBtn) {
            console.error("CRITICAL: One or more terminal elements not found during initialization. Check IDs.");
            return;
        }

        promptUserElem.textContent = USERNAME + "@" + HOSTNAME;
        promptPathElem.textContent = CURRENT_PATH;

        commandInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const commandStr = commandInput.value;
                executeCommand(commandStr);
                clearInput();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (commandHistory.length > 0 && historyIndex > 0) {
                    historyIndex--;
                    commandInput.value = commandHistory[historyIndex];
                    commandInput.setSelectionRange(commandInput.value.length, commandInput.value.length);
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    commandInput.value = commandHistory[historyIndex];
                    commandInput.setSelectionRange(commandInput.value.length, commandInput.value.length);
                } else if (historyIndex === commandHistory.length - 1) {
                    historyIndex++;
                    clearInput();
                }
            }
        });

        terminalWindow.addEventListener('click', function(event) {
            // Prevent clicks on the close button from focusing the input
            if (event.target !== terminalCloseBtn && terminalCloseBtn && !terminalCloseBtn.contains(event.target)) {
                 commandInput.focus();
            }
        });

        terminalCloseBtn.addEventListener('click', closeTerminal);

        welcomeMessage();
        commandInput.focus();
        terminalInitialized = true;
    }

    function welcomeMessage() {
        displayOutput(`Catppuccin Mocha Terminal :: ${sanitizeText(profileInfo.name)}`, "info");
        displayOutput(`Type 'help' for a list of commands.`, "info");
        displayOutput(sanitizeText(profileInfo.bio));
        displayOutput(`Current time: ${new Date().toLocaleTimeString()}<br>`, "subtext0", true);
    }

    function launchTerminal() {
        if (!landingScreen || !terminalWindow) {
            console.error("CRITICAL: Cannot launch terminal - landingScreen or terminalWindow element missing.");
            return;
        }
        landingScreen.classList.add('fade-out');
        document.body.classList.remove('landing-active');

        terminalWindow.classList.remove('hidden');
        // Force a reflow before adding 'visible' class to ensure transition plays
        void terminalWindow.offsetWidth;
        setTimeout(() => { // Using setTimeout ensures it's in the next tick
            terminalWindow.classList.add('visible');
        }, 0); // Minimal delay, often 0 or 20ms works

        setTimeout(() => {
            initializeTerminal();
        }, 300); // Allow animation to start before focusing
    }

    function closeTerminal() {
        if (!terminalWindow || !landingScreen) {
            console.error("CRITICAL: Cannot close terminal - terminalWindow or landingScreen element missing.");
            return;
        }
        terminalWindow.classList.remove('visible');
        // Add 'hidden' back after animation for proper state reset
        setTimeout(() => {
            terminalWindow.classList.add('hidden');
        }, 600); // Should match or exceed CSS transition duration for transform/opacity

        landingScreen.classList.remove('fade-out');
        document.body.classList.add('landing-active');
    }

    // --- Initial Setup ---
    setupLandingPage();
});