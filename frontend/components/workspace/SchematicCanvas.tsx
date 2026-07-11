import React from 'react';

interface SchematicCanvasProps {
  activeDesign: any;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
}

export function SchematicCanvas({
  activeDesign,
  selectedComponentId,
  onSelectComponent
}: SchematicCanvasProps) {
  const svgContent = activeDesign?.schematic_svg || "";

  const createMarkup = () => {
    let processedSvg = svgContent;
    // Replace dark background style
    processedSvg = processedSvg.replace(/background-color:\s*#0b0f19/g, "background-color: #ffffff");
    // Replace dark stroke in grid patterns
    processedSvg = processedSvg.replace(/stroke="#1f293d"/g, 'stroke="#e2e8f0"');
    // Replace white strokes with dark slate
    processedSvg = processedSvg.replace(/stroke="#f1f5f9"/g, 'stroke="#334155"');
    processedSvg = processedSvg.replace(/stroke="white"/g, 'stroke="#334155"');
    // Replace white/dark fills in PMOS bubbles/etc
    processedSvg = processedSvg.replace(/fill="#0b0f19"/g, 'fill="#ffffff"');
    processedSvg = processedSvg.replace(/fill="#f1f5f9"/g, 'fill="#334155"');
    processedSvg = processedSvg.replace(/fill="white"/g, 'fill="#ffffff"');
    // Replace light labels with darker readable ones
    processedSvg = processedSvg.replace(/fill="#94a3b8"/g, 'fill="#64748b"');

    if (selectedComponentId) {
      const targetRegex = new RegExp(`(id=["']${selectedComponentId}["'])`, 'i');
      processedSvg = processedSvg.replace(
        targetRegex, 
        `$1 stroke="#2563eb" stroke-width="3" filter="drop-shadow(0 2px 6px rgba(37,99,235,0.15))"`
      );
    }
    return { __html: processedSvg };
  };

  const handleSvgClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as SVGElement;
    let element: SVGElement | null = target;
    while (element && (element as any) !== e.currentTarget) {
      const elementId = element.getAttribute("id");
      if (elementId && (
        elementId.startsWith("M_") || 
        elementId.startsWith("V_") || 
        elementId.startsWith("P_")
      )) {
        onSelectComponent(elementId);
        return;
      }
      element = element.parentElement as any;
    }
    onSelectComponent(null);
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center bg-white p-4 rounded-xl border border-border relative overflow-hidden h-full">
      <span className="absolute top-3 left-3 text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">
        SKY130 Process Solver Canvas
      </span>
      {svgContent ? (
        <div 
          onClick={handleSvgClick}
          className="w-full h-full flex items-center justify-center cursor-pointer select-none [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-[55vh]"
          dangerouslySetInnerHTML={createMarkup()}
        />
      ) : (
        <div className="text-slate-400 text-xs font-sans">
          No schematic compiled. Generate or compile design logic first.
        </div>
      )}
    </div>
  );
}
