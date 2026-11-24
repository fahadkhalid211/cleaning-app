'use client';

import { useState } from 'react';
import {
  Bed,
  Check,
  Info,
  Layers,
  Lock,
  Moon,
  Shield,
  Sun,
  Wifi,
  Wind,
  Zap,
} from 'lucide-react';
import type { BunkTier, HostelBed, HostelRoom } from '@/lib/types';
import { formatMoney } from '@/lib/config';

interface BunkBedMapProps {
  room: HostelRoom;
  beds: HostelBed[];
  selectedBedId: string | null;
  onSelectBed: (bed: HostelBed) => void;
  nights: number;
}

export function BunkBedMap({ room, beds, selectedBedId, onSelectBed, nights }: BunkBedMapProps) {
  const [tierFilter, setTierFilter] = useState<'all' | 'bottom' | 'top'>('all');
  const [hoveredBed, setHoveredBed] = useState<HostelBed | null>(null);

  // Group beds by bunkGroup (e.g. Bunk 1, Bunk 2, etc.)
  const bunkGroups = Array.from(new Set(beds.map((b) => b.bunkGroup)));

  // Selected bed object
  const activeBed = beds.find((b) => b.id === selectedBedId) || null;

  return (
    <div className="space-y-6">
      {/* Control bar: Tier Filter & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-line shadow-card">
        {/* Tier filter */}
        <div className="flex items-center gap-1.5 bg-soft p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setTierFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              tierFilter === 'all' ? 'bg-white shadow-sm text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            All Bunks ({beds.length})
          </button>
          <button
            type="button"
            onClick={() => setTierFilter('bottom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
              tierFilter === 'bottom' ? 'bg-white shadow-sm text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            Lower Bunks ({beds.filter((b) => b.tier === 'bottom').length})
          </button>
          <button
            type="button"
            onClick={() => setTierFilter('top')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
              tierFilter === 'top' ? 'bg-white shadow-sm text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            Upper Bunks ({beds.filter((b) => b.tier === 'top').length})
          </button>
        </div>

        {/* Airline Legend */}
        <div className="flex items-center flex-wrap gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="size-3.5 rounded bg-emerald-50 border-2 border-emerald-500 inline-block" />
            <span className="text-muted">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3.5 rounded bg-brand border-2 border-brand-strong inline-block shadow-sm" />
            <span className="text-ink font-semibold">Your Selection</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3.5 rounded bg-slate-200 border border-slate-300 inline-block" />
            <span className="text-muted">Occupied</span>
          </div>
        </div>
      </div>

      {/* Main Graphical Dorm Room Floorplan */}
      <div className="relative bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-pop overflow-hidden border-4 border-slate-800">
        {/* Subtle grid pattern background like architectural seat selector */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Architectural Boundaries & Room Markers */}
        <div className="relative z-10 flex flex-col gap-8">
          {/* Room Header & Orientation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold bg-brand text-white px-2.5 py-0.5 rounded-full">
                  Floor {room.floor}
                </span>
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  {room.type === 'female'
                    ? 'Female-Only Dorm'
                    : room.type === 'male'
                    ? 'Male-Only Dorm'
                    : room.type === 'deluxe'
                    ? 'Deluxe Capsule Pods'
                    : 'Mixed Dorm'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mt-1 text-white">{room.name}</h3>
            </div>

            {/* Room Features Pills */}
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <Wind className="size-3.5 text-sky-400" /> A/C Climate
              </span>
              <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <Wifi className="size-3.5 text-emerald-400" /> Free Gigabit
              </span>
              <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <Lock className="size-3.5 text-amber-400" /> Keycard Access
              </span>
            </div>
          </div>

          {/* Top Wall Marker: Window Side */}
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-dashed border-white/20 pb-2">
            <div className="flex items-center gap-2">
              <Sun className="size-4 text-amber-400" />
              <span>Victorian Windows (Garden & Courtyard Facing)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-semibold">
                {beds.filter((b) => b.isAvailable).length} beds available for your dates
              </span>
            </div>
          </div>

          {/* Graphical Bunk Pods Grid (Floorplan Layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bunkGroups.map((groupName, gIdx) => {
              const groupBeds = beds.filter((b) => b.bunkGroup === groupName);
              const topBed = groupBeds.find((b) => b.tier === 'top');
              const bottomBed = groupBeds.find((b) => b.tier === 'bottom');

              return (
                <div
                  key={groupName}
                  className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 shadow-card flex flex-col gap-3 relative group/bunk transition-all duration-200 hover:border-slate-600"
                >
                  {/* Bunk Unit Structure Header */}
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-2 border-b border-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Bed className="size-3.5 text-brand" /> {groupName}
                    </span>
                    <span className="text-[11px] text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded-full">
                      Double Pod
                    </span>
                  </div>

                  {/* Visual Bunk Bed Slots (Upper & Lower) */}
                  <div className="flex flex-col gap-3">
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
                      <div className="h-[1px] flex-1 bg-slate-700" />
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                        🪜 Bunk Ladder
                      </span>
                      <div className="h-[1px] flex-1 bg-slate-700" />
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
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-4 border-t border-dashed border-white/20 gap-3">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-1.5 text-white">
                <span className="size-2 rounded-full bg-amber-400" />
                <span>🚪 Entry Door (Keycard Lock)</span>
              </div>
              <div className="px-3 py-1 bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-1.5 text-white">
                <span>🚿 Ensuite Shower & WC</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">🗄️ Lockers 1A–6B Located by Wardrobe Wall</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Selection / Inspection Card */}
      {activeBed ? (
        <div className="bg-emerald-50/80 border-2 border-emerald-500 rounded-2xl p-5 shadow-pop flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                <Check className="size-3.5" strokeWidth={3} /> Selected Bed
              </span>
              <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                {room.name}
              </span>
            </div>
            <h4 className="text-2xl font-bold text-ink">
              Bed {activeBed.bedNumber} — {activeBed.tier === 'top' ? 'Upper Bunk' : 'Lower Bunk'}
            </h4>
            <p className="text-sm text-slate-700">
              Includes: {activeBed.features.join(' · ')}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-xl border border-emerald-200 shrink-0">
            <div>
              <p className="text-xs text-muted font-medium">Bed Rate</p>
              <p className="text-xl font-bold text-ink">{formatMoney(activeBed.pricePerNight)}<span className="text-xs font-normal text-muted">/night</span></p>
            </div>
            {nights > 1 && (
              <div className="pl-4 border-l border-line">
                <p className="text-xs text-muted font-medium">{nights} Nights Total</p>
                <p className="text-xl font-bold text-brand-strong">{formatMoney(activeBed.pricePerNight * nights)}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-line rounded-2xl p-5 flex items-center gap-3 text-muted text-sm shadow-card">
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

function BedSlotCard({ bed, isSelected, isDimmed, onSelect, isAvailable = bed.isAvailable, onHover, onLeave }: BedSlotCardProps & { isAvailable?: boolean }) {
  const isOccupied = !isAvailable;

  return (
    <button
      type="button"
      disabled={isOccupied}
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`relative w-full text-left rounded-xl p-3.5 transition-all duration-200 border-2 select-none ${
        isDimmed ? 'opacity-40' : 'opacity-100'
      } ${
        isSelected
          ? 'bg-gradient-to-r from-brand to-brand-strong text-white border-white shadow-pop scale-[1.02] ring-4 ring-brand/30'
          : isOccupied
          ? 'bg-slate-900/60 border-slate-700/60 text-slate-500 cursor-not-allowed'
          : 'bg-slate-900/90 border-slate-700 text-slate-200 hover:border-emerald-400 hover:bg-slate-800 hover:shadow-card cursor-pointer'
      }`}
      aria-label={`Bed ${bed.bedNumber}, ${bed.tier === 'top' ? 'Upper Bunk' : 'Lower Bunk'}, ${
        isOccupied ? 'Occupied' : isSelected ? 'Selected' : `Available, ${formatMoney(bed.pricePerNight)} per night`
      }`}
    >
      {/* Top status & Bunk Type */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black text-sm tracking-wide px-2 py-0.5 rounded-md ${
              isSelected
                ? 'bg-white text-brand-strong'
                : isOccupied
                ? 'bg-slate-800 text-slate-500'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}
          >
            {bed.bedNumber}
          </span>
          <span className={`text-[11px] font-semibold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
            {bed.tier === 'top' ? 'Upper' : 'Lower'}
          </span>
        </div>

        {/* Status Badge */}
        {isSelected ? (
          <span className="flex items-center gap-1 text-[11px] font-bold bg-white text-brand-strong px-2 py-0.5 rounded-full shadow-sm">
            <Check className="size-3" strokeWidth={3} /> Selected
          </span>
        ) : isOccupied ? (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
            <Lock className="size-3" /> Booked
          </span>
        ) : (
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            {formatMoney(bed.pricePerNight)}
          </span>
        )}
      </div>

      {/* Bed Mattress Graphical Representation */}
      <div
        className={`w-full rounded-lg p-2.5 flex items-center justify-between border ${
          isSelected
            ? 'bg-white/15 border-white/20'
            : isOccupied
            ? 'bg-slate-950/40 border-slate-800'
            : 'bg-slate-950/80 border-slate-800'
        }`}
      >
        {/* Pillow & Headrest graphic */}
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-4 rounded-sm border ${
              isSelected
                ? 'bg-white/80 border-white'
                : isOccupied
                ? 'bg-slate-800 border-slate-700'
                : 'bg-slate-700 border-slate-600'
            }`}
            title="Pillow / Headrest"
          />
          <div className="flex flex-col">
            <span className={`text-[11px] font-medium leading-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>
              {bed.tier === 'top' ? 'Top Single Bed' : 'Lower Pod Bed'}
            </span>
            <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
              90 × 190 cm
            </span>
          </div>
        </div>

        {/* Feature Icons */}
        <div className="flex items-center gap-1.5 opacity-80">
          <span title="Personal Reading Light">
            <Moon className="size-3.5" />
          </span>
          <span title="USB & AC Plug">
            <Zap className="size-3.5" />
          </span>
          {bed.tier === 'bottom' && (
            <span title="Blackout Privacy Curtain">
              <Shield className="size-3.5" />
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
