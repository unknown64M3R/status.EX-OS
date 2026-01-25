// PAGE SWITCH
function showPage(id){ document.querySelectorAll('.page').forEach(p=>p.classList.remove('active')); document.getElementById(id).classList.add('active'); }

function showPage(id){
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  // Change title based on page
  switch(id){
    case 'introScreen':
      document.title = "Main";
      break;
    case 'loginPage':
      document.title = "Login";
      break;
    case 'mainMenu':
      document.title = `Dashboard — (${codename})`;
      break;
    case 'profilePage':
      document.title = "Profile";
      break;
    case 'missionPage':
      document.title = "Mission Status";
      break;
    default:
      document.title = "EX-OS";
  }
}

// TYPEWRITER
const messages=["Authenticate your identity"];
const typewriterEl=document.getElementById("typewriter");
let msgIndex=0;
function typeMessage(msg, cb){ let i=0; typewriterEl.textContent=""; (function typeChar(){ if(i<msg.length){ typewriterEl.textContent+=msg.charAt(i++); setTimeout(typeChar,50); } else setTimeout(cb,700); })(); }
(function showNextMessage(){ if(msgIndex<messages.length) typeMessage(messages[msgIndex++], showNextMessage); else document.getElementById("introButtons").style.display="block"; })();

document.getElementById("proceedBtn").onclick=()=>showPage("loginPage");

// FETCH DATA
let validUsers={}, validProfiles={}, validMissions={};
async function fetchData(){
  validUsers = await fetch('/agents.json',{cache:"no-store"}).then(r=>r.json());
  validProfiles = await fetch('/profiles.json',{cache:"no-store"}).then(r=>r.json());
  validMissions = await fetch('/mission.json',{cache:"no-store"}).then(r=>r.json());
  document.getElementById("loginBtn").disabled=false;
}
fetchData();

// LOGIN
document.getElementById("loginBtn").onclick=()=>{
  const codename=document.getElementById("codename").value.trim();
  const idNumber=document.getElementById("idNumber").value.trim();
  const user=validUsers[codename];
  if(user && user.Id===idNumber && user.Status==="Active"){
    document.getElementById("dashCodename").textContent=codename;
    document.getElementById("dashRank").textContent=user.Rank||"N/A";
    document.getElementById("dashField").textContent=user.Field||"N/A";
    document.getElementById("dashStatus").textContent=user.Status||"N/A";
    document.getElementById("dashDescription").textContent = user.Description||"N/A";
    loadProfileData(codename);
    loadMissionData(codename);
    showPage("mainMenu");
  } else { document.getElementById("errorMsg").textContent="Invalid Codename or ID."; }
};

// LOAD PROFILE
function loadProfileData(codename){
  if(!codename) return;
  fetch('/profiles.json',{cache:"no-store"})
    .then(r=>r.json())
    .then(data=>{
      const profile=data[codename];
      if(!profile) return console.warn("Profile not found:",codename);
      document.getElementById("profileFullName").textContent=profile["Full Name"]||'N/A';
      document.getElementById("profileBirthDate").textContent=profile["Birth Date"]||'N/A';
      document.getElementById("profileGender").textContent=profile["Gender"]||'N/A';
      document.getElementById("profileEmail").textContent=profile["Email"]||'N/A';
      document.getElementById("profileContact").textContent=profile["Contact"]||'N/A';
      document.getElementById("profileAddress").textContent=profile["Address"]||'N/A';
    }).catch(e=>console.error("Error loading profile:",e));
}

// LOAD MISSION
async function loadMissionData(codename){
  if(!codename) return;

  try {
    // Always fetch live data
    const [missions, statusColors] = await Promise.all([
      fetch('/mission.json',{cache:"no-store"}).then(r=>r.json()),
      fetch('/status.json',{cache:"no-store"}).then(r=>r.json())
    ]);

    const mission = missions[codename];
    const colorMap = statusColors.missionStatus || {};

    if(!mission){
      document.getElementById("missionInfo").innerHTML="<p>No mission found.</p>";
      return;
    }

    const statusColor = colorMap[mission.Status] || "#ffffff";

    document.getElementById("missionInfo").innerHTML=`
      <p><strong>Mission Type:</strong> ${mission.Mission}</p>
      <p><strong>Task ID:</strong> ${mission.TaskId || 'N/A'}</p>
      <p><strong>Date Issued:</strong> ${mission.DateIssued || 'N/A'}</p>
      <p><strong>Status:</strong> <span style="color:${statusColor}; font-weight:bold;">${mission.Status}</span></p>
      <p><strong>Description:</strong> ${mission.Description}</p>
    `;

  } catch(e) {
    console.error("Error loading mission:", e);
    document.getElementById("missionInfo").innerHTML="<p>Error loading mission data.</p>";
  }
}

// Refresh button
document.getElementById("refreshMission").onclick = () => {
  const codename = document.getElementById("dashCodename").textContent;
  if (!codename) return;
  loadMissionData(codename);
};

// BUTTONS
document.getElementById("profileBtn").onclick=()=>{ const codename=document.getElementById("dashCodename").textContent; loadProfileData(codename); showPage("profilePage"); };
document.getElementById("missionBtn").onclick=()=>{ const codename=document.getElementById("dashCodename").textContent; loadMissionData(codename); showPage("missionPage"); };
document.getElementById("refreshProfile").onclick=()=>{ const codename=document.getElementById("dashCodename").textContent; loadProfileData(codename); };
document.getElementById("refreshMission").onclick=()=>{ const codename=document.getElementById("dashCodename").textContent; loadMissionData(codename); };

// LOGOUT
document.getElementById("logoutMain").onclick = () => {
  // Clear all user-specific info
  document.getElementById("codename").value = "";
  document.getElementById("idNumber").value = "";
  document.getElementById("errorMsg").textContent = "";
  
  document.getElementById("dashCodename").textContent = "";
  document.getElementById("dashRank").textContent = "";
  document.getElementById("dashField").textContent = "";
  document.getElementById("dashStatus").textContent = "";
  
  document.getElementById("profileFullName").textContent = "";
  document.getElementById("profileBirthDate").textContent = "";
  document.getElementById("profileGender").textContent = "";
  document.getElementById("profileEmail").textContent = "";
  document.getElementById("profileContact").textContent = "";
  document.getElementById("profileAddress").textContent = "";
  
  document.getElementById("missionInfo").innerHTML = "<p>Loading mission details...</p>";

  // Show login page
  showPage("loginPage");
};

// Page Title
function showPage(id){
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  // Get current codename from dashboard span
  const codename = document.getElementById("dashCodename")?.textContent || "";

  // Change title based on page
  switch(id){
    case 'introScreen':
      document.title = "Home";
      break;
    case 'loginPage':
      document.title = "Login";
      break;
    case 'mainMenu':
      document.title = codename ? `Dashboard — ${codename}` : "Dashboard";
      break;
    case 'profilePage':
      document.title = codename ? `Profile — ${codename}` : "Profile";
      break;
    case 'missionPage':
      document.title = codename ? `Mission Status — ${codename}` : "Mission Status";
      break;
    default:
      document.title = "XX-XX-XX";
  }
}