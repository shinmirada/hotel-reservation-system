const token = localStorage.getItem('token');
if (!token) window.location.href = 'index.html';

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : '/api';

const headers = { 'Authorization': `Bearer ${token}` };

async function loadDashboard() {
    try {
        // Use Promise.all to fetch all stats concurrently
        const [guestsRes, roomsRes, reservationsRes] = await Promise.all([
            fetch(`${API_URL}/guests`, { headers }),
            fetch(`${API_URL}/rooms`, { headers }),
            fetch(`${API_URL}/reservations`, { headers })
        ]);

        const [guests, rooms, reservations] = await Promise.all([
            guestsRes.json(),
            roomsRes.json(),
            reservationsRes.json()
        ]);

        // Stats
        document.getElementById('totalGuests').textContent = guests.length;
        document.getElementById('totalRooms').textContent = rooms.length;

        const activeReservations = reservations.filter(r => r.status === 'confirmed' || r.status === 'checked_in');
        document.getElementById('totalReservations').textContent = activeReservations.length;

        const availableRooms = rooms.filter(r => r.status === 'available');
        document.getElementById('availableRooms').textContent = availableRooms.length;

        // Recent reservations
        const tbody = document.getElementById('recentReservations');
        if (reservations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No hay reservas registradas.</td></tr>';
            return;
        }

        const recent = reservations.slice(-10).reverse();
        tbody.innerHTML = recent.map(r => `
            <tr style="cursor: pointer;" onclick="window.location.href='reservation-detail.html?id=${r.id}'">
                <td>${r.id}</td>
                <td>${r.Guest ? `${r.Guest.firstName} ${r.Guest.lastName}` : 'N/A'}</td>
                <td>${r.Room ? r.Room.roomNumber : 'N/A'}</td>
                <td>${new Date(r.checkIn).toLocaleDateString()}</td>
                <td>${new Date(r.checkOut).toLocaleDateString()}</td>
                <td><span class="badge badge-${r.status}">${r.status}</span></td>
                <td style="color: var(--accent); font-weight: 600;">$${r.totalPrice.toFixed(2)}</td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

loadDashboard();
