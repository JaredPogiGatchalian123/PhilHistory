/* =========================================================
    PIGAFETTA'S PHILIPPINES - script.js
   Vanilla JavaScript for the interactive exhibit
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const artifactLab = document.getElementById("artifact-lab");
    const conclusion = document.getElementById("significance");
    if (artifactLab && conclusion) conclusion.before(artifactLab);

    initMobileMenu();
    initActiveNav();
    initReveal();
    initBackToTop();
    initVocabulary();
    initSourceTabs();
    initFieldNotesExplorer();
    initMaritimeTradeExplorer();
    initArtifactMatchGame();
    initArtifactMatcher();
    initModal();
    initPigafettaWave();
    initVoyageAnimation();
});

/* =========================================================
   HERO MAP: EXPEDITION VOYAGE ANIMATION
   ========================================================= */
function initVoyageAnimation() {
    const map = document.querySelector(".voyage-animation");
    if (!map) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncMotionPreference = () => {
        if (reducedMotion.matches) {
            if (typeof map.pauseAnimations === "function") map.pauseAnimations();
        } else {
            if (typeof map.unpauseAnimations === "function") map.unpauseAnimations();
        }
    };

    reducedMotion.addEventListener?.("change", syncMotionPreference);
    syncMotionPreference();
}

/* =========================================================
   ARTIFACT LAB: MATCH THE ARTIFACT
   ========================================================= */
