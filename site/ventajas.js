// ════════════════════════════════════════════
//   VENTAJAS.JS — Tier list de perks Black Ops 7 / Warzone
//   Íconos: /icons/perks 1/, /icons/perks 2/, /icons/perks 3/
// ════════════════════════════════════════════

const VENTAJAS = [
    // ════════════ PERK 1 (icons/perks 1/) ════════════
    {
        nombre: 'INSTRUCTOR',
        nombre_en: 'Drill Instructor',
        slot: 'PERK 1',
        icon: 'icons/perks 1/Drill Instructor.webp',
        tier: 'S',
        uso: 'Movilidad',
        descripcion: 'Aumenta la velocidad y mobility tuya y de aliados cercanos. La perk más fuerte para escuadras agresivas. Esencial para flanqueos y rotaciones rápidas.'
    },
    {
        nombre: 'MÉDICO DE CAMPO',
        nombre_en: 'Field Medic',
        slot: 'PERK 1',
        icon: 'icons/perks 1/Field Medic.webp',
        tier: 'S',
        uso: 'Soporte',
        descripcion: 'Reanima compañeros mucho más rápido y aplica placas más rápido. Top tier para squads coordinados. Combo perfecto con Survivor.'
    },
    {
        nombre: 'MONTAÑISTA',
        nombre_en: 'Mountaineer',
        slot: 'PERK 1',
        icon: 'icons/perks 1/Mountaineer.webp',
        tier: 'A',
        uso: 'Movilidad',
        descripcion: 'Reduce daño por caída y mejora escalada. Ideal para solos agresivos en terreno vertical, rooftops y plays con Grappling Hook.'
    },
    {
        nombre: 'CARROÑERO',
        nombre_en: 'Scavenger',
        slot: 'PERK 1',
        icon: 'icons/perks 1/Scavenger.webp',
        tier: 'B',
        uso: 'Sostenibilidad',
        descripcion: 'Recoge munición de jugadores caídos. Bajó del meta porque ya no dropea dinero. Mejor invertir en cajas de munición y armadura.'
    },
    {
        nombre: 'TOPÓGRAFO',
        nombre_en: 'Surveyor',
        slot: 'PERK 1',
        icon: 'icons/perks 1/Surveyor.webp',
        tier: 'A',
        uso: 'Awareness',
        descripcion: 'Da información táctica al equipo sobre movimiento enemigo. Excelente para trios y quads que quieren controlar zonas.'
    },

    // ════════════ PERK 2 (icons/perks 2/) ════════════
    {
        nombre: 'BERSERKER',
        nombre_en: 'Berserker',
        slot: 'PERK 2',
        icon: 'icons/perks 2/Berserker.webp',
        tier: 'S',
        uso: 'Combate',
        descripcion: 'Recarga y colocación de placas más rápidas tras kill. Mantiene la presión ofensiva en tiroteos consecutivos. Top para jugadores agresivos.'
    },
    {
        nombre: 'MOMENTUM',
        nombre_en: 'Momentum',
        slot: 'PERK 2',
        icon: 'icons/perks 2/Momentum.webp',
        tier: 'S',
        uso: 'Movilidad',
        descripcion: 'Aumenta velocidad y handling sostenido en sprint. Crucial para combates close-range donde cada milisegundo cuenta.'
    },
    {
        nombre: 'CURACIÓN RÁPIDA',
        nombre_en: 'Quick Fix',
        slot: 'PERK 2',
        icon: 'icons/perks 2/Quick Fix.webp',
        tier: 'B',
        uso: 'Sostenibilidad',
        descripcion: 'Recupera salud al hacer kills. Útil en estilos agresivos donde no puedes pausar para platear.'
    },
    {
        nombre: 'ARMADURA REACTIVA',
        nombre_en: 'Reactive Armor',
        slot: 'PERK 2',
        icon: 'icons/perks 2/Reactive Armor.webp',
        tier: 'A',
        uso: 'Defensa',
        descripcion: 'Restaura armadura lentamente al evitar daño. Excelente en círculos finales cuando ya no hay buy stations.'
    },
    {
        nombre: 'CORREDOR',
        nombre_en: 'Sprinter',
        slot: 'PERK 2',
        icon: 'icons/perks 2/Sprinter.webp',
        tier: 'S',
        uso: 'Movilidad',
        descripcion: 'Tactical Sprint extendido. La perk de movilidad más usada del meta. Esencial para rotaciones rápidas y reposicionamiento agresivo.'
    },

    // ════════════ PERK 3 (icons/perks 3/) ════════════
    {
        nombre: 'ADAPTABLE',
        nombre_en: 'Adaptive',
        slot: 'PERK 3',
        icon: 'icons/perks 3/Adaptive.webp',
        tier: 'S',
        uso: 'Combate',
        descripcion: 'Mejora movilidad y handling de armas. Combo perfecto con Drill Instructor + Sprinter para máxima movilidad. Top para AR/SMG mains.'
    },
    {
        nombre: 'FANTASMA',
        nombre_en: 'Ghost',
        slot: 'PERK 3',
        icon: 'icons/perks 3/Ghost.webp',
        tier: 'S',
        uso: 'Stealth',
        descripcion: 'Invisible a UAVs, drones de pulso y sensores cuando estás en movimiento. La perk más usada en clasificatorio para juego sigiloso.'
    },
    {
        nombre: 'CAZADOR',
        nombre_en: 'Hunter',
        slot: 'PERK 3',
        icon: 'icons/perks 3/Hunter.webp',
        tier: 'A',
        uso: 'Awareness',
        descripcion: 'Marca enemigos al dispararles y avisa cuando alguien te apunta. Combo de Tracker + Alertness. Perfecto para squads que quieren más información.'
    },
    {
        nombre: 'SUPERVIVIENTE',
        nombre_en: 'Survivor',
        slot: 'PERK 3',
        icon: 'icons/perks 3/Survivor.webp',
        tier: 'A',
        uso: 'Defensa',
        descripcion: 'Pide reanimación automáticamente al caer y resiste más tiempo en estado downed. Combo con Field Medic para clutch revives.'
    },
    {
        nombre: 'TEMPLADO',
        nombre_en: 'Tempered',
        slot: 'PERK 3',
        icon: 'icons/perks 3/Tempered.webp',
        tier: 'B',
        uso: 'Defensa',
        descripcion: 'Solo necesitas 2 placas para chaleco completo (en vez de 3). Opción defensiva sólida que estira tus placas en juego prolongado.'
    }
];

