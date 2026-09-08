/* =========================================================
   PIGAFETTA'S PHILIPPINES — script.js
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
    { category: "numbers", word: "isa", meaning: "one", context: "Numeral list recorded from islanders.", note: "Possibly related to a Philippine numeral; transcription reflects European hearing." },
    { category: "numbers", word: "dua", meaning: "two", context: "Numeral list recorded from islanders.", note: "Spelling filtered through Pigafetta's Italian pronunciation." },
    { category: "numbers", word: "tolu", meaning: "three", context: "Numeral list recorded from islanders.", note: "Likely a Visayan-adjacent number; exact identification debated." },
    { category: "numbers", word: "upat", meaning: "four", context: "Numeral list recorded from islanders.", note: "Clear example of the early written numeral series." },
    { category: "numbers", word: "lima", meaning: "five", context: "Numeral list recorded from islanders.", note: "Matches a number found in later Philippine languages." },
    { category: "numbers", word: "siam", meaning: "nine", context: "Numeral list recorded from islanders.", note: "Part of the sequence that historians use for linguistic comparison." },
    { category: "food", word: "kanin", meaning: "cooked rice / food", context: "Food offered to the crew.", note: "Points to rice as a staple and to shared vocabulary for food." },
    { category: "food", word: "tuba", meaning: "palm wine (fermented sap)", context: "Drink made from the coconut/palm, described as common.", note: "Shows a coastal tree-crop beverage culture." },
    { category: "objects", word: "balanghai", meaning: "large seagoing boat", context: "A vessel used between islands and for trade.", note: "Evidence of capable maritime craft and island connectivity." },
    { category: "social", word: "dato", meaning: "chief / leader", context: "Term for local political leaders.", note: "Pigafetta's rendering of a leadership title; used to describe received authority." },
    { category: "social", word: "barangay", meaning: "community / social unit", context: "Social-political grouping described by the observer.", note: "Early European note of a community term with long usage." }
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
   MODAL (for timeline "Read more" + footnote links)
   ========================================================= */
const modalContent = {
    "tl-samar": {
        title: "Samar & Homonhon",
        body: "<p>Landfall in March 1521 on islands now identified with the Guiuan area of Eastern Samar. The crews took on food and water. This first landing was brief and largely unobserved.</p><p><strong>Significance.</strong> It marks the start of sustained contact in the archipelago and the point where the expedition began provisioning for the Pacific crossing onward.</p><p><em>Source: Pigafetta's account and scholarly identifications of the route.</em></p>"
    },
    "tl-limasawa": {
        title: "Limasawa (the 'Rahat' islets)",
        body: "<p>Late March 1521. The account records a hospitable meeting where islanders offered gifts, including gold, and where leaders (whom Pigafetta later calls kings or chiefs) received the expedition.</p><p><strong>Significance.</strong> The gifts and food offered show active diplomacy and the material resources available in the islands.</p><p><em>Interpretive note: the name and location are debated by scholars.</em></p>"
    },
    "tl-cebu": {
        title: "The Island of Cebu",
        body: "<p>April 1521. Friendly exchange, trade, and the reporting of a local 'king' and social hierarchy. Pigafetta also notes the production and drinking of palm wine (tuba).</p><p><strong>Significance.</strong> These notes are evidence for political leadership, hospitality, and a settled economy.</p><p><em>Caution: 'king' is Pigafetta's translation of unfamiliar leadership.</em></p>"
    },
    "tl-mactan": {
        title: "Mactan (Mactang)",
        body: "<p>About 27 April 1521, at Mactan on Cebu, a confrontation with local forces led to the death of Ferdinand Magellan. Pigafetta's account is a primary eyewitness to this turning point.</p><p><strong>Significance.</strong> It shows that relations could turn violent, and that the welcome of the expedition was not universal.</p><p><em>Note: historians treat descriptions of the conflict from both sides carefully.</em></p>"
    },
    "tl-butuan": {
        title: "Butuan & the wider islands",
        body: "<p>Late April to May 1521. The expedition continued provisioning and exchanged goods with communities that displayed gold, rice, and items linked to regional trade.</p><p><strong>Significance.</strong> These exchanges support the view that the islands participated in wider Southeast Asian maritime commerce.</p><p><em>Interpretive note: the extent of this trade is weighed against archaeology and later Spanish records.</em></p>"
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