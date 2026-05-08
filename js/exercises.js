
const WORKOUTS = {
  kegel: [
    {id:'k1',name:'Kegel Básico',level:'Iniciante',sets:3,reps:10,holdSec:5,restSec:5,desc:'Contraia o assoalho pélvico por 5 segundos, relaxe por 5 segundos.',points:10},
    {id:'k2',name:'Kegel Intermediário',level:'Intermediário',sets:4,reps:15,holdSec:7,restSec:4,desc:'Contraia por 7 segundos com maior intensidade, relaxe por 4 segundos.',points:20},
    {id:'k3',name:'Kegel Avançado',level:'Avançado',sets:5,reps:20,holdSec:10,restSec:3,desc:'Contraia por 10 segundos com intensidade máxima, relaxe por 3 segundos.',points:35},
    {id:'k4',name:'Pulsos Rápidos',level:'Intermediário',sets:3,reps:20,holdSec:1,restSec:1,desc:'Contrações rápidas e curtas para ativar fibras musculares diferentes.',points:25},
  ],
  groin: [
    {id:'g1',name:'Ponte de Glúteos',level:'Iniciante',duration:45,desc:'Deite de costas, dobre os joelhos, eleve o quadril. Mantém 3s no topo.',emoji:'🦵'},
    {id:'g2',name:'Agachamento Sumô',level:'Iniciante',duration:45,desc:'Pés largos voltados para fora. Agache profundamente.',emoji:'🏋️'},
    {id:'g3',name:'Afundo Lateral',level:'Intermediário',duration:60,desc:'Passo largo para o lado, dobre um joelho mantendo o outro estendido.',emoji:'↔️'},
    {id:'g4',name:'Borboleta Sentado',level:'Iniciante',duration:60,desc:'Sente com plantas dos pés juntas. Pressione os joelhos para baixo suavemente.',emoji:'🦋'},
    {id:'g5',name:'Hip Thrust',level:'Avançado',duration:45,desc:'Costas no banco, quadril no chão, eleve com força máxima.',emoji:'💪'},
  ]
};

