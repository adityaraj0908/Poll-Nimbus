// public/js/main.js - Client-side JavaScript

document.addEventListener('DOMContentLoaded', () => {
  // Add fade-in animation to container elements
  document.querySelector('.container').classList.add('fade-in');
  
  // Add slide-up animation to poll cards and form elements
  const pollCards = document.querySelectorAll('.poll-card');
  pollCards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('slide-up');
    }, index * 100);
  });
  
  // Get current URL path and highlight active nav link
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('nav ul li a');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (currentPath === linkPath || 
        (linkPath !== '/' && currentPath.startsWith(linkPath))) {
      link.classList.add('active');
    } else if (link.classList.contains('active') && linkPath !== currentPath) {
      link.classList.remove('active');
    }
  });
  
  // Form validation for poll creation
  const pollForm = document.getElementById('poll-form');
  if (pollForm) {
    pollForm.addEventListener('submit', (e) => {
      const title = document.getElementById('title').value.trim();
      const options = document.getElementById('options').value.trim().split('\n')
                              .filter(option => option.trim() !== '');
      
      if (title === '') {
        e.preventDefault();
        alert('Please enter a poll question.');
        return;
      }
      
      if (options.length < 2) {
        e.preventDefault();
        alert('Please add at least two options.');
        return;
      }
    });
  }
  
  // Enable real-time updates on results page
  if (window.location.pathname.includes('/results/')) {
    // This functionality is implemented in the results.ejs page
    console.log('Results page detected. Real-time updates enabled.');
  }
  
  // Add hover effects to option items
  const optionItems = document.querySelectorAll('.option-item');
  optionItems.forEach(item => {
    item.addEventListener('click', () => {
      // Find radio input inside this option item and select it
      const radio = item.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
      }
    });
  });
  
  // Add copy to clipboard functionality
  const copyBtn = document.getElementById('copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const shareUrl = document.getElementById('share-url');
      shareUrl.select();
      document.execCommand('copy');
      
      // Show feedback
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    });
  }
  
  // Add modal functionality
  const shareBtn = document.getElementById('share-btn');
  const modal = document.getElementById('share-modal');
  const closeBtn = document.querySelector('.close');
  
  if (shareBtn && modal) {
    shareBtn.addEventListener('click', () => {
      modal.style.display = 'block';
    });
    
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
});

// Helper function to format dates nicely
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Helper function for API calls
async function fetchApi(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API fetch error:', error);
    return null;
  }
}