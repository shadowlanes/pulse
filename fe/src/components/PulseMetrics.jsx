import React, { useEffect, useState } from "react";

const PulseMetrics = () => {
    const [metrics, setMetrics] = useState({
        last7: { steady: '?', distressed: '?', percentage: 0 },
        last30: { steady: '?', distressed: '?', percentage: 0 }
    });

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/pulse/metrics`)
            .then((res) => res.json())
            .then((data) => setMetrics(data))
            .catch((err) => console.error("Error fetching metrics:", err));
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Weekly Rhythm</h3>
                <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold">{metrics.last7.steady}</span>
                    <span className="text-muted-foreground mb-1">Steady</span>
                    <span className="text-4xl font-bold ml-4">{metrics.last7.distressed}</span>
                    <span className="text-muted-foreground mb-1">Distressed</span>
                </div>
                <p className="text-xs text-muted-foreground mt-4 italic">"Last 7 days behavior"</p>
            </div>

            <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Monthly Trend</h3>
                <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-primary">{metrics.last30.percentage}%</div>
                    <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-1000"
                            style={{ width: `${metrics.last30.percentage}%` }}
                        ></div>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 italic">"Cumulative health score for the last 30 days"</p>
            </div>
        </div>
    );
};

export default PulseMetrics;
