/* =========================================================
    PIGAFETTA'S PHILIPPINES - script.js
   Vanilla JavaScript for the interactive exhibit
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initActiveNav();
    initReveal();
    initBackToTop();
    initVocabulary();
    initSourceTabs();
    initFieldNotesExplorer();
    initModal();
});

/* =========================================================
   MOBILE MENU
   ========================================================= */
function initMobileMenu() {
    const button = document.querySelector(".mobile-menu-button");
    const menu = document.getElementById("mobile-menu");
    if (!button || !menu) return;

    const setOpen = (open) => {
        button.setAttribute("aria-expanded", String(open));
        menu.classList.toggle("is-open", open);
        document.body.classList.toggle("menu-open", open);
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
   VOCABULARY DATA & RENDERING
   =========================================================
   Entries preserve Pigafetta's historical spelling separately
   from likely meaning. Linguistic identification is scholarly
   and uncertain for some entries, so wording is cautious.
   ========================================================= */
const vocabulary = [
    { category: "numbers", word: "isa", meaning: "one", context: "A number Pigafetta wrote down.", note: "The spelling shows how he heard and recorded the word." },
    { category: "numbers", word: "dua", meaning: "two", context: "Part of Pigafetta's list of numbers.", note: "His spelling was shaped by his Italian pronunciation." },
    { category: "numbers", word: "tolu", meaning: "three", context: "A number in the list he recorded.", note: "The exact modern match is still discussed by researchers." },
    { category: "numbers", word: "upat", meaning: "four", context: "Part of the early number list.", note: "It gives us a small glimpse of the language he heard." },
    { category: "numbers", word: "lima", meaning: "five", context: "A number Pigafetta included in his notes.", note: "The word appears in later Philippine languages too." },
    { category: "numbers", word: "siam", meaning: "nine", context: "Part of the number list from the voyage.", note: "Researchers compare it with words in other Philippine languages." },
    { category: "food", word: "kanin", meaning: "cooked rice / food", context: "Food offered to the crew.", note: "It points to rice as an important food and word." },
    { category: "food", word: "tuba", meaning: "palm wine from fermented sap", context: "A drink made from coconut or palm sap.", note: "It shows how palm trees supported everyday coastal life." },
    { category: "objects", word: "balanghai", meaning: "large seagoing boat", context: "A boat used for travel between islands.", note: "It points to strong boatbuilding and travel skills." },
    { category: "social", word: "dato", meaning: "chief / leader", context: "A word for a local leader.", note: "Pigafetta described these leaders with European titles too." },
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
                item.setAttribute("aria-pressed", String(active));
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