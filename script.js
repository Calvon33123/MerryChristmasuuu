// =====================================================================
// 🛠️ EDITABLE GAME CONFIGURATION DATA
// You can change suspect names, target person, photo paths/URLs,
// clues, and messages directly in this object!
// =====================================================================
const gameData = {
    // Target Person (Must match one of the suspect names exactly)
    targetPerson: "Jas",
    
    // Editable List of 12 Suspects with image paths/URLs
    // You can replace "assets/images/..." with local file paths or web image URLs!
    suspects: [
        { id: "01", name: "Ate Irene", image: "assets/images/ate_irene.jpg" },
        { id: "02", name: "Monique",   image: "assets/images/monique.jpg" },
        { id: "03", name: "Bitoy",     image: "assets/images/bitoy.jpg" },
        { id: "04", name: "Marky",      image: "assets/images/mark.jpg" },
        { id: "05", name: "Paye",      image: "assets/images/paye.jpg" },
        { id: "06", name: "Jaycool",   image: "assets/images/jaycool.jpg" },
        { id: "07", name: "Jas",       image: "assets/images/jas.jpg" },
        { id: "08", name: "Nikol",     image: "assets/images/nikol.jpg" },
        { id: "09", name: "Khyra",     image: "assets/images/khyra.jpg" },
        { id: "10", name: "Rayven",    image: "assets/images/rayven.jpg" },
        { id: "11", name: "Chad",      image: "assets/images/chad.jpg" },
        { id: "12", name: "Reanne",    image: "assets/images/reanne.jpg" }
    ],
    
    // 6 Distinct Clues
    clues: [
        {
            title: "The Super Hero Profile",
            type: "dossier",
            text: "Personality Dossier: The Super Hero is known for being outgoing, active, and an avid drinker!"
        },
        {
            title: "The Coded Envelope",
            type: "cipher",
            text: "Decrypted Intel: Legal Age!"
        },
        {
            title: "The Nostalgic Photo",
            type: "photo",
            text: "Behind the polaroid photo, a handwritten note reads: 'The Super Hero has a Sibling'"
        },
        {
            title: "The Hidden Golden Bauble",
            type: "hidden",
            text: "Golden Ornament Note: The Super Hero's name has the letter 'A'!"
        },
        {
            title: "The Odd Ornament Out",
            type: "odd_one",
            text: "Elimination Intel: Cross-referencing Jaycool... Jaycool is cleared of primary suspicion!"
        },
        {
            title: "Santa's Vault Sequence",
            type: "vault",
            text: "Vault Decrypted! Final Evidence: The Super Hero I drew is the same as last year! 🎁"
        }
    ],

    // Target vault code buttons index (0: Red, 1: Gold, 2: Green, 3: Blue)
    vaultTargetSequence: [0, 2, 1, 3],

    // Final Secret Reveal Message
    finalMessage: "Looks like you figured it out... Now you know kung kinsa ako nabunutan 🎁🎄 Merry Christmas Jas, Mery Christmas! also to Everybody! I wish us all good health and continue to spread joy and alcohol throughout the year! Also imong gift kay naa sud aning unsa bani. Ang yawi kay naa ra ani nila nga daghan kaayo ug yawi.... Usa ray mo gana ani... Good luck!"
};
// =====================================================================

let unlockedClues = new Set();
let soundEnabled = true;
let audioCtx = null;
let vaultUserInputs = [];

document.addEventListener('DOMContentLoaded', () => {
    createSnow();
    setupAudioToggle();
    
    // Set reveal elements
    document.getElementById('reveal-name').textContent = gameData.targetPerson.toUpperCase();
    document.getElementById('reveal-message').textContent = gameData.finalMessage;
});

function navigate(viewId) {
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');
    playSynthSound(440, 'sine', 0.1);
    window.scrollTo(0,0);
}

function initDashboard() {
    navigate('dashboard');
    
    // Render Suspects Grid
    const grid = document.getElementById('suspects-grid');
    grid.innerHTML = '';
    
    gameData.suspects.forEach((suspect) => {
        const card = document.createElement('div');
        card.className = "glass-panel p-2.5 flex flex-col items-center text-center rounded-lg hover:border-yellow-500/50 transition cursor-pointer group";
        
        // Generates automatic placeholder if image path fails or doesn't exist
        const fallbackUrl = `https://placehold.co/120x120/1e293b/d4af37?text=${encodeURIComponent(suspect.name)}`;

        card.innerHTML = `
            <div class="w-12 h-12 rounded-full overflow-hidden border border-yellow-500/40 bg-slate-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition shadow-inner">
                <img src="${suspect.image}" alt="${suspect.name}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='${fallbackUrl}';">
            </div>
            <div class="text-[10px] text-red-400 font-typewriter">SUSPECT #${suspect.id}</div>
            <div class="font-bold text-xs text-gray-200 truncate w-full mt-0.5">${suspect.name}</div>
            <div class="text-[9px] text-gray-500 font-typewriter mt-0.5">STATUS: UNKNOWN</div>
        `;
        card.onclick = () => showSuspectProfile(suspect);
        grid.appendChild(card);
    });

    // Show the hidden picture after a short delay, in a different safe spot each time.
    setTimeout(() => {
        const hiddenEl = document.getElementById('hidden-ornament');
        if (hiddenEl && !unlockedClues.has(3)) {
            placeHiddenPictureSafely(hiddenEl);
            hiddenEl.classList.remove('hidden');
        }
    }, 1500);
}

