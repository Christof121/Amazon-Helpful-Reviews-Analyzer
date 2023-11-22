// ==UserScript==
// @name         Amazon Helpful Reviews Analyzer
// @namespace    http://tampermonkey.net/
// @version      1.01
// @description  Filters and sorts all helpful reviews.
// @author       DiscoJay
// @match        *.amazon.de/gp/profile/amzn1.account.*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.de
// @grant        none
// ==/UserScript==

function insertButton() {
  const button = document.createElement('button');
  button.textContent = 'Find Helpful Reviews';
  button.style.marginLeft = '10px';

  const container = document.querySelector('.your-content-widget-tab-buttons');
  if (container) {
    container.appendChild(button);
    button.addEventListener('click', processAndShowContent);
  }
}

function processAndShowContent() {
  const wrappers = Array.from(document.querySelectorAll('.your-content-card-wrapper'));

  let outputDiv = document.getElementById('outputDiv');
  if (!outputDiv) {
    outputDiv = document.createElement('div');
    outputDiv.id = 'outputDiv';
    outputDiv.style.margin = '10px 0px';

    const container = document.querySelector('.your-content-widget-tab-buttons');
    if (container) {
      container.insertAdjacentElement('afterend', outputDiv);
    }
  }

  let outputHTML = '';
  let itemsAdded = false;

  // Sort items by count descending
  const sortedWrappers = wrappers.sort((a, b) => {
    const countA = parseInt(a.querySelector('.your-content-card-reactions span')?.textContent || '0');
    const countB = parseInt(b.querySelector('.your-content-card-reactions span')?.textContent || '0');
    return countB - countA;
  });

  sortedWrappers.forEach((wrapper, index) => {
    const count = parseInt(wrapper.querySelector('.your-content-card-reactions span')?.textContent || '0');
    if (count > 0) {
      itemsAdded = true;
      const starRating = getStarRating(wrapper);
      const img = wrapper.querySelector('.your-content-card-product-thumbnail img');
      const title = wrapper.querySelector('.your-content-title')?.textContent || 'No Title';
      const text = wrapper.querySelector('.your-content-text-3')?.textContent || 'No Text';

      const linkElement = wrapper.querySelector('a[href*="/gp/customer-reviews/"]');
      let link = linkElement ? linkElement.getAttribute('href').split('?')[0] : '#';


      let imgTag = '';
      if (img) {
        img.style.height = '32px';
        img.style.width = '32px';
        img.style.objectFit = 'contain';
        imgTag = img.outerHTML;
      }
      let shortText = text.slice(0, 200) + (text.length > 200 ? '...' : '');

      outputHTML += `<div class="item-style">${imgTag} ❤️${count} ${starRating} <a href="${link}" target="_blank">${title}</a><br>
        <span id="shortText${index}">${shortText}</span>
        <span id="fullText${index}" style="display: none;">${text}</span>
        <button id="expandText${index}" style="border:none; background:none; color:#007185; cursor:pointer;">[ + ]</button>
        </div>`;
    }
  });

  if (!itemsAdded) {
    outputHTML = "Please scroll down your whole review list until no new items appear. Then scroll up and click this button again.";
  }

  outputDiv.innerHTML = outputHTML;

  // Attach event listeners after rendering HTML
  sortedWrappers.forEach((_, index) => {
    const expandButton = document.getElementById(`expandText${index}`);
    if (expandButton) {
      expandButton.addEventListener('click', () => toggleText(index));
    }
  });
}

function getStarRating(wrapper) {
  for (let i = 5; i >= 1; i--) {
    if (wrapper.querySelector(`.a-star-${i}`)) {
      return '⭐'.repeat(i) + '▫️'.repeat(5 - i);
    }
  }
  return '▫️▫️▫️▫️▫️'; // Return empty stars if no rating found
}

function toggleText(index) {
  const shortText = document.getElementById(`shortText${index}`);
  const fullText = document.getElementById(`fullText${index}`);
  const expandButton = document.getElementById(`expandText${index}`);

  if (shortText.style.display === 'none') {
    shortText.style.display = 'inline';
    fullText.style.display = 'none';
    expandButton.textContent = '[ + ]';
  } else {
    shortText.style.display = 'none';
    fullText.style.display = 'inline';
    expandButton.textContent = '[ - ]';
  }
}

// Define the new style class with reduced margin
const style = document.createElement('style');
style.textContent = `
  .item-style {
    border: 1px solid lightgrey;
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 10px;
    background-color: #f8f8f8;
  }
`;
document.head.appendChild(style);

setTimeout(insertButton, 2000);
