import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, ClipboardList, Settings, Save, Loader2, Check } from 'lucide-react';
import { useTPV } from './TPVContext';
import RxInput from './RxInput';
import { cn } from '../../lib/utils';
import type { LensPriceResult } from '../../lib/services';

// ══════════════════════════════════════════
// MATERIAL CARD
// ══════════════════════════════════════════

function MaterialCard({
  result,
  index,
  onSelect,
}: {
  result: LensPriceResult;
  index: number;
  onSelect: (r: LensPriceResult) => void;
}) {
  const { material, priceUnit, pricePair, isLab } = result;
  const isRecommended = index === 1; // Second material = Poly Blue HD

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(result)}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'relative flex flex-col items-center bg-white border border-gray-200 rounded-xl p-4 gap-2',
        'hover:shadow-lg hover:border-amber-300 transition-shadow cursor-pointer text-center',
        isLab && 'opacity-50 cursor-not-allowed',
      )}
      disabled={isLab}
    >
      {/* Recommended badge */}
      {isRecommended && !isLab && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
          RECOMENDADO
        </span>
      )}

      {/* Material icon */}
      <span className="text-3xl mt-1">{material.icon}</span>

      {/* Material name */}
      <span className="font-bold text-sm" style={{ color: material.color }}>
        {material.name}
      </span>

      {/* Description */}
      <span className="text-[11px] text-gray-500 leading-tight">
        {material.description}
      </span>

      {/* Price breakdown */}
      {!isLab ? (
        <div className="w-full mt-1 space-y-1.5">
          {/* OD price */}
          <div className="flex items-center justify-between text-xs">
            <span className="bg-amber-400 text-amber-900 rounded-full font-black text-[10px] px-2.5 py-0.5">
              OD
            </span>
            <span className="font-semibold text-gray-700">S/ {priceUnit}</span>
          </div>

          {/* OI price */}
          <div className="flex items-center justify-between text-xs">
            <span className="bg-blue-400 text-blue-900 rounded-full font-black text-[10px] px-2.5 py-0.5">
              OI
            </span>
            <span className="font-semibold text-gray-700">S/ {priceUnit}</span>
          </div>

          {/* Separator */}
          <div className="border-t border-dashed border-gray-300" />

          {/* Pair total */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">PAR</span>
            <span className="text-base font-black text-red-600">
              S/ {pricePair}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-xs text-gray-400 mt-1">
          Laboratorio &mdash; Consultar precio
        </div>
      )}
    </motion.button>
  );
}

// ══════════════════════════════════════════
// MAIN MODAL
// ══════════════════════════════════════════

