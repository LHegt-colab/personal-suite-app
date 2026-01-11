import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

function BloodPressureChart({ measurements }) {
  if (!measurements || measurements.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        Nog geen metingen om weer te geven
      </div>
    )
  }

  // Sort by date
  const sortedData = [...measurements].sort((a, b) =>
    new Date(a.measurement_date) - new Date(b.measurement_date)
  )

  const labels = sortedData.map(m =>
    new Date(m.measurement_date).toLocaleDateString('nl-NL', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  )

  const data = {
    labels,
    datasets: [
      {
        label: 'Bovendruk (Systolisch)',
        data: sortedData.map(m => m.systolic),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3
      },
      {
        label: 'Onderdruk (Diastolisch)',
        data: sortedData.map(m => m.diastolic),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3
      },
      {
        label: 'Hartslag',
        data: sortedData.map(m => m.heart_rate),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.3,
        yAxisID: 'y1'
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Bloeddruk Verloop',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            label += context.parsed.y
            if (context.dataset.yAxisID === 'y1') {
              label += ' bpm'
            } else {
              label += ' mmHg'
            }
            return label
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Bloeddruk (mmHg)'
        },
        min: 40,
        max: 200
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Hartslag (bpm)'
        },
        min: 40,
        max: 140,
        grid: {
          drawOnChartArea: false
        }
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div style={{ height: '400px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  )
}

export default BloodPressureChart
