
const $ = s => document.querySelector(s);

const show = id => {
    document.querySelectorAll('.screen').forEach(e => e.classList.remove('active'));
    $(id).classList.add('active');
};

/* ---------- confetti (canvas) ---------- */

const cv = $('#confetti');
const cx = cv.getContext('2d');

let parts = [];
let running = false;

const fit = () => {
    cv.width = innerWidth;
    cv.height = innerHeight;
};

fit();
addEventListener('resize', fit);

function burst(x, y, n = 110) {
    const cols = ['#e8728d', '#f5b94a', '#d6284a', '#ffffff', '#f7c6d0'];

    for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 3 + Math.random() * 9;

        parts.push({
            x, y,
            vx: Math.cos(a) * v,
            vy: Math.sin(a) * v - 6,
            r: 3 + Math.random() * 4,
            c: cols[i % 5],
            rot: Math.random() * 6,
            vr: (Math.random() - .5) * .3,
            life: 120 + Math.random() * 70,
            h: Math.random() < .4
        });
    }

    if (!running) {
        running = true;
        tick();
    }
}

function tick() {
    cx.clearRect(0, 0, cv.width, cv.height);

    parts = parts.filter(p => p.life-- > 0);

    parts.forEach(p => {
        p.vy += .2;
        p.vx *= .99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        cx.save();
        cx.translate(p.x, p.y);
        cx.rotate(p.rot);
        cx.globalAlpha = Math.min(1, p.life / 40);
        cx.fillStyle = p.c;

        if (p.h) {
            cx.font = p.r * 4 + 'px serif';
            cx.fillText('♥', 0, 0);
        } else {
            cx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        }

        cx.restore();
    });

    if (parts.length) {
        requestAnimationFrame(tick);
    } else {
        running = false;
    }
}

/* ---------- music ---------- */

let muted = false;
let ac, master, synthOn = false;

const bgm = new Audio('videoplayback (mp3cut.net).mp3');
bgm.loop = true;
bgm.volume = .7;

const btn = $('#mute');

function startMusic() {
    btn.hidden = false;

    bgm.play().catch(() => synth());
}

btn.onclick = () => {
    muted = !muted;
    bgm.muted = muted;

    if (master) {
        master.gain.value = muted ? 0 : .5;
    }

    btn.textContent = muted ? '🔇' : '🔊';
};

function synth() {
    if (synthOn) return;

    synthOn = true;

    ac = new (window.AudioContext || window.webkitAudioContext)();

    master = ac.createGain();
    master.gain.value = muted ? 0 : .5;
    master.connect(ac.destination);

    const F = {
        G4: 392,
        A4: 440,
        B4: 493.88,
        C5: 523.25,
        D5: 587.33,
        E5: 659.25,
        F5: 698.46,
        G5: 783.99
    };

    const beat = .62;

    const mel = [
        ['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
        ['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
        ['G4', .75], ['G4', .25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 1],
        ['F5', .75], ['F5', .25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 2]
    ];

    const note = (f, t, len) => {
        const o = ac.createOscillator();
        const o2 = ac.createOscillator();
        const g = ac.createGain();
        const g2 = ac.createGain();

        const end = t + Math.max(len, .9) + .6;

        o.frequency.value = f;
        o2.type = 'triangle';
        o2.frequency.value = f * 2;

        g2.gain.value = .22;

        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(.32, t + .012);
        g.gain.exponentialRampToValueAtTime(.001, end);

        o.connect(g);
        o2.connect(g2);
        g2.connect(g);
        g.connect(master);

        o.start(t);
        o2.start(t);
        o.stop(end + .1);
        o2.stop(end + .1);
    };

    const loop = () => {
        let t = ac.currentTime + .1;

        mel.forEach(([n, d]) => {
            note(F[n], t, d * beat);
            t += d * beat;
        });

        setTimeout(loop, (t - ac.currentTime + 1.5) * 1000);
    };

    loop();
}

/* ---------- 1. intro: sparkles + heart button ---------- */

for (let i = 0; i < 30; i++) {
    const s = document.createElement('i');

    s.className = 'sp';

    s.style.cssText = `
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        --d:${4 + Math.random() * 6}s;
        --z:${2 + Math.random() * 4}px;
        animation-delay:${-Math.random() * 8}s
    `;

    $('#intro').appendChild(s);
}

const heart = $('#heart');
let done = false;

// Prevent decorative layers from blocking clicks
$('#halo').style.pointerEvents = 'none';
$('#ring').style.pointerEvents = 'none';

heart.style.cursor = 'pointer';
heart.style.pointerEvents = 'auto';
heart.style.position = 'relative';
heart.style.zIndex = '100';

function go() {
    if (done) return;

    done = true;

    startMusic();

    const r = heart.getBoundingClientRect();

    burst(
        r.left + r.width / 2,
        r.top + r.height / 2,
        70
    );

    heart.style.transform = 'scale(40)';
    heart.style.opacity = '0';

    setTimeout(() => {
        show('#wish');

        setTimeout(() => {
            burst(innerWidth * .62, innerHeight * .45, 140);

            setTimeout(() => {
                $('#flash').classList.add('go');

                setTimeout(bloom, 600);
            }, 1800);

        }, 2200);

    }, 600);
}

// Normal mouse click and touchscreen tap
heart.addEventListener('click', go);

// Keyboard support
heart.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
    }
});

