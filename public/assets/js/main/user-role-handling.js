function updateProfileSection() {
    const userRole = sessionStorage.getItem('userRole'); // Get the stored user role
    const userName = sessionStorage.getItem('userName'); // Get the stored user name
    const userPosID = sessionStorage.getItem('userPosID'); // Get the stored user position ID
    const profileContainer = document.querySelector('.profile');

    if(userRole == "Administrator"){
        enableEmployeeNavItem();
        enableCreateNCR();
    }

    if(userRole == "Quality"){
        enableCreateNCR();
    }

    // Check if the profile container exists
    if (!profileContainer) return;

    // Clear existing profile
    profileContainer.innerHTML = '';

    // Fetch positions data
    fetch('../assets/data/positions.json') 
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(positions => {
            // Find the position description based on userPosID
            const position = positions.find(pos => pos.posID === parseInt(userPosID, 10)); 
            const roleDescription = position ? position.posDescription : 'Unknown Position';

            // Define profile content
            const profileContent = `
                <div class="profile-details">
                    <img src="../assets/images/crossfire_logo.PNG" alt="" />
                    <div class="name-job">
                        <div class="name">${userName}</div>
                        <div class="job">${userRole}</div>
                    </div>
                </div>
                <i class="bi bi-box-arrow-left" id="log-out"></i>
            `;

            // Set the profile content
            profileContainer.innerHTML = profileContent;

            // Add event listener to the log-out button
            const logOutButton = document.getElementById('log-out');
            if (logOutButton) {
                logOutButton.addEventListener('click', function() {
                    // Clear session storage on logout
                    sessionStorage.removeItem('userRole');
                    sessionStorage.removeItem('userName');
                    sessionStorage.removeItem('userPosID'); 

                    // Redirect to login page
                    window.location.href = 'login.html'; 
                });
            }
        })
        .catch(error => {
            console.error('Error loading positions data:', error);
            // Handle error appropriately
            profileContainer.innerHTML = `<p>Error loading profile data. Please try again later.</p>`;
        });
}

function enableEmployeeNavItem(){
    document.getElementById('employees-nav').style.display = "block";
}

function enableCreateNCR(){
    if (window.location.pathname === '/ncr-log.html') {
        document.getElementById('new-ncr-btn').style.display = "block";
    }
    document.getElementById('create-ncr-nav').style.display = "block";
}

// Call the function on page load to set the profile section
window.onload = updateProfileSection;
