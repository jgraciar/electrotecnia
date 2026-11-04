# Laboratorio virtual de Electrotecnia y Electrónica

Aplicación web docente para FP. Combina un generador de funciones, un osciloscopio virtual, cálculo de redes trifásicas equilibradas y el simulador CircuitJS.

**Web publicada desde el repositorio:** https://jgraciar.github.io/electrotecnia/

**Versión 1.0 (desarrollo)**. Las funciones ya añadidas a la rama main pueden tardar unos minutos en aparecer en la web.

## Funciones implementadas

- Generador de señales senoidales, cuadradas, triangulares, diente de sierra y pulsos, con frecuencia, amplitud, offset, desfase y ciclo de trabajo ajustables.
- Visualización de CH1 y CH2; cursores verticales desplazables para medir Δt, 1/Δt y diferencia de nivel en el primer canal.
- Exportación CSV de las muestras representadas con tiempo en segundos.
- Espectro de los 15 primeros armónicos y THD aproximada respecto a la fundamental de la ventana, para las ondas virtuales periódicas.
- Simulador matemático de red trifásica senoidal equilibrada en estrella, secuencia ABC/ACB, tensiones simples y compuestas y corrientes por fase.
- Carga RLC serie, equilibrada y en régimen sinusoidal permanente; cálculo de impedancia, desfase, U, I, P, Q, S y factor de potencia.
- Pestaña CircuitJS y un puente JavaScript para consultar la tensión y la corriente de un elemento de dos terminales **cuando CircuitJS está alojado en el mismo origen**.

## Banco inicial de prácticas guiadas

La pestaña **Prácticas guiadas** incluye seis propuestas iniciales basadas en archivos de circuito existentes y comprobados del catálogo oficial de CircuitJS:

| Código | Módulo | Práctica | Circuito CircuitJS |
|---|---|---|---|
| E01 | Electrotecnia 0234 | Ley de Ohm, resistencias en paralelo | ohms.txt |
| E02 | Electrotecnia 0234 | Divisor resistivo de tensión | voltdivide.txt |
| E03 | Electrotecnia 0234 | Circuito RC serie en CA | capac.txt |
| E04 | Electrotecnia 0234 | Sistema trifásico equilibrado en estrella | 3phasewye.txt |
| N01 | Electrónica 0233 | Rectificador de onda completa | fullrect.txt |
| N02 | Electrónica 0233 | Puerta XOR y tabla de verdad | xor.txt |

Cada práctica incorpora: objetivos, enunciado, procedimientos, preguntas numéricas, autocorrección con margen de tolerancia, explicación matemática accesible bajo demanda y exportación de un informe TXT sin enviar datos del alumno a ningún servidor.

La autocorrección se refiere a **los valores iniciales del circuito**. Si el alumno modifica componentes o generadores, debe restaurar el circuito original antes de usarla. Es una herramienta de autoevaluación, no una evaluación oficial del módulo. Los RA/CE se incorporarán una vez contrastados con la programación docente.

El botón **Cargar montaje en CircuitJS** utiliza el parámetro documentado startCircuit y la copia de CircuitJS alojada en el mismo dominio; se reinicia la simulación y la adquisición virtual. No precisa hardware físico.

## Módulo de Grado Superior: Sistemas y Circuitos Eléctricos (0520)

La versión 0.4 incorpora un selector de módulo en **Prácticas guiadas** que separa:

- **Electrotecnia 0234**, Grado Medio.
- **Electrónica 0233**, Grado Medio.
- **Sistemas y Circuitos Eléctricos 0520**, Grado Superior de Sistemas Electrotécnicos y Automatizados (SEA).

Se incluyen seis prácticas nuevas de SCE; los RA y los CE asociados provienen del Real Decreto 1127/2010, anexo I, módulo 0520: https://www.boe.es/buscar/doc.php?id=BOE-A-2010-15355.

| Código | Práctica SCE | Circuito oficial CircuitJS | Vinculación orientativa |
|---|---|---|---|
| SCE01 | Carga RL en CA, impedancia y factor de potencia | inductac.txt | RA1: CE 1a, 1b, 1c |
| SCE02 | Resonancia RLC serie | lrc.txt | RA1: CE 1b, 1c |
| SCE03 | Estrella trifásica, potencia y neutro | 3phasewye.txt | RA1: CE 1c, 1d |
| SCE04 | Transformador monofásico como base para estudiar transformadores trifásicos | transformer.txt | RA3: CE 3a (introducción parcial) |
| SCE05 | Amplificador no inversor | amp-noninvert.txt | RA5: CE 5d, 5e, 5h |
| SCE06 | Circuito combinacional XOR | xor.txt | RA6: CE 6a, 6b, 6c, 6g, 6h |

Todas estas actividades incluyen objetivos, procedimiento, teoría de apoyo, preguntas numéricas con autocorrección y generación de un informe TXT. La autocorrección de respuestas numéricas emplea el **montaje original**, y su resultado no supone por sí solo la evaluación completa de un criterio de evaluación.

**Limitación didáctica específica:** la práctica SCE04 utiliza un transformador monofásico para introducir el comportamiento de los transformadores. No equivale a un ensayo trifásico, no comprueba el grupo vectorial y por tanto no acredita íntegramente el RA3. En SCE02 se diferencia el régimen transitorio del cálculo fasorial de resonancia. La simulación no acredita, por sí misma, las operaciones de medida sobre equipos reales que requieren normativa de seguridad.

