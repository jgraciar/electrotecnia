// Fuente de corriente sinusoidal de referencia para inversor FV conectado a red.
// Debe configurarse con la misma frecuencia y fase que la fuente de tensión.
// No incorpora todavía PLL, protecciones antiisla ni límites de corriente.
import { CurrentElm } from "./CurrentElm";
import { CircuitElm } from "./CircuitElm";
import { SimulationManager } from "./SimulationManager";
import { EditInfo } from "./EditInfo";
import { StringTokenizer } from "./StringTokenizer";
import { CircuitXMLSerializer } from "./CircuitXMLSerializer";
import { CircuitXMLDeserializer } from "./CircuitXMLDeserializer";
import { gridFollowingCurrent } from "./LabPVInverter";

export class PVInverterElm extends CurrentElm {
    power:number=3000;
    reactivePower:number=0;
    voltageRms:number=230;
    frequency:number=50;
    phaseDegrees:number=0;
    constructor(x:number,y:number);
    constructor(x:number,y:number,x2:number,y2:number,f:number,st:StringTokenizer);
    constructor(x:number,y:number,x2?:number,y2?:number,f?:number,st?:StringTokenizer){
        if(x2===undefined)super(x,y);
        else {
            // CurrentElm's dump fields must be consumed before our parameters.
            super(x,y,x2,y2!,f!,st!);
            if(st){
                this.power=Number(st.nextToken());
                this.reactivePower=Number(st.nextToken());
                this.voltageRms=Number(st.nextToken());
                this.frequency=Number(st.nextToken());
                this.phaseDegrees=Number(st.nextToken());
            }
        }
    }
    getDumpType():number{return 1555;}
    getXmlDumpType():string{return "PVInverter";}
    getElmType():string{return "Inversor FV (fuente de corriente CA)";}
    dumpXml(doc:Document,elem:Element):void{
        super.dumpXml(doc,elem);
        CircuitXMLSerializer.dumpAttr(elem,"pvP",this.power);
        CircuitXMLSerializer.dumpAttr(elem,"pvQ",this.reactivePower);
        CircuitXMLSerializer.dumpAttr(elem,"pvV",this.voltageRms);
        CircuitXMLSerializer.dumpAttr(elem,"pvF",this.frequency);
        CircuitXMLSerializer.dumpAttr(elem,"pvPhase",this.phaseDegrees);
    }
    undumpXml(xml:CircuitXMLDeserializer):void{
        super.undumpXml(xml);
        this.power=xml.parseDoubleAttr("pvP",this.power);
        this.reactivePower=xml.parseDoubleAttr("pvQ",this.reactivePower);
        this.voltageRms=xml.parseDoubleAttr("pvV",this.voltageRms);
        this.frequency=xml.parseDoubleAttr("pvF",this.frequency);
        this.phaseDegrees=xml.parseDoubleAttr("pvPhase",this.phaseDegrees);
    }
    stamp():void{
        const sim=SimulationManager.theSim;
        sim.stampNonLinear(this.nodes[0]);
        sim.stampNonLinear(this.nodes[1]);
    }
    doStep():void{
        const sim=SimulationManager.theSim;
        // Corriente de 0->1: el borne 1 es la inyección hacia la carga.
        this.current=gridFollowingCurrent({
            voltageRms:this.voltageRms,frequency:this.frequency,
            power:this.power,reactivePower:this.reactivePower,
            phase:this.phaseDegrees*Math.PI/180,time:sim.t
        });
        sim.stampCurrentSource(this.nodes[0],this.nodes[1],this.current);
    }
    getEditInfo(n:number):EditInfo|null{
        if(n===0)return new EditInfo("Potencia activa FV P (W)",this.power,0,0);
        if(n===1)return new EditInfo("Potencia reactiva FV Q (VAr)",this.reactivePower,0,0);
        if(n===2)return new EditInfo("Tensión de referencia RMS (V)",this.voltageRms,0,0);
        if(n===3)return new EditInfo("Frecuencia de red (Hz)",this.frequency,0,0);
        if(n===4)return new EditInfo("Fase de referencia (grados)",this.phaseDegrees,0,0);
        return null;
    }
    setEditValue(n:number,ei:EditInfo):void{
        if(!Number.isFinite(ei.value))return;
        if(n===0&&ei.value>=0)this.power=ei.value;
        if(n===1)this.reactivePower=ei.value;
        if(n===2&&ei.value>0)this.voltageRms=ei.value;
        if(n===3&&ei.value>0)this.frequency=ei.value;
        if(n===4)this.phaseDegrees=ei.value;
    }
    getInfo(arr:string[]):void{
        arr[0]="Inversor FV sincronizado manualmente";
        this.getBasicInfo(arr);
        arr[3]="P = "+CircuitElm.getUnitText(this.power,"W");
        arr[4]="Q = "+CircuitElm.getUnitText(this.reactivePower,"VAr");
        arr[5]="Referencia: "+this.frequency+" Hz; "+this.voltageRms+" V RMS";
    }
}
