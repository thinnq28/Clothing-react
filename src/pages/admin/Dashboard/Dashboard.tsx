import React, { useEffect, useState } from 'react';
import feather from 'feather-icons';
import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useFetchWithAuth from '../../../fetch/FetchAdmin';

// Đăng ký các components
Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend
);

interface variantItem {
    skuId: string;
    variantName: string;
    quantity: number;
    price: number;

}

interface OrderItem {
    quantity: number;
    price: number;
    variant: variantItem;
}

interface OrderDetailResponse {
    labels: [],
    data: []
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [order, setOrder] = useState<OrderDetailResponse>();
    const fetchWithAuth = useFetchWithAuth();
    const [filter, setFilter] = useState<string>('this_week');

    const getOrders = async () => {
        try {
            await fetchWithAuth('/client/order/filter', {
                params: {
                    filter: filter
                }
            }).then(result => {
                const data = result.data;
                console.log(data);
                setOrder(data);
            })

        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error fetching orders');
        }
    };

    useEffect(() => {
        getOrders();
    }, [filter]);

    useEffect(() => {
        if (!order) return;
    
        feather.replace();
    
        const ctx = document.getElementById('myChart') as HTMLCanvasElement;
        if (ctx) {
            // Xoá biểu đồ cũ nếu có
            if (Chart.getChart(ctx)) {
                Chart.getChart(ctx)?.destroy();
            }
    
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: order.labels,
                    datasets: [{
                        label: 'Doanh thu',
                        data: order.data,
                        borderColor: 'rgba(75,192,192,1)',
                        backgroundColor: 'rgba(75,192,192,0.2)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        tooltip: {
                            enabled: true
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Ngày'
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Tổng tiền (VNĐ)'
                            }
                        }
                    }
                }
            });
        }
    }, [order]);
    

    return (
        <>
            <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 className="h2">Dashboard</h1>
                    <div className="btn-toolbar mb-2 mb-md-0">
                        <div className="btn-group me-2">
                            <button type="button" className="btn btn-sm btn-outline-secondary">Share</button>
                            <button type="button" className="btn btn-sm btn-outline-secondary">Export</button>
                        </div>

                        <div className="btn-toolbar mb-2 mb-md-0">
                            <select
                                className="form-select form-select-sm"
                                style={{ width: '200px' }}
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="this_week">This Week</option>
                                <option value="this_month">This Month</option>
                                <option value="this_year">This Year</option>
                            </select>
                        </div>
                    </div>
                </div>
            </main>

            <canvas id="myChart" width={900} height={380}></canvas>
        </>
    );
};

export default Dashboard;
