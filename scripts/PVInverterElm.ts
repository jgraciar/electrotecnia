// Inversor FV para prácticas. Conexión a red: fuente de corriente que
// sigue automáticamente una fuente sinusoidal CA conectada al mismo N.
// Aislada: fuente de tensión regulada con una resistencia serie equivalente.
// Limitaciones: sin PLL transitorio, MPPT, batería, antiisla ni protecciones.
// Los atributos pvP/pvQ/pvV/pvF/pvPhase antiguos se mantienen compatibles.
import { CurrentElm } from "./CurrentElm";
import { VoltageElm } from "./VoltageElm";
import { CircuitElm } from "./CircuitElm";
import { SimulationManager } from "./SimulationManager";
import { EditInfo } from "./EditInfo";
import { Choice } from "./Choice";
import { StringTokenizer } from "./StringTokenizer";
import { CircuitXMLSerializer } from "./CircuitXMLSerializer";
import { CircuitXMLDeserializer } from "./CircuitXMLDeserializer";
import {
    gridFollowingCurrent, commercialPVPower,
    islandOutputResistance, islandReferenceVoltage
} from "./LabPVInverter";

type GridReference={voltageRms:number;frequency:number;phase:number};

export class PVInverterElm extends CurrentElm {
    power:number=3000;             // P solicitada; atributo XML heredado
    reactivePower:number=0;        // compatibilidad con pvQ heredado
    voltageRms:number=230;         // solo editable en aislada
    frequency:number=50;          // solo editable en aislada
    phaseDegrees:number=0;        // solo editable en aislada
    mode:"grid"|"island"="grid";
    powerEntry:"P"|"S"="P";
    operatingS:number=3000;
    powerFactor:number=1;
    reactiveSense:"inductivo"|"capacitivo"="inductivo";
    ratedApparent:number=5500;
    ratedActive:number=5000;
    advancedReactive:boolean=false;
    legacyReactive:boolean=false;

    constructor(x:number,y:number);
    constructor(x:number,y:number,x2:number,y2:number,f:number,st:StringTokenizer);
    constructor(x:number,y:number,x2?:number,y2?:number,f?:number,st?:StringTokenizer){
        if(x2===undefined)super(x,y);
        else {
            super(x,y,x2,y2!,f!,st!);
            if(st){
                this.power=Number(st.nextToken());
                this.reactivePower=Number(st.nextToken());
                this.voltageRms=Number(st.nextToken());
                this.frequency=Number(st.nextToken());
                this.phaseDegrees=Number(st.nextToken());
                this.operatingS=Math.hypot(this.power,this.reactivePower);
                this.ratedApparent=Math.max(5500,this.operatingS);
                this.ratedActive=Math.max(5000,Math.max(0,this.power));
                this.powerFactor=this.operatingS>0?
                    Math.abs(this.power)/this.operatingS:1;
                this.legacyReactive=this.reactivePower!==0;
            }
        }
    }
    getDumpType():number{return 1555;}
    getXmlDumpType():string{return "PVInverter";}
    getElmType():string{return "Inversor fotovoltaico FV";}

