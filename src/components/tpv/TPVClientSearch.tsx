import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, User, Phone, Star, X, Loader2, Eye } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTPV } from './TPVContext';

export default function TPVClientSearch() {
  const {
    selectedPatient,
    setSelectedPatient,
    patientSearchTerm,
    setPatientSearchTerm,
    patientResults,
    showPatientResults,
    setShowPatientResults,
    patientName,
    setPatientName,
    patientPhone,
    setPatientPhone,
    clearPatient,
    patientRxHistory,
    loadingRx,
    fv,
    patientRef,
  } = useTPV();

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowPatientResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowPatientResults]);

  if (selectedPatient) {
    const latestRx = patientRxHistory.length > 0 ? patientRxHistory[0] : null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <User className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-gray-900">
                {selectedPatient.name}
              </p>
              {selectedPatient.isVIP && (
                <span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                  <Star className="h-2.5 w-2.5" /> VIP
                </span>
              )}
            </div>
            {selectedPatient.dni && (
              <p className="text-xs text-gray-500">DNI: {selectedPatient.dni}</p>
            )}
          </div>
          <button onClick={clearPatient} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="Cambiar">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative">
          <Phone className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input type="tel" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} placeholder="Teléfono..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-200"
          />
        </div>

        {loadingRx && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Loader2 className="h-3 w-3 animate-spin" /> Cargando RX...
          </div>
        )}

        {!loadingRx && latestRx && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-2">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
              <Eye className="h-3 w-3" /> Ultima RX
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
              <div className="text-gray-600">
                <span className="font-medium text-gray-800">OD:</span>{' '}
                {fv(latestRx.od.sph)} {fv(latestRx.od.cyl)} x{latestRx.od.axis}
                {latestRx.od.add ? ` Add ${fv(latestRx.od.add)}` : ''}
              </div>
              <div className="text-gray-600">
                <span className="font-medium text-gray-800">OI:</span>{' '}
                {fv(latestRx.oi.sph)} {fv(latestRx.oi.cyl)} x{latestRx.oi.axis}
                {latestRx.oi.add ? ` Add ${fv(latestRx.oi.add)}` : ''}
              </div>
            </div>
            {latestRx.dip > 0 && <p className="mt-0.5 text-[10px] text-gray-400">DIP: {latestRx.dip} mm</p>}
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <div ref={patientRef as React.RefObject<HTMLDivElement>} className="relative space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input ref={inputRef} type="text" value={patientSearchTerm}
          onChange={(e) => setPatientSearchTerm(e.target.value)}
          onFocus={() => { if (patientResults.length > 0) setShowPatientResults(true); }}
          placeholder='DNI o nombre... (vacío = EVENTUAL)'
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-200"
        />
      </div>

      <AnimatePresence>
        {showPatientResults && patientResults.length > 0 && (
          <motion.div ref={dropdownRef}
            initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{ transformOrigin: 'top' }}
            className="absolute left-0 right-0 top-full z-40 mt-1 max-h-52 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl"
          >
            {patientResults.map((patient) => (
              <button key={patient.id}
                onClick={() => {
                  setSelectedPatient(patient);
                  setPatientSearchTerm('');
                  setShowPatientResults(false);
                  setPatientName(patient.name);
                  setPatientPhone(patient.phone || '');
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-emerald-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <User className="h-3.5 w-3.5 text-gray-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{patient.name}</p>
                  <p className="text-xs text-gray-400">
                    {patient.dni ? `DNI: ${patient.dni}` : 'Sin DNI'}
                    {patient.phone ? ` | ${patient.phone}` : ''}
                  </p>
                </div>
                {patient.isVIP && <Star className="h-3.5 w-3.5 shrink-0 text-amber-500" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
