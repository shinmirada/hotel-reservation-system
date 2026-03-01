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

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

async function fetchGuests() {
    try {
        const response = await fetch(`${API_URL}/guests`, { headers });
        const guests = await response.json();
        const tbody = document.getElementById('guestList');

        if (guests.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No hay huéspedes registrados.</td></tr>';
            return;
        }

        tbody.innerHTML = guests.map(g => `
            <tr>
                <td>${g.id}</td>
                <td>${g.firstName} ${g.lastName}</td>
                <td>${g.email}</td>
                <td>${g.phone || '—'}</td>
                <td>${g.documentId}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-outline btn-sm" onclick='editGuest(${JSON.stringify(g)})'>✏️ Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteGuest(${g.id})">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error fetching guests:', error);
    }
}

document.getElementById('addGuestForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const response = await fetch(`${API_URL}/guests`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                firstName: document.getElementById('gFirstName').value,
                lastName: document.getElementById('gLastName').value,
                email: document.getElementById('gEmail').value,
                phone: document.getElementById('gPhone').value,
                documentId: document.getElementById('gDocumentId').value,
            })
        });

        if (response.ok) {
            closeModal('addGuestModal');
            e.target.reset();
            showToast('Huésped creado exitosamente');
            fetchGuests();
        } else {
            const err = await response.json();
            showToast(err.message || 'Error al crear huésped', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
});

function editGuest(guest) {
    document.getElementById('editGuestId').value = guest.id;
    document.getElementById('eFirstName').value = guest.firstName;
    document.getElementById('eLastName').value = guest.lastName;
    document.getElementById('eEmail').value = guest.email;
    document.getElementById('ePhone').value = guest.phone || '';
    document.getElementById('eDocumentId').value = guest.documentId;
    openModal('editGuestModal');
}

document.getElementById('editGuestForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editGuestId').value;
    try {
        const response = await fetch(`${API_URL}/guests/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                firstName: document.getElementById('eFirstName').value,
                lastName: document.getElementById('eLastName').value,
                email: document.getElementById('eEmail').value,
                phone: document.getElementById('ePhone').value,
                documentId: document.getElementById('eDocumentId').value,
            })
        });

        if (response.ok) {
            closeModal('editGuestModal');
            showToast('Huésped actualizado');
            fetchGuests();
        } else {
            const err = await response.json();
            showToast(err.message || 'Error al actualizar', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
});

async function deleteGuest(id) {
    if (!confirm('¿Está seguro de eliminar este huésped?')) return;
    try {
        const response = await fetch(`${API_URL}/guests/${id}`, {
            method: 'DELETE',
            headers
        });
        if (response.ok) {
            showToast('Huésped eliminado');
            fetchGuests();
        } else {
            showToast('Error al eliminar', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

fetchGuests();
