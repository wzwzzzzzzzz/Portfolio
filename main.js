// Register ScrollTrigger Plugin for GSAP
gsap.registerPlugin(ScrollTrigger);

// 1. Silk WebGL Shader Background Animation (1:1 from @react-bits/Silk-JS-CSS)
window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('silk-container');
  if (!container) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- WebGL Setup using Three.js ---
  let width = window.innerWidth;
  let height = window.innerHeight;

  // Create WebGL Renderer with High DPI settings
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Create Scene and Perspective Camera (fov=75, near=0.1, far=1000, matching R3F default)
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(0, 0, 5);

  // Color normalization utility
  const hexToNormalizedRGB = (hex) => {
    const clean = hex.replace('#', '');
    return new THREE.Vector3(
      parseInt(clean.slice(0, 2), 16) / 255,
      parseInt(clean.slice(2, 4), 16) / 255,
      parseInt(clean.slice(4, 6), 16) / 255
    );
  };

  // 1:1 Configurable Uniforms matching R3F defaults
  const speedVal = 5.0; // 1:1 matching speed = 5
  const scaleVal = 1.0; // 1:1 matching scale = 1
  const colorVal = '#3b3445'; // Brightened Morandi slate-grape tone (increases background brightness)
  const noiseIntensityVal = 1.5; // 1:1 matching noiseIntensity = 1.5
  const rotationVal = 0.0; // 1:1 matching rotation = 0

  const uniforms = {
    uTime: { value: 0.0 },
    uSpeed: { value: speedVal },
    uScale: { value: scaleVal },
    uNoiseIntensity: { value: noiseIntensityVal },
    uColor: { value: hexToNormalizedRGB(colorVal) },
    uRotation: { value: rotationVal }
  };

  // 1:1 matching Vertex Shader (includes projectionMatrix * modelViewMatrix)
  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vPosition = position;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    varying vec3 vPosition;

    uniform float uTime;
    uniform vec3  uColor;
    uniform float uSpeed;
    uniform float uScale;
    uniform float uRotation;
    uniform float uNoiseIntensity;

    const float e = 2.71828182845904523536;

    float noise(vec2 texCoord) {
      float G = e;
      vec2  r = (G * sin(G * texCoord));
      return fract(r.x * r.y * (1.0 + texCoord.x));
    }

    vec2 rotateUvs(vec2 uv, float angle) {
      float c = cos(angle);
      float s = sin(angle);
      mat2  rot = mat2(c, -s, s, c);
      return rot * uv;
    }

    void main() {
      float rnd        = noise(gl_FragCoord.xy);
      vec2  uv         = rotateUvs(vUv * uScale, uRotation);
      vec2  tex        = uv * uScale;
      float tOffset    = uSpeed * uTime;

      // Primary sine displacement
      tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

      // Complex nested waves pattern
      float pattern = 0.6 +
                      0.4 * sin(5.0 * (tex.x + tex.y +
                                       cos(3.0 * tex.x + 5.0 * tex.y) +
                                       0.02 * tOffset) +
                               sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

      // Apply pattern, color and subtract subtle random noise grain
      vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
      col.a = 1.0;
      gl_FragColor = col;
    }
  `;

  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: uniforms,
    depthWrite: false,
    depthTest: false
  });

  // Create plane geometry size 1x1 (matching args={[1, 1, 1, 1]})
  const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // 1:1 viewport matching scale calculation (based on camera fov and distance z=5)
  const updatePlaneScale = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const aspect = w / h;
    const distance = camera.position.z;
    const fovRad = (camera.fov * Math.PI) / 180;
    const viewportHeight = 2 * Math.tan(fovRad / 2) * distance;
    const viewportWidth = viewportHeight * aspect;
    mesh.scale.set(viewportWidth, viewportHeight, 1);
  };

  // Perform initial scale
  updatePlaneScale();

  const clock = new THREE.Clock();

  function animate() {
    if (prefersReduced) {
      renderer.render(scene, camera);
      return; // Stop animation loop for accessibility
    }

    const delta = clock.getDelta();
    // Speed up background motion (increased from 0.1 to 0.3)
    uniforms.uTime.value += 0.3 * delta;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  // Resize listener
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      updatePlaneScale();
    }, 250);
  });
});


// 2. Portfolio horizontal scroll pan logic removed - spacer gap handles the space.


// 3. Fluid Hamburger Menu Toggle & Navigation Mobile Reveal
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const hamburgerLine1 = document.getElementById('hamburger-line1');
const hamburgerLine2 = document.getElementById('hamburger-line2');
const hamburgerLine3 = document.getElementById('hamburger-line3');
const mobileLinks = document.querySelectorAll('.mobile-link');

let isMenuOpen = false;

function toggleMobileMenu() {
  isMenuOpen = !isMenuOpen;
  
  if (isMenuOpen) {
    // Open Menu Visuals
    mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
    mobileMenu.classList.add('opacity-100', 'pointer-events-auto');
    
    // Hamburger line transformations (Smooth 'X' morph)
    hamburgerLine1.style.transform = 'translateY(7px) rotate(45deg)';
    hamburgerLine2.style.opacity = '0';
    hamburgerLine2.style.transform = 'scale(0)';
    hamburgerLine3.style.transform = 'translateY(-7px) rotate(-45deg)';
    
    // Staggered fade up menu links
    mobileLinks.forEach((link, idx) => {
      link.style.opacity = '0';
      link.style.transform = 'translateY(20px)';
      setTimeout(() => {
        link.style.transition = 'all 600ms cubic-bezier(0.32, 0.72, 0, 1)';
        link.style.opacity = '1';
        link.style.transform = 'translateY(0)';
      }, 150 + idx * 80);
    });
  } else {
    // Close Menu Visuals
    mobileMenu.classList.remove('opacity-100', 'pointer-events-auto');
    mobileMenu.classList.add('opacity-0', 'pointer-events-none');
    
    // Reset Hamburger lines
    hamburgerLine1.style.transform = 'none';
    hamburgerLine2.style.opacity = '1';
    hamburgerLine2.style.transform = 'none';
    hamburgerLine3.style.transform = 'none';
  }
}

if (menuToggle) {
  menuToggle.addEventListener('click', toggleMobileMenu);
}

// Close menu when a link is clicked
mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (isMenuOpen) toggleMobileMenu();
  });
});


// 4. Smooth Accordion Collapse/Expand for Work Experience
const accordionTriggers = document.querySelectorAll('.accordion-trigger');

accordionTriggers.forEach(trigger => {
  trigger.addEventListener('click', () => {
    const content = trigger.nextElementSibling;
    const icon = trigger.querySelector('.icon-rotate');
    const isAlreadyActive = content.classList.contains('active');
    
    // Collapse all other active accordions
    document.querySelectorAll('.accordion-content').forEach(otherContent => {
      if (otherContent !== content && otherContent.classList.contains('active')) {
        otherContent.classList.remove('active');
        otherContent.style.maxHeight = '0';
        const otherIcon = otherContent.previousElementSibling.querySelector('.icon-rotate');
        if (otherIcon) otherIcon.classList.remove('active');
      }
    });

    // Toggle current accordion
    if (!isAlreadyActive) {
      content.classList.add('active');
      content.style.maxHeight = content.scrollHeight + 'px';
      if (icon) icon.classList.add('active');
    } else {
      content.classList.remove('active');
      content.style.maxHeight = '0';
      if (icon) icon.classList.remove('active');
    }
  });
});

// Auto-expand the first accordion item for visual cue
window.addEventListener('load', () => {
  const firstTrigger = document.querySelector('.accordion-trigger');
  if (firstTrigger) {
    setTimeout(() => {
      firstTrigger.click();
    }, 500);
  }
});


// 5. Scroll Reveal Fade-up Transitions (Intersection Observer)
const revealElements = document.querySelectorAll('#resume h2, #resume p, #contact > div');

const revealObserver = new IntersectionObserver((entries, observer) => {
  // Check if system prefers reduced motion, if so, trigger instantly without slide transition
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  entries.forEach(entry => {
    if (entry.isIntersecting) {
      if (prefersReduced) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'none';
        entry.target.style.filter = 'none';
      } else {
        entry.target.classList.add('fade-up-visible');
      }
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.15
});

revealElements.forEach(el => {
  el.classList.add('fade-up-init');
  revealObserver.observe(el);
});

// 6. Sliding Navigation Hover Highlight Dynamic Indicator
window.addEventListener('DOMContentLoaded', () => {
  const desktopNav = document.getElementById('desktop-nav');
  if (!desktopNav) return;

  const indicator = document.getElementById('nav-indicator');
  const desktopLinks = desktopNav.querySelectorAll('ul li a');

  desktopLinks.forEach((link, index) => {
    link.addEventListener('mouseenter', (e) => {
      const target = e.currentTarget;

      // 1:1 exact mapping of left and width dimensions based on absolute Figma design coordinates
      const positions = [
        { left: 0, width: 77 },   // Home (Snaps to 4px inner border padding on left)
        { left: 113, width: 76 }, // About
        { left: 226, width: 71 }, // Work
        { left: 333, width: 92 }  // Contact (Snaps to 4px inner border padding on right)
      ];

      const pos = positions[index];

      // Map dynamic offsets to styling
      indicator.style.left = `${pos.left}px`;
      indicator.style.width = `${pos.width}px`;
      indicator.style.opacity = '1';

      // Current link turns black, other links are reset to text-[#e6e6e6]
      desktopLinks.forEach(item => {
        if (item === target) {
          item.classList.remove('text-[#e6e6e6]', 'hover:text-white');
          item.classList.add('text-black');
        } else {
          item.classList.remove('text-black');
          item.classList.add('text-[#e6e6e6]', 'hover:text-white');
        }
      });
    });
  });

  // Fade out indicator and restore original colors when leaving nav capsule
  desktopNav.addEventListener('mouseleave', () => {
    indicator.style.opacity = '0';
    desktopLinks.forEach(item => {
      item.classList.remove('text-black');
      item.classList.add('text-[#e6e6e6]', 'hover:text-white');
    });
  });
});


// 7. Auto-Verification Test Suite (Runs when URL has ?test=true)
window.addEventListener('DOMContentLoaded', () => {
  if (!window.location.search.includes('test=true')) return;

  // Create test panel UI
  const testPanel = document.createElement('div');
  testPanel.id = 'nav-test-panel';
  testPanel.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 10000;
    width: 420px;
    background: rgba(10, 10, 12, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    padding: 20px;
    color: #f4f4f7;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    backdrop-filter: blur(12px);
    border-left: 4px solid #00f0ff;
  `;

  testPanel.innerHTML = `
    <h3 style="margin: 0 0 12px 0; font-size: 13px; color: #00f0ff; display: flex; justify-content: space-between; align-items: center;">
      <span>🧭 NAVIGATION GEOMETRY TEST SUITE</span>
      <span id="test-suite-status" style="font-size: 9px; background: rgba(0, 240, 255, 0.15); padding: 2px 6px; border-radius: 4px; color: #00f0ff;">RUNNING</span>
    </h3>
    <div style="margin-bottom: 12px; opacity: 0.7; line-height: 1.4;">
      Testing navigation slide margins and text alignments. Target margins: 4.0px to outer border. Target text padding: 15.0px symmetric.
    </div>
    <table style="width: 100%; border-collapse: collapse; text-align: left;">
      <thead>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #8f90a6;">
          <th style="padding: 6px 4px;">Tab</th>
          <th style="padding: 6px 4px;">Left/Width</th>
          <th style="padding: 6px 4px;">Outer Margins</th>
          <th style="padding: 6px 4px;">Inner Padding</th>
          <th style="padding: 6px 4px; text-align: right;">Status</th>
        </tr>
      </thead>
      <tbody id="test-results-body">
        <tr><td colspan="5" style="padding: 12px 4px; text-align: center; color: #8f90a6;">Waiting for hover trigger sequence...</td></tr>
      </tbody>
    </table>
  `;

  document.body.appendChild(testPanel);

  const desktopNav = document.getElementById('desktop-nav');
  if (!desktopNav) return;

  const desktopLinks = desktopNav.querySelectorAll('ul li a');
  const indicator = document.getElementById('nav-indicator');
  const results = {};

  const runTestForIndex = (idx) => {
    return new Promise((resolve) => {
      if (idx >= desktopLinks.length) {
        resolve();
        return;
      }

      const link = desktopLinks[idx];
      const tabName = link.textContent.trim();

      // Trigger hover
      link.dispatchEvent(new MouseEvent('mouseenter'));

      // Wait for CSS transition completion to measure real elements
      setTimeout(() => {
        const navRect = desktopNav.getBoundingClientRect();
        const indRect = indicator.getBoundingClientRect();
        const linkRect = link.getBoundingClientRect();

        // Calculate geometry
        const leftMargin = indRect.left - navRect.left;
        const rightMargin = navRect.right - indRect.right;
        const topMargin = indRect.top - navRect.top;
        const bottomMargin = navRect.bottom - indRect.bottom;

        const leftPadding = linkRect.left - indRect.left;
        const rightPadding = indRect.right - linkRect.right;

        // Verify rules
        const outerMarginPass = (idx === 0) 
          ? (Math.abs(leftMargin - 4) < 1.0 && Math.abs(topMargin - 4) < 1.0 && Math.abs(bottomMargin - 4) < 1.0)
          : (idx === desktopLinks.length - 1)
            ? (Math.abs(rightMargin - 4) < 1.0 && Math.abs(topMargin - 4) < 1.0 && Math.abs(bottomMargin - 4) < 1.0)
            : (Math.abs(topMargin - 4) < 1.0 && Math.abs(bottomMargin - 4) < 1.0);

        // Symmetric padding pass (within 1.5px float range due to browser zoom/font antialiasing)
        const innerPaddingPass = Math.abs(leftPadding - rightPadding) < 1.5 && Math.abs(leftPadding - 15.0) < 1.5;
        const isPass = outerMarginPass && innerPaddingPass;

        results[tabName] = {
          left: parseFloat(indicator.style.left),
          width: parseFloat(indicator.style.width),
          margins: `L:${leftMargin.toFixed(1)} R:${rightMargin.toFixed(1)} T:${topMargin.toFixed(1)} B:${bottomMargin.toFixed(1)}`,
          padding: `L:${leftPadding.toFixed(1)} R:${rightPadding.toFixed(1)}`,
          pass: isPass
        };

        updateResultsTable();
        
        setTimeout(() => {
          resolve(runTestForIndex(idx + 1));
        }, 800);
      }, 400);
    });
  };

  const updateResultsTable = () => {
    const tbody = document.getElementById('test-results-body');
    if (!tbody) return;

    tbody.innerHTML = Object.keys(results).map(key => {
      const r = results[key];
      const statusColor = r.pass ? '#00ff66' : '#ff3366';
      const statusText = r.pass ? 'PASS' : 'FAIL';
      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 8px 4px; font-weight: bold; color: #fff;">${key}</td>
          <td style="padding: 8px 4px; color: #8f90a6;">L:${r.left} W:${r.width}</td>
          <td style="padding: 8px 4px; color: #8f90a6; font-size: 10px;">${r.margins}</td>
          <td style="padding: 8px 4px; color: #8f90a6;">${r.padding}</td>
          <td style="padding: 8px 4px; text-align: right; font-weight: bold; color: ${statusColor};">${statusText}</td>
        </tr>
      `;
    }).join('');
  };

  // Start automation loop
  setTimeout(async () => {
    await runTestForIndex(0);
    // Mouse out when done
    desktopNav.dispatchEvent(new MouseEvent('mouseleave'));
    
    // Set status to complete
    const statusSpan = document.getElementById('test-suite-status');
    if (statusSpan) {
      statusSpan.textContent = 'COMPLETE';
      statusSpan.style.background = 'rgba(0, 255, 102, 0.15)';
      statusSpan.style.color = '#00ff66';
    }
  }, 1000);
});


// 8. Scroll to Hide / Reveal Header Navigation
window.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  if (!header) return;

  // Dynamically inject transition classes to the header to avoid manual inline classes
  header.classList.add('transition-transform', 'duration-500', 'ease-out');

  let lastScrollY = window.pageYOffset;

  window.addEventListener('scroll', () => {
    // Safety check: if mobile dropdown menu is open, do not hide the header
    if (typeof isMenuOpen !== 'undefined' && isMenuOpen) return;

    const currentScrollY = window.pageYOffset;

    // Prevent iOS Safari rubber-band scroll at the top (negative scroll Y) from hiding the header
    if (currentScrollY <= 0) {
      header.classList.remove('-translate-y-full');
      return;
    }

    if (currentScrollY > lastScrollY && currentScrollY > 80) {
      // Scrolling Down & past threshold -> hide header
      header.classList.add('-translate-y-full');
    } else if (currentScrollY < lastScrollY) {
      // Scrolling Up -> reveal header
      header.classList.remove('-translate-y-full');
    }

    lastScrollY = currentScrollY;
  }, { passive: true });
});


// 9. Cutout Typography Parallax scrolling effect (Reference video1 styling)
window.addEventListener('DOMContentLoaded', () => {
  const resumeSection = document.getElementById('resume');
  const parallaxTrigger = document.getElementById('parallax-trigger');
  if (!resumeSection) return;

  const aboutGroup = document.getElementById('mask-about');
  const toGroup = document.getElementById('mask-to');
  const meGroup = document.getElementById('mask-me');

  if (aboutGroup && toGroup && meGroup) {
    // Parallax timeline bound to scroll triggered by the invisible parallax-trigger block
    gsap.timeline({
      scrollTrigger: {
        trigger: parallaxTrigger || resumeSection,
        start: 'top bottom', // Start animating as soon as big text block hits bottom of screen
        end: 'bottom center', // Align center (x=0) exactly when fully revealed in the upper half of viewport
        scrub: 1             // Smoothly link motion to scroll progress
      }
    })
    .fromTo(aboutGroup, { x: 350 }, { x: 0, ease: 'none' }, 0)
    .fromTo(toGroup, { x: -350 }, { x: 0, ease: 'none' }, 0)
    .fromTo(meGroup, { x: 225 }, { x: 0, ease: 'none' }, 0);
  }
});


// 10. Scroll-driven character-by-character Text Color Reveal (575757 -> FFFFFF)
window.addEventListener('DOMContentLoaded', () => {
  const resumeText = document.getElementById('resume-text');
  if (!resumeText) return;

  const paragraphs = resumeText.querySelectorAll('p');
  paragraphs.forEach(p => {
    const text = p.textContent.trim();
    // Split into characters, keeping spaces, wrapping letters/characters in span
    const chars = text.split('').map(char => {
      // Retain space format cleanly
      if (char === ' ') {
        return ' ';
      }
      return `<span class="char" style="color: #575757; transition: color 0.15s ease;">${char}</span>`;
    }).join('');
    p.innerHTML = chars;
  });

  // GSAP ScrollTrigger Timeline for character progressive lighting
  const chars = resumeText.querySelectorAll('.char');
  if (chars.length > 0) {
    gsap.to(chars, {
      color: '#ffffff',
      stagger: 0.05, // Interval between characters lighting up
      scrollTrigger: {
        trigger: resumeText,
        start: 'top 85%',   // Starts when paragraph top is 85% down the screen
        end: 'center center',  // Ends and reaches FFFFFF exactly when paragraph center is in viewport center
        scrub: 0.5,         // Scrub speed smoothing
      }
    });
  }
});


// 11. Scale Wrapper Controller, Text Scramble & Pixel Dissolve Reveal Animation with Scroll Locking (Figma 1:1 and Scroll Lock at bottom-1/9)
window.addEventListener('DOMContentLoaded', () => {
  // --- Scale Wrapper Resizer for Desktop Layout ---
  // --- Scale Wrapper Resizer for Desktop Layout ---
  const updateDesktopScale = () => {
    const wrapper1 = document.getElementById('desktop-scale-wrapper');
    const wrapper2 = document.getElementById('portfolio-scale-wrapper');
    const wrapper3 = document.getElementById('ezviz-scale-wrapper');
    const wrapper4 = document.getElementById('ezviz-scale-wrapper-2');
    const wrapper5 = document.getElementById('sheep-forest-scale-wrapper');
    const wrapper6 = document.getElementById('art-of-steam-scale-wrapper');
    const wrapper7 = document.getElementById('yongjiu-magnetics-scale-wrapper');
    const wrapper8 = document.getElementById('goldland-scale-wrapper');
    const wrapper9 = document.getElementById('contact-scale-wrapper');
    const wrapper10 = document.getElementById('categories-scale-wrapper');
    const clientWidth = document.body.clientWidth || window.innerWidth;
    const scale = clientWidth / 1920;

    if (wrapper1) {
      wrapper1.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
    if (wrapper2) {
      wrapper2.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
    if (wrapper3) {
      wrapper3.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
    if (wrapper4) {
      wrapper4.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
    if (wrapper5) {
      wrapper5.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
    if (wrapper6) {
      wrapper6.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
    if (wrapper7) {
      wrapper7.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
    if (wrapper8) {
      wrapper8.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
    if (wrapper9) {
      wrapper9.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
    if (wrapper10) {
      wrapper10.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
  };

  updateDesktopScale();
  window.addEventListener('resize', updateDesktopScale);

  // --- Personal Profile Localized Text Switcher (Instant 2s switch, pause on hover, wheel-driven switch) ---
  const initProfileCarousel = () => {
    const desktopTexts = document.querySelectorAll('.profile-text-desktop');
    const mobileTexts = document.querySelectorAll('.profile-text-mobile');
    const desktopZone = document.getElementById('profile-text-zone-desktop');
    const mobileZone = document.getElementById('profile-text-zone-mobile');

    if (!desktopTexts.length && !mobileTexts.length) return;

    let currentIndex = 0;
    const totalCount = Math.max(desktopTexts.length, mobileTexts.length);
    let carouselTimer = null;

    const updateDisplay = (targetIndex) => {
      currentIndex = (targetIndex + totalCount) % totalCount;

      desktopTexts.forEach((el, idx) => {
        el.style.display = idx === currentIndex ? 'block' : 'none';
      });

      mobileTexts.forEach((el, idx) => {
        el.style.display = idx === currentIndex ? 'block' : 'none';
      });
    };

    const showNext = () => {
      updateDisplay(currentIndex + 1);
    };

    const showPrev = () => {
      updateDisplay(currentIndex - 1);
    };

    const startTimer = () => {
      if (carouselTimer) clearInterval(carouselTimer);
      carouselTimer = setInterval(showNext, 2000);
    };

    const stopTimer = () => {
      if (carouselTimer) {
        clearInterval(carouselTimer);
        carouselTimer = null;
      }
    };

    startTimer();

    // Wheel-driven switching when cursor is inside the text zone
    let lastWheelTime = 0;
    const WHEEL_COOLDOWN = 280; // 280ms debounce to ensure deliberate single-step switching

    const handleWheel = (e) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheelTime < WHEEL_COOLDOWN) return;
      if (Math.abs(e.deltaY) < 10) return;

      if (e.deltaY > 0) {
        showNext();
      } else {
        showPrev();
      }
      lastWheelTime = now;
    };

    // Pause on hover over text zone, resume on mouse leave, switch on wheel
    [desktopZone, mobileZone].forEach(zone => {
      if (!zone) return;
      zone.addEventListener('mouseenter', stopTimer);
      zone.addEventListener('mouseleave', startTimer);
      zone.addEventListener('wheel', handleWheel, { passive: false });
    });
  };

  initProfileCarousel();



  // --- Constant Velocity Horizontal Marquee Engine ---
  const initConstantVelocityMarquee = () => {
    const workMarquee = document.getElementById('marquee-work');
    const projMarquee = document.getElementById('marquee-projects');
    if (!workMarquee || !projMarquee) return;

    // Get width of a single text block copy
    const getCopyWidth = (container) => {
      const firstChild = container.querySelector('.marquee-text');
      return firstChild ? firstChild.offsetWidth : 0;
    };

    let copyWidthWork = getCopyWidth(workMarquee);
    let copyWidthProj = getCopyWidth(projMarquee);

    // Re-calculate widths on window resize to ensure fluid responsiveness
    window.addEventListener('resize', () => {
      copyWidthWork = getCopyWidth(workMarquee);
      copyWidthProj = getCopyWidth(projMarquee);
    });

    let currentXWork = 0;
    let currentXProj = 0;
    let lastFrameTime = performance.now();

    // Wrap helper matching React Motion's wrap algorithm
    const wrap = (min, max, v) => {
      const range = max - min;
      const mod = (((v - min) % range) + range) % range;
      return mod + min;
    };

    const updateMarquee = (now) => {
      const deltaTime = Math.min(0.1, (now - lastFrameTime) / 1000);
      lastFrameTime = now;

      // Constant drift velocities (Work = 90px/s rightwards, Proj = -90px/s leftwards)
      // Completely unaffected by mouse scrolls or viewport velocity
      const baseVelWork = 90;
      const baseVelProj = -90;

      // Work Row (Row 1)
      currentXWork += baseVelWork * deltaTime;
      if (copyWidthWork > 0) {
        currentXWork = wrap(-copyWidthWork, 0, currentXWork);
      }

      // Projects Row (Row 2)
      currentXProj += baseVelProj * deltaTime;
      if (copyWidthProj > 0) {
        currentXProj = wrap(-copyWidthProj, 0, currentXProj);
      }

      // Apply hardware-accelerated translate3d to DOM
      workMarquee.style.transform = `translate3d(${currentXWork}px, 0, 0)`;
      projMarquee.style.transform = `translate3d(${currentXProj}px, 0, 0)`;

      requestAnimationFrame(updateMarquee);
    };

    // Initial delay check to make sure offsetWidth is computed after DOM reflow
    setTimeout(() => {
      copyWidthWork = getCopyWidth(workMarquee);
      copyWidthProj = getCopyWidth(projMarquee);
      requestAnimationFrame(updateMarquee);
    }, 100);
  };

  initConstantVelocityMarquee();

  // --- TextPressure component ported from React Bits (Juan Fuentes / Compressa) ---
  const initTextPressure = () => {
    const text = "THANKS!";
    const chars = text.split('');
    const mouse = { x: 0, y: 0 };
    const cursor = { x: 0, y: 0 };

    const dist = (a, b) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getAttr = (distance, maxDist, minVal, maxVal) => {
      const val = maxVal - Math.abs((maxVal * distance) / maxDist);
      return Math.max(minVal, val + minVal);
    };

    // Initialize logic for a target title element and its spans
    const setupInstance = (titleEl, containerEl) => {
      if (!titleEl || !containerEl) return null;
      
      titleEl.innerHTML = '';
      const spans = chars.map((char) => {
        const span = document.createElement('span');
        span.innerText = char;
        span.setAttribute('data-char', char);
        span.style.display = 'inline-block';
        span.style.color = '#ffffff';
        titleEl.appendChild(span);
        return span;
      });

      return { titleEl, containerEl, spans };
    };

    const desktopInstance = setupInstance(
      document.getElementById('text-pressure-title'),
      document.getElementById('text-pressure-container')
    );
    const mobileInstance = setupInstance(
      document.getElementById('text-pressure-title-mobile'),
      document.getElementById('text-pressure-container-mobile')
    );

    const instances = [desktopInstance, mobileInstance].filter(Boolean);
    if (instances.length === 0) return;

    // Track mouse coordinate globally
    const handleMouseMove = (e) => {
      cursor.x = e.clientX;
      cursor.y = e.clientY;
    };
    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        cursor.x = e.touches[0].clientX;
        cursor.y = e.touches[0].clientY;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Initialize coordinate baseline at visual centers
    instances.forEach((inst) => {
      const rect = inst.containerEl.getBoundingClientRect();
      mouse.x = rect.left + rect.width / 2;
      mouse.y = rect.top + rect.height / 2;
      cursor.x = mouse.x;
      cursor.y = mouse.y;
    });

    let rafId;
    const animate = () => {
      mouse.x += (cursor.x - mouse.x) / 15;
      mouse.y += (cursor.y - mouse.y) / 15;

      instances.forEach((inst) => {
        const titleRect = inst.titleEl.getBoundingClientRect();
        const maxDist = titleRect.width / 2 || 400;

        inst.spans.forEach((span) => {
          if (!span) return;
          const spanRect = span.getBoundingClientRect();
          const charCenter = {
            x: spanRect.left + spanRect.width / 2,
            y: spanRect.top + spanRect.height / 2
          };

          const d = dist(mouse, charCenter);

          // Roboto Flex axes ranges (wdth: 25..151, wght: 100..1000, ital: 0..1)
          const wdth = Math.floor(getAttr(d, maxDist, 25, 151));
          const wght = Math.floor(getAttr(d, maxDist, 100, 1000));
          const italVal = getAttr(d, maxDist, 0, 1).toFixed(2);

          const newSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;
          if (span.style.fontVariationSettings !== newSettings) {
            span.style.fontVariationSettings = newSettings;
          }
        });
      });

      rafId = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('unload', () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    });
  };

  initTextPressure();

  // --- 12. Ultra-Smooth GSAP ScrollTrigger Portfolio Stacking (EZVIZ -> Goldland) ---
  const initPortfolioCardStacking = () => {
    if (window.innerWidth < 1024) return;

    const sections = [
      document.getElementById('portfolio-ezviz'),
      document.getElementById('portfolio-ezviz-2'),
      document.getElementById('portfolio-traditional-paste'),
      document.getElementById('portfolio-art-of-steam'),
      document.getElementById('portfolio-yongjiu-magnetics'),
      document.getElementById('portfolio-goldland')
    ].filter(Boolean);

    if (sections.length === 0) return;

    sections.forEach((sec, idx) => {
      // Set z-index stack order dynamically
      sec.style.zIndex = (10 + idx).toString();

      // Pin each section (except the 6th section which covers the 5th and finishes the stack)
      if (idx < sections.length - 1) {
        ScrollTrigger.create({
          trigger: sec,
          start: 'top top',
          end: '+=100%',
          pin: true,
          pinSpacing: false, // Critical: Allows next section to slide up directly over the pinned section
          scrub: true,
          anticipatePin: 1
        });
      }
    });

    ScrollTrigger.refresh();
  };

  initPortfolioCardStacking();

  // --- 13. Category Showcase Interactive Tab System ---
  const initCategoryTabs = () => {
    const btnVisual = document.getElementById('btn-tab-visual');
    const btnSpatial = document.getElementById('btn-tab-spatial');
    const btnVideo = document.getElementById('btn-tab-video');

    const layerVisual = document.getElementById('tab-layer-visual');
    const layerSpatial = document.getElementById('tab-layer-spatial');
    const layerVideo = document.getElementById('tab-layer-video');

    if (!btnVisual || !btnSpatial || !btnVideo || !layerVisual || !layerSpatial || !layerVideo) return;

    const tabs = [
      { key: 'visual', btn: btnVisual, layer: layerVisual },
      { key: 'spatial', btn: btnSpatial, layer: layerSpatial },
      { key: 'video', btn: btnVideo, layer: layerVideo }
    ];

    function activateTab(activeKey) {
      tabs.forEach(tab => {
        const titles = tab.btn.querySelectorAll('.tab-btn-title, .tab-btn-sub');
        if (tab.key === activeKey) {
          // Bring active card layer to top layer (z-index: 30) with rich active drop-shadow
          tab.layer.style.zIndex = '30';
          tab.layer.style.opacity = '1';
          tab.layer.style.filter = 'drop-shadow(0px 12px 30px rgba(0, 0, 0, 0.28))';
          tab.layer.style.transform = 'translateY(0px)';
          // Active tab text turns BLACK
          titles.forEach(t => t.style.color = '#000000');
        } else {
          // Assign relative lower z-indices to unselected card layers with subtle drop-shadow
          if (activeKey === 'visual') {
            tab.layer.style.zIndex = tab.key === 'spatial' ? '20' : '10';
          } else if (activeKey === 'spatial') {
            tab.layer.style.zIndex = tab.key === 'visual' ? '20' : '10';
          } else if (activeKey === 'video') {
            tab.layer.style.zIndex = tab.key === 'visual' ? '20' : '10';
          }
          tab.layer.style.opacity = '1';
          tab.layer.style.filter = 'drop-shadow(0px 6px 16px rgba(0, 0, 0, 0.16))';
          tab.layer.style.transform = 'translateY(0px)';
          // Inactive tab text turns WHITE
          titles.forEach(t => t.style.color = '#ffffff');
        }
      });

      const spatialAccordionInteractive = document.getElementById('spatial-accordion-interactive');
      if (spatialAccordionInteractive) {
        spatialAccordionInteractive.style.pointerEvents = activeKey === 'spatial' ? 'auto' : 'none';
      }
    }

    btnVisual.addEventListener('click', () => activateTab('visual'));
    btnSpatial.addEventListener('click', () => activateTab('spatial'));
    btnVideo.addEventListener('click', () => activateTab('video'));
  };

  initCategoryTabs();

  // --- 13.1 Spatial Design Accordion Interactive Hover Controller ---
  const initSpatialDesignAccordion = () => {
    const coverImg = document.getElementById('spatial-cover-img');
    const container = document.getElementById('spatial-accordion-interactive');
    if (!coverImg || !container) return;

    let currentIndex = 1;
    const TOTAL_PROJECTS = 12;
    const EXPANDED_WIDTH = 628;
    const COLLAPSED_WIDTH = 100;
    const TOTAL_WIDTH = 1728;

    // Preload all 12 restored cover images for instant zero-latency switching
    const preloadedCache = [];
    for (let i = 1; i <= TOTAL_PROJECTS; i++) {
      const img = new Image();
      img.src = `05_categories/spatial/cover/cover_${String(i).padStart(2, '0')}.png?v=2`;
      preloadedCache.push(img);
    }

    function switchProject(targetIndex) {
      if (targetIndex < 1 || targetIndex > TOTAL_PROJECTS || targetIndex === currentIndex) return;
      currentIndex = targetIndex;
      coverImg.src = `05_categories/spatial/cover/cover_${String(targetIndex).padStart(2, '0')}.png?v=2`;
    }

    // High performance mousemove calculation using precise geometric projection
    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width) return;
      const scale = rect.width / TOTAL_WIDTH;
      const localX = (e.clientX - rect.left) / scale;

      if (localX < 0 || localX > TOTAL_WIDTH) return;

      const expandedLeft = (currentIndex - 1) * COLLAPSED_WIDTH;
      const expandedRight = expandedLeft + EXPANDED_WIDTH;

      let targetIndex;
      if (localX < expandedLeft) {
        // Left collapsed strips
        targetIndex = Math.floor(localX / COLLAPSED_WIDTH) + 1;
      } else if (localX < expandedRight) {
        // Current expanded item
        targetIndex = currentIndex;
      } else {
        // Right collapsed strips
        const delta = localX - expandedRight;
        targetIndex = currentIndex + 1 + Math.floor(delta / COLLAPSED_WIDTH);
      }

      targetIndex = Math.max(1, Math.min(TOTAL_PROJECTS, targetIndex));
      switchProject(targetIndex);
    });

    // --- 13.2 Spatial Design Detail Modal Controller ---
    const modal = document.getElementById('spatial-detail-modal');
    const backdrop = document.getElementById('spatial-modal-backdrop');
    const closeBtn = document.getElementById('spatial-modal-close-btn');
    const scrollContainer = document.getElementById('spatial-detail-scroll-container');
    const detailImg = document.getElementById('spatial-detail-img');
    const upBtn = document.getElementById('spatial-scroll-up-btn');
    const downBtn = document.getElementById('spatial-scroll-down-btn');

    function openSpatialModal(projectIndex) {
      if (!modal || !scrollContainer || !detailImg) return;
      const idx = Math.max(1, Math.min(TOTAL_PROJECTS, projectIndex));
      detailImg.src = `05_categories/spatial/detail/detail_${String(idx).padStart(2, '0')}.jpg`;
      scrollContainer.scrollTop = 0;
      modal.style.display = 'block';
      requestAnimationFrame(() => {
        modal.style.opacity = '1';
      });
    }

    function closeSpatialModal() {
      if (!modal) return;
      modal.style.opacity = '0';
      setTimeout(() => {
        modal.style.display = 'none';
      }, 350);
    }

    if (backdrop) backdrop.addEventListener('click', closeSpatialModal);
    if (closeBtn) closeBtn.addEventListener('click', closeSpatialModal);

    if (upBtn && scrollContainer) {
      upBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        scrollContainer.scrollBy({ top: -500, behavior: 'smooth' });
      });
    }

    if (downBtn && scrollContainer) {
      downBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        scrollContainer.scrollBy({ top: 500, behavior: 'smooth' });
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.style.display === 'block') {
        closeSpatialModal();
      }
    });

    // Support clicking on arrow hotspots in expanded card OR opening detail modal
    container.addEventListener('click', (e) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width) return;
      const scale = rect.width / TOTAL_WIDTH;
      const localX = (e.clientX - rect.left) / scale;
      const localY = (e.clientY - rect.top) / scale;

      const expandedLeft = (currentIndex - 1) * COLLAPSED_WIDTH;
      const expandedRight = expandedLeft + EXPANDED_WIDTH;

      // 1. Arrow hotspots in expanded card (Y >= 650)
      if (localY >= 650 && localX >= expandedLeft && localX < expandedRight) {
        if (localX <= expandedLeft + 60 && currentIndex > 1) {
          switchProject(currentIndex - 1);
          return;
        }
        if (localX >= expandedRight - 60 && currentIndex < TOTAL_PROJECTS) {
          switchProject(currentIndex + 1);
          return;
        }
      }

      // 2. Clicking any project opens its Design Details modal!
      let targetIndex;
      if (localX < expandedLeft) {
        targetIndex = Math.floor(localX / COLLAPSED_WIDTH) + 1;
      } else if (localX < expandedRight) {
        targetIndex = currentIndex;
      } else {
        const delta = localX - expandedRight;
        targetIndex = currentIndex + 1 + Math.floor(delta / COLLAPSED_WIDTH);
      }

      targetIndex = Math.max(1, Math.min(TOTAL_PROJECTS, targetIndex));
      switchProject(targetIndex);
      openSpatialModal(targetIndex);
    });
  };

  initSpatialDesignAccordion();

  // --- 14. Visual Design Project List Interactive Hover Controller ---
  const initVisualDesignInteractiveList = () => {
    const rowItems = document.querySelectorAll('.visual-row-item');
    const dividerLines = document.querySelectorAll('.category-divider-line');
    const floatingBtn = document.getElementById('floating-view-project-btn');
    const previewImg = document.getElementById('visual-preview-img');
    const visualLayer = document.getElementById('tab-layer-visual');

    if (!rowItems.length || !floatingBtn || !previewImg || !visualLayer) return;

    function activateRow(index) {
      const activeItem = rowItems[index];
      if (!activeItem) return;

      const imgSrc = activeItem.getAttribute('data-img');

      // 1. Highlight Top & Bottom Lines for active row
      dividerLines.forEach((line, idx) => {
        if (idx === index || idx === index + 1) {
          line.classList.add('is-visible');
        } else {
          line.classList.remove('is-visible');
        }
      });

      // 2. Smoothly Move & Show Floating Glass VIEW PROJECT Button to the active row
      const targetTop = 316 + index * 70;
      floatingBtn.style.top = `${targetTop}px`;
      floatingBtn.style.opacity = '1';
      floatingBtn.style.transform = 'translateY(0px)';

      // 3. Smoothly Switch Front Cover Image matching the project title
      if (imgSrc && previewImg.getAttribute('src') !== imgSrc) {
        previewImg.style.opacity = '0';
        previewImg.style.transform = 'scale(0.97)';
        setTimeout(() => {
          previewImg.setAttribute('src', imgSrc);
          previewImg.style.opacity = '1';
          previewImg.style.transform = 'scale(1)';
        }, 120);
      }

      // Mark active row for text-roll CSS transition
      rowItems.forEach(r => r.classList.remove('is-active'));
      activeItem.classList.add('is-active');
    }

    // Set Default State on Page Load (EZVIZ Smart Entry - index 0)
    activateRow(0);

    rowItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        const index = parseInt(item.getAttribute('data-index'), 10);
        activateRow(index);
      });
    });

    // Reset to Default State (EZVIZ Smart Entry - index 0) when mouse leaves the visual project layer
    visualLayer.addEventListener('mouseleave', () => {
      activateRow(0);
    });

    // --- 15. Project Detail Fullscreen Modal Interactive Controller ---
    let currentActiveIndex = 0;
    let currentBookPage = 1;

    // Dynamic project galleries mapping for all 5 visual design folders in 05_categories/visual/detail
    const projectGalleries = {
      0: {
        folder: '05_categories/visual/detail/smart_entry',
        pages: Array.from({ length: 54 }, (_, i) => `page_${String(i + 1).padStart(2, '0')}.webp`)
      },
      1: {
        folder: '05_categories/visual/detail/smart_camera',
        pages: Array.from({ length: 64 }, (_, i) => `page_${String(i + 1).padStart(2, '0')}.webp`)
      },
      2: {
        folder: '05_categories/visual/detail/smart_living',
        pages: Array.from({ length: 28 }, (_, i) => `page_${String(i + 1).padStart(2, '0')}.webp`)
      },
      3: {
        folder: '05_categories/visual/detail/smart_cleaning',
        pages: Array.from({ length: 34 }, (_, i) => `page_${String(i + 1).padStart(2, '0')}.webp`)
      },
      4: {
        folder: '05_categories/visual/detail/gitex',
        pages: Array.from({ length: 8 }, (_, i) => `page_${String(i + 1).padStart(2, '0')}.webp`)
      }
    };

    const modal = document.getElementById('project-detail-modal');
    const modalBackdrop = document.getElementById('modal-backdrop-blur');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalPageLeft = document.getElementById('modal-page-left');
    const modalPageRight = document.getElementById('modal-page-right');
    const modalPrevBtn = document.getElementById('modal-prev-btn');
    const modalNextBtn = document.getElementById('modal-next-btn');

    // Web Design Long Scroll Mode Elements
    const modalWebContainer = document.getElementById('modal-web-container');
    const modalWebImg = document.getElementById('modal-web-img');
    const modalScrollUpBtn = document.getElementById('modal-scroll-up-btn');
    const modalScrollDownBtn = document.getElementById('modal-scroll-down-btn');

    // Projects 5 to 10 are Web / Long Design Showcase Projects
    const isWebDesignProject = (idx) => idx >= 5 && idx <= 10;

    const webDesignImages = {
      5: '05_categories/visual/web/06_c6c.jpg',
      6: '05_categories/visual/web/07_re7.jpg',
      7: '05_categories/visual/web/08_ty1.jpg',
      8: '05_categories/visual/web/09_y3000.jpg',
      9: '05_categories/visual/web/10_akiitu.jpg',
      10: '05_categories/visual/web/11_footwild.jpg'
    };

    function getMaxPages() {
      const gallery = projectGalleries[currentActiveIndex];
      return gallery ? gallery.pages.length : 1;
    }

    function updateModalBookPages() {
      if (!modalPageLeft || !modalPageRight) return;

      const gallery = projectGalleries[currentActiveIndex];
      if (gallery && gallery.pages && gallery.pages.length > 0) {
        const leftIdx = currentBookPage - 1;
        const rightIdx = Math.min(currentBookPage, gallery.pages.length - 1);

        const leftSrc = `${gallery.folder}/${gallery.pages[leftIdx]}`;
        const rightSrc = `${gallery.folder}/${gallery.pages[rightIdx]}`;

        modalPageLeft.setAttribute('src', encodeURI(leftSrc));
        modalPageRight.setAttribute('src', encodeURI(rightSrc));
      } else {
        // Fallback for other projects using their front cover images
        const activeItem = rowItems[currentActiveIndex];
        const projectImg = activeItem ? activeItem.getAttribute('data-img') : '05_categories/visual/cover_01_smart_entry.png';
        modalPageLeft.setAttribute('src', encodeURI(projectImg));
        modalPageRight.setAttribute('src', encodeURI(projectImg));
      }
    }

    function openModal(index = 0) {
      if (!modal) return;
      currentActiveIndex = index;
      currentBookPage = 1; // Reset to first page

      if (isWebDesignProject(index)) {
        // Mode B: Web Design Long Scroll Mode
        if (modalPageLeft) modalPageLeft.style.display = 'none';
        if (modalPageRight) modalPageRight.style.display = 'none';
        if (modalPrevBtn) modalPrevBtn.style.display = 'none';
        if (modalNextBtn) modalNextBtn.style.display = 'none';

        if (modalWebContainer) {
          modalWebContainer.style.display = 'block';
          modalWebContainer.scrollTop = 0;
        }
        if (modalWebImg) {
          const webImgSrc = webDesignImages[index] || '05_categories/visual/web/06_c6c.jpg';
          modalWebImg.setAttribute('src', encodeURI(webImgSrc));
        }
        if (modalScrollUpBtn) modalScrollUpBtn.style.display = 'block';
        if (modalScrollDownBtn) modalScrollDownBtn.style.display = 'block';
      } else {
        // Mode A: Double Page Book Gallery Mode
        if (modalWebContainer) modalWebContainer.style.display = 'none';
        if (modalScrollUpBtn) modalScrollUpBtn.style.display = 'none';
        if (modalScrollDownBtn) modalScrollDownBtn.style.display = 'none';

        if (modalPageLeft) modalPageLeft.style.display = 'block';
        if (modalPageRight) modalPageRight.style.display = 'block';
        if (modalPrevBtn) modalPrevBtn.style.display = 'block';
        if (modalNextBtn) modalNextBtn.style.display = 'block';

        updateModalBookPages();
      }

      modal.style.display = 'block';
      requestAnimationFrame(() => {
        modal.style.opacity = '1';
      });
    }

    function closeModal() {
      if (!modal) return;
      modal.style.opacity = '0';
      setTimeout(() => {
        modal.style.display = 'none';
      }, 400);
    }

    // 1. Bind Click Events to Project Titles
    rowItems.forEach((item, idx) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(idx);
      });
    });

    // 2. Bind Click Event to Right Preview Image
    if (previewImg) {
      previewImg.addEventListener('click', (e) => {
        e.stopPropagation();
        const activeRow = document.querySelector('.visual-row-item.is-active');
        const idx = activeRow ? parseInt(activeRow.getAttribute('data-index'), 10) : 0;
        openModal(idx);
      });
    }

    // 3. Bind Click Event to Floating View Project Button
    if (floatingBtn) {
      floatingBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const activeRow = document.querySelector('.visual-row-item.is-active');
        const idx = activeRow ? parseInt(activeRow.getAttribute('data-index'), 10) : 0;
        openModal(idx);
      });
    }

    // Helper functions to turn page (Mode A)
    function goPrevPage() {
      const maxP = getMaxPages();
      if (maxP > 1 && currentBookPage > 1) {
        currentBookPage = Math.max(1, currentBookPage - 2);
        updateModalBookPages();
      }
    }

    function goNextPage() {
      const maxP = getMaxPages();
      if (maxP > 1 && currentBookPage < maxP - 1) {
        currentBookPage = Math.min(maxP - 1, currentBookPage + 2);
        updateModalBookPages();
      }
    }

    // Helper functions to scroll web page (Mode B)
    function scrollWebUp() {
      if (modalWebContainer) {
        modalWebContainer.scrollBy({ top: -500, behavior: 'smooth' });
      }
    }

    function scrollWebDown() {
      if (modalWebContainer) {
        modalWebContainer.scrollBy({ top: 500, behavior: 'smooth' });
      }
    }

    // 4. Modal Controls & Pagination
    if (modalPrevBtn) {
      modalPrevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goPrevPage();
      });
    }

    if (modalNextBtn) {
      modalNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goNextPage();
      });
    }

    // Web Design Scroll Control Buttons
    if (modalScrollUpBtn) {
      modalScrollUpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        scrollWebUp();
      });
    }

    if (modalScrollDownBtn) {
      modalScrollDownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        scrollWebDown();
      });
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

    // 5. Click Left Page -> Previous Page; Click Right Page -> Next Page
    if (modalPageLeft) {
      modalPageLeft.addEventListener('click', (e) => {
        e.stopPropagation();
        goPrevPage();
      });
    }

    if (modalPageRight) {
      modalPageRight.addEventListener('click', (e) => {
        e.stopPropagation();
        goNextPage();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (modal && modal.style.display === 'block') {
        if (e.key === 'Escape') closeModal();
        if (isWebDesignProject(currentActiveIndex)) {
          if (e.key === 'ArrowUp' || e.key === 'PageUp') scrollWebUp();
          if (e.key === 'ArrowDown' || e.key === 'PageDown') scrollWebDown();
        } else {
          if (e.key === 'ArrowLeft') goPrevPage();
          if (e.key === 'ArrowRight') goNextPage();
        }
      }
    });

    // --- 16. Dynamic Video 3D Curved Carousel Controller ---
    function initDynamicVideoCarousel() {
      const cards = document.querySelectorAll('.curved-video-card');
      const counterEl = document.getElementById('video-counter');
      const vPrevBtn = document.getElementById('video-prev-btn');
      const vNextBtn = document.getElementById('video-next-btn');
      const showcaseContainer = document.getElementById('video-showcase-container');

      if (!cards || cards.length === 0) return;

      let currentIndex = 0;
      const total = cards.length;
      let autoPlayTimer = null;
      const autoPlayInterval = 1500; // 每 1.5 秒自动无缝播放

      // 核心 3D 弧形变换逻辑 (环形首尾相接循环 + 中间清晰两侧模糊 + 3D 景深)
      function updateCarousel() {
        if (isGridViewMode) return; // 网格排列模式下禁止渲染 3D 弧形卡片
        cards.forEach((card, i) => {
          // 首尾无缝闭环环形偏移 (Circular Infinite Offset)
          let offset = i - currentIndex;
          if (offset > total / 2) offset -= total;
          if (offset < -total / 2) offset += total;

          const absOffset = Math.abs(offset);

          if (absOffset > 2) {
            // 隐藏超出视野范围的卡片
            card.style.opacity = '0';
            card.style.pointerEvents = 'none';
            card.style.transform = `translateX(${offset * 310}px) translateZ(-400px) scale(0.5)`;
            card.style.zIndex = '0';
            card.style.filter = 'blur(12px)';
            card.classList.remove('active');
            return;
          }

          // 计算 3D 偏移参数 (Scaled for 1920x1080 canvas)
          const translateX = offset * 310;       // 水平间距
          const translateZ = -absOffset * 160;   // 景深后退
          const rotateY = -offset * 20;         // 弧形内倾角
          const scale = 1 - absOffset * 0.12;   // 比例缩放
          const opacity = 1 - absOffset * 0.22; // 透明度衰减
          const zIndex = 50 - absOffset;        // 层叠顺序

          // ★ 只有处于正中间的图片清晰 (blur 0px)，两侧图片模糊 (blur 8px) ★
          const blurFilter = absOffset === 0 ? 'blur(0px)' : 'blur(8px)';

          card.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
          card.style.opacity = `${opacity}`;
          card.style.zIndex = `${zIndex}`;
          card.style.filter = blurFilter;
          card.style.pointerEvents = 'auto';

          if (absOffset === 0) {
            card.classList.add('active');
          } else {
            card.classList.remove('active');
          }
        });
      }

      // 自动播放控制器 (Auto Play Controller)
      function startAutoPlay() {
        stopAutoPlay();
        if (isGridViewMode) return; // 网格排列模式下绝对不启动自动轮播
        autoPlayTimer = setInterval(() => {
          if (isGridViewMode) return;
          currentIndex = (currentIndex + 1) % total;
          updateCarousel();
        }, autoPlayInterval);
      }

      function stopAutoPlay() {
        if (autoPlayTimer) {
          clearInterval(autoPlayTimer);
          autoPlayTimer = null;
        }
      }

      // 鼠标悬停时暂停自动播放
      if (showcaseContainer) {
        showcaseContainer.addEventListener('mouseenter', stopAutoPlay);
        showcaseContainer.addEventListener('mouseleave', startAutoPlay);
      }

      // 浮动爱心动效 (Spawn Heart Animation)
      function spawnHeart(x, y) {
        const heart = document.createElement('div');
        heart.className = 'heart-float';
        heart.textContent = '❤️';
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;
        
        const container = showcaseContainer || document.body;
        container.appendChild(heart);
        setTimeout(() => heart.remove(), 850);
      }

      // 点击卡片事件处理
      cards.forEach((card, index) => {
        card.addEventListener('click', (e) => {
          if (currentIndex === index) {
            // 点击当前正中主卡片触发爱心交互
            const rect = showcaseContainer ? showcaseContainer.getBoundingClientRect() : document.body.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            spawnHeart(clickX, clickY);
          } else {
            // 点击两侧卡片切换视角
            currentIndex = index;
            updateCarousel();
          }
        });
      });

      // Mode B: Grid Layout Toggle Controller (Toggled via 田字格图标)
      const vGridBtn = document.getElementById('video-grid-btn');
      const vGridContainer = document.getElementById('video-grid-container');
      const gridCards = document.querySelectorAll('.grid-video-card');
      let isGridViewMode = false;
      let gridStartIndex = 0;
      const totalVideos = 18;
      let gridAutoPlayTimer = null;
      const gridAutoPlayInterval = 1000; // 网格排版 1.0 秒自动平滑平移

      function updateGridView(direction = 'left') {
        const gCards = document.querySelectorAll('.grid-video-card');
        const animClass = direction === 'right' ? 'shifting-right' : 'shifting-left';
        
        gCards.forEach((gCard, sIdx) => {
          const imgIdx = ((gridStartIndex + sIdx) % totalVideos) + 1;
          gCard.setAttribute('src', `05_categories/video/thumb/thumb_grid_${String(imgIdx).padStart(2, '0')}.png`);
          gCard.setAttribute('data-index', imgIdx - 1);
          
          gCard.classList.remove('shifting-left', 'shifting-right');
          void gCard.offsetWidth; // Trigger reflow for keyframe restart
          gCard.classList.add(animClass);
        });
      }

      function startGridAutoPlay() {
        stopGridAutoPlay();
        if (!isGridViewMode) return;
        gridAutoPlayTimer = setInterval(() => {
          if (!isGridViewMode) return;
          gridStartIndex = (gridStartIndex + 1) % totalVideos;
          updateGridView('left');
        }, gridAutoPlayInterval);
      }

      function stopGridAutoPlay() {
        if (gridAutoPlayTimer) {
          clearInterval(gridAutoPlayTimer);
          gridAutoPlayTimer = null;
        }
      }

      function toggleVideoViewMode(forceMode) {
        if (typeof forceMode === 'boolean') {
          isGridViewMode = forceMode;
        } else {
          isGridViewMode = !isGridViewMode;
        }

        if (isGridViewMode) {
          stopAutoPlay();
          cards.forEach(c => { c.style.opacity = '0'; c.style.pointerEvents = 'none'; });
          
          if (vPrevBtn) { vPrevBtn.style.left = '880px'; vPrevBtn.style.top = '992px'; }
          if (vNextBtn) { vNextBtn.style.left = '945px'; vNextBtn.style.top = '992px'; }
          if (vGridBtn) {
            vGridBtn.style.left = '1004px';
            vGridBtn.style.top = '992px';
            vGridBtn.setAttribute('src', 'ui/btn_switch_playback.png');
          }

          updateGridView('left');

          if (vGridContainer) {
            vGridContainer.style.display = 'block';
            requestAnimationFrame(() => {
              vGridContainer.style.opacity = '1';
              vGridContainer.style.pointerEvents = 'auto';
            });
          }

          startGridAutoPlay();
        } else {
          stopGridAutoPlay();
          if (vPrevBtn) { vPrevBtn.style.left = '881px'; vPrevBtn.style.top = '991px'; }
          if (vNextBtn) { vNextBtn.style.left = '946px'; vNextBtn.style.top = '991px'; }
          if (vGridBtn) {
            vGridBtn.style.left = '1005px';
            vGridBtn.style.top = '991px';
            vGridBtn.setAttribute('src', 'ui/btn_toggle_layout.png');
          }

          if (vGridContainer) {
            vGridContainer.style.opacity = '0';
            vGridContainer.style.pointerEvents = 'none';
            setTimeout(() => {
              vGridContainer.style.display = 'none';
            }, 400);
          }
          updateCarousel();
          startAutoPlay();
        }
      }

      if (vGridContainer) {
        vGridContainer.addEventListener('mouseenter', () => {
          if (isGridViewMode) stopGridAutoPlay();
        });
        vGridContainer.addEventListener('mouseleave', () => {
          if (isGridViewMode) startGridAutoPlay();
        });
      }

      if (vGridBtn) {
        vGridBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleVideoViewMode();
        });
      }

      // Prev / Next Button Controls
      if (vPrevBtn) {
        vPrevBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (isGridViewMode) {
            gridStartIndex = (gridStartIndex - 1 + totalVideos) % totalVideos;
            updateGridView('right');
            startGridAutoPlay(); // Restart 1s timer after manual click
          } else {
            currentIndex = (currentIndex - 1 + total) % total;
            updateCarousel();
          }
        });
      }
      if (vNextBtn) {
        vNextBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (isGridViewMode) {
            gridStartIndex = (gridStartIndex + 1) % totalVideos;
            updateGridView('left');
            startGridAutoPlay(); // Restart 1s timer after manual click
          } else {
            currentIndex = (currentIndex + 1) % total;
            updateCarousel();
          }
        });
      }

      // Bind click on grid cards to open fullscreen video player modal
      gridCards.forEach((gridCard) => {
        gridCard.addEventListener('click', (e) => {
          e.stopPropagation();
          const targetIndex = parseInt(gridCard.getAttribute('data-index') || '0', 10);
          openVideoPlayer(targetIndex);
        });
      });

      // 初始化运行并启动自动播放
      updateCarousel();
      startAutoPlay();

      // --- 17. Fullscreen Video Player Modal Controller ---
      const vModal = document.getElementById('video-player-modal');
      const vBackdrop = document.getElementById('video-modal-backdrop');
      const vCloseBtn = document.getElementById('video-modal-close-btn');
      const vElement = document.getElementById('active-video-element');
      const vProgressBg = document.getElementById('video-progress-bg');
      const vProgressFill = document.getElementById('video-progress-fill');
      const vTimeCurrent = document.getElementById('video-time-current');
      const vTimeTotal = document.getElementById('video-time-total');
      const vPlayPauseBtn = document.getElementById('video-play-pause-btn');

      function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
      }

      const vScreenContainer = document.getElementById('video-screen-container');

      function openVideoPlayer(cardIndex) {
        if (!vModal) return;
        stopAutoPlay(); // Pause background carousel auto-play when video opens

        const videoNum = cardIndex + 1;
        const videoSrc = `05_categories/video/media/video_${String(videoNum).padStart(2, '0')}.mp4`;
        const posterSrc = encodeURI(`05_categories/video/cover/cover_full_${String(videoNum).padStart(2, '0')}.png`);

        // Check if current video is 16, 17 or 18 (cardIndex 15, 16, 17) -> Portrait Mode
        const isPortraitVideo = (cardIndex >= 15 && cardIndex <= 17);

        if (vScreenContainer) {
          if (isPortraitVideo) {
            // 16, 17, 18 Portrait Mode: width: 342px; height: 608px; left: 789px (Centered); top: 246px; border-radius: 0px (No rounded corners!)
            vScreenContainer.style.width = '342px';
            vScreenContainer.style.left = '789px';
            vScreenContainer.style.top = '246px';
            vScreenContainer.style.height = '608px';
            vScreenContainer.style.borderRadius = '0px';
          } else {
            // Normal Landscape Mode: width: 1080px; height: 608px; left: 420px; top: 246px; border-radius: 20px
            vScreenContainer.style.width = '1080px';
            vScreenContainer.style.left = '420px';
            vScreenContainer.style.top = '246px';
            vScreenContainer.style.height = '608px';
            vScreenContainer.style.borderRadius = '20px';
          }
        }

        if (vElement) {
          vElement.pause();
          vElement.setAttribute('poster', posterSrc);
          vElement.setAttribute('src', videoSrc);
          vElement.currentTime = 0;
          
          const playPromise = vElement.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Browser auto-play policy fallback
            });
          }
        }

        vModal.style.display = 'block';
        requestAnimationFrame(() => {
          vModal.style.opacity = '1';
        });
      }

      function closeVideoPlayer() {
        if (!vModal) return;
        vModal.style.opacity = '0';
        if (vElement) vElement.pause();
        setTimeout(() => {
          vModal.style.display = 'none';
          if (!isGridViewMode) {
            startAutoPlay(); // Only resume 3D auto-play if we were in 3D carousel mode
          }
        }, 400);
      }

      // Open video player when center active card is clicked
      cards.forEach((card, index) => {
        card.addEventListener('click', (e) => {
          if (currentIndex === index) {
            // Heart animation handles on click; open video player modal
            openVideoPlayer(index);
          }
        });
      });

      if (vCloseBtn) vCloseBtn.addEventListener('click', closeVideoPlayer);
      if (vBackdrop) vBackdrop.addEventListener('click', closeVideoPlayer);

      // Play / Pause Toggle
      if (vPlayPauseBtn && vElement) {
        vPlayPauseBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (vElement.paused) {
            vElement.play();
          } else {
            vElement.pause();
          }
        });
      }

      // Seek Rewind (5s) and Forward (5s) Controls
      const vRewindBtn = document.getElementById('video-rewind-btn');
      const vForwardBtn = document.getElementById('video-forward-btn');

      if (vRewindBtn && vElement) {
        vRewindBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          vElement.currentTime = Math.max(0, vElement.currentTime - 5);
        });
      }

      if (vForwardBtn && vElement) {
        vForwardBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const dur = vElement.duration || 0;
          vElement.currentTime = Math.min(dur, vElement.currentTime + 5);
        });
      }

      // Realtime Video Timeupdate & Progress Bar Sync
      if (vElement) {
        vElement.addEventListener('timeupdate', () => {
          const current = vElement.currentTime;
          const duration = vElement.duration || 0;
          
          if (vTimeCurrent) vTimeCurrent.textContent = formatTime(current);
          if (vTimeTotal && duration > 0) {
            const remaining = duration - current;
            vTimeTotal.textContent = `-${formatTime(remaining)}`;
          }

          if (vProgressFill && duration > 0) {
            const percent = (current / duration) * 100;
            vProgressFill.style.width = `${percent}%`;
          }
        });
      }

      // Seek Video via Progress Bar Click
      if (vProgressBg && vElement) {
        vProgressBg.addEventListener('click', (e) => {
          e.stopPropagation();
          const rect = vProgressBg.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const width = rect.width;
          if (width > 0 && vElement.duration) {
            const newTime = (clickX / width) * vElement.duration;
            vElement.currentTime = newTime;
          }
        });
      }

      // Keydown ESC to close video modal
      document.addEventListener('keydown', (e) => {
        if (vModal && vModal.style.display === 'block' && e.key === 'Escape') {
          closeVideoPlayer();
        }
      });
    }

    initDynamicVideoCarousel();
  };

  initVisualDesignInteractiveList();
});