function initArtifactMatchGame() {
    const game = document.getElementById("artifact-lab");
    if (!game) return;

    const tokens = Array.from(game.querySelectorAll(".artifact-token"));
    const targets = Array.from(game.querySelectorAll(".artifact-target"));
    const score = game.querySelector("#artifact-score");
    const attemptsLabel = game.querySelector("#artifact-attempts");
    const status = game.querySelector("#artifact-game-status");
    const reset = game.querySelector("#reset-artifact-game");
    const complete = game.querySelector("#artifact-complete");
    const closeComplete = game.querySelector("#close-artifact-complete");
    const playAgain = game.querySelector("#play-again-artifact");
    const feedback = game.querySelector("#artifact-feedback");
    const feedbackImage = game.querySelector("#artifact-feedback-image");
    const feedbackTitle = game.querySelector("#artifact-feedback-title");
    const feedbackMessage = game.querySelector("#artifact-feedback-message");
    const feedbackBadge = game.querySelector("#artifact-feedback-badge");
    let selected = null;
    let matched = 0;
    let attempts = 0;
    let audioContext;
    let feedbackTimer;
    let completionTimer;

    const playTone = (correct) => {
        try {
            audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            oscillator.type = "sine";
            oscillator.frequency.value = correct ? 660 : 180;
            gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + (correct ? 0.22 : 0.14));
            oscillator.connect(gain).connect(audioContext.destination);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + (correct ? 0.24 : 0.16));
        } catch (error) { /* Sound is optional; the game still works silently. */ }
    };

    const updateScore = () => {
        score.textContent = `${matched} / ${tokens.length}`;
        attemptsLabel.textContent = `${attempts} attempt${attempts === 1 ? "" : "s"}`;
    };

    const playFanfare = () => {
        try {
            audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
            [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
                const start = audioContext.currentTime + index * 0.11;
                const oscillator = audioContext.createOscillator();
                const gain = audioContext.createGain();
                oscillator.type = "sine";
                oscillator.frequency.value = frequency;
                gain.gain.setValueAtTime(0.0001, start);
                gain.gain.exponentialRampToValueAtTime(0.1, start + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
                oscillator.connect(gain).connect(audioContext.destination);
                oscillator.start(start);
                oscillator.stop(start + 0.3);
            });
        } catch (error) { /* Sound is optional; the game still works silently. */ }
    };

    const closeCompleteDialog = () => {
        complete.hidden = true;
    };

    const flashFeedback = (correct) => {
        window.clearTimeout(feedbackTimer);
        feedback.classList.remove("is-correct", "is-incorrect");
        feedbackImage.src = correct ? "images/correct_answer_transparent.png" : "images/incorrect_answer_cutout.png";
        feedbackBadge.textContent = correct ? "CORRECT ANSWER" : "INCORRECT ANSWER";
        feedbackTitle.textContent = correct ? "Your answer is correct!" : "Your answer is incorrect.";
        feedbackMessage.textContent = correct ? "Great job! You found the right connection." : "Try another description.";
        feedback.classList.add(correct ? "is-correct" : "is-incorrect");
        feedback.hidden = false;
        feedbackTimer = window.setTimeout(() => { feedback.hidden = true; }, correct ? 1500 : 1300);
    };

    const clearSelection = () => {
        tokens.forEach((token) => token.classList.remove("is-selected"));
        selected = null;
    };

    const tryMatch = (token, target) => {
        if (!token || !target || token.disabled || target.disabled) return;
        attempts += 1;
        const correct = token.dataset.artifactMatch === target.dataset.artifactTarget;
        target.classList.remove("is-correct", "is-wrong");
        void target.offsetWidth;
        target.classList.add(correct ? "is-correct" : "is-wrong");
        playTone(correct);
        flashFeedback(correct);

        if (correct) {
            matched += 1;
            token.disabled = true;
            target.disabled = true;
            token.classList.add("is-matched");
            target.querySelector(".target-mark").textContent = "✓";
            status.textContent = matched === tokens.length
                ? `Excellent! You matched all ${tokens.length} artifacts in ${attempts} attempts.`
                : `Correct! ${matched} of ${tokens.length} artifacts matched.`;
            if (matched === tokens.length) {
                playFanfare();
                window.clearTimeout(completionTimer);
                completionTimer = window.setTimeout(() => {
                    feedback.hidden = true;
                    complete.hidden = false;
                    closeComplete.focus();
                }, 850);
            }
        } else {
            status.textContent = "Not quite — look at what the object reveals about local life and regional connections.";
        }
        updateScore();
        clearSelection();
    };

    tokens.forEach((token) => {
        token.addEventListener("click", () => {
            if (token.disabled) return;
            clearSelection();
            selected = token;
            token.classList.add("is-selected");
            status.textContent = `${token.querySelector("span").textContent} selected. Choose its matching description.`;
        });
        token.addEventListener("dragstart", (event) => {
            selected = token;
            event.dataTransfer.setData("text/plain", token.dataset.artifactMatch);
            token.classList.add("is-selected");
        });
        token.addEventListener("dragend", clearSelection);
    });

    targets.forEach((target) => {
        target.addEventListener("click", () => tryMatch(selected, target));
        target.addEventListener("dragover", (event) => { event.preventDefault(); target.classList.add("is-over"); });
        target.addEventListener("dragleave", () => target.classList.remove("is-over"));
        target.addEventListener("drop", (event) => {
            event.preventDefault();
            target.classList.remove("is-over");
            const match = tokens.find((token) => token.dataset.artifactMatch === event.dataTransfer.getData("text/plain"));
            tryMatch(match, target);
        });
    });

    reset.addEventListener("click", () => {
        window.clearTimeout(completionTimer);
        window.clearTimeout(feedbackTimer);
        closeCompleteDialog();
        feedback.hidden = true;
        matched = 0;
        attempts = 0;
        tokens.forEach((token) => { token.disabled = false; token.classList.remove("is-selected", "is-matched"); });
        targets.forEach((target) => {
            target.disabled = false;
            target.classList.remove("is-correct", "is-wrong", "is-over");
            target.querySelector(".target-mark").textContent = target.dataset.artifactTarget === "balangay" ? "A" : target.dataset.artifactTarget === "porcelain" ? "B" : target.dataset.artifactTarget === "tuba" ? "C" : target.dataset.artifactTarget === "gold" ? "D" : target.dataset.artifactTarget === "rice" ? "E" : "F";
        });
        clearSelection();
        status.textContent = "Game reset. Choose an artifact to begin.";
        updateScore();
    });
    closeComplete.addEventListener("click", closeCompleteDialog);
    playAgain.addEventListener("click", () => {
        closeCompleteDialog();
        reset.click();
        tokens[0].focus();
    });
    complete.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeCompleteDialog();
    });
    updateScore();
}


/* =========================================================
   1521 TIME CAPSULE: ARCHAEOLOGY VS. INK MATCHER
   ========================================================= */
