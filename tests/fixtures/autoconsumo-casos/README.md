# Circuitos fotovoltaicos individuales con vatímetros

Cada archivo XML contiene un caso eléctrico independiente para importar en la pestaña **Falstad** del [Laboratorio de Electrotecnia](https://jgraciar.github.io/electrotecnia/). **No** se garantiza compatibilidad con el Falstad original: se utiliza PVInverter y WattmeterTrue personalizados. Los vatímetros muestran P, Q₁ y S (y cos φ y factor de potencia), en la entrada de la instalación. Los circuitos trifásicos llevan tres vatímetros, uno por fase; la P total se obtiene sumando sus lecturas, con signo.

| Caso | Escenario | Vatímetros | Descargar |
|---|---|---:|---|
| V01 | VIVIENDA / SIN EXCEDENTES | 1 | [V01.xml](https://raw.githubusercontent.com/jgraciar/electrotecnia/main/tests/fixtures/autoconsumo-casos/V01.xml) |
| V02 | VIVIENDA / CON EXCEDENTES | 1 | [V02.xml](https://raw.githubusercontent.com/jgraciar/electrotecnia/main/tests/fixtures/autoconsumo-casos/V02.xml) |
| C01 | COMERCIO / IMPORTACION | 1 | [C01.xml](https://raw.githubusercontent.com/jgraciar/electrotecnia/main/tests/fixtures/autoconsumo-casos/C01.xml) |
| C02 | COMERCIO / SIN EXCEDENTES | 1 | [C02.xml](https://raw.githubusercontent.com/jgraciar/electrotecnia/main/tests/fixtures/autoconsumo-casos/C02.xml) |
| M01 | MONOFASICA / IMPORTACION | 1 | [M01.xml](https://raw.githubusercontent.com/jgraciar/electrotecnia/main/tests/fixtures/autoconsumo-casos/M01.xml) |
| M02 | MONOFASICA / AUTOCONSUMO TOTAL | 1 | [M02.xml](https://raw.githubusercontent.com/jgraciar/electrotecnia/main/tests/fixtures/autoconsumo-casos/M02.xml) |
| M03 | MONOFASICA / VERTIDO | 1 | [M03.xml](https://raw.githubusercontent.com/jgraciar/electrotecnia/main/tests/fixtures/autoconsumo-casos/M03.xml) |
| T01 | TERCIARIO / CON EXCEDENTES | 3 | [T01.xml](https://raw.githubusercontent.com/jgraciar/electrotecnia/main/tests/fixtures/autoconsumo-casos/T01.xml) |
| T02 | TERCIARIO / SIN EXCEDENTES | 3 | [T02.xml](https://raw.githubusercontent.com/jgraciar/electrotecnia/main/tests/fixtures/autoconsumo-casos/T02.xml) |
| I01 | INDUSTRIA / CON EXCEDENTES | 3 | [I01.xml](https://raw.githubusercontent.com/jgraciar/electrotecnia/main/tests/fixtures/autoconsumo-casos/I01.xml) |
| I02 | INDUSTRIA / SIN EXCEDENTES | 3 | [I02.xml](https://raw.githubusercontent.com/jgraciar/electrotecnia/main/tests/fixtures/autoconsumo-casos/I02.xml) |
| D01 | TRIFASICA / BATERIA COMERCIAL | 3 | [D01.xml](https://raw.githubusercontent.com/jgraciar/electrotecnia/main/tests/fixtures/autoconsumo-casos/D01.xml) |
| D02 | TRIFASICA / INVERSOR CON Q | 3 | [D02.xml](https://raw.githubusercontent.com/jgraciar/electrotecnia/main/tests/fixtures/autoconsumo-casos/D02.xml) |
| N01 | TRIFASICA / DESEQUILIBRIO | 3 | [N01.xml](https://raw.githubusercontent.com/jgraciar/electrotecnia/main/tests/fixtures/autoconsumo-casos/N01.xml) |

## Potencias esperadas en el punto de conexión

Signos: **P positiva = importación**; **P negativa = vertido**; **Q positiva = inductiva**; **Q negativa = capacitiva**. Todas son potencias calculadas en régimen estacionario; los pequeños consumos de las resistencias serie de los condensadores pueden producir desviaciones de pocos vatios.

| Caso | Tensión | P de red (kW) | Q₁ de red (kVAr) |
|---|---|---:|---:|
| V01 | 230 V, 1F | 0 | +0,35 |
| V02 | 230 V, 1F | −2,7 | +0,35 |
| C01 | 230 V, 1F | +1 | +0,5 |
| C02 | 230 V, 1F | 0 | −1,5 |
| M01 | 230 V, 1F | +1 | −2,5 |
| M02 | 230 V, 1F | 0 | −2,5 |
| M03 | 230 V, 1F | −1 | −2,5 |
| T01 | 400 V, 3F | −25 | +12,5 |
| T02 | 400 V, 3F | 0 | +12,5 |
| I01 | 400 V, 3F | −5 | +25 |
| I02 | 400 V, 3F | 0 | −15 |
| D01 | 400 V, 3F | 0 | −12,5 |
| D02 | 400 V, 3F | −4 | −9,5 |
| N01 | 400 V, 3F | 0 (L1: −1,3; L2: 0; L3: +1,3) | 0 |

En trifásica, suma **las P y las Q₁ con su signo** de los tres vatímetros. No sumes directamente las tres S para deducir la potencia aparente trifásica total cuando hay desequilibrio.

### Importación y comprobación visual

1. Descarga el XML del supuesto deseado desde la tabla anterior.
2. Abre [Laboratorio de Electrotecnia](https://jgraciar.github.io/electrotecnia/), selecciona **Falstad** y utiliza la función de importar un circuito XML.
3. Comprueba que no haya terminales marcados en rojo; selecciona los vatímetros y compara sus P, Q₁, S e intensidades con las potencias esperadas. En red monofásica, la intensidad de referencia es `I = S/U`; en trifásica equilibrada, `I = |S_total|/(√3·U_LL)`.
4. Utiliza la simulación integrada del laboratorio: el elemento `PVInverter` y el vatímetro ampliado `WattmeterTrue` no están necesariamente disponibles en Falstad original.

Los casos **sin excedentes** representan una consigna estática de limitación de generación, no un sistema antivertido certificado conforme a la ITC-BT-40. Los condensadores tienen una resistencia serie de 0,05 Ω (escalones pequeños) o 0,01 Ω (batería industrial de mayor capacidad) para representar pérdidas muy reducidas y amortiguar oscilaciones numéricas del método trapezoidal. No se incluyen reactancias de rechazo, protecciones, envejecimiento ni tolerancias de los componentes. Para P=0 puede circular corriente debido a Q distinta de cero.
