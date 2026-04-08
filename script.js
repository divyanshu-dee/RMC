// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDHTrztdcMC4cnYo--LHHiEqOHNJoRgf5I",
  authDomain: "rmc-game.firebaseapp.com",
  projectId: "rmc-game",
  storageBucket: "rmc-game.firebasestorage.app",
  messagingSenderId: "18305695036",
  appId: "1:18305695036:web:7fcba0dfccd9222e777239",
  measurementId: "G-EGHQHC66B9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let roomCode = "";
let playerId = Date.now().toString();

// 🎮 CREATE ROOM
function createRoom() {
  roomCode = Math.floor(1000 + Math.random() * 9000).toString();

  db.ref("rooms/" + roomCode).set({
    players: {},
    roles: [],
    guess: null
  });

  document.getElementById("roomCode").innerText =
    "Room Code: " + roomCode;

  joinRoomByCode(roomCode);
}

// 🚪 JOIN ROOM
function joinRoom() {
  const code = document.getElementById("roomInput").value;
  joinRoomByCode(code);
}

function joinRoomByCode(code) {
  roomCode = code;

  db.ref("rooms/" + roomCode + "/players/" + playerId).set({
    joined: true
  });

  document.getElementById("menu").style.display = "none";
  document.getElementById("game").style.display = "block";

  listenPlayers();
}

// 👥 WAIT FOR PLAYERS
function listenPlayers() {
  db.ref("rooms/" + roomCode + "/players").on("value", snapshot => {
    const players = snapshot.val();
    const count = Object.keys(players || {}).length;

    document.getElementById("status").innerText =
      count + "/4 players joined";

    if (count === 4) {
      assignRoles(players);
    }
  });
}

// 🎴 ASSIGN ROLES
function assignRoles(players) {
  const roles = ["Raja", "Mantri", "Chor", "Sipahi"];
  roles.sort(() => Math.random() - 0.5);

  const playerKeys = Object.keys(players);

  let roleMap = {};
  playerKeys.forEach((id, index) => {
    roleMap[id] = roles[index];
  });

  db.ref("rooms/" + roomCode + "/roles").set(roleMap);
}

// 👁️ SHOW ROLE
db.ref().on("value", snapshot => {
  const data = snapshot.val();
  if (!data || !data.rooms || !data.rooms[roomCode]) return;

  const room = data.rooms[roomCode];

  if (!room.roles) return;

  const myRole = room.roles[playerId];

  document.getElementById("role").innerText =
    "Your Role: " + myRole;

  // Only Mantri can guess
  if (myRole === "Mantri") {
    document.getElementById("guessBox").style.display = "block";
  }
});

// 🧠 SEND GUESS
function sendGuess() {
  const guess = document.getElementById("guess").value;

  db.ref("rooms/" + roomCode + "/guess").set({
    guess: guess
  });
}

// 🏆 RESULT SYSTEM
db.ref("rooms/" + roomCode + "/guess").on("value", snapshot => {
  const data = snapshot.val();
  if (!data) return;

  db.ref("rooms/" + roomCode + "/roles").once("value", snap => {
    const roles = snap.val();

    let chorId = null;
    let keys = Object.keys(roles);

    keys.forEach((id, index) => {
      if (roles[id] === "Chor") chorId = index + 1;
    });

    if (parseInt(data.guess) === chorId) {
      document.getElementById("result").innerText =
        "✅ Mantri Wins!";
    } else {
      document.getElementById("result").innerText =
        "❌ Chor Wins!";
    }
  });
});