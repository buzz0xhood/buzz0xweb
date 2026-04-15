/* ========================================
   Analytics JavaScript - Charts & Stats
   ======================================== */

// Chart instances
let messageVolumeChart = null;
let topicsDistributionChart = null;

// Chart.js defaults for dark theme
const chartDefaults = {
    color: '#a1a1aa',
    borderColor: '#27272a',
    backgroundColor: 'rgba(139, 92, 246, 0.1)'
};

// Initialize Message Volume Chart
function initMessageVolumeChart() {
    const ctx = document.getElementById('messageVolumeChart');
    if (!ctx) return;
    
    const data = {
        labels: ['Apr 13', 'Apr 14', 'Apr 15'],
        datasets: [{
            label: 'Messages',
            data: [89, 102, 56],
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#8b5cf6',
            pointBorderColor: '#8b5cf6',
            pointHoverRadius: 6
        }]
    };
    
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1a1a24',
                    titleColor: '#ffffff',
                    bodyColor: '#a1a1aa',
                    borderColor: '#27272a',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12
                }
            },
            scales: {
                x: {
                    grid: {
                        color: '#27272a',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#71717a'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#27272a',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#71717a'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    };
    
    messageVolumeChart = new Chart(ctx, config);
}

// Initialize Topics Distribution Chart
function initTopicsDistributionChart() {
    const ctx = document.getElementById('topicsDistributionChart');
    if (!ctx) return;
    
    const data = {
        labels: [
            'Solana Trading Bot',
            'Airdrop Farming',
            'LST Yield',
            'Polymarket',
            'Business Ideas',
            'Sub-Agents'
        ],
        datasets: [{
            data: [30, 18, 14, 12, 10, 16],
            backgroundColor: [
                '#8b5cf6',
                '#22c55e',
                '#f59e0b',
                '#ec4899',
                '#06b6d4',
                '#f97316'
            ],
            borderColor: '#12121a',
            borderWidth: 2,
            hoverOffset: 10
        }]
    };
    
    const config = {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#a1a1aa',
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: '#1a1a24',
                    titleColor: '#ffffff',
                    bodyColor: '#a1a1aa',
                    borderColor: '#27272a',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((context.raw / total) * 100);
                            return context.label + ': ' + context.raw + ' messages (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    };
    
    topicsDistributionChart = new Chart(ctx, config);
}

// Generate Activity Heatmap
function generateActivityHeatmap() {
    const container = document.getElementById('activityHeatmap');
    if (!container) return;
    
    // Sample data for April 13-15
    const activityData = [
        { day: 13, hourData: [0, 0, 0, 0, 0, 0, 0, 0, 2, 5, 8, 12, 15, 10, 8, 12, 10, 6, 4, 2, 0, 0, 0, 0] },
        { day: 14, hourData: [0, 0, 0, 0, 0, 0, 0, 0, 3, 6, 10, 14, 12, 8, 10, 14, 12, 8, 5, 3, 0, 0, 0, 0] },
        { day: 15, hourData: [0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 8, 10, 8, 6, 8, 10, 8, 4, 2, 1, 0, 0, 0, 0] }
    ];
    
    const maxValue = Math.max(...activityData.map(d => Math.max(...d.hourData)));
    
    // Generate hour labels
    let html = '<div style="display: flex; gap: 4px; margin-bottom: 8px; margin-left: 40px;">';
    for (let h = 0; h < 24; h++) {
        html += `<span style="width: 20px; text-align: center; font-size: 10px; color: var(--text-muted);">${h}</span>`;
    }
    html += '</div>';
    
    // Generate rows
    activityData.forEach(dayData => {
        html += `<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">`;
        html += `<span style="width: 30px; font-size: 12px; color: var(--text-muted);">Apr ${dayData.day}</span>`;
        html += `<div style="display: flex; gap: 3px;">`;
        
        dayData.hourData.forEach(value => {
            const intensity = value / maxValue;
            let color = 'var(--text-muted)';
            if (intensity > 0) color = intensity > 0.7 ? 'var(--gains)' : intensity > 0.3 ? 'var(--accent-primary)' : 'var(--text-muted)';
            html += `<div style="width: 18px; height: 18px; background: ${color}; border-radius: 3px;" title="${value} messages at ${dayData.hourData.indexOf(value)}:00"></div>`;
        });
        
        html += '</div></div>';
    });
    
    container.innerHTML = html;
}

// Export chart data
function exportChartData(format = 'json') {
    const data = {
        messageVolume: {
            labels: ['Apr 13', 'Apr 14', 'Apr 15'],
            data: [89, 102, 56]
        },
        topicsDistribution: {
            labels: ['Solana Trading Bot', 'Airdrop Farming', 'LST Yield', 'Polymarket', 'Business Ideas', 'Sub-Agents'],
            data: [30, 18, 14, 12, 10, 16]
        },
        summary: {
            totalMessages: 247,
            activeDays: 3,
            avgMessagesPerDay: 82,
            topicsCovered: 6,
            decisionsMade: 14,
            tasksCompleted: 7,
            inProgress: 6,
            pending: 8
        }
    };
    
    if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        downloadBlob(blob, 'analytics-export.json');
    } else if (format === 'csv') {
        const csv = convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        downloadBlob(blob, 'analytics-export.csv');
    }
}

function convertToCSV(data) {
    let csv = 'Category,Value\n';
    
    Object.entries(data.summary).forEach(([key, value]) => {
        csv += `${key.replace(/([A-Z])/g, ' $1').trim()},${value}\n`;
    });
    
    return csv;
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Destroy charts (for cleanup)
function destroyCharts() {
    if (messageVolumeChart) {
        messageVolumeChart.destroy();
        messageVolumeChart = null;
    }
    if (topicsDistributionChart) {
        topicsDistributionChart.destroy();
        topicsDistributionChart = null;
    }
}