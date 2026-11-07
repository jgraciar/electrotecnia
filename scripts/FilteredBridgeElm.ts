// Puente rectificador monofásico de seis componentes reales de CircuitJS.
// Bornes 1-2: entrada CA. Nodos 3-4: bus CC interno.
// Diodos 1->3, 2->3, 4->1, 4->2; condensador y R entre 3 y 4.
import { CircuitElm } from "./CircuitElm";
import { CompositeElm } from "./CompositeElm";
import { DiodeElm } from "./DiodeElm";
import { CapacitorElm } from "./CapacitorElm";
import { ResistorElm } from "./ResistorElm";
import { EditInfo } from "./EditInfo";
import { Graphics } from "./Graphics";
import { Font } from "./Font";
import { Locale } from "./Locale";
import { StringTokenizer } from "./StringTokenizer";
import { CircuitXMLSerializer } from "./CircuitXMLSerializer";
import { CircuitXMLDeserializer } from "./CircuitXMLDeserializer";

export class FilteredBridgeElm extends CompositeElm {
    resistance:number=200;
    capacitance:number=0.002;
    constructor(xx:number,yy:number);
    constructor(xa:number,ya:number,xb:number,yb:number,f:number,st:StringTokenizer);
    constructor(xa:number,ya:number,xb?:number,yb?:number,f?:number,st?:StringTokenizer){
        if(xb===undefined)super(xa,ya);
        else super(xa,ya,xb,yb!,f!);
        this.noDiagonal=false;
        if(st){
            this.resistance=Number(st.nextToken());
            this.capacitance=Number(st.nextToken());
        }
        this.rebuild();
    }
    getDumpType():number{return 1554;}
    getXmlDumpType():string{return "FilteredBridge";}
    getElmType():string{return Locale.LS("Carga no lineal: puente con filtro C");}
    private rebuild():void {
        if(!Number.isFinite(this.resistance)||this.resistance<=0||
            !Number.isFinite(this.capacitance)||this.capacitance<=0)
            throw Error("R y C deben ser positivas y finitas");
        this.loadComposite(null,[
            "DiodeElm 1 3","DiodeElm 2 3",
            "DiodeElm 4 1","DiodeElm 4 2",
            "CapacitorElm 3 4","ResistorElm 3 4"
        ].join("\r"),[1,2]);
        for(const elm of this.compElmList){
            if(elm instanceof ResistorElm)elm.resistance=this.resistance;
            if(elm instanceof CapacitorElm){
                elm.capacitance=this.capacitance;
                elm.seriesResistance=0;
            }
        }
        this.setPoints();
    }
    setPoints():void{
        super.setPoints();
        this.calcLeads(40);
        if(this.posts?.length===2){
            this.setPost(0,this.point1);
            this.setPost(1,this.point2);
        }
    }
    draw(g:Graphics):void{
        this.setBbox(this.point1,this.point2,12);
        this.draw2Leads(g);
        this.setPowerColor(g,false);
        g.save();
        g.context.translate((this.point1.x+this.point2.x)/2,(this.point1.y+this.point2.y)/2);
        g.context.rotate(Math.atan2(this.dy,this.dx));
        g.context.lineWidth=2;
        g.context.strokeRect(-20,-11,40,22);
        g.setFont(new Font("SansSerif",0,11));
        g.context.textAlign="center";
        g.context.textBaseline="middle";
        g.drawString("D+C",0,0);
        g.restore();
        this.current=this.getCurrent();
        this.updateDotCount();
        this.drawDots(g,this.point1,this.point2,this.curcount);
        this.drawPosts(g);
    }
    getCurrent():number{
        // Corriente del borne 1: diodo 1->3 menos diodo 4->1.
        return (this.compElmList[0]?.getCurrent()??0)-
            (this.compElmList[2]?.getCurrent()??0);
    }
    updateDotCount():void{
        this.curcount=this.updateDotCountImpl(this.getCurrent(),this.curcount);
    }
    getConnection(a:number,b:number):boolean{return a!==b&&a<2&&b<2;}
    dumpXml(doc:Document,elem:Element):void{
        super.dumpXml(doc,elem);
        CircuitXMLSerializer.dumpAttr(elem,"r",this.resistance);
        CircuitXMLSerializer.dumpAttr(elem,"c",this.capacitance);
    }
    undumpXml(xml:CircuitXMLDeserializer):void{
        this.resistance=xml.parseDoubleAttr("r",this.resistance);
        this.capacitance=xml.parseDoubleAttr("c",this.capacitance);
        this.rebuild();
        super.undumpXml(xml);
    }
    getInfo(arr:string[]):void{
        arr[0]=Locale.LS("Puente rectificador monofásico con filtro capacitivo");
        this.getBasicInfo(arr);
        arr[3]="R = "+CircuitElm.getUnitText(this.resistance,"Ω");
        arr[4]="C = "+CircuitElm.getUnitText(this.capacitance,"F");
    }
    getEditInfo(n:number):EditInfo|null{
        if(n===0)return new EditInfo(Locale.LS("Resistencia de carga R (Ω)"),this.resistance,0,0);
        if(n===1)return new EditInfo(Locale.LS("Condensador de filtrado C (F)"),this.capacitance,0,0);
        return null;
    }
    setEditValue(n:number,ei:EditInfo):void{
        if((n===0||n===1)&&Number.isFinite(ei.value)&&ei.value>0){
            if(n===0)this.resistance=ei.value;
            else this.capacitance=ei.value;
            this.rebuild();
        }
    }
}