const artifactMatches = [
    {
        id: "table",
        name: "The Warm Table",
        observation: "He described welcoming feasts hosted by Rajah Colambu and Rajah Humabon. Guests were served roasted meat, fish soup, rice cooked in leaves, and sweet palm wine (tuba) in shared porcelain bowls.",
        legacy: "Hospitality is still an important part of Filipino life. Sharing a meal, offering plenty of food, and serving drinks are ways we show guests trust and respect, just as people did five centuries ago.",
        significance: "Sharing food and welcoming guests have always been part of how Filipinos greet the world."
    },
    {
        id: "words",
        name: "Living Words",
        observation: "Pigafetta wrote down Visayan words spoken by local people, including 'humay' (rice), 'balanghai' (boat), 'iloy' (mother), and 'asawa' (spouse). His list became the first European record of many Visayan terms.",
        legacy: "Spanish and American rule did not erase our native languages. Many of the words recorded in Pigafetta's journal are still used every day by Visayans and other Filipinos.",
        significance: "His notebook shows that indigenous Philippine languages were rich, organized, and strong enough to survive."
    },
    {
        id: "ink",
        name: "Pride in Ink",
        observation: "He called Visayan leaders and warriors 'Pintados,' meaning people with tattoos. He described their detailed, full-body designs as signs of courage, skill in battle, and high standing in the community.",
        legacy: "Colonial authorities once called these tattoo traditions (batok) 'primitive.' Today, many Filipinos are proudly bringing them back as a way to honor their culture and ancestors.",
        significance: "The tattoos once condemned by colonizers are now worn with pride as symbols of Filipino identity."
    }
];

function initArtifactMatcher() {
    const section = document.getElementById("significance");
    if (!section) return;

    const buttons = Array.from(section.querySelectorAll(".artifact-pedestal"));
    const ledger = section.querySelector(".artifact-ledger");
    const name = section.querySelector("#artifact-name");
    const observation = section.querySelector("#artifact-archaeology");
    const legacy = section.querySelector("#artifact-quote");
    const significance = section.querySelector("#artifact-significance");
    if (!ledger || !name || !observation || !legacy || !significance) return;

    const setArtifact = (artifactId) => {
        const artifact = artifactMatches.find((item) => item.id === artifactId);
        if (!artifact) return;

        buttons.forEach((button) => {
            const active = button.dataset.artifact === artifactId;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-selected", String(active));
        });

        ledger.classList.remove("is-changing");
        requestAnimationFrame(() => {
            name.textContent = artifact.name;
            observation.textContent = artifact.observation;
            legacy.textContent = artifact.legacy;
            significance.innerHTML = `<strong>Legacy from 1521:</strong> ${artifact.significance}`;
            ledger.classList.add("is-changing");
            requestAnimationFrame(() => ledger.classList.remove("is-changing"));
        });
    };

    buttons.forEach((button) => {
        button.addEventListener("click", () => setArtifact(button.dataset.artifact));
        button.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            setArtifact(button.dataset.artifact);
        });
    });

    setArtifact("table");
}
/* =========================================================
   MOBILE MENU
   ========================================================= */
function initMobileMenu() {
    const button = document.querySelector(".mobile-menu-button");
    const menu = document.getElementById("mobile-menu");
    if (!button || !menu) return;

    const setOpen = (open) => {
        button.setAttribute("aria-expanded", String(open));
        menu.setAttribute("aria-hidden", String(!open));
        menu.classList.toggle("is-open", open);
        document.body.classList.toggle("menu-open", open);
        if (open) {
            const firstLink = menu.querySelector("a");
            if (firstLink) firstLink.focus();
        } else {
            button.focus();
        }
    };

    button.addEventListener("click", () => {
        setOpen(button.getAttribute("aria-expanded") !== "true");
    });

    // Close when a menu link is selected
    menu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setOpen(false));
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setOpen(false);
    });
}

/* =========================================================
   ACTIVE NAV ON SCROLL
   ========================================================= */
function initActiveNav() {
    const navLinks = Array.from(document.querySelectorAll(".main-nav a"));
    const sections = Array.from(document.querySelectorAll("main section[id]"));

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute("id");
                    navLinks.forEach((link) => {
                        const match = link.getAttribute("href") === "#" + id;
                        link.classList.toggle("active", match);
                    });
                }
            });
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach((sec) => observer.observe(sec));
}

/* =========================================================
   SCROLL REVEAL
   ========================================================= */
function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
        items.forEach((el) => el.classList.add("is-visible"));
        return;
    }
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach((el) => observer.observe(el));
}

/* =========================================================
   BACK TO TOP
   ========================================================= */
