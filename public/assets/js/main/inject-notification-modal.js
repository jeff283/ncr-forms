document.addEventListener('DOMContentLoaded', function(){
    const modalHtml = `
<div class="modal fade" id="notificationModal" tabindex="-1" aria-labelledby="notificationModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
            <div class="modal-header custom-header">
                <h5 class="modal-title" id="notificationModalLabel">
                    Notifications
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <!-- Unread Notifications -->
                <section class="mb-4">
                    <h6 class="text-danger">Unread Notifications</h6>
                    <ul id="unreadNotifications" class="list-group">
                        <li class="list-group-item">No unread notifications</li>
                    </ul>
                </section>
                
                <!-- Read Notifications Collapsible Section -->
                <section>
                    <button class="btn btn-link" type="button" data-bs-toggle="collapse" data-bs-target="#readNotificationsSection" aria-expanded="false" aria-controls="readNotificationsSection">
                        Show Read Notifications <span id="readNotificationsToggleText">(0)</span>
                    </button>
                    <div id="readNotificationsSection" class="collapse">
                        <h6 class="text-secondary">Read Notifications</h6>
                        <ul id="readNotifications" class="list-group">
                            <li class="list-group-item">No read notifications</li>
                        </ul>
                    </div>
                </section>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" id="markAllRead">Mark All as Read</button>
            </div>
        </div>
    </div>
</div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
})