const ExerciseController = {
  current: null,
  timer: null,
  phase: 'idle',
  elapsed: 0,
  currentSet: 0,
  currentRep: 0,
  phaseTime: 0,
  totalTime: 0,

  open(workout) {
    this.current = workout;
    this.reset();
    document.getElementById('exercise-title').textContent = workout.name;
    document.getElementById('exercise-level-badge').textContent = workout.level;
    document.getElementById('exercise-instruction').textContent = 'Pressione Iniciar para começar';
    document.getElementById('kegel-modal').classList.remove('hidden');
    document.getElementById('ex-sets').textContent = '0';
    document.getElementById('ex-reps').textContent = '0';
    document.getElementById('ex-time').textContent = '0:00';
    document.getElementById('exercise-progress-fill').style.width = '0%';
    this.setPhaseVisual('idle');
  },

  reset() {
    clearInterval(this.timer);
    this.phase = 'idle';
    this.elapsed = 0;
    this.currentSet = 0;
    this.currentRep = 0;
    this.phaseTime = 0;
    const btn = document.getElementById('ex-start-stop');
    if(btn) btn.textContent = '▶ Iniciar';
  },

  toggle() {
    if(this.phase === 'idle' || this.phase === 'done') {
      this.start();
    } else if(this.phase === 'paused') {
      this.resume();
    } else {
      this.pause();
    }
  },

  start() {
    if(!this.current) return;
    this.currentSet = 1;
    this.currentRep = 1;
    this.elapsed = 0;
    this.phase = 'prepare';
    this.phaseTime = 3;
    document.getElementById('ex-start-stop').textContent = '⏸ Pausar';
    this.totalTime = this.current.sets * this.current.reps * (this.current.holdSec + this.current.restSec);
    this.runTimer();
  },

  pause() {
    clearInterval(this.timer);
    this.phase = 'paused';
    document.getElementById('ex-start-stop').textContent = '▶ Continuar';
  },

  resume() {
    this.phase = 'contract';
    document.getElementById('ex-start-stop').textContent = '⏸ Pausar';
    this.runTimer();
  },

  runTimer() {
    this.timer = setInterval(() => this.tick(), 1000);
  },

  tick() {
    this.elapsed++;
    this.phaseTime--;
    const pct = Math.min((this.elapsed / this.totalTime) * 100, 100);
    document.getElementById('exercise-progress-fill').style.width = pct + '%';
    const mins = Math.floor(this.elapsed/60), secs = this.elapsed%60;
    document.getElementById('ex-time').textContent = `${mins}:${secs.toString().padStart(2,'0')}`;

    if(this.phaseTime <= 0) {
      if(this.phase === 'prepare') {
        this.phase = 'contract';
        this.phaseTime = this.current.holdSec;
        if(navigator.vibrate) navigator.vibrate(80);
      } else if(this.phase === 'contract') {
        this.phase = 'relax';
        this.phaseTime = this.current.restSec;
        if(navigator.vibrate) navigator.vibrate([40,30,40]);
        this.currentRep++;
        document.getElementById('ex-reps').textContent = this.currentRep - 1;
        if(this.currentRep > this.current.reps) {
          this.currentSet++;
          this.currentRep = 1;
          document.getElementById('ex-sets').textContent = this.currentSet - 1;
          if(this.currentSet > this.current.sets) {
            this.done();
            return;
          }
        }
      } else if(this.phase === 'relax') {
        this.phase = 'contract';
        this.phaseTime = this.current.holdSec;
        if(navigator.vibrate) navigator.vibrate(80);
      }
    }
    this.updateDisplay();
  },

  updateDisplay() {
    const inst = document.getElementById('exercise-instruction');
    const center = document.getElementById('kegel-center');
    if(this.phase === 'prepare') {
      inst.textContent = `Prepare-se... ${this.phaseTime}`;
      this.setPhaseVisual('idle');
    } else if(this.phase === 'contract') {
      inst.textContent = `CONTRAIA — ${this.phaseTime}s`;
      this.setPhaseVisual('contract');
    } else if(this.phase === 'relax') {
      inst.textContent = `Relaxe — ${this.phaseTime}s`;
      this.setPhaseVisual('relax');
    }
    document.getElementById('ex-sets').textContent = `${this.currentSet}/${this.current.sets}`;
  },

  setPhaseVisual(phase) {
    const rings = document.querySelectorAll('.kegel-ring');
    const center = document.getElementById('kegel-center');
    rings.forEach(r => r.className = 'kegel-ring ' + r.classList[1]);
    if(phase === 'contract') {
      rings.forEach(r => r.classList.add('contracting'));
      if(center) center.classList.add('contracting');
    } else if(phase === 'relax') {
      rings.forEach(r => r.classList.add('relaxing'));
      if(center) center && center.classList.remove('contracting');
    } else {
      if(center) center.classList.remove('contracting');
    }
  },

  done() {
    clearInterval(this.timer);
    this.phase = 'done';
    document.getElementById('ex-start-stop').textContent = '✓ Concluído';
    document.getElementById('exercise-instruction').textContent = '🎉 Treino completo!';
    document.getElementById('exercise-progress-fill').style.width = '100%';
    this.setPhaseVisual('idle');
    const user = Store.getUser();
    user.totalWorkouts++;
    user.points += this.current.points;
    const today = new Date().toDateString();
    if(user.lastWorkout !== today) {
      const yesterday = new Date(Date.now()-86400000).toDateString();
      user.streak = user.lastWorkout === yesterday ? user.streak + 1 : 1;
      user.lastWorkout = today;
    }
    Store.setUser(user);
    Store.addWorkout({type:'kegel',workout:this.current.id,duration:this.elapsed,sets:this.current.sets,reps:this.current.reps});
    document.getElementById('header-streak').textContent = user.streak;
    App.showToast('🎉 Treino concluído! +' + this.current.points + ' pontos');
    App.checkBadges(user);
  }
};

const BreathingController = {
  running: false,
  phase: 0,
  timer: null,
  phases: [{name:'Inspire',dur:4},{name:'Segure',dur:7},{name:'Expire',dur:8}],
  idx: 0,
  countdown: 0,

  start() {
    this.running = true;
    this.idx = 0;
    this.countdown = this.phases[0].dur;
    document.getElementById('breathing-start').disabled = true;
    this.tick();
    this.timer = setInterval(() => this.tick(), 1000);
  },

  stop() {
    this.running = false;
    clearInterval(this.timer);
    document.getElementById('breathing-circle').className = 'breathing-circle';
    document.getElementById('breathing-text').textContent = 'Pronto';
    document.getElementById('breathing-timer').textContent = '';
    document.getElementById('breathing-phase').textContent = 'Pressione iniciar';
    document.getElementById('breathing-start').disabled = false;
  },

  tick() {
    if(!this.running) return;
    const p = this.phases[this.idx];
    document.getElementById('breathing-text').textContent = p.name;
    document.getElementById('breathing-timer').textContent = this.countdown;
    document.getElementById('breathing-phase').textContent = p.name;
    const c = document.getElementById('breathing-circle');
    c.className = 'breathing-circle';
    if(p.name==='Inspire') c.classList.add('inhale');
    else if(p.name==='Segure') c.classList.add('hold');
    else c.classList.add('exhale');
    this.countdown--;
    if(this.countdown < 0) {
      this.idx = (this.idx+1) % this.phases.length;
      this.countdown = this.phases[this.idx].dur;
    }
  }
};
