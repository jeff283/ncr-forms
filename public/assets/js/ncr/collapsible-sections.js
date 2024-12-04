// Function which allows for collapsing sections
document.querySelectorAll('.collapsible').forEach((legend, index) => {
    const sectionId = legend.id.replace('legend-', 'section-');
    const section = document.getElementById(sectionId);

    // Set the first collapsible section to be open by default
    section.style.display = index === 0 ? 'block' : 'none';

    legend.addEventListener('click', () => {
        // Toggle the clicked section without affecting others
        section.style.display = section.style.display === 'block' ? 'none' : 'block';
    });
});
