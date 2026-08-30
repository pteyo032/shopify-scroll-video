<p align="right"><a href="README.md">Read in English</a></p>

# Shopify Scroll Video — Vidéo produit pilotée par le scroll, façon Apple

[![Theme Check](https://github.com/pteyo032/shopify-scroll-video/actions/workflows/theme-check.yml/badge.svg)](https://github.com/pteyo032/shopify-scroll-video/actions/workflows/theme-check.yml)

Une section pleine largeur qui épingle une vidéo produit à l'écran et fait
avancer sa lecture image par image au rythme du scroll — pas de bouton
play, aucun contrôle vidéo visible, juste la page qui réagit au scroll.
Entièrement réversible : on scrolle vers le haut, la vidéo recule. Quelques
blocks "infobulle" configurables peuvent mettre en avant des
caractéristiques précises du produit par-dessus la vidéo, chacun avec sa
propre position, sa fenêtre de temps, et son fondu d'entrée/sortie.

Conçu pour le thème **Shopify Horizon**. Aucune app tierce, aucune
librairie externe — un seul web component qui pilote `video.currentTime`
à partir de la position de scroll.

## Fonctionnalités

- Vidéo épinglée plein écran (`position: sticky`) pendant qu'un "espaceur"
  de scroll, de longueur réglable, la fait défiler — le réglage
  **Distance de scroll** contrôle combien de scroll est nécessaire pour
  voir toute la vidéo, directement depuis l'éditeur de thème
- Entièrement réversible : scroller vers le haut fait vraiment reculer la
  vidéo, pas juste la mettre en pause
- Jusqu'à quelques blocks infobulle, chacun configurable indépendamment :
  position X/Y, temps de début/fin (secondes décimales), fondu
  d'entrée/sortie, longueur et épaisseur de la ligne, et de quel côté
  (gauche/droite) le texte s'étend — le cercle repère reste toujours
  exactement fixé sur son point configuré, peu importe la direction
- **Aucune vidéo sur mobile** — en dessous de 750px, la section affiche
  jusqu'à 3 images empilées à la place, et le `src` de la vidéo n'est
  jamais assigné, donc aucun octet vidéo n'est jamais chargé sur mobile
- Respecte `prefers-reduced-motion` et fonctionne avec JavaScript
  désactivé — les deux cas basculent sur une lecture normale en boucle
  plutôt que le scrub piloté par le scroll
- Titre de section, couleur d'accent et fond de section sont tous
  éditables depuis l'éditeur de thème ; les tailles de police du titre et
  des textes d'infobulle sont ajustables indépendamment

## Contenu du dépôt

Ce dépôt contient **uniquement le code custom de cette fonctionnalité** —
pas le thème Horizon complet, qui appartient à Shopify. Ces fichiers sont
à déposer dans un thème Horizon (ou dérivé de Horizon) existant.

| Chemin | Ce que c'est |
|---|---|
| `sections/section-video-scroll.liquid` | La section — markup, tout le CSS, le schema |
| `blocks/video-scroll-tooltip.liquid` | Le block enfant infobulle |
| `assets/video-scroll.js` | Le web component `<video-scroll-component>` — écoute du scroll, calcul du scrub, visibilité des infobulles |
| `locales/*.json`, `locales/*.schema.json` | Traductions anglais + français (textes du site et labels de l'éditeur) |
| `docs/integration-guide.md` | Comment l'installer, obtenir une URL vidéo utilisable, et ce que fait chaque réglage |
| `docs/gotchas.md` | Pièges techniques découverts en construisant cette feature — plusieurs sont spécifiques à l'architecture de scroll propre à Horizon, pour ne pas les redécouvrir |

## Démarrage rapide

1. Copie `sections/`, `blocks/` et `assets/` dans ton thème, et fusionne
   les clés de `locales/` dans les tiennes.
2. Uploade ta vidéo directement dans **Settings → Files** de l'admin
   Shopify (pas le sélecteur vidéo natif — voir `docs/integration-guide.md`
   pour comprendre pourquoi), puis colle son URL dans le réglage
   **Video URL** de la section.
3. Ajoute la section **Video Scroll** à un template depuis l'éditeur de
   thème. Ajoute des blocks **Tooltip** en dessous pour mettre en avant
   des moments précis de la vidéo.

Voir `docs/integration-guide.md` pour le détail complet de chaque réglage
et le fonctionnement réel du mécanisme de scrub.

## Pourquoi cette feature était plus difficile qu'elle n'y paraît

C'est la première fonctionnalité pilotée par le scroll (plutôt que par un
clic ou un survol) construite sur ce thème. Presque chaque bug remontait à
quelque chose de vraiment non documenté, soit dans l'architecture de
scroll propre à Horizon, soit dans une limite non documentée de la
plateforme Shopify — pas de la logique applicative. En résumé : Horizon
fait défiler un autre élément que `window` à partir de 990px, et Shopify
plafonne les réglages `range` à 101 valeurs au total. Liste complète, avec
le raisonnement et la correction pour chacun, dans `docs/gotchas.md`.

## Licence

MIT — voir `LICENSE`.
