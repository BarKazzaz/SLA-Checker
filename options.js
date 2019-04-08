const DEFAULT_MONITOR_VALUE = 10;
const DEFAULT_SNOOZE_TIME = 15;
const DEFAULT_TIER_ONE_LINK = 'https://incapsula.zendesk.com/agent/filters/30529877';
var monitorInterval;
var snoozeTime;
var tierOneLink;
$(function(){
    function setListeners(){
        chrome.storage.sync.get(['monitorInterval','snoozeTime','tierOneLink'],function(data){
            if(data.monitorInterval){ monitorInterval = data.monitorInterval; }
            else{ monitorInterval = DEFAULT_MONITOR_VALUE; chrome.storage.sync.set({'monitorInterval':monitorInterval}) }
            $('#monitorInterval').val(monitorInterval);
            
            if(data.snoozeTime){ snoozeTime = data.snoozeTime; }
            else{ snoozeTime = DEFAULT_SNOOZE_TIME; chrome.storage.sync.set({'snoozeTime':snoozeTime}) }
            $('#snoozeTime').val(snoozeTime);

            if(data.tierOneLink){ tierOneLink = data.tierOneLink; }
            else{ tierOneLink = DEFAULT_TIER_ONE_LINK; chrome.storage.sync.set({'tierOneLink':tierOneLink}) }
            $('#tierOneLink').val(tierOneLink);
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

        $('#save1stTierLink').click(function(){
            tierOneLink = $('tierOneLink').val();
            chrome.storage.sync.set({'tierOneLink':tierOneLink},function(){
                //close();
            })
        })
    }
    $('#toggleBtn').click(function(){
        $('#navBar').toggle();
    })
    
    $('.navLink').click(function(){
        var container = $('#contentContainer'),
            $this = $(this);
        target = $this.data('target');
        console.log(target);
        container.load(target + '.html',setListeners);
    })
    $('#contentContainer').load('modify.html',setListeners);
})