// Configuración de tu cliente Supabase
const SUPABASE_URL = "https://arpmtbhiynrsffapebyw.supabase.co";
const SUPABASE_KEY = "sb_publishable_9IFETTvqOGXF11G0YNdCog_mgjkav6Z";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const ventanaChat = document.getElementById('ventana-chat');
const formChat = document.getElementById('form-chat');
const inputMensaje = document.getElementById('input-mensaje');
const inputUsuario = document.getElementById('input-usuario');

// 1. Cargar el historial existente al entrar a la URL
async function cargarHistorial() {
    const { data, error } = await supabase
        .from('mensajes')
        .select('*')
        .order('created_at', { ascending: true }); // Del más viejo al más nuevo

    if (error) return console.error('Error cargando historial:', error);
    
    data.forEach(msg => renderizarMensaje(msg));
    hacerScrollAbajo();
}

// 2. Renderizar un mensaje en la pantalla con el formato requerido
function renderizarMensaje(msg) {
    const div = document.createElement('div');
    
    // Formatear la hora local del mensaje
    const hora = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    div.className = "bg-gray-700 p-3 rounded-lg max-w-xl self-start shadow-md break-words";
    div.innerHTML = `
        <div class="flex items-baseline gap-2 mb-1">
            <span class="font-bold text-emerald-400 text-sm">${msg.usuario}</span>
            <span class="text-[10px] text-gray-400">${hora}</span>
        </div>
        <p class="text-gray-200 text-sm">${msg.contenido}</p>
    `;
    ventanaChat.appendChild(div);
}

// 3. Enviar un nuevo mensaje a la DB
formChat.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mensaje = inputMensaje.value.trim();
    const usuario = inputUsuario.value.trim() || 'Anónimo';

    if (!mensaje) return;

    const { error } = await supabase
        .from('mensajes')
        .insert([{ usuario: usuario, contenido: mensaje }]);

    if (error) console.error('Error al enviar:', error);
    
    inputMensaje.value = ''; // Limpiar input
});

// 4. ESCUCHAR EN TIEMPO REAL (Magia de Supabase)
supabase
    .channel('cambios-chat')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes' }, payload => {
        renderizarMensaje(payload.new);
        hacerScrollAbajo();
    })
    .subscribe();

// Función auxiliar para mantener el scroll abajo de todo
function hacerScrollAbajo() {
    ventanaChat.scrollTop = ventanaChat.scrollHeight;
}

// Inicializar
cargarHistorial();
