document.addEventListener('DOMContentLoaded', () => {
    // Theme Switcher Logic
    initTheme();
    // Search Logic
    initSearch(); // Initialize search UI and events

    // Check Page Type
    const postsList = document.getElementById('posts-list');
    const articleBody = document.getElementById('article-body');

    if (postsList) {
        loadPostsList();
        loadSidebarPosts();
    } else if (articleBody) {
        loadPostContent();
        loadSidebarPosts();
    }
});

function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const storedTheme = localStorage.getItem('theme') || 'light';

    document.documentElement.setAttribute('data-theme', storedTheme);
    updateThemeIcon(storedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        icon.className = theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    }
}

function initSearch() {
    const searchToggle = document.getElementById('search-toggle');
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');

    if (searchToggle && searchContainer && searchInput) {
        searchToggle.addEventListener('click', (e) => {
            e.preventDefault();
            searchContainer.classList.toggle('active');
            if (searchContainer.classList.contains('active')) {
                searchInput.focus();
            }
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target) && searchContainer.classList.contains('active')) {
                searchContainer.classList.remove('active');
            }
        });

        // Search Execution
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const term = searchInput.value.trim().toLowerCase();
                if (term) {
                    performSearch(term);
                }
            }
        });
    }
}

function performSearch(term) {
    const postsList = document.getElementById('posts-list');

    // If we are on the homepage, filter the list
    if (postsList) {
        filterHomePosts(term);
    } else {
        // If not on homepage, redirect to homepage with query param
        window.location.href = `index.html?search=${encodeURIComponent(term)}`;
    }
}

async function filterHomePosts(term) {
    const posts = await getAllPosts();
    const filtered = posts.filter(post =>
        post.title.toLowerCase().includes(term) ||
        post.excerpt.toLowerCase().includes(term) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(term)))
    );

    renderPostsList(filtered);

    // Update Page Title temporarily
    const titleEl = document.querySelector('.page-title');
    if (titleEl) titleEl.innerText = `搜尋結果: "${term}" (${filtered.length})`;
}

