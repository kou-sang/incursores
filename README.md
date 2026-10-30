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
firebase deploy --only firestore:rules
```

Opcional (plan gratuito): en la consola de Firestore, crear una política **TTL** sobre el grupo de colecciones `messages` con el campo `expiresAt` para que los mensajes de más de 30 días se borren solos.

## Íconos y marca

Los íconos se generan a partir de `public/brand/colossus-icon-dark.svg` (fondo oscuro, apto para Instagram, WhatsApp y Canva) y
`public/brand/colossus-icon-light.svg` (fondo claro). `public/brand/` también incluye los PNG de 1024 px y el isotipo (`colossus-mark.svg`).
Para que las vistas previas de enlaces (WhatsApp, Instagram) muestren `og-image.png`, conviene que la URL de `og:image` en `index.html` sea absoluta (con el dominio de Vercel).
