#!/usr/bin/env python3
"""Prueba el camino de PR atrasado usando el bloque real de auto-merge.yml.

La red se reemplaza por una funcion ``gh`` controlada. Asi se puede sabotear el
secreto y contar exactamente cuantos ``update-branch`` intenta el guardian sin
tocar ningun PR real.
"""

import io
import os
import shlex
import shutil
import subprocess
import sys
import tempfile
import textwrap


RUTA = sys.argv[1]
WORKFLOW = io.open(RUTA, encoding="utf-8").read()
BASH = shutil.which("bash")
if os.name == "nt":
    git_bash = os.path.join(os.environ.get("ProgramFiles", ""), "Git", "bin", "bash.exe")
    if os.path.exists(git_bash):
        BASH = git_bash
if not BASH:
    raise SystemExit("No se encontro bash para ejecutar la prueba.")

INICIO = WORKFLOW.index('            case "$base" in')
FIN = WORKFLOW.index("\n            # YA NO ESTA ATRASADO", INICIO)
BLOQUE = textwrap.dedent(WORKFLOW[INICIO:FIN])


def ejecutar(
    nombre,
    filas,
    token,
    update_rc,
    actualizaciones_esperadas,
    merges_esperados,
    rc_esperado,
):
    """Ejecuta el fragmento real y valida efectos, salida y codigo final."""
    with tempfile.TemporaryDirectory() as tmp:
        actualizaciones = "actualizaciones.txt"
        merges = "merges.txt"
        script = f"""\
set -uo pipefail
actualizaciones={shlex.quote(actualizaciones)}
merges={shlex.quote(merges)}
token_update_rc={update_rc}
falla_pat_ocurrio=0
gh() {{
  if [ "$1 $2" = "pr view" ]; then
    case "$*" in
      *"--json headRefOid"*) printf 'sha-%s\\n' "$n" ;;
      *"--json files"*) printf '1\\n' ;;
      *"--json comments"*) : ;;
    esac
    return 0
  fi
  if [ "$1" = "api" ]; then
    printf '%s\\n' "$atras"
    return 0
  fi
  if [ "$1 $2" = "pr edit" ] || [ "$1 $2" = "pr comment" ]; then
    return 0
  fi
  if [ "$1 $2" = "pr update-branch" ]; then
    printf '%s\\n' "$n" >> "$actualizaciones"
    return "$token_update_rc"
  fi
  printf 'gh simulado recibio una llamada inesperada: %s\\n' "$*" >&2
  return 97
}}
REPO=Coste-AR/CosteAR-admin
CIRCUITO_TOKEN={shlex.quote(token)}
for fila in {' '.join(shlex.quote('|'.join(map(str, fila))) for fila in filas)}; do
  IFS='|' read -r n base atras <<<"$fila"
  estado=CLEAN
{textwrap.indent(BLOQUE, '  ')}
  printf '%s\\n' "$n" >> "$merges"
done
[ "$falla_pat_ocurrio" -eq 0 ] || exit 1
"""
        ruta_script = os.path.join(tmp, "caso.sh")
        io.open(ruta_script, "w", encoding="utf-8", newline="\n").write(script)
        resultado = subprocess.run(
            [BASH, ruta_script], capture_output=True, text=True, cwd=tmp
        )
        ruta_actualizaciones = os.path.join(tmp, actualizaciones)
        if os.path.exists(ruta_actualizaciones):
            hechos = io.open(ruta_actualizaciones, encoding="utf-8").read().split()
        else:
            hechos = []
        ruta_merges = os.path.join(tmp, merges)
        if os.path.exists(ruta_merges):
            mergeados = io.open(ruta_merges, encoding="utf-8").read().split()
        else:
            mergeados = []
        salida = resultado.stdout + resultado.stderr

    errores = []
    if resultado.returncode != rc_esperado:
        errores.append(f"codigo={resultado.returncode}, esperado={rc_esperado}")
    if hechos != [str(n) for n in actualizaciones_esperadas]:
        errores.append(
            f"update-branch={hechos}, esperado={actualizaciones_esperadas}"
        )
    if mergeados != [str(n) for n in merges_esperados]:
        errores.append(f"merge={mergeados}, esperado={merges_esperados}")
    if rc_esperado != 0 and "CIRCUITO_PAT" not in salida:
        errores.append("la falla no nombra CIRCUITO_PAT")

    if errores:
        print(f"FALLA  {nombre}: {'; '.join(errores)}")
        for linea in salida.splitlines():
            if linea.strip():
                print(f"       > {linea[:180]}")
        return 1
    print(f"  OK   {nombre}")
    return 0


fallos = 0

# La lista debe traer la fecha y ordenarse antes del while. Si se confia en el
# orden por defecto de GitHub, el PR elegido puede ser el mas nuevo.
inicio_loop = WORKFLOW.index("while read -r pr;")
prefijo_loop = WORKFLOW[:inicio_loop]
orden_ok = "createdAt" in prefijo_loop and "sort_by(.createdAt)" in prefijo_loop
if orden_ok:
    print("  OK   los candidatos se ordenan del mas viejo al mas nuevo")
else:
    print("FALLA  no hay un orden explicito por createdAt antes de recorrer los PR")
    fallos += 1

falla_diferida_ok = (
    "falla_pat_ocurrio=0" in prefijo_loop
    and 'done < <(echo "$pendientes" | jq -c \'.[]\')' in WORKFLOW[inicio_loop:]
    and 'if [ "$falla_pat_ocurrio" -ne 0 ]; then' in WORKFLOW[inicio_loop:]
)
if falla_diferida_ok:
    print("  OK   la falla del PAT se informa despues de recorrer toda la cola")
else:
    print("FALLA  el workflow no difiere el rojo del PAT hasta despues del bucle")
    fallos += 1

fallos += ejecutar(
    "sin secreto: falla visible y no empuja",
    [(11, "dev", 2)],
    token="",
    update_rc=0,
    actualizaciones_esperadas=[],
    merges_esperados=[],
    rc_esperado=1,
)
fallos += ejecutar(
    "token vencido: falla visible y deja el PR para una persona",
    [(11, "dev", 2)],
    token="vencido",
    update_rc=1,
    actualizaciones_esperadas=[11],
    merges_esperados=[],
    rc_esperado=1,
)
fallos += ejecutar(
    "sin secreto, dos PR: el atrasado no bloquea al que esta al dia",
    [(11, "dev", 2), (12, "dev", 0)],
    token="",
    update_rc=0,
    actualizaciones_esperadas=[],
    merges_esperados=[12],
    rc_esperado=1,
)
fallos += ejecutar(
    "dos atrasados: actualiza solo el mas viejo",
    [(11, "dev", 2), (12, "dev", 1)],
    token="presente",
    update_rc=0,
    actualizaciones_esperadas=[11],
    merges_esperados=[],
    rc_esperado=0,
)
fallos += ejecutar(
    "staging y main: nunca ejecuta update-branch",
    [(21, "staging", 3), (22, "main", 4)],
    token="presente",
    update_rc=0,
    actualizaciones_esperadas=[],
    merges_esperados=[],
    rc_esperado=0,
)

print()
print("TODOS LOS CASOS PASAN" if fallos == 0 else f"{fallos} CASO(S) EN ROJO")
sys.exit(1 if fallos else 0)
