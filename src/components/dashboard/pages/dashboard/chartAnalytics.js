'use client';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    AreaChart,
    Area,
    ResponsiveContainer,
    BarChart, 
    Bar,
    ComposedChart,
    Radar, 
    RadarChart, 
    PolarGrid, 
    PolarAngleAxis, 
    PolarRadiusAxis
} from 'recharts';

const chatData = [
    { month: 'Jan', value: 5 },
    { month: 'Feb', value: 5 },
    { month: 'Mar', value: 3.5 },
    { month: 'Apr', value: 4.2 },
    { month: 'May', value: 5.5 },
    { month: 'Jun', value: 5.5 },
    { month: 'Jul', value: 6.3 },
    { month: 'Aug', value: 6 },
    { month: 'Sep', value: 5 },
    { month: 'Oct', value: 5.5 },
    { month: 'Nov', value: 5.8 },
    { month: 'Dec', value: 5 },
];

const visitorData = [
    { time: '0.10s', value: 4 },
    { time: '0.30s', value: 5 },
    { time: '0.50s', value: 3.5 },
    { time: '1.00s', value: 4.5 },
    { time: '1.30m', value: 1.5 },
    { time: '5.00m', value: 5 },
    { time: '10.00m', value: 6 },
    { time: '30.00m', value: 4 },
    { time: '01.00hr', value: 7 },
    { time: '01.10hr', value: 5.5 },
    { time: '01.20hr', value: 5.6 },
    { time: '01.30hr', value: 5.8 },
];

export default function ChartAnalytics() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-[12px] p-4 sm:p-7">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-[16px] font-semibold mb-1">Add Money</h2>
                        <p className="text-xs">Analyze transaction data effortlessly</p>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={270}>
                    <BarChart data={chatData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 7]} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3f48cc" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-[12px] p-7">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-[16px] font-semibold mb-1">Withdraw Money</h2>
                        <p className="text-xs">Track transaction analysis seamlessly</p>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={270}>
                    <LineChart data={visitorData}>
                        <XAxis dataKey="time" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 7]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <Tooltip />
                        <Line
                            type="stepAfter"
                            dataKey="value"
                            stroke="#3f48cc"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}