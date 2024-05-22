import { createRoot } from 'react-dom/client';
// import App from '@root/src/pages/content/Menu';
import ControlPanel from '@root/src/pages/content/ControlPanel';
import MCQ from '@root/src/pages/content/Quiz';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import injectedStyle from './injected.css?inline';
import { attachTwindStyle } from '@src/shared/style/twind';

refreshOnUpdate('pages/content');

type ElementOffset = { x: number; y: number };
interface Candidate {
  node: Element;
  centerX: number;
  centerY: number;
}

export default class WebColabManager {
  private lock: boolean;
  private hasInitialized: boolean;
  private dragElem: HTMLElement | null;
  private dragElemClone: HTMLElement | null;
  private dragOffset: ElementOffset;
  private hoverElem: HTMLElement | null;
  private selectElem: HTMLElement | null;
  private popupMenu: HTMLElement | null;
  private popupQuiz: HTMLElement | null;
  private contentNode: HTMLElement | null;

  constructor() {
    this.lock = false;
    this.hasInitialized = false;
    this.dragElem = null;
    this.dragElemClone = null;
    this.dragOffset = { x: 0, y: 0 };
    this.hoverElem = null;
    this.selectElem = null;
    this.popupMenu = null;
    this.popupQuiz = null;
    this.contentNode = document.querySelector('.mw-content-ltr');

    this.init();
  }

