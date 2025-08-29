// Scripts de importação necessários para o Firebase Messaging em Service Worker
importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging-compat.js');

// A mesma configuração do Firebase que você usa nos outros arquivos
const firebaseConfig = {
    apiKey: "AIzaSyAqBwCgVJR_fH_QisTQZiIJE9B-2JC93vk",
    authDomain: "sunperyo.firebaseapp.com",
    projectId: "sunperyo",
    storageBucket: "sunperyo.appspot.com",
    messagingSenderId: "850650155716",
    appId: "1:850650155716:web:8bfb4799d92d701e421791"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Este handler cuida das notificações quando o app está em segundo plano ou fechado
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://i.postimg.cc/HngV6ftW/SUN-PLAN.png' // Ícone para a notificação
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
