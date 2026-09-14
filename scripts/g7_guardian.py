"""Detecta identificadores protegidos sin revelarlos en su salida."""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path
from typing import Iterable


MAX_FINDINGS = 20


def normalizar(texto: str) -> str:
    """Minúsculas, sin acentos ni puntuación, conservando límites de palabra."""
    descompuesto = unicodedata.normalize("NFKD", texto.casefold())
    sin_acentos = "".join(
        caracter
        for caracter in descompuesto
        if unicodedata.category(caracter) != "Mn"
    )
    return " ".join(re.findall(r"[^\W_]+", sin_acentos, flags=re.UNICODE))


def cargar_identificadores(path: Path) -> tuple[list[tuple[str, ...]], str | None]:
    if not path.is_file():
        return [], "list_missing"

    identificadores: list[tuple[str, ...]] = []
    for linea in path.read_text(encoding="utf-8").splitlines():
        if not linea.strip() or linea.lstrip().startswith("#"):
            continue
        tokens = tuple(normalizar(linea).split())
        if tokens:
            identificadores.append(tokens)

    if not identificadores:
        return [], "list_empty"
    return identificadores, None


def coincide(texto: str, identificadores: Iterable[tuple[str, ...]]) -> bool:
    tokens = normalizar(texto).split()
    for protegido in identificadores:
        ancho = len(protegido)
        if any(tuple(tokens[i : i + ancho]) == protegido for i in range(len(tokens) - ancho + 1)):
            return True
    return False


def rutas_nuevas(diff: str) -> Iterable[str]:
    vistas: set[str] = set()
    for linea in diff.splitlines():
        if not linea.startswith("+++ "):
            continue
        valor = linea[4:]
        if valor == "/dev/null":
            continue
        ruta = valor[2:] if valor.startswith("b/") else valor
        if ruta not in vistas:
            vistas.add(ruta)
            yield ruta


def lineas_agregadas(diff: str) -> Iterable[tuple[str, int, str]]:
    """Entrega ruta, línea nueva y contenido para cada alta de un unified diff."""
    ruta: str | None = None
    linea_nueva: int | None = None

    for linea in diff.splitlines():
        if linea.startswith("+++ "):
            valor = linea[4:]
            if valor == "/dev/null":
                ruta = None
            else:
                ruta = valor[2:] if valor.startswith("b/") else valor
            continue

        hunk = re.match(r"^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@", linea)
        if hunk:
            linea_nueva = int(hunk.group(1))
            continue

        if ruta is None or linea_nueva is None:
            continue
        if linea.startswith("+"):
            yield ruta, linea_nueva, linea[1:]
            linea_nueva += 1
        elif linea.startswith("-"):
            continue
        elif linea.startswith("\\ No newline at end of file"):
            continue
        else:
            linea_nueva += 1


def evaluar(lista_path: Path, pr: dict[str, object], diff: str) -> dict[str, object]:
    identificadores, error = cargar_identificadores(lista_path)
    if error:
        return {"verdict": "failure", "reason": error, "findings": [], "total": 0}

    ubicaciones: list[str] = []
    total = 0

    def registrar(ubicacion: str, texto: str) -> None:
        nonlocal total
        if coincide(texto, identificadores):
            total += 1
            if len(ubicaciones) < MAX_FINDINGS:
                ubicaciones.append(ubicacion)

    rutas_protegidas = {
        ruta for ruta in rutas_nuevas(diff) if coincide(ruta, identificadores)
    }
    for ruta in rutas_protegidas:
        registrar("ruta de un archivo modificado", ruta)

    for ruta, numero, contenido in lineas_agregadas(diff):
        # Si la propia ruta contiene un identificador, tampoco se la copia al
        # comentario. Se conserva la línea para que el hallazgo sea ubicable.
        ubicacion = (
            f"archivo con ruta protegida, linea {numero}"
            if ruta in rutas_protegidas
            else f"archivo `{ruta}`, linea {numero}"
        )
        registrar(ubicacion, contenido)

    registrar("titulo del PR", str(pr.get("title") or ""))
    for numero, linea in enumerate(str(pr.get("body") or "").splitlines(), start=1):
        registrar(f"cuerpo del PR, linea {numero}", linea)

    commits = pr.get("commits")
    if not isinstance(commits, list):
        raise ValueError("la respuesta del PR no contiene una lista de commits")
    for commit in commits:
        if not isinstance(commit, dict):
            raise ValueError("la respuesta del PR contiene un commit invalido")
        oid = str(commit.get("oid") or "")
        referencia = oid[:7] if re.fullmatch(r"[0-9a-fA-F]{7,40}", oid) else "desconocido"
        mensaje = "\n".join(
            [str(commit.get("messageHeadline") or ""), str(commit.get("messageBody") or "")]
        )
        for numero, linea in enumerate(mensaje.splitlines(), start=1):
            registrar(f"commit `{referencia}`, linea {numero}", linea)

    if total:
        return {
            "verdict": "failure",
            "reason": "matches",
            "findings": ubicaciones,
            "total": total,
        }
    return {"verdict": "success", "reason": "clean", "findings": [], "total": 0}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--lista", required=True, type=Path)
    parser.add_argument("--pr-json", required=True, type=Path)
    parser.add_argument("--diff", required=True, type=Path)
    parser.add_argument("--resultado", required=True, type=Path)
    args = parser.parse_args()

    try:
        pr = json.loads(args.pr_json.read_text(encoding="utf-8"))
        diff = args.diff.read_text(encoding="utf-8")
        resultado = evaluar(args.lista, pr, diff)
        args.resultado.write_text(
            json.dumps(resultado, ensure_ascii=True, separators=(",", ":")),
            encoding="utf-8",
        )
        return 0
    except Exception:
        # No se imprime la excepción: podría contener una porción del material
        # inspeccionado. El workflow publica un failure genérico y fail-closed.
        print("G7 no pudo evaluar las entradas.", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
