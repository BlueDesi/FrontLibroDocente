const profesorSelect = document.getElementById('profesorSelect');
const cursoSelect = document.getElementById('cursoSelect');
const cuatrimestreSelect = document.getElementById('cuatrimestreSelect');
const diaClaseSelect = document.getElementById('diaClaseSelect');
const headerRow = document.getElementById('headerRow');
const planillaBody = document.getElementById('planillaBody');

let estudiantes = [];
let fechas = [];

const cuatrimestres = [
    { nombre: "1er Cuatrimestre", inicio: new Date(2025, 2, 5), fin: new Date(2025, 6, 20) }, // 5-mar a 20-jul
    { nombre: "2do Cuatrimestre", inicio: new Date(2025, 7, 2), fin: new Date(2025, 11, 29) }  // 2-ago a 22-dic
];

// --- Cargar Profesores ---
async function cargarProfesores() {
    try {
        const res = await fetch('https://localhost:7290/api/profesores');
        const data = await res.json();
        profesorSelect.innerHTML = '<option value="">--Seleccione--</option>';
        data.forEach(prof => {
            const opt = document.createElement('option');
            opt.value = prof.id;
            opt.textContent = `${prof.nombre} ${prof.apellido}`;
            profesorSelect.appendChild(opt);
        });
    } catch (err) {
        alert('No se pudieron cargar los profesores.');
        console.error(err);
    }
}

// --- Cargar Cursos según Profesor ---
async function cargarCursos(profesorId) {
    try {
        const res = await fetch(`https://localhost:7290/api/Cursos/profesor/${profesorId}`);
        const data = await res.json();
        cursoSelect.innerHTML = '<option value="">--Seleccione--</option>';
        data.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = `${c.nombre} - Año ${c.anio} - Sección ${c.seccion}`;
            cursoSelect.appendChild(opt);
        });
        cursoSelect.disabled = false;
    } catch (err) {
        alert('No se pudieron cargar los cursos del profesor.');
        console.error(err);
    }
}

// --- Cargar estudiantes de curso ---
async function cargarEstudiantes(cursoId) {
    try {
        const res = await fetch(`https://localhost:7290/api/EstudiantesCursos/curso/${cursoId}`);
        const data = await res.json();
        estudiantes = data.map(ec => ec.estudiante || { nombre: '-', apellido: '-' });
        calcularFechasCuatrimestre();
        renderizarTabla();
    } catch (err) {
        alert('No se pudieron cargar los estudiantes del curso.');
        console.error(err);
    }
}

// --- Calcular fechas del cuatrimestre ---
function calcularFechasCuatrimestre() {
    fechas = [];
    const cuatri = cuatrimestres[parseInt(cuatrimestreSelect.value)];
    const diaSemana = parseInt(diaClaseSelect.value);
    let current = new Date(cuatri.inicio);
    
    while (current <= cuatri.fin) {
        if (current.getDay() === diaSemana) fechas.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
}

// --- Renderizar tabla ---
function renderizarTabla() {
    headerRow.innerHTML = '<th>Nombre</th><th>Apellido</th>';
    planillaBody.innerHTML = '';

    fechas.forEach(f => {
        const th = document.createElement('th');
        th.textContent = `${f.toLocaleString('es-AR', { month: 'short' }).toUpperCase()} ${f.getDate()}`;
        headerRow.appendChild(th);
    });

    estudiantes.forEach(est => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${est.nombre}</td><td>${est.apellido}</td>`;

        fechas.forEach(() => {
            const td = document.createElement('td');

            const pChk = document.createElement('input');
            pChk.type = 'checkbox';
            pChk.style.marginRight = '2px';
            const aChk = document.createElement('input');
            aChk.type = 'checkbox';
            aChk.style.marginLeft = '2px';

            const pLabel = document.createElement('span');
            pLabel.textContent = 'P';
            pLabel.style.marginRight = '5px';
            const aLabel = document.createElement('span');
            aLabel.textContent = 'A';
            aLabel.style.marginLeft = '5px';

            // Exclusión mutua y colores
            pChk.addEventListener('change', () => {
                if (pChk.checked) {
                    aChk.checked = false;
                    td.style.backgroundColor = '#b2fab4'; // verde
                } else {
                    td.style.backgroundColor = '';
                }
            });
            aChk.addEventListener('change', () => {
                if (aChk.checked) {
                    pChk.checked = false;
                    td.style.backgroundColor = '#f7b2b2'; // rojo
                } else {
                    td.style.backgroundColor = '';
                }
            });

            td.appendChild(pLabel);
            td.appendChild(pChk);
            td.appendChild(document.createTextNode(' / '));
            td.appendChild(aChk);
            td.appendChild(aLabel);

            tr.appendChild(td);
        });

        planillaBody.appendChild(tr);
    });
}

// --- Eventos ---
profesorSelect.addEventListener('change', () => {
    const profId = profesorSelect.value;
    if (profId) cargarCursos(profId);
    cursoSelect.innerHTML = '<option value="">--Seleccione--</option>';
    cursoSelect.disabled = true;
    planillaBody.innerHTML = '';
    headerRow.innerHTML = '<th>Nombre</th><th>Apellido</th>';
});

cursoSelect.addEventListener('change', () => {
    const cursoId = cursoSelect.value;
    if (cursoId) cargarEstudiantes(cursoId);
});

cuatrimestreSelect.addEventListener('change', () => {
    calcularFechasCuatrimestre();
    renderizarTabla();
});

diaClaseSelect.addEventListener('change', () => {
    calcularFechasCuatrimestre();
    renderizarTabla();
});

// --- Inicial ---
cargarProfesores();
