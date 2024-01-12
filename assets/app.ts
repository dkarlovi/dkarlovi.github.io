import './styles/app.scss';
import "vanilla-cookieconsent";

document.addEventListener('DOMContentLoaded', function () {
    const dateContainers = document.querySelectorAll('.date-container');
    dateContainers.forEach(function (container) {
        const days = (Date.now() - new Date(container.title).getTime()) / 86400000;
        const unit = [{unit: 'year', threshold: 365}, {unit: 'month', threshold: 30}, {
            unit: 'week',
            threshold: 7
        }, {unit: 'day', threshold: 1}].find(unit => days >= unit.threshold);
        if (unit === undefined) {
            container.innerText = 'Today';
            return;
        }
        const relativeTimeValue = -1 * Math.floor(days / unit.threshold);
        container.innerText = new Intl.RelativeTimeFormat('en', {numeric: 'auto'}).format(relativeTimeValue, unit.unit);
    });

    const cc = window.initCookieConsent();
    cc.run({
        revision: 1,
        current_lang: "en",
        autoclear_cookies: true,
        page_scripts: true,

        gui_options: {
            consent_modal: {
                layout: "bar",
                position: "bottom center",
                transition: "zoom",
                swap_buttons: true,
            },
            settings_modal: {
                layout: "box", // box/bar
                position: "left", // left/right
                transition: "zoom", // zoom/slide
            },
        },
        languages: {
            en: {
                consent_modal: {
                    title: "We use cookies",
                    description:
                        'We use essential cookies to ensure its proper operation and tracking cookies to understand how you interact with it. The latter will be set only after consent. <button type="button" data-cc="c-settings" class="cc-link">Let me choose</button>',
                    primary_btn: {
                        text: "Accept all",
                        role: "accept_all", // 'accept_selected' or 'accept_all'
                    },
                    secondary_btn: {
                        text: "Reject all",
                        role: "accept_necessary", // 'settings' or 'accept_necessary'
                    },
                },
                settings_modal: {
                    title: "Cookie preferences",
                    save_settings_btn: "Save settings",
                    accept_all_btn: "Accept all",
                    reject_all_btn: "Reject all",
                    close_btn_label: "Close",
                    cookie_table_headers: [
                        { col1: "Name" },
                        { col2: "Domain" },
                        { col3: "Expiration" },
                        { col4: "Description" },
                    ],
                    blocks: [
                        {
                            title: "Cookie usage 📢",
                            description:
                                'I use cookies to ensure the basic functionalities of the website and to enhance your online experience. You can choose for each category to opt-in/out whenever you want. For more details relative to cookies and other sensitive data, please read the full <a href="/cookie-policy" class="cc-link">Cookie Policy</a>.',
                        },
                        {
                            title: "Strictly necessary cookies",
                            description:
                                "These cookies are essential for the proper functioning of this website",
                            toggle: {
                                value: "necessary",
                                enabled: true,
                                readonly: true, // cookie categories with readonly=true are all treated as "necessary cookies"
                            },
                        },
                        {
                            title: "Performance and Analytics cookies",
                            description:
                                "These cookies allow the website to remember the choices you have made in the past",
                            toggle: {
                                value: "analytics", // your cookie category
                                enabled: false,
                                readonly: false,
                            },
                            cookie_table: [
                                // list of all expected cookies
                                {
                                    col1: "^_ga", // match all cookies starting with "_ga"
                                    col2: "google.com",
                                    col3: "2 years",
                                    col4: "Google Analytics",
                                    is_regex: true,
                                },
                                {
                                    col1: "_gid",
                                    col2: "google.com",
                                    col3: "1 day",
                                    col4: "Google Analytics",
                                },
                            ],
                        },
                        {
                            title: "Advertisement and Targeting cookies",
                            description:
                                "These cookies collect information about how you use the website, which pages you visited and which links you clicked on. All of the data is anonymized and cannot be used to identify you",
                            toggle: {
                                value: "targeting",
                                enabled: false,
                                readonly: false,
                            },
                        },
                        {
                            title: "More information",
                            description:
                                'For any queries in relation to our policy on cookies and your choices, please <a class="cc-link" href="mailto:dalibor.karlovic@sigwin.company?subject=Cookies+query">contact us</a>.',
                        },
                    ],
                },
            },
        },
    })
});

// import Collapse from "bootstrap/js/src/collapse";
import Dropdown from "bootstrap/js/src/dropdown";
// import Modal from "bootstrap/js/src/modal";
import Offcanvas from "bootstrap/js/src/offcanvas";
// import Tab from "bootstrap/js/src/tab";
