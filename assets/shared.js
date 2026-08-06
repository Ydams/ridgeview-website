// ===== Mobile menu =====
function toggleMenu(){
  document.getElementById('mobileMenu').classList.toggle('open');
  document.body.classList.toggle('menu-open');
}

// ===== Nav scroll shadow =====
window.addEventListener('scroll', function(){
  var nav = document.getElementById('navbar');
  if (nav) nav.style.boxShadow = window.scrollY > 30 ? '0 4px 24px rgba(0,0,0,.1)' : 'none';
});

// ===== Active nav link (based on current filename) =====
(function(){
  var path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav]').forEach(function(el){
    if (el.getAttribute('data-nav') === path) el.classList.add('active');
  });
})();

// ===== Fade-up reveal on scroll =====
window.addEventListener('load', function() {
  document.body.classList.add('js-ready');
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.fade-up').forEach(function(el) {
    var rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 100) {
      el.classList.add('in');
    } else {
      observer.observe(el);
    }
  });
});

// ===== Contact / generic form submit (sends via Formspree) =====
// Accepts either the <form> element or the submit button, so old markup keeps working.
function submitForm(el){
  var form = (el && el.tagName === 'FORM') ? el : (el && el.closest ? el.closest('form') : null);
  if (!form) return;

  var btn      = form.querySelector('.fsub') || form.querySelector('button[type="submit"]');
  var status   = form.querySelector('.fstatus');
  var endpoint = form.getAttribute('action') || 'https://formspree.io/f/xeozzydb';

  if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;

  var original = btn.getAttribute('data-original') || btn.textContent;
  btn.setAttribute('data-original', original);

  function setStatus(msg, colour){
    if (!status) return;
    status.textContent = msg || '';
    status.style.color = colour || '';
    status.style.display = msg ? 'block' : 'none';
  }

  function reset(delay){
    setTimeout(function(){
      btn.textContent = original;
      btn.style.background = '';
      btn.disabled = false;
    }, delay || 4000);
  }

  btn.disabled = true;
  btn.textContent = 'Sending…';
  btn.style.background = '';
  setStatus('', '');

  fetch(endpoint, {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body: new FormData(form)
  })
  .then(function(res){
    return res.json().catch(function(){ return {}; }).then(function(data){
      return { ok: res.ok, data: data };
    });
  })
  .then(function(result){
    if (!result.ok) {
      var detail = result.data && result.data.errors && result.data.errors.length
        ? result.data.errors.map(function(e){ return e.message; }).join(', ')
        : 'We could not send that message.';
      throw new Error(detail);
    }
    form.reset();
    btn.textContent = "✓ Message sent — we'll be in touch shortly.";
    btn.style.background = '#1a6b45';
    setStatus('Thanks! Your message is with our team. We reply within 24hrs on working days.', '#1a6b45');
    reset(5000);
  })
  .catch(function(err){
    btn.textContent = 'Message not sent — try again';
    btn.style.background = '#b91c1c';
    setStatus((err && err.message ? err.message : 'Something went wrong.') +
              ' You can also reach us on WhatsApp at +234 810 899 1625.', '#b91c1c');
    reset(5000);
  });
}

// ===== Newsletter form submit (actually sends via FormSubmit) =====
function submitNewsletter(form){
  var btn = form.querySelector('button');
  var input = form.querySelector('input[type="email"]');
  var email = input.value;
  var original = btn.textContent;

  btn.disabled = true;
  btn.textContent = 'Subscribing…';

  fetch('https://formspree.io/f/xeozzydb', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      email: email,
      _subject: 'New Newsletter Subscriber - Ridgeview Insights',
      form_name: 'Newsletter Signup'
    })
  })
  .then(function(res){ return res.json(); })
  .then(function(){
    btn.textContent = '✓ Subscribed';
    btn.style.background = '#1a6b45';
    input.value = '';
    setTimeout(function(){
      btn.textContent = original;
      btn.style.background = '';
      btn.disabled = false;
    }, 4000);
  })
  .catch(function(){
    btn.textContent = 'Something went wrong — try again';
    btn.style.background = '#b91c1c';
    setTimeout(function(){
      btn.textContent = original;
      btn.style.background = '';
      btn.disabled = false;
    }, 4000);
  });
}

/* =====================================================================
   RIDGEVIEW ASSISTANT — site-wide support chatbot
   Injects itself into every page that already loads assets/shared.js,
   so no HTML file needs editing. All markup is added after page load,
   which keeps it out of the crawled/indexed content (SEO-safe).
   ===================================================================== */