// Letales pendientes.
// Tácticos activos: usan los GIF ya subidos en /icons/tacticals/
const LETALES = [
    {
        nombre: 'C4',
        nombre_en: 'C4',
        slot: 'LETAL',
        icon: 'icons/lethals/C4.gif',
        tier: 'S',
        uso: 'Burst Damage',
        descripcion: 'Explosivo remoto ideal para castigar vehículos, controlar entradas y forzar daño rápido cuando el enemigo está detrás de cobertura.'
    },
    {
        nombre: 'GRANADA DE RACIMO',
        nombre_en: 'Cluster Grenade',
        slot: 'LETAL',
        icon: 'icons/lethals/Cluster-Grenade.gif',
        tier: 'S',
        uso: 'Zona',
        descripcion: 'Excelente para negar espacios, sacar enemigos de cobertura y controlar habitaciones o escaleras antes de pushear.'
    },
    {
        nombre: 'GRANADA ADHESIVA',
        nombre_en: 'Sticky Grenade',
        slot: 'LETAL',
        icon: 'icons/lethals/Sticky-Grenade.gif',
        tier: 'S',
        uso: 'Precisión',
        descripcion: 'Letal muy consistente para rematar jugadores, abrir peleas y castigar rivales que están plateando o jugando detrás de objetos.'
    },
    {
        nombre: 'MOLOTOV',
        nombre_en: 'Molotov',
        slot: 'LETAL',
        icon: 'icons/lethals/Molotov.gif',
        tier: 'A',
        uso: 'Control',
        descripcion: 'Sirve para cortar rotaciones, bloquear puertas y negar zonas por varios segundos. Muy útil en círculos finales y peleas de edificios.'
    },
    {
        nombre: 'FRAGMENTACIÓN',
        nombre_en: 'Frag Grenade',
        slot: 'LETAL',
        icon: 'icons/lethals/Frag.gif',
        tier: 'A',
        uso: 'Explosivo',
        descripcion: 'Granada clásica con buen potencial si se cocina bien. Funciona para limpiar esquinas, ventanas y enemigos agrupados.'
    },
    {
        nombre: 'HACHA DE COMBATE',
        nombre_en: 'Combat Axe',
        slot: 'LETAL',
        icon: 'icons/lethals/Combat-Axe.gif',
        tier: 'B',
        uso: 'Skill',
        descripcion: 'Letal de alto riesgo y alta recompensa. Puede asegurar bajas rápidas, pero exige precisión y timing.'
    },
    {
        nombre: 'NEEDLE DRONE',
        nombre_en: 'Needle Drone',
        slot: 'LETAL',
        icon: 'icons/lethals/Needle-Drone.gif',
        tier: 'B',
        uso: 'Presión',
        descripcion: 'Útil para molestar, presionar y obligar al enemigo a moverse, aunque es menos universal que C4, Sticky o Cluster.'
    },
    {
        nombre: 'TORRETA POINT',
        nombre_en: 'Point Turret',
        slot: 'LETAL',
        icon: 'icons/lethals/Point-Turret.gif',
        tier: 'B',
        uso: 'Defensa',
        descripcion: 'Opción situacional para mantener presión en una zona o cubrir ángulos. Mejor en setups defensivos que en rotaciones agresivas.'
    }
];
const TACTICOS = [
    {
        nombre: 'HUMO',
        nombre_en: 'Smoke Grenade',
        slot: 'TÁCTICO',
        icon: 'icons/tacticals/smoke.gif',
        tier: 'S',
        uso: 'Rotación',
        descripcion: 'Crea cobertura visual para cruzar zonas abiertas, revivir compañeros, reposicionarse o escapar de un mal trade. Es uno de los tácticos más seguros para Battle Royale y Ranked.'
    },
    {
        nombre: 'ESTIMULANTE',
        nombre_en: 'Stim Shot',
        slot: 'TÁCTICO',
        icon: 'icons/tacticals/stim-shot.gif',
        tier: 'S',
        uso: 'Movilidad',
        descripcion: 'Regenera vida y permite jugar más agresivo en peleas cortas. Muy fuerte para reposicionarse, resetear un combate o sobrevivir en gas/círculos finales.'
    },
    {
        nombre: 'GRANADA DE LOCALIZACIÓN',
        nombre_en: 'Pinpoint Grenade',
        slot: 'TÁCTICO',
        icon: 'icons/tacticals/pinpoint-grenade.gif',
        tier: 'S',
        uso: 'Información',
        descripcion: 'Ayuda a revelar o marcar la posición enemiga antes de pushear. Excelente para squads que juegan coordinados y quieren limpiar edificios con más seguridad.'
    },
    {
        nombre: 'CEGADORA',
        nombre_en: 'Flashbang',
        slot: 'TÁCTICO',
        icon: 'icons/tacticals/flashbang.gif',
        tier: 'A',
        uso: 'Entrada',
        descripcion: 'Desorienta al enemigo antes de entrar a una habitación o forzar un duelo. Muy útil para romper posiciones defensivas, aunque depende de buen timing.'
    },
    {
        nombre: 'ATURDIDORA',
        nombre_en: 'Stun Grenade',
        slot: 'TÁCTICO',
        icon: 'icons/tacticals/stun-grenade.gif',
        tier: 'A',
        uso: 'Control',
        descripcion: 'Reduce la reacción del rival y facilita ganar el primer disparo. Buena para pushes agresivos, escaleras, pasillos y peleas de corto alcance.'
    },
    {
        nombre: 'GRANADA EMP',
        nombre_en: 'EMP Grenade',
        slot: 'TÁCTICO',
        icon: 'icons/tacticals/emp-grenade.gif',
        tier: 'A',
        uso: 'Anti-equipo',
        descripcion: 'Sirve para cortar utilidad enemiga, molestar sensores y abrir una ventana de ataque. Muy buena contra equipos que dependen de gadgets o setups defensivos.'
    },
    {
        nombre: 'HUNTER BOT',
        nombre_en: 'Hunter Bot',
        slot: 'TÁCTICO',
        icon: 'icons/tacticals/hunter-bot.gif',
        tier: 'A',
        uso: 'Presión',
        descripcion: 'Presiona y obliga al enemigo a moverse o revelar su posición. Funciona bien para sacar rivales de cobertura antes de avanzar.'
    },
    {
        nombre: 'GRANADA PSICOLÓGICA',
        nombre_en: 'Psych Grenade',
        slot: 'TÁCTICO',
        icon: 'icons/tacticals/psych-grenade.gif',
        tier: 'B',
        uso: 'Disrupción',
        descripcion: 'Genera confusión y puede romper la lectura del rival, pero es menos consistente que humo, estimulante o granadas de información.'
    },
    {
        nombre: 'SEÑUELO',
        nombre_en: 'Decoy Grenade',
        slot: 'TÁCTICO',
        icon: 'icons/tacticals/decoy.gif',
        tier: 'B',
        uso: 'Distracción',
        descripcion: 'Crea ruido falso para distraer o engañar al enemigo. Puede servir para bait, pero normalmente aporta menos valor que otros tácticos del meta.'
    }
];


