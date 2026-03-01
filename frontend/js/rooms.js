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

let allRooms = [];

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

const typeLabels = { single: 'Individual', double: 'Doble', suite: 'Suite' };
const statusLabels = { available: 'Disponible', occupied: 'Ocupada', maintenance: 'Mantenimiento' };

async function fetchRooms() {
    try {
        const response = await fetch(`${API_URL}/rooms`, { headers });
        allRooms = await response.json();
        renderRooms();
    } catch (error) {
        console.error('Error fetching rooms:', error);
    }
}

function renderRooms() {
    const filterStatus = document.getElementById('filterStatus').value;
    const filterType = document.getElementById('filterType').value;

    let filtered = allRooms;
    if (filterStatus) filtered = filtered.filter(r => r.status === filterStatus);
    if (filterType) filtered = filtered.filter(r => r.type === filterType);

    const container = document.getElementById('roomList');
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">No se encontraron habitaciones.</div>';
        return;
    }

    container.innerHTML = filtered.map(room => `
        <div class="room-card ${room.type}">
            <div class="room-number">🚪 ${room.roomNumber}</div>
            <div class="room-type">${typeLabels[room.type] || room.type}</div>
            <div class="room-price">$${room.pricePerNight.toFixed(2)} <span>/ noche</span></div>
            <span class="badge badge-${room.status}">${statusLabels[room.status] || room.status}</span>
            <div class="btn-group" style="margin-top: 1rem;">
                <button class="btn btn-outline btn-sm" onclick='editRoom(${JSON.stringify(room)})'>✏️ Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteRoom(${room.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

document.getElementById('filterStatus').addEventListener('change', renderRooms);
document.getElementById('filterType').addEventListener('change', renderRooms);

document.getElementById('addRoomForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const response = await fetch(`${API_URL}/rooms`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                roomNumber: document.getElementById('rRoomNumber').value,
                type: document.getElementById('rType').value,
                pricePerNight: parseFloat(document.getElementById('rPrice').value),
            })
        });

        if (response.ok) {
            closeModal('addRoomModal');
            e.target.reset();
            showToast('Habitación creada exitosamente');
            fetchRooms();
        } else {
            const err = await response.json();
            showToast(err.message || 'Error al crear habitación', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
});

function editRoom(room) {
    document.getElementById('editRoomId').value = room.id;
    document.getElementById('eRoomNumber').value = room.roomNumber;
    document.getElementById('eType').value = room.type;
    document.getElementById('ePrice').value = room.pricePerNight;
    document.getElementById('eStatus').value = room.status;
    openModal('editRoomModal');
}

document.getElementById('editRoomForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editRoomId').value;
    try {
        const response = await fetch(`${API_URL}/rooms/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                roomNumber: document.getElementById('eRoomNumber').value,
                type: document.getElementById('eType').value,
                pricePerNight: parseFloat(document.getElementById('ePrice').value),
                status: document.getElementById('eStatus').value,
            })
        });

        if (response.ok) {
            closeModal('editRoomModal');
            showToast('Habitación actualizada');
            fetchRooms();
        } else {
            const err = await response.json();
            showToast(err.message || 'Error al actualizar', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
});

async function deleteRoom(id) {
    if (!confirm('¿Está seguro de eliminar esta habitación?')) return;
    try {
        const response = await fetch(`${API_URL}/rooms/${id}`, {
            method: 'DELETE',
            headers
        });
        if (response.ok) {
            showToast('Habitación eliminada');
            fetchRooms();
        } else {
            showToast('Error al eliminar', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

fetchRooms();