/* ---------- 2. split Happy Birthday into letters ---------- */

(() => {
    let i = 0;

    $('#hb').innerHTML = ['Happy', 'Birthday']
        .map(w =>
            [...w].map(ch =>
                `<span style="--i:${i++}">${ch}</span>`
            ).join('')
        ).join('<br>');
})();

/* ---------- 3. tree grows branch by branch ---------- */

function buildTree() {
    const svg = $('#trunk');
    const NS = 'http://www.w3.org/2000/svg';

    svg.innerHTML = '';

    (function br(x, y, a, l, d) {
        if (d < 0) return;

        const x2 = x + Math.cos(a) * l;
        const y2 = y + Math.sin(a) * l;

        const p = document.createElementNS(NS, 'path');

        p.setAttribute(
            'd',
            `M${x} ${y} Q${(x + x2) / 2 + (Math.random() - .5) * l * .3} ${(y + y2) / 2 + (Math.random() - .5) * l * .1} ${x2} ${y2}`
        );

        p.setAttribute('stroke-width', (1 + d * 2.2).toFixed(1));

        svg.appendChild(p);

        const L = p.getTotalLength();

        p.style.strokeDasharray = L;
        p.style.strokeDashoffset = L;

        p.style.transition = `stroke-dashoffset ${.6 + d * .15}s ease-out ${(5 - d) * .45}s`;

        requestAnimationFrame(() =>
            requestAnimationFrame(() => {
                p.style.strokeDashoffset = 0;
            })
        );

        const n = d > 1 ? 2 : (Math.random() < .6 ? 2 : 1);

        for (let i = 0; i < n; i++) {
            br(
                x2,
                y2,
                a + (n > 1 ? (i ? 1 : -1) : (Math.random() - .5) * 2) * (.2 + Math.random() * .2),
                l * (.72 + Math.random() * .08),
                d - 1
            );
        }

    })(150, 400, -Math.PI / 2, 112, 5);
}

function bloom() {
    show('#main');

    $('#main').classList.add('active');

    buildTree();

    const c = $('#canopy');

    const cols = [
        '#e8728d',
        '#f09ab0',
        '#f5b94a',
        '#d6284a',
        '#f7c6d0',
        '#ff8fa8'
    ];

    for (let i = 0; i < 500; i++) {
        const t = Math.random() * Math.PI * 2;
        const r = Math.pow(Math.random(), .6);

        const x = 16 * Math.sin(t) ** 3;

        const y =
            13 * Math.cos(t) -
            5 * Math.cos(2 * t) -
            2 * Math.cos(3 * t) -
            Math.cos(4 * t);

        const s = document.createElement('span');

        s.textContent = '♥';

        s.style.cssText = `
            left:${50 + x * r * 2.7}%;
            top:${42 - y * r * 2.8}%;
            --s:${18 + Math.random() * 12}px;
            --c:${cols[i % 6]};
            --d:${Math.random() * 2.5}s;
            rotate:${Math.random() * 24 - 12}deg
        `;

        c.appendChild(s);
    }

    setTimeout(() => {
        c.classList.add('bloom');

        const r = c.getBoundingClientRect();

        burst(
            r.left + r.width / 2,
            r.top + r.height / 2,
            120
        );

    }, 3200);

    setInterval(() => {
        const f = document.createElement('span');

        f.className = 'falling';
        f.textContent = Math.random() < .7 ? '♥' : '✿';

        f.style.cssText = `
            left:${Math.random() * 100}vw;
            color:${Math.random() < .5 ? '#f09ab0' : '#f5b94a'};
            font-size:${8 + Math.random() * 10}px;
            animation-duration:${6 + Math.random() * 5}s
        `;

        document.body.appendChild(f);

        setTimeout(() => f.remove(), 11000);

    }, 600);
}