## Consulta visible de resultados de aprendizaje (RA) y criterios de evaluación (CE)

**Versión 0.5:** abre **Prácticas guiadas**, selecciona un módulo y después una práctica. Justo debajo del enunciado aparece el apartado **«Resultados de aprendizaje y criterios de evaluación vinculados»**, con el número y la redacción del RA, una lista de CE identificados individualmente (por ejemplo, **CE 1b**, **CE 1c**), una descripción legible de cada criterio y el enlace directo al real decreto en el BOE. Las fichas de los **tres módulos** incluyen esa información.

La correspondencia es **parcial**: no se presupone que una simulación certifique la totalidad de un CE ni los ensayos/medidas reales requeridos en el taller. El informe TXT incorpora también el RA, los CE y su normativa de referencia. Las descripciones de los CE están adaptadas para lectura didáctica; el texto jurídico íntegro se consulta en el BOE.

## Publicaciones y actividades del libro de texto

La versión 0.9 completa el **catálogo de referencias numeradas de las 21 unidades** del siguiente manual que el docente aportó a su Biblioteca:

- **Título:** *Electrotecnia*.
- **Autor:** Pablo Alcalde San Miguel.
- **Editorial:** Ediciones Paraninfo.
- **Edición:** 7.ª, 2022.
- **ISBN:** 978-84-1366-155-1.
- **Módulo:** GM, Electrotecnia 0234 (Instalaciones Eléctricas y Automáticas).

**Referencias bibliográficas localizadas: 755**, distribuidas en 184 actividades resueltas integradas en los capítulos, 71 prácticas de laboratorio, 330 actividades de comprobación, 98 evaluaciones resueltas, 36 propuestas, 28 de ampliación y 8 experimentales.

El catálogo permite:

1. Seleccionar cualquiera de las 21 unidades.
2. Mostrar las secciones del índice editorial y sus páginas impresas.
3. Filtrar por clase de actividad y localizar por número o tema.
4. Consultar la página del libro y la equivalente en el PDF concreto del docente.
5. Abrir, cuando existe y está justificada, una práctica de Falstad relacionada con los contenidos.

