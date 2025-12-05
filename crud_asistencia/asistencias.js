const profesorSelect = document.getElementById('profesorSelect');
const cursoSelect = document.getElementById('cursoSelect');
const cuatrimestreSelect = document.getElementById('cuatrimestreSelect');
const headerRow = document.getElementById('headerRow');
const planillaBody = document.getElementById('planillaBody');

let estudiantes = [];
let fechas = [];
let diaClaseCurso = 1;
let eventos = [];
let idEventoNormal = null;
let panelComentarioActual = null;
let asistenciasCurso = [];
let cursoSeleccionado = null; // <- NUEVO

const cuatrimestres = [
    { nombre: "1er Cuatrimestre", inicio: new Date(2025, 2, 5), fin: new Date(2025, 6, 20) },
    { nombre: "2do Cuatrimestre", inicio: new Date(2025, 7, 2), fin: new Date(2025, 11, 29) }
];

// ---------------- CARGAR EVENTOS ----------------
async function cargarEventos() {
    try {
        const res = await fetch('https://localhost:7290/api/eventos');
        eventos = await res.json();
        const normal = eventos.find(e => e.descripcion && e.descripcion.toLowerCase() === 'normal');
        idEventoNormal = normal ? normal.id : null;
    } catch (err) {
        console.error(err);
        eventos = [];
        idEventoNormal = null;
    }
}

// ---------------- CARGAR PROFESORES ----------------
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
    } catch (err) { console.error(err); }
}

// ---------------- CARGAR CURSOS ----------------
async function cargarCursos(profesorId) {
    try {
        const res = await fetch(`https://localhost:7290/api/Cursos/profesor/${profesorId}`);
        const data = await res.json();
        cursoSelect.innerHTML = '<option value="">--Seleccione--</option>';
        data.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = `${c.nombre} - Año ${c.anio} - Sección ${c.seccion}`;
            opt.dataset.diaclase = c.diaClase;
            cursoSelect.appendChild(opt);
        });
        cursoSelect.disabled = false;
    } catch (err) { console.error(err); }
}

// ---------------- CARGAR ESTUDIANTES Y ASISTENCIAS ----------------
async function cargarEstudiantes(cursoId) {
    try {
        const resEst = await fetch(`https://localhost:7290/api/EstudiantesCursos/curso/${cursoId}`);
        const dataEst = await resEst.json();
        estudiantes = dataEst.map(ec => ec.estudiante || { id: 0, nombre: '-', apellido: '-' });
        await cargarAsistenciasCurso(cursoId);
        calcularFechasCuatrimestre();
        renderizarTabla();
    } catch (err) { console.error(err); }
}

// ---------------- CARGAR ASISTENCIAS EXISTENTES ----------------
async function cargarAsistenciasCurso(cursoId) {
    try {
        const res = await fetch(`https://localhost:7290/api/asistencias/curso/${cursoId}`);
        const data = await res.json();
        asistenciasCurso = data.success ? data.data.map(a => ({
            EstudianteId: a.estudianteId ?? a.EstudianteId,
            Fecha: new Date(a.fecha ?? a.Fecha),
            Presente: a.presente ?? a.Presente,
            Comentario: a.comentario ?? a.Comentario,
            EventoId: a.eventoId ?? a.EventoId,
            CursoId: cursoSeleccionado ? cursoSeleccionado.id : parseInt(a.cursoId ?? a.CursoId) // <- id seguro
        })) : [];
    } catch (err) {
        console.error(err);
        asistenciasCurso = [];
    }
}

