const baseUrl = "http://localhost:5218/api/cursos";
const baseUrlProfesores = "http://localhost:5218/api/profesores";

// ================================
//   FUNCION AUXILIAR DIA
// ================================
function diaTexto(numero) {
    const dias = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
    return dias[numero] || "Desconocido";
}

// ================================
//   CARGAR LISTA DE PROFESORES PARA SELECTS
// ================================
let listaProfesores = [];

async function cargarProfesores() {
    const res = await fetch(baseUrlProfesores);
    listaProfesores = await res.json();

    // Llenar selects de crear y editar
    const crear = document.getElementById("profesorCrear");
    const editar = document.getElementById("profesorEditar");

    crear.innerHTML = "";
    editar.innerHTML = "";

    for (const p of listaProfesores) {
        const optionCrear = document.createElement("option");
        optionCrear.value = p.id;
        optionCrear.textContent = `${p.id} - ${p.apellido} ${p.nombre}`;
        crear.appendChild(optionCrear);

        const optionEditar = document.createElement("option");
        optionEditar.value = p.id;
        optionEditar.textContent = `${p.id} - ${p.apellido} ${p.nombre}`;
        editar.appendChild(optionEditar);
    }
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
        const div = document.createElement("div");
        div.classList.add("card");

        const profTexto = curso.profesor
            ? `${curso.profesor.id} - ${curso.profesor.apellido} ${curso.profesor.nombre}`
            : "No encontrado";

        div.innerHTML = `
            <strong>ID Curso: ${curso.id}</strong><br>
            <strong>${curso.nombre}</strong><br><br>
            <table class="tabla-curso">
                <tr><td><b>Turno:</b></td><td>${curso.turno}</td></tr>
                <tr><td><b>Año:</b></td><td>${curso.anio}</td></tr>
                <tr><td><b>Sección:</b></td><td>${curso.seccion}</td></tr>
                <tr><td><b>Profesor:</b></td><td>${profTexto}</td></tr>
                <tr><td><b>Día de Clase:</b></td><td>${diaTexto(curso.diaClase)}</td></tr>
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
    const div = document.getElementById("resultadoCurso");

    const res = await fetch(`${baseUrl}/${id}`);
    if (res.status === 404) {
        div.textContent = "Curso no encontrado";
        return;
    }

    const curso = await res.json();
    const profTexto = curso.profesor
        ? `${curso.profesor.id} - ${curso.profesor.apellido} ${curso.profesor.nombre}`
        : "No encontrado";

    div.innerHTML = `
        <h3>${curso.nombre}</h3>
        <p><b>ID Curso:</b> ${curso.id}</p>
        <p><b>Turno:</b> ${curso.turno}</p>
        <p><b>Año:</b> ${curso.anio}</p>
        <p><b>Sección:</b> ${curso.seccion}</p>
        <p><b>Profesor:</b> ${profTexto}</p>
        <p><b>Día de Clase:</b> ${diaTexto(curso.diaClase)}</p>
        <p><b>Activo:</b> ${curso.activo ? "Sí" : "No"}</p>
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
        diaClase: parseInt(document.getElementById("diaCrear").value),
        activo: true
    };

    const res = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevo)
    });

    const data = await res.json();
    document.getElementById("resultadoCrear").textContent = JSON.stringify(data, null, 2);
    getAll();
}

// ================================
//   PUT (Editar)
/// ================================
async function cargarCursoEditar() {
    const id = document.getElementById("editarId").value;
    if (!id) return;

    const res = await fetch(`${baseUrl}/${id}`);
    if (res.status === 404) {
        document.getElementById("resultadoEditar").textContent = "Curso no encontrado";
        return;
    }

    const curso = await res.json();

    document.getElementById("tituloEditar").value = curso.nombre;
    document.getElementById("turnoEditar").value = curso.turno;
    document.getElementById("anioEditar").value = curso.anio;
    document.getElementById("seccionEditar").value = curso.seccion;
    document.getElementById("diaEditar").value = curso.diaClase;

    if (curso.profesor) {
        document.getElementById("profesorEditar").value = curso.profesor.id;
    }
}

async function editarCurso() {
    const id = document.getElementById("editarId").value;

    const payload = {
        nombre: document.getElementById("tituloEditar").value,
        turno: document.getElementById("turnoEditar").value,
        anio: parseInt(document.getElementById("anioEditar").value),
        seccion: document.getElementById("seccionEditar").value,
        profesorId: parseInt(document.getElementById("profesorEditar").value),
        diaClase: parseInt(document.getElementById("diaEditar").value),
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
    getAll();
}

// ================================
//   DELETE
// ================================
async function eliminarCurso() {
    const id = document.getElementById("eliminarId").value;

    const res = await fetch(`${baseUrl}/${id}`, { method: "DELETE" });

    document.getElementById("resultadoEliminar").textContent =
        res.status === 204 ? "Eliminado correctamente" : "Curso no encontrado";

    getAll();
}

// ================================
//   INICIALIZACIÓN
// ================================
cargarProfesores();
//getAll();
