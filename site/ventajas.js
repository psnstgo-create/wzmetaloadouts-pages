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

const TIER_COLORS_V = { S: '#FF9500', A: '#00FF87', B: '#00A8FF', C: '#BF5FFF' };

function renderItemVentaja(item) {
    const color = TIER_COLORS_V[item.tier];
    return `
    <div class="ventaja-card" style="border-left:3px solid ${color}">
        <div class="ventaja-icono-img">
            <img src="${item.icon}" alt="${item.nombre}" onerror="this.style.display='none'">
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
        C: lista.filter(i => i.tier === 'C')
    };

    container.innerHTML = `
        ${renderTierGroup('S', grupos.S, '#FF9500')}
        ${renderTierGroup('A', grupos.A, '#00FF87')}
        ${renderTierGroup('B', grupos.B, '#00A8FF')}
        ${renderTierGroup('C', grupos.C, '#BF5FFF')}
    `;
}
