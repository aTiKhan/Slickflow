import{heightAtLine}from"../line/spans.js";import{getLine,lineAtHeight,updateLineHeight}from"../line/utils_line.js";import{paddingTop,charWidth}from"../measurement/position_measurement.js";import{ie,ie_version}from"../util/browser.js";export function updateHeightsInViewport(e){let t=e.display,i=t.lineDiv.offsetTop,n=Math.max(0,t.scroller.getBoundingClientRect().top),l=t.lineDiv.getBoundingClientRect().top,o=0;for(let r=0;r<t.view.length;r++){let h,g=t.view[r],s=e.options.lineWrapping,p=0;if(g.hidden)continue;if(l+=g.line.height,ie&&ie_version<8){let e=g.node.offsetTop+g.node.offsetHeight;h=e-i,i=e}else{let e=g.node.getBoundingClientRect();h=e.bottom-e.top,!s&&g.text.firstChild&&(p=g.text.firstChild.getBoundingClientRect().right-e.left-1)}let a=g.line.height-h;if((a>.005||a<-.005)&&(l<n&&(o-=a),updateLineHeight(g.line,h),updateWidgetHeight(g.line),g.rest))for(let e=0;e<g.rest.length;e++)updateWidgetHeight(g.rest[e]);if(p>e.display.sizerWidth){let t=Math.ceil(p/charWidth(e.display));t>e.display.maxLineLength&&(e.display.maxLineLength=t,e.display.maxLine=g.line,e.display.maxLineChanged=!0)}}Math.abs(o)>2&&(t.scroller.scrollTop+=o)}function updateWidgetHeight(e){if(e.widgets)for(let t=0;t<e.widgets.length;++t){let i=e.widgets[t],n=i.node.parentNode;n&&(i.height=n.offsetHeight)}}export function visibleLines(e,t,i){let n=i&&null!=i.top?Math.max(0,i.top):e.scroller.scrollTop;n=Math.floor(n-paddingTop(e));let l=i&&null!=i.bottom?i.bottom:n+e.wrapper.clientHeight,o=lineAtHeight(t,n),r=lineAtHeight(t,l);if(i&&i.ensure){let n=i.ensure.from.line,l=i.ensure.to.line;n<o?(o=n,r=lineAtHeight(t,heightAtLine(getLine(t,n))+e.wrapper.clientHeight)):Math.min(l,t.lastLine())>=r&&(o=lineAtHeight(t,heightAtLine(getLine(t,l))-e.wrapper.clientHeight),r=l)}return{from:o,to:Math.max(r,o+1)}}