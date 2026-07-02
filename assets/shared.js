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

// ===== Contact / generic form submit =====
function submitForm(btn){
  var original = btn.getAttribute('data-original') || btn.textContent;
  btn.setAttribute('data-original', original);
  btn.textContent = "✓ Message Sent! We'll be in touch shortly.";
  btn.style.background = '#1a6b45';
  btn.disabled = true;
  setTimeout(function() {
    btn.textContent = original;
    btn.style.background = '';
    btn.disabled = false;
  }, 4000);
}

// ===== Newsletter form submit (actually sends via FormSubmit) =====
function submitNewsletter(form){
  var btn = form.querySelector('button');
  var input = form.querySelector('input[type="email"]');
  var email = input.value;
  var original = btn.textContent;

  btn.disabled = true;
  btn.textContent = 'Subscribing…';

  fetch('https://formsubmit.co/ajax/hello@ridgeviewhub.com', {
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
