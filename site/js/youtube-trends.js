(function () {
  'use strict';

  var section = document.getElementById('ytWeaponTrends');
  var grid = document.getElementById('ytWeaponTrendsGrid');
  var updated = document.getElementById('ytWeaponTrendsUpdated');
  var notice = document.getElementById('ytWeaponTrendsNotice');
  if (!section || !grid) return;

  var colors = ['#ffd025', '#ff7a1a', '#4fb8ff'];
  var currentRows = [];

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function validSlug(value) {
    return typeof value === 'string' && /^[a-z0-9-]+$/.test(value);
  }

  function validImage(value) {
    return typeof value === 'string' &&
      /^\/(?:weapons|img|uploads)\/[A-Za-z0-9_ .%()\/-]+$/.test(value) &&
      !/(?:^|\/)\.\.(?:\/|$)/.test(value);
  }

  function int(value, max) {
    var number = Number(value);
    return Number.isFinite(number) ? Math.max(0, Math.min(max, Math.round(number))) : 0;
  }

  function validDays(value) {
    if (!Array.isArray(value) || value.length < 7 || value.length > 28) return null;
    var seen = Object.create(null);
    var days = [];
    for (var i = 0; i < value.length; i += 1) {
      var item = value[i];
      if (!item || typeof item.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(item.date) || seen[item.date]) return null;
      var parsed = new Date(item.date + 'T00:00:00Z');
      if (!Number.isFinite(parsed.getTime())) return null;
      seen[item.date] = true;
      days.push({ date: item.date, count: int(item.count, 1000) });
    }
    days.sort(function (a, b) { return a.date.localeCompare(b.date); });
    return days;
  }

  function dayLabel(date) {
    try {
      return new Intl.DateTimeFormat('es-419', { day: 'numeric', month: 'short', timeZone: 'UTC' })
        .format(new Date(date + 'T00:00:00Z')).replace('.', '');
    } catch (_) {
      return date.slice(5);
    }
  }

  function weekLabel(firstDate, lastDate) {
    var first = dayLabel(firstDate);
    var last = dayLabel(lastDate);
    var firstParts = first.split(' ');
    var lastParts = last.split(' ');
    return firstParts[1] && firstParts[1] === lastParts[1]
      ? firstParts[0] + '–' + last
      : first + '–' + last;
  }

  function generatedLabel(value) {
    var date = new Date(value);
    if (!Number.isFinite(date.getTime())) return '';
    try {
      return new Intl.DateTimeFormat('es-419', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
      }).format(date);
    } catch (_) {
      return '';
    }
  }

  function pointsFor(row) {
    var days = row._days.slice(-28);
    var points = [];
    for (var offset = 0; offset < 28; offset += 7) {
      var week = days.slice(offset, offset + 7);
      if (!week.length) continue;
      points.push({
        label: weekLabel(week[0].date, week[week.length - 1].date),
        count: week.reduce(function (sum, day) { return sum + day.count; }, 0),
        date: week[0].date
      });
    }
    return points;
  }

  function formatPercent(value) {
    var safe = Math.max(0, Math.min(100, Number(value) || 0));
    if (safe > 0 && safe < 0.1) return '<0,1%';
    var digits = safe > 0 && safe < 10 ? 1 : 0;
    return safe.toFixed(digits).replace('.', ',') + '%';
  }

  function topSeries(rows) {
    var items = rows.map(function (row) {
      var points = pointsFor(row);
      return {
        row: row,
        points: points,
        total: points.reduce(function (sum, point) { return sum + point.count; }, 0)
      };
    });
    var totals = items[0].points.map(function (_, index) {
      return items.reduce(function (sum, item) { return sum + item.points[index].count; }, 0);
    });
    var grandTotal = totals.reduce(function (sum, value) { return sum + value; }, 0);
    items.forEach(function (item) {
      item.share = grandTotal ? item.total / grandTotal * 100 : 0;
      item.points = item.points.map(function (point, index) {
        return {
          label: point.label,
          date: point.date,
          value: totals[index] ? point.count / totals[index] * 100 : 0
        };
      });
    });
    items.sort(function (a, b) {
      return b.total - a.total || a.row.rank - b.row.rank;
    });
    var active = items.filter(function (item) { return item.total > 0; });
    return (active.length ? active : items).slice(0, 3);
  }

  function legend(series) {
    return '<div class="ytw-legend">' + series.map(function (item, index) {
      return '<a class="ytw-legend-item" href="/armas/' + encodeURIComponent(item.row.slug) + '" ' +
        'style="--ytw-color:' + colors[index] + '">' +
        '<img src="' + esc(item.row.image) + '" alt="" loading="lazy" decoding="async" ' +
        'onerror="this.style.display=\'none\'"><div><strong>' + esc(item.row.name) + '</strong>' +
        '<span>' + formatPercent(item.share) + ' en 4 semanas</span></div></a>';
    }).join('') + '</div>';
  }

  function insight(series) {
    var leader = series[0];
    return '<div class="ytw-insight"><span class="ytw-insight-label">Lectura rápida</span>' +
      '<div class="ytw-insight-copy"><strong>' + esc(leader.row.name) + ' lidera la señal</strong>' +
      '<span>Es el arma con mayor presencia en contenido reciente</span></div>' +
      '<div class="ytw-insight-value">' + formatPercent(leader.share) + '<small>de la señal · 4 semanas</small></div></div>';
  }

  function chart(series) {
    var width = 1000;
    var height = 280;
    var left = 52;
    var right = 22;
    var top = 24;
    var bottom = 42;
    var plotWidth = width - left - right;
    var plotHeight = height - top - bottom;
    var count = series[0].points.length;
    var labels = series[0].points.map(function (point) { return point.label; });
    var maximum = 100;
    var tickCount = 4;
    var svg = '<div class="ytw-chart-wrap"><svg class="ytw-chart-svg" viewBox="0 0 ' + width + ' ' + height + '" ' +
      'role="img" aria-labelledby="ytwChartTitle ytwChartDesc">' +
      '<title id="ytwChartTitle">Porcentaje de tendencia semanal de armas de Warzone durante cuatro semanas</title>' +
      '<desc id="ytwChartDesc">Participación porcentual dentro del contenido reciente detectado.</desc>';

    svg += '<text class="axis" x="' + left + '" y="13">TENDENCIA (%)</text>';
    for (var tick = 0; tick <= tickCount; tick += 1) {
      var tickValue = maximum - maximum * tick / tickCount;
      var y = top + plotHeight * tick / tickCount;
      svg += '<line class="grid" x1="' + left + '" y1="' + y + '" x2="' + (width - right) + '" y2="' + y + '"></line>' +
        '<text class="axis" x="' + (left - 10) + '" y="' + (y + 4) + '" text-anchor="end">' + Math.round(tickValue) + '%</text>';
    }

    labels.forEach(function (label, index) {
      var x = left + (count === 1 ? plotWidth / 2 : plotWidth * index / (count - 1));
      svg += '<text class="axis" x="' + x + '" y="' + (height - 15) + '" text-anchor="middle">' + esc(label) + '</text>';
    });

    series.forEach(function (item, seriesIndex) {
      var coordinates = item.points.map(function (point, index) {
        return {
          x: left + (count === 1 ? plotWidth / 2 : plotWidth * index / (count - 1)),
          y: top + plotHeight - point.value / maximum * plotHeight,
          point: point
        };
      });
      svg += '<polyline class="line" stroke="' + colors[seriesIndex] + '" points="' +
        coordinates.map(function (point) { return point.x + ',' + point.y; }).join(' ') + '"></polyline>';
      coordinates.forEach(function (coordinate) {
        svg += '<circle class="point" cx="' + coordinate.x + '" cy="' + coordinate.y + '" r="5" fill="' + colors[seriesIndex] + '">' +
          '<title>' + esc(item.row.name) + ': ' + formatPercent(coordinate.point.value) + ' · ' + esc(coordinate.point.label) + '</title></circle>';
        if (coordinate.point.value > 0) {
          var offset = seriesIndex === 1 ? 17 : (seriesIndex === 2 ? -18 : -9);
          var labelY = coordinate.y < top + 18
            ? coordinate.y + 20
            : Math.max(12, Math.min(height - bottom - 4, coordinate.y + offset));
          svg += '<text class="value" x="' + coordinate.x + '" y="' + labelY + '">' + formatPercent(coordinate.point.value) + '</text>';
        }
      });
    });
    return svg + '</svg></div>';
  }

  function topTen(rows) {
    var currentStart = 21;
    var previousStart = 14;
    var currentTotal = rows.reduce(function (total, row) {
      return total + row._days.slice(currentStart, 28).reduce(function (sum, day) { return sum + day.count; }, 0);
    }, 0);
    var previousTotal = rows.reduce(function (total, row) {
      return total + row._days.slice(previousStart, currentStart).reduce(function (sum, day) { return sum + day.count; }, 0);
    }, 0);
    var allTotal = rows.reduce(function (total, row) {
      return total + row._days.reduce(function (sum, day) { return sum + day.count; }, 0);
    }, 0);
    var ranked = rows.map(function (row) {
      var current = row._days.slice(currentStart, 28).reduce(function (sum, day) { return sum + day.count; }, 0);
      var previous = row._days.slice(previousStart, currentStart).reduce(function (sum, day) { return sum + day.count; }, 0);
      var all = row._days.reduce(function (sum, day) { return sum + day.count; }, 0);
      return {
        row: row,
        share: allTotal ? all / allTotal * 100 : 0,
        currentShare: currentTotal ? current / currentTotal * 100 : null,
        previousShare: previousTotal ? previous / previousTotal * 100 : null,
        all: all
      };
    }).filter(function (item) {
      return item.all > 0 && item.share > 0;
    }).sort(function (a, b) {
      return b.share - a.share || b.all - a.all || a.row.rank - b.row.rank;
    }).slice(0, 10);
    var strongest = ranked.length ? ranked[0].share : 0;

    return '<div class="ytw-top10"><div class="ytw-top10-head"><strong>TOP ' + ranked.length + ' · 4 SEMANAS</strong>' +
      '<span>participación en contenido detectado · últimos 28 días</span></div><div class="ytw-top10-grid">' +
      ranked.map(function (item, index) {
        var delta = item.currentShare == null || item.previousShare == null ? null : item.currentShare - item.previousShare;
        var deltaClass = delta == null || Math.abs(delta) < 0.05 ? 'stable' : (delta > 0 ? 'up' : 'down');
        var deltaText = delta == null ? 'NUEVA' :
          (Math.abs(delta) < 0.05 ? '—' : (delta > 0 ? '▲ +' : '▼ -') + formatPercent(Math.abs(delta)).replace('%', ' pp'));
        var strength = strongest ? item.share / strongest * 100 : 0;
        return '<a class="ytw-top10-row" style="--ytw-strength:' + strength.toFixed(2) + '" href="/armas/' + encodeURIComponent(item.row.slug) + '" ' +
          'aria-label="' + esc((index + 1) + '. ' + item.row.name + ', ' + formatPercent(item.share) + ' de la señal en 4 semanas') + '">' +
          '<b>' + (index + 1) + '</b><img src="' + esc(item.row.image) + '" alt="" loading="lazy" ' +
          'onerror="this.style.display=\'none\'"><strong>' + esc(item.row.name) + '</strong>' +
          '<span class="ytw-share">' + formatPercent(item.share) + '</span>' +
          '<span class="ytw-delta ' + deltaClass + '">' + deltaText + '</span></a>';
      }).join('') + '</div></div>';
  }

  function renderTrends() {
    var series = topSeries(currentRows);
    if (!series.length) return;
    grid.innerHTML = legend(series) + insight(series) + chart(series) + topTen(currentRows);
  }

  function render(data) {
    if (!data || data.schemaVersion !== 1 || !Array.isArray(data.ranking)) return;
    var generated = new Date(data.generatedAt);
    var freshHours = Math.min(336, Math.max(1, Number(data.freshForHours) || 36));
    var age = Date.now() - generated.getTime();
    if (!Number.isFinite(generated.getTime()) || age < -600000 || age > freshHours * 3600000) return;

    currentRows = data.ranking.map(function (row) {
      var days = row && validDays(row.dailyVideos);
      if (!row || !validSlug(row.slug) || typeof row.name !== 'string' || !validImage(row.image) || !days) return null;
      return {
        slug: row.slug,
        name: String(row.name).slice(0, 60),
        image: row.image,
        rank: int(row.rank, 1000) || 999,
        _days: days
      };
    }).filter(Boolean);
    if (currentRows.length < 3) return;

    if (updated) updated.textContent = generatedLabel(data.generatedAt);
    if (notice) notice.textContent = String(data.notice || 'Videos publicados; no representa uso dentro del juego.').slice(0, 160);
    renderTrends();
    section.hidden = false;
  }

  fetch('/youtube-trends.json?_=' + Date.now(), { cache: 'no-store', credentials: 'omit' })
    .then(function (response) {
      if (!response.ok) throw new Error('radar unavailable');
      return response.json();
    })
    .then(render)
    .catch(function () { section.hidden = true; });
})();
