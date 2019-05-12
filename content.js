//written by Bar Kazzaz bar.kazzaz@imperva.com or barkazzaz@gmail.com
//logic:
//	every 10 seconds{
//		-sort queue (if unsorted)
//		-refresh queue
//		-read zendesk times
//		-send to backgroundscript
//	}

/*---variables---*/
let allTimes = [];
let nextSlaBtn;
let resetBTN;
let errCount;
let counts;
/*endOfVariables*/

function setAtllTimes(callback) {
    //refresh view
    var buttons = document.getElementsByClassName("action_button");
    if (buttons) {
        if (buttons.length > 0) {
            buttons[1].click();
        }
    }
    //set
    allTimesStruct = document.getElementsByTagName("time");
    if (allTimesStruct) {
        callback();
        if (errCount > 2) {
            console.log("disabling SlaChecker");
            clearInterval(x);
        }
    }
}

function sendToBackground() {
    //called after setAllTimes()
    //set allTimes as array of innerText
    for (i = 0; i < allTimesStruct.length; i++) {
        allTimes[i] = allTimesStruct[i].innerText;
    }
    //send to backend
    if (allTimes.length > 0) {
        try {
            chrome.runtime.sendMessage(allTimes);
        } catch (err) {
            errCount++;
            console.log(errCount + " errors sending to backgroundscript");
        }
    }
}

function isSorted() {
    resetBTN = document.getElementsByClassName("link_light reset_order")[0];
    if (resetBTN) {
        return true;
    } else {
        return false;
    }
}

function sortQueue() {
    let allspans = document.getElementsByTagName('span');
    let spans = [];
    for (i = 0; i < allspans.length; i++) {
        if (allspans[i].parentNode) {
            if (allspans[i].parentNode.tagName.toLowerCase() == 'th') {
                spans.push(allspans[i]);
            }
        }
    }
    for (i = 0; i < spans.length; i++) {
        if (spans[i].innerText.toLowerCase().includes('sla')) {
            nextSlaBtn = spans[i];
            break;
        }
    }
    if (nextSlaBtn) {
        nextSlaBtn.click();
    } else {
        console.log("no SLA button in page");
    }
}

function gotMessage(message, sender, sendResponse) {
    console.log(message.text);
    if (message.text == "bar says monitor" && !x) {
        monitor();
    } else if (message.text == "bar says stop") {
        //
        if (x) { clearTimeout(x); }
        console.log("SLA Checker disabled");
    } else if (message.text == "bar wants tickets") {
        getTickets(message.numOfTickets);
    }
    sendResponse(0);
}

function getTickets(numOfTickets) {
    var ticketsDict = {};
    var tickets = [];
    var IdIndex;
    if (allTimesStruct) {
        if (allTimesStruct.length > 0) {
            for (i = 0; i < allTimesStruct.length; i++) {
                var row = allTimesStruct[i].parentElement.parentElement;
                for (j = 0; j < row.children.length; j++) {
                    if (row.children[j].innerText.match(/#[0-9]*/g)) {
                        IdIndex = j;
                        var ticketNumber = row.children[j].innerText.match(/#[0-9]*/g)[0]; //match returns array of matching results
                        ticketsDict[ticketNumber] = true;
                        break;
                    }
                }
            }
        }
    }
    i = 0;
    console.log(numOfTickets);
    for (key in ticketsDict) {
        tickets[i] = key;
        i++;
        if (i == numOfTickets) { break; }
    }
    let msg = {
        text: "tickets",
        tickets: tickets
    }
    console.log(msg);
    chrome.runtime.sendMessage(msg);
    return tickets;
}

function checkPriorityQueue() {
    counts = document.getElementsByClassName("count");
    var priorityCountIndex;
    for (i = 0; i < counts.length; i++) {
        if (counts[i].parentElement.innerText.includes('Shift Leads "Set Priority" View')) { priorityCountIndex = i; break; }
    }
    if (!isNaN(priorityCountIndex)) //NaN = Not A Number
    {
        if (parseInt(counts[priorityCountIndex].innerText) > 0) {
            let msg = { text: "setPriority" }
            chrome.runtime.sendMessage(msg);
        } else {
            let msg = { text: "resetPriority" }
            chrome.runtime.sendMessage(msg);
        }
    }
}

function monitor() {
    chrome.storage.sync.get(['monitorPriority', 'monitorInterval'], function(data) {
        var monitorPriority = data.monitorPriority;
        var monitorInterval = parseFloat(data.monitorInterval);
        monitorInterval *= 1000;
        if (monitorInterval <= 5000) { monitorInterval = 5000; }
        if (monitorPriority) { checkPriorityQueue(); }
        if (!isSorted()) { sortQueue(); } else { setAtllTimes(sendToBackground); }
        x = setTimeout(monitor, monitorInterval);
    });
}

/*---------main()---------*/
let x = false;
errCount = 0;
chrome.runtime.onMessage.addListener(gotMessage);
/*---------endOfMain()---------*/