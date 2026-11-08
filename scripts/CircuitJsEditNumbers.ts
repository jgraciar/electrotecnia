// Formato de entrada numérica de CircuitJS. La selección regional afecta
// exclusivamente a los campos editables: cálculos, XML y claves siguen usando
// números de JavaScript con punto decimal.
export type CircuitEditFormat = {decimal: "." | ","; group: "." | "," | ""};
type ReadableStorage = {getItem(key: string): string | null};

export function getCircuitEditFormat(
    language: string, source?: ReadableStorage | null
): CircuitEditFormat {
    let storage = source;
    if (storage === undefined) {
        try { storage = typeof localStorage === "undefined" ? null : localStorage; }
        catch { storage = null; }
    }
    const read = (key: string): string | null => {
        try { return storage?.getItem(key) ?? null; } catch { return null; }
    };
    const regional = read("labRegionalFormat") ||
        (language.toLowerCase().startsWith("en") ? "uk" : "eu");
    if (regional === "uk") return {decimal: ".", group: ","};
    if (regional !== "custom") return {decimal: ",", group: "."};
    const decimal: "." | "," = read("labDecimalSeparator") === "." ? "." : ",";
    const configured = read("labGroupingSeparator");
    const group: "." | "," | "" = configured === "." || configured === ","
        ? configured : "";
    return {decimal, group: group === decimal ? "" : group};
}

// Conserva los dígitos significativos y los prefijos eléctricos originales;
// no aplica la limitación de decimales prevista solo para los resultados.
export function formatCircuitEditValue(
    value: string, language: string, fmt: CircuitEditFormat = getCircuitEditFormat(language)
): string {
    const match = value.match(/^([+-]?)(\d+(?:\.\d+)?|\.\d+)([eE][+-]?\d+)?(.*)$/);
    if (!match) return value;
    const [, sign, mantissa, exponent = "", suffix] = match;
    const [integer, fraction] = mantissa.split(".");
    const grouped = fmt.group
        ? integer.replace(/\B(?=(\d{3})+(?!\d))/g, fmt.group)
        : integer;
    return sign + grouped + (fraction === undefined ? "" : fmt.decimal + fraction)
        + exponent + suffix;
}

// Rechaza agrupaciones mal formadas para evitar guardar valores incorrectos:
// europeo 1.234,5 -> 1234.5; anglosajón 1,234.5 -> 1234.5.
// El resultado canónico pasa al analizador SI/RMS original de CircuitJS.
export function normalizeCircuitEditInput(
    input: string, language: string, fmt: CircuitEditFormat = getCircuitEditFormat(language)
): string {
    let value = input.trim().replace(/\u2212/g, "-").replace(/\s+/g, "");
    // Atajo habitual para componentes: 2k2 equivale a 2,2k o 2.2k.
    value = value.replace(/^([+-]?\d+)([pPnNuUmMkKgG])(\d+)$/,
        (_whole, before: string, prefix: string, after: string) =>
            before + fmt.decimal + after + prefix);
    const match = value.match(/^([+-]?[\d.,]+)([eE][+-]?\d+)?((?:[mM][eE][gG]|[fFpPnNuUmMkKgG])?(?:rms)?)$/);
    if (!match) throw new Error("Invalid numeric input");
    const [, mantissa, exponent = "", suffix] = match;
    const sign = mantissa.startsWith("-") || mantissa.startsWith("+")
        ? mantissa.charAt(0) : "";
    const unsigned = mantissa.slice(sign.length);
    const pieces = unsigned.split(fmt.decimal);
    if (pieces.length > 2) throw new Error("Repeated decimal separator");
    let integer = pieces[0];
    const fraction = pieces.length === 2 ? pieces[1] : undefined;
    if (fraction !== undefined && !/^\d+$/.test(fraction))
        throw new Error("Invalid decimal digits");
    if (fmt.group && integer.includes(fmt.group)) {
        const escaped = fmt.group === "." ? "\\." : ",";
        if (!new RegExp("^\\d{1,3}(?:" + escaped + "\\d{3})+$").test(integer))
            throw new Error("Invalid thousands grouping");
        integer = integer.split(fmt.group).join("");
    }
    if ((!integer && fraction === undefined) || (integer && !/^\d+$/.test(integer)))
        throw new Error("Invalid integer part");
    const canonical = sign + (integer || "0") +
        (fraction === undefined ? "" : "." + fraction) + exponent + suffix;
    if (!/^[+-]?(?:\d+(?:\.\d+)?)(?:[eE][+-]?\d+)?(?:[mM][eE][gG]|[fFpPnNuUmMkKgG])?(?:rms)?$/.test(canonical))
        throw new Error("Invalid numeric expression");
    return canonical;
}

const invalidMessages: Record<string,string> = {
    en:"Invalid number for the selected regional format",
    es:"Número no válido para el formato regional seleccionado",
    ca:"Número no vàlid per al format regional seleccionat",
    "ca-es-valencia":"Número no vàlid per al format regional seleccionat",
    gl:"Número non válido para o formato rexional seleccionado",
    eu:"Zenbakia ez da baliozkoa hautatutako eskualde-formatuan",
    nl:"Ongeldig getal voor de geselecteerde regionale notatie",
    sv:"Ogiltigt tal för det valda regionala formatet",
    de:"Ungültige Zahl für das ausgewählte Zahlenformat",
    fr:"Nombre non valide pour le format régional sélectionné",
    it:"Numero non valido per il formato regionale selezionato",
    pt:"Número inválido para o formato regional selecionado",
    csx:"Neplatné číslo pro vybraný místní formát",
    da:"Ugyldigt tal for det valgte regionale format",
    fi:"Virheellinen luku valitussa alueellisessa muodossa",
    nb:"Ugyldig tall for valgt regionalt format",
    pl:"Nieprawidłowa liczba dla wybranego formatu regionalnego",
    ru:"Недопустимое число для выбранного регионального формата",
    zh:"数字不符合所选区域格式",
    "zh-tw":"數字不符合所選地區格式",
    ja:"選択した地域形式では無効な数値です",
    kr:"선택한 지역 형식에 맞지 않는 숫자입니다"
};
export function circuitEditNumberError(language: string): string {
    return invalidMessages[language.toLowerCase()] ?? invalidMessages.en;
}
