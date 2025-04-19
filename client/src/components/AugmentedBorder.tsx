import { ReactNode } from "react";

interface AugmentedBorderProps {
  children: ReactNode;
}

export default function AugmentedBorder({ children }: AugmentedBorderProps) {
  return (
    <div 
      className="max-w-2xl w-full"
      data-augmented-ui="tl-clip tr-clip br-clip bl-clip border"
      style={{ 
        "--aug-border-all": "1px", 
        "--aug-border-bg": "linear-gradient(90deg, #FF2E9D 0%, #0CEAFF 100%)", 
        padding: "1px" 
      } as React.CSSProperties}
    >
      <div 
        data-augmented-ui="tl-clip tr-clip br-clip bl-clip border"
      >
        {children}
      </div>
    </div>
  );
}
