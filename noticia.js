// Cole sua configuração do Firebase aqui
const firebaseConfig = {
  apiKey: "AIzaSyAFUYzO9vv8tULWJycpfOS7emT9Q5pOB6I",
  authDomain: "cariominas-7e62f.firebaseapp.com",
  projectId: "cariominas-7e62f",
  storageBucket: "cariominas-7e62f.firebasestorage.app",
  messagingSenderId: "891749997037",
  appId: "1:891749997037:web:1122897dfd94fb3ea6afe4",
  measurementId: "G-GJQXDMNDF4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', async () => {
    const content = document.getElementById('noticia-detalhe-content');
    const params = new URLSearchParams(window.location.search);
    const noticiaId = params.get('id');

    if (!noticiaId) {
        content.innerHTML = "<h1>Notícia não encontrada.</h1>";
        return;
    }

    try {
        const doc = await db.collection('noticias').doc(noticiaId).get();
        if (!doc.exists) {
            content.innerHTML = "<h1>Notícia não encontrada.</h1>";
            return;
        }

        const noticia = doc.data();

        // =================================================================
        // LÓGICA ATUALIZADA PARA SER COMPATÍVEL COM AMBAS AS ESTRUTURAS
        // =================================================================
        let imagensDaNoticia = [];
        if (noticia.imagens && noticia.imagens.length > 0) {
            // Se encontrar a NOVA estrutura (um array 'imagens'), usa ela
            imagensDaNoticia = noticia.imagens;
        } else if (noticia.imagemBase64) {
            // Se encontrar a ANTIGA estrutura (uma string 'imagemBase64'),
            // cria um array com essa única imagem
            imagensDaNoticia = [noticia.imagemBase64];
        }
        // =================================================================

        let imagensHtml = '';
        if (imagensDaNoticia.length > 0) {
            imagensDaNoticia.forEach(img => {
                imagensHtml += `<div class="swiper-slide"><img src="${img}" alt="${noticia.titulo}"></div>`;
            });
        }

        const html = `
            <h1 class="noticia-detalhe-titulo">${noticia.titulo}</h1>
            <div class="swiper noticia-detalhe-slider">
                <div class="swiper-wrapper">${imagensHtml}</div>
                <div class="swiper-pagination"></div>
                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>
            </div>
            <p class="noticia-detalhe-descricao">${noticia.resumo}</p>
        `;
        content.innerHTML = html;

        // O slider só terá loop e navegação se houver mais de uma imagem
        const hasMultipleImages = imagensDaNoticia.length > 1;
        
        new Swiper('.noticia-detalhe-slider', {
            loop: hasMultipleImages,
            pagination: { el: '.swiper-pagination', clickable: true, hidden: !hasMultipleImages },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
        
        // Esconde as setas se tiver apenas uma imagem
        if (!hasMultipleImages) {
            document.querySelector('.noticia-detalhe-slider .swiper-button-next').style.display = 'none';
            document.querySelector('.noticia-detalhe-slider .swiper-button-prev').style.display = 'none';
        }

    } catch (error) {
        console.error("Erro ao carregar detalhe da notícia:", error);
        content.innerHTML = "<h1>Ocorreu um erro ao carregar a notícia.</h1>";
    }
});