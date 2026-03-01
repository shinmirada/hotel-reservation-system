const token = localStorage.getItem('token');
if (!token) window.location.href = 'index.html';

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : '/api';

const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Load all data concurrently with Promise.all
async function loadReportData() {
    try {
        const [reservationsRes, roomsRes] = await Promise.all([
            fetch(`${API_URL}/reservations`, { headers }),
            fetch(`${API_URL}/rooms`, { headers })
        ]);

        const [reservations, rooms] = await Promise.all([
            reservationsRes.json(),
            roomsRes.json()
        ]);

        renderCheckInList(reservations.filter(r => r.status === 'confirmed'));
        renderCheckOutList(reservations.filter(r => r.status === 'checked_in'));
        renderRoomMaintenanceList(rooms);

    } catch (error) {
        console.error('Error loading report data:', error);
    }
}

function renderCheckInList(reservations) {
    const tbody = document.getElementById('checkInList');
    if (reservations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No hay reservas confirmadas pendientes de check-in.</td></tr>';
        return;
    }
    tbody.innerHTML = reservations.map(r => `
        <tr>
            <td><input type="checkbox" class="checkin-cb" value="${r.id}"></td>
            <td>${r.id}</td>
            <td>${r.Guest ? `${r.Guest.firstName} ${r.Guest.lastName}` : 'N/A'}</td>
            <td>${r.Room ? r.Room.roomNumber : 'N/A'}</td>
            <td>${new Date(r.checkIn).toLocaleDateString()}</td>
            <td><span class="badge badge-${r.status}">${r.status}</span></td>
        </tr>
    `).join('');
}

function renderCheckOutList(reservations) {
    const tbody = document.getElementById('checkOutList');
    if (reservations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No hay reservas con check-in pendientes de check-out.</td></tr>';
        return;
    }
    tbody.innerHTML = reservations.map(r => `
        <tr>
            <td><input type="checkbox" class="checkout-cb" value="${r.id}"></td>
            <td>${r.id}</td>
            <td>${r.Guest ? `${r.Guest.firstName} ${r.Guest.lastName}` : 'N/A'}</td>
            <td>${r.Room ? r.Room.roomNumber : 'N/A'}</td>
            <td>${new Date(r.checkOut).toLocaleDateString()}</td>
            <td><span class="badge badge-${r.status}">${r.status}</span></td>
        </tr>
    `).join('');
}

function renderRoomMaintenanceList(rooms) {
    const tbody = document.getElementById('roomMaintenanceList');
    const statusLabels = { available: 'Disponible', occupied: 'Ocupada', maintenance: 'Mantenimiento' };
    if (rooms.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No hay habitaciones.</td></tr>';
        return;
    }
    tbody.innerHTML = rooms.map(r => `
        <tr>
            <td><input type="checkbox" class="room-cb" value="${r.id}"></td>
            <td>${r.id}</td>
            <td>${r.roomNumber}</td>
            <td><span class="badge badge-${r.type}">${r.type}</span></td>
            <td>$${r.pricePerNight.toFixed(2)}</td>
            <td><span class="badge badge-${r.status}">${statusLabels[r.status] || r.status}</span></td>
        </tr>
    `).join('');
}

// Select all checkboxes
document.getElementById('selectAllCheckIn').addEventListener('change', (e) => {
    document.querySelectorAll('.checkin-cb').forEach(cb => cb.checked = e.target.checked);
});
document.getElementById('selectAllCheckOut').addEventListener('change', (e) => {
    document.querySelectorAll('.checkout-cb').forEach(cb => cb.checked = e.target.checked);
});
document.getElementById('selectAllRooms').addEventListener('change', (e) => {
    document.querySelectorAll('.room-cb').forEach(cb => cb.checked = e.target.checked);
});

// Batch Check-In using Promise.all (via API endpoint that also uses Promise.all on the backend)
document.getElementById('batchCheckInBtn').addEventListener('click', async () => {
    const selected = [...document.querySelectorAll('.checkin-cb:checked')].map(cb => parseInt(cb.value));
    if (selected.length === 0) {
        showToast('Seleccione al menos una reserva', 'info');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/reservations/batch-checkin`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ reservationIds: selected })
        });

        if (response.ok) {
            const results = await response.json();
            showToast(`Check-in realizado para ${results.length} reservas`);
            loadReportData();
        } else {
            showToast('Error en batch check-in', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
});

// Batch Check-Out using Promise.all
document.getElementById('batchCheckOutBtn').addEventListener('click', async () => {
    const selected = [...document.querySelectorAll('.checkout-cb:checked')].map(cb => parseInt(cb.value));
    if (selected.length === 0) {
        showToast('Seleccione al menos una reserva', 'info');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/reservations/batch-checkout`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ reservationIds: selected })
        });

        if (response.ok) {
            const results = await response.json();
            showToast(`Check-out realizado para ${results.length} reservas`);
            loadReportData();
        } else {
            showToast('Error en batch check-out', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
});

// Batch Maintenance using Promise.all
document.getElementById('batchMaintenanceBtn').addEventListener('click', async () => {
    const selected = [...document.querySelectorAll('.room-cb:checked')].map(cb => parseInt(cb.value));
    if (selected.length === 0) {
        showToast('Seleccione al menos una habitación', 'info');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/rooms/batch-status`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ roomIds: selected, status: 'maintenance' })
        });

        if (response.ok) {
            const results = await response.json();
            showToast(`${results.length} habitaciones marcadas en mantenimiento`);
            loadReportData();
        } else {
            showToast('Error en operación batch', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
});

// Batch Available using Promise.all
document.getElementById('batchAvailableBtn').addEventListener('click', async () => {
    const selected = [...document.querySelectorAll('.room-cb:checked')].map(cb => parseInt(cb.value));
    if (selected.length === 0) {
        showToast('Seleccione al menos una habitación', 'info');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/rooms/batch-status`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ roomIds: selected, status: 'available' })
        });

        if (response.ok) {
            const results = await response.json();
            showToast(`${results.length} habitaciones marcadas como disponibles`);
            loadReportData();
        } else {
            showToast('Error en operación batch', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
});

loadReportData();