function placeHiddenPictureSafely(hiddenEl) {
    const margin = 12;
    const size = 23;
    const maxX = Math.max(margin, window.innerWidth - size - margin);
    const maxY = Math.max(margin, window.innerHeight - size - margin);
    const candidates = [];

    // Try random viewport positions; candidates are tested against visible panels and controls.
    for (let i = 0; i < 90; i++) {
        candidates.push({
            x: margin + Math.random() * Math.max(1, maxX - margin),
            y: margin + Math.random() * Math.max(1, maxY - margin)
        });
    }

    // Prefer edges and corners, which are less likely to cover the actual puzzle content.
    candidates.push(
        { x: margin, y: margin },
        { x: maxX, y: margin },
        { x: margin, y: maxY },
        { x: maxX, y: maxY },
        { x: maxX, y: maxY / 2 },
        { x: margin, y: maxY / 2 },
        { x: maxX / 2, y: margin },
        { x: maxX / 2, y: maxY }
    );

    // Shuffle so the first safe location is not predictable.
    for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    const blockers = Array.from(document.querySelectorAll(
        '.glass-panel, button:not(#hidden-ornament), input, select, textarea, a, [role="button"]'
    )).filter(el => el !== hiddenEl && el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden');

    const safe = candidates.find(pos => {
        const rect = { left: pos.x, top: pos.y, right: pos.x + size, bottom: pos.y + size };
        return !blockers.some(el => {
            const b = el.getBoundingClientRect();
            return rect.left < b.right && rect.right > b.left && rect.top < b.bottom && rect.bottom > b.top;
        });
    });

    const chosen = safe || candidates[0] || { x: margin, y: margin };
    hiddenEl.style.left = `${Math.max(margin, Math.min(chosen.x, maxX))}px`;
    hiddenEl.style.top = `${Math.max(margin, Math.min(chosen.y, maxY))}px`;
    hiddenEl.style.right = 'auto';
    hiddenEl.style.bottom = 'auto';
}

window.addEventListener('resize', () => {
    const hiddenEl = document.getElementById('hidden-ornament');
    if (hiddenEl && !hiddenEl.classList.contains('hidden') && hiddenEl.style.display !== 'none') {
        placeHiddenPictureSafely(hiddenEl);
    }
});

function showSuspectProfile(suspect) {
    playSynthSound(523.25, 'triangle', 0.1);
    const fallbackUrl = `https://placehold.co/150x150/1e293b/d4af37?text=${encodeURIComponent(suspect.name)}`;

    showModal(`Suspect #${suspect.id}: ${suspect.name}`, `
        <div class="flex items-center gap-4 border-b border-gray-700 pb-3 mb-3">
            <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-500 bg-slate-800 flex-shrink-0">
                <img src="${suspect.image}" alt="${suspect.name}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='${fallbackUrl}';">
            </div>
            <div>
                <p class="text-base font-bold text-white">${suspect.name}</p>
                <p class="text-xs text-red-400 font-typewriter">STATUS: UNDER INVESTIGATION</p>
                <p class="text-[10px] text-gray-400 font-typewriter mt-1">Photo: ${suspect.image}</p>
            </div>
        </div>
        <p class="text-xs">Cross-reference this suspect with the 6 Active Leads on the case board to determine if they match the evidence.</p>
    `, [{ text: "Close Dossier", action: "closeModal()", primary: true }]);
}

function openTask(taskId) {
    if (unlockedClues.has(taskId)) {
        showModal("Lead Already Resolved", "You have already extracted this clue. Check your Evidence Board.", [{ text: "Understood", action: "closeModal()", primary: true }]);
        return;
    }

    playSynthSound(600, 'sine', 0.1);

    if (taskId === 0) {
        // Lead 1: Multiple-select question. All three selected answers are required.
        showModal("LEAD #01: Programming Language Clue", `
            <div class="bg-slate-900 border border-gray-700 p-4 rounded-lg font-typewriter text-sm text-gray-300 space-y-4">
                <p class="text-yellow-400 font-bold">CONFIDENTIAL DOSSIER #01</p>
                <p class="text-white font-bold text-base">What type of programming language did I use?</p>
                <p class="text-xs text-gray-400">Select all answers that apply.</p>
                <div class="space-y-3" id="lead1-options">
                    <label class="flex items-center gap-3 p-3 rounded-lg border border-gray-700 hover:border-yellow-500 cursor-pointer"><input class="accent-yellow-500 w-4 h-4" type="checkbox" value="CCS"> <span>CCS</span></label>
                    <label class="flex items-center gap-3 p-3 rounded-lg border border-gray-700 hover:border-yellow-500 cursor-pointer"><input class="accent-yellow-500 w-4 h-4" type="checkbox" value="HTML"> <span>HTML</span></label>
                    <label class="flex items-center gap-3 p-3 rounded-lg border border-gray-700 hover:border-yellow-500 cursor-pointer"><input class="accent-yellow-500 w-4 h-4" type="checkbox" value="JavaScript"> <span>JavaScript</span></label>
                    <label class="flex items-center gap-3 p-3 rounded-lg border border-gray-700 hover:border-yellow-500 cursor-pointer"><input class="accent-yellow-500 w-4 h-4" type="checkbox" value="Python"> <span>Python</span></label>
                </div>
                <p id="lead1-feedback" class="text-xs text-gray-400" aria-live="polite">Choose your answers, then submit to reveal the clue.</p>
            </div>
        `, [{ text: "Submit Answers", action: `checkLead1Answers()`, primary: true }]);
    }
    else if (taskId === 1) {
        // Lead 2: identify the alternate gaming username.
        showModal("LEAD #02: Gamer Identity Check", `
            <div class="bg-slate-950 border border-yellow-500/30 rounded-xl p-4 sm:p-5 space-y-4">
                <p class="text-yellow-400 text-xs font-typewriter">IDENTIFICATION REQUIRED</p>
                <p class="text-white font-bold text-base leading-relaxed">What is my other username I use in game other than Calvin33123 (created it when my hair was very short)?</p>
                <label for="lead2-answer" class="block text-xs text-gray-400">Enter the username</label>
                <input id="lead2-answer" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Type username here" class="w-full min-w-0 rounded-lg border border-gray-600 bg-slate-900 px-3 py-3 text-base text-white outline-none focus:border-yellow-400" />
                <p id="lead2-feedback" class="text-xs text-gray-400" aria-live="polite">One username. Check the spelling carefully.</p>
            </div>
        `, [{ text: "Verify Identity", action: "checkLead2Answer()", primary: true }]);
    }
    else if (taskId === 2) {
        // Lead 3: Polaroid Photo Flip
      showModal("LEAD #03: The Nostalgic Photo", `
    <p class="text-xs text-gray-400 mb-3">Click the polaroid photo below to flip it over and inspect the handwritten note on the back:</p>
    <div class="flip-card w-48 h-56 mx-auto cursor-pointer" onclick="this.classList.toggle('flipped'); playSynthSound(700, 'sine', 0.1);">
        <div class="flip-card-inner w-full h-full transition-transform duration-500">
            <!-- FRONT SIDE (Shows first with your photo) -->
            <div class="flip-card-front bg-slate-900 border-2 border-yellow-500/40 rounded-lg p-3 text-center flex flex-col items-center justify-between shadow-xl bg-cover bg-center overflow-hidden" style="background-image: url('assets/images/2025.jpg');">
                <div class="bg-black/40 w-full h-full absolute inset-0 -z-10"></div>
                <div class="text-3xl mt-1">📸</div>
                <div class="font-typewriter text-xs text-amber-200 font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Christmas Memory 2024</div>
                <div class="text-[10px] text-amber-100/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] mb-1">[Click to Flip]</div>
            </div>
            
            <!-- BACK SIDE (Shows when flipped - The Handwritten Note) -->
            <div class="flip-card-back bg-amber-50 text-slate-900 rounded-lg p-4 flex flex-col justify-between shadow-xl">
                <div class="font-handwriting text-lg text-red-800 font-bold leading-tight">
                    "The Super Hero has a Sibling!"
                </div>
                <div class="text-[10px] font-typewriter text-gray-500 text-right">- Secret Detective</div>
            </div>
        </div>
    </div>
`, [{ text: "Log Clue Evidence", action: `solveTask(2)`, primary: true }]);
    }
    else if (taskId === 4) {
        // Lead 5: Arrange all seven shuffled build-step cards into the timeline.
        showModal("LEAD #05: The Odd Ornament Out", `
            <div class="space-y-3">
                <p class="text-sm text-gray-200">The workshop timeline has been scrambled. Drag all seven step cards into the numbered spaces to reconstruct a sensible PC build sequence.</p>
                <p class="text-xs text-gray-400">Hold a card and move it with your mouse or finger. A floating preview follows your pointer. You may place cards in different valid orders where the dependencies allow it; this is not a single memorized sequence.</p>
                <div class="rounded-lg border border-yellow-500/25 bg-slate-950/70 p-3 space-y-2">
                    <p class="text-xs uppercase tracking-widest text-yellow-300 font-bold">Workshop Timeline</p>
                    <div class="lead5-slot-row"><span class="step-number">1</span><button type="button" class="lead5-slot" data-slot="1">Drop a step here</button></div>
                    <div class="lead5-slot-row"><span class="step-number">2</span><button type="button" class="lead5-slot" data-slot="2">Drop a step here</button></div>
                    <div class="lead5-slot-row"><span class="step-number">3</span><button type="button" class="lead5-slot" data-slot="3">Drop a step here</button></div>
                    <div class="lead5-slot-row"><span class="step-number">4</span><button type="button" class="lead5-slot" data-slot="4">Drop a step here</button></div>
                    <div class="lead5-slot-row"><span class="step-number">5</span><button type="button" class="lead5-slot" data-slot="5">Drop a step here</button></div>
                    <div class="lead5-slot-row"><span class="step-number">6</span><button type="button" class="lead5-slot" data-slot="6">Drop a step here</button></div>
                    <div class="lead5-slot-row"><span class="step-number">7</span><button type="button" class="lead5-slot" data-slot="7">Drop a step here</button></div>
                </div>
                <div class="space-y-2">
                    <p class="text-xs uppercase tracking-widest text-sky-200 font-bold">Scrambled Step Cards</p>
                    <div id="lead5-card-bank" class="lead5-card-bank">
                        <button type="button" class="lead5-card" data-step="gpu"><span class="lead5-grip">⠿</span> Seat the graphics card in the PCIe slot and connect its power cable</button>
                        <button type="button" class="lead5-card" data-step="storage"><span class="lead5-grip">⠿</span> Install the SSD or other storage drive</button>
                        <button type="button" class="lead5-card" data-step="ram"><span class="lead5-grip">⠿</span> Install the RAM into the motherboard</button>
                        <button type="button" class="lead5-card" data-step="cooler"><span class="lead5-grip">⠿</span> Attach the CPU cooler and connect its fan</button>
                        <button type="button" class="lead5-card" data-step="cpu"><span class="lead5-grip">⠿</span> Install the CPU into the motherboard</button>
                        <button type="button" class="lead5-card" data-step="psu"><span class="lead5-grip">⠿</span> Install the power supply and connect power cables</button>
                        <button type="button" class="lead5-card" data-step="case"><span class="lead5-grip">⠿</span> Mount the motherboard in the case</button>
                    </div>
                </div>
                <div class="rounded-lg border border-sky-400/20 bg-sky-950/30 p-3 space-y-1"><p class="text-xs font-bold text-sky-200">Evidence notes</p><p class="text-xs text-gray-300">• The CPU must be installed before its cooler.</p><p class="text-xs text-gray-300">• CPU and RAM installation should happen before mounting the motherboard in the case.</p><p class="text-xs text-gray-300">• The motherboard should be mounted and the PSU installed before the graphics card is fitted and powered.</p><p class="text-xs text-gray-400">• Storage and power-cable work can vary by case and hardware. Use the clues to reason about dependencies rather than guessing one universal order.</p></div>
                <p id="lead5-feedback" class="text-xs text-gray-400" aria-live="polite">Place all seven cards to complete the timeline. Tap a filled space to return its card and try another arrangement.</p>
            </div>
        `, [{ text: "Check Timeline", action: "checkPCBuildOrder()", primary: true }]);
        enableLead5CardDragging();
    }
    else if (taskId === 5) {
        // Lead 6: Players choose a month and year using calendar-style selectors.
        showModal("LEAD #06: The Timeline File", `
            <div class="bg-slate-950 border border-yellow-500/30 rounded-xl p-4 sm:p-5 space-y-4">
                <p class="text-yellow-400 text-xs font-typewriter">PERSONAL TIMELINE — RESTRICTED</p>
                <p class="text-white font-bold text-base">When was the last Situationship I had?</p>
                <div class="lead6-calendar">
                    <div class="lead6-calendar-heading"><span>📅</span><span>SELECT THE MONTH AND YEAR</span></div>
                    <div class="lead6-date-fields">
                        <label class="lead6-field">
                            <span>MONTH</span>
                            <select id="lead6-month" aria-label="Choose a month">
                                <option value="">Choose month</option>
                                ${Array.from({length: 12}, (_, i) => `<option value="${i + 1}">${new Date(2000, i).toLocaleString('en', {month: 'long'})}</option>`).join('')}
                            </select>
                        </label>
                        <label class="lead6-field">
                            <span>YEAR</span>
                            <select id="lead6-year" aria-label="Choose a year">
                                <option value="">Choose year</option>
                                ${Array.from({length: 9}, (_, i) => 2018 + i).map(year => `<option value="${year}">${year}</option>`).join('')}
                            </select>
                        </label>
                    </div>
                    <div class="lead6-selected-date" id="lead6-selected-date">No date selected</div>
                </div>
                <p id="lead6-feedback" class="text-xs text-gray-400" aria-live="polite">Select the month and year, then confirm your answer.</p>
            </div>
        `, [{ text: "Confirm Answer", action: "checkLead6Answer()", primary: true }]);
        const monthSelect = document.getElementById('lead6-month');
        const yearSelect = document.getElementById('lead6-year');
        const selectedDate = document.getElementById('lead6-selected-date');
        const updateLead6Date = () => {
            if (!selectedDate) return;
            selectedDate.textContent = monthSelect.value && yearSelect.value
                ? `${monthSelect.options[monthSelect.selectedIndex].text} ${yearSelect.value}`
                : 'No date selected';
        };
        monthSelect?.addEventListener('change', updateLead6Date);
        yearSelect?.addEventListener('change', updateLead6Date);
    }

}

function runCipher() {
    playSynthSound(800, 'square', 0.05);
    const btn = document.getElementById('btn-decrypt');
    if (btn) btn.disabled = true;
    
    const progress = document.getElementById('decrypt-progress');
    if (progress) progress.classList.remove('hidden');
    
    const textEl = document.getElementById('cipher-text');
    let interval = setInterval(() => {
        let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789🎄🎁🔔";
        let randomStr = "";
        for(let i=0; i<10; i++) randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
        if (textEl) textEl.textContent = randomStr;
        playSynthSound(600 + Math.random()*300, 'square', 0.02);
    }, 50);

    setTimeout(() => {
        const bar = document.getElementById('decrypt-bar');
        if (bar) bar.style.width = '100%';
    }, 10);

    setTimeout(() => {
        clearInterval(interval);
        if (textEl) {
            textEl.textContent = "DECRYPTED: Legal Age!";
            textEl.classList.replace('text-green-400', 'text-yellow-400');
        }
        playSynthSound(1000, 'sine', 0.3);
        setTimeout(() => solveTask(1), 700);
    }, 1400);
}

function wrongOddOne() {
    playSynthSound(150, 'sawtooth', 0.2);
    const title = document.getElementById('modal-title');
    if (title) {
        title.textContent = "Incorrect Item Selected";
        title.classList.replace('text-yellow-400', 'text-red-500');
        setTimeout(() => {
            title.textContent = "LEAD #05: The Odd Ornament Out";
            title.classList.replace('text-red-500', 'text-yellow-400');
        }, 1000);
    }
}

function pressVaultBtn(colorIndex) {
    playSynthSound(400 + colorIndex * 150, 'sine', 0.15);
    vaultUserInputs.push(colorIndex);
    
    const status = document.getElementById('vault-status');
    if (status) status.textContent = `Buttons pressed: ${vaultUserInputs.length} / 4`;

    if (vaultUserInputs.length === 4) {
        const isCorrect = vaultUserInputs.every((val, idx) => val === gameData.vaultTargetSequence[idx]);
        if (isCorrect) {
            playSynthSound(1200, 'sine', 0.3);
            if (status) status.textContent = "VAULT OPENED SUCCESSFULLY!";
            setTimeout(() => solveTask(5), 600);
        } else {
            playSynthSound(180, 'sawtooth', 0.3);
            if (status) {
                status.textContent = "INCORRECT SEQUENCE! Resetting...";
                status.className = "text-center font-typewriter text-xs text-red-400 mt-2";
            }
            vaultUserInputs = [];
            setTimeout(() => {
                if (status) {
                    status.textContent = "Buttons pressed: 0 / 4";
                    status.className = "text-center font-typewriter text-xs text-gray-400 mt-2";
                }
            }, 1200);
        }
    }
}

function checkLead2Answer() {
    const input = document.getElementById('lead2-answer');
    const feedback = document.getElementById('lead2-feedback');
    if (!input || input.value.trim().toLowerCase() !== 'calvon33123') {
        if (feedback) { feedback.textContent = 'Identity not matched. Try again.'; feedback.className = 'text-xs text-red-400'; }
        playSynthSound(180, 'sawtooth', 0.2);
        return;
    }
    playSynthSound(900, 'sine', 0.2);
    showModal('LEAD #02: Identity Confirmed', '<div class="border-l-4 border-yellow-500 bg-yellow-500/10 p-4 rounded-r"><p class="text-yellow-400 font-bold">USERNAME IDENTIFIED</p><p class="text-white mt-2">The username matches. Clue logged.</p></div>', [{ text: 'Log Clue Evidence', action: 'solveTask(1)', primary: true }]);
}

function enableLead5CardDragging() {
    const bank = document.getElementById('lead5-card-bank');
    if (!bank || bank.dataset.dragReady === 'true') return;
    bank.dataset.dragReady = 'true';
    let card = null, ghost = null, pointerId = null, offsetX = 0, offsetY = 0;
    let moveFrame = 0, latestX = 0, latestY = 0, cachedSlotRects = [];
    const slots = Array.from(document.querySelectorAll('.lead5-slot'));
    const cacheSlotRects = () => { cachedSlotRects = slots.map(slot => ({ slot, rect: slot.getBoundingClientRect() })); };

    const resetPreview = () => {
        if (moveFrame) cancelAnimationFrame(moveFrame);
        moveFrame = 0;
        if (ghost) ghost.remove();
        ghost = null; card = null; pointerId = null; cachedSlotRects = [];
        slots.forEach(slot => slot.classList.remove('lead5-slot-hover'));
    };
    const slotAt = (x, y) => {
        const hit = cachedSlotRects.find(({ rect }) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);
        return hit ? hit.slot : null;
    };
    const placeCard = (target) => {
        if (!card || !target) return;
        const step = card.dataset.step;
        const previousStep = target.dataset.filled;
        if (previousStep) {
            const previousCard = bank.querySelector(`[data-step="${previousStep}"]`);
            if (previousCard) previousCard.hidden = false;
        }
        target.dataset.filled = step;
        target.replaceChildren();
        const grip = document.createElement('span');
        grip.className = 'lead5-grip'; grip.textContent = '⠿';
        const label = document.createElement('span');
        label.textContent = card.textContent.replace(/^⠿\s*/, '');
        target.append(grip, label);
        target.classList.add('filled');
        card.hidden = true;
        const feedback = document.getElementById('lead5-feedback');
        if (feedback) { feedback.textContent = 'Card placed. You can move another card here to change your choice.'; feedback.className = 'text-xs text-gray-400'; }
    };
    bank.querySelectorAll('.lead5-card').forEach(item => {
        item.addEventListener('pointerdown', event => {
            if (event.button !== undefined && event.button !== 0) return;
            event.preventDefault();
            card = item; pointerId = event.pointerId;
            const rect = item.getBoundingClientRect();
            offsetX = Math.min(rect.width, Math.max(0, event.clientX - rect.left));
            offsetY = Math.min(rect.height, Math.max(0, event.clientY - rect.top));
            cacheSlotRects();
            ghost = item.cloneNode(true);
            ghost.classList.add('lead5-card-ghost');
            // Freeze both dimensions to the original card; do not inherit 100% height from the grid.
            Object.assign(ghost.style, {
                boxSizing: 'border-box', width: `${rect.width}px`, height: `${rect.height}px`,
                '--drag-card-width': `${rect.width}px`, '--drag-card-height': `${rect.height}px`,
                minHeight: '0', maxHeight: 'none',
                left: `${rect.left}px`, top: `${rect.top}px`, margin: '0',
                flex: 'none', transform: 'translateZ(0)'
            });
            document.body.appendChild(ghost);
            item.classList.add('lead5-card-picked');
        });
    });
    document.addEventListener('pointermove', event => {
        if (!card || event.pointerId !== pointerId || !ghost) return;
        event.preventDefault(); latestX = event.clientX; latestY = event.clientY;
        if (moveFrame) return;
        moveFrame = requestAnimationFrame(() => {
            moveFrame = 0;
            if (!ghost || !card) return;
            ghost.style.left = `${latestX - offsetX}px`;
            ghost.style.top = `${latestY - offsetY}px`;
            const target = slotAt(latestX, latestY);
            slots.forEach(slot => slot.classList.toggle('lead5-slot-hover', slot === target));
        });
    }, { passive: false });
    document.addEventListener('pointerup', event => {
        if (!card || event.pointerId !== pointerId) return;
        const target = slotAt(event.clientX, event.clientY);
        const picked = card;
        if (target) placeCard(target);
        picked.classList.remove('lead5-card-picked');
        resetPreview();
    });
    document.addEventListener('pointercancel', event => {
        if (card && event.pointerId === pointerId) { card.classList.remove('lead5-card-picked'); resetPreview(); }
    });
    slots.forEach(slot => slot.addEventListener('click', () => {
        const step = slot.dataset.filled;
        if (!step) return;
        const oldCard = bank.querySelector(`[data-step="${step}"]`);
        if (oldCard) oldCard.hidden = false;
        delete slot.dataset.filled;
        slot.textContent = 'Drop a step here';
        slot.classList.remove('filled');
    }));
}
function checkPCBuildOrder() {
    const slots = Array.from(document.querySelectorAll('.lead5-slot'));
    const feedback = document.getElementById('lead5-feedback');
    const values = slots.map(slot => slot.dataset.filled || '');
    const allCardsUsed = values.length === 7 && values.every(Boolean) && Array.from(document.querySelectorAll('#lead5-card-bank .lead5-card')).every(card => card.hidden);
    if (!allCardsUsed) {
        if (feedback) { feedback.textContent = 'There are still empty spaces. Place all seven cards, then check your timeline.'; feedback.className = 'text-xs text-amber-300'; }
        playSynthSound(180, 'sawtooth', 0.2);
        return;
    }
    // Check realistic dependencies instead of a short hard-coded list of sequences.
    // CPU must precede cooler; CPU and RAM precede motherboard installation;
    // motherboard and PSU precede GPU installation. Storage can be installed at
    // several points depending on the case, drive type, and builder's workflow.
    const stepNumber = { cpu: '1', ram: '2', cooler: '3', case: '4', storage: '5', psu: '6', gpu: '7' };
    const positions = Object.fromEntries(values.map((step, index) => [step, index]));
    const before = (a, b) => positions[a] < positions[b];
    const valid = before('cpu', 'cooler') &&
        before('cpu', 'case') && before('ram', 'case') &&
        before('case', 'gpu') && before('psu', 'gpu');
    if (!valid) {
        if (feedback) { feedback.textContent = 'That order misses an important build dependency. The CPU comes before its cooler; CPU and RAM come before mounting the motherboard; and the motherboard and PSU must be in place before the graphics card. Storage can move around. Try again.'; feedback.className = 'text-xs text-amber-300'; }
        playSynthSound(180, 'sawtooth', 0.2);
        return;
    }
    playSynthSound(900, 'sine', 0.2);
    showModal('LEAD #05: Sequence Verified', '<div class="border-l-4 border-yellow-500 bg-yellow-500/10 p-4 rounded-r"><p class="text-yellow-400 font-bold">BUILD SEQUENCE ACCEPTED</p><p class="text-white mt-2">You reconstructed the workshop timeline while respecting the important hardware dependencies. Independent steps were allowed to change order. Clue logged.</p></div>', [{ text: 'Log Clue Evidence', action: 'solveTask(4)', primary: true }]);
}

function checkLead6Answer() {
    const month = document.getElementById('lead6-month')?.value;
    const year = document.getElementById('lead6-year')?.value;
    const feedback = document.getElementById('lead6-feedback');
    if (!month || !year) {
        if (feedback) { feedback.textContent = 'Select both a month and a year first.'; feedback.className = 'text-xs text-red-400'; }
        playSynthSound(180, 'sawtooth', 0.2);
        return;
    }
    if (month !== '10' || year !== '2025') {
        if (feedback) { feedback.textContent = 'That date is not the correct match. Check the timeline and try again.'; feedback.className = 'text-xs text-red-400'; }
        playSynthSound(180, 'sawtooth', 0.2);
        return;
    }
    playSynthSound(900, 'sine', 0.2);
    showModal('LEAD #06: Timeline Confirmed', '<div class="border-l-4 border-yellow-500 bg-yellow-500/10 p-4 rounded-r"><p class="text-yellow-400 font-bold">DATE VERIFIED</p><p class="text-white mt-2">October 2025 is the correct answer. Clue logged.</p></div>', [{ text: 'Log Clue Evidence', action: 'solveTask(5)', primary: true }]);
}

function checkLead1Answers() {
    const selected = Array.from(document.querySelectorAll('#lead1-options input[type="checkbox"]:checked')).map(input => input.value);
    const required = ['CCS', 'HTML', 'JavaScript'];
    const feedback = document.getElementById('lead1-feedback');
    const isCorrect = selected.length === required.length && required.every(answer => selected.includes(answer));

    if (!isCorrect) {
        playSynthSound(180, 'sawtooth', 0.2);
        if (feedback) {
            feedback.textContent = selected.length === 0 ? 'Select your answers before submitting.' : 'Not quite. Check your choices and try again.';
            feedback.className = 'text-xs text-red-400';
        }
        return;
    }

    playSynthSound(900, 'sine', 0.2);
    showModal('LEAD #01: Clue Unlocked', `
        <div class="bg-slate-900 border border-yellow-500/50 p-4 rounded-lg font-typewriter text-sm text-gray-300 space-y-3">
            <p class="text-yellow-400 font-bold">INTELLIGENCE CONFIRMED</p>
            <p>You identified the technologies used to build the mystery website.</p>
            <p class="text-white">Clue logged. Return to the Evidence Board to continue your investigation.</p>
        </div>
    `, [{ text: 'Log Clue Evidence', action: 'solveTask(0)', primary: true }]);
}

function solveTask(taskId) {
    closeModal();
    if (unlockedClues.has(taskId)) return;
    
    unlockedClues.add(taskId);
    playSynthSound(900, 'sine', 0.3);

    // Update Task Badges
    const badge = document.getElementById(`badge-task-${taskId}`);
    if (badge) {
        badge.textContent = "RESOLVED ✓";
        badge.className = "text-xs font-typewriter bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold";
    }

    // Hide hidden ornament if solved
    if (taskId === 3) {
        const hiddenEl = document.getElementById('hidden-ornament');
        if (hiddenEl) hiddenEl.style.display = 'none';
    }

    // Update Progress Bar
    const countEl = document.getElementById('clue-count');
    if (countEl) countEl.textContent = unlockedClues.size;
    
    const fillEl = document.getElementById('progress-bar-fill');
    if (fillEl) fillEl.style.width = `${(unlockedClues.size / 6) * 100}%`;

    updateEvidenceBoard();
    checkProgressUnlock();

    // Show evidence discovery alert
    setTimeout(() => {
        showModal("🚨 NEW EVIDENCE ACQUIRED", `
            <div class="border-l-4 border-yellow-500 pl-3 py-2 bg-yellow-500/10 rounded-r">
                <h4 class="font-bold text-yellow-400 text-sm">${gameData.clues[taskId].title}</h4>
                <p class="mt-2 text-white text-xs leading-relaxed">${gameData.clues[taskId].text}</p>
            </div>
        `, [{ text: "Pin to Evidence Board", action: "closeModal()", primary: true }]);
    }, 250);
}

function updateEvidenceBoard() {
    const emptyMsg = document.getElementById('evidence-empty-msg');
    if (emptyMsg) emptyMsg.style.display = unlockedClues.size > 0 ? 'none' : 'block';

    const board = document.getElementById('evidence-board');
    if (!board) return;
    
    // Re-render unlocked evidence cards
    board.querySelectorAll('.evidence-card').forEach(c => c.remove());
    
    Array.from(unlockedClues).sort().forEach(taskId => {
        const data = gameData.clues[taskId];
        const card = document.createElement('div');
        card.className = "evidence-card glass-panel p-3 text-xs animate-fade-in border-t-2 border-t-red-500 relative bg-slate-900/80";
        card.innerHTML = `
            <div class="flex justify-between items-center mb-1">
                <span class="font-bold text-yellow-400 font-mystery text-sm">EVIDENCE #${taskId + 1}</span>
                <span class="text-[10px] text-red-400 font-typewriter">PINNED 📌</span>
            </div>
            <div class="font-typewriter text-gray-300 text-[11px] leading-snug">${data.text}</div>
        `;
        board.appendChild(card);
    });
}

function checkProgressUnlock() {
    if (unlockedClues.size >= 4) {
        const btn = document.getElementById('btn-final-guess');
        if (btn) {
            btn.disabled = false;
            btn.className = "glass-btn px-5 py-2.5 rounded-lg text-white bg-green-900/60 border-green-500 glow-effect font-bold text-xs uppercase tracking-wider";
            btn.innerHTML = "🔓 MAKE FINAL GUESS";
        }
    }
}

function startFinalGuess() {
    if (unlockedClues.size < 4) return;
    
    const grid = document.getElementById('guess-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    gameData.suspects.forEach(suspect => {
        const btn = document.createElement('button');
        btn.className = "glass-btn p-3 rounded-xl text-white font-bold text-xs hover:border-yellow-400 hover:bg-yellow-500/20 transition flex items-center gap-3 text-left";
        
        const fallbackUrl = `https://placehold.co/80x80/1e293b/d4af37?text=${encodeURIComponent(suspect.name)}`;
        btn.innerHTML = `
            <div class="w-8 h-8 rounded-full overflow-hidden border border-yellow-500/40 bg-slate-800 flex-shrink-0">
                <img src="${suspect.image}" alt="${suspect.name}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='${fallbackUrl}';">
            </div>
            <span class="truncate">${suspect.name}</span>
        `;
        btn.onclick = () => evaluateGuess(suspect.name);
        grid.appendChild(btn);
    });

    navigate('guess');
}

