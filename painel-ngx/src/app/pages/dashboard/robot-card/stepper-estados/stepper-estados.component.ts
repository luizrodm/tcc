import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NbStepperComponent } from '@nebular/theme';
import { Estado } from '../../../../@core/data/dashboard-estado';

@Component({
  selector: 'ngx-stepper-estados',
  templateUrl: './stepper-estados.component.html',
  styleUrls: ['./stepper-estados.component.scss']
  
})
export class StepperEstadosComponent implements OnInit {
  @ViewChild('child', {static: false}) child:NbStepperComponent;

  @Input() estados: Estado[];
  @Input() estadoAtual: number;

  constructor() {
  }

  ngOnInit() {
  }

  select(estado){
    this.child.reset();
    for (let i=1; i<estado; i++){
      this.child.next();
    }
  }
}
