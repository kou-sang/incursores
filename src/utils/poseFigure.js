/*
 * Figuras de ejercicios dibujadas por código (sin fotos externas: sin costo de hosting ni derechos de imagen).
 * Módulo puro: recibe una pose y devuelve un SVG en texto → se puede probar y previsualizar fuera de React.
 *
 * Convenciones (vista lateral, la figura mira a la derecha):
 *  - `t`: torso (cadera → hombro) en grados desde la vertical hacia arriba; + = inclinado hacia adelante, 90 = horizontal boca abajo, -90 = acostado boca arriba.
 *  - Brazos `a1`/`a2` = [brazo, antebrazo] y piernas `l1`/`l2` = [muslo, pierna]: ángulos ABSOLUTOS desde la vertical hacia abajo
 *    (0 = abajo, 90 = adelante, 180 = arriba, -90 = atrás). `a1`/`l1` es el lado cercano; `a2`/`l2` el lejano (más tenue).
 *  - Una pierna puede ser 'line' (continúa la línea del torso, p. ej. plancha) o ['rel', dMuslo, dPierna] relativa a esa línea.
 *  - `ground`: 'feet' (pies en el piso), 'lowest' (el punto más bajo toca el piso) o 'none' (usa `hip`).
 *  - `solve`: ajusta `t` para que una articulación toque el piso a la altura de los pies (flexiones, planchas).
 *  - Los accesorios (`props`) usan coordenadas relativas a la cadera, o `at: 'hand'` para ir en la mano.
 * Vista frontal (`view: 'front'`): `arms` = [[abducción, antebrazo] izq, der], `legs` = [[abducción, pierna] izq, der], ángulos desde abajo hacia afuera.
 */

// Lienzo con margen superior (y negativa) para brazos y barras por encima de la cabeza.
export const FIGURE_SIZE = Object.freeze({ width: 200, height: 196, top: -36 });
const FLOOR_Y = 148;
const LENGTHS = Object.freeze({ torso: 46, neck: 7, head: 8.5, upperArm: 25, forearm: 23, thigh: 34, shin: 33, foot: 9 });

const rad = (deg) => (deg * Math.PI) / 180;
const add = (point, length, angleFromDown) => [point[0] + length * Math.sin(rad(angleFromDown)), point[1] + length * Math.cos(rad(angleFromDown))];
const fmt = (value) => Math.round(value * 10) / 10;

const resolveLeg = (leg, torsoAngle) => {
  const lineAngle = -torsoAngle; // Prolongación del torso hacia abajo (cadera → pies)
  if (leg === 'line') return [lineAngle, lineAngle];
  if (Array.isArray(leg) && leg[0] === 'rel') return [lineAngle + leg[1], lineAngle + leg[2]];
  return leg;
};

// Cinemática directa de la vista lateral con la cadera en el origen.
const sideSkeleton = (pose) => {
  const t = pose.t ?? 0;
  const hip = [0, 0];
  const torsoDown = 180 - t; // dirección cadera→hombro expresada "desde abajo"
  const shoulder = add(hip, LENGTHS.torso, torsoDown);
  const neckAngle = pose.neck ?? torsoDown;
  const neckTop = add(shoulder, LENGTHS.neck, neckAngle);
  const head = add(neckTop, LENGTHS.head - 1, neckAngle);
  const arm = (angles) => {
    const [upper, lower] = angles ?? [0, 0];
    const elbow = add(shoulder, LENGTHS.upperArm, upper);
    return { elbow, wrist: add(elbow, LENGTHS.forearm, lower) };
  };
  const leg = (raw) => {
    const [thigh, shin, foot] = resolveLeg(raw ?? [0, 0], t);
    const knee = add(hip, LENGTHS.thigh, thigh);
    const ankle = add(knee, LENGTHS.shin, shin);
    return { knee, ankle, toe: add(ankle, LENGTHS.foot, foot ?? shin + 90) };
  };
  return {
    hip, shoulder, neckTop, head,
    near: { ...arm(pose.a1), ...leg(pose.l1) },
    far: { ...arm(pose.a2 ?? pose.a1), ...leg(pose.l2 ?? pose.l1) },
  };
};

