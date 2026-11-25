(function () {
  'use strict';

  class NaturalAudioEngine {
    constructor() {
      this.ctx = null;
      this.enabled = false;
      this.masterGain = null;
    }

    init() {
      if (this.ctx) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      } catch (e) {
        console.warn('Web Audio API not supported on this platform.');
      }
    }

    toggle() {
      if (!this.ctx) this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.enabled = !this.enabled;
      if (this.enabled) {
        this.playChord([440, 554.37, 659.25, 880]);
      }
      return this.enabled;
    }

    playTick() {
      if (!this.enabled || !this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.02);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.02);
    }

    playTap() {
      if (!this.enabled || !this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, t);
      osc.frequency.exponentialRampToValueAtTime(520, t + 0.05);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.05);
    }

    playChord(frequencies) {
      if (!this.enabled || !this.ctx) return;
      frequencies.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime + idx * 0.035;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.32);
      });
    }

    playGentlePulse() {
      if (!this.enabled || !this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, t);
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.1);

      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.1);
    }
  }

  const sound = new NaturalAudioEngine();

  class OrganicStardustCanvas {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.particles = [];
      this.numParticles = Math.min(Math.floor((this.width * this.height) / 14000), 85);
      this.mouse = { x: -1000, y: -1000, radius: 150, active: false };
      this.ripples = [];

      this.init();
    }

    init() {
      this.resize();
      window.addEventListener('resize', () => this.resize());

      window.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.mouse.active = true;
      });

      window.addEventListener('mouseleave', () => {
        this.mouse.active = false;
      });

      window.addEventListener('click', (e) => {
        this.spawnRipple(e.clientX, e.clientY);
        sound.playGentlePulse();
      });

      this.createParticles();
      this.animate();
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      this.ctx.scale(this.dpr, this.dpr);
      this.numParticles = Math.min(Math.floor((this.width * this.height) / 14000), 85);
      this.createParticles();
    }

    createParticles() {
      this.particles = [];
      const colors = ['#FF6B35', '#F59E0B', '#F8FAFC', '#60A5FA', '#E2E8F0'];
      for (let i = 0; i < this.numParticles; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: Math.random() * 2.0 + 0.8,
          baseColor: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.45 + 0.15,
          pulseSpeed: Math.random() * 0.02 + 0.008,
          pulseVal: Math.random() * Math.PI
        });
      }
    }

    spawnRipple(x, y) {
      this.ripples.push({
        x: x,
        y: y,
        radius: 4,
        maxRadius: 130,
        alpha: 0.65
      });
      if (this.ripples.length > 6) this.ripples.shift();
    }

    animate() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      for (let r = this.ripples.length - 1; r >= 0; r--) {
        const rip = this.ripples[r];
        rip.radius += 2.6;
        rip.alpha *= 0.94;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = `rgba(255, 120, 80, ${rip.alpha})`;
        this.ctx.lineWidth = 1.2;
        this.ctx.stroke();
        this.ctx.restore();

        if (rip.alpha < 0.015 || rip.radius > rip.maxRadius) {
          this.ripples.splice(r, 1);
        }
      }

      const maxDistance = 125;

      for (let i = 0; i < this.particles.length; i++) {
        const p1 = this.particles[i];

        p1.x += p1.vx;
        p1.y += p1.vy;
        p1.pulseVal += p1.pulseSpeed;

        if (p1.x < 0) p1.x = this.width;
        else if (p1.x > this.width) p1.x = 0;
        if (p1.y < 0) p1.y = this.height;
        else if (p1.y > this.height) p1.y = 0;

        if (this.mouse.active) {
          const dx = p1.x - this.mouse.x;
          const dy = p1.y - this.mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < this.mouse.radius) {
            const angle = Math.atan2(dy, dx);
            const force = (this.mouse.radius - dist) / this.mouse.radius;
            p1.x += Math.cos(angle) * force * 1.5;
            p1.y += Math.sin(angle) * force * 1.5;

            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(this.mouse.x, this.mouse.y);
            this.ctx.strokeStyle = `rgba(255, 120, 70, ${force * 0.22})`;
            this.ctx.lineWidth = 0.8;
            this.ctx.stroke();
          }
        }

        for (let j = i + 1; j < this.particles.length; j++) {
          const p2 = this.particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

          if (dist < maxDistance) {
            const linkAlpha = (1 - dist / maxDistance) * 0.12;
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.strokeStyle = `rgba(240, 200, 160, ${linkAlpha})`;
            this.ctx.lineWidth = 0.6;
            this.ctx.stroke();
          }
        }

        const dynamicRadius = p1.radius + Math.sin(p1.pulseVal) * 0.4;
        this.ctx.beginPath();
        this.ctx.arc(p1.x, p1.y, Math.max(dynamicRadius, 0.4), 0, Math.PI * 2);
        this.ctx.fillStyle = p1.baseColor;
        this.ctx.globalAlpha = p1.alpha;
        this.ctx.fill();
        this.ctx.globalAlpha = 1.0;
      }

      requestAnimationFrame(() => this.animate());
    }
  }

  function initCountdownHUD() {
    const elDays = document.getElementById('count-days');
    const elHours = document.getElementById('count-hours');
    const elMins = document.getElementById('count-mins');
    const elSecs = document.getElementById('count-secs');
    const elMs = document.getElementById('count-ms');

    if (!elDays || !elHours || !elMins || !elSecs || !elMs) return;

    let targetDate = new Date('2026-12-16T09:00:00+05:30').getTime();

    if (targetDate - Date.now() <= 0) {
      const currentYear = new Date().getFullYear();
      targetDate = new Date(`${currentYear + 1}-12-16T09:00:00+05:30`).getTime();
      if (targetDate - Date.now() <= 0) {
        targetDate = Date.now() + (20 * 24 * 60 * 60 * 1000) + (12 * 60 * 60 * 1000) + (59 * 60 * 1000);
      }
    }

    function update() {
      const currentTime = Date.now();
      let diff = targetDate - currentTime;

      if (diff <= 0) {
        diff = 0;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      const ms = Math.floor((diff % 1000) / 10);

      elDays.textContent = String(days).padStart(2, '0');
      elHours.textContent = String(hours).padStart(2, '0');
      elMins.textContent = String(mins).padStart(2, '0');
      elSecs.textContent = String(secs).padStart(2, '0');
      elMs.textContent = String(ms).padStart(2, '0');

      requestAnimationFrame(update);
    }

    update();
  }

  function initArenaFilters() {
    const filterGroup = document.getElementById('arena-filter-group');
    const cards = document.querySelectorAll('.arena-card');
    if (!filterGroup || !cards.length) return;

    filterGroup.addEventListener('click', (e) => {
      const pill = e.target.closest('.filter-pill');
      if (!pill) return;

      sound.playTick();
      filterGroup.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.getAttribute('data-filter');

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  }

  function initPassStudio() {
    const nameInput = document.getElementById('pass-name-input');
    const collegeInput = document.getElementById('pass-college-input');
    const domainSelect = document.getElementById('pass-domain-select');
    const colorPicker = document.getElementById('pass-color-picker');
    const badgeCard = document.getElementById('holographic-badge');

    const badgeName = document.getElementById('badge-name-display');
    const badgeOrg = document.getElementById('badge-org-display');
    const badgeTrack = document.getElementById('badge-track-display');
    const badgeSerial = document.getElementById('badge-serial-display');

    const randomizeBtn = document.getElementById('randomize-pass-btn');
    const downloadBtn = document.getElementById('download-pass-btn');

    if (!nameInput || !badgeCard) return;

    function generateSerial() {
      const rand1 = Math.floor(1000 + Math.random() * 9000);
      const rand2 = Math.floor(10 + Math.random() * 89);
      const suffix = ['X', 'Z', 'K', 'Q'][Math.floor(Math.random() * 4)];
      return `TF30-BOMBAY-${rand1}-${rand2}${suffix}`;
    }

    nameInput.addEventListener('input', (e) => {
      badgeName.textContent = e.target.value.trim() || 'Alex Rivera';
    });

    collegeInput.addEventListener('input', (e) => {
      badgeOrg.textContent = e.target.value.trim() || 'Indian Institute of Technology';
    });

    domainSelect.addEventListener('change', (e) => {
      badgeTrack.textContent = e.target.value;
      sound.playTick();
    });

    if (colorPicker) {
      colorPicker.addEventListener('click', (e) => {
        const swatch = e.target.closest('.color-swatch');
        if (!swatch) return;
        sound.playTick();
        colorPicker.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');

        const colorTheme = swatch.getAttribute('data-color');
        badgeCard.setAttribute('data-theme', colorTheme);
      });
    }

    if (randomizeBtn) {
      randomizeBtn.addEventListener('click', () => {
        sound.playTap();
        const firstNames = ['Arjun', 'Elena', 'Kavya', 'Marcus', 'Dev', 'Zane', 'Priya', 'Rohan', 'Aria'];
        const lastNames = ['Sharma', 'Vance', 'Iyer', 'Chen', 'Patel', 'Kowalski', 'Mehta', 'Nakamura'];
        const colleges = ['IIT Bombay', 'IIT Delhi', 'BITS Pilani', 'MIT Pune', 'IIT Madras', 'NIT Trichy', 'Stanford University', 'NUS Singapore'];
        
        const randomName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        const randomCollege = colleges[Math.floor(Math.random() * colleges.length)];
        
        nameInput.value = randomName;
        collegeInput.value = randomCollege;
        badgeName.textContent = randomName;
        badgeOrg.textContent = randomCollege;
        badgeSerial.textContent = generateSerial();
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        sound.playChord([440, 554.37, 659.25, 880]);

        const offCanvas = document.createElement('canvas');
        offCanvas.width = 1200;
        offCanvas.height = 760;
        const ctx = offCanvas.getContext('2d');

        const bgGrad = ctx.createLinearGradient(0, 0, 1200, 760);
        bgGrad.addColorStop(0, '#1a2035');
        bgGrad.addColorStop(1, '#0e1220');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1200, 760);

        ctx.fillStyle = '#FF5E3A';
        ctx.fillRect(40, 40, 1120, 8);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.strokeRect(40, 40, 1120, 680);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 38px "Space Grotesk", sans-serif';
        ctx.fillText('⚡ TECHFEST 30TH EDITION', 80, 115);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '20px "Inter", sans-serif';
        ctx.fillText('UNION BANK OF INDIA PRESENTS • AN AETHERIAL RENAISSANCE', 80, 150);

        ctx.fillStyle = 'rgba(255, 94, 58, 0.15)';
        ctx.fillRect(80, 205, 250, 40);
        ctx.strokeStyle = 'rgba(255, 94, 58, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(80, 205, 250, 40);
        ctx.fillStyle = '#FF7A59';
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.fillText('OFFICIAL DELEGATE PASS', 95, 231);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 56px "Syne", sans-serif';
        ctx.fillText(badgeName.textContent, 80, 315);

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '28px "Inter", sans-serif';
        ctx.fillText(badgeOrg.textContent, 80, 365);

        ctx.fillStyle = 'rgba(11, 14, 23, 0.7)';
        ctx.fillRect(80, 420, 1040, 110);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.strokeRect(80, 420, 1040, 110);

        ctx.fillStyle = '#64748B';
        ctx.font = '16px "JetBrains Mono", monospace';
        ctx.fillText('TRACK FOCUS', 110, 460);
        ctx.fillText('VALID DATES', 460, 460);
        ctx.fillText('CAMPUS ZONES', 780, 460);

        ctx.fillStyle = '#FF7A59';
        ctx.font = 'bold 22px "JetBrains Mono", monospace';
        ctx.fillText(badgeTrack.textContent, 110, 495);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('DEC 16 – 18, 2026', 460, 495);

        ctx.fillStyle = '#10B981';
        ctx.fillText('MAIN / SAC / GYMKHANA', 780, 495);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 22px "JetBrains Mono", monospace';
        ctx.fillText(badgeSerial.textContent, 80, 610);

        ctx.fillStyle = '#64748B';
        ctx.font = '16px "Inter", sans-serif';
        ctx.fillText('Verified Delegate Credential • Powai Campus Gateways • IIT Bombay', 80, 642);

        const link = document.createElement('a');
        link.download = `Techfest30-Delegate-Pass-${badgeName.textContent.replace(/\s+/g, '_')}.png`;
        link.href = offCanvas.toDataURL('image/png');
        link.click();
      });
    }
  }

  function initScheduleTabs() {
    const tabsContainer = document.getElementById('schedule-tabs');
    if (!tabsContainer) return;

    tabsContainer.addEventListener('click', (e) => {
      const tab = e.target.closest('.sched-tab');
      if (!tab) return;

      sound.playTick();
      tabsContainer.querySelectorAll('.sched-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetDay = tab.getAttribute('data-day');
      document.querySelectorAll('.day-timeline').forEach(tl => {
        if (tl.id === `timeline-${targetDay}`) {
          tl.classList.add('active');
        } else {
          tl.classList.remove('active');
        }
      });
    });
  }

  const arenaDossiers = {
    robowars: {
      code: 'ARENA_01_ROBOWARS',
      title: 'International Robowars: 30th Edition Combat Championship',
      badge: 'COMBAT ROBOTICS',
      prize: '₹12,00,000+ Prize Pool',
      location: 'Gymkhana Arena Grounds (Fortified Enclosure)',
      details: [
        'Flagship Categories: 60kg Heavyweight Class and 15kg Featherweight Class.',
        'Arena Specs: 30ft x 30ft reinforced steel combat deck with 8mm dual-layer polycarbonate shielding.',
        'Permitted Weaponry: Pneumatic lifters/flippers, high-speed kinetic spinning drums, horizontal flywheels, and hydraulic crushers.',
        'Safety Mandates: Fail-safe radio cutoffs, weapon lock pins, and master power isolators required.',
        'Delegations: Over 40 elite teams from India, Brazil, Iran, USA, and Indonesia clashing for the championship.'
      ]
    },
    ai: {
      code: 'ARENA_02_AI_ESCAP',
      title: 'AI for Technology Readiness (UN ESCAP & APCTT)',
      badge: 'UN ESCAP PARTNERED',
      prize: '₹8,00,000+ Prize Pool',
      location: 'IIT Bombay Computer Center & Global Sandbox',
      details: [
        'Co-organized with UN ESCAP and Asian and Pacific Centre for Transfer of Technology (APCTT).',
        'Focus on architecting robust machine learning and generative pipelines ready for industrial, governance, and humanitarian deployment.',
        'Evaluation benchmarks: real-world fault tolerance, zero-shot generalization, and latency efficiency.',
        'Top finalists receive UN agency commendations and direct venture pilot opportunities.'
      ]
    },
    workshops: {
      code: 'ARENA_03_MASTERCLASSES',
      title: 'Certified Hands-on Technical Masterclasses & Labs',
      badge: 'IIT BOMBAY CERTIFICATION',
      prize: 'Official Certificate & Hardware Take-Home Kits',
      location: 'Lecture Hall Complex & Systems Engineering Labs',
      details: [
        'Quantum Computing Lab: Hands-on quantum circuits and algorithms with IBM Qiskit and cloud QPU access.',
        'Ethical Hacking & Zero-Trust Defense: Penetration testing, binary reverse engineering, and exploit mitigation.',
        'Embedded Robotics & Drone Dynamics: Autopilot tuning, PID controllers, and STM32 microcontroller programming.',
        'Every participant receives an official IIT Bombay Techfest Certificate of Completion.'
      ]
    },
    keynotes: {
      code: 'ARENA_04_UNION_BANK_SUMMIT',
      title: 'The International Summit: An Aetherial Renaissance',
      badge: 'UNION BANK OF INDIA PRESENTER',
      prize: 'Open to All Festival Pass Holders',
      location: 'IIT Bombay Convocation Hall (Main Stage)',
      details: [
        'Presented by Union Bank of India as the centerpiece leadership and science summit.',
        'Direct keynote dialogues with Nobel Prize laureates in Physics, Chemistry, and Economics.',
        'Gaganyaan Spaceflight Symposium with ISRO Mission Directors and Astronaut Designates.',
        'Open microphone sessions with tech founders, open-source pioneers, and research visionaries.'
      ]
    },
    exhibitions: {
      code: 'ARENA_05_UNITREE_HUMANOID',
      title: 'Unitree G1 Humanoid Robot & Advanced Robotics Expo',
      badge: 'UNITREE ROBOTICS',
      prize: 'Live Interactive Public Demonstrations',
      location: 'Indoor Sports Complex & Tech Pavilion',
      details: [
        'Live demonstrations of the Unitree G1 humanoid robot: world-leading agile bipedal movements, dynamic jumps, and AI balance.',
        'Brain-Computer Interface (BCI) Demos: Controlling prosthetic arms and applications using EEG brain signals.',
        'Tactical Quadruped Robotic K9s: Real-time terrain navigation and 3D LiDAR mapping.',
        'Space Pavilions: High-precision engineering models of next-generation launch vehicles and planetary exploration rovers.'
      ]
    },
    technoholix: {
      code: 'ARENA_06_TECHNOHOLIX',
      title: 'Technoholix: Science Meets Electro-Visual Symphony',
      badge: 'NIGHT CONCERTS & SPECTACLES',
      prize: 'Free Entry with Techfest Delegate Pass',
      location: 'Gymkhana Main Ground Open-Air Arena',
      details: [
        'Massive 50,000-Watt Line-Array Concert Audio System.',
        'Top international EDM headliners and electronic artists.',
        'Synchronized 500-drone aerial light choreography illuminating the night sky over Powai Lake.',
        '3D architectural laser projection mapping celebrating the An Aetherial Renaissance theme.'
      ]
    },
    ozone: {
      code: 'ARENA_07_OZONE',
      title: 'Ozone: High-Octane Gaming & Thrill Arena',
      badge: 'GAMING & ADRENALINE',
      prize: 'Daily Championship Merchandise & Rewards',
      location: 'Student Activity Centre (SAC) Lawns & Arenas',
      details: [
        'Formula 1 Full-Motion Telemetry Rigs with hydraulic haptic feedback.',
        'International Drone Soccer: Caged quadcopters battling in mid-air arenas at 80 km/h.',
        'Tactical Laser Tag: Urban maze with infrared vests and real-time digital scoring.',
        'Virtual Reality Combat Zones with full-body tracking pods.'
      ]
    }
  };

  function initModalViewer() {
    const modalBackdrop = document.getElementById('cyber-modal');
    const modalBody = document.getElementById('modal-body-content');
    const modalCode = document.getElementById('modal-code');
    const closeBtn = document.getElementById('modal-close');
    const dismissBtn = document.getElementById('modal-dismiss-btn');

    if (!modalBackdrop || !modalBody) return;

    function openModal(specKey) {
      const data = arenaDossiers[specKey] || arenaDossiers.robowars;
      sound.playTap();

      modalCode.textContent = data.code;
      modalBody.innerHTML = `
        <div style="margin-bottom: 1.25rem;">
          <span style="font-family: var(--font-mono); font-size: 0.72rem; background: rgba(255, 94, 58, 0.15); color: #FF7A59; padding: 0.25rem 0.65rem; border-radius: 4px; font-weight: 700;">${data.badge}</span>
          <h3 style="font-family: var(--font-heading); font-size: 1.5rem; color: #FFFFFF; margin: 0.75rem 0 0.35rem;">${data.title}</h3>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap; font-family: var(--font-mono); font-size: 0.8rem; color: #F59E0B; margin-bottom: 1.1rem;">
            <span>🏆 ${data.prize}</span>
            <span style="color: #94A3B8;">📍 ${data.location}</span>
          </div>
        </div>
        <div style="background: rgba(11, 14, 23, 0.75); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 1.35rem;">
          <h4 style="font-family: var(--font-display); font-size: 0.85rem; color: #FFFFFF; margin-bottom: 0.85rem; font-weight: 700;">HIGHLIGHTS & SPECIFICATIONS</h4>
          <ul style="padding-left: 1.2rem; color: #CBD5E1; font-size: 0.92rem; line-height: 1.7;">
            ${data.details.map(item => `<li style="margin-bottom: 0.55rem;">${item}</li>`).join('')}
          </ul>
        </div>
      `;

      modalBackdrop.classList.add('active');
      modalBackdrop.setAttribute('aria-hidden', 'false');
    }

    function closeModal() {
      sound.playTick();
      modalBackdrop.classList.remove('active');
      modalBackdrop.setAttribute('aria-hidden', 'true');
    }

    document.querySelectorAll('.arena-modal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const specKey = e.currentTarget.getAttribute('data-modal') || 'robowars';
        openModal(specKey);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (dismissBtn) dismissBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) {
        closeModal();
      }
    });
  }

  function initCommandPalette() {
    const palette = document.getElementById('cmd-palette');
    const triggerBtn = document.getElementById('cmd-palette-btn');
    const footerTrigger = document.getElementById('footer-cmd-btn');
    const input = document.getElementById('cmd-input');
    const resultsContainer = document.getElementById('cmd-results-list');

    if (!palette || !input) return;

    const commands = [
      { id: 'pass', title: 'Get Free Delegate Pass & Ticket Generator', icon: '🎫', shortcut: '#pass-studio', action: () => scrollTo('#pass-studio') },
      { id: 'robowars', title: 'Robowars Combat Arena & Rules', icon: '⚔️', shortcut: 'DETAILS', action: () => triggerModal('robowars') },
      { id: 'ai', title: 'AI for Technology Readiness (UN ESCAP)', icon: '🧠', shortcut: 'DETAILS', action: () => triggerModal('ai') },
      { id: 'exhibitions', title: 'Unitree G1 Humanoid Robot Demonstration', icon: '🤖', shortcut: 'DETAILS', action: () => triggerModal('exhibitions') },
      { id: 'keynotes', title: 'Union Bank of India International Summit', icon: '🏛️', shortcut: 'DETAILS', action: () => triggerModal('keynotes') },
      { id: 'schedule', title: 'View 3-Day Hourly Festival Schedule (Dec 16-18)', icon: '📅', shortcut: '#schedule', action: () => scrollTo('#schedule') },
      { id: 'arenas', title: 'Explore The 7 Festival Arenas', icon: '⚡', shortcut: '#arenas', action: () => scrollTo('#arenas') },
      { id: 'sound', title: 'Toggle Ambient Audio Effects', icon: '🔊', shortcut: 'TOGGLE', action: () => toggleSoundUI() },
      { id: 'ca', title: 'Campus Ambassador (CA) Programme', icon: '🌐', shortcut: '#ca-portal', action: () => scrollTo('#ca-portal') },
      { id: 'about', title: 'An Aetherial Renaissance (30th Edition Theme)', icon: '🌿', shortcut: '#about', action: () => scrollTo('#about') }
    ];

    function renderResults(query = '') {
      const q = query.toLowerCase().trim();
      const filtered = commands.filter(c => c.title.toLowerCase().includes(q) || c.id.includes(q));

      if (filtered.length === 0) {
        resultsContainer.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">No matching sections found.</div>`;
        return;
      }

      resultsContainer.innerHTML = filtered.map((c, idx) => `
        <div class="cmd-item ${idx === 0 ? 'selected' : ''}" data-cmd="${c.id}">
          <div class="cmd-item-left">
            <span class="cmd-item-icon">${c.icon}</span>
            <span class="cmd-item-title">${c.title}</span>
          </div>
          <span class="cmd-item-shortcut">${c.shortcut}</span>
        </div>
      `).join('');
    }

    function openPalette() {
      sound.playTap();
      palette.classList.add('active');
      palette.setAttribute('aria-hidden', 'false');
      input.value = '';
      renderResults();
      setTimeout(() => input.focus(), 60);
    }

    function closePalette() {
      palette.classList.remove('active');
      palette.setAttribute('aria-hidden', 'true');
    }

    function executeCommand(cmdId) {
      const match = commands.find(c => c.id === cmdId);
      closePalette();
      if (match) match.action();
    }

    function scrollTo(hash) {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }

    function triggerModal(key) {
      const btn = document.querySelector(`.arena-modal-btn[data-modal="${key}"]`);
      if (btn) btn.click();
    }

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (palette.classList.contains('active')) {
          closePalette();
        } else {
          openPalette();
        }
      } else if (e.key === 'Escape' && palette.classList.contains('active')) {
        closePalette();
      }
    });

    if (triggerBtn) triggerBtn.addEventListener('click', openPalette);
    if (footerTrigger) footerTrigger.addEventListener('click', openPalette);

    input.addEventListener('input', (e) => renderResults(e.target.value));

    input.addEventListener('keydown', (e) => {
      const items = resultsContainer.querySelectorAll('.cmd-item');
      let currentIdx = Array.from(items).findIndex(it => it.classList.contains('selected'));

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (items.length) {
          items[currentIdx].classList.remove('selected');
          const nextIdx = (currentIdx + 1) % items.length;
          items[nextIdx].classList.add('selected');
          items[nextIdx].scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (items.length) {
          items[currentIdx].classList.remove('selected');
          const prevIdx = (currentIdx - 1 + items.length) % items.length;
          items[prevIdx].classList.add('selected');
          items[prevIdx].scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = resultsContainer.querySelector('.cmd-item.selected');
        if (selected) {
          executeCommand(selected.getAttribute('data-cmd'));
        }
      }
    });

    resultsContainer.addEventListener('click', (e) => {
      const item = e.target.closest('.cmd-item');
      if (item) {
        executeCommand(item.getAttribute('data-cmd'));
      }
    });

    palette.addEventListener('click', (e) => {
      if (e.target === palette) closePalette();
    });
  }

  function toggleSoundUI() {
    const isEnabled = sound.toggle();
    const btn = document.getElementById('audio-toggle-btn');
    const icon = document.getElementById('audio-icon');
    const label = document.getElementById('audio-label');

    if (icon && label) {
      if (isEnabled) {
        icon.textContent = '🔊';
        label.textContent = 'SOUND: ON';
      } else {
        icon.textContent = '🔇';
        label.textContent = 'SOUND: OFF';
      }
    }
  }

  function initAudioToggle() {
    const btn = document.getElementById('audio-toggle-btn');
    if (btn) {
      btn.addEventListener('click', toggleSoundUI);
    }

    document.querySelectorAll('.btn, .nav-item, .filter-pill, .sched-tab').forEach(el => {
      el.addEventListener('mouseenter', () => sound.playTick());
      el.addEventListener('click', () => sound.playTap());
    });
  }

  function initMobileDrawer() {
    const toggle = document.getElementById('mobile-menu-btn');
    const drawer = document.getElementById('mobile-drawer');
    const closeBtn = document.getElementById('drawer-close-btn');

    if (!toggle || !drawer) return;

    toggle.addEventListener('click', () => {
      sound.playTap();
      drawer.classList.add('open');
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        sound.playTick();
        drawer.classList.remove('open');
      });
    }

    drawer.querySelectorAll('.drawer-link, .btn').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
      });
    });
  }

  function initQuickTour() {
    const tourBtn = document.getElementById('quick-tour-btn');
    if (!tourBtn) return;

    tourBtn.addEventListener('click', () => {
      sound.playChord([440, 554.37, 659.25]);
      const aboutSec = document.getElementById('about');
      if (aboutSec) aboutSec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    new OrganicStardustCanvas('cyber-canvas');
    initCountdownHUD();
    initArenaFilters();
    initPassStudio();
    initScheduleTabs();
    initModalViewer();
    initCommandPalette();
    initAudioToggle();
    initMobileDrawer();
    initQuickTour();
  });
})();
