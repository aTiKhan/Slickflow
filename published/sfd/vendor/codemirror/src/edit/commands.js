import{deleteNearSelection}from"./deleteNearSelection.js";import{runInOp}from"../display/operations.js";import{ensureCursorVisible}from"../display/scrolling.js";import{endOfLine}from"../input/movement.js";import{clipPos,Pos}from"../line/pos.js";import{visualLine,visualLineEnd}from"../line/spans.js";import{getLine,lineNo}from"../line/utils_line.js";import{Range}from"../model/selection.js";import{selectAll}from"../model/selection_updates.js";import{countColumn,sel_dontScroll,sel_move,spaceStr}from"../util/misc.js";import{getOrder}from"../util/bidi.js";export let commands={selectAll,singleSelection:e=>e.setSelection(e.getCursor("anchor"),e.getCursor("head"),sel_dontScroll),killLine:e=>deleteNearSelection(e,(t=>{if(t.empty()){let o=getLine(e.doc,t.head.line).text.length;return t.head.ch==o&&t.head.line<e.lastLine()?{from:t.head,to:Pos(t.head.line+1,0)}:{from:t.head,to:Pos(t.head.line,o)}}return{from:t.from(),to:t.to()}})),deleteLine:e=>deleteNearSelection(e,(t=>({from:Pos(t.from().line,0),to:clipPos(e.doc,Pos(t.to().line+1,0))}))),delLineLeft:e=>deleteNearSelection(e,(e=>({from:Pos(e.from().line,0),to:e.from()}))),delWrappedLineLeft:e=>deleteNearSelection(e,(t=>{let o=e.charCoords(t.head,"div").top+5;return{from:e.coordsChar({left:0,top:o},"div"),to:t.from()}})),delWrappedLineRight:e=>deleteNearSelection(e,(t=>{let o=e.charCoords(t.head,"div").top+5,n=e.coordsChar({left:e.display.lineDiv.offsetWidth+100,top:o},"div");return{from:t.from(),to:n}})),undo:e=>e.undo(),redo:e=>e.redo(),undoSelection:e=>e.undoSelection(),redoSelection:e=>e.redoSelection(),goDocStart:e=>e.extendSelection(Pos(e.firstLine(),0)),goDocEnd:e=>e.extendSelection(Pos(e.lastLine())),goLineStart:e=>e.extendSelectionsBy((t=>lineStart(e,t.head.line)),{origin:"+move",bias:1}),goLineStartSmart:e=>e.extendSelectionsBy((t=>lineStartSmart(e,t.head)),{origin:"+move",bias:1}),goLineEnd:e=>e.extendSelectionsBy((t=>lineEnd(e,t.head.line)),{origin:"+move",bias:-1}),goLineRight:e=>e.extendSelectionsBy((t=>{let o=e.cursorCoords(t.head,"div").top+5;return e.coordsChar({left:e.display.lineDiv.offsetWidth+100,top:o},"div")}),sel_move),goLineLeft:e=>e.extendSelectionsBy((t=>{let o=e.cursorCoords(t.head,"div").top+5;return e.coordsChar({left:0,top:o},"div")}),sel_move),goLineLeftSmart:e=>e.extendSelectionsBy((t=>{let o=e.cursorCoords(t.head,"div").top+5,n=e.coordsChar({left:0,top:o},"div");return n.ch<e.getLine(n.line).search(/\S/)?lineStartSmart(e,t.head):n}),sel_move),goLineUp:e=>e.moveV(-1,"line"),goLineDown:e=>e.moveV(1,"line"),goPageUp:e=>e.moveV(-1,"page"),goPageDown:e=>e.moveV(1,"page"),goCharLeft:e=>e.moveH(-1,"char"),goCharRight:e=>e.moveH(1,"char"),goColumnLeft:e=>e.moveH(-1,"column"),goColumnRight:e=>e.moveH(1,"column"),goWordLeft:e=>e.moveH(-1,"word"),goGroupRight:e=>e.moveH(1,"group"),goGroupLeft:e=>e.moveH(-1,"group"),goWordRight:e=>e.moveH(1,"word"),delCharBefore:e=>e.deleteH(-1,"codepoint"),delCharAfter:e=>e.deleteH(1,"char"),delWordBefore:e=>e.deleteH(-1,"word"),delWordAfter:e=>e.deleteH(1,"word"),delGroupBefore:e=>e.deleteH(-1,"group"),delGroupAfter:e=>e.deleteH(1,"group"),indentAuto:e=>e.indentSelection("smart"),indentMore:e=>e.indentSelection("add"),indentLess:e=>e.indentSelection("subtract"),insertTab:e=>e.replaceSelection("\t"),insertSoftTab:e=>{let t=[],o=e.listSelections(),n=e.options.tabSize;for(let i=0;i<o.length;i++){let l=o[i].from(),r=countColumn(e.getLine(l.line),l.ch,n);t.push(spaceStr(n-r%n))}e.replaceSelections(t)},defaultTab:e=>{e.somethingSelected()?e.indentSelection("add"):e.execCommand("insertTab")},transposeChars:e=>runInOp(e,(()=>{let t=e.listSelections(),o=[];for(let n=0;n<t.length;n++){if(!t[n].empty())continue;let i=t[n].head,l=getLine(e.doc,i.line).text;if(l)if(i.ch==l.length&&(i=new Pos(i.line,i.ch-1)),i.ch>0)i=new Pos(i.line,i.ch+1),e.replaceRange(l.charAt(i.ch-1)+l.charAt(i.ch-2),Pos(i.line,i.ch-2),i,"+transpose");else if(i.line>e.doc.first){let t=getLine(e.doc,i.line-1).text;t&&(i=new Pos(i.line,1),e.replaceRange(l.charAt(0)+e.doc.lineSeparator()+t.charAt(t.length-1),Pos(i.line-1,t.length-1),i,"+transpose"))}o.push(new Range(i,i))}e.setSelections(o)})),newlineAndIndent:e=>runInOp(e,(()=>{let t=e.listSelections();for(let o=t.length-1;o>=0;o--)e.replaceRange(e.doc.lineSeparator(),t[o].anchor,t[o].head,"+input");t=e.listSelections();for(let o=0;o<t.length;o++)e.indentLine(t[o].from().line,null,!0);ensureCursorVisible(e)})),openLine:e=>e.replaceSelection("\n","start"),toggleOverwrite:e=>e.toggleOverwrite()};function lineStart(e,t){let o=getLine(e.doc,t),n=visualLine(o);return n!=o&&(t=lineNo(n)),endOfLine(!0,e,n,t,1)}function lineEnd(e,t){let o=getLine(e.doc,t),n=visualLineEnd(o);return n!=o&&(t=lineNo(n)),endOfLine(!0,e,o,t,-1)}function lineStartSmart(e,t){let o=lineStart(e,t.line),n=getLine(e.doc,o.line),i=getOrder(n,e.doc.direction);if(!i||0==i[0].level){let e=Math.max(o.ch,n.text.search(/\S/)),i=t.line==o.line&&t.ch<=e&&t.ch;return Pos(o.line,i?0:e,o.sticky)}return o}