async function getAllPosts() {
    try {
        const response = await fetch('posts.json');
        return await response.json();
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}

async function loadSidebarPosts() {
    const posts = await getAllPosts();
    const list = document.getElementById('all-posts-list');
    if (!list) return;

    list.innerHTML = posts.map(post => `
        <li><a href="post.html?id=${post.id}" class="posts-nav-link">${post.title}</a></li>
    `).join('');
}

async function loadPostsList() {
    const posts = await getAllPosts();
    const postsList = document.getElementById('posts-list');
    if (!postsList) return;

    // Check for search query param
    const params = new URLSearchParams(window.location.search);
    const searchTerm = params.get('search');

    if (searchTerm) {
        // Perform filter immediately
        const term = searchTerm.toLowerCase();
        const filtered = posts.filter(post =>
            post.title.toLowerCase().includes(term) ||
            post.excerpt.toLowerCase().includes(term)
        );
        renderPostsList(filtered);
        const titleEl = document.querySelector('.page-title');
        if (titleEl) titleEl.innerText = `搜尋結果: "${searchTerm}" (${filtered.length})`;

        // Open search box with value
        const searchContainer = document.getElementById('search-container');
        const searchInput = document.getElementById('search-input');
        if (searchContainer && searchInput) {
            searchContainer.classList.add('active');
            searchInput.value = searchTerm;
        }

    } else {
        renderPostsList(posts);
    }
}

function renderPostsList(posts) {
    const postsList = document.getElementById('posts-list');

    if (posts.length === 0) {
        postsList.innerHTML = '<p>沒有找到相關文章。</p>';
        return;
    }

    postsList.innerHTML = posts.map(post => `
        <a href="post.html?id=${post.id}" class="post-item">
            <div class="post-title">
                <h2>${post.title}</h2>
            </div>
            <div class="post-meta">
                <span>${post.date}</span> &bull; <span>${post.author}</span> &bull; <span>${(post.tags || []).join(', ')}</span>
            </div>
            <div class="post-excerpt">
                ${post.excerpt}
            </div>
        </a>
    `).join('');
}

async function loadPostContent() {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    if (!postId) {
        window.location.href = 'index.html';
        return;
    }

    const posts = await getAllPosts();
    const post = posts.find(p => p.id === postId);

    if (!post) return;

    document.title = `${post.title} - PP微軟筆記`;
    document.getElementById('post-title').innerText = post.title;
    document.getElementById('post-meta-data').innerText = `${post.date} | ${post.author}`;

    try {
        const mdResponse = await fetch(`content/${post.filename}`);
        if (!mdResponse.ok) throw new Error('Markdown file not found');
        const mdText = await mdResponse.text();

        // STRIP FRONTMATTER
        const contentBody = mdText.replace(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*/, '');

        const rawHtml = marked.parse(contentBody);
        const { html, sections } = convertToAccordion(rawHtml);

        const articleContainer = document.getElementById('article-body');
        articleContainer.innerHTML = html;

        const firstH1 = articleContainer.querySelector('h1');
        if (firstH1) {
            firstH1.remove();
        }

        generateTOC(sections);
        initAccordions();
        initToggleAllBtn();
        initLightbox(); // Initialize Image Lightbox

        if (window.Prism) Prism.highlightAll();

    } catch (error) {
        console.error('Error loading markdown:', error);
    }
}

// --- Lightbox Logic --- //

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close');
    const zoomBtn = document.getElementById('lightbox-zoom-toggle');
    const images = document.querySelectorAll('.article-body img');

    if (!lightbox || !lightboxImg) return;

    let isZoomed = false;

    // Open Lightbox
    images.forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            resetZoom();
        });
    });

    // Close Lightbox
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            lightboxImg.src = '';
            resetZoom();
        }, 300);
    };

    closeBtn.addEventListener('click', closeLightbox);

    // Close on clicking outside image (but handle scrolling in zoomed mode differently)
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Zoom Toggle Logic
    const toggleZoom = () => {
        isZoomed = !isZoomed;
        if (isZoomed) {
            lightboxImg.classList.add('zoomed');
            lightbox.classList.add('zoomed-mode');
            zoomBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass-minus"></i> Fit';
        } else {
            resetZoom();
        }
    };

    const resetZoom = () => {
        isZoomed = false;
        lightboxImg.classList.remove('zoomed');
        lightbox.classList.remove('zoomed-mode');
        zoomBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass-plus"></i> Zoom';
    };

    zoomBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent closing lightbox
        toggleZoom();
    });

    // Also toggle zoom on image click
    lightboxImg.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleZoom();
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}


// --- Transformations --- //

function convertToAccordion(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const children = Array.from(doc.body.children);
    let newHtml = '';
    let sections = [];

    let currentSectionTitle = null;
    let currentSectionId = null;
    let currentSectionSubsections = [];
    let hasStartedAccordion = false;
    let introBuffer = '';

    children.forEach((child, index) => {
        if (child.tagName === 'H2') {
            // Close previous section if exists
            if (currentSectionTitle) {
                newHtml += `</div>`;
                // Push previous section data
                sections.push({
                    title: currentSectionTitle,
                    id: currentSectionId,
                    subsections: currentSectionSubsections
                });
            }

            if (!hasStartedAccordion && introBuffer) {
                newHtml += `<div class="intro-section">${introBuffer}</div>`;
                introBuffer = '';
            }

            hasStartedAccordion = true;
            currentSectionTitle = child.innerText;
            currentSectionId = `section-${index}`;
            currentSectionSubsections = []; // Reset subsections

            newHtml += `<button class="accordion-header active" data-target="${currentSectionId}">${currentSectionTitle}</button>`;
            newHtml += `<div id="${currentSectionId}" class="accordion-content open">`;
        } else if (child.tagName === 'H3' && hasStartedAccordion) {
            // It's an H3 inside a section
            const h3Id = `h3-${index}`;
            // Add ID to the H3 element for scrolling
            child.id = h3Id;
            currentSectionSubsections.push({
                title: child.innerText,
                id: h3Id
            });
            newHtml += child.outerHTML;
        } else {
            if (hasStartedAccordion) {
                newHtml += child.outerHTML;
            } else {
                introBuffer += child.outerHTML;
            }
        }
    });

    // Close the last section
    if (currentSectionTitle) {
        newHtml += `</div>`;
        sections.push({
            title: currentSectionTitle,
            id: currentSectionId,
            subsections: currentSectionSubsections
        });
    }

    if (!hasStartedAccordion) {
        return { html: html, sections: [] };
    }

    return { html: newHtml, sections };
}