/* ---------- 4. website content and photos ---------- */

const DEF = {
    name: 'Your Name',

    title: 'Selamat Ulang Tahun Sayang',

    message: [
        'Happy birthday to the most special person in my life.',
        'May this year bring you more joy, more peace,',
        'and every little thing your heart has been wishing for.',
        'Never forget how loved you are, today and always.',
        "I'm so proud of you, and I'm always on your side."
    ],

    photos: [
        '01.jpg',
        '02.jpg',
        '03.jpg',
        '04.jpg',
        '05.jpg',
        '06.jpg',
        '07.jpg',
        '08.jpg',
        '09.jpg'
    ]
};

const photoURL = file =>
    '/photos/' + file.split('/').map(encodeURIComponent).join('/');

fetch('/config.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Config not found');
        }

        return response.json();
    })
    .catch(error => {
        console.error('Using default configuration:', error);
        return DEF;
    })
    .then(c => {

        $('#title').textContent = c.title || DEF.title;

        $('#sign').textContent = '- ' + (c.name || DEF.name) + ' -';

        const messages = Array.isArray(c.message)
            ? c.message
            : DEF.message;

        $('#lines').innerHTML = messages
            .map(line => `<p>${line}</p>`)
            .join('');

        const photos = Array.isArray(c.photos) && c.photos.length
            ? c.photos
            : DEF.photos;

        $('#grid').innerHTML = Array.from(
            { length: 9 },
            (_, i) => {

                const file = photos[i] || DEF.photos[i];

                const url = photoURL(file);

                return `
                    <div class="ph"
                         data-f="${file}"
                         style="
                            --r:${(Math.random() * 8 - 4).toFixed(1)}deg;
                            --t:${i * .08}s
                         ">

                        <b style="
                            background-image:
                            url('${url}'),
                            linear-gradient(135deg,#f0b6c4,#f5d7a3);
                        "></b>

                    </div>
                `;
            }
        ).join('');

        const once = (el, fn, th) =>
            new IntersectionObserver((es, o) => {
                es.forEach(e => {
                    if (e.isIntersecting) {
                        fn(e.target);
                        o.disconnect();
                    }
                });
            }, { threshold: th }).observe(el);

        once($('#grid'), g => {
            [...g.children].forEach(p => {
                p.classList.add('in');
            });
        }, .2);

        once($('#lines'), l => {
            [...l.children].forEach((p, i) => {
                setTimeout(() => p.classList.add('show'), i * 600);
            });
        }, .5);

        // Photo click and enlargement
        $('#grid').onclick = e => {

            const p = e.target.closest('.ph');

            if (!p || !p.dataset.f) return;

            const img = document.createElement('img');

            img.src = photoURL(p.dataset.f);
            img.alt = 'Birthday memory';

            $('#lightbox').replaceChildren(img);

            $('#lightbox').hidden = false;
        };

    });

/* ---------- 5. lightbox ---------- */

$('#lightbox').onclick = () => {
    $('#lightbox').hidden = true;
};

/* ---------- 6. gift ---------- */

$('#giftBtn').onclick = () => {
    $('#modal').hidden = false;

    burst(innerWidth / 2, innerHeight / 2, 160);
};

$('#close').onclick = () => {
    $('#modal').hidden = true;
};

/* ---------- 7. greeting fade ---------- */

addEventListener('scroll', () => {
    $('.hello').style.opacity = Math.max(
        0,
        1 - scrollY / (innerHeight * .55)
    );
}, { passive: true });
