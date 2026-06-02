This is the big one. Paste it all. The Firebase settings block is near the top.
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { Calendar, Home, Users, Plus, X, Check, Trash2, Waves, Sun, MapPin, Bed, ChevronLeft, ChevronRight, Sparkles, Heart, MessageCircle, RefreshCw, Lock, KeyRound, Bell, UserPlus, ThumbsUp, ThumbsDown, Clock, Star, Mail, Phone, LayoutGrid, AlignLeft, BookUser, Search } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import './index.css';

/* ════════════════════════════════════════════════════════════
   ⬇️  PASTE YOUR FIREBASE SETTINGS HERE  ⬇️
   (the same six values you used before)
   ════════════════════════════════════════════════════════════ */
const firebaseConfig = {
  apiKey: "AIzaSyB6dmMJhbAqFY7iNXklvo3h-GqxeuBAHHs",
  authDomain: "uncle-john-s-beach-house-ac654.firebaseapp.com",
  projectId: "uncle-john-s-beach-house-ac654",
  storageBucket:"uncle-john-s-beach-house-ac654.firebasestorage.app",
  messagingSenderId: "107937392299",
  appId: "1:107937392299:web:5f9be9c107117b087439ee"
};
/* ════════════════════════════════════════════════════════════
   ⬆️  STOP — don't edit anything below this line  ⬆️
   ════════════════════════════════════════════════════════════ */

const NEEDS_SETUP = !firebaseConfig.apiKey || firebaseConfig.apiKey.includes('PASTE');
let db = null;
const DOCREF = (name) => doc(db, 'beach-house', name);
if (!NEEDS_SETUP) {
  db = getFirestore(initializeApp(firebaseConfig));
}

const ROOMS = [
  { id:'king-ocean', name:"The Captain's Quarters", subtitle:'King · Ocean Front · Level 1', capacity:2, color:'#1B4965', icon:'🌊', description:'Wake up to the sound of waves.' },
  { id:'bunk-right', name:'Starboard Bunks', subtitle:'Street Side · 4 beds · Right', capacity:4, color:'#C8553D', icon:'⚓', description:'Four bunks, endless giggles.' },
  { id:'bunk-left', name:'Port Bunks', subtitle:'Street Side · 4 beds · Left', capacity:4, color:'#D69F3C', icon:'🪜', description:'Mirror of Starboard. Pillow forts encouraged.' },
  { id:'double-queen', name:'The Double', subtitle:'Two Queens · Level 1', capacity:4, color:'#5B8266', icon:'🌿', description:'Two queen beds. Great for small families.' },
  { id:'single-queen', name:"The Crow's Nest", subtitle:'Queen · Level 2', capacity:2, color:'#8B6B9A', icon:'🌙', description:'Upstairs hideaway. Cozy and quiet.' },
  { id:'private-lantern', name:'The Lantern', subtitle:'Private King · Level 2', capacity:2, color:'#8B5A3C', icon:'🔦', description:'Private King suite.', private:true, code:'2426' },
  { id:'private-compass', name:'The Compass', subtitle:'Private King · Ocean Front · Level 1', capacity:2, color:'#1F3A4E', icon:'🧭', description:'Private King with ocean views.', private:true, code:'8835' }
];
const MAX_CAPACITY = 20;
const WHOLE_HOUSE_CODE = '7700';
const DOW_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const fmtDate = d => { const x=new Date(d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`; };
const parseDate = s => { const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); };
const prettyDate = s => parseDate(s).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
const shortDate = s => parseDate(s).toLocaleDateString('en-US',{month:'short',day:'numeric'});
const nightsCount = (s,e) => Math.max(0,Math.round((parseDate(e)-parseDate(s))/(1000*60*60*24)));
const overlaps = (a1,a2,b1,b2) => parseDate(a1)<parseDate(b2)&&parseDate(b1)<parseDate(a2);
const fullName = b => [b?.firstName,b?.lastName].filter(Boolean).join(' ')||b?.guestName||'Guest';
const initials = g => `${(g?.firstName||'')[0]||''}${(g?.lastName||'')[0]||''}`.toUpperCase()||'?';

function normalizeBooking(b) {
  if(!b||typeof b!=='object') return null;
  let fn=b.firstName||'',ln=b.lastName||'';
  if(!fn&&b.guestName){const p=b.guestName.trim().split(' ');fn=p[0]||'';ln=p.slice(1).join(' ')||'';}
  return {id:b.id||`b_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,firstName:fn||'Guest',lastName:ln||'',guestName:`${fn||'Guest'} ${ln}`.trim(),email:b.email||'',phone:b.phone||'',numGuests:Number.isFinite(b.numGuests)?b.numGuests:1,startDate:b.startDate||fmtDate(new Date()),endDate:b.endDate||fmtDate(new Date()),rooms:Array.isArray(b.rooms)?b.rooms:[],notes:typeof b.notes==='string'?b.notes:'',wholeHouse:!!b.wholeHouse,createdAt:b.createdAt||Date.now()};
}
function normalizeGuest(g) {
  if(!g||typeof g!=='object') return null;
  let fn=g.firstName||'',ln=g.lastName||'';
  if(!fn&&g.guestName){const p=g.guestName.trim().split(' ');fn=p[0]||'';ln=p.slice(1).join(' ')||'';}
  return {id:g.id||`g_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,firstName:fn||'Guest',lastName:ln||'',email:g.email||'',phone:g.phone||'',lastVisit:g.lastVisit||null,visitCount:Number.isFinite(g.visitCount)?g.visitCount:0,createdAt:g.createdAt||Date.now()};
}
function normalizeRequest(r) {
  if(!r||typeof r!=='object') return null;
  let fn=r.firstName||'',ln=r.lastName||'';
  if(!fn&&r.guestName){const p=r.guestName.trim().split(' ');fn=p[0]||'';ln=p.slice(1).join(' ')||'';}
  return {id:r.id||`jr_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,firstName:fn||'Guest',lastName:ln||'',guestName:`${fn||'Guest'} ${ln}`.trim(),email:r.email||'',phone:r.phone||'',numGuests:Number.isFinite(r.numGuests)?r.numGuests:1,startDate:r.startDate||fmtDate(new Date()),endDate:r.endDate||fmtDate(new Date()),rooms:Array.isArray(r.rooms)?r.rooms:[],notes:typeof r.notes==='string'?r.notes:'',joinMessage:typeof r.joinMessage==='string'?r.joinMessage:'',targetBookingId:r.targetBookingId||null,targetGuestName:typeof r.targetGuestName==='string'?r.targetGuestName:'',status:r.status||'pending',createdAt:r.createdAt||Date.now()};
}

async function loadAllBookings(){try{const s=await getDoc(DOCREF('bookings'));const items=s.exists()?(s.data().items||[]):[];return items.map(normalizeBooking).filter(Boolean).sort((a,b)=>a.startDate.localeCompare(b.startDate));}catch(e){console.error(e);return[];}}
async function saveAllBookings(b){try{await setDoc(DOCREF('bookings'),{items:b});return true;}catch(e){console.error(e);return false;}}
async function loadAllRequests(){try{const s=await getDoc(DOCREF('requests'));const items=s.exists()?(s.data().items||[]):[];return items.map(normalizeRequest).filter(Boolean);}catch(e){console.error(e);return[];}}
async function saveAllRequests(r){try{await setDoc(DOCREF('requests'),{items:r});return true;}catch(e){console.error(e);return false;}}
async function loadAllGuests(){try{const s=await getDoc(DOCREF('guests'));const items=s.exists()?(s.data().items||[]):[];return items.map(normalizeGuest).filter(Boolean).sort((a,b)=>fullName(a).localeCompare(fullName(b)));}catch(e){console.error(e);return[];}}
async function saveAllGuests(g){try{await setDoc(DOCREF('guests'),{items:g});return true;}catch(e){console.error(e);return false;}}