// ---------------- CALCULAR FECHAS ----------------
function calcularFechasCuatrimestre() {
    fechas = [];
    const cuatri = cuatrimestres[parseInt(cuatrimestreSelect.value)];
    let current = new Date(cuatri.inicio);
    while (current <= cuatri.fin) {
        if (current.getDay() === diaClaseCurso) fechas.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
}

// ---------------- PANEL COMENTARIO ----------------
function crearPanelComentario(td, estudiante, fecha) {
    if (panelComentarioActual) panelComentarioActual.remove();
    const rect = td.getBoundingClientRect();
    const panel = document.createElement('div');
    panel.className = 'comentario-panel';
    panel.style.top = (window.scrollY + rect.bottom + 4) + 'px';
    panel.style.left = rect.left + 'px';
    panel.innerHTML = `
        <p>¿Agregar comentario?</p>
        <button id="btnSi">Sí</button>
        <button id="btnNo">No</button>
        <div id="comentarioForm" style="margin-top:8px; display:none;">
            <textarea id="comentarioTexto" rows="2" style="width:200px;">${td.dataset.comentario || ''}</textarea>
            <br>
            <button id="guardarComentario">Guardar</button>
        </div>
    `;
    document.body.appendChild(panel);
    panelComentarioActual = panel;
    panel.querySelector("#btnSi").onclick = () => panel.querySelector("#comentarioForm").style.display = "block";
    panel.querySelector("#btnNo").onclick = () => { panel.remove(); panelComentarioActual = null; };
    panel.querySelector("#guardarComentario").onclick = () => {
        let texto = panel.querySelector("#comentarioTexto").value.trim();
        td.dataset.comentario = texto;

        const estudianteId = parseInt(td.parentElement.dataset.estudianteId);
        const colIndex = Array.from(td.parentElement.cells).indexOf(td) - 2;
        const fechaCol = fechas[colIndex];
        let existente = asistenciasCurso.find(a => a.EstudianteId === estudianteId && a.Fecha.toDateString() === fechaCol.toDateString());
        if (existente) existente.Comentario = texto;

        if (!td.querySelector(".comentario-icono") && texto.length>0) {
            let icono = document.createElement("span");
            icono.className = "comentario-icono";
            icono.textContent = "📝";
            icono.style.cursor = 'pointer';
            icono.title = 'Ver comentario';
            icono.style.fontSize = '12px';
            icono.style.marginLeft = '4px';
            icono.addEventListener('click', e => { e.stopPropagation(); alert(`Comentario: ${texto}`); });
            td.appendChild(icono);
        }
        panel.remove();
        panelComentarioActual = null;
    };
}

// ---------------- BLOQUEO/DESBLOQUEO ----------------
function bloquearColumna(colIndex) {
    planillaBody.querySelectorAll('tr').forEach(fila => {
        const td = fila.cells[colIndex + 2];
        const inputs = td.getElementsByTagName('input');
        for(let inp of inputs) inp.disabled = true;
    });
}
function desbloquearColumna(colIndex) {
    planillaBody.querySelectorAll('tr').forEach(fila => {
        const td = fila.cells[colIndex + 2];
        const inputs = td.getElementsByTagName('input');
        for(let inp of inputs) inp.disabled = false;
    });
}

// ---------------- ENVIAR ASISTENCIAS ----------------
// ---------------- ENVIAR/ACTUALIZAR ASISTENCIAS ----------------
async function enviarAsistenciasColumna(colIndex, fecha) {
    const filas = planillaBody.querySelectorAll('tr');

    // Obtener el curso seleccionado
    const optCurso = cursoSelect.selectedOptions[0];
    if (!optCurso || !optCurso.value) {
        alert('No hay curso seleccionado.');
        return false;
    }
    const cursoId = parseInt(optCurso.value);

    // Obtener el evento de la columna
    const selectEvento = headerRow.cells[colIndex + 2].querySelector('select');
    const eventoId = parseInt(selectEvento.value);

    // Construir array de asistencias
    const asistencias = [];
    filas.forEach(fila => {
        const td = fila.cells[colIndex + 2];
        const inputs = td.getElementsByTagName('input');
        const presente = inputs[0].checked;
        const comentario = td.dataset.comentario || '';
        const estudianteId = parseInt(fila.dataset.estudianteId);

        asistencias.push({ 
            EstudianteId: estudianteId,
            CursoId: cursoId,
            Fecha: fecha.toISOString(),
            EventoId: eventoId,
            Presente: presente,
            Comentario: comentario
        });
    });

    // Enviar al endpoint upsert-bulk
    try {
        const res = await fetch('https://localhost:7290/api/asistencias/upsert-bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(asistencias)
        });
        const data = await res.json();
        if (data.success) {
            alert('Asistencias guardadas correctamente!');
            await cargarAsistenciasCurso(cursoId);
            renderizarTabla();
            return true;
        } else {
            alert('Error: ' + data.errorMessage);
            return false;
        }
    } catch (err) {
        console.error(err);
        alert('Error de conexión al guardar asistencias');
        return false;
    }
}


