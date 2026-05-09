
const App = {
  currentPage: 'home',
  pinBuffer: '',
  setupPinBuffer: '',
  setupPinStep: 'create',
  confirmPin: '',

  init() {
    if('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(()=>{});
    }
    const settings = Store.getSettings();
    const splash = document.getElementById('splash-screen');
    setTimeout(()=>{
      splash.classList.add('fade-out');
      setTimeout(()=>{
        splash.style.display='none';
        if(!settings.onboardingDone) {
          this.showOnboarding();
        } else if(settings.pinEnabled && settings.pin) {
          this.showLockScreen();
        } else {
          this.showApp();
        }
      }, 400);
    }, 2000);

    this.bindEvents();
  },

  bindEvents() {
    // Bottom nav
    document.querySelectorAll('.nav-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        this.navigateTo(btn.dataset.page);
      });
    });

    // Settings
    document.getElementById('settings-btn').addEventListener('click',()=>this.openSettings());
    document.getElementById('settings-close').addEventListener('click',()=>this.closeSettings());
    document.getElementById('settings-overlay').addEventListener('click',()=>this.closeSettings());

    // PIN lock
    document.querySelectorAll('[data-key]').forEach(btn=>{
      btn.addEventListener('click',()=>this.handlePinInput(btn.dataset.key));
    });
    document.getElementById('key-delete').addEventListener('click',()=>this.handlePinDelete());
    document.getElementById('skip-lock-btn').addEventListener('click',()=>this.showApp());

    // PIN setup
    document.querySelectorAll('[data-setup-key]').forEach(btn=>{
      btn.addEventListener('click',()=>this.handleSetupPin(btn.dataset.setupKey));
    });
    document.getElementById('setup-key-delete').addEventListener('click',()=>this.handleSetupDelete());
    document.getElementById('pin-modal-cancel').addEventListener('click',()=>this.closeSetupPin());
    document.getElementById('setup-pin-btn').addEventListener('click',()=>this.openSetupPin());
    document.getElementById('skip-pin-btn').addEventListener('click',()=>{
      document.getElementById('pin-setup-modal').classList.add('hidden');
      document.getElementById('onboarding').classList.add('hidden');
      this.showApp();
    });

    // Onboarding
    document.getElementById('onboarding-next').addEventListener('click',()=>this.nextSlide());

    // Settings toggles
    document.getElementById('pin-toggle').addEventListener('change',e=>{
      const s = Store.getSettings();
      if(e.target.checked && !s.pin) {
        e.target.checked = false;
        this.openSetupPin();
      } else {
        s.pinEnabled = e.target.checked;
        Store.setSettings(s);
        document.getElementById('change-pin-item').style.display = e.target.checked?'flex':'none';
      }
    });

    document.getElementById('notif-toggle').addEventListener('change',e=>{
      if(e.target.checked) {
        Notification.requestPermission().then(p=>{
          const s=Store.getSettings(); s.notifications=(p==='granted'); Store.setSettings(s);
          if(p!=='granted'){e.target.checked=false;this.showToast('Permissão negada para notificações');}
        });
      } else {
        const s=Store.getSettings(); s.notifications=false; Store.setSettings(s);
      }
    });

    document.getElementById('reminder-time').addEventListener('change',e=>{
      const s=Store.getSettings(); s.reminderTime=e.target.value; Store.setSettings(s);
    });

    document.getElementById('export-data-btn').addEventListener('click',()=>{
      const data = Store.exportAll();
      const blob = new Blob([data],{type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href=url; a.download='vitacore-data.json'; a.click();
      this.showToast('✅ Dados exportados!');
    });

    document.getElementById('clear-data-btn').addEventListener('click',()=>{
      if(confirm('Tem certeza? Todos os dados serão apagados.')) {
        Store.clear(); location.reload();
      }
    });

    document.getElementById('change-pin-btn')?.addEventListener('click',()=>this.openSetupPin());

    // Kegel modal
    document.getElementById('kegel-close').addEventListener('click',()=>{
      ExerciseController.reset();
      document.getElementById('kegel-modal').classList.add('hidden');
    });
    document.getElementById('ex-start-stop').addEventListener('click',()=>ExerciseController.toggle());
    document.getElementById('ex-restart').addEventListener('click',()=>{
      ExerciseController.reset();
      ExerciseController.start();
    });

    // Breathing modal
    document.getElementById('breathing-close').addEventListener('click',()=>{
      BreathingController.stop();
      document.getElementById('breathing-modal').classList.add('hidden');
    });
    document.getElementById('breathing-start').addEventListener('click',()=>BreathingController.start());
    document.getElementById('breathing-stop').addEventListener('click',()=>BreathingController.stop());
  },

  showOnboarding() {
    document.getElementById('onboarding').classList.remove('hidden');
  },

  nextSlide() {
    const slides = document.querySelectorAll('.onboarding-slide');
    const indicators = document.querySelectorAll('.indicator');
    let active = 0;
    slides.forEach((s,i)=>{ if(s.classList.contains('active')) active=i; });
    if(active >= slides.length-1) return;
    slides[active].classList.remove('active');
    slides[active+1].classList.add('active');
    indicators[active].classList.remove('active');
    indicators[active+1].classList.add('active');
    if(active+1 >= slides.length-1) {
      document.getElementById('onboarding-next').style.display='none';
    }
  },

  showApp() {
    document.getElementById('onboarding').classList.add('hidden');
    document.getElementById('lock-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    const s = Store.getSettings(); s.onboardingDone=true; Store.setSettings(s);
    const user = Store.getUser();
    document.getElementById('header-streak').textContent = user.streak||0;
    this.navigateTo('home');
  },

  showLockScreen() {
    document.getElementById('lock-screen').classList.remove('hidden');
  },

  navigateTo(page) {
    this.currentPage = page;
    document.querySelectorAll('.nav-btn').forEach(b=>{
      b.classList.toggle('active', b.dataset.page===page);
    });
    const container = document.getElementById('page-container');
    let html = '';
    if(page==='home') html=Pages.home();
    else if(page==='training') html=Pages.training();
    else if(page==='progress') html=Pages.progress();
    else if(page==='wellness') html=Pages.wellness();
    else if(page==='diet') html=Pages.diet();
    container.innerHTML = html;
    container.scrollTop = 0;
    Pages.afterRender(page);
  },

  handlePinInput(digit) {
    if(this.pinBuffer.length >= 4) return;
    this.pinBuffer += digit;
    this.updatePinDots('dot', this.pinBuffer.length);
    if(this.pinBuffer.length === 4) {
      const settings = Store.getSettings();
      if(this.pinBuffer === settings.pin) {
        this.pinBuffer = '';
        this.resetPinDots('dot');
        this.showApp();
      } else {
        document.getElementById('pin-error').classList.remove('hidden');
        document.getElementById('pin-dots').classList.add('shake');
        setTimeout(()=>{
          this.pinBuffer='';
          this.resetPinDots('dot');
          document.getElementById('pin-error').classList.add('hidden');
          document.getElementById('pin-dots').classList.remove('shake');
        }, 1000);
      }
    }
  },

  handlePinDelete() {
    if(this.pinBuffer.length>0) {
      this.pinBuffer = this.pinBuffer.slice(0,-1);
      this.updatePinDots('dot', this.pinBuffer.length);
    }
  },

  updatePinDots(prefix, count) {
    for(let i=0;i<4;i++) {
      const dot = document.getElementById(`${prefix}-${i}`);
      if(dot) dot.classList.toggle('filled', i<count);
    }
  },

  resetPinDots(prefix) {
    for(let i=0;i<4;i++) {
      const dot = document.getElementById(`${prefix}-${i}`);
      if(dot) dot.classList.remove('filled');
    }
  },

  openSetupPin() {
    this.setupPinBuffer = '';
    this.setupPinStep = 'create';
    this.confirmPin = '';
    document.getElementById('pin-setup-title').textContent = 'Criar PIN de 4 dígitos';
    document.getElementById('pin-setup-desc').textContent = 'Escolha um PIN seguro';
    this.resetPinDots('sdot');
    document.getElementById('pin-setup-modal').classList.remove('hidden');
  },

  closeSetupPin() {
    document.getElementById('pin-setup-modal').classList.add('hidden');
    this.setupPinBuffer=''; this.setupPinStep='create';
  },

  handleSetupPin(digit) {
    if(this.setupPinBuffer.length>=4) return;
    this.setupPinBuffer += digit;
    this.updatePinDots('sdot', this.setupPinBuffer.length);
    if(this.setupPinBuffer.length===4) {
      if(this.setupPinStep==='create') {
        this.confirmPin = this.setupPinBuffer;
        this.setupPinBuffer='';
        this.setupPinStep='confirm';
        document.getElementById('pin-setup-title').textContent='Confirme seu PIN';
        document.getElementById('pin-setup-desc').textContent='Digite o PIN novamente';
        this.resetPinDots('sdot');
      } else {
        if(this.setupPinBuffer===this.confirmPin) {
          const s=Store.getSettings(); s.pin=this.setupPinBuffer; s.pinEnabled=true; Store.setSettings(s);
          this.closeSetupPin();
          this.showToast('🔒 PIN configurado com sucesso!');
          const toggle = document.getElementById('pin-toggle');
          if(toggle) { toggle.checked=true; }
          const cpItem = document.getElementById('change-pin-item');
          if(cpItem) cpItem.style.display='flex';
          if(!Store.getSettings().onboardingDone) {
            document.getElementById('onboarding').classList.add('hidden');
            this.showApp();
          }
        } else {
          this.setupPinBuffer='';
          this.resetPinDots('sdot');
          document.getElementById('pin-setup-desc').textContent='PINs não coincidem. Tente novamente.';
          this.setupPinStep='create';
          this.confirmPin='';
        }
      }
    }
  },

  handleSetupDelete() {
    if(this.setupPinBuffer.length>0) {
      this.setupPinBuffer=this.setupPinBuffer.slice(0,-1);
      this.updatePinDots('sdot',this.setupPinBuffer.length);
    }
  },

  openSettings() {
    const s=Store.getSettings();
    document.getElementById('pin-toggle').checked=s.pinEnabled&&!!s.pin;
    document.getElementById('notif-toggle').checked=s.notifications;
    document.getElementById('reminder-time').value=s.reminderTime||'08:00';
    document.getElementById('change-pin-item').style.display=(s.pinEnabled&&s.pin)?'flex':'none';
    document.getElementById('settings-panel').classList.remove('hidden');
  },

  closeSettings() {
    document.getElementById('settings-panel').classList.add('hidden');
  },

  openBreathing() {
    document.getElementById('breathing-modal').classList.remove('hidden');
  },

  showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    t.classList.add('show');
    setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.classList.add('hidden'),300); }, 2500);
  },

  checkBadges(user) {
    const earned = user.badges||[];
    const add = id=>{ if(!earned.includes(id)){earned.push(id);} };
    if(user.totalWorkouts>=1) add('first');
    if(user.totalWorkouts>=10) add('ten');
    if(user.totalWorkouts>=50) add('fifty');
    if(user.streak>=7) add('week');
    if(user.streak>=30) add('month');
    user.badges=earned;
    Store.setUser(user);
  }
};

document.addEventListener('DOMContentLoaded',()=>App.init());
