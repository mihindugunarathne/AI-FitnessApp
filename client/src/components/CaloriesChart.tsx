import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

const CaloriesChart = () => {
    const { allActivityLogs, allFoodLogs } = useAppContext();
    const { theme } = useTheme();

    const getData = () => {
        const data = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            const dailyFood = allFoodLogs.filter(log => log.createdAt?.split('T')[0] === dateString);
            const dailyActivity = allActivityLogs.filter(log => log.createdAt?.split('T')[0] === dateString);

            const intake = dailyFood.reduce((sum, item) => sum + item.calories, 0);
            const burn = dailyActivity.reduce((sum, item) => sum + (item.calories || 0), 0);

            data.push({
                name: dayName,
                Intake: intake,
                Burn: burn,
                date: dateString
            });
        }
        return data;
    };

    const data = getData();

    const isDark = theme === 'dark';
    const gridColor = isDark ? '#1e293b' : '#e2e8f0';
    const tickColor = isDark ? '#94a3b8' : '#64748b';
    const tooltipBg = isDark ? '#0f1419' : '#fff';
    const tooltipBorder = isDark ? '#1e293b' : '#e2e8f0';

    return (
        <div className="w-full h-[280px] lg:h-[300px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12, fontWeight: 500 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12 }} width={32} />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                            backgroundColor: tooltipBg,
                            borderRadius: '12px',
                            border: `1px solid ${tooltipBorder}`,
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            padding: '12px 16px',
                        }}
                        labelStyle={{ color: tickColor }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: '12px' }} />
                    <Bar dataKey="Intake" fill="#14b8a6" radius={[6, 6, 0, 0]} barSize={20} name="Intake" />
                    <Bar dataKey="Burn" fill="#0d9488" radius={[6, 6, 0, 0]} barSize={20} name="Burn" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CaloriesChart;
