//-----------------------------------------------------dark/light theme switch
const themeSwitch = document.getElementById('theme-switch');
const img = document.getElementById('hero-img'); // May not exist on all pages

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

    // Change image for dark mode (only if element exists)
    if (img) {
        img.src = 'hero-image-dark.PNG';
    }
}

const disableDarkmode = () => {
    document.body.classList.remove('dark-mode');
    themeSwitch.classList.add('light-mode');
    themeSwitch.classList.remove('dark-mode');
    localStorage.setItem('darkmode', 'inactive');

    // Switch icons
    themeSwitch.querySelectorAll('.switch-icon')[0].classList.add('active');
    themeSwitch.querySelectorAll('.switch-icon')[1].classList.remove('active');

    // Change image for light mode (only if element exists)
    if (img) {
        img.src = 'hero-image.PNG';
    }
}

// 🟢 Apply theme and image on page load
if (darkmode === 'active') {
    enableDarkmode();
} else {
    disableDarkmode(); // ensures light image is set too
}

// 🟡 Toggle when clicked
themeSwitch.addEventListener('click', () => {
    darkmode = localStorage.getItem('darkmode');
    darkmode !== 'active' ? enableDarkmode() : disableDarkmode();
});
//-----------------------------------------------------dark/light theme switch


// ===== Sample therapist data =====
// Add an `img` field (relative path) to show a custom photo per therapist.
// Replace these placeholder paths with your own images as needed.
const therapists = [
  {id: 't1', name:'Dr. Anjana S', title:'Clinical Psychologist', lang:['Malayalam','English'], tags:['Anxiety','Depression'], price:800, rating:4.8, bio:'Specializes in mood disorders, CBT, and grief.', img:'anjana.PNG'},
  {id: 't2', name:'Mr. Ravi K', title:'Counselling Psychologist', lang:['Malayalam','Hindi'], tags:['Couples','Relationship'], price:700, rating:4.6, bio:'Experience in relationship therapy & emotional regulation.', img:'ravi.PNG'},
  {id: 't3', name:'Ms. Leena P', title:'Sexual Wellness Therapist', lang:['English','Malayalam'], tags:['Sexual','Trauma'], price:900, rating:4.9, bio:'Queer-affirmative therapy and sexual health.', img:'leena.PNG'},
  {id: 't4', name:'Dr. Suresh M', title:'Psychiatric Social Worker', lang:['English','Hindi'], tags:['Child','ADHD'], price:650, rating:4.5, bio:'Work with families and children.', img:'suresh.PNG'},
  {id: 't5', name:'Ms. Nisha R', title:'Clinical Psychologist', lang:['Malayalam','English'], tags:['Anxiety','Depression','Trauma'], price:750, rating:4.7, bio:'Trauma-informed therapy & EMDR trained.', img:'nisha.PNG'},
  {id: 't6', name:'Ms. Mephy R', title:'Clinical Psychologist', lang:['Malayalam','English'], tags:['Couples','Relationship'], price:700, rating:4.7, bio:'Experience in relationship therapy & emotional regulation.', img:'mephy.PNG'},
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
  if (!grid) return; // Exit if element doesn't exist
  grid.innerHTML = '';
  list.forEach(t=>{
    const avatar = t.img
      ? el('img', {class:'avatar', src: t.img, alt: t.name + ' profile photo'})
      : el('div',{class:'avatar', 'aria-hidden':'true'}, t.name.split(' ').map(s=>s[0]).slice(0,2).join(''));
    const tags = t.tags.map(x => el('span',{class:'tag', style:'margin-right:6px'}, x));
    const meta = el('div',{class:'t-meta'},
      el('h3',{}, t.name),
      el('p',{}, el('span',{class:'muted'}, t.title + ' • ' + t.lang.join(', '))),
      el('div',{}, ...tags)
    );
    const price = el('div',{class:'price'}, formatPrice(t.price));
    const bookBtn = el('button',{class:'btn primary',id:'avtr-btn', onClick:()=>openBookingModal(t)}, 'Book');
    const card = el('div',{class:'therapist', role:'article', tabindex:0},
      avatar, meta, price, bookBtn
    );
    grid.appendChild(card);
  });
  if (countSpan) countSpan.textContent = list.length;
}

// ===== Filtering =====
const searchBtn = $('#searchBtn');
if (searchBtn) {
  searchBtn.addEventListener('click', ()=>{
    const lang = $('#filterLang').value;
    const issue = $('#filterIssue').value;
    let res = therapists.slice();
    if(lang) res = res.filter(t=>t.lang.includes(lang));
    if(issue) res = res.filter(t=>t.tags.includes(issue));
    renderTherapists(res);
  });
}

// initial render
if (grid) {
  renderTherapists(therapists);
}

