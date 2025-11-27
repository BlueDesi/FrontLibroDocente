// URLs base de la API
const API_EC = "https://localhost:7290/api/EstudiantesCursos";
const API_EST = "https://localhost:7290/api/Estudiantes";
const API_CUR = "https://localhost:7290/api/Cursos";

// Elementos del DOM
const estudianteSelect = document.getElementById("estudianteSelect");
const cursoSelect = document.getElementById("cursoSelect");
const tablaEC = document.getElementById("tablaEC");
const inscripcionForm = document.getElementById("inscripcionForm");

// -----------------------------
// Cargar estudiantes en select
// -----------------------------
async function cargarEstudiantes() {
    try {
        const res = await fetch(API_EST);
        if (!res.ok) throw new Error("No se pudo cargar estudiantes");
        const data = await res.json();

        estudianteSelect.innerHTML = "<option value=''>Seleccione estudiante</option>";
        data.forEach(e => {
            const option = document.createElement("option");
            option.value = e.id;
            option.textContent = `${e.id} - ${e.nombre} ${e.apellido}`;
            estudianteSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error estudiantes:", error);
    }
}

// -----------------------------
// Cargar cursos en select
// -----------------------------
async function cargarCursos() {
    try {
        const res = await fetch(API_CUR);
        if (!res.ok) throw new Error("No se pudo cargar cursos");
        const data = await res.json();

        cursoSelect.innerHTML = "<option value=''>Seleccione curso</option>";
        data.forEach(c => {
            const option = document.createElement("option");
            option.value = c.id;
            option.textContent = `${c.id} - ${c.anio} ${c.seccion} ${c.turno} - ${c.nombre}`;
            cursoSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error cursos:", error);
    }
}

// -----------------------------
// Cargar tabla de inscripciones
// -----------------------------
async function cargarTablaInscripciones() {
    try {
        const res = await fetch(API_EC);
        if (!res.ok) throw new Error("No se pudieron cargar inscripciones");
        const inscripciones = await res.json();

        tablaEC.innerHTML = "";

        for (let ec of inscripciones) {
            // Traer estudiante
            let estudianteRes = await fetch(`${API_EST}/${ec.estudianteId}`);
            let estudiante = estudianteRes.ok ? await estudianteRes.json() : { nombre: "-", apellido: "-", id: "-" };

            // Traer curso
            let cursoRes = await fetch(`${API_CUR}/${ec.cursoId}`);
            let curso = cursoRes.ok ? await cursoRes.json() : { id: "-", anio: "-", seccion: "-", turno: "-", nombre: "-" };

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${ec.id}</td>
                <td>${estudiante.id} - ${estudiante.nombre} ${estudiante.apellido}</td>
                <td>${curso.id} - ${curso.anio} ${curso.seccion} ${curso.turno} - ${curso.nombre}</td>
                <td>${ec.fechaInscripcion ? new Date(ec.fechaInscripcion).toLocaleDateString() : ""}</td>
                <td><button onclick="eliminarInscripcion(${ec.id})">Eliminar</button></td>
            `;
            tablaEC.appendChild(tr);
        }
    } catch (error) {
        console.error("Error al cargar las inscripciones:", error);
    }
}

// -----------------------------
// Crear nueva inscripción
// -----------------------------
inscripcionForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const estudianteId = parseInt(estudianteSelect.value);
    const cursoId = parseInt(cursoSelect.value);
    const fecha = document.getElementById("fecha").value;

    if (!estudianteId || !cursoId || !fecha) {
        alert("Complete todos los campos");
        return;
    }

    const payload = { EstudianteId: estudianteId, CursoId: cursoId, FechaInscripcion: fecha };

    try {
        const res = await fetch(API_EC, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errorText = await res.text();
            alert("Error al inscribir: " + errorText);
            return;
        }

        inscripcionForm.reset();
        cargarTablaInscripciones();
    } catch (error) {
        console.error("Error crear inscripción:", error);
    }
});

// -----------------------------
// Eliminar inscripción
// -----------------------------
async function eliminarInscripcion(id) {
    if (!confirm("¿Desea eliminar esta inscripción?")) return;

    try {
        const res = await fetch(`${API_EC}/${id}`, { method: "DELETE" });
        if (res.status === 204) {
            cargarTablaInscripciones();
        } else {
            alert("No se pudo eliminar la inscripción");
        }
    } catch (error) {
        console.error("Error eliminar inscripción:", error);
    }
}

// -----------------------------
// Inicializar
// -----------------------------
cargarEstudiantes();
cargarCursos();
cargarTablaInscripciones();
