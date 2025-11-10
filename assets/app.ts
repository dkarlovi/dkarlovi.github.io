import "./styles/app.scss";
import * as CookieConsent from "vanilla-cookieconsent";

document.addEventListener("DOMContentLoaded", function () {
    const dateContainers = document.querySelectorAll(".date-container");
    dateContainers.forEach(function (container) {
        const days =
            (Date.now() - new Date(container.title).getTime()) / 86400000;
        const unit = [
            { unit: "year", threshold: 365 },
            { unit: "month", threshold: 30 },
            {
                unit: "week",
                threshold: 7,
            },
            { unit: "day", threshold: 1 },
        ].find((unit) => days >= unit.threshold);
        if (unit === undefined) {
            container.innerText = "Today";
            return;
        }
        const relativeTimeValue = -1 * Math.floor(days / unit.threshold);
        container.innerText = new Intl.RelativeTimeFormat("en", {
            numeric: "auto",
        }).format(relativeTimeValue, unit.unit);
    });

    // Initialize collapsible asides
    document.querySelectorAll("aside[title]").forEach((aside, index) => {
        const title = aside.getAttribute("title");
        const content = aside.innerHTML;
        const id = `aside-${index}`;

        aside.classList.add("collapsible-aside", "mb-4");
        aside.innerHTML = `
            <button class="collapsible-aside-toggle btn-link text-start w-100 d-flex justify-content-between align-items-center p-3 text-decoration-none"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#${id}"
                    aria-expanded="false"
                    aria-controls="${id}">
                <strong>${title}</strong>
                <i class="fas fa-chevron-down collapsible-aside-icon"></i>
            </button>
            <div class="collapse" id="${id}">
                <div class="collapsible-aside-content p-3">
                    ${content}
                </div>
            </div>
        `;
    });

    CookieConsent.run({
        guiOptions: {
            consentModal: {
                layout: "bar",
                position: "bottom",
                equalWeightButtons: true,
                flipButtons: true,
            },
            preferencesModal: {
                layout: "box",
                position: "right",
                equalWeightButtons: true,
                flipButtons: false,
            },
        },
        categories: {
            necessary: {
                readOnly: true,
            },
            analytics: {},
        },
        language: {
            default: "en",
            autoDetect: "browser",
            translations: {
                en: {
                    consentModal: {
                        title: "Hello traveller, it's cookie time!",
                        description: "You know what this is about.",
                        acceptAllBtn: "Accept all",
                        acceptNecessaryBtn: "Reject all",
                        showPreferencesBtn: "Manage preferences",
                    },
                    preferencesModal: {
                        title: "Consent Preferences Center",
                        acceptAllBtn: "Accept all",
                        acceptNecessaryBtn: "Reject all",
                        savePreferencesBtn: "Save preferences",
                        closeIconLabel: "Close modal",
                        serviceCounterLabel: "Service|Services",
                        sections: [
                            {
                                title: "Cookie Usage",
                                description:
                                    "Cookies for all sorts of things, like remembering your login, your preferences, and what you like to look at.",
                            },
                            {
                                title: 'Strictly Necessary Cookies <span class="pm__badge">Always Enabled</span>',
                                description:
                                    "These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms. You can set your browser to block or alert you about these cookies, but some parts of the site will not then work. These cookies do not store any personally identifiable information.",
                                linkedCategory: "necessary",
                            },
                            {
                                title: "Analytics Cookies",
                                description:
                                    "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site. All information these cookies collect is aggregated and therefore anonymous. If you do not allow these cookies we will not know when you have visited our site, and will not be able to monitor its performance.",
                                linkedCategory: "analytics",
                            },
                        ],
                    },
                },
            },
        },
        disablePageInteraction: true,
    });
});

import Collapse from "bootstrap/js/src/collapse";
import Dropdown from "bootstrap/js/src/dropdown";
// import Modal from "bootstrap/js/src/modal";
import Offcanvas from "bootstrap/js/src/offcanvas";
// import Tab from "bootstrap/js/src/tab";
