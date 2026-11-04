// Impedancia pasiva exclusiva de corriente alterna.
// Un único símbolo Z encapsula una serie R-L-C real de CircuitJS.
// |Z|/ángulo y R/X se especifican a la frecuencia de referencia f0;
// R/L/C mantiene los componentes físicos cuando cambia la frecuencia.
// El elemento local tiene XML <Impedance>; para CircuitJS externo es
// necesario descomponerlo en r/l/c, porque el tipo Z no existe upstream.
import { CircuitElm } from "./CircuitElm";
import { CompositeElm } from "./CompositeElm";
import { ResistorElm } from "./ResistorElm";
import { InductorElm } from "./InductorElm";
import { CapacitorElm } from "./CapacitorElm";
import { VoltageElm } from "./VoltageElm";
import { CurrentElm } from "./CurrentElm";
import { CircuitXMLSerializer } from "./CircuitXMLSerializer";
import { CircuitXMLDeserializer } from "./CircuitXMLDeserializer";
import { EditInfo } from "./EditInfo";
import { Choice } from "./Choice";
import { Font } from "./Font";
import { Graphics } from "./Graphics";
import { Point } from "./Point";
import { StringTokenizer } from "./StringTokenizer";
import type { RLCValues } from "./LabImpedance";
import { atFrequency, fromPolar, fromRectangular, validateFrequency, validateRLC } from "./LabImpedance";

export class ImpedanceElm extends CompositeElm {
    // 0 polar, 1 rectangular, 2 R/L/C; todos referidos a CA.
    entryMode:number = 0;
    referenceFrequency:number = 50;
    resistance:number = 10;
    inductance:number = 0;
    capacitance:number = 0;
    private ignoreOldDialog:boolean = false;

    constructor(xx:number, yy:number);
    constructor(xa:number, ya:number, xb:number, yb:number, f:number, st:StringTokenizer);
    constructor(xa:number, ya:number, xb?:number, yb?:number, f?:number, st?:StringTokenizer) {
        if (xb === undefined) super(xa,ya);
        else super(xa,ya,xb,yb!,f!);
        this.noDiagonal=true;
        // Un nuevo elemento arranca como resistencia de 10 Ω a 50 Hz,
        // siempre dentro del editor de impedancia para CA.
        if (st !== undefined) {
            this.entryMode=Math.max(0,Math.min(2,Number(st.nextToken())));
            this.referenceFrequency=Number(st.nextToken());
            this.resistance=Number(st.nextToken());
            this.inductance=Number(st.nextToken());
            this.capacitance=Number(st.nextToken());
        }
        this.rebuild();
    }

    getDumpType():number { return 1553; }
    getXmlDumpType():string { return "Impedance"; }
    getElmType():string { return "Impedancia Z (solo CA)"; }

    private values():RLCValues {
        return {r:this.resistance,l:this.inductance,c:this.capacitance};
    }

    // CircuitJS calcula de verdad R, L y C en el dominio temporal.
    // No se estampa una impedancia compleja constante como resistencia.
    private rebuild():void {
        const values=this.values();
        validateRLC(values);
        validateFrequency(this.referenceFrequency);
        const children:string[]=[];
        if (values.r>0) children.push("ResistorElm");
        if (values.l>0) children.push("InductorElm");
        if (values.c>0) children.push("CapacitorElm");
        const model=children.map((type,n)=>
            type+" "+(n===0?1:n+2)+" "+(n===children.length-1?2:n+3)).join("\r");
        this.loadComposite(null,model,[1,2]);
        for(const ce of this.compElmList) {
            if(ce instanceof ResistorElm) ce.resistance=values.r;
            if(ce instanceof InductorElm) {
                ce.inductance=values.l;
                ce.seriesResistance=0;
                ce.saturationCurrent=0;
                ce.ind.setup(ce.inductance,ce.current,ce.flags,0);
            }
            if(ce instanceof CapacitorElm) {
                ce.capacitance=values.c;
                ce.seriesResistance=0;
            }
        }
        this.setPoints();
    }

    setPoints():void {
        super.setPoints();
        this.calcLeads(36);
        if(this.posts?.length===2) {
            this.setPost(0,this.point1);
            this.setPost(1,this.point2);
        }
    }

