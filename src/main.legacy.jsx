import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Code2,
  Database,
  Download,
  Github,
  Linkedin,
  Mail,
  Menu,
  Monitor,
  Send,
  Sparkles,
  X,
  BriefcaseBusiness,
  GraduationCap,
  Globe2,
  Layers3,
  Headphones,
  CheckCircle2,
} from "lucide-react";
import "./style.css";

const projects = [
  {
    name: "Student-Guide",
    type: "Education technology",
    desc: "An educational document platform designed to help learners interact with PDFs and learning materials through document processing, retrieval and AI-assisted question answering.",
    stack: ["Python", "FastAPI", "React", "TypeScript", "ChromaDB"],
    icon: "✦",
    status: "In development",
    url: "",
  },
  {
    name: "GiveNaija",
    type: "NGO & donation operations",
    desc: "A donation and member-management platform concept focused on campaign operations, financial accountability, audit trails and transparent records.",
    stack: ["Python", "PostgreSQL", "APIs", "Webhooks", "SSE"],
    icon: "♡",
    status: "In development",
    url: "",
  },
  {
    name: "Iya Ngozi’s Kitchen",
    type: "Ordering & operations",
    desc: "A kitchen ordering backend with menu management, customer orders, staff workflows, authentication and order-status tracking.",
    stack: ["FastAPI", "SQLAlchemy", "Python", "Sessions"],
    icon: "⌂",
    status: "GitHub repository",
    url: "https://github.com/OziokoAnthony/kitchen-site",
  },
  {
    name: "CareKin",
    type: "Health-access product concept",
    desc: "A patient-centred health-access experience designed around crisis support, verified facilities, caregiver access and a protected health passport.",
    stack: ["React", "Product design", "UX", "PRD"],
    icon: "✚",
    status: "Product concept",
    url: "",
  },
  {
    name: "CBT Examination Platform",
    type: "Education technology",
    desc: "A computer-based testing experience with student login, timed examinations, objective and theory assessments, and digital result reporting.",
    stack: ["HTML", "CSS", "JavaScript", "PHP", "MySQL"],
    icon: "◈",
    status: "Project showcase",
    url: "",
  },
  {
    name: "SmartCalc",
    type: "Web application",
    desc: "A responsive calculator project built as a practical exercise in clean interface design and core frontend development.",
    stack: ["JavaScript", "HTML", "Tailwind CSS"],
    icon: "＋",
    status: "Project showcase",
    url: "",
  },
  {
    name: "AfricaPlan",
    type: "Web application",
    desc: "A planning-focused web application concept developed as part of practical software engineering and web development work.",
    stack: ["Python", "Django", "JavaScript"],
    icon: "◎",
    status: "Project showcase",
    url: "",
  },
  {
    name: "Coffee Shop Application",
    type: "Frontend application",
    desc: "A modern coffee-shop interface built to practise component-based frontend development and state-driven user experiences.",
    stack: ["React", "Vite", "Zustand", "TypeScript"],
    icon: "☕",
    status: "Project showcase",
    url: "",
  },
];
const skillGroups = [
  {
    title: "Software development",
    icon: <Code2 />,
    items: [
      "Python",
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "NestJS",
      "Vue.js",
      "FastAPI",
      "Django",
      "HTML & CSS",
      "Tailwind CSS",
    ],
  },
  {
    title: "Data & backend",
    icon: <Database />,
    items: [
      "PostgreSQL",
      "MySQL",
      "SQLAlchemy",
      "REST APIs",
      "ChromaDB",
      "Webhooks",
      "Authentication",
      "Document processing",
    ],
  },
  {
    title: "IT & digital operations",
    icon: <Monitor />,
    items: [
      "Technical support",
      "System troubleshooting",
      "Digital administration",
      "Microsoft Office",
      "Computer training",
      "Workflow improvement",
    ],
  },
  {
    title: "Product & delivery",
    icon: <Layers3 />,
    items: [
      "Product management",
      "Program management",
      "Project design",
      "Requirements gathering",
      "Documentation",
      "Stakeholder coordination",
    ],
  },
];
const experience = [
  [
    "Daughters of Divine Love Congregation",
    "Digital & Operations Officer / Computer Science Teacher",
    "Supporting school technology, digital administration, JAMB/WAEC/NECO registration workflows, ICT instruction and computer-based testing.",
  ],
  [
    "The Eye Specialists’ Hospital",
    "Digital Operations Personnel",
    "Supporting digital operations, administrative technology, records and day-to-day user assistance.",
  ],
  [
    "Love FM Radio Station, Milky Hill Ngwo",
    "Digital Marketer / Digital Operations",
    "Supporting online visibility, digital communication, content distribution and audience engagement.",
  ],
  [
    "Arkland Digital Enterprise",
    "Computer Operator & Trainer",
    "Computer operations, user support and practical digital skills training.",
  ],
];
function Wave() {
  return (
    <div className="wave-wrap" aria-hidden="true">
      <div className="wave wave-one" />
      <div className="wave wave-two" />
      <div className="wave wave-three" />
      <div className="glow-orb orb-a" />
      <div className="glow-orb orb-b" />
    </div>
  );
}
function App() {
  const [menu, setMenu] = useState(false);
  const [filter, setFilter] = useState("All");
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.12 },
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  const categories = ["All", ...new Set(projects.map((p) => p.type))];
  const shown =
    filter === "All" ? projects : projects.filter((p) => p.type === filter);
  const close = () => setMenu(false);
  return (
    <>
      <header className={`header ${scrolled ? "scrolled" : ""}`}>
        <a href="#home" className="brand" onClick={close}>
          <span className="brand-mark">AO</span>
          <span>
            ANTHONY<span className="brand-dot">.</span>
          </span>
        </a>
        <button
          className="mobile-menu"
          onClick={() => setMenu(!menu)}
          aria-label="Toggle navigation"
        >
          {menu ? <X /> : <Menu />}
        </button>
        <nav className={menu ? "nav open" : "nav"}>
          {[
            ["About", "#about"],
            ["Skills", "#skills"],
            ["Projects", "#projects"],
            ["Experience", "#experience"],
            ["Contact", "#contact"],
          ].map(([t, h]) => (
            <a href={h} onClick={close} key={t}>
              {t}
            </a>
          ))}
          <a className="nav-cv" href="/Anthony-Ozioko-CV.pdf" download>
            Download CV <Download size={15} />
          </a>
        </nav>
      </header>
      <main>
        <section className="hero" id="home">
          <Wave />
          <div className="hero-inner">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="pulse" /> OPEN TO OPPORTUNITIES & COLLABORATION
              </div>
              <p className="hello">Hello, I'm</p>
              <h1>
                Anthony <span>Ozioko.</span>
              </h1>
              <h2>
                I build{" "}
                <span className="gradient-text">digital experiences</span>
                <br />
                that make a difference.
              </h2>
              <p className="hero-desc">
                Software developer, IT operations specialist and digital
                professional — bringing ideas to life through thoughtful
                technology, practical problem-solving and a people-first
                approach.
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#projects">
                  Explore my work <ArrowRight size={17} />
                </a>
                <a
                  className="btn btn-outline"
                  href="/Anthony-Ozioko-CV.pdf"
                  download
                >
                  <Download size={17} /> Download CV
                </a>
              </div>
              <div className="hero-social">
                <a
                  href="https://github.com/OziokoAnthony"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                >
                  <Github />
                </a>
                <a href="mailto:oziokoanthony@gmail.com" aria-label="Email">
                  <Mail />
                </a>
                <a href="#contact" aria-label="Contact">
                  <ArrowDown />
                </a>
                <span className="social-line" />
                <small>SCROLL TO DISCOVER</small>
              </div>
            </div>
            <div className="hero-visual">
              <div className="portrait-halo" />
              <div className="portrait-frame">
                <img
                  src="/anthony-profile.jpg"
                  alt="Portrait of Anthony Ozioko"
                />
              </div>
              <div className="float-card card-code">
                <span className="mini-icon">
                  <Code2 size={17} />
                </span>
                <span>
                  <b>Building with purpose</b>
                  <small>Code · Creativity · Impact</small>
                </span>
              </div>
              <div className="float-card card-location">
                <span className="location-dot" />
                <span>
                  <b>Based in Nigeria</b>
                  <small>Working globally</small>
                </span>
              </div>
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
            </div>
          </div>
          <a className="scroll-cue" href="#about">
            <span /> Scroll to explore
          </a>
        </section>
        <section className="intro-strip">
          <div>
            <strong>Software</strong>
            <span>Development</span>
          </div>
          <i />
          <div>
            <strong>Digital</strong>
            <span>Operations</span>
          </div>
          <i />
          <div>
            <strong>Product</strong>
            <span>Thinking</span>
          </div>
          <i />
          <div>
            <strong>People</strong>
            <span>First</span>
          </div>
        </section>
        <section className="section about-section" id="about">
          <div className="section-kicker reveal">01 / ABOUT ME</div>
          <div className="about-grid">
            <div className="section-heading reveal">
              <p className="overline">A little about my journey</p>
              <h2>
                Curiosity turned into a <span>career of creating.</span>
              </h2>
            </div>
            <div className="about-text reveal">
              <p className="lead">
                I’m a technology professional who enjoys turning real-world
                challenges into useful digital solutions.
              </p>
              <p>
                My work sits at the intersection of software development, IT
                operations, education technology and digital product delivery. I
                enjoy building applications, improving workflows, supporting
                people with technology and helping ideas move from concept to
                something useful.
              </p>
              <p>
                From educational platforms and digital administration to backend
                systems and product concepts, I believe good technology should
                be reliable, accessible and built around the people who use it.
              </p>
              <a className="text-link" href="#contact">
                Let's create something meaningful <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
          <div className="value-cards">
            <article className="value-card reveal">
              <span>01</span>
              <Sparkles />
              <h3>Purposeful building</h3>
              <p>
                I care about solving the right problem, not just writing code.
              </p>
            </article>
            <article className="value-card reveal">
              <span>02</span>
              <BriefcaseBusiness />
              <h3>Practical experience</h3>
              <p>I connect technology with real operational and user needs.</p>
            </article>
            <article className="value-card reveal">
              <span>03</span>
              <GraduationCap />
              <h3>Always learning</h3>
              <p>
                I keep growing through hands-on projects, teaching and
                collaboration.
              </p>
            </article>
          </div>
        </section>
        <section className="section skills-section" id="skills">
          <div className="section-kicker reveal">02 / WHAT I WORK WITH</div>
          <div className="section-top reveal">
            <div>
              <p className="overline">My toolkit</p>
              <h2>
                Skills that turn ideas
                <br />
                <span>into outcomes.</span>
              </h2>
            </div>
            <p className="section-note">
              A growing mix of engineering, operations and product skills —
              applied with care and a focus on getting things done.
            </p>
          </div>
          <div className="skill-grid">
            {skillGroups.map((g, i) => (
              <article className="skill-card reveal" key={g.title}>
                <div className="skill-head">
                  <span className="skill-icon">{g.icon}</span>
                  <span className="skill-number">0{i + 1}</span>
                </div>
                <h3>{g.title}</h3>
                <div className="tags">
                  {g.items.map((x) => (
                    <span key={x}>{x}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="section projects-section" id="projects">
          <div className="section-kicker reveal">03 / SELECTED WORK</div>
          <div className="section-top reveal">
            <div>
              <p className="overline">Things I've worked on</p>
              <h2>
                Ideas made <span>practical.</span>
              </h2>
            </div>
            <p className="section-note">
              A selection of applications, product concepts and digital
              solutions across education, operations and everyday life.
            </p>
          </div>
          <div className="filter-row reveal">
            {categories.map((c) => (
              <button
                className={filter === c ? "filter active" : "filter"}
                key={c}
                onClick={() => setFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="project-grid">
            {shown.map((p, i) => (
              <article className="project-card reveal" key={p.name}>
                <div className="project-top">
                  <span className="project-icon">{p.icon}</span>
                  <span className="project-index">
                    0{i + 1 < 10 ? i + 1 : i + 1}
                  </span>
                </div>
                <p className="project-type">{p.type}</p>
                <h3>{p.name}</h3>
                <p className="project-desc">{p.desc}</p>
                <div className="tags">
                  {p.stack.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
                <div className="project-foot">
                  <span>{p.status}</span>
                  {p.url ? (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${p.name}`}
                    >
                      <ArrowUpRight />
                    </a>
                  ) : (
                    <span className="case-note">Case study</span>
                  )}
                </div>
              </article>
            ))}
          </div>
          <p className="project-note">
            Some projects are still being developed or documented. Public
            repository and live-demo links will be added as they become
            available.
          </p>
        </section>
        <section className="section experience-section" id="experience">
          <div className="section-kicker reveal">
            04 / EXPERIENCE & LEARNING
          </div>
          <div className="section-top reveal">
            <div>
              <p className="overline">Where I've contributed</p>
              <h2>
                Experience with a <span>human touch.</span>
              </h2>
            </div>
            <p className="section-note">
              Working with people, systems and digital tools to make everyday
              processes better.
            </p>
          </div>
          <div className="timeline">
            {experience.map(([org, role, desc], i) => (
              <article className="timeline-item reveal" key={org}>
                <div className="timeline-marker" />
                <div className="timeline-content">
                  <span className="timeline-index">0{i + 1}</span>
                  <h3>{role}</h3>
                  <h4>{org}</h4>
                  <p>{desc}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="cert-panel reveal">
            <div>
              <span className="overline">Continued learning</span>
              <h3>
                Learning, growing
                <br />
                and moving forward.
              </h3>
            </div>
            <div className="cert-list">
              {[
                "AWS Level 5 CPE Certification",
                "Software Engineer (FullStack) Certificate",
                "Program Management & Product Design",
                "Global Mentorship Initiative",
                "ALX Software Engineering Programme",
                "Google Digital Skills for Africa",
                "Microsoft Office & Computer Proficiency",
              ].map((x) => (
                <span key={x}>
                  <CheckCircle2 size={16} />
                  {x}
                </span>
              ))}
            </div>
          </div>
        </section>
        <section className="services-band">
          <div className="section-kicker">05 / HOW I CAN HELP</div>
          <h2>
            Good people. Clear ideas.
            <br />
            <span>Useful technology.</span>
          </h2>
          <div className="service-list">
            <span>Web & Software Development</span>
            <span>IT Operations & Technical Support</span>
            <span>Digital Administration</span>
            <span>Computer & ICT Training</span>
            <span>Product & Project Coordination</span>
            <span>Digital Content & Marketing</span>
          </div>
        </section>
        <section className="contact-section" id="contact">
          <Wave />
          <div className="contact-inner">
            <div className="section-kicker reveal">06 / LET'S CONNECT</div>
            <p className="overline reveal">
              Have an idea, opportunity or project?
            </p>
            <h2 className="reveal">
              Let's make something
              <br />
              <span>that matters.</span>
            </h2>
            <p className="contact-copy reveal">
              I’m always happy to connect with thoughtful people, teams and
              organisations working on meaningful ideas.
            </p>
            <a
              className="btn btn-primary contact-btn reveal"
              href="mailto:oziokoanthony@gmail.com?subject=Let's%20work%20together"
            >
              Start a conversation <Send size={17} />
            </a>
            <div className="contact-details reveal">
              <a href="mailto:oziokoanthony@gmail.com">
                <Mail /> oziokoanthony@gmail.com
              </a>
              <a
                href="https://github.com/OziokoAnthony"
                target="_blank"
                rel="noreferrer"
              >
                <Github /> GitHub
              </a>
              <a href="/Anthony-Ozioko-CV.pdf" download>
                <Download /> Download CV
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer className="footer">
        <a href="#home" className="brand">
          <span className="brand-mark">AO</span>
          <span>
            ANTHONY<span className="brand-dot">.</span>
          </span>
        </a>
        <p>Designed with care. Built with purpose.</p>
        <span>© {new Date().getFullYear()} Anthony Ozioko</span>
      </footer>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
