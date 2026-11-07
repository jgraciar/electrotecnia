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

Los casos **sin excedentes** representan una consigna estática de limitación de generación, no un sistema antivertido certificado conforme a la ITC-BT-40. Los condensadores tienen una resistencia serie de 0,05 Ω (escalones pequeños) o 0,01 Ω (batería industrial de mayor capacidad) para representar pérdidas muy reducidas y amortiguar oscilaciones numéricas del método trapezoidal. No se incluyen reactancias de rechazo, protecciones, envejecimiento ni tolerancias de los componentes. Para P=0 puede circular corriente debido a Q distinta de cero.
