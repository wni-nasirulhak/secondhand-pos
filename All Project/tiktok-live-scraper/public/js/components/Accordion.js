// Accordion Component for collapsible sections
export class Accordion {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            defaultOpen: options.defaultOpen || [],
            storage: options.storage || null,
            storageKey: options.storageKey || 'accordion_state',
            ...options
        };
        this.sections = [];
        this.state = this.loadState();
    }

    addSection(title, content, icon = '📋', options = {}) {
        const id = `section-${this.sections.length}`;
        const isOpen = this.state[id] !== undefined ? this.state[id] : 
                       (this.options.defaultOpen.includes(id) || options.defaultOpen);

        const section = {
            id,
            title,
            content,
            icon,
            isOpen,
            element: null
        };

        this.sections.push(section);
        return section;
    }

    render() {
        this.container.innerHTML = `
            <div class="accordion">
                ${this.sections.map(section => this.renderSection(section)).join('')}
            </div>
        `;

        this.attachEvents();
    }

    renderSection(section) {
        return `
            <div class="accordion-section ${section.isOpen ? 'open' : ''}" data-section-id="${section.id}">
                <div class="accordion-header" data-header="${section.id}">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 20px;">${section.icon}</span>
                        <strong style="font-size: 16px;">${section.title}</strong>
                    </div>
                    <span class="accordion-arrow" style="
                        font-size: 18px;
                        transition: transform 0.3s ease;
                        transform: rotate(${section.isOpen ? '180deg' : '0deg'});
                    ">▼</span>
                </div>
                <div class="accordion-content" data-content="${section.id}" style="
                    max-height: ${section.isOpen ? '2000px' : '0'};
                    overflow: hidden;
                    transition: max-height 0.3s ease;
                ">
                    <div class="accordion-content-inner" style="padding: 15px 0;">
                        ${typeof section.content === 'string' ? section.content : ''}
                    </div>
                </div>
            </div>
        `;
    }

    attachEvents() {
        this.sections.forEach(section => {
            const header = this.container.querySelector(`[data-header="${section.id}"]`);
            const content = this.container.querySelector(`[data-content="${section.id}"]`);
            const arrow = header?.querySelector('.accordion-arrow');
            const sectionEl = this.container.querySelector(`[data-section-id="${section.id}"]`);

            if (header && content) {
                // Store elements
                section.element = { header, content, arrow, sectionEl };

                // Render content function if it's a function
                if (typeof section.content === 'function') {
                    const contentInner = content.querySelector('.accordion-content-inner');
                    contentInner.innerHTML = '';
                    section.content(contentInner);
                }

                header.addEventListener('click', () => {
                    this.toggle(section.id);
                });
            }
        });
    }

    toggle(sectionId) {
        const section = this.sections.find(s => s.id === sectionId);
        if (!section || !section.element) return;

        section.isOpen = !section.isOpen;

        // Update UI
        const { content, arrow, sectionEl } = section.element;
        
        if (section.isOpen) {
            content.style.maxHeight = '2000px';
            arrow.style.transform = 'rotate(180deg)';
            sectionEl.classList.add('open');
        } else {
            content.style.maxHeight = '0';
            arrow.style.transform = 'rotate(0deg)';
            sectionEl.classList.remove('open');
        }

        // Save state
        this.saveState();
    }

    open(sectionId) {
        const section = this.sections.find(s => s.id === sectionId);
        if (!section || section.isOpen) return;
        this.toggle(sectionId);
    }

    close(sectionId) {
        const section = this.sections.find(s => s.id === sectionId);
        if (!section || !section.isOpen) return;
        this.toggle(sectionId);
    }

    loadState() {
        if (!this.options.storage) return {};
        try {
            const saved = this.options.storage.get(this.options.storageKey);
            return saved || {};
        } catch {
            return {};
        }
    }

    saveState() {
        if (!this.options.storage) return;
        const state = {};
        this.sections.forEach(section => {
            state[section.id] = section.isOpen;
        });
        this.options.storage.set(this.options.storageKey, state);
    }
}
