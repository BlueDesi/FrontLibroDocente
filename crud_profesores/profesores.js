const apiUrl = "https://localhost:7290/api/profesores"; // Asegurate que sea el puerto correcto de tu API

// 1️⃣ Obtener y mostrar todos los profesores
async function getProfesores() {
    try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        mostrarProfesores(data);
    } catch (error) {
        console.error("Error al obtener profesores:", error);
    }
}

// Función para renderizar la tabla
function mostrarProfesores(profesores) {
    const table = document.getElementById("profesoresTable");
    table.innerHTML = "";
    profesores.forEach(p => {
        table.innerHTML += `
            <tr>
                <td>${p.id}</td>
                <td>${p.nombre}</td>
                <td>${p.apellido}</td>
                <td>${p.dni}</td>
                <td>${p.email}</td>
                <td>${p.activo ? "Sí" : "No"}</td>
                <td>
                    <button onclick="editProfesor(${p.id})">Editar</button>
                    <button onclick="deleteProfesor(${p.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

// 2️⃣ Crear o actualizar profesor
document.getElementById("profesorForm").addEventListener("submit", async e => {
    e.preventDefault();

    const id = document.getElementById("profesorId").value;
    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const dni = document.getElementById("dni").value;
    const email = document.getElementById("email").value;
    const activo = document.getElementById("activo").checked;

    const profesor = { nombre, apellido, dni, email, activo };

    const url = id ? `${apiUrl}/${id}` : apiUrl;
    const method = id ? "PUT" : "POST";

    try {
        const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profesor)
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("Error al guardar profesor:", res.status, text);
            alert("Error al guardar profesor: " + text);
        } else {
            console.log("Profesor guardado correctamente");
            document.getElementById("profesorForm").reset();
            document.getElementById("profesorId").value = "";
            getProfesores();
        }
    } catch (error) {
        console.error("Error en fetch:", error);
        alert("Error al conectar con la API");
    }
});

// 3️⃣ Cargar datos en el formulario para editar
async function editProfesor(id) {
    try {
        const res = await fetch(`${apiUrl}/${id}`);
        if (!res.ok) throw new Error(`Profesor ${id} no encontrado`);
        const p = await res.json();
        document.getElementById("profesorId").value = p.id;
        document.getElementById("nombre").value = p.nombre;
        document.getElementById("apellido").value = p.apellido;
        document.getElementById("dni").value = p.dni;
        document.getElementById("email").value = p.email;
        document.getElementById("activo").checked = p.activo;
    } catch (error) {
        console.error("Error al cargar profesor:", error);
    }
}

// 4️⃣ Eliminar profesor
async function deleteProfesor(id) {
    if (confirm("¿Seguro que querés eliminar este profesor?")) {
        try {
            const res = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("No se pudo eliminar");
            getProfesores();
        } catch (error) {
            console.error("Error al eliminar profesor:", error);
            alert("Error al eliminar profesor");
        }
    }
}

// 5️⃣ Buscar profesor por apellido
async function buscarProfesor() {
    const apellido = document.getElementById("apellidoBuscar").value.toLowerCase();
    try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        const filtrados = data.filter(p => p.apellido.toLowerCase().includes(apellido));
        mostrarProfesores(filtrados);
    } catch (error) {
        console.error("Error al buscar profesor:", error);
    }
}

// Inicializar tabla al cargar la página
getProfesores();
