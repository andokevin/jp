# -*- coding: utf-8 -*-
"""
Génère JP_Deck.pptx — dossier de présentation investisseurs & partenaires.

Direction artistique
--------------------
Fond aubergine encre (#1A1220), neutre biaisé vers l'accent.
Accents codés par acte : ember = le problème, fuchsia = la solution, jade = le modèle.
Display serif éditorial (Georgia, chassé serré) / corps humaniste (Trebuchet MS) /
utilitaire mono (Consolas) pour les repères et les chiffres.
Rail supérieur = barre de progression dans le deck, colorée par l'acte.
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn
import copy

# ---------------------------------------------------------------- tokens

INK      = RGBColor(0x1A, 0x12, 0x20)   # fond, aubergine encre
INK_UP   = RGBColor(0x26, 0x1B, 0x2E)   # surface surélevée (cartes)
INK_UP2  = RGBColor(0x31, 0x23, 0x3A)   # surface surélevée +1
PAPER    = RGBColor(0xF3, 0xE9, 0xEE)   # texte principal, blanc cassé rosé
MUTED    = RGBColor(0xA9, 0x9A, 0xA4)   # texte secondaire
FAINT    = RGBColor(0x6B, 0x5C, 0x67)   # filets, texte tertiaire
ACCENT   = RGBColor(0xE4, 0x30, 0x6E)   # fuchsia — la marque, le bouton
EMBER    = RGBColor(0xD9, 0x55, 0x2F)   # acte I, le problème
JADE     = RGBColor(0x2F, 0xBF, 0x9B)   # acte III, le modèle, la confiance
GOLD     = RGBColor(0xE8, 0xB0, 0x4B)   # hypothèses, mises en garde
WHITE    = RGBColor(0xFF, 0xFF, 0xFF)

DISPLAY = "Georgia"        # titres
BODY    = "Trebuchet MS"   # corps
MONO    = "Consolas"       # repères, chiffres, étiquettes

W, H = Inches(13.333), Inches(7.5)
ML, MR = Inches(0.85), Inches(0.85)
CW = W - ML - MR                      # largeur de contenu
RAIL_H = Inches(0.075)
Y_EYE, Y_TITLE = Inches(0.40), Inches(0.88)
Y_FOOT = Inches(6.92)

ACTS = {
    0: ("", ACCENT),
    1: ("ACTE I · LE PROBLÈME", EMBER),
    2: ("ACTE II · LA SOLUTION", ACCENT),
    3: ("ACTE III · LE MODÈLE", JADE),
}

TOTAL = 25

prs = Presentation()
prs.slide_width, prs.slide_height = W, H
BLANK = prs.slide_layouts[6]

# ---------------------------------------------------------------- helpers


def _spacing(run, pts):
    """Chasse (letter-spacing) en points — non exposé par python-pptx."""
    run.font._rPr.set("spc", str(int(round(pts * 100))))


def _no_autofit(tf):
    bodyPr = tf._txBody.find(qn("a:bodyPr"))
    for tag in ("a:normAutofit", "a:spAutoFit"):
        el = bodyPr.find(qn(tag))
        if el is not None:
            bodyPr.remove(el)


def textbox(sl, x, y, w, h, anchor=MSO_ANCHOR.TOP):
    tb = sl.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    _no_autofit(tf)
    return tf


def para(tf, first=False):
    return tf.paragraphs[0] if first else tf.add_paragraph()


def write(p, text, font=BODY, size=13, color=PAPER, bold=False,
          italic=False, spacing=None, caps=False):
    r = p.add_run()
    r.text = text.upper() if caps else text
    r.font.name = font
    r.font.size = Pt(size)
    r.font.bold = bold
    r.font.italic = italic
    r.font.color.rgb = color
    if spacing:
        _spacing(r, spacing)
    return r


def rect(sl, x, y, w, h, fill=None, line=None, line_w=0.75,
         shape=MSO_SHAPE.RECTANGLE, adj=None):
    sh = sl.shapes.add_shape(shape, x, y, w, h)
    if fill is None:
        sh.fill.background()
    else:
        sh.fill.solid()
        sh.fill.fore_color.rgb = fill
    if line is None:
        sh.line.fill.background()
    else:
        sh.line.color.rgb = line
        sh.line.width = Pt(line_w)
    sh.shadow.inherit = False
    if adj is not None:
        try:
            sh.adjustments[0] = adj
        except (IndexError, ValueError):
            pass
    tf = sh.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = Inches(0.18)
    tf.margin_top = tf.margin_bottom = Inches(0.12)
    # Les autoshapes centrent leur texte par défaut : on repasse en fer à gauche,
    # les rares exceptions (le bouton) redéfinissent l'alignement après coup.
    tf.vertical_anchor = MSO_ANCHOR.TOP
    tf.paragraphs[0].alignment = PP_ALIGN.LEFT
    _no_autofit(tf)
    return sh


def slide(act, index, notes=""):
    """Châssis commun : fond, rail de progression, eyebrow, numéro, marque."""
    sl = prs.slides.add_slide(BLANK)
    label, color = ACTS[act]

    rect(sl, 0, 0, W, H, fill=INK)                                  # fond
    rect(sl, 0, 0, W, RAIL_H, fill=INK_UP2)                         # rail, fond
    if index:                                                       # rail, avancée
        rect(sl, 0, 0, int(W * index / TOTAL), RAIL_H, fill=color)

    if label:
        tf = textbox(sl, ML, Y_EYE, Inches(7), Inches(0.3))
        write(para(tf, True), label, MONO, 10, color, bold=True, spacing=1.6)

    if index:
        tf = textbox(sl, W - MR - Inches(2.2), Y_EYE, Inches(2.2), Inches(0.3))
        tf.paragraphs[0].alignment = PP_ALIGN.RIGHT
        write(para(tf, True), "%02d / %d" % (index, TOTAL), MONO, 10, FAINT,
              spacing=1.2)

        tf = textbox(sl, ML, Y_FOOT, Inches(3), Inches(0.3))
        write(para(tf, True), "JP · Je prends", MONO, 9, FAINT, spacing=1.0)

    if notes:
        sl.notes_slide.notes_text_frame.text = notes
    return sl


def title(sl, text, size=40, color=PAPER, y=Y_TITLE, w=None, h=Inches(1.15)):
    tf = textbox(sl, ML, y, w or CW, h)
    p = para(tf, True)
    p.line_spacing = 1.02
    write(p, text, DISPLAY, size, color, bold=True, spacing=-0.6)
    return tf


def kicker(sl, text, y, color=MUTED, size=15, w=None, italic=False):
    """Ligne d'accroche sous le titre."""
    tf = textbox(sl, ML, y, w or CW, Inches(0.5))
    p = para(tf, True)
    p.line_spacing = 1.3
    write(p, text, BODY, size, color, italic=italic)
    return tf


def lead_para(p, text, size=12.5, color=PAPER, lead_color=None):
    """Paragraphe « **Titre.** description » — gras jusqu'au premier point."""
    if "**" in text:
        chunks = text.split("**")
        for i, chunk in enumerate(chunks):
            if not chunk:
                continue
            bold = (i % 2 == 1)
            write(p, chunk, BODY, size,
                  (lead_color or PAPER) if bold else color, bold=bold)
    else:
        write(p, text, BODY, size, color)


def bullets(sl, items, y, size=12.5, gap=9, marker=ACCENT, w=None,
            line_spacing=1.22, lead_color=None):
    tf = textbox(sl, ML, y, w or CW, H - y - Inches(0.7))
    for i, item in enumerate(items):
        p = para(tf, i == 0)
        p.line_spacing = line_spacing
        p.space_after = Pt(gap)
        write(p, "— ", MONO, size, marker, bold=True)
        lead_para(p, item, size, lead_color=lead_color)
    return tf


