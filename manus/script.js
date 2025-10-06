// Faculty AI Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initializeTabs();
    initializeCopyButtons();
    initializeKeyboardNavigation();
    initializeAccessibilityFeatures();
});

// Tab functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            switchTab(button.dataset.tab);
        });

        // Keyboard navigation for tabs
        button.addEventListener('keydown', (e) => {
            handleTabKeydown(e, index);
        });
    });

    // Set initial active tab
    switchTab('intro');
}

function switchTab(targetTab) {
    const tabButtons = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // Remove active class from all tabs and contents
    tabButtons.forEach(button => {
        button.classList.remove('active');
        button.setAttribute('aria-selected', 'false');
        button.setAttribute('tabindex', '-1');
    });

    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    // Add active class to target tab and content
    const activeButton = document.querySelector(`[data-tab="${targetTab}"]`);
    const activeContent = document.getElementById(targetTab);

    if (activeButton && activeContent) {
        activeButton.classList.add('active');
        activeButton.setAttribute('aria-selected', 'true');
        activeButton.setAttribute('tabindex', '0');
        activeContent.classList.add('active');

        // Announce tab change to screen readers
        announceToScreenReader(`Switched to ${activeButton.textContent} tab`);
    }
}

// Keyboard navigation for tabs
function handleTabKeydown(e, currentIndex) {
    const tabButtons = document.querySelectorAll('.nav-tab');
    let newIndex;

    switch (e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            newIndex = currentIndex > 0 ? currentIndex - 1 : tabButtons.length - 1;
            break;
        case 'ArrowRight':
            e.preventDefault();
            newIndex = currentIndex < tabButtons.length - 1 ? currentIndex + 1 : 0;
            break;
        case 'Home':
            e.preventDefault();
            newIndex = 0;
            break;
        case 'End':
            e.preventDefault();
            newIndex = tabButtons.length - 1;
            break;
        case 'Enter':
        case ' ':
            e.preventDefault();
            switchTab(tabButtons[currentIndex].dataset.tab);
            return;
        default:
            return;
    }

    // Focus and activate the new tab
    tabButtons[newIndex].focus();
    switchTab(tabButtons[newIndex].dataset.tab);
}

// Copy to clipboard functionality
function initializeCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-btn');

    copyButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const promptText = button.parentElement.querySelector('code');
            
            if (promptText) {
                try {
                    await copyToClipboard(promptText.textContent);
                    showCopyFeedback(button);
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                    showCopyError(button);
                }
            }
        });
    });
}

async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        // Use modern clipboard API
        await navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
        } finally {
            textArea.remove();
        }
    }
}

function showCopyFeedback(button) {
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.style.backgroundColor = '#28a745';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
    }, 2000);

    announceToScreenReader('Prompt copied to clipboard');
}

function showCopyError(button) {
    const originalText = button.textContent;
    button.textContent = 'Error';
    button.style.backgroundColor = '#dc3545';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
    }, 2000);

    announceToScreenReader('Failed to copy prompt');
}

// Accessibility features
function initializeAccessibilityFeatures() {
    // Add skip link
    addSkipLink();
    
    // Enhance focus management
    enhanceFocusManagement();
    
    // Add ARIA live region for announcements
    addLiveRegion();
}

function addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--illinois-orange);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

function enhanceFocusManagement() {
    // Ensure proper focus order for agent links
    const agentLinks = document.querySelectorAll('.agent-link');
    
    agentLinks.forEach(link => {
        link.addEventListener('focus', () => {
            link.parentElement.parentElement.style.transform = 'translateY(-5px)';
            link.parentElement.parentElement.style.boxShadow = 'var(--shadow-hover)';
        });
        
        link.addEventListener('blur', () => {
            link.parentElement.parentElement.style.transform = '';
            link.parentElement.parentElement.style.boxShadow = '';
        });
    });
}

