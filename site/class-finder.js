// ════════════════════════════════════════════
//   CLASS FINDER — Asistente de clases WZ Meta
//   v2.0 — Con ventajas (perks) recomendadas
// ════════════════════════════════════════════

(function() {
    'use strict';

    // ═══ MAPEO DE VENTAJAS RECOMENDADAS POR COMBO ═══
    const PERKS_POR_COMBO = {
        'agresivo': {
            perk1: 'Drill Instructor',
            perk2: 'Sprinter',
            perk3: 'Adaptive',
            justificacion: 'Máxima movilidad para rushes constantes y rotaciones rápidas.'
        },
        'sniper': {
            perk1: 'Mountaineer',
            perk2: 'Reactive Armor',
            perk3: 'Ghost',
            justificacion: 'Posicionamiento elevado, defensa sostenida e invisibilidad a UAVs.'
        },
        'meta_absoluto': {
            perk1: 'Drill Instructor',
            perk2: 'Sprinter',
            perk3: 'Ghost',
            justificacion: 'Combo balanceado: movilidad + stealth para cualquier situación.'
        },
        'resurgence': {
            perk1: 'Field Medic',
            perk2: 'Momentum',
            perk3: 'Survivor',
            justificacion: 'Reanima rápido, mantén presión, sobrevive más al caer.'
        },
        'black_ops_royale': {
            perk1: 'Surveyor',
            perk2: 'Berserker',
            perk3: 'Hunter',
            justificacion: 'Información del equipo + presión ofensiva con loot del suelo.'
        },
        'clasificatorio': {
            perk1: 'Surveyor',
            perk2: 'Reactive Armor',
            perk3: 'Ghost',
            justificacion: 'Awareness, defensa y stealth — meta ranked tryhard.'
        }
    };

    // ═══ MAPEO DE LETAL + TÁCTICO RECOMENDADOS POR COMBO ═══
    const LETAL_TACTICO_POR_COMBO = {
        'agresivo': {
            letal: 'Sticky Grenade',
            tactico: 'Stim Shot',
            justificacion: 'La adhesiva remata peleas cerradas; el estimulante te mantiene vivo para seguir presionando.'
        },
        'sniper': {
            letal: 'Molotov',
            tactico: 'Pinpoint Grenade',
            justificacion: 'El molotov corta rotaciones hacia tu posición; la granada de localización revela blancos a distancia.'
        },
        'meta_absoluto': {
            letal: 'C4',
            tactico: 'Smoke Grenade',
            justificacion: 'C4 castiga a distancia segura; el humo te cubre para reposicionarte en cualquier situación.'
        },
        'resurgence': {
            letal: 'Frag Grenade',
            tactico: 'Stim Shot',
            justificacion: 'La frag limpia espacios cerrados del respawn rápido; el estimulante sostiene la presión constante.'
        },
        'black_ops_royale': {
            letal: 'Cluster Grenade',
            tactico: 'Smoke Grenade',
            justificacion: 'Ambos se consiguen fácil en el loot del suelo y dan control de zona inmediato.'
        },
        'clasificatorio': {
            letal: 'C4',
            tactico: 'Flashbang',
            justificacion: 'C4 para daño consistente y seguro; el flash abre pushes en peleas de ranked.'
        }
    };

    const SCORING = {
        'agresivo': {
            estilo: { agresivo: 30, balanceado: 15, defensivo: 5, sniper: 0 },
            rango:  { corto: 25, medio: 20, largo: 5 },
            modo:   { battle_royale: 15, resurgence: 20, clasificatorio: 10, black_ops_royale: 10 },
            nivel:  { casual: 20, medio: 18, alto: 12 },
            prioridad: { kills: 20, win: 10, versatil: 15, ranked: 8 }
        },
        'sniper': {
            estilo: { agresivo: 5, balanceado: 10, defensivo: 20, sniper: 30 },
            rango:  { corto: 5, medio: 15, largo: 25 },
            modo:   { battle_royale: 18, resurgence: 5, clasificatorio: 20, black_ops_royale: 8 },
            nivel:  { casual: 8, medio: 15, alto: 22 },
            prioridad: { kills: 18, win: 15, versatil: 8, ranked: 18 }
        },
        'meta_absoluto': {
            estilo: { agresivo: 18, balanceado: 25, defensivo: 18, sniper: 12 },
            rango:  { corto: 18, medio: 22, largo: 18 },
            modo:   { battle_royale: 22, resurgence: 18, clasificatorio: 22, black_ops_royale: 12 },
            nivel:  { casual: 18, medio: 22, alto: 18 },
            prioridad: { kills: 18, win: 22, versatil: 25, ranked: 18 }
        },
        'resurgence': {
            estilo: { agresivo: 22, balanceado: 18, defensivo: 8, sniper: 5 },
            rango:  { corto: 18, medio: 22, largo: 8 },
            modo:   { battle_royale: 8, resurgence: 30, clasificatorio: 5, black_ops_royale: 10 },
            nivel:  { casual: 20, medio: 18, alto: 15 },
            prioridad: { kills: 22, win: 12, versatil: 15, ranked: 10 }
        },
        'black_ops_royale': {
            estilo: { agresivo: 15, balanceado: 18, defensivo: 12, sniper: 8 },
            rango:  { corto: 12, medio: 18, largo: 12 },
            modo:   { battle_royale: 5, resurgence: 5, clasificatorio: 0, black_ops_royale: 30 },
            nivel:  { casual: 18, medio: 15, alto: 10 },
            prioridad: { kills: 15, win: 18, versatil: 18, ranked: 8 }
        },
        'clasificatorio': {
            estilo: { agresivo: 12, balanceado: 22, defensivo: 18, sniper: 15 },
            rango:  { corto: 10, medio: 22, largo: 18 },
            modo:   { battle_royale: 12, resurgence: 5, clasificatorio: 30, black_ops_royale: 5 },
            nivel:  { casual: 5, medio: 18, alto: 25 },
            prioridad: { kills: 12, win: 18, versatil: 15, ranked: 30 }
        }
    };

    let respuestas = {};
    let pasoActual = 1;

    const MENSAJES_IA = [
        'Analizando tu estilo de juego',
        'Comparando con el meta actual',
        'Calculando tu clase ideal'
    ];

    function animarContador(el, destino, duracion) {
        const inicio = performance.now();
        function tick(ahora) {
            const t = Math.min(1, (ahora - inicio) / duracion);
            const ease = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(ease * destino);
            if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    function mostrarThinking() {
        document.querySelectorAll('.cf-step').forEach(s => s.style.display = 'none');
        document.getElementById('cf-counter').style.display = 'none';
        document.getElementById('cf-progress').style.width = '100%';

        const thinking = document.getElementById('cf-thinking');
        const msgEl = document.getElementById('cf-thinking-msg');
        const fill = thinking.querySelector('.cf-thinking-fill');

        thinking.style.display = 'block';
        fill.style.transition = 'none';
        fill.style.width = '0%';
        msgEl.textContent = MENSAJES_IA[0];

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                fill.style.transition = 'width 1.5s cubic-bezier(0.4,0,0.2,1)';
                fill.style.width = '100%';
            });
        });

        let i = 0;
        const interval = setInterval(() => {
            i++;
            if (i < MENSAJES_IA.length) msgEl.textContent = MENSAJES_IA[i];
        }, 520);

        setTimeout(() => {
            clearInterval(interval);
            thinking.style.display = 'none';
            mostrarResultado();
        }, 1650);
    }

    function buscarPerk(nombreEn) {
        if (typeof VENTAJAS === 'undefined') return null;
        return VENTAJAS.find(v => v.nombre_en === nombreEn);
    }

    function buscarLetal(nombreEn) {
        if (typeof LETALES === 'undefined') return null;
        return LETALES.find(l => l.nombre_en === nombreEn);
    }

    function buscarTactico(nombreEn) {
        if (typeof TACTICOS === 'undefined') return null;
        return TACTICOS.find(t => t.nombre_en === nombreEn);
    }

    function calcularMatches() {
        const resultados = [];

        for (const [id, scoring] of Object.entries(SCORING)) {
            const total =
                (scoring.estilo[respuestas.estilo] || 0) +
                (scoring.rango[respuestas.rango] || 0) +
                (scoring.modo[respuestas.modo] || 0) +
                (scoring.nivel[respuestas.nivel] || 0) +
                (scoring.prioridad[respuestas.prioridad] || 0);

            const combo = (typeof CLASES !== 'undefined') ? CLASES.find(c => c.id === id) : null;
            if (combo) {
                resultados.push({ combo, score: total, id });
            }
        }

        resultados.sort((a, b) => b.score - a.score);
        return resultados;
    }

    function mostrarPaso(num) {
        document.querySelectorAll('.cf-step').forEach(s => {
            s.style.display = (s.dataset.step == num) ? 'block' : 'none';
        });
        document.getElementById('cf-cur').textContent = num;
        document.getElementById('cf-progress').style.width = (num * 20) + '%';
    }

    function mostrarResultado() {
        const matches = calcularMatches();
        const top = matches[0];
        const alternativas = matches.slice(1, 3);

        const maxScore = 150;
        const matchPct = Math.min(100, Math.round((top.score / maxScore) * 100));

        const c = top.combo;

        const perkMap = PERKS_POR_COMBO[top.id];
        const perk1 = perkMap ? buscarPerk(perkMap.perk1) : null;
        const perk2 = perkMap ? buscarPerk(perkMap.perk2) : null;
        const perk3 = perkMap ? buscarPerk(perkMap.perk3) : null;

        const ltMap = LETAL_TACTICO_POR_COMBO[top.id];
        const letal = ltMap ? buscarLetal(ltMap.letal) : null;
        const tactico = ltMap ? buscarTactico(ltMap.tactico) : null;

        const renderPerkMini = (perk, slotLabel) => {
            if (!perk) {
                return `<div class="cf-perk-mini cf-perk-empty">
                    <div class="cf-perk-info">
                        <div class="cf-perk-slot">${slotLabel}</div>
                        <div class="cf-perk-name">—</div>
                    </div>
                </div>`;
            }
            const tierColor = perk.tier === 'S' ? '#FF9500' : perk.tier === 'A' ? '#00FF87' : perk.tier === 'B' ? '#00A8FF' : '#BF5FFF';
            return `
            <div class="cf-perk-mini" style="border-left-color:${tierColor}">
                <div class="cf-perk-icon">
                    <img src="${perk.icon}" alt="${perk.nombre}" onerror="this.parentElement.innerHTML='·';this.parentElement.style.fontSize='20px';this.parentElement.style.display='flex';this.parentElement.style.alignItems='center';this.parentElement.style.justifyContent='center'">
                </div>
                <div class="cf-perk-info">
                    <div class="cf-perk-slot">${slotLabel}</div>
                    <div class="cf-perk-name">${perk.nombre}</div>
                    <div class="cf-perk-tier" style="color:${tierColor}">TIER ${perk.tier} · ${perk.uso}</div>
                </div>
            </div>`;
        };

        document.getElementById('cf-resultado').innerHTML = `
            <div style="text-align:center;margin-bottom:24px">
                <div class="cf-result-label">▸ ANÁLISIS COMPLETO</div>
                <div class="cf-result-title">TU CLASE RECOMENDADA</div>
            </div>

            <div class="cf-combo-card">
                <div class="cf-combo-header">
                    <div>
                        <div class="cf-combo-estilo">${c.estilo}</div>
                        <div class="cf-combo-nombre">${c.nombre}</div>
                    </div>
                    <div style="text-align:right">
                        <div class="cf-match-num"><span id="cf-match-count">0</span><span class="cf-match-pct">%</span></div>
                        <div class="cf-match-lbl">MATCH</div>
                    </div>
                </div>

                <div class="cf-section-label">▸ LOADOUT COMPLETO · ACCESORIOS RECOMENDADOS POR LA IA</div>
                <div class="combo-weapons">
                    ${typeof renderArmaPanel === 'function' ? renderArmaPanel(c.primaria, c.primaria.color) : ''}
                    <div class="combo-vs">VS</div>
                    ${typeof renderArmaPanel === 'function' ? renderArmaPanel(c.secundaria, c.secundaria.color) : ''}
                </div>

                <div class="cf-section-label">▸ VENTAJAS RECOMENDADAS</div>
                <div class="cf-perks-grid">
                    ${renderPerkMini(perk1, 'PERK 1')}
                    ${renderPerkMini(perk2, 'PERK 2')}
                    ${renderPerkMini(perk3, 'PERK 3')}
                </div>
                ${perkMap ? `<div class="cf-perks-just">${perkMap.justificacion}</div>` : ''}

                <div class="cf-section-label">▸ LETAL Y TÁCTICO RECOMENDADOS</div>
                <div class="cf-perks-grid" style="grid-template-columns:repeat(2,1fr)">
                    ${renderPerkMini(letal, 'LETAL')}
                    ${renderPerkMini(tactico, 'TÁCTICO')}
                </div>
                ${ltMap ? `<div class="cf-perks-just">${ltMap.justificacion}</div>` : ''}

                <div class="cf-desc">${c.descripcion}</div>

                <div class="cf-stats-grid">
                    <div><div class="cf-stat-lbl">MOVILIDAD</div><div class="cf-stat-val">${c.stats.movilidad}</div></div>
                    <div><div class="cf-stat-lbl">DAÑO</div><div class="cf-stat-val">${c.stats.daño}</div></div>
                    <div><div class="cf-stat-lbl">RANGO</div><div class="cf-stat-val">${c.stats.rango}</div></div>
                    <div><div class="cf-stat-lbl">FACILIDAD</div><div class="cf-stat-val">${c.stats.facilidad}</div></div>
                </div>
            </div>

            ${alternativas.length > 0 ? `
            <div class="cf-alt-label">ALTERNATIVAS COMPATIBLES</div>
            <div class="cf-alt-grid">
                ${alternativas.map(alt => {
                    const altPct = Math.min(100, Math.round((alt.score / maxScore) * 100));
                    return `
                    <div class="cf-alt-card">
                        <div class="cf-alt-nombre">${alt.combo.nombre}</div>
                        <div class="cf-alt-match">${altPct}% match · ${alt.combo.primaria.nombre} + ${alt.combo.secundaria.nombre}</div>
                    </div>`;
                }).join('')}
            </div>
            ` : ''}

            <button id="cf-reiniciar" class="cf-btn-reiniciar">VOLVER A INTENTAR</button>
        `;

        document.querySelectorAll('.cf-step').forEach(s => s.style.display = 'none');
        document.getElementById('cf-counter').style.display = 'none';
        document.getElementById('cf-progress').style.width = '100%';
        document.getElementById('cf-resultado').style.display = 'block';

        const countEl = document.getElementById('cf-match-count');
        if (countEl) animarContador(countEl, matchPct, 900);

        document.getElementById('cf-reiniciar').addEventListener('click', reiniciar);
    }

    function reiniciar() {
        pasoActual = 1;
        respuestas = {};
        document.querySelectorAll('.cf-opt').forEach(o => o.classList.remove('selected'));
        document.getElementById('cf-resultado').style.display = 'none';
        document.getElementById('cf-thinking').style.display = 'none';
        document.getElementById('cf-counter').style.display = 'flex';
        mostrarPaso(1);
    }

    function onOptionClick(opt) {
        const q = opt.dataset.q;
        const v = opt.dataset.v;
        respuestas[q] = v;

        opt.parentElement.querySelectorAll('.cf-opt').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');

        setTimeout(() => {
            pasoActual++;
            if (pasoActual <= 5) {
                mostrarPaso(pasoActual);
            } else {
                mostrarThinking();
            }
        }, 280);
    }

    function toggleClassFinder() {
        const panel = document.getElementById('cf-panel');
        const toggle = document.getElementById('cf-toggle');
        const arrow = document.getElementById('cf-arrow');

        if (panel.classList.contains('open')) {
            panel.classList.remove('open');
            toggle.classList.remove('active');
            arrow.textContent = '▼';
        } else {
            panel.classList.add('open');
            toggle.classList.add('active');
            arrow.textContent = '▲';
            if (pasoActual === 1 && Object.keys(respuestas).length === 0) {
                mostrarPaso(1);
            }
        }
    }

    function init() {
        const toggle = document.getElementById('cf-toggle');
        if (!toggle) return;

        toggle.addEventListener('click', toggleClassFinder);

        document.querySelectorAll('.cf-opt').forEach(opt => {
            opt.addEventListener('click', () => onOptionClick(opt));
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
