# Publicación independiente de Circuit JGR 1.0

Este directorio contiene el flujo de publicación de la web de usuario `jgraciar.github.io`.

## Estructura prevista

| URL pública | Contenido | Origen |
| --- | --- | --- |
| `https://jgraciar.github.io/` | Portada: elegir Circuit JGR o el laboratorio | `site-root/index.html` |
| `https://jgraciar.github.io/circuitjgr.html` | Simulador Circuit JGR 1.0 | Entrada Vite `circuitjgr.html` |
| `https://jgraciar.github.io/electrotecnia/` | Laboratorio existente | GitHub Pages de `jgraciar/electrotecnia` |

El código fuente del laboratorio sigue en la rama `main` de `jgraciar/electrotecnia`.
El desarrollo propio de Circuit JGR está aislado en `circuits-jgr-1.0` del mismo repositorio, hasta su eventual separación definitiva. El flujo no modifica el repositorio del laboratorio.

## Puesta en servicio

1. Crear, con la cuenta **jgraciar**, un repositorio **público** llamado exactamente `jgraciar.github.io`, con una rama `main` (se puede iniciar con un README).
2. Crear en él `.github/workflows/pages.yml` y copiar el contenido completo de [github-pages-root.yml](./github-pages-root.yml).
3. Entrar en **Settings → Pages → Build and deployment → Source** y seleccionar **GitHub Actions**.
4. Desde **Actions**, ejecutar `Publicar Circuit JGR 1.0` mediante **Run workflow**, o confirmar el archivo en la rama `main` para desencadenar su primera ejecución.
5. Comprobar que finalizan correctamente las fases **build** y **deploy** y abrir las URL de la tabla.

**No** copiar `circuitjs.html` como entrada pública ni sobrescribir la web del laboratorio: la página `circuitjgr.html` se compila directamente desde Vite y se entrega en la raíz del nuevo sitio.

## Verificaciones incluidas

- Compilación del motor CircuitJS1 con los componentes de Circuit JGR y 22 opciones de idioma.
- Página de entrada real `circuitjgr.html`, diferente de `circuitjs.html`.
- Portada `index.html` con enlace al simulador y al laboratorio.
- Ventana «Acerca de» con identidad **Circuit JGR 1.0**, Jesús Gracia Ruiz y créditos originales.
- Licencia GNU GPLv3 de las adaptaciones, conservando la licencia y atribuciones del programa original.
- Prueba funcional del simulador en Chromium y comprobación de los formatos numéricos editables.

La publicación depende de la creación y configuración del repositorio de usuario; el flujo de pruebas de la rama `circuits-jgr-1.0` no publica directamente en GitHub Pages.