// Ajusta `t` por bisección para que `joint` (de cualquiera de los dos lados) quede a la altura de los dedos del pie.
const solveTorso = (pose) => {
  const { joint, range, offset = 0 } = pose.solve;
  const gap = (t) => {
    const skeleton = sideSkeleton({ ...pose, t });
    const contact = Math.max(skeleton.near[joint][1], skeleton.far[joint][1]);
    const feet = Math.max(skeleton.near.toe[1], skeleton.far.toe[1], skeleton.near.ankle[1], skeleton.far.ankle[1]);
    return contact - feet + offset; // offset > 0: la articulación queda `offset` unidades por encima de los pies
  };
  let [low, high] = range;
  if (Math.sign(gap(low)) === Math.sign(gap(high))) return pose;
  for (let step = 0; step < 40; step += 1) {
    const middle = (low + high) / 2;
    if (Math.sign(gap(middle)) === Math.sign(gap(low))) low = middle;
    else high = middle;
  }
  return { ...pose, t: (low + high) / 2 };
};

const frontSkeleton = (pose) => {
  const tilt = pose.tilt ?? 0; // inclinación lateral del torso
  const hipCenter = [0, 0];
  const shoulderCenter = add(hipCenter, LENGTHS.torso, 180 + tilt);
  const across = (center, half, sign) => [center[0] + sign * half * Math.cos(rad(tilt)), center[1] + sign * half * Math.sin(rad(tilt))];
  const shrug = pose.shrug ?? 0; // encogimiento de hombros (sube los hombros)
  const shoulders = [across(shoulderCenter, 13, -1), across(shoulderCenter, 13, 1)].map(([x, y]) => [x, y - shrug]);
  const hips = [across(hipCenter, 7.5, -1), across(hipCenter, 7.5, 1)];
  const neckTop = add(shoulderCenter, LENGTHS.neck, 180 + tilt);
  const head = add(neckTop, LENGTHS.head - 1, 180 + tilt);
  const [armLeft, armRight] = pose.arms ?? [[10, 10], [10, 10]];
  const [legLeft, legRight] = pose.legs ?? [[4, 4], [4, 4]];
  const limb = (origin, [first, second], sign, lengths) => {
    const middle = add(origin, lengths[0], sign * first);
    return [middle, add(middle, lengths[1], sign * second)];
  };
  const arms = [limb(shoulders[0], armLeft, -1, [LENGTHS.upperArm, LENGTHS.forearm]), limb(shoulders[1], armRight, 1, [LENGTHS.upperArm, LENGTHS.forearm])];
  const legs = [limb(hips[0], legLeft, -1, [LENGTHS.thigh, LENGTHS.shin]), limb(hips[1], legRight, 1, [LENGTHS.thigh, LENGTHS.shin])];
  const feet = legs.map(([, ankle], index) => [ankle, [ankle[0] + (index === 0 ? -7 : 7), ankle[1] + 1]]);
  return { hipCenter, shoulderCenter, shoulders, hips, neckTop, head, arms, legs, feet };
};

const rotatePoint = ([x, y], [cx, cy], degrees) => {
  const angle = rad(degrees);
  return [cx + (x - cx) * Math.cos(angle) - (y - cy) * Math.sin(angle), cy + (x - cx) * Math.sin(angle) + (y - cy) * Math.cos(angle)];
};

// ───────── Accesorios ─────────

const COLORS = Object.freeze({ body: 'var(--text)', far: 'var(--muted)', gear: 'var(--accent)', frame: 'var(--text-2)', floor: 'var(--border)' });

const line = (a, b, color, width, extra = '') =>
  `<line x1="${fmt(a[0])}" y1="${fmt(a[1])}" x2="${fmt(b[0])}" y2="${fmt(b[1])}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"${extra}/>`;
