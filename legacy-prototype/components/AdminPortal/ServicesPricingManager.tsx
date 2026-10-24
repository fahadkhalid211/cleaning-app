'use client';

import React, { useState } from 'react';
import { useBooking } from '@/context/BookingContext';
import { 
  Plus, 
  Tag, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Layers, 
  Save, 
  X, 
  Flame, 
  Snowflake, 
  Maximize2, 
  Leaf, 
  Hotel, 
  KeyRound, 
  Hammer, 
  ShieldCheck, 
  Check, 
  Clock, 
  TrendingUp,
  DollarSign,
  Info
} from 'lucide-react';
import { ServiceDefinition, AddonOption } from '@/types/cleaning';

interface ServicesPricingManagerProps {
  filterMode?: 'all' | 'services' | 'addons';
}

export const ServicesPricingManager: React.FC<ServicesPricingManagerProps> = ({ filterMode = 'all' }) => {
  const { 
    services, 
    addons, 
    updateServicePrice, 
    addNewService, 
    deleteService, 
    updateAddonPrice, 
    addNewAddon, 
    deleteAddon,
    formatPrice,
    currentEstimate
  } = useBooking();

  // Price edit states
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [servicePriceDrafts, setServicePriceDrafts] = useState<Record<string, number>>({});
  
  const [editingAddonId, setEditingAddonId] = useState<string | null>(null);
  const [addonPriceDrafts, setAddonPriceDrafts] = useState<Record<string, number>>({});

  // Add Service Form Modal
  const [isAddingService, setIsAddingService] = useState(false);
  const [newService, setNewService] = useState({
    title: '',
    tagline: '',
    description: '',
    rate: 36,
    minHours: 2.5,
    badge: 'Popular',
    iconName: 'Sparkles',
    highlights: 'Full surface disinfection & polish\nHEPA vacuuming and baseboards\nSatisfaction guaranteed report'
  });

  // Add Addon Form Modal
  const [isAddingAddon, setIsAddingAddon] = useState(false);
  const [newAddon, setNewAddon] = useState({
    name: '',
    description: '',
    price: 25,
    durationMinutes: 30,
    icon: 'Sparkles'
  });

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 'KeyRound': return <KeyRound className="w-5 h-5 text-emerald-600" />;
      case 'Hotel': return <Hotel className="w-5 h-5 text-emerald-600" />;
      case 'Hammer': return <Hammer className="w-5 h-5 text-emerald-600" />;
      default: return <Sparkles className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getAddonIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-4 h-4 text-amber-600" />;
      case 'Snowflake': return <Snowflake className="w-4 h-4 text-cyan-600" />;
      case 'Maximize2': return <Maximize2 className="w-4 h-4 text-blue-600" />;
      case 'Leaf': return <Leaf className="w-4 h-4 text-emerald-600" />;
      default: return <Sparkles className="w-4 h-4 text-purple-600" />;
    }
  };

  const handleSaveServicePrice = (serviceId: string) => {
    const draft = servicePriceDrafts[serviceId];
    if (draft !== undefined && draft > 0) {
      updateServicePrice(serviceId, draft);
      setEditingServiceId(null);
      showToast(`Updated hourly rate to $${draft}/hr!`);
    }
  };

  const handleNudgeServicePrice = (serviceId: string, currentRate: number, delta: number) => {
    const newRate = Math.max(1, currentRate + delta);
    updateServicePrice(serviceId, newRate);
    showToast(`Adjusted rate to $${newRate}/hr`);
  };

  const handleSaveAddonPrice = (addonId: string) => {
    const draft = addonPriceDrafts[addonId];
    if (draft !== undefined && draft >= 0) {
      updateAddonPrice(addonId, draft);
      setEditingAddonId(null);
      showToast(`Updated addon price to $${draft}!`);
    }
  };

  const handleNudgeAddonPrice = (addonId: string, currentPrice: number, delta: number) => {
    const newPrice = Math.max(0, currentPrice + delta);
    updateAddonPrice(addonId, newPrice);
    showToast(`Adjusted price to $${newPrice}`);
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.title.trim()) return;

    const id = newService.title.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
    const highlights = newService.highlights
      .split('\n')
      .map(h => h.trim())
      .filter(Boolean);

    addNewService({
      id,
      title: newService.title.trim(),
      tagline: newService.tagline.trim() || 'Custom tailored home cleaning plan',
      description: newService.description.trim() || 'Professional cleaning service managed via PureSpace admin control.',
      basePricePerHour: Number(newService.rate) || 35,
      minHours: Number(newService.minHours) || 2.0,
      recommendedFor: 'Custom client requests, tailored properties',
      iconName: newService.iconName,
      badge: newService.badge.trim() || undefined,
      includedHighlights: highlights.length > 0 ? highlights : ['Detailed sanitization of all surfaces', 'Quality check guarantee']
    });

    setIsAddingService(false);
    setNewService({
      title: '',
      tagline: '',
      description: '',
      rate: 36,
      minHours: 2.5,
      badge: 'Popular',
      iconName: 'Sparkles',
      highlights: 'Full surface disinfection & polish\nHEPA vacuuming and baseboards\nSatisfaction guaranteed report'
    });
    showToast(`Created new service: "${newService.title}"!`);
  };

  const handleCreateAddon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddon.name.trim()) return;

    const id = newAddon.name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
    addNewAddon({
      id,
      name: newAddon.name.trim(),
      description: newAddon.description.trim() || 'Custom cleaning extra configured by platform admin',
      price: Number(newAddon.price) || 20,
      durationMinutes: Number(newAddon.durationMinutes) || 30,
      icon: newAddon.icon,
      popular: true
    });

    setIsAddingAddon(false);
    setNewAddon({
      name: '',
      description: '',
      price: 25,
      durationMinutes: 30,
      icon: 'Sparkles'
    });
    showToast(`Added new addon: "${newAddon.name}"!`);
  };

  const avgRate = services.reduce((sum, s) => sum + s.basePricePerHour, 0) / (services.length || 1);

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-slideUp border border-slate-700">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Pricing Engine Status Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xl font-bold text-slate-900">
              Pricing & Catalog Manager
            </h2>
            <span className="text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
              Live Real-Time Sync
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Configure hourly rates, add new service packages, and set custom add-on fees with instant platform-wide recalculation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {(filterMode === 'all' || filterMode === 'services') && (
            <button
              type="button"
              onClick={() => setIsAddingService(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Service Plan</span>
            </button>
          )}

          {(filterMode === 'all' || filterMode === 'addons') && (
            <button
              type="button"
              onClick={() => setIsAddingAddon(true)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border border-slate-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Extra</span>
            </button>
          )}
        </div>
      </div>

      {/* Pricing Stats Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Active Services</span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">{services.length} Plans</span>
          <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">Live on website catalog</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Available Addons</span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">{addons.length} Extras</span>
          <span className="text-[10px] text-cyan-700 font-medium block mt-0.5">Customizable per booking</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Avg Hourly Rate</span>
          <span className="text-2xl font-bold text-emerald-700 tracking-tight tabular-nums">{formatPrice(avgRate)}/hr</span>
          <span className="text-[10px] text-slate-400 font-normal block mt-0.5">Platform baseline</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Sample 2-Bed Quote</span>
          <span className="text-2xl font-bold text-emerald-800 tracking-tight tabular-nums">{formatPrice(currentEstimate.finalPrice)}</span>
          <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">Live calculator benchmark</span>
        </div>
      </div>

      {/* SECTION 1: Service Plans & Hourly Rates */}
      {(filterMode === 'all' || filterMode === 'services') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Service Plans & Hourly Rates</span>
              </h3>
              <p className="text-xs text-slate-500">
                Adjust base hourly rates or introduce specialized cleaning tiers.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {services.length} Services Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((srv) => {
              const isEditing = editingServiceId === srv.id;
              const currentDraft = servicePriceDrafts[srv.id] !== undefined ? servicePriceDrafts[srv.id] : srv.basePricePerHour;

              return (
                <div
                  key={srv.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between hover:border-slate-300 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                          {getServiceIcon(srv.iconName)}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 leading-tight">{srv.title}</h4>
                          <span className="text-[11px] text-slate-500 font-medium">Min: {srv.minHours} hrs required</span>
                        </div>
                      </div>
                      {srv.badge && (
                        <span className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {srv.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">{srv.tagline}</p>
                  </div>

                  {/* Price Control Section */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-semibold">Hourly Rate</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleNudgeServicePrice(srv.id, srv.basePricePerHour, -2)}
                          className="w-6 h-6 rounded-md bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs transition-colors border border-slate-200"
                          title="Decrease by $2"
                        >
                          -$2
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNudgeServicePrice(srv.id, srv.basePricePerHour, 2)}
                          className="w-6 h-6 rounded-md bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs transition-colors border border-slate-200"
                          title="Increase by $2"
                        >
                          +$2
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2 pt-1">
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">$</span>
                          <input
                            type="number"
                            step="1"
                            min="1"
                            value={currentDraft}
                            onChange={(e) => setServicePriceDrafts(prev => ({ ...prev, [srv.id]: Number(e.target.value) }))}
                            className="w-full pl-6 pr-2 py-1.5 bg-white border border-emerald-500 rounded-lg text-sm font-bold text-slate-900 focus:outline-none ring-2 ring-emerald-500/20"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSaveServicePrice(srv.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingServiceId(null)}
                          className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg text-xs"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-baseline justify-between pt-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-slate-900 tabular-nums">
                            {formatPrice(srv.basePricePerHour)}
                          </span>
                          <span className="text-xs text-slate-500 font-normal">/ hour</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingServiceId(srv.id);
                            setServicePriceDrafts(prev => ({ ...prev, [srv.id]: srv.basePricePerHour }));
                          }}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-emerald-50"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Included highlights summary */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{srv.includedHighlights.length} Checklist Items</span>
                    {!['regular', 'deep', 'end_of_tenancy'].includes(srv.id) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remove custom service plan "${srv.title}"?`)) {
                            deleteService(srv.id);
                            showToast(`Removed service: ${srv.title}`);
                          }
                        }}
                        className="text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: Addons & Extras Pricing Catalog */}
      {(filterMode === 'all' || filterMode === 'addons') && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyan-600" />
                <span>Addons & Extras Catalog</span>
              </h3>
              <p className="text-xs text-slate-500">
                Configure fixed prices for oven detailing, fridge sanitization, interior windows, and supplies.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {addons.length} Addons
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {addons.map((addon) => {
              const isEditing = editingAddonId === addon.id;
              const currentDraft = addonPriceDrafts[addon.id] !== undefined ? addonPriceDrafts[addon.id] : addon.price;

              return (
                <div
                  key={addon.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3 flex flex-col justify-between hover:border-slate-300 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-1">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                        {getAddonIcon(addon.icon)}
                      </div>
                      {addon.durationMinutes > 0 ? (
                        <span className="text-[10px] text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                          ~{addon.durationMinutes}m
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Supplies
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-semibold text-slate-900 leading-tight">{addon.name}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{addon.description}</p>
                  </div>

                  {/* Price Control */}
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-semibold">Flat Price</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleNudgeAddonPrice(addon.id, addon.price, -2)}
                          className="w-5 h-5 rounded bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] transition-colors border border-slate-200"
                        >
                          -$2
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNudgeAddonPrice(addon.id, addon.price, 2)}
                          className="w-5 h-5 rounded bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] transition-colors border border-slate-200"
                        >
                          +$2
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <div className="relative flex-1">
                          <span className="absolute left-2 top-1.5 text-xs font-bold text-slate-400">$</span>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={currentDraft}
                            onChange={(e) => setAddonPriceDrafts(prev => ({ ...prev, [addon.id]: Number(e.target.value) }))}
                            className="w-full pl-5 pr-1 py-1 bg-white border border-cyan-600 rounded text-xs font-bold text-slate-900 focus:outline-none ring-1 ring-cyan-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSaveAddonPrice(addon.id)}
                          className="p-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded text-xs"
                        >
                          <Save className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingAddonId(null)}
                          className="p-1.5 bg-white border border-slate-200 text-slate-500 rounded text-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-bold text-slate-900 tabular-nums">
                          {formatPrice(addon.price)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAddonId(addon.id);
                            setAddonPriceDrafts(prev => ({ ...prev, [addon.id]: addon.price }));
                          }}
                          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                          <span>Edit</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {!['oven', 'fridge', 'windows', 'eco_supplies'].includes(addon.id) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remove addon "${addon.name}"?`)) {
                          deleteAddon(addon.id);
                          showToast(`Removed addon: ${addon.name}`);
                        }
                      }}
                      className="text-[10px] text-rose-600 hover:text-rose-700 flex items-center justify-end gap-1 font-medium pt-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: Add New Service Plan */}
      {isAddingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 text-left relative max-h-[90vh] overflow-y-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setIsAddingService(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Service Plan Creator
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">Create New Cleaning Service Plan</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-normal">
                New service packages instantly sync to the customer calculator and booking checkout.
              </p>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  value={newService.title}
                  onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                  placeholder="e.g. Carpet Steam Wash & Sanitization"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Base Price / Hr ($) *</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={newService.rate}
                    onChange={(e) => setNewService({ ...newService, rate: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Booking Hours</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={newService.minHours}
                    onChange={(e) => setNewService({ ...newService, minHours: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={newService.tagline}
                  onChange={(e) => setNewService({ ...newService, tagline: e.target.value })}
                  placeholder="e.g. Deep industrial fiber extraction & allergen removal"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Badge Label</label>
                  <input
                    type="text"
                    value={newService.badge}
                    onChange={(e) => setNewService({ ...newService, badge: e.target.value })}
                    placeholder="e.g. Specialty, Hot Deal"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Icon Style</label>
                  <select
                    value={newService.iconName}
                    onChange={(e) => setNewService({ ...newService, iconName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium"
                  >
                    <option value="Sparkles">Sparkles (General)</option>
                    <option value="ShieldCheck">Shield (Deep Scrub)</option>
                    <option value="KeyRound">Key (Move-Out)</option>
                    <option value="Hotel">Hotel (Turnover)</option>
                    <option value="Hammer">Hammer (Renovation)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Checklist Inclusions (One bullet per line)
                </label>
                <textarea
                  rows={3}
                  value={newService.highlights}
                  onChange={(e) => setNewService({ ...newService, highlights: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddingService(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors"
                >
                  Publish Service Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add New Addon Extra */}
      {isAddingAddon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-left relative">
            <button
              type="button"
              onClick={() => setIsAddingAddon(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-800 bg-cyan-100 px-2.5 py-0.5 rounded-full border border-cyan-200">
                Extra Addon Creator
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">Create Addon Extra</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-normal">
                Adds a selectable extra service to customer quote calculators.
              </p>
            </div>

            <form onSubmit={handleCreateAddon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Addon Name *</label>
                <input
                  type="text"
                  required
                  value={newAddon.name}
                  onChange={(e) => setNewAddon({ ...newAddon, name: e.target.value })}
                  placeholder="e.g. Garage Sweep & Tidy"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={newAddon.price}
                    onChange={(e) => setNewAddon({ ...newAddon, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Minutes</label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    required
                    value={newAddon.durationMinutes}
                    onChange={(e) => setNewAddon({ ...newAddon, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newAddon.description}
                  onChange={(e) => setNewAddon({ ...newAddon, description: e.target.value })}
                  placeholder="e.g. Cobweb removal, concrete floor sweeping and organizing"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Icon</label>
                <select
                  value={newAddon.icon}
                  onChange={(e) => setNewAddon({ ...newAddon, icon: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium"
                >
                  <option value="Sparkles">Sparkles (General)</option>
                  <option value="Flame">Flame (Oven / Heat)</option>
                  <option value="Snowflake">Snowflake (Fridge)</option>
                  <option value="Maximize2">Window Frame</option>
                  <option value="Leaf">Eco Leaf</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddingAddon(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-md transition-colors"
                >
                  Add Addon Extra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
