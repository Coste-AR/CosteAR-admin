"""Prueba los caminos de G7 y que ninguna salida revele la lista privada."""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path


RAIZ = Path(__file__).resolve().parents[1]
GUARDIAN = RAIZ / "scripts" / "g7_guardian.py"
WORKFLOW = RAIZ / ".github" / "workflows" / "g7.yml"
TERMINOS = ("Puerto Neblina", "Proveedor Cometa")


def ejecutar(lista: str | None, pr: dict[str, object], diff: str) -> tuple[int, str, dict[str, object] | None]:
    with tempfile.TemporaryDirectory() as temporal:
        base = Path(temporal)
        lista_path = base / "lista.txt"
        if lista is not None:
            lista_path.write_text(lista, encoding="utf-8")
        pr_path = base / "pr.json"
        pr_path.write_text(json.dumps(pr), encoding="utf-8")
        diff_path = base / "cambio.diff"
        diff_path.write_text(diff, encoding="utf-8")
        resultado_path = base / "resultado.json"
        proceso = subprocess.run(
            [sys.executable, str(GUARDIAN), "--lista", str(lista_path), "--pr-json", str(pr_path), "--diff", str(diff_path), "--resultado", str(resultado_path)],
            capture_output=True,
            text=True,
            check=False,
        )
        salida = proceso.stdout + proceso.stderr
        resultado = json.loads(resultado_path.read_text(encoding="utf-8")) if resultado_path.exists() else None
        material_publicable = salida + (json.dumps(resultado) if resultado else "")
        for termino in TERMINOS:
            assert termino.casefold() not in material_publicable.casefold(), "G7 revelo un identificador"
        return proceso.returncode, salida, resultado


def pr_limpio() -> dict[str, object]:
    return {
        "title": "Agregar una prueba ficticia",
        "body": "Closes #123",
        "commits": [{"oid": "a" * 40, "messageHeadline": "test: agregar caso", "messageBody": ""}],
    }


def exigir(nombre: str, condicion: bool, errores: list[str]) -> None:
    if condicion:
        print(f"OK     {nombre}")
    else:
        print(f"FALLA  {nombre}")
        errores.append(nombre)


def main() -> int:
    errores: list[str] = []
    lista = "# valores ficticios\nPuerto Neblina\nProveedor Cometa\n"
    diff_base = "diff --git a/src/demo.ts b/src/demo.ts\n--- a/src/demo.ts\n+++ b/src/demo.ts\n@@ -3,0 +4,2 @@\n"

    rc, _, resultado = ejecutar(lista, pr_limpio(), diff_base + "+// llega desde PUERTO, néblina.\n+const sano = true;\n")
    exigir(
        "falla 1: comentario del diff, con archivo y linea",
        rc == 0 and resultado is not None and resultado["verdict"] == "failure" and resultado["reason"] == "matches" and resultado["findings"] == ["archivo `src/demo.ts`, linea 4"],
        errores,
    )

    pr = pr_limpio()
    pr["body"] = "Primera linea\nVisita a Puerto-Neblina"
    rc, _, resultado = ejecutar(lista, pr, diff_base + "+const sano = true;\n")
    exigir(
        "falla 2: cuerpo del PR, con numero de linea",
        rc == 0 and resultado is not None and resultado["findings"] == ["cuerpo del PR, linea 2"],
        errores,
    )

    pr = pr_limpio()
    pr["commits"] = [{"oid": "b" * 40, "messageHeadline": "feat: ajustar datos", "messageBody": "Caso del proveedor cometa."}]
    rc, _, resultado = ejecutar(lista, pr, diff_base + "+const sano = true;\n")
    exigir(
        "falla 3: mensaje de commit, sin revelar el termino",
        rc == 0 and resultado is not None and resultado["findings"] == ["commit `bbbbbbb`, linea 2"],
        errores,
    )

    for etiqueta, contenido, razon in (
        ("lista ausente", None, "list_missing"),
        ("lista vacia", "# solo cabecera\n\n", "list_empty"),
    ):
        rc, _, resultado = ejecutar(contenido, pr_limpio(), diff_base + "+const sano = true;\n")
        exigir(
            f"falla 4: {etiqueta} es fail-closed",
            rc == 0 and resultado is not None and resultado["verdict"] == "failure" and resultado["reason"] == razon,
            errores,
        )

    rc, _, resultado = ejecutar(lista, pr_limpio(), diff_base + "+const sano = true;\n")
    exigir(
        "verde: un cambio normal obtiene success",
        rc == 0 and resultado is not None and resultado["verdict"] == "success" and resultado["findings"] == [],
        errores,
    )

    pr = pr_limpio()
    pr["title"] = "Ajustar Puerto Neblina"
    rc, _, resultado = ejecutar(lista, pr, diff_base + "+const sano = true;\n")
    exigir(
        "titulo: tambien forma parte de la superficie protegida",
        rc == 0 and resultado is not None and resultado["findings"] == ["titulo del PR"],
        errores,
    )

    diff_ruta = "diff --git a/src/viejo.ts b/src/Puerto-Neblina.ts\n--- a/src/viejo.ts\n+++ b/src/Puerto-Neblina.ts\n@@ -1 +1 @@\n-const viejo = true;\n+const proveedor = 'Proveedor Cometa';\n"
    rc, _, resultado = ejecutar(lista, pr_limpio(), diff_ruta)
    exigir(
        "una ruta protegida se detecta pero tampoco se revela",
        rc == 0
        and resultado is not None
        and resultado["findings"] == [
            "ruta de un archivo modificado",
            "archivo con ruta protegida, linea 1",
        ],
        errores,
    )

    workflow = WORKFLOW.read_text(encoding="utf-8")
    chequeo_pat = workflow.index('if [ -z "${GH_TOKEN:-}" ]')
    primer_status = workflow.index("publicar_estado pending")
    exigir(
        "falla 5: CIRCUITO_PAT vacio corta antes de publicar estados",
        "GH_TOKEN: ${{ secrets.CIRCUITO_PAT }}" in workflow
        and chequeo_pat < primer_status
        and "el repositorio publico queda fail-closed" in workflow[chequeo_pat:primer_status],
        errores,
    )
    exigir(
        "el contrato usa el contexto exacto y los tres estados",
        "contexto='G7/datos-de-cliente'" in workflow
        and "publicar_estado pending" in workflow
        and "publicar_estado success" in workflow
        and "publicar_estado failure" in workflow,
        errores,
    )

    print("TODOS LOS CASOS PASAN" if not errores else f"{len(errores)} CASO(S) EN ROJO")
    return 1 if errores else 0


if __name__ == "__main__":
    raise SystemExit(main())
