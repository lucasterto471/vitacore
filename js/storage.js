
const DB = {
  get(k,def=null){try{const v=localStorage.getItem("vc_"+k);return v!==null?JSON.parse(v):def}catch{return def}},
  set(k,v){try{localStorage.setItem("vc_"+k,JSON.stringify(v))}catch(e){console.error(e)}},
  remove(k){localStorage.removeItem("vc_"+k)},
  clear(){Object.keys(localStorage).filter(k=>k.startsWith("vc_")).forEach(k=>localStorage.removeItem(k))}
};
const Store = {
  getUser(){return DB.get("user",{name:"",streak:0,lastWorkout:null,totalWorkouts:0,points:0,badges:[]})},
  setUser(u){DB.set("user",u)},
  getSettings(){return DB.get("settings",{pin:null,pinEnabled:false,notifications:false,reminderTime:"08:00",onboardingDone:false})},
  setSettings(s){DB.set("settings",s)},
  getLogs(){return DB.get("logs",[])},
  addLog(log){const logs=this.getLogs();logs.unshift({...log,date:new Date().toISOString()});if(logs.length>365)logs.pop();DB.set("logs",logs)},
  getJournal(){return DB.get("journal",[])},
  addJournal(entry){const j=this.getJournal();j.unshift({...entry,date:new Date().toISOString()});if(j.length>200)j.pop();DB.set("journal",j)},
  getWorkoutHistory(){return DB.get("workouts",[])},
  addWorkout(w){const ws=this.getWorkoutHistory();ws.unshift({...w,date:new Date().toISOString()});DB.set("workouts",ws)},
  getTodayWorkout(){const today=new Date().toDateString();return this.getWorkoutHistory().find(w=>new Date(w.date).toDateString()===today)||null},
  exportAll(){return JSON.stringify({user:this.getUser(),settings:{...this.getSettings(),pin:null},logs:this.getLogs(),journal:this.getJournal(),workouts:this.getWorkoutHistory()},null,2)}
};