def numbered(sl, items, y, size=12.5, gap=10, color=ACCENT, w=None):
    tf = textbox(sl, ML, y, w or CW, H - y - Inches(0.7))
    for i, item in enumerate(items):
        p = para(tf, i == 0)
        p.line_spacing = 1.22
        p.space_after = Pt(gap)
        write(p, "%d " % (i + 1), MONO, size + 1, color, bold=True, spacing=0.6)
        lead_para(p, item, size)
    return tf


def col_header(sl, x, y, w, text, color):
    tf = textbox(sl, x, y, w, Inches(0.32))
    write(para(tf, True), text, MONO, 10.5, color, bold=True, spacing=1.4,
          caps=True)
    rect(sl, x, y + Inches(0.34), w, Emu(9525), fill=color)   # filet 0.75pt


def callout(sl, x, y, w, h, text, color=GOLD, size=12.5, bar=True):
    box = rect(sl, x, y, w, h, fill=INK_UP)
    if bar:
        rect(sl, x, y, Inches(0.055), h, fill=color)
    tf = box.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_left = Inches(0.32)
    p = tf.paragraphs[0]
    p.line_spacing = 1.25
    lead_para(p, text, size, lead_color=color)
    return box


TBL_NOSTYLE = "{2D5ABB26-0587-4C30-8999-92F81FD0307C}"   # No Style, No Grid


def table(sl, y, cols, rows, col_w, row_h, head_color=ACCENT,
          size=11.5, head_size=10, first_col_bold=True):
    """Tableau sobre : pas de bordures de thème, filets dessinés au besoin."""
    n_rows, n_cols = len(rows) + 1, len(cols)
    gt = sl.shapes.add_table(n_rows, n_cols, ML, y, CW, row_h * n_rows)
    tbl = gt.table
    tbl._tbl.tblPr.set("firstRow", "1")
    tbl._tbl.tblPr.set("bandRow", "0")
    styleId = tbl._tbl.tblPr.find(qn("a:tableStyleId"))
    if styleId is None:
        from lxml import etree
        styleId = etree.SubElement(tbl._tbl.tblPr, qn("a:tableStyleId"))
    styleId.text = TBL_NOSTYLE

    for i, wdt in enumerate(col_w):
        tbl.columns[i].width = wdt
    for r in range(n_rows):
        tbl.rows[r].height = row_h

    def fill_cell(cell, text, is_head, col_idx, row_idx):
        cell.fill.solid()
        if is_head:
            cell.fill.fore_color.rgb = INK
        else:
            cell.fill.fore_color.rgb = INK_UP if row_idx % 2 else INK
        cell.margin_left = cell.margin_right = Inches(0.14)
        cell.margin_top = cell.margin_bottom = Inches(0.07)
        cell.vertical_anchor = MSO_ANCHOR.MIDDLE
        tf = cell.text_frame
        tf.word_wrap = True
        _no_autofit(tf)
        p = tf.paragraphs[0]
        p.line_spacing = 1.14
        if is_head:
            write(p, text, MONO, head_size, head_color, bold=True,
                  spacing=1.2, caps=True)
        else:
            bold = first_col_bold and col_idx == 0
            write(p, text, BODY, size,
                  PAPER if bold else MUTED, bold=bold)

    for c, head in enumerate(cols):
        fill_cell(tbl.cell(0, c), head, True, c, 0)
    for r, row in enumerate(rows, start=1):
        for c, val in enumerate(row):
            fill_cell(tbl.cell(r, c), val, False, c, r)

    # filet sous l'en-tête, dans la couleur de l'acte
    rect(sl, ML, y + row_h, CW, Emu(12700), fill=head_color)
    return tbl


# ================================================================ SLIDES

# ---- 1. Couverture -------------------------------------------------------
N = ("Ouvrir sur le nom. JP, ce sont les deux mots que les acheteurs écrivent "
     "déjà en commentaire : « je prends ». Notre produit est ce geste, "
     "transformé en bouton. Ne pas expliquer plus — la slide-pivot le fera.")
sl = slide(0, 0, N)
rect(sl, 0, 0, W, RAIL_H, fill=ACCENT)
tf = textbox(sl, ML, Inches(1.55), Inches(9), Inches(0.32))
write(para(tf, True), "Madagascar · Mode · Beauté · Chaussures", MONO, 11,
      MUTED, bold=True, spacing=2.4, caps=True)

tf = textbox(sl, ML, Inches(1.92), Inches(7), Inches(2.0))
p = para(tf, True)
p.line_spacing = 0.92
write(p, "JP", DISPLAY, 148, PAPER, bold=True, spacing=-3.5)

tf = textbox(sl, ML, Inches(4.32), Inches(8), Inches(0.85))
p = para(tf, True)
write(p, "Je prends.", DISPLAY, 48, ACCENT, bold=True, spacing=-1.0)

rect(sl, ML, Inches(5.38), Inches(2.2), Emu(19050), fill=ACCENT)
tf = textbox(sl, ML, Inches(5.62), Inches(8), Inches(0.5))
write(para(tf, True), "Le direct devient une boutique.", BODY, 19, PAPER)

tf = textbox(sl, ML, Inches(6.42), Inches(9), Inches(0.6))
p = para(tf, True)
p.line_spacing = 1.35
write(p, "Dossier de présentation\n", MONO, 10.5, MUTED, spacing=1.4, caps=True)
write(p, "Investisseurs & partenaires", MONO, 10.5, FAINT, spacing=1.4, caps=True)

# le bouton, objet récurrent du deck
btn = rect(sl, W - MR - Inches(3.4), Inches(2.75), Inches(3.4), Inches(1.15),
           fill=ACCENT, shape=MSO_SHAPE.ROUNDED_RECTANGLE, adj=0.28)
btf = btn.text_frame
btf.vertical_anchor = MSO_ANCHOR.MIDDLE
bp = btf.paragraphs[0]
bp.alignment = PP_ALIGN.CENTER
write(bp, "JE PRENDS", BODY, 22, WHITE, bold=True, spacing=2.0)

tf = textbox(sl, W - MR - Inches(3.4), Inches(4.1), Inches(3.4), Inches(0.4))
tf.paragraphs[0].alignment = PP_ALIGN.CENTER
write(para(tf, True), "un geste, pas un commentaire", BODY, 11.5, MUTED,
      italic=True)

# ---- 2. Le marché n'est pas à créer -------------------------------------
N = ("Point clé pour l'investisseur : nous ne créons pas un usage, nous "
     "outillons un usage existant. Le risque d'adoption est donc faible — les "
     "vendeurs n'ont pas une nouvelle habitude à prendre, ils ont une corvée à "
     "supprimer.")
sl = slide(1, 2, N)
tf = textbox(sl, ML, Y_EYE + Inches(0.42), CW, Inches(0.4))
write(para(tf, True), "Le marché n'est pas à créer", BODY, 16, MUTED)
title(sl, "Il est déjà en direct.", 52, PAPER, y=Inches(1.28), h=Inches(1.0))

items = [
    "Chaque soir, des vendeuses et des vendeurs présentent leurs articles en "
    "direct sur les réseaux sociaux. Les acheteurs sont là. Ils regardent, "
    "ils commentent, ils achètent.",
    "Ce qui manque n'est pas la demande.",
]
tf = textbox(sl, ML, Inches(2.75), Inches(8.4), Inches(2.0))
for i, t in enumerate(items):
    p = para(tf, i == 0)
    p.line_spacing = 1.35
    p.space_after = Pt(16)
    write(p, t, BODY, 16, PAPER if i == 0 else MUTED)

callout(sl, ML, Inches(4.85), Inches(8.4), Inches(1.35),
        "**C'est l'outil.** Un réseau social est fait pour faire parler. "
        "Pas pour encaisser, facturer, livrer.", EMBER, 15)