const circle = (c, r, fill, stroke = 'none', width = 0) =>
  `<circle cx="${fmt(c[0])}" cy="${fmt(c[1])}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
const rect = (x, y, w, h, fill, radius = 2) =>
  `<rect x="${fmt(x)}" y="${fmt(y)}" width="${fmt(w)}" height="${fmt(h)}" rx="${radius}" fill="${fill}"/>`;

const JOINTS = Object.freeze({ shoulder: (s) => s.shoulder, hip: (s) => s.hip, head: (s) => s.head, wrist: (s) => s.near.wrist, elbow: (s) => s.near.elbow, knee: (s) => s.near.knee, ankle: (s) => s.near.ankle, toe: (s) => s.near.toe, farWrist: (s) => s.far.wrist, farKnee: (s) => s.far.knee, farToe: (s) => s.far.toe });

const renderProp = (rawProp, points, baseToAbsolute, floorY) => {
  // `abs: true` → coordenadas absolutas del lienzo (no se mueven con la figura, p. ej. un cajón al saltar).
  // `rel: 'shoulder' | 'wrist' | …` → coordenadas relativas a esa articulación (por defecto, la cadera).
  const origin = rawProp.rel ? JOINTS[rawProp.rel](points) : [0, 0];
  const toAbsolute = rawProp.abs ? (point) => point : ([x, y]) => baseToAbsolute([x + origin[0], y + origin[1]]);
  const prop = rawProp;
  const handOf = (side = 'near') => baseToAbsolute(points[side]?.wrist ?? points.near.wrist);
  const at = (value, side) => {
    if (value === 'hand' || value === undefined) return handOf(side);
    if (typeof value === 'string') return baseToAbsolute(JOINTS[value](points));
    return toAbsolute(value);
  };
  switch (prop.type) {
    case 'bench': {
      const [a, b] = [toAbsolute(prop.from), toAbsolute(prop.to)];
      const legs = (prop.legs ?? [0.15, 0.85]).map((f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
      return legs.map((p) => line([p[0], p[1] + 3], [p[0], floorY], COLORS.frame, 3)).join('') + line(a, b, COLORS.frame, 6);
    }
    case 'pad': {
      // Respaldo paralelo al torso (banco plano/inclinado, máquina), del lado de la espalda.
      const [hip, shoulder] = [points.hip, points.shoulder];
      const vx = shoulder[0] - hip[0];
      const vy = shoulder[1] - hip[1];
      const length = Math.hypot(vx, vy);
      // Normal hacia el pecho = torso rotado 90° (de pie mira a +x, boca arriba mira hacia arriba, boca abajo hacia el piso).
      const facing = (prop.side ?? 'back') === 'front' ? 1 : -1;
      const nx = (-vy / length) * facing;
      const ny = (vx / length) * facing;
      const offset = prop.offset ?? 8;
      const [before, after] = prop.extend ?? [6, 6];
      const a = baseToAbsolute([hip[0] + nx * offset - (vx / length) * before, hip[1] + ny * offset - (vy / length) * before]);
      const b = baseToAbsolute([shoulder[0] + nx * offset + (vx / length) * after, shoulder[1] + ny * offset + (vy / length) * after]);
      const supports = prop.legs === false ? '' : [a, b].filter(([, y]) => y < floorY - 6).map((p) => line([p[0], p[1] + 3], [p[0], floorY], COLORS.frame, 3)).join('');
      return supports + line(a, b, COLORS.frame, 6);
    }
    case 'seat': {
      const [x, y] = baseToAbsolute([(prop.x ?? 0) + origin[0], (prop.y ?? 9) + origin[1]]);
      const w = prop.w ?? 26;
      return line([x - w / 2, y], [x + w / 2, y], COLORS.frame, 6) + (prop.post === false ? '' : line([x, y + 3], [x, floorY], COLORS.frame, 4));
    }
    case 'box': {
      const [x, y] = toAbsolute(prop.pos);
      return rect(x, y, prop.w, floorY - y, 'none') + `<rect x="${fmt(x)}" y="${fmt(y)}" width="${prop.w}" height="${fmt(floorY - y)}" rx="2" fill="none" stroke="${COLORS.frame}" stroke-width="3"/>`;
    }
    case 'seg':
      return line(toAbsolute(prop.from), toAbsolute(prop.to), COLORS.frame, prop.width ?? 4);
    case 'post': {
      const [x, y] = toAbsolute(prop.pos);
      return line([x, y], [x, floorY], COLORS.frame, 4);
    }
    case 'barbell': {
      const c0 = at(prop.at, prop.side);
      const c = [c0[0] + (prop.offset?.[0] ?? 0), c0[1] + (prop.offset?.[1] ?? 0)];
      return line([c[0] - (prop.bar ?? 0), c[1]], [c[0] + (prop.bar ?? 0), c[1]], COLORS.frame, 2.5) + circle(c, prop.r ?? 11, 'none', COLORS.gear, 3.5) + circle(c, 2.2, COLORS.gear);
    }
    case 'dumbbell': {
      const sides = prop.both === false ? ['near'] : ['far', 'near'];
      return sides.map((side) => {
        const hand = handOf(side);
        const c = [hand[0] + (prop.offset?.[0] ?? 0), hand[1] + (prop.offset?.[1] ?? 0)];
        return circle(c, 5.5, side === 'far' ? 'var(--surface)' : COLORS.gear, COLORS.gear, 2);
      }).join('');
    }
    case 'kettlebell': {
      const c = at(prop.at);
      return line(c, [c[0], c[1] + 5], COLORS.gear, 2.5) + circle([c[0], c[1] + 10], 6.5, COLORS.gear);
    }
    case 'plate': {
      const c = at(prop.at);
      return circle(c, prop.r ?? 9, 'none', COLORS.gear, 3);
    }
    case 'ball': {
      const c = prop.pos ? toAbsolute(prop.pos) : handOf();
      return circle([c[0] + (prop.dx ?? 0), c[1] + (prop.dy ?? 0)], prop.r ?? 8, COLORS.gear);
    }
    case 'cable': {
      const anchor = toAbsolute(prop.to);
      const hand = handOf(prop.side);
      return line([anchor[0], anchor[1] - 6], [anchor[0], floorY], COLORS.frame, 3.5) + line(anchor, hand, COLORS.gear, 1.8) + circle(anchor, 3.5, COLORS.frame);
    }
    case 'bar': {
      const c = prop.pos ? toAbsolute(prop.pos) : handOf();
      return line([c[0] - 14, c[1]], [c[0] + 14, c[1]], COLORS.frame, 4) + circle(c, 3, COLORS.frame);
    }
    case 'rope': {
      const c = toAbsolute(prop.pos);
      return line([c[0], FIGURE_SIZE.top + 4], [c[0], floorY], COLORS.gear, 3);
    }
    case 'wave': {
      const c = handOf();
      const length = prop.length ?? 60;
      let d = `M${fmt(c[0])} ${fmt(c[1])}`;
      for (let index = 1; index <= 6; index += 1) d += ` Q${fmt(c[0] + (index - 0.5) * (length / 6))} ${fmt(c[1] + (index % 2 ? -6 : 6) * (prop.amp ?? 1))} ${fmt(c[0] + index * (length / 6))} ${fmt(c[1])}`;
      return `<path d="${d}" fill="none" stroke="${COLORS.gear}" stroke-width="2.5" stroke-linecap="round"/>`;
    }
    case 'arc': {
      // Soga de saltar: arco que pasa por ambas manos.
      const a = handOf('far');
      const b = handOf('near');
      const lowY = prop.under ? floorY + 2 : Math.min(a[1], b[1]) - 60;
      return `<path d="M${fmt(a[0])} ${fmt(a[1])} Q${fmt((a[0] + b[0]) / 2)} ${fmt(lowY)} ${fmt(b[0])} ${fmt(b[1])}" fill="none" stroke="${COLORS.gear}" stroke-width="2"/>`;
    }
    case 'wheel': {
      const c = handOf();
      return circle([c[0], c[1] + 2], 7, 'none', COLORS.gear, 3);
    }
    case 'bike': {
      const seat = toAbsolute(prop.seat ?? [0, 4]);
      const handle = toAbsolute(prop.handle);
      const front = [handle[0] + 4, floorY - 14];
      const back = [seat[0] - 14, floorY - 14];
      return [
        circle(front, 14, 'none', COLORS.frame, 3), circle(back, 14, 'none', COLORS.frame, 3),
        line(back, [seat[0], seat[1] + 3], COLORS.frame, 3), line([seat[0], seat[1] + 3], [seat[0] + 18, floorY - 16], COLORS.frame, 3),
        line([seat[0] + 18, floorY - 16], front, COLORS.frame, 3), line([seat[0] + 18, floorY - 16], handle, COLORS.frame, 3),
        line([seat[0] - 6, seat[1] + 3], [seat[0] + 6, seat[1] + 3], COLORS.frame, 4),
      ].join('');
    }
    case 'water':
      return `<path d="M10 ${floorY - 34} q10 -5 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="${COLORS.frame}" stroke-width="2" opacity="0.6"/>`;
    case 'wall': {
      const [x] = toAbsolute(prop.pos);
      return line([x, FIGURE_SIZE.top + 4], [x, floorY], COLORS.frame, 5);
    }
    case 'net': {
      const [x] = toAbsolute(prop.pos);
      return line([x, floorY - (prop.h ?? 40)], [x, floorY], COLORS.frame, 3);
    }
    case 'racket': {
      const c = handOf();
      const tip = add(c, 16, prop.angle ?? 180);
      return line(c, tip, COLORS.frame, 2.5) + `<ellipse cx="${fmt(tip[0])}" cy="${fmt(tip[1])}" rx="6" ry="8" fill="none" stroke="${COLORS.gear}" stroke-width="2.5"/>`;
    }
    case 'arrow': {
      // Flecha de dirección del movimiento (opcional).
      const [a, b] = [toAbsolute(prop.from), toAbsolute(prop.to)];
      return line(a, b, COLORS.gear, 1.5, ' stroke-dasharray="3 3" opacity="0.8"');
    }
    default:
      return '';
  }
};