function initBackToTop() {
    const btn = document.querySelector(".back-to-top");
    if (!btn) return;
    const onScroll = () => {
        btn.classList.toggle("visible", window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

/* =========================================================
   MARITIME TRADE ROUTE EXPLORER
   ========================================================= */
const maritimeRoutes = {
    china: {
        direction: "Northward Route",
        name: "Trade with Imperial China",
        tags: ["Blue & White Porcelain", "Raw Gold", "Silk", "Beeswax"],
        inbound: "Fine blue-and-white porcelain plates, silk garments, iron needles, and cooking pots.",
        outbound: "Native gold bullion, pure beeswax, pearls, and yellow tortoise shells.",
        significance: "Centuries before Magellan, early Filipinos had regular, peaceful business contracts with Chinese merchant fleets."
    },
    malay: {
        direction: "Westward Route",
        name: "The Malay & Borneo Network",
        tags: ["Malay Language", "Woven Textiles", "Brass Gongs", "Regional News"],
        inbound: "The Malay trading language, fine woven textiles, brass gongs, and regional news.",
        outbound: "Local provisions, timber, and inter-island sea transport on native balangays.",
        significance: "This regional connection is why Magellan's Malay slave Enrique could talk with local Visayan leaders on day one."
    },
    spice: {
        direction: "Southward Route",
        name: "The Spice Route to the Moluccas",
        tags: ["Cloves", "Nutmeg", "Mace", "Aromatic Woods"],
        inbound: "High-value cloves, nutmeg, mace, and aromatic woods.",
        outbound: "Rice provisions, salted fish, and local iron tools to supply spice trade expeditions.",
        significance: "The Philippines was the northern gateway to the exact Spice Islands that European empires risked everything to reach."
    }
};

function initMaritimeTradeExplorer() {
    const explorer = document.getElementById("maritime-explorer");
    if (!explorer) return;

    const inspector = explorer.querySelector(".route-inspector");
    const direction = explorer.querySelector("#route-direction");
    const name = explorer.querySelector("#route-name");
    const tags = explorer.querySelector("#commodity-tags");
    const inbound = explorer.querySelector("#route-inbound");
    const outbound = explorer.querySelector("#route-outbound");
    const significance = explorer.querySelector("#route-significance");
    const controls = Array.from(explorer.querySelectorAll(".trade-route, .chart-node"));
    const switchButtons = Array.from(explorer.querySelectorAll(".route-switch-button"));

    const setRoute = (routeKey) => {
        const route = maritimeRoutes[routeKey];
        if (!route) return;

        direction.textContent = route.direction;
        name.textContent = route.name;
        inbound.textContent = route.inbound;
        outbound.textContent = route.outbound;
        significance.textContent = route.significance;
        tags.innerHTML = route.tags.map((tag) => `<span class="commodity-tag">${tag}</span>`).join("");

        controls.forEach((control) => {
            control.classList.toggle("is-active", control.dataset.route === routeKey);
        });
        switchButtons.forEach((button) => {
            const active = button.dataset.route === routeKey;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
        });

        inspector.classList.remove("is-changing");
        requestAnimationFrame(() => inspector.classList.add("is-changing"));
    };

    controls.forEach((control) => {
        control.addEventListener("click", () => setRoute(control.dataset.route));
        control.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setRoute(control.dataset.route);
            }
        });
    });
    switchButtons.forEach((button) => {
        button.addEventListener("click", () => setRoute(button.dataset.route));
    });

    setRoute("china");
}

/* =========================================================
   VOCABULARY DATA & RENDERING
   =========================================================
   Entries preserve Pigafetta's historical spelling separately
   from likely meaning. Linguistic identification is scholarly
   and uncertain for some entries, so wording is cautious.
   ========================================================= */
