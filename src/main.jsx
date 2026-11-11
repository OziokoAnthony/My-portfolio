import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowRight, ArrowUpRight, Code2, Database, Download, Github, Mail, Menu, Monitor, Send, Sparkles, X, BriefcaseBusiness, GraduationCap, Layers3, CheckCircle2 } from 'lucide-react';
import defaults from './content.json';
import './style.css';

const Admin = lazy(() => import('./admin/Admin.jsx'));
const IS_ADMIN = /^\/admin\/?$/.test(window.location.pathname);

/* Deterministic mote field so the sky never re-shuffles between renders. */
const rnd = (seed) => { let t = (seed + 0x6d2b79f5) | 0; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const stars = Array.from({ length: 74 }, (_, i) => ({
  left: +(rnd(i * 7 + 1) * 100).toFixed(2),
  top: +(rnd(i * 13 + 3) * 100).toFixed(2),
  size: +(rnd(i * 17 + 5) * 2.4 + 1.1).toFixed(2),
  delay: +(rnd(i * 23 + 7) * 6).toFixed(2),
  dur: +(rnd(i * 29 + 11) * 11 + 8).toFixed(2),
  op: +(rnd(i * 31 + 13) * 0.45 + 0.45).toFixed(2),
  dx: +((rnd(i * 37 + 17) - 0.5) * 220).toFixed(1),
  dy: +((rnd(i * 41 + 19) - 0.5) * 220).toFixed(1),
}));

/* Moves the card's inner light to follow the pointer. */
const spotlight = (e) => {
  const el = e.currentTarget, r = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - r.left}px`);
  el.style.setProperty('--my', `${e.clientY - r.top}px`);
};

function Sky(){
  return <div className="sky" aria-hidden="true">
    <span className="aurora aurora-a"/><span className="aurora aurora-b"/><span className="aurora aurora-c"/>
    <span className="rays"/>
    <span className="cloud cloud-a"/><span className="cloud cloud-b"/>
    <div className="stars">{stars.map((s,i)=><i key={i} style={{left:`${s.left}%`,top:`${s.top}%`,width:`${s.size}px`,height:`${s.size}px`,'--tw':`${s.dur}s`,'--td':`${s.delay}s`,'--to':s.op,'--dx':`${s.dx}px`,'--dy':`${s.dy}px`}}/>)}</div>
    <span className="vignette"/>
  </div>;
}
function Wave(){return <div className="wave-wrap" aria-hidden="true"><div className="wave wave-one"/><div className="wave wave-two"/><div className="wave wave-three"/></div>}

const WhatsAppIcon = ({size=18}) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47 0 1.46 1.06 2.87 1.21 3.07.15.2 2.09 3.19 5.06 4.47.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z"/>
    <path d="M12.04 2.02c-5.5 0-9.97 4.46-9.97 9.96 0 1.76.46 3.48 1.34 4.99L2 22l5.16-1.35a9.93 9.93 0 0 0 4.88 1.28h.01c5.5 0 9.97-4.47 9.97-9.97 0-2.66-1.04-5.17-2.92-7.05a9.9 9.9 0 0 0-7.06-2.93zm0 18.2h-.01a8.3 8.3 0 0 1-4.22-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.27 8.27 0 0 1-1.27-4.41c0-4.57 3.72-8.29 8.3-8.29 2.21 0 4.29.86 5.86 2.43a8.24 8.24 0 0 1 2.43 5.87c0 4.57-3.72 8.29-8.3 8.29z"/>
  </svg>
);

function Brand({onClick, photo}){
  return <a href="#home" className="brand" onClick={onClick}>
    <span className="brand-mark"><img src={photo} alt="" /></span>
    <span className="brand-name">ANTHONY<span className="brand-dot">.</span></span>
  </a>;
}

/* Section heading: plain text + italic serif accent, on the same or a new line. */
function Heading({ data }){
  if (!data) return null;
  return <h2>{data.text}{data.break ? <br/> : ' '}<span>{data.accent}</span></h2>;
}

const VALUE_ICONS = [Sparkles, BriefcaseBusiness, GraduationCap];
const SKILL_ICONS = [Code2, Database, Monitor, Layers3];

function Site(){
  const [content, setContent] = useState(defaults);
  const [menu, setMenu] = useState(false);
  const [filter, setFilter] = useState('All');
  const [scrolled, setScrolled] = useState(false);
  const progressRef = useRef(null);
  const heroRef = useRef(null);

  /* Live content from the API; silently keeps the bundled copy if the API is offline. */
  useEffect(() => {
    let alive = true;
    fetch('/api/content', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (alive && data && data.hero) setContent(data); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        setScrolled(y > 24);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [filter, content]);

  const onHeroMove = (e) => {
    const el = heroRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(3));
    el.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(3));
    el.style.setProperty('--cx', `${e.clientX - r.left}px`);
    el.style.setProperty('--cy', `${e.clientY - r.top}px`);
  };

  const h = content.hero;
  const about = content.about;
  const skills = content.skills;
  const projects = content.projects;
  const experience = content.experience;
  const services = content.services;
  const contact = content.contact;
  const footer = content.footer;

  const cvHref = h.secondaryCta?.href || contact.cv;
  const waLink = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent("Hi Anthony, I found your portfolio and would like to chat.")}`;
  const categories = ['All', ...new Set(projects.items.map((p) => p.type))];
  const shown = filter === 'All' ? projects.items : projects.items.filter((p) => p.type === filter);
  const close = () => setMenu(false);

  return <>
    <div className="progress" ref={progressRef} aria-hidden="true"/>
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <Brand onClick={close} photo={h.photo}/>
      <button className="mobile-menu" onClick={() => setMenu(!menu)} aria-label="Toggle navigation" aria-expanded={menu}>{menu ? <X/> : <Menu/>}</button>
      <nav className={menu ? 'nav open' : 'nav'}>
        {[['About','#about'],['Skills','#skills'],['Projects','#projects'],['Experience','#experience'],['Contact','#contact']].map(([t, href]) => <a href={href} onClick={close} key={t}>{t}</a>)}
        <a className="nav-cv" href={cvHref} download>Download CV <Download size={15}/></a>
      </nav>
    </header>

    <main>
      <section className="hero" id="home" ref={heroRef} onMouseMove={onHeroMove}>
        <Sky/><Wave/>
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="eyebrow"><span className="pulse"/> {h.availability}</div>
            <p className="hello">{h.role}</p>
            <h1>{h.firstName}<br/><span>{h.lastName}</span></h1>
            <h2>{h.statement.map((line, i) => <React.Fragment key={i}>{i > 0 && <br/>}{i === h.statement.length - 1 ? <span className="gradient-text">{line}</span> : line}</React.Fragment>)}</h2>
            <p className="hero-desc">{h.description}</p>
            <div className="hero-actions">
              <a className="btn btn-primary" href={h.primaryCta.href}>{h.primaryCta.label} <ArrowRight size={17}/></a>
              <a className="btn btn-outline" href={cvHref} download><Download size={17}/> {h.secondaryCta.label}</a>
            </div>
            <div className="hero-social">
              <a href={contact.github} target="_blank" rel="noreferrer" aria-label="GitHub"><Github/></a>
              <a href={`mailto:${contact.email}`} aria-label="Email"><Mail/></a>
              <a href="#contact" aria-label="Contact"><ArrowDown/></a>
              <span className="social-line"/>
              <small>{h.scrollLabel}</small>
            </div>
          </div>
          <div className="hero-visual">
            <div className="portrait-halo"/>
            <span className="halo-ring ring-a"/><span className="halo-ring ring-b"/>
            <div className="orbit orbit-one"><span className="orbit-dot"/></div>
            <div className="orbit orbit-two"><span className="orbit-dot"/></div>
            <div className="portrait-float"><div className="portrait-frame"><img src={h.photo} alt={`Portrait of ${h.firstName} ${h.lastName}`}/><span className="portrait-sheen"/></div></div>
            <div className="float-card card-code"><span className="mini-icon"><Code2 size={17}/></span><span><b>Building with purpose</b><small>Code · Creativity · Impact</small></span></div>
            <div className="float-card card-location"><span className="location-dot"/><span><b>Based in Nigeria</b><small>Working globally</small></span></div>
          </div>
        </div>
        <a className="scroll-cue" href="#about"><span>{h.scrollLabel}</span><i/></a>
      </section>

      <section className="intro-strip" aria-label="Focus areas">
        <div className="marquee"><div className="marquee-track">
          {[0,1].map((g) => <div className="marquee-group" key={g} aria-hidden={g === 1 ? 'true' : undefined}>
            {h.marquee.map(([strong, span]) => <React.Fragment key={strong}><div className="marquee-item"><strong>{strong}</strong><span>{span}</span></div><i className="marquee-dot"/></React.Fragment>)}
          </div>)}
        </div></div>
      </section>

      <section className="section about-section" id="about">
        <div className="section-kicker reveal">{about.kicker}</div>
        <div className="about-grid">
          <div className="section-heading reveal"><p className="overline">{about.overline}</p><Heading data={about.heading}/></div>
          <div className="about-text reveal">
            <p className="lead">{about.lead}</p>
            {about.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            <a className="text-link" href="#contact">{about.linkLabel} <ArrowUpRight size={17}/></a>
          </div>
        </div>
        <div className="value-cards">
          {about.values.map((v, i) => { const Icon = VALUE_ICONS[i % VALUE_ICONS.length]; return (
            <article className="value-card reveal" key={v.id || v.title} onMouseMove={spotlight} style={{ '--rd': `${i * 90}ms` }}>
              <span>0{i + 1}</span><Icon/><h3>{v.title}</h3><p>{v.text}</p>
            </article>
          ); })}
        </div>
      </section>

      <section className="section skills-section" id="skills">
        <div className="section-kicker reveal">{skills.kicker}</div>
        <div className="section-top reveal">
          <div><p className="overline">{skills.overline}</p><Heading data={skills.heading}/></div>
          <p className="section-note">{skills.note}</p>
        </div>
        <div className="skill-grid">
          {skills.groups.map((g, i) => { const Icon = SKILL_ICONS[i % SKILL_ICONS.length]; return (
            <article className="skill-card reveal" key={g.id || g.title} onMouseMove={spotlight} style={{ '--rd': `${i * 80}ms` }}>
              <div className="skill-head"><span className="skill-icon"><Icon/></span><span className="skill-number">0{i + 1}</span></div>
              <h3>{g.title}</h3>
              <div className="tags">{g.items.map((x) => <span key={x}>{x}</span>)}</div>
            </article>
          ); })}
        </div>
      </section>

      <section className="section projects-section" id="projects">
        <div className="section-kicker reveal">{projects.kicker}</div>
        <div className="section-top reveal">
          <div><p className="overline">{projects.overline}</p><Heading data={projects.heading}/></div>
          <p className="section-note">{projects.note}</p>
        </div>
        <div className="filter-row reveal">
          {categories.map((c) => <button className={filter === c ? 'filter active' : 'filter'} key={c} onClick={() => setFilter(c)}>{c}</button>)}
        </div>
        <div className="project-grid">
          {shown.map((p, i) => (
            <article className={`project-card reveal${p.image ? ' has-image' : ''}`} key={p.id || p.name} onMouseMove={spotlight} style={{ '--rd': `${i * 70}ms` }}>
              {p.image ? <div className="project-thumb"><img src={p.image} alt={p.name}/></div> : null}
              <div className="project-top"><span className="project-icon">{p.icon}</span><span className="project-index">0{i + 1}</span></div>
              <p className="project-type">{p.type}</p>
              <h3>{p.name}</h3>
              <p className="project-desc">{p.desc}</p>
              <div className="tags">{p.stack.map((s) => <span key={s}>{s}</span>)}</div>
              <div className="project-foot">
                <span>{p.status}</span>
                {p.url ? <a href={p.url} target="_blank" rel="noreferrer" aria-label={`Open ${p.name}`}><ArrowUpRight/></a> : <span className="case-note">Case study</span>}
              </div>
            </article>
          ))}
        </div>
        <p className="project-note">{projects.footerNote}</p>
      </section>

      <section className="section experience-section" id="experience">
        <div className="section-kicker reveal">{experience.kicker}</div>
        <div className="section-top reveal">
          <div><p className="overline">{experience.overline}</p><Heading data={experience.heading}/></div>
          <p className="section-note">{experience.note}</p>
        </div>
        <div className="timeline">
          {experience.items.map((e, i) => (
            <article className="timeline-item reveal" key={e.id || e.org} style={{ '--rd': `${i * 90}ms` }}>
              <div className="timeline-marker"/>
              <div className="timeline-content">
                <span className="timeline-index">0{i + 1}</span>
                <h3>{e.role}</h3>
                <h4>{e.org}</h4>
                <p>{e.desc}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="cert-panel reveal">
          <div><span className="overline">{experience.certificates.overline}</span><Heading data={experience.certificates.heading}/></div>
          <div className="cert-list">{experience.certificates.items.map((x) => <span key={x}><CheckCircle2 size={16}/>{x}</span>)}</div>
        </div>
      </section>

      <section className="services-band">
        <div className="section-kicker">{services.kicker}</div>
        <Heading data={services.heading}/>
        <div className="service-list">{services.items.map((s) => <span key={s}>{s}</span>)}</div>
      </section>

      <section className="contact-section" id="contact">
        <Sky/><Wave/>
        <div className="contact-inner">
          <div className="section-kicker reveal">{contact.kicker}</div>
          <p className="overline reveal">{contact.overline}</p>
          <h2 className="reveal">{contact.heading.text}{contact.heading.break ? <br/> : ' '}<span>{contact.heading.accent}</span></h2>
          <p className="contact-copy reveal">{contact.copy}</p>
          <a className="btn btn-primary contact-btn reveal" href={`mailto:${contact.email}?subject=${encodeURIComponent("Let's work together")}`}>{contact.buttonLabel} <Send size={17}/></a>
          <div className="contact-details reveal">
            <a href={`mailto:${contact.email}`}><Mail/> {contact.email}</a>
            <a href={waLink} target="_blank" rel="noreferrer"><WhatsAppIcon size={15}/> {contact.whatsappDisplay}</a>
            <a href={contact.github} target="_blank" rel="noreferrer"><Github/> GitHub</a>
            <a href={contact.cv} download><Download/> Download CV</a>
          </div>
        </div>
      </section>
    </main>

    <footer className="footer">
      <Brand photo={h.photo}/>
      <p>{footer.tagline}</p>
      <span>© {new Date().getFullYear()} {footer.name}</span>
    </footer>

    <a className="wa-fab" href={waLink} target="_blank" rel="noreferrer" aria-label="Chat with Anthony on WhatsApp">
      <span className="wa-label">Chat on WhatsApp</span>
      <span className="wa-btn"><span className="wa-ping"/><WhatsAppIcon size={28}/></span>
    </a>
  </>;
}

function App(){
  if (IS_ADMIN) {
    return <Suspense fallback={<div className="admin-boot">Loading admin…</div>}><Admin/></Suspense>;
  }
  return <Site/>;
}

createRoot(document.getElementById('root')).render(<App/>);
