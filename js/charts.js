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

  const data = [
    { label: 'High',   value: tasks.filter(t => t.priority === 'high').length,   color: '#ef4444' },
    { label: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#f59e0b' },
    { label: 'Low',    value: tasks.filter(t => t.priority === 'low').length,    color: '#10b981' }
  ];

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barW = 56, gap = 30;
  const totalBars = data.length;
  const chartW = totalBars * barW + (totalBars - 1) * gap;
  const startX = (W - chartW) / 2;
  const topY = 30, bottomY = H - 50;
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
    const barH = (d.value / maxVal) * chartH;
    const barY = bottomY - barH;

    const grad = ctx.createLinearGradient(0, barY, 0, bottomY);
    grad.addColorStop(0, d.color);
    grad.addColorStop(1, d.color + '55');

    const radius = 5;
    ctx.beginPath();
    ctx.moveTo(x + radius, barY);
    ctx.lineTo(x + barW - radius, barY);
    ctx.quadraticCurveTo(x + barW, barY, x + barW, barY + radius);
    ctx.lineTo(x + barW, bottomY);
    ctx.lineTo(x, bottomY);
    ctx.lineTo(x, barY + radius);
    ctx.quadraticCurveTo(x, barY, x + radius, barY);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.fillStyle = '#1e2235';
    ctx.font = 'bold 12px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    if (d.value > 0) ctx.fillText(d.value, x + barW / 2, barY - 3);

    ctx.fillStyle = '#4b5680';
    ctx.font = '11px Inter';
    ctx.textBaseline = 'top';
    ctx.fillText(d.label, x + barW / 2, bottomY + 7);
  });
}
