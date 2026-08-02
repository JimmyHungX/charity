// 綠界測試金流金鑰設定
const ECPAY_CONFIG = {
  MerchantID: '2000132',
  HashKey: '5294y06JbISpM5x9',
  HashIV: 'v77hoKGq4kWxNNIS'
};

// 產生當前時間格式 (yyyy/MM/dd HH:mm:ss)
function getFormattedDate() {
  const date = new Date();
  const pad = (num) => String(num).padStart(2, '0');
  
  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());

  return `${yyyy}/${MM}/${dd} ${hh}:${mm}:${ss}`;
}

// 計算綠界 CheckMacValue 檢查碼
function generateCheckMacValue(params, hashKey, hashIV) {
  // 1. 按 Key 字母 A-Z 排序
  const sortedKeys = Object.keys(params).sort();
  
  // 2. 組合 key=value 陣列
  let rawString = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
  
  // 3. 前後加上 HashKey 與 HashIV
  rawString = `HashKey=${hashKey}&${rawString}&HashIV=${hashIV}`;
  
  // 4. URL Encode 轉換並符合綠界特殊轉碼規則
  let encodedString = encodeURIComponent(rawString).toLowerCase();
  encodedString = encodedString
    .replace(/%20/g, '+')
    .replace(/%21/g, '!')
    .replace(/%28/g, '(')
    .replace(/%29/g, ')')
    .replace(/%2a/g, '*');

  // 5. SHA256 加密並轉大寫
  return CryptoJS.SHA256(encodedString).toString().toUpperCase();
}

// 發送綠界付款表單
function submitECPayForm(amount, freqText) {
  const tradeNo = 'Donate' + Date.now(); // 產生唯一訂單編號
  const tradeDate = getFormattedDate();

  // 基本金流參數
  const params = {
    MerchantID: ECPAY_CONFIG.MerchantID,
    MerchantTradeNo: tradeNo,
    MerchantTradeDate: tradeDate,
    PaymentType: 'aio',
    TotalAmount: String(amount), // 交易金額
    TradeDesc: '人道救援捐款',
    ItemName: `阿富汗人道救援捐款 (${freqText})`,
    ReturnURL: 'https://www.ecpay.com.tw/receive.php', // 綠界伺服器回傳地址 (前端測試可填預設)
    ChoosePayment: 'Credit', // 指定信用卡付款
    EncryptType: '1'
  };

  // 生成 CheckMacValue
  params.CheckMacValue = generateCheckMacValue(params, ECPAY_CONFIG.HashKey, ECPAY_CONFIG.HashIV);

  // 建立動態表單並提交
  const form = document.getElementById('ecpayForm');
  form.innerHTML = ''; // 清空既有欄位

  Object.keys(params).forEach(key => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = params[key];
    form.appendChild(input);
  });

  // 自動提交至綠界測試環境
  form.submit();
}

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
if(document.querySelector('.progress-section')) progressIO.observe(document.querySelector('.progress-section'));

// sticky donate button
const stickyBtn = document.getElementById('stickyDonate');
const heroEl = document.querySelector('.hero');
if(stickyBtn && heroEl){
  window.addEventListener('scroll', ()=>{
    const heroBottom = heroEl.getBoundingClientRect().bottom;
    if(heroBottom < 0){ stickyBtn.classList.add('show'); } else { stickyBtn.classList.remove('show'); }
  });
}

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
if(customInput){
  customInput.addEventListener('input', ()=>{
    if(customInput.value){
      amountBtns.forEach(b=>b.classList.remove('selected'));
      document.querySelector('.amount-btn[data-amount="custom"]').classList.add('selected');
    }
  });
}

const submitBtn = document.getElementById('submitBtn');
if(submitBtn){
  submitBtn.addEventListener('click', ()=>{
    const selected = document.querySelector('.amount-btn.selected');
    const freqEl = document.querySelector('.toggle-btn.active');
    const freq = freqEl ? freqEl.dataset.freq : 'once';
    let amount = selected && selected.dataset.amount !== 'custom' ? selected.dataset.amount : customInput.value;
    const box = document.getElementById('confirmBox');
    if(!amount || Number(amount) <= 0){ box.textContent = '請先選擇或輸入有效的捐款金額。'; box.classList.add('show'); return; }
    const freqText = freq === 'monthly' ? '每月定期' : '單筆';
    
    // 觸發綠界測試金流
    submitECPayForm(amount, freqText);
  });
}

// faq accordion
document.querySelectorAll('.faq-item').forEach(item=>{
  const q = item.querySelector('.faq-q');
  const a = item.querySelector('.faq-a');
  if(q && a){
    q.addEventListener('click', ()=>{
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(o=>{
        o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight = null;
      });
      if(!isOpen){ item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
    });
  }
});
