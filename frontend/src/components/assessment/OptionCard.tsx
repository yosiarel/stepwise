import { CheckCircle2 } from 'lucide-react';

interface OptionCardProps {
  label: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

const OptionCard = ({ label, description, isSelected, onSelect }: OptionCardProps) => {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-5 rounded-[12px] border-2 transition-all duration-200 flex flex-row items-start gap-4 group ${
        isSelected 
        ? 'border-[#3B82F6] bg-[#EFF6FF] shadow-md z-10'
        : 'border-transparent bg-white shadow-sm hover:border-[#D1D5DB] hover:shadow-md z-0'
      }`}
    >
      <div className={`mt-1 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
        isSelected ? 'border-[#3B82F6] bg-[#3B82F6]' : 'border-[#D1D5DB]'
      }`}>
        {isSelected && <CheckCircle2 size={14} className="text-white" />}
      </div>
      
      <div className="space-y-1">
        <h4 className={`font-bold text-[16px] transition-colors ${
          isSelected ? 'text-[#1E3A5F]' : 'text-[#1F2937]'
        }`}>
          {label}
        </h4>
        <p className="text-[13px] md:text-[14px] text-[#6B7280] leading-relaxed">
          {description}
        </p>
      </div>
    </button>
  );
};

export default OptionCard;