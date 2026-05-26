import { app } from "./firebase-config.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  updateDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let user = null;

/* ---------------- UI ---------------- */

window.showTab = function(tab){

  document.querySelectorAll(".tab")
  .forEach(t => t.classList.add("hidden"));

  document.getElementById(tab + "Tab")
  .classList.remove("hidden");
};

/* ---------------- LOGIN ---------------- */

document.getElementById("googleLogin")
.onclick = () => signInWithPopup(auth, provider);

/* ---------------- AUTH ---------------- */

onAuthStateChanged(auth, async (u) => {

  if(!u) return;

  user = u;

  document.getElementById("profile")
  .classList.remove("hidden");

  document.getElementById("avatar").src = u.photoURL;
  document.getElementById("name").innerText = u.displayName;

  loadEvents();
  loadPlayers();
});

/* ---------------- SAVE PLAYER ---------------- */

document.getElementById("saveTag")
.onclick = async () => {

  const tag = document.getElementById("tag").value;

  if(!tag.startsWith("#")){
    alert("Tag must start with #");
    return;
  }

  await setDoc(doc(db,"players",user.uid),{
    name:user.displayName,
    tag:tag,
    photo:user.photoURL
  });

  alert("Saved!");
  loadPlayers();
};

/* ---------------- EVENTS REALTIME ---------------- */

function loadEvents(){

  onSnapshot(collection(db,"events"),(snap)=>{

    renderEvents(snap.docs);
    renderLive(snap.docs);
    renderFree(snap.docs);
  });
}

/* ---------------- RENDER EVENTS ---------------- */

function renderEvents(docs){

  const el = document.getElementById("eventsTab");
  el.innerHTML = "";

  docs.forEach(d => {

    const data = d.data();
    const count = data.participants?.length || 0;

    el.innerHTML += `
      <div class="event">
        <h3>${data.name}</h3>
        <p>${count}/${data.maxPlayers}</p>
        <p>${data.prize}</p>
        <p>${data.description}</p>

        <button class="joinBtn"
        onclick="joinEvent('${d.id}')">
          Join
        </button>
      </div>
    `;
  });
}

/* ---------------- LIVE EVENTS ---------------- */

function renderLive(docs){

  const el = document.getElementById("liveTab");
  el.innerHTML = "";

  docs.forEach(d => {

    const data = d.data();
    const count = data.participants?.length || 0;

    if(count > 0){

      el.innerHTML += `
        <div class="event">
          <h3>🔴 ${data.name}</h3>
          <p>${count}/${data.maxPlayers}</p>
        </div>
      `;
    }
  });
}

/* ---------------- FREE SLOTS ---------------- */

function renderFree(docs){

  const el = document.getElementById("freeTab");
  el.innerHTML = "";

  docs.forEach(d => {

    const data = d.data();
    const count = data.participants?.length || 0;

    if(count < data.maxPlayers){

      el.innerHTML += `
        <div class="event">
          <h3>${data.name}</h3>
          <p>Free slots: ${data.maxPlayers - count}</p>
        </div>
      `;
    }
  });
}

/* ---------------- PLAYERS ---------------- */

function loadPlayers(){

  onSnapshot(collection(db,"players"),(snap)=>{

    const el = document.getElementById("playersTab");
    el.innerHTML = "";

    snap.forEach(d => {

      const data = d.data();

      el.innerHTML += `
        <div class="event">
          <strong>${data.name}</strong>
          <p>${data.tag}</p>
        </div>
      `;
    });

  });
}

/* ---------------- JOIN EVENT ---------------- */

window.joinEvent = async function(id){

  const ref = doc(db,"events",id);

  const snap = await getDocs(collection(db,"events"));

  let eventData = null;

  snap.forEach(d=>{
    if(d.id===id) eventData=d.data();
  });

  if(!eventData) return;

  let participants = eventData.participants || [];

  if(participants.includes(user.uid)){
    alert("Already joined");
    return;
  }

  if(participants.length >= eventData.maxPlayers){
    alert("Event full");
    return;
  }

  participants.push(user.uid);

  await updateDoc(ref,{
    participants
  });

};

/* ---------------- ADMIN ---------------- */

window.adminLogin = function(){

  const pass = prompt("Admin password");

  if(pass==="Jahudka121"){
    document.getElementById("adminPanel")
    .classList.remove("hidden");
  }
};

/* CREATE EVENT */

document.getElementById("createEvent")
.onclick = async () => {

  const name =
  document.getElementById("eventName").value;

  const max =
  document.getElementById("eventMax").value;

  const prize =
  document.getElementById("eventPrize").value;

  const desc =
  document.getElementById("eventDesc").value;

  await setDoc(doc(collection(db,"events")),{
    name,
    maxPlayers:Number(max),
    prize,
    description:desc,
    participants:[],
    createdBy:user.displayName,
    createdAt:Date.now()
  });

  alert("Event created!");
};
