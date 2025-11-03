//-----------------------------------------------------dark/light theme switch
const themeSwitch = document.getElementById('theme-switch');

// Get stored theme preference
let darkmode = localStorage.getItem('darkmode');

const enableDarkmode = () => {
    document.body.classList.add('dark-mode');
    themeSwitch.classList.add('dark-mode');
    themeSwitch.classList.remove('light-mode');
    localStorage.setItem('darkmode', 'active');

    // Switch icons
    themeSwitch.querySelectorAll('.switch-icon')[0].classList.remove('active');
    themeSwitch.querySelectorAll('.switch-icon')[1].classList.add('active');
}

const disableDarkmode = () => {
    document.body.classList.remove('dark-mode');
    themeSwitch.classList.add('light-mode');
    themeSwitch.classList.remove('dark-mode');
    localStorage.setItem('darkmode', 'inactive');

    // Switch icons
    themeSwitch.querySelectorAll('.switch-icon')[0].classList.add('active');
    themeSwitch.querySelectorAll('.switch-icon')[1].classList.remove('active');
}

// 🟢 Apply theme on page load
if (darkmode === 'active') {
    enableDarkmode();
} else {
    disableDarkmode();
}

// 🟡 Toggle when clicked
themeSwitch.addEventListener('click', () => {
    darkmode = localStorage.getItem('darkmode');
    darkmode !== 'active' ? enableDarkmode() : disableDarkmode();
});
//-----------------------------------------------------dark/light theme switch

// ===== Therapist data (same as psyted.js) =====
const therapists = [
  {id: 't1', name:'Dr. Anjana S', title:'Clinical Psychologist', lang:['Malayalam','English'], tags:['Anxiety','Depression'], price:800, rating:4.8, bio:'Specializes in mood disorders, CBT, and grief counseling. With over 8 years of experience, Dr. Anjana provides compassionate support for individuals dealing with anxiety, depression, and loss.', img:'anjana.PNG'},
  {id: 't2', name:'Mr. Ravi K', title:'Counselling Psychologist', lang:['Malayalam','Hindi'], tags:['Couples','Relationship'], price:700, rating:4.6, bio:'Experience in relationship therapy & emotional regulation. Ravi helps couples and individuals build stronger connections and navigate interpersonal challenges with empathy and understanding.', img:'ravi.PNG'},
  {id: 't3', name:'Ms. Leena P', title:'Sexual Wellness Therapist', lang:['English','Malayalam'], tags:['Sexual','Trauma'], price:900, rating:4.9, bio:'Queer-affirmative therapy and sexual health. Leena is a specialized therapist providing safe, inclusive support for sexual wellness and trauma recovery in a judgment-free environment.', img:'leena.PNG'},
  {id: 't4', name:'Dr. Suresh M', title:'Psychiatric Social Worker', lang:['English','Hindi'], tags:['Child','ADHD'], price:650, rating:4.5, bio:'Work with families and children. Dr. Suresh brings extensive experience in child development, ADHD support, and family counseling to help young minds thrive.', img:'suresh.PNG'},
  {id: 't5', name:'Ms. Nisha R', title:'Clinical Psychologist', lang:['Malayalam','English'], tags:['Anxiety','Depression','Trauma'], price:750, rating:4.7, bio:'Trauma-informed therapy & EMDR trained. Nisha provides evidence-based treatment for trauma, anxiety, and depression, helping clients heal and regain their strength.', img:'nisha.PNG'},
  {id: 't6', name:'Ms. Mephy R', title:'Clinical Psychologist', lang:['Malayalam','English'], tags:['Couples','Relationship'], price:700, rating:4.7, bio:'Experience in relationship therapy & emotional regulation. Mephy specializes in helping couples communicate better, resolve conflicts, and strengthen their bonds.', img:'mephy.PNG'},
];

// ===== Utilities =====
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

function formatPrice(p){ return '₹' + p; }

function el(tag, props={}, ...children){
  const e = document.createElement(tag);
  for(const k in props){
    if(k.startsWith('on') && typeof props[k]==='function') e.addEventListener(k.slice(2).toLowerCase(), props[k]);
    else if(k==='html') e.innerHTML = props[k];
    else e.setAttribute(k, props[k]);
  }
  for(const c of children) if(typeof c === 'string') e.appendChild(document.createTextNode(c)); else if(c) e.appendChild(c);
  return e;
}

