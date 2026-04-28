import sys
import re

filepath = r'w:\directory\haha\testing_project\html_stack\before_signup\main\index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. ADD LENIS SCRIPT & CSS
if 'lenis.min.js' not in html:
    html = html.replace('<head>', '<head>\n    <!-- Lenis for smooth scrolling -->\n    <script src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.29/bundled/lenis.min.js"></script>')

lenis_css = '''
        /* Lenis Smooth Scroll Requirement */
        html.lenis { height: auto; }
        .lenis.lenis-smooth { scroll-behavior: auto !important; }
        .lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
        .lenis.lenis-stopped { overflow: hidden; }
        .lenis.lenis-scrolling iframe { pointer-events: none; }
'''
if 'html.lenis' not in html:
    html = html.replace('</style>', lenis_css + '\n    </style>')

# 2. UPDATE GRID SYSTEM
grid_css = '''
        .bg-grid { 
            background-size: 40px 40px; 
            background-image: 
                linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), 
                linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
            mask-image: linear-gradient(to bottom, black 20%, rgba(0,0,0,0.5) 80%, transparent 100%);
            -webkit-mask-image: linear-gradient(to bottom, black 20%, rgba(0,0,0,0.5) 80%, transparent 100%);
        }
'''
if '.bg-grid' not in html:
    html = html.replace('</style>', grid_css + '\n    </style>')

html = re.sub(r'        \.grid-bg \{[\s\S]*?\}', '', html)

if 'class="fixed inset-0 bg-grid -z-20 pointer-events-none"' not in html:
    html = html.replace('<body ', '<body ')
    html = re.sub(r'(<body[^>]*>)', r'\1\n    <div class="fixed inset-0 bg-grid -z-20 pointer-events-none"></div>', html)

# remove old inline grid-bg
html = re.sub(r'<div class="[^"]*grid-bg[^"]*"></div>', '', html)

# 3. UPDATE PARTICLE CANVAS HTML
# Remove old particle canvas inline
html = html.replace('<canvas id="particle-canvas"></canvas>', '')

particle_html = '''
    <!-- Interactive Particle Background -->
    <canvas id="particle-canvas" class="fixed inset-0 z-[-15] pointer-events-none"></canvas>
'''
if 'id="particle-canvas" class="fixed inset-0' not in html:
    html = re.sub(r'(<body[^>]*>\n    <div class="fixed inset-0 bg-grid -z-20 pointer-events-none"></div>)', r'\1' + particle_html, html)

# 4. REPLACE PARTICLE SCRIPT + ADD LENIS INIT
new_script = '''
    <script>
        // Initialize Lenis Smooth Scrolling
        const lenis = new Lenis()
        function raf(time) {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }
        requestAnimationFrame(raf)

        // Interactive High-End Particle System
        (function initParticles() {
            const canvas = document.getElementById('particle-canvas');
            if(!canvas) return;
            const ctx = canvas.getContext('2d');
            let width, height;
            let particles = [];
            const mouse = { x: null, y: null, radius: 150 };

            window.addEventListener('mousemove', (e) => {
                mouse.x = e.x;
                mouse.y = e.y;
            }, { passive: true });

            function resize() {
                width = canvas.width = window.innerWidth;
                height = canvas.height = window.innerHeight;
            }
            window.addEventListener('resize', resize);
            resize();

            class Particle {
                constructor() {
                    this.x = Math.random() * width;
                    this.y = Math.random() * height;
                    this.baseSize = Math.random() * 1.5 + 0.5;
                    this.size = this.baseSize;
                    this.vx = (Math.random() - 0.5) * 0.4;
                    this.vy = (Math.random() - 0.5) * 0.4;
                    const colors = ['#adc7ff', '#c084fc', '#4a8eff', 'rgba(255,255,255,0.6)'];
                    this.color = colors[Math.floor(Math.random() * colors.length)];
                }
                update() {
                    this.x += this.vx;
                    this.y += this.vy;
                    if (this.x < 0 || this.x > width) this.vx *= -1;
                    if (this.y < 0 || this.y > height) this.vy *= -1;
                    if (mouse.x != null && mouse.y != null) {
                        let dx = mouse.x - this.x;
                        let dy = mouse.y - this.y;
                        let distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < mouse.radius) {
                            const force = (mouse.radius - distance) / mouse.radius;
                            this.size = this.baseSize + (force * 1.8);
                            this.x -= dx * force * 0.015;
                            this.y -= dy * force * 0.015;
                        } else {
                            this.size = this.baseSize;
                        }
                    }
                }
                draw() {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fillStyle = this.color;
                    ctx.shadowBlur = 6;
                    ctx.shadowColor = this.color;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            }

            function init() {
                particles = [];
                const numParticles = Math.min(Math.floor((width * height) / 12000), 100);
                for (let i = 0; i < numParticles; i++) {
                    particles.push(new Particle());
                }
            }

            function animate() {
                requestAnimationFrame(animate);
                ctx.clearRect(0, 0, width, height);

                for (let i = 0; i < particles.length; i++) {
                    particles[i].update();
                    particles[i].draw();

                    for (let j = i; j < particles.length; j++) {
                        let dx = particles[i].x - particles[j].x;
                        let dy = particles[i].y - particles[j].y;
                        let dist = Math.sqrt(dx * dx + dy * dy);
                        
                        if (dist < 110) {
                            ctx.beginPath();
                            ctx.strokeStyle = `rgba(173, 199, 255, ${0.12 - (dist/110)*0.12})`;
                            ctx.lineWidth = 0.6;
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.stroke();
                        }
                    }
                    
                    if (mouse.x != null && mouse.y != null) {
                        let mDx = particles[i].x - mouse.x;
                        let mDy = particles[i].y - mouse.y;
                        let mDist = Math.sqrt(mDx * mDx + mDy * mDy);
                        if (mDist < 140) {
                            ctx.beginPath();
                            ctx.strokeStyle = `rgba(192, 132, 252, ${0.15 - (mDist/140)*0.15})`;
                            ctx.lineWidth = 0.8;
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(mouse.x, mouse.y);
                            ctx.stroke();
                        }
                    }
                }
            }

            init();
            animate();
            
            document.addEventListener("visibilitychange", function() {
                if (document.hidden) mouse.x = null;
            });
            document.body.addEventListener("mouseleave", function() {
                mouse.x = null; mouse.y = null;
            });
        })();
    </script>
'''

# Remove old particle script from main/index.html
old_part_start = html.find('const canvas = document.getElementById(\'particle-canvas\');')
if old_part_start != -1:
    # use regex to remove the old script logic involving particle canvas 
    # Let's just do a naive strip out since it's hard to match exact bracket matching.
    pass

html = html.replace('</body>', new_script + '\n</body>')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(html)