La información se obtuvo mediante análisis de las páginas del ejemplar. Se corrigieron desajustes de reconocimiento de texto en varias referencias y se incorporaron las secciones de la Unidad 9. La base está en \`paraninfo-activities.js\` (inventario compacto de páginas y numeración), \`publications-data.js\` (edición y unidades), y \`publications.js\` (interfaz).

**Alcance:** el catálogo identifica números, tipos, temas y páginas de los ejercicios; no equivale a reproducir o resolver las 571 actividades del libro. La vinculación individual con Falstad solo aparece cuando hay una práctica apropiada. Las 24 prácticas propias del laboratorio siguen disponibles independientemente. La bibliografía no contiene enunciados, gráficos, el libro PDF ni su solucionario, sujetos a derechos de autor.

## Ejercicios propios con Falstad para el catálogo Paraninfo (v1.0)

La pestaña **Publicaciones** contiene referencias bibliográficas al manual de *Electrotecnia* de Paraninfo. Para cada una de las **755 referencias catalogadas**, el botón **Ejercicio original + Falstad** abre una variante original y diferenciada por valores del tema, con:

- Un circuito eléctrico editable que se carga automáticamente en CircuitJS integrado (y botón para restaurarlo).
- Dos cálculos con valores numéricos definidos, autocorrección y explicación matemática.
- Procedimiento de simulación y medidas con el osciloscopio virtual.
- Informe individual TXT y vinculación curricular parcial al RD 177/2008, con enlace al BOE.

**Alcance fundamental:** la relación es **temática**, NO una resolución del ejercicio original del libro ni una reproducción de su esquema. Para generar las 755 variantes se usan **21 familias de modelos eléctricos** (una por unidad), con parámetros derivados de la referencia. No existen 755 esquemas conceptualmente distintos, ni están validadas 755 correspondencias exactas con los enunciados editoriales. Los ejemplos sobre magnetismo, máquinas, lámparas, seguridad o sistemas trifásicos son **equivalentes limitados** y señalan expresamente qué fenómenos NO reproducen. El alumno no debe emplear una simulación eléctrica como ensayo real o verificación reglamentaria.

El banco seguirá requiriendo estudio individual de cada enunciado para transformarlo, cuando resulte técnicamente posible, en una **solución fiel y una simulación específica**. Los documentos, soluciones e ilustraciones de Paraninfo no se publican.

## Seis módulos con denominación oficial y nivel

La lista de **Prácticas guiadas** presenta todos los módulos con su nombre oficial, código y nivel, agrupados por ciclo. El nombre abreviado usado internamente no se muestra al alumno:

| Nivel | Módulo | Código | Prácticas |
|---|---|---|---:|
| GM · Instalaciones Eléctricas y Automáticas | Electrónica | 0233 | 2 |
| GM · Instalaciones Eléctricas y Automáticas | Electrotecnia | 0234 | 4 |
| GM · Instalaciones Eléctricas y Automáticas | Instalaciones de distribución | 0236 | 4 |
| GM · Instalaciones Eléctricas y Automáticas | Instalaciones solares fotovoltaicas | 0239 | 4 |
| GS · Sistemas Electrotécnicos y Automatizados | Sistemas y circuitos eléctricos | 0520 | 6 |
| GS · Sistemas Electrotécnicos y Automatizados | Desarrollo de redes eléctricas y centros de transformación | 0522 | 4 |
| | **Total** | | **24** |

El nombre oficial del módulo 0522 empieza con «Desarrollo de». Denominaciones confirmadas según **RD 177/2008** (módulos 0233, 0234, 0236 y 0239) y **RD 1127/2010** (módulos 0520 y 0522).

### Nuevas prácticas de los módulos 0236, 0239 y 0522

**GM · Instalaciones de distribución (0236):**

- ID01. Centro de transformación: magnitudes nominales (RA1)
- ID02. Red monofásica de baja tensión: caída de tensión (RA2)
- ID03. Instalación de enlace: intensidad y caída simplificada (RA3)
- ID04. Red radial de BT: caída de tensión por tramos (RA2)

**GM · Instalaciones solares fotovoltaicas (0239):**

- FV01. Módulos fotovoltaicos en serie y paralelo (RA2)
- FV02. Estimación energética y horas solares pico (RA2)
- FV03. Dimensionado energético teórico de batería (RA2)
- FV04. Condiciones eléctricas de entrada de un regulador MPPT (RA2)

**GS · Desarrollo de redes eléctricas y centros de transformación (0522):**

- DR01. Parámetros y caída de tensión trifásica en red BT (RA2)
- DR02. Magnitudes nominales de un CT trifásico (RA5)
- DR03. Comparación de secciones en red trifásica (RA3)
- DR04. Ensayos de transformador: balance simplificado de pérdidas (RA6)

Las 12 prácticas nuevas incluyen **circuitos equivalentes editables en Falstad CircuitJS** además de sus cálculos, autocorrección e informe descargable. Los modelos eléctricos representan fuentes, impedancias, líneas y cargas; **no son** una central fotovoltaica completa, una línea construida ni un centro de transformación con sus celdas y protecciones. Cada ficha explica qué representa su circuito y qué fenómenos quedan fuera. En las prácticas FV, las fuentes DC representan puntos eléctricos ideales, **no curvas I-V reales**; la producción energética, autonomía de baterías y comportamiento MPPT siguen siendo cálculos externos al modelo.

Todas las fichas muestran el RA y los CE relacionados, con descripción didáctica de cada criterio, advertencia de alcance parcial y enlace a la normativa oficial. Los cálculos eléctricos utilizados son simplificaciones explícitas; **no sustituyen las comprobaciones reglamentarias ni las medidas o ensayos sobre instalaciones reales**.

## Todos los ejercicios con circuito Falstad (versión 0.7)

**Regla de diseño:** toda práctica guiada debe incluir un circuito que el alumno pueda abrir y modificar en CircuitJS, además de los cálculos y RA/CE.

Las prácticas iniciales utilizan los ejemplos originales de Falstad. Para los doce ejercicios de distribución, redes y fotovoltaica se han incorporado **modelos eléctricos equivalentes propios**, definidos en `lab-circuits.js` e importados mediante la interfaz oficial `CircuitJS1.importCircuit(text, false)`. Se pueden estudiar tensiones, corrientes y cambios de impedancias en el osciloscopio web.

| Práctica | Modelo de Falstad incluido |
|---|---|
| ID01 y DR02 | Transformador equivalente por fase de un CT, con relación 50:1 y carga resistiva |
| ID02 | Fuente monofásica, resistencias de ida y retorno y carga |
| ID03 y DR01 | Equivalente monofásico de sistema trifásico equilibrado con línea y carga RL |
| ID04 | Red radial con dos tramos y cargas de corriente diferente |
| DR03 | Dos circuitos de BT comparables con secciones equivalentes de 50 y 95 mm² |
| DR04 | Fuente, pérdidas equivalentes de vacío y pérdidas de carga en resistencias |
| FV01 | Dos strings en paralelo con tres módulos DC ideales en serie por string |
| FV02 | Punto nominal DC equivalente a 2,7 kW; energía mediante cálculo HSP/PR |
| FV03 | Fuente ideal de 48 V y carga; batería sin dinámica de estado de carga |
| FV04 | Dos strings 2S2P de fuentes DC ideales; sin regulador MPPT dinámico |

En todos estos casos el circuito es una representación del **modelo simplificado**. Ni las cifras de la hoja de cálculo ni la interfaz gráfica sustituyen un proyecto conforme al REBT, los reglamentos de alta tensión, la documentación de fabricante o la ejecución de pruebas reales.

## Integración con CircuitJS

CircuitJS es software de Paul Falstad y colaboradores bajo licencia GPL-2.0-or-later.

El código original se encuentra en https://github.com/pfalstad/circuitjs1 y se obtiene durante la compilación de la página mediante GitHub Actions. La revisión compilada se fija en el workflow de despliegue.

La integración necesita una publicación construida por el workflow de GitHub Actions, que copia CircuitJS en el directorio /circuitjs del mismo dominio. La aplicación detecta automáticamente si existe esa copia:

- **CircuitJS local**: se activa la selección de componentes y la lectura de tensión y corriente mediante la interfaz JavaScript oficial.
- **Sin CircuitJS local**: se carga la versión externa de Falstad como simulador independiente, sin comunicación con el osciloscopio.

### Publicación integrada por GitHub Actions

1. En el repositorio, abrir **Settings → Pages**.
2. En **Build and deployment → Source**, elegir **GitHub Actions** (en lugar de Deploy from a branch).
3. En **Actions**, consultar el workflow **Publicar laboratorio con CircuitJS integrado**. En caso necesario, seleccionar **Run workflow**, rama **main**.
4. Esperar a que terminen con éxito los trabajos de compilación y despliegue antes de dar por operativa la integración.

Mientras Pages esté configurado en **Deploy from a branch**, la web puede funcionar con generador y trifásica, pero no tendrá la copia compilada de CircuitJS y utilizará el simulador externo.

### Ampliación del vatímetro verdadero (CA y CC)

El vatímetro de cuatro bornes `WattmeterTrueElm` conserva los terminales M, L, C y V y el formato XML del componente original. El menú de propiedades permite seleccionar **Automático, CC o CA** y activar por separado **potencia activa (W)**, **reactiva Q (VAr)** (calculada a partir de la fundamental Q₁) y **aparente S (VA)**; en CA se admite cualquier combinación. En CC, P conserva su valor medido; Q y S están desmarcadas por defecto, pero pueden marcarse para mostrar **0 VAr** y **0 VA**, respectivamente (convención didáctica; no representa el valor físico general de S = U_RMS·I_RMS). Los prefijos de unidades se ajustan automáticamente. Las lecturas de **P, U e I** se pueden elegir individualmente como **instantáneas, pico, RMS o medias**. Para U e I, pico es el máximo absoluto; para p(t), pico es su máximo algebraico. El RMS de p(t) no es la potencia aparente. La ventana de cálculo admite **1 o 3 periodos detectados, 100, 250 o 500 ms**. Las lecturas U e I sobre el símbolo son opcionales y se muestran siempre en la información del instrumento.

En CA, `P` es la media temporal de `u(t)i(t)`; `S=Urms·Irms` incluye la distorsión; `Q1` se calcula con las componentes fundamentales de tensión e intensidad, y no debe confundirse con `sqrt(S²-P²)` cuando existen armónicos. La medida reactiva necesita identificar un periodo completo, por lo que al comenzar o cambiar un circuito puede aparecer una lectura pendiente.

La compatibilidad exigida es **entrante**: los XML originales de Wulflemm, sin atributos adicionales, deben importarse y ejecutarse en el laboratorio. Las preferencias nuevas se almacenan con los atributos opcionales `labCurrentMode`, `labPowerMask`, `labPowerReadMode`, `labVoltageReadMode`, `labCurrentReadMode`, `labWindowMode`, `labShowVoltage` y `labShowCurrent`, sin alterar las conexiones eléctricas. No se exige que la versión externa de Wulflemm pueda interpretar las preferencias añadidas por el laboratorio. El código se incorpora a la compilación de CircuitJS mediante `scripts/patch-wattmeter-powers.mjs`; `tests/lab-power-measurement.test.mjs` comprueba los cálculos numéricos y `tests/verify-in-falstad.mjs` incluye una prueba de importación del XML original.

La importación acepta tanto archivos XML de Wulflemm/CircuitJS (también con declaración XML o marca BOM) como volcados TXT de Falstad con cabecera `# Laboratorio virtual de Electrotecnia y Electrónica

