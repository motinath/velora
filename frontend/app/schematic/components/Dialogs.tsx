import React from "react";
import { Sliders, Link2 } from "lucide-react";

interface WirePromptDialogProps {
  isOpen: boolean;
  netName: string;
  onChangeNetName: (val: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  wireStart: { comp: string; pin: string } | null;
  selectedComponentId: string | null;
}

export function WirePromptDialog({
  isOpen,
  netName,
  onChangeNetName,
  onClose,
  onConfirm,
  wireStart,
  selectedComponentId,
}: WirePromptDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-sans">
        <h3 className="text-sm font-bold text-slate-900 font-sans mb-3 flex items-center gap-1.5">
          <Link2 className="w-4 h-4 text-blue-500" />
          <span>Connect Terminal Pins</span>
        </h3>
        
        <div className="space-y-3.5 mb-4">
          <label className="text-[10px] font-bold text-slate-450 uppercase block tracking-wider">Specify Net Name</label>
          <input
            type="text"
            value={netName}
            onChange={(e) => onChangeNetName(e.target.value)}
            placeholder="e.g. VDD, Q, net_1"
            className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-850 px-3.5 py-2.5 rounded-xl outline-none font-sans font-bold focus:border-blue-500 focus:bg-white transition"
          />
          <p className="text-[10.5px] text-slate-400 font-bold leading-normal">
            Connecting {wireStart?.comp} Pin {wireStart?.pin} to {selectedComponentId} pin.
          </p>
        </div>

        <div className="flex justify-end gap-2.5">
          <button 
            onClick={onClose}
            className="px-4 py-2 border rounded-xl hover:bg-slate-50 transition text-xs font-bold text-slate-500"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm transition text-xs font-bold"
          >
            Establish Wire ➔
          </button>
        </div>
      </div>
    </div>
  );
}

interface SizingDialogProps {
  isOpen: boolean;
  suggestion: string;
  onClose: () => void;
  onApply: () => void;
}

export function SizingDialog({
  isOpen,
  suggestion,
  onClose,
  onApply,
}: SizingDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-sans">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Sliders className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 font-sans">Sizing Optimization Advice</h3>
        </div>
        
        <div className="space-y-3 mb-4 text-xs font-semibold leading-relaxed text-slate-700">
          <p className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl leading-normal text-slate-600">
            {suggestion}
          </p>
        </div>

        <div className="flex justify-end gap-2.5">
          <button 
            onClick={onClose}
            className="px-4 py-2 border rounded-xl hover:bg-slate-50 transition text-xs font-bold text-slate-500"
          >
            Cancel
          </button>
          <button 
            onClick={onApply}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm transition text-xs font-bold"
          >
            Apply Optimization ➔
          </button>
        </div>
      </div>
    </div>
  );
}