// ===== Quick booking dropdown =====
const quickSelect = $('#quickSelect');
function fillQuick(){
  if (!quickSelect) return;
  quickSelect.innerHTML = '';
  therapists.forEach(t=>{
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.name + ' — ' + t.title + ' (' + formatPrice(t.price) + ')';
    quickSelect.appendChild(opt);
  });
}
if (quickSelect) {
  fillQuick();
  const quickBookBtn = $('#quickBookBtn');
  if (quickBookBtn) {
    quickBookBtn.addEventListener('click', ()=>{
      const id = quickSelect.value;
      const t = therapists.find(x=>x.id===id);
      if(t) openBookingModal(t);
    });
  }
}

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
  if (!modalBackdrop) return; // Exit if modal doesn't exist on this page
  currentTherapist = therapist;
  if (modalSubtitle) modalSubtitle.textContent = therapist.title + ' • ' + therapist.lang.join(', ');
  if (modalPrice) modalPrice.textContent = formatPrice(therapist.price);
  // default date to tomorrow
  const d = new Date();
  d.setDate(d.getDate() + 1);
  if (sessionDate) sessionDate.value = d.toISOString().slice(0,10);
  if (sessionLength) sessionLength.value = '30';
  populateSlots();
  if (bookingResult) bookingResult.style.display = 'none';
  modalBackdrop.style.display = 'flex';
  modalBackdrop.setAttribute('aria-hidden','false');
  // prefill name if exists
  if (clientName) clientName.value = localStorage.demoClientName || '';
  if (clientPhone) clientPhone.value = localStorage.demoClientPhone || '';
}

function closeModal(){
  if (!modalBackdrop) return;
  modalBackdrop.style.display = 'none';
  modalBackdrop.setAttribute('aria-hidden','true');
  currentTherapist = null;
  selectedSlot = null;
}

function populateSlots(){
  if (!slotList) return;
  slotList.innerHTML = '';
  const date = sessionDate ? sessionDate.value : '';
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
  if (!slotList) return;
  $$('.slot', slotList).forEach(b=>b.classList.remove('selected'));
  const e = Array.from($$('.slot', slotList)).find(x=>x.textContent===time);
  if(e) e.classList.add('selected');
  selectedSlot = time;
}

if (sessionDate) {
  sessionDate.addEventListener('change', populateSlots);
}
if (sessionLength) {
  sessionLength.addEventListener('change', ()=>{ /* price could change per length */ });
}

const closeModalBtn = $('#closeModal');
if (closeModalBtn) {
  closeModalBtn.addEventListener('click', closeModal);
}
const cancelBookingBtn = $('#cancelBooking');
if (cancelBookingBtn) {
  cancelBookingBtn.addEventListener('click', closeModal);
}

const confirmBookingBtn = $('#confirmBooking');
if (confirmBookingBtn) {
  confirmBookingBtn.addEventListener('click', ()=>{
    // validation
    if(!currentTherapist) return alert('No therapist selected.');
    if(!sessionDate || !sessionDate.value) return alert('Please choose a date.');
    if(!selectedSlot) return alert('Please select a time slot.');
    if(!clientName || !clientName.value.trim()) return alert('Please enter your name.');
    // Mock payment flow: simulate success
    const booking = {
      id: 'bk_' + Date.now(),
      therapistId: currentTherapist.id,
      therapistName: currentTherapist.name,
      date: sessionDate.value,
      time: selectedSlot,
      length: sessionLength ? sessionLength.value + ' min' : '30 min',
      price: currentTherapist.price,
      clientName: clientName.value.trim(),
      clientPhone: clientPhone ? clientPhone.value.trim() : '',
      createdAt: new Date().toISOString()
    };
    // save to localStorage
    const all = JSON.parse(localStorage.getItem('demoBookings') || '[]');
    all.push(booking);
    localStorage.setItem('demoBookings', JSON.stringify(all, null, 2));
    // store client name for quick fill later
    localStorage.demoClientName = clientName.value.trim();
    if (clientPhone) localStorage.demoClientPhone = clientPhone.value.trim();

    if (bookingResult) bookingResult.style.display = 'block';
    if (bookingMsg) bookingMsg.innerHTML = '<strong>Booking confirmed.</strong>';
    if (bookingJSON) bookingJSON.textContent = JSON.stringify(booking, null, 2);
    // slightly update UI
    setTimeout(()=>{ window.scrollTo({top:0, behavior:'smooth'}); }, 150);
  });
}

// close modal on backdrop click
if (modalBackdrop) {
  modalBackdrop.addEventListener('click', (e)=>{
    if(e.target === modalBackdrop) closeModal();
  });
}

