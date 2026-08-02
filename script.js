// scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:0.15});
  revealEls.forEach(el=>io.observe(el));

  // count up stats
  const statNums = document.querySelectorAll('[data-count]');
  let counted = false;
  const statIO = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting && !counted){
        counted = true;
        statNums.forEach(el=>{
          const target = parseInt(el.dataset.count, 10);
          let cur = 0;
          const step = Math.max(1, Math.round(target/40));
          const timer = setInterval(()=>{
            cur += step;
            if(cur >= target){ cur = target; clearInterval(timer); }
            el.textContent = cur;
          }, 30);
        });
      }
    });
  }, {threshold:0.4});
  const statStrip = document.getElementById('statStrip');
  if(statStrip) statIO.observe(statStrip);

  // progress bar fill on scroll
  const progressFill = document.getElementById('progressFill');
  const progressIO = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ progressFill.style.width = '62%'; progressIO.unobserve(e.target); }
    });
  }, {threshold:0.3});
  progressIO.observe(document.querySelector('.progress-section'));

  // sticky donate button
  const stickyBtn = document.getElementById('stickyDonate');
  const heroEl = document.querySelector('.hero');
  window.addEventListener('scroll', ()=>{
    const heroBottom = heroEl.getBoundingClientRect().bottom;
    if(heroBottom < 0){ stickyBtn.classList.add('show'); } else { stickyBtn.classList.remove('show'); }
  });

  // toggle freq
  const freqBtns = document.querySelectorAll('.toggle-btn');
  freqBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      freqBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // amount selection
  const amountBtns = document.querySelectorAll('.amount-btn');
  const customInput = document.getElementById('customInput');
  amountBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      amountBtns.forEach(b=>b.classList.remove('selected'));
      btn.classList.add('selected');
      if(btn.dataset.amount === 'custom'){ customInput.focus(); } else { customInput.value = ''; }
    });
  });
  customInput.addEventListener('input', ()=>{
    if(customInput.value){
      amountBtns.forEach(b=>b.classList.remove('selected'));
      document.querySelector('.amount-btn[data-amount="custom"]').classList.add('selected');
    }
  });

  document.getElementById('submitBtn').addEventListener('click', ()=>{
    const selected = document.querySelector('.amount-btn.selected');
    const freq = document.querySelector('.toggle-btn.active').dataset.freq;
    let amount = selected && selected.dataset.amount !== 'custom' ? selected.dataset.amount : customInput.value;
    const box = document.getElementById('confirmBox');
    if(!amount){ box.textContent = '請先選擇或輸入捐款金額。'; box.classList.add('show'); return; }
    const freqText = freq === 'monthly' ? '每月定期' : '單筆';
    box.textContent = `感謝您的支持！這是示範頁面，尚未串接金流：您選擇的方案為 ${freqText}捐款 NT$${Number(amount).toLocaleString()}。`;
    box.classList.add('show');
  });

  // faq accordion
  document.querySelectorAll('.faq-item').forEach(item=>{
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', ()=>{
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(o=>{
        o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight = null;
      });
      if(!isOpen){ item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
    });
  });
