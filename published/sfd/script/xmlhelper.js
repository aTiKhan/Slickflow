var xmlhelper;xmlhelper||(xmlhelper={}),xmlhelper.parseXML=function(e){var t=$.parseXML(e);return $(t)},xmlhelper.appendChild=function(e,t){$(e).append(t)},xmlhelper.removeChild=function(e,t){$(e).remove(t)},xmlhelper.getNodeText=function(e){return $(e).text()},xmlhelper.setNodeText=function(e,t){$(e).text(t)},xmlhelper.find=function(e,t,r){var l=[];$(e).find(t).each((function(e){r?e.text()==r&&l.push(e):l.push(e)}))},xmlhelper.setAttr=function(e,t,r){$(e).attr(t).value(r)},xmlhelper.getAttr=function(e,t){return $(e).attr(t)};