function generateTOC(sections) {
    const widget = document.getElementById('toc-widget');
    const list = document.getElementById('toc-list');

    if (sections.length === 0) return;

    widget.style.display = 'block';

    list.innerHTML = sections.map(sec => {
        let subHtml = '';
        if (sec.subsections && sec.subsections.length > 0) {
            subHtml = `<ul class="toc-sublist">` +
                sec.subsections.map(sub => `
                    <li><a href="#" onclick="scrollToHeading('${sec.id}', '${sub.id}'); return false;" class="toc-sublink">${sub.title}</a></li>
                `).join('') +
                `</ul>`;
        }
        return `
            <li>
                <a href="#" onclick="scrollToAccordion('${sec.id}'); return false;" class="toc-link">${sec.title}</a>
                ${subHtml}
            </li>
        `;
    }).join('');
}

function scrollToAccordion(id) {
    const el = document.getElementById(id);
    if (el) {
        if (!el.classList.contains('open')) {
            el.previousElementSibling.click();
        }
        el.previousElementSibling.scrollIntoView({ behavior: 'smooth' });
    }
}

function scrollToHeading(accordionId, headingId) {
    const accordionContent = document.getElementById(accordionId);
    if (accordionContent) {
        // Ensure accordion is open
        if (!accordionContent.classList.contains('open')) {
            accordionContent.previousElementSibling.click(); // Click the header to open
        }

        // Wait a tiny bit for the opening animation to start/layout to update
        setTimeout(() => {
            const headingEl = document.getElementById(headingId);
            if (headingEl) {
                headingEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 300); // 300ms matches the transition time in CSS
    }
}

function initAccordions() {
    const acc = document.getElementsByClassName("accordion-header");
    for (let i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function () {
            this.classList.toggle("active");
            const panel = this.nextElementSibling;

            if (panel.classList.contains("open")) {
                panel.classList.remove("open");
                panel.style.maxHeight = null;
            } else {
                panel.classList.add("open");
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    }
}

function initToggleAllBtn() {
    const btn = document.getElementById('toggle-all-btn');
    if (!btn) return;

    let isExpanded = true;

    updateBtnState();

    btn.addEventListener('click', () => {
        isExpanded = !isExpanded;
        const accHeaders = document.querySelectorAll('.accordion-header');
        const accPanels = document.querySelectorAll('.accordion-content');

        accHeaders.forEach(header => {
            if (isExpanded) {
                header.classList.add('active');
            } else {
                header.classList.remove('active');
            }
        });

        accPanels.forEach(panel => {
            if (isExpanded) {
                panel.classList.add('open');
                panel.style.maxHeight = panel.scrollHeight + "px";
            } else {
                panel.classList.remove('open');
                panel.style.maxHeight = null;
            }
        });

        updateBtnState();
    });

    function updateBtnState() {
        if (isExpanded) {
            btn.innerHTML = '<i class="fa-solid fa-compress"></i> <span>全部摺疊</span>';
        } else {
            btn.innerHTML = '<i class="fa-solid fa-expand"></i> <span>全部展開</span>';
        }
    }
}
