let deleteShipmentId = null;

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

async function loadShipments() {
    try {
        const response = await fetch('/api/shipments');
        const shipments = await response.json();
        
        displayShipments(shipments);
        updateStats(shipments);
    } catch (error) {
        console.error('Error loading shipments:', error);
        document.getElementById('shipmentsBody').innerHTML = `
            <tr>
                <td colspan="7" class="loading" style="color: #dc3545;">
                    <i class="fas fa-exclamation-triangle"></i> Error loading shipments
                </td>
            </tr>
        `;
    }
}

function displayShipments(shipments) {
    const tbody = document.getElementById('shipmentsBody');
    
    if (shipments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="loading">
                    <i class="fas fa-box-open"></i> No shipments found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = shipments.map(shipment => `
        <tr>
            <td><strong>${shipment.trackingNumber}</strong></td>
            <td>${shipment.receiver.name}</td>
            <td>${shipment.shipment.destination}</td>
            <td>${shipment.shipment.serviceType}</td>
            <td>
                <span class="status-badge status-${shipment.currentStatus.toLowerCase().replace(' ', '-')}">
                    ${shipment.currentStatus}
                </span>
            </td>
            <td>${new Date(shipment.createdAt).toLocaleDateString()}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-success btn-sm" onclick="window.location.href='/update/${shipment._id}'">
                        <i class="fas fa-sync-alt"></i> Update
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="window.location.href='/edit/${shipment._id}'">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="openDeleteModal('${shipment._id}', '${shipment.trackingNumber}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateStats(shipments) {
    const stats = {
        total: shipments.length,
        inTransit: shipments.filter(s => s.currentStatus === 'In Transit').length,
        onHold: shipments.filter(s => s.currentStatus === 'On Hold').length,
        delivered: shipments.filter(s => s.currentStatus === 'Delivered').length
    };
    
    document.getElementById('totalShipments').textContent = stats.total;
    document.getElementById('inTransit').textContent = stats.inTransit;
    document.getElementById('onHold').textContent = stats.onHold;
    document.getElementById('delivered').textContent = stats.delivered;
}

function openDeleteModal(shipmentId, trackingNumber) {
    deleteShipmentId = shipmentId;
    document.getElementById('deleteTrackingNumber').textContent = trackingNumber;
    document.getElementById('deleteModal').classList.add('show');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('show');
    deleteShipmentId = null;
}

async function confirmDelete() {
    if (!deleteShipmentId) return;
    
    try {
        const response = await fetch(`/api/shipments/${deleteShipmentId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            closeDeleteModal();
            loadShipments();
        } else {
            alert('Error deleting shipment');
        }
    } catch (error) {
        console.error('Error deleting shipment:', error);
        alert('Error deleting shipment');
    }
}

// Search functionality
document.getElementById('searchInput')?.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#shipmentsBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
});

// Close modal on outside click
document.getElementById('deleteModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeDeleteModal();
    }
});

// Load shipments on page load
document.addEventListener('DOMContentLoaded', loadShipments);