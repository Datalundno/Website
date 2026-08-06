import"./style-B2_HVmsd.js";var e=[{id:`discovery`,name:`Discovery`,group:`Phase 1`,start:`2026-03-02`,end:`2026-03-20`,progress:1,color:`#2DD4BF`},{id:`design`,name:`Design`,group:`Phase 1`,start:`2026-03-16`,end:`2026-04-10`,progress:.85,color:`#0F3D36`},{id:`build`,name:`Build`,group:`Phase 2`,start:`2026-03-30`,end:`2026-05-01`,progress:.55,color:`#FBBF24`},{id:`pilot`,name:`Pilot`,group:`Phase 2`,start:`2026-04-20`,end:`2026-05-08`,progress:.2,color:`#7CFFB2`},{id:`launch`,name:`Launch`,group:`Phase 3`,start:`2026-05-04`,end:`2026-05-22`,progress:0,color:`#1A6B5C`}],t=`2026-04-15`,n=`2026-03-01`,r=`2026-05-31`;function i(e){return Date.parse(`${e}T00:00:00Z`)}function a(e,t){return Math.round((i(t)-i(e))/864e5)}function o(e){return new Date(`${e}T00:00:00Z`).toLocaleDateString(`en-GB`,{day:`numeric`,month:`short`,timeZone:`UTC`})}function s(e,t){return`${o(e)} – ${o(t)}`}function c(e,t){return a(e,t)+1}function l(e){return`${Math.round(e*100)}%`}function u(e){return Math.min(1,Math.max(0,e))}function d(e,t){let n=a(e,t),r=[],o=new Date(`${e}T00:00:00Z`);for(o.setUTCDate(1),o.getTime()<i(e)&&o.setUTCMonth(o.getUTCMonth()+1);o.getTime()<=i(t);){let t=o.toISOString().slice(0,10);r.push({label:o.toLocaleDateString(`en-GB`,{month:`short`,timeZone:`UTC`}),left:u(a(e,t)/n)}),o.setUTCMonth(o.getUTCMonth()+1)}return r}function f(e,t){let n=a(e,t),r=[],o=new Date(`${e}T00:00:00Z`);for(;o.getTime()<=i(t);){let t=o.getUTCDay();if(t===6||t===0){let t=o.toISOString().slice(0,10);r.push({left:u(a(e,t)/n),width:1/n})}o.setUTCDate(o.getUTCDate()+1)}return r}function p(i){let o=a(n,r),p=new Set,m=null;i.innerHTML=`
    <div class="demo-gantt" role="application" aria-label="Interactive Gantt preview">
      <div class="demo-toolbar">
        <p class="demo-hint">Hover for details · click to select · Ctrl/Cmd multi-select</p>
        <button type="button" class="demo-clear" hidden>Clear selection</button>
      </div>
      <div class="demo-board">
        <div class="demo-labels" aria-hidden="true"></div>
        <div class="demo-chart">
          <div class="demo-months"></div>
          <div class="demo-canvas">
            <div class="demo-weekends" aria-hidden="true"></div>
            <div class="demo-grid" aria-hidden="true"></div>
            <div class="demo-today" aria-hidden="true">
              <span class="demo-today-dot"></span>
              <span class="demo-today-line"></span>
            </div>
            <div class="demo-rows" role="list"></div>
          </div>
        </div>
      </div>
      <div class="demo-tooltip" role="tooltip" hidden></div>
      <p class="demo-footnote">Website preview with sample data — not live Power BI.</p>
    </div>
  `;let h=i.querySelector(`.demo-labels`),g=i.querySelector(`.demo-months`),_=i.querySelector(`.demo-weekends`),v=i.querySelector(`.demo-grid`),y=i.querySelector(`.demo-today`),b=i.querySelector(`.demo-rows`),x=i.querySelector(`.demo-tooltip`),S=i.querySelector(`.demo-clear`),C=i.querySelector(`.demo-chart`);g.innerHTML=d(n,r).map(e=>`<span class="demo-month" style="left:${l(e.left)}">${e.label}</span>`).join(``),_.innerHTML=f(n,r).map(e=>`<span class="demo-weekend" style="left:${l(e.left)};width:${l(e.width)}"></span>`).join(``),v.innerHTML=d(n,r).map(e=>`<span class="demo-gridline" style="left:${l(e.left)}"></span>`).join(``);let w=u(a(n,t)/o);y.style.left=l(w),h.innerHTML=e.map(e=>`<div class="demo-label" data-id="${e.id}">
        <span class="demo-label-name">${e.name}</span>
        <span class="demo-label-group">${e.group}</span>
      </div>`).join(``),b.innerHTML=e.map(e=>{let t=u(a(n,e.start)/o),r=u(c(e.start,e.end)/o);return`
      <div class="demo-row" role="listitem">
        <button
          type="button"
          class="demo-bar"
          data-id="${e.id}"
          style="left:${l(t)};width:${l(r)};--bar:${e.color}"
          aria-pressed="false"
          aria-label="${e.name}, ${s(e.start,e.end)}, ${l(e.progress)} complete"
        >
          <span class="demo-bar-fill" style="width:${l(e.progress)}"></span>
          <span class="demo-bar-label">${e.name}</span>
        </button>
      </div>
    `}).join(``);let T=[...i.querySelectorAll(`.demo-bar`)],E=[...i.querySelectorAll(`.demo-label`)];function D(){let e=p.size>0;S.hidden=!e;for(let t of T){let n=t.dataset.id,r=p.has(n);t.classList.toggle(`is-selected`,r),t.classList.toggle(`is-dimmed`,e&&!r),t.setAttribute(`aria-pressed`,String(r))}for(let t of E){let n=t.dataset.id,r=p.has(n);t.classList.toggle(`is-selected`,r),t.classList.toggle(`is-dimmed`,e&&!r)}}function O(e,t,n){m=e,x.hidden=!1,x.innerHTML=`
      <strong>${e.name}</strong>
      <span>${s(e.start,e.end)}</span>
      <span>${c(e.start,e.end)} days · ${l(e.progress)} done</span>
      <span>${e.group}</span>
    `,k(t,n)}function k(e,t){let n=x.getBoundingClientRect(),r=C.getBoundingClientRect(),i=e-r.left+16,a=t-r.top-n.height-12;i+n.width>r.width-14&&(i=r.width-n.width-14),i<14&&(i=14),a<14&&(a=t-r.top+18),x.style.transform=`translate(${i}px, ${a}px)`}function A(){m=null,x.hidden=!0}for(let t of T){let n=e.find(e=>e.id===t.dataset.id);t.addEventListener(`pointerenter`,e=>{O(n,e.clientX,e.clientY)}),t.addEventListener(`pointermove`,e=>{m?.id===n.id&&k(e.clientX,e.clientY)}),t.addEventListener(`pointerleave`,A),t.addEventListener(`focus`,()=>{let e=t.getBoundingClientRect();O(n,e.left+e.width/2,e.top)}),t.addEventListener(`blur`,A),t.addEventListener(`click`,e=>{let t=e.metaKey||e.ctrlKey,r=n.id;t?p.has(r)?p.delete(r):p.add(r):p.has(r)&&p.size===1?p.clear():(p.clear(),p.add(r)),D()})}S.addEventListener(`click`,()=>{p.clear(),D()}),D()}var m=document.querySelector(`#gantt-demo`);m&&p(m);function h(){let e=document.querySelectorAll(`[data-reveal]`);if(window.matchMedia(`(prefers-reduced-motion: reduce)`).matches){e.forEach(e=>e.classList.add(`is-visible`));return}let t=new IntersectionObserver(e=>{for(let n of e)n.isIntersecting&&(n.target.classList.add(`is-visible`),t.unobserve(n.target))},{threshold:.12,rootMargin:`0px 0px -6% 0px`});e.forEach(e=>t.observe(e))}h();