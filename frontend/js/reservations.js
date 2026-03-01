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

async function fetchReservations() {
    try {
        const status = document.getElementById('filterStatus').value;
        const url = status ? `${API_URL}/reservations?status=${status}` : `${API_URL}/reservations`;
        const response = await fetch(url, { headers });
        const reservations = await response.json();
        const tbody = document.getElementById('reservationList');

        if (reservations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="empty-state">No se encontraron reservas.</td></tr>';
            return;
        }

        tbody.innerHTML = reservations.map(r => `
            <tr>
                <td>${r.id}</td>
                <td>${r.Guest ? `${r.Guest.firstName} ${r.Guest.lastName}` : 'N/A'}</td>
                <td>${r.Room ? r.Room.roomNumber : 'N/A'}</td>
                <td><span class="badge badge-${r.Room ? r.Room.type : ''}">${r.Room ? r.Room.type : 'N/A'}</span></td>
                <td>${new Date(r.checkIn).toLocaleDateString()}</td>
                <td>${new Date(r.checkOut).toLocaleDateString()}</td>
                <td style="color: var(--accent); font-weight: 600;">$${r.totalPrice.toFixed(2)}</td>
                <td><span class="badge badge-${r.status}">${r.status}</span></td>
                <td>
                    <div class="btn-group">
                        <a href="reservation-detail.html?id=${r.id}" class="btn btn-outline btn-sm">🔍 Ver</a>
                        <button class="btn btn-danger btn-sm" onclick="deleteReservation(${r.id})">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error fetching reservations:', error);
    }
}

async function deleteReservation(id) {
    if (!confirm('¿Está seguro de eliminar esta reserva?')) return;
    try {
        const response = await fetch(`${API_URL}/reservations/${id}`, {
            method: 'DELETE',
            headers
        });
        if (response.ok) {
            showToast('Reserva eliminada');
            fetchReservations();
        } else {
            showToast('Error al eliminar', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

document.getElementById('filterStatus').addEventListener('change', fetchReservations);

fetchReservations();
