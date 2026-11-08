// Nombres de los componentes de Dibujo sin verbos de inserción.
// Se conserva intacta la clave del comando (por ejemplo, «Add Resistor»)
// y se modifica únicamente su rótulo visible.
export function circuitJsDrawLabel(sourceKey: string, localized: string, language: string): string {
    // Los accesos de arrastre y las acciones ajenas a «Add» no se cambian.
    if (!/^(?:Add |Añadir |Afegir |Afig |Engadir )/i.test(sourceKey) || !localized) return localized;

    const code = language.toLowerCase().replace(/_/g, "-");
    const base = code.startsWith("ca-es-valencia") ? "ca-es-valencia"
        : code.startsWith("zh-tw") || code.startsWith("zh-hant") ? "zh-tw"
        : code.split("-")[0];
    const prefixes: Record<string, string[]> = {
        en: ["Add "],
        es: ["Añadir ", "Agregar "],
        ca: ["Afegir ", "Afig ", "Añadir "],
        "ca-es-valencia": ["Afig ", "Afegir ", "Añadir "],
        gl: ["Engadir ", "Añadir "],
        eu: ["Gehitu ", "Añadir "],
        csx: ["Přidat ", "Vložit "],
        da: ["Tilføj "],
        de: ["Hinzufügen ", "Einfügen "],
        fi: ["Lisää "],
        fr: ["Ajouter "],
        it: ["Aggiungi ", "Inserisci "],
        ja: ["追加 ", "追加する "],
        kr: ["추가 "],
        nb: ["Legg til "],
        pl: ["Wstaw ", "Dodaj "],
        pt: ["Inserir ", "Inserir", "Adicionar "],
        ru: ["Добавить "],
        zh: ["添加 ", "添加", "加入 ", "加入"],
        "zh-tw": ["新增 ", "新增", "加入 ", "加入", "添加"],
        nl: ["Toevoegen ", "Voeg toe ", "Add "],
        sv: ["Lägg till ", "Add "]
    };
    // Los catálogos originales son heterogéneos. Quitar solo el verbo que
    // coincide exactamente; «Adder», «Additive», etc., son nombres válidos.
    let label = localized.trim();
    for (const prefix of [...(prefixes[base] || []), "Add "]) {
        if (label.toLocaleLowerCase().startsWith(prefix.toLocaleLowerCase())) {
            label = label.slice(prefix.length).trimStart();
            break;
        }
    }
    // En estas lenguas los catálogos ponen la acción después del componente,
    // no antes. Se limita el tratamiento a los nombres del menú de Dibujo.
    if (base === "de") label = label.replace(/\s+einfügen(?=\s|$)/gi, " ");
    if (base === "ja") label = label.replace(/を追加|を挿入|を加える/g, "");
    if (base === "kr") label = label.replace(/\s*추가\s*$/g, "");
    return label.replace(/\s{2,}/g, " ").trim() || localized;
}