// quick open handlers
const getStartedBtn = $('#getStarted');
if (getStartedBtn) {
  getStartedBtn.addEventListener('click', ()=>{ 
    const therapistsSection = document.querySelector('#therapists');
    if (therapistsSection) {
      window.location.hash = '#therapists'; 
      window.scrollTo({top:therapistsSection.offsetTop - 20, behavior:'smooth'}); 
    }
  });
}
const whyBtn = $('#whyBtn');
if (whyBtn) {
  whyBtn.addEventListener('click', ()=>{ 
    const stackArea = document.querySelector('.stack-area');
    if (stackArea) {
      window.scrollTo({top:stackArea.offsetTop - 20, behavior:'smooth'}); 
    }
  });
}
const quickBookLink = $('#quickBook');
if (quickBookLink) {
  quickBookLink.addEventListener('click', (e)=>{ 
    e.preventDefault(); 
    const quickBookBtn = $('#quickBookBtn');
    if (quickBookBtn) quickBookBtn.click(); 
  });
}
// Add scroll functionality to search button (in addition to filtering)
if (searchBtn) {
  const originalHandler = searchBtn.onclick; // Get existing handler if any
  searchBtn.addEventListener('click', ()=>{ 
    // Also scroll to therapists section after filtering
    setTimeout(() => {
      const therapistsSection = document.querySelector('#therapists');
      if (therapistsSection) {
        window.location.hash = '#therapists'; 
        window.scrollTo({top:therapistsSection.offsetTop - 20, behavior:'smooth'}); 
      }
    }, 100);
  });
}



// small accessibility: add keyboard handler to therapist cards for booking
document.addEventListener('keydown', (ev)=>{
  if(ev.key === 'b' && document.activeElement && document.activeElement.classList.contains('therapist')){
    // find therapist by name
    const name = document.activeElement.querySelector('h3').textContent;
    const t = therapists.find(x=>x.name===name);
    if(t) openBookingModal(t);
  }
});

// On load, set up a11y focus outline
(function setFocusStyle(){
  const style = document.createElement('style');
  style.textContent = '*:focus{outline:3px solid rgba(124,58,237,0.25); outline-offset:2px}';
  document.head.appendChild(style);
})();

// For demo: keyboard shortcut "B" to book first therapist quickly
document.addEventListener('keypress', (e)=>{
  if(e.key.toLowerCase()==='b'){
    openBookingModal(therapists[0]);
  }
});

//---------------------------------------------number count

// Function to animate the count
function countUp(el, target, duration = 2200) {
  let start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    el.textContent = Math.floor(progress * target);

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target.toLocaleString();
    }
  }

  requestAnimationFrame(update);
}

// Observe when counters enter the viewport
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      countUp(el, target);
      observer.unobserve(el); // Stop observing after animation
    }
  });
}, { threshold: 0.5 }); // start when 50% visible

document.querySelectorAll('.count').forEach(el => observer.observe(el));


//---------------------------------------------number count


//--------------------------how it works cards
let cards= document.querySelectorAll('.card1')

function rotateCards(){
    if (cards.length === 0) return;
    let angle=0;
    cards.forEach((card,index)=>{
        if(card.classList.contains('away')){
            card.style.transform = `translateY(-120vh) rotate(-48deg)`;
        }else{
        card.style.transform =`rotate(${angle}deg)`;
        angle=angle-10;
        card.style.zIndex = cards.length - index;
        }
    });
}
if (cards.length > 0) {
    rotateCards();
}

let stackarea= document.querySelector('.stack-area')

if (stackarea && cards.length > 0) {
    window.addEventListener('scroll',
    ()=>{
        let distance = window.innerHeight/2;
        let topVal = stackarea.getBoundingClientRect().top
        let index = -1 * (topVal / distance + 1);
        index = Math.floor(index);
        for(i=0; i<cards.length; i++){
            if(i<=index){
                cards[i].classList.add('away')
            } else{
                cards[i].classList.remove('away')
            }
        }
    rotateCards();
    })
}
//--------------------------how it works cards
//-----------------------------------------therapist auto scroll

  const track = document.getElementById("therapistGrid");
  if (track) {
    let autoScrollInterval;
    let isHovered = false;
    let isUserScrolling = false;

    function startAutoScroll() {
      autoScrollInterval = setInterval(() => {
        if (!isHovered && !isUserScrolling && track) {
          track.scrollBy({ left: 260, behavior: "smooth" });
          if (track.scrollLeft + track.clientWidth >= track.scrollWidth) {
            track.scrollTo({ left: 0, behavior: "smooth" });
          }
        }
      }, 3000); // move every 3s
    }

    function stopAutoScroll() {
      clearInterval(autoScrollInterval);
    }

    // Pause when hovering
    track.addEventListener("mouseenter", () => {
      isHovered = true;
    });
    track.addEventListener("mouseleave", () => {
      isHovered = false;
    });

    // Detect manual scroll (pause auto-scroll briefly)
    track.addEventListener("scroll", () => {
      if (!isUserScrolling) {
        isUserScrolling = true;
        stopAutoScroll();
        setTimeout(() => {
          isUserScrolling = false;
          startAutoScroll();
        }, 3000); // resume 4s after manual scroll stops
      }
    });

    startAutoScroll();
  }

    //-----------------------------------------therapist auto scroll
  

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
      // Trigger the same action as desktop quick book
      const quickBookBtn = document.getElementById('quickBookBtn');
      if (quickBookBtn) {
        quickBookBtn.click();
      }
    });
  }
}
//-----------------------------------------------------Bubble Menu Toggle