Aplicación web docente para FP. Combina un generador de funciones, un osciloscopio virtual, cálculo de redes trifásicas equilibradas y el simulador CircuitJS.

**Web publicada desde el repositorio:** https://jgraciar.github.io/electrotecnia/

**Versión 1.0 (desarrollo)**. Las funciones ya añadidas a la rama main pueden tardar unos minutos en aparecer en la web.

## Funciones implementadas

- Generador de señales senoidales, cuadradas, triangulares, diente de sierra y pulsos, con frecuencia, amplitud, offset, desfase y ciclo de trabajo ajustables.
- Visualización de CH1 y CH2; cursores verticales desplazables para medir Δt, 1/Δt y diferencia de nivel en el primer canal.
- Exportación CSV de las muestras representadas con tiempo en segundos.
- Espectro de los 15 primeros armónicos y THD aproximada respecto a la fundamental de la ventana, para las ondas virtuales periódicas.
- Simulador matemático de red trifásica senoidal equilibrada en estrella, secuencia ABC/ACB, tensiones simples y compuestas y corrientes por fase.
- Carga RLC serie, equilibrada y en régimen sinusoidal permanente; cálculo de impedancia, desfase, U, I, P, Q, S y factor de potencia.
- Pestaña CircuitJS y un puente JavaScript para consultar la tensión y la corriente de un elemento de dos terminales **cuando CircuitJS está alojado en el mismo origen**.

## Banco inicial de prácticas guiadas

La pestaña **Prácticas guiadas** incluye seis propuestas iniciales basadas en archivos de circuito existentes y comprobados del catálogo oficial de CircuitJS:

| Código | Módulo | Práctica | Circuito CircuitJS |
|---|---|---|---|
| E01 | Electrotecnia 0234 | Ley de Ohm, resistencias en paralelo | ohms.txt |
| E02 | Electrotecnia 0234 | Divisor resistivo de tensión | voltdivide.txt |
| E03 | Electrotecnia 0234 | Circuito RC serie en CA | capac.txt |
| E04 | Electrotecnia 0234 | Sistema trifásico equilibrado en estrella | 3phasewye.txt |
| N01 | Electrónica 0233 | Rectificador de onda completa | fullrect.txt |
| N02 | Electrónica 0233 | Puerta XOR y tabla de verdad | xor.txt |

