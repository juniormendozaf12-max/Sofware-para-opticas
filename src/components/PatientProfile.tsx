import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Phone, FilePlus, Eye, Printer, Loader2, MapPin, Calendar, Star,
  ClipboardList, Activity, ShoppingBag, Receipt, FileText, ChevronDown, ChevronUp,
  RefreshCw, Save, X, Edit3, Check, Download,
} from 'lucide-react';
import type { Patient, Prescription, Consultation, Sale, EyeRx } from '../types';
import {
  getPatient, fetchPrescriptions, fetchConsultations, fetchSalesForPatient,
  printPrescription, printSaleTicket, printSaleNote, sendRxWhatsApp, sendTicketWhatsApp,
  downloadRxPdf, downloadTicketPdf, onDataChange,
  updatePatient, createPrescription,
} from '../lib/services';
import { WhatsAppIcon } from './ui/whatsapp-icon';
import { formatDate, formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function PatientProfile() {
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [history, setHistory] = useState<Consultation[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSale, setExpandedSale] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rx' | 'sales' | 'consults'>('rx');
  const [realtimeFlash, setRealtimeFlash] = useState(false);

  // Edit patient
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', dni: '', phone: '', address: '', birthDate: '' });
  const [editSaving, setEditSaving] = useState(false);

  // New Prescription form
  const [showRxForm, setShowRxForm] = useState(false);
  const [rxForm, setRxForm] = useState({
    odSph: 0, odCyl: 0, odAxis: 0, odAdd: 0,
    oiSph: 0, oiCyl: 0, oiAxis: 0, oiAdd: 0,
    dip: 0, lensType: '', optometrist: '',
  });
  const [rxSaving, setRxSaving] = useState(false);

  // Reload sales silently (for realtime updates)
  const refreshSales = useCallback(async () => {
    if (!id) return;
    const fresh = await fetchSalesForPatient(id);
    setSales(fresh);
    // Flash indicator
    setRealtimeFlash(true);
    setTimeout(() => setRealtimeFlash(false), 1500);
  }, [id]);

  // Reload prescriptions silently
  const refreshRx = useCallback(async () => {
    if (!id) return;
    const fresh = await fetchPrescriptions(id);
    setPrescriptions(fresh);
    setRealtimeFlash(true);
    setTimeout(() => setRealtimeFlash(false), 1500);
  }, [id]);

  // Initial load
  useEffect(() => {
    if (!id || id === 'new') return;
    let cancelled = false;

    const load = async () => {
      const [p, rxs, consults, patientSales] = await Promise.all([
        getPatient(id),
        fetchPrescriptions(id),
        fetchConsultations(id),
        fetchSalesForPatient(id),
      ]);
      if (cancelled) return;
      setPatient(p);
      setPrescriptions(rxs);
      setHistory(consults);
      setSales(patientSales);
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  // Realtime subscriptions — auto-refresh when desktop software changes data
  useEffect(() => {
    if (!id) return;
    const unsubs = [
      onDataChange('ventas', refreshSales),
      onDataChange('medidas', refreshRx),
    ];
    return () => unsubs.forEach(fn => fn());
  }, [id, refreshSales, refreshRx]);

  const latestRX = prescriptions[0] || null;

  const salesTotals = useMemo(() => {
    const completed = sales.filter(s => s.status === 'completed');
    return {
      count: completed.length,
      total: completed.reduce((sum, s) => sum + s.total, 0),
    };
  }, [sales]);

  const handlePrintRx = (rx: Prescription) => {
    if (!patient) return;
    printPrescription(patient, rx);
  };

  const handleWhatsAppRx = (rx: Prescription) => {
    if (!patient) return;
    sendRxWhatsApp(patient, rx).catch(e => console.error('[WhatsApp RX]', e));
  };

  const handlePrintTicket = (sale: Sale) => {
    printSaleTicket(sale, patient);
  };

  const handlePrintNote = (sale: Sale) => {
    printSaleNote(sale, patient, latestRX);
  };

  const handleCall = () => {
    if (patient?.phone) window.open(`tel:${patient.phone}`, '_self');
  };

  const startEditing = () => {
    if (!patient) return;
    setEditForm({
      name: patient.name,
      dni: patient.dni,
      phone: patient.phone || '',
      address: patient.address || '',
      birthDate: patient.birthDate || '',
    });
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!patient || !editForm.name.trim()) return;
    setEditSaving(true);
    try {
      await updatePatient(patient.id, {
        name: editForm.name.trim(),
        dni: editForm.dni.trim(),
        phone: editForm.phone.trim() || undefined,
        address: editForm.address.trim() || undefined,
        birthDate: editForm.birthDate || undefined,
      });
      setPatient(prev => prev ? { ...prev, ...editForm, name: editForm.name.trim(), dni: editForm.dni.trim() } : prev);
      setEditing(false);
    } catch (err) {
      console.error('Error updating patient:', err);
    } finally {
      setEditSaving(false);
    }
  };

  const handleSaveRx = async () => {
    if (!patient) return;
    setRxSaving(true);
    try {
      const od: EyeRx = { sph: rxForm.odSph, cyl: rxForm.odCyl, axis: rxForm.odAxis, add: rxForm.odAdd };
      const oi: EyeRx = { sph: rxForm.oiSph, cyl: rxForm.oiCyl, axis: rxForm.oiAxis, add: rxForm.oiAdd };
      await createPrescription(patient.id, {
        od, oi, dip: rxForm.dip,
        lensType: rxForm.lensType || undefined,
        optometrist: rxForm.optometrist || undefined,
      });
      const fresh = await fetchPrescriptions(patient.id);
      setPrescriptions(fresh);
      setShowRxForm(false);
      setRxForm({ odSph: 0, odCyl: 0, odAxis: 0, odAdd: 0, oiSph: 0, oiCyl: 0, oiAxis: 0, oiAdd: 0, dip: 0, lensType: '', optometrist: '' });
    } catch (err) {
      console.error('Error saving prescription:', err);
    } finally {
      setRxSaving(false);
    }
  };

  const fv = (v: number) => (v >= 0 ? '+' : '') + v.toFixed(2);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="animate-spin text-accent" size={32} />
      <span className="text-sm text-on-surface-variant">Cargando perfil...</span>
    </div>
  );
  if (!patient) return <div className="p-12 text-center text-on-surface-variant">Paciente no encontrado.</div>;

  return (
    <div className="space-y-5 pb-12">
      {/* ── Patient Hero ── */}
      <section className="relative pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-divider"
        >
          <div className="absolute -top-5 left-6 w-20 h-20 rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-accent-light flex items-center justify-center">
            {patient.photoURL ? (
              <img src={patient.photoURL} alt={patient.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-headline font-bold text-accent">
                {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            )}
          </div>

          <div className="mt-12">
            {editing ? (
              /* ── Edit Patient Form ── */
              <div className="space-y-3">
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-surface-container rounded-xl py-3 px-4 font-body text-on-surface text-sm outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="Nombre completo"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={editForm.dni}
                    onChange={(e) => setEditForm(f => ({ ...f, dni: e.target.value }))}
                    className="bg-surface-container rounded-xl py-3 px-4 font-body text-on-surface text-sm outline-none focus:ring-2 focus:ring-accent/20"
                    placeholder="DNI"
                  />
                  <input
                    value={editForm.phone}
                    onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))}
                    className="bg-surface-container rounded-xl py-3 px-4 font-body text-on-surface text-sm outline-none focus:ring-2 focus:ring-accent/20"
                    placeholder="Telefono"
                    type="tel"
                  />
                </div>
                <input
                  value={editForm.address}
                  onChange={(e) => setEditForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full bg-surface-container rounded-xl py-3 px-4 font-body text-on-surface text-sm outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="Direccion"
                />
                <input
                  value={editForm.birthDate}
                  onChange={(e) => setEditForm(f => ({ ...f, birthDate: e.target.value }))}
                  className="w-full bg-surface-container rounded-xl py-3 px-4 font-body text-on-surface text-sm outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="Fecha nacimiento"
                  type="date"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 py-3 rounded-xl bg-surface-container text-on-surface-variant font-semibold text-sm active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={editSaving || !editForm.name.trim()}
                    className="flex-1 py-3 rounded-xl bg-accent text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
                  >
                    {editSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Guardar
                  </button>
                </div>
              </div>
            ) : (
              /* ── Patient Info Display ── */
              <>
                <div className="flex items-center gap-2">
                  <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">{patient.name}</h1>
                  {patient.isVIP && <Star size={18} className="text-amber-500 fill-amber-500" />}
                  <button onClick={startEditing} className="ml-auto p-2 text-on-surface-variant hover:text-accent rounded-lg hover:bg-surface-container transition-colors">
                    <Edit3 size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-on-surface-variant">
                  {patient.dni && <span>DNI: <b className="text-on-surface">{patient.dni}</b></span>}
                  {patient.phone && <span className="flex items-center gap-1"><Phone size={12} /> {patient.phone}</span>}
                  {patient.address && <span className="flex items-center gap-1"><MapPin size={12} /> {patient.address}</span>}
                  {patient.birthDate && <span className="flex items-center gap-1"><Calendar size={12} /> {patient.birthDate}</span>}
                </div>
              </>
            )}

            {/* Quick stats */}
            <div className="flex gap-2 mt-4 flex-wrap">
              <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-xl">
                <Eye size={14} className="text-accent" />
                <span className="text-xs font-bold text-accent">{prescriptions.length} RX</span>
              </div>
              <div className="flex items-center gap-1.5 bg-secondary/5 px-3 py-1.5 rounded-xl">
                <ClipboardList size={14} className="text-secondary" />
                <span className="text-xs font-bold text-secondary">{history.length} Consultas</span>
              </div>
              <div className="flex items-center gap-1.5 bg-green-500/5 px-3 py-1.5 rounded-xl">
                <ShoppingBag size={14} className="text-green-600" />
                <span className="text-xs font-bold text-green-600">
                  {salesTotals.count} Ventas &bull; {formatCurrency(salesTotals.total)}
                </span>
              </div>
              {realtimeFlash && (
                <div className="flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1.5 rounded-xl animate-pulse">
                  <RefreshCw size={12} className="text-emerald-600 animate-spin" />
                  <span className="text-[10px] font-bold text-emerald-600">Actualizado</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-5">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCall}
                disabled={!patient.phone}
                className="flex-1 bg-surface-container py-3 rounded-xl flex items-center justify-center gap-2 text-on-surface hover:bg-divider transition-colors disabled:opacity-40 shadow-sm"
              >
                <Phone size={18} className="text-accent" />
                <span className="font-label text-sm font-semibold">Llamar</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowRxForm(!showRxForm)}
                className="flex-1 bg-primary text-on-primary py-3 rounded-xl flex items-center justify-center gap-2 shadow-md"
              >
                <FilePlus size={18} />
                <span className="font-label text-sm font-semibold">Nueva RX</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── New Prescription Form ── */}
      <AnimatePresence>
        {showRxForm && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-accent/30 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-headline font-bold text-on-surface text-base flex items-center gap-2">
                  <Eye size={18} className="text-accent" />
                  Nueva Prescripcion
                </h2>
                <button onClick={() => setShowRxForm(false)} className="text-on-surface-variant hover:text-error p-1">
                  <X size={18} />
                </button>
              </div>

              {/* OD */}
              <div className="space-y-2">
                <span className="text-xs font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-lg">OD — Ojo Derecho</span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Esf', key: 'odSph' as const, step: 0.25 },
                    { label: 'Cil', key: 'odCyl' as const, step: 0.25 },
                    { label: 'Eje', key: 'odAxis' as const, step: 1 },
                    { label: 'Add', key: 'odAdd' as const, step: 0.25 },
                  ].map(({ label, key, step }) => (
                    <div key={key} className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase text-center block">{label}</label>
                      <input
                        type="number"
                        step={step}
                        value={rxForm[key] || ''}
                        onChange={(e) => setRxForm(f => ({ ...f, [key]: parseFloat(e.target.value) || 0 }))}
                        className="w-full bg-surface-container rounded-xl py-2.5 px-2 text-center text-sm font-bold tabular-nums outline-none focus:ring-2 focus:ring-accent/20"
                        placeholder="0.00"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* OI */}
              <div className="space-y-2">
                <span className="text-xs font-black text-teal-600 bg-teal-100 px-2 py-0.5 rounded-lg">OI — Ojo Izquierdo</span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Esf', key: 'oiSph' as const, step: 0.25 },
                    { label: 'Cil', key: 'oiCyl' as const, step: 0.25 },
                    { label: 'Eje', key: 'oiAxis' as const, step: 1 },
                    { label: 'Add', key: 'oiAdd' as const, step: 0.25 },
                  ].map(({ label, key, step }) => (
                    <div key={key} className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase text-center block">{label}</label>
                      <input
                        type="number"
                        step={step}
                        value={rxForm[key] || ''}
                        onChange={(e) => setRxForm(f => ({ ...f, [key]: parseFloat(e.target.value) || 0 }))}
                        className="w-full bg-surface-container rounded-xl py-2.5 px-2 text-center text-sm font-bold tabular-nums outline-none focus:ring-2 focus:ring-accent/20"
                        placeholder="0.00"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* DIP + Lens Type + Optometrist */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase text-center block">DIP</label>
                  <input
                    type="number"
                    step={1}
                    value={rxForm.dip || ''}
                    onChange={(e) => setRxForm(f => ({ ...f, dip: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-surface-container rounded-xl py-2.5 px-2 text-center text-sm font-bold tabular-nums outline-none focus:ring-2 focus:ring-accent/20"
                    placeholder="63"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase block">Tipo lente</label>
                  <input
                    type="text"
                    value={rxForm.lensType}
                    onChange={(e) => setRxForm(f => ({ ...f, lensType: e.target.value }))}
                    className="w-full bg-surface-container rounded-xl py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                    placeholder="Monofocal, Bifocal..."
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase block">Optometrista</label>
                <input
                  type="text"
                  value={rxForm.optometrist}
                  onChange={(e) => setRxForm(f => ({ ...f, optometrist: e.target.value }))}
                  className="w-full bg-surface-container rounded-xl py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="Dr. / Dra."
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSaveRx}
                disabled={rxSaving}
                className="w-full py-3.5 rounded-2xl bg-accent text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.12)] disabled:opacity-60"
              >
                {rxSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                Guardar Prescripcion
              </motion.button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Latest RX Card ── */}
      {latestRX && (
        <section className="space-y-3">
          <div className="flex justify-between items-center px-2">
            <h2 className="font-headline text-lg font-bold text-on-surface">Ultima Prescripcion</h2>
            <span className="text-xs font-label bg-accent-light text-accent px-3 py-1 rounded-full font-bold">
              {formatDate(latestRX.date)}
            </span>
          </div>
          <div className="flex gap-2 px-2">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => handlePrintRx(latestRX)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-surface-container rounded-xl text-xs font-bold text-on-surface hover:bg-divider transition-colors active:scale-95"
              title="Imprimir RX"
            >
              <Printer size={14} className="text-accent" /> Imprimir
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => downloadRxPdf(patient!, latestRX)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-secondary/10 rounded-xl text-xs font-bold text-secondary hover:bg-secondary/20 transition-colors active:scale-95"
              title="Descargar PDF"
            >
              <Download size={14} /> PDF
            </motion.button>
            {patient?.phone && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => handleWhatsAppRx(latestRX)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#25D366]/10 rounded-xl text-xs font-bold text-[#25D366] hover:bg-[#25D366]/20 transition-colors active:scale-95"
                title="Enviar RX por WhatsApp"
              >
                <WhatsAppIcon size={14} /> WhatsApp
              </motion.button>
            )}
          </div>

          <div className="bg-surface-container rounded-2xl p-1 overflow-hidden">
            <div className="grid grid-cols-6 gap-1 p-2 text-center text-[10px] font-bold tracking-widest uppercase text-on-surface-variant opacity-60">
              <div className="text-left pl-4">OJO</div>
              <div>ESF</div>
              <div>CIL</div>
              <div>EJE</div>
              <div>ADD</div>
              <div>DIP</div>
            </div>
            <div className="bg-white rounded-2xl m-1 p-4 grid grid-cols-6 items-center text-center">
              <div className="text-left font-headline font-extrabold text-accent">OD</div>
              <div className="font-body text-lg font-medium text-on-surface">{fv(latestRX.od.sph)}</div>
              <div className="font-body text-lg font-medium text-on-surface">{fv(latestRX.od.cyl)}</div>
              <div className="font-body text-lg font-medium text-on-surface">{latestRX.od.axis}&deg;</div>
              <div className="font-body text-lg font-medium text-on-surface">{fv(latestRX.od.add)}</div>
              <div className="row-span-2 flex items-center justify-center">
                <span className="font-body text-xl font-bold text-on-surface">{latestRX.dip}</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl m-1 p-4 grid grid-cols-6 items-center text-center">
              <div className="text-left font-headline font-extrabold text-secondary">OI</div>
              <div className="font-body text-lg font-medium text-on-surface">{fv(latestRX.oi.sph)}</div>
              <div className="font-body text-lg font-medium text-on-surface">{fv(latestRX.oi.cyl)}</div>
              <div className="font-body text-lg font-medium text-on-surface">{latestRX.oi.axis}&deg;</div>
              <div className="font-body text-lg font-medium text-on-surface">{fv(latestRX.oi.add)}</div>
            </div>
            {latestRX.lensType && (
              <div className="px-4 py-2 text-xs text-on-surface-variant">
                <b className="text-accent">Tipo:</b> {latestRX.lensType}
                {latestRX.optometrist && <> &bull; <b className="text-accent">Esp:</b> {latestRX.optometrist}</>}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Tab Navigator ── */}
      <div className="flex bg-surface-container rounded-2xl p-1 gap-1">
        {([
          { key: 'rx' as const, label: 'RX', icon: Eye, count: prescriptions.length },
          { key: 'sales' as const, label: 'Ventas', icon: ShoppingBag, count: sales.length },
          { key: 'consults' as const, label: 'Consultas', icon: Activity, count: history.length },
        ]).map(tab => (
          <motion.button
            key={tab.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all relative',
              activeTab === tab.key
                ? 'bg-white text-accent shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            )}
          >
            <tab.icon size={15} />
            {tab.label}
            {tab.count > 0 && (
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                activeTab === tab.key ? 'bg-accent-light text-accent' : 'bg-divider text-on-surface-variant'
              )}>
                {tab.count}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* ── RX History Tab ── */}
      {activeTab === 'rx' && (
        <section className="space-y-2">
          {prescriptions.length > 0 ? prescriptions.map((rx) => (
            <div key={rx.id} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-divider">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-on-surface">
                  OD: {fv(rx.od.sph)} {fv(rx.od.cyl)} / OI: {fv(rx.oi.sph)} {fv(rx.oi.cyl)}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {rx.lensType || 'Sin tipo'} &bull; DIP: {rx.dip} &bull; {formatDate(rx.date)}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handlePrintRx(rx)}
                  className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-accent hover:bg-divider transition-colors"
                  title="Imprimir RX"
                >
                  <Printer size={14} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => downloadRxPdf(patient!, rx)}
                  className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary hover:bg-secondary/20 transition-colors"
                  title="Descargar PDF"
                >
                  <Download size={14} />
                </motion.button>
                {patient?.phone && (
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleWhatsAppRx(rx)}
                    className="w-8 h-8 rounded-lg bg-[#25D366]/10 flex items-center justify-center text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                    title="Enviar RX por WhatsApp"
                  >
                    <WhatsAppIcon size={14} />
                  </motion.button>
                )}
              </div>
            </div>
          )) : (
            <div className="p-8 text-center text-on-surface-variant bg-surface-container rounded-2xl">
              Sin prescripciones registradas.
            </div>
          )}
        </section>
      )}

      {/* ── Sales Tab ── */}
      {activeTab === 'sales' && (
        <section className="space-y-2">
          {sales.length > 0 ? sales.map((sale) => {
            const isExpanded = expandedSale === sale.id;
            const statusColor = sale.status === 'completed' ? 'text-green-600 bg-green-50'
              : sale.status === 'pending' ? 'text-amber-600 bg-amber-50'
              : 'text-red-600 bg-red-50';
            const statusLabel = sale.status === 'completed' ? 'Pagado'
              : sale.status === 'pending' ? 'Pendiente' : 'Cancelado';

            return (
              <div key={sale.id} className="bg-white rounded-2xl overflow-hidden border border-divider">
                {/* Sale header */}
                <button
                  onClick={() => setExpandedSale(isExpanded ? null : sale.id)}
                  className="w-full p-4 flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                    <Receipt size={18} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-on-surface truncate">
                        {sale.items.map(i => i.productName).join(', ') || 'Venta'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-on-surface-variant">{formatDate(sale.date)}</span>
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-bold', statusColor)}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-on-surface">{formatCurrency(sale.total)}</p>
                    {isExpanded ? <ChevronUp size={14} className="text-on-surface-variant ml-auto mt-1" /> : <ChevronDown size={14} className="text-on-surface-variant ml-auto mt-1" />}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-divider">
                    {/* Items */}
                    <div className="mt-3 space-y-1">
                      {sale.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-on-surface">
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="text-on-surface font-medium">{formatCurrency(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="mt-2 pt-2 border-t border-divider space-y-0.5">
                      {sale.discount > 0 && (
                        <>
                          <div className="flex justify-between text-xs text-on-surface-variant">
                            <span>Subtotal</span>
                            <span>{formatCurrency(sale.subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-red-500">
                            <span>Descuento</span>
                            <span>-{formatCurrency(sale.discount)}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between text-sm font-bold text-on-surface">
                        <span>Total</span>
                        <span>{formatCurrency(sale.total)}</span>
                      </div>
                      {(sale.abono != null && sale.abono > 0 && sale.abono < sale.total) && (
                        <>
                          <div className="flex justify-between text-xs text-success">
                            <span>A cuenta</span>
                            <span>{formatCurrency(sale.abono)}</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold text-error">
                            <span>Saldo</span>
                            <span>{formatCurrency(sale.saldo ?? (sale.total - sale.abono))}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-on-surface-variant">
                      {sale.sellerName && <span>Vendedor: <b>{sale.sellerName}</b></span>}
                      {sale.documentNumber && <span>Doc: <b>{sale.documentNumber}</b></span>}
                      {sale.paymentMethod && <span>Pago: <b>{sale.paymentMethod}</b></span>}
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePrintTicket(sale)}
                        className="flex items-center justify-center gap-1.5 py-2.5 bg-surface-container rounded-xl text-xs font-bold text-on-surface hover:bg-divider transition-colors"
                      >
                        <Receipt size={14} className="text-accent" />
                        Ticket
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePrintNote(sale)}
                        className="flex items-center justify-center gap-1.5 py-2.5 bg-surface-container rounded-xl text-xs font-bold text-on-surface hover:bg-divider transition-colors"
                      >
                        <FileText size={14} className="text-accent" />
                        Nota
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => downloadTicketPdf(sale, patient)}
                        className="flex items-center justify-center gap-1.5 py-2.5 bg-secondary/10 rounded-xl text-xs font-bold text-secondary hover:bg-secondary/20 transition-colors"
                      >
                        <Download size={14} />
                        PDF
                      </motion.button>
                      {sale.patientName && patient?.phone && (
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => sendTicketWhatsApp(sale, patient).catch(e => console.error('[WhatsApp]', e))}
                          className="flex items-center justify-center gap-1.5 py-2.5 bg-[#25D366]/10 rounded-xl text-xs font-bold text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                        >
                          <WhatsAppIcon size={14} />
                          WhatsApp
                        </motion.button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          }) : (
            <div className="p-8 text-center text-on-surface-variant bg-surface-container rounded-2xl">
              Sin ventas registradas para este paciente.
            </div>
          )}
        </section>
      )}

      {/* ── Consultations Tab ── */}
      {activeTab === 'consults' && (
        <section className="space-y-2">
          {history.length > 0 ? history.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-divider">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-headline font-bold text-on-surface text-sm">{item.reason || 'Consulta'}</p>
                  {item.diagnosisTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.diagnosisTags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-accent-light text-accent rounded-full text-[10px] font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.optometrist && (
                    <p className="text-xs text-on-surface-variant mt-2">
                      Atendido por: <b className="text-on-surface">{item.optometrist}</b>
                    </p>
                  )}
                  {item.notes && <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{item.notes}</p>}
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase ml-2 shrink-0">
                  {formatDate(item.date)}
                </span>
              </div>
            </div>
          )) : (
            <div className="p-8 text-center text-on-surface-variant bg-surface-container rounded-2xl">Sin historial de consultas.</div>
          )}
        </section>
      )}
    </div>
  );
}
