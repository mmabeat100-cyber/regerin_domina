# Ringerin Domina — annuaire premium (front-end démo)

Données mock (`src/data`) gérées par un store Zustand persisté dans localStorage. Couche d'accès : `src/services/*` (point de branchement futur d'une base de données).

## Back-office
URL : `/admin` — identifiant **admin** / mot de passe **compass2026** (démo uniquement, défini dans `src/config/site.ts`).

## Routes publiques
- `/` accueil · `/annuaire` (filtres en query params) · `/profil/:slug`
- `/pays/:country` · `/ville/:country/:city` · `/villes`
- `/studios` · `/studios/:slug`
- `/a-propos` · `/mentions-legales` · `/confidentialite` · `/protection-des-mineurs` · `/contact`

## Routes admin
`/admin` · `/admin/profils` · `/admin/profils/nouveau` · `/admin/profils/:id` · `/admin/studios` · `/admin/pays` · `/admin/catalogues` · `/admin/avis` · `/admin/parametres`
