document.addEventListener("DOMContentLoaded", async () => {
    const profesorSelect = document.getElementById("profesorSelect");
    const cursoSelect = document.getElementById("cursoSelect");
    const planillaBody = document.querySelector("#planilla tbody");

    // Función para cargar profesores
    async function cargarProfesores() {
        try {
            const res = await fetch("https://localhost:7290/api/Profesores");
            if (!res.ok) throw new Error("Error HTTP " + res.status);
            const profesores = await res.json();
            profesores.forEach(p => {
                const opt = document.createElement("option");
                opt.value = p.id;
                opt.textContent = `${p.nombre} ${p.apellido}`;
                profesorSelect.appendChild(opt);
            });
        } catch (err) {
            console.error(err);
            alert("No se pudieron cargar los profesores");
        }
    }

    // Función para cargar cursos de un profesor
    async function cargarCursos(profesorId) {
        cursoSelect.innerHTML = '<option value="">--Seleccione--</option>';
        planillaBody.innerHTML = "";
        if (!profesorId) {
            cursoSelect.disabled = true;
            return;
        }
        try {
            const res = await fetch(`https://localhost:7290/api/Cursos/profesor/${profesorId}`);
            if (!res.ok) throw new Error("Error HTTP " + res.status);
            const cursos = await res.json();
            cursos.forEach(c => {
                const opt = document.createElement("option");
                opt.value = c.id;
                opt.textContent = `${c.nombre} - Año ${c.anio} - Sección ${c.seccion}`;
                cursoSelect.appendChild(opt);
            });
            cursoSelect.disabled = false;
        } catch (err) {
            console.error(err);
            alert("No se pudieron cargar los cursos del profesor");
        }
    }

    // Función para cargar estudiantes de un curso
    async function cargarEstudiantes(cursoId) {
        planillaBody.innerHTML = "";
        if (!cursoId) return;
        try {
            const res = await fetch(`https://localhost:7290/api/EstudiantesCursos/curso/${cursoId}`);
            if (!res.ok) throw new Error("Error HTTP " + res.status);
            const estudiantesCurso = await res.json();

            estudiantesCurso.forEach(ec => {
                const tr = document.createElement("tr");

                const nombre = ec.estudiante?.nombre || "-";
                const apellido = ec.estudiante?.apellido || "-";

                tr.innerHTML = `
                    <td>${nombre}</td>
                    <td>${apellido}</td>
                    <td>
                        <input type="checkbox" class="presente" /> P
                        <input type="checkbox" class="ausente" /> A
                    </td>
                `;

                // Lógica para deshabilitar checkbox opuesto
                const chkP = tr.querySelector(".presente");
                const chkA = tr.querySelector(".ausente");

                chkP.addEventListener("change", () => {
                    chkA.disabled = chkP.checked;
                });
                chkA.addEventListener("change", () => {
                    chkP.disabled = chkA.checked;
                });

                planillaBody.appendChild(tr);
            });
        } catch (err) {
            console.error(err);
            alert("No se pudieron cargar los estudiantes del curso");
        }
    }

    // Eventos de selección
    profesorSelect.addEventListener("change", () => cargarCursos(profesorSelect.value));
    cursoSelect.addEventListener("change", () => cargarEstudiantes(cursoSelect.value));

    // Inicializar
    cargarProfesores();
});