function addLiveRegion() {
    const liveRegion = document.createElement('div');
    liveRegion.id = 'live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
    `;
    document.body.appendChild(liveRegion);
}

function announceToScreenReader(message) {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
        liveRegion.textContent = message;
        
        // Clear the message after a short delay
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }
}

// Keyboard navigation enhancement
function initializeKeyboardNavigation() {
    // Add keyboard support for prompt text areas
    const promptTexts = document.querySelectorAll('.prompt-text');
    
    promptTexts.forEach(promptText => {
        promptText.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const copyButton = promptText.querySelector('.copy-btn');
                if (copyButton) {
                    copyButton.click();
                }
            }
        });
    });

    // Add escape key handler for better UX
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Remove focus from any focused element
            if (document.activeElement && document.activeElement.blur) {
                document.activeElement.blur();
            }
        }
    });
}

// Smooth scrolling for anchor links
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Set focus to target element for accessibility
            targetElement.focus();
        }
    }
});

// Add loading states for external links
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.getAttribute('target') === '_blank') {
        const link = e.target;
        const originalText = link.textContent;
        
        // Add visual feedback
        link.style.opacity = '0.7';
        
        setTimeout(() => {
            link.style.opacity = '';
        }, 500);
        
        announceToScreenReader(`Opening ${originalText} in new tab`);
    }
});

// Responsive navigation handling
function handleResponsiveNavigation() {
    const navContainer = document.querySelector('.nav-container');
    const navTabs = document.querySelectorAll('.nav-tab');
    
    // Check if navigation is overflowing
    if (navContainer.scrollWidth > navContainer.clientWidth) {
        navContainer.style.justifyContent = 'flex-start';
        
        // Add scroll indicators
        addScrollIndicators(navContainer);
    }
}

function addScrollIndicators(container) {
    const leftIndicator = document.createElement('div');
    const rightIndicator = document.createElement('div');
    
    leftIndicator.className = 'scroll-indicator left';
    rightIndicator.className = 'scroll-indicator right';
    
    leftIndicator.innerHTML = 'â—€';
    rightIndicator.innerHTML = 'â–¶';
    
    const indicatorStyles = `
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(255, 255, 255, 0.9);
        padding: 0.5rem;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        z-index: 10;
        transition: opacity 0.3s;
    `;
    
    leftIndicator.style.cssText = indicatorStyles + 'left: 10px;';
    rightIndicator.style.cssText = indicatorStyles + 'right: 10px;';
    
    container.parentElement.style.position = 'relative';
    container.parentElement.appendChild(leftIndicator);
    container.parentElement.appendChild(rightIndicator);
    
    // Add scroll functionality
    leftIndicator.addEventListener('click', () => {
        container.scrollBy({ left: -200, behavior: 'smooth' });
    });
    
    rightIndicator.addEventListener('click', () => {
        container.scrollBy({ left: 200, behavior: 'smooth' });
    });
    
    // Update indicator visibility based on scroll position
    function updateIndicators() {
        leftIndicator.style.opacity = container.scrollLeft > 0 ? '1' : '0.3';
        rightIndicator.style.opacity = 
            container.scrollLeft < container.scrollWidth - container.clientWidth ? '1' : '0.3';
    }
    
    container.addEventListener('scroll', updateIndicators);
    updateIndicators();
}

// Initialize responsive features on load and resize
window.addEventListener('load', handleResponsiveNavigation);
window.addEventListener('resize', handleResponsiveNavigation);

// Add example prompts (these would be filled in with actual content)
function addExamplePrompts() {
    const promptExamples = {
        'course-design': [
            "Help me create a comprehensive outline for a 15-week undergraduate course on [subject]. Include weekly topics, key learning objectives, and suggested activities for each week.",
            "Generate 3-5 measurable learning objectives for a course module on [specific topic] that align with Bloom's taxonomy levels of analysis and synthesis.",
            "Suggest 5 engaging online discussion prompts for a course on [subject] that encourage critical thinking and peer interaction."
        ],
        'assignments': [
            "Design a UDL-compliant assignment for [course subject] that provides multiple means of representation, engagement, and expression while assessing [specific learning objective].",
            "Create 10 multiple-choice quiz questions with explanations for [topic], including questions at different cognitive levels from recall to application.",
            "Suggest 3 active learning activities for a 50-minute class session on [topic] that can accommodate both in-person and remote students."
        ],
        'study-aids': [
            "Help me create a study schedule for [course/exam] over the next [time period], breaking down topics and incorporating spaced repetition.",
            "Explain [complex concept] using analogies and examples that would help an undergraduate student understand the key principles."
        ],
        'accessible-docs': [
            "Generate descriptive alt text for this image that conveys both the visual content and its educational purpose in the context of [subject area].",
            "Review this document for accessibility issues and suggest improvements for screen reader compatibility and visual accessibility."
        ]
    };

    // Update prompt cards with actual examples
    Object.keys(promptExamples).forEach(tabId => {
        const tabContent = document.getElementById(tabId);
        if (tabContent) {
            const promptCards = tabContent.querySelectorAll('.prompt-card');
            promptCards.forEach((card, index) => {
                const codeElement = card.querySelector('code');
                if (codeElement && promptExamples[tabId][index]) {
                    codeElement.textContent = promptExamples[tabId][index];
                }
            });
        }
    });
}

// Add agent descriptions
function addAgentDescriptions() {
    const agentDescriptions = {
        'Learning Objective Consultant': 'Helps faculty create clear, measurable learning objectives aligned with course goals and Bloom\'s taxonomy.',
        'Single Point Rubric Builder': 'Assists in creating focused rubrics that clearly communicate expectations and provide meaningful feedback.',
        'CourseCraft': 'Comprehensive course design tool that helps structure curriculum, activities, and assessments.',
        'TILT Assignment Creator': 'Guides the creation of transparent assignments using the TILT (Transparency in Learning and Teaching) framework.',
        '5E Lesson Planner': 'Helps design lessons using the 5E instructional model: Engage, Explore, Explain, Elaborate, Evaluate.',
        'UDL Assignment Guidance': 'Provides guidance for creating assignments that follow Universal Design for Learning principles.',
        'The Study Cycle Coach': 'Helps students develop effective study strategies using evidence-based learning techniques.',
        'Cognitive Compass': 'Assists students in understanding their learning preferences and developing metacognitive skills.',
        'Debate Challenger': 'Engages students in structured debates and critical thinking exercises on various topics.',
        'Alt Tag Generator': 'Creates descriptive alternative text for images to improve accessibility and screen reader compatibility.',
        'Course Design Standards': 'Helps ensure courses meet quality standards and best practices for online and hybrid learning.'
    };

    // Update agent description placeholders
    document.querySelectorAll('.agent-description').forEach(desc => {
        const agentName = desc.parentElement.querySelector('h4 a, h4').textContent.trim();
        if (agentDescriptions[agentName]) {
            desc.textContent = agentDescriptions[agentName];
            desc.style.fontStyle = 'normal';
        }
    });
}

// Initialize content after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add a small delay to ensure all elements are rendered
    setTimeout(() => {
        addExamplePrompts();
        addAgentDescriptions();
    }, 100);
});

// Add performance monitoring
function addPerformanceMonitoring() {
    // Monitor tab switching performance
    const tabSwitchTimes = [];
    
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const startTime = performance.now();
            
            requestAnimationFrame(() => {
                const endTime = performance.now();
                tabSwitchTimes.push(endTime - startTime);
                
                // Log if performance is poor
                if (endTime - startTime > 100) {
                    console.warn('Slow tab switch detected:', endTime - startTime, 'ms');
                }
            });
        });
    });
}

// Initialize performance monitoring in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    addPerformanceMonitoring();
}

