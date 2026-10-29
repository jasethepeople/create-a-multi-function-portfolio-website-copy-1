// Particles Music Visualizer
// Based on https://tympanus.net/Tutorials/ParticlesMusicVisualizer/

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
        initMusicVisualizer();
      }
    };
    document.head.appendChild(script);
  });
});

function initMusicVisualizer() {
  class AudioVisualizer {
    constructor(audioElement, container) {
      this.audio = audioElement;
      this.container = container;
      
      // Set up container
      this.container.style.position = 'relative';
      this.container.style.overflow = 'hidden';
      this.container.style.width = '100%';
      this.container.style.height = '300px';
      
      // Create audio context and analyzer
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);
      
      // Connect audio to analyzer
      this.source = this.audioContext.createMediaElementSource(this.audio);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      // Initialize Three.js scene
      this.initScene();
      
      // Add event listeners
      this.addEventListeners();
      
      // Start animation
      this.animate();
    }
    
    initScene() {
      // Get dimensions
      this.width = this.container.offsetWidth;
      this.height = this.container.offsetHeight;
      
      // Create scene
      this.scene = new THREE.Scene();
      
      // Create camera
      this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
      this.camera.position.z = 100;
      
      // Create renderer
      this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
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
      this.particleCount = 2000;
      this.particleSystem = new THREE.Group();
      
      // Create different particle groups for different frequency ranges
      this.lowFreqParticles = this.createParticleGroup(0x3498db, 1.5); // Blue for low frequencies
      this.midFreqParticles = this.createParticleGroup(0x9b59b6, 1.2); // Purple for mid frequencies
      this.highFreqParticles = this.createParticleGroup(0xe74c3c, 1.0); // Red for high frequencies
      
      this.scene.add(this.particleSystem);
      
      // Initial distribution
      this.distributeParticles();
    }
    
    createParticleGroup(color, size) {
      const particleCount = this.particleCount / 3;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const scales = new Float32Array(particleCount);
      
      // Create positions and scales
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        scales[i] = Math.random() * size;
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
      
      // Create material
      const material = new THREE.PointsMaterial({
        color: color,
        size: 1,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      });
      
      // Create particle system
      const particles = new THREE.Points(geometry, material);
      this.particleSystem.add(particles);
      
      return particles;
    }
    
    distributeParticles() {
      // Distribute particles in a sphere
      const distributeInSphere = (particles, radius) => {
        const positions = particles.geometry.attributes.position.array;
        const count = positions.length / 3;
        
        for (let i = 0; i < count; i++) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);
          const r = radius * Math.cbrt(Math.random());
          
          positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
          positions[i * 3 + 2] = r * Math.cos(phi);
        }
        
        particles.geometry.attributes.position.needsUpdate = true;
      };
      
      distributeInSphere(this.lowFreqParticles, 50);
      distributeInSphere(this.midFreqParticles, 40);
      distributeInSphere(this.highFreqParticles, 30);
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
      // Audio play/pause events
      this.audio.addEventListener('play', () => {
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
      });
      
      // Window resize
      window.addEventListener('resize', this.onResize.bind(this));
    }
    
    onResize() {
      this.width = this.container.offsetWidth;
      this.height = this.container.offsetHeight;
      
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      
      this.renderer.setSize(this.width, this.height);
    }
    
    updateParticles() {
      // Get frequency data
      this.analyser.getByteFrequencyData(this.dataArray);
      
      // Split frequency data into ranges
      const lowFreq = this.getAverageFrequency(0, 5);
      const midFreq = this.getAverageFrequency(6, 10);
      const highFreq = this.getAverageFrequency(11, 15);
      
      // Update particles based on frequency data
      this.updateParticleGroup(this.lowFreqParticles, lowFreq);
      this.updateParticleGroup(this.midFreqParticles, midFreq);
      this.updateParticleGroup(this.highFreqParticles, highFreq);
      
      // Rotate particle system
      this.particleSystem.rotation.y += 0.002;
      this.particleSystem.rotation.x += 0.001;
    }
    
    getAverageFrequency(startIndex, endIndex) {
      let sum = 0;
      for (let i = startIndex; i <= endIndex; i++) {
        sum += this.dataArray[i];
      }
      return sum / (endIndex - startIndex + 1) / 255;
    }
    
    updateParticleGroup(particles, intensity) {
      const positions = particles.geometry.attributes.position.array;
      const scales = particles.geometry.attributes.scale.array;
      const count = positions.length / 3;
      
      // Scale particles based on intensity
      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        const dist = Math.sqrt(
          positions[ix] * positions[ix] +
          positions[ix + 1] * positions[ix + 1] +
          positions[ix + 2] * positions[ix + 2]
        );
        
        // Move particles outward based on intensity
        const normDist = dist / 50;
        const intensityFactor = intensity * 2;
        
        // Scale position
        const scale = 1 + intensityFactor;
        positions[ix] *= scale * 0.01 + 0.99;
        positions[ix + 1] *= scale * 0.01 + 0.99;
        positions[ix + 2] *= scale * 0.01 + 0.99;
        
        // Scale size
        scales[i] = scales[i] * 0.95 + (scales[i] * intensity * 0.8) * 0.05;
      }
      
      particles.geometry.attributes.position.needsUpdate = true;
      particles.geometry.attributes.scale.needsUpdate = true;
      
      // Update material properties
      particles.material.size = 1 + intensity * 2;
      particles.material.opacity = 0.6 + intensity * 0.4;
    }
    
    animate() {
      requestAnimationFrame(this.animate.bind(this));
      
      // Only update if audio is playing
      if (!this.audio.paused) {
        this.updateParticles();
      }
      
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  // Initialize visualizer for all audio elements
  function initializeVisualizers() {
    const audioElements = document.querySelectorAll('audio');
    
    if (audioElements.length > 0) {
      audioElements.forEach(audio => {
        // Create container for visualizer
        const container = document.createElement('div');
        container.className = 'audio-visualizer-container';
        
        // Insert container after audio element
        audio.parentNode.insertBefore(container, audio.nextSibling);
        
        // Initialize visualizer
        new AudioVisualizer(audio, container);
      });
    } else {
      // If no audio elements found yet, try again when they are added
      console.log('No audio elements found yet. Will try again when they are available.');
      
      // Create a mutation observer to watch for added audio elements
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes) {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1) { // Element node
                const newAudioElements = node.querySelectorAll('audio');
                if (newAudioElements.length > 0) {
                  newAudioElements.forEach(audio => {
                    // Check if visualizer already exists for this audio
                    if (!audio.nextSibling || !audio.nextSibling.classList.contains('audio-visualizer-container')) {
                      // Create container for visualizer
                      const container = document.createElement('div');
                      container.className = 'audio-visualizer-container';
                      
                      // Insert container after audio element
                      audio.parentNode.insertBefore(container, audio.nextSibling);
                      
                      // Initialize visualizer
                      new AudioVisualizer(audio, container);
                    }
                  });
                }
              }
            });
          }
        });
      });
      
      // Start observing the document body for changes
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }
  
  // Add CSS for audio visualizer
  function addVisualizerStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .audio-visualizer-container {
        width: 100%;
        height: 300px;
        margin: 20px 0;
        border-radius: 8px;
        overflow: hidden;
        background-color: rgba(0, 0, 0, 0.8);
      }
      
      .audio-controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 8px;
      }
      
      .audio-controls button {
        background: none;
        border: none;
        color: white;
        font-size: 16px;
        cursor: pointer;
        padding: 5px 10px;
        border-radius: 4px;
        transition: background-color 0.3s;
      }
      
      .audio-controls button:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
      
      .audio-controls .progress {
        flex-grow: 1;
        height: 5px;
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 5px;
        margin: 0 10px;
        position: relative;
        cursor: pointer;
      }
      
      .audio-controls .progress-bar {
        height: 100%;
        background-color: #3498db;
        border-radius: 5px;
        width: 0%;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Initialize visualizers and add styles
  addVisualizerStyles();
  
  // Initialize when DOM is fully loaded
  if (document.readyState === 'complete') {
    initializeVisualizers();
  } else {
    window.addEventListener('load', initializeVisualizers);
  }
}
