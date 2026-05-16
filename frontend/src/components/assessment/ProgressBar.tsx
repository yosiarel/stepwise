interface ProgressBarProps {
  phase: string;
  percentage: number;
}

const ProgressBar = ({ phase, percentage }: ProgressBarProps) => {
  return (
    <div className="w-full max-w-[800px] mx-auto mb-12">
      <div className="flex justify-between items-end mb-2">
        <span className="text-[12px] font-bold text-[#6B7280] tracking-widest uppercase">
          {phase}
        </span>
        <span className="text-[12px] font-bold text-[#1E3A5F]">
          {percentage}%
        </span>
      </div>
      <div className="h-2 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#10B981] transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;