(function () {
  if (window.__ridgeviewBot) return;
  window.__ridgeviewBot = true;

  var WA_LINK   = 'https://wa.me/2348108991625';
  var MAIL_LINK = 'mailto:contact@ridgeviewinnovations.com';
  var PHONE     = '+234 810 899 1625';

  /* ---------------- Knowledge base ----------------
     Each entry: keys (what a visitor might type), reply (HTML allowed),
     chips (follow-up suggestions). Add or edit entries freely — the
     matcher scores every entry and answers with the best fit.        */
  var KB = [
    {
      keys: ['hi','hello','hey','good morning','good afternoon','good evening','how far','yo','start'],
      reply: "Hi 👋 I'm the Ridgeview assistant. I can help with training programs, enrollment, agency services, and partnerships. What would you like to know?",
      chips: ['See all programs', 'How do I enroll?', 'Hire the agency', 'Talk to a human']
    },
    {
      keys: ['what is ridgeview','who are you','about you','about ridgeview','about the company','what do you do','tell me about ridgeview'],
      reply: "Ridgeview Innovations Hub Ltd is a CAC-registered digital skills academy <em>and</em> IT agency in Lagos.<br><br>Two arms, one roof: the <strong>Academy</strong> trains people in practical tech skills, and the <strong>Agency</strong> builds real digital products for businesses. Academy graduates intern on live agency projects, which keeps our training practical and our pricing competitive.",
      chips: ['See all programs', 'Agency services', 'Our core values']
    },
    {
      keys: ['programs','program','courses','course','training','tracks','learn','what can i learn','study'],
      reply: "We run <strong>7 hands-on programs</strong>, all 70% practical / 30% theory with a capstone project:<br>• UI/UX Design — 3–6 months<br>• Software Engineering (Frontend · Backend · Fullstack) — 3–6 months<br>• Data Analysis — 3–4 months<br>• Cybersecurity — 4–6 months<br>• Digital Marketing — 2–3 months<br>• AI Tools &amp; No-Code — 6–8 weeks<br><br><a href=\"programs.html\">See full program details →</a>",
      chips: ['UI/UX Design', 'Software Engineering', 'Cybersecurity', 'How do I enroll?']
    },
    {
      keys: ['ui ux','uiux','ui/ux','design course','figma','product design','user experience'],
      reply: "<strong>UI/UX Design</strong> — 3–6 months, beginner friendly.<br>You'll cover user research and wireframing, Figma prototyping and design systems, usability testing, and developer handoff. It ends with a capstone project for your portfolio.<br><br><a href=\"programs.html#uiux\">Program details →</a>",
      chips: ['How do I enroll?', 'What does it cost?', 'Are classes virtual?']
    },
    {
      keys: ['software engineering','coding','programming','developer','frontend','backend','fullstack','javascript','web development course'],
      reply: "<strong>Software Engineering</strong> — 3–6 months, with Frontend, Backend and Fullstack tracks.<br>You'll cover modern JavaScript and frameworks, APIs, databases and deployment, plus Git workflows and code review.<br><br><a href=\"programs.html#swe\">Program details →</a>",
      chips: ['How do I enroll?', 'What does it cost?', 'Internship pathway']
    },
    {
      keys: ['data analysis','data analyst','data','sql','excel','python','power bi','analytics course'],
      reply: "<strong>Data Analysis</strong> — 3–4 months.<br>Excel and SQL for analysis, Python for data manipulation, then dashboards and storytelling with data. No statistics degree required.<br><br><a href=\"programs.html#data\">Program details →</a>",
      chips: ['How do I enroll?', 'Are classes virtual?', 'Payment plans']
    },
    {
      keys: ['cybersecurity','cyber','security course','ethical hacking','penetration testing','pentest'],
      reply: "<strong>Cybersecurity</strong> — 4–6 months, one of our highest-demand tracks.<br>Network and system security fundamentals, ethical hacking and penetration testing basics, security audits and incident response.<br><br><a href=\"programs.html#cyber\">Program details →</a>",
      chips: ['How do I enroll?', 'Security audit for my business', 'Payment plans']
    },
    {
      keys: ['digital marketing','marketing','seo course','social media','ads','content'],
      reply: "<strong>Digital Marketing</strong> — 2–3 months, built for SMEs and freelancers.<br>SEO and content strategy, paid social and search ads, then analytics and campaign reporting.<br><br><a href=\"programs.html#marketing\">Program details →</a>",
      chips: ['How do I enroll?', 'Corporate training', 'Payment plans']
    },
    {
      keys: ['ai','artificial intelligence','no code','nocode','automation','prompt','chatgpt','ai tools'],
      reply: "<strong>AI Tools &amp; No-Code</strong> — 6–8 weeks, our shortest track.<br>Prompt engineering and AI workflows, no-code app and automation builders, and shipping a real AI-powered mini product.<br><br><a href=\"programs.html#ai\">Program details →</a>",
      chips: ['How do I enroll?', 'What does it cost?', 'Are classes virtual?']
    },
    {
      keys: ['price','pricing','cost','fee','fees','how much','tuition','charges','budget','quote','naira'],
      reply: "Pricing depends on the program or project scope, so we quote directly rather than publish a flat rate — and <strong>flexible payment plans are available across all programs</strong>.<br><br>Tell us what you need through the <a href=\"contact.html\">contact form</a> or WhatsApp <strong>" + PHONE + "</strong> and you'll get a clear quote back.",
      chips: ['Payment plans', 'Talk to a human', 'Request a project quote']
    },
    {
      keys: ['payment plan','payment plans','installment','instalment','pay in bits','spread payment','part payment'],
      reply: "Yes — flexible payment plans run across all programs. Mention it when you reach out and the admissions team will share the options that fit your cohort.<br><br><a href=\"contact.html\">Start here →</a>",
      chips: ['How do I enroll?', 'See all programs', 'Talk to a human']
    },
    {
      keys: ['enroll','enrol','enrollment','register','registration','apply','sign up','join a program','admission','how do i start'],
      reply: "Enrolling takes three steps:<br>1. Pick your program on the <a href=\"programs.html\">Programs page</a><br>2. Fill the <a href=\"contact.html\">contact form</a> and select the program under “I'm interested in…”, or message WhatsApp <strong>" + PHONE + "</strong><br>3. Admissions walks you through cohort dates and payment plans<br><br>You'll hear back within 24hrs on working days.<br><br>Looking for a <em>job</em> instead? <a href=\"careers.html\">See open roles →</a>",
      chips: ['See all programs', 'Payment plans', 'Are classes virtual?']
    },
    {
      keys: ['virtual','online','remote','physical','in person','onsite','class format','hybrid','location of classes'],
      reply: "Most programs run both ways — physically in Lagos and virtually — depending on the cohort. Tell admissions which suits you and they'll confirm what's open for the intake you're joining.",
      chips: ['How do I enroll?', 'Where are you located?', 'See all programs']
    },
    {
      keys: ['certificate','certification','certified','accredited','recognised','recognized'],
      reply: "Every participant who completes a program receives a Ridgeview certificate, backed by a CAC-registered institution (RC No. 9393238). You also finish with a real capstone project, which is usually what hiring managers actually want to see.",
      chips: ['See all programs', 'Internship pathway', 'How do I enroll?']
    },
    {
      keys: ['internship','intern','job placement','placement','career support','get a job','employment','hire me'],
      reply: "Top-performing students are selected for <strong>paid internships</strong> inside the Ridgeview Digital Agency, working on live client projects. Strong interns are then considered for full-time roles as the agency scales.<br><br>Every graduate also gets career support and joins the alumni network. <a href=\"careers.html\">See the pipeline →</a> or <a href=\"apply.html\">apply directly →</a>",
      chips: ['Open roles', 'See all programs', 'How do I enroll?']
    },
    {
      keys: ['services','agency','website','build a website','build me a website','web design','website development','web app','ecommerce','e commerce','landing page','app development','software development','branding','logo','it consulting','it support','maintenance','hosting'],
      reply: "The Ridgeview Digital Agency handles:<br>• <strong>Website design &amp; development</strong> — corporate sites, e-commerce, landing pages, web apps<br>• <strong>UI/UX &amp; brand design</strong> — identity, product design, design systems<br>• <strong>Cybersecurity &amp; IT consulting</strong> — audits, advisory, automation, security policy<br>• <strong>Maintenance &amp; IT support</strong> — monthly retainers, hosting and domain management<br><br><a href=\"services.html\">See all services →</a>",
      chips: ['Request a project quote', 'Security audit for my business', 'How you work with clients']
    },
    {
      keys: ['project quote','request a quote','my project','build for me','work with you','hire you','hire the agency','proposal','scope'],
      reply: "Happy to scope it. Send us what you're building through the <a href=\"contact.html\">contact form</a> — pick “Website / web app development” or whichever fits — and you'll get a scope and quote back.<br><br>Prefer to talk it through? WhatsApp <strong>" + PHONE + "</strong>.",
      chips: ['How you work with clients', 'Agency services', 'Talk to a human']
    },
    {
      keys: ['how you work','your process','process','timeline','how long does a project take','steps'],
      reply: "Four stages, and you see work at every one:<br><strong>1. Discover</strong> — we learn your business, goals and constraints first<br><strong>2. Design</strong> — wireframes and visual direction shared early<br><strong>3. Build</strong> — regular check-ins and demo milestones<br><strong>4. Launch &amp; support</strong> — we launch with you, then stay on for maintenance if you need it",
      chips: ['Request a project quote', 'Agency services', 'Talk to a human']
    },
    {
      keys: ['security audit','audit','protect my business','hacked','vulnerability','data protection'],
      reply: "We run cybersecurity audits and ongoing IT advisory for organisations — including system automation and security policy setup, with retainer options for continuous cover.<br><br><a href=\"services.html#security\">Details →</a> or send your requirements via the <a href=\"contact.html\">contact form</a>.",
      chips: ['Request a project quote', 'Agency services', 'Talk to a human']
    },
    {
      keys: ['school','schools','university','polytechnic','institution','students partnership','school partnership','curriculum','workshop'],
      reply: "We partner with secondary schools, universities and polytechnics — from a one-off workshop series to a full-term program to year-round curriculum integration. Institutional pricing sits well below individual rates, and you get a single point of contact for scheduling and reporting.<br><br><a href=\"schools-partnership.html\">See partnership tiers →</a>",
      chips: ['Corporate training', 'Talk to a human', 'How you work with clients']
    },
    {
      keys: ['corporate training','company training','staff training','team training','train my staff','train my team','my company','upskill my team','business training','b2b'],
      reply: "Corporate training packages are available and customised after a short consultation — we shape the tracks around what your team actually needs.<br><br>Select “Corporate training” on the <a href=\"contact.html\">contact form</a> and we'll come back with options.",
      chips: ['See all programs', 'Schools partnership', 'Talk to a human']
    },
    {
      keys: ['careers','career','jobs','job','vacancy','vacancies','open roles','hiring','work at ridgeview','volunteer','apply for a job','cv','resume'],
      reply: "We hire in small batches as cohorts and client projects grow. Currently listed: Frontend Developer Intern, UI/UX Design Facilitator, Digital Marketing Associate, Community &amp; Events Coordinator — plus an open general application.<br><br><a href=\"careers.html\">See open roles →</a> or <a href=\"apply.html\">start an application →</a>",
      chips: ['Internship pathway', 'Talk to a human', 'What is Ridgeview?']
    },
    {
      keys: ['community','events','meetup','network','bootcamp','hangout','alumni'],
      reply: "The community side runs events, bootcamps and peer networks so learning doesn't stop at the classroom door — every cohort is built to leave you with a network, not just a certificate.<br><br><a href=\"community.html\">Explore the community →</a>",
      chips: ['See all programs', 'Schools partnership', 'Talk to a human']
    },
    {
      keys: ['location','address','where are you','office','based','lagos','directions','visit'],
      reply: "We're based in <strong>Lagos, Nigeria</strong>, and we deliver virtually across the country too.<br><br>For a physical appointment, message WhatsApp <strong>" + PHONE + "</strong> and the team will confirm a time.",
      chips: ['Are classes virtual?', 'Talk to a human', 'How do I enroll?']
    },
    {
      keys: ['contact','phone','email','whatsapp','call','reach you','get in touch','talk to a human','speak to someone','agent','representative','customer service'],
      reply: "Here's the quickest way to reach a person:<br>• WhatsApp / phone: <a href=\"" + WA_LINK + "\" target=\"_blank\" rel=\"noopener\"><strong>" + PHONE + "</strong></a><br>• Email: <a href=\"" + MAIL_LINK + "\">contact@ridgeviewinnovations.com</a><br>• Or the <a href=\"contact.html\">contact form</a><br><br>We reply within 24hrs, Monday to Friday.",
      chips: ['See all programs', 'Agency services', 'How do I enroll?']
    },
    {
      keys: ['response time','how long to reply','when will you reply','when do you reply','how fast do you reply','working hours','opening hours'],
      reply: "We reply within 24hrs on working days, Monday to Friday. Anything urgent is fastest on WhatsApp: <strong>" + PHONE + "</strong>.",
      chips: ['Talk to a human', 'How do I enroll?']
    },
    {
      keys: ['rc number','registered','cac','registration','legit','real company','tin','incorporated','cama'],
      reply: "Ridgeview Innovations Hub Ltd is incorporated under the Companies and Allied Matters Act 2020.<br>• <strong>RC No. 9393238</strong><br>• Incorporated 5th March, 2026<br>• TIN: 2622456605384<br><br>So yes — a real institution you can hold a contract with.",
      chips: ['What is Ridgeview?', 'Agency services', 'Talk to a human']
    },
    {
      keys: ['values','core values','mission','vision','why ridgeview','what makes you different','our core values'],
      reply: "Our mission is to equip individuals and businesses with practical digital skills and solutions that improve employability and growth — and our vision is to become a leading innovation hub in Africa.<br><br>Day to day that shows up as: practicality, integrity, community, access, innovation and excellence.<br><br><a href=\"about.html\">Read our full story →</a>",
      chips: ['See all programs', 'Agency services', 'How do I enroll?']
    },
    {
      keys: ['thanks','thank you','thanks a lot','appreciate','nice one','ok thanks','cheers'],
      reply: "Anytime 🙌 If you'd like a person to pick it up from here, WhatsApp <strong>" + PHONE + "</strong> or use the <a href=\"contact.html\">contact form</a>.",
      chips: ['See all programs', 'Talk to a human']
    },
    {
      keys: ['bye','goodbye','see you','later','that is all','no thanks'],
      reply: "Thanks for stopping by — good luck with whatever you're building. The <a href=\"contact.html\">contact form</a> is here whenever you're ready.",
      chips: ['See all programs', 'Agency services']
    }
  ];

  var FALLBACK = "I'm not sure I have that one yet. I'm best on programs, fees and enrollment, agency services, schools partnerships and careers.<br><br>For anything else, a person will pick it up — WhatsApp <a href=\"" + WA_LINK + "\" target=\"_blank\" rel=\"noopener\"><strong>" + PHONE + "</strong></a> or the <a href=\"contact.html\">contact form</a>.";
  var FALLBACK_CHIPS = ['See all programs', 'What does it cost?', 'Agency services', 'Talk to a human'];

  var OPENING_CHIPS = ['See all programs', 'What does it cost?', 'How do I enroll?', 'Hire the agency'];

  /* ---------------- Matching ---------------- */
  function normalise(text){
    return ' ' + String(text).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  }

  function findAnswer(text){
    var input = normalise(text);
    var best = null, bestScore = 0;

    KB.forEach(function(entry){
      var score = 0;
      entry.keys.forEach(function(key){
        var k = normalise(key).trim();
        var words = k.split(' ');
        // match the key, and tolerate a simple plural on the last word
        if (input.indexOf(' ' + k + ' ') > -1 || input.indexOf(' ' + k + 's ') > -1) {
          score += words.length * 2;
        }
      });
      if (score > bestScore) { bestScore = score; best = entry; }
    });

    return best || { reply: FALLBACK, chips: FALLBACK_CHIPS };
  }

  /* ---------------- Styles (scoped with rv- prefix) ---------------- */
  var CSS = [
    '.rv-launch{position:fixed;right:22px;bottom:22px;z-index:9998;width:60px;height:60px;border:none;border-radius:50%;background:#004aad;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 30px rgba(0,74,173,.38);transition:transform .25s ease,background .2s ease}',
    '.rv-launch:hover{background:#003585;transform:translateY(-3px)}',
    '.rv-launch svg{width:26px;height:26px;pointer-events:none}',
    '.rv-launch .rv-x{display:none}',
    '.rv-launch.rv-open .rv-x{display:block}',
    '.rv-launch.rv-open .rv-bubble{display:none}',
    '.rv-dot{position:absolute;top:2px;right:2px;width:13px;height:13px;border-radius:50%;background:#ff6b2b;border:2px solid #fff}',
    '.rv-launch.rv-open .rv-dot{display:none}',
    '.rv-panel{position:fixed;right:22px;bottom:94px;z-index:9999;width:372px;max-width:calc(100vw - 32px);height:540px;max-height:calc(100vh - 130px);background:#f7f9ff;border:1px solid rgba(0,74,173,.14);border-radius:20px;box-shadow:0 26px 70px rgba(0,20,60,.24);display:flex;flex-direction:column;overflow:hidden;opacity:0;visibility:hidden;transform:translateY(14px) scale(.98);transition:opacity .22s ease,transform .22s ease,visibility .22s}',
    '.rv-panel.rv-open{opacity:1;visibility:visible;transform:none}',
    '.rv-head{background:#004aad;color:#fff;padding:16px 18px;display:flex;align-items:center;gap:12px;flex-shrink:0}',
    '.rv-ava{width:38px;height:38px;border-radius:12px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.rv-ava svg{width:20px;height:20px}',
    '.rv-head strong{font-family:Inter,system-ui,sans-serif;font-size:15px;font-weight:700;display:block;line-height:1.25}',
    '.rv-head span{font-family:Inter,system-ui,sans-serif;font-size:12px;color:rgba(255,255,255,.72);display:flex;align-items:center;gap:6px}',
    '.rv-live{width:7px;height:7px;border-radius:50%;background:#4ade80;display:inline-block}',
    '.rv-close{margin-left:auto;background:none;border:none;color:rgba(255,255,255,.8);cursor:pointer;padding:6px;border-radius:8px;line-height:0}',
    '.rv-close:hover{background:rgba(255,255,255,.14);color:#fff}',
    '.rv-close svg{width:18px;height:18px}',
    '.rv-log{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth}',
    '.rv-msg{max-width:86%;padding:12px 15px;border-radius:16px;font-family:Inter,system-ui,sans-serif;font-size:14px;line-height:1.55;word-wrap:break-word}',
    '.rv-bot{background:#fff;border:1px solid rgba(0,74,173,.12);color:#222221;border-bottom-left-radius:5px;align-self:flex-start}',
    '.rv-me{background:#004aad;color:#fff;border-bottom-right-radius:5px;align-self:flex-end}',
    '.rv-msg a{color:#004aad;font-weight:700;text-decoration:underline}',
    '.rv-me a{color:#fff}',
    '.rv-typing{align-self:flex-start;background:#fff;border:1px solid rgba(0,74,173,.12);border-radius:16px;border-bottom-left-radius:5px;padding:14px 16px;display:flex;gap:5px}',
    '.rv-typing i{width:6px;height:6px;border-radius:50%;background:#5a6072;display:block;animation:rvBounce 1.2s infinite}',
    '.rv-typing i:nth-child(2){animation-delay:.18s}.rv-typing i:nth-child(3){animation-delay:.36s}',
    '@keyframes rvBounce{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}}',
    '.rv-chips{display:flex;flex-wrap:wrap;gap:7px;padding:0 18px 12px}',
    '.rv-chip{background:#e6eeff;border:1px solid rgba(0,74,173,.2);color:#004aad;font-family:Inter,system-ui,sans-serif;font-size:12.5px;font-weight:600;padding:7px 13px;border-radius:50px;cursor:pointer;transition:background .18s ease,color .18s ease}',
    '.rv-chip:hover{background:#004aad;color:#fff}',
    '.rv-form{display:flex;gap:9px;padding:12px 14px;background:#fff;border-top:1px solid rgba(0,74,173,.12);flex-shrink:0}',
    '.rv-form input{flex:1;border:1.5px solid rgba(0,74,173,.14);background:#f7f9ff;border-radius:50px;padding:11px 16px;font-family:Inter,system-ui,sans-serif;font-size:14px;color:#222221;outline:none;min-width:0}',
    '.rv-form input:focus{border-color:#004aad}',
    '.rv-send{width:42px;height:42px;flex-shrink:0;border:none;border-radius:50%;background:#004aad;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s}',
    '.rv-send:hover{background:#003585}',
    '.rv-send svg{width:18px;height:18px}',
    '.rv-foot{padding:0 16px 12px;background:#fff;font-family:Inter,system-ui,sans-serif;font-size:11.5px;color:#5a6072;text-align:center}',
    '.rv-foot a{color:#004aad;font-weight:700}',
    '@media(max-width:560px){.rv-panel{right:14px;left:14px;bottom:88px;width:auto;height:min(72vh,520px)}.rv-launch{right:16px;bottom:16px}}',
    '@media(prefers-reduced-motion:reduce){.rv-panel,.rv-launch{transition:none}.rv-typing i{animation:none}.rv-log{scroll-behavior:auto}}'
  ].join('');

  /* ---------------- Build ---------------- */
  function build(){
    var style = document.createElement('style');
    style.setAttribute('data-ridgeview-bot', '');
    style.appendChild(document.createTextNode(CSS));
    document.head.appendChild(style);

    var launcher = document.createElement('button');
    launcher.className = 'rv-launch';
    launcher.type = 'button';
    launcher.setAttribute('aria-label', 'Open the Ridgeview assistant');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.innerHTML =
      '<span class="rv-dot"></span>' +
      '<svg class="rv-bubble" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' +
      '<svg class="rv-x" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

    var panel = document.createElement('div');
    panel.className = 'rv-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Ridgeview assistant');
    panel.innerHTML =
      '<div class="rv-head">' +
        '<div class="rv-ava"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></div>' +
        '<div><strong>Ridgeview Assistant</strong><span><i class="rv-live"></i> Answers instantly · Mon–Fri support</span></div>' +
        '<button class="rv-close" type="button" aria-label="Close the assistant"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
      '</div>' +
      '<div class="rv-log" role="log" aria-live="polite"></div>' +
      '<div class="rv-chips"></div>' +
      '<form class="rv-form">' +
        '<input type="text" autocomplete="off" placeholder="Ask about programs, fees, services…" aria-label="Type your question"/>' +
        '<button class="rv-send" type="submit" aria-label="Send message"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>' +
      '</form>' +
      '<div class="rv-foot">Prefer a person? <a href="' + WA_LINK + '" target="_blank" rel="noopener">WhatsApp us</a> · <a href="contact.html">Contact form</a></div>';

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    var log    = panel.querySelector('.rv-log');
    var chips  = panel.querySelector('.rv-chips');
    var form   = panel.querySelector('.rv-form');
    var input  = panel.querySelector('.rv-form input');
    var closer = panel.querySelector('.rv-close');
    var started = false;

    function scroll(){ log.scrollTop = log.scrollHeight; }

    function escapeHtml(str){
      return String(str).replace(/[&<>"']/g, function(c){
        return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
      });
    }

    function addMsg(html, who){
      var el = document.createElement('div');
      el.className = 'rv-msg ' + (who === 'me' ? 'rv-me' : 'rv-bot');
      el.innerHTML = html;
      log.appendChild(el);
      scroll();
      return el;
    }

    function setChips(list){
      chips.innerHTML = '';
      (list || []).forEach(function(label){
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'rv-chip';
        b.textContent = label;
        b.addEventListener('click', function(){ send(label); });
        chips.appendChild(b);
      });
    }

    function reply(text){
      setChips([]);
      var dots = document.createElement('div');
      dots.className = 'rv-typing';
      dots.innerHTML = '<i></i><i></i><i></i>';
      log.appendChild(dots);
      scroll();

      setTimeout(function(){
        dots.remove();
        var match = findAnswer(text);
        addMsg(match.reply, 'bot');
        setChips(match.chips || FALLBACK_CHIPS);
      }, 520);
    }

    function send(text){
      var value = String(text || '').trim();
      if (!value) return;
      addMsg(escapeHtml(value), 'me');
      input.value = '';
      reply(value);
    }

    function open(){
      panel.classList.add('rv-open');
      launcher.classList.add('rv-open');
      launcher.setAttribute('aria-expanded', 'true');
      launcher.setAttribute('aria-label', 'Close the Ridgeview assistant');
      if (!started){
        started = true;
        addMsg("Hi 👋 Welcome to <strong>Ridgeview Innovations Hub</strong>.<br><br>I can help with training programs, fees and enrollment, agency services, and schools or corporate partnerships. What brings you here today?", 'bot');
        setChips(OPENING_CHIPS);
      }
      setTimeout(function(){ input.focus(); }, 240);
    }

    function close(){
      panel.classList.remove('rv-open');
      launcher.classList.remove('rv-open');
      launcher.setAttribute('aria-expanded', 'false');
      launcher.setAttribute('aria-label', 'Open the Ridgeview assistant');
    }

    launcher.addEventListener('click', function(){
      panel.classList.contains('rv-open') ? close() : open();
    });
    closer.addEventListener('click', close);
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && panel.classList.contains('rv-open')) close();
    });
    form.addEventListener('submit', function(e){
      e.preventDefault();
      send(input.value);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();

/* =====================================================================
   JOB APPLICATION MODAL — site-wide

   1. Injects one application modal into every page that loads shared.js
   2. Any link/button with data-apply="Role Name" opens it, role locked in
   3. Submits to Formspree, so you get an email the moment someone applies
   4. Deep links: careers.html?role=Frontend%20Developer%20Intern opens the
      modal automatically. apply.html?role=... is the standalone shareable page.
   5. With JavaScript off, the Apply links simply navigate to apply.html
   ===================================================================== */
(function () {
  if (window.__rvApplyModal) return;
  window.__rvApplyModal = true;

  var ENDPOINT = 'https://formspree.io/f/xeozzydb';
  var WA_LINK  = 'https://wa.me/2348108991625';

  var ov, titleEl, roleInput, subjInput, form, opener;

  /* ---------- Shared submit handler (apply.html uses this too) ---------- */
  function submitApplication(theForm) {
    var btn      = theForm.querySelector('.fsub');
    var status   = theForm.querySelector('.fstatus');
    var endpoint = theForm.getAttribute('action') || ENDPOINT;

    if (typeof theForm.reportValidity === 'function' && !theForm.reportValidity()) return;

    var original = btn.getAttribute('data-original') || btn.textContent;
    btn.setAttribute('data-original', original);

    function setStatus(msg, colour) {
      if (!status) return;
      status.textContent = msg || '';
      status.style.color = colour || '';
      status.style.display = msg ? 'block' : 'none';
    }

    function reset(delay) {
      setTimeout(function () {
        btn.textContent = original;
        btn.style.background = '';
        btn.disabled = false;
      }, delay || 5000);
    }

    // Stamp the role onto the email subject so you can triage at a glance
    var roleField = theForm.querySelector('[name="Role"]');
    var subject   = theForm.querySelector('[name="_subject"]');
    var roleValue = roleField ? roleField.value : '';
    if (subject) {
      subject.value = 'New Job Application — ' + (roleValue || 'General Application');
    }

    btn.disabled = true;
    btn.textContent = 'Sending…';
    btn.style.background = '';
    setStatus('', '');

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(theForm)
    })
    .then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        return { ok: res.ok, data: data };
      });
    })
    .then(function (result) {
      if (!result.ok) {
        var detail = result.data && result.data.errors && result.data.errors.length
          ? result.data.errors.map(function (e) { return e.message; }).join(', ')
          : 'We could not send that application.';
        throw new Error(detail);
      }
      theForm.reset();
      // keep the role visible after reset so the applicant sees what was sent
      if (roleField && roleField.tagName === 'INPUT') roleField.value = roleValue;
      btn.textContent = '✓ Application received';
      btn.style.background = '#1a6b45';
      setStatus('Thank you — your application is with our team. Shortlisted candidates are contacted within 5 working days.', '#1a6b45');
      reset(6000);
    })
    .catch(function (err) {
      btn.textContent = 'Not sent — try again';
      btn.style.background = '#b91c1c';
      setStatus((err && err.message ? err.message : 'Something went wrong.') +
                ' You can also send it on WhatsApp: +234 810 899 1625.', '#b91c1c');
      reset(5000);
    });
  }
  window.submitApplication = submitApplication;

  /* ---------- Modal markup ---------- */
  function buildApply() {
    ov = document.createElement('div');
    ov.className = 'rva-ov';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'Job application form');
    ov.innerHTML =
      '<div class="rva-panel">' +
        '<div class="rva-head">' +
          '<span class="rva-tag">Apply</span>' +
          '<h3 class="rva-title">General Application</h3>' +
          '<p>Takes about two minutes. We reply to shortlisted candidates within 5 working days.</p>' +
          '<button class="rva-x" type="button" aria-label="Close application form">' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="rva-body">' +
          '<form action="' + ENDPOINT + '" method="POST" novalidate>' +
            '<input type="hidden" name="_subject" value="New Job Application">' +
            '<input type="hidden" name="form_name" value="Job Application">' +
            '<div class="fg">' +
              '<label>Role you are applying for</label>' +
              '<input type="text" name="Role" readonly required>' +
            '</div>' +
            '<div class="frow">' +
              '<div class="fg"><label>Full name</label><input type="text" name="Full name" required placeholder="Your full name"></div>' +
              '<div class="fg"><label>Email</label><input type="email" name="email" required placeholder="you@email.com"></div>' +
            '</div>' +
            '<div class="frow">' +
              '<div class="fg"><label>Phone / WhatsApp</label><input type="tel" name="Phone" required placeholder="+234 800 000 0000"></div>' +
              '<div class="fg"><label>Portfolio, LinkedIn or CV link</label><input type="url" name="CV or portfolio link" placeholder="https://"></div>' +
            '</div>' +
            '<div class="fg">' +
              '<label>Why are you a good fit?</label>' +
              '<textarea name="Message" required placeholder="A short paragraph is enough — tell us what you have built or taught." style="min-height:104px"></textarea>' +
            '</div>' +
            '<button type="submit" class="fsub">Submit Application</button>' +
            '<div class="fstatus"></div>' +
            '<p class="rva-note">Prefer to send it another way? <a href="' + WA_LINK + '" target="_blank" rel="noopener">WhatsApp us</a>.</p>' +
          '</form>' +
        '</div>' +
      '</div>';

    document.body.appendChild(ov);

    titleEl   = ov.querySelector('.rva-title');
    roleInput = ov.querySelector('[name="Role"]');
    subjInput = ov.querySelector('[name="_subject"]');
    form      = ov.querySelector('form');

    ov.querySelector('.rva-x').addEventListener('click', closeApply);
    ov.addEventListener('click', function (e) { if (e.target === ov) closeApply(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && ov.classList.contains('open')) closeApply();
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitApplication(form);
    });

    // Any element carrying data-apply opens the modal instead of navigating
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest ? e.target.closest('[data-apply]') : null;
      if (!trigger) return;
      e.preventDefault();
      opener = trigger;
      openApply(trigger.getAttribute('data-apply'));
    });

    // Deep link support: ?role=Frontend%20Developer%20Intern
    // Skipped on apply.html, which renders the form inline instead.
    var page = window.location.pathname.split('/').pop() || 'index.html';
    if (page.indexOf('apply') !== 0) {
      var role = new URLSearchParams(window.location.search).get('role');
      if (role) setTimeout(function () { openApply(role); }, 260);
    }
  }

  function openApply(role) {
    var name = (role || '').trim() || 'General Application';
    titleEl.textContent = name;
    roleInput.value = name;
    subjInput.value = 'New Job Application — ' + name;
    ov.classList.add('open');
    document.body.classList.add('rva-locked');
    setTimeout(function () {
      var first = form.querySelector('[name="Full name"]');
      if (first) first.focus();
    }, 240);
  }

  function closeApply() {
    ov.classList.remove('open');
    document.body.classList.remove('rva-locked');
    if (opener && opener.focus) opener.focus();
  }

  window.openApplyForm = openApply;   // call openApplyForm('Role') from anywhere

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildApply);
  } else {
    buildApply();
  }
})();
