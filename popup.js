/*variables*/
let msg = {
  text: "",
  tab:{},
  tabID: ""
}

let monitorPriority;
let muteBool;
let priorityBtn;
const tier1URL = "https://incapsula.zendesk.com/agent/filters/30529877";
const tier2URL = "https://incapsula.zendesk.com/agent/filters/37806740";

//chrome.create properties
let createProperties = {
  url: "",
  active: false,
  pinned: true
}
/*endOfvariables*/

/*Functions*/

//this sets the message.text, gets current tab and callsback messageBackground
function duplicateAndMonitor(){
  let params = {//parameters for query
    active:true,
    currentWindow:true
  }
  msg.text = "bar says duplicate";
  chrome.tabs.query(params,messageBackground);
}

//sends msg to background.js
function messageBackground(tabs){
  msg.tabID = tabs[0].id;
  msg.tab = tabs[0];
  chrome.runtime.sendMessage(msg);
}

//this creates tier1 pinned tab and sends message to background.js
function monitor1stTier(){
  createProperties.url = tier1URL;
  chrome.tabs.create(createProperties,function(tab){
    msg.text = "bar says monitor";
    msg.tabID = tab.id;
    msg.tab = tab;
    console.log(msg);
    chrome.runtime.sendMessage(msg);
  });
}
function toggleMonitorPriority(){
  chrome.storage.sync.get('monitorPriority', function(data) {
    monitorPriority = !data.monitorPriority;
    chrome.storage.sync.set({'monitorPriority': monitorPriority}, function() {
      console.log('Value is set to ' + monitorPriority);
      if(monitorPriority){
        priorityBtn.style.backgroundColor = "green";
      }else{
        if(priorityBtn){
          priorityBtn.style.backgroundColor = "red";
        }
      }
    });
  });
}

function toggleMute(){
	chrome.storage.sync.get('mute',function(data){
		muteBool = !data.mute;
		chrome.storage.sync.set({'mute': muteBool},function(){
			if(muteBool){document.getElementById("muteBtn").src = '/images/muteX.png';}
			else{document.getElementById("muteBtn").src = '/images/volume.png';}
		});
	});
}
//message content.js
function messageTab(tabs){
  chrome.tabs.sendMessage(tabs[0].id,msg);
}

//send to content.js "stop monitoring" message
function stopMonitoring(){
  let params={
    active:true,
    currentWindow:true
  }
  msg.text = "bar says stop";
  chrome.tabs.query(params,messageTab);
}

function showFeatureDescription(){
  (this).innerText = "RightClick icon -> Options";
}
/*endOfFunctions*/

/*main()*/
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById("monitorBtn").addEventListener("click",duplicateAndMonitor);
  document.getElementById("stopMonitorBtn").addEventListener("click",stopMonitoring);
  document.getElementById("1stTierMonitorBtn").addEventListener("click",monitor1stTier);
  document.getElementById("monitorPriorityBtn").addEventListener("click",toggleMonitorPriority);
  document.getElementById("newFeature").addEventListener("click",showFeatureDescription);
  document.getElementById("muteBtn").addEventListener("click",toggleMute);
  document.getElementById("muteBtn").style.cursor = "pointer";
  
  priorityBtn = document.getElementById("monitorPriorityBtn");
  chrome.storage.sync.get('monitorPriority', function(data) {
    monitorPriority = data.monitorPriority;
    if(monitorPriority){ priorityBtn.style.backgroundColor = "green";}
    else{ priorityBtn.style.backgroundColor = "red";}
  });
  
  chrome.storage.sync.get('mute',function(data){
	  muteBool = data.mute;
	  if(muteBool) { document.getElementById("muteBtn").src = "/images/muteX.png";}
	  else{document.getElementById("muteBtn").src = "/images/volume.png";}
  });
});
/*endOfmain()*/