# ---- 3. Problème 1 : personne n'est protégé -----------------------------
N = ("C'est le problème n° 1 : c'est là qu'est l'argent, et c'est là qu'est "
     "l'émotion. Bien montrer que l'arnaque va dans les deux sens — c'est ce "
     "qui justifie une plateforme tierce plutôt qu'un simple outil pour "
     "vendeurs. Une plateforme qui ne protégerait qu'un seul côté ne réglerait "
     "pas le problème de confiance.")
sl = slide(1, 3, N)
title(sl, "Le risque est porté\npar les personnes.", 44, PAPER, h=Inches(1.6))

cw2 = (CW - Inches(0.4)) // 2
for i, (head, body) in enumerate([
    ("Côté acheteur",
     "Un paiement envoyé par mobile money vers un numéro personnel. Puis plus "
     "de nouvelles. Aucun recours."),
    ("Côté vendeur",
     "Des articles réservés en commentaire, puis jamais payés. Le stock est "
     "immobilisé, invendable pendant des jours, pour une commande fantôme."),
]):
    x = ML + i * (cw2 + Inches(0.4))
    col_header(sl, x, Inches(2.75), cw2, head, EMBER)
    tf = textbox(sl, x, Inches(3.35), cw2, Inches(1.7))
    p = para(tf, True)
    p.line_spacing = 1.32
    write(p, body, BODY, 14, PAPER)

callout(sl, ML, Inches(5.35), CW, Inches(1.1),
        "**Au milieu : rien.** Pas de contrat, pas de trace, pas d'arbitre. "
        "Une capture d'écran ne vaut rien.", EMBER, 15)

# ---- 4. Problème 2 : le doute plafonne le panier ------------------------
N = ("C'est l'argument économique du problème : le doute est un coût. Insister "
     "sur le dernier paragraphe, il est rarement formulé et il est décisif "
     "ici : la honte est un frein aussi puissant que la perte d'argent, et "
     "elle explique pourquoi le problème est invisible dans les statistiques — "
     "les victimes se taisent.")
sl = slide(1, 4, N)
title(sl, "Le plafond n'est pas le pouvoir d'achat.\nC'est le doute.",
      38, PAPER, h=Inches(1.5))
kicker(sl, "Pas de facture. Pas d'historique de commande. Pas de suivi de "
           "livraison. Pas d'avis vérifié.", Inches(2.42), PAPER, 14.5)
tf = textbox(sl, ML, Inches(3.02), CW, Inches(0.45))
p = para(tf, True)
lead_para(p, "Alors l'acheteur fait la seule chose rationnelle : "
             "**il limite son risque.**", 14.5, lead_color=EMBER)
bullets(sl, ["Il commande petit.",
             "Il commande rarement.",
             "Et seulement chez la personne qu'une amie lui a recommandée."],
        Inches(3.66), size=14, gap=8, marker=EMBER)
callout(sl, ML, Inches(5.32), CW, Inches(1.2),
        "**Et le doute n'est pas seulement financier.** Se faire avoir, c'est "
        "aussi devoir l'avouer. Beaucoup n'achètent pas pour ne pas avoir à "
        "raconter ça — et ceux qui se font avoir ne réclament pas, ils "
        "disparaissent.", EMBER, 13.5)

# ---- 5. Problème 3 : l'administration -----------------------------------
N = ("C'est la plainte la plus fréquente des vendeurs — ce n'est pas leur perte "
     "la plus lourde, d'où sa place en troisième position. Le temps gagné est "
     "un excellent argument de rétention (au bout de deux semaines, il ne "
     "revient plus au cahier) mais un mauvais argument d'acquisition : chez un "
     "micro-entrepreneur, la soirée n'a pas de prix de marché. On ne vend pas "
     "des heures, on vend de l'argent récupéré.")
sl = slide(1, 5, N)
title(sl, "Le direct dure une heure.\nL'administration dure la soirée.",
      38, PAPER, h=Inches(1.5))
kicker(sl, "Après le direct, le vendeur :", Inches(2.45))
numbered(sl, [
    "relit des centaines de commentaires pour retrouver qui a dit « je prends », "
    "et dans quel ordre ;",
    "ouvre un message privé par client — la taille, l'adresse, le paiement, "
    "la disponibilité ;",
    "recopie tout à la main dans un cahier ou un tableur ;",
    "relance ceux qui ne répondent plus.",
], Inches(2.95), size=14, gap=12, color=EMBER)
callout(sl, ML, Inches(5.55), CW, Inches(0.85),
        "**L'essentiel du travail arrive après la vente.**", EMBER, 16)

# ---- 6. Problème 4 : l'audience sans capital ----------------------------
N = ("Nouveau problème, absent des versions précédentes du dossier. C'est la "
     "troisième face du marché, et elle est nombreuse à Madagascar. La retenir "
     "permet d'introduire deux fonctions que personne n'offre ici : "
     "l'affiliation et la précommande groupée. C'est aussi ce qui transforme le "
     "coût d'acquisition en coût variable — voir la slide sur le modèle.")
sl = slide(1, 6, N)
title(sl, "Elle a une audience.\nElle ne vend rien.", 44, PAPER, h=Inches(1.6))

tf = textbox(sl, ML, Inches(2.72), Inches(9.6), Inches(1.5))
p = para(tf, True)
p.line_spacing = 1.32
write(p, "Des créatrices filment leurs tenues, cumulent une audience réelle, "
         "et font ", BODY, 15, PAPER)
write(p, "gratuitement", BODY, 15, EMBER, bold=True)
write(p, " la promotion de vendeurs qui ne les rémunèrent pas.\n", BODY, 15,
      PAPER)
write(p, "Ce qui leur manque n'est ni le talent, ni les abonnés.", BODY, 15,
      MUTED)

tf = textbox(sl, ML, Inches(4.22), Inches(10.2), Inches(1.0))
p = para(tf, True)
p.line_spacing = 1.28
write(p, "C'est le capital. ", BODY, 15, EMBER, bold=True)
write(p, "Pour vendre, il faudrait acheter du stock d'avance — sans savoir "
         "s'il partira. Elles n'ont pas cet argent. Alors elles ne vendent pas.",
      BODY, 14, PAPER)

callout(sl, ML, Inches(5.5), CW, Inches(0.9),
        "**Une audience réelle reste sans valeur économique pour celle qui la "
        "détient.**", EMBER, 15)

# ---- 7. Ce que nous allons mesurer --------------------------------------
N = ("Slide de crédibilité. Un investisseur sérieux se méfie d'un deck plein de "
     "chiffres inventés. Assumer de dire « nous ne savons pas encore, voici "
     "comment nous le saurons » vaut mieux qu'une statistique non sourcée. "
     "Préciser que le tableau de bord de ces quatre mesures est une exigence "
     "contractuelle du cahier des charges, livrée dès le premier direct.")
sl = slide(1, 7, N)
title(sl, "Ce que nous allons mesurer.", 42)
kicker(sl, "Nous ne publions pas de chiffres que nous n'avons pas mesurés. "
           "Voici les quatre indicateurs que le pilote instrumentera dès le "
           "premier direct.", Inches(2.12), MUTED, 13.5)
table(sl, Inches(2.95),
      ["Indicateur", "Ce qu'il révèle"],
      [["Commandes annoncées en direct, jamais conclues",
        "Le chiffre d'affaires qui s'évapore entre l'envie et le paiement"],
       ["Temps administratif par heure de direct",
        "Le coût caché du travail après-vente"],
       ["Acheteurs qui renoncent faute de paiement sûr",
        "La demande bloquée par la seule question de la confiance"],
       ["Stock immobilisé par des réservations non honorées",
        "Le capital gelé par l'absence d'engagement"]],
      [Inches(5.1), CW - Inches(5.1)], Inches(0.62), EMBER, size=12.5)