    private operation(){
        if(this.legacyReactive){
            const s=Math.hypot(this.power,this.reactivePower);
            const scale=s>this.ratedApparent?this.ratedApparent/s:1;
            return {p:this.power*scale,q:this.reactivePower*scale,s:s*scale,
                    limited:scale<1};
        }
        return commercialPVPower({
            entry:this.powerEntry,
            value:this.powerEntry==="P"?this.power:this.operatingS,
            cosPhi:this.powerFactor,sense:this.reactiveSense,
            ratedApparent:this.ratedApparent,
            ratedActive:this.ratedActive
        });
    }
    // Detecta el generador CA que comparte la referencia de neutro.
    // Cuando hay varias fases en la misma red, selecciona la fase de
    // la fuente físicamente más próxima a la salida del inversor.
    // NO es un PLL dinámico; solo fuentes senoidales VoltageElm.
    private gridReference():GridReference|null{
        const sim=SimulationManager.theSim;
        if(!sim||!this.nodes||this.nodes.length<2)return null;
        const output=this.getPost(1);
        const candidates=sim.elmList.filter((e:any)=>
            e instanceof VoltageElm &&
            e.waveform===VoltageElm.WF_AC &&
            e.frequency>0 && e.maxVoltage>0 &&
            e.nodes?.length>=2 &&
            (e.nodes[0]===this.nodes[0]||e.nodes[1]===this.nodes[0])
        ) as VoltageElm[];
        if(!candidates.length)return null;
        candidates.sort((a,b)=>{
            const rank=(source:VoltageElm)=>{
                const terminal=source.nodes[1]===this.nodes[0]?0:1;
                const post=source.getPost(1-terminal);
                return (post&&output?
                    Math.abs(post.y-output.y)*100+Math.abs(post.x-output.x):1e9);
            };
            return rank(a)-rank(b);
        });
        const source=candidates[0];
        const normal=source.nodes[1]===this.nodes[0];
        return {
            voltageRms:Math.abs(source.maxVoltage)/Math.SQRT2,
            frequency:source.frequency,
            phase:source.phaseShift-2*Math.PI*source.frequency*source.freqTimeZero+
                (normal?0:Math.PI)
        };
    }
    dumpXml(doc:Document,elem:Element):void{
        super.dumpXml(doc,elem);
        const op=this.operation();
        CircuitXMLSerializer.dumpAttr(elem,"pvP",this.mode==="grid"?op.p:this.power);
        CircuitXMLSerializer.dumpAttr(elem,"pvQ",this.mode==="grid"?op.q:0);
        CircuitXMLSerializer.dumpAttr(elem,"pvV",this.voltageRms);
        CircuitXMLSerializer.dumpAttr(elem,"pvF",this.frequency);
        CircuitXMLSerializer.dumpAttr(elem,"pvPhase",this.phaseDegrees);
        elem.setAttribute("pvMode",this.mode);
        elem.setAttribute("pvSet",this.powerEntry);
        CircuitXMLSerializer.dumpAttr(elem,"pvSnom",this.ratedApparent);
        CircuitXMLSerializer.dumpAttr(elem,"pvPnom",this.ratedActive);
        CircuitXMLSerializer.dumpAttr(elem,"pvSvalue",this.operatingS);
        elem.setAttribute("pvSense",this.reactiveSense);
        if(this.advancedReactive)elem.setAttribute("pvQmode","advanced");
        // Los XML antiguos con Q libre se siguen leyendo correctamente.
        if(!this.legacyReactive)
            CircuitXMLSerializer.dumpAttr(elem,"pvCos",this.powerFactor);
    }
    undumpXml(xml:CircuitXMLDeserializer):void{
        super.undumpXml(xml);
        this.power=xml.parseDoubleAttr("pvP",this.power);
        this.reactivePower=xml.parseDoubleAttr("pvQ",this.reactivePower);
        this.voltageRms=xml.parseDoubleAttr("pvV",this.voltageRms);
        this.frequency=xml.parseDoubleAttr("pvF",this.frequency);
        this.phaseDegrees=xml.parseDoubleAttr("pvPhase",this.phaseDegrees);
        const a=xml.currentXmlElement;
        this.mode=a.getAttribute("pvMode")==="island"?"island":"grid";
        this.powerEntry=a.getAttribute("pvSet")==="S"?"S":"P";
        this.operatingS=xml.parseDoubleAttr("pvSvalue",
            Math.hypot(this.power,this.reactivePower));
        this.ratedApparent=xml.parseDoubleAttr("pvSnom",
            Math.max(5500,Math.hypot(this.power,this.reactivePower)));
        this.ratedActive=xml.parseDoubleAttr("pvPnom",
            Math.max(5000,Math.max(this.power,0)));
        this.reactiveSense=a.getAttribute("pvSense")==="capacitivo"||
            (this.reactivePower<0&&a.getAttribute("pvSense")==null)
            ?"capacitivo":"inductivo";
        const pf=a.getAttribute("pvCos");
        this.legacyReactive=pf==null&&this.reactivePower!==0;
        this.advancedReactive=a.getAttribute("pvQmode")==="advanced";
        this.powerFactor=pf==null?
            (this.operatingS>0?Math.abs(this.power)/this.operatingS:1):
            xml.parseDoubleAttr("pvCos",1);
        if(!Number.isFinite(this.powerFactor)||this.powerFactor<=0||
           this.powerFactor>1)this.powerFactor=this.legacyReactive?0:1;
    }
    // No heredar la comprobación de trayectoria de CurrentElm: en aislada
    // se permiten cargas desconectadas (tensión en vacío sin intensidad).
    validate():boolean{return true;}
    stamp():void{
        const sim=SimulationManager.theSim;
        if(this.mode==="island"){
            sim.stampResistor(this.nodes[0],this.nodes[1],
                islandOutputResistance(this));
        }else{
            sim.stampNonLinear(this.nodes[0]);
            sim.stampNonLinear(this.nodes[1]);
        }
    }
    doStep():void{
        const sim=SimulationManager.theSim;
        if(this.mode==="island"){
            const ref=islandReferenceVoltage(this,sim.t);
            const resistance=islandOutputResistance(this);
            // Fuente de Norton: tensión entre nodo 1 y nodo 0 = -ref.
            sim.stampCurrentSource(this.nodes[0],this.nodes[1],ref/resistance);
            this.current=(ref-this.getVoltageDiff())/resistance;
            return;
        }
        const ref=this.gridReference();
        if(!ref){this.current=0;return;}
        const op=this.operation();
        this.current=gridFollowingCurrent({
            voltageRms:ref.voltageRms,frequency:ref.frequency,
            power:op.p,reactivePower:op.q,phase:ref.phase,time:sim.t
        });
        sim.stampCurrentSource(this.nodes[0],this.nodes[1],-this.current);
    }
    private option(label:string,items:string[],selected:number):EditInfo{
        const e=new EditInfo(label,selected,-1,-1);
        e.choice=new Choice();
        items.forEach(item=>e.choice!.add(item));
        e.choice.select(selected);
        return e;
    }
    getEditInfo(n:number):EditInfo|null{
        if(n===0)return this.option("Tipo de inversor",
            ["Conexión a red (U/f automáticas)","Fotovoltaica aislada"],this.mode==="grid"?0:1);
        if(this.mode==="island"){
            if(n===1)return new EditInfo("Potencia activa nominal Pn (W)",
                this.ratedActive,0,0);
            if(n===2)return new EditInfo("Potencia aparente máxima Smax (VA)",
                this.ratedApparent,0,0);
            if(n===3)return new EditInfo("Tensión de salida U RMS (V, fase-N)",
                this.voltageRms,0,0);
            if(n===4)return new EditInfo("Frecuencia de salida (Hz)",this.frequency,0,0);
            return null;
        }
        // Apartado principal: campos que aparecen en fichas técnicas comerciales.
        if(n===1)return new EditInfo("Potencia activa nominal Pn (W)",
            this.ratedActive,0,0);
        if(n===2)return new EditInfo("Potencia aparente máxima Smax (VA)",
            this.ratedApparent,0,0);
        if(n===3)return new EditInfo("Potencia FV activa actual P (W)",
            this.power,0,0);
        if(n===4)return EditInfo.createCheckbox(
            "Regulación avanzada de cos φ (por defecto 1)",
            this.advancedReactive);
        if(!this.advancedReactive)return null;
        if(n===5)return new EditInfo("cos φ de consigna",this.powerFactor,
            0.8,1).setDimensionless();
        if(n===6)return this.option("Sentido de potencia reactiva",
            ["Inductivo","Capacitivo"],this.reactiveSense==="inductivo"?0:1);
        return null;
    }
    setEditValue(n:number,ei:EditInfo):void{
        if(n===0&&ei.choice){
            const next=ei.choice.getSelectedIndex()===1?"island":"grid";
            if(next!==this.mode){
                this.mode=next;
                this.legacyReactive=false;
                ei.newDialog=true;
            }
            return;
        }
        if(this.mode==="island"){
            if(n===1&&Number.isFinite(ei.value)&&ei.value>0)
                this.ratedActive=ei.value;
            if(n===2&&Number.isFinite(ei.value)&&ei.value>0)
                this.ratedApparent=ei.value;
            if(n===3&&Number.isFinite(ei.value)&&ei.value>0)
                this.voltageRms=ei.value;
            if(n===4&&Number.isFinite(ei.value)&&ei.value>0)
                this.frequency=ei.value;
            return;
        }
        if(n===1&&Number.isFinite(ei.value)&&ei.value>0)
            this.ratedActive=ei.value;
        if(n===2&&Number.isFinite(ei.value)&&ei.value>0)
            this.ratedApparent=ei.value;
        if(n===3&&Number.isFinite(ei.value)&&ei.value>=0){
            this.power=ei.value;
            this.powerEntry="P";
            if(!this.advancedReactive)this.legacyReactive=false;
        }
        if(n===4&&ei.checkbox){
            this.advancedReactive=ei.checkbox.getState();
            if(!this.advancedReactive){
                this.powerFactor=1;
                this.reactivePower=0;
                this.legacyReactive=false;
            }else if(this.legacyReactive){
                this.powerFactor=this.operatingS>0?
                    Math.min(1,Math.max(.8,
                        Math.abs(this.power)/this.operatingS)):1;
                this.legacyReactive=false;
            }
            ei.newDialog=true;
        }
        if(n===5&&this.advancedReactive&&Number.isFinite(ei.value)&&
           ei.value>=0.8&&ei.value<=1)
            this.powerFactor=ei.value;
        if(n===6&&this.advancedReactive&&ei.choice)
            this.reactiveSense=ei.choice.getSelectedIndex()===1?
                "capacitivo":"inductivo";
    }
    getInfo(arr:string[]):void{
        arr[0]=this.mode==="grid"?"Inversor FV conectado a red":
            "Inversor FV aislado (fuente de tensión)";
        this.getBasicInfo(arr);
        if(this.mode==="island"){
            arr[3]="S nominal = "+CircuitElm.getUnitText(this.ratedApparent,"VA");
            arr[4]="U salida = "+CircuitElm.getUnitText(this.voltageRms,"V")+" RMS";
            arr[5]="f salida = "+CircuitElm.getUnitText(this.frequency,"Hz");
            arr[6]="P y cos φ resultan de las cargas; no se imponen";
            return;
        }
        const op=this.operation(),ref=this.gridReference();
        arr[3]="P inyectada = "+CircuitElm.getUnitText(op.p,"W");
        arr[4]="S actual = "+CircuitElm.getUnitText(op.s,"VA")+
            "; cos φ = "+(this.legacyReactive?
                (op.s>0?Math.abs(op.p)/op.s:1):this.powerFactor).toFixed(3);
        arr[5]="Q resultante = "+CircuitElm.getUnitText(op.q,"VAr");
        arr[6]=ref?"Red: "+CircuitElm.getUnitText(ref.voltageRms,"V")+
            " RMS; "+CircuitElm.getUnitText(ref.frequency,"Hz"):
            "Red CA no detectada: inyección desactivada";
        if(op.limited)arr[7]="Limitada por P nominal o S máxima";
    }
}
