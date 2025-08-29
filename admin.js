
const firebaseConfig = {
  apiKey: "AIzaSyAFUYzO9vv8tULWJycpfOS7emT9Q5pOB6I",
  authDomain: "cariominas-7e62f.firebaseapp.com",
  projectId: "cariominas-7e62f",
  storageBucket: "cariominas-7e62f.firebasestorage.app",
  messagingSenderId: "891749997037",
  appId: "1:891749997037:web:1122897dfd94fb3ea6afe4",
  measurementId: "G-GJQXDMNDF4"
};

// Inicializa o Firebase e seus serviços
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
// ===================================================

// Elementos do DOM
const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const noticiaForm = document.getElementById('noticia-form');
const noticiasList = document.getElementById('noticias-list');
const formTitle = document.getElementById('form-title');
const saveBtn = document.getElementById('save-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
// Removemos as referências da barra de progresso do upload
// const uploadProgressContainer = document.getElementById('upload-progress-container');
// const uploadProgress = document.getElementById('upload-progress');

// Gerenciador de estado de autenticação
auth.onAuthStateChanged(user => {
    if (user) {
        loginView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        carregarNoticias();
    } else {
        loginView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
    }
});

// Evento de Login (sem alterações)
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginError = document.getElementById('login-error');

    auth.signInWithEmailAndPassword(email, password)
        .catch(error => {
            loginError.textContent = "E-mail ou senha inválidos. Tente novamente.";
            console.error("Erro de login:", error);
        });
});

// Evento de Logout (sem alterações)
logoutBtn.addEventListener('click', () => {
    auth.signOut();
});

// Função para carregar as notícias do Firestore (sem alterações)
async function carregarNoticias() {
    noticiasList.innerHTML = '<p>Carregando notícias...</p>';
    const snapshot = await db.collection('noticias').orderBy('dataPublicacao', 'desc').get();
    
    if (snapshot.empty) {
        noticiasList.innerHTML = '<p>Nenhuma notícia cadastrada.</p>';
        return;
    }

    noticiasList.innerHTML = '';
    snapshot.forEach(doc => {
        const noticia = doc.data();
        const item = document.createElement('div');
        item.className = 'noticia-item';
        item.innerHTML = `
            <span>${noticia.titulo}</span>
            <div class="item-actions">
                <button class="btn-edit" data-id="${doc.id}">Editar</button>
                <button class="btn-delete" data-id="${doc.id}">Excluir</button>
            </div>
        `;
        noticiasList.appendChild(item);
    });

    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', handleEdit);
    });
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', handleDelete);
    });
}

noticiaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('noticia-id').value;
    const titulo = document.getElementById('titulo').value;
    const resumo = document.getElementById('resumo').value;
    const imagemFiles = document.getElementById('imagem').files; // Pega todos os arquivos

    saveBtn.disabled = true;
    saveBtn.textContent = 'Salvando...';

    try {
        let imagensBase64 = [];
        if (imagemFiles.length > 0) {
            // Cria uma lista de "promessas" de processamento de imagem
            const promises = Array.from(imagemFiles).map(file => processarImagemParaBase64(file));
            // Espera todas as imagens serem processadas
            imagensBase64 = await Promise.all(promises);
        }

        if (id) {
            // ATUALIZANDO
            const docRef = db.collection('noticias').doc(id);
            let updateData = { titulo, resumo };
            
            if (imagensBase64.length > 0) {
                // Se novas imagens foram enviadas, substitui as antigas
                updateData.imagens = imagensBase64;
            }

            await docRef.update(updateData);
            alert('Notícia atualizada com sucesso!');
        } else {
            // CRIANDO
            if (imagensBase64.length === 0) {
                alert('Por favor, selecione pelo menos uma imagem.');
                throw new Error("Nenhuma imagem selecionada");
            }
            await db.collection('noticias').add({
                titulo,
                resumo,
                imagens: imagensBase64, // Salva o array de imagens
                dataPublicacao: new Date()
            });
            alert('Notícia criada com sucesso!');
        }
    } catch (error) {
        console.error("Erro ao salvar notícia:", error);
        alert('Ocorreu um erro ao salvar. Tente novamente.');
    } finally {
        resetarFormulario();
        await carregarNoticias();
    }
});

/**
 * Função para redimensionar, comprimir e converter uma imagem para Base64.
 * @param {File} file - O arquivo de imagem selecionado pelo usuário.
 * @returns {Promise<string>} Uma Promise que resolve com a string da imagem em Base64.
 */
function processarImagemParaBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxWidth = 800; // Define a largura máxima da imagem

                // Redimensiona a imagem mantendo a proporção
                const scale = maxWidth / img.width;
                canvas.width = maxWidth;
                canvas.height = img.height * scale;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Converte o canvas para Data URL (Base64) com compressão JPEG
                // O segundo parâmetro (0.7) é a qualidade da imagem (de 0 a 1)
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7); 
                resolve(dataUrl);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
}

// Função para lidar com a edição (sem alterações)
async function handleEdit(e) {
    const id = e.target.dataset.id;
    const doc = await db.collection('noticias').doc(id).get();
    if (!doc.exists) return;

    const data = doc.data();
    document.getElementById('noticia-id').value = id;
    document.getElementById('titulo').value = data.titulo;
    document.getElementById('resumo').value = data.resumo;
    
    formTitle.textContent = 'Editando Notícia';
    saveBtn.textContent = 'Atualizar Notícia';
    cancelEditBtn.classList.remove('hidden');
    window.scrollTo(0, 0);
}

// Função para lidar com a exclusão (sem alterações)
async function handleDelete(e) {
    const id = e.target.dataset.id;
    if (confirm('Tem certeza que deseja excluir esta notícia? Esta ação não pode ser desfeita.')) {
        try {
            await db.collection('noticias').doc(id).delete();
            alert('Notícia excluída com sucesso!');
            await carregarNoticias();
        } catch (error) {
            console.error("Erro ao excluir:", error);
            alert('Ocorreu um erro ao excluir. Tente novamente.');
        }
    }
}

// Função para resetar o formulário (sem alterações)
function resetarFormulario() {
    noticiaForm.reset();
    document.getElementById('noticia-id').value = '';
    formTitle.textContent = 'Adicionar Nova Notícia';
    saveBtn.textContent = 'Salvar Notícia';
    saveBtn.disabled = false;
    cancelEditBtn.classList.add('hidden');
}

// Evento do botão de cancelar edição (sem alterações)
cancelEditBtn.addEventListener('click', resetarFormulario);