tf = textbox(sl, ML, Inches(6.35), CW, Inches(0.4))
write(para(tf, True), "Hypothèses à valider — ces quatre mesures sont "
      "l'objectif du pilote, pas un résultat.", BODY, 12, GOLD, italic=True)

# ---- 8. La solution : un bouton -----------------------------------------
N = ("Slide-pivot, à laisser respirer. Marquer un silence après « un bouton ». "
     "Les commentaires barrés à gauche se rassemblent en un seul geste à "
     "droite : c'est tout le produit en une image. Enchaîner immédiatement sur "
     "la slide suivante — le bouton est le mécanisme, la confiance est la "
     "valeur.")
sl = slide(2, 8, N)

comments = ["je prends 😍", "je prend 2", "c'est combien ?", "la taille M dispo ?"]
for i, c in enumerate(comments):
    y = Inches(1.05 + i * 0.62)
    pill = rect(sl, ML, y, Inches(3.15), Inches(0.5), fill=INK_UP,
                shape=MSO_SHAPE.ROUNDED_RECTANGLE, adj=0.45)
    tfp = pill.text_frame
    tfp.vertical_anchor = MSO_ANCHOR.MIDDLE
    tfp.margin_left = Inches(0.22)
    r = write(tfp.paragraphs[0], c, BODY, 13, FAINT)
    r.font._rPr.set("strike", "sngStrike")

tf = textbox(sl, ML + Inches(3.45), Inches(2.0), Inches(0.9), Inches(0.7))
tf.paragraphs[0].alignment = PP_ALIGN.CENTER
write(para(tf, True), "→", BODY, 34, ACCENT, bold=True)

btn = rect(sl, ML + Inches(4.45), Inches(1.55), Inches(3.5), Inches(1.6),
           fill=ACCENT, shape=MSO_SHAPE.ROUNDED_RECTANGLE, adj=0.22)
btf = btn.text_frame
btf.vertical_anchor = MSO_ANCHOR.MIDDLE
bp = btf.paragraphs[0]
bp.alignment = PP_ALIGN.CENTER
write(bp, "JE PRENDS", BODY, 26, WHITE, bold=True, spacing=2.2)

title(sl, "On remplace le commentaire\npar un bouton.", 46, PAPER,
      y=Inches(4.05), h=Inches(1.5))
tf = textbox(sl, ML, Inches(5.85), CW, Inches(0.5))
p = para(tf, True)
for i, word in enumerate(["Une action.", "Une quantité.", "Un paiement.",
                          "Une facture."]):
    write(p, word + ("   " if i < 3 else ""), BODY, 17,
          [ACCENT, PAPER, PAPER, PAPER][i], bold=(i == 0))

# ---- 9. La confiance par construction -----------------------------------
N = ("C'est la slide centrale du deck. Chaque puce est l'antidote d'une arnaque "
     "décrite en slide 3. Si l'interlocuteur ne retient qu'une chose, c'est "
     "celle-ci. Lui donner du temps. Insister sur « litiges signalés à JP, "
     "jamais en face à face » : la confrontation directe est socialement "
     "coûteuse ici, et c'est pour cela que les gens abandonnent au lieu de "
     "réclamer.")
sl = slide(2, 9, N)
title(sl, "La confiance n'est pas une promesse.\nC'est un mécanisme.",
      36, PAPER, h=Inches(1.45))
bullets(sl, [
    "**Vendeur vérifié** — identité et numéro mobile money contrôlés avant la "
    "première vente.",
    "**L'argent ne circule plus de main à main** — il transite par la "
    "plateforme, jamais vers un numéro personnel inconnu.",
    "**Fonds libérés à la confirmation** — le vendeur est payé quand l'acheteur "
    "confirme la réception. Modalités à caler avec le cadre réglementaire et le "
    "partenaire de paiement.",
    "**Facture horodatée** — émise automatiquement, conservée des deux côtés.",
    "**Avis vérifiés** — seul un acheteur qui a réellement payé peut noter.",
    "**Litiges arbitrés** — signalés à JP, jamais en face à face. Décision "
    "motivée et tracée.",
    "**Score de confiance public** — construit sur les ventes honorées, les "
    "délais, les litiges.",
], Inches(2.55), size=14, gap=15, marker=JADE, lead_color=JADE)

# ---- 10. Comment ça marche ----------------------------------------------
N = ("C'est la démonstration. Suivre les cinq étapes avec le doigt sur l'écran. "
     "Insister sur l'étape 3 : la réservation temporaire du stock est ce qui "
     "empêche la survente pendant un direct où tout part en même temps — c'est "
     "le point technique le plus critique du produit, et un critère de recette "
     "bloquant. Les 30 secondes sont une exigence technique, pas la promesse "
     "commerciale.")
sl = slide(2, 10, N)
title(sl, "Du direct au paiement, sans quitter l'écran.", 38)

steps = [
    ("Le vendeur passe en direct.",
     "Il présente l'article. Le prix et le stock restant s'affichent à l'écran, en direct."),
    ("L'acheteur appuie sur « Je prends ».",
     "Sans écrire un mot, sans quitter le direct."),
    ("Il choisit la quantité, la taille et la livraison.",
     "L'article lui est réservé quelques minutes. À domicile ou en point de retrait, au choix."),
    ("Il paie par mobile money.",
     "MVola, Orange Money, Airtel Money — ou carte bancaire. Rails de paiement visés, à contractualiser."),
    ("La facture part automatiquement.",
     "Commande créée, vendeur notifié, suivi de livraison ouvert des deux côtés."),
]
y0, rh = Inches(2.2), Inches(0.78)
for i, (head, body) in enumerate(steps):
    y = y0 + rh * i
    tfn = textbox(sl, ML, y, Inches(0.6), Inches(0.5))
    write(para(tfn, True), "0%d" % (i + 1), MONO, 20, ACCENT, bold=True,
          spacing=-0.5)
    tf = textbox(sl, ML + Inches(0.72), y - Inches(0.02),
                 CW - Inches(0.72), Inches(0.72))
    p = para(tf, True)
    p.line_spacing = 1.2
    write(p, head + "  ", BODY, 14, PAPER, bold=True)
    write(p, body, BODY, 12.5, MUTED)
    if i < len(steps) - 1:
        rect(sl, ML, y + rh - Inches(0.1), CW, Emu(9525), fill=INK_UP2)

tf = textbox(sl, ML, Inches(6.28), CW, Inches(0.4))
write(para(tf, True), "Objectif produit : moins de 30 secondes entre le clic "
      "et le paiement confirmé.", BODY, 12, GOLD, italic=True)

# ---- 11. Avant / Après ---------------------------------------------------
N = ("La slide qui convainc. Ne pas lire les huit lignes : en choisir trois "
     "selon l'interlocuteur. Pour un investisseur, « encaisser » et « le "
     "lendemain ». Pour un vendeur pilote, « prendre la commande » et "
     "« travail après le direct ».")
sl = slide(2, 11, N)
title(sl, "Le même direct, sans le désordre.", 40, y=Inches(0.78),
      h=Inches(0.9))
table(sl, Inches(1.82),
      ["", "Aujourd'hui, sur un réseau social", "Avec JP"],
      [["Prendre la commande", "Un commentaire noyé dans le flux",
        "Un bouton, quantité et taille incluses"],
       ["Retrouver l'acheteur", "Message privé, un par un",
        "Commande nominative et horodatée"],
       ["Encaisser", "Numéro personnel, à la confiance",
        "Paiement encaissé dans la plateforme"],
       ["Preuve d'achat", "Une capture d'écran",
        "Une facture, pour les deux parties"],
       ["Travail après le direct", "Des heures de saisie",
        "Zéro saisie : tout est déjà enregistré"],
       ["Livraison", "Arrangement au cas par cas",
        "À domicile ou point de retrait, suivi partagé"],
       ["En cas de litige", "Parole contre parole",
        "Historique consultable des deux côtés"],
       ["Le lendemain", "Le direct est mort",
        "Le contenu vend encore"]],
      [Inches(3.05), Inches(4.3), CW - Inches(7.35)], Inches(0.545),
      ACCENT, size=12)

