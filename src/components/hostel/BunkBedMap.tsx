'use client';

import { useState } from 'react';
import {
  Bed,
  Check,
  Info,
  Lock,
  Moon,
  Shield,
  Sun,
  Wifi,
  Wind,
  Zap,
} from 'lucide-react';
import type { HostelBed, HostelRoom } from '@/lib/types';
import { formatMoney } from '@/lib/config';

interface BunkBedMapProps {
  room: HostelRoom;
  beds: HostelBed[];
  selectedBedId: string | null;
  onSelectBed: (bed: HostelBed) => void;
  nights: number;
}

/** Formats bed numbers like "P1-Upper" into compact stylish codes like "P1-U" */
function formatBedBadge(bedNumber: string): string {
  return bedNumber
    .replace(/-Upper$/i, '-U')
    .replace(/-Lower$/i, '-L')
    .replace(/-top$/i, '-U')
    .replace(/-bottom$/i, '-L');
}

export function BunkBedMap({ room, beds, selectedBedId, onSelectBed, nights }: BunkBedMapProps) {
  const [tierFilter, setTierFilter] = useState<'all' | 'bottom' | 'top'>('all');
  const [hoveredBed, setHoveredBed] = useState<HostelBed | null>(null);

  // Group beds by bunkGroup (e.g. Bunk 1, Bunk 2, etc.)
  const bunkGroups = Array.from(new Set(beds.map((b) => b.bunkGroup)));

  // Selected bed object
  const activeBed = beds.find((b) => b.id === selectedBedId) || null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Control bar: Tier Filter & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-line shadow-card">
        {/* Tier filter */}
        <div className="flex items-center gap-1 bg-soft p-1 rounded-xl overflow-x-auto scrollbar-none w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setTierFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              tierFilter === 'all' ? 'bg-white shadow-sm text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            All Bunks ({beds.length})
          </button>
          <button
            type="button"
            onClick={() => setTierFilter('bottom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              tierFilter === 'bottom' ? 'bg-white shadow-sm text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            Lower Bunks ({beds.filter((b) => b.tier === 'bottom').length})
          </button>
          <button
            type="button"
            onClick={() => setTierFilter('top')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              tierFilter === 'top' ? 'bg-white shadow-sm text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            Upper Bunks ({beds.filter((b) => b.tier === 'top').length})
          </button>
        </div>

        {/* Airline Legend */}
        <div className="flex items-center flex-wrap gap-3 sm:gap-4 text-xs font-medium pt-1 sm:pt-0 border-t sm:border-t-0 border-line">
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded bg-emerald-50 border-2 border-emerald-500 inline-block" />
            <span className="text-muted text-[11px] sm:text-xs">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded bg-brand border-2 border-brand-strong inline-block shadow-sm" />
            <span className="text-ink font-semibold text-[11px] sm:text-xs">Your Bed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded bg-slate-200 border border-slate-300 inline-block" />
            <span className="text-muted text-[11px] sm:text-xs">Occupied</span>
          </div>
        </div>
      </div>

      {/* Main Graphical Dorm Room Floorplan */}
      <div className="relative bg-slate-900 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-7 shadow-pop overflow-hidden border-2 sm:border-4 border-slate-800">
        {/* Subtle grid pattern background like architectural seat selector */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Architectural Boundaries & Room Markers */}
        <div className="relative z-10 flex flex-col gap-5 sm:gap-7">
          {/* Room Header & Orientation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-white/10 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold bg-brand text-white px-2.5 py-0.5 rounded-full">
                  Floor {room.floor}
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-slate-400">
                  {room.type === 'female'
                    ? 'Female-Only Dorm'
                    : room.type === 'male'
                    ? 'Male-Only Dorm'
                    : room.type === 'deluxe'
                    ? 'Deluxe Capsule Pods'
                    : 'Mixed Dorm'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mt-1 text-white">{room.name}</h3>
            </div>

            {/* Room Features Pills */}
            <div className="flex items-center flex-wrap gap-1.5 text-[11px] text-slate-300">
              <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md">
                <Wind className="size-3 text-sky-400" /> A/C Climate
              </span>
              <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md">
                <Wifi className="size-3 text-emerald-400" /> Free Gigabit
              </span>
              <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md">
                <Lock className="size-3 text-amber-400" /> Keycard Access
              </span>
            </div>
          </div>

          {/* Top Wall Marker: Window Side */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 border-b border-dashed border-white/20 pb-2.5 gap-1.5">
            <div className="flex items-center gap-1.5">
              <Sun className="size-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] sm:text-xs">Victorian Windows (Garden & Courtyard Facing)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-emerald-400 font-semibold text-[11px] sm:text-xs">
                {beds.filter((b) => b.isAvailable).length} beds available for your dates
              </span>
            </div>
          </div>

          {/* Graphical Bunk Pods Grid (Responsive 1/2/4 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
            {bunkGroups.map((groupName) => {
              const groupBeds = beds.filter((b) => b.bunkGroup === groupName);
              const topBed = groupBeds.find((b) => b.tier === 'top');
              const bottomBed = groupBeds.find((b) => b.tier === 'bottom');

              return (
                <div
                  key={groupName}
                  className="bg-slate-800/90 rounded-xl p-3 sm:p-3.5 border border-slate-700/80 shadow-card flex flex-col gap-2.5 relative group/bunk transition-all duration-200 hover:border-slate-600 min-w-0"
                >
                  {/* Bunk Unit Structure Header */}
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-2 border-b border-slate-700 min-w-0">
                    <span className="flex items-center gap-1.5 text-xs truncate">
                      <Bed className="size-3.5 text-brand shrink-0" /> {groupName}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-full shrink-0">
                      Double Pod
                    </span>
                  </div>

                  {/* Visual Bunk Bed Slots (Upper & Lower) */}
                  <div className="flex flex-col gap-2.5 min-w-0">
                    {/* Top Bunk Card */}
                    {topBed && (
                      <BedSlotCard
                        bed={topBed}
                        isSelected={topBed.id === selectedBedId}
                        isDimmed={tierFilter === 'bottom'}
                        onSelect={() => topBed.isAvailable && onSelectBed(topBed)}
                        onHover={() => setHoveredBed(topBed)}
                        onLeave={() => setHoveredBed(null)}
                      />
                    )}

                    {/* Physical Ladder/Staircase Separator */}
                    <div className="flex items-center justify-center gap-2 py-0.5">
                      <div className="h-[1px] flex-1 bg-slate-700/80" />
                      <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700/80">
                        🪜 Ladder
                      </span>
                      <div className="h-[1px] flex-1 bg-slate-700/80" />
                    </div>

                    {/* Bottom Bunk Card */}
                    {bottomBed && (
                      <BedSlotCard
                        bed={bottomBed}
                        isSelected={bottomBed.id === selectedBedId}
                        isDimmed={tierFilter === 'top'}
                        onSelect={() => bottomBed.isAvailable && onSelectBed(bottomBed)}
                        onHover={() => setHoveredBed(bottomBed)}
                        onLeave={() => setHoveredBed(null)}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Wall Marker: Room Door & Lockers */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 pt-3 border-t border-dashed border-white/20 gap-2.5">
            <div className="flex items-center flex-wrap gap-2">
              <div className="px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-1.5 text-white text-[11px]">
                <span className="size-2 rounded-full bg-amber-400" />
                <span>🚪 Keycard Entry Door</span>
              </div>
              <div className="px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-1.5 text-white text-[11px]">
                <span>🚿 Ensuite Shower & WC</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>🗄️ Private Lockers Assigned to Beds</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Selection / Inspection Card */}
      {activeBed ? (
        <div className="bg-emerald-50/80 border-2 border-emerald-500 rounded-2xl p-4 sm:p-5 shadow-pop flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                <Check className="size-3.5" strokeWidth={3} /> Selected Bed
              </span>
              <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                {room.name}
              </span>
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-ink">
              Bed {formatBedBadge(activeBed.bedNumber)} — {activeBed.tier === 'top' ? 'Upper Bunk' : 'Lower Bunk'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-700">
              Includes: {activeBed.features.join(' · ')}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white px-4 py-2.5 rounded-xl border border-emerald-200 shrink-0">
            <div>
              <p className="text-xs text-muted font-medium">Bed Rate</p>
              <p className="text-lg sm:text-xl font-bold text-ink">
                {formatMoney(activeBed.pricePerNight)}
                <span className="text-xs font-normal text-muted">/night</span>
              </p>
            </div>
            {nights > 1 && (
              <div className="pl-4 border-l border-line">
                <p className="text-xs text-muted font-medium">{nights} Nights Total</p>
                <p className="text-lg sm:text-xl font-bold text-brand-strong">
                  {formatMoney(activeBed.pricePerNight * nights)}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-line rounded-2xl p-4 sm:p-5 flex items-center gap-3 text-muted text-xs sm:text-sm shadow-card">
          <Info className="size-5 text-brand shrink-0" />
          <span>Click any available green bed on the interactive floorplan above to reserve your spot.</span>
        </div>
      )}
    </div>
  );
}

// Sub-component: Individual Graphical Bunk Bed Slot (Airline seat style)
interface BedSlotCardProps {
  bed: HostelBed;
  isSelected: boolean;
  isDimmed: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}

function BedSlotCard({
  bed,
  isSelected,
  isDimmed,
  onSelect,
  isAvailable = bed.isAvailable,
  onHover,
  onLeave,
}: BedSlotCardProps & { isAvailable?: boolean }) {
  const isOccupied = !isAvailable;
  const badgeLabel = formatBedBadge(bed.bedNumber);

  return (
    <button
      type="button"
      disabled={isOccupied}
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`relative w-full text-left rounded-xl p-2.5 sm:p-3 transition-all duration-200 border-2 select-none overflow-hidden ${
        isDimmed ? 'opacity-40' : 'opacity-100'
      } ${
        isSelected
          ? 'bg-gradient-to-r from-brand to-brand-strong text-white border-white shadow-pop scale-[1.01] ring-2 ring-brand/40'
          : isOccupied
          ? 'bg-slate-900/60 border-slate-700/60 text-slate-500 cursor-not-allowed'
          : 'bg-slate-900/90 border-slate-700 text-slate-200 hover:border-emerald-400 hover:bg-slate-800 hover:shadow-card cursor-pointer'
      }`}
      aria-label={`Bed ${badgeLabel}, ${bed.tier === 'top' ? 'Upper Bunk' : 'Lower Bunk'}, ${
        isOccupied ? 'Occupied' : isSelected ? 'Selected' : `Available, ${formatMoney(bed.pricePerNight)} per night`
      }`}
    >
      {/* Top Header: Bed Identifier + Tier + Price (NEVER overlaps) */}
      <div className="flex items-center justify-between gap-1.5 mb-2 min-w-0">
        {/* Left: Compact identifier & tier */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
          <span
            className={`font-semibold text-xs tracking-tight px-1.5 py-0.5 rounded transition ${
              isSelected
                ? 'bg-white text-brand-strong'
                : isOccupied
                ? 'bg-slate-800 text-slate-500'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}
          >
            {badgeLabel}
          </span>
          <span
            className={`text-[10px] uppercase tracking-wider font-semibold truncate ${
              isSelected ? 'text-white/90' : 'text-slate-400'
            }`}
          >
            {bed.tier === 'top' ? 'Upper' : 'Lower'}
          </span>
        </div>

        {/* Right: Price Tag or Status (shrink-0, contained) */}
        <div className="shrink-0">
          {isSelected ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white text-brand-strong px-2 py-0.5 rounded-full shadow-sm">
              <Check className="size-2.5" strokeWidth={3} /> Selected
            </span>
          ) : isOccupied ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-800/90 px-2 py-0.5 rounded-full">
              <Lock className="size-2.5" /> Booked
            </span>
          ) : (
            <span className="inline-flex items-center text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full whitespace-nowrap">
              {formatMoney(bed.pricePerNight)}
            </span>
          )}
        </div>
      </div>

      {/* Bed Mattress Graphical Representation */}
      <div
        className={`w-full rounded-lg p-2 flex items-center justify-between border ${
          isSelected
            ? 'bg-white/15 border-white/20'
            : isOccupied
            ? 'bg-slate-950/40 border-slate-800'
            : 'bg-slate-950/80 border-slate-800'
        }`}
      >
        {/* Pillow & Headrest graphic */}
        <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
          <div
            className={`w-5 h-3.5 rounded-xs shrink-0 border ${
              isSelected
                ? 'bg-white/90 border-white'
                : isOccupied
                ? 'bg-slate-800 border-slate-700'
                : 'bg-slate-700 border-slate-600'
            }`}
            title="Pillow / Headrest"
          />
          <div className="flex flex-col min-w-0 truncate">
            <span
              className={`text-[10px] sm:text-[11px] font-medium truncate ${
                isSelected ? 'text-white' : 'text-slate-300'
              }`}
            >
              {bed.tier === 'top' ? 'Top Single Bed' : 'Lower Pod Bed'}
            </span>
            <span className={`text-[9px] sm:text-[10px] ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
              90 × 190 cm
            </span>
          </div>
        </div>

        {/* Feature Icons */}
        <div className="flex items-center gap-1.5 opacity-80 shrink-0 ml-1">
          <span title="Personal Reading Light">
            <Moon className="size-3" />
          </span>
          <span title="USB & AC Plug">
            <Zap className="size-3" />
          </span>
          {bed.tier === 'bottom' && (
            <span title="Blackout Privacy Curtain">
              <Shield className="size-3" />
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
