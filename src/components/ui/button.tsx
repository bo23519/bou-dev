import React from "react";
import { cn } from "@/lib/utils";
// https://www.hover.dev/components/buttons

interface DrawOutlineButtonProps extends React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> {
  color?: string;
}

export const DrawOutlineButton = ({
  children,
  className,
  color = "#D8FA00",
  ...rest
}: DrawOutlineButtonProps) => {
  const borderStyle = { backgroundColor: color };

  return (
    <button
      {...rest}
      className={cn("draw-outline-btn group relative px-4 py-2 font-medium text-slate-100 transition-colors duration-[400ms]", className)}
    >
      <span>{children}</span>

      {/* TOP */}
      <span 
        className="absolute left-0 top-0 h-[2px] w-0 transition-all duration-100 group-hover:w-full" 
        style={borderStyle}
      />

      {/* RIGHT */}
      <span 
        className="absolute right-0 top-0 h-0 w-[2px] transition-all delay-100 duration-100 group-hover:h-full" 
        style={borderStyle}
      />

      {/* BOTTOM */}
      <span 
        className="absolute bottom-0 right-0 h-[2px] w-0 transition-all delay-200 duration-100 group-hover:w-full" 
        style={borderStyle}
      />

      {/* LEFT */}
      <span 
        className="absolute bottom-0 left-0 h-0 w-[2px] transition-all delay-300 duration-100 group-hover:h-full" 
        style={borderStyle}
      />
    </button>
  );
};