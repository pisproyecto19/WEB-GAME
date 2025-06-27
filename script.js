// Firebase Configuración (PÉGALO ARRIBA EN script.js)
const firebaseConfig = {
  apiKey: "AIzaSyA21zZr6JMobYWc5YvqWaNr7OaO9CYj6ww",
  authDomain: "gamersocialapp-17ecd.firebaseapp.com",
  projectId: "gamersocialapp-17ecd",
  storageBucket: "gamersocialapp-17ecd.firebasestorage.app",
  messagingSenderId: "478292469449",
  appId: "1:478292469449:web:ddcb2236be864b86a5cf18",
  measurementId: "G-ZJ57BDHD1Z"
};



firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();



// Regiones del DOM
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const toLogin = document.getElementById('to-login');
const toSignup = document.getElementById('to-signup');
const signupError = document.getElementById('signup-error');
const loginError = document.getElementById('login-error');
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');

const userPic = document.getElementById('user-pic');
const userName = document.getElementById('user-name');
const btnLogout = document.getElementById('btn-logout');
const menuFeed = document.getElementById('menu-feed');
const menuProfile = document.getElementById('menu-profile');
const feedSection = document.getElementById('feed-section');
const profileSection = document.getElementById('profile-section');
const postForm = document.getElementById('postForm');
const postText = document.getElementById('postText');
const postImage = document.getElementById('postImage');
const feed = document.getElementById('feed');
const avatarInput = document.getElementById('avatarInput');
const btnChangeAvatar = document.getElementById('btn-change-avatar');

// Modo de cambio de formularios
toLogin.onclick = () => { signupForm.classList.add('hidden'); loginForm.classList.remove('hidden'); };
toSignup.onclick = () => { loginForm.classList.add('hidden'); signupForm.classList.remove('hidden'); };

// Registro de usuarios
signupForm.onsubmit = async e => {
  e.preventDefault();
  const email = signupForm['signup-email'].value;
  const pwd = signupForm['signup-password'].value;
  signupError.textContent = '';
  try {
    const cred = await firebase.auth().createUserWithEmailAndPassword(email, pwd);
    await cred.user.sendEmailVerification();
    signupError.textContent = 'Verifica tu email antes de iniciar sesión.';
  } catch (err) {
    signupError.textContent = err.message;
  }
};

// Inicio de sesión
loginForm.onsubmit = async e => {
  e.preventDefault();
  const email = loginForm['login-email'].value;
  const pwd = loginForm['login-password'].value;
  loginError.textContent = '';
  try {
    await firebase.auth().signInWithEmailAndPassword(email, pwd);
  } catch (err) {
    loginError.textContent = err.message;
  }
};

// Observador de estado de autenticación
firebase.auth().onAuthStateChanged(user => {
  if (user && user.emailVerified) {
    authContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');
    initializeApp(user);
  } else {
    authContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
  }
});

// Inicializó contenido después del login
function initializeApp(user) {
  userPic.src = user.photoURL || 'https://via.placeholder.com/50';
  userName.textContent = user.email;

  menuFeed.onclick = () => {
    menuFeed.classList.add('active');
    menuProfile.classList.remove('active');
    feedSection.classList.remove('hidden');
    profileSection.classList.add('hidden');
  };
  menuProfile.onclick = () => {
    menuProfile.classList.add('active');
    menuFeed.classList.remove('active');
    profileSection.classList.remove('hidden');
    feedSection.classList.add('hidden');
  };

  btnLogout.onclick = () => firebase.auth().signOut();

  // Feed y publicaciones
  firebase.firestore().collection('posts')
    .orderBy('createdAt', 'desc')
    .onSnapshot(ss => {
      feed.innerHTML = '';
      ss.forEach(doc => {
        const p = doc.data();
        const d = document.createElement('div');
        d.className = 'post';
        d.innerHTML = `
          <div class="author"><img src="${p.userPhoto}"><strong>${p.userName}</strong></div>
          <p>${p.text}</p>
          ${p.imageUrl ? `<img src="${p.imageUrl}">` : ''}
        `;
        feed.append(d);
      });
    });

  postForm.onsubmit = async e => {
    e.preventDefault();
    let imgUrl = null;
    if (postImage.files[0]) {
      const ref = firebase.storage().ref('posts/' + Date.now() + '_' + postImage.files[0].name);
      await ref.put(postImage.files[0]);
      imgUrl = await ref.getDownloadURL();
    }
    const u = firebase.auth().currentUser;
    await firebase.firestore().collection('posts').add({
      text: postText.value,
      imageUrl: imgUrl,
      userName: u.email,
      userPhoto: u.photoURL || '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    postForm.reset();
  };

  btnChangeAvatar.onclick = async () => {
    if (!avatarInput.files[0]) return alert('Selecciona una imagen.');
    const ref = firebase.storage().ref('avatars/' + user.uid);
    await ref.put(avatarInput.files[0]);
    const url = await ref.getDownloadURL();
    await user.updateProfile({ photoURL: url });
    userPic.src = url;
  };
}
