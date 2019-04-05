var monitorInterval;
var snoozeTime;
$(function(){
    chrome.storage.sync.get(['monitorInterval','snoozeTime'],function(data){
        $('#monitorInterval').val(data.monitorInterval);
        $('#snoozeTime').val(data.snoozeTime);
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