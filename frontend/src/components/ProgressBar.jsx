import { Globe, Database, Zap, Layers, Loader2 } from 'lucide-react';

const STAGES = ['searching', 'scraping', 'summarizing', 'synthesizing'];

const STAGE_CONFIG = {
  searching: { label: 'Web Intelligence', icon: Globe },
  scraping: { label: 'Data Extraction', icon: Database },
  summarizing: { label: 'Source Analysis', icon: Zap },
  synthesizing: { label: 'Final Synthesis', icon: Layers },
};

const ProgressBar = ({ currentStage, message }) => {
  const currentIndex = STAGES.indexOf(currentStage || 'searching');

  return (
    <div className="w-full flex flex-col gap-6 p-2">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-2 justify-between w-full">
        {STAGES.map((stage, i) => {
          const { label, icon: Icon } = STAGE_CONFIG[stage];
          const isDone = i < currentIndex;
          const isActive = i === currentIndex;
          const isPending = i > currentIndex;

          return (
            <div 
              key={stage} 
              className={`flex items-center gap-3 sm:flex-col sm:items-center sm:text-center flex-1 transition-all duration-500 ${
                isDone ? 'text-primary' : isActive ? 'text-white' : 'text-muted-foreground/30'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                isDone ? 'bg-primary/20 text-primary' : isActive ? 'bg-primary text-background shadow-[0_0_15px_rgba(11,147,246,0.5)]' : 'bg-white/5'
              }`}>
                {isActive ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
              </div>
              <div className="text-xs uppercase tracking-widest font-semibold font-space">
                {label}
              </div>
            </div>
          );
        })}
      </div>
      
      {message && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-white/5 py-2 px-4 rounded-md mx-auto max-w-md w-full border border-white/5 animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
          {message}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