// ════════════════════════════════════════════════════════════════════
//   MULTIJUGADOR BLACK OPS 7 — sistema de perks propio (distinto a WZ)
//   Los perks se agrupan en 3 ESPECIALIDADES DE COMBATE:
//     • ENFORCER (rojo)     — ofensiva y movilidad agresiva
//     • RECON (azul)        — sigilo, radar e información
//     • STRATEGIST (verde)  — objetivos, equipamiento y soporte
//   Equipar 3 perks de la misma especialidad activa su BONUS (ver
//   ESPECIALIDADES abajo). Especialidad = tag `slot`; tier según wzstats,
//   efectos verificados. No llevan icono propio: se muestra un distintivo
//   con la inicial y el color de la especialidad.
// ════════════════════════════════════════════════════════════════════
const MULTIJUGADOR = [
    // ─────────── ENFORCER (ofensiva / movilidad) ───────────
    { nombre: 'LIGERO', nombre_en: 'Lightweight', slot: 'ENFORCER', tier: 'S', uso: 'Movilidad',
      descripcion: 'Aumenta la velocidad de sprint y acelera la recuperación tras deslizarte o clavarte. Suma distancia de salto, deslizamiento y clavado. Base del meta de movimiento.' },
    { nombre: 'CARROÑERO', nombre_en: 'Scavenger', slot: 'ENFORCER', tier: 'S', uso: 'Sostenibilidad',
      descripcion: 'Reabastece munición y equipamiento de los enemigos eliminados. Sustain fiable para mantener rachas largas sin quedarte sin balas.' },
    { nombre: 'GUNG HO', nombre_en: 'Gung-Ho', slot: 'ENFORCER', tier: 'A', uso: 'Combate',
      descripcion: 'Podés disparar mientras esprintas y moverte más rápido al recargar o usar equipamiento. Define el meta agresivo de subfusil.' },
    { nombre: 'REENGANCHE', nombre_en: 'Looper', slot: 'ENFORCER', tier: 'A', uso: 'Rachas',
      descripcion: 'Permite volver a ganar tus rachas de puntos dentro de la misma vida, encadenando streaks si mantenés la presión.' },
    { nombre: 'FONDO', nombre_en: 'Bankroll', slot: 'ENFORCER', tier: 'A', uso: 'Rachas',
      descripcion: 'Empezás cada vida con progreso extra acumulado hacia tu racha de puntos. Ideal para llegar antes a los scorestreaks.' },
    { nombre: 'ASESINO', nombre_en: 'Assassin', slot: 'ENFORCER', tier: 'A', uso: 'Combate',
      descripcion: 'Marca a los enemigos que van en racha y suelta un paquete de recompensa al eliminarlos. Premia cazar a los que dominan la partida.' },
    { nombre: 'DESTREZA', nombre_en: 'Dexterity', slot: 'ENFORCER', tier: 'B', uso: 'Movilidad',
      descripcion: 'Estabiliza la puntería durante deslizamientos, clavados y wall jumps: mantenés el control con mira mientras te movés. Además reduce el daño por caída.' },
    { nombre: 'APURADO', nombre_en: 'Close Shave', slot: 'ENFORCER', tier: 'C', uso: 'Combate',
      descripcion: 'Las bajas cuerpo a cuerpo restauran salud y dan puntos extra. Nicho, para estilos muy agresivos de corto alcance.' },
    { nombre: 'ESPRÍNTER TÁCTICO', nombre_en: 'Tac Sprinter', slot: 'ENFORCER', tier: 'D', uso: 'Movilidad',
      descripcion: 'Prolonga el sprint táctico, pero reduce la velocidad del sprint normal. El intercambio rara vez compensa frente a Ligero.' },

    // ─────────── RECON (sigilo / información) ───────────
    { nombre: 'FANTASMA', nombre_en: 'Ghost', slot: 'RECON', tier: 'S', uso: 'Sigilo',
      descripcion: 'Te oculta de los UAV, el Pulso de Reconocimiento y las Alarmas de Proximidad mientras te movés o jugás el objetivo. Indispensable para no aparecer en el radar.' },
    { nombre: 'NINJA', nombre_en: 'Ninja', slot: 'RECON', tier: 'S', uso: 'Sigilo',
      descripcion: 'Silencia el sonido de tus pasos: te volvés casi inaudible para los enemigos cercanos. Enorme en modos de audio competitivo.' },
    { nombre: 'SANGRE FRÍA', nombre_en: 'Cold-Blooded', slot: 'RECON', tier: 'S', uso: 'Sigilo',
      descripcion: 'Te hace indetectable para las miras térmicas y los sistemas de puntería por IA y de rachas enemigas. Anula que te fijen automáticamente.' },
    { nombre: 'VIGILANCIA', nombre_en: 'Vigilance', slot: 'RECON', tier: 'S', uso: 'Alerta',
      descripcion: 'Te avisa cuando aparecés en el minimapa enemigo y te da inmunidad a los UAV contrarios y a los Scramblers. Información pura para sobrevivir.' },
    { nombre: 'RASTREADOR', nombre_en: 'Tracker', slot: 'RECON', tier: 'A', uso: 'Alerta',
      descripcion: 'Muestra las pisadas de los enemigos en el mundo y los marca automáticamente al apuntar. Convierte cada rastro en información.' },
    { nombre: 'ONDA EXPANSIVA', nombre_en: 'Blast Link', slot: 'RECON', tier: 'A', uso: 'Alerta',
      descripcion: 'Marca a los enemigos dañados por explosivos y comparte esa información con todo tu equipo. Fuerte para squads coordinados.' },
    { nombre: 'INGENIERO', nombre_en: 'Engineer', slot: 'RECON', tier: 'B', uso: 'Utilidad',
      descripcion: 'Ve el equipamiento y las rachas enemigas a través de las paredes y evita activar trampas y minas. Contrarresta el juego de equipamiento.' },

    // ─────────── STRATEGIST (objetivos / soporte) ───────────
    { nombre: 'MANOS RÁPIDAS', nombre_en: 'Fast Hands', slot: 'STRATEGIST', tier: 'A', uso: 'Utilidad',
      descripcion: 'Recargas, cambios de arma y recuperación de granadas más rápidos. Devolvé granadas enemigas con más margen. Comodidad que se nota en cada duelo.' },
    { nombre: 'CHALECO ANTIEXPLOSIVOS', nombre_en: 'Flak Jacket', slot: 'STRATEGIST', tier: 'A', uso: 'Defensa',
      descripcion: 'Reduce drásticamente el daño por explosiones y fuego. Clave contra spam de letales y modos de objetivo cargados de explosivos.' },
    { nombre: 'MECÁNICO', nombre_en: 'Gearhead', slot: 'STRATEGIST', tier: 'B', uso: 'Utilidad',
      descripcion: 'Duplica las cargas de tu Mejora de Campo y recarga el equipamiento con el tiempo. Más uptime de utilidad.' },
    { nombre: 'ENLACE DE CARGA', nombre_en: 'Charge Link', slot: 'STRATEGIST', tier: 'B', uso: 'Soporte',
      descripcion: 'Acelera la recarga de la Mejora de Campo para vos y los aliados cercanos. Soporte de equipo en modos de objetivo.' },
    { nombre: 'GUARDIÁN', nombre_en: 'Guardian', slot: 'STRATEGIST', tier: 'B', uso: 'Soporte',
      descripcion: 'Mejora la velocidad de curación y de reanimación mientras jugás el objetivo. Pensado para anclar zonas con tu escuadra.' },
    { nombre: 'MÁSCARA TÁCTICA', nombre_en: 'Tech Mask', slot: 'STRATEGIST', tier: 'B', uso: 'Defensa',
      descripcion: 'Reduce el efecto de destellos, gas y EMP enemigos y previene el hackeo. Te mantiene funcional entre el caos de utilidades.' }
];

