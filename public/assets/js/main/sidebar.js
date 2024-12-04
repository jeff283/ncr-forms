// if sidebar is collapsed, it adds a new class to it called 'collapsed' which alters how it looks through css

// document.addEventListener('DOMContentLoaded', function() {
//     const sidebar = document.getElementById('sidebar');
//     const toggleBtn = document.getElementById('btn-close');
//     const homeContent = document.querySelector('.home-content');

//     if (localStorage.getItem('sidebarCollapsed') === 'true') {
//         sidebar.classList.add('collapsed');
//         homeContent.classList.add('expanded');
//     } else {
//         sidebar.classList.remove('collapsed');
//         homeContent.classList.remove('expanded');
//     }

//     // event listener for toggle button (hamburger icon)
//     toggleBtn.addEventListener('click', function() {
//         sidebar.classList.toggle('collapsed');
//         homeContent.classList.toggle('expanded');

//         const isCollapsed = sidebar.classList.contains('collapsed');
//         localStorage.setItem('sidebarCollapsed', isCollapsed);
//     });
// });

// document.getElementById('createNCRLink').addEventListener('click', function(event) {
//     event.preventDefault();
//     window.location.href = 'non-conformance-report.html?' + new URLSearchParams({ mode: 'create' }).toString();
// });

document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('btn-close');
    const homeContent = document.querySelector('.home-content');
    let tooltipInstances = [];

    // Initialize sidebar collapsed state from localStorage
    const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isSidebarCollapsed) {
        sidebar.classList.add('collapsed');
        homeContent.classList.add('expanded');
        enableTooltips();
    } else {
        sidebar.classList.remove('collapsed');
        homeContent.classList.remove('expanded');
        disableTooltips();
    }

    // Toggle sidebar collapsed state
    toggleBtn.addEventListener('click', function () {
        const isCollapsed = sidebar.classList.toggle('collapsed');
        homeContent.classList.toggle('expanded');
        localStorage.setItem('sidebarCollapsed', isCollapsed);

        if (isCollapsed) {
            enableTooltips();
        } else {
            disableTooltips();
        }
    });

    // Enable tooltips for collapsed sidebar
    function enableTooltips() {
        const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipElements.forEach((el) => {
            const title = el.getAttribute('data-title') || el.getAttribute('title');
            if (title) {
                el.setAttribute('data-title', title); // Store in data-title
                el.setAttribute('title', title); // Restore title for Bootstrap tooltips
            }
        });

        tooltipInstances = [...tooltipElements].map((el) => new bootstrap.Tooltip(el));
    }

    // Disable tooltips for expanded sidebar
    function disableTooltips() {
        tooltipInstances.forEach((tooltip) => {
            // Explicitly hide tooltips before disposing
            if (tooltip._element) {
                tooltip.hide();
            }
            tooltip.dispose();
        });
        tooltipInstances = [];

        const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipElements.forEach((el) => {
            const title = el.getAttribute('title');
            if (title) {
                el.setAttribute('data-title', title); // Store in data-title
                el.removeAttribute('title'); // Prevent native browser tooltips
            }
        });
    }
});