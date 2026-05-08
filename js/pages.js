
const Pages = {
  home() {
    const user = Store.getUser();
    const todayW = Store.getTodayWorkout();
    const logs = Store.getLogs();
    const streak = user.streak || 0;
    const level = user.totalWorkouts < 10 ? 'Iniciante' : user.totalWorkouts < 30 ? 'Intermediário' : 'Avançado';
    const nextWorkout = WORKOUTS.kegel[Math.min(Math.floor(user.totalWorkouts/5), WORKOUTS.kegel.length-1)];

    return `
    <div class="page page-home">
      <div class="home-hero">
        <div class="hero-greeting">
          <h2>Olá! 👋</h2>
          <p class="hero-sub">Nível: <strong>${level}</strong> · ${user.totalWorkouts} treinos</p>
        </div>
        <div class="hero-points">
          <span class="points-val">${user.points||0}</span>
          <span class="points-label">pontos</span>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-icon">🔥</span>
          <span class="stat-num">${streak}</span>
          <span class="stat-txt">Dias seguidos</span>
        </div>
        <div class="stat-card">
          <span class="stat-icon">✅</span>
          <span class="stat-num">${user.totalWorkouts}</span>
          <span class="stat-txt">Total treinos</span>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🏆</span>
          <span class="stat-num">${(user.badges||[]).length}</span>
          <span class="stat-txt">Conquistas</span>
        </div>
      </div>

      ${todayW ? `
      <div class="card success-card">
        <div class="card-icon">✅</div>
        <div>
          <p class="card-title">Treino de hoje completo!</p>
          <p class="card-sub">Continue assim. Amanhã tem mais!</p>
        </div>
      </div>` : `
      <div class="card action-card" id="start-workout-card">
        <div class="card-icon">💪</div>
        <div class="card-body">
          <p class="card-title">Treino de Hoje</p>
          <p class="card-sub">${nextWorkout.name} · ${nextWorkout.sets} séries · ${nextWorkout.reps} reps</p>
        </div>
        <button class="btn btn-primary btn-sm" onclick="ExerciseController.open(WORKOUTS.kegel[Math.min(Math.floor(Store.getUser().totalWorkouts/5),WORKOUTS.kegel.length-1)]);"> Iniciar</button>
      </div>`}

      <h3 class="section-title">Bem-estar Rápido</h3>
      <div class="quick-grid">
        <button class="quick-card" onclick="App.openBreathing()">
          <span class="quick-icon">🫁</span>
          <span class="quick-name">Respiração<br>4-7-8</span>
        </button>
        <button class="quick-card" onclick="App.navigateTo('wellness')">
          <span class="quick-icon">🧘</span>
          <span class="quick-name">Meditação<br>guiada</span>
        </button>
        <button class="quick-card" onclick="App.navigateTo('progress')">
          <span class="quick-icon">📓</span>
          <span class="quick-name">Diário<br>de saúde</span>
        </button>
        <button class="quick-card" onclick="App.navigateTo('insights')">
          <span class="quick-icon">💡</span>
          <span class="quick-name">Insights<br>do dia</span>
        </button>
      </div>

      <h3 class="section-title">Conquistas</h3>
      <div class="badges-row" id="badges-row">
        ${Pages.renderBadges(user.badges||[])}
      </div>
    </div>`;
  },

  renderBadges(earned) {
    const all = [
      {id:'first',icon:'🌟',name:'Primeiro Treino'},
      {id:'week',icon:'🔥',name:'7 Dias Seguidos'},
      {id:'ten',icon:'💪',name:'10 Treinos'},
      {id:'month',icon:'🏆',name:'30 Dias Seguidos'},
      {id:'fifty',icon:'🎖️',name:'50 Treinos'},
    ];
    return all.map(b=>`
      <div class="badge-item ${earned.includes(b.id)?'earned':'locked'}">
        <span class="badge-icon">${b.icon}</span>
        <span class="badge-name">${b.name}</span>
      </div>`).join('');
  },

  training() {
    return `
    <div class="page">
      <h2 class="page-title">Treinos</h2>
      <div class="tab-bar">
        <button class="tab-btn active" onclick="Pages.switchTab('kegel-tab','groin-tab',this)">Kegel</button>
        <button class="tab-btn" onclick="Pages.switchTab('groin-tab','kegel-tab',this)">Groin Fitness</button>
      </div>

      <div id="kegel-tab" class="tab-content">
        <p class="section-desc">Fortaleça o assoalho pélvico com exercícios progressivos.</p>
        ${WORKOUTS.kegel.map(w=>`
        <div class="workout-card">
          <div class="workout-header">
            <div>
              <h4 class="workout-name">${w.name}</h4>
              <span class="level-badge level-${w.level.toLowerCase()}">${w.level}</span>
            </div>
            <span class="workout-points">+${w.points}pts</span>
          </div>
          <p class="workout-desc">${w.desc}</p>
          <div class="workout-meta">
            <span>📋 ${w.sets} séries</span>
            <span>🔁 ${w.reps} reps</span>
            <span>⏱ ${w.holdSec}s contração</span>
          </div>
          <button class="btn btn-primary btn-full" onclick="ExerciseController.open(WORKOUTS.kegel.find(x=>x.id==='${w.id}'))">Iniciar Treino</button>
        </div>`).join('')}
      </div>

      <div id="groin-tab" class="tab-content hidden">
        <p class="section-desc">Exercícios complementares para melhorar circulação e fortalecer músculos adjacentes.</p>
        ${WORKOUTS.groin.map(g=>`
        <div class="workout-card">
          <div class="workout-header">
            <div>
              <h4 class="workout-name">${g.emoji} ${g.name}</h4>
              <span class="level-badge level-${g.level.toLowerCase()}">${g.level}</span>
            </div>
            <span class="workout-points">${g.duration}s</span>
          </div>
          <p class="workout-desc">${g.desc}</p>
          <div class="workout-meta"><span>⏱ ${g.duration} segundos</span></div>
          <button class="btn btn-secondary btn-full" onclick="App.showToast('Função em breve!')">Ver Demonstração</button>
        </div>`).join('')}
      </div>
    </div>`;
  },

  switchTab(show, hide, btn) {
    document.getElementById(show).classList.remove('hidden');
    document.getElementById(hide).classList.add('hidden');
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  },

  progress() {
    const workouts = Store.getWorkoutHistory().slice(0,30);
    const journal = Store.getJournal().slice(0,5);
    const last7 = [];
    for(let i=6;i>=0;i--) {
      const d = new Date(Date.now()-i*86400000);
      const label = ['D','S','T','Q','Q','S','S'][d.getDay()];
      const done = workouts.some(w=>new Date(w.date).toDateString()===d.toDateString());
      last7.push({label, value: done?1:0, date:d});
    }

    return `
    <div class="page">
      <h2 class="page-title">Progresso</h2>

      <div class="card chart-card">
        <h4>Treinos (últimos 7 dias)</h4>
        <canvas id="week-chart" width="320" height="120"></canvas>
      </div>

      <div class="card">
        <h4>Registrar Humor</h4>
        <p class="card-sub">Como você está se sentindo hoje?</p>
        <div class="mood-grid" id="mood-grid">
          ${['😔','😐','🙂','😊','😄'].map((e,i)=>`
          <button class="mood-btn" data-mood="${i+1}" onclick="Pages.selectMood(this,'${e}',${i+1})">
            <span>${e}</span>
          </button>`).join('')}
        </div>
        <div id="mood-extra" class="hidden" style="margin-top:12px;">
          <label class="form-label">Notas (opcional)</label>
          <textarea id="mood-note" class="form-input" rows="2" placeholder="Como foi seu dia?"></textarea>
          <div style="display:flex;gap:8px;margin-top:8px;">
            <div style="flex:1">
              <label class="form-label">Energia</label>
              <input type="range" id="energy-range" min="1" max="5" value="3" class="range-input" />
            </div>
            <div style="flex:1">
              <label class="form-label">Sono (h)</label>
              <input type="number" id="sleep-input" min="0" max="12" value="7" class="form-input small" />
            </div>
          </div>
          <button class="btn btn-primary btn-full" style="margin-top:8px;" onclick="Pages.saveJournal()">Salvar Registro</button>
        </div>
      </div>

      <div class="card">
        <h4>Histórico Recente</h4>
        ${journal.length===0 ? '<p class="empty-state">Nenhum registro ainda. Comece hoje!</p>' :
          journal.map(j=>`
          <div class="journal-item">
            <span class="journal-mood">${['😔','😐','🙂','😊','😄'][j.mood-1]||'🙂'}</span>
            <div>
              <p class="journal-date">${new Date(j.date).toLocaleDateString('pt-BR')}</p>
              <p class="journal-note">${j.note||'Sem notas'}</p>
            </div>
            <div class="journal-stats">
              <span>⚡${j.energy||3}</span>
              <span>💤${j.sleep||7}h</span>
            </div>
          </div>`).join('')
        }
      </div>
    </div>`;
  },

  selectMood(btn, emoji, val) {
    document.querySelectorAll('.mood-btn').forEach(b=>b.classList.remove('selected'));
    btn.classList.add('selected');
    btn.dataset.selected = val;
    document.getElementById('mood-extra').classList.remove('hidden');
    window._selectedMood = val;
  },

  saveJournal() {
    const mood = window._selectedMood || 3;
    const note = document.getElementById('mood-note')?.value || '';
    const energy = document.getElementById('energy-range')?.value || 3;
    const sleep = document.getElementById('sleep-input')?.value || 7;
    Store.addJournal({mood:parseInt(mood), note, energy:parseInt(energy), sleep:parseFloat(sleep)});
    App.showToast('✅ Registro salvo!');
    App.navigateTo('progress');
  },

  wellness() {
    const meditations = [
      {icon:'🧘',title:'Relaxamento Muscular',dur:'5 min',desc:'Tensione e relaxe cada grupo muscular progressivamente.'},
      {icon:'🌊',title:'Visualização Positiva',dur:'7 min',desc:'Guia mental para fortalecer a autoconfiança e reduzir ansiedade.'},
      {icon:'☀️',title:'Manhã Energizante',dur:'3 min',desc:'Prepare sua mente e corpo para um dia produtivo.'},
      {icon:'🌙',title:'Descanso Noturno',dur:'10 min',desc:'Acalme a mente antes de dormir para melhor recuperação.'},
    ];
    return `
    <div class="page">
      <h2 class="page-title">Bem-estar</h2>

      <div class="card breathing-card" onclick="App.openBreathing()">
        <div class="breathing-preview">
          <div class="bp-circle"></div>
        </div>
        <div>
          <h4>Respiração 4-7-8</h4>
          <p class="card-sub">Técnica anti-ansiedade de desempenho</p>
        </div>
        <button class="btn btn-primary btn-sm">Iniciar</button>
      </div>

      <h3 class="section-title">Meditações Guiadas</h3>
      ${meditations.map(m=>`
      <div class="workout-card" onclick="App.showToast('Áudio disponível em breve!')">
        <div class="workout-header">
          <div style="display:flex;gap:12px;align-items:center;">
            <span style="font-size:2rem;">${m.icon}</span>
            <div>
              <h4 class="workout-name">${m.title}</h4>
              <span class="badge-pill">${m.dur}</span>
            </div>
          </div>
        </div>
        <p class="workout-desc">${m.desc}</p>
        <button class="btn btn-secondary btn-full">▶ Ouvir (em breve)</button>
      </div>`).join('')}

      <div class="card tip-card">
        <h4>💡 Dica do Dia</h4>
        <p>${Pages.getDailyTip()}</p>
      </div>
    </div>`;
  },

  getDailyTip() {
    const tips = [
      'O estresse e a ansiedade são causas comuns de disfunção erétil. Práticas regulares de respiração ajudam a quebrar esse ciclo.',
      'Exercícios de Kegel fortalecem o músculo pubococcígeo, fundamental para o controle erétil e ejaculatório.',
      'Dormir 7-9 horas por noite aumenta significativamente os níveis de testosterona.',
      'Atividade física aeróbica regular de 30 min por dia melhora a circulação sanguínea e a saúde erétil.',
      'Uma dieta rica em nitratos (beterraba, folhas verdes) favorece a produção de óxido nítrico, essencial para ereções.',
    ];
    return tips[new Date().getDate() % tips.length];
  },

  insights() {
    const articles = [
      {icon:'🔬',tag:'Ciência',title:'Como o Kegel melhora a saúde erétil',preview:'O músculo pubococcígeo (PC) é responsável pelo controle do fluxo sanguíneo durante a ereção...'},
      {icon:'🧠',tag:'Mental',title:'A conexão entre ansiedade e desempenho sexual',preview:'A ansiedade de desempenho ativa o sistema nervoso simpático, que pode inibir a resposta erétil...'},
      {icon:'🥗',tag:'Nutrição',title:'Alimentos que melhoram a circulação',preview:'Nitratos presentes em vegetais de folha verde são convertidos em óxido nítrico pelo corpo...'},
      {icon:'😴',tag:'Sono',title:'Por que dormir bem é crucial para a testosterona',preview:'Cerca de 70% da liberação diária de testosterona ocorre durante o sono...'},
      {icon:'💊',tag:'Saúde',title:'Quando procurar um médico?',preview:'A disfunção erétil pode ser sintoma de condições cardiovasculares subjacentes. Consulte um urologista se...'},
      {icon:'🏃',tag:'Exercício',title:'Aeróbico vs. Força: o que é melhor?',preview:'Estudos mostram que exercícios aeróbicos têm o maior impacto positivo na função erétil...'},
    ];
    return `
    <div class="page">
      <h2 class="page-title">Insights</h2>
      <p class="page-desc">Conteúdo baseado em evidências científicas para sua saúde.</p>
      <div class="disclaimer-banner">
        ⚕️ Informações educativas. Consulte um médico para diagnóstico e tratamento.
      </div>
      ${articles.map(a=>`
      <div class="article-card" onclick="App.showToast('Artigo completo em breve!')">
        <div class="article-header">
          <span class="article-icon">${a.icon}</span>
          <span class="article-tag">${a.tag}</span>
        </div>
        <h4 class="article-title">${a.title}</h4>
        <p class="article-preview">${a.preview}</p>
        <span class="article-read">Ler mais →</span>
      </div>`).join('')}
    </div>`;
  },

  afterRender(page) {
    if(page === 'progress') {
      setTimeout(()=>{
        const canvas = document.getElementById('week-chart');
        if(canvas) {
          const workouts = Store.getWorkoutHistory();
          const last7 = [];
          for(let i=6;i>=0;i--) {
            const d = new Date(Date.now()-i*86400000);
            const label = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][d.getDay()];
            const done = workouts.some(w=>new Date(w.date).toDateString()===d.toDateString());
            last7.push({label, value: done?1:0});
          }
          Charts.drawBar(canvas, last7, {color:'#4f9cf9'});
        }
      }, 100);
    }
  }
};
