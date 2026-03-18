#!/bin/bash

# Script de Compilación - TT Docs
# Uso: ./compile.sh TT1
# O:    ./compile.sh primer-avance

set -e

# Variables
DOCS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCES_DIR="$DOCS_ROOT/sources"
PDF_DIR="$DOCS_ROOT/pdf"
BUILD_DIR="$DOCS_ROOT/_build"
BIBLIO_DIR="$DOCS_ROOT/_bibliografia"

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Validar argumentos
if [ $# -eq 0 ]; then
    print_error "❌ Uso: $0 <nombre_documento>"
    echo ""
    echo "Ejemplos:"
    echo "  $0 TT1"
    echo "  $0 primer-avance"
    echo "  $0 cronograma"
    echo ""
    echo "Documentos disponibles:"
    ls -1 "$SOURCES_DIR"/*.tex 2>/dev/null | xargs -n1 basename | sed 's/\.tex//' | sed 's/^/  - /'
    exit 1
fi

DOCUMENT="$1"
TEX_FILE="$SOURCES_DIR/${DOCUMENT}.tex"

# Validar que el archivo existe
if [ ! -f "$TEX_FILE" ]; then
    print_error "Archivo no encontrado: $TEX_FILE"
    exit 1
fi

print_info "═══════════════════════════════════════════════════════"
print_info "Compilando: $DOCUMENT"
print_info "═══════════════════════════════════════════════════════"
print_info "Ubicación: $TEX_FILE"

# Compilar
cd "$SOURCES_DIR"

print_info "Paso 1/3: Limpiando archivos anteriores..."
rm -f "${DOCUMENT}".{aux,log,toc,out,fls,fdb_latexmk,blg} 2>/dev/null || true
print_success "Limpieza completada"

print_info "Paso 2/3: Compilando con latexmk..."
if latexmk -pdf -interaction=nonstopmode "$DOCUMENT.tex" > /dev/null 2>&1; then
    print_success "Compilación exitosa"
else
    print_error "Error en compilación"
    echo "Log de error:"
    tail -30 "${DOCUMENT}.log" 2>/dev/null || echo "No log file found"
    exit 1
fi

print_info "Paso 3/3: Organizando archivos generados..."

# Mover archivos a las carpetas correctas
mkdir -p "$BUILD_DIR" "$PDF_DIR"

# Mover archivos de build
mv "${DOCUMENT}".{aux,log,toc,out,fls,fdb_latexmk,blg,bbl} "$BUILD_DIR" 2>/dev/null || true

# Mover PDF si existe
if [ -f "${DOCUMENT}.pdf" ]; then
    mv "${DOCUMENT}.pdf" "$PDF_DIR/"
    print_success "PDF movido a: $PDF_DIR/${DOCUMENT}.pdf"
else
    print_warning "PDF no generado (revisar errores arriba)"
fi

cd "$DOCS_ROOT"

print_info "═══════════════════════════════════════════════════════"
print_success "Compilación completada para: $DOCUMENT"
print_info "═══════════════════════════════════════════════════════"

# Mostrar información del PDF
if [ -f "$PDF_DIR/${DOCUMENT}.pdf" ]; then
    SIZE=$(du -h "$PDF_DIR/${DOCUMENT}.pdf" | cut -f1)
    print_info "📄 PDF: $PDF_DIR/${DOCUMENT}.pdf ($SIZE)"
    
    # Mostrar comando para abrir
    if command -v xdg-open &> /dev/null; then
        print_info "💡 Abrir con: xdg-open $PDF_DIR/${DOCUMENT}.pdf"
    elif command -v open &> /dev/null; then
        print_info "💡 Abrir con: open $PDF_DIR/${DOCUMENT}.pdf"
    fi
fi

echo ""
print_success "¡Listo!"