// ===== Render therapists =====
const grid = $('#therapistGrid');
const countSpan = $('#count');

function renderTherapists(list){
  grid.innerHTML = '';
  
  if(list.length === 0) {
    const noResults = el('div', {class: 'no-results'},
      el('h3', {}, 'No therapists found'),
      el('p', {}, 'Try adjusting your filters to see more therapists.')
    );
    grid.appendChild(noResults);
    countSpan.textContent = '0';
    return;
  }

  list.forEach(t=>{
    // Card header with avatar and basic info
    const avatar = t.img
      ? el('img', {class:'therapist-avatar', src: t.img, alt: t.name + ' profile photo'})
      : el('div',{class:'therapist-avatar', 'aria-hidden':'true', style:'display:flex;align-items:center;justify-content:center;font-weight:700;background:linear-gradient(135deg,#0ea5a9,#7c3aed);color:white;font-size:32px'}, 
        t.name.split(' ').map(s=>s[0]).slice(0,2).join(''));
    
    const cardHeader = el('div', {class: 'therapist-card-header'},
      avatar,
      el('div', {class: 'therapist-info'},
        el('h3', {class: 'therapist-name'}, t.name),
        el('p', {class: 'therapist-title'}, t.title),
        el('p', {class: 'therapist-languages'}, t.lang.join(', ')),
        el('div', {class: 'therapist-rating'}, t.rating + ' / 5.0'),
        el('div', {class: 'therapist-price'}, formatPrice(t.price) + ' / session')
      )
    );

    // Specialties tags
    const specialtyTags = t.tags.map(x => el('span',{class:'specialty-tag'}, x));
    const specialtiesContainer = el('div', {class: 'therapist-specialties'}, ...specialtyTags);

    // Card body with bio
    const cardBody = el('div', {class: 'therapist-card-body'},
      el('p', {class: 'therapist-bio'}, t.bio),
      specialtiesContainer
    );

    // Card footer with book button
    const cardFooter = el('div', {class: 'therapist-card-footer'},
      el('button', {class:'btn primary', onClick:()=>openBookingModal(t)}, 'Book a Session')
    );

    // Complete card
    const card = el('div', {class:'therapist-card', role:'article', tabindex:0},
      cardHeader, cardBody, cardFooter
    );

    // Keyboard accessibility
    card.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openBookingModal(t);
      }
    });

    grid.appendChild(card);
  });
  
  countSpan.textContent = list.length;
}

// ===== Filtering =====
$('#searchBtn').addEventListener('click', ()=>{
  const lang = $('#filterLang').value;
  const issue = $('#filterIssue').value;
  let res = therapists.slice();
  if(lang) res = res.filter(t=>t.lang.includes(lang));
  if(issue) res = res.filter(t=>t.tags.includes(issue));
  renderTherapists(res);
});

// Reset filters
$('#resetBtn').addEventListener('click', ()=>{
  $('#filterLang').value = '';
  $('#filterIssue').value = '';
  renderTherapists(therapists);
});

// Initial render
renderTherapists(therapists);

// ===== Modal & booking flow =====
const modalBackdrop = $('#modalBackdrop');
const slotList = $('#slotList');
const sessionDate = $('#sessionDate');
const sessionLength = $('#sessionLength');
const clientName = $('#clientName');
const clientPhone = $('#clientPhone');
const modalSubtitle = $('#modalSubtitle');
const modalPrice = $('#modalPrice');
const bookingResult = $('#bookingResult');
const bookingMsg = $('#bookingMsg');
const bookingJSON = $('#bookingJSON');

let currentTherapist = null;
let selectedSlot = null;

function openBookingModal(therapist){
  currentTherapist = therapist;
  modalSubtitle.textContent = therapist.title + ' • ' + therapist.lang.join(', ');
  modalPrice.textContent = formatPrice(therapist.price);
  // default date to tomorrow
  const d = new Date();
  d.setDate(d.getDate() + 1);
  sessionDate.value = d.toISOString().slice(0,10);
  sessionLength.value = '30';
  populateSlots();
  bookingResult.style.display = 'none';
  modalBackdrop.style.display = 'flex';
  modalBackdrop.setAttribute('aria-hidden','false');
  // prefill name if exists
  clientName.value = localStorage.demoClientName || '';
  clientPhone.value = localStorage.demoClientPhone || '';
}

function closeModal(){
  modalBackdrop.style.display = 'none';
  modalBackdrop.setAttribute('aria-hidden','true');
  currentTherapist = null;
  selectedSlot = null;
}

