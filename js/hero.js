// Hero interactions: parallax, testimonials carousel, mobile CTA
(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Parallax for hero blobs and image
  function initParallax(){
    if(prefersReduced) return;
    if(window.innerWidth <= 640) return; // disable parallax on small screens
    const hero = document.querySelector('.hero');
    if(!hero) return;
    const wrap = hero.querySelector('.hero-img-wrap');
    const blobs = hero.querySelectorAll('.blob');
    const amount = parseFloat(wrap?.dataset?.parallax || '0.06');
    let cx = window.innerWidth/2, cy = window.innerHeight/2;
    let tx=0, ty=0;
    function onMove(e){
      const x = (e.clientX || (e.touches && e.touches[0].clientX)) || cx;
      const y = (e.clientY || (e.touches && e.touches[0].clientY)) || cy;
      tx = (x - cx) * amount;
      ty = (y - cy) * amount;
    }
    function raf(){
      if(wrap) wrap.style.transform = `translate3d(${tx * 0.35}px, ${ty * 0.35}px, 0) rotate(${tx * 0.002}deg)`;
      blobs.forEach((b,i)=>{
        const factor = 1 + (i*0.12);
        b.style.transform = `translate3d(${tx * factor}px, ${ty * factor}px, 0) scale(${1 + Math.abs(i)*0.01})`;
      });
      requestAnimationFrame(raf);
    }
    window.addEventListener('mousemove', onMove, {passive:true});
    window.addEventListener('touchmove', onMove, {passive:true});
    requestAnimationFrame(raf);
  }

  // Simple testimonials carousel (auto-rotate)
  function initTestimonials(){
    const root = document.getElementById('testimonialCarousel');
    if(!root) return;
    const items = Array.from(root.querySelectorAll('.testimonial'));
    if(items.length <= 1) return;
    let idx = 0;
    const dotsWrap = root.querySelector('.testimonial-dots');
    const prevBtn = root.querySelector('.testimonial-prev');
    const nextBtn = root.querySelector('.testimonial-next');
    const autoDelay = prefersReduced ? 0 : 5200;
    let timer = null;

    function show(i){
      idx = (i + items.length) % items.length;
      items.forEach((it, j)=> it.classList.toggle('active', idx===j));
      if(dotsWrap){
        Array.from(dotsWrap.children).forEach((d,j)=> d.classList.toggle('active', j===idx));
      }
    }

    // build dots
    if(dotsWrap && dotsWrap.children.length === 0){
      items.forEach((it, j)=>{
        const d = document.createElement('button');
        d.className = 'dot';
        d.setAttribute('aria-label', `Show testimonial ${j+1}`);
        d.onclick = (e)=>{ e.preventDefault(); show(j); pauseAuto(); };
        dotsWrap.appendChild(d);
      });
    }

    if(prevBtn) prevBtn.onclick = (e)=>{ e.preventDefault(); show(idx-1); pauseAuto(); };
    if(nextBtn) nextBtn.onclick = (e)=>{ e.preventDefault(); show(idx+1); pauseAuto(); };

    function startAuto(){ if(autoDelay<=0) return; stopAuto(); timer = setInterval(()=> show(idx+1), autoDelay); }
    function stopAuto(){ if(timer) { clearInterval(timer); timer = null; } }
    function pauseAuto(){ stopAuto(); setTimeout(startAuto, 7000); }

    show(0);
    if(!prefersReduced) startAuto();

    // Pause on hover/touch
    root.addEventListener('mouseenter', stopAuto);
    root.addEventListener('mouseleave', startAuto);
    root.addEventListener('touchstart', stopAuto, {passive:true});
    root.addEventListener('touchend', startAuto, {passive:true});
  }

  // Mobile CTA injection
  function initMobileCTA(){
    if(document.querySelector('.mobile-cta')) return;
    const bar = document.createElement('div');
    bar.className = 'mobile-cta';
    bar.innerHTML = `
      <a href="cart.html" class="cart-mini" aria-label="Open cart">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3h2l.4 2M7 13h10l3-8H6.4" stroke="#BD1551" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span id="mobileCartCount">0</span>
      </a>
      <a href="checkout.html" class="btn btn-primary cta-btn">Place Order</a>
    `;
    document.body.appendChild(bar);
    // populate count from canonical cart helper if available
    try {
      const c = typeof getCart === 'function'
        ? getCart().reduce((s, i) => s + (Number(i.qty) || 0), 0)
        : 0;
      const el = document.getElementById('mobileCartCount');
      if (el) el.textContent = c;
    } catch(e){}
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    initParallax();
    initTestimonials();
    initMobileCTA();
  });
})();
