import{retreatFrontier}from"../line/highlight.js";import{startWorker}from"../display/highlight_worker.js";import{operation}from"../display/operations.js";import{regChange,regLineChange}from"../display/view_tracking.js";import{clipLine,clipPos,cmp,Pos}from"../line/pos.js";import{sawReadOnlySpans}from"../line/saw_special_spans.js";import{lineLength,removeReadOnlyRanges,stretchSpansOverChange,visualLine}from"../line/spans.js";import{getBetween,getLine,lineNo}from"../line/utils_line.js";import{estimateHeight}from"../measurement/position_measurement.js";import{hasHandler,signal,signalCursorActivity}from"../util/event.js";import{indexOf,lst,map,sel_dontScroll}from"../util/misc.js";import{signalLater}from"../util/operation_group.js";import{changeEnd,computeSelAfterChange}from"./change_measurement.js";import{isWholeLineUpdate,linkedDocs,updateDoc}from"./document_data.js";import{addChangeToHistory,historyChangeFromChange,mergeOldSpans,pushSelectionToHistory}from"./history.js";import{Range,Selection}from"./selection.js";import{setSelection,setSelectionNoUndo,skipAtomic}from"./selection_updates.js";function filterChange(e,n,t){let i={canceled:!1,from:n.from,to:n.to,text:n.text,origin:n.origin,cancel:()=>i.canceled=!0};return t&&(i.update=(n,t,o,r)=>{n&&(i.from=clipPos(e,n)),t&&(i.to=clipPos(e,t)),o&&(i.text=o),void 0!==r&&(i.origin=r)}),signal(e,"beforeChange",e,i),e.cm&&signal(e.cm,"beforeChange",e.cm,i),i.canceled?(e.cm&&(e.cm.curOp.updateInput=2),null):{from:i.from,to:i.to,text:i.text,origin:i.origin}}export function makeChange(e,n,t){if(e.cm){if(!e.cm.curOp)return operation(e.cm,makeChange)(e,n,t);if(e.cm.state.suppressEdits)return}if((hasHandler(e,"beforeChange")||e.cm&&hasHandler(e.cm,"beforeChange"))&&!(n=filterChange(e,n,!0)))return;let i=sawReadOnlySpans&&!t&&removeReadOnlyRanges(e,n.from,n.to);if(i)for(let t=i.length-1;t>=0;--t)makeChangeInner(e,{from:i[t].from,to:i[t].to,text:t?[""]:n.text,origin:n.origin});else makeChangeInner(e,n)}function makeChangeInner(e,n){if(1==n.text.length&&""==n.text[0]&&0==cmp(n.from,n.to))return;let t=computeSelAfterChange(e,n);addChangeToHistory(e,n,t,e.cm?e.cm.curOp.id:NaN),makeChangeSingleDoc(e,n,t,stretchSpansOverChange(e,n));let i=[];linkedDocs(e,((e,t)=>{t||-1!=indexOf(i,e.history)||(rebaseHist(e.history,n),i.push(e.history)),makeChangeSingleDoc(e,n,null,stretchSpansOverChange(e,n))}))}export function makeChangeFromHistory(e,n,t){let i=e.cm&&e.cm.state.suppressEdits;if(i&&!t)return;let o,r=e.history,l=e.sel,a="undo"==n?r.done:r.undone,s="undo"==n?r.undone:r.done,g=0;for(;g<a.length&&(o=a[g],t?!o.ranges||o.equals(e.sel):o.ranges);g++);if(g==a.length)return;for(r.lastOrigin=r.lastSelOrigin=null;;){if(o=a.pop(),!o.ranges){if(i)return void a.push(o);break}if(pushSelectionToHistory(o,s),t&&!o.equals(e.sel))return void setSelection(e,o,{clearRedo:!1});l=o}let m=[];pushSelectionToHistory(l,s),s.push({changes:m,generation:r.generation}),r.generation=o.generation||++r.maxGeneration;let c=hasHandler(e,"beforeChange")||e.cm&&hasHandler(e.cm,"beforeChange");for(let t=o.changes.length-1;t>=0;--t){let i=o.changes[t];if(i.origin=n,c&&!filterChange(e,i,!1))return void(a.length=0);m.push(historyChangeFromChange(e,i));let r=t?computeSelAfterChange(e,i):lst(a);makeChangeSingleDoc(e,i,r,mergeOldSpans(e,i)),!t&&e.cm&&e.cm.scrollIntoView({from:i.from,to:changeEnd(i)});let l=[];linkedDocs(e,((e,n)=>{n||-1!=indexOf(l,e.history)||(rebaseHist(e.history,i),l.push(e.history)),makeChangeSingleDoc(e,i,null,mergeOldSpans(e,i))}))}}function shiftDoc(e,n){if(0!=n&&(e.first+=n,e.sel=new Selection(map(e.sel.ranges,(e=>new Range(Pos(e.anchor.line+n,e.anchor.ch),Pos(e.head.line+n,e.head.ch)))),e.sel.primIndex),e.cm)){regChange(e.cm,e.first,e.first-n,n);for(let n=e.cm.display,t=n.viewFrom;t<n.viewTo;t++)regLineChange(e.cm,t,"gutter")}}function makeChangeSingleDoc(e,n,t,i){if(e.cm&&!e.cm.curOp)return operation(e.cm,makeChangeSingleDoc)(e,n,t,i);if(n.to.line<e.first)return void shiftDoc(e,n.text.length-1-(n.to.line-n.from.line));if(n.from.line>e.lastLine())return;if(n.from.line<e.first){let t=n.text.length-1-(e.first-n.from.line);shiftDoc(e,t),n={from:Pos(e.first,0),to:Pos(n.to.line+t,n.to.ch),text:[lst(n.text)],origin:n.origin}}let o=e.lastLine();n.to.line>o&&(n={from:n.from,to:Pos(o,getLine(e,o).text.length),text:[n.text[0]],origin:n.origin}),n.removed=getBetween(e,n.from,n.to),t||(t=computeSelAfterChange(e,n)),e.cm?makeChangeSingleDocInEditor(e.cm,n,i):updateDoc(e,n,i),setSelectionNoUndo(e,t,sel_dontScroll),e.cantEdit&&skipAtomic(e,Pos(e.firstLine(),0))&&(e.cantEdit=!1)}function makeChangeSingleDocInEditor(e,n,t){let i=e.doc,o=e.display,r=n.from,l=n.to,a=!1,s=r.line;e.options.lineWrapping||(s=lineNo(visualLine(getLine(i,r.line))),i.iter(s,l.line+1,(e=>{if(e==o.maxLine)return a=!0,!0}))),i.sel.contains(n.from,n.to)>-1&&signalCursorActivity(e),updateDoc(i,n,t,estimateHeight(e)),e.options.lineWrapping||(i.iter(s,r.line+n.text.length,(e=>{let n=lineLength(e);n>o.maxLineLength&&(o.maxLine=e,o.maxLineLength=n,o.maxLineChanged=!0,a=!1)})),a&&(e.curOp.updateMaxLine=!0)),retreatFrontier(i,r.line),startWorker(e,400);let g=n.text.length-(l.line-r.line)-1;n.full?regChange(e):r.line!=l.line||1!=n.text.length||isWholeLineUpdate(e.doc,n)?regChange(e,r.line,l.line+1,g):regLineChange(e,r.line,"text");let m=hasHandler(e,"changes"),c=hasHandler(e,"change");if(c||m){let t={from:r,to:l,text:n.text,removed:n.removed,origin:n.origin};c&&signalLater(e,"change",e,t),m&&(e.curOp.changeObjs||(e.curOp.changeObjs=[])).push(t)}e.display.selForContextMenu=null}export function replaceRange(e,n,t,i,o){i||(i=t),cmp(i,t)<0&&([t,i]=[i,t]),"string"==typeof n&&(n=e.splitLines(n)),makeChange(e,{from:t,to:i,text:n,origin:o})}function rebaseHistSelSingle(e,n,t,i){t<e.line?e.line+=i:n<e.line&&(e.line=n,e.ch=0)}function rebaseHistArray(e,n,t,i){for(let o=0;o<e.length;++o){let r=e[o],l=!0;if(r.ranges){r.copied||(r=e[o]=r.deepCopy(),r.copied=!0);for(let e=0;e<r.ranges.length;e++)rebaseHistSelSingle(r.ranges[e].anchor,n,t,i),rebaseHistSelSingle(r.ranges[e].head,n,t,i)}else{for(let e=0;e<r.changes.length;++e){let o=r.changes[e];if(t<o.from.line)o.from=Pos(o.from.line+i,o.from.ch),o.to=Pos(o.to.line+i,o.to.ch);else if(n<=o.to.line){l=!1;break}}l||(e.splice(0,o+1),o=0)}}}function rebaseHist(e,n){let t=n.from.line,i=n.to.line,o=n.text.length-(i-t)-1;rebaseHistArray(e.done,t,i,o),rebaseHistArray(e.undone,t,i,o)}export function changeLine(e,n,t,i){let o=n,r=n;return"number"==typeof n?r=getLine(e,clipLine(e,n)):o=lineNo(n),null==o?null:(i(r,o)&&e.cm&&regLineChange(e.cm,o,t),r)}