import {DiagramService} from '../services';

declare global {
  class Diagram {
    constructor(service: DiagramService, areaEl, arrowButtonEl, contextEl, arrowReferenceEl);

    destroy(): void;
  }
}

export {};
