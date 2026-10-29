// WebGL Mouseover Effects for Images
// Based on https://tympanus.net/Tutorials/webgl-mouseover-effects/step3.html

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
        // Load shader code
        loadShaders().then(shaders => {
          initWebGLEffects(shaders);
        });
      }
    };
    document.head.appendChild(script);
  });
});

// Load shader code
async function loadShaders() {
  // Define vertex and fragment shaders inline since we can't load external files
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  
  const fragmentShader = `
    uniform sampler2D texture1;
    uniform sampler2D texture2;
    uniform float progress;
    uniform vec2 mouse;
    uniform float intensity;
    uniform vec2 resolution;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      
      // Calculate distance from mouse position
      vec2 mousePos = mouse / resolution;
      float dist = distance(mousePos, uv);
      float radius = 0.3; // Effect radius
      
      // Create distortion effect based on mouse distance
      float strength = smoothstep(radius, 0.0, dist) * intensity;
      vec2 dir = normalize(uv - mousePos);
      vec2 offset = dir * strength * 0.1;
      
      // Apply distortion to texture coordinates
      vec2 distortedUV = uv - offset;
      
      // Mix between original and distorted image based on progress
      vec4 color1 = texture2D(texture1, uv);
      vec4 color2 = texture2D(texture2, distortedUV);
      
      // Apply color shift effect
      vec4 finalColor = mix(color1, color2, progress);
      finalColor.rgb += strength * 0.2; // Add glow effect
      
      gl_FragColor = finalColor;
    }
  `;
  
  return { vertexShader, fragmentShader };
}

