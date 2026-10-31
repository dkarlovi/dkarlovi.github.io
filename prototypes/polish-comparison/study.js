const routes = await fetch('/manifest.json').then(r => r.json());
const $ = id => document.getElementById(id);
const query = new URLSearchParams(location.search);
const state = { path: routes[query.get('path')] ? query.get('path') : '/', scheme: query.get('scheme') === 'dark' ? 'dark' : 'light', width: [1440, 768, 390, 320].includes(Number(query.get('viewport'))) ? Number(query.get('viewport')) : 1440, layout: 'split', position: 'top' };
for (const [path, entry] of Object.entries(routes)) $('page').add(new Option(entry.title, path));
function resize() {
    for (const id of ['current', 'proposed']) {
        const frame = $(id), box = frame.parentElement;
        if (!box.clientWidth) continue;
        const scale = Math.min(1, (box.clientWidth - 2) / state.width);
        frame.style.width = state.width + 'px';
        frame.style.height = Math.ceil(box.clientHeight / scale) + 'px';
        frame.style.transform = `scale(${scale})`;
    }
}
function position() {
    for (const id of ['current', 'proposed']) $(id).contentWindow?.postMessage({ type: 'polish-position', position: state.position }, location.origin);
}
function render() {
    $('page').value = state.path; $('viewport').value = state.width; $('layout').value = state.layout; $('position').value = state.position;
    $('comparison').dataset.layout = state.layout;
    $('comparison').classList.toggle('mobile', state.width <= 390);
    document.querySelectorAll('[data-scheme]').forEach(b => b.setAttribute('aria-pressed', b.dataset.scheme === state.scheme));
    $('changes').textContent = state.path === '/'
        ? 'Suggested: clearer separation between the mobile portrait and text, more readable article previews, roomier small-screen headings, and easier-to-tap navigation.'
        : 'Suggested: more readable small headings and categories, easier-to-tap navigation, slightly clearer control outlines, and a tidier mobile article footer. The original palettes are preserved.';
    for (const [id, side] of [['current', 'current'], ['proposed', 'suggested']]) {
        $(id).src = '/frame?' + new URLSearchParams({ path: state.path, side, scheme: state.scheme, revision: crypto.randomUUID() });
    }
    history.replaceState(null, '', '/?' + new URLSearchParams({ path: state.path, scheme: state.scheme, viewport: state.width }));
    requestAnimationFrame(resize);
}
$('page').addEventListener('change', e => { state.path = e.target.value; render(); });
$('viewport').addEventListener('change', e => { state.width = Number(e.target.value); render(); });
$('layout').addEventListener('change', e => { state.layout = e.target.value; $('comparison').dataset.layout = state.layout; requestAnimationFrame(resize); });
$('position').addEventListener('change', e => { state.position = e.target.value; position(); });
document.querySelectorAll('[data-scheme]').forEach(b => b.addEventListener('click', () => { state.scheme = b.dataset.scheme; render(); }));
window.addEventListener('message', e => {
    if (e.origin === location.origin && e.data?.type === 'polish-navigate' && routes[e.data.path]) { state.path = e.data.path; render(); }
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
        resize(); position();
    });
}
new ResizeObserver(resize).observe($('comparison'));
render();
