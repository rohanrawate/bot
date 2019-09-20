import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[numbersOnly]'
})
export class OnlyNumericDirective {
  @Input('numbersOnly') enableNumbersOnly: boolean;

  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event']) onInputChange(event) {

    if (this.enableNumbersOnly) {
      const initalValue = this.el.nativeElement.value;

      this.el.nativeElement.value = initalValue.replace(/[^0-9]*/g, '');
      if ( initalValue !== this.el.nativeElement.value) {
        event.stopPropagation();
      }
    }
  }
}