function SetupScreen(){
  return (
    <div style={{background:'#FBF6EE',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',fontFamily:'system-ui,sans-serif'}}>
      <div style={{maxWidth:'480px',background:'#fff',borderRadius:'24px',padding:'36px',border:'2px solid #E5D4B5'}}>
        <div style={{fontSize:'48px',textAlign:'center'}}>🏖️</div>
        <h1 style={{fontFamily:'Georgia,serif',fontSize:'26px',color:'#1B4965',textAlign:'center',margin:'8px 0 6px'}}>Almost there!</h1>
        <p style={{textAlign:'center',color:'#2A2522',opacity:0.7,marginTop:0}}>Paste your Firebase settings into <code>src/main.jsx</code> (the block marked "PASTE YOUR FIREBASE SETTINGS HERE"), then save. The site rebuilds itself automatically.</p>
      </div>
    </div>
  );
}

export default function App() {
  const [bookings,setBookings]=useState([]);
  const [joinRequests,setJoinRequests]=useState([]);
  const [guests,setGuests]=useState([]);
  const [loading,setLoading]=useState(true);
  const [view,setView]=useState('home');
  const [editingBooking,setEditingBooking]=useState(null);
  const [toast,setToast]=useState(null);

  useEffect(()=>{
    const unsubB=onSnapshot(DOCREF('bookings'),snap=>{const items=snap.exists()?(snap.data().items||[]):[];setBookings(items.map(normalizeBooking).filter(Boolean).sort((a,b)=>a.startDate.localeCompare(b.startDate)));setLoading(false);},e=>{console.error(e);setLoading(false);});
    const unsubR=onSnapshot(DOCREF('requests'),snap=>{const items=snap.exists()?(snap.data().items||[]):[];setJoinRequests(items.map(normalizeRequest).filter(Boolean));});
    const unsubG=onSnapshot(DOCREF('guests'),snap=>{const items=snap.exists()?(snap.data().items||[]):[];setGuests(items.map(normalizeGuest).filter(Boolean).sort((a,b)=>fullName(a).localeCompare(fullName(b))));});
    return ()=>{unsubB();unsubR();unsubG();};
  },[]);

  const showToast=(msg,type='success')=>{setToast({msg,type});setTimeout(()=>setToast(null),3500);};
  const handleSave=async bk=>{const exists=bookings.some(b=>b.id===bk.id);const updated=exists?bookings.map(b=>b.id===bk.id?bk:b):[...bookings,bk];const sorted=[...updated].sort((a,b)=>a.startDate.localeCompare(b.startDate));setBookings(sorted);setEditingBooking(null);setView('home');const ok=await saveAllBookings(sorted);showToast(ok?(editingBooking?'Stay updated ✨':'Booked! See you at the beach 🌊'):'Could not save — check your connection.',ok?'success':'error');};
  const handleSaveJoinRequest=async req=>{const updated=[...joinRequests,req];setJoinRequests(updated);setEditingBooking(null);setView('home');const ok=await saveAllRequests(updated);showToast(ok?`Join request sent to ${req.targetGuestName}! 🤝`:'Could not save.',ok?'success':'error');};
  const handleSaveGuest=async gd=>{const exists=guests.some(g=>g.id===gd.id);const updated=exists?guests.map(g=>g.id===gd.id?gd:g):[...guests,gd];const sorted=[...updated].sort((a,b)=>fullName(a).localeCompare(fullName(b)));setGuests(sorted);await saveAllGuests(sorted);};
  const handleDeleteGuest=async id=>{const updated=guests.filter(g=>g.id!==id);setGuests(updated);await saveAllGuests(updated);showToast('Guest removed from directory');};
  const handleApproveRequest=async reqId=>{const req=joinRequests.find(r=>r.id===reqId);if(!req)return;const bk=normalizeBooking({...req,id:`b_${Date.now()}`});const updatedB=[...bookings,bk].sort((a,b)=>a.startDate.localeCompare(b.startDate));const updatedR=joinRequests.filter(r=>r.id!==reqId);setBookings(updatedB);setJoinRequests(updatedR);await Promise.all([saveAllBookings(updatedB),saveAllRequests(updatedR)]);showToast(`${req.guestName}'s stay confirmed! 🎉`);};
  const handleDeclineRequest=async reqId=>{const req=joinRequests.find(r=>r.id===reqId);const updated=joinRequests.filter(r=>r.id!==reqId);setJoinRequests(updated);await saveAllRequests(updated);showToast(`${req?.guestName}'s request declined.`);};
  const handleDelete=async id=>{const updated=bookings.filter(b=>b.id!==id);setBookings(updated);await saveAllBookings(updated);showToast('Booking removed');};
  const handleSync=async()=>{const[b,r,g]=await Promise.all([loadAllBookings(),loadAllRequests(),loadAllGuests()]);setBookings(b);setJoinRequests(r);setGuests(g);showToast(`Synced — ${b.length} stay${b.length!==1?'s':''}, ${g.length} guest${g.length!==1?'s':''}`);};
  const pending=joinRequests.filter(r=>r.status==='pending');

  return (
    <div style={{background:'#FBF6EE',minHeight:'100vh',color:'#2A2522'}} className="font-body">
      <style>{`
        .font-display{font-family:'Fraunces',Georgia,serif;font-optical-sizing:auto;}
        .font-body{font-family:'Outfit',system-ui,sans-serif;}
        .grain{position:relative;}.grain::after{content:'';position:absolute;inset:0;pointer-events:none;opacity:0.04;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:1}100%{transform:scale(1.4);opacity:0}}
        .fade-up{animation:fadeUp 0.5s ease-out both}.float-slow{animation:float 6s ease-in-out infinite}
        .shimmer-text{background:linear-gradient(90deg,#FBF6EE 0%,#FFE9A0 40%,#FBF6EE 60%,#FFE9A0 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 3s linear infinite;}
        .pulse-ring::before{content:'';position:absolute;inset:-3px;border-radius:inherit;border:2px solid #E07856;animation:pulse-ring 1.5s ease-out infinite}
        .cal-cell{min-height:88px;border-right:1px solid #E5D4B5;border-bottom:1px solid #E5D4B5;}.cal-cell:nth-child(7n){border-right:none;}
        .dir-toggle{display:flex;align-items:center;gap:12px;cursor:pointer;padding:10px 12px;border-radius:12px;transition:background 0.2s,border-color 0.2s;}
        .dir-track{width:40px;height:22px;border-radius:11px;transition:background 0.2s;display:flex;align-items:center;padding:2px;flex-shrink:0;}
        .dir-thumb{width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.25);transition:transform 0.2s;}
      `}</style>
      <Header view={view} setView={setView} onSync={handleSync} pendingCount={pending.length} guestCount={guests.length}/>
      <main className="max-w-6xl mx-auto px-5 sm:px-8 pb-24">
        {loading
          ? <div className="flex items-center justify-center py-32 font-display italic text-xl" style={{color:'#1B4965'}}><Waves className="animate-pulse mr-3"/>Setting the table...</div>
          : view==='home' ? <HomeView bookings={bookings} joinRequests={pending} setView={setView} setEditingBooking={setEditingBooking} onApprove={handleApproveRequest} onDecline={handleDeclineRequest}/>
          : view==='book' ? <BookingForm bookings={bookings} guests={guests} editingBooking={editingBooking} onSave={handleSave} onSaveJoinRequest={handleSaveJoinRequest} onSaveGuest={handleSaveGuest} onCancel={()=>{setEditingBooking(null);setView('home');}}/>
          : view==='calendar' ? <CalendarView bookings={bookings}/>
          : view==='stays' ? <StaysList bookings={bookings} onEdit={b=>{setEditingBooking(b);setView('book');}} onDelete={handleDelete}/>
          : view==='house' ? <HouseView bookings={bookings}/>
          : view==='directory' ? <GuestDirectory guests={guests} bookings={bookings} onDelete={handleDeleteGuest} setView={setView}/>
          : null}
      </main>
      {toast&&<div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-xl fade-up font-body z-50 text-sm" style={{background:toast.type==='error'?'#C8553D':'#1B4965',color:'#FBF6EE',whiteSpace:'nowrap'}}>{toast.msg}</div>}
    </div>
  );
}

function Header({view,setView,onSync,pendingCount,guestCount}){
  const [syncing,setSyncing]=useState(false);
  const tabs=[{id:'home',label:'Home',icon:Home},{id:'calendar',label:'Calendar',icon:Calendar},{id:'stays',label:'All Stays',icon:Bed},{id:'directory',label:'Guests',icon:BookUser},{id:'house',label:'The House',icon:MapPin}];
  const doSync=async()=>{setSyncing(true);await onSync();setTimeout(()=>setSyncing(false),600);};
  return(
    <header className="grain" style={{background:'linear-gradient(180deg,#1B4965 0%,#2C5F73 100%)',color:'#FBF6EE'}}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-8 pb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] mb-2" style={{opacity:0.7}}><Sun size={14}/>est. family tradition</div>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-none">The Beach House</h1>
            <p className="font-display italic text-base sm:text-lg mt-2" style={{opacity:0.85}}>where the tide pulls us back, every summer.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={doSync} className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105" style={{background:'rgba(251,246,238,0.15)'}}><RefreshCw size={16} className={syncing?'animate-spin':''}/></button>
            <button onClick={()=>setView('book')} className="flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all hover:scale-105" style={{background:'#E07856',boxShadow:'0 4px 14px rgba(224,120,86,0.4)'}}><Plus size={18}/>New Stay</button>
          </div>
        </div>
        <nav className="flex gap-1 mt-7 -mb-6 overflow-x-auto" style={{scrollbarWidth:'none'}}>
          {tabs.map(({id,label,icon:Icon})=>{const active=view===id||(id==='home'&&view==='book');return(
            <button key={id} onClick={()=>setView(id)} className="flex items-center gap-2 px-4 py-3 rounded-t-lg whitespace-nowrap transition-all text-sm font-medium relative" style={{background:active?'#FBF6EE':'transparent',color:active?'#1B4965':'#FBF6EE',opacity:active?1:0.75}}>
              <Icon size={16}/>{label}
              {id==='home'&&pendingCount>0&&<span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold relative pulse-ring" style={{background:'#E07856',color:'#FBF6EE'}}>{pendingCount}</span>}
              {id==='directory'&&guestCount>0&&<span className="text-xs px-1.5 py-0.5 rounded-full ml-1" style={{background:'rgba(251,246,238,0.2)'}}>{guestCount}</span>}
            </button>
          );})}
        </nav>
      </div>
    </header>
  );
}

function GuestSelector({guests,selectedGuest,onSelect,onClear}){
  const [search,setSearch]=useState('');
  const [focused,setFocused]=useState(false);
  const filtered=useMemo(()=>{const q=search.toLowerCase().trim();if(!q)return guests;return guests.filter(g=>`${g.firstName} ${g.lastName}`.toLowerCase().includes(q)||g.email.toLowerCase().includes(q)||g.phone.includes(q));},[guests,search]);
  if(guests.length===0) return null;
  const showList=focused||search.length>0;
  if(selectedGuest) return(
    <div className="rounded-2xl overflow-hidden mb-2" style={{border:'1.5px solid #5B8266',background:'#5B826608'}}>
      <div className="px-4 pt-3 pb-2 flex items-center gap-2"><BookUser size={14} style={{color:'#5B8266'}}/><span className="text-xs uppercase tracking-[0.2em] font-medium" style={{color:'#5B8266'}}>Returning Guest</span><span className="text-xs ml-auto" style={{color:'#5B8266',opacity:0.6}}>{guests.length} saved</span></div>
      <div className="px-4 pb-3">
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{background:'#5B826615',border:'1px solid #5B826640'}}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-semibold text-sm flex-shrink-0" style={{background:'#5B8266',color:'#FBF6EE'}}>{initials(selectedGuest)}</div>
          <div className="flex-1 min-w-0"><div className="font-semibold text-sm" style={{color:'#5B8266'}}>{fullName(selectedGuest)} <span className="text-xs font-normal opacity-70">· profile loaded</span></div><div className="text-xs mt-0.5 truncate" style={{color:'#2A2522',opacity:0.65}}>{[selectedGuest.email,selectedGuest.phone].filter(Boolean).join(' · ')}</div></div>
          <button onClick={onClear} className="text-xs px-3 py-1.5 rounded-full flex-shrink-0 hover:scale-105 transition-all" style={{color:'#5B8266',border:'1px solid #5B826660'}}>Change</button>
        </div>
      </div>
    </div>
  );
  return(
    <div className="rounded-2xl mb-2" style={{border:'1.5px solid #5B8266',background:'#5B826608'}}>
      <div className="px-4 pt-3 pb-2 flex items-center gap-2"><BookUser size={14} style={{color:'#5B8266'}}/><span className="text-xs uppercase tracking-[0.2em] font-medium" style={{color:'#5B8266'}}>Returning Guest?</span><span className="text-xs ml-auto" style={{color:'#5B8266',opacity:0.6}}>{guests.length} saved</span></div>
      <div className="px-4 pb-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'#5B8266',opacity:0.5}}/>
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
            placeholder={`Search ${guests.length} saved guest${guests.length!==1?'s':''}…`}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none font-body text-sm"
            style={{background:'#fff',border:'1.5px solid #5B826650'}}/>
        </div>
        {showList&&(
          <div className="mt-2 rounded-xl overflow-hidden" style={{border:'1px solid #E5D4B5',maxHeight:'200px',overflowY:'auto'}} onMouseDown={e=>e.preventDefault()}>
            {filtered.length===0
              ?<div className="p-3 text-sm text-center font-display italic" style={{opacity:0.5,background:'#fff'}}>No guests match "{search}"</div>
              :filtered.map(g=>(
                <div key={g.id} onClick={()=>{onSelect(g);setSearch('');setFocused(false);}} className="flex items-center gap-3 px-4 py-3 cursor-pointer border-b last:border-b-0" style={{borderColor:'#E5D4B5',background:'#fff'}} onMouseEnter={e=>e.currentTarget.style.background='#F7F2E8'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-display font-semibold text-sm flex-shrink-0" style={{background:'#5B826620',color:'#5B8266'}}>{initials(g)}</div>
                  <div className="flex-1 min-w-0"><div className="font-medium text-sm" style={{color:'#1B4965'}}>{fullName(g)}</div><div className="text-xs truncate" style={{color:'#2A2522',opacity:0.6}}>{[g.email,g.phone].filter(Boolean).join(' · ')}{g.visitCount>0?` · ${g.visitCount} visit${g.visitCount!==1?'s':''}`:''}{g.lastVisit?` · last ${shortDate(g.lastVisit)}`:''}</div></div>
                  <Check size={13} style={{color:'#5B8266',opacity:0.4,flexShrink:0}}/>
                </div>
              ))
            }
          </div>
        )}
        {!showList&&(
          <div className="mt-2 flex flex-wrap gap-1.5">
            {guests.slice(0,6).map(g=>(
              <button key={g.id} onClick={()=>onSelect(g)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105" style={{background:'#5B826618',color:'#5B8266',border:'1px solid #5B826630'}}>
                <span className="w-4 h-4 rounded-full flex items-center justify-center font-bold flex-shrink-0" style={{background:'#5B826635',fontSize:'9px'}}>{initials(g)}</span>
                {g.firstName}{g.lastName?` ${g.lastName[0]}.`:''}
              </button>
            ))}
            {guests.length>6&&<span className="text-xs py-1.5" style={{color:'#5B8266',opacity:0.6}}>+{guests.length-6} more</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function DirectoryToggle({on,onChange,label,sublabel}){
  return(
    <div className="dir-toggle" onClick={()=>onChange(!on)} style={{background:on?'#5B826612':'transparent',border:`1px solid ${on?'#5B826650':'#E5D4B5'}`}}>
      <div className="dir-track" style={{background:on?'#5B8266':'#C8BFB0'}}>
        <div className="dir-thumb" style={{transform:on?'translateX(18px)':'translateX(0)'}}/>
      </div>
      <div>
        <div className="text-sm font-medium" style={{color:on?'#5B8266':'#2A2522'}}>{label}</div>
        {sublabel&&<div className="text-xs mt-0.5" style={{color:'#2A2522',opacity:0.55}}>{sublabel}</div>}
      </div>
    </div>
  );
}

function HomeView({bookings,joinRequests,setView,setEditingBooking,onApprove,onDecline}){
  const today=fmtDate(new Date()),currentStay=bookings.find(b=>b.startDate<=today&&today<b.endDate),upcoming=bookings.filter(b=>b.startDate>today).slice(0,3),totalNights=bookings.reduce((s,b)=>s+nightsCount(b.startDate,b.endDate),0);
  return(
    <div className="pt-10 space-y-12 fade-up">
      {joinRequests.length>0&&<JoinRequestsPanel requests={joinRequests} bookings={bookings} onApprove={onApprove} onDecline={onDecline}/>}
      {currentStay&&(
        <section className="rounded-2xl p-6 sm:p-8 grain relative overflow-hidden" style={{background:currentStay.wholeHouse?'linear-gradient(135deg,#1B4965,#8B5A3C)':'linear-gradient(135deg,#E07856,#D69F3C)',color:'#FBF6EE'}}>
          <div className="absolute -top-8 -right-8 text-9xl opacity-20 float-slow">{currentStay.wholeHouse?'🏠':'🌅'}</div>
          <div className="text-xs uppercase tracking-[0.3em] opacity-80 mb-2">{currentStay.wholeHouse?'Whole house reserved':'Currently at the house'}</div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-1">{fullName(currentStay)}</h2>
          <p className="font-display italic text-lg opacity-95">through {prettyDate(currentStay.endDate)} · {currentStay.numGuests} guest{currentStay.numGuests!==1?'s':''}</p>
          {currentStay.wholeHouse&&<div className="mt-2 text-sm opacity-80 flex items-center gap-2"><Star size={14}/>All 7 rooms · Sleeps 20</div>}
        </section>
      )}
      <section>
        <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold" style={{color:'#1B4965'}}>What's next on the calendar</h2>
          {upcoming.length>0&&<button onClick={()=>setView('stays')} className="text-sm font-medium underline underline-offset-4" style={{color:'#C8553D'}}>See all →</button>}
        </div>
        {upcoming.length===0
          ?<div className="text-center py-12 rounded-2xl border-2 border-dashed" style={{borderColor:'#E5D4B5'}}><div className="text-5xl mb-3 float-slow inline-block">🐚</div><p className="font-display italic text-xl mb-4" style={{color:'#1B4965'}}>No stays on the books yet.</p><button onClick={()=>setView('book')} className="px-6 py-3 rounded-full font-medium" style={{background:'#1B4965',color:'#FBF6EE'}}>Be the first to book →</button></div>
          :<div className="grid gap-4 sm:grid-cols-3">{upcoming.map(b=><BookingCard key={b.id} booking={b} compact onClick={()=>{setEditingBooking(b);setView('book');}}/>)}</div>}
      </section>
      <section className="grid sm:grid-cols-3 gap-4">
        <StatCard value={bookings.length} label="Stays booked" icon="📖" color="#1B4965"/>
        <StatCard value={totalNights} label="Nights at the shore" icon="🌙" color="#5B8266"/>
        <StatCard value={joinRequests.length} label="Pending requests" icon="🤝" color="#D69F3C"/>
      </section>
      <section className="rounded-2xl p-6 sm:p-8 text-center" style={{background:'#1B4965',color:'#FBF6EE'}}><div className="font-display italic text-2xl sm:text-3xl mb-3 leading-snug">"We don't remember days, we remember moments."</div><div className="text-sm opacity-70">— and the ones at the beach house, especially.</div></section>
    </div>
  );
}

function JoinRequestsPanel({requests,bookings,onApprove,onDecline}){
  return(
    <section className="rounded-2xl overflow-hidden grain" style={{border:'2px solid #E07856'}}>
      <div className="px-6 py-4 flex items-center gap-3" style={{background:'#E07856',color:'#FBF6EE'}}><Bell size={18}/><div className="font-display text-xl font-semibold">{requests.length} Pending Join {requests.length===1?'Request':'Requests'}</div></div>
      <div>{requests.map(req=>(
        <div key={req.id} className="p-5 border-b last:border-b-0" style={{borderColor:'#E5D4B5',background:'#fff'}}>
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1"><UserPlus size={16} style={{color:'#E07856'}}/><span className="font-display text-xl font-semibold" style={{color:'#1B4965'}}>{fullName(req)}</span><span className="text-xs px-2 py-0.5 rounded-full" style={{background:'#FBF6EE60',border:'1px solid #E5D4B5'}}>{req.numGuests} guest{req.numGuests!==1?'s':''}</span><span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{background:'#D69F3C20',color:'#D69F3C',fontWeight:600}}><Clock size={10}/>Pending</span></div>
              <div className="font-display italic mb-2" style={{color:'#C8553D'}}>{shortDate(req.startDate)} → {shortDate(req.endDate)}<span className="text-xs not-italic ml-2" style={{color:'#2A2522',opacity:0.5}}>{nightsCount(req.startDate,req.endDate)} nights</span></div>
              {(req.email||req.phone)&&<div className="flex items-center gap-3 text-xs mb-2" style={{color:'#1B4965',opacity:0.7}}>{req.email&&<span className="flex items-center gap-1"><Mail size={11}/>{req.email}</span>}{req.phone&&<span className="flex items-center gap-1"><Phone size={11}/>{req.phone}</span>}</div>}
              <div className="flex flex-wrap gap-1.5 mb-2">{(req.rooms||[]).map(rid=>ROOMS.find(r=>r.id===rid)).filter(Boolean).map(r=><span key={r.id} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{background:`${r.color}15`,color:r.color}}>{r.icon} {r.name}</span>)}</div>
              {(()=>{const t=bookings.find(b=>b.id===req.targetBookingId);return t?<div className="text-xs mb-1" style={{color:'#1B4965',opacity:0.7}}>Wants to join <strong>{fullName(t)}</strong>'s stay ({shortDate(t.startDate)}–{shortDate(t.endDate)})</div>:null;})()}
              {req.joinMessage&&<div className="text-sm italic font-display mt-1" style={{color:'#2A2522',opacity:0.7}}><MessageCircle size={12} className="inline mr-1.5 -mt-0.5"/>"{req.joinMessage}"</div>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={()=>onApprove(req.id)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-full font-medium text-sm transition-all hover:scale-105" style={{background:'#5B8266',color:'#FBF6EE',boxShadow:'0 4px 12px rgba(91,130,102,0.3)'}}><ThumbsUp size={14}/>Welcome!</button>
              <button onClick={()=>onDecline(req.id)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-full font-medium text-sm transition-all hover:scale-105" style={{background:'#fff',color:'#C8553D',border:'1.5px solid #C8553D'}}><ThumbsDown size={14}/>Decline</button>
            </div>
          </div>
        </div>
      ))}</div>
    </section>
  );
}

function StatCard({value,label,icon,color}){return <div className="rounded-2xl p-5 grain" style={{background:'#fff',border:`1px solid ${color}20`}}><div className="text-3xl mb-2">{icon}</div><div className="font-display text-4xl font-bold" style={{color}}>{value}</div><div className="text-sm mt-1" style={{color:'#2A2522',opacity:0.7}}>{label}</div></div>;}

function BookingCard({booking,compact,onClick}){
  const rooms=(booking.rooms||[]).map(rid=>ROOMS.find(r=>r.id===rid)).filter(Boolean),nights=nightsCount(booking.startDate,booking.endDate);
  return(
    <div onClick={onClick} className="rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-1 grain relative overflow-hidden" style={{background:booking.wholeHouse?'linear-gradient(135deg,#1B4965,#2C5F73)':'#fff',color:booking.wholeHouse?'#FBF6EE':'#2A2522',border:booking.wholeHouse?'none':`1px solid ${rooms[0]?.color||'#E5D4B5'}30`,boxShadow:'0 2px 8px rgba(27,73,101,0.06)'}}>
      {booking.wholeHouse&&<div className="absolute -top-4 -right-4 text-7xl opacity-15">🏠</div>}
      <div className="flex items-start justify-between gap-2 mb-3"><div><div className="font-display text-xl font-semibold">{fullName(booking)}</div><div className="text-xs mt-0.5" style={{opacity:0.6}}>{booking.numGuests} guest{booking.numGuests!==1?'s':''}</div></div><div className="text-2xl">{booking.wholeHouse?'🏠':rooms[0]?.icon||'🏖️'}</div></div>
      <div className="font-display italic text-base mb-3" style={{color:booking.wholeHouse?'#FFD580':'#C8553D'}}>{shortDate(booking.startDate)} → {shortDate(booking.endDate)}<span className="text-xs not-italic ml-2" style={{opacity:0.5}}>{nights} night{nights!==1?'s':''}</span></div>
      {booking.wholeHouse?<span className="text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 w-fit" style={{background:'rgba(251,246,238,0.2)',color:'#FFD580'}}><Star size={10}/>Full House · All 7 Rooms</span>:<div className="flex flex-wrap gap-1.5">{rooms.map(r=><span key={r.id} className="text-xs px-2 py-1 rounded-full" style={{background:`${r.color}15`,color:r.color,fontWeight:500}}>{r.name}</span>)}</div>}
    </div>
  );
}

function WholeHousePicker({wholeHouse,setWholeHouse,conflictedRooms,datesValid,codeUnlocked,onSubmitCode}){
  const [expanded,setExpanded]=useState(false);const [localCode,setLocalCode]=useState('');const [localErr,setLocalErr]=useState(null);
  const handleCode=()=>{if(localCode===WHOLE_HOUSE_CODE){onSubmitCode();setExpanded(false);setLocalCode('');setLocalErr(null);}else{setLocalErr("That's not the house code.");}};
  if(!wholeHouse) return(
    <button onClick={()=>{if(!datesValid)return;setWholeHouse(true);}} disabled={!datesValid} className="w-full text-left rounded-2xl p-5 grain mb-1 transition-all hover:scale-[1.01] relative overflow-hidden" style={{background:'linear-gradient(135deg,#1B4965,#1F3A4E)',color:'#FBF6EE',opacity:datesValid?1:0.5,cursor:datesValid?'pointer':'not-allowed'}}>
      <div className="absolute -top-6 -right-6 text-8xl opacity-10">🏠</div>
      <div className="flex items-center justify-between gap-4"><div><div className="text-xs uppercase tracking-[0.3em] opacity-70 mb-1 flex items-center gap-2"><Star size={11}/>Premium option</div><div className="font-display text-2xl font-semibold">Reserve the Whole House</div><div className="font-display italic text-sm mt-1 opacity-80">All 7 rooms · Sleeps {MAX_CAPACITY} · No splitting needed.</div></div><div className="text-5xl float-slow flex-shrink-0">🏠</div></div>
      {!datesValid&&<div className="text-xs mt-3 opacity-60">← Pick your dates first</div>}
    </button>
  );
  return(
    <div className="rounded-2xl overflow-hidden mb-1 grain" style={{border:'2px solid #F5C842'}}>
      <div className="p-5 relative overflow-hidden" style={{background:'linear-gradient(135deg,#1B4965,#2C3E2E)',color:'#FBF6EE'}}>
        <div className="absolute -top-6 -right-6 text-8xl opacity-15">🏠</div>
        <div className="flex items-start justify-between gap-3"><div className="flex-1"><div className="text-xs uppercase tracking-[0.3em] mb-1 flex items-center gap-2" style={{color:'#F5C842',opacity:0.9}}><Star size={11}/>Whole house</div><div className="font-display text-2xl font-semibold shimmer-text">The Whole House is Yours</div><div className="font-display italic text-sm mt-1 opacity-80">All 7 rooms · Sleeps {MAX_CAPACITY}</div></div><button onClick={()=>setWholeHouse(false)} className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 hover:scale-110 transition-all" style={{background:'rgba(251,246,238,0.15)'}}><X size={14}/></button></div>
        {conflictedRooms.length>0&&<div className="mt-3 p-3 rounded-xl text-xs" style={{background:'rgba(200,85,61,0.25)',color:'#FFBBAA'}}>⚠ {conflictedRooms.map(r=>r.name).join(', ')} {conflictedRooms.length===1?'is':'are'} already booked.</div>}
        {!conflictedRooms.length&&!codeUnlocked&&(!expanded?<button onClick={()=>setExpanded(true)} className="mt-3 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold hover:scale-105 transition-all" style={{background:'rgba(245,200,66,0.2)',color:'#F5C842',border:'1px solid rgba(245,200,66,0.4)'}}><KeyRound size={14}/>Enter house code to confirm</button>:(
          <div className="mt-3"><div className="text-xs opacity-70 mb-2">Enter the 4-digit house code:</div>
            <div className="flex gap-2"><input autoFocus type="text" inputMode="numeric" maxLength={4} value={localCode} onChange={e=>{setLocalCode(e.target.value.replace(/[^0-9]/g,'').slice(0,4));setLocalErr(null);}} onKeyDown={e=>e.key==='Enter'&&handleCode()} placeholder="• • • •" className="flex-1 px-4 py-2.5 rounded-xl outline-none font-mono text-xl text-center" style={{background:'rgba(251,246,238,0.1)',border:'1.5px solid rgba(245,200,66,0.5)',color:'#FBF6EE',letterSpacing:'0.5em',fontWeight:600}}/><button onClick={handleCode} disabled={localCode.length!==4} className="px-4 py-2.5 rounded-xl font-semibold text-sm hover:scale-105 transition-all disabled:opacity-40" style={{background:'#F5C842',color:'#1B4965'}}>Unlock</button><button onClick={()=>{setExpanded(false);setLocalCode('');setLocalErr(null);}} className="px-3 py-2.5 rounded-xl text-sm" style={{opacity:0.6}}>✕</button></div>
            {localErr&&<div className="text-xs mt-2" style={{color:'#FFBBAA'}}>{localErr}</div>}
          </div>
        ))}
        {!conflictedRooms.length&&codeUnlocked&&<div className="mt-3 flex items-center gap-2 text-sm" style={{color:'#A8E6CF'}}><Check size={15}/>House code verified — all rooms included</div>}
      </div>
      <div className="px-4 py-3 flex flex-wrap gap-2" style={{background:'#1B496520'}}>{ROOMS.map(r=><span key={r.id} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{background:`${r.color}25`,color:r.color}}>{r.icon} {r.name}</span>)}</div>
    </div>
  );
}

function BookingForm({bookings,guests,editingBooking,onSave,onSaveJoinRequest,onSaveGuest,onCancel}){
  const [firstName,setFirstName]=useState(editingBooking?.firstName||'');
  const [lastName,setLastName]=useState(editingBooking?.lastName||'');
  const [email,setEmail]=useState(editingBooking?.email||'');
  const [phone,setPhone]=useState(editingBooking?.phone||'');
  const [numGuests,setNumGuests]=useState(editingBooking?.numGuests||2);
  const [startDate,setStartDate]=useState(editingBooking?.startDate||fmtDate(new Date()));
  const [endDate,setEndDate]=useState(editingBooking?.endDate||fmtDate(new Date(Date.now()+86400000*3)));
  const [selectedRooms,setSelectedRooms]=useState(editingBooking?.rooms||[]);
  const [notes,setNotes]=useState(editingBooking?.notes||'');
  const [joinTargetId,setJoinTargetId]=useState(null);
  const [joinMessage,setJoinMessage]=useState('');
  const [wholeHouse,setWholeHouseRaw]=useState(editingBooking?.wholeHouse||false);
  const [wholeHouseUnlocked,setWholeHouseUnlocked]=useState(editingBooking?.wholeHouse||false);
  const [showConfirm,setShowConfirm]=useState(false);
  const [error,setError]=useState(null);
  const [unlockedRooms,setUnlockedRooms]=useState(()=>new Set((editingBooking?.rooms||[]).filter(rid=>ROOMS.find(r=>r.id===rid)?.private)));
  const [codeEntryFor,setCodeEntryFor]=useState(null);
  const [codeInput,setCodeInput]=useState('');
  const [codeError,setCodeError]=useState(null);
  const [selectedGuest,setSelectedGuest]=useState(()=>editingBooking&&editingBooking.email?guests.find(g=>g.email===editingBooking.email&&g.firstName===editingBooking.firstName)||null:null);
  const [saveToDirectory,setSaveToDirectory]=useState(false);

  const setWholeHouse=val=>{setWholeHouseRaw(val);if(!val)setWholeHouseUnlocked(false);};
  useEffect(()=>{if(wholeHouse){setSelectedRooms(ROOMS.map(r=>r.id));setUnlockedRooms(new Set(ROOMS.filter(r=>r.private).map(r=>r.id)));}else if(!editingBooking?.wholeHouse){setSelectedRooms(editingBooking?.rooms||[]);}},[wholeHouse]);

  const nights=nightsCount(startDate,endDate),datesValid=nights>0;
  const overlappingBookings=useMemo(()=>bookings.filter(b=>b.id!==editingBooking?.id&&datesValid&&overlaps(startDate,endDate,b.startDate,b.endDate)),[bookings,startDate,endDate,datesValid,editingBooking]);
  useEffect(()=>{if(joinTargetId&&!overlappingBookings.find(b=>b.id===joinTargetId))setJoinTargetId(null);},[overlappingBookings,joinTargetId]);
  const wholeHouseConflicts=useMemo(()=>ROOMS.filter(room=>bookings.some(b=>b.id!==editingBooking?.id&&b.rooms.includes(room.id)&&datesValid&&overlaps(startDate,endDate,b.startDate,b.endDate))),[startDate,endDate,bookings,editingBooking,datesValid]);
  const roomAvailability=useMemo(()=>{const a={};for(const room of ROOMS){const c=bookings.find(b=>b.id!==editingBooking?.id&&b.rooms.includes(room.id)&&overlaps(startDate,endDate,b.startDate,b.endDate));a[room.id]={available:!c,conflictWith:c};}return a;},[startDate,endDate,bookings,editingBooking]);
  const totalCapacity=selectedRooms.reduce((s,rid)=>s+(ROOMS.find(x=>x.id===rid)?.capacity||0),0);
  const isJoinMode=!!joinTargetId;
  const guestName=`${firstName} ${lastName}`.trim()||'Guest';
  const profileChanged=selectedGuest&&(selectedGuest.firstName!==firstName.trim()||selectedGuest.lastName!==lastName.trim()||selectedGuest.email!==email.trim()||selectedGuest.phone!==phone.trim());

  const selectGuest=g=>{setSelectedGuest(g);setFirstName(g.firstName);setLastName(g.lastName);setEmail(g.email);setPhone(g.phone);setSaveToDirectory(false);};
  const clearGuest=()=>{setSelectedGuest(null);setSaveToDirectory(false);};

  const toggleRoom=rid=>{if(wholeHouse)return;if(!roomAvailability[rid].available)return;const room=ROOMS.find(r=>r.id===rid);if(room.private&&!unlockedRooms.has(rid)){setCodeEntryFor(rid);setCodeInput('');setCodeError(null);return;}setSelectedRooms(prev=>prev.includes(rid)?prev.filter(r=>r!==rid):[...prev,rid]);};
  const submitCode=()=>{const room=ROOMS.find(r=>r.id===codeEntryFor);if(codeInput===room.code){setUnlockedRooms(prev=>new Set(prev).add(room.id));setSelectedRooms(prev=>prev.includes(room.id)?prev:[...prev,room.id]);setCodeEntryFor(null);setCodeInput('');setCodeError(null);}else{setCodeError("Code doesn't match.");}};

  const handleSubmit=()=>{
    setError(null);
    if(!firstName.trim()){setError("First name is required.");return;}
    if(!datesValid){setError('Check-out must be after check-in.');return;}
    if(wholeHouse&&wholeHouseConflicts.length>0){setError(`Can't reserve the whole house — ${wholeHouseConflicts.length} room(s) already booked.`);return;}
    if(wholeHouse&&!wholeHouseUnlocked){setError('Enter the house code to confirm.');return;}
    if(!wholeHouse&&selectedRooms.length===0&&!joinTargetId){setError('Pick at least one room, or request to join a stay.');return;}
    if(!wholeHouse&&selectedRooms.length>0&&numGuests>totalCapacity){setError(`Rooms sleep ${totalCapacity} max.`);return;}
    setShowConfirm(true);
  };
  const confirmBooking=()=>{
    const target=bookings.find(b=>b.id===joinTargetId);
    const baseData={firstName:firstName.trim(),lastName:lastName.trim(),guestName,email:email.trim(),phone:phone.trim(),numGuests,startDate,endDate,rooms:selectedRooms,notes:notes.trim()};
    if(saveToDirectory){
      onSaveGuest({id:selectedGuest?.id||`g_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,firstName:firstName.trim(),lastName:lastName.trim(),email:email.trim(),phone:phone.trim(),lastVisit:startDate,visitCount:(selectedGuest?.visitCount||0)+1,createdAt:selectedGuest?.createdAt||Date.now()});
    }
    if(joinTargetId&&target){onSaveJoinRequest({id:`jr_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,...baseData,joinMessage:joinMessage.trim(),targetBookingId:joinTargetId,targetGuestName:fullName(target),status:'pending',createdAt:Date.now()});}
    else{onSave({id:editingBooking?.id||`b_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,...baseData,wholeHouse:wholeHouse||false,createdAt:editingBooking?.createdAt||Date.now()});}
  };

  const toggleLabel=selectedGuest
    ?(profileChanged?`Update ${firstName}'s profile`:`${firstName} is already saved`)
    :`Remember ${firstName||'this guest'} for future visits`;
  const toggleSublabel=selectedGuest
    ?(profileChanged?'New contact info will be saved to the directory':'No changes detected — profile is current')
    :'Saves name, email & phone to the guest directory';
  const toggleDisabled=selectedGuest&&!profileChanged;

  return(
    <div className="pt-10 fade-up">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div><div className="text-xs uppercase tracking-[0.25em] mb-1" style={{color:'#C8553D'}}>{editingBooking?'Editing stay':'Plan a visit'}</div><h2 className="font-display text-3xl sm:text-4xl font-semibold" style={{color:'#1B4965'}}>{editingBooking?'Update your stay':'When are you coming?'}</h2></div>
        <button onClick={onCancel} className="text-sm font-medium underline underline-offset-4" style={{color:'#2A2522',opacity:0.6}}>← Back</button>
      </div>
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8">
        <div className="space-y-5">
          <GuestSelector guests={guests} selectedGuest={selectedGuest} onSelect={selectGuest} onClear={clearGuest}/>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name *"><input type="text" value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="Margo" className="w-full px-4 py-3 rounded-xl outline-none font-body text-base" style={{background:'#fff',border:'1.5px solid #E5D4B5'}}/></Field>
            <Field label="Last Name"><input type="text" value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Sullivan" className="w-full px-4 py-3 rounded-xl outline-none font-body text-base" style={{background:'#fff',border:'1.5px solid #E5D4B5'}}/></Field>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{background:'#fff',border:'1px solid #E5D4B5'}}>
            <div className="px-4 pt-4 pb-3 space-y-3">
              <div className="text-xs uppercase tracking-[0.2em] flex items-center gap-2" style={{color:'#1B4965',opacity:0.6}}><Users size={12}/>Contact Information</div>
              <Field label="Email Address"><div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'#1B4965',opacity:0.4}}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="margo@family.com" className="w-full pl-9 pr-4 py-3 rounded-xl outline-none font-body text-base" style={{background:'#FBF6EE',border:'1.5px solid #E5D4B5'}}/></div></Field>
              <Field label="Phone Number"><div className="relative"><Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'#1B4965',opacity:0.4}}/><input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="(555) 867-5309" className="w-full pl-9 pr-4 py-3 rounded-xl outline-none font-body text-base" style={{background:'#FBF6EE',border:'1.5px solid #E5D4B5'}}/></div></Field>
            </div>
            <div className="border-t" style={{borderColor:'#E5D4B5'}}>
              <DirectoryToggle on={saveToDirectory} onChange={val=>{if(!toggleDisabled)setSaveToDirectory(val);}} label={toggleLabel} sublabel={toggleSublabel}/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Check in"><input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="w-full px-4 py-3 rounded-xl outline-none font-body text-base" style={{background:'#fff',border:'1.5px solid #E5D4B5'}}/></Field>
            <Field label="Check out"><input type="date" value={endDate} min={startDate} onChange={e=>setEndDate(e.target.value)} className="w-full px-4 py-3 rounded-xl outline-none font-body text-base" style={{background:'#fff',border:'1.5px solid #E5D4B5'}}/></Field>
          </div>
          {datesValid&&<div className="text-sm font-display italic" style={{color:'#C8553D'}}>{nights} night{nights!==1?'s':''} at the shore.</div>}
          {!wholeHouse&&overlappingBookings.length>0&&(
            <div className="rounded-2xl overflow-hidden" style={{border:'1.5px solid #E07856'}}>
              <div className="px-4 py-3 flex items-center gap-2" style={{background:'#E0785610',borderBottom:'1px solid #E07856'}}><Users size={16} style={{color:'#E07856'}}/><span className="text-sm font-semibold" style={{color:'#C8553D'}}>These stays overlap — want to join?</span></div>
              <div>{overlappingBookings.map(b=>{const isT=joinTargetId===b.id;return(
                <div key={b.id} className="p-4 border-b last:border-b-0" style={{borderColor:'#E5D4B5',background:isT?'#E0785608':'#fff'}}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1"><div className="font-display text-base font-semibold mb-0.5" style={{color:'#1B4965'}}>{fullName(b)}</div><div className="text-xs font-display italic mb-2" style={{color:'#C8553D'}}>{shortDate(b.startDate)} → {shortDate(b.endDate)}</div><div className="flex flex-wrap gap-1">{(b.rooms||[]).map(rid=>ROOMS.find(r=>r.id===rid)).filter(Boolean).map(r=><span key={r.id} className="text-xs px-2 py-0.5 rounded-full" style={{background:`${r.color}15`,color:r.color}}>{r.icon} {r.name}</span>)}</div></div>
                    <button onClick={()=>setJoinTargetId(isT?null:b.id)} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 flex-shrink-0" style={{background:isT?'#E07856':'#fff',color:isT?'#FBF6EE':'#E07856',border:'1.5px solid #E07856'}}>{isT?<><Check size={14}/>Requesting</>:<><UserPlus size={14}/>Request to Join</>}</button>
                  </div>
                </div>
              );})}
              </div>
              {isJoinMode&&<div className="px-4 pb-4 pt-3" style={{background:'#E0785608',borderTop:'1px solid #E07856'}}><div className="text-xs uppercase tracking-wider mb-2" style={{color:'#C8553D'}}>Note to {fullName(bookings.find(b=>b.id===joinTargetId)||{})} (optional)</div><textarea value={joinMessage} onChange={e=>setJoinMessage(e.target.value)} placeholder="We'll bring the s'mores!" rows={2} className="w-full px-3 py-2 rounded-xl outline-none resize-none font-body text-sm" style={{background:'#fff',border:'1.5px solid #E07856'}}/><div className="text-xs mt-2 font-display italic" style={{color:'#C8553D',opacity:0.8}}>✦ Pending their approval.</div></div>}
            </div>
          )}
          <Field label="How many of you?">
            <div className="flex items-center gap-3">
              <button onClick={()=>setNumGuests(Math.max(1,numGuests-1))} className="w-10 h-10 rounded-full font-medium transition-all hover:scale-110" style={{background:'#1B4965',color:'#FBF6EE'}}>−</button>
              <div className="flex-1 text-center"><div className="font-display text-3xl font-bold" style={{color:'#1B4965'}}>{numGuests}</div><div className="text-xs" style={{opacity:0.6}}>{numGuests===1?'guest':'guests'} · house sleeps {MAX_CAPACITY}</div></div>
              <button onClick={()=>setNumGuests(Math.min(MAX_CAPACITY,numGuests+1))} className="w-10 h-10 rounded-full font-medium transition-all hover:scale-110" style={{background:'#1B4965',color:'#FBF6EE'}}>+</button>
            </div>
          </Field>
          <Field label="A note to the family (optional)"><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Bringing the dog, can't wait to see everyone..." rows={3} className="w-full px-4 py-3 rounded-xl outline-none resize-none font-body text-base" style={{background:'#fff',border:'1.5px solid #E5D4B5'}}/></Field>
        </div>
        <div>
          {!isJoinMode&&<div className="mb-5"><WholeHousePicker wholeHouse={wholeHouse} setWholeHouse={setWholeHouse} conflictedRooms={wholeHouseConflicts} datesValid={datesValid} codeUnlocked={wholeHouseUnlocked} onSubmitCode={()=>setWholeHouseUnlocked(true)}/></div>}
          {!wholeHouse&&(
            <>
              <div className="flex items-baseline justify-between mb-4"><div className="text-xs uppercase tracking-[0.25em]" style={{color:'#C8553D'}}>{isJoinMode?'Pick rooms (optional)':'Or pick individual rooms'}</div><div className="text-sm font-display italic" style={{color:'#1B4965'}}>sleeps {totalCapacity} / {numGuests} needed</div></div>
              <div className="space-y-3">
                {ROOMS.map(room=>{
                  const avail=roomAvailability[room.id],sel=selectedRooms.includes(room.id),locked=room.private&&!unlockedRooms.has(room.id),entering=codeEntryFor===room.id;
                  if(entering) return(
                    <div key={room.id} className="p-4 rounded-2xl grain" style={{background:'#fff',border:`2px solid ${room.color}`}}>
                      <div className="flex items-center gap-2 mb-3"><KeyRound size={18} style={{color:room.color}}/><span className="font-display text-lg font-semibold" style={{color:room.color}}>Code for {room.name}</span></div>
                      <div className="flex flex-col sm:flex-row gap-2"><input autoFocus type="text" inputMode="numeric" maxLength={4} value={codeInput} onChange={e=>{setCodeInput(e.target.value.replace(/[^0-9]/g,'').slice(0,4));setCodeError(null);}} onKeyDown={e=>e.key==='Enter'&&submitCode()} placeholder="• • • •" className="flex-1 px-4 py-3 rounded-xl outline-none font-mono text-2xl text-center" style={{background:'#FBF6EE',border:'1.5px solid #E5D4B5',letterSpacing:'0.5em',fontWeight:600}}/><button onClick={submitCode} disabled={codeInput.length!==4} className="px-5 py-3 rounded-xl font-medium hover:scale-105 transition-all disabled:opacity-40" style={{background:room.color,color:'#FBF6EE'}}>Unlock</button><button onClick={()=>{setCodeEntryFor(null);setCodeInput('');setCodeError(null);}} className="px-4 py-3 rounded-xl font-medium" style={{opacity:0.6}}>Cancel</button></div>
                      {codeError&&<div className="text-xs mt-2 font-medium" style={{color:'#C8553D'}}>{codeError}</div>}
                    </div>
                  );
                  return(
                    <button key={room.id} onClick={()=>toggleRoom(room.id)} disabled={!avail.available} className="w-full text-left p-4 rounded-2xl transition-all relative overflow-hidden grain" style={{background:sel?room.color:'#fff',color:sel?'#FBF6EE':'#2A2522',border:`2px solid ${sel?room.color:avail.available?`${room.color}30`:'#E5D4B5'}`,opacity:avail.available?1:0.5,cursor:avail.available?'pointer':'not-allowed'}}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap"><span className="text-xl">{room.icon}</span><span className="font-display text-lg font-semibold leading-tight">{room.name}</span>{room.private&&<span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1" style={{background:sel?'rgba(251,246,238,0.2)':`${room.color}15`,color:sel?'#FBF6EE':room.color,fontWeight:600}}>{locked?<Lock size={9}/>:<Check size={9}/>}private</span>}</div>
                          <div className="text-xs uppercase tracking-wider" style={{opacity:sel?0.85:0.6}}>{room.subtitle} · sleeps {room.capacity}</div>
                          <div className="text-sm mt-2 font-display italic" style={{opacity:sel?0.95:0.75}}>{room.description}</div>
                          {!avail.available&&<div className="text-xs mt-2 font-medium" style={{color:'#C8553D'}}>Taken by {fullName(avail.conflictWith)} ({shortDate(avail.conflictWith.startDate)}–{shortDate(avail.conflictWith.endDate)})</div>}
                          {locked&&avail.available&&<div className="text-xs mt-2 font-medium flex items-center gap-1" style={{color:room.color}}><KeyRound size={11}/>Tap to enter room code</div>}
                        </div>
                        <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{background:sel?'#FBF6EE':'transparent',border:sel?'none':`1.5px solid ${room.color}50`}}>{sel?<Check size={14} style={{color:room.color}} strokeWidth={3}/>:locked?<Lock size={12} style={{color:room.color,opacity:0.6}}/>:null}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      {error&&<div className="mt-6 p-4 rounded-xl flex items-center gap-2" style={{background:'#C8553D15',color:'#C8553D'}}><X size={16}/>{error}</div>}
      <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
        <button onClick={onCancel} className="px-5 py-3 rounded-full font-medium" style={{color:'#2A2522',opacity:0.7}}>Cancel</button>
        <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all hover:scale-105" style={{background:isJoinMode?'#E07856':wholeHouse?'linear-gradient(135deg,#1B4965,#2C3E2E)':'#1B4965',color:'#FBF6EE',boxShadow:'0 4px 14px rgba(27,73,101,0.3)'}}>
          {isJoinMode?<><UserPlus size={16}/>Review join request</>:wholeHouse?<><Star size={16}/>Reserve the whole house</>:<><Sparkles size={16}/>Review &amp; confirm</>}
        </button>
      </div>
      {showConfirm&&<ConfirmModal booking={{firstName,lastName,guestName,email,phone,numGuests,startDate,endDate,rooms:selectedRooms,notes,nights,wholeHouse}} joinTarget={joinTargetId?bookings.find(b=>b.id===joinTargetId):null} joinMessage={joinMessage} saveToDirectory={saveToDirectory} selectedGuest={selectedGuest} editing={!!editingBooking} onConfirm={confirmBooking} onCancel={()=>setShowConfirm(false)}/>}
    </div>
  );
}

function Field({label,children}){return <div><label className="block text-xs uppercase tracking-[0.2em] mb-2" style={{color:'#1B4965',opacity:0.7}}>{label}</label>{children}</div>;}

function ConfirmModal({booking,joinTarget,joinMessage,saveToDirectory,selectedGuest,editing,onConfirm,onCancel}){
  const rooms=(booking.rooms||[]).map(rid=>ROOMS.find(r=>r.id===rid)).filter(Boolean),isWH=booking.wholeHouse,name=booking.guestName||`${booking.firstName} ${booking.lastName}`.trim();
  return(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(27,73,101,0.5)',backdropFilter:'blur(8px)'}}>
      <div className="rounded-3xl max-w-md w-full p-7 fade-up grain" style={{background:'#FBF6EE',border:`2px solid ${isWH?'#F5C842':'#E5D4B5'}`,maxHeight:'90vh',overflowY:'auto'}}>
        {isWH?(
          <div className="rounded-2xl p-5 mb-6 text-center grain relative overflow-hidden" style={{background:'linear-gradient(135deg,#1B4965,#2C3E2E)',color:'#FBF6EE'}}><div className="absolute -top-4 -right-4 text-8xl opacity-10">🏠</div><div className="text-4xl mb-2 float-slow inline-block">🏠</div><div className="text-xs uppercase tracking-[0.3em] mb-1" style={{color:'#F5C842'}}>Full House Reserved</div><div className="font-display text-2xl font-semibold shimmer-text">{name}</div></div>
        ):(
          <div className="text-center mb-6"><div className="text-5xl mb-3 float-slow inline-block">{joinTarget?'🤝':'🏖️'}</div><div className="text-xs uppercase tracking-[0.3em] mb-2" style={{color:'#C8553D'}}>{joinTarget?'Sending join request':'Looks good?'}</div><h3 className="font-display text-3xl font-semibold" style={{color:'#1B4965'}}>{name}{joinTarget?'':'\'s stay'}</h3>{joinTarget&&<p className="text-sm mt-2 font-display italic" style={{color:'#E07856'}}>Asking to join {fullName(joinTarget)}'s stay</p>}</div>
        )}
        <div className="space-y-3 mb-6 text-sm">
          <Row label="Name" value={name}/>
          {booking.email&&<Row label="Email" value={<span className="flex items-center gap-1"><Mail size={11}/>{booking.email}</span>}/>}
          {booking.phone&&<Row label="Phone" value={<span className="flex items-center gap-1"><Phone size={11}/>{booking.phone}</span>}/>}
          <Row label="Arriving" value={prettyDate(booking.startDate)}/><Row label="Departing" value={prettyDate(booking.endDate)}/><Row label="Nights" value={booking.nights}/><Row label="Guests" value={booking.numGuests}/>
          {isWH?<Row label="Rooms" value={<span className="font-semibold flex items-center gap-1.5" style={{color:'#1B4965'}}><Star size={12}/>All 7 Rooms</span>}/>:rooms.length>0?<Row label="Rooms" value={<div className="flex flex-wrap gap-1 justify-end">{rooms.map(r=><span key={r.id} className="text-xs px-2 py-1 rounded-full" style={{background:r.color,color:'#FBF6EE',fontWeight:500}}>{r.icon} {r.name}</span>)}</div>}/>:null}
          {joinTarget&&<Row label="Joining" value={<span style={{color:'#E07856',fontWeight:600}}>{fullName(joinTarget)}</span>}/>}
          {(joinMessage||booking.notes)&&<div className="pt-3 mt-3 border-t" style={{borderColor:'#E5D4B5'}}><div className="text-xs uppercase tracking-wider mb-1" style={{opacity:0.6}}>{joinMessage?'Message':'Note'}</div><div className="font-display italic" style={{color:'#2A2522'}}>"{joinMessage||booking.notes}"</div></div>}
        </div>
        {saveToDirectory&&<div className="mb-4 p-3 rounded-xl flex items-center gap-2 text-xs" style={{background:'#5B826612',border:'1px solid #5B826640',color:'#5B8266'}}><BookUser size={14}/>{selectedGuest?`${booking.firstName}'s profile will be updated in the guest directory.`:`${booking.firstName} will be saved to the guest directory.`}</div>}
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-5 py-3 rounded-full font-medium" style={{background:'#fff',border:'1.5px solid #E5D4B5',color:'#2A2522'}}>Go back</button>
          <button onClick={onConfirm} className="flex-1 px-5 py-3 rounded-full font-medium transition-all hover:scale-105" style={{background:isWH?'linear-gradient(135deg,#1B4965,#2C3E2E)':'#E07856',color:'#FBF6EE',boxShadow:'0 4px 14px rgba(224,120,86,0.4)'}}><Check size={16} className="inline mr-1"/>{joinTarget?'Send Request':'Confirm'}</button>
        </div>
      </div>
    </div>
  );
}
function Row({label,value}){return <div className="flex items-center justify-between gap-3"><span className="text-xs uppercase tracking-wider" style={{opacity:0.6}}>{label}</span><span className="font-display font-medium text-right" style={{color:'#1B4965'}}>{value}</span></div>;}

function CalendarView({bookings}){
  const [calMode,setCalMode]=useState('month');
  return(
    <div className="pt-10 fade-up">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div><div className="text-xs uppercase tracking-[0.25em] mb-1" style={{color:'#C8553D'}}>Availability</div><h2 className="font-display text-3xl sm:text-4xl font-semibold" style={{color:'#1B4965'}}>Calendar</h2></div>
        <div className="flex p-1 rounded-full" style={{background:'#fff',border:'1px solid #E5D4B5'}}>
          <button onClick={()=>setCalMode('month')} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all" style={{background:calMode==='month'?'#1B4965':'transparent',color:calMode==='month'?'#FBF6EE':'#1B4965'}}><LayoutGrid size={15}/>Month</button>
          <button onClick={()=>setCalMode('timeline')} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all" style={{background:calMode==='timeline'?'#1B4965':'transparent',color:calMode==='timeline'?'#FBF6EE':'#1B4965'}}><AlignLeft size={15}/>Timeline</button>
        </div>
      </div>
      {calMode==='month'?<MonthGrid bookings={bookings}/>:<TimelineGrid bookings={bookings}/>}
    </div>
  );
}

function MonthGrid({bookings}){
  const [monthOffset,setMonthOffset]=useState(0);const [selectedDay,setSelectedDay]=useState(null);
  const {year,month,monthLabel,calDays}=useMemo(()=>{const d=new Date();d.setDate(1);d.setMonth(d.getMonth()+monthOffset);const y=d.getFullYear(),m=d.getMonth(),fdow=new Date(y,m,1).getDay(),dim=new Date(y,m+1,0).getDate(),pdim=new Date(y,m,0).getDate();const days=[];for(let i=fdow-1;i>=0;i--)days.push({day:pdim-i,month:m===0?11:m-1,year:m===0?y-1:y,other:true});for(let i=1;i<=dim;i++)days.push({day:i,month:m,year:y,other:false});while(days.length<42){const n=days.length-fdow-dim+1;days.push({day:n,month:m===11?0:m+1,year:m===11?y+1:y,other:true});}return{year:y,month:m,monthLabel:d.toLocaleDateString('en-US',{month:'long',year:'numeric'}),calDays:days};},[monthOffset]);
  const todayStr=fmtDate(new Date()),getDayBks=ds=>bookings.filter(b=>b.startDate<=ds&&ds<b.endDate),selBks=selectedDay?getDayBks(selectedDay):[];
  return(
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={()=>setMonthOffset(o=>o-1)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{background:'#fff',border:'1.5px solid #E5D4B5'}}><ChevronLeft size={18} style={{color:'#1B4965'}}/></button>
        <button onClick={()=>setMonthOffset(0)} className="px-4 h-10 rounded-full text-sm font-medium" style={{background:'#fff',border:'1.5px solid #E5D4B5',color:'#1B4965'}}>Today</button>
        <button onClick={()=>setMonthOffset(o=>o+1)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{background:'#fff',border:'1.5px solid #E5D4B5'}}><ChevronRight size={18} style={{color:'#1B4965'}}/></button>
        <span className="font-display text-xl font-semibold ml-1" style={{color:'#1B4965'}}>{monthLabel}</span>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{background:'#fff',border:'1px solid #E5D4B5'}}>
        <div className="grid grid-cols-7 border-b" style={{borderColor:'#E5D4B5',background:'#F7F2E8'}}>{DOW_SHORT.map(d=><div key={d} className="py-2.5 text-center text-xs uppercase tracking-wider font-semibold" style={{color:'#1B4965',opacity:0.6}}>{d}</div>)}</div>
        <div className="grid grid-cols-7">
          {calDays.map((cd,i)=>{const ds=fmtDate(new Date(cd.year,cd.month,cd.day)),dBks=getDayBks(ds),isToday=ds===todayStr,isSel=ds===selectedDay,isOther=cd.other;return(
            <div key={i} onClick={()=>setSelectedDay(isSel?null:ds)} className="cal-cell p-1.5 cursor-pointer transition-colors" style={{background:isSel?'#1B496512':isToday?'#E0785608':'transparent',opacity:isOther?0.35:1}}>
              <div className="w-7 h-7 flex items-center justify-center rounded-full mb-1 text-sm" style={{background:isToday?'#E07856':'transparent',color:isToday?'#FBF6EE':'#2A2522',fontWeight:isToday?700:400}}>{cd.day}</div>
              <div className="space-y-0.5">{dBks.slice(0,2).map(b=>{const rooms=(b.rooms||[]).map(rid=>ROOMS.find(r=>r.id===rid)).filter(Boolean),col=b.wholeHouse?'#1B4965':rooms[0]?.color||'#1B4965',isStart=b.startDate===ds;return <div key={b.id} className="rounded truncate px-1" style={{background:`${col}22`,color:col,fontSize:'10px',fontWeight:600,lineHeight:'18px',borderLeft:`2px solid ${col}`}}>{isStart?(b.wholeHouse?'🏠 ':'')+fullName(b):'\u00A0'}</div>;})} {dBks.length>2&&<div className="text-center" style={{fontSize:'10px',color:'#1B4965',opacity:0.6}}>+{dBks.length-2}</div>}</div>
            </div>
          );})}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 items-center"><span className="text-xs uppercase tracking-wider" style={{color:'#1B4965',opacity:0.5}}>Rooms:</span>{ROOMS.map(r=><span key={r.id} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{background:`${r.color}18`,color:r.color}}>{r.icon} {r.name}</span>)}</div>
      {selectedDay&&(
        <div className="mt-4 rounded-2xl overflow-hidden grain" style={{background:'#fff',border:'1px solid #E5D4B5'}}>
          <div className="px-5 py-3 flex items-center justify-between border-b" style={{borderColor:'#E5D4B5',background:'#F7F2E8'}}><div className="font-display text-lg font-semibold" style={{color:'#1B4965'}}>{parseDate(selectedDay).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</div><button onClick={()=>setSelectedDay(null)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{color:'#2A2522',opacity:0.5}}><X size={15}/></button></div>
          {selBks.length===0?<div className="px-5 py-8 text-center font-display italic" style={{color:'#1B4965',opacity:0.5}}>No reservations on this day. 🌊</div>:(
            <div>{selBks.map(b=>{const rooms=(b.rooms||[]).map(rid=>ROOMS.find(r=>r.id===rid)).filter(Boolean),col=b.wholeHouse?'#1B4965':rooms[0]?.color||'#1B4965';return(
              <div key={b.id} className="p-5 border-b last:border-b-0" style={{borderColor:'#E5D4B5'}}><div className="flex items-start gap-3 flex-wrap"><div className="w-1 self-stretch rounded-full flex-shrink-0" style={{background:col,minHeight:'40px'}}/><div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1"><span className="font-display text-lg font-semibold" style={{color:'#1B4965'}}>{fullName(b)}</span>{b.wholeHouse&&<span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold" style={{background:'#1B496515',color:'#1B4965'}}><Star size={10}/>Full House</span>}<span className="text-xs px-2 py-0.5 rounded-full" style={{background:'#FBF6EE',border:'1px solid #E5D4B5'}}>{b.numGuests} guest{b.numGuests!==1?'s':''}</span></div>
                <div className="font-display italic text-sm mb-2" style={{color:'#C8553D'}}>{prettyDate(b.startDate)} → {prettyDate(b.endDate)} · {nightsCount(b.startDate,b.endDate)} nights</div>
                {(b.email||b.phone)&&<div className="flex items-center gap-4 text-xs mb-2" style={{color:'#1B4965',opacity:0.7}}>{b.email&&<span className="flex items-center gap-1"><Mail size={11}/>{b.email}</span>}{b.phone&&<span className="flex items-center gap-1"><Phone size={11}/>{b.phone}</span>}</div>}
                {b.wholeHouse?<div className="flex flex-wrap gap-1">{ROOMS.map(r=><span key={r.id} className="text-xs px-2 py-0.5 rounded-full" style={{background:`${r.color}15`,color:r.color}}>{r.icon} {r.name}</span>)}</div>:<div className="flex flex-wrap gap-1">{rooms.map(r=><span key={r.id} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{background:`${r.color}15`,color:r.color}}>{r.icon} {r.name}</span>)}</div>}
                {b.notes&&<div className="text-xs italic mt-2 font-display" style={{opacity:0.6}}>"{b.notes}"</div>}
              </div></div></div>
            );})}</div>
          )}
        </div>
      )}
    </div>
  );
}

function TimelineGrid({bookings}){
  const [monthOffset,setMonthOffset]=useState(0);
  const {year,month,daysInMonth,monthLabel}=useMemo(()=>{const d=new Date();d.setDate(1);d.setMonth(d.getMonth()+monthOffset);const y=d.getFullYear(),m=d.getMonth(),dim=new Date(y,m+1,0).getDate();return{year:y,month:m,daysInMonth:dim,monthLabel:d.toLocaleDateString('en-US',{month:'long',year:'numeric'})};},[monthOffset]);
  const days=Array.from({length:daysInMonth},(_,i)=>i+1),today=new Date(),isCurMo=today.getFullYear()===year&&today.getMonth()===month;
  const getRoomBks=roomId=>{const ms=fmtDate(new Date(year,month,1)),me=fmtDate(new Date(year,month+1,1));return bookings.filter(b=>b.rooms.includes(roomId)&&overlaps(b.startDate,b.endDate,ms,me));};
  return(
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={()=>setMonthOffset(o=>o-1)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{background:'#fff',border:'1.5px solid #E5D4B5'}}><ChevronLeft size={18} style={{color:'#1B4965'}}/></button>
        <button onClick={()=>setMonthOffset(0)} className="px-4 h-10 rounded-full text-sm font-medium" style={{background:'#fff',border:'1.5px solid #E5D4B5',color:'#1B4965'}}>Today</button>
        <button onClick={()=>setMonthOffset(o=>o+1)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{background:'#fff',border:'1.5px solid #E5D4B5'}}><ChevronRight size={18} style={{color:'#1B4965'}}/></button>
        <span className="font-display text-xl font-semibold ml-1" style={{color:'#1B4965'}}>{monthLabel}</span>
      </div>
      <div className="rounded-2xl overflow-x-auto" style={{background:'#fff',border:'1px solid #E5D4B5'}}>
        <div style={{minWidth:`${120+daysInMonth*32}px`}}>
          <div className="flex border-b" style={{borderColor:'#E5D4B5',background:'#F7F2E8'}}><div className="flex-shrink-0 px-4 py-3 text-xs uppercase tracking-wider font-medium" style={{width:'120px',color:'#1B4965',opacity:0.7}}>Room</div><div className="flex flex-1">{days.map(d=>{const isT=isCurMo&&d===today.getDate(),date=new Date(year,month,d),dow=date.toLocaleDateString('en-US',{weekday:'short'})[0],isW=date.getDay()===0||date.getDay()===6;return <div key={d} className="flex-1 min-w-[32px] py-2 text-center text-xs" style={{background:isT?'#E07856':'transparent',color:isT?'#FBF6EE':isW?'#C8553D':'#1B4965',fontWeight:isT?700:500}}><div style={{fontSize:'9px'}}>{dow}</div><div>{d}</div></div>;})}</div></div>
          {ROOMS.map(room=>{const rb=getRoomBks(room.id);return(
            <div key={room.id} className="flex border-b last:border-b-0 relative" style={{borderColor:'#E5D4B5',minHeight:'56px'}}>
              <div className="flex-shrink-0 px-4 py-3 flex items-center gap-2" style={{width:'120px',background:`${room.color}08`}}><span className="text-lg">{room.icon}</span><div className="text-xs leading-tight"><div className="font-semibold" style={{color:room.color}}>{room.name}</div><div style={{opacity:0.5}}>sl.{room.capacity}</div></div></div>
              <div className="flex flex-1 relative">{days.map(d=>{const isW=new Date(year,month,d).getDay()===0||new Date(year,month,d).getDay()===6;return <div key={d} className="flex-1 min-w-[32px] border-r last:border-r-0" style={{borderColor:'#E5D4B515',background:isW?'#FBF6EE50':'transparent'}}/>;})}{rb.map(b=>{const s=parseDate(b.startDate),e=parseDate(b.endDate),ms=new Date(year,month,1),me=new Date(year,month,daysInMonth);const vs=s<ms?ms:s,ve=e>me?new Date(year,month,daysInMonth+1):e;const sd=vs.getDate(),ed=ve.getDate();return <div key={b.id} className="absolute top-1.5 bottom-1.5 rounded-md px-2 py-1 text-xs font-medium overflow-hidden whitespace-nowrap" style={{left:`${((sd-1)/daysInMonth)*100}%`,width:`calc(${((ed-sd)/daysInMonth)*100}% - 2px)`,background:b.wholeHouse?'linear-gradient(90deg,#1B4965,#2C3E2E)':room.color,color:'#FBF6EE',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}} title={`${fullName(b)} · ${prettyDate(b.startDate)} → ${prettyDate(b.endDate)}`}>{b.wholeHouse?'🏠 ':''}{fullName(b)}</div>;})}
              </div>
            </div>
          );})}
        </div>
      </div>
    </div>
  );
}

function StaysList({bookings,onEdit,onDelete}){
  const [filter,setFilter]=useState('upcoming');const today=fmtDate(new Date());
  const filtered=useMemo(()=>{if(filter==='upcoming')return bookings.filter(b=>b.endDate>=today);if(filter==='past')return[...bookings.filter(b=>b.endDate<today)].reverse();return bookings;},[bookings,filter,today]);
  return(
    <div className="pt-10 fade-up">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3"><div><div className="text-xs uppercase tracking-[0.25em] mb-1" style={{color:'#C8553D'}}>The ledger</div><h2 className="font-display text-3xl sm:text-4xl font-semibold" style={{color:'#1B4965'}}>All stays</h2></div><div className="flex gap-1 p-1 rounded-full" style={{background:'#fff',border:'1px solid #E5D4B5'}}>{['upcoming','past','all'].map(f=><button key={f} onClick={()=>setFilter(f)} className="px-4 py-1.5 rounded-full text-sm font-medium capitalize" style={{background:filter===f?'#1B4965':'transparent',color:filter===f?'#FBF6EE':'#1B4965'}}>{f}</button>)}</div></div>
      {filtered.length===0?<div className="text-center py-16 font-display italic text-xl" style={{color:'#1B4965',opacity:0.5}}>Nothing here yet 🌊</div>:<div className="space-y-3">{filtered.map(b=><StayRow key={b.id} booking={b} onEdit={()=>onEdit(b)} onDelete={()=>onDelete(b.id)}/>)}</div>}
    </div>
  );
}

function StayRow({booking,onEdit,onDelete}){
  const [confirming,setConfirming]=useState(false);
  const rooms=(booking.rooms||[]).map(rid=>ROOMS.find(r=>r.id===rid)).filter(Boolean),nights=nightsCount(booking.startDate,booking.endDate),today=fmtDate(new Date()),isPast=booking.endDate<today;
  return(
    <div className="rounded-2xl grain transition-all hover:-translate-y-0.5 relative overflow-hidden" style={{background:booking.wholeHouse?'linear-gradient(135deg,#1B4965,#2C3E2E)':'#fff',color:booking.wholeHouse?'#FBF6EE':'#2A2522',border:booking.wholeHouse?'1px solid #F5C84250':`1px solid ${rooms[0]?.color||'#E5D4B5'}30`,opacity:isPast?0.65:1}}>
      {booking.wholeHouse&&<div className="absolute -top-4 -right-4 text-8xl opacity-10">🏠</div>}
      <div className="p-5"><div className="flex items-start gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap"><h3 className="font-display text-xl sm:text-2xl font-semibold">{fullName(booking)}</h3><span className="text-xs px-2 py-0.5 rounded-full" style={{background:booking.wholeHouse?'rgba(251,246,238,0.15)':'#FBF6EE',color:booking.wholeHouse?'#FBF6EE':'#1B4965'}}>{booking.numGuests} guest{booking.numGuests!==1?'s':''}</span>{booking.wholeHouse&&<span className="text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold" style={{background:'rgba(245,200,66,0.2)',color:'#F5C842'}}><Star size={10}/>Full House</span>}{isPast&&<span className="text-xs px-2 py-0.5 rounded-full" style={{background:'#E5D4B5',color:'#2A2522'}}>past</span>}</div>
          <div className="font-display italic mb-2" style={{color:booking.wholeHouse?'#FFD580':'#C8553D'}}>{prettyDate(booking.startDate)} → {prettyDate(booking.endDate)}<span className="text-xs not-italic ml-2" style={{opacity:0.5}}>{nights} night{nights!==1?'s':''}</span></div>
          {(booking.email||booking.phone)&&<div className="flex flex-wrap items-center gap-3 text-xs mb-2" style={{color:booking.wholeHouse?'rgba(251,246,238,0.7)':'#1B4965',opacity:booking.wholeHouse?1:0.7}}>{booking.email&&<span className="flex items-center gap-1"><Mail size={11}/>{booking.email}</span>}{booking.phone&&<span className="flex items-center gap-1"><Phone size={11}/>{booking.phone}</span>}</div>}
          {booking.wholeHouse?<div className="flex flex-wrap gap-1.5 mb-1">{ROOMS.map(r=><span key={r.id} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{background:'rgba(251,246,238,0.12)',color:'#FBF6EE'}}>{r.icon} {r.name}</span>)}</div>:<div className="flex flex-wrap gap-1.5 mb-1">{rooms.map(r=><span key={r.id} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{background:`${r.color}15`,color:r.color}}>{r.icon} {r.name}</span>)}</div>}
          {booking.notes&&<div className="text-sm italic font-display mt-1" style={{opacity:0.7}}><MessageCircle size={12} className="inline mr-1.5 -mt-0.5"/>"{booking.notes}"</div>}
        </div>
        <div className="flex gap-2">{!isPast&&<button onClick={()=>onEdit(booking)} className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105" style={{background:booking.wholeHouse?'rgba(251,246,238,0.15)':'#1B4965',color:'#FBF6EE',border:booking.wholeHouse?'1px solid rgba(251,246,238,0.3)':'none'}}>Edit</button>}{confirming?<><button onClick={()=>onDelete(booking.id)} className="px-3 py-2 rounded-full text-sm font-medium" style={{background:'#C8553D',color:'#FBF6EE'}}>Delete</button><button onClick={()=>setConfirming(false)} className="px-3 py-2 rounded-full text-sm font-medium" style={{background:'#fff',border:'1.5px solid #E5D4B5',color:'#2A2522'}}>Keep</button></>:<button onClick={()=>setConfirming(true)} className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{background:booking.wholeHouse?'rgba(251,246,238,0.1)':'#fff',border:booking.wholeHouse?'1px solid rgba(251,246,238,0.2)':'1.5px solid #E5D4B5',color:'#C8553D'}}><Trash2 size={15}/></button>}</div>
      </div></div>
    </div>
  );
}

function GuestDirectory({guests,bookings,onDelete,setView}){
  const [search,setSearch]=useState('');const [confirmDelete,setConfirmDelete]=useState(null);
  const filtered=useMemo(()=>{const q=search.toLowerCase();return guests.filter(g=>!q||`${g.firstName} ${g.lastName}`.toLowerCase().includes(q)||g.email.toLowerCase().includes(q)||g.phone.includes(q));},[guests,search]);
  const getVisitCount=g=>bookings.filter(b=>b.email&&b.email===g.email).length;
  return(
    <div className="pt-10 fade-up">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3"><div><div className="text-xs uppercase tracking-[0.25em] mb-1" style={{color:'#C8553D'}}>Regulars</div><h2 className="font-display text-3xl sm:text-4xl font-semibold" style={{color:'#1B4965'}}>Guest Directory</h2></div><button onClick={()=>setView('book')} className="flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all hover:scale-105" style={{background:'#1B4965',color:'#FBF6EE'}}><Plus size={16}/>New Booking</button></div>
      {guests.length===0?(
        <div className="text-center py-20 rounded-2xl border-2 border-dashed" style={{borderColor:'#E5D4B5'}}><div className="text-5xl mb-4 float-slow inline-block">👥</div><p className="font-display italic text-xl mb-2" style={{color:'#1B4965'}}>No guests saved yet.</p><p className="text-sm mb-6" style={{opacity:0.6}}>When booking, toggle "Remember this guest" to add them here.</p><button onClick={()=>setView('book')} className="px-6 py-3 rounded-full font-medium" style={{background:'#1B4965',color:'#FBF6EE'}}>Make a booking →</button></div>
      ):(
        <>
          <div className="relative mb-5"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{color:'#1B4965',opacity:0.4}}/><input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${guests.length} guest${guests.length!==1?'s':''}…`} className="w-full pl-11 pr-4 py-3 rounded-xl outline-none font-body" style={{background:'#fff',border:'1.5px solid #E5D4B5'}}/></div>
          {filtered.length===0?<div className="text-center py-12 font-display italic" style={{color:'#1B4965',opacity:0.5}}>No guests match "{search}"</div>:(
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(g=>{const vc=getVisitCount(g),isDel=confirmDelete===g.id;return(
                <div key={g.id} className="rounded-2xl p-5 grain transition-all hover:-translate-y-0.5" style={{background:'#fff',border:'1px solid #5B826625',boxShadow:'0 2px 8px rgba(91,130,102,0.06)'}}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-full flex items-center justify-center font-display font-bold text-lg flex-shrink-0" style={{background:'linear-gradient(135deg,#5B8266,#3D5F47)',color:'#FBF6EE'}}>{initials(g)}</div><div><div className="font-display text-lg font-semibold leading-tight" style={{color:'#1B4965'}}>{fullName(g)}</div>{vc>0&&<div className="text-xs flex items-center gap-1 mt-0.5" style={{color:'#5B8266'}}><Heart size={10}/>{vc} stay{vc!==1?'s':''}</div>}</div></div>
                    <button onClick={()=>setConfirmDelete(isDel?null:g.id)} className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-110" style={{color:'#C8553D',background:'#C8553D10'}}><Trash2 size={14}/></button>
                  </div>
                  {g.email&&<div className="flex items-center gap-2 text-sm mb-1.5" style={{color:'#2A2522',opacity:0.75}}><Mail size={13} style={{color:'#1B4965',opacity:0.5}}/><span className="truncate">{g.email}</span></div>}
                  {g.phone&&<div className="flex items-center gap-2 text-sm mb-3" style={{color:'#2A2522',opacity:0.75}}><Phone size={13} style={{color:'#1B4965',opacity:0.5}}/>{g.phone}</div>}
                  {g.lastVisit&&<div className="text-xs mb-3" style={{color:'#1B4965',opacity:0.5}}>Last visit: {prettyDate(g.lastVisit)}</div>}
                  {isDel?(
                    <div className="flex gap-2"><button onClick={()=>{onDelete(g.id);setConfirmDelete(null);}} className="flex-1 py-2 rounded-full text-xs font-semibold" style={{background:'#C8553D',color:'#FBF6EE'}}>Remove</button><button onClick={()=>setConfirmDelete(null)} className="flex-1 py-2 rounded-full text-xs font-semibold" style={{background:'#fff',border:'1px solid #E5D4B5',color:'#2A2522'}}>Keep</button></div>
                  ):(
                    <button onClick={()=>setView('book')} className="w-full py-2 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:scale-105" style={{background:'#5B826615',color:'#5B8266',border:'1px solid #5B826630'}}><Plus size={12}/>Book a Stay</button>
                  )}
                </div>
              );})}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function HouseView({bookings}){
  const today=fmtDate(new Date()),cur=bookings.filter(b=>b.startDate<=today&&today<b.endDate),getOcc=rid=>cur.find(b=>b.rooms.includes(rid));
  return(
    <div className="pt-10 fade-up">
      <div className="mb-8"><div className="text-xs uppercase tracking-[0.25em] mb-1" style={{color:'#C8553D'}}>The floor plan</div><h2 className="font-display text-3xl sm:text-4xl font-semibold" style={{color:'#1B4965'}}>Meet the rooms</h2><p className="mt-2 font-display italic" style={{color:'#2A2522',opacity:0.7}}>Seven rooms, twenty beds, one very salty porch.</p></div>
      <div className="mb-6"><div className="text-xs uppercase tracking-[0.3em] mb-3 flex items-center gap-2" style={{color:'#1B4965'}}><span>Upstairs</span><span style={{flex:1,height:'1px',background:'#E5D4B5'}}/></div><div className="grid sm:grid-cols-2 gap-3">{['single-queen','private-lantern'].map(id=>{const r=ROOMS.find(x=>x.id===id);return r?<RoomTile key={id} room={r} occupant={getOcc(id)}/>:null;})}</div></div>
      <div><div className="text-xs uppercase tracking-[0.3em] mb-3 flex items-center gap-2" style={{color:'#1B4965'}}><span>Main floor</span><span style={{flex:1,height:'1px',background:'#E5D4B5'}}/><span style={{opacity:0.5}}>🌊 ocean →</span></div>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">{['king-ocean','private-compass'].map(id=>{const r=ROOMS.find(x=>x.id===id);return r?<RoomTile key={id} room={r} occupant={getOcc(id)} highlight="Ocean side"/>:null;})}</div>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">{['double-queen'].map(id=>{const r=ROOMS.find(x=>x.id===id);return r?<RoomTile key={id} room={r} occupant={getOcc(id)}/>:null;})}<div className="rounded-2xl p-5 flex items-center justify-center text-center font-display italic" style={{background:'#FBF6EE',border:'2px dashed #E5D4B5',color:'#1B4965',opacity:0.5,minHeight:'140px'}}><div><div className="text-3xl mb-1">📚</div><div className="text-sm">reading nook</div></div></div></div>
        <div className="grid sm:grid-cols-2 gap-3">{['bunk-left','bunk-right'].map(id=>{const r=ROOMS.find(x=>x.id===id);return r?<RoomTile key={id} room={r} occupant={getOcc(id)} highlight="Street side"/>:null;})}</div>
      </div>
      <div className="mt-10 rounded-2xl p-6 grain text-center" style={{background:'#5B826615',border:'1px solid #5B826640'}}><Heart size={20} className="mx-auto mb-2" style={{color:'#5B8266'}}/><p className="font-display italic" style={{color:'#1B4965'}}>Sleeps {MAX_CAPACITY} total. Bring extra towels — there are never enough.</p></div>
    </div>
  );
}

function RoomTile({room,occupant,highlight}){
  return(
    <div className="rounded-2xl p-5 relative overflow-hidden grain" style={{background:occupant?room.color:'#fff',color:occupant?'#FBF6EE':'#2A2522',border:`1px solid ${room.color}30`,minHeight:'140px'}}>
      {highlight&&<div className="absolute top-3 right-3 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{background:occupant?'rgba(251,246,238,0.2)':`${room.color}15`,color:occupant?'#FBF6EE':room.color}}>{highlight}</div>}
      <div className="text-3xl mb-2">{room.icon}</div>
      <div className="flex items-center gap-1.5 flex-wrap"><div className="font-display text-lg font-semibold leading-tight">{room.name}</div>{room.private&&<span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full inline-flex items-center gap-1" style={{background:occupant?'rgba(251,246,238,0.2)':`${room.color}15`,color:occupant?'#FBF6EE':room.color,fontWeight:600}}><Lock size={8}/>private</span>}</div>
      <div className="text-xs uppercase tracking-wider mt-0.5" style={{opacity:0.7}}>{room.subtitle}</div>
      <div className="text-xs mt-2 flex items-center gap-1" style={{opacity:0.85}}><Users size={12}/>sleeps {room.capacity}</div>
      {occupant&&<div className="mt-3 pt-3 border-t text-xs" style={{borderColor:'rgba(251,246,238,0.3)'}}><div className="opacity-75 uppercase tracking-wider text-[10px]">{occupant.wholeHouse?'Full House':'Currently'}</div><div className="font-display font-semibold">{fullName(occupant)}</div></div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(NEEDS_SETUP ? <SetupScreen/> : <App/>);
