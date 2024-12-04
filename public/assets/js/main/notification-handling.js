document.addEventListener('DOMContentLoaded', async () => {
    const empID = sessionStorage.getItem('empID');
    if (empID) {
        await loadNotifications(empID);
    }

    // Event listener for marking all as read
    document.getElementById('markAllRead').addEventListener('click', async () => {
        const unreadNotifications = document.querySelectorAll('#unreadNotifications .list-group-item');
        for (let notification of unreadNotifications) {
            const notificationId = notification.dataset.id;
            if (notificationId) {
                await markNotificationAsRead(notificationId);
            }
        }
        await loadNotifications(empID);
    });
});

async function loadNotifications(empID) {
    try {
        const response = await fetch(`/api/notifications/${empID}`);
        const notifications = await response.json();

        if (response.ok) {
            const unreadList = document.getElementById('unreadNotifications');
            const readList = document.getElementById('readNotifications');
            unreadList.innerHTML = '';
            readList.innerHTML = '';  

            let readCount = 0;

            notifications.forEach(notification => {
                const li = document.createElement('li');
                li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                li.textContent = notification.message;
                li.dataset.id = notification.id; 

                const statusBadge = document.createElement('span');
                statusBadge.classList.add('badge');

                // View button
                const viewButton = document.createElement('button');
                viewButton.classList.add('btn', 'btn-link', 'btn-sm', 'text-primary');
                viewButton.textContent = 'View NCR';
                viewButton.addEventListener('click', (e) => {
                    const ncrFormID = notification.ncrFormID;
                    markNotificationAsRead(notification.id);
                    editNCR(ncrFormID);
                });

                if (notification.status === 'unread') {
                    li.classList.add('unread');
                    statusBadge.textContent = 'Unread';
                    statusBadge.classList.add('bg-warning', 'text-dark');
                    unreadList.appendChild(li);
                } else {
                    statusBadge.textContent = 'Read';
                    statusBadge.classList.add('bg-success');
                    readList.appendChild(li);
                    readCount++;
                }

                // Append badge and "View" button
                li.appendChild(statusBadge);
                li.appendChild(viewButton);
            });

            // If no notifications, add default message
            if (!unreadList.hasChildNodes()) {
                unreadList.innerHTML = '<li class="list-group-item">No unread notifications</li>';
            }
            if (!readList.hasChildNodes()) {
                readList.innerHTML = '<li class="list-group-item">No read notifications</li>';
            }

            // Update notification count
            updateNotificationCount(notifications);

            // Update read notifications toggle button text
            const readNotificationsToggleText = document.getElementById('readNotificationsToggleText');
            readNotificationsToggleText.textContent = `(${readCount})`;
        } else {
            console.error('Error fetching notifications:', notifications.error);
        }
    } catch (error) {
        console.error('An error occurred while fetching notifications:', error);
    }
}

function updateNotificationCount(notifications) {
    const unreadCount = notifications.filter(notification => notification.status === 'unread').length;
    const notificationCountElement = document.getElementById('notificationCount');

    if (notificationCountElement) {
        notificationCountElement.textContent = unreadCount;
        notificationCountElement.style.display = unreadCount > 0 ? '' : 'none';
    }
}

async function markNotificationAsRead(notificationId) {
    try {
        const response = await fetch(`/api/notifications/read/${notificationId}`, { method: 'POST' });
        const result = await response.json();

        if (!response.ok) {
            console.error('Error marking notification as read:', result.error);
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

function editNCR(ncrFormID) {
    const mode = 'edit';
    window.location.href = `edit-ncr.html?ncrFormID=${ncrFormID}`;
    sessionStorage.setItem('mode', mode);
}