# ---- 12. Le contenu ------------------------------------------------------
N = ("Anticipe deux objections d'un coup. La première : « et si le vendeur ne "
     "fait pas de direct ce soir ? ». La seconde, celle d'un investisseur "
     "averti : « vous devenez un TikTok de plus, sans défendabilité ». La règle "
     "en encadré est la réponse, et elle doit être énoncée telle quelle — c'est "
     "une contrainte de conception inscrite au cahier des charges, pas une "
     "intention. Ajouter que le contenu est le seul levier qui fasse baisser le "
     "coût d'acquisition, qui est le poste dominant du budget.")
sl = slide(2, 12, N)
title(sl, "Le direct dure une heure.\nIl en reste vingt-trois.",
      40, PAPER, h=Inches(1.5))
kicker(sl, "Stories, vidéos verticales courtes, looks : un fil que l'on "
           "parcourt par balayage, personnalisé selon la taille, le budget et "
           "le style.", Inches(2.42), MUTED, 13.5)
bullets(sl, [
    "**Chaque vidéo est achetable.** L'article est là, avec son prix et son "
    "bouton. On achète sans quitter la vidéo, exactement comme en direct.",
    "**Le catalogue reste ouvert 24 h/24.** Chaque vendeur a sa vitrine, même "
    "hors direct.",
    "**La vidéo est une meilleure preuve que la photo.** Une vraie personne, sa "
    "morphologie, le tombé du tissu : c'est le signal de taille le plus fiable "
    "qui existe.",
], Inches(3.22), size=13, gap=11)

callout(sl, ML, Inches(5.5), CW, Inches(1.15),
        "**Règle absolue : aucun contenu sans article achetable attaché.** "
        "JP n'est pas un réseau social avec une boutique. C'est une boutique "
        "dont le catalogue est fait de vidéos.", ACCENT, 14)

# ---- 13. L'unboxing ------------------------------------------------------
N = ("La meilleure slide du dossier pour un investisseur qui cherche "
     "l'efficacité du produit. Contre « un paiement envoyé, puis plus de "
     "nouvelles » (slide 3), rien ne vaut un fil rempli de gens qui ouvrent "
     "leurs colis. Préciser que le fil d'unboxings est consultable sans "
     "compte : c'est la meilleure page d'accueil possible pour quelqu'un qui "
     "doute de la plateforme. Le montant du crédit est une hypothèse à calibrer "
     "au pilote.")
sl = slide(2, 13, N)
title(sl, "Un geste. Cinq résultats.", 44)
kicker(sl, "L'acheteuse filme l'ouverture de son colis.", Inches(2.05), PAPER,
       15)
table(sl, Inches(2.62),
      ["Ce qu'elle fait", "Ce que ça produit"],
      [["Elle filme", "Du contenu gratuit pour le fil"],
       ["Elle publie", "La preuve publique que JP livre pour de vrai"],
       ["Elle valide la réception", "Les fonds sont libérés vers la vendeuse"],
       ["Elle dit si ça taille bien", "Un avis vérifié"],
       ["Elle poste", "Du crédit dans sa cagnotte"]],
      [Inches(4.3), CW - Inches(4.3)], Inches(0.5), ACCENT, size=12.5)

tf = textbox(sl, ML, Inches(5.72), CW, Inches(0.45))
p = para(tf, True)
lead_para(p, "**C'est le pendant social du bouton « Je prends » : un seul "
             "geste, plusieurs problèmes réglés.**", 14, lead_color=ACCENT)
tf = textbox(sl, ML, Inches(6.24), CW, Inches(0.4))
write(para(tf, True), "Et personne n'est obligé de se filmer : la confirmation "
      "en un appui reste toujours disponible.", BODY, 12, MUTED, italic=True)

# ---- 14. La créatrice ----------------------------------------------------
N = ("C'est le déblocage le plus concret pour recruter des créatrices : on "
     "supprime la seule barrière réelle. Et cela correspond à un usage informel "
     "qui existe déjà — les commandes groupées entre amies, faites à la main "
     "sur Messenger. Le remboursement automatique est une exigence bloquante du "
     "cahier des charges : sans lui, la précommande reproduirait exactement "
     "l'arnaque que JP combat.")
sl = slide(2, 14, N)
title(sl, "Elle n'a pas besoin d'acheter le stock.", 40)

cw2 = (CW - Inches(0.5)) // 2
for i, (head, body, color) in enumerate([
    ("L'affiliation",
     "Elle ne possède rien. Elle recommande les articles d'autres vendeurs, et "
     "touche une commission sur ce qui se vend grâce à elle. Zéro capital, zéro "
     "stock, zéro logistique. Elle gagne enfin de l'argent avec ce qu'elle fait "
     "déjà gratuitement.", ACCENT),
    ("La précommande groupée",
     "Elle publie un article, collecte les commandes, et ne commande chez le "
     "fournisseur qu'une fois le seuil atteint. Elle achète avec l'argent des "
     "clientes, pas avec le sien.", JADE),
]):
    x = ML + i * (cw2 + Inches(0.5))
    box = rect(sl, x, Inches(2.15), cw2, Inches(2.05), fill=INK_UP)
    rect(sl, x, Inches(2.15), Inches(0.055), Inches(2.05), fill=color)
    tf = box.text_frame
    tf.margin_left = Inches(0.32)
    tf.margin_top = Inches(0.16)
    p = tf.paragraphs[0]
    p.line_spacing = 1.24
    write(p, head + "\n", BODY, 15, color, bold=True)
    write(p, body, BODY, 12.5, MUTED)

callout(sl, ML, Inches(4.45), CW, Inches(1.05),
        "**Et si le seuil n'est pas atteint, tout le monde est remboursé "
        "automatiquement.** Sans discussion, sans intervention. C'est ce qui "
        "rend la précommande acceptable.", JADE, 14)

tf = textbox(sl, ML, Inches(5.78), CW, Inches(0.5))
p = para(tf, True)
lead_para(p, "**On ne lui montre pas des vues. On lui montre ce qu'elle a fait "
             "gagner.**", 15, lead_color=PAPER)

# ---- 15. Le cadeau et la diaspora ----------------------------------------
N = ("Axe absent des versions précédentes du dossier. Il donne aussi un usage "
     "réel au paiement par carte, qui n'en avait aucun. À présenter comme une "
     "hypothèse forte à mesurer, pas comme un acquis : si le panier moyen d'une "
     "commande-cadeau est nettement supérieur, cela devient un axe stratégique "
     "à part entière.")
sl = slide(2, 15, N)
title(sl, "Offrir un objet, pas envoyer de l'argent.", 40)
kicker(sl, "Elle compose son panier. Elle envoie un lien. Quelqu'un d'autre "
           "paie — son frère, sa mère, une amie, ou quelqu'un depuis "
           "l'étranger, par carte.", Inches(2.05), PAPER, 14)

col_header(sl, ML, Inches(3.02), CW, "Pourquoi c'est sérieux", JADE)
bullets(sl, [
    "Le panier d'un cadeau est **structurellement plus élevé** : on n'offre pas "
    "au prix qu'on se paie à soi-même.",
    "Celui qui paie **n'a pas la contrainte de pouvoir d'achat locale**. Le "
    "plafond du doute saute.",
    "La diaspora envoie aujourd'hui de l'argent **sans jamais savoir ce qui en "
    "est fait**. Ici, elle offre un objet précis, chez un vendeur vérifié, avec "
    "le suivi et la preuve de remise.",
    "Le remerciement publié devient du contenu, donc de l'acquisition. **La "
    "boucle se referme.**",
], Inches(3.6), size=12.5, gap=9, marker=JADE, lead_color=JADE)

