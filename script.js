const firebaseConfig = {
  apiKey: "AIzaSyAFUYzO9vv8tULWJycpfOS7emT9Q5pOB6I",
  authDomain: "cariominas-7e62f.firebaseapp.com",
  projectId: "cariominas-7e62f",
  storageBucket: "cariominas-7e62f.firebasestorage.app",
  messagingSenderId: "891749997037",
  appId: "1:891749997037:web:1122897dfd94fb3ea6afe4",
  measurementId: "G-GJQXDMNDF4"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', function () {

    // --- LÓGICA ANTIGA: Efeito de revelar elementos ao rolar a página ---
    const revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    }


    // --- NOVA LÓGICA: Funcionalidade do Modal de Incentivo Fiscal ---

    // 1. Selecionar os elementos do DOM (botões e o próprio modal)
    const openModalBtn = document.getElementById('open-modal-btn');
    const openModalFooterBtn = document.getElementById('open-modal-footer-btn');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const modalOverlay = document.getElementById('incentivo-modal');
    const body = document.body;

    // Função para abrir o modal
    function openModal(event) {
        event.preventDefault(); // Previne o comportamento padrão do link (#)
        modalOverlay.classList.add('visible');
        body.classList.add('modal-active'); // Trava o scroll do fundo
    }

    // Função para fechar o modal
    function closeModal() {
        modalOverlay.classList.remove('visible');
        body.classList.remove('modal-active'); // Libera o scroll do fundo
    }

    // 2. Adicionar os "escutadores" de eventos

    // Se os elementos existirem na página, adiciona os eventos
    if (openModalBtn && openModalFooterBtn && closeModalBtn && modalOverlay) {

        // Eventos para abrir o modal
        openModalBtn.addEventListener('click', openModal);
        openModalFooterBtn.addEventListener('click', openModal);

        // Evento para fechar no botão 'X'
        closeModalBtn.addEventListener('click', closeModal);

        // Evento para fechar clicando fora do modal (no overlay)
        modalOverlay.addEventListener('click', function (event) {
            // Se o alvo do clique for o próprio overlay (o fundo), fecha o modal
            if (event.target === modalOverlay) {
                closeModal();
            }
        });

        // Evento para fechar o modal com a tecla "Escape" (melhora a acessibilidade)
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && modalOverlay.classList.contains('visible')) {
                closeModal();
            }
        });
    }

    // --- NOVA LÓGICA: Carregar notícias do Firebase Firestore ---
