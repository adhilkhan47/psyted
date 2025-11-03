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

// ===== Utilities =====
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

// ===== Form Validation & Submission =====
const contactForm = $('#contactForm');
const submitBtn = $('#submitBtn');
const submitText = $('#submitText');
const submitLoader = $('#submitLoader');
const formSuccess = $('#formSuccess');
const formError = $('#formError');

// Remove error styling
function clearError(field) {
  field.classList.remove('error');
  const errorMsg = field.parentElement.querySelector('.error-message');
  if (errorMsg) {
    errorMsg.textContent = '';
  }
}

// Show error
function showError(field, message) {
  field.classList.add('error');
  const errorMsg = field.parentElement.querySelector('.error-message');
  if (errorMsg) {
    errorMsg.textContent = message;
  }
}

// Validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone (optional but if provided, should be valid)
function isValidPhone(phone) {
  if (!phone.trim()) return true; // Phone is optional
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Validate form field
function validateField(field) {
  const value = field.value.trim();
  const fieldName = field.name;
  
  clearError(field);
  
  if (field.hasAttribute('required') && !value) {
    showError(field, `${field.labels[0].textContent.replace(' *', '')} is required`);
    return false;
  }
  
  if (field.type === 'email' && value && !isValidEmail(value)) {
    showError(field, 'Please enter a valid email address');
    return false;
  }
  
  if (field.type === 'tel' && value && !isValidPhone(value)) {
    showError(field, 'Please enter a valid phone number');
    return false;
  }
  
  return true;
}

// Validate entire form
function validateForm() {
  const fields = contactForm.querySelectorAll('input[required], select[required], textarea[required]');
  let isValid = true;
  
  fields.forEach(field => {
    if (!validateField(field)) {
      isValid = false;
    }
  });
  
  // Validate phone if provided
  const phoneField = $('#phone');
  if (phoneField.value.trim() && !isValidPhone(phoneField.value)) {
    showError(phoneField, 'Please enter a valid phone number');
    isValid = false;
  }
  
  // Validate consent checkbox
  const consentField = $('#consent');
  if (!consentField.checked) {
    showError(consentField, 'Please agree to the Privacy Policy');
    isValid = false;
  } else {
    clearError(consentField);
  }
  
  return isValid;
}

// Real-time validation
const formFields = contactForm.querySelectorAll('input, select, textarea');
formFields.forEach(field => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    if (field.classList.contains('error')) {
      validateField(field);
    }
  });
});

// Form submission
contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Hide previous messages
  formSuccess.style.display = 'none';
  formError.style.display = 'none';
  
  // Validate form
  if (!validateForm()) {
    // Focus first error field
    const firstError = contactForm.querySelector('.error');
    if (firstError) {
      firstError.focus();
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }
  
  // Get form data
  const formData = {
    fullName: $('#fullName').value.trim(),
    email: $('#email').value.trim(),
    phone: $('#phone').value.trim() || 'Not provided',
    subject: $('#subject').value,
    message: $('#message').value.trim(),
    consent: $('#consent').checked,
    submittedAt: new Date().toISOString()
  };
  
  // Disable submit button and show loader
  submitBtn.disabled = true;
  submitText.style.display = 'none';
  submitLoader.style.display = 'inline-block';
  
  try {
    // Simulate API call (replace with actual API endpoint)
    await simulateFormSubmission(formData);
    
    // Show success message
    formSuccess.style.display = 'block';
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Reset form
    contactForm.reset();
    
    // Save to localStorage for demo purposes
    const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
    submissions.push(formData);
    localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
    
    // Reset button state
    setTimeout(() => {
      submitBtn.disabled = false;
      submitText.style.display = 'inline';
      submitLoader.style.display = 'none';
    }, 2000);
    
  } catch (error) {
    // Show error message
    formError.style.display = 'block';
    formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Reset button state
    submitBtn.disabled = false;
    submitText.style.display = 'inline';
    submitLoader.style.display = 'none';
    
    console.error('Form submission error:', error);
  }
});

// Simulate form submission (replace with actual API call)
function simulateFormSubmission(data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate 95% success rate for demo
      if (Math.random() > 0.05) {
        resolve({ success: true, message: 'Form submitted successfully' });
      } else {
        reject(new Error('Network error. Please try again.'));
      }
    }, 1500); // Simulate network delay
  });
}

// ===== FAQ Accordion =====
const faqQuestions = $$('.faq-question');

faqQuestions.forEach(question => {
  question.addEventListener('click', () => {
    const faqItem = question.parentElement;
    const isExpanded = question.getAttribute('aria-expanded') === 'true';
    
    // Close all other FAQs
    faqQuestions.forEach(q => {
      if (q !== question) {
        q.setAttribute('aria-expanded', 'false');
        q.parentElement.classList.remove('active');
      }
    });
    
    // Toggle current FAQ
    if (isExpanded) {
      question.setAttribute('aria-expanded', 'false');
      faqItem.classList.remove('active');
    } else {
      question.setAttribute('aria-expanded', 'true');
      faqItem.classList.add('active');
    }
  });
  
  // Keyboard support
  question.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      question.click();
    }
  });
});

// ===== Quick Book Handler =====
$('#quickBook')?.addEventListener('click', (e) => {
  e.preventDefault();
  // Scroll to form or redirect to booking page
  window.location.href = 'psyted.html#book';
});

// ===== Smooth Scroll for Internal Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && href !== '#book') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

// ===== Accessibility: Focus Management =====
(function setFocusStyle(){
  const style = document.createElement('style');
  style.textContent = '*:focus{outline:3px solid rgba(216,135,90,0.5); outline-offset:2px}';
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
      // Redirect to booking page
      window.location.href = 'psyted.html#book';
    });
  }
}
//-----------------------------------------------------Bubble Menu Toggle
