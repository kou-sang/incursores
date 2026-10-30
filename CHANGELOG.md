# Changelog

Todos los cambios relevantes de **Colossus** (antes "Incursores" / "gym-tracker") se documentan en este archivo.

El formato sigue [Keep a Changelog 1.1.0](https://keepachangelog.com/es-ES/1.1.0/) y el versionado sigue [Versionado Semántico 2.0.0](https://semver.org/lang/es/):

- **MAJOR** (`X.0.0`): cambios que rompen compatibilidad o reescrituras (modelo de datos, arquitectura).
- **MINOR** (`0.X.0`): funcionalidades nuevas compatibles hacia atrás.
- **PATCH** (`0.0.X`): correcciones de errores y ajustes menores.

Tipos de cambio: `Added` (agregado), `Changed` (cambiado), `Deprecated` (obsoleto), `Removed` (eliminado), `Fixed` (corregido), `Security` (seguridad).

Convención de commits recomendada: [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/) (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`).
Cada versión se etiqueta en git como `vX.Y.Z` y la versión vigente se toma de `package.json` (se muestra en la pestaña Perfil).

> Las versiones anteriores a 4.1.0 se reconstruyeron a partir del historial de git. La numeración salta de 2.x a 4.0.0 porque así se nombró ese lanzamiento ("Colossus v4").

## [Unreleased]

## [4.1.0] - 2026-10-30

### Added
- Chat en **Grupos** limitado a compartir rutinas propias (sin texto libre ni emojis), con tope de 1 mensaje por minuto por persona, aplicado también en las reglas de Firestore.
- Contador de **copias por rutina**: cuántas personas distintas importaron cada rutina (una por persona; se muestra en Rutinas).
- Botón **Añadir a rutina** en la pestaña Ejercicios (elige rutina, día, series y repeticiones).
- Más de 50 ejercicios nuevos con categoría y músculos: running, sprints, caminata, ciclismo, natación, elíptico, escaladora, funcional, CrossFit, baile (samba, zumba, salsa, cumbia, reggaetón, aeróbico), boxeo y combate, yoga, pilates y deportes (fútbol, pádel, tenis, básquet, vóley, escalada).
- Nuevas categorías: Cardio, CrossFit, Baile, Combate, Yoga y Pilates, Deportes.
- Analíticas: gráfico de **consistencia** (línea suave por perfil con marca especial en los PR) sobre el mapa muscular.
- Analíticas: opción **Unificar ejercicios del día**; desactivada, los gráficos temporales muestran hora y minuto en el eje X.
- Analíticas: los filtros se pueden ocultar con una flecha (visibles por defecto).
- Repeticiones: botones +/- (solo escritorio) en el editor de rutinas.
- Versión de la app visible debajo de la pestaña Perfil.
- Archivo `CHANGELOG.md` y metadatos de ícono (`site.webmanifest`, Open Graph).

### Changed
- La app pasa a llamarse **Colossus** en todos los lugares (título de la pestaña, `package.json`, metadatos).
- Nuevo ícono minimalista: una "C" blanca; el ícono de la pestaña del navegador tiene fondo transparente. Hay versiones con fondo para Instagram, WhatsApp y Canva en `public/brand/`.
- El **Ranking** (fuerza, constancia y récords recientes) pasa a la pestaña Grupos: hay una competencia por cada grupo de amigos y solo compiten sus integrantes.
- Editor de rutinas: se quitó el campo de kg al agregar un ejercicio.
- Las cintas, bicicleta fija, soga y remo ergómetro pasan de "Funcional / Cardio" a la categoría Cardio.

### Removed
- Pestaña Ranking independiente (ahora vive dentro de cada grupo).

### Fixed
- Perfil: en celular la pantalla se extendía más que el ancho y desplazaba la barra de navegación y otros elementos.

## [4.0.0] - 2026-10-29

### Added
- **Grupos** de amigos con código y enlace de invitación; las analíticas comparan solo perfiles que comparten grupo.
- Pestaña **Perfil**: datos, correo, contraseña y colores personalizados (claro/oscuro).
- **Biblioteca de ejercicios** con diccionario de músculos y porcentaje de estímulo por ejercicio.
- Analíticas por músculo: mapa anatómico, series efectivas y recuperación.
- Selector de ejercicios con búsqueda, capa de celebración de récords y borrador de rutina recuperable.
- Documento de verificación de correo (`docs/verificacion-email-token.md`).

### Changed
- Reglas de Firestore ampliadas para grupos e invitaciones.

## [2.0.0] - 2026-10-29

### Changed
- Reescritura completa: arquitectura modular por funcionalidades (`features/`, `services/`, `hooks/`, `context/`).
- Nuevo modelo de datos (`profiles`, `users`, `workoutLogs`, `personalBests`, `routines`).

### Added
- Reglas de seguridad de Firestore e índices.
- Configuración de Firebase CLI, script de respaldo (`scripts/backup-firestore.mjs`) y de migración de datos legados.
- Variables de entorno (`.env.example`).

### Security
- Reglas que impiden editar o borrar datos ajenos.

## [1.6.0] - 2026-10-27

### Changed
- Gráficas y apartados visuales mejorados; corrección de errores (incluye un revert y un reintento del mismo cambio).

## [1.5.2] - 2026-10-26

### Changed
- Cambio del nombre de la página.

## [1.5.1] - 2026-10-26

### Fixed
- Errores del inicio de sesión y de las analíticas; se agregan mensajes de error claros.

## [1.5.0] - 2026-10-26

### Added
- Inicio de sesión con Firebase Auth y con Google.

### Changed
- Analíticas mejoradas.

### Fixed
- Errores en las rutinas.

## [1.4.1] - 2026-10-26

### Fixed
- Problema introducido al agregar el inicio de sesión con correo.

### Changed
- README actualizado.

## [1.4.0] - 2026-10-26

### Added
- Inicio de sesión con correo y credenciales.

## [1.3.0] - 2026-10-25

### Added
- Pantalla de inicio, rutinas, presets y tablas de ranking.

### Changed
- Analíticas mejoradas.

## [1.2.0] - 2026-10-25

### Added
- Herramientas de análisis y visualización de estadísticas.

## [1.1.0] - 2026-10-25

### Added
- Menú desplegable de ejercicios y notificaciones.

## [1.0.1] - 2026-10-24

### Security
- Se eliminan las credenciales en texto plano y se pasan a variables de entorno.

## [1.0.0] - 2026-10-24

### Added
- Versión inicial: registro de ejercicios (proyecto de React + Vite + Firebase).

[Unreleased]: https://github.com/kou-sang/incursores/compare/v4.1.0...HEAD
[4.1.0]: https://github.com/kou-sang/incursores/compare/v4.0.0...v4.1.0
[4.0.0]: https://github.com/kou-sang/incursores/compare/v2.0.0...v4.0.0
[2.0.0]: https://github.com/kou-sang/incursores/compare/v1.6.0...v2.0.0
[1.6.0]: https://github.com/kou-sang/incursores/compare/v1.5.2...v1.6.0
[1.5.2]: https://github.com/kou-sang/incursores/compare/v1.5.1...v1.5.2
[1.5.1]: https://github.com/kou-sang/incursores/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/kou-sang/incursores/compare/v1.4.1...v1.5.0
[1.4.1]: https://github.com/kou-sang/incursores/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/kou-sang/incursores/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/kou-sang/incursores/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/kou-sang/incursores/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/kou-sang/incursores/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/kou-sang/incursores/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/kou-sang/incursores/releases/tag/v1.0.0
