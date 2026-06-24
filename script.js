const currentEl = document.getElementById('current');
  const prevOpEl = document.getElementById('prevOp');

  let current = '0';
  let previous = null;
  let operator = null;
  let resetNext = false;

  const opSymbols = { add:'+', subtract:'−', multiply:'×', divide:'÷' };

  function updateDisplay(){
    currentEl.textContent = formatNumber(current);
    prevOpEl.textContent = (previous !== null && operator)
      ? `${formatNumber(previous)} ${opSymbols[operator]}`
      : '\u00A0';
    pulse();
  }

  function pulse(){
    currentEl.classList.remove('pulse');
    requestAnimationFrame(() => currentEl.classList.add('pulse'));
    setTimeout(() => currentEl.classList.remove('pulse'), 150);
  }

  function formatNumber(numStr){
    if(numStr === 'Error') return numStr;
    const num = parseFloat(numStr);
    if(isNaN(num)) return '0';
    const parts = numStr.split('.');
    const intPart = parts[0].replace('-','');
    const sign = numStr.startsWith('-') ? '-' : '';
    const formattedInt = parseInt(intPart || '0').toLocaleString('en-US');
    return sign + formattedInt + (parts[1] !== undefined ? '.' + parts[1] : '');
  }

  function inputNumber(num){
    if(current === 'Error' || resetNext){
      current = '0'; resetNext = false;
    }
    if(current === '0' && num !== '.') current = num;
    else if(num === '.' && current.includes('.')) return;
    else current += num;
    updateDisplay();
  }

  function setOperator(op){
    if(current === 'Error') return;
    if(previous !== null && operator && !resetNext){
      calculate();
    }
    previous = current;
    operator = op;
    resetNext = true;
    updateDisplay();
  }

  function calculate(){
    if(operator === null || previous === null) return;
    const a = parseFloat(previous);
    const b = parseFloat(current);
    let result;
    switch(operator){
      case 'add': result = a + b; break;
      case 'subtract': result = a - b; break;
      case 'multiply': result = a * b; break;
      case 'divide':
        if(b === 0){ current = 'Error'; previous = null; operator = null; updateDisplay(); return; }
        result = a / b; break;
    }
    result = Math.round((result + Number.EPSILON) * 1e10) / 1e10;
    current = String(result);
    previous = null;
    operator = null;
    resetNext = true;
    updateDisplay();
  }

  function clearAll(){
    current = '0'; previous = null; operator = null; resetNext = false;
    updateDisplay();
  }

  function negate(){
    if(current === '0' || current === 'Error') return;
    current = current.startsWith('-') ? current.slice(1) : '-' + current;
    updateDisplay();
  }

  function percent(){
    if(current === 'Error') return;
    current = String(parseFloat(current) / 100);
    updateDisplay();
  }

  document.querySelector('.pad').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if(!btn) return;
    if(btn.dataset.num !== undefined){ inputNumber(btn.dataset.num); return; }
    const action = btn.dataset.action;
    switch(action){
      case 'clear': clearAll(); break;
      case 'negate': negate(); break;
      case 'percent': percent(); break;
      case 'decimal': inputNumber('.'); break;
      case 'equals': calculate(); break;
      case 'add': case 'subtract': case 'multiply': case 'divide':
        setOperator(action); break;
    }
  });

  // Keyboard support
  document.addEventListener('keydown', e => {
    if(/[0-9]/.test(e.key)) inputNumber(e.key);
    else if(e.key === '.') inputNumber('.');
    else if(e.key === '+') setOperator('add');
    else if(e.key === '-') setOperator('subtract');
    else if(e.key === '*') setOperator('multiply');
    else if(e.key === '/') { e.preventDefault(); setOperator('divide'); }
    else if(e.key === 'Enter' || e.key === '=') calculate();
    else if(e.key === 'Escape') clearAll();
    else if(e.key === 'Backspace'){
      if(current.length > 1) current = current.slice(0,-1);
      else current = '0';
      updateDisplay();
    } else if(e.key === '%'){
      percent();
    }
  });

  updateDisplay();

  // Particle background
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let particles = [];
  function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  for(let i=0;i<45;i++){
    particles.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      r: Math.random()*1.5+0.4,
      vy: Math.random()*0.2+0.05,
      o: Math.random()*0.35+0.08
    });
  }
  function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p => {
      p.y -= p.vy;
      if(p.y < -5){ p.y = canvas.height+5; p.x = Math.random()*canvas.width; }
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(212,175,55,${p.o})`;
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();