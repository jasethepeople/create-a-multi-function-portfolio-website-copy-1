// Three.js Birds Animation - Enhanced version based on GitHub gist
// https://gist.github.com/CodeMyUI/9fb29521dcc6da67c734e8bb49679816

// Import Three.js library
document.addEventListener('DOMContentLoaded', function() {
  // Create script element to load Three.js
  const threeScript = document.createElement('script');
  threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  threeScript.onload = initBirdsAnimation;
  document.head.appendChild(threeScript);
});

function initBirdsAnimation() {
  let SCREEN_WIDTH = window.innerWidth;
  let SCREEN_HEIGHT = window.innerHeight;
  let container, stats;
  let camera, scene, renderer;
  let birds, bird;
  let boid, boids;
  let mouseX = 0, mouseY = 0;
  
  init();
  animate();
  
  function init() {
    container = document.createElement('div');
    container.id = 'birds-container';
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = '-1';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);
    
    camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000);
    camera.position.z = 450;
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 100, 1000);
    
    // Create birds
    birds = [];
    boids = [];
    
    for (let i = 0; i < 200; i++) {
      boid = new Boid();
      boid.position.x = Math.random() * 400 - 200;
      boid.position.y = Math.random() * 400 - 200;
      boid.position.z = Math.random() * 400 - 200;
      boid.velocity.x = Math.random() * 2 - 1;
      boid.velocity.y = Math.random() * 2 - 1;
      boid.velocity.z = Math.random() * 2 - 1;
      boid.setAvoidWalls(true);
      boid.setWorldSize(500, 500, 400);
      
      boids.push(boid);
      
      bird = new THREE.Mesh(
        new THREE.ConeGeometry(5, 20, 5),
        new THREE.MeshBasicMaterial({color: 0xffffff})
      );
      bird.phase = Math.floor(Math.random() * 62.83);
      bird.position.copy(boids[i].position);
      
      birds.push(bird);
      scene.add(bird);
    }
    
    renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    container.appendChild(renderer.domElement);
    
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);
  }
  
  function onWindowResize() {
    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;
    
    camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.updateProjectionMatrix();
    
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  }
  
  function onDocumentMouseMove(event) {
    mouseX = (event.clientX - SCREEN_WIDTH / 2) * 0.5;
    mouseY = (event.clientY - SCREEN_HEIGHT / 2) * 0.5;
  }
  
  function animate() {
    requestAnimationFrame(animate);
    render();
  }
  
  function render() {
    // Update boids and birds
    for (let i = 0, il = birds.length; i < il; i++) {
      boid = boids[i];
      boid.run(boids);
      
      // Set goal based on mouse position
      const vector = new THREE.Vector3(mouseX - boid.position.x, -mouseY - boid.position.y, 0);
      vector.normalize();
      vector.multiplyScalar(0.5);
      boid.velocity.add(vector);
      
      bird = birds[i];
      bird.position.copy(boids[i].position);
      
      const color = new THREE.Color(0xffffff);
      color.setHSL(i / birds.length, 1.0, 0.5);
      bird.material.color.copy(color);
      
      // Rotate bird to face direction of movement
      const velocity = boids[i].velocity;
      const direction = new THREE.Vector3();
      direction.copy(velocity).normalize();
      
      const axis = new THREE.Vector3(0, 1, 0);
      const angle = Math.atan2(direction.z, direction.x);
      bird.rotation.y = angle;
      
      // Add wing flapping
      bird.rotation.z = Math.sin(bird.phase) * 0.2;
      bird.phase += 0.1;
    }
    
    renderer.render(scene, camera);
  }
}

