"""Recette en vigueur : invitation visite et parcours de financement.

Les critères historiques de chiffres/vidéos ont été remplacés le 18 novembre.
"""
from pathlib import Path
import runpy

runpy.run_path(str(Path(__file__).resolve().parents[1] / "aides" / "verifier_navigateur.py"), run_name="__main__")