const vocabulary = [
    { category: "numbers", word: "usa", meaning: "one", context: "A number Pigafetta wrote down.", note: "The spelling shows how he heard and recorded the word." },
    { category: "numbers", word: "dua", meaning: "two", context: "Part of Pigafetta's list of numbers.", note: "His spelling was shaped by his Italian pronunciation." },
    { category: "numbers", word: "tolu", meaning: "three", context: "A number in the list he recorded.", note: "The exact modern match is still discussed by researchers." },
    { category: "numbers", word: "upat", meaning: "four", context: "Part of the early number list.", note: "It gives us a small glimpse of the language he heard." },
    { category: "numbers", word: "lima", meaning: "five", context: "A number Pigafetta included in his notes.", note: "The word appears in later Philippine languages too." },
    { category: "numbers", word: "siam", meaning: "nine", context: "Part of the number list from the voyage.", note: "Researchers compare it with words in other Philippine languages." },
    { category: "food", word: "kanin", meaning: "cooked rice / food", context: "Food offered to the crew.", note: "It points to rice as an important food and word." },
    { category: "food", word: "tuba", meaning: "palm wine from fermented sap", context: "A drink made from coconut or palm sap.", note: "It shows how palm trees supported everyday coastal life." },
    { category: "objects", word: "balanghai", meaning: "large seagoing boat", context: "A boat used for travel between islands.", note: "It points to strong boatbuilding and travel skills." },
    { category: "social", word: "datu", meaning: "chief / leader", context: "A word for a local leader.", note: "Pigafetta described these leaders with European titles too." },
    { category: "social", word: "barangay", meaning: "community / social group", context: "A word connected with local community life.", note: "It is an early European record of a long-used Philippine word." }
];

function initVocabulary() {
    const grid = document.getElementById("vocab-grid");
    const search = document.getElementById("vocab-search");
    const empty = document.getElementById("vocab-empty");
    if (!grid) return;

    let currentFilter = "all";
    let currentSearch = "";

    const render = () => {
        const q = currentSearch.trim().toLowerCase();
        const filtered = vocabulary.filter((v) => {
            const inCategory = currentFilter === "all" || v.category === currentFilter;
            const inSearch =
                !q ||
                v.word.toLowerCase().includes(q) ||
                v.meaning.toLowerCase().includes(q) ||
                v.context.toLowerCase().includes(q) ||
                v.category.includes(q);
            return inCategory && inSearch;
        });

        grid.innerHTML = "";
        if (filtered.length === 0) {
            if (empty) empty.hidden = false;
            return;
        }
        if (empty) empty.hidden = true;

        filtered.forEach((v) => {
            const badge = `<span class="vocab-badge">${v.category}</span>`;
            const card = document.createElement("article");
            card.className = "vocab-card";
            card.innerHTML = `
                ${badge}
                <h3>${v.word}</h3>
                <p class="vocab-meaning"><strong>${v.meaning}</strong></p>
                <p class="vocab-context">${v.context}</p>
                <p class="vocab-context">${v.note}</p>
            `;
            grid.appendChild(card);
        });
    };

    const setFilter = (val) => {
        currentFilter = val;
        document.querySelectorAll(".filter-btn").forEach((b) => {
            b.classList.toggle("is-active", b.dataset.filter === val);
        });
        render();
    };

    document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.addEventListener("click", () => setFilter(btn.dataset.filter));
    });

    if (search) {
        search.addEventListener("input", () => {
            currentSearch = search.value;
            render();
        });
    }

    render();
}

/* =========================================================
   SOURCE TABS
   ========================================================= */
function initSourceTabs() {
    document.querySelectorAll(".source-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
            const target = tab.dataset.tab;
            document.querySelectorAll(".source-tab").forEach((t) => {
                const active = t === tab;
                t.classList.toggle("is-active", active);
                t.setAttribute("aria-selected", String(active));
            });
            document.querySelectorAll(".source-panel").forEach((panel) => {
                panel.hidden = panel.id !== "source-panel-" + target;
            });
        });
    });
}

/* =========================================================
   FIELD NOTES EXPLORER
   ========================================================= */