callout(sl, ML, Inches(5.85), CW, Inches(0.82),
        "**C'est le premier canal de JP qui ne dépend pas du pouvoir d'achat "
        "local.**", JADE, 14)

# ---- 16. Trois métiers ---------------------------------------------------
N = ("Montrer que ce n'est pas une application « avec trois menus », mais trois "
     "produits qui ont chacun leur logique. Le vendeur vient chercher du "
     "chiffre. L'acheteuse vient chercher de la confiance. La créatrice vient "
     "chercher un revenu sans capital. Trois discours de vente différents — ne "
     "jamais les mélanger en rendez-vous.")
sl = slide(2, 16, N)
title(sl, "Un produit, trois métiers.", 44)

cols = [
    ("Vendeur — son studio", ACCENT, [
        "Passer en direct depuis son téléphone",
        "Catalogue et stock en temps réel",
        "Commandes : payées, à expédier, livrées",
        "Ventes par direct, article, période",
        "Ses abonnés et ses meilleurs clients",
    ]),
    ("Acheteuse — sa boutique", JADE, [
        "Le fil des directs et des vidéos",
        "Le bouton « Je prends »",
        "Le panier multi-vendeurs",
        "Ses commandes et le suivi de livraison",
        "Domicile ou point relais, factures, fidélité",
    ]),
    ("Créatrice — son studio à elle", GOLD, [
        "Publier stories et vidéos",
        "Sa sélection chez plusieurs vendeurs",
        "Ses précommandes et leurs seuils",
        "Des vues jusqu'aux gains",
        "Ses partenariats de marque",
    ]),
]
gx = Inches(0.35)
cw3 = (CW - gx * 2) // 3
for i, (head, color, items) in enumerate(cols):
    x = ML + i * (cw3 + gx)
    panel = rect(sl, x, Inches(2.25), cw3, Inches(3.55), fill=INK_UP)
    panel.text_frame.text = ""
    rect(sl, x, Inches(2.25), cw3, Inches(0.05), fill=color)
    tf = textbox(sl, x + Inches(0.26), Inches(2.58), cw3 - Inches(0.52),
                 Inches(0.5))
    write(para(tf, True), head, MONO, 10, color, bold=True, spacing=1.2,
          caps=True)
    tf = textbox(sl, x + Inches(0.26), Inches(3.18), cw3 - Inches(0.52),
                 Inches(2.5))
    for j, it in enumerate(items):
        p = para(tf, j == 0)
        p.line_spacing = 1.2
        p.space_after = Pt(10)
        write(p, "— ", MONO, 11.5, color, bold=True)
        write(p, it, BODY, 11.5, PAPER)

# ---- 17. La livraison ----------------------------------------------------
N = ("Argument souvent sous-estimé et pourtant décisif : les frais de livraison "
     "peuvent dépasser la marge sur un petit article. Le point de retrait est "
     "ce qui rend le panier à faible montant économiquement viable — et donc ce "
     "qui rend la fréquence d'achat possible. Le premier point, l'adresse "
     "facultative, est mis en tête volontairement : c'est un frein de "
     "confiance, pas un frein de coût.")
sl = slide(2, 17, N)
title(sl, "À domicile, ou en point de retrait.", 42)
kicker(sl, "Au moment de commander, l'acheteur choisit.", Inches(2.05))

cw2 = (CW - Inches(0.5)) // 2
for i, (head, body, color) in enumerate([
    ("Livraison à domicile",
     "L'adresse est enregistrée une fois, réutilisée ensuite. Suivi visible des "
     "deux côtés, du départ à la remise.", ACCENT),
    ("Retrait en point relais",
     "L'acheteur récupère quand il veut, près de chez lui ou de son travail. "
     "Moins cher, pas de rendez-vous à tenir, pas de livreur à attendre.", JADE),
]):
    x = ML + i * (cw2 + Inches(0.5))
    box = rect(sl, x, Inches(2.6), cw2, Inches(1.5), fill=INK_UP)
    rect(sl, x, Inches(2.6), Inches(0.055), Inches(1.5), fill=color)
    tf = box.text_frame
    tf.margin_left = Inches(0.32)
    p = tf.paragraphs[0]
    p.line_spacing = 1.25
    write(p, head + "\n", BODY, 15, color, bold=True)
    write(p, body, BODY, 12.5, MUTED)

col_header(sl, ML, Inches(4.4), CW, "Pourquoi les deux comptent", MUTED)
bullets(sl, [
    "**Il rend l'adresse facultative** : celle qui hésite à donner son domicile "
    "à un inconnu commande quand même.",
    "Le point de retrait fait baisser le coût de livraison — le premier frein "
    "sur les petits paniers.",
    "Il supprime l'échec de livraison quand personne n'est là.",
    "Le vendeur dépose plusieurs commandes en un seul trajet.",
], Inches(4.95), size=12.5, gap=7)

# ---- 18. Communauté & fidélité -------------------------------------------
N = ("C'est le moteur de rétention, et donc l'argument de défendabilité. Un "
     "vendeur qui a construit sa base d'abonnés et son programme de fidélité "
     "sur JP ne repart pas ailleurs. Ses clients non plus. Le dernier point est "
     "important : nous refusons la surenchère de notifications, parce qu'un "
     "utilisateur qui coupe tout nous fait perdre les notifications utiles — "
     "colis arrivé, code de retrait.")
sl = slide(2, 18, N)
title(sl, "Le vendeur ne subit plus son audience.\nIl la cultive.",
      36, PAPER, h=Inches(1.45))
bullets(sl, [
    "**Des abonnés, pas des spectateurs.** On suit un vendeur comme on suit un "
    "créateur.",
    "**Notification au bon moment.** Quand il passe en direct, quand il lance "
    "une promotion, quand une pièce attendue revient en stock.",
    "**Il connaît ses meilleurs clients.** Nombre d'achats, montant cumulé, "
    "ancienneté, régularité — classés.",
    "**Il récompense qui il veut.** Une remise réservée à un palier de "
    "fidélité, un accès en avance à une collection, un cadeau pour ses "
    "ambassadeurs.",
    "**Le rendez-vous plutôt que la notification.** « Tous les vendredis à "
    "18 h » vaut mieux qu'une alerte de plus.",
], Inches(2.6), size=14, gap=13)

# ---- 19. Ce que personne ne fait -----------------------------------------
N = ("Ne pas dérouler les huit. En présenter deux, selon l'interlocuteur : pour "
     "un investisseur, l'unboxing (point 3) et la créatrice sans capital "
     "(point 4), parce que ce sont les deux qui font baisser le coût "
     "d'acquisition. Les autres montrent la profondeur de la feuille de route.")
sl = slide(2, 19, N)
title(sl, "Huit choses que personne ne fait ici.", 38, y=Inches(0.8),
      h=Inches(0.9))

cards = [
    ("Le bouton à la place du commentaire",
     "Une action au lieu d'une négociation en message privé."),
    ("L'argent tenu jusqu'à la réception",
     "La protection est un mécanisme, pas une promesse."),
    ("L'unboxing qui vaut preuve",
     "Confirmation, avis vérifié et preuve publique. Un geste, cinq résultats."),
    ("La créatrice sans capital",
     "Affiliation et précommande groupée : vendre sans avancer d'argent."),
    ("Le cadeau depuis l'étranger",
     "Offrir un objet précis, vérifié et livré. Pas envoyer de l'argent."),
    ("Le point de retrait sans adresse",
     "Moins cher, sans rendez-vous. Ce qui rend le petit panier viable."),
    ("Le replay qui vend  (phase 2)",
     "Le direct terminé reste achetable, chaque article repéré à sa minute."),
    ("Bien à sa taille  (phase 2)",
     "Guide par marque, avis de la même morphologie, vidéos portées."),
]
gx, gy = Inches(0.32), Inches(0.14)
card_w = (CW - gx) // 2
card_h = Inches(1.12)
for i, (head, body) in enumerate(cards):
    col, row = i % 2, i // 2
    x = ML + col * (card_w + gx)
    y = Inches(1.82) + row * (card_h + gy)
    box = rect(sl, x, y, card_w, card_h, fill=INK_UP)
    rect(sl, x, y, Inches(0.05), card_h, fill=ACCENT)
    tf = box.text_frame
    tf.margin_left = Inches(0.3)
    tf.margin_top = Inches(0.14)
    p = tf.paragraphs[0]
    p.line_spacing = 1.16
    write(p, "%02d  " % (i + 1), MONO, 10.5, ACCENT, bold=True, spacing=0.8)
    write(p, head + "\n", BODY, 13, PAPER, bold=True)
    write(p, body, BODY, 10.5, MUTED)

