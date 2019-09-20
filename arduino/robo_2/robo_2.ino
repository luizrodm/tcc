//Autor: Luiz Rodolfo Machado

#include <Ultrasonic.h>
#include <ESP8266WiFi.h> 
#include <PubSubClient.h>

//Pinos
#define PWM_B  2
#define PWM_A  0
#define AI2   15
#define AI1   13
#define BI1   12
#define BI2   14
#define STDBY 16
#define TRIGGER_PIN  5
#define ECHO_PIN     4
#define TEMPO_ATT 100

//WIFI
#define USUARIO_WIFI ""
#define SENHA_WIFI ""  

//MQTT
#define TOPICO_SUBSCRIBE_1 "uepg.LuizRodolfo.robo_1"  
#define TOPICO_SUBSCRIBE_2 "uepg.LuizRodolfo.painel"   
#define TOPICO_PUBLISH   "uepg.LuizRodolfo.robo_2"    
#define ID_MQTT  "robo2"     
#define BROKER_MQTT "18.229.134.56"  //AWS EC2 Instance
#define BROKER_PORT 8080

//Variáveis
#define PWM_MAX 1023
 
//Variáveis e objetos globais
Ultrasonic ultrasonic(TRIGGER_PIN, ECHO_PIN);
WiFiClient espClient;
PubSubClient MQTT(espClient);
unsigned long tempoAtual = 0;
unsigned long tempoAnterior = 0;
int distancia = 0;
int velocidadeGlobal = 50;
float potenciaEsquerda = 0.5;
float potenciaDireita = 0.5;

int estado;
//ESTADOS:
#define AGUARDANDO_CONTATO      0
#define AGUARDANDO_CONFIRMACAO  1
#define AGUARDANDO_CHEGADA      2
#define AGUARDANDO_AFASTAMENTO  3
#define TRANSPORTANDO_PACOTE    4
#define VOLTANDO_POS_INICIAL    5

 
void setup() 
{
    //inicializações:
    pinMode(2, OUTPUT);
    initSerial();
    initWiFi();
    initMQTT();
    pinMode(PWM_A, OUTPUT);
    pinMode(AI1, OUTPUT);
    pinMode(AI2, OUTPUT);
    pinMode(PWM_B, OUTPUT);
    pinMode(BI1, OUTPUT);
    pinMode(BI2, OUTPUT);
    pinMode(STDBY, OUTPUT);
    Serial.begin(115200);

    estado = AGUARDANDO_CONTATO;
}
  

void initSerial() 
{
    Serial.begin(115200);
}
 
void initWiFi() 
{
    delay(10);
    Serial.println("------Conexao WI-FI------");
    Serial.print("Conectando-se na rede: ");
    Serial.println(USUARIO_WIFI);
    Serial.println("Aguarde");
     
    reconectWiFi();
}
  
void initMQTT() 
{
    MQTT.setServer(BROKER_MQTT, BROKER_PORT);   
    MQTT.setCallback(mqtt_callback);            
}

void mqtt_callback(char* topic, byte* payload, unsigned int length) 
{
    String msg;
    //obtem a string do payload recebido
    for(int i = 0; i < length; i++) 
    {
       char c = (char)payload[i];
       msg += c;
    }

    Serial.println("MENSAGEM RECEBIDA: "+msg);
   
    trataMensagem(msg);
     
}

void trataMensagem(String msg){
  String comando = msg.substring(0,2);
  int valor = msg.substring(3).toInt();

  if (comando == "L2"){
    potenciaEsquerda = ((float)valor)/100;
  } else if (comando =="R2"){
    potenciaDireita = ((float)valor)/100;
  } else if (comando =="V2"){
    velocidadeGlobal = valor;
  } else {
    switch(estado)
    {
      case AGUARDANDO_CONTATO:
        if(msg == "E1")
          estado = AGUARDANDO_CONFIRMACAO;
        break;
      case AGUARDANDO_CONFIRMACAO:
        if(msg == "E2")
          estado = AGUARDANDO_CHEGADA;
        break;  
      case AGUARDANDO_CHEGADA:
        break;
      case AGUARDANDO_AFASTAMENTO:
        if(msg == "E4")
          estado = TRANSPORTANDO_PACOTE;
        break;
      case TRANSPORTANDO_PACOTE:
        break;
      case VOLTANDO_POS_INICIAL:
        break;
    }
  }
  /*Serial.print("Velocidade: ");
  Serial.println(velocidadeGlobal);
  Serial.print("PE: ");
  Serial.println(potenciaEsquerda);
  Serial.print("PD: ");
  Serial.println(potenciaDireita);*/
}

