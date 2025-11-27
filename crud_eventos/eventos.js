const API_URL = "http://localhost:5218/api/eventos"; // Ajustar si cambia el puerto

const form = document.getElementById("eventoForm");
const descripcionInput = document.getElementById("descripcion");
const idInput = document.getElementById("eventoId");
const tableBody = document.getElementById("eventosTableBody");

// ===============================
// 🚀 Traer todos los eventos
// ===============================
async function cargarEventos() {
    const res = await fetch(API_URL);
    const data = await res.json();

    tableBody.innerHTML = "";

    data.forEach(e => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${e.id}</td>
            <td>${e.descripcion}</td>
            <td>
                <span class="action-btn" onclick="editarEvento(${e.id}, '${e.descripcion}')">✏️ Editar</span>
                <span class="action-btn" onclick="eliminarEvento(${e.id})">🗑️ Eliminar</span>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// ===============================
// ➕ Crear o actualizar evento
// ===============================
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const evento = {
        descripcion: descripcionInput.value
    };

    const id = idInput.value;

    if (id === "") {
        // Crear
        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(evento)
        });
    } else {
        // Actualizar
        await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(evento)
        });
    }

    form.reset();
    cargarEventos();
});

// ===============================
// ✏️ Rellenar formulario para editar
// ===============================
function editarEvento(id, descripcion) {
    idInput.value = id;
    descripcionInput.value = descripcion;
}

// ===============================
// 🗑️ Eliminar evento
// ===============================
async function eliminarEvento(id) {
    if (!confirm("¿Seguro que querés eliminar este evento?")) return;

    await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    cargarEventos();
}

// Cargar apenas inicia la página
cargarEventos();