// ---------------- RENDERIZAR TABLA ----------------
function renderizarTabla() {
    headerRow.innerHTML = '<th>Nombre</th><th>Apellido</th>';
    planillaBody.innerHTML = '';

    fechas.forEach((f, colIndex) => {
        const th = document.createElement('th');

        const fechaDiv = document.createElement('div');
        fechaDiv.textContent = `${f.toLocaleString('es-AR',{month:'short'}).toUpperCase()} ${f.getDate()}`;
        fechaDiv.style.fontWeight = '600';
        fechaDiv.style.marginBottom = '4px';
        th.appendChild(fechaDiv);

        const select = document.createElement('select');
        select.style.width = '100%';
        if(!eventos.length){
            const opt = document.createElement('option'); opt.value=''; opt.textContent='Normal'; select.appendChild(opt);
        } else {
            eventos.forEach(ev=>{const opt=document.createElement('option'); opt.value=ev.id; opt.textContent=ev.descripcion; select.appendChild(opt);});
            if(idEventoNormal) select.value=idEventoNormal;
        }
        th.appendChild(select);

        const btn = document.createElement('button');
        btn.style.marginTop='4px';

        const hayAsistencias = asistenciasCurso.some(a=>a.Fecha.toDateString() === f.toDateString());
        if(hayAsistencias){
            btn.textContent='Editar';
            btn.style.backgroundColor='orange';
            btn.style.color='black';
            bloquearColumna(colIndex);
        } else {
            btn.textContent='Finalizar';
            btn.style.backgroundColor='green';
            btn.style.color='white';
        }

        select.addEventListener('change', ()=>{
            const evId=parseInt(select.value);
            planillaBody.querySelectorAll('tr').forEach(fila=>{
                const td = fila.cells[colIndex+2];
                const [pChk,aChk] = td.getElementsByTagName('input');
                if(evId!==idEventoNormal){
                    pChk.checked=false; aChk.checked=true; td.style.backgroundColor='#f7b2b2';
                } else {
                    pChk.checked=false; aChk.checked=false; td.style.backgroundColor='';
                }
            });
        });

        btn.addEventListener('click', async ()=>{
            if(btn.textContent==='Finalizar'){
                const ok = await enviarAsistenciasColumna(colIndex,f);
                if(ok){
                    btn.textContent='Editar';
                    btn.style.backgroundColor='orange';
                    btn.style.color='black';
                    bloquearColumna(colIndex);
                }
            } else {
                btn.textContent='Finalizar';
                btn.style.backgroundColor='green';
                btn.style.color='white';
                desbloquearColumna(colIndex);
            }
        });

        th.appendChild(btn);
        headerRow.appendChild(th);
    });

    estudiantes.forEach(est=>{
        const tr = document.createElement('tr');
        tr.dataset.estudianteId = est.id;
        tr.innerHTML = `<td>${est.nombre}</td><td>${est.apellido}</td>`;
        fechas.forEach(f=>{
            const td = document.createElement('td');
            const pChk = document.createElement('input'); pChk.type='checkbox'; pChk.style.marginRight='6px';
            const aChk = document.createElement('input'); aChk.type='checkbox'; aChk.style.marginLeft='6px';

            const asistencia = asistenciasCurso.find(a=>a.EstudianteId===est.id && a.Fecha.toDateString()===f.toDateString());
            if(asistencia){
                pChk.checked = asistencia.Presente;
                aChk.checked = !asistencia.Presente;
                td.style.backgroundColor = asistencia.Presente?'#b2fab4':'#f7b2b2';

                if(asistencia.Comentario){
                    td.dataset.comentario = asistencia.Comentario;
                    const icono=document.createElement('span');
                    icono.className='comentario-icono';
                    icono.textContent='📝';
                    icono.style.cursor='pointer';
                    icono.title='Ver comentario';
                    icono.style.fontSize='12px';
                    icono.style.marginLeft='4px';
                    icono.addEventListener('click', e=>{
                        e.stopPropagation();
                        alert(`Comentario: ${asistencia.Comentario}`);
                    });
                    td.appendChild(icono);
                }

                pChk.disabled=true;
                aChk.disabled=true;
            }

            pChk.addEventListener('change',()=>{ if(pChk.checked){ aChk.checked=false; td.style.backgroundColor='#b2fab4'; } else td.style.backgroundColor=''; });
            aChk.addEventListener('change',()=>{ if(aChk.checked){ pChk.checked=false; td.style.backgroundColor='#f7b2b2'; } else td.style.backgroundColor=''; });

            td.appendChild(pChk); td.appendChild(aChk);
            td.addEventListener('dblclick',()=>crearPanelComentario(td,est,f));
            tr.appendChild(td);
        });
        planillaBody.appendChild(tr);
    });
}

// ---------------- EVENTOS UI ----------------
profesorSelect.addEventListener('change',()=>{
    const profId = profesorSelect.value;
    if(profId) cargarCursos(profId);
    cursoSelect.innerHTML='<option value="">--Seleccione--</option>';
    cursoSelect.disabled=true;
    planillaBody.innerHTML='';
    headerRow.innerHTML='<th>Nombre</th><th>Apellido</th>';
});

cursoSelect.addEventListener('change',()=>{
    const opt = cursoSelect.selectedOptions[0];
    if(!opt) return;

    cursoSeleccionado = {
        id: parseInt(opt.value),
        nombre: opt.textContent,
        diaClase: parseInt(opt.dataset.diaclase)
    };

    diaClaseCurso = cursoSeleccionado.diaClase;
    cargarEstudiantes(cursoSeleccionado.id);
});

cuatrimestreSelect.addEventListener('change',()=>{
    calcularFechasCuatrimestre();
    renderizarTabla();
});

// ---------------- INICIAL ----------------
(async function init(){
    await cargarEventos();
    await cargarProfesores();
})();
