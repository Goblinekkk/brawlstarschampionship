import { app } from './firebase-config.js';

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const auth = getAuth(app);

const db = getFirestore(app);

const provider = new GoogleAuthProvider();

const googleLogin =
document.getElementById('googleLogin');

const profile =
document.getElementById('profile');

const avatar =
document.getElementById('avatar');

const name =
document.getElementById('name');

const tag =
document.getElementById('tag');

const saveTag =
document.getElementById('saveTag');

const players =
document.getElementById('players');

let currentUser = null;

googleLogin.onclick = async () => {

  await signInWithPopup(auth, provider);

};

onAuthStateChanged(auth, (user) => {

  if(user){

    currentUser = user;

    profile.classList.remove('hidden');

    avatar.src = user.photoURL;

    name.innerText = user.displayName;

  }

});

saveTag.onclick = async () => {

  if(!currentUser) return;

  await setDoc(
    doc(db, "players", currentUser.uid),
    {
      name: currentUser.displayName,
      tag: tag.value,
      photo: currentUser.photoURL
    }
  );

  loadPlayers();

};

async function loadPlayers(){

  players.innerHTML = "";

  const querySnapshot =
  await getDocs(collection(db, "players"));

  querySnapshot.forEach((docData) => {

    const data = docData.data();

    const div =
    document.createElement('div');

    div.className = "player";

    div.innerHTML = `
      <h3>${data.name}</h3>
      <p>${data.tag}</p>
    `;

    players.appendChild(div);

  });

}

loadPlayers();
