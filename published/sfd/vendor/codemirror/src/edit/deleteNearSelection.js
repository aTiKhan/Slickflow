import{runInOp}from"../display/operations.js";import{ensureCursorVisible}from"../display/scrolling.js";import{cmp}from"../line/pos.js";import{replaceRange}from"../model/changes.js";import{lst}from"../util/misc.js";export function deleteNearSelection(e,r){let o=e.doc.sel.ranges,l=[];for(let e=0;e<o.length;e++){let t=r(o[e]);for(;l.length&&cmp(t.from,lst(l).to)<=0;){let e=l.pop();if(cmp(e.from,t.from)<0){t.from=e.from;break}}l.push(t)}runInOp(e,(()=>{for(let r=l.length-1;r>=0;r--)replaceRange(e.doc,"",l[r].from,l[r].to,"+delete");ensureCursorVisible(e)}))}