const FRONT_PROPS = (prop, s, toAbsolute, floorY) => {
  const hands = s.arms.map(([, wrist]) => toAbsolute(wrist));
  switch (prop.type) {
    case 'dumbbell':
      return hands.map((hand) => line([hand[0], hand[1] - 6], [hand[0], hand[1] + 6], COLORS.gear, 3) + rect(hand[0] - 5, hand[1] - 8, 10, 4, COLORS.gear, 1) + rect(hand[0] - 5, hand[1] + 4, 10, 4, COLORS.gear, 1)).join('');
    case 'barbell': {
      const [a, b] = hands;
      return line([a[0] - 22, a[1]], [b[0] + 22, b[1]], COLORS.frame, 3) + rect(a[0] - 26, a[1] - 11, 6, 22, COLORS.gear, 2) + rect(b[0] + 20, b[1] - 11, 6, 22, COLORS.gear, 2);
    }
    case 'cable':
      return hands.map((hand, index) => {
        const anchor = toAbsolute(prop.anchors[index]);
        return line([anchor[0], anchor[1]], [anchor[0], floorY], COLORS.frame, 3.5) + line(anchor, hand, COLORS.gear, 1.8) + circle(anchor, 3.5, COLORS.frame);
      }).join('');
    case 'seat': {
      const [x, y] = toAbsolute(prop.pos);
      return rect(x - prop.w / 2, y, prop.w, 6, COLORS.frame, 2) + line([x, y + 6], [x, floorY], COLORS.frame, 4);
    }
    case 'pads':
      return s.legs.map(([knee], index) => {
        const p = toAbsolute(knee);
        return rect(p[0] + (index === 0 ? -(prop.inside ? -2 : 10) : (prop.inside ? -8 : 2)), p[1] - 8, 6, 16, COLORS.gear, 2);
      }).join('');
    case 'band': {
      const knees = s.legs.map(([knee]) => toAbsolute(knee));
      return line(knees[0], knees[1], COLORS.gear, 2.5);
    }
    default:
      return '';
  }
};