  private init(): void {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      this.initialize();
    } else {
      document.addEventListener('DOMContentLoaded', this.initialize.bind(this));
    }
  }

  public setLock(state: boolean): void {
    this.lock = state;
  }

  private initialize(): void {
    if (this.hasInitialized) return;
    this.hasInitialized = true;
    // this.assignLevelToElements(document.documentElement, 0);
    // this.makeElementsDraggable();
    this.makeElementsHoverable();
    this.listenForUserInput();
  }

  private generatePopupMenu(): void {
    if (this.popupMenu !== null) {
      this.popupMenu.remove();
    }
    
    this.popupMenu = document.createElement('div');
    this.popupMenu.classList.add('popup-menu');
    document.body.append(this.popupMenu);

    const rootIntoShadow = document.createElement('div');
    rootIntoShadow.id = 'shadow-root';

    const shadowRoot = this.popupMenu.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(rootIntoShadow);

    /** Inject styles into shadow dom */
    const styleElement = document.createElement('style');
    styleElement.innerHTML = injectedStyle;
    shadowRoot.appendChild(styleElement);
    attachTwindStyle(rootIntoShadow, shadowRoot);
    createRoot(rootIntoShadow).render(<ControlPanel node={this.selectElem} webColabManager={this} />);

    const rect = this.selectElem.getBoundingClientRect();

    // this.popupMenu.style.position = "absolute";
    this.popupMenu.style.left = `${rect.left - 53}px`;
    this.popupMenu.style.top = `${window.scrollY + rect.top}px`;
  }

  public setInnerText(text: string): void {
    if (this.selectElem) {
      this.selectElem.innerText = text;
    }
  }

  public createQuiz(position: string, data): void {
    if (this.popupQuiz) {
      this.popupQuiz.remove();
    }
    console.log('quiz generating...');
    this.popupQuiz = document.createElement('div');
    this.popupQuiz.classList.add('quiz');

    const rootIntoShadow = document.createElement('div');
    rootIntoShadow.id = 'shadow-root';

    const shadowRoot = this.popupQuiz.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(rootIntoShadow);

    /** Inject styles into shadow dom */
    const styleElement = document.createElement('style');
    styleElement.innerHTML = injectedStyle;
    shadowRoot.appendChild(styleElement);
    attachTwindStyle(rootIntoShadow, shadowRoot);
    createRoot(rootIntoShadow).render(
      <MCQ
        id="todo"
        question={data.question}
        choices={data.choices}
        correctAnsId={parseInt(data.correctAnsId)}
        explanations={data.explanations}
        hint={data.hint}
      />,
    );

    this.appendToSide('right', this.popupQuiz);
  }

  public appendToSide(position: string, elem: HTMLElement): void {
    console.log(position, elem);
    console.log(this.selectElem)
    if (this.selectElem) {
      const rect = this.selectElem.getBoundingClientRect();
      document.body.append(elem);
      elem.style.position = 'absolute';
      if (position == 'left') {
        elem.style.left = `${rect.left - rect.width - 5}px`;
      } else {
        elem.style.left = `${rect.right + 5}px`;
      }
      elem.style.top = `${window.scrollY + rect.top}px`;
    }
  }

  private assignLevelToElements(element: Element, level: number): void {
    element.setAttribute('data-level', level.toString());
    Array.from(element.children).forEach(child => {
      this.assignLevelToElements(child, level + 1);
    });
  }

  private makeElementsDraggable(): void {
    document.querySelectorAll('*').forEach(elem => {
      if (!/^DIV$|^P$|^H[1-6]$|^LI$|^UL$/.test(elem.tagName)) return;

      elem.setAttribute('draggable', 'true');
      elem.classList.add('draggable');

      elem.addEventListener('dragstart', this.handleDragStart.bind(this, elem));
      elem.addEventListener('dragend', this.cleanupDrag.bind(this));
    });

    document.addEventListener('dragover', this.handleDragOver.bind(this));
    document.addEventListener('drop', this.handleDrop.bind(this));
  }

  private wrapContentWithDiv(elem: Element): void {

    
    for (let level = 6; level > 0; level--) {
      const children = Array.from(elem.children);
      console.log(level)

      let tempGroup = [];
      let i = 0;

      children.forEach((el, index) => {
        if (el.tagName === `H${level}`) {
            if (tempGroup.length > 0) {
                wrapElements(tempGroup);
                tempGroup = [];
            }
            tempGroup.push(el); // Start a new group with the current header
        } else if (tempGroup.length > 0 && !el.tagName.match(/^H[1-6]$/)) {
            // Only add to group if it's not a header itself, ensuring it's part of the current grouping
            tempGroup.push(el);
        }
    });

    // Wrap the last group if any elements are left unwrapped
    if (tempGroup.length > 0) {
        wrapElements(tempGroup);
    }

      // Wrap the last group if any elements are left unwrapped
      if (tempGroup.length > 0) {
        wrapElements(tempGroup);
      }
    }

    // Function to wrap elements in a <div>
    function wrapElements(elements) {
      let wrapper = document.createElement('div');
      wrapper.classList.add("hoverable");
      elements[0].before(wrapper);
      elements.forEach(el => wrapper.appendChild(el));
    };
  }

  private makeElementsHoverable(): void {
    // Wrap div first
    // let bodyChildren = document.body.children;
    this.wrapContentWithDiv(this.contentNode);

    document.querySelectorAll('*').forEach(elem => {
      if (!/^P$|^FIGCAPTION$|^DIV$/.test(elem.tagName)) return;
      if (elem.innerHTML === "") return;
      if (elem.getAttribute("role") === "note") return;
      elem.classList.add('hoverable');
    });

    document.addEventListener('mouseover', this.handleMouseOver.bind(this));
    document.addEventListener('mouseout', this.handleMouseOut.bind(this));
  }

  private handleMouseClick(e: MouseEvent): void {
    if (e.button == 0 && this.hoverElem !== null) {
      console.log('Left mouse button pressed');
      // const clickedElement = e.target as HTMLElement;
      // if (clickedElement.classList.contains('popup-menu') || clickedElement.classList.contains('quiz')) return;
      // if (!this.selectElem) {
      //   this.selectElem = this.hoverElem;
      //   this.generatePopupMenu();
      // } else {
      //   this.cleanupSelected();
      //   this.cleanupPopup();
      // }
    } else if (e.button == 2) {
      console.log('Right mouse button pressed');
    }
  }

  private handleMouseDoubleClick(e: MouseEvent): void {
    if (e.button === 0) {
      // Left mouse button
      console.log('Double left mouse button press detected');
    }
  }

  private handleKeyPress(e: KeyboardEvent): void {
    console.log(`Key pressed: ${e.key}, Code: ${e.code}`);
    if (e.code === 'KeyF' && e.ctrlKey) {
      console.log('Ctrl+F was pressed');
    }
  }

  private listenForUserInput(): void {
    document.addEventListener('mousedown', this.handleMouseClick.bind(this));
    document.addEventListener('mousedown', this.handleMouseDoubleClick.bind(this));
    document.addEventListener('keydown', this.handleKeyPress.bind(this));
  }

  private handleDragStart(elem: HTMLElement, e: DragEvent): void {
    this.cleanupPopup();
    if (!this.dragElemClone) {
      this.dragElem = e.target as HTMLElement;
      this.dragElemClone = this.dragElem.cloneNode(true) as HTMLElement;
      this.dragElemClone.classList.add('drag-clone');
      document.body.appendChild(this.dragElemClone);

      const rect = this.dragElem.getBoundingClientRect();
      this.dragElemClone.style.left = `${rect.left}px`;
      this.dragElemClone.style.top = `${rect.top}px`;
      this.dragElemClone.style.width = `${rect.width}px`;
      this.dragElemClone.style.height = `${rect.height}px`;
      this.dragOffset = { x: (rect.left + rect.right) / 2 - e.clientX, y: (rect.top + rect.bottom) / 2 - e.clientY };
      this.dragElem.style.opacity = '0';
      e.dataTransfer!.effectAllowed = 'move';
    }
  }

  private handleDragOver(e: DragEvent): void {
    e.preventDefault();
    if (!this.dragElemClone) throw new Error('drag element incorrectly set');

    const dragElemCenterX = this.dragOffset.x + e.clientX;
    const dragElemCenterY = this.dragOffset.y + e.clientY;
    this.dragElemClone.style.left = `${this.dragOffset.x + e.clientX - this.dragElemClone.offsetWidth / 2}px`;
    this.dragElemClone.style.top = `${this.dragOffset.y + e.clientY - this.dragElemClone.offsetHeight / 2}px`;

    // Update dom based on realtime pos
    document.querySelectorAll('*').forEach((elem: Element) => {
      if (!/^DIV$|^P$|^H[1-6]$|^LI$|^UL$/.test(elem.tagName)) return;

      const rect = elem.getBoundingClientRect();
      const parentCandidates: Candidate[] = [];
      const siblingCandidates: Candidate[] = [];
      if (
        rect.left < dragElemCenterX &&
        dragElemCenterX < rect.right &&
        rect.top < dragElemCenterY &&
        dragElemCenterY < rect.bottom
      ) {
        if (this.dragElem === elem || this.dragElemClone === elem) return;
        const elemDataLevel = parseInt(elem.getAttribute('data-level')!, 10); // Non-null assertion operator for TypeScript
        const dragElemDataLevel = parseInt(this.dragElem!.getAttribute('data-level')!, 10); // Assuming `this.dragElem` is not null here

        if (elemDataLevel > dragElemDataLevel) {
          return; // TODO: other cases
        } else if (elemDataLevel == dragElemDataLevel) {
          siblingCandidates.push({
            node: elem,
            centerX: rect.left + rect.width / 2,
            centerY: rect.top + rect.height / 2,
          });
        } else {
          parentCandidates.push({
            node: elem,
            centerX: rect.left + rect.width / 2,
            centerY: rect.top + rect.height / 2,
          });
        }
      }
      parentCandidates.sort((a: Candidate, b: Candidate) => {
        const levelA = parseInt(a.node.getAttribute('data-level')!, 10);
        const levelB = parseInt(b.node.getAttribute('data-level')!, 10);
        return levelA - levelB;
      });

      let neighborSibling: Candidate | null = null;
      let minDistancePow: number | null = null;
      siblingCandidates.forEach((sibling: Candidate) => {
        const distancePow =
          Math.pow(sibling.centerX - dragElemCenterX, 2) + Math.pow(sibling.centerY - dragElemCenterY, 2);
        if (minDistancePow === null || distancePow < minDistancePow) {
          minDistancePow = distancePow;
          neighborSibling = sibling;
        }
      });
      if (neighborSibling !== null) {
        // TODO: more complex case
        if (neighborSibling.centerY > dragElemCenterY) {
          neighborSibling.node.parentNode!.insertBefore(this.dragElem!, neighborSibling.node);
        } else {
          neighborSibling.node.parentNode!.insertBefore(this.dragElem!, neighborSibling.node.nextSibling);
        }
      }
      // console.log(parentCandidates, siblingCandidates);
    });
  }

  private handleDrop(e: DragEvent): void {
    e.preventDefault();
    // this.cleanupDrag();
  }

  private handleMouseOver(e: MouseEvent): void {
    this.hoverElem = e.target as HTMLElement;
    if (this.lock) return;
    if (
      this.hoverElem.classList.contains('hoverable') &&
      (!this.selectElem ||
        !(
          this.selectElem.getBoundingClientRect().left + 10 >= e.clientX &&
          e.clientX >= this.selectElem.getBoundingClientRect().left - 100
        ))
    ) {
      if (this.hoverElem !== this.selectElem) {
        this.cleanupSelected();
        this.selectElem = this.hoverElem;
        this.generatePopupMenu();
      }
      this.hoverElem.style.outline = '1px solid #989898';
    }
  }

  private handleMouseOut(): void {
    if (this.lock) return;
    if (!this.selectElem) {
      this.cleanupHover();
    }
  }

  private cleanupSelected() {
    if (this.selectElem) {
      this.selectElem.style.outline = '';
      this.selectElem = null;
    }
  }

  private cleanupHover() {
    if (this.hoverElem) {
      this.hoverElem.style.outline = '';
      this.hoverElem = null;
    }
  }

  private cleanupDrag() {
    if (this.dragElemClone) {
      this.dragElemClone.remove();
      this.dragElemClone = null;
      this.dragOffset = { x: 0, y: 0 };
      if (this.dragElem) {
        this.dragElem.style.opacity = '1';
        this.dragElem = null;
      }
    }
  }

  private cleanupPopup() {
    if (this.popupMenu) {
      this.popupMenu.remove();
      this.popupMenu = null;
    }
  }
}

new WebColabManager();
