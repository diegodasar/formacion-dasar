# Formación en Gestión Patrimonial · DASAR

Plataforma web de formación interna para consultores patrimoniales de **DASAR Gestión Patrimonial**.
Sitio estático (HTML, CSS y JavaScript, sin dependencias de build) listo para publicar en **GitHub Pages**.

## Contenido

| Módulo | Estado |
|---|---|
| 0 · Presentación e introducción | ✅ Completo (con casos prácticos y autoevaluación) |
| 1 · Marco legislativo e institucional | 🟠 Esqueleto (objetivos + índice) |
| 2 · Diagnóstico patrimonial 360º *(núcleo)* | 🟠 Esqueleto |
| 3 · Los tributos y su interconexión | 🟠 Esqueleto |
| 4 · Estructuras y operaciones complejas | 🟠 Esqueleto |
| 5 · Planificación patrimonial y sucesoria | 🟠 Esqueleto |
| 6 · Casos prácticos y metodología | 🟠 Esqueleto |

## Funciones

- **Autoevaluación** por módulo con corrección automática y explicación.
- **Seguimiento de progreso** guardado en el navegador (`localStorage`); al superar un test (≥70%) el módulo se marca como completado.
- **Casos prácticos** desplegables con planteamiento y solución.
- Diseño responsive y 100% con la marca (blanco, `#010101`, `#921A1C`, tipografía Jost).

## Estructura de archivos

```
site/
├── index.html            · home y programa
├── modulo-0.html … 6.html · módulos
├── README.md
├── .nojekyll
└── assets/
    ├── css/styles.css
    ├── js/app.js
    └── logos/            · logos DASAR (SVG y PNG)
```

## Cómo publicarlo en GitHub Pages

1. Crea un repositorio nuevo en GitHub (p. ej. `formacion-dasar`).
2. Sube el **contenido de la carpeta `site/`** a la raíz del repositorio (que `index.html` quede en la raíz).
   ```bash
   git init
   git add .
   git commit -m "Formación DASAR · plataforma inicial"
   git branch -M main
   git remote add origin https://github.com/USUARIO/formacion-dasar.git
   git push -u origin main
   ```
3. En el repositorio, ve a **Settings → Pages**.
4. En *Build and deployment*, elige **Deploy from a branch**, rama `main`, carpeta `/ (root)`.
5. Guarda. En un minuto tendrás la web publicada en `https://USUARIO.github.io/formacion-dasar/`.

> El archivo `.nojekyll` evita que GitHub Pages procese el sitio con Jekyll (innecesario aquí).

## Ver en local

Abre `index.html` en el navegador, o levanta un servidor simple:

```bash
cd site
python3 -m http.server 8080
# abre http://localhost:8080
```

## Personalización rápida

- **Colores y tipografía:** variables al inicio de `assets/css/styles.css`.
- **Módulos y estado:** array `MODULES` al inicio de `assets/js/app.js`.
- **Contenido:** cada módulo es un `.html` independiente y editable.

---

© DASAR Gestión Patrimonial · Documento de uso formativo interno. No constituye asesoramiento fiscal ni legal.