void verificaEstado(){
  distancia = ultrasonic.convert(ultrasonic.timing(), Ultrasonic::CM);
  char payload[8];
  
  switch(estado)
  {
    case AGUARDANDO_CONTATO:
      pararMover();
      sprintf(payload,"%s%i","E0-",distancia);
      MQTT.publish(TOPICO_PUBLISH, payload);
      break;
    case AGUARDANDO_CONFIRMACAO:
      pararMover();
      sprintf(payload,"%s%i","E1-",distancia);
      MQTT.publish(TOPICO_PUBLISH, payload);
      break;
    case AGUARDANDO_CHEGADA:
      pararMover();
      sprintf(payload,"%s%i","E2-",distancia);
      MQTT.publish(TOPICO_PUBLISH, payload);
      if (distancia < 10)
        estado = AGUARDANDO_AFASTAMENTO;
      break;
    case AGUARDANDO_AFASTAMENTO:
      pararMover();
      sprintf(payload,"%s%i","E3-",distancia);
      MQTT.publish(TOPICO_PUBLISH, payload);
      break;
    case TRANSPORTANDO_PACOTE:
      mover(velocidadeGlobal);
      sprintf(payload,"%s%i","E4-",distancia);
      MQTT.publish(TOPICO_PUBLISH, payload);
      if (distancia > 30)
        estado = VOLTANDO_POS_INICIAL;
      break;
    case VOLTANDO_POS_INICIAL:
      mover(-velocidadeGlobal);
      sprintf(payload,"%s%i","E5-",distancia);
      MQTT.publish(TOPICO_PUBLISH, payload);
      if (distancia > 100)
        estado = AGUARDANDO_CONTATO;
      break;
  }

  Serial.print("Distancia: ");
  Serial.print(distancia);
  Serial.print("      Estado: ");
  Serial.println(estado);
}
  
void reconnectMQTT() 
{
    while (!MQTT.connected()) 
    {
        Serial.print("* Tentando se conectar ao Broker MQTT: ");
        Serial.println(BROKER_MQTT);
        if (MQTT.connect(ID_MQTT)) 
        {
            Serial.println("Conectado com sucesso ao broker MQTT!");
            MQTT.subscribe(TOPICO_SUBSCRIBE_1); 
            MQTT.subscribe(TOPICO_SUBSCRIBE_2);
        } 
        else
        {
            Serial.println("Falha ao reconectar no broker.");
            Serial.println("Havera nova tentatica de conexao em 2s");
            delay(2000);
        }
    }
}
  
//Função: reconecta-se ao WiFi
//Parâmetros: nenhum
//Retorno: nenhum
void reconectWiFi() 
{
    //se já está conectado a rede WI-FI, nada é feito. 
    //Caso contrário, são efetuadas tentativas de conexão
    if (WiFi.status() == WL_CONNECTED)
        return;
         
    WiFi.begin(USUARIO_WIFI, SENHA_WIFI); // Conecta na rede WI-FI
     
    while (WiFi.status() != WL_CONNECTED) 
    {
        delay(100);
        Serial.print(".");
    }
   
    Serial.println();
    Serial.print("Conectado com sucesso na rede ");
    Serial.print(USUARIO_WIFI);
    Serial.println("IP obtido: ");
    Serial.println(WiFi.localIP());
}
 
void VerificaConexoesWiFIEMQTT(void)
{
    if (!MQTT.connected()) 
        reconnectMQTT(); //se não há conexão com o Broker, a conexão é refeita
     
     reconectWiFi(); //se não há conexão com o WiFI, a conexão é refeita
}



void mover(int velocidade) {
  int velocidadeReal = abs(velocidade * PWM_MAX / 100);
  digitalWrite(AI1, velocidade > 0 ? HIGH : LOW);
  digitalWrite(AI2, velocidade > 0 ? LOW : HIGH);
  digitalWrite(BI1, velocidade > 0 ? HIGH : LOW);
  digitalWrite(BI2, velocidade > 0 ? LOW : HIGH);
  analogWrite(PWM_A, velocidadeReal * potenciaEsquerda);
  analogWrite(PWM_B, velocidadeReal * potenciaDireita);
  digitalWrite(STDBY, HIGH);
}

void pararMover(){
  digitalWrite(STDBY, LOW);
}

void loopSensor(){
  tempoAtual = millis();
  if((tempoAtual - tempoAnterior) > TEMPO_ATT){
      verificaEstado();
      tempoAnterior = tempoAtual;
  }
}
 
 
//programa principal
void loop() 
{   
    //garante funcionamento das conexões WiFi e ao broker MQTT
    VerificaConexoesWiFIEMQTT();
 
    //keep-alive da comunicação com broker MQTT
    MQTT.loop();
    
    loopSensor();
}
