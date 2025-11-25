const apiUrl = "https://localhost:7290/api/estudiantes";

// 1️⃣ Obtener y mostrar todos los estudiantes
async function getEstudiantes() {
    const res = await fetch(apiUrl);
    const data = await res.json();
    mostrarEstudiantes(data);
}

function mostrarEstudiantes(estudiantes) {
    const table = document.getElementById("estudiantesTable");
    table.innerHTML = "";
    estudiantes.forEach(e => {
        table.innerHTML += `
            <tr>
                <td>${e.id}</td>
                <td>${e.nombre}</td>
                <td>${e.apellido}</td>
                <td>${e.email}</td>
                <td>${e.activo ? "Sí" : "No"}</td>
                <td>
                    <button onclick="editEstudiante(${e.id})">Editar</button>
                    <button onclick="deleteEstudiante(${e.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

// 2️⃣ Crear o actualizar estudiante
document.getElementById("estudianteForm").addEventListener("submit", async e => {
    e.preventDefault();

    const id = document.getElementById("estudianteId").value;
    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const email = document.getElementById("email").value;
    const activo = document.getElementById("activo").checked;

    const estudiante = { nombre, apellido, email, activo };

    const url = id ? `${apiUrl}/${id}` : apiUrl;
    const method = id ? "PUT" : "POST";

    const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(estudiante)
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("Error al guardar estudiante:", res.status, text);
        alert("Error al guardar estudiante: " + text);
    } else {
        document.getElementById("estudianteForm").reset();
        document.getElementById("estudianteId").value = "";
        getEstudiantes();
    }
});

// 3️⃣ Cargar datos en el formulario para editar
async function editEstudiante(id) {
    const res = await fetch(`${apiUrl}/${id}`);
    const e = await res.json();
    document.getElementById("estudianteId").value = e.id;
    document.getElementById("nombre").value = e.nombre;
    document.getElementById("apellido").value = e.apellido;
    document.getElementById("email").value = e.email;
    document.getElementById("activo").checked = e.activo;
}

// 4️⃣ Eliminar estudiante
async function deleteEstudiante(id) {
    if (confirm("¿Seguro que querés eliminar este estudiante?")) {
        await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
        getEstudiantes();
    }
}

// 5️⃣ Buscar estudiante por apellido
async function buscarEstudiante() {
    const apellido = document.getElementById("apellidoBuscar").value.toLowerCase();
    const res = await fetch(apiUrl);
    const data = await res.json();
    const filtrados = data.filter(e => e.apellido.toLowerCase().includes(apellido));
    mostrarEstudiantes(filtrados);
}

// Inicializar tabla al cargar la página
getEstudiantes();