// Icono REAL de cada perk (descargado a icons/perks-bo7/ — imágenes en nuestro
// repo, sin links externos). El slug = nombre_en en minúsculas con guiones,
// que coincide con los nombres de archivo. Si algún icono faltara, el render
// cae al distintivo con la inicial y el color de la especialidad.
MULTIJUGADOR.forEach(p => {
    if (!p.icon) {
        const slug = p.nombre_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        p.icon = `icons/perks-bo7/${slug}.png`;
    }
});

// Bonus de cada especialidad (se activan al equipar 3 perks de la misma).
const ESPECIALIDADES = [
    { nombre: 'ENFORCER', color: '#EF4444', desc: 'Tras cada baja, ganás un impulso breve de velocidad de movimiento y regeneración de salud. Recompensa el juego agresivo y encadenar peleas.' },
    { nombre: 'RECON', color: '#00A8FF', desc: 'Al reaparecer ves la dirección del enemigo más cercano, y el HUD pulsa en los bordes ante enemigos fuera de tu vista. Awareness constante.' },
    { nombre: 'STRATEGIST', color: '#00FF87', desc: 'Ganás puntos extra por objetivos, desplegás el equipamiento más rápido y resaltás el equipamiento enemigo cercano. Rey de los modos de objetivo.' }
];