Cada práctica incorpora: objetivos, enunciado, procedimientos, preguntas numéricas, autocorrección con margen de tolerancia, explicación matemática accesible bajo demanda y exportación de un informe TXT sin enviar datos del alumno a ningún servidor.

La autocorrección se refiere a **los valores iniciales del circuito**. Si el alumno modifica componentes o generadores, debe restaurar el circuito original antes de usarla. Es una herramienta de autoevaluación, no una evaluación oficial del módulo. Los RA/CE se incorporarán una vez contrastados con la programación docente.

El botón **Cargar montaje en CircuitJS** utiliza el parámetro documentado startCircuit y la copia de CircuitJS alojada en el mismo dominio; se reinicia la simulación y la adquisición virtual. No precisa hardware físico.

## Módulo de Grado Superior: Sistemas y Circuitos Eléctricos (0520)

La versión 0.4 incorpora un selector de módulo en **Prácticas guiadas** que separa:

- **Electrotecnia 0234**, Grado Medio.
- **Electrónica 0233**, Grado Medio.
- **Sistemas y Circuitos Eléctricos 0520**, Grado Superior de Sistemas Electrotécnicos y Automatizados (SEA).

Se incluyen seis prácticas nuevas de SCE; los RA y los CE asociados provienen del Real Decreto 1127/2010, anexo I, módulo 0520: https://www.boe.es/buscar/doc.php?id=BOE-A-2010-15355.

| Código | Práctica SCE | Circuito oficial CircuitJS | Vinculación orientativa |
|---|---|---|---|
| SCE01 | Carga RL en CA, impedancia y factor de potencia | inductac.txt | RA1: CE 1a, 1b, 1c |
| SCE02 | Resonancia RLC serie | lrc.txt | RA1: CE 1b, 1c |
| SCE03 | Estrella trifásica, potencia y neutro | 3phasewye.txt | RA1: CE 1c, 1d |
| SCE04 | Transformador monofásico como base para estudiar transformadores trifásicos | transformer.txt | RA3: CE 3a (introducción parcial) |
| SCE05 | Amplificador no inversor | amp-noninvert.txt | RA5: CE 5d, 5e, 5h |
| SCE06 | Circuito combinacional XOR | xor.txt | RA6: CE 6a, 6b, 6c, 6g, 6h |

Todas estas actividades incluyen objetivos, procedimiento, teoría de apoyo, preguntas numéricas con autocorrección y generación de un informe TXT. La autocorrección de respuestas numéricas emplea el **montaje original**, y su resultado no supone por sí solo la evaluación completa de un criterio de evaluación.

**Limitación didáctica específica:** la práctica SCE04 utiliza un transformador monofásico para introducir el comportamiento de los transformadores. No equivale a un ensayo trifásico, no comprueba el grupo vectorial y por tanto no acredita íntegramente el RA3. En SCE02 se diferencia el régimen transitorio del cálculo fasorial de resonancia. La simulación no acredita, por sí misma, las operaciones de medida sobre equipos reales que requieren normativa de seguridad.

## Consulta visible de resultados de aprendizaje (RA) y criterios de evaluación (CE)

**Versión 0.5:** abre **Prácticas guiadas**, selecciona un módulo y después una práctica. Justo debajo del enunciado aparece el apartado **«Resultados de aprendizaje y criterios de evaluación vinculados»**, con el número y la redacción del RA, una lista de CE identificados individualmente (por ejemplo, **CE 1b**, **CE 1c**), una descripción legible de cada criterio y el enlace directo al real decreto en el BOE. Las fichas de los **tres módulos** incluyen esa información.

La correspondencia es **parcial**: no se presupone que una simulación certifique la totalidad de un CE ni los ensayos/medidas reales requeridos en el taller. El informe TXT incorpora también el RA, los CE y su normativa de referencia. Las descripciones de los CE están adaptadas para lectura didáctica; el texto jurídico íntegro se consulta en el BOE.

## Publicaciones y actividades del libro de texto

La versión 0.9 completa el **catálogo de referencias numeradas de las 21 unidades** del siguiente manual que el docente aportó a su Biblioteca:

- **Título:** *Electrotecnia*.
- **Autor:** Pablo Alcalde San Miguel.
- **Editorial:** Ediciones Paraninfo.
- **Edición:** 7.ª, 2022.
- **ISBN:** 978-84-1366-155-1.
- **Módulo:** GM, Electrotecnia 0234 (Instalaciones Eléctricas y Automáticas).

**Referencias bibliográficas localizadas: 755**, distribuidas en 184 actividades resueltas integradas en los capítulos, 71 prácticas de laboratorio, 330 actividades de comprobación, 98 evaluaciones resueltas, 36 propuestas, 28 de ampliación y 8 experimentales.

El catálogo permite:

1. Seleccionar cualquiera de las 21 unidades.
2. Mostrar las secciones del índice editorial y sus páginas impresas.
3. Filtrar por clase de actividad y localizar por número o tema.
4. Consultar la página del libro y la equivalente en el PDF concreto del docente.
5. Abrir, cuando existe y está justificada, una práctica de Falstad relacionada con los contenidos.

