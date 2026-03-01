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

const urlParams = new URLSearchParams(window.location.search);
const reservationId = urlParams.get('id');

if (!reservationId) {
    window.location.href = 'reservations.html';
}

document.getElementById('reservationId').textContent = reservationId;

async function loadReservation() {
    try {
        const response = await fetch(`${API_URL}/reservations/${reservationId}`, { headers });
        if (!response.ok) {
            showToast('Reserva no encontrada', 'error');
            return;
        }

        const r = await response.json();

        // Guest info
        if (r.Guest) {
            document.getElementById('guestName').textContent = `${r.Guest.firstName} ${r.Guest.lastName}`;
            document.getElementById('guestEmail').textContent = r.Guest.email;
            document.getElementById('guestPhone').textContent = r.Guest.phone || '—';
            document.getElementById('guestDoc').textContent = r.Guest.documentId;
        }

        // Room info
        if (r.Room) {
            document.getElementById('roomNumber').textContent = r.Room.roomNumber;
            document.getElementById('roomType').innerHTML = `<span class="badge badge-${r.Room.type}">${r.Room.type}</span>`;
            document.getElementById('roomPrice').textContent = `$${r.Room.pricePerNight.toFixed(2)}`;
            document.getElementById('roomStatus').innerHTML = `<span class="badge badge-${r.Room.status}">${r.Room.status}</span>`;
        }

        // Dates
        const checkIn = new Date(r.checkIn);
        const checkOut = new Date(r.checkOut);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        document.getElementById('checkIn').textContent = checkIn.toLocaleDateString();
        document.getElementById('checkOut').textContent = checkOut.toLocaleDateString();
        document.getElementById('nights').textContent = nights;

        // Billing
        document.getElementById('totalPrice').textContent = `$${r.totalPrice.toFixed(2)}`;
        document.getElementById('reservationStatus').innerHTML = `<span class="badge badge-${r.status}">${r.status}</span>`;
        document.getElementById('createdAt').textContent = new Date(r.createdAt).toLocaleString();

        // Action buttons
        const actionButtons = document.getElementById('actionButtons');
        actionButtons.innerHTML = '';

        if (r.status === 'confirmed') {
            actionButtons.innerHTML += `<button class="btn btn-success" onclick="checkIn()">✅ Check-In</button>`;
            actionButtons.innerHTML += `<button class="btn btn-danger" onclick="cancelReservation()">❌ Cancelar</button>`;
        } else if (r.status === 'checked_in') {
            actionButtons.innerHTML += `<button class="btn btn-warning" onclick="checkOut()">🚪 Check-Out</button>`;
        }

        actionButtons.innerHTML += `<a href="reservations.html" class="btn btn-outline">← Volver</a>`;

    } catch (error) {
        console.error('Error loading reservation:', error);
    }
}

async function checkIn() {
    try {
        const response = await fetch(`${API_URL}/reservations/${reservationId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ status: 'checked_in' })
        });
        if (response.ok) {
            showToast('Check-In realizado');
            loadReservation();
        }
    } catch (error) {
        showToast('Error', 'error');
    }
}

async function checkOut() {
    try {
        const response = await fetch(`${API_URL}/reservations/${reservationId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ status: 'checked_out' })
        });
        if (response.ok) {
            showToast('Check-Out realizado');
            loadReservation();
        }
    } catch (error) {
        showToast('Error', 'error');
    }
}

async function cancelReservation() {
    if (!confirm('¿Está seguro de cancelar esta reserva?')) return;
    try {
        const response = await fetch(`${API_URL}/reservations/${reservationId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ status: 'cancelled' })
        });
        if (response.ok) {
            showToast('Reserva cancelada');
            loadReservation();
        }
    } catch (error) {
        showToast('Error', 'error');
    }
}

loadReservation();