export default function TPVLensModal() {
  const {
    showLensModal,
    setShowLensModal,
    selectedPatient,
    patientName,
    odEsf, setOdEsf,
    odCil, setOdCil,
    odEje, setOdEje,
    odAdd, setOdAdd,
    oiEsf, setOiEsf,
    oiCil, setOiCil,
    oiEje, setOiEje,
    oiAdd, setOiAdd,
    rxDip, setRxDip,
    lensResults,
    lensQty,
    setLensQty,
    addLensToCart,
    savingRx,
    rxSaved,
    handleSavePrescription,
    fv,
  } = useTPV();

  // AV fields are local to this modal
  const avOdDefault = '20/20';
  const avOiDefault = '20/20';

  const displayName = selectedPatient?.name || patientName?.trim() || 'Cliente Mostrador';
  const canSaveRx = !!(selectedPatient || patientName?.trim());

  const handleSelectMaterial = (result: LensPriceResult) => {
    addLensToCart(result);
    setShowLensModal(false);
  };

  if (!showLensModal) return null;

  return (
    <AnimatePresence>
      {showLensModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowLensModal(false)}
        >
          <motion.div
            className="relative w-full max-w-[900px] bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto"
            initial={{ scale: 0.92, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Close button ── */}
            <button
              onClick={() => setShowLensModal(false)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* ── Header ── */}
            <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-700 px-6 py-5">
              <div className="flex items-start gap-3">
                <Sparkles className="w-7 h-7 text-amber-300 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-bold text-lg leading-tight">
                    Paso 1: Diagnostico &amp; Seleccion de Material
                  </h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-amber-200 text-sm">
                      Paciente: <span className="font-semibold text-white">{displayName}</span>
                    </span>
                    <span className="bg-amber-600/60 text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      V5.0 Ultra
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RX Configuration ── */}
            <div className="px-6 py-5">
              {/* Section heading */}
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                  Configuracion de Medida (RX)
                </h3>
              </div>

              {/* Table */}
              <div className="rounded-xl overflow-hidden border border-amber-200">
                {/* Header row */}
                <div className="grid grid-cols-[60px_1fr_1fr_1fr_80px_80px_80px] bg-gradient-to-r from-amber-800 to-amber-700 text-white text-xs font-bold uppercase tracking-wider">
                  <div className="px-2 py-2.5 text-center">Ojo</div>
                  <div className="px-2 py-2.5 text-center">Esfera</div>
                  <div className="px-2 py-2.5 text-center">Cilindro</div>
                  <div className="px-2 py-2.5 text-center">Eje</div>
                  <div className="px-2 py-2.5 text-center">DIP</div>
                  <div className="px-2 py-2.5 text-center">ADD</div>
                  <div className="px-2 py-2.5 text-center">A.V.</div>
                </div>

                {/* OD Row */}
                <div className="grid grid-cols-[60px_1fr_1fr_1fr_80px_80px_80px] items-center bg-white border-b border-amber-100">
                  <div className="flex justify-center py-2.5">
                    <span className="bg-amber-400 text-amber-900 rounded-full font-black text-xs px-3 py-1">
                      OD
                    </span>
                  </div>
                  <div className="px-1.5 py-2">
                    <RxInput label="OD Esfera" value={odEsf} onChange={setOdEsf} />
                  </div>
                  <div className="px-1.5 py-2">
                    <RxInput label="OD Cilindro" value={odCil} onChange={setOdCil} />
                  </div>
                  <div className="px-1.5 py-2">
                    <RxInput label="OD Eje" value={odEje} onChange={setOdEje} integer />
                  </div>
                  {/* DIP spans both rows visually — we place it in OD row */}
                  <div className="px-1.5 py-2 row-span-1">
                    <RxInput label="DIP" value={rxDip} onChange={setRxDip} integer />
                  </div>
                  <div className="px-1.5 py-2">
                    <RxInput label="OD ADD" value={odAdd} onChange={setOdAdd} />
                  </div>
                  <div className="px-1.5 py-2">
                    <input
                      type="text"
                      defaultValue={avOdDefault}
                      className="bg-amber-50/80 border border-amber-200 rounded-lg py-2 px-2 text-center text-sm font-bold tabular-nums w-full focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                      aria-label="A.V. OD"
                    />
                  </div>
                </div>

                {/* OI Row */}
                <div className="grid grid-cols-[60px_1fr_1fr_1fr_80px_80px_80px] items-center bg-amber-50/30">
                  <div className="flex justify-center py-2.5">
                    <span className="bg-blue-400 text-blue-900 rounded-full font-black text-xs px-3 py-1">
                      OI
                    </span>
                  </div>
                  <div className="px-1.5 py-2">
                    <RxInput label="OI Esfera" value={oiEsf} onChange={setOiEsf} />
                  </div>
                  <div className="px-1.5 py-2">
                    <RxInput label="OI Cilindro" value={oiCil} onChange={setOiCil} />
                  </div>
                  <div className="px-1.5 py-2">
                    <RxInput label="OI Eje" value={oiEje} onChange={setOiEje} integer />
                  </div>
                  {/* DIP cell empty for OI (shared with OD above) */}
                  <div className="px-1.5 py-2">
                    <div className="h-9" /> {/* Spacer matching DIP in OD row */}
                  </div>
                  <div className="px-1.5 py-2">
                    <RxInput label="OI ADD" value={oiAdd} onChange={setOiAdd} />
                  </div>
                  <div className="px-1.5 py-2">
                    <input
                      type="text"
                      defaultValue={avOiDefault}
                      className="bg-amber-50/80 border border-amber-200 rounded-lg py-2 px-2 text-center text-sm font-bold tabular-nums w-full focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                      aria-label="A.V. OI"
                    />
                  </div>
                </div>
              </div>

              {/* RX summary line */}
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span>
                  OD: {fv(odEsf)} / {fv(odCil)} x {odEje}° ADD {fv(odAdd)}
                </span>
                <span className="text-gray-300">|</span>
                <span>
                  OI: {fv(oiEsf)} / {fv(oiCil)} x {oiEje}° ADD {fv(oiAdd)}
                </span>
                <span className="text-gray-300">|</span>
                <span>DIP: {rxDip}mm</span>
              </div>
            </div>

            {/* ── Material Selection ── */}
            <div className="px-6 pb-6">
              {/* Section heading */}
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                  Selecciona tu Material
                </h3>
              </div>

              {/* Material cards grid */}
              {lensResults.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {lensResults.map((result, idx) => (
                    <MaterialCard
                      key={result.material.code}
                      result={result}
                      index={idx}
                      onSelect={handleSelectMaterial}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Ingresa los valores de la prescripcion para ver materiales disponibles.
                </div>
              )}
            </div>

            {/* ── Bottom actions ── */}
            <div className="px-6 pb-6 flex items-center justify-between gap-4 flex-wrap">
              {/* Save prescription button */}
              {canSaveRx && (
                <motion.button
                  type="button"
                  onClick={handleSavePrescription}
                  disabled={savingRx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors',
                    rxSaved
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200',
                    savingRx && 'opacity-60 cursor-not-allowed',
                  )}
                >
                  {savingRx ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : rxSaved ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {rxSaved ? 'Prescripcion Guardada' : 'Guardar Prescripcion'}
                </motion.button>
              )}

              {/* Quantity toggle: Unidad / Par */}
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setLensQty('uni')}
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-semibold transition-colors',
                    lensQty === 'uni'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700',
                  )}
                >
                  Unidad
                </button>
                <button
                  type="button"
                  onClick={() => setLensQty('par')}
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-semibold transition-colors',
                    lensQty === 'par'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700',
                  )}
                >
                  Par
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
