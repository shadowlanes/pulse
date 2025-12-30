import React, { useEffect, useState } from "react";

const PulseCalendar = () => {
    const [pulses, setPulses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch last 90 days for the grid
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 90);

        fetch(`${import.meta.env.VITE_API_URL}/api/pulse/history?start=${start.toISOString()}&end=${end.toISOString()}`)
            .then((res) => res.json())
            .then((data) => {
                setPulses(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching pulse history:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="bg-card border border-border p-8 rounded-xl shadow-sm h-64 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin"></div>
                <div className="text-muted-foreground text-sm font-medium tracking-wide">Connecting to Pulse...</div>
            </div>
        </div>
    );

    // Helper to get color based on status
    const getStatusColor = (status) => {
        if (status === "Good") return "bg-green-500 hover:bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]";
        if (status === "Bad") return "bg-red-500 hover:bg-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]";
        return "bg-neutral-800"; // No data
    };

    // Generate a mapping of date strings to statuses
    const pulseMap = pulses.reduce((acc, p) => {
        const dateStr = new Date(p.date).toISOString().split("T")[0];
        acc[dateStr] = p.status;
        return acc;
    }, {});

    // Generate last 90 days of dates
    const dates = [];
    for (let i = 89; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split("T")[0]);
    }

    return (
        <div className="bg-card border border-border p-8 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold tracking-tight">The Pulse Calendar</h2>
                <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                        <span className="text-muted-foreground">Steady</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                        <span className="text-muted-foreground">Arrythmia</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-3">
                {dates.map((dateStr) => {
                    const status = pulseMap[dateStr];
                    const url = `${import.meta.env.VITE_API_URL}/pulse/${dateStr}.html`;

                    return (
                        <a
                            key={dateStr}
                            href={status ? url : "#"}
                            target={status ? "_blank" : "_self"}
                            rel="noreferrer"
                            className={`
                aspect-square rounded-md transition-all duration-300 transform hover:scale-110 cursor-pointer
                ${getStatusColor(status)}
                relative group
              `}
                            title={dateStr}
                        >
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 border border-border text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 transition-opacity pointer-events-none">
                                {dateStr}: {status || "No Data"}
                            </div>
                        </a>
                    );
                })}
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground italic">
                "Visualizing the heartbeat of humanity, day by day."
            </p>
        </div>
    );
};

export default PulseCalendar;