function evaluateGuess(name) {
    if (name === gameData.targetPerson) {
        // Correct Answer!
        playSynthSound(1200, 'sine', 0.4);
        setTimeout(() => playSynthSound(1600, 'sine', 0.6), 250);
        navigate('reveal');
        triggerConfetti();
    } else {
        // Incorrect Answer
        playSynthSound(180, 'sawtooth', 0.3);
        showModal("❌ CASE NOT SOLVED", `
            <div class="text-center py-2">
                <div class="text-3xl mb-2">🤔</div>
                <p class="text-sm">The evidence doesn't quite point to <strong>${name}</strong>.</p>
                <p class="text-xs text-gray-400 mt-2">Review your 6 Active Leads and evidence cards, then try again!</p>
            </div>
        `, [{ text: "Investigate Again", action: "closeModal(); navigate('dashboard')", primary: true }]);
    }
}

function showModal(title, content, actions) {
    const t = document.getElementById('modal-title');
    if (t) t.textContent = title;
    
    const c = document.getElementById('modal-content');
    if (c) c.innerHTML = content;
    
    const actionContainer = document.getElementById('modal-actions');
    if (actionContainer) {
        actionContainer.innerHTML = '';
        actions.forEach(act => {
            const btn = document.createElement('button');
            btn.className = act.primary 
                ? "px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-lg text-xs transition" 
                : "px-4 py-2 glass-btn rounded-lg text-white text-xs";
            btn.textContent = act.text;
            btn.setAttribute('onclick', act.action);
            if(act.id) btn.id = act.id;
            actionContainer.appendChild(btn);
        });
    }

    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.style.display = 'flex';
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.style.display = 'none';
}

