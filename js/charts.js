// ============================================
// CHARTS.JS — Canvas-based Charts (no library)
// ============================================

function drawStatusChart(stats) {
  const canvas = document.getElementById('status-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const data = [
    { label: 'Completed', value: stats.completed, color: '#10b981' },
    { label: 'In Progress', value: stats.inProgress, color: '#6366f1' },
    { label: 'Pending', value: stats.pending, color: '#f59e0b' },
    { label: 'Overdue', value: stats.overdue, color: '#ef4444' }
  ];

  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.font = '14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('No data yet', W/2, H/2);
    return;
  }

  const cx = W * 0.4, cy = H / 2, r = Math.min(cx, cy) - 20, innerR = r * 0.55;
  let startAngle = -Math.PI / 2;

  data.forEach(seg => {
    if (seg.value === 0) return;
    const slice = (seg.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, startAngle + slice);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    startAngle += slice;
  });

  // Donut hole
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Center text
  ctx.fillStyle = '#1e2235';
  ctx.font = 'bold 20px Inter';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(total, cx, cy - 7);
  ctx.fillStyle = '#8892b0';
  ctx.font = '10px Inter';
  ctx.fillText('Total', cx, cy + 12);

  // Legend
  let legendY = 28;
  const legendX = W * 0.70;
  data.forEach(seg => {
    ctx.beginPath();
    ctx.arc(legendX, legendY, 5, 0, Math.PI * 2);
    ctx.fillStyle = seg.color;
    ctx.fill();
    ctx.fillStyle = '#4b5680';
    ctx.font = '11px Inter';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(seg.label, legendX + 10, legendY);
    ctx.fillStyle = '#1e2235';
    ctx.font = 'bold 11px Inter';
    ctx.fillText(seg.value, legendX + 10, legendY + 14);
    legendY += 44;
  });
}

function drawPriorityChart(tasks) {
  const canvas = document.getElementById('priority-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const priorities = [
    { id: 'high', label: 'High', color: '#ef4444' },
    { id: 'medium', label: 'Medium', color: '#f59e0b' },
    { id: 'low', label: 'Low', color: '#10b981' }
  ];

  const statuses = [
    { id: 'pending', label: 'P', color: '#f59e0b' },
    { id: 'in-progress', label: 'I', color: '#6366f1' },
    { id: 'completed', label: 'C', color: '#10b981' },
    { id: 'overdue', label: 'O', color: '#ef4444' }
  ];

  const data = priorities.map(p => {
    const pTasks = tasks.filter(t => t.priority === p.id);
    const breakdown = {
      pending: pTasks.filter(t => t.status === 'pending').length,
      inProgress: pTasks.filter(t => t.status === 'in-progress').length,
      completed: pTasks.filter(t => t.status === 'completed' || t.status === 'closed').length,
      overdue: pTasks.filter(t => t.status === 'overdue').length
    };
    return {
      ...p,
      value: pTasks.length,
      breakdown
    };
  });

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barW = 60, gap = 40;
  const totalBars = data.length;
  const chartW = totalBars * barW + (totalBars - 1) * gap;
  const startX = (W - chartW) / 2;
  const topY = 30, bottomY = H - 60;
  const chartH = bottomY - topY;

  // Grid lines
  for (let i = 0; i <= 4; i++) {
    const y = topY + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(startX - 10, y);
    ctx.lineTo(startX + chartW + 10, y);
    ctx.strokeStyle = 'rgba(60,70,120,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#8892b0';
    ctx.font = '10px Inter';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(maxVal - (maxVal / 4) * i), startX - 12, y);
  }

  data.forEach((d, i) => {
    const x = startX + i * (barW + gap);
    const totalH = (d.value / maxVal) * chartH;
    let currentY = bottomY;

    if (d.value > 0) {
      // Draw stacked segments
      const segs = [
        { val: d.breakdown.completed, color: '#10b981' },
        { val: d.breakdown.inProgress, color: '#6366f1' },
        { val: d.breakdown.pending, color: '#f59e0b' },
        { val: d.breakdown.overdue, color: '#ef4444' }
      ];

      segs.forEach(s => {
        if (s.val === 0) return;
        const sH = (s.val / maxVal) * chartH;
        ctx.fillStyle = s.color;
        // Rounded corners only for the top segment? Or just simple rects for stacking.
        ctx.fillRect(x, currentY - sH, barW, sH);
        currentY -= sH;
      });

      // Total label on top
      ctx.fillStyle = '#1e2235';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(d.value, x + barW / 2, bottomY - totalH - 5);

      // Status sub-counts below bar
      ctx.font = '9px Inter';
      ctx.fillStyle = '#4b5680';
      const subText = `P:${d.breakdown.pending} I:${d.breakdown.inProgress} C:${d.breakdown.completed} O:${d.breakdown.overdue}`;
      ctx.fillText(subText, x + barW / 2, bottomY + 22);
    }

    ctx.fillStyle = '#4b5680';
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(d.label, x + barW / 2, bottomY + 10);
  });

  // Small Legend for Status Colors
  const legendX = startX;
  const legendY = H - 15;
  let offset = 0;
  [
    { l: 'Pending', c: '#f59e0b' },
    { l: 'In-Progress', c: '#6366f1' },
    { l: 'Completed', c: '#10b981' },
    { l: 'Overdue', c: '#ef4444' }
  ].forEach(item => {
    ctx.beginPath();
    ctx.arc(legendX + offset, legendY, 3, 0, Math.PI * 2);
    ctx.fillStyle = item.c;
    ctx.fill();
    ctx.fillStyle = '#8892b0';
    ctx.font = '9px Inter';
    ctx.textAlign = 'left';
    ctx.fillText(item.l, legendX + offset + 8, legendY + 1);
    offset += 65;
  });
}
