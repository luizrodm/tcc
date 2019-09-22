import {Component, OnDestroy, ViewChildren} from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { takeWhile } from 'rxjs/operators' ;
import { SolarData } from '../../@core/data/solar';
import { Robo } from '../../@core/data/dashboard-robo';
import {RobotCardComponent} from './robot-card/robot-card.component'
declare var autobahn: any;

interface CardSettings {
  title: string;
  iconClass: string;
  type: string;
}

@Component({
  selector: 'ngx-dashboard',
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnDestroy {

  private alive = true;
  private robos: Robo[];
  private connection : any;
  private session: any;

  solarValue: number;
  lightCard: CardSettings = {
    title: 'Light',
    iconClass: 'nb-lightbulb',
    type: 'primary',
  };
  rollerShadesCard: CardSettings = {
    title: 'Roller Shades',
    iconClass: 'nb-roller-shades',
    type: 'success',
  };
  wirelessAudioCard: CardSettings = {
    title: 'Wireless Audio',
    iconClass: 'nb-audio',
    type: 'info',
  };
  coffeeMakerCard: CardSettings = {
    title: 'Coffee Maker',
    iconClass: 'nb-coffee-maker',
    type: 'warning',
  };

  statusCards: string;

  commonStatusCardsSet: CardSettings[] = [
    this.lightCard,
    this.rollerShadesCard,
    this.wirelessAudioCard,
    this.coffeeMakerCard,
  ];

  statusCardsByThemes: {
    default: CardSettings[];
    cosmic: CardSettings[];
    corporate: CardSettings[];
    dark: CardSettings[];
  } = {
    default: this.commonStatusCardsSet,
    cosmic: this.commonStatusCardsSet,
    corporate: [
      {
        ...this.lightCard,
        type: 'warning',
      },
      {
        ...this.rollerShadesCard,
        type: 'primary',
      },
      {
        ...this.wirelessAudioCard,
        type: 'danger',
      },
      {
        ...this.coffeeMakerCard,
        type: 'info',
      },
    ],
    dark: this.commonStatusCardsSet,
  };

  constructor(private themeService: NbThemeService,
              private solarService: SolarData) {
    this.themeService.getJsTheme()
      .pipe(takeWhile(() => this.alive))
      .subscribe(theme => {
        this.statusCards = this.statusCardsByThemes[theme.name];
    });

    this.solarService.getSolarData()
      .pipe(takeWhile(() => this.alive))
      .subscribe((data) => {
        this.solarValue = data;
      });

    this.robos=[{id: 1,
                nome: "Robô 1",
                estados: [{numero: 1, descricao: "Recebimento"},
                          {numero: 2, descricao: "Confirmação"},
                          {numero: 3, descricao: "Transporte"},
                          {numero: 4, descricao: "Afastamento"},
                          {numero: 5, descricao: "Aguardo"},
                          {numero: 6, descricao: "Retorno"}],
                estadoAtual: 0,
                distancia: 0,
                velocidade: 80,
                potenciaEsq: 80,
                potenciaDir: 90},
                {id: 2,
                nome: "Robô 2",
                estados: [{numero: 1, descricao: "Contato"},
                          {numero: 2, descricao: "Confirmação"},
                          {numero: 3, descricao: "Chegada"},
                          {numero: 4, descricao: "Afastamento"},
                          {numero: 5, descricao: "Transporte"},
                          {numero: 6, descricao: "Retorno"}],
                estadoAtual: 0,
                distancia: 0,
                velocidade: 80,
                potenciaEsq: 90,
                potenciaDir: 70}]
    this.conectar();
  }

  conectar(){
    this.connection = new autobahn.Connection({
      url: "ws://18.229.134.56:8080/ws",
      realm: "tcc"
    });

    let self = this;

    console.log(this.connection);

    this.connection.onopen = function (session) {
      console.log("Conexão aberta!");
      // 1) subscribe to a topic
      function oneventRobo1(args) {
          //console.log("ROBO 1:", atob(args.substring(1,args.lenght))); //retirando caracter não reconhecido na posição 0
          let payload = atob(args.substring(1,args.lenght));
          self.robos[0].estadoAtual = parseInt(payload[1]);
          console.log(payload.split("-"));
          self.robos[0].distancia = parseInt(payload.split("-")[1]);
      }
      session.subscribe('uepg.LuizRodolfo.robo_1', oneventRobo1);

      function oneventRobo2(args) {
        //console.log("ROBO 2:", atob(args.substring(1,args.lenght))); //retirando caracter não reconhecido na posição 0
        let payload = atob(args.substring(1,args.lenght));
        self.robos[1].estadoAtual = parseInt(payload[1]);
        self.robos[1].distancia = parseInt(payload.split("-")[1]);
      }
      session.subscribe('uepg.LuizRodolfo.robo_2', oneventRobo2);
      
    };

    this.connection.open();
    console.log("Tentando abrir conexao");
  }

  enviaPotenciaEsq(valor){
    let metodo = "uepg.LuizRodolfo.robo_"+valor[0]+".setPotenciaEsq";
    //console.log(metodo);
    this.connection.session.call(metodo, [valor[1]]).then(
      function (res) {
        console.log("Enviado:", res);
      }
    );
  }

  enviaPotenciaDir(valor){
    let metodo = "uepg.LuizRodolfo.robo_"+valor[0]+".setPotenciaDir";
    //console.log(metodo);
    this.connection.session.call(metodo, [valor[1]]).then(
      function (res) {
        console.log("Enviado:", res);
      }
    );
  }

  enviaVelocidade(valor){
    let metodo = "uepg.LuizRodolfo.robo_"+valor[0]+".setVelocidade";
    //console.log(metodo);
    this.connection.session.call(metodo, [valor[1]]).then(
      function (res) {
        console.log("Enviado:", res);
      }
    );
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