async function carregarNoticias() {
    const noticiasWrapper = document.getElementById('noticias-wrapper');
    if (!noticiasWrapper) return;

    try {
        const noticiasCollection = await db.collection('noticias')
            .orderBy('dataPublicacao', 'desc')
            .limit(10)
            .get();
        
        const totalNoticias = noticiasCollection.size; // Pega o número total de notícias

        if (totalNoticias === 0) {
            document.getElementById('noticias').style.display = 'none'; // Esconde a seção se não houver notícias
            return;
        }

        noticiasWrapper.innerHTML = '';

        noticiasCollection.forEach(doc => {
            const noticia = doc.data();
            const noticiaId = doc.id;

            let imagensHtml = '';
            let paginationHtml = '';
            if (noticia.imagens && noticia.imagens.length > 0) {
                noticia.imagens.forEach(imgBase64 => {
                    imagensHtml += `<div class="swiper-slide"><img src="${imgBase64}" alt="${noticia.titulo}"></div>`;
                });
                if (noticia.imagens.length > 1) {
                    paginationHtml = `
                        <div class="swiper-pagination"></div>
                        <div class="swiper-button-prev-img"></div>
                        <div class="swiper-button-next-img"></div>
                    `;
                }
            }
            
            const cardHtml = `
                <div class="swiper-slide">
                    <a href="noticia.html?id=${noticiaId}" class="noticia-card-link">
                        <div class="noticia-card glass-card">
                            <div class="noticia-imagem-slider swiper">
                                <div class="swiper-wrapper">${imagensHtml}</div>
                                ${paginationHtml}
                            </div>
                            <div class="noticia-conteudo">
                                <h3>${noticia.titulo}</h3>
                                <p>${noticia.resumo}</p>
                            </div>
                        </div>
                    </a>
                </div>
            `;
            noticiasWrapper.innerHTML += cardHtml;
        });

        // =================================================================
        // AQUI ESTÁ A LÓGICA ATUALIZADA PARA O LAYOUT
        // =================================================================
        const noticiasSlider = new Swiper('.noticias-slider', {
            slidesPerView: 1, // Sempre começa com 1
            spaceBetween: 30,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            // Se houver mais de 3 notícias, as setas de navegação aparecem
            // Caso contrário, ficam escondidas.
            on: {
                init: function () {
                    if (totalNoticias <= 3) { // Use a variável que contamos lá em cima
                        this.navigation.destroy();
                    }
                },
            },
            breakpoints: {
                600: {
                    // Mostra 2 colunas, a menos que só exista 1 notícia no total
                    slidesPerView: Math.min(totalNoticias, 2),
                    spaceBetween: 20
                },
                900: {
                    // Mostra 3 colunas, a menos que existam menos de 3 notícias no total
                    slidesPerView: Math.min(totalNoticias, 3),
                    spaceBetween: 30
                }
            }
        });

        const imgSliders = document.querySelectorAll('.noticia-imagem-slider');
        imgSliders.forEach((slider) => {
            const hasMultipleImages = slider.querySelectorAll('.swiper-slide').length > 1;
            new Swiper(slider, {
                loop: hasMultipleImages,
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                navigation: {
                    nextEl: '.swiper-button-next-img',
                    prevEl: '.swiper-button-prev-img',
                },
            });
        });

    } catch (error) {
        console.error("Erro ao carregar notícias: ", error);
        noticiasWrapper.innerHTML = '<p>Ocorreu um erro ao carregar as notícias.</p>';
    }
}

    // Chama a função para carregar as notícias assim que a página carregar
    carregarNoticias();

});

    async function carregarNoticias() {
        const noticiasGrid = document.getElementById('noticias-grid');
        if (!noticiasGrid) return; // Se o elemento não existir, para a execução

        try {
            const noticiasCollection = await db.collection('noticias')
                                               .orderBy('dataPublicacao', 'desc') // Ordena pelas mais recentes
                                               .limit(6) // Pega no máximo 6 notícias
                                               .get();
            
            if (noticiasCollection.empty) {
                noticiasGrid.innerHTML = '<p>Nenhuma notícia publicada ainda.</p>';
                return;
            }

            // Limpa a mensagem "Carregando..."
            noticiasGrid.innerHTML = '';

            noticiasCollection.forEach(doc => {
                const noticia = doc.data();

                // Cria o card da notícia
                const card = document.createElement('div');
                card.className = 'noticia-card glass-card'; // Reutilizando a classe glass-card

                // Formata a data para o padrão brasileiro (dd/mm/yyyy)
                const data = noticia.dataPublicacao.toDate();
                const dataFormatada = data.toLocaleDateString('pt-BR');
                
                // ========= ALTERAÇÃO AQUI =========
                // Usamos noticia.imagemBase64 diretamente no src da imagem
                card.innerHTML = `
                    <img src="${noticia.imagemBase64}" alt="Imagem da notícia ${noticia.titulo}" class="noticia-imagem">
                    <div class="noticia-conteudo">
                        <span class="noticia-data">${dataFormatada}</span>
                        <h3>${noticia.titulo}</h3>
                        <p>${noticia.resumo}</p>
                    </div>
                `;
                // ==================================
                
                noticiasGrid.appendChild(card);
            });

        } catch (error) {
            console.error("Erro ao carregar notícias: ", error);
            noticiasGrid.innerHTML = '<p>Ocorreu um erro ao carregar as notícias. Tente novamente mais tarde.</p>';
        }
    }

    // Chama a função para carregar as notícias assim que a página carregar
    carregarNoticias();