    draw(g:Graphics):void {
        this.setBbox(this.point1,this.point2,18);
        this.draw2Leads(g);
        this.setPowerColor(g,false);
        g.save();
        const cx=(this.point1.x+this.point2.x)/2;
        const cy=(this.point1.y+this.point2.y)/2;
        g.context.translate(cx,cy);
        g.context.rotate(Math.atan2(this.dy,this.dx));
        g.context.strokeRect(-18,-13,36,26);
        g.setFont(new Font("SansSerif",0,16));
        g.context.textBaseline="middle";
        g.context.textAlign="center";
        g.drawString("Z",0,0);
        g.restore();
        this.doDots(g);
        this.drawPosts(g);
        if(this.showValues()) {
            const z=atFrequency(this.values(),this.referenceFrequency);
            this.drawValues(g,CircuitElm.getShortUnitText(z.modulus,"Ω"),16);
        }
    }

    getCurrent():number {
        return this.compElmList[0]?.getCurrent() ?? 0;
    }

    getConnection(n1:number,n2:number):boolean {
        return n1!==n2 && n1<2 && n2<2;
    }

    // El análisis exclusivo de punto de trabajo de CC no admite este elemento.
    // En simulación temporal, el comportamiento de L/C ante transitorios
    // sigue siendo físico; no se falsean los cálculos en presencia de armónicos.
    preStamp():void {
        if (this.doDcAnalysis()) {
            CircuitElm.sim.stop("La impedancia Z solo está disponible en CA",this);
            return;
        }
        // Se rechazan circuitos excitados exclusivamente con fuentes de CC,
        // pero se permite añadir el elemento antes de colocar la fuente CA.
        // Si coexisten CA y CC, se respeta la simulación temporal de R/L/C.
        const others=CircuitElm.sim.elmList;
        const allVoltage=others.filter(e=>e instanceof VoltageElm) as VoltageElm[];
        const hasAC=allVoltage.some(e=>
            e.waveform !== VoltageElm.WF_DC &&
            e.waveform !== VoltageElm.WF_VAR &&
            e.frequency > 0);
        const hasDCSource=allVoltage.length>0 ||
            others.some(e=>e instanceof CurrentElm);
        if (hasDCSource && !hasAC) {
            CircuitElm.sim.stop("Impedancia Z: se requiere una fuente de CA (no admite circuito solo CC)",this);
            return;
        }
        super.preStamp();
    }

    dumpXml(doc:Document,elem:Element):void {
        super.dumpXml(doc,elem);
        CircuitXMLSerializer.dumpAttr(elem,"mode",this.entryMode);
        CircuitXMLSerializer.dumpAttr(elem,"f0",this.referenceFrequency);
        CircuitXMLSerializer.dumpAttr(elem,"r",this.resistance);
        CircuitXMLSerializer.dumpAttr(elem,"l",this.inductance);
        CircuitXMLSerializer.dumpAttr(elem,"c",this.capacitance);
    }

    undumpXml(xml:CircuitXMLDeserializer):void {
        // Primero cargar los parámetros, reconstruir los componentes, después
        // recuperar su estado dinámico (corriente de L / tensión de C).
        const mode=xml.parseIntAttr("mode",this.entryMode);
        const f0=xml.parseDoubleAttr("f0",this.referenceFrequency);
        const r=xml.parseDoubleAttr("r",this.resistance);
        const l=xml.parseDoubleAttr("l",this.inductance);
        const c=xml.parseDoubleAttr("c",this.capacitance);
        validateFrequency(f0);
        validateRLC({r,l,c});
        if(!Number.isInteger(mode)||mode<0||mode>2)
            throw Error("Modo de impedancia de CA no válido");
        this.entryMode=mode;
        this.referenceFrequency=f0;
        this.resistance=r;
        this.inductance=l;
        this.capacitance=c;
        this.rebuild();
        super.undumpXml(xml);
    }