La información se obtuvo mediante análisis de las páginas del ejemplar. Se corrigieron desajustes de reconocimiento de texto en varias referencias y se incorporaron las secciones de la Unidad 9. La base está en \`paraninfo-activities.js\` (inventario compacto de páginas y numeración), \`publications-data.js\` (edición y unidades), y \`publications.js\` (interfaz).

**Alcance:** el catálogo identifica números, tipos, temas y páginas de los ejercicios; no equivale a reproducir o resolver las 571 actividades del libro. La vinculación individual con Falstad solo aparece cuando hay una práctica apropiada. Las 24 prácticas propias del laboratorio siguen disponibles independientemente. La bibliografía no contiene enunciados, gráficos, el libro PDF ni su solucionario, sujetos a derechos de autor.

## Ejercicios propios con Falstad para el catálogo Paraninfo (v1.0)

La pestaña **Publicaciones** contiene referencias bibliográficas al manual de *Electrotecnia* de Paraninfo. Para cada una de las **755 referencias catalogadas**, el botón **Ejercicio original + Falstad** abre una variante original y diferenciada por valores del tema, con:

- Un circuito eléctrico editable que se carga automáticamente en CircuitJS integrado (y botón para restaurarlo).
- Dos cálculos con valores numéricos definidos, autocorrección y explicación matemática.
- Procedimiento de simulación y medidas con el osciloscopio virtual.
- Informe individual TXT y vinculación curricular parcial al RD 177/2008, con enlace al BOE.

**Alcance fundamental:** la relación es **temática**, NO una resolución del ejercicio original del libro ni una reproducción de su esquema. Para generar las 755 variantes se usan **21 familias de modelos eléctricos** (una por unidad), con parámetros derivados de la referencia. No existen 755 esquemas conceptualmente distintos, ni están validadas 755 correspondencias exactas con los enunciados editoriales. Los ejemplos sobre magnetismo, máquinas, lámparas, seguridad o sistemas trifásicos son **equivalentes limitados** y señalan expresamente qué fenómenos NO reproducen. El alumno no debe emplear una simulación eléctrica como ensayo real o verificación reglamentaria.

El banco seguirá requiriendo estudio individual de cada enunciado para transformarlo, cuando resulte técnicamente posible, en una **solución fiel y una simulación específica**. Los documentos, soluciones e ilustraciones de Paraninfo no se publican.

## Seis módulos con denominación oficial y nivel

La lista de **Prácticas guiadas** presenta todos los módulos con su nombre oficial, código y nivel, agrupados por ciclo. El nombre abreviado usado internamente no se muestra al alumno:

| Nivel | Módulo | Código | Prácticas |
|---|---|---|---:|
| GM · Instalaciones Eléctricas y Automáticas | Electrónica | 0233 | 2 |
| GM · Instalaciones Eléctricas y Automáticas | Electrotecnia | 0234 | 4 |
| GM · Instalaciones Eléctricas y Automáticas | Instalaciones de distribución | 0236 | 4 |
| GM · Instalaciones Eléctricas y Automáticas | Instalaciones solares fotovoltaicas | 0239 | 4 |
| GS · Sistemas Electrotécnicos y Automatizados | Sistemas y circuitos eléctricos | 0520 | 6 |
| GS · Sistemas Electrotécnicos y Automatizados | Desarrollo de redes eléctricas y centros de transformación | 0522 | 4 |
| | **Total** | | **24** |

El nombre oficial del módulo 0522 empieza con «Desarrollo de». Denominaciones confirmadas según **RD 177/2008** (módulos 0233, 0234, 0236 y 0239) y **RD 1127/2010** (módulos 0520 y 0522).

### Nuevas prácticas de los módulos 0236, 0239 y 0522

**GM · Instalaciones de distribución (0236):**

- ID01. Centro de transformación: magnitudes nominales (RA1)
- ID02. Red monofásica de baja tensión: caída de tensión (RA2)
- ID03. Instalación de enlace: intensidad y caída simplificada (RA3)
- ID04. Red radial de BT: caída de tensión por tramos (RA2)

**GM · Instalaciones solares fotovoltaicas (0239):**

- FV01. Módulos fotovoltaicos en serie y paralelo (RA2)
- FV02. Estimación energética y horas solares pico (RA2)
- FV03. Dimensionado energético teórico de batería (RA2)
- FV04. Condiciones eléctricas de entrada de un regulador MPPT (RA2)

**GS · Desarrollo de redes eléctricas y centros de transformación (0522):**

- DR01. Parámetros y caída de tensión trifásica en red BT (RA2)
- DR02. Magnitudes nominales de un CT trifásico (RA5)
- DR03. Comparación de secciones en red trifásica (RA3)
- DR04. Ensayos de transformador: balance simplificado de pérdidas (RA6)

Las 12 prácticas nuevas incluyen **circuitos equivalentes editables en Falstad CircuitJS** además de sus cálculos, autocorrección e informe descargable. Los modelos eléctricos representan fuentes, impedancias, líneas y cargas; **no son** una central fotovoltaica completa, una línea construida ni un centro de transformación con sus celdas y protecciones. Cada ficha explica qué representa su circuito y qué fenómenos quedan fuera. En las prácticas FV, las fuentes DC representan puntos eléctricos ideales, **no curvas I-V reales**; la producción energética, autonomía de baterías y comportamiento MPPT siguen siendo cálculos externos al modelo.

Todas las fichas muestran el RA y los CE relacionados, con descripción didáctica de cada criterio, advertencia de alcance parcial y enlace a la normativa oficial. Los cálculos eléctricos utilizados son simplificaciones explícitas; **no sustituyen las comprobaciones reglamentarias ni las medidas o ensayos sobre instalaciones reales**.

## Todos los ejercicios con circuito Falstad (versión 0.7)

**Regla de diseño:** toda práctica guiada debe incluir un circuito que el alumno pueda abrir y modificar en CircuitJS, además de los cálculos y RA/CE.

Las prácticas iniciales utilizan los ejemplos originales de Falstad. Para los doce ejercicios de distribución, redes y fotovoltaica se han incorporado **modelos eléctricos equivalentes propios**, definidos en `lab-circuits.js` e importados mediante la interfaz oficial `CircuitJS1.importCircuit(text, false)`. Se pueden estudiar tensiones, corrientes y cambios de impedancias en el osciloscopio web.

| Práctica | Modelo de Falstad incluido |
|---|---|
| ID01 y DR02 | Transformador equivalente por fase de un CT, con relación 50:1 y carga resistiva |
| ID02 | Fuente monofásica, resistencias de ida y retorno y carga |
| ID03 y DR01 | Equivalente monofásico de sistema trifásico equilibrado con línea y carga RL |
| ID04 | Red radial con dos tramos y cargas de corriente diferente |
| DR03 | Dos circuitos de BT comparables con secciones equivalentes de 50 y 95 mm² |
| DR04 | Fuente, pérdidas equivalentes de vacío y pérdidas de carga en resistencias |
| FV01 | Dos strings en paralelo con tres módulos DC ideales en serie por string |
| FV02 | Punto nominal DC equivalente a 2,7 kW; energía mediante cálculo HSP/PR |
| FV03 | Fuente ideal de 48 V y carga; batería sin dinámica de estado de carga |
| FV04 | Dos strings 2S2P de fuentes DC ideales; sin regulador MPPT dinámico |

En todos estos casos el circuito es una representación del **modelo simplificado**. Ni las cifras de la hoja de cálculo ni la interfaz gráfica sustituyen un proyecto conforme al REBT, los reglamentos de alta tensión, la documentación de fabricante o la ejecución de pruebas reales.

## Integración con CircuitJS

CircuitJS es software de Paul Falstad y colaboradores bajo licencia GPL-2.0-or-later.

El código original se encuentra en https://github.com/pfalstad/circuitjs1 y se obtiene durante la compilación de la página mediante GitHub Actions. La revisión compilada se fija en el workflow de despliegue.

La integración necesita una publicación construida por el workflow de GitHub Actions, que copia CircuitJS en el directorio /circuitjs del mismo dominio. La aplicación detecta automáticamente si existe esa copia:

- **CircuitJS local**: se activa la selección de componentes y la lectura de tensión y corriente mediante la interfaz JavaScript oficial.
- **Sin CircuitJS local**: se carga la versión externa de Falstad como simulador independiente, sin comunicación con el osciloscopio.

### Publicación integrada por GitHub Actions

1. En el repositorio, abrir **Settings → Pages**.
2. En **Build and deployment → Source**, elegir **GitHub Actions** (en lugar de Deploy from a branch).
3. En **Actions**, consultar el workflow **Publicar laboratorio con CircuitJS integrado**. En caso necesario, seleccionar **Run workflow**, rama **main**.
4. Esperar a que terminen con éxito los trabajos de compilación y despliegue antes de dar por operativa la integración.

Mientras Pages esté configurado en **Deploy from a branch**, la web puede funcionar con generador y trifásica, pero no tendrá la copia compilada de CircuitJS y utilizará el simulador externo.

### Ampliación del vatímetro verdadero (CA y CC)

El vatímetro de cuatro bornes `WattmeterTrueElm` conserva los terminales M, L, C y V y el formato XML del componente original. El menú de propiedades permite seleccionar **Automático, CC o CA** y activar por separado **potencia activa (W)**, **reactiva Q (VAr)** (calculada a partir de la fundamental Q₁) y **aparente S (VA)**; en CA se admite cualquier combinación. En CC, P conserva su valor medido; Q y S están desmarcadas por defecto, pero pueden marcarse para mostrar **0 VAr** y **0 VA**, respectivamente (convención didáctica; no representa el valor físico general de S = U_RMS·I_RMS). Los prefijos de unidades se ajustan automáticamente. Las lecturas de **P, U e I** se pueden elegir individualmente como **instantáneas, pico, RMS o medias**. Para U e I, pico es el máximo absoluto; para p(t), pico es su máximo algebraico. El RMS de p(t) no es la potencia aparente. La ventana de cálculo admite **1 o 3 periodos detectados, 100, 250 o 500 ms**. Las lecturas U e I sobre el símbolo son opcionales y se muestran siempre en la información del instrumento.

En CA, `P` es la media temporal de `u(t)i(t)`; `S=Urms·Irms` incluye la distorsión; `Q1` se calcula con las componentes fundamentales de tensión e intensidad, y no debe confundirse con `sqrt(S²-P²)` cuando existen armónicos. La medida reactiva necesita identificar un periodo completo, por lo que al comenzar o cambiar un circuito puede aparecer una lectura pendiente.

La compatibilidad exigida es **entrante**: los XML originales de Wulflemm, sin atributos adicionales, deben importarse y ejecutarse en el laboratorio. Las preferencias nuevas se almacenan con los atributos opcionales `labCurrentMode`, `labPowerMask`, `labPowerReadMode`, `labVoltageReadMode`, `labCurrentReadMode`, `labWindowMode`, `labShowVoltage` y `labShowCurrent`, sin alterar las conexiones eléctricas. No se exige que la versión externa de Wulflemm pueda interpretar las preferencias añadidas por el laboratorio. El código se incorpora a la compilación de CircuitJS mediante `scripts/patch-wattmeter-powers.mjs`; `tests/lab-power-measurement.test.mjs` comprueba los cálculos numéricos y `tests/verify-in-falstad.mjs` incluye una prueba de importación del XML original.

, independientemente de la extensión del archivo. Después de cargar cada circuito compara el número de componentes originales con los reconocidos por el motor. Ante un componente no admitido, rechaza la importación y restaura el circuito previo, en lugar de descartar componentes silenciosamente. Esto no garantiza que puedan ejecutarse componentes de futuras versiones ajenas que aún no existan en el motor del laboratorio. La prueba de navegador `tests/verify-wattmeter-inbound.mjs` cubre ambos formatos, la conservación de los vatímetros y el rechazo seguro de elementos desconocidos. No se exige compatibilidad de exportación hacia los simuladores externos.

## Limitaciones

- Simulación exclusivamente: no hay comunicación USB con el Hantek 6022BE ni control del ESP8266.
- La conexión con CircuitJS presenta actualmente una única magnitud seleccionable por componente (tensión o corriente). La frecuencia de muestreo y la duración de las ventanas dependen de la simulación.
- La estimación espectral para CircuitJS no ofrece una THD normativa validada: la THD solo se presenta para señales virtuales periódicas con ventana conocida, como cálculo aproximado de los primeros 15 armónicos.
- No se simulan todavía neutro flotante, desequilibrios, corte de fase, cargas motor, ni transitorios RLC reales.
- Los valores de tensión 230/400 V se refieren únicamente a un modelo matemático. **Nunca conectar directamente la red de 230/400 V al Hantek 6022BE.**

## Ejecución local

Puedes servir la raíz del repositorio con un servidor HTTP estático (por ejemplo, el comando Python: python -m http.server 8000) y abrir http://localhost:8000/. En este caso CircuitJS funcionará como aplicación externa hasta que se compile y aloje una copia local.

## Fuentes y licencias

- Código original del laboratorio: **GPL-3.0-only**, archivo LICENSE.
- CircuitJS (Falstad y colaboradores): **GPL-2.0-or-later**, código https://github.com/pfalstad/circuitjs1.
- OpenHantek6022 es una referencia de diseño de instrumentación, pero su código **no se ha copiado** en este prototipo.

## Próximos hitos

Validar en navegador los seis nuevos montajes SCE y sus cálculos guiados; completar prácticas sobre máquinas rotativas, transformadores trifásicos y medida real de parámetros; vincular evidencias de evaluación con los RA/CE y la programación docente; incorporar sistemas trifásicos desequilibrados y fallos de neutro.


## Actividades literales de Paraninfo · incorporación progresiva (octubre 2026)

La pestaña «Publicaciones» presenta **solo actividades originales transcritas del libro
que ha facilitado el docente**, con referencia a unidad, número y página. Se han retirado
del apartado las 755 variantes genéricas parametrizadas (el antiguo generador ya no se
usa). En esta fase hay **11 actividades reales** de las unidades 2, 3 y 4:
AR 2.1, 2.2; 3.3, 3.5, 3.6, 3.9, 3.10; 4.1, 4.4, 4.5 y 4.6.

Ocho incorporan un circuito resistivo equivalente con amperímetro, voltímetro
y vatímetro nativos de Falstad. El circuito representa tensión e intensidad nominales,
no necesariamente la forma de onda CA ni la física térmica del receptor. Las tres
actividades que proporcionan solo potencia y tiempo no determinan un circuito único,
por lo que no se les inventa una tensión. El contador y tarificador virtuales
distinguen extrapolación de potencia al tiempo del enunciado de energía simulada real.
El resultado editorial 4.5 emplea redondeo intermedio; se explica su diferencia.
El solucionario de la AR 3.9 tiene una errata: 8 h son 28.800 s, no 28.000 s.

`tests/verify-paraninfo.mjs` comprueba la matemática y estructura de todas las fichas;
`tests/verify-in-falstad.mjs` comprueba los instrumentos del CircuitJS real.
Los resultados nuevos se marcarán como comprobados únicamente si GitHub Actions
confirma esa segunda verificación. No se incorporan actividades sin cotejar su
enunciado y solución original.


### Escalas de los instrumentos por actividad

La generación de circuitos de Paraninfo fija expresamente la escala del amperímetro
(A, mA o µA) y del voltímetro (V, mV o µV) según los valores calculados para
cada ejercicio. El vatímetro de CircuitJS adapta automáticamente su lectura W/kW.
La comparación numérica de la web presenta las mismas unidades y conserva el
cálculo físico en amperios, voltios y vatios. No se aplica ninguna escala ficticia
a los valores eléctricos. Las pruebas unitarias comprueban los campos de escala
del archivo de circuito y GitHub Actions verifica las medidas del simulador.
