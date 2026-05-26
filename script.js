import { app } from "./firebase-config.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  setDoc,
  doc,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

/* LOADING */
setTimeout(()=>{
  document.getElementById("loadingScreen").style.display="none";
  document.getElementById("loginScreen").classList.remove("hidden");
},1500);

/* LOGIN */
document.getElementById("googleLogin").onclick =
()=> signInWithPopup(auth,provider);

/* AUTH */
let user=null;

onAuthStateChanged(auth,(u)=>{
  if(!u)return;

  user=u;

  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  loadEvents();
  loadPlayers();
});

/* MENU */
document.getElementById("menuBtn").onclick=()=>{
  document.getElementById("sidebar")
  .classList.toggle("hidden");
};

window.showTab=(id)=>{
  document.querySelectorAll(".tab")
  .forEach(t=>t.classList.add("hidden"));

  document.getElementById(id).classList.remove("hidden");
};

/* EVENTS */
async function loadEvents(){

  const snap=await getDocs(collection(db,"events"));

  const live=document.getElementById("live");
  const up=document.getElementById("upcoming");

  live.innerHTML="";
  up.innerHTML="";

  snap.forEach(d=>{

    const e=d.data();

    const div=`<div class="event">
      <h3>${e.name}</h3>
      <p>${e.prize}</p>
    </div>`;

    live.innerHTML+=div;
    up.innerHTML+=div;

  });
}

/* PLAYERS */
async function loadPlayers(){

  const snap=await getDocs(collection(db,"players"));

  const el=document.getElementById("players");
  el.innerHTML="";

  snap.forEach(d=>{

    const p=d.data();

    el.innerHTML+=`
      <div class="event">
        <b>${p.name}</b>
        <p>${p.tag}</p>
      </div>
    `;

  });

}

/* ADMIN */
window.openAdmin=()=>{

  const pass=prompt("Admin password");

  if(pass==="Jahudka121"){

    document.getElementById("adminPanel")
    .style.display="block";

  }

};

/* CREATE EVENT */
document.getElementById("createEvent").onclick=async()=>{

  await setDoc(doc(collection(db,"events")),{
    name:eventName.value,
    max:eventMax.value,
    prize:eventPrize.value
  });

  alert("Event created!");
};
