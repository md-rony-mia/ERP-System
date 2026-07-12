import React, { useState, useEffect, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { Product } from '../types';

interface WarehouseExtensionsProps {
  products: Product[];
  onUpdateProducts?: (products: Product[]) => void;
  warehouses: { name: string; location: string; manager: string; capacity: string }[];
}

// ----------------------------------------------------
// HELPER FOR STORAGE & NOTIFICATIONS
// ----------------------------------------------------
const useLocalStorage = <T,>(key: string, initialValue: T): [T, (val: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  };
  return [storedValue, setValue];
};

// ----------------------------------------------------
// 1. ZONES MANAGEMENT TAB
// ----------------------------------------------------
export function ZonesTab({ warehouses }: WarehouseExtensionsProps) {
  const [zones, setZones] = useLocalStorage('axiom_wh_zones', [
    { id: 'z1', name: 'Cold Storage Zone', code: 'Z-COLD', warehouse: 'Main Warehouse', type: 'Refrigerated', capacity: '80%', status: 'Active' },
    { id: 'z2', name: 'Bulk Materials Yard', code: 'Z-BULK', warehouse: 'Yard A', type: 'Open Space', capacity: '45%', status: 'Active' },
    { id: 'z3', name: 'Hazardous Materials Shelter', code: 'Z-HAZ', warehouse: 'Yard B', type: 'Secured/Climate', capacity: '12%', status: 'Active' },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [wh, setWh] = useState(warehouses[0]?.name || 'Main Warehouse');
  const [type, setType] = useState('Standard Rack');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    setZones([...zones, { id: 'z_' + Date.now(), name, code: code.toUpperCase(), warehouse: wh, type, capacity: '0%', status: 'Active' }]);
    setName(''); setCode(''); setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-display">Zones Management</h2>
          <p className="text-xs text-slate-400 mt-1">Configure layout zones, temperature chambers, receiving yards, and high-security bins.</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer">
          <Icons.Grid className="h-4 w-4" /> {showAdd ? 'Close Form' : 'New Zone Master'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 animate-in fade-in duration-150 shadow-xs">
          <h3 className="text-xs font-black text-slate-700 uppercase">Register Layout Zone</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Zone Name</label>
              <input type="text" required placeholder="e.g. Rack Row B" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Zone Code (SKU Prefix)</label>
              <input type="text" required placeholder="e.g. Z-ROWB" value={code} onChange={e => setCode(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white font-mono text-indigo-600" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Parent Warehouse</label>
              <select value={wh} onChange={e => setWh(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white">
                {warehouses.map(w => <option key={w.name} value={w.name}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Storage Class</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white">
                <option value="Standard Rack">Standard Rack</option>
                <option value="Refrigerated">Refrigerated (Cold)</option>
                <option value="Open Space">Open Space (Yard)</option>
                <option value="Secured/Climate">Secured/Climate</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer">Save Zone</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {zones.map((z: any) => (
          <div key={z.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xs transition-all relative">
            <button onClick={() => setZones(zones.filter((item: any) => item.id !== z.id))} className="absolute top-4 right-4 text-slate-300 hover:text-rose-600 cursor-pointer transition-colors"><Icons.Trash2 className="h-4 w-4" /></button>
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600"><Icons.Grid className="h-5 w-5" /></span>
              <div>
                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase">{z.code}</span>
                <h4 className="font-bold text-slate-800 text-sm mt-1">{z.name}</h4>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4 mt-4 text-xs">
              <div><span className="text-slate-400 block text-[9px] uppercase font-black">Warehouse</span><span className="font-semibold text-slate-700">{z.warehouse}</span></div>
              <div><span className="text-slate-400 block text-[9px] uppercase font-black">Storage Class</span><span className="font-semibold text-slate-700">{z.type}</span></div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5"><span className="text-[10px] font-bold text-slate-400">Utilization:</span><span className="font-black text-indigo-600">{z.capacity}</span></div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 border border-emerald-100 text-emerald-700">{z.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 2. AISLES ALLOCATOR TAB
// ----------------------------------------------------
export function AislesTab(_props?: any) {
  const [aisles, setAisles] = useLocalStorage('axiom_wh_aisles', [
    { id: 'a1', code: 'AISLE-01', zone: 'Cold Storage Zone', shelfCount: 5, rackCount: 3, status: 'Active' },
    { id: 'a2', code: 'AISLE-02', zone: 'Bulk Materials Yard', shelfCount: 12, rackCount: 6, status: 'Active' },
    { id: 'a3', code: 'AISLE-03', zone: 'Hazardous Materials Shelter', shelfCount: 2, rackCount: 1, status: 'Active' },
  ]);
  const [code, setCode] = useState('');
  const [zone, setZone] = useState('Cold Storage Zone');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setAisles([...aisles, { id: 'a_' + Date.now(), code: code.toUpperCase(), zone, shelfCount: 0, rackCount: 0, status: 'Active' }]);
    setCode('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 font-display">Aisles Allocator</h2>
        <p className="text-xs text-slate-400 mt-1">Designate high-density paths and physical aisles mapped directly inside zone parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleAdd} className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs h-fit">
          <h3 className="text-xs font-black text-slate-700 uppercase">Create New Aisle</h3>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Aisle Locator Code</label>
            <input type="text" required placeholder="e.g. AISLE-04" value={code} onChange={e => setCode(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 font-mono text-indigo-600" />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Assigned Zone</label>
            <select value={zone} onChange={e => setZone(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50">
              <option value="Cold Storage Zone">Cold Storage Zone</option>
              <option value="Bulk Materials Yard">Bulk Materials Yard</option>
              <option value="Hazardous Materials Shelter">Hazardous Materials Shelter</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer">Register Aisle Row</button>
        </form>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                  <th className="p-4">Aisle Code</th>
                  <th className="p-4">Storage Zone</th>
                  <th className="p-4 text-center">Racks Count</th>
                  <th className="p-4 text-center">Shelves Count</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {aisles.map((a: any) => (
                  <tr key={a.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-bold text-indigo-600">{a.code}</td>
                    <td className="p-4 font-semibold text-slate-700">{a.zone}</td>
                    <td className="p-4 text-center font-bold text-slate-600">{a.rackCount}</td>
                    <td className="p-4 text-center font-bold text-slate-600">{a.shelfCount}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => setAisles(aisles.filter((item: any) => item.id !== a.id))} className="text-slate-300 hover:text-rose-600 cursor-pointer transition-colors"><Icons.Trash2 className="h-3.5 w-3.5 mx-auto" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 3. RACKS DIRECTORY TAB
// ----------------------------------------------------
export function RacksTab(_props?: any) {
  const [racks, setRacks] = useLocalStorage('axiom_wh_racks', [
    { id: 'r1', code: 'RC-01-A', aisle: 'AISLE-01', levels: 4, weightCapacity: '1.5 Tons', status: 'Active' },
    { id: 'r2', code: 'RC-01-B', aisle: 'AISLE-01', levels: 4, weightCapacity: '1.5 Tons', status: 'Active' },
    { id: 'r3', code: 'RC-02-A', aisle: 'AISLE-02', levels: 3, weightCapacity: '3.0 Tons', status: 'Active' },
  ]);
  const [code, setCode] = useState('');
  const [aisle, setAisle] = useState('AISLE-01');
  const [levels, setLevels] = useState(4);
  const [weightCapacity, setWeightCapacity] = useState('2.0 Tons');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setRacks([...racks, { id: 'r_' + Date.now(), code: code.toUpperCase(), aisle, levels, weightCapacity, status: 'Active' }]);
    setCode('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 font-display">Racks Directory</h2>
        <p className="text-xs text-slate-400 mt-1">Configure vertical pallet and pallet racking structures organized by physical aisle coordinates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleAdd} className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs h-fit">
          <h3 className="text-xs font-black text-slate-700 uppercase">Create Storage Rack</h3>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Rack Code</label>
            <input type="text" required placeholder="e.g. RC-01-C" value={code} onChange={e => setCode(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 font-mono text-indigo-600" />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Associated Aisle</label>
            <select value={aisle} onChange={e => setAisle(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50">
              <option value="AISLE-01">AISLE-01</option>
              <option value="AISLE-02">AISLE-02</option>
              <option value="AISLE-03">AISLE-03</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Vertical Levels</label>
              <input type="number" value={levels} onChange={e => setLevels(parseInt(e.target.value) || 1)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Max Weight</label>
              <input type="text" value={weightCapacity} onChange={e => setWeightCapacity(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50" />
            </div>
          </div>
          <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer">Register Rack</button>
        </form>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                  <th className="p-4">Rack Code</th>
                  <th className="p-4">Aisle Route</th>
                  <th className="p-4 text-center">Vertical Levels</th>
                  <th className="p-4">Max Weight Capacity</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {racks.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-bold text-indigo-600">{r.code}</td>
                    <td className="p-4 font-semibold text-slate-700">{r.aisle}</td>
                    <td className="p-4 text-center font-bold text-slate-600">{r.levels} tiers</td>
                    <td className="p-4 text-slate-600 font-semibold">{r.weightCapacity}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => setRacks(racks.filter((item: any) => item.id !== r.id))} className="text-slate-300 hover:text-rose-600 cursor-pointer transition-colors"><Icons.Trash2 className="h-3.5 w-3.5 mx-auto" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 4. SHELVES BINNING TAB
// ----------------------------------------------------
export function ShelvesTab(_props?: any) {
  const [shelves, setShelves] = useLocalStorage('axiom_wh_shelves', [
    { id: 'sh1', code: 'SH-01-L1', rack: 'RC-01-A', level: 1, utilization: '80%', status: 'Active' },
    { id: 'sh2', code: 'SH-01-L2', rack: 'RC-01-A', level: 2, utilization: '10%', status: 'Active' },
    { id: 'sh3', code: 'SH-02-L1', rack: 'RC-02-A', level: 1, utilization: '45%', status: 'Active' },
  ]);
  const [code, setCode] = useState('');
  const [rack, setRack] = useState('RC-01-A');
  const [level, setLevel] = useState(1);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setShelves([...shelves, { id: 'sh_' + Date.now(), code: code.toUpperCase(), rack, level, utilization: '0%', status: 'Active' }]);
    setCode('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 font-display">Shelves Binning</h2>
        <p className="text-xs text-slate-400 mt-1">Manage individual shelf tiers on warehouse storage racks to track direct layout density.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleAdd} className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs h-fit">
          <h3 className="text-xs font-black text-slate-700 uppercase">Create Shelf Directory</h3>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Shelf Locator Code</label>
            <input type="text" required placeholder="e.g. SH-01-L3" value={code} onChange={e => setCode(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 font-mono text-indigo-600" />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Parent Rack</label>
            <select value={rack} onChange={e => setRack(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50">
              <option value="RC-01-A">RC-01-A</option>
              <option value="RC-01-B">RC-01-B</option>
              <option value="RC-02-A">RC-02-A</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Tier Level Index</label>
            <input type="number" value={level} onChange={e => setLevel(parseInt(e.target.value) || 1)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50" />
          </div>
          <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer">Register Shelf</button>
        </form>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                  <th className="p-4">Shelf Code</th>
                  <th className="p-4">Rack Reference</th>
                  <th className="p-4 text-center">Tier Level</th>
                  <th className="p-4">Utilization Density</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shelves.map((sh: any) => (
                  <tr key={sh.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-bold text-indigo-600">{sh.code}</td>
                    <td className="p-4 font-semibold text-slate-700">{sh.rack}</td>
                    <td className="p-4 text-center font-bold text-slate-600">Level {sh.level}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full" style={{ width: sh.utilization }}></div>
                        </div>
                        <span className="font-mono text-[10px] font-black text-slate-600">{sh.utilization}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => setShelves(shelves.filter((item: any) => item.id !== sh.id))} className="text-slate-300 hover:text-rose-600 cursor-pointer transition-colors"><Icons.Trash2 className="h-3.5 w-3.5 mx-auto" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 5. BINS CONTROL TAB
// ----------------------------------------------------
export function BinsTab(_props?: any) {
  const [bins, setBins] = useLocalStorage('axiom_wh_bins', [
    { id: 'b1', code: 'BIN-101', shelf: 'SH-01-L1', capacity: '150 Liters', status: 'Allocated' },
    { id: 'b2', code: 'BIN-102', shelf: 'SH-01-L1', capacity: '150 Liters', status: 'Empty' },
    { id: 'b3', code: 'BIN-204', shelf: 'SH-02-L1', capacity: '300 Liters', status: 'Allocated' },
  ]);
  const [code, setCode] = useState('');
  const [shelf, setShelf] = useState('SH-01-L1');
  const [capacity, setCapacity] = useState('150 Liters');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setBins([...bins, { id: 'b_' + Date.now(), code: code.toUpperCase(), shelf, capacity, status: 'Empty' }]);
    setCode('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 font-display">Bins Control</h2>
        <p className="text-xs text-slate-400 mt-1">Audit individual micro-storage tubs and plastic containers assigned directly on specific shelves.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleAdd} className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs h-fit">
          <h3 className="text-xs font-black text-slate-700 uppercase">Create Storage Bin</h3>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Bin Locator Code</label>
            <input type="text" required placeholder="e.g. BIN-103" value={code} onChange={e => setCode(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 font-mono text-indigo-600" />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Parent Shelf Locator</label>
            <select value={shelf} onChange={e => setShelf(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50">
              <option value="SH-01-L1">SH-01-L1</option>
              <option value="SH-01-L2">SH-01-L2</option>
              <option value="SH-02-L1">SH-02-L1</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Internal Volume Capacity</label>
            <input type="text" value={capacity} onChange={e => setCapacity(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50" />
          </div>
          <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer">Register Bin</button>
        </form>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                  <th className="p-4">Bin Code</th>
                  <th className="p-4">Shelf Reference</th>
                  <th className="p-4">Volume Capacity</th>
                  <th className="p-4 text-center">Operational Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bins.map((bn: any) => (
                  <tr key={bn.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-bold text-indigo-600">{bn.code}</td>
                    <td className="p-4 font-semibold text-slate-700">{bn.shelf}</td>
                    <td className="p-4 font-semibold text-slate-600">{bn.capacity}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                        bn.status === 'Allocated' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      }`}>{bn.status}</span>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => setBins(bins.filter((item: any) => item.id !== bn.id))} className="text-slate-300 hover:text-rose-600 cursor-pointer transition-colors"><Icons.Trash2 className="h-3.5 w-3.5 mx-auto" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 6. ADJUSTMENT ENTRY TAB
// ----------------------------------------------------
export function AdjustmentTab({ products, onUpdateProducts }: WarehouseExtensionsProps) {
  const [logs, setLogs] = useLocalStorage<any[]>('axiom_stock_adjustments', [
    { id: 'adj1', date: '2026-07-08', product: 'Standard Premium cement', qty: -5, reason: 'Moisture Damage', operator: 'Rashedul Islam' },
    { id: 'adj2', date: '2026-07-10', product: 'Super Strength rebar', qty: 12, reason: 'Audit Reconciliation Surplus', operator: 'Farhana Yasmin' },
  ]);
  const [selectedProdId, setSelectedProdId] = useState(products[0]?.id || '');
  const [qty, setQty] = useState(0);
  const [reason, setReason] = useState('Audit Reconciliation Surplus');
  const [operator, setOperator] = useState('Farhana Yasmin');

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProdId || qty === 0) return;
    const prod = products.find(p => p.id === selectedProdId);
    if (!prod) return;

    // Update product stock reactively!
    if (onUpdateProducts) {
      const updated = products.map(p => {
        if (p.id === selectedProdId) {
          const newStock = Math.max(0, p.stock + qty);
          return { ...p, stock: newStock };
        }
        return p;
      });
      onUpdateProducts(updated);
    }

    setLogs([{
      id: 'adj_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      product: prod.name,
      qty,
      reason,
      operator
    }, ...logs]);

    setQty(0);
    alert(`Successfully applied adjustment of ${qty} units for ${prod.name}!`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 font-display">Stock Adjustment Ledger</h2>
        <p className="text-xs text-slate-400 mt-1">Reconcile physical stock discrepancies due to audit variance, theft, moisture damage, or spills.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleAdjust} className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs h-fit">
          <h3 className="text-xs font-black text-slate-700 uppercase">Apply Adjustment</h3>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Target Product</label>
            <select value={selectedProdId} onChange={e => setSelectedProdId(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50">
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku} | Stock: {p.stock})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Adjustment Quantity (use +/-)</label>
            <input type="number" required placeholder="e.g. -10 or 15" value={qty} onChange={e => setQty(parseInt(e.target.value) || 0)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 font-bold" />
            <span className="text-[10px] text-slate-400 block mt-1">Negative for shrinkage/loss, positive for surplus found.</span>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Adjustment Reason</label>
            <select value={reason} onChange={e => setReason(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50">
              <option value="Audit Reconciliation Surplus">Audit Reconciliation Surplus</option>
              <option value="Audit Reconciliation Shortage">Audit Reconciliation Shortage</option>
              <option value="Moisture Damage">Moisture Damage / Rust</option>
              <option value="Theft/Pilferage Logged">Theft / Pilferage Logged</option>
              <option value="Production Spill">Production Spill</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Authorizing Supervisor</label>
            <input type="text" required value={operator} onChange={e => setOperator(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50" />
          </div>
          <button type="submit" className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer">Reconcile Stock Ledger</button>
        </form>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 uppercase">Audit Logs</span>
              <button onClick={() => setLogs([])} className="text-[10px] font-bold text-rose-600 hover:underline">Clear Logs</button>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                  <th className="p-4">Date</th>
                  <th className="p-4">Product</th>
                  <th className="p-4 text-center">Delta Qty</th>
                  <th className="p-4">Reason Class</th>
                  <th className="p-4">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((l: any) => (
                  <tr key={l.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-semibold text-slate-400">{l.date}</td>
                    <td className="p-4 font-bold text-slate-700">{l.product}</td>
                    <td className="p-4 text-center">
                      <span className={`font-mono font-black ${l.qty < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {l.qty > 0 ? `+${l.qty}` : l.qty}
                      </span>
                    </td>
                    <td className="p-4"><span className="text-slate-600 font-semibold">{l.reason}</span></td>
                    <td className="p-4 text-slate-500 font-mono text-[11px]">{l.operator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 7. RESERVATION REGISTER TAB
// ----------------------------------------------------
export function ReservationTab({ products, onUpdateProducts }: WarehouseExtensionsProps) {
  const [reservations, setReservations] = useLocalStorage<any[]>('axiom_stock_reservations', [
    { id: 'res1', code: 'RES-9011', product: 'Standard Premium cement', qty: 50, customer: 'BuildCon Builders Ltd.', status: 'Active', expiry: '2026-08-11' },
    { id: 'res2', code: 'RES-4033', product: 'Super Strength rebar', qty: 200, customer: 'Lafarge Enterprise', status: 'Released', expiry: '2026-07-01' },
  ]);
  const [selectedProdId, setSelectedProdId] = useState(products[0]?.id || '');
  const [qty, setQty] = useState(1);
  const [customer, setCustomer] = useState('');
  const [expiry, setExpiry] = useState('2026-08-11');

  const handleReserve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProdId || !customer || qty <= 0) return;
    const prod = products.find(p => p.id === selectedProdId);
    if (!prod) return;

    if (prod.stock < qty) {
      alert(`Insufficient available stock! Physical stock is ${prod.stock} while reserving ${qty}.`);
      return;
    }

    // Reactively adjust allocated/reserved quantity of product!
    if (onUpdateProducts) {
      const updated = products.map(p => {
        if (p.id === selectedProdId) {
          const currentReserved = p.reservedQty || 0;
          return { ...p, reservedQty: currentReserved + qty };
        }
        return p;
      });
      onUpdateProducts(updated);
    }

    setReservations([{
      id: 'res_' + Date.now(),
      code: 'RES-' + Math.floor(1000 + Math.random() * 9000),
      product: prod.name,
      qty,
      customer,
      status: 'Active',
      expiry
    }, ...reservations]);

    setCustomer(''); setQty(1);
  };

  const handleRelease = (id: string, prodName: string, qtyToRelease: number) => {
    const targetProd = products.find(p => p.name === prodName);
    if (targetProd && onUpdateProducts) {
      const updated = products.map(p => {
        if (p.id === targetProd.id) {
          const currentReserved = p.reservedQty || 0;
          return { ...p, reservedQty: Math.max(0, currentReserved - qtyToRelease) };
        }
        return p;
      });
      onUpdateProducts(updated);
    }

    setReservations(reservations.map(res => {
      if (res.id === id) {
        return { ...res, status: 'Released' };
      }
      return res;
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 font-display">Reservation Register</h2>
        <p className="text-xs text-slate-400 mt-1">Reserve physical stock quantities for VIP contract accounts or pending sales orders to safeguard fulfillment.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleReserve} className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs h-fit">
          <h3 className="text-xs font-black text-slate-700 uppercase">Lock Stock Reservation</h3>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Target Product</label>
            <select value={selectedProdId} onChange={e => setSelectedProdId(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50">
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (Available: {p.stock - (p.reservedQty || 0)})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Reserved Quantity</label>
            <input type="number" required min="1" value={qty} onChange={e => setQty(parseInt(e.target.value) || 1)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50" />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Customer / Reference</label>
            <input type="text" required placeholder="e.g. Bashundhara Group" value={customer} onChange={e => setCustomer(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50" />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Reservation Hold Till</label>
            <input type="date" required value={expiry} onChange={e => setExpiry(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 font-mono" />
          </div>
          <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer">Activate Hold Lock</button>
        </form>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                  <th className="p-4">Hold Ref</th>
                  <th className="p-4">Product Catalog</th>
                  <th className="p-4">Locked Qty</th>
                  <th className="p-4">Account Reference</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.map((res: any) => (
                  <tr key={res.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-bold text-slate-400">{res.code}</td>
                    <td className="p-4 font-bold text-slate-700">{res.product}</td>
                    <td className="p-4 font-black text-indigo-600 font-mono">{res.qty} units</td>
                    <td className="p-4 text-slate-500 font-semibold">{res.customer}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                        res.status === 'Active' ? 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}>{res.status}</span>
                    </td>
                    <td className="p-4 text-center">
                      {res.status === 'Active' ? (
                        <button onClick={() => handleRelease(res.id, res.product, res.qty)} className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer">Release</button>
                      ) : (
                        <span className="text-[10px] text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 8. BATCH CONTROL TAB
// ----------------------------------------------------
export function BatchTab({ products }: WarehouseExtensionsProps) {
  const [batches, setBatches] = useLocalStorage<any[]>('axiom_stock_batches', [
    { id: 'bch1', code: 'BAT-202607-001', product: 'Standard Premium cement', qty: 850, mfgDate: '2026-07-01', expiryDate: '2026-10-01', status: 'Approved' },
    { id: 'bch2', code: 'BAT-202607-002', product: 'Super Strength rebar', qty: 1200, mfgDate: '2026-07-05', expiryDate: '2031-07-05', status: 'Approved' },
  ]);
  const [code, setCode] = useState('');
  const [selectedProd, setSelectedProd] = useState(products[0]?.name || '');
  const [qty, setQty] = useState(100);
  const [mfgDate, setMfgDate] = useState('2026-07-11');
  const [expiryDate, setExpiryDate] = useState('2026-10-11');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setBatches([...batches, { id: 'bch_' + Date.now(), code: code.toUpperCase(), product: selectedProd, qty, mfgDate, expiryDate, status: 'Approved' }]);
    setCode('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 font-display">Batch Control Registry</h2>
        <p className="text-xs text-slate-400 mt-1">Audit chemical properties, production lines, and physical manufacturing logs grouped by batch identifiers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleAdd} className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs h-fit">
          <h3 className="text-xs font-black text-slate-700 uppercase">Register Production Batch</h3>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Batch Run Code</label>
            <input type="text" required placeholder="e.g. BAT-202607-003" value={code} onChange={e => setCode(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 font-mono text-indigo-600" />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Product Association</label>
            <select value={selectedProd} onChange={e => setSelectedProd(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50">
              {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Batch Output Quantity</label>
            <input type="number" required value={qty} onChange={e => setQty(parseInt(e.target.value) || 0)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Mfg Date</label>
              <input type="date" required value={mfgDate} onChange={e => setMfgDate(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 font-mono" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Expiry Date</label>
              <input type="date" required value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 font-mono" />
            </div>
          </div>
          <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer">Approve Batch Output</button>
        </form>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                  <th className="p-4">Batch Code</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Batch Volume</th>
                  <th className="p-4">MFG / Expiry</th>
                  <th className="p-4">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batches.map((b: any) => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-bold text-indigo-600">{b.code}</td>
                    <td className="p-4 font-bold text-slate-700">{b.product}</td>
                    <td className="p-4 font-black text-slate-600 font-mono">{b.qty} units</td>
                    <td className="p-4">
                      <div className="text-[10px] text-slate-400 font-semibold">M: {b.mfgDate}</div>
                      <div className="text-[10px] font-bold text-amber-600">E: {b.expiryDate}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 border border-emerald-100 text-emerald-700">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 9. LOT ALLOCATIONS TAB
// ----------------------------------------------------
export function LotTab({ products }: WarehouseExtensionsProps) {
  const [lots, setLots] = useLocalStorage<any[]>('axiom_stock_lots', [
    { id: 'lot1', code: 'LOT-2026-A', product: 'Standard Premium cement', origin: 'Heidelberg Materials', cost: '$4,200', date: '2026-07-02', status: 'Allocated' },
    { id: 'lot2', code: 'LOT-2026-B', product: 'Super Strength rebar', origin: 'Siam Steel Corp', cost: '$18,500', date: '2026-07-06', status: 'In Transit' },
  ]);
  const [code, setCode] = useState('');
  const [selectedProd, setSelectedProd] = useState(products[0]?.name || '');
  const [origin, setOrigin] = useState('');
  const [cost, setCost] = useState('$5,000');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !origin) return;
    setLots([...lots, { id: 'lot_' + Date.now(), code: code.toUpperCase(), product: selectedProd, origin, cost, date: new Date().toISOString().split('T')[0], status: 'In Transit' }]);
    setCode(''); setOrigin('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 font-display">Lot Allocations Ledger</h2>
        <p className="text-xs text-slate-400 mt-1">Audit container lot assignments, country origins, customs clearances, and procurement landing costs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleAdd} className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs h-fit">
          <h3 className="text-xs font-black text-slate-700 uppercase">Create Lot Manifest</h3>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Lot Tracking Code</label>
            <input type="text" required placeholder="e.g. LOT-2026-C" value={code} onChange={e => setCode(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 font-mono text-indigo-600" />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Catalog Item</label>
            <select value={selectedProd} onChange={e => setSelectedProd(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50">
              {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Origin Country / Vendor</label>
            <input type="text" required placeholder="e.g. Heidelberg Materials" value={origin} onChange={e => setOrigin(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50" />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Landed Lot Cost ($)</label>
            <input type="text" required value={cost} onChange={e => setCost(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 font-mono text-emerald-600 font-bold" />
          </div>
          <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer">Ship Lot Manifest</button>
        </form>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                  <th className="p-4">Lot ID</th>
                  <th className="p-4">Allocated Product</th>
                  <th className="p-4">Origin Profile</th>
                  <th className="p-4 font-mono">Landed Cost</th>
                  <th className="p-4">Cargo Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lots.map((l: any) => (
                  <tr key={l.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-bold text-indigo-600">{l.code}</td>
                    <td className="p-4 font-bold text-slate-700">{l.product}</td>
                    <td className="p-4 font-semibold text-slate-500">{l.origin}</td>
                    <td className="p-4 font-mono text-slate-600 font-bold">{l.cost}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                        l.status === 'Allocated' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      }`}>{l.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 10. SERIAL TRACKERS TAB
// ----------------------------------------------------
export function SerialTab({ products }: WarehouseExtensionsProps) {
  const [serials, setSerials] = useLocalStorage<any[]>('axiom_stock_serials', [
    { id: 's1', serialNo: 'SN-MX9001-A901', product: 'Super Strength rebar', warehouse: 'Main Warehouse', status: 'In Stock' },
    { id: 's2', serialNo: 'SN-MX9001-A902', product: 'Super Strength rebar', warehouse: 'Main Warehouse', status: 'Sold' },
    { id: 's3', serialNo: 'SN-CEM80-AA01', product: 'Standard Premium cement', warehouse: 'Yard A', status: 'In Stock' },
  ]);
  const [sn, setSn] = useState('');
  const [selectedProd, setSelectedProd] = useState(products[0]?.name || '');
  const [wh, setWh] = useState('Main Warehouse');
  const [query, setQuery] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sn) return;
    setSerials([...serials, { id: 's_' + Date.now(), serialNo: sn.toUpperCase(), product: selectedProd, warehouse: wh, status: 'In Stock' }]);
    setSn('');
  };

  const filtered = serials.filter(s => s.serialNo.toLowerCase().includes(query.toLowerCase()) || s.product.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 font-display">Serial Trackers</h2>
        <p className="text-xs text-slate-400 mt-1">Audit unique serialization assignments for premium machinery, electronics, and precision assets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleAdd} className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs h-fit">
          <h3 className="text-xs font-black text-slate-700 uppercase">Lock Serial Assignment</h3>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Unique Serial Number (S/N)</label>
            <input type="text" required placeholder="e.g. SN-K908-A1" value={sn} onChange={e => setSn(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 font-mono text-indigo-600" />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Catalog Item</label>
            <select value={selectedProd} onChange={e => setSelectedProd(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50">
              {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Warehouse Location</label>
            <select value={wh} onChange={e => setWh(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50">
              <option value="Main Warehouse">Main Warehouse</option>
              <option value="Yard A">Yard A</option>
              <option value="Yard B">Yard B</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer">Register S/N</button>
        </form>

        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Icons.Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search S/N registry or item..." value={query} onChange={e => setQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none" />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                  <th className="p-4">Serial Number (S/N)</th>
                  <th className="p-4">Associated Catalog Product</th>
                  <th className="p-4">Location</th>
                  <th className="p-4 text-center">Lifecycle Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-bold text-indigo-600">{s.serialNo}</td>
                    <td className="p-4 font-bold text-slate-700">{s.product}</td>
                    <td className="p-4 font-semibold text-slate-400">{s.warehouse}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                        s.status === 'In Stock' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 11. EXPIRY ALERTS TAB
// ----------------------------------------------------
export function ExpiryTab(_props?: any) {
  const [alerts] = useState([
    { id: 'exp1', product: 'Standard Premium cement', batch: 'BAT-202607-001', expiryDate: '2026-08-11', daysLeft: 31, status: 'Critical Action' },
    { id: 'exp2', product: 'Chemical Admixtures C1', batch: 'BAT-202604-099', expiryDate: '2026-07-01', daysLeft: -10, status: 'Expired' },
    { id: 'exp3', product: 'Standard Fastener Screws', batch: 'BAT-202606-112', expiryDate: '2026-12-25', daysLeft: 167, status: 'Healthy' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="p-2 bg-rose-50 rounded-xl text-rose-500"><Icons.CalendarDays className="h-6 w-6" /></span>
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-display">Expiry & Shelf-Life Radar</h2>
          <p className="text-xs text-slate-400 mt-1">Direct chronological audit of raw materials, chemical compounds, and batches approaching expiry.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-rose-700 font-extrabold text-xs uppercase"><Icons.AlertCircle className="h-4 w-4" /> Expired Master Stocks</div>
          <p className="text-2xl font-black text-slate-800 mt-3 font-mono">1 Lot Row</p>
          <span className="text-[10px] text-slate-400 block mt-1">Requires immediate physical quarantine and audit disposal.</span>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-amber-700 font-extrabold text-xs uppercase"><Icons.Info className="h-4 w-4" /> Expiring in 30 Days</div>
          <p className="text-2xl font-black text-slate-800 mt-3 font-mono">1 Batch Run</p>
          <span className="text-[10px] text-slate-400 block mt-1">Flags active discount campaign routing in order book.</span>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-xs uppercase"><Icons.CheckCircle className="h-4 w-4" /> Long Life / Healthy</div>
          <p className="text-2xl font-black text-slate-800 mt-3 font-mono">15+ SKUs</p>
          <span className="text-[10px] text-slate-400 block mt-1">Optimal structural status. Standard holding cycles.</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
              <th className="p-4">Target Product</th>
              <th className="p-4">Batch Coordinate</th>
              <th className="p-4 font-mono">Expiration Date</th>
              <th className="p-4">Countdown Threshold</th>
              <th className="p-4">Radar Warning</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {alerts.map((a: any) => (
              <tr key={a.id} className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-700">{a.product}</td>
                <td className="p-4 font-mono font-bold text-indigo-600">{a.batch}</td>
                <td className="p-4 font-mono text-slate-600 font-bold">{a.expiryDate}</td>
                <td className="p-4">
                  <span className={`font-bold font-mono ${a.daysLeft < 0 ? 'text-rose-600' : a.daysLeft <= 30 ? 'text-amber-500' : 'text-emerald-600'}`}>
                    {a.daysLeft < 0 ? `EXPIRED (${Math.abs(a.daysLeft)} days ago)` : `${a.daysLeft} days remaining`}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                    a.status === 'Expired' ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse' :
                    a.status === 'Critical Action' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                    'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}>{a.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 12. QR GENERATOR TAB
// ----------------------------------------------------
export function QrGeneratorTab({ products }: WarehouseExtensionsProps) {
  const [selectedProd, setSelectedProd] = useState(products[0]?.id || '');
  const [size, setSize] = useState('150x150');
  const [labelColor, setLabelColor] = useState('#4f46e5');

  const activeProduct = products.find(p => p.id === selectedProd);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 font-display">Scan-Ready QR Label Studio</h2>
        <p className="text-xs text-slate-400 mt-1">Configure layout, brand color pairing, and render downloadable/printable QR codes for bins and packages.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs">
          <h3 className="text-xs font-black text-slate-700 uppercase">Label Layout Configuration</h3>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Catalog Product</label>
            <select value={selectedProd} onChange={e => setSelectedProd(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50">
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Dimensions (PX)</label>
            <select value={size} onChange={e => setSize(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50">
              <option value="150x150">150 x 150 (Micro Label)</option>
              <option value="300x300">300 x 300 (Standard Carton)</option>
              <option value="600x600">600 x 600 (Pallet Tag)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Theme Accent Color</label>
            <input type="color" value={labelColor} onChange={e => setLabelColor(e.target.value)} className="w-full h-8 border border-slate-200 rounded-lg p-1 bg-slate-50" />
          </div>
          <button onClick={() => window.print()} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1">
            <Icons.Printer className="h-4 w-4" /> Print Label Batch
          </button>
        </div>

        <div className="lg:col-span-2 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-8">
          {activeProduct ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4 shadow-sm w-80">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 font-mono">AXIOM RFID MASTER</span>
              <div className="mx-auto flex items-center justify-center border-4 rounded-xl p-4" style={{ borderColor: labelColor }}>
                <svg className="w-36 h-36 text-slate-800" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2M3 15h6v6H3v-6zm2 2v2h2v-2H5zm13-2h3v2h-3v-2zm-3 3h3v3h-3v-3zm3 0h3v3h-3v-3zM13 13h2v2h-2v-2zm4 0h3v2h-3v-2zm-2 4h2v2h-2v-2zm-4 2h2v2h-2v-2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 font-display">{activeProduct.name}</h4>
                <p className="text-[10px] font-mono text-slate-400 mt-1">SKU: {activeProduct.sku} | Cost: ${activeProduct.cost}</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <span className="text-[8px] font-black uppercase text-slate-400 bg-slate-50 border px-2 py-0.5 rounded">QR Level L</span>
                  <span className="text-[8px] font-black uppercase text-slate-400 bg-slate-50 border px-2 py-0.5 rounded">{size} px</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400">Select a catalog product to render scan label</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 13. INVENTORY VALUATION TAB
// ----------------------------------------------------
export function ValuationTab({ products }: WarehouseExtensionsProps) {
  // Analytical Computations
  const totalStockCount = useMemo(() => products.reduce((acc, p) => acc + p.stock, 0), [products]);
  const totalCostValuation = useMemo(() => products.reduce((acc, p) => acc + p.stock * p.cost, 0), [products]);
  const totalSalesValuation = useMemo(() => products.reduce((acc, p) => acc + p.stock * p.price, 0), [products]);
  const profitMargin = useMemo(() => totalSalesValuation - totalCostValuation, [totalSalesValuation, totalCostValuation]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-display">Inventory Valuation</h2>
          <p className="text-xs text-slate-400 mt-1">Real-time valuation dashboard comparing asset values, slow-moving items, and stock turns.</p>
        </div>
        <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl uppercase tracking-wider font-mono">Live Sync: Active</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
          <span className="text-slate-400 block text-[9px] uppercase font-black">Stock On-Hand Volume</span>
          <p className="text-2xl font-black text-slate-800 mt-2 font-mono">{totalStockCount.toLocaleString()} units</p>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
            <span className="font-semibold text-indigo-600">100% active physical</span> catalog listings
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
          <span className="text-slate-400 block text-[9px] uppercase font-black">Total Landed Asset Cost</span>
          <p className="text-2xl font-black text-emerald-600 mt-2 font-mono">${totalCostValuation.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
            Weighted Average cost basis
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
          <span className="text-slate-400 block text-[9px] uppercase font-black">Potential Market Revenue</span>
          <p className="text-2xl font-black text-indigo-600 mt-2 font-mono">${totalSalesValuation.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
            Standard MSRP pricing limits
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
          <span className="text-slate-400 block text-[9px] uppercase font-black">Unrealized Profit Margin</span>
          <p className="text-2xl font-black text-indigo-600 mt-2 font-mono">${profitMargin.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-1">
            + {totalCostValuation > 0 ? ((profitMargin / totalCostValuation) * 100).toFixed(1) : 0}% potential yield
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-xs font-black text-slate-700 uppercase">Valuation Comparison by Catalog Row</h3>
          <div className="space-y-4">
            {products.map(p => {
              const itemCostVal = p.stock * p.cost;
              const barWidthPct = totalCostValuation > 0 ? (itemCostVal / totalCostValuation) * 100 : 0;
              return (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">{p.name} <span className="text-[10px] font-mono text-slate-400 font-normal">({p.sku})</span></span>
                    <span className="font-mono font-bold text-slate-600">${itemCostVal.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex items-center">
                    <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(2, barWidthPct)}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-xs font-black text-slate-700 uppercase">Carrying Cost Matrix</h3>
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-[9px] font-black text-slate-400 uppercase">Estimated Holding Cost (20%/yr)</span>
              <p className="text-lg font-bold text-slate-700 font-mono">${(totalCostValuation * 0.2).toLocaleString()}</p>
              <span className="text-[10px] text-slate-400 block mt-1">Includes warehouse space leases, insurance, and interest losses.</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-[9px] font-black text-slate-400 uppercase">Avg Holding Cycle Period</span>
              <p className="text-lg font-bold text-slate-700 font-mono">42 Days</p>
              <span className="text-[10px] text-slate-400 block mt-1">Standard turnover duration from dock to customer receipt.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
