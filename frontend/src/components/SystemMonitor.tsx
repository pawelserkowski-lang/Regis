import { useState, useEffect } from 'react';

const SystemMonitor = () => {
  const [stats, setStats] = useState({ cpu: 0, ram: 0, battery: 100, net: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/status');
        const data = await res.json();
        if (data.status === 'ONLINE') {setStats({ cpu: data.cpu, ram: data.ram, battery: data.battery, net: data.net_io || 0 });}
      } catch (e) {
        setStats({cpu: Math.floor(Math.random()*30)+10, ram: 50, battery: 85, net: 0});
      }
    };
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const Bar = ({ label, value }: { label: string, value: number }) => (
    <div className="mb-2">
      <div className="flex justify-between text-xs"><span>{label}</span><span>{value}%</span></div>
      <div className="cyber-progress-container">
        <div className="cyber-progress-bar" style={{ width: `${value}%` }} />
      </div>
    </div>
  );

  return (
    <div className="cyber-card p-4">
      <h3 className="text-glow mb-4">SYS_MONITOR</h3>
      <Bar label="CPU" value={stats.cpu} />
      <Bar label="RAM" value={stats.ram} />
      <Bar label="PWR" value={stats.battery} />
    </div>
  );
}
export default SystemMonitor;
