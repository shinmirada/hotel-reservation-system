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

let availableRooms = [];

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

async function loadFormData() {
    try {
        // Load guests and available rooms concurrently with Promise.all
        const [guestsRes, roomsRes] = await Promise.all([
            fetch(`${API_URL}/guests`, { headers }),
            fetch(`${API_URL}/rooms/available`, { headers })
        ]);

        const [guests, rooms] = await Promise.all([
            guestsRes.json(),
            roomsRes.json()
        ]);

        availableRooms = rooms;

        const guestSelect = document.getElementById('nGuestId');
        guests.forEach(g => {
            const opt = document.createElement('option');
            opt.value = g.id;
            opt.textContent = `${g.firstName} ${g.lastName} (${g.documentId})`;
            guestSelect.appendChild(opt);
        });

        const roomSelect = document.getElementById('nRoomId');
        rooms.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.id;
            opt.textContent = `${r.roomNumber} - ${r.type} ($${r.pricePerNight}/noche)`;
            roomSelect.appendChild(opt);
        });
    } catch (error) {
        console.error('Error loading form data:', error);
    }
}

// Update cost summary on changes
function updateSummary() {
    const roomId = document.getElementById('nRoomId').value;
    const checkIn = document.getElementById('nCheckIn').value;
    const checkOut = document.getElementById('nCheckOut').value;

    const room = availableRooms.find(r => r.id == roomId);

    if (room) {
        document.getElementById('summaryRoom').textContent = room.roomNumber;
        document.getElementById('summaryType').textContent = room.type;
        document.getElementById('summaryPrice').textContent = `$${room.pricePerNight.toFixed(2)}`;
    } else {
        document.getElementById('summaryRoom').textContent = '—';
        document.getElementById('summaryType').textContent = '—';
        document.getElementById('summaryPrice').textContent = '—';
    }

    if (checkIn && checkOut && room) {
        const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
        if (nights > 0) {
            document.getElementById('summaryNights').textContent = nights;
            document.getElementById('summaryTotal').textContent = `$${(room.pricePerNight * nights).toFixed(2)}`;
        } else {
            document.getElementById('summaryNights').textContent = '—';
            document.getElementById('summaryTotal').textContent = '$0.00';
        }
    } else {
        document.getElementById('summaryNights').textContent = '—';
        document.getElementById('summaryTotal').textContent = '$0.00';
    }
}

document.getElementById('nRoomId').addEventListener('change', updateSummary);
document.getElementById('nCheckIn').addEventListener('change', updateSummary);
document.getElementById('nCheckOut').addEventListener('change', updateSummary);

document.getElementById('newReservationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const response = await fetch(`${API_URL}/reservations`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                guestId: parseInt(document.getElementById('nGuestId').value),
                roomId: parseInt(document.getElementById('nRoomId').value),
                checkIn: document.getElementById('nCheckIn').value,
                checkOut: document.getElementById('nCheckOut').value,
            })
        });

        if (response.ok) {
            showToast('Reserva creada exitosamente');
            setTimeout(() => window.location.href = 'reservations.html', 1500);
        } else {
            const err = await response.json();
            showToast(err.message || 'Error al crear reserva', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
});

loadFormData();
