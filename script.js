document.addEventListener('DOMContentLoaded', () => {
  const chatMessages = document.getElementById('chat-messages');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');
  const themeToggle = document.querySelector('.theme-toggle');
  const contactForm = document.getElementById('contact-form');
  const faqItems = document.querySelectorAll('.faq-item');
  const downloadButton = document.getElementById('download-list');
  const API_KEY = 'AIzaSyAieLdU_VuC-f5-p7YN7PVzDlEf9UhcoQM'; // Your Gemini API key

  // Theme toggle functionality
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const icon = themeToggle.querySelector('i');
    if (document.body.classList.contains('light-theme')) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    }
  });

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // FAQ functionality
  if (faqItems.length > 0) {
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    });
  }

  // Contact form handling
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('.submit-btn');
      const originalText = submitBtn.innerHTML;

      // Show loading state
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitBtn.disabled = true;

      try {
        // Simulate form submission (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Show success message
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Sent!';
        submitBtn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';

        // Reset form
        contactForm.reset();

        // Reset button after 2 seconds
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = 'linear-gradient(135deg, #64ffda 0%, #1e90ff 100%)';
          submitBtn.disabled = false;
        }, 2000);
      } catch (error) {
        // Show error message
        submitBtn.innerHTML = '<i class="fas fa-times"></i> Error';
        submitBtn.style.background = 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';

        // Reset button after 2 seconds
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = 'linear-gradient(135deg, #64ffda 0%, #1e90ff 100%)';
          submitBtn.disabled = false;
        }, 2000);
      }
    });
  }

  // Function to add a message to the chat
  function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'coach'}`;
    messageDiv.innerHTML = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Function to show loading state
  function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message coach loading';
    loadingDiv.innerHTML = '<p>Creating your packing list...</p>';
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return loadingDiv;
  }

  // Function to remove loading state
  function removeLoading(loadingDiv) {
    loadingDiv.remove();
  }

  // Function to format packing list
  function formatPackingList(list) {
    return list.split('\n').map(line => {
      if (line.startsWith('CATEGORY')) {
        const categoryText = line.replace('CATEGORY:', '📋');
        return `<div class="category-header"><i class="fas fa-suitcase"></i>${categoryText}</div>`;
      } else if (line.startsWith('ITEM')) {
        const itemText = line.replace('ITEM:', '');
        return `<div class="item-line"><i class="fas fa-check-circle"></i>${itemText}</div>`;
      } else if (line.startsWith('TIP')) {
        const tipText = line.replace('TIP:', '💡');
        return `<div class="tip-line"><i class="fas fa-lightbulb"></i>${tipText}</div>`;
      } else if (line.startsWith('WEATHER')) {
        const weatherText = line.replace('WEATHER:', '🌤️');
        return `<div class="weather-line"><i class="fas fa-cloud-sun"></i>${weatherText}</div>`;
      }
      return `<p>${line}</p>`;
    }).join('');
  }

  // Function to generate downloadable packing list
  function generateDownloadableList(list) {
    let downloadContent = 'Smart Travel Packing List\n\n';
    list.split('\n').forEach(line => {
      if (line.startsWith('CATEGORY')) {
        downloadContent += `\n${line}\n`;
      } else if (line.startsWith('ITEM') || line.startsWith('TIP') || line.startsWith('WEATHER')) {
        downloadContent += `${line}\n`;
      }
    });
    return downloadContent;
  }

  // Function to download packing list
  function downloadPackingList(content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'packing-list.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Download button functionality
  if (downloadButton) {
    downloadButton.addEventListener('click', () => {
      const messages = document.querySelectorAll('.message.coach:not(.loading)');
      if (messages.length > 1) { // Skip the initial welcome message
        const lastMessage = messages[messages.length - 1];
        // Extract raw text content from HTML elements
        const rawContent = Array.from(lastMessage.querySelectorAll('.category-header, .item-line, .tip-line, .weather-line'))
          .map(el => {
            const text = el.textContent.trim();
            if (el.classList.contains('category-header')) return `CATEGORY:${text.replace('📋', '')}`;
            if (el.classList.contains('item-line')) return `ITEM:${text.replace('✓', '')}`;
            if (el.classList.contains('tip-line')) return `TIP:${text.replace('💡', '')}`;
            if (el.classList.contains('weather-line')) return `WEATHER:${text.replace('🌤️', '')}`;
            return text;
          })
          .join('\n');
        const downloadContent = generateDownloadableList(rawContent);
        downloadPackingList(downloadContent);
      } else {
        alert('Please generate a packing list first!');
      }
    });
  }

  // Function to call Gemini API
  async function callGeminiAPI(prompt) {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + API_KEY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a Smart Travel Packing Assistant. The user has sent: "${prompt}".

Please provide a short, clean, and structured packing list following the format below. Do not use the * symbol in the response. Maintain a consistent color theme and use larger font for headings.

Format:

CATEGORY: [Category Name]
ITEM: [Item to pack]
TIP: [Packing tip or advice]
WEATHER: [Weather-specific recommendations]

Include:

Essential items

Weather-appropriate clothing

Travel documents

Personal care items

Electronics and gadgets

Space-saving tips

Destination-specific suggestions

Keep it practical, minimal, and well-organized.`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid API response format');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return 'I apologize, but I encountered an error. Please try again later.';
    }
  }

  // Handle sending messages
  async function handleSend() {
    const message = userInput.value.trim();
    if (message) {
      // Add user message
      addMessage(`<p>${message}</p>`, true);

      // Clear input
      userInput.value = '';

      // Show loading state
      const loadingDiv = showLoading();

      try {
        // Get response from Gemini API
        const response = await callGeminiAPI(message);

        // Remove loading state
        removeLoading(loadingDiv);

        // Format and add coach response
        const formattedResponse = formatPackingList(response);
        addMessage(formattedResponse);
      } catch (error) {
        // Remove loading state
        removeLoading(loadingDiv);

        // Show error message
        addMessage('<p>Sorry, I encountered an error. Please try again later.</p>');
      }
    }
  }

  // Event listeners
  if (sendButton) {
    sendButton.addEventListener('click', handleSend);
  }

  if (userInput) {
    userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
  }
});