// Color por especialidad (para el distintivo cuando el perk no tiene icono).
const ESP_COLORS = { ENFORCER: '#EF4444', RECON: '#00A8FF', STRATEGIST: '#00FF87' };


function injectVentajasReadabilityFix() {
    if (document.getElementById('ventajas-readability-fix')) return;
    const style = document.createElement('style');
    style.id = 'ventajas-readability-fix';
    style.textContent = `
        .ventaja-card {
            background: linear-gradient(135deg, rgba(15,21,27,.96), rgba(8,12,17,.98)) !important;
            border: 1px solid rgba(255,255,255,.095) !important;
            box-shadow: inset 0 0 0 1px rgba(255,255,255,.018), 0 12px 28px -24px rgba(0,0,0,.85) !important;
        }
        .ventaja-nombre {
            color: #FFFFFF !important;
            font-size: 1.08rem !important;
            letter-spacing: .045em !important;
            text-shadow: 0 2px 14px rgba(0,0,0,.55) !important;
        }
        .ventaja-nombre-en {
            color: #B9C3CE !important;
            font-size: .82rem !important;
            letter-spacing: .06em !important;
        }
        .ventaja-desc {
            color: #D9E1EA !important;
            font-size: .92rem !important;
            line-height: 1.55 !important;
            font-weight: 500 !important;
            letter-spacing: .01em !important;
            opacity: 1 !important;
        }
        .ventaja-slot,
        .ventaja-uso {
            color: #AEB8C4 !important;
            border-color: rgba(255,255,255,.14) !important;
            background: rgba(255,255,255,.035) !important;
        }
        .ventaja-icono-img {
            background: rgba(255,255,255,.035) !important;
            border: 1px solid rgba(255,255,255,.11) !important;
            box-shadow: 0 0 18px -12px rgba(255,255,255,.45) !important;
        }
    `;
    document.head.appendChild(style);
}

