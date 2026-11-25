import React, {useEffect,useMemo,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {createClient} from '@supabase/supabase-js';
import {quizzes} from './questions';
import './style.css';

const supabaseUrl=import.meta.env.VITE_SUPABASE_URL;
const supabaseKey=import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase=supabaseUrl&&supabaseKey?createClient(supabaseUrl,supabaseKey):null;
const memes={
 good:['https://i.imgflip.com/1g8my4.jpg','https://i.imgflip.com/4t0m5.jpg','https://i.imgflip.com/26am.jpg'],
 bad:['https://i.imgflip.com/1bij.jpg','https://i.imgflip.com/2/3lmzyx.jpg','https://i.imgflip.com/1ur9b0.jpg']
};
function sound(kind='click'){
 try{
  const C=window.AudioContext||window.webkitAudioContext; const ctx=new C(); const now=ctx.currentTime;
  const tones=kind==='good'?[[523,.0,.12],[659,.13,.12],[784,.26,.2]]:kind==='bad'?[[220,0,.16],[165,.16,.22]]:[[700,0,.045]];
  tones.forEach(([hz,at,d])=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=kind==='bad'?'triangle':'sine';o.frequency.value=hz;g.gain.setValueAtTime(.0001,now+at);g.gain.exponentialRampToValueAtTime(kind==='click'?.035:.07,now+at+.012);g.gain.exponentialRampToValueAtTime(.0001,now+at+d);o.connect(g);g.connect(ctx.destination);o.start(now+at);o.stop(now+at+d+.02)});
  setTimeout(()=>ctx.close(),900);
 }catch{}
}
function App(){
 const [page,setPage]=useState('home'),[quizId,setQuizId]=useState('psas'),[index,setIndex]=useState(0),[answers,setAnswers]=useState([]),[feedback,setFeedback]=useState(null),[name,setName]=useState(''),[score,setScore]=useState(0),[board,setBoard]=useState([]),[meme,setMeme]=useState(''),[music,setMusic]=useState(false);
 const audioRef=useRef(null),q=quizzes[quizId],item=q.questions[index];
 const correctCount=answers.filter((a,i)=>a===q.questions[i].correct).length;
 useEffect(()=>{loadBoard()},[]);
 useEffect(()=>{if(page==='result')loadBoard()},[page]);
 async function loadBoard(){
  if(supabase){const {data}=await supabase.from('quiz_leaderboard').select('*').order('score',{ascending:false}).order('created_at',{ascending:true}).limit(50);if(data)setBoard(data)}
  else {try{setBoard(JSON.parse(localStorage.getItem('ips-board')||'[]').sort((a,b)=>b.score-a.score).slice(0,50))}catch{}}
 }
 function start(id){sound();setQuizId(id);setIndex(0);setAnswers([]);setFeedback(null);setScore(0);setPage('play')}
 function choose(n){
  if(feedback)return; sound();const ok=n===item.correct;setAnswers(a=>[...a,n]);setFeedback(ok?'good':'bad');setMeme(memes[ok?'good':'bad'][Math.floor(Math.random()*3)]);sound(ok?'good':'bad');
 }
 function next(){sound();if(index+1<q.questions.length){setIndex(index+1);setFeedback(null)}else{const s=Math.round((answers.filter((a,i)=>a===q.questions[i].correct).length/q.questions.length)*100);setScore(s);setPage('result')}}
 async function submit(){
  if(!name.trim())return;const row={name:name.trim().slice(0,24),quiz:quizId,score,correct:answers.filter((a,i)=>a===q.questions[i].correct).length,total:q.questions.length};
  if(supabase){const {error}=await supabase.from('quiz_leaderboard').insert(row);if(error){alert('Gagal menyimpan leaderboard. Periksa konfigurasi Supabase.');return}}
  else {const all=[...board,{...row,created_at:new Date().toISOString()}].sort((a,b)=>b.score-a.score).slice(0,50);localStorage.setItem('ips-board',JSON.stringify(all))}
  await loadBoard();setPage('leaderboard');
 }
 function toggleMusic(){sound();if(!audioRef.current){const C=window.AudioContext||window.webkitAudioContext;const ctx=new C();const master=ctx.createGain();master.gain.value=.018;master.connect(ctx.destination);const os=[110,164.81,220].map((hz,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=hz;g.gain.value=[.4,.22,.12][i];o.connect(g);g.connect(master);o.start();return o});audioRef.current={ctx,os,master};setMusic(true)}else{audioRef.current.os.forEach(o=>o.stop());audioRef.current.ctx.close();audioRef.current=null;setMusic(false)}}
 const top=useMemo(()=>board.slice(0,10),[board]);
 return <div className="app">
  <header><button className="brand" onClick={()=>setPage('home')}>✦ KELAS CERDAS</button><div className="headright"><span className="pill">IPS • KELAS V</span><button className={'soundbtn '+(music?'active':'')} onClick={toggleMusic}>{music?'♫ Musik ON':'♫ Musik OFF'}</button></div></header>
  <main>
  {page==='home'&&<section className="hero">
   <div className="eyebrow">BELAJAR JADI LEBIH SERU</div><h1>Siap jadi<br/><em>jagoan IPS?</em></h1><p className="lead">Pilih tantanganmu, jawab soal, kumpulkan poin, dan rebut posisi teratas di leaderboard!</p>
   <div className="quizgrid">{Object.entries(quizzes).map(([id,v],i)=><article className="quizcard" key={id}><div className="cardicon">{i?'🧠':'🌏'}</div><div className="tag">{i?'BAB 2':'UJIAN SEMESTER'}</div><h2>{v.title}</h2><p>{v.subtitle}</p><div className="cardbottom"><span>{v.questions.length} soal pilihan ganda</span><button onClick={()=>start(id)}>Mulai kuis <b>↗</b></button></div></article>)}</div>
   <button className="leaderlink" onClick={()=>{sound();setPage('leaderboard')}}>🏆 Lihat leaderboard</button>
   <p className="tiny">Tips: aktifkan musik untuk suasana bermain yang lebih hidup.</p>
  </section>}
  {page==='play'&&<section className="play">
   <div className="playtop"><button className="back" onClick={()=>setPage('home')}>← Keluar</button><span>{q.title}</span><b>{index+1}<small> / {q.questions.length}</small></b></div>
   <div className="progress"><i style={{width:`${((index+(feedback?1:0))/q.questions.length)*100}%`}}/></div>
   <div className="questionmeta"><span>PERTANYAAN {String(index+1).padStart(2,'0')}</span><span>BENAR: {answers.filter((a,i)=>a===q.questions[i].correct).length}</span></div>
   <h2 className="question">{item.q}</h2>
   <div className="answers">{item.a.map((a,n)=><button key={n} disabled={!!feedback} onClick={()=>choose(n)} className={'answer '+(feedback&&n===item.correct?'right':feedback&&answers[index]===n?'wrong':'')}><span className="letter">{'ABCD'[n]}</span>{a}{feedback&&n===item.correct&&<b className="mark">✓</b>}{feedback&&answers[index]===n&&n!==item.correct&&<b className="mark">✕</b>}</button>)}</div>
   {feedback&&<div className={'feedback '+feedback}><div className="feedbackcopy"><b>{feedback==='good'?'MANTAP! JAWABANMU BENAR 🎉':'YAHH, BELUM TEPAT 😅'}</b><span>{feedback==='good'?'Otak encer, lanjutkan!':'Jangan menyerah. Jawaban yang benar sudah ditandai.'}</span></div><img src={meme} onError={e=>e.currentTarget.style.display='none'} alt="Meme reaksi"/><button onClick={next}>{index+1===q.questions.length?'Lihat hasil':'Soal berikutnya'} →</button></div>}
   <div className="playfoot"><span>💡 Pilih satu jawaban terbaik</span><span>{Math.round((index/q.questions.length)*100)}% selesai</span></div>
  </section>}
  {page==='result'&&<section className="result panel"><div className="resultemoji">{score>=80?'🏆':score>=60?'⭐':'💪'}</div><div className="eyebrow">HASIL KUIS SELESAI</div><h1>{score>=80?'Luar biasa!':score>=60?'Bagus!':'Tetap semangat!'}</h1><div className="score">{score}<small>/100</small></div><p>Kamu menjawab benar <b>{answers.filter((a,i)=>a===q.questions[i].correct).length}</b> dari {q.questions.length} soal.</p><div className="savebox"><label>Masukkan nama untuk leaderboard</label><input value={name} onChange={e=>setName(e.target.value)} maxLength="24" placeholder="Nama panggilan kamu"/><button onClick={submit} disabled={!name.trim()}>Simpan skor & lihat leaderboard →</button></div><button className="textbutton" onClick={()=>start(quizId)}>↻ Ulangi kuis</button><button className="textbutton" onClick={()=>setPage('home')}>Kembali ke beranda</button></section>}
  {page==='leaderboard'&&<section className="panel leaderboard"><div className="eyebrow">PAPAN PERINGKAT</div><h1>🏆 Leaderboard</h1><p className="lead smalllead">Para jagoan IPS minggu ini.</p><div className="tabs"><button className="selected">Semua skor</button><button onClick={()=>setPage('home')}>Pilih kuis</button></div>
   {top.length?<div className="ranklist">{top.map((r,i)=><div className="rank" key={r.id||i}><b className="ranknum">{i===0?'🥇':i===1?'🥈':i===2?'🥉':String(i+1).padStart(2,'0')}</b><div className="rankname"><b>{r.name}</b><small>{r.quiz==='bab2'?'Latihan IPS Bab 2':'PSAS IPS Semester Ganjil'}</small></div><strong>{r.score}<small> / 100</small></strong></div>)}</div>:<div className="empty">🎯 Belum ada skor. Jadilah yang pertama masuk leaderboard!</div>}
   <p className="tiny">{supabase?'Skor tersimpan online melalui Supabase.':'Mode demo: skor tersimpan di browser/perangkat ini. Hubungkan Supabase agar leaderboard dapat dibagikan ke semua pemain.'}</p><button className="primary wide" onClick={()=>setPage('home')}>Kembali ke beranda</button>
  </section>}
  </main><footer>BUKAN SEKADAR HAFALAN · PAHAMI DUNIA SEKITARMU 🌱</footer>
 </div>
}
createRoot(document.getElementById('root')).render(<App/>);