function populateSlots(){
  slotList.innerHTML = '';
  const date = sessionDate.value;
  // demo: create 6 half-hour slots from 10:00 to 13:00
  const slots = ['10:00','10:30','11:00','11:30','12:00','12:30'];
  slots.forEach(s=>{
    const btn = el('button',{class:'slot', onClick:() => selectSlot(s)}, s);
    slotList.appendChild(btn);
  });
  // clear selection
  selectedSlot = null;
}

function selectSlot(time){
  $$('.slot', slotList).forEach(b=>b.classList.remove('selected'));
  const e = Array.from($$('.slot', slotList)).find(x=>x.textContent===time);
  if(e) e.classList.add('selected');
  selectedSlot = time;
}

$('#sessionDate').addEventListener('change', populateSlots);
$('#sessionLength').addEventListener('change', ()=>{ /* price could change per length */ });

$('#closeModal').addEventListener('click', closeModal);
$('#cancelBooking').addEventListener('click', closeModal);

$('#confirmBooking').addEventListener('click', ()=>{
  // validation
  if(!currentTherapist) return alert('No therapist selected.');
  if(!sessionDate.value) return alert('Please choose a date.');
  if(!selectedSlot) return alert('Please select a time slot.');
  if(!clientName.value.trim()) return alert('Please enter your name.');
  // Mock payment flow: simulate success
  const booking = {
    id: 'bk_' + Date.now(),
    therapistId: currentTherapist.id,
    therapistName: currentTherapist.name,
    date: sessionDate.value,
    time: selectedSlot,
    length: sessionLength.value + ' min',
    price: currentTherapist.price,
    clientName: clientName.value.trim(),
    clientPhone: clientPhone.value.trim(),
    createdAt: new Date().toISOString()
  };
  // save to localStorage
  const all = JSON.parse(localStorage.getItem('demoBookings') || '[]');
  all.push(booking);
  localStorage.setItem('demoBookings', JSON.stringify(all, null, 2));
  // store client name for quick fill later
  localStorage.demoClientName = clientName.value.trim();
  localStorage.demoClientPhone = clientPhone.value.trim();

  bookingResult.style.display = 'block';
  bookingMsg.innerHTML = '<strong>Booking confirmed.</strong>';
  bookingJSON.textContent = JSON.stringify(booking, null, 2);
  // slightly update UI
  setTimeout(()=>{ window.scrollTo({top:0, behavior:'smooth'}); }, 150);
});

// close modal on backdrop click
modalBackdrop.addEventListener('click', (e)=>{
  if(e.target === modalBackdrop) closeModal();
});

// Quick book link handler
$('#quickBook').addEventListener('click', (e)=>{
  e.preventDefault();
  if(therapists.length > 0) {
    openBookingModal(therapists[0]);
  }
});

// On load, set up a11y focus outline
(function setFocusStyle(){
  const style = document.createElement('style');
  style.textContent = '*:focus{outline:3px solid rgba(124,58,237,0.25); outline-offset:2px}';
  document.head.appendChild(style);
})();

//-----------------------------------------------------Bubble Menu Toggle
const bubbleMenu = document.querySelector('.bubble-menu');
const bubbleToggle = document.querySelector('.bubble-toggle');

if (bubbleToggle) {
  bubbleToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    bubbleMenu.classList.toggle('open');
    const isOpen = bubbleMenu.classList.contains('open');
    bubbleToggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (bubbleMenu && !bubbleMenu.contains(e.target) && bubbleMenu.classList.contains('open')) {
      bubbleMenu.classList.remove('open');
      bubbleToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close menu when clicking on a menu item
  const bubbleItems = document.querySelectorAll('.bubble-item');
  bubbleItems.forEach(item => {
    item.addEventListener('click', () => {
      bubbleMenu.classList.remove('open');
      bubbleToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Handle quick book from mobile menu
  const quickBookMobile = document.getElementById('quickBookMobile');
  if (quickBookMobile) {
    quickBookMobile.addEventListener('click', (e) => {
      e.preventDefault();
      bubbleMenu.classList.remove('open');
      bubbleToggle.setAttribute('aria-expanded', 'false');
      // Open booking modal with first therapist
      if(therapists.length > 0) {
        openBookingModal(therapists[0]);
      }
    });
  }
}
//-----------------------------------------------------Bubble Menu Toggle
