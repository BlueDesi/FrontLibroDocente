const baseUrl = "http://localhost:5218/api/cursos";
const profesoresUrl = "http://localhost:5218/api/profesores";

// ================================
//   OBTENER PROFESOR POR ID
// ================================
async function obtenerProfesor(profesorId) {
    const res = await fetch(`${profesoresUrl}/${profesorId}`);
    if (!res.ok) return null;
    return await res.json();
}

// ================================
//   GET ALL
// ================================
async function getAll() {
    const res = await fetch(baseUrl);
    const data = await res.json();

    const lista = document.getElementById("listaCursos");
    lista.innerHTML = "";

    for (const curso of data) {
        const profesor = await obtenerProfesor(curso.profesorId);

        const div = document.createElement("div");
        div.classList.add("card");

        div.innerHTML = `
            <strong>ID Curso: ${curso.id}</strong><br>
            <strong>${curso.nombre}</strong><br><br>

            <table class="tabla-curso">
                <tr><td><b>Turno:</b></td><td>${curso.turno}</td></tr>
                <tr><td><b>Año:</b></td><td>${curso.anio}</td></tr>
                <tr><td><b>Sección:</b></td><td>${curso.seccion}</td></tr>
                
                <tr>
                    <td><b>Profesor:</b></td>
                    <td>
                        ${curso.profesorId} - 
                        ${profesor ? profesor.nombre + " " + profesor.apellido : "No encontrado"}
                    </td>
                </tr>

                <tr><td><b>Activo:</b></td><td>${curso.activo ? "Sí" : "No"}</td></tr>
            </table>
        `;

        lista.appendChild(div);
    }
}

// ================================
//   GET BY ID
// ================================
async function getById() {
    const id = document.getElementById("buscarId").value;

    const res = await fetch(`${baseUrl}/${id}`);
    const div = document.getElementById("resultadoCurso");

    if (res.status === 404) {
        div.textContent = "Curso no encontrado";
        return;
    }

    const data = await res.json();
    const profesor = await obtenerProfesor(data.profesorId);

    div.innerHTML = `
        <h3>${data.nombre}</h3>
        <p><b>ID Curso:</b> ${data.id}</p>
        <p><b>Turno:</b> ${data.turno}</p>
        <p><b>Año:</b> ${data.anio}</p>
        <p><b>Sección:</b> ${data.seccion}</p>

        <p><b>Profesor:</b>  
            ${data.profesorId} - 
            ${profesor ? profesor.nombre + " " + profesor.apellido : "No encontrado"}
        </p>

        <p><b>Activo:</b> ${data.activo ? "Sí" : "No"}</p>
    `;
}

// ================================
//   POST
// ================================
async function crearCurso() {
    const nuevo = {
        nombre: document.getElementById("nombreCrear").value,
        turno: document.getElementById("turnoCrear").value,
        anio: parseInt(document.getElementById("anioCrear").value),
        seccion: document.getElementById("seccionCrear").value,
        profesorId: parseInt(document.getElementById("profesorCrear").value),
        activo: true
    };

    const res = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevo)
    });

    const data = await res.json();
    document.getElementById("resultadoCrear").textContent = JSON.stringify(data, null, 2);
}

// ================================
//   PUT
// ================================
async function editarCurso() {
    const id = document.getElementById("editarId").value;

    const payload = {
        nombre: document.getElementById("tituloEditar").value,
        turno: document.getElementById("turnoEditar").value,
        anio: parseInt(document.getElementById("anioEditar").value),
        seccion: document.getElementById("seccionEditar").value,
        profesorId: parseInt(document.getElementById("profesorEditar").value),
        activo: true
    };

    const res = await fetch(`${baseUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const div = document.getElementById("resultadoEditar");

    if (res.status === 404) {
        div.textContent = "Curso no encontrado";
        return;
    }

    const data = await res.json();
    div.textContent = JSON.stringify(data, null, 2);
}

// ================================
//   DELETE
// ================================
async function eliminarCurso() {
    const id = document.getElementById("eliminarId").value;

    const res = await fetch(`${baseUrl}/${id}`, { method: "DELETE" });

    document.getElementById("resultadoEliminar").textContent =
        res.status === 204 ? "Eliminado correctamente" : "Curso no encontrado";
}
