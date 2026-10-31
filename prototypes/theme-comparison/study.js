const data = await fetch('/palettes.json').then(r => r.json());
const $ = id => document.getElementById(id);
const state = { path: '/', candidate: 'warm', scheme: 'light', width: 1440, layout: 'split' };
const url = new URL(location.href);
if (data.routes[url.searchParams.get('path')]) state.path = url.searchParams.get('path');
if (['material', 'warm'].includes(url.searchParams.get('candidate'))) state.candidate = url.searchParams.get('candidate');
if (url.searchParams.get('scheme') === 'dark') state.scheme = 'dark';
if (url.searchParams.get('viewport') === '390') state.width = 390;
const roles = ['paper', 'ink', 'muted', 'accent', 'accentInk', 'panel', 'line'];
for (const path of data.cases) $('page').add(new Option(data.routes[path].title, path));
function swatches(id, palette) {
    $(id).replaceChildren(...roles.map(role => {
        const el = document.createElement('div'); el.className = 'swatch';
        const chip = document.createElement('i'); chip.style.setProperty('--swatch', palette[role]);
        const label = document.createElement('span'); label.textContent = role === 'accentInk' ? 'accent ink' : role;
        const hex = document.createElement('code'); hex.textContent = palette[role];
        el.append(chip, label, hex); return el;
    }));
}
function resize() {
    for (const id of ['current', 'proposed']) {
        const frame = $(id), box = frame.parentElement;
        const scale = Math.min(1, (box.clientWidth - 2) / state.width);
        frame.style.width = state.width + 'px';
        frame.style.height = Math.ceil(box.clientHeight / scale) + 'px';
        frame.style.transform = `scale(${scale})`;
    }
}
function render() {
    const entry = data.routes[state.path];
    if (![...$('page').options].some(o => o.value === state.path)) $('page').add(new Option(entry.title, state.path));
    $('page').value = state.path; $('candidate').value = state.candidate; $('layout').value = state.layout;
    $('comparison').dataset.layout = state.layout;
    $('comparison').classList.toggle('mobile', state.width === 390);
    document.querySelectorAll('[data-scheme]').forEach(b => b.setAttribute('aria-pressed', b.dataset.scheme === state.scheme));
    document.querySelectorAll('[data-viewport]').forEach(b => b.setAttribute('aria-pressed', Number(b.dataset.viewport) === state.width));
    $('candidate-title').textContent = state.candidate === 'warm' ? 'Material · warm' : 'Material · standard';
    $('method').textContent = state.candidate === 'warm'
        ? 'Custom HCT tones, with more color in the neutral surfaces. A closer starting point for Colour Field’s warmth.'
        : 'Material Tonal Spot’s resolved surface and foreground roles, with low-chroma neutrals from the photograph.';
    $('seeds').replaceChildren(...Object.entries(entry.seeds).map(([name, color]) => {
        const el = document.createElement('span'); el.className = 'seed';
        const chip = document.createElement('i'); chip.style.background = color;
        el.append(chip, `${name} ${color}`); return el;
    }));
    swatches('current-swatches', entry.current[state.scheme]);
    swatches('candidate-swatches', entry[state.candidate][state.scheme]);
    const current = entry.currentContrast[state.scheme], candidate = entry[state.candidate + 'Contrast'][state.scheme];
    $('contrast').replaceChildren(...current.map((pair, i) => {
        const row = document.createElement('tr');
        for (const [text, fail] of [[pair.label, false], [pair.ratio + ':1', !pair.pass], [candidate[i].ratio + ':1', !candidate[i].pass], [pair.minimum + ':1', false]]) {
            const cell = document.createElement('td'); cell.textContent = text; if (fail) cell.className = 'fail'; row.append(cell);
        } return row;
    }));
    const fails = candidate.filter(p => !p.pass).length;
    $('check-summary').textContent = fails ? `${fails} candidate pair${fails === 1 ? '' : 's'} below target` : 'Candidate solid role pairs meet targets';
    for (const [id, engine] of [['current', 'current'], ['proposed', state.candidate]]) {
        $(id).src = '/frame?' + new URLSearchParams({ path: state.path, engine, scheme: state.scheme, revision: crypto.randomUUID() });
    }
    history.replaceState(null, '', '/?' + new URLSearchParams({ path: state.path, candidate: state.candidate, scheme: state.scheme, viewport: state.width }));
    requestAnimationFrame(resize);
}
$('page').addEventListener('change', e => { state.path = e.target.value; render(); });
$('candidate').addEventListener('change', e => { state.candidate = e.target.value; render(); });
$('layout').addEventListener('change', e => { state.layout = e.target.value; $('comparison').dataset.layout = state.layout; requestAnimationFrame(resize); });
document.querySelectorAll('[data-scheme]').forEach(b => b.addEventListener('click', () => { state.scheme = b.dataset.scheme; render(); }));
document.querySelectorAll('[data-viewport]').forEach(b => b.addEventListener('click', () => { state.width = Number(b.dataset.viewport); render(); }));
window.addEventListener('message', e => {
    if (e.origin === location.origin && e.data?.type === 'study-navigate' && data.routes[e.data.path]) { state.path = e.data.path; render(); }
});
let syncing = false;
for (const [id, other] of [['current', 'proposed'], ['proposed', 'current']]) {
    $(id).addEventListener('load', () => {
        const win = $(id).contentWindow;
        win.addEventListener('scroll', () => {
            if (syncing) return;
            const target = $(other).contentWindow;
            if (!target?.document.documentElement) return;
            const max = win.document.documentElement.scrollHeight - win.innerHeight;
            const nextMax = target.document.documentElement.scrollHeight - target.innerHeight;
            const top = max > 0 ? win.scrollY / max * nextMax : 0;
            if (Math.abs(target.scrollY - top) < 2) return;
            syncing = true; target.scrollTo({ top, behavior: 'instant' });
            requestAnimationFrame(() => { syncing = false; });
        });
        resize();
    });
}
new ResizeObserver(resize).observe($('comparison'));
render();
