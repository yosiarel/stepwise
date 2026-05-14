export type RoadmapMaterialAI = {
  order:        number;
  phase:        string;
  title:        string;
  description:  string;
  durationDays: number;
};

export type RoadmapAIResponse = {
  materials: RoadmapMaterialAI[];
};
