import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { Estado } from '../../../@core/data/dashboard-estado';
import { NbThemeService } from '@nebular/theme';
import {StepperEstadosComponent} from './stepper-estados/stepper-estados.component'


@Component({
  selector: 'ngx-robot-card',
  templateUrl: './robot-card.component.html',
  styleUrls: ['./robot-card.component.scss']
})
export class RobotCardComponent implements OnInit {
  
  @Input() id: number;
  @Input() nome: string;
  @Input() estados: Estado[];
  @Input() estadoAtual: number;
  @Input() distancia: number;
  @Output() altVelocidade = new EventEmitter<number[]>();
  @Output() altPotenciaEsq = new EventEmitter<number[]>();
  @Output() altPotenciaDir = new EventEmitter<number[]>();
  private potenciaEsq: number;
  private potenciaDir: number;
  private velocidade: number;

  constructor(private themeService: NbThemeService) {
    this.velocidade = 50;
    this.potenciaEsq = 50;
    this.potenciaDir = 50;
  }

  ngOnInit() {
  }

  setValueEsq(newValue) {
    this.potenciaEsq = Math.min(Math.max(newValue, 0), 100)
    this.altPotenciaEsq.emit([this.id, this.potenciaEsq]);
  }

  setValueDir(newValue) {
    this.potenciaDir = Math.min(Math.max(newValue, 0), 100)
    this.altPotenciaDir.emit([this.id, this.potenciaDir]);
  }

  setValueVelocidade(valor){
    this.velocidade = valor;
    this.altVelocidade.emit([this.id, valor]);
  }

  get statusEsq() {
    if (this.potenciaEsq <= 25) {
      return 'success';
    } else if (this.potenciaEsq <= 50) {
      return 'info';
    } else if (this.potenciaEsq <= 75) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  get statusDir() {
    if (this.potenciaDir <= 25) {
      return 'success';
    } else if (this.potenciaDir <= 50) {
      return 'info';
    } else if (this.potenciaDir <= 75) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

}
