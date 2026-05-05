const STAGES = ['searching', 'reading', 'summarizing', 'synthesizing'];

const STAGE_LABELS = {
  searching: '🔍 Searching',
  reading: '📖 Reading',
  summarizing: '✂️ Summarizing',
  synthesizing: '✍️ Synthesizing',
};

const ProgressBar = ({ currentStage, message }) => {
  const currentIndex = STAGES.indexOf(currentStage);

  return (
    <div className="progress-container">
      <div className="progress-stages">
        {STAGES.map((stage, i) => {
          let className = 'stage';
          if (i < currentIndex) className += ' done';
          else if (i === currentIndex) className += ' active';
          return (
            <div key={stage} className={className}>
              {STAGE_LABELS[stage]}
            </div>
          );
        })}
      </div>
      {message && <p className="progress-message">{message}</p>}
    </div>
  );
};

export default ProgressBar;
