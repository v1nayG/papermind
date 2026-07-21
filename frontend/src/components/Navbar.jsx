import { PanelLeftOpen } from 'lucide-react';

const Navbar = ({ sidebarOpen, onToggleSidebar }) => {
  return (
    <nav className="h-14 bg-background/50 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 sm:px-6 flex-shrink-0 relative z-40">
      <div className="flex items-center">
        {!sidebarOpen && (
          <button 
            className="p-2 -ml-2 rounded-md hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer mr-4" 
            onClick={onToggleSidebar} 
            aria-label="Open sidebar"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
