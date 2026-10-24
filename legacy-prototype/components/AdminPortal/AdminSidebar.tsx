'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Calendar, 
  Users, 
  Tag, 
  Layers, 
  Send, 
  FileText, 
  Settings, 
  ArrowLeft, 
  X,
  ExternalLink,
  Sliders,
  DollarSign,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { useBooking } from '@/context/BookingContext';

export type AdminFeatureTab = 
  | 'overview' 
  | 'bookings' 
  | 'cleaners' 
  | 'pricing' 
  | 'addons' 
  | 'emails' 
  | 'logs' 
  | 'settings';

interface AdminSidebarProps {
  currentTab: AdminFeatureTab;
  onSelectTab: (tab: AdminFeatureTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile
}) => {
  const { allBookings, sentEmails, adminLogs, services, addons, setActiveView } = useBooking();

  const navigationGroups = [
    {
      groupLabel: 'OPERATIONS',
      items: [
        {
          id: 'overview' as AdminFeatureTab,
          label: 'Overview & KPIs',
          icon: Activity,
          badge: undefined
        },
        {
          id: 'bookings' as AdminFeatureTab,
          label: 'Bookings & Dispatch',
          icon: Calendar,
          badge: allBookings.length > 0 ? `${allBookings.length}` : undefined,
          badgeColor: 'bg-emerald-100 text-emerald-800'
        },
        {
          id: 'cleaners' as AdminFeatureTab,
          label: 'Cleaners & Pros',
          icon: Users,
          badge: '3 Active',
          badgeColor: 'bg-cyan-100 text-cyan-800'
        }
      ]
    },
    {
      groupLabel: 'SERVICES & PRICING',
      items: [
        {
          id: 'pricing' as AdminFeatureTab,
          label: 'Service Plans & Rates',
          icon: Layers,
          badge: `${services.length}`,
          badgeColor: 'bg-slate-100 text-slate-700'
        },
        {
          id: 'addons' as AdminFeatureTab,
          label: 'Addons & Extras',
          icon: Tag,
          badge: `${addons.length}`,
          badgeColor: 'bg-slate-100 text-slate-700'
        }
      ]
    },
    {
      groupLabel: 'MONITORING & LOGS',
      items: [
        {
          id: 'emails' as AdminFeatureTab,
          label: 'Outbound Emails',
          icon: Send,
          badge: sentEmails.length > 0 ? `${sentEmails.length}` : undefined,
          badgeColor: 'bg-sky-100 text-sky-800'
        },
        {
          id: 'logs' as AdminFeatureTab,
          label: 'System Audit Logs',
          icon: FileText,
          badge: `${adminLogs.length}`,
          badgeColor: 'bg-slate-100 text-slate-700'
        }
      ]
    },
    {
      groupLabel: 'PLATFORM',
      items: [
        {
          id: 'settings' as AdminFeatureTab,
          label: 'Platform Settings',
          icon: Settings,
          badge: undefined
        }
      ]
    }
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white text-slate-800">
      {/* Top Branding Header */}
      <div>
        <div className="p-5 border-b border-slate-200/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-base tracking-tight">PureSpace</span>
                <span className="text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200">
                  Admin
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Enterprise v2.4</span>
              </div>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Group Items */}
        <nav className="p-3.5 space-y-4 overflow-y-auto max-h-[calc(100vh-210px)] no-scrollbar">
          {navigationGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase px-3 py-1 block">
                {group.groupLabel}
              </span>

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = currentTab === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectTab(item.id);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all text-left ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-950 font-semibold shadow-2xs border-l-4 border-emerald-600'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                          item.badgeColor || 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer: Profile & Website Shortcut */}
      <div className="p-3.5 border-t border-slate-200/90 space-y-2 bg-slate-50/60">
        {/* Superadmin Card */}
        <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-white flex items-center justify-center font-semibold text-xs">
                AM
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-900 block truncate leading-tight">Alex Morgan</span>
              <span className="text-[10px] text-slate-500 font-normal block truncate">alex@purespace.app</span>
            </div>
          </div>
          <span className="text-[9px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
            SUPER
          </span>
        </div>

        {/* Back to Website Button */}
        <button
          type="button"
          onClick={() => setActiveView('landing')}
          className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Public Website</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 border-r border-slate-200/90 h-screen sticky top-0 bg-white shrink-0 z-30 shadow-xs">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fadeIn" 
          />
          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] h-full bg-white shadow-2xl z-10 animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