const fieldNotes = {
    hospitality: {
        title: "Welcoming Guests and Making Friends",
        quote: '"They showed us great kindness and offered us fish, figs, and jars of palm wine."',
        location: "Limasawa / Cebu • April 1521",
        observation: "The islanders greeted the Spanish crew warmly, offered food and drink, and took part in peace agreements.",
        context: "In early island culture, sharing a meal and gifts was standard diplomatic courtesy and a way to test if new visitors came in peace.",
        importance: "It shows that early Filipinos had well-established customs of hospitality and diplomacy long before Spanish rule."
    },
    food: {
        title: "Food, Rice, and Palm Wine (Tuba)",
        quote: '"They make a wine which they call tuba from the sap of palm trees."',
        location: "Homonhon / Cebu • March to April 1521",
        observation: "People harvested palm sap to make wine, called tuba, and ate meals with rice, pork, ginger, and fish.",
        context: "The communities practiced settled farming and had established traditions of brewing drinks and celebrating harvests.",
        importance: "It shows settled agriculture and daily community life were already thriving across the islands."
    },
    ceremonies: {
        title: "Royal Welcomes and Gift Exchange",
        quote: '"The king gave the captain many bars of gold and porcelain jars filled with ginger."',
        location: "Limasawa / Cebu • April 1521",
        observation: "Local leaders, called datus, exchanged valuable gifts like gold, imported cloth, and porcelain dishes with Magellan.",
        context: "Exchanging gifts was how leaders formed alliances, showed respect, and measured each other's status.",
        importance: "Gold was part of everyday leadership and ceremonial life, not just treasure kept in chests."
    },
    dress: {
        title: "Clothing, Jewelry, and Tattoos (Pintados)",
        quote: '"Their bodies were smooth and painted with figures all over."',
        location: "Cebu and neighboring islands • April 1521",
        observation: "People wore lightweight woven clothes, gold earrings, and intricate full-body tattoos.",
        context: "In a tropical climate, clothes were kept light, while tattoos were earned badges of bravery, status, and identity.",
        importance: "Tattoos were not primitive decorations. They were a respected art form and a mark of personal courage."
    },
    music: {
        title: "Music, Gongs, and Celebration",
        quote: '"Young women played upon copper gongs and made sweet harmony."',
        location: "Cebu • April 1521",
        observation: "Celebrations featured rhythmic brass gongs, called agung, singing, and ceremonial group dances.",
        context: "Music and dance were essential parts of major gatherings, welcoming visitors, and religious rites.",
        importance: "It preserves a record of ancient musical traditions and instruments that still exist in parts of the Philippines today."
    },
    spiritual: {
        title: "Early Beliefs and Rituals",
        quote: '"They raised their hands to heaven and called upon their god, whom they call Abba."',
        location: "Cebu and the Visayan region • April 1521",
        observation: "People honored ancestral spirits, offered food during rituals, and listened to female spiritual leaders called babaylan.",
        context: "Pigafetta tried to understand their beliefs through his own Catholic viewpoint, while the people followed traditions centered on spirits and ancestors.",
        importance: "It gives us a rare glimpse into indigenous spiritual beliefs before Spanish Christianity took root."
    }
};

function initFieldNotesExplorer() {
    const explorer = document.querySelector(".field-notes-explorer");
    if (!explorer) return;

    const topicButtons = Array.from(explorer.querySelectorAll(".field-note-topic"));
    const title = explorer.querySelector("#field-note-title");
    const quote = explorer.querySelector("#field-note-quote");
    const location = explorer.querySelector("#field-note-location");
    const tag = explorer.querySelector("#field-note-tag");
    const observation = explorer.querySelector("#field-note-observation");
    const context = explorer.querySelector("#field-note-context");
    const importance = explorer.querySelector("#field-note-importance");
    let currentTopic = "hospitality";

    const render = () => {
        const note = fieldNotes[currentTopic];
        title.textContent = note.title;
        quote.textContent = note.quote;
        location.innerHTML = `Location: ${note.location}`;
        tag.textContent = `Location: ${note.location.replace(" • ", " / ")}`;
        [observation, context, importance].forEach((item) => item.classList.remove("is-changing"));
        requestAnimationFrame(() => {
            observation.textContent = note.observation;
            context.textContent = note.context;
            importance.textContent = note.importance;
            [observation, context, importance].forEach((item) => item.classList.add("is-changing"));
        });
    };

    topicButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            currentTopic = button.dataset.topic;
            topicButtons.forEach((item) => {
                const active = item === button;
                item.classList.toggle("is-active", active);
                item.setAttribute("aria-selected", String(active));
                item.setAttribute("tabindex", active ? "0" : "-1");
            });
            render();
        });
        button.addEventListener("keydown", (event) => {
            if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
            event.preventDefault();
            const nextIndex = event.key === "ArrowDown" ? (index + 1) % topicButtons.length : (index - 1 + topicButtons.length) % topicButtons.length;
            topicButtons[nextIndex].focus();
        });
    });

    render();
}
/* =========================================================
   MODAL (for timeline "Read more" + footnote links)
   ========================================================= */