function initWebGLEffects(shaders) {
  // Create WebGL effect class
  class WebGLImageEffect {
    constructor(imageElement) {
      this.imageElement = imageElement;
      this.container = document.createElement('div');
      this.container.className = 'webgl-image-container';
      this.imageElement.parentNode.insertBefore(this.container, this.imageElement);
      this.container.appendChild(this.imageElement);
      
      // Set container style
      this.container.style.position = 'relative';
      this.container.style.overflow = 'hidden';
      this.container.style.width = '100%';
      this.container.style.height = 'auto';
      
      // Get image dimensions
      this.width = this.imageElement.offsetWidth;
      this.height = this.imageElement.offsetHeight;
      
      // Initialize Three.js scene
      this.initScene();
      
      // Add event listeners
      this.addEventListeners();
    }
    
    initScene() {
      // Create scene
      this.scene = new THREE.Scene();
      
      // Create camera
      this.camera = new THREE.OrthographicCamera(
        -0.5, 0.5, 0.5, -0.5, 0.1, 10
      );
      this.camera.position.z = 1;
      
      // Create renderer
      this.renderer = new THREE.WebGLRenderer({ alpha: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(this.width, this.height);
      this.container.appendChild(this.renderer.domElement);
      
      // Position the canvas
      this.renderer.domElement.style.position = 'absolute';
      this.renderer.domElement.style.top = '0';
      this.renderer.domElement.style.left = '0';
      this.renderer.domElement.style.width = '100%';
      this.renderer.domElement.style.height = '100%';
      this.renderer.domElement.style.zIndex = '1';
      
      // Hide original image
      this.imageElement.style.opacity = '0';
      this.imageElement.style.visibility = 'hidden';
      
      // Create textures
      this.texture1 = new THREE.TextureLoader().load(this.imageElement.src);
      this.texture2 = this.texture1.clone();
      
      // Create material with shaders
      this.material = new THREE.ShaderMaterial({
        uniforms: {
          texture1: { value: this.texture1 },
          texture2: { value: this.texture2 },
          progress: { value: 0 },
          mouse: { value: new THREE.Vector2(0, 0) },
          intensity: { value: 0 },
          resolution: { value: new THREE.Vector2(this.width, this.height) }
        },
        vertexShader: shaders.vertexShader,
        fragmentShader: shaders.fragmentShader
      });
      
      // Create mesh
      this.geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
      this.mesh = new THREE.Mesh(this.geometry, this.material);
      this.scene.add(this.mesh);
      
      // Set aspect ratio
      this.setAspectRatio();
      
      // Start animation loop
      this.animate();
    }
    
    setAspectRatio() {
      const imageAspect = this.imageElement.naturalHeight / this.imageElement.naturalWidth;
      const containerAspect = this.height / this.width;
      
      if (containerAspect > imageAspect) {
        // Container is taller than image
        this.mesh.scale.set(1, containerAspect / imageAspect, 1);
      } else {
        // Container is wider than image
        this.mesh.scale.set(imageAspect / containerAspect, 1, 1);
      }
    }
    
    addEventListeners() {
      // Mouse events
      this.container.addEventListener('mousemove', this.onMouseMove.bind(this));
      this.container.addEventListener('mouseenter', this.onMouseEnter.bind(this));
      this.container.addEventListener('mouseleave', this.onMouseLeave.bind(this));
      
      // Touch events for mobile
      this.container.addEventListener('touchmove', this.onTouchMove.bind(this));
      this.container.addEventListener('touchstart', this.onTouchStart.bind(this));
      this.container.addEventListener('touchend', this.onTouchEnd.bind(this));
      
      // Window resize
      window.addEventListener('resize', this.onResize.bind(this));
    }
    
    onMouseMove(e) {
      const rect = this.container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      this.material.uniforms.mouse.value.x = mouseX;
      this.material.uniforms.mouse.value.y = this.height - mouseY; // Invert Y for WebGL coordinates
    }
    
    onMouseEnter() {
      gsap.to(this.material.uniforms.progress, {
        value: 1,
        duration: 0.5
      });
      
      gsap.to(this.material.uniforms.intensity, {
        value: 1,
        duration: 0.5
      });
    }
    
    onMouseLeave() {
      gsap.to(this.material.uniforms.progress, {
        value: 0,
        duration: 0.5
      });
      
      gsap.to(this.material.uniforms.intensity, {
        value: 0,
        duration: 0.5
      });
    }
    
    onTouchMove(e) {
      if (e.touches.length > 0) {
        const rect = this.container.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const touchY = e.touches[0].clientY - rect.top;
        
        this.material.uniforms.mouse.value.x = touchX;
        this.material.uniforms.mouse.value.y = this.height - touchY;
      }
    }
    
    onTouchStart() {
      gsap.to(this.material.uniforms.progress, {
        value: 1,
        duration: 0.5
      });
      
      gsap.to(this.material.uniforms.intensity, {
        value: 1,
        duration: 0.5
      });
    }
    
    onTouchEnd() {
      gsap.to(this.material.uniforms.progress, {
        value: 0,
        duration: 0.5
      });
      
      gsap.to(this.material.uniforms.intensity, {
        value: 0,
        duration: 0.5
      });
    }
    
    onResize() {
      // Update dimensions
      this.width = this.container.offsetWidth;
      this.height = this.container.offsetHeight;
      
      // Update renderer
      this.renderer.setSize(this.width, this.height);
      
      // Update resolution uniform
      this.material.uniforms.resolution.value.set(this.width, this.height);
      
      // Update aspect ratio
      this.setAspectRatio();
    }
    
    animate() {
      requestAnimationFrame(this.animate.bind(this));
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  // Initialize WebGL effects for all photo items
  function initializeEffects() {
    // Find all photo items in the photography page
    const photoItems = document.querySelectorAll('.photo-item img');
    
    if (photoItems.length > 0) {
      photoItems.forEach(img => {
        // Make sure image is loaded before initializing effect
        if (img.complete) {
          new WebGLImageEffect(img);
        } else {
          img.onload = () => {
            new WebGLImageEffect(img);
          };
        }
      });
    } else {
      // If no photo items found yet, try again later (they might be created dynamically)
      console.log('No photo items found yet. Will try again when they are available.');
      
      // Create a mutation observer to watch for added photo items
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes) {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1) { // Element node
                const newPhotoItems = node.querySelectorAll('.photo-item img');
                if (newPhotoItems.length > 0) {
                  newPhotoItems.forEach(img => {
                    if (img.complete) {
                      new WebGLImageEffect(img);
                    } else {
                      img.onload = () => {
                        new WebGLImageEffect(img);
                      };
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
  
  // Initialize effects when DOM is fully loaded
  if (document.readyState === 'complete') {
    initializeEffects();
  } else {
    window.addEventListener('load', initializeEffects);
  }
}
