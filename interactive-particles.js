// Interactive Particles Effect
// Based on https://tympanus.net/Tutorials/InteractiveParticles/

document.addEventListener('DOMContentLoaded', function() {
  // Create script elements to load dependencies
  const dependencies = [
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://cdn.jsdelivr.net/npm/gsap@3.11.4/dist/gsap.min.js'
  ];
  
  let loaded = 0;
  dependencies.forEach(src => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      loaded++;
      if (loaded === dependencies.length) {
        initInteractiveParticles();
      }
    };
    document.head.appendChild(script);
  });
});

function initInteractiveParticles() {
  class InteractiveParticles {
    constructor(container, options = {}) {
      this.container = container;
      
      // Default options
      this.options = Object.assign({
        particleCount: 8000,
        particleSize: 2,
        particleColor: 0xffffff,
        backgroundColor: 0x000000,
        speed: 0.5,
        interactive: true,
        shape: 'sphere', // 'sphere', 'cube', or 'custom'
        customImage: null, // Path to image for custom shape
        responsive: true
      }, options);
      
      // Set up container
      this.container.style.position = 'relative';
      this.container.style.overflow = 'hidden';
      this.width = this.container.offsetWidth;
      this.height = this.container.offsetHeight;
      
      // Mouse position
      this.mouse = new THREE.Vector2(0, 0);
      this.mouseTarget = new THREE.Vector2(0, 0);
      this.mouseSpeed = 0.1;
      
      // Initialize Three.js scene
      this.initScene();
      
      // Add event listeners
      this.addEventListeners();
      
      // Start animation
      this.animate();
    }
    
    initScene() {
      // Create scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(this.options.backgroundColor);
      
      // Create camera
      this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
      this.camera.position.z = 100;
      
      // Create renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.container.appendChild(this.renderer.domElement);
      
      // Create particles
      this.createParticles();
      
      // Add lights
      this.addLights();
    }
    
    createParticles() {
      // Create particles geometry
      this.particleCount = this.options.particleCount;
      this.particleSystem = new THREE.Group();
      
      // Create geometry based on shape option
      if (this.options.shape === 'sphere') {
        this.createSphereParticles();
      } else if (this.options.shape === 'cube') {
        this.createCubeParticles();
      } else if (this.options.shape === 'custom' && this.options.customImage) {
        this.createImageParticles(this.options.customImage);
      } else {
        // Default to sphere if invalid shape
        this.createSphereParticles();
      }
      
      this.scene.add(this.particleSystem);
    }
    
    createSphereParticles() {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(this.particleCount * 3);
      const colors = new Float32Array(this.particleCount * 3);
      const sizes = new Float32Array(this.particleCount);
      
      // Original positions for animation
      this.originalPositions = new Float32Array(this.particleCount * 3);
      
      // Create positions and colors
      for (let i = 0; i < this.particleCount; i++) {
        // Create point on sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const radius = 50 * Math.cbrt(Math.random());
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        // Store original positions
        this.originalPositions[i * 3] = x;
        this.originalPositions[i * 3 + 1] = y;
        this.originalPositions[i * 3 + 2] = z;
        
        // Random colors with base color
        const color = new THREE.Color(this.options.particleColor);
        color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.2);
        
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        
        // Random sizes
        sizes[i] = Math.random() * this.options.particleSize;
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      
      // Create material
      const material = new THREE.PointsMaterial({
        size: 1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      });
      
      // Create particle system
      this.particles = new THREE.Points(geometry, material);
      this.particleSystem.add(this.particles);
    }
    
    createCubeParticles() {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(this.particleCount * 3);
      const colors = new Float32Array(this.particleCount * 3);
      const sizes = new Float32Array(this.particleCount);
      
      // Original positions for animation
      this.originalPositions = new Float32Array(this.particleCount * 3);
      
      // Create positions and colors
      for (let i = 0; i < this.particleCount; i++) {
        // Create point in cube
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 100;
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        // Store original positions
        this.originalPositions[i * 3] = x;
        this.originalPositions[i * 3 + 1] = y;
        this.originalPositions[i * 3 + 2] = z;
        
        // Random colors with base color
        const color = new THREE.Color(this.options.particleColor);
        color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.2);
        
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        
        // Random sizes
        sizes[i] = Math.random() * this.options.particleSize;
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      
      // Create material
      const material = new THREE.PointsMaterial({
        size: 1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      });
      
      // Create particle system
      this.particles = new THREE.Points(geometry, material);
      this.particleSystem.add(this.particles);
    }
    
    createImageParticles(imagePath) {
      // Load image and create particles from it
      const img = new Image();
      img.onload = () => {
        // Create canvas to read image data
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Create particles from image data
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const sizes = [];
        
        // Original positions for animation
        this.originalPositions = [];
        
        // Sample image data to create particles
        const sampleStep = 4; // Sample every 4 pixels
        for (let y = 0; y < canvas.height; y += sampleStep) {
          for (let x = 0; x < canvas.width; x += sampleStep) {
            const i = (y * canvas.width + x) * 4;
            
            // Skip transparent pixels
            if (data[i + 3] < 128) continue;
            
            // Calculate normalized position
            const nx = (x / canvas.width - 0.5) * 100;
            const ny = (0.5 - y / canvas.height) * 100;
            const nz = 0;
            
            positions.push(nx, ny, nz);
            
            // Store original positions
            this.originalPositions.push(nx, ny, nz);
            
            // Get pixel color
            const r = data[i] / 255;
            const g = data[i + 1] / 255;
            const b = data[i + 2] / 255;
            
            colors.push(r, g, b);
            
            // Size based on brightness
            const brightness = (r + g + b) / 3;
            sizes.push(brightness * this.options.particleSize);
          }
        }
        
        // Convert to typed arrays
        this.originalPositions = new Float32Array(this.originalPositions);
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        
        // Create material
        const material = new THREE.PointsMaterial({
          size: 1,
          vertexColors: true,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true
        });
        
        // Create particle system
        this.particles = new THREE.Points(geometry, material);
        this.particleSystem.add(this.particles);
      };
      
      img.src = imagePath;
    }
    
    addLights() {
      // Add ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      this.scene.add(ambientLight);
      
      // Add directional light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0, 1, 1);
      this.scene.add(directionalLight);
    }
    
    addEventListeners() {
      // Mouse events
      this.container.addEventListener('mousemove', this.onMouseMove.bind(this));
      
      // Touch events for mobile
      this.container.addEventListener('touchmove', this.onTouchMove.bind(this));
      
      // Window resize
      window.addEventListener('resize', this.onResize.bind(this));
    }
    
    onMouseMove(e) {
      const rect = this.container.getBoundingClientRect();
      
      // Normalize mouse position to [-1, 1]
      this.mouseTarget.x = ((e.clientX - rect.left) / this.width) * 2 - 1;
      this.mouseTarget.y = -((e.clientY - rect.top) / this.height) * 2 + 1;
    }
    
    onTouchMove(e) {
      if (e.touches.length > 0) {
        const rect = this.container.getBoundingClientRect();
        
        // Normalize touch position to [-1, 1]
        this.mouseTarget.x = ((e.touches[0].clientX - rect.left) / this.width) * 2 - 1;
        this.mouseTarget.y = -((e.touches[0].clientY - rect.top) / this.height) * 2 + 1;
        
        // Prevent scrolling
        e.preventDefault();
      }
    }
    
    onResize() {
      if (!this.options.responsive) return;
      
      this.width = this.container.offsetWidth;
      this.height = this.container.offsetHeight;
      
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      
      this.renderer.setSize(this.width, this.height);
    }
    
    updateParticles() {
      if (!this.particles) return;
      
      // Smooth mouse movement
      this.mouse.x += (this.mouseTarget.x - this.mouse.x) * this.mouseSpeed;
      this.mouse.y += (this.mouseTarget.y - this.mouse.y) * this.mouseSpeed;
      
      // Update particle positions
      const positions = this.particles.geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        // Get original position
        const originalX = this.originalPositions[i];
        const originalY = this.originalPositions[i + 1];
        const originalZ = this.originalPositions[i + 2];
        
        // Calculate distance from mouse in 3D space
        const mouseX = this.mouse.x * 50;
        const mouseY = this.mouse.y * 50;
        
        const dx = originalX - mouseX;
        const dy = originalY - mouseY;
        const dz = originalZ;
        
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const maxDistance = 50;
        
        if (distance < maxDistance && this.options.interactive) {
          // Repel particles from mouse
          const force = (maxDistance - distance) / maxDistance;
          const repelFactor = 15 * force;
          
          positions[i] = originalX + dx * repelFactor / distance;
          positions[i + 1] = originalY + dy * repelFactor / distance;
          positions[i + 2] = originalZ + dz * repelFactor / distance;
        } else {
          // Return to original position
          positions[i] += (originalX - positions[i]) * 0.05;
          positions[i + 1] += (originalY - positions[i + 1]) * 0.05;
          positions[i + 2] += (originalZ - positions[i + 2]) * 0.05;
        }
      }
      
      this.particles.geometry.attributes.position.needsUpdate = true;
      
      // Rotate particle system
      this.particleSystem.rotation.y += 0.001 * this.options.speed;
      this.particleSystem.rotation.x += 0.0005 * this.options.speed;
    }
    
    animate() {
      requestAnimationFrame(this.animate.bind(this));
      
      this.updateParticles();
      
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  // Initialize interactive particles for contact page
  function initializeParticles() {
    const contactSection = document.querySelector('#contact-section');
    
    if (contactSection) {
      // Create container for particles
      const particlesContainer = document.createElement('div');
      particlesContainer.className = 'interactive-particles-container';
      particlesContainer.style.position = 'absolute';
      particlesContainer.style.top = '0';
      particlesContainer.style.left = '0';
      particlesContainer.style.width = '100%';
      particlesContainer.style.height = '100%';
      particlesContainer.style.zIndex = '0';
      
      // Insert container at the beginning of contact section
      contactSection.style.position = 'relative';
      contactSection.insertBefore(particlesContainer, contactSection.firstChild);
      
      // Initialize particles
      new InteractiveParticles(particlesContainer, {
        particleCount: 5000,
        particleSize: 2.5,
        particleColor: 0xffffff,
        backgroundColor: 0x000000,
        speed: 0.3,
        shape: 'sphere'
      });
      
      // Make sure content is above particles
      const contactContent = contactSection.querySelector('.contact-content');
      if (contactContent) {
        contactContent.style.position = 'relative';
        contactContent.style.zIndex = '1';
      }
    } else {
      // If contact section not found yet, try again when it's available
      console.log('Contact section not found yet. Will try again when it is available.');
      
      // Create a mutation observer to watch for added contact section
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutatio
(Content truncated due to size limit. Use line ranges to read in chunks)