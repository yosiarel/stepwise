import { Trash2 } from 'lucide-react';

interface SkillItemProps {
  skill: { id: number; name: string; level: string };
  onUpdate: (id: number, field: string, value: string) => void;
  onRemove: (id: number) => void;
}

const SkillItem = ({ skill, onUpdate, onRemove }: SkillItemProps) => (
  <div className="flex flex-col md:flex-row items-center gap-4 bg-[#F9FAFB] p-4 rounded-[8px] border border-[#E5E7EB] animate-fade-in transition-all">
    <input 
      type="text" 
      placeholder="Nama Skill (Contoh: React.js)"
      className="flex-grow w-full h-[40px] bg-white border border-[#D1D5DB] rounded-[6px] px-3 text-[14px] focus:border-[#3B82F6] outline-none"
      value={skill.name}
      onChange={(e) => onUpdate(skill.id, 'name', e.target.value)}
    />
    <select 
      className="w-full md:w-[180px] h-[40px] bg-white border border-[#D1D5DB] rounded-[6px] px-3 text-[14px] outline-none cursor-pointer"
      value={skill.level}
      onChange={(e) => onUpdate(skill.id, 'level', e.target.value)}
    >
      <option value="Beginner">Beginner</option>
      <option value="Intermediate">Intermediate</option>
      <option value="Advanced">Advanced</option>
      <option value="Expert">Expert</option>
    </select>
    <button 
      onClick={() => onRemove(skill.id)}
      className="p-2 text-gray-400 hover:text-red-500 transition-colors shrink-0"
    >
      <Trash2 size={18} />
    </button>
  </div>
);

export default SkillItem;