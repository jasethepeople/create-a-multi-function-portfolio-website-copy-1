// Fix for navigation.js to ensure proper page transitions
document.addEventListener('DOMContentLoaded', function() {
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    const contentPages = document.querySelectorAll('.content-page');
    const closeButtons = document.querySelectorAll('.close-btn');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const heroSection = document.querySelector('.hero');
    
    // Sound toggle
    const soundToggle = document.getElementById('soundToggle');
    let soundEnabled = false;
    
    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            const targetPage = document.getElementById(target + '-page');
            
            if (targetPage) {
                // Hide hero section with animation
                heroSection.style.opacity = '0';
                heroSection.style.pointerEvents = 'none';
                
                // Show target page with animation
                setTimeout(() => {
                    contentPages.forEach(page => {
                        page.style.display = 'none';
                        page.classList.remove('active');
                    });
                    targetPage.style.display = 'block';
                    setTimeout(() => {
                        targetPage.classList.add('active');
                    }, 50);
                }, 500);
            }
        });
    });
    
    // Handle close button clicks
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetPage = document.getElementById(targetId);
            
            if (targetPage) {
                targetPage.classList.remove('active');
                setTimeout(() => {
                    targetPage.style.display = 'none';
                    
                    // Show hero section again with animation
                    heroSection.style.opacity = '1';
                    heroSection.style.pointerEvents = 'auto';
                }, 500);
            }
        });
    });
    
    // Handle sound toggle
    if (soundToggle) {
        soundToggle.addEventListener('click', function() {
            soundEnabled = !soundEnabled;
            
            if (soundEnabled) {
                this.innerHTML = '<i class="fas fa-volume-up"></i>';
                // Play ambient sound logic would go here
            } else {
                this.innerHTML = '<i class="fas fa-volume-mute"></i>';
                // Pause ambient sound logic would go here
            }
        });
    }
    
    // Handle scroll indicator
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            window.scrollBy({
                top: window.innerHeight,
                behavior: 'smooth'
            });
        });
    }
    
    // Birds animation setup
    createBirdsAnimation();
});

// Birds Animation
function createBirdsAnimation() {
    const canvas = document.createElement('canvas');
    canvas.classList.add('birds-canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.appendChild(canvas);
        
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
}
