// Navigation and Page Transitions
document.addEventListener('DOMContentLoaded', function() {
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    const contentPages = document.querySelectorAll('.content-page');
    const closeButtons = document.querySelectorAll('.close-btn');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    // Sound toggle
    const soundToggle = document.getElementById('soundToggle');
    let soundEnabled = false;
    const ambientSound = new Audio('sounds/ambient.mp3');
    ambientSound.loop = true;
    
    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            const targetPage = document.getElementById(target + '-page');
            
            // Hide hero section
            document.querySelector('.hero').style.opacity = '0';
            document.querySelector('.hero').style.pointerEvents = 'none';
            
            // Show target page with animation
            setTimeout(() => {
                contentPages.forEach(page => page.classList.remove('active'));
                targetPage.classList.add('active');
                targetPage.classList.add('fade-in');
            }, 500);
            
            // Play page transition sound if enabled
            if (soundEnabled) {
                const transitionSound = new Audio('sounds/transition.mp3');
                transitionSound.play();
            }
        });
    });
    
    // Handle close button clicks
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-target');
            document.getElementById(targetPage).classList.remove('active');
            
            // Show hero section again
            document.querySelector('.hero').style.opacity = '1';
            document.querySelector('.hero').style.pointerEvents = 'auto';
            
            // Play close sound if enabled
            if (soundEnabled) {
                const closeSound = new Audio('sounds/close.mp3');
                closeSound.play();
            }
        });
    });
    
    // Handle sound toggle
    soundToggle.addEventListener('click', function() {
        soundEnabled = !soundEnabled;
        
        if (soundEnabled) {
            this.innerHTML = '<i class="fas fa-volume-up"></i>';
            ambientSound.play();
        } else {
            this.innerHTML = '<i class="fas fa-volume-mute"></i>';
            ambientSound.pause();
        }
    });
    
    // Handle scroll indicator
    scrollIndicator.addEventListener('click', function() {
        window.scrollBy({
            top: window.innerHeight,
            behavior: 'smooth'
        });
    });
    
    // Birds animation setup
    createBirdsAnimation();
});

// Birds Animation
function createBirdsAnimation() {
    const canvas = document.createElement('canvas');
    canvas.classList.add('birds-canvas');
    document.querySelector('.hero').appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Bird class
    class Bird {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height * 0.5;
            this.size = Math.random() * 3 + 2;
            this.speed = Math.random() * 2 + 1;
            this.angle = Math.random() * Math.PI * 2;
            this.velocity = {
                x: Math.cos(this.angle) * this.speed,
                y: Math.sin(this.angle) * this.speed
            };
            this.color = 'rgba(255, 255, 255, 0.7)';
            this.wingSpan = Math.random() * 10 + 10;
            this.wingAngle = 0;
            this.wingSpeed = Math.random() * 0.2 + 0.1;
        }
        
        update(mouseX, mouseY) {
            // Avoid mouse if close
            if (mouseX && mouseY) {
                const dx = this.x - mouseX;
                const dy = this.y - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    const angle = Math.atan2(dy, dx);
                    this.velocity.x += Math.cos(angle) * 0.5;
                    this.velocity.y += Math.sin(angle) * 0.5;
                }
            }
            
            // Update position
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            
            // Boundary check
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
            
            // Wing flapping
            this.wingAngle += this.wingSpeed;
        }
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            
            // Bird body
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Wings
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(
                this.x - this.wingSpan * Math.cos(this.wingAngle),
                this.y - this.wingSpan * Math.sin(this.wingAngle)
            );
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(
                this.x + this.wingSpan * Math.cos(this.wingAngle),
                this.y + this.wingSpan * Math.sin(this.wingAngle)
            );
            ctx.stroke();
        }
    }
    
    // Create birds
    const birds = [];
    const birdCount = 30;
    
    for (let i = 0; i < birdCount; i++) {
        birds.push(new Bird());
    }
    
    // Mouse tracking
    let mouseX = null;
    let mouseY = null;
    
    window.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        birds.forEach(bird => {
            bird.update(mouseX, mouseY);
            bird.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Resize handler
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Portfolio interactions
document.addEventListener('DOMContentLoaded', function() {
    // Portfolio item hover effects
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    portfolioItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.classList.add('hover');
        });
        
        item.addEventListener('mouseleave', function() {
            this.classList.remove('hover');
        });
    });
    
    // Music player functionality
    const playBtn = document.querySelector('.play-btn');
    const pauseBtn = document.querySelector('.pause-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const progress = document.getElementById('progress');
    
    if (playBtn && pauseBtn) {
        playBtn.addEventListener('click', function() {
            this.style.display = 'none';
            pauseBtn.style.display = 'inline-block';
            // Play music logic would go here
            
            // Simulate progress
            let width = 0;
            const interval = setInterval(() => {
                if (width >= 100) {
                    clearInterval(interval);
                    playBtn.style.display = 'inline-block';
                    pauseBtn.style.display = 'none';
                } else {
                    width++;
                    progress.style.width = width + '%';
                }
            }, 100);
        });
        
        pauseBtn.addEventListener('click', function() {
            this.style.display = 'none';
            playBtn.style.display = 'inline-block';
            // Pause music logic would go here
        });
    }
    
    // Parallax effect on hero section
    const hero = document.querySelector('.hero');
    
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        if (hero) {
            hero.style.backgroundPositionY = scrollPosition * 0.5 + 'px';
        }
    });
});
