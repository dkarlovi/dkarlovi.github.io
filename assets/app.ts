import './styles/app.scss';

document.addEventListener('DOMContentLoaded', function() {
    const dateContainers = document.querySelectorAll('.date-container');
    dateContainers.forEach(function(container) {
        const days = (Date.now() - new Date(container.title).getTime()) / 86400000;
        const unit = [{unit: 'year', threshold: 365}, {unit: 'month', threshold: 30}, {unit: 'week', threshold: 7}, {unit: 'day', threshold: 1}].find(unit => days >= unit.threshold);
        const relativeTimeValue= -1 * Math.floor(days / unit.threshold);
        container.innerText = new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(relativeTimeValue, unit.unit);
    });
});

import Collapse from "bootstrap/js/src/collapse";
import Dropdown from "bootstrap/js/src/dropdown";
import Modal from "bootstrap/js/src/modal";
import Offcanvas from "bootstrap/js/src/offcanvas";
import Tab from "bootstrap/js/src/tab";
