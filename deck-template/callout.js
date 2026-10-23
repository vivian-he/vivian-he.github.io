/* A small, light-DOM component: CSS owns placement, and caption text remains
   ordinary selectable and accessible content. */
class DeckCallout extends HTMLElement {
  static get observedAttributes() { return ['label']; }

  connectedCallback() {
    if (!this.hasAttribute('role')) this.setAttribute('role', 'note');
    if (!this.querySelector('.deck-callout-leader')) {
      const leader = document.createElement('span');
      leader.className = 'deck-callout-leader';
      leader.setAttribute('aria-hidden', 'true');
      const caption = document.createElement('span');
      caption.className = 'deck-callout-caption';
      while (this.firstChild) caption.append(this.firstChild);
      this.append(leader, caption);
    }
    this.syncLabel();
  }

  attributeChangedCallback(name) {
    if (name === 'label' && this.isConnected) this.syncLabel();
  }

  syncLabel() {
    const caption = this.querySelector('.deck-callout-caption');
    if (caption && this.hasAttribute('label')) caption.textContent = this.getAttribute('label');
  }
}

if (!customElements.get('deck-callout')) customElements.define('deck-callout', DeckCallout);