    getInfo(arr:string[]):void {
        const z=atFrequency(this.values(),this.referenceFrequency);
        arr[0]="impedancia Z (solo CA, serie RLC)";
        this.getBasicInfo(arr);
        arr[3]="|Z| = "+CircuitElm.getUnitText(z.modulus,"Ω");
        arr[4]="φ = "+CircuitElm.showFormat.format(z.argument)+"°";
        arr[5]="R = "+CircuitElm.getUnitText(z.r,"Ω");
        arr[6]="X = "+CircuitElm.getUnitText(z.x,"Ω");
        arr[7]="L = "+CircuitElm.getUnitText(this.inductance,"H");
        arr[8]="C = "+CircuitElm.getUnitText(this.capacitance,"F");
        arr[9]="f0 = "+CircuitElm.getUnitText(this.referenceFrequency,"Hz");
    }

    getScopeText(v:number):string {
        return "Z (CA, serie RLC)";
    }
    canViewInScope():boolean { return true; }

    getEditInfo(n:number):EditInfo | null {
        if(n===0) {
            this.ignoreOldDialog=false; // tras reconstruir el editor
            const ei=new EditInfo("Impedancia Z · solo CA · asociación serie",0,-1,-1);
            ei.choice=new Choice();
            ei.choice.add("Módulo |Z| y argumento φ");
            ei.choice.add("Resistencia R y reactancia X");
            ei.choice.add("Componentes físicos R, L y C");
            ei.choice.select(this.entryMode);
            ei.newDialog=true;
            return ei;
        }
        if(n===1) return new EditInfo("Frecuencia de referencia CA (Hz)",this.referenceFrequency,0,0);
        const z=atFrequency(this.values(),this.referenceFrequency);
        if(this.entryMode===0) {
            if(n===2)return new EditInfo("Módulo |Z| (Ω)",z.modulus,0,0);
            if(n===3)return new EditInfo("Argumento φ (°)",z.argument,-90,90);
        }
        if(this.entryMode===1) {
            if(n===2)return new EditInfo("Resistencia R (Ω)",this.resistance,0,0);
            if(n===3)return new EditInfo("Reactancia X (Ω), +L / -C",z.x,-1e12,1e12);
        }
        if(this.entryMode===2) {
            if(n===2)return new EditInfo("Resistencia R (Ω)",this.resistance,0,0);
            if(n===3)return new EditInfo("Inductancia L (H), 0 = omitir",this.inductance,0,0);
            if(n===4)return new EditInfo("Capacidad C (F), 0 = omitir",this.capacitance,0,0);
        }
        return null;
    }

    setEditValue(n:number,ei:EditInfo):void {
        if(n===0) {
            const next=ei.choice!.getSelectedIndex();
            if(next!==this.entryMode) {
                this.entryMode=next;
                this.ignoreOldDialog=true;
            }
            return;
        }
        if(this.ignoreOldDialog) return;
        try {
            if(n===1) {
                validateFrequency(ei.value);
                const x=atFrequency(this.values(),this.referenceFrequency).x;
                if(this.entryMode!==2) {
                    const v=fromRectangular(this.resistance,x,ei.value);
                    this.resistance=v.r;
                    this.inductance=v.l;
                    this.capacitance=v.c;
                    this.rebuild();
                }
                this.referenceFrequency=ei.value;
                return;
            }
            if(this.entryMode===0 && (n===2 || n===3)) {
                const z=atFrequency(this.values(),this.referenceFrequency);
                const magnitude=n===2?ei.value:z.modulus;
                const angle=n===3?ei.value:z.argument;
                const v=fromPolar(magnitude,angle,this.referenceFrequency);
                this.resistance=v.r;
                this.inductance=v.l;
                this.capacitance=v.c;
                this.rebuild();
            } else if(this.entryMode===1 && (n===2 || n===3)) {
                const z=atFrequency(this.values(),this.referenceFrequency);
                const v=fromRectangular(n===2?ei.value:this.resistance,
                    n===3?ei.value:z.x,this.referenceFrequency);
                this.resistance=v.r;
                this.inductance=v.l;
                this.capacitance=v.c;
                this.rebuild();
            } else if(this.entryMode===2 && n>=2 && n<=4) {
                const v={r:n===2?ei.value:this.resistance,
                    l:n===3?ei.value:this.inductance,
                    c:n===4?ei.value:this.capacitance};
                validateRLC(v);
                this.resistance=v.r;
                this.inductance=v.l;
                this.capacitance=v.c;
                this.rebuild();
            }
        } catch(error) {
            ei.setError(error instanceof Error?error.message:String(error));
        }
    }
}
