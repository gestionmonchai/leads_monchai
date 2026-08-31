# Assemble les pages completes de la file d'attente :
#   gabarit/article.html + fragments/NN-slug.html + manifest.json
#     -> articles/NN-slug.html (page complete, placeholders {{DATE_*}} conserves)
#   gabarit/carte.html + manifest.json
#     -> articles/NN-slug.carte.html (carte pour l'index de section)
# Usage : pwsh outils/assembler.ps1   (depuis la racine de la branche file-attente)

param([string]$Racine = (Split-Path $PSScriptRoot))

$manifest = Get-Content (Join-Path $Racine 'manifest.json') -Raw | ConvertFrom-Json
$gabarit  = Get-Content (Join-Path $Racine 'gabarit/article.html') -Raw
$carteG   = Get-Content (Join-Path $Racine 'gabarit/carte.html') -Raw
New-Item -ItemType Directory -Force (Join-Path $Racine 'articles') | Out-Null

foreach ($a in $manifest.articles) {
  $chemFrag = Join-Path $Racine "fragments/$($a.fichier).html"
  if (-not (Test-Path $chemFrag)) { Write-Warning "Fragment manquant : $($a.fichier)"; continue }
  $frag = (Get-Content $chemFrag -Raw).TrimEnd()

  $page = $gabarit.
    Replace('{{TITRE_TAG}}',   $a.titre_tag).
    Replace('{{DESCRIPTION}}', $a.description).
    Replace('{{OG_TITRE}}',    $a.og_titre).
    Replace('{{OG_DESC}}',     $a.description).
    Replace('{{SLUG}}',        $a.slug).
    Replace('{{IMAGE}}',       $a.image).
    Replace('{{CONTENU}}',     $frag)
  Set-Content (Join-Path $Racine "articles/$($a.fichier).html") $page -NoNewline -Encoding UTF8

  $carte = $carteG.
    Replace('{{SLUG}}',         $a.slug).
    Replace('{{IMAGE}}',        $a.image).
    Replace('{{TAG}}',          $a.tag).
    Replace('{{CARTE_TITRE}}',  $a.carte_titre).
    Replace('{{CARTE_RESUME}}', $a.carte_resume)
  Set-Content (Join-Path $Racine "articles/$($a.fichier).carte.html") $carte -NoNewline -Encoding UTF8

  Write-Host "Assemblé : $($a.fichier)"
}
