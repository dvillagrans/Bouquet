# 📁 Estructura de Carpeta - Proyecto TT1 (Docs)

Organización clara de archivos del Trabajo Terminal.

---

## 📋 Estructura de Directorios

```
docs/
├── sources/          📝 Archivos fuente LaTeX (.tex)
├── pdf/              📄 Documentos compilados (.pdf)
├── _assets/          🖼️  Logos e imágenes
├── _bibliografia/    📚 Archivos bibliográficos (.bib)
├── _build/           ⚙️  Archivos generados por LaTeX (logs, aux, etc.)
├── _reportes/        ✅ Reportes de validación y manuales
└── README.md         📖 Este archivo
```

---

## 📂 Descripción de Carpetas

### `sources/` - Archivos Fuente LaTeX
**Contenido:** Documentos .tex principales del proyecto

| Archivo | Descripción |
|---------|-------------|
| `TT1.tex` | Documento principal del Trabajo Terminal (47 páginas) |
| `primer-avance.tex` | Primer avance para presentación (31 páginas) |
| `cronograma.tex` | Cronograma del proyecto |

**Uso:**
```bash
# Compilar documento
cd sources
latexmk -pdf -interaction=nonstopmode TT1.tex
```

---

### `pdf/` - Documentos Compilados
**Contenido:** PDFs listos para ver/imprimir/entregar

| Archivo | Tamaño | Páginas | Estado |
|---------|--------|--------|--------|
| `TT1.pdf` | 396 KB | 47 | ✅ Completo |
| `primer-avance.pdf` | 338 KB | 31 | ✅ Validado |
| `cronograma.pdf` | ~100 KB | 1-2 | ✅ Actualizado |

**Nota:** Abrir con Adobe Reader, Preview o visor PDF nativo.

---

### `_assets/` - Logos e Imágenes
**Contenido:** Recursos gráficos para carátula y documentos

| Archivo | Propósito |
|---------|-----------|
| `IPN.png` | Logo Instituto Politécnico Nacional |
| `ESCOM.png` | Logo Escuela Superior de Cómputo |
| `Diego.png` | Foto autor |
| `Nat.png` | Foto autora |

**Tamaño usado en carátula:** 2.6 cm de altura (keepaspectratio).

---

### `_bibliografia/` - Archivos Bibliográficos
**Contenido:** Base de datos de referencias BibTeX

| Archivo | Contenido |
|---------|-----------|
| `refererncias.bib` | 86 entradas bibliográficas completas |

**Estadísticas:**
- Total de entradas: 86
- Entradas citadas: 85
- Entradas no referenciadas: 1 (normal)

---

### `_build/` - Archivos de Compilación (¡No editar!)
**Contenido:** Archivos generados automáticamente por LaTeX

| Tipo | Descripción | Cantidad |
|------|-------------|----------|
| `.aux` | Información auxiliar de referencias | 3 |
| `.log` | Log de compilación | 3 |
| `.fls` | Lista de ficheros | 3 |
| `.fdb_latexmk` | Base de datos de latexmk | 3 |
| `.bbl` | Bibliografía procesada | 2 |
| `.out` | Información de hipervínculos | 3 |
| `.toc` | Tabla de contenidos | 2 |
| `.synctex.gz` | Síncronización editor ↔ PDF | 1 |

**Nota:** Estos archivos se regeneran automáticamente. Puedes eliminarlos sin afectar el proyecto.

---

### `_reportes/` - Validación y Documentación
**Contenido:** Reportes técnicos y manuales de usuario

| Archivo | Descripción | Última Actualización |
|---------|-------------|---------------------|
| `VALIDACION_IEEE.md` | Auditoría de conformidad IEEE | 17 Mar 2026 |
| `REPORTE_VALIDACION_PRIMER_AVANCE.md` | Validación del primer avance | 17 Mar 2026 |
| `Manual_Instalacion.md` | Guía de instalación del proyecto | v1.0 |
| `Manual_Usuario.md` | Guía de uso para usuarios | v1.0 |

