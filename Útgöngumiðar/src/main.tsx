import React,{useState,useEffect,type FormEvent} from 'react';
import {createRoot} from 'react-dom/client';
import {Join,Student,Header,Footer} from './app/ui';
import {Teacher} from './app/teacher';
import {configurationError,teacherSession,signIn,teacherUrl} from './api';
import './styles.css';
function Login(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const embedded=window.self!==window.top;
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError('');try{await signIn(email,password);setPassword('');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <><Header teacher/><main className="login-page"><span className="eyebrow">KENNARASVÆÐI</span><h1>Kennarainngangur</h1><p>Skráðu þig inn til að opna miða og skoða niðurstöður.</p>{embedded?<a className="button primary" href={teacherUrl()} target="_blank" rel="noreferrer">Opna kennarasvæði í nýjum flipa</a>:<form onSubmit={submit}><label>Netfang<input type="email" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Lykilorð<input type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<p role="alert" className="error">{error}</p>}<button className="button primary full" disabled={busy}>{busy?'Skrái inn…':'Skrá inn'}</button></form>}<a className="back-button" href="#/">← Nemendasíða</a></main><Footer/></>;
}
function App(){
 const [route,setRoute]=useState(location.hash),[auth,setAuth]=useState(teacherSession());
 useEffect(()=>{const nav=()=>{setRoute(location.hash);window.scrollTo(0,0);};const changed=()=>setAuth(teacherSession());addEventListener('hashchange',nav);addEventListener('teacher-auth',changed);return()=>{removeEventListener('hashchange',nav);removeEventListener('teacher-auth',changed);};},[]);
 const error=configurationError();
 if(error && !route.startsWith('#/kennari'))return <Join setupPending/>;
 if(error)return <><Header/><main className="setup-page"><h1>Útgöngumiðar</h1><p className="error">{error}</p><p>Uppsetningarleiðbeiningar fylgja kóðanum í skránni BYRJA-HER.md. Ekki er tekið við svörum fyrr en tengingunni er lokið.</p></main><Footer/></>;
 if(route==='#/kennari')return auth?<Teacher displayName={auth.user.email||'Kennari'}/>:<Login/>;
 const match=/^#\/midi\/([A-Z2-9]{6})$/.exec(route);
 if(match)return <Student key={match[1]} code={match[1]}/>;
 return <Join/>;
}
createRoot(document.getElementById('root')!).render(<App/>);
