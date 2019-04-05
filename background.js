//written by Bar Kazzaz bar.kazzaz@imperva.com or barkazzaz@gmail.com
/*logic:
//  -add message listener //(message will be sent from content.js)
//  -for each time in <time>[] do: //(<time>[] should be recieved in message)
//      -if(time<90minutes){ 
//          -if(notified){
//              -clearNotification();
//              -sleep();
//          }
//          -notify(); 
//          -break;
//      }
//  }
//  *if <time>[] is SORTED by content.js and there is a reason to notify: it will only check the 1st ticket.
//  *if <time>[] is UNSORTED and there is a reason to notify: it will check entire first page at worst
//  *this means UNSORTED page could cause false negatives (e.i "under90" is in 2nd page)
*/

//chrome notifications options
let notificationOptions = {
    type: "basic",
    iconUrl: "icon.png",
    title: "SLA Checker",
    message: "Bar the creator",
    buttons: [{
            title: "Get List",
            iconUrl: "mainIcon.png"
        }, {
            title: "Snooze 15m",
        }]
};
let _message = {
    text:"",
    tabID:"",
    numOfTickets:5
};
let myNotificationIDs = {};
let snoozeCount = 0;
let snoozeIDs = {}//will act as a dictionary of snoozing tab.ids
let allTimes; //will be the <time>[] mentioned at logic section above
let tabId; //

/*----flags:----*/
let noUnder90Mins; 
let noUnderDay;
let firstNotification = true;
/*--endOfFlags--*/

/*Functions*/

/*Helpers*/
function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

function messageTabOnUpdated(tab){
    chrome.tabs.onUpdated.addListener(function (id, info) {
        if(info.status === 'complete') {
            chrome.tabs.sendMessage(tab.id, _message,clear_message);
        }
    });    
}

function clear_message(){
    _message = {
        text:"",
        tabID:""
    };
}

function isSnoozing(senderId){
    if(snoozeIDs[senderId]){
        if(snoozeIDs[senderId]>0)
        {
            return true;
        }
    }
    return false;
}

function buttonsClick(notifId, btnIdx){
    if(notifId in myNotificationIDs){
        if(btnIdx == 0)//list tickets btn
        {
            _message.text = "bar wants tickets";
            _message.numOfTickets = 5;
            chrome.tabs.sendMessage(parseInt(notifId),_message);
        }
        else if(btnIdx == 1){//snooze 15 btn
            snoozeIDs[notifId] = 90;
            chrome.notifications.clear(notifId);
        }
    }
}

function snoozePerTab(notificationId){
    chrome.notifications.clear(notificationId);
    snoozeIDs[notificationId] = 30;
}

function getTimesFromContentPage(message, senderId){
    //initialize before checking the array
    noUnder90Mins = true;
    noUnderDay = true;
    allTimes = message;

    console.log("gettingAllTimes");
    for(i=0;i<allTimes.length;i++)
    {
        if(allTimes[i][0]=='-'){
            noUnder90Mins = noUnderDay = false;
            notificationOptions.message = "BREACH!! " + allTimes[i]+"\nPress to snooze for 5 minutes";
            break;
        }
        var timeUnit = allTimes[i][allTimes[i].length-1];
        if(timeUnit=='m')
        {
            noUnder90Mins = noUnderDay = false;
            notificationOptions.message = "you have minutes!! " + allTimes[i]+"\nPress to snooze for 5 minutes";
            break;
        }else if(timeUnit=='h' && noUnder90Mins){
            noUnderDay = false;
            notificationOptions.message = "over an hour :)"+"\nPress to snooze for 5 minutes";
        }else if(timeUnit=='d' && noUnderDay){
            notificationOptions.message = "over a day :D "+"\nPress to snooze for 5 minutes";
        }
    }//end of for loop
    if(!noUnder90Mins){
        console.log("creating notification");
        chrome.notifications.create(""+senderId,notificationOptions, addToMyNotificationIDs);
        soundNotify('CuckooClock.wav');
        setTimeout(function(){chrome.notifications.clear(""+senderId, removeFromMyNotificationIDs);},5000);
    }
    /*(4)"tickets" from content.js : message which is received after pressing "get tickets" notification button*/
    if(message.text == "tickets"){
        getTicketsMessageListener(message);
    }
}

function resetPrioritySnooze(){
    if(isSnoozing("setPriority")){
        delete snoozeIDs["setPriority"];
    }
}
/*endOfHelpers*/

//this is called whenever a message is recieved
function messageHandler(message, sender, sendResponse){
    /*(1)"setPriority" from content.js : received when there are tickets in set priority view*/
    if(message.text == "setPriority"){
        notifyAboutPriority(message);
    }
    if(message.text == "resetPriority"){
        resetPrioritySnooze();
    }
    if(sender.tab){
        var senderId = sender.tab.id;
        if(isSnoozing(senderId)){ 
            if(snoozeIDs[senderId]>0)
            {
                snoozeIDs[senderId] -=1;
                if(snoozeIDs[senderId] == 0){ delete snoozeIDs[senderId];}
            }
            return 0;
        }
    }
    /*(2)"duplicate" from popup.js: should created a duplicated tab and tell it's content.js to send <times>[]*/
    if(message.text == "bar says duplicate"){
        _message.text = "bar says monitor";//telling the content.js of the duplicated tab to monitor
        _message.tabID = message.tabID;
        let tabURL = message.tab.url;
        chrome.tabs.create({'url':tabURL,'active':false, pinned: true},messageTabOnUpdated);
        return 0;
    }
    /*(3)"monitor" from popup.js: should tell the tab's content.js to send <times>[]*/
    if(message.text == "bar says monitor"){
        _message.text = message.text;
        _message.tabID = message.tabID;
        messageTabOnUpdated(message.tab);
        return 0;
    }
    /*(4)"<time>[]" from content.js*/
    getTimesFromContentPage(message,sender.tab.id);
}

function notifyAboutPriority(message){
    if(isSnoozing("setPriority")){
        snoozeIDs["setPriority"] -=1;
        if(snoozeIDs["setPriority"] <= 0){ delete snoozeIDs["setPriority"];}
        return;
    }
    chrome.notifications.create("setPriority",{
        type: "basic",
        iconUrl: "priority.png",
        title: "Set Priority",
        message: "New ticket/s in priority view"
    },function(){
        console.log("priority notification created");
    });
    soundNotify('DoorBell.wav');
    setTimeout(function(){chrome.notifications.clear("setPriority");},5000);
}

function getTicketsMessageListener(message){
    alert(message.tickets);
}

function soundNotify(fn){
    let shouldMute;
    chrome.storage.sync.get('mute',function(data){
        shouldMute = data.mute;
        if(shouldMute){
            return;
        }else{
            var sound = new Audio('/audio/'+fn);
            sound.play();
        }
    });
}
//https://developer.chrome.com/extensions/tabs#method-create
function createTab() {
    chrome.tabs.create({'url':'https://www.youtube.com/watch?v=GWDx1GnxhOw&index=10&list=PLRqwX-V7Uu6bL9VOMT65ahNEri9uqLWfS','active':false});
}

function addToMyNotificationIDs(notifID){
    myNotificationIDs[notifID] = true;
}
function removeFromMyNotificationIDs(notifID){
    delete myNotificationIDs[notifID];
}

/*---------main()---------*/
chrome.runtime.onMessage.addListener(messageHandler);
chrome.notifications.onClicked.addListener(snoozePerTab); //when a notification is clicked we will snooze the next 5 minutes
chrome.notifications.onButtonClicked.addListener(buttonsClick);
/*---------endOfMain()---------*/