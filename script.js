let roomCode = "";
let playerId = Date.now().toString();

// 🔑 YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDHTrztdcMC4cnYo--LHHiEqOHNJoRgf5I",
  authDomain: "rmc-game.firebaseapp.com",
  databaseURL: "https://rmc-game-default-rtdb.asia-southeast1.firebasedatabase.app/", // IMPORTANT
  projectId: "rmc-game",
  storageBucket: "rmc-game.firebasestorage.app",
  messagingSenderId: "18305695036",
  appId: "1:18305695036:web:7fcba0dfccd9222e777239"
};

// ✅ Initialize Firebase (v8)
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 🎮 CREATE ROOM
function createRoom() {
  roomCode = Math.floor(1000 + Math.random() * 9000).toString();

  db.ref("rooms/" + roomCode).set({
    players: {},
    roles: {},
    guess: null
  }).then(() => {
    document.getElementById("roomCode").innerText =
      "Room Code: " + roomCode;

    joinRoomByCode(roomCode);
  });
}

// 🚪 JOIN ROOM
function joinRoom() {
  const code = document.getElementById("roomInput").value;
  if (!code) return alert("Enter room code");
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
db.ref("rooms").on("value", snapshot => {
  const rooms = snapshot.val();
  if (!rooms || !rooms[roomCode]) return;

  const room = rooms[roomCode];
  if (!room.roles) return;

  const myRole = room.roles[playerId];

  if (!myRole) return;

  document.getElementById("role").innerText =
    "Your Role: " + myRole;

  if (myRole === "Mantri") {
    document.getElementById("guessBox").style.display = "block";
  }
});

// 🧠 SEND GUESS
function sendGuess() {
  const guess = document.getElementById("guess").value;
  if (!guess) return;

  db.ref("rooms/" + roomCode + "/guess").set({
    guess: guess
  });
}

// 🏆 RESULT SYSTEM
db.ref("rooms").on("value", snapshot => {
  const rooms = snapshot.val();
  if (!rooms || !rooms[roomCode]) return;

  const room = rooms[roomCode];
  if (!room.guess || !room.roles) return;

  let chorIndex = null;
  let keys = Object.keys(room.roles);

  keys.forEach((id, index) => {
    if (room.roles[id] === "Chor") chorIndex = index + 1;
  });

  if (parseInt(room.guess.guess) === chorIndex) {
    document.getElementById("result").innerText =
      "✅ Mantri Wins!";
  } else {
    document.getElementById("result").innerText =
      "❌ Chor Wins!";
  }
});
