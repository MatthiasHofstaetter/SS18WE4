import {Component, AfterViewInit, ElementRef, Input, OnDestroy, ViewChild} from '@angular/core';

import {DiagramService} from '../../services';
import '../../models/diagram.model';

@Component({
  selector: 'app-diagram',
  templateUrl: './diagram.component.html'
})
export class DiagramComponent implements AfterViewInit, OnDestroy {
  @Input('arrowAdd')
  arrowAdd;

  @ViewChild('diagram')
  el: ElementRef;

  @ViewChild('contextMenu')
  context: ElementRef;

  @ViewChild('arrowReference')
  arrowReference: ElementRef;

  private diagram: Diagram;

  constructor(private readonly diagramService: DiagramService) {
  }

  ngAfterViewInit() {
    this.diagram = new Diagram(this.diagramService, this.el.nativeElement, this.arrowAdd, this.context.nativeElement,
      this.arrowReference.nativeElement);
  }

  ngOnDestroy() {
    if (this.diagram) {
      this.diagram.destroy();
      this.diagram = null;
    }
  }
}
