const DEFAULT_MONITOR_VALUE = 10;
const DEFAULT_SNOOZE_TIME = 15;
var monitorInterval;
var snoozeTime;
$(function(){
    chrome.storage.sync.get(['monitorInterval','snoozeTime'],function(data){
        if(data.monitorInterval){ monitorInterval = data.monitorInterval; }
        else{ monitorInterval = DEFAULT_MONITOR_VALUE; chrome.storage.sync.set({'monitorInterval':monitorInterval}) }
        $('#monitorInterval').val(monitorInterval);

        if(data.snoozeTime){ snoozeTime = data.snoozeTime; }
        else{ snoozeTime = DEFAULT_SNOOZE_TIME; chrome.storage.sync.set({'snoozeTime':snoozeTime}) }
        $('#snoozeTime').val(snoozeTime);
    })
    $('#saveMonitorInterval').click(function(){
        monitorInterval = $('#monitorInterval').val();
        chrome.storage.sync.set({'monitorInterval':monitorInterval},function(){
            //close();
        })
    })
    $('#saveSnoozeTime').click(function(){
        snoozeTime = $('#snoozeTime').val();
        chrome.storage.sync.set({'snoozeTime':snoozeTime},function(){
            //close();
        })
    })
})