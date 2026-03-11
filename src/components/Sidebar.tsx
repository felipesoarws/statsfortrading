"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '80px' : '256px');
  }, [isCollapsed]);

  const links = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Singularidades", href: "/singularidades", icon: Sparkles },
  ];

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} h-screen bg-secondary/60 border-r border-border/10 flex flex-col fixed left-0 top-0 transition-all duration-300 z-50`}>
      <div className={`p-6 border-b border-border/10 flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} relative group`}>
          <div className="w-10 h-10 bg-primary flex items-center justify-center font-black text-xl text-white rounded-sm shadow-sm border border-white/5 shrink-0">
            FS
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-2 duration-300">
              <h1 className="text-lg font-black tracking-tight text-foreground uppercase truncate">Analyzer</h1>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-60 truncate">Stats Pro</p>
            </div>
          )}
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-primary rounded-full border border-white/10 flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all z-50"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
      </div>
      
      <div className={`flex-1 ${isCollapsed ? 'py-6 px-3' : 'py-6 px-4'} flex flex-col gap-2`}>
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              title={isCollapsed ? link.name : ""}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-md text-sm font-semibold transition-all ${
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
              {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">{link.name}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
