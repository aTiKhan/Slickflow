import{getOrder}from"../util/bidi.js";import{ie,ie_version,webkit}from"../util/browser.js";import{elt,eltP,joinClasses}from"../util/dom.js";import{eventMixin,signal}from"../util/event.js";import{hasBadBidiRects,zeroWidthElement}from"../util/feature_detection.js";import{lst,spaceStr}from"../util/misc.js";import{getLineStyles}from"./highlight.js";import{attachMarkedSpans,compareCollapsedMarkers,detachMarkedSpans,lineIsHidden,visualLineContinued}from"./spans.js";import{getLine,lineNo,updateLineHeight}from"./utils_line.js";export class Line{constructor(e,t,l){this.text=e,attachMarkedSpans(this,t),this.height=l?l(this):1}lineNo(){return lineNo(this)}}eventMixin(Line);export function updateLine(e,t,l,s){e.text=t,e.stateAfter&&(e.stateAfter=null),e.styles&&(e.styles=null),null!=e.order&&(e.order=null),detachMarkedSpans(e),attachMarkedSpans(e,l);let i=s?s(e):1;i!=e.height&&updateLineHeight(e,i)}export function cleanUpLine(e){e.parent=null,detachMarkedSpans(e)}let styleToClassCache={},styleToClassCacheWithMode={};function interpretTokenStyle(e,t){if(!e||/^\s*$/.test(e))return null;let l=t.addModeClass?styleToClassCacheWithMode:styleToClassCache;return l[e]||(l[e]=e.replace(/\S+/g,"cm-$&"))}export function buildLineContent(e,t){let l=eltP("span",null,null,webkit?"padding-right: .1px":null),s={pre:eltP("pre",[l],"CodeMirror-line"),content:l,col:0,pos:0,cm:e,trailingSpace:!1,splitSpaces:e.getOption("lineWrapping")};t.measure={};for(let l=0;l<=(t.rest?t.rest.length:0);l++){let i,n=l?t.rest[l-1]:t.line;s.pos=0,s.addToken=buildToken,hasBadBidiRects(e.display.measure)&&(i=getOrder(n,e.doc.direction))&&(s.addToken=buildTokenBadBidi(s.addToken,i)),s.map=[];let a=t!=e.display.externalMeasured&&lineNo(n);insertLineContent(n,s,getLineStyles(e,n,a)),n.styleClasses&&(n.styleClasses.bgClass&&(s.bgClass=joinClasses(n.styleClasses.bgClass,s.bgClass||"")),n.styleClasses.textClass&&(s.textClass=joinClasses(n.styleClasses.textClass,s.textClass||""))),0==s.map.length&&s.map.push(0,0,s.content.appendChild(zeroWidthElement(e.display.measure))),0==l?(t.measure.map=s.map,t.measure.cache={}):((t.measure.maps||(t.measure.maps=[])).push(s.map),(t.measure.caches||(t.measure.caches=[])).push({}))}if(webkit){let e=s.content.lastChild;(/\bcm-tab\b/.test(e.className)||e.querySelector&&e.querySelector(".cm-tab"))&&(s.content.className="cm-tab-wrap-hack")}return signal(e,"renderLine",e,t.line,s.pre),s.pre.className&&(s.textClass=joinClasses(s.pre.className,s.textClass||"")),s}export function defaultSpecialCharPlaceholder(e){let t=elt("span","•","cm-invalidchar");return t.title="\\u"+e.charCodeAt(0).toString(16),t.setAttribute("aria-label",t.title),t}function buildToken(e,t,l,s,i,n,a){if(!t)return;let r,o=e.splitSpaces?splitSpaces(t,e.trailingSpace):t,p=e.cm.state.specialChars,d=!1;if(p.test(t)){r=document.createDocumentFragment();let l=0;for(;;){p.lastIndex=l;let s,i=p.exec(t),n=i?i.index-l:t.length-l;if(n){let t=document.createTextNode(o.slice(l,l+n));ie&&ie_version<9?r.appendChild(elt("span",[t])):r.appendChild(t),e.map.push(e.pos,e.pos+n,t),e.col+=n,e.pos+=n}if(!i)break;if(l+=n+1,"\t"==i[0]){let t=e.cm.options.tabSize,l=t-e.col%t;s=r.appendChild(elt("span",spaceStr(l),"cm-tab")),s.setAttribute("role","presentation"),s.setAttribute("cm-text","\t"),e.col+=l}else"\r"==i[0]||"\n"==i[0]?(s=r.appendChild(elt("span","\r"==i[0]?"␍":"␤","cm-invalidchar")),s.setAttribute("cm-text",i[0]),e.col+=1):(s=e.cm.options.specialCharPlaceholder(i[0]),s.setAttribute("cm-text",i[0]),ie&&ie_version<9?r.appendChild(elt("span",[s])):r.appendChild(s),e.col+=1);e.map.push(e.pos,e.pos+1,s),e.pos++}}else e.col+=t.length,r=document.createTextNode(o),e.map.push(e.pos,e.pos+t.length,r),ie&&ie_version<9&&(d=!0),e.pos+=t.length;if(e.trailingSpace=32==o.charCodeAt(t.length-1),l||s||i||d||n||a){let t=l||"";s&&(t+=s),i&&(t+=i);let o=elt("span",[r],t,n);if(a)for(let e in a)a.hasOwnProperty(e)&&"style"!=e&&"class"!=e&&o.setAttribute(e,a[e]);return e.content.appendChild(o)}e.content.appendChild(r)}function splitSpaces(e,t){if(e.length>1&&!/  /.test(e))return e;let l=t,s="";for(let t=0;t<e.length;t++){let i=e.charAt(t);" "!=i||!l||t!=e.length-1&&32!=e.charCodeAt(t+1)||(i=" "),s+=i,l=" "==i}return s}function buildTokenBadBidi(e,t){return(l,s,i,n,a,r,o)=>{i=i?i+" cm-force-border":"cm-force-border";let p=l.pos,d=p+s.length;for(;;){let c;for(let e=0;e<t.length&&(c=t[e],!(c.to>p&&c.from<=p));e++);if(c.to>=d)return e(l,s,i,n,a,r,o);e(l,s.slice(0,c.to-p),i,n,null,r,o),n=null,s=s.slice(c.to-p),p=c.to}}}function buildCollapsedSpan(e,t,l,s){let i=!s&&l.widgetNode;i&&e.map.push(e.pos,e.pos+t,i),!s&&e.cm.display.input.needsContentAttribute&&(i||(i=e.content.appendChild(document.createElement("span"))),i.setAttribute("cm-marker",l.id)),i&&(e.cm.display.input.setUneditable(i),e.content.appendChild(i)),e.pos+=t,e.trailingSpace=!1}function insertLineContent(e,t,l){let s=e.markedSpans,i=e.text,n=0;if(!s){for(let e=1;e<l.length;e+=2)t.addToken(t,i.slice(n,n=l[e]),interpretTokenStyle(l[e+1],t.cm.options));return}let a,r,o,p,d,c,u,h=i.length,m=0,f=1,C="",g=0;for(;;){if(g==m){o=p=d=r="",u=null,c=null,g=1/0;let e,l=[];for(let t=0;t<s.length;++t){let i=s[t],n=i.marker;if("bookmark"==n.type&&i.from==m&&n.widgetNode)l.push(n);else if(i.from<=m&&(null==i.to||i.to>m||n.collapsed&&i.to==m&&i.from==m)){if(null!=i.to&&i.to!=m&&g>i.to&&(g=i.to,p=""),n.className&&(o+=" "+n.className),n.css&&(r=(r?r+";":"")+n.css),n.startStyle&&i.from==m&&(d+=" "+n.startStyle),n.endStyle&&i.to==g&&(e||(e=[])).push(n.endStyle,i.to),n.title&&((u||(u={})).title=n.title),n.attributes)for(let e in n.attributes)(u||(u={}))[e]=n.attributes[e];n.collapsed&&(!c||compareCollapsedMarkers(c.marker,n)<0)&&(c=i)}else i.from>m&&g>i.from&&(g=i.from)}if(e)for(let t=0;t<e.length;t+=2)e[t+1]==g&&(p+=" "+e[t]);if(!c||c.from==m)for(let e=0;e<l.length;++e)buildCollapsedSpan(t,0,l[e]);if(c&&(c.from||0)==m){if(buildCollapsedSpan(t,(null==c.to?h+1:c.to)-m,c.marker,null==c.from),null==c.to)return;c.to==m&&(c=!1)}}if(m>=h)break;let e=Math.min(h,g);for(;;){if(C){let l=m+C.length;if(!c){let s=l>e?C.slice(0,e-m):C;t.addToken(t,s,a?a+o:o,d,m+s.length==g?p:"",r,u)}if(l>=e){C=C.slice(e-m),m=e;break}m=l,d=""}C=i.slice(n,n=l[f++]),a=interpretTokenStyle(l[f++],t.cm.options)}}}export function LineView(e,t,l){this.line=t,this.rest=visualLineContinued(t),this.size=this.rest?lineNo(lst(this.rest))-l+1:1,this.node=this.text=null,this.hidden=lineIsHidden(e,t)}export function buildViewArray(e,t,l){let s,i=[];for(let n=t;n<l;n=s){let t=new LineView(e.doc,getLine(e.doc,n),n);s=n+t.size,i.push(t)}return i}