const TIER_COLORS_V = { S: '#FF9500', A: '#00FF87', B: '#00A8FF', C: '#BF5FFF', D: '#7A8494' };

function renderItemVentaja(item) {
    const color = TIER_COLORS_V[item.tier];
    // Los perks de MP no tienen icono propio: se muestra un distintivo con la
    // inicial y el color de su especialidad de combate.
    const espColor = (typeof ESP_COLORS !== 'undefined' && ESP_COLORS[item.slot]) || color;
    const iconoHtml = item.icon
        ? `<img src="${item.icon}" alt="${item.nombre}" onerror="this.style.display='none'">`
        : `<div class="ventaja-badge" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;
                font-family:var(--font-mono);font-size:20px;font-weight:800;color:${espColor};
                background:${espColor}14;border-radius:8px">${(item.slot || '?').charAt(0)}</div>`;
    return `
    <div class="ventaja-card" style="border-left:3px solid ${color}">
        <div class="ventaja-icono-img">
            ${iconoHtml}
        </div>
        <div class="ventaja-info">
            <div class="ventaja-header">
                <div>
                    <div class="ventaja-nombre">${item.nombre}</div>
                    <div class="ventaja-nombre-en">${item.nombre_en}</div>
                </div>
                <div class="ventaja-tags">
                    <span class="ventaja-tier" style="background:${color}15;color:${color};border-color:${color}66">${item.tier}</span>
                    <span class="ventaja-slot">${item.slot}</span>
                    <span class="ventaja-uso">${item.uso}</span>
                </div>
            </div>
            <div class="ventaja-desc">${item.descripcion}</div>
        </div>
    </div>`;
}

function renderTierGroup(letra, items, color) {
    if (!items.length) return '';
    return `
    <div class="tier-group">
        <div class="tier-group-header" style="border-color:${color}">
            <span class="tier-group-letter" style="color:${color}">${letra}</span>
            <span class="tier-group-count">${items.length} ITEMS</span>
        </div>
        <div class="tier-group-list">
            ${items.map(i => renderItemVentaja(i)).join('')}
        </div>
    </div>`;
}

function renderVentajas(filtro = 'perks') {
    injectVentajasReadabilityFix();
    console.log('[VENTAJAS] render:', filtro);
    const container = document.getElementById('ventajas-container');
    if (!container) return;

    let lista;
    if (filtro === 'perks') lista = VENTAJAS;
    else if (filtro === 'letales') lista = LETALES;
    else if (filtro === 'tacticos') lista = TACTICOS;
    else if (filtro === 'multijugador') lista = (typeof MULTIJUGADOR !== 'undefined' ? MULTIJUGADOR : []);
    else lista = VENTAJAS;

    if (!lista.length) {
        container.innerHTML = `<div style="text-align:center;padding:80px 24px;font-family:var(--font-mono);color:var(--text-muted);font-size:14px;letter-spacing:2px">
            🚧 PRÓXIMAMENTE — TIER LIST DE ${filtro.toUpperCase()}
        </div>`;
        return;
    }

    const grupos = {
        S: lista.filter(i => i.tier === 'S'),
        A: lista.filter(i => i.tier === 'A'),
        B: lista.filter(i => i.tier === 'B'),
        C: lista.filter(i => i.tier === 'C'),
        D: lista.filter(i => i.tier === 'D')
    };

    // En Multijugador BO7, arriba de la tier list va el bloque que explica las
    // 3 especialidades de combate y su bonus (equipar 3 perks de la misma).
    const banner = (filtro === 'multijugador' && typeof ESPECIALIDADES !== 'undefined')
        ? renderEspecialidades()
        : '';

    container.innerHTML = `
        ${banner}
        ${renderTierGroup('S', grupos.S, '#FF9500')}
        ${renderTierGroup('A', grupos.A, '#00FF87')}
        ${renderTierGroup('B', grupos.B, '#00A8FF')}
        ${renderTierGroup('C', grupos.C, '#BF5FFF')}
        ${renderTierGroup('D', grupos.D, '#7A8494')}
    `;
}

// Bloque de especialidades de combate (solo Multijugador BO7).
function renderEspecialidades() {
    const cards = ESPECIALIDADES.map(e => `
        <div style="flex:1 1 220px;min-width:200px;background:linear-gradient(135deg,rgba(15,21,27,.96),rgba(8,12,17,.98));
            border:1px solid ${e.color}44;border-left:3px solid ${e.color};border-radius:10px;padding:14px 16px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                <span style="width:10px;height:10px;border-radius:50%;background:${e.color};display:inline-block"></span>
                <span style="font-family:var(--font-mono);font-size:13px;letter-spacing:2px;color:${e.color};font-weight:800">${e.nombre}</span>
            </div>
            <div style="color:#D9E1EA;font-size:.88rem;line-height:1.5">${e.desc}</div>
        </div>`).join('');
    return `
    <div style="margin-bottom:22px">
        <div style="font-family:var(--font-mono);font-size:12px;letter-spacing:3px;color:#AEB8C4;margin-bottom:10px">
            ⬢ ESPECIALIDADES DE COMBATE — equipá 3 perks de la misma para activar su bonus
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap">${cards}</div>
    </div>`;
}
