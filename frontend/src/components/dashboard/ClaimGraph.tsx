import React, { useEffect, useRef } from 'react';

// Using a lightweight canvas approach for Enterprise data density 
// rather than heavy DOM-based d3 wrappers.

interface Node {
    id: string;
    label: string;
    type: 'patent' | 'claim' | 'component';
}

interface Edge {
    source: string;
    target: string;
    label: string;
}

interface ClaimGraphProps {
    nodes?: Node[];
    edges?: Edge[];
    height?: string;
}

export const ClaimGraph: React.FC<ClaimGraphProps> = ({
    nodes = [],
    edges = [],
    height = '400px'
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Mock rendering for UI prototyping. 
    // In Prod, integrate a robust library like Vis.js or D3 Force Directed Graph here.
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Handle high DPI displays
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const w = rect.width;
        const h = rect.height;

        // Clear
        ctx.clearRect(0, 0, w, h);

        // Draw Mock Network
        ctx.strokeStyle = '#1F2937'; // dark border
        ctx.lineWidth = 2;

        // Draw edges
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 4);
        ctx.lineTo(w / 3, h / 2);
        ctx.moveTo(w / 2, h / 4);
        ctx.lineTo(w / 1.5, h / 2);
        ctx.moveTo(w / 3, h / 2);
        ctx.lineTo(w / 4, h / 1.2);
        ctx.moveTo(w / 3, h / 2);
        ctx.lineTo(w / 2.5, h / 1.2);
        ctx.stroke();

        // Draw Mock Nodes
        const drawNode = (x: number, y: number, r: number, color: string, label: string) => {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#0B0F19';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = '#9ca3af';
            ctx.font = '12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(label, x, y + r + 15);
        };

        drawNode(w / 2, h / 4, 25, '#0ea5e9', 'Patent US-89A'); // Top Patent
        drawNode(w / 3, h / 2, 20, '#6366f1', 'Claim 1');
        drawNode(w / 1.5, h / 2, 20, '#6366f1', 'Claim 2');
        drawNode(w / 4, h / 1.2, 15, '#10b981', 'Processor');
        drawNode(w / 2.5, h / 1.2, 15, '#10b981', 'Memory');

    }, [nodes, edges]);

    return (
        <div className="w-full relative glass-card p-4 flex flex-col" style={{ height }}>
            <div className="flex justify-between items-center mb-2 z-10">
                <h3 className="text-lg font-semibold text-gray-100">Claim Dependency Network</h3>
                <span className="text-xs font-mono text-brand-400 bg-brand-500/10 px-2 py-1 rounded">GraphEngine Live</span>
            </div>

            <div className="flex-1 w-full relative overflow-hidden rounded-lg bg-dark-bg/50">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full absolute inset-0 cursor-crosshair"
                />
            </div>

            <div className="flex items-center space-x-4 mt-4 text-xs text-gray-400">
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-brand-500 mr-2"></div>Patent Level</div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>Claim Level</div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>Component</div>
            </div>
        </div>
    );
};