const modalContent = {
    "tl-samar": {
        title: "Samar & Homonhon",
        body: "<p>In March 1521, the expedition landed near the Guiuan area of Eastern Samar. The crews took on food and water, but the visit was brief.</p><p><strong>Why it matters.</strong> This was the expedition's first recorded contact in the islands and an important stop for supplies.</p><p><em>Source: Pigafetta's account and later studies of the route.</em></p>"
    },
    "tl-limasawa": {
        title: "Limasawa (the 'Rahat' islets)",
        body: "<p>In late March 1521, islanders welcomed the expedition and offered gifts, including gold. Pigafetta later called local leaders kings or chiefs.</p><p><strong>Why it matters.</strong> The gifts and food show active diplomacy and the resources available to coastal communities.</p><p><em>Note: the exact name and location are still debated.</em></p>"
    },
    "tl-cebu": {
        title: "The Island of Cebu",
        body: "<p>In April 1521, the expedition met local leaders, traded, and saw the production and drinking of palm wine, or tuba. Pigafetta called one leader a king.</p><p><strong>Why it matters.</strong> These notes point to political leadership, hospitality, and a settled economy.</p><p><em>Caution: &quot;king&quot; was Pigafetta's translation for a leader whose role was unfamiliar to him.</em></p>"
    },
    "tl-mactan": {
        title: "Mactan (Mactang)",
        body: "<p>On about 27 April 1521, fighting at Mactan led to the death of Ferdinand Magellan. Pigafetta was there and recorded this turning point.</p><p><strong>Why it matters.</strong> The event shows that relationships with the expedition could turn violent and that not every community accepted its demands.</p><p><em>Note: historians compare accounts of the fight carefully.</em></p>"
    },
    "tl-butuan": {
        title: "Butuan & the wider islands",
        body: "<p>From late April into May 1521, the expedition continued to gather supplies and exchange goods. Communities displayed gold, rice, and items linked to regional trade.</p><p><strong>Why it matters.</strong> These exchanges suggest that the islands took part in wider Southeast Asian sea trade.</p><p><em>Note: historians compare Pigafetta's account with archaeology and later records.</em></p>"
    }
};

function initModal() {
    const modal = document.getElementById("modal");
    if (!modal) return;

    const open = (title, bodyHtml) => {
        document.getElementById("modal-title").textContent = title;
        document.querySelector("#modal .modal-body").innerHTML = bodyHtml;
        modal.hidden = false;
        document.body.classList.add("menu-open");
        const closeBtn = modal.querySelector(".modal-close");
        closeBtn.focus();
    };
    const close = () => {
        modal.hidden = true;
        document.body.classList.remove("menu-open");
    };

    // "Read more" buttons in timeline
    document.querySelectorAll("[data-more]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const key = btn.dataset.more;
            if (modalContent[key]) open(modalContent[key].title, modalContent[key].body);
        });
    });

    // Footnote markers
    document.querySelectorAll(".fn").forEach((fn) => {
        fn.addEventListener("click", () => {
            open(
                "Source Citation",
                "<p>See the Sources &amp; Evidence section for full source categories. This footnote marker points to the references supporting this claim. Where a statement is an interpretation rather than Pigafetta's own words, the text indicates so.</p>"
            );
        });
    });

    // Close on backdrop, close button, Escape
    modal.querySelectorAll("[data-close]").forEach((el) => {
        el.addEventListener("click", close);
    });
    modal.addEventListener("keydown", (e) => {
        if (e.key === "Escape") close();
    });
}

/* =========================================================
   PIGAFETTA WAVING EASTER EGG
   ========================================================= */
function initPigafettaWave() {
    const button = document.getElementById("pigafetta-voice-btn");
    const image = document.querySelector(".portrait-image-wrap img");
    const video = document.querySelector(".portrait-image-wrap video");
    if (!button || !image || !video) return;

    const resetPortrait = () => {
        video.classList.add("hidden");
        image.classList.remove("hidden");
        button.disabled = false;
    };

    button.addEventListener("click", () => {
        button.disabled = true;
        image.classList.add("hidden");
        video.classList.remove("hidden");
        video.currentTime = 0;
        video.muted = false;
        video.volume = 1.0;
        const playRequest = video.play();

        if (playRequest) {
            playRequest.catch(() => {
                resetPortrait();
            });
        }
    });

    video.addEventListener("ended", () => {
        window.setTimeout(() => {
            video.classList.add("hidden");
            image.classList.remove("hidden");
            button.disabled = false;
        }, 1000);
    });
}