# ---- 20. Pourquoi la mode et la beauté -----------------------------------
N = ("Le vertical est une force, pas une limite. C'est ce qui permet de battre "
     "un généraliste sur l'expérience, et de recruter les vendeurs par le "
     "bouche-à-oreille dans une communauté déjà connectée entre elle.")
sl = slide(2, 20, N)
title(sl, "Un vertical, pas une marketplace de plus.", 40)
bullets(sl, [
    "**L'achat est visuel et émotionnel.** Une matière, un tombé, une teinte sur "
    "une peau : cela se montre, cela ne se décrit pas. Le direct et la vidéo "
    "sont les formats naturels de ce produit.",
    "**Le panier se renouvelle.** On rachète une saison après l'autre. La "
    "fréquence est structurellement plus élevée que sur la plupart des catégories.",
    "**Le vertical permet ce qu'un généraliste ne fera jamais.** Tailles par "
    "marque, matières, teintes adaptées aux carnations, looks complets, retours "
    "pour cause de taille.",
    "**Les vendeurs sont déjà là.** Le vestimentaire domine déjà la vente en "
    "direct. Nous n'avons pas à déplacer un usage, seulement à l'équiper.",
], Inches(2.3), size=13.5, gap=15)

# ---- 21. Modèle économique -----------------------------------------------
N = ("Ordonner par certitude : la commission est le modèle, le reste est de "
     "l'expansion. Assumer l'encadré plutôt que de le taire — un investisseur "
     "qui connaît le marché africain sait que la publicité display n'y finance "
     "rien avant très longtemps ; le dire nous-mêmes est un signe de sérieux. "
     "L'affiliation en position 2 est importante : elle transforme le coût "
     "d'acquisition en coût variable, payé uniquement sur une vente réalisée.")
sl = slide(3, 21, N)
title(sl, "Nous gagnons quand le vendeur vend.", 38, y=Inches(0.8),
      h=Inches(0.85))
numbered(sl, [
    "**Commission sur chaque vente** — le cœur du modèle. Prélevée au paiement.",
    "**Commission d'affiliation** — sur les ventes générées par une créatrice.",
    "**Mise en avant** — produit, direct ou contenu sponsorisé, payé en Ariary.",
    "**Abonnement vendeur** — par paliers : vitrine, outils avancés, équipe.",
    "**JP Club** — abonnement acheteuse. Récurrent, sans coût marginal.",
    "**Campagnes de marque** — avec des créatrices, mesurées jusqu'à la vente.",
    "**Insights marché** — tendances de tailles, couleurs, prix. Anonymisés.",
], Inches(1.78), size=12.5, gap=7, color=JADE)

tf = textbox(sl, ML, Inches(4.62), CW, Inches(0.4))
p = para(tf, True)
lead_para(p, "**Le vendeur ne paie rien tant qu'il ne vend pas.**", 14,
          lead_color=PAPER)

callout(sl, ML, Inches(5.15), CW, Inches(1.5),
        "**Une mise au point sur la publicité.** Le CPM sur une audience "
        "malgache est dérisoire : il faudrait des dizaines de millions "
        "d'impressions pour un revenu significatif. La couche sociale se "
        "monétise par le commerce qu'elle déclenche, pas par l'attention "
        "qu'elle capte. La régie viendra après, si l'audience la justifie.",
        GOLD, 12.5)

# ---- 22. Ce qui rend le projet défendable --------------------------------
N = ("Slide à sortir quand l'objection « qu'est-ce qui empêche quelqu'un de "
     "vous copier ? » arrive — elle arrive toujours. La bonne réponse n'est "
     "jamais « notre technologie ». Elle est : ce qui s'accumule. Le troisième "
     "point est le plus fort à long terme, et c'est aussi ce qui fonde la ligne "
     "« insights marché » du modèle économique.")
sl = slide(3, 22, N)
title(sl, "Ni le code, ni la vitesse.", 44)
kicker(sl, "Trois actifs, qui s'accumulent au lieu de se copier.",
       Inches(2.05), PAPER, 15)
bullets(sl, [
    "**L'infrastructure de confiance.** Identités vérifiées, historique de "
    "transactions, scores construits sur des faits. Un concurrent peut copier "
    "l'interface en trois mois ; il ne peut pas copier deux ans d'historique.",
    "**Le graphe des relations.** Abonnés, créatrices, meilleures clientes, "
    "paliers de fidélité. Un vendeur qui a construit sa base ici ne repart pas. "
    "Ses clientes non plus.",
    "**La donnée verticale.** Nous serons les seuls à savoir ce qui se vend "
    "réellement dans le vestimentaire à Madagascar — taille par taille, couleur "
    "par couleur, prix par prix.",
], Inches(2.72), size=13.5, gap=15, marker=JADE, lead_color=JADE)

callout(sl, ML, Inches(5.75), CW, Inches(0.9),
        "**Et côté acheteuse, un coût de sortie qui monte tout seul :** "
        "historique, factures, cagnotte, avis publiés, contenus.", JADE, 13)

# ---- 23. Hypothèses à valider --------------------------------------------
N = ("Assumer cette slide plutôt que la cacher : elle montre que nous savons "
     "quelles sont les questions ouvertes, ce qu'un investisseur cherche "
     "précisément à savoir avant de financer une phase de validation. Si l'on "
     "ne doit en citer qu'une : le prépaiement. C'est la mesure qui conditionne "
     "le plus lourdement l'architecture du produit.")
sl = slide(3, 23, N)
title(sl, "Ce que nous supposons, et comment nous le vérifierons.",
      28, y=Inches(0.74), h=Inches(0.7))
table(sl, Inches(1.52),
      ["Levier", "Hypothèse", "À mesurer pendant le pilote"],
      [["Commission par vente", "Fourchette par catégorie",
        "À quel taux le vendeur contourne la plateforme"],
       ["Prépaiement", "Une part le refusera",
        "Écart de conversion avec le paiement à la réception"],
       ["Panier moyen", "À établir",
        "Effet du paiement intégré sur le montant commandé"],
       ["Conversion en direct", "À établir",
        "Spectateurs → « Je prends » → paiement confirmé"],
       ["Conversion du contenu", "Inconnue",
        "Ce que convertit un clip, comparé à un direct"],
       ["Production de contenu", "Inconnue",
        "Part des acheteuses qui publient un unboxing"],
       ["Acquisition par créatrice", "Moins chère que la publicité",
        "Coût d'une cliente amenée par une créatrice"],
       ["Commande-cadeau", "Panier plus élevé",
        "Écart avec le panier ordinaire, part payée de l'étranger"],
       ["Mode de livraison", "Relais majoritaire sur petits paniers",
        "Répartition, et effet sur le taux d'abandon"],
       ["Budget de lancement", "Acquisition = poste dominant",
        "Coût réel d'un premier acheteur, d'un premier vendeur"]],
      [Inches(2.5), Inches(3.05), CW - Inches(5.55)], Inches(0.40),
      JADE, size=9.5, head_size=8.5)
