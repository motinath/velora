import React from 'react';

interface SimulationScopeProps {
  activeDesign: any;
  probedSignals: string[];
  onToggleProbe: (sig: string) => void;
}

export function SimulationScope({
  activeDesign,
  probedSignals,
  onToggleProbe
}: SimulationScopeProps) {
  const simulationResults = activeDesign?.simulation_results_json;
  const waveforms = simulationResults?.waveforms;
  const metrics = simulationResults?.metrics || {};

  const generateSvgPath = (points: number[], width: number, height: number, vMin: number, vMax: number) => {
    if (!points || points.length === 0) return "";
    const padding = 10;
    const xStep = (width - padding * 2) / (points.length - 1);
    const vRange = vMax - vMin || 1.0;

    return points
      .map((val, idx) => {
        const x = padding + idx * xStep;
        const normalizedY = (val - vMin) / vRange;
        const y = height - padding - normalizedY * (height - padding * 2);
        return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  };

  return (
    <div className="grid grid-cols-4 gap-4 h-full">
      <div className="col-span-3 border border-border bg-card p-4 rounded-xl flex flex-col justify-between overflow-hidden relative shadow-sm">
        <div className="flex justify-between items-center border-b border-border pb-2 mb-2">
          <span className="text-[9px] uppercase font-bold text-slate-500 font-sans tracking-wide">
            Transient wave analysis oscilloscope (0.0 ns - 10.0 ns)
          </span>
          <span className="text-[9px] bg-blue-50 text-primary font-bold px-2 py-0.5 rounded border border-blue-100 font-mono">
            V(WL) sweep solver active
          </span>
        </div>

        <div className="flex-1 relative w-full h-[32vh]">
          {waveforms ? (
            <svg className="w-full h-full" viewBox="0 0 600 240" preserveAspectRatio="none">
              {[40, 80, 120, 160, 200].map(yVal => (
                <line key={yVal} x1="10" y1={yVal} x2="590" y2={yVal} stroke="#e2e8f0" strokeDasharray="3,3" />
              ))}
              {[100, 200, 300, 400, 500].map(xVal => (
                <line key={xVal} x1={xVal} y1="10" x2={xVal} y2="230" stroke="#e2e8f0" strokeDasharray="3,3" />
              ))}

              {Object.keys(waveforms).filter(k => k !== "x").map((sig, wIdx) => {
                const colors = ["#dc2626", "#059669", "#7c3aed", "#d97706", "#2563eb"];
                const strokeColor = colors[wIdx % colors.length];
                const isChecked = probedSignals.includes(sig);

                if (!isChecked) return null;
                const pathData = generateSvgPath(waveforms[sig], 600, 240, 0.0, 1.8);

                return (
                  <path
                    key={sig}
                    d={pathData}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-sans">
              No simulation results found.
            </div>
          )}
        </div>
      </div>

      <div className="col-span-1 border border-border bg-card p-4 rounded-xl flex flex-col justify-between overflow-y-auto shadow-sm">
        <div className="space-y-4">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 mb-2 block border-b border-border pb-1">
              Active probes
            </span>
            <div className="space-y-1">
              {waveforms ? (
                Object.keys(waveforms).filter(k => k !== "x").map((sig, wIdx) => {
                  const colors = ["#dc2626", "#059669", "#7c3aed", "#d97706", "#2563eb"];
                  const strokeColor = colors[wIdx % colors.length];
                  const isChecked = probedSignals.includes(sig);

                  return (
                    <div
                      key={sig}
                      onClick={() => onToggleProbe(sig)}
                      className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer text-[10px]"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => { }}
                        className="rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      <span style={{ color: isChecked ? strokeColor : "#64748b" }} className="font-bold">
                        {sig.replace("y_", "")}
                      </span>
                    </div>
                  );
                })
              ) : (
                <span className="text-slate-400 text-[10px]">No waveforms to probe.</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 mb-2 block border-b border-border pb-1 font-sans">
              Performance metrics
            </span>
            <div className="space-y-1.5">
              {Object.entries(metrics).map(([mName, mValue]: [string, any]) => (
                <div key={mName} className="p-2 bg-slate-50 rounded border border-border flex justify-between items-center text-[9px]">
                  <span className="text-slate-500 uppercase leading-tight font-sans font-bold">{mName}</span>
                  <span className="font-bold text-primary font-mono text-right">{mValue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