---

## 🎯 Flujo de Trabajo Recomendado

### 1️⃣ Editar Documentos
```bash
cd sources/
# Edita TT1.tex, primer-avance.tex, etc.
vim TT1.tex
```

### 2️⃣ Compilar
```bash
# Desde sources/
latexmk -pdf -interaction=nonstopmode TT1.tex

# O desde docs/ (si tienes script compilador)
./compile.sh TT1
```

### 3️⃣ Revisar PDF
```bash
# Los PDFs se generan automáticamente en ../pdf/
open ../pdf/TT1.pdf
```

### 4️⃣ Limpiar Archivos de Build (Opcional)
```bash
# Elimina archivos temporales (se regeneran al recompilar)
rm -rf _build/*
```

---

## 📊 Estadísticas del Proyecto

| Métrica | Valor |
|---------|-------|
| **Documentos LaTeX** | 3 |
| **PDFs Compilados** | 3 |
| **Páginas Totales** | ~80 |
| **Entradas Bibliográficas** | 86 |
| **Logos/Imágenes** | 4 |
| **Reportes de Validación** | 2 |
| **Manuales de Referencia** | 2 |
| **Total de Archivos Organizados** | 40+ |

---

## 🔧 Configuración LaTeX Aplicada

### Preamble Estándar (todos los .tex)
```latex
\documentclass[12pt]{report}
\usepackage[spanish,es-nodecimaldot]{babel}
\usepackage{geometry}
\geometry{letterpaper, top=2cm, bottom=2cm, left=3cm, right=2cm}
\usepackage{cite}
\bibliographystyle{ieeetr}
\usepackage{mathptmx}          % Times New Roman
\usepackage{booktabs}          % Tablas profesionales
\usepackage{xcolor}            % Colores
\setstretch{1.0}               % Sin espaciado extra
```

### Convenciones Aplicadas
- ✅ Numeración IEEE para citas [1], [2]...
- ✅ Tablas con numeración romana (TABLA I, II, III)
- ✅ Márgenes IPN/ESCOM (2-2-3-2 cm)
- ✅ Fuente Times New Roman 12pt
- ✅ Bordes de tabla solo horizontales

---

## 📦 Referencia Rápida de Comandos

```bash
# Compilar un documento
cd sources/ && latexmk -pdf -interaction=nonstopmode TT1.tex

# Ver estructura
cd ../ && find . -maxdepth 2 -type f | sort

# Limpiar builds
rm -rf _build/*

# Contar palabras (aproximado)
wc -w sources/*.tex

# Ver tamaño de PDFs
ls -lh pdf/
```

---

## 📝 Notas Importantes

### ⚠️ No Mover Archivos Manualmente
Los scripts de compilación esperan que los archivos estén en estas carpetas. Si moves archivos:
1. Actualiza las rutas en los comandos de compilación
2. Reconfigura hyperref si es necesario

### 🔐 Respaldo
Considera hacer backup de:
- `sources/` (archivos fuente)
- `_bibliografia/` (referencias)
- `_assets/` (imágenes, logos)

Los archivos en `_build/` se pueden regenerar.

### 🚀 Para Nueva Compilación Completa
```bash
# Limpiar todo y recompilar
cd sources/
rm -rf *.aux *.log *.toc *.out ../_build/*
latexmk -pdf -interaction=nonstopmode TT1.tex
```

---

## 📞 Contacto / Soporte

Para problemas con compilación o estructura:
1. Verifica que todos los `.tex` estén en `sources/`
2. Verifica que `_bibliografia/refererncias.bib` exista
3. Verifica que logos estén en `_assets/`
4. Ejecuta desde la carpeta correcta

---

**Última actualización:** 17 de marzo de 2026  
**Usuario:** dvillagrans  
**Proyecto:** Sistema Omnicanal para Restaurantes (TT1)
