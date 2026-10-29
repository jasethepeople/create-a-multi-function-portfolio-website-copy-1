// Column Scroll Layout for Photography Page
// Based on https://tympanus.net/Development/ColumnScroll/

document.addEventListener('DOMContentLoaded', function() {
  // Create script elements to load dependencies
  const dependencies = [
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/ScrollTrigger.min.js'
  ];
  
  let loaded = 0;
  dependencies.forEach(src => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      loaded++;
      if (loaded === dependencies.length) {
        initColumnScroll();
      }
    };
    document.head.appendChild(script);
  });
});

function initColumnScroll() {
  // Register ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);
  
  // Create column scroll layout
  class ColumnScroll {
    constructor(container) {
      this.container = container;
      this.columns = Array.from(this.container.querySelectorAll('.column'));
      this.columnsTotal = this.columns.length;
      
      this.observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.init();
            this.observer.unobserve(entry.target);
          }
        });
      });
      
      this.observer.observe(this.container);
    }
    
    init() {
      // Set up the columns for scrolling
      this.setupColumns();
      
      // Initialize GSAP animations
      this.initAnimations();
    }
    
    setupColumns() {
      // Set container height based on the tallest column
      let maxHeight = 0;
      
      this.columns.forEach(column => {
        const columnHeight = column.scrollHeight;
        if (columnHeight > maxHeight) {
          maxHeight = columnHeight;
        }
      });
      
      // Add extra space for scrolling
      this.container.style.height = `${maxHeight * 1.5}px`;
      
      // Set initial positions for columns
      this.columns.forEach((column, i) => {
        column.style.position = 'absolute';
        column.style.top = '0';
        column.style.left = `${(i * 100) / this.columnsTotal}%`;
        column.style.width = `${100 / this.columnsTotal}%`;
        column.style.height = '100%';
        column.style.overflow = 'hidden';
      });
    }
    
    initAnimations() {
      // Create scroll animations for each column
      this.columns.forEach((column, i) => {
        const items = column.querySelectorAll('.photo-item');
        const direction = i % 2 === 0 ? 1 : -1; // Alternate scroll direction
        
        gsap.to(column, {
          y: direction * -column.scrollHeight * 0.5,
          ease: 'none',
          scrollTrigger: {
            trigger: this.container,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true
          }
        });
        
        // Add hover animations for items
        items.forEach(item => {
          item.addEventListener('mouseenter', () => {
            gsap.to(item, {
              scale: 1.05,
              zIndex: 10,
              duration: 0.5
            });
          });
          
          item.addEventListener('mouseleave', () => {
            gsap.to(item, {
              scale: 1,
              zIndex: 1,
              duration: 0.5
            });
          });
        });
      });
    }
  }
  
  // Initialize column scroll for photography page
  const photographyContainer = document.querySelector('.photography-container');
  if (photographyContainer) {
    new ColumnScroll(photographyContainer);
  } else {
    console.warn('Photography container not found. Column scroll not initialized.');
    
    // Create photography container and columns if they don't exist
    document.addEventListener('DOMContentLoaded', () => {
      const photographyPage = document.querySelector('#photography-page');
      if (photographyPage) {
        createPhotographyLayout(photographyPage);
      }
    });
  }
}

function createPhotographyLayout(container) {
  // Create photography container
  const photographyContainer = document.createElement('div');
  photographyContainer.className = 'photography-container';
  container.appendChild(photographyContainer);
  
  // Create columns
  const columnCount = 3;
  for (let i = 0; i < columnCount; i++) {
    const column = document.createElement('div');
    column.className = 'column';
    photographyContainer.appendChild(column);
    
    // Add placeholder items (will be replaced with actual photos)
    for (let j = 0; j < 5; j++) {
      const item = document.createElement('div');
      item.className = 'photo-item';
      
      const img = document.createElement('img');
      img.src = `images/placeholder-${i * 5 + j + 1}.jpg`;
      img.alt = `Photography ${i * 5 + j + 1}`;
      
      const caption = document.createElement('div');
      caption.className = 'photo-caption';
      caption.textContent = `Photo ${i * 5 + j + 1}`;
      
      item.appendChild(img);
      item.appendChild(caption);
      column.appendChild(item);
    }
  }
  
  // Initialize column scroll
  new ColumnScroll(photographyContainer);
}

// Add CSS for column scroll layout
function addColumnScrollStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .photography-container {
      position: relative;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      background-color: #000;
    }
    
    .column {
      position: absolute;
      top: 0;
      height: 100%;
      overflow: hidden;
    }
    
    .photo-item {
      position: relative;
      width: 100%;
      margin-bottom: 20px;
      overflow: hidden;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.5s ease;
    }
    
    .photo-item img {
      width: 100%;
      height: auto;
      display: block;
      transition: transform 0.5s ease;
    }
    
    .photo-caption {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 15px;
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      font-size: 14px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .photo-item:hover .photo-caption {
      opacity: 1;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .column {
        width: 50% !important;
      }
      
      .column:nth-child(3) {
        display: none;
      }
    }
    
    @media (max-width: 480px) {
      .column {
        width: 100% !important;
        position: relative !important;
        left: 0 !important;
      }
      
      .column:not(:first-child) {
        display: none;
      }
      
      .photography-container {
        height: auto;
      }
    }
  `;
  
  document.head.appendChild(style);
}

// Add styles when DOM is loaded
document.addEventListener('DOMContentLoaded', addColumnScrollStyles);
