let currentPatient = "";

/* ---------------- HYBRID STATUS (FAST) ---------------- */

function updateStatus(){

let status = document.getElementById("statusBar");
if(!status) return;

/* INTERNET CHECK */
const internetCheck = fetch("https://1.1.1.1", {
method: "HEAD",
mode: "no-cors"
});

/* LOCAL SERVER CHECK */
const serverCheck = fetch("/status");

/* DECISION */
Promise.allSettled([internetCheck, serverCheck])
.then(results => {

let internetOK = results[0].status === "fulfilled";
let serverOK = results[1].status === "fulfilled";

/* 🟢 ONLINE */
if(internetOK && serverOK){
status.innerText = "ONLINE MODE";
status.style.background = "green";
}

/* 🔵 LOCAL MODE */
else if(!internetOK && serverOK){
status.innerText = "LOCAL MODE";
status.style.background = "blue";
}

/* 🟠 SERVER OFFLINE */
else if(internetOK && !serverOK){
status.innerText = "SERVER OFFLINE";
status.style.background = "orange";
}

/* 🔴 OFFLINE */
else{
status.innerText = "OFFLINE MODE";
status.style.background = "red";
}

});

}


/* ---------------- ADD PATIENT ---------------- */

function addPatient(){

fetch("/add_patient",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
id:document.getElementById("pid").value,
name:document.getElementById("pname").value,
age:document.getElementById("page").value,
mobile:document.getElementById("pmobile").value,
problem:document.getElementById("pproblem").value
})
})
.then(()=>{

alert("Patient Saved");

/* CLEAR FORM */
document.getElementById("pid").value="";
document.getElementById("pname").value="";
document.getElementById("page").value="";
document.getElementById("pmobile").value="";
document.getElementById("pproblem").value="";

})
.catch(err => console.log(err));

}


/* ---------------- ADD TOKEN ---------------- */

function addQueue(){

fetch("/add_queue",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
patient_id:document.getElementById("qid").value
})
})
.then(loadQueue)
.catch(err => console.log(err));

}


/* ---------------- LOAD QUEUE ---------------- */

function loadQueue(){

fetch("/get_queue")
.then(r => r.json())
.then(data => {

let q = document.getElementById("queue");
if(!q) return;

q.innerHTML = "";

if(data.length === 0){
q.innerHTML = "<p>No patients in queue</p>";
return;
}

data.forEach(i => {

let div = document.createElement("div");
div.className = "queue-item";

div.innerText = "Token " + i.token + " - " + i.name;

div.onclick = function(){
showPatient(i.patient_id);
};

q.appendChild(div);

});

})
.catch(err => console.log(err));

}


/* ---------------- SHOW PATIENT ---------------- */

function showPatient(pid){

fetch("/get_patient/" + pid)
.then(r => r.json())
.then(p => {

currentPatient = p.id;

document.getElementById("id").innerText = p.id;
document.getElementById("name").innerText = p.name;
document.getElementById("age").innerText = p.age;
document.getElementById("mobile").innerText = p.mobile;
document.getElementById("problem").innerText = p.problem;

document.getElementById("notes").value = p.notes;

})
.catch(err => console.log(err));

}


/* ---------------- SAVE NOTES ---------------- */

function saveNotes(){

fetch("/save_notes",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
id:currentPatient,
notes:document.getElementById("notes").value
})
})
.then(()=> alert("Notes Saved"))
.catch(err => console.log(err));

}


/* ---------------- NEXT PATIENT ---------------- */

function nextPatient(){

fetch("/next_patient",{method:"POST"})
.then(loadQueue)
.catch(err => console.log(err));

}


/* ---------------- ESP SERVER SETTINGS ---------------- */

const ESP_IP = "http://192.168.4.1";  // change if needed

function saveServer(){

let url = document.getElementById("serverUrl").value;

fetch(ESP_IP + "/setServer?url=" + url)
.then(res => res.text())
.then(data => alert(data));

}

function loadServer(){

fetch(ESP_IP + "/getServer")
.then(res => res.text())
.then(data => {
document.getElementById("currentServer").innerText = data;
});

}


function syncNow(){
fetch("/sync_now")
.then(res => res.text())
.then(data => alert(data));
}



/* ---------------- START SYSTEM ---------------- */

document.addEventListener("DOMContentLoaded", function(){

updateStatus();
loadQueue();
loadServer();

/* AUTO REFRESH */
setInterval(loadQueue, 3000);
setInterval(updateStatus, 3000);

});
