# Autoconsumo fotovoltaico: referencia normativa y pruebas (España, 07/11/2026)

Documento para los casos de ensayo del Laboratorio de Electrotecnia. **No sustituye al proyecto eléctrico, a la documentación de legalización, al certificado de conformidad de un antivertido ni a una interpretación de la administración competente.** Diferenciar siempre normativa **vigente**, guías de **orientación** y textos **en proyecto**.

## 1. Normativa vigente: modalidades, medida y conexión

- **Ley 24/2013, art. 9**: autoconsumo individual/colectivo; sin excedentes o con excedentes. [BOE](https://www.boe.es/buscar/act.php?id=BOE-A-2013-13645)
- **RD 244/2019**, consolidado a **21/03/2026**, arts. 3 a 5 y 10 a 15: sin excedentes requiere sistema antivertido; con excedentes puede estar acogido a compensación simplificada o no; la compensación simplificada tiene como requisito, entre otros, potencia **total de generación asociada <=100 kW**. No confundirla con venta de energía. En el art. 14, el descuento económico de excedentes **no supera el valor de la energía consumida de red** durante el periodo (máximo mensual) y no elimina los demás conceptos de factura. [BOE](https://www.boe.es/eli/es/rd/2019/04/05/244/con/20260321)
- **Autoconsumo colectivo**: acuerdo de reparto, cálculo por saldos **horarios** y medida de generación cuando corresponde; no se puede extrapolar un balance instantáneo único a varios consumidores sin aplicar el anexo I del RD 244/2019. El art. 14.2 contempla la participación en el mecanismo simplificado de autoconsumo **colectivo sin excedentes**, caso que exige separar el balance físico global de los repartos individualizados.
- **Proximidad**: art. 3.g RD 244/2019 vigente. Incluye redes de BT del mismo CT, proximidad general inferior a 500 m y, en el supuesto específico de FV/eólica hasta 5 MW conectada a través de redes, inferior a **5.000 m**, entre otras condiciones. **No usar versiones antiguas de 2 km como regla general de 2026.**
- **Potencia instalada fotovoltaica en RD 244/2019**, art. 3.h: suma de potencias máximas de inversores; distinguir de la potencia de módulos utilizada por la terminología de CTE HE 5.
- **RD 1183/2020, art. 17**, consolidado: exención de permisos de acceso/conexión para **sin excedentes**, y para **con excedentes hasta 15 kW inclusive** en suelo urbanizado que reúna las dotaciones exigidas. Exención de permisos no significa exención del REBT ni de la documentación y puesta en servicio. [BOE](https://www.boe.es/buscar/act.php?id=BOE-A-2020-17278)
- **RD 1699/2011**, art. 12.2 en su redacción modificada: generación con potencia nominal **superior a 15 kW** a red de distribución, conexión trifásica con desequilibrio inferior a 5 kW; para autoconsumo con generador en red interior y **consumo trifásico**, también generación trifásica. Comprobar la aplicabilidad al caso concreto. [BOE RD244, disposición final cuarta](https://www.boe.es/eli/es/rd/2019/04/05/244/con/20260321)
- **RD 1110/2007**: reglamento unificado de puntos de medida; aplicado por RD 244/2019, arts. 10 y 11. Generalmente equipo bidireccional en punto frontera, con equipos adicionales en los supuestos normativos. [BOE](https://www.boe.es/buscar/act.php?id=BOE-A-2007-16478)
- **RD 413/2014**, RD 1955/2000 y normativa de producción/comercialización; **RD 88/2026** sobre suministro, comercialización y agregación. Para excedentes no acogidos a compensación deben tratarse los requisitos de productor, representación/venta, registros y liquidación según potencia y modalidad; el esquema del simulador no realiza esos trámites. [RD 88/2026](https://www.boe.es/eli/es/rd/2026/02/11/88)
- **RD 647/2020** y **Orden TED/749/2020**, con sus actualizaciones, y marco UE de conexión de generadores (Reglamento (UE) 2016/631). Aplicar conforme a tipo de generador y condiciones de conexión; no afirmar que una fuente de corriente sinusoidal simplificada cumple antiisla, servicios de red o certificación. [RD 647/2020](https://www.boe.es/buscar/act.php?id=BOE-A-2020-7439), [TED/749/2020](https://www.boe.es/eli/es/o/2020/07/16/ted749/con)

## 2. Seguridad eléctrica, CTE y guías de aplicación

- **REBT, RD 842/2002**: en particular ITC-BT-40 (generación), -04 (documentación y puesta en servicio), -05 (verificación), -18 (tierras), -22/-23/-24 (protecciones), -47/-48 (receptores, motores y condensadores), -28 cuando proceda (pública concurrencia), y -52 cuando existan puntos de recarga. La aplicabilidad de cada ITC depende del tipo y uso de instalación. [REBT consolidado](https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099)
- **ITC-BT-40, anexo I**, introducido por RD 244/2019: los sistemas sin excedentes deben evitar la inyección mediante regulación/corte conforme a la tecnología; se prevén ensayos de tolerancia, variación de carga y funcionamiento seguro. En la configuración de medida de intercambio, los incumplimientos deben corregirse en **menos de 2 segundos**, según su apartado I.2.1. El control estático `pvP=min(producción disponible, carga)` **no constituye ensayo de conformidad**, no modela transitorios, fallos de comunicación, tiempos de respuesta ni instrumentación. [Anexo I](https://www.boe.es/eli/es/rd/2019/04/05/244/con/20260321)
- **Guía-BT-40, edición septiembre de 2013, rev. 1**: documento técnico orientativo; no sustituye al REBT ni debe tratarse como versión consolidada posterior al RD 244/2019. [Guía oficial](https://industria.gob.es/Calidad-Industrial/seguridadindustrial/instalacionesindustriales/baja-tension/Documents/bt/Guia_bt_40_sep13R1.pdf)
- **CTE DB-HE 5**: nueva construcción >1.000 m², ampliaciones >1.000 m² y determinados edificios existentes que se reforman íntegramente o cambian de uso cuando superan 1.000 m², conforme a su ámbito y excepciones. Potencia mínima `min(Fpr,el*S, 0,1*(0,5*Sc-Soc))`; `Fpr,el=0,005 kW/m²` para residencial privado y `0,010 kW/m²` para los demás usos. La obligación HE 5 **no convierte por sí sola** a una instalación en una modalidad concreta de autoconsumo. [DB-HE oficial](https://www.codigotecnico.org/pdf/Documentos/HE/DBHE.pdf)
- **CTE HE 0/HE 1/HE 6**, según alcance: eficiencia del edificio, envolvente y dotación de recarga; no usarlas para deducir una potencia FV única en edificios fuera del ámbito de HE 5.

## 3. Comunidad Valenciana

Para instalaciones de baja tensión de autoconsumo, revisar los trámites telemáticos de la GVA: **hasta 10 kW inclusive** y **superiores a 10 kW**; estas fronteras de tramitación autonómica no son los umbrales de compensación simplificada ni de exención de acceso. Revisar en cada caso MTD/proyecto, certificado de empresa instaladora habilitada, configuración de medida, conformidad antivertido para sin excedentes, inspección cuando proceda, inscripción y comunicación a distribuidora. Declarar expresamente **con excedentes acogido a compensación** si se desea esa opción, pues «con excedentes» por sí solo no la elige.
- [GVA <=10 kW](https://sede.gva.es/es/detall-tramit?id_proc=21116)
- [GVA >10 kW](https://sede.gva.es/es/detall-tramit?id_proc=21117)
- [Decreto-ley 14/2020 CV, texto consolidado](https://www.boe.es/buscar/act.php?id=DOGV-r-2020-90356)

## 4. Propuestas y borradores, sin fuerza obligatoria mientras no se publiquen

El Ministerio de Industria ha tramitado un **proyecto de modificación del REBT y de sus ITC** que incorpora la propuesta de **ITC-BT-53**, para instalaciones de sistemas de corriente continua; afecta, entre otras, a ITC-BT-40 y también al Reglamento de alta tensión (ITC-RAT-09). El expediente figura como **consulta cerrada**. No se debe aplicar el borrador como reglamento vigente ni sustituir las guías existentes por textos proyectados. Verificar BOE, entrada en vigor y disposiciones transitorias si finalmente se aprueba.
- [Expediente oficial del proyecto](https://industria.gob.es/es-es/participacion_publica/Paginas/DetalleParticipacionPublica.aspx?k=615)
- [Versión de audiencia anterior](https://industria.gob.es/es-es/participacion_publica/Paginas/DetalleParticipacionPublica.aspx?k=546)
- [Plan anual normativo del Gobierno, 2026](https://www.lamoncloa.gob.es/consejodeministros/resumenes/Documents/2026/050526-plan-anual-normativo-2026.pdf)

No confundir propuestas legislativas (incluidos posibles umbrales de potencia revisados en documentos parlamentarios) con disposiciones ya publicadas y vigentes.

## 5. Traducción al modelo de pruebas

Los archivos `tests/lab-pv-commercial-installations.test.mjs` y `tests/lab-pv-sector-autoconsumption.test.mjs` cubren ejemplos de vivienda, comercio, terciario e industria con tensiones 230/400 V, inversores con capacidad de potencia aparente limitada, escalones de condensadores, importación, vertido y bloqueo ideal de exportación. Se verifican `P_red=P_carga-P_FV`, `Q_red=Q_carga-Q_FV-Qc` y `I_red=|S_red|/U` monofásica o `|S_red|/(√3 U_LL)` trifásica equilibrada. En el simulador debe mantenerse separado:
1. **Física instantánea** en el punto frontera (P/Q, corriente y su signo).
2. **Energía horaria y facturación**, distinta del intercambio instantáneo.
3. **Modalidad administrativa** (sin excedentes, con compensación o sin ella).
4. **Conformidad del antivertido y conexión** (protecciones, antiisla, tiempos, ensayos y permisos), que este modelo por sí solo **no certifica**.

También quedan fuera del modelo de balance ideal los armónicos y la THD de cargas reales, las resonancias de baterías sin reactancias de rechazo, el desequilibrio de fases, los transitorios de desconexión, la coordinación de protecciones y las limitaciones del operador de red. Se deben probar específicamente en CircuitJS o mediante ensayos del equipo real.
