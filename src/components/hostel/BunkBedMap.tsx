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
import { useI18n } from '@/lib/i18n';

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

function localizeBedFeature(f: string, locale: string): string {
  if (locale !== 'cn') return f;
  const map: Record<string, string> = {
    'Upper Bunk with Safety Guard': '上铺（配安全护栏）',
    'Sturdy Ladder Access': '稳固登梯上下',
    'Warm LED Reading Lamp': '暖光LED阅读灯',
    'USB-A & USB-C Sockets': 'USB-A与Type-C双快充',
    'Lower Bunk Ground Level': '下铺（平地进出便利）',
    'Full Blackout Curtain': '全遮光加厚床帘',
    'Under-bed Large Luggage Drawer': '床底大容量行李抽屉',
    'Dual Power Sockets': '双孔电源插座',
    'Window Garden View': '靠窗花园景观',
    'Upper Bunk Cozy Nook': '上铺舒适静谧角',
    'Reading Light & Book Shelf': '阅读灯与置物架',
    'Window View Lower Bunk': '靠窗景观下铺',
    'Blackout Curtain': '全遮光隐私床帘',
    'Under-bed Drawer': '床底大号储物抽屉',
    'Reading Lamp & Socket': '床头灯与独立插座',
    'Upper Bunk Quiet Corner': '上铺静谧角落',
    'Night Reading Lamp': '柔和夜间阅读灯',
    'USB Charger': 'USB多口充电',
    'Lower Bunk Easy Access': '下铺便捷进出',
    'Heavy Privacy Curtain': '加厚隔音遮光帘',
    'Under-bed Storage': '床底行李专属收纳',
    'USB-C Fast Plug': 'Type-C极速快充口',
    'Cozy Upper Nest': '温馨上铺私密空间',
    'Bedside Phone Shelf': '床头手机置物台',
    'Dimmable Reading Light': '无极调光护眼灯',
    'Lower Bunk Convenience': '下铺便捷舒适',
    'Blackout Drapes': '加厚遮光床帘',
    'Under-bed Storage Drawer': '床底大储物抽屉',
    'Upper Soundproof Capsule': '上层隔音独立太空舱',
    'Sliding Privacy Shutter': '隔音滑动隐私门',
    'Sliding Shutter': '滑动隐私舱门',
    'Sliding Shutter Door': '滑动隔音舱门',
    'Internal Airflow Fan': '舱内静音新风循环',
    'Smart Touch Control': '触控调光面板',
    'Lower Capsule Suite': '下层私密太空舱套位',
    'Integrated Wardrobe Locker': '内置衣柜与储物箱',
    'USB-C & Universal AC': 'Type-C及万能电源插座',
    'Lower Soundproof Capsule': '下层隔音独立太空舱',
    'Ground Level Entry': '平层步入舱体',
    'Memory Foam Mattress': '慢回弹记忆棉床垫',
    'Window Side Upper Capsule': '靠窗观景上层太空舱',
    'Skylight View': '天窗开阔采光',
    'Mood Lighting': '情调调光氛围灯',
    'Window Side Lower Capsule': '靠窗观景下层太空舱',
    'Prime Spot': '绝佳景观位置',
    'Under-pod Drawer': '舱底大储物抽屉',
    'Quiet Corner Upper Capsule': '静谧角上层太空舱',
    'Full Soundproof Isolation': '高等级隔音降噪',
    'Reading Nook': '专属阅读角落',
    'Quiet Corner Lower Capsule': '静谧角下层太空舱',
    'Ground Level Easy Access': '平层便捷步入',
    'Acoustic Door': '高阻尼隔音门',
    'Courtyard Window Upper Bunk': '庭院景观上铺',
    'High Ceiling Headroom': '开阔舒适层高',
    'Individual Lamp': '个人专属独立灯',
    'Courtyard Window Lower Bunk': '庭院景观下铺',
    'Thick Privacy Curtain': '加厚隐私床帘',
    'Upper Bunk': '上铺床位',
    'Solid Steel Construction': '全钢坚固床架',
    'Universal Power Hub': '国际通用电源排插',
    'Lower Bunk': '下铺床位',
  };
  if (map[f]) return map[f];
  if (f.startsWith('Locker #') || f.startsWith('Pod Locker #') || f.startsWith('Keycard Locker #')) {
    return f.replace(/^(Pod |Keycard )?Locker #/, '专属储物柜 #');
  }
  return f;
}

export function BunkBedMap({ room, beds, selectedBedId, onSelectBed, nights }: BunkBedMapProps) {
  const { t, locale } = useI18n();
  const hb = t.hostelBook;
  const [tierFilter, setTierFilter] = useState<'all' | 'bottom' | 'top'>('all');
  const [, setHoveredBed] = useState<HostelBed | null>(null);

  // Group beds by bunkGroup (e.g. Bunk 1, Bunk 2, etc.)
  const bunkGroups = Array.from(new Set(beds.map((b) => b.bunkGroup)));

  // Selected bed object
  const activeBed = beds.find((b) => b.id === selectedBedId) || null;

  const localizedRoomName =
    t.hostel.rooms.items[room.id]?.name || t.hostel.rooms.items[room.slug]?.name || room.name;

  const localizedRoomType =
    t.hostel.rooms.types[room.type] || room.type;

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
            {hb.filters.allBunks} ({beds.length})
          </button>
          <button
            type="button"
            onClick={() => setTierFilter('bottom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              tierFilter === 'bottom' ? 'bg-white shadow-sm text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            {hb.filters.lowerBunks} ({beds.filter((b) => b.tier === 'bottom').length})
          </button>
          <button
            type="button"
            onClick={() => setTierFilter('top')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              tierFilter === 'top' ? 'bg-white shadow-sm text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            {hb.filters.upperBunks} ({beds.filter((b) => b.tier === 'top').length})
          </button>
        </div>

        {/* Airline Legend */}
        <div className="flex items-center flex-wrap gap-3 sm:gap-4 text-xs font-medium pt-1 sm:pt-0 border-t sm:border-t-0 border-line">
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded bg-emerald-50 border-2 border-emerald-500 inline-block" />
            <span className="text-muted text-[11px] sm:text-xs">{hb.legend.available}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded bg-brand border-2 border-brand-strong inline-block shadow-sm" />
            <span className="text-ink font-semibold text-[11px] sm:text-xs">{hb.legend.yourBed}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded bg-slate-200 border border-slate-300 inline-block" />
            <span className="text-muted text-[11px] sm:text-xs">{hb.legend.occupied}</span>
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
                  {locale === 'cn' ? `${room.floor} 层` : `Floor ${room.floor}`}
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-slate-400">
                  {localizedRoomType}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mt-1 text-white">{localizedRoomName}</h3>
            </div>

            {/* Room Features Pills */}
            <div className="flex items-center flex-wrap gap-1.5 text-[11px] text-slate-300">
              <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md">
                <Wind className="size-3 text-sky-400" /> {locale === 'cn' ? '智能温控空调' : 'A/C Climate'}
              </span>
              <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md">
                <Wifi className="size-3 text-emerald-400" /> {locale === 'cn' ? '千兆高速Wi-Fi' : 'Free Gigabit'}
              </span>
              <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md">
                <Lock className="size-3 text-amber-400" /> {locale === 'cn' ? '智能加密门卡' : 'Keycard Access'}
              </span>
            </div>
          </div>

          {/* Top Wall Marker: Window Side */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 border-b border-dashed border-white/20 pb-2.5 gap-1.5">
            <div className="flex items-center gap-1.5">
              <Sun className="size-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] sm:text-xs">{hb.floorplan.windowsNote}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-emerald-400 font-semibold text-[11px] sm:text-xs">
                {beds.filter((b) => b.isAvailable).length} {hb.floorplan.bedsAvailableSuffix}
              </span>
            </div>
          </div>

          {/* Graphical Bunk Pods Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
            {bunkGroups.map((groupName) => {
              const groupBeds = beds.filter((b) => b.bunkGroup === groupName);
              const topBed = groupBeds.find((b) => b.tier === 'top');
              const bottomBed = groupBeds.find((b) => b.tier === 'bottom');

              const localizedGroupName =
                locale === 'cn'
                  ? groupName
                      .replace(/^Pod Unit (\d+)/i, '$1 号太空舱单元')
                      .replace(/^Bunk (\d+)/i, '$1 号上下铺')
                  : groupName;

              return (
                <div
                  key={groupName}
                  className="bg-slate-800/90 rounded-xl p-3 sm:p-3.5 border border-slate-700/80 shadow-card flex flex-col gap-2.5 relative group/bunk transition-all duration-200 hover:border-slate-600 min-w-0"
                >
                  {/* Bunk Unit Structure Header */}
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-2 border-b border-slate-700 min-w-0">
                    <span className="flex items-center gap-1.5 text-xs truncate">
                      <Bed className="size-3.5 text-brand shrink-0" /> {localizedGroupName}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-full shrink-0">
                      {hb.podCard.doublePod}
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
                        🪜 {locale === 'cn' ? '攀爬梯' : 'Ladder'}
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
                <span>🚪 {hb.floorplan.doorEntry}</span>
              </div>
              <div className="px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-1.5 text-white text-[11px]">
                <span>🚿 {hb.floorplan.ensuiteNote}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>🗄️ {locale === 'cn' ? '每张床位绑定专属独立储物柜' : 'Private Lockers Assigned to Beds'}</span>
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
                <Check className="size-3.5" strokeWidth={3} /> {hb.summaryBar.selectedBedTitle}
              </span>
              <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                {localizedRoomName}
              </span>
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-ink">
              {locale === 'cn' ? '床位 ' : 'Bed '}
              {formatBedBadge(activeBed.bedNumber)} —{' '}
              {activeBed.tier === 'top' ? hb.podCard.upper : hb.podCard.lower}
            </h4>
            <p className="text-xs sm:text-sm text-slate-700">
              {locale === 'cn' ? '配置：' : 'Includes: '}
              {activeBed.features
                .map((f) => localizeBedFeature(f, locale))
                .join(' · ')}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white px-4 py-2.5 rounded-xl border border-emerald-200 shrink-0">
            <div>
              <p className="text-xs text-muted font-medium">{hb.summaryBar.nightlyRate}</p>
              <p className="text-lg sm:text-xl font-bold text-ink">
                {formatMoney(activeBed.pricePerNight)}
                <span className="text-xs font-normal text-muted">{t.common.perNight}</span>
              </p>
            </div>
            {nights > 1 && (
              <div className="pl-4 border-l border-line">
                <p className="text-xs text-muted font-medium">
                  {hb.dates.nightsCount(nights)} {hb.summaryBar.stayTotal}
                </p>
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
          <span>{hb.summaryBar.selectedBedPrompt}</span>
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
  const { t } = useI18n();
  const hb = t.hostelBook;
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
      aria-label={`${badgeLabel}, ${bed.tier === 'top' ? hb.podCard.upper : hb.podCard.lower}, ${
        isOccupied
          ? hb.podCard.occupiedLabel
          : isSelected
          ? hb.podCard.selectedLabel
          : `${hb.legend.available}, ${formatMoney(bed.pricePerNight)} ${t.common.perNight}`
      }`}
    >
      {/* Top Header: Bed Identifier + Tier + Price */}
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
            {bed.tier === 'top' ? hb.podCard.upper : hb.podCard.lower}
          </span>
        </div>

        {/* Right: Price Tag or Status */}
        <div className="shrink-0">
          {isSelected ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white text-brand-strong px-2 py-0.5 rounded-full shadow-sm">
              <Check className="size-2.5" strokeWidth={3} /> {hb.podCard.selectedLabel}
            </span>
          ) : isOccupied ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-800/90 px-2 py-0.5 rounded-full">
              <Lock className="size-2.5" /> {hb.podCard.occupiedLabel}
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
              {bed.tier === 'top' ? hb.podCard.topSingle : hb.podCard.bottomSingle}
            </span>
            <span className={`text-[9px] sm:text-[10px] ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
              {hb.podCard.dimensions}
            </span>
          </div>
        </div>

        {/* Feature Icons */}
        <div className="flex items-center gap-1.5 opacity-80 shrink-0 ml-1">
          <span title={hb.podCard.readingLight}>
            <Moon className="size-3" />
          </span>
          <span title={hb.podCard.powerUsb}>
            <Zap className="size-3" />
          </span>
          {bed.tier === 'bottom' && (
            <span title={hb.podCard.curtain}>
              <Shield className="size-3" />
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