callout(sl, ML, Inches(6.14), CW, Inches(0.6),
        "**Aucun chiffre de ce dossier n'est présenté comme acquis.** Les "
        "fourchettes se trancheront avec les premiers vendeurs et les "
        "premières créatrices.", GOLD, 11.5)

# ---- 24. Le point bloquant : le lancement --------------------------------
N = ("Slide la plus importante pour l'investisseur : dire clairement où va "
     "l'argent et où est le risque. Ne pas annoncer un montant tant que le plan "
     "de lancement n'est pas arrêté — proposer plutôt de construire ensemble "
     "deux scénarios et de les chiffrer. Assumer que l'acquisition est le poste "
     "dominant est un signe de lucidité : un déploiement de marketplace se "
     "gagne sur l'acquisition, pas sur le code. Et assumer le paragraphe en "
     "italique : annoncer soi-même la tension de délai vaut infiniment mieux "
     "que de la faire découvrir au troisième mois.")
sl = slide(3, 24, N)
title(sl, "Construire le produit n'est pas le problème.\nLe lancer, oui.",
      34, PAPER, h=Inches(1.4))

cw2 = (CW - Inches(0.45)) // 2
for i, (head, body, color) in enumerate([
    ("Ce qui n'est pas bloquant",
     "La plateforme est un travail de développement identifié et cadré. Le seul "
     "poste techniquement incertain est la vidéo.", MUTED),
    ("Ce qui est bloquant",
     "Le lancement. Réunir au même moment les premiers vendeurs, leurs abonnés, "
     "les premières créatrices, les partenaires paiement et livraison — et "
     "faire savoir que JP existe.", EMBER),
]):
    x = ML + i * (cw2 + Inches(0.45))
    box = rect(sl, x, Inches(2.28), cw2, Inches(1.42), fill=INK_UP)
    rect(sl, x, Inches(2.28), Inches(0.055), Inches(1.42), fill=color)
    tf = box.text_frame
    tf.margin_left = Inches(0.32)
    p = tf.paragraphs[0]
    p.line_spacing = 1.22
    write(p, head + "\n", MONO, 10.5, color, bold=True, spacing=1.2, caps=True)
    write(p, body, BODY, 12, PAPER if i else MUTED)

tf = textbox(sl, ML, Inches(3.9), CW, Inches(0.9))
p = para(tf, True)
p.line_spacing = 1.24
write(p, "Les postes, par ordre de poids : ", BODY, 13, PAPER, bold=True)
write(p, "acquisition et animation · ", BODY, 12.5, MUTED)
write(p, "amorçage du contenu", BODY, 12.5, GOLD, bold=True)
write(p, " (un fil vide est pire que pas de fil) · développement · ", BODY,
      12.5, MUTED)
write(p, "modération", BODY, 12.5, GOLD, bold=True)
write(p, " (coût humain permanent) · infrastructure vidéo · frais de paiement "
         "· logistique · juridique.", BODY, 12.5, MUTED)

tf = textbox(sl, ML, Inches(4.92), CW, Inches(1.1))
p = para(tf, True)
p.line_spacing = 1.24
write(p, "Horizon envisagé : environ 3 mois", BODY, 15, GOLD, bold=True)
write(p, ", test produit inclus. ", BODY, 13.5, PAPER)
write(p, "Cet horizon est tendu au regard du périmètre — la vidéo et la "
         "modération pèsent. Deux issues honnêtes : allonger le délai, ou "
         "livrer le contenu en deux temps. C'est un arbitrage à poser "
         "maintenant, pas à découvrir en route.", BODY, 12.5, MUTED,
      italic=True)

callout(sl, ML, Inches(6.06), CW, Inches(0.68),
        "**Nous demandons un budget de lancement, pas un budget de "
        "développement.** Le montant se cale avec le plan retenu — une ville, "
        "ou une ouverture plus large.", GOLD, 11.5)

# ---- 25. Feuille de route & prochaines étapes ----------------------------
N = ("Terminer sur une demande précise. « Une seule phase à financer "
     "aujourd'hui » désamorce la crainte d'un projet tentaculaire. Et fermer la "
     "boucle sur le nom : JP, c'est le geste de l'acheteur — tout le produit "
     "tient dans ces deux mots.")
sl = slide(3, 25, N)
title(sl, "Trois phases. Une seule à financer aujourd'hui.", 34,
      y=Inches(0.76), h=Inches(0.85))

phases = [
    ("Phase 1", "Le geste et la preuve",
     "Direct et bouton « Je prends », paiement mobile money, fonds tenus "
     "jusqu'à réception, facture, suivi, vendeurs vérifiés — et le noyau de "
     "contenu : stories, clips achetables, unboxing, créatrices et affiliation, "
     "précommande, cadeau, modération.", ACCENT),
    ("Phase 2", "La communauté",
     "Replay achetable, avis vérifiés et score public, abonnés et "
     "notifications, promotions programmées, paliers de fidélité et cagnotte, "
     "guide des tailles, retours, JP Club.", MUTED),
    ("Phase 3", "L'échelle",
     "Enchères et ventes flash, direct à deux, assistant du vendeur, espace "
     "marque, insights marché.", FAINT),
]
pw = (CW - Inches(0.6)) // 3
for i, (num, name, body, color) in enumerate(phases):
    x = ML + i * (pw + Inches(0.3))
    box = rect(sl, x, Inches(1.78), pw, Inches(2.15), fill=INK_UP)
    rect(sl, x, Inches(1.78), pw, Inches(0.05), fill=color)
    tf = box.text_frame
    tf.margin_top = Inches(0.15)
    p = tf.paragraphs[0]
    p.line_spacing = 1.18
    write(p, num.upper() + "\n", MONO, 9.5, color, bold=True, spacing=1.4)
    write(p, name + "\n", BODY, 13.5, PAPER, bold=True)
    write(p, body, BODY, 10, MUTED)

col_header(sl, ML, Inches(4.15), CW, "Ce que nous cherchons", JADE)
bullets(sl, [
    "**Un budget de lancement** — l'essentiel en acquisition et en amorçage de "
    "contenu. Montant à caler avec le plan retenu.",
    "**Des partenaires** paiement, livraison et points de retrait.",
    "**Des vendeurs pilotes** déjà actifs en direct sur le vestimentaire.",
    "**Des créatrices pilotes** prêtes à tester l'affiliation et la précommande.",
], Inches(4.68), size=11.5, gap=5, marker=JADE, lead_color=JADE)

rect(sl, ML, Inches(6.2), Inches(2.2), Emu(19050), fill=ACCENT)
tf = textbox(sl, ML, Inches(6.38), Inches(8), Inches(0.5))
p = para(tf, True)
write(p, "JP — Je prends.  ", DISPLAY, 19, PAPER, bold=True, spacing=-0.4)
write(p, "Le direct devient une boutique.", BODY, 13, MUTED, italic=True)

tf = textbox(sl, W - MR - Inches(3.6), Inches(6.38), Inches(3.6), Inches(0.5))
tf.paragraphs[0].alignment = PP_ALIGN.RIGHT
write(para(tf, True), "Contact : à compléter", MONO, 10.5, GOLD, spacing=1.0)

# ---------------------------------------------------------------- métadonnées
core = prs.core_properties
core.title = "JP — Je prends"
core.subject = "Dossier de présentation — investisseurs & partenaires"
core.author = "JP"
core.comments = ("Plateforme de vente en direct et de contenu achetable, "
                 "spécialisée mode, beauté et chaussures. Aucun chiffre de ce "
                 "document n'est présenté comme acquis.")
core.category = "Pitch deck"

import sys
out = sys.argv[1] if len(sys.argv) > 1 else "JP_Deck.pptx"
prs.save(out)
print("OK — %d slides → %s" % (len(prs.slides.__iter__.__self__._sldIdLst), out))