// Boid class for bird flocking behavior
function Boid() {
  const vector = new THREE.Vector3();
  const _acceleration = new THREE.Vector3(0, 0, 0);
  let _width = 500;
  let _height = 500;
  let _depth = 400;
  let _goal;
  const _neighborhoodRadius = 100;
  const _maxSpeed = 4;
  const _maxSteerForce = 0.1;
  let _avoidWalls = false;
  
  this.position = new THREE.Vector3();
  this.velocity = new THREE.Vector3();
  
  this.setGoal = function(target) {
    _goal = target;
  };
  
  this.setAvoidWalls = function(value) {
    _avoidWalls = value;
  };
  
  this.setWorldSize = function(width, height, depth) {
    _width = width;
    _height = height;
    _depth = depth;
  };
  
  this.run = function(boids) {
    if (_avoidWalls) {
      // Avoid walls - x
      vector.set(-_width, this.position.y, this.position.z);
      vector = this.avoid(vector);
      vector.multiplyScalar(5);
      _acceleration.add(vector);
      
      vector.set(_width, this.position.y, this.position.z);
      vector = this.avoid(vector);
      vector.multiplyScalar(5);
      _acceleration.add(vector);
      
      // Avoid walls - y
      vector.set(this.position.x, -_height, this.position.z);
      vector = this.avoid(vector);
      vector.multiplyScalar(5);
      _acceleration.add(vector);
      
      vector.set(this.position.x, _height, this.position.z);
      vector = this.avoid(vector);
      vector.multiplyScalar(5);
      _acceleration.add(vector);
      
      // Avoid walls - z
      vector.set(this.position.x, this.position.y, -_depth);
      vector = this.avoid(vector);
      vector.multiplyScalar(5);
      _acceleration.add(vector);
      
      vector.set(this.position.x, this.position.y, _depth);
      vector = this.avoid(vector);
      vector.multiplyScalar(5);
      _acceleration.add(vector);
    }
    
    // Cohesion - move toward center of neighbors
    const cohesion = this.cohesion(boids);
    cohesion.multiplyScalar(0.1);
    _acceleration.add(cohesion);
    
    // Separation - avoid crowding neighbors
    const separation = this.separation(boids);
    separation.multiplyScalar(0.25);
    _acceleration.add(separation);
    
    // Alignment - match velocity with neighbors
    const alignment = this.alignment(boids);
    alignment.multiplyScalar(0.1);
    _acceleration.add(alignment);
    
    // Limit acceleration
    if (_acceleration.length() > _maxSteerForce) {
      _acceleration.normalize();
      _acceleration.multiplyScalar(_maxSteerForce);
    }
    
    // Update velocity and position
    this.velocity.add(_acceleration);
    
    // Limit speed
    if (this.velocity.length() > _maxSpeed) {
      this.velocity.normalize();
      this.velocity.multiplyScalar(_maxSpeed);
    }
    
    this.position.add(this.velocity);
    _acceleration.set(0, 0, 0);
  };
  
  this.avoid = function(target) {
    const steer = new THREE.Vector3();
    steer.copy(this.position);
    steer.sub(target);
    
    const distance = steer.length();
    
    if (distance > 0) {
      steer.divideScalar(distance);
    }
    
    return steer;
  };
  
  this.cohesion = function(boids) {
    const center = new THREE.Vector3();
    let count = 0;
    
    for (let i = 0, il = boids.length; i < il; i++) {
      if (this !== boids[i]) {
        const distance = this.position.distanceTo(boids[i].position);
        
        if (distance < _neighborhoodRadius) {
          center.add(boids[i].position);
          count++;
        }
      }
    }
    
    if (count > 0) {
      center.divideScalar(count);
      return this.seek(center);
    }
    
    return new THREE.Vector3();
  };
  
  this.separation = function(boids) {
    const steer = new THREE.Vector3();
    
    for (let i = 0, il = boids.length; i < il; i++) {
      if (this !== boids[i]) {
        const distance = this.position.distanceTo(boids[i].position);
        
        if (distance < _neighborhoodRadius) {
          const diff = new THREE.Vector3();
          diff.subVectors(this.position, boids[i].position);
          diff.normalize();
          diff.divideScalar(distance);
          steer.add(diff);
        }
      }
    }
    
    return steer;
  };
  
  this.alignment = function(boids) {
    const velocity = new THREE.Vector3();
    let count = 0;
    
    for (let i = 0, il = boids.length; i < il; i++) {
      if (this !== boids[i]) {
        const distance = this.position.distanceTo(boids[i].position);
        
        if (distance < _neighborhoodRadius) {
          velocity.add(boids[i].velocity);
          count++;
        }
      }
    }
    
    if (count > 0) {
      velocity.divideScalar(count);
      
      const steer = new THREE.Vector3();
      steer.subVectors(velocity, this.velocity);
      
      if (steer.length() > _maxSteerForce) {
        steer.normalize();
        steer.multiplyScalar(_maxSteerForce);
      }
      
      return steer;
    }
    
    return new THREE.Vector3();
  };
  
  this.seek = function(target) {
    const steer = new THREE.Vector3();
    steer.subVectors(target, this.position);
    
    if (steer.length() > _maxSteerForce) {
      steer.normalize();
      steer.multiplyScalar(_maxSteerForce);
    }
    
    return steer;
  };
}
