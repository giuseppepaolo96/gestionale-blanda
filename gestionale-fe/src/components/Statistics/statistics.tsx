import Navbar from 'views/Navbar/navbar';
import './statistics.scss';
import '../StileScss generico/generico.scss';
import { useEffect, useState } from 'react';
import { Bar, Doughnut, Line, PolarArea, Radar } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Filler,
    Tooltip,
    Legend,
    Title,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Filler,
    Tooltip,
    Legend,
    Title
);


export default function Statistics() {
    const defaultBarData = {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
            {
                label: 'Sales',
                data: [540, 325, 702, 620],
                backgroundColor: [
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                ],
                borderColor: [
                    'rgb(255, 159, 64)',
                    'rgb(75, 192, 192)',
                    'rgb(54, 162, 235)',
                    'rgb(153, 102, 255)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const defaultBarOptions = {
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    const defaultDoughnutData = {
        labels: ['Red', 'Green', 'Blue'],
        datasets: [
            {
                data: [300, 50, 100],
                backgroundColor: ['red', 'green', 'blue'],
            },
        ],
    };

    const defaultDoughnutOptions = {
        cutout: '60%',
    };

    const defaultLineData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
            {
                label: 'Dataset 1',
                data: [65, 59, 80, 81, 56, 55, 40],
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.4,
            },
            {
                label: 'Dataset 2',
                data: [28, 48, 40, 19, 96, 27, 100],
                fill: false,
                borderColor: 'rgb(153, 102, 255)',
                tension: 0.4,
            },
        ],
    };

    const defaultLineOptions = {
        maintainAspectRatio: false,
        aspectRatio: 1,
    };

    const defaultPolarData = {
        datasets: [
            {
                data: [11, 16, 7, 3, 14],
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 206, 86)',
                    'rgb(75, 192, 192)',
                    'rgb(153, 102, 255)',
                ],
                label: 'My dataset',
            },
        ],
        labels: ['Red', 'Green', 'Yellow', 'Blue', 'Purple'],
    };

    const defaultPolarOptions: ChartOptions<'polarArea'> = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
            },
        },
    };

    const defaultRadarData = {
        labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
        datasets: [
            {
                label: 'My First dataset',
                borderColor: 'rgb(75, 192, 192)',
                pointBackgroundColor: 'rgb(75, 192, 192)',
                pointBorderColor: 'rgb(75, 192, 192)',
                pointHoverBackgroundColor: 'rgba(75, 192, 192, 0.6)',
                pointHoverBorderColor: 'rgb(75, 192, 192)',
                data: [65, 59, 90, 81, 56, 55, 40],
            },
            {
                label: 'My Second dataset',
                borderColor: 'rgb(153, 102, 255)',
                pointBackgroundColor: 'rgb(153, 102, 255)',
                pointBorderColor: 'rgb(153, 102, 255)',
                pointHoverBackgroundColor: 'rgba(153, 102, 255, 0.6)',
                pointHoverBorderColor: 'rgb(153, 102, 255)',
                data: [28, 48, 40, 19, 96, 27, 100],
            },
        ],
    };

    const defaultRadarOptions: ChartOptions<'radar'> = {
        responsive: true,
        scales: {
            r: {
                type: 'radialLinear', // <-- questo va bene ora
                angleLines: {
                    display: true,
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    /* beginAtZero: true, */
                    display: true,
                    maxTicksLimit: 5,
                    stepSize: 20,
                },
            },
        },
    };

    const [barData, setBarData] = useState(defaultBarData);
    const [barOptions, setBarOptions] = useState(defaultBarOptions);

    const [doughnutData, setDoughnutData] = useState(defaultDoughnutData);
    const [doughnutOptions, setDoughnutOptions] = useState(defaultDoughnutOptions);

    const [lineData, setLineData] = useState(defaultLineData);
    const [lineOptions, setLineOptions] = useState(defaultLineOptions);

    const [polarData, setPolarData] = useState(defaultPolarData);
    const [polarOptions, setPolarOptions] = useState<ChartOptions<'polarArea'>>(defaultPolarOptions);

    const [radarData, setRadarData] = useState(defaultRadarData);
    const [radarOptions, setRadarOptions] = useState<ChartOptions<'radar'>>(defaultRadarOptions);

    useEffect(() => {
        // Simulazione fetch
    }, []);

    return (
        <div className="background-container">
            <Navbar />

            <div className="card">
                <Bar data={barData} options={barOptions} />
            </div>

            <div className="card">
                <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>

            <div className="card">
                <Line data={lineData} options={lineOptions} />
            </div>

            <div className="card">
                <PolarArea data={polarData} options={polarOptions} />
            </div>

            <div className="card">
                <Radar data={radarData} options={radarOptions} />
            </div>
        </div>
    );
}