const bodyStroke = (a, b, color, width = 7) => line(a, b, color, width);

/**
 * Devuelve el SVG (texto) de una pose. Colores por variables CSS del tema → se adapta a claro/oscuro.
 */
export const renderPoseSvg = (rawPose, { title = '' } = {}) => {
  const pose = rawPose.solve ? solveTorso(rawPose) : rawPose;
  const isFront = pose.view === 'front';
  const parts = [];
  const props = pose.props ?? [];

  if (isFront) {
    const s = frontSkeleton(pose);
    const all = [...s.arms.flat(), ...s.legs.flat(), ...s.feet.flat(), s.head, ...s.shoulders];
    const rotateAbout = pose.rot ? [s.feet[0][0][0], s.feet[0][0][1]] : null;
    const rotateFn = (point) => (rotateAbout ? rotatePoint(point, rotateAbout, pose.rot) : point);
    const rotated = all.map(rotateFn);
    const bottom = Math.max(...rotated.map(([, y]) => y)) + (pose.ground === 'lowest' ? 4 : 0);
    const dy = pose.ground === 'none' ? (pose.hip?.[1] ?? 90) : FLOOR_Y - bottom - (pose.lift ?? 0);
    const xs = rotated.map(([x]) => x);
    const dx = 100 - (Math.min(...xs) + Math.max(...xs)) / 2 + (pose.dx ?? 0);
    const toAbsolute = (point) => {
      const [x, y] = rotateFn(point);
      return [x + dx, y + dy];
    };
    props.filter((prop) => ['seat', 'cable'].includes(prop.type)).forEach((prop) => parts.push(FRONT_PROPS(prop, s, toAbsolute, FLOOR_Y)));
    s.legs.forEach(([knee, ankle], index) => {
      parts.push(bodyStroke(toAbsolute(s.hips[index]), toAbsolute(knee), COLORS.body), bodyStroke(toAbsolute(knee), toAbsolute(ankle), COLORS.body, 6.5));
      parts.push(bodyStroke(toAbsolute(s.feet[index][0]), toAbsolute(s.feet[index][1]), COLORS.body, 5));
    });
    parts.push(`<polygon points="${[s.shoulders[0], s.shoulders[1], s.hips[1], s.hips[0]].map(toAbsolute).map((p) => p.map(fmt).join(',')).join(' ')}" fill="${COLORS.body}" stroke="${COLORS.body}" stroke-width="6" stroke-linejoin="round"/>`);
    parts.push(bodyStroke(toAbsolute(s.shoulderCenter), toAbsolute(s.neckTop), COLORS.body, 6));
    parts.push(circle(toAbsolute(s.head), LENGTHS.head, COLORS.body));
    s.arms.forEach(([elbow, wrist], index) => {
      parts.push(bodyStroke(toAbsolute(s.shoulders[index]), toAbsolute(elbow), COLORS.body, 6.5), bodyStroke(toAbsolute(elbow), toAbsolute(wrist), COLORS.body, 6));
    });
    props.filter((prop) => !['seat', 'cable'].includes(prop.type)).forEach((prop) => parts.push(FRONT_PROPS(prop, s, toAbsolute, FLOOR_Y)));
  } else {
    const s = sideSkeleton(pose);
    const bodyPoints = [s.head, s.shoulder, s.hip, ...['near', 'far'].flatMap((side) => [s[side].elbow, s[side].wrist, s[side].knee, s[side].ankle, s[side].toe])];
    let dy;
    if (pose.ground === 'grip') dy = pose.grip[1] - s.near.wrist[1]; // colgado: la mano queda fija en la barra
    else if (pose.ground === 'none') dy = pose.hip?.[1] ?? 90;
    else if (pose.ground === 'seat') dy = FLOOR_Y - (pose.seatH ?? 40); // sentado con los pies en el aire (máquinas)
    else if (pose.ground === 'lowest') dy = FLOOR_Y - 3.5 - Math.max(...bodyPoints.map(([, y], index) => (index === 0 ? y + LENGTHS.head - 3.5 : y)));
    else dy = FLOOR_Y - 2.5 - Math.max(s.near.toe[1], s.far.toe[1], s.near.ankle[1], s.far.ankle[1]);
    dy -= pose.lift ?? 0; // saltos: la figura se despega del piso
    const xs = bodyPoints.map(([x]) => x);
    const dx = pose.ground === 'grip'
      ? pose.grip[0] - s.near.wrist[0]
      : pose.hip?.[0] ?? 100 - (Math.min(...xs) + Math.max(...xs)) / 2 + (pose.dx ?? 0);
    const toAbsolute = ([x, y]) => [x + dx, y + dy];
    const back = props.filter((prop) => ['bench', 'pad', 'seat', 'box', 'seg', 'post', 'cable', 'bike', 'water', 'wall', 'net', 'rope', 'bar', 'arrow'].includes(prop.type));
    const front = props.filter((prop) => !back.includes(prop));
    back.forEach((prop) => parts.push(renderProp(prop, s, toAbsolute, FLOOR_Y)));
    const limbs = (side, color) => [
      bodyStroke(toAbsolute(s.hip), toAbsolute(s[side].knee), color, 7.5),
      bodyStroke(toAbsolute(s[side].knee), toAbsolute(s[side].ankle), color, 6.5),
      bodyStroke(toAbsolute(s[side].ankle), toAbsolute(s[side].toe), color, 5),
    ];
    const arm = (side, color) => [
      bodyStroke(toAbsolute(s.shoulder), toAbsolute(s[side].elbow), color, 6.5),
      bodyStroke(toAbsolute(s[side].elbow), toAbsolute(s[side].wrist), color, 6),
    ];
    parts.push(...arm('far', COLORS.far), ...limbs('far', COLORS.far));
    parts.push(bodyStroke(toAbsolute(s.hip), toAbsolute(s.shoulder), COLORS.body, 11));
    parts.push(bodyStroke(toAbsolute(s.shoulder), toAbsolute(s.neckTop), COLORS.body, 6));
    parts.push(circle(toAbsolute(s.head), LENGTHS.head, COLORS.body));
    parts.push(...limbs('near', COLORS.body), ...arm('near', COLORS.body));
    front.forEach((prop) => parts.push(renderProp(prop, s, toAbsolute, FLOOR_Y)));
  }

  const floor = pose.noFloor ? '' : line([8, FLOOR_Y + 1], [192, FLOOR_Y + 1], COLORS.floor, 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${FIGURE_SIZE.top} ${FIGURE_SIZE.width} ${FIGURE_SIZE.height}" role="img" aria-label="${title.replace(/"/g, '')}">${floor}${parts.join('')}</svg>`;
};

// Pose intermedia: promedio de dos poses (mismos campos numéricos). Para "Mitad" cuando no se define a mano.
const blend = (a, b) => {
  if (typeof a === 'number' && typeof b === 'number') return (a + b) / 2;
  if (Array.isArray(a) && Array.isArray(b) && a.length === b.length && a[0] !== 'rel') return a.map((value, index) => blend(value, b[index]));
  if (Array.isArray(a) && Array.isArray(b) && a[0] === 'rel' && b[0] === 'rel') return ['rel', blend(a[1], b[1]), blend(a[2], b[2])];
  return a;
};

export const interpolatePose = (start, end) => {
  const result = { ...start };
  ['t', 'neck', 'tilt', 'rot', 'lift', 'dx', 'shrug'].forEach((key) => {
    if (typeof start[key] === 'number' || typeof end[key] === 'number') result[key] = blend(start[key] ?? 0, end[key] ?? 0);
  });
  ['a1', 'a2', 'l1', 'l2', 'arms', 'legs', 'hip', 'grip', 'shrug'].forEach((key) => {
    if (start[key] !== undefined && end[key] !== undefined) result[key] = blend(start[key], end[key]);
  });
  return result;
};