function setupAudioToggle() {
    const btn = document.getElementById('audio-toggle');
    const status = document.getElementById('audio-status');
    
    if (btn) {
        btn.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            if (status) status.textContent = soundEnabled ? "SOUND: ON" : "SOUND: OFF";
            btn.classList.toggle('text-yellow-400', soundEnabled);
            btn.classList.toggle('text-gray-500', !soundEnabled);
            
            if (soundEnabled && !audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            playSynthSound(500, 'sine', 0.1);
        });
    }
}

function playSynthSound(freq, type, duration) {
    if (!soundEnabled) return;
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
        console.log("Audio play blocked", e);
    }
}

function createSnow() {
    const container = document.getElementById('snow-container');
    if (!container) return;
    const flakes = ['❄', '❅', '❆'];
    for(let i=0; i<40; i++) {
        let flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.textContent = flakes[Math.floor(Math.random() * flakes.length)];
        flake.style.left = Math.random() * 100 + 'vw';
        flake.style.animationDuration = (Math.random() * 5 + 6) + 's';
        flake.style.fontSize = (Math.random() * 10 + 10) + 'px';
        flake.style.opacity = Math.random() * 0.6 + 0.2;
        flake.style.animationDelay = (Math.random() * 5) + 's';
        container.appendChild(flake);
    }
}

function triggerConfetti() {
    const colors = ['#ef4444', '#22c55e', '#eab308', '#ffffff'];
    for(let i=0; i<80; i++) {
        let conf = document.createElement('div');
        conf.className = 'confetti';
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        conf.style.animationDuration = (Math.random() * 2 + 2) + 's';
        document.body.appendChild(conf);
        
        setTimeout(() => conf.remove(), 4000);
    }
}