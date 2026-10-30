# COLOSSUS

Este proyecto inició como una idea para compartir con los amigos. Ahora es un sistema semi-completo para llevar registro de ejercicios, rutinas y proveer analíticas profundas para mejorar rendmiento en el gimnasio.

## Versionado y cambios

- El historial de cambios está en [`CHANGELOG.md`](CHANGELOG.md) (formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) + [SemVer](https://semver.org/lang/es/)).
- La versión vigente se define en `package.json` y se muestra debajo de la pestaña **Perfil**.
- Para publicar una versión: actualizar `version` en `package.json`, mover los cambios de `[Unreleased]` a una sección nueva del changelog y crear la etiqueta (`git tag vX.Y.Z`).

## Firebase: reglas y límites del chat

Las reglas de `firestore.rules` incluyen el contador de copias de rutinas y el chat de grupos (solo rutinas, 1 mensaje por minuto).
Tras cada cambio en ese archivo hay que desplegarlas:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

El ranking de cada grupo usa un índice nuevo (`userId` + `isPr` + `performedAt`) que está en `firestore.indexes.json`; tarda unos minutos en construirse.

Opcional (plan gratuito): en la consola de Firestore, crear una política **TTL** sobre el grupo de colecciones `messages` con el campo `expiresAt` para que los mensajes de más de 30 días se borren solos.

## Íconos y marca

El ícono es una "C" blanca. `public/favicon.svg` y los PNG de 192/512 tienen fondo transparente. En `public/brand/` hay versiones con fondo oscuro y claro (SVG y PNG de 1024 px, aptas para Instagram, WhatsApp y Canva), una transparente y el isotipo (`colossus-mark.svg`). El ícono de iOS (`apple-touch-icon.png`) y el maskable llevan fondo oscuro porque esas plataformas no admiten transparencia.
Para que las vistas previas de enlaces (WhatsApp, Instagram) muestren `og-image.png`, conviene que la URL de `og:image` en `index.html` sea absoluta (con el dominio de Vercel).
