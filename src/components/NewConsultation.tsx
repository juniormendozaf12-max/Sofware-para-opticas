import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, Save, Printer, Plus, Sparkles, Search, Volume2, Loader2, User, FileText, Eye, ClipboardCheck, X, ChevronDown } from 'lucide-react';
import { Patient, EyeRx, Diagnosis, VisualAcuity, LensRecommendation } from '../types';
import { getPatient, createConsultation, createPrescription, printPrescription, sendRxWhatsApp } from '../lib/services';
import { WhatsAppIcon } from './ui/whatsapp-icon';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const LENS_TYPES = ['Monofocal', 'Bifocal', 'Progresivo', 'Ocupacional'];
const MATERIALS = ['CR-39', 'Policarbonato', 'Hi-Index 1.67', 'Trivex', 'Cristal'];
const TREATMENTS = ['Antireflejo', 'Blue Filter', 'Fotocromatico', 'UV', 'Hidrofobico', 'Oleofobico'];

export default function NewConsultation() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Clinical form
  const [reason, setReason] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [visualAcuity, setVisualAcuity] = useState<VisualAcuity>({ scOd: '', scOi: '', ccOd: '', ccOi: '' });
  const [pioOd, setPioOd] = useState<string>('');
  const [pioOi, setPioOi] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<Diagnosis>({
    myopia: false, hyperopia: false, astigmatism: false, presbyopia: false, amblyopia: false
  });
  const [customDiagnosis, setCustomDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  // RX
  const [rx, setRx] = useState({
    od: { sph: 0, cyl: 0, axis: 0, add: 0 } as EyeRx,
    oi: { sph: 0, cyl: 0, axis: 0, add: 0 } as EyeRx,
    dip: 0,
  });

  // Lens recommendation
  const [lensType, setLensType] = useState('');
  const [lensMaterial, setLensMaterial] = useState('');
  const [treatments, setTreatments] = useState<string[]>([]);

  // AI
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  useEffect(() => {
    if (patientId === 'new' || !patientId) {
      setLoading(false);
      return;
    }
    getPatient(patientId).then(p => {
      setPatient(p);
      setLoading(false);
    });
  }, [patientId]);

  const getDiagnosisTags = (): string[] => {
    const tags: string[] = [];
    if (diagnosis.myopia) tags.push('Miopia');
    if (diagnosis.hyperopia) tags.push('Hipermetropia');
    if (diagnosis.astigmatism) tags.push('Astigmatismo');
    if (diagnosis.presbyopia) tags.push('Presbicia');
    if (diagnosis.amblyopia) tags.push('Ambliopia');
    if (diagnosis.other) tags.push(diagnosis.other);
    return tags;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setIsAnalyzing(true);
          try {
            const { transcribeAudio } = await import('../lib/gemini');
            const transcription = await transcribeAudio(base64Audio);
            setReason(prev => (prev ? prev + ' ' : '') + transcription);
          } catch (error) {
            console.error('Transcription failed:', error);
          } finally {
            setIsAnalyzing(false);
          }
        };
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Mic error:', err);
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  const handleAIAnalysis = async () => {
    if (!reason) return;
    setIsAnalyzing(true);
    try {
      const { analyzeClinicalNotes } = await import('../lib/gemini');
      const result = await analyzeClinicalNotes(reason);
      if (result.potentialDiagnosis) {
        const diag = result.potentialDiagnosis.toLowerCase();
        if (diag.includes('miop')) setDiagnosis(d => ({ ...d, myopia: true }));
        if (diag.includes('astigm')) setDiagnosis(d => ({ ...d, astigmatism: true }));
        if (diag.includes('hipermetrop')) setDiagnosis(d => ({ ...d, hyperopia: true }));
        if (diag.includes('presbi')) setDiagnosis(d => ({ ...d, presbyopia: true }));
      }
      if (result.findings?.length) {
        setNotes(prev => (prev ? prev + '\n' : '') + 'IA: ' + result.findings.join(', '));
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!patientId || patientId === 'new') return;
    setSaving(true);
    try {
      await createConsultation(patientId, {
        date: new Date().toISOString() as any,
        reason,
        medicalHistory: medicalHistory || undefined,
        visualAcuity,
        diagnosis,
        diagnosisTags: getDiagnosisTags(),
        lensRecommendation: lensType ? { type: lensType, material: lensMaterial, treatments } : undefined,
        pioOd: pioOd ? parseFloat(pioOd) : undefined,
        pioOi: pioOi ? parseFloat(pioOi) : undefined,
        notes: notes || undefined,
        optometrist: undefined,
      });

      await createPrescription(patientId, {
        od: rx.od,
        oi: rx.oi,
        dip: rx.dip,
        lensType: lensType || undefined,
        material: lensMaterial || undefined,
        treatments: treatments.length > 0 ? treatments : undefined,
      });

      setSaved(true);
      setTimeout(() => navigate(`/patients/${patientId}`), 4000);
    } catch (error) {
      console.error('Save failed:', error);
      setSaving(false);
    }
  };

  const handlePrint = () => {
    if (!patient) return;
    printPrescription(patient, {
      id: '',
      patientId: patient.id,
      date: new Date().toISOString() as any,
      od: rx.od,
      oi: rx.oi,
      dip: rx.dip,
      lensType,
      material: lensMaterial,
      treatments,
    });
  };

  const toggleTreatment = (t: string) => {
    setTreatments(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  if (saved) {
    const savedRx = { id: '', patientId: patientId || '', date: new Date().toISOString() as any, od: rx.od, oi: rx.oi, dip: rx.dip, lensType, material: lensMaterial, treatments };
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center p-12 gap-4"
      >
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <Save className="text-emerald-600" size={40} />
        </div>
        <h2 className="text-2xl font-headline font-bold text-on-surface">Guardado</h2>
        <p className="text-on-surface-variant text-center">Consulta y prescripcion guardadas correctamente.</p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => { if (patient) printPrescription(patient, savedRx); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-on-surface text-white rounded-xl text-sm font-bold active:scale-95"
          >
            <Printer size={16} /> Imprimir RX
          </button>
          {patient?.phone && (
            <button
              onClick={() => { if (patient) sendRxWhatsApp(patient, savedRx).catch(e => console.error(e)); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white rounded-xl text-sm font-bold active:scale-95"
            >
              <WhatsAppIcon size={16} /> WhatsApp
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Patient Header */}
      <section className="relative">
        <div className="absolute -top-2 -left-2 w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container shadow-lg z-10">
          <User size={24} />
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-6 pl-14 shadow-sm">
          <h2 className="text-xl font-bold text-on-surface tracking-tight font-headline">
            {patient?.name || 'Nuevo Paciente'}
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm font-medium text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md">
              DNI: {patient?.dni || '---'}
            </span>
            <span className="text-sm text-on-surface-variant">Nueva Consulta</span>
          </div>
        </div>
      </section>

      {/* Clinical History */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <FileText className="text-primary" size={20} />
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant font-headline">Historia Clinica</h3>
          </div>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              "p-2 rounded-full transition-all active:scale-90",
              isRecording ? "bg-error text-white animate-pulse" : "bg-primary-fixed text-primary"
            )}
          >
            <Mic size={20} />
          </button>
        </div>
        <div className="space-y-3">
          <div className="bg-surface-container-low rounded-xl p-4 relative">
            <label className="block text-xs font-bold text-primary mb-2 uppercase tracking-wider">Motivo de Consulta</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline p-0 text-sm leading-relaxed resize-none"
              placeholder="Describe los sintomas del paciente..."
              rows={3}
            />
            <button
              onClick={handleAIAnalysis}
              disabled={isAnalyzing || !reason}
              className="absolute bottom-2 right-2 p-2 text-primary hover:bg-primary/5 rounded-lg disabled:opacity-40"
            >
              {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            </button>
          </div>
          <div className="bg-surface-container-low rounded-xl p-4">
            <label className="block text-xs font-bold text-primary mb-2 uppercase tracking-wider">Antecedentes Medicos</label>
            <textarea
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline p-0 text-sm leading-relaxed resize-none"
              placeholder="Antecedentes, alergias, uso de lentes previo..."
              rows={2}
            />
          </div>
        </div>
      </section>

      {/* Visual Acuity */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-2">
          <Eye className="text-primary" size={20} />
          <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant font-headline">Agudeza Visual</h3>
        </div>
        <div className="bg-surface-container-low rounded-2xl p-4">
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
            <div></div><div>S/C</div><div>C/C</div>
          </div>
          <div className="grid grid-cols-3 gap-2 items-center mb-2">
            <div className="text-sm font-bold text-primary font-headline">OD</div>
            <input value={visualAcuity.scOd} onChange={e => setVisualAcuity({ ...visualAcuity, scOd: e.target.value })} className="bg-surface-container-lowest rounded-lg text-center text-sm h-9 border-none focus:ring-2 focus:ring-primary/20" placeholder="20/..." />
            <input value={visualAcuity.ccOd} onChange={e => setVisualAcuity({ ...visualAcuity, ccOd: e.target.value })} className="bg-surface-container-lowest rounded-lg text-center text-sm h-9 border-none focus:ring-2 focus:ring-primary/20" placeholder="20/..." />
          </div>
          <div className="grid grid-cols-3 gap-2 items-center">
            <div className="text-sm font-bold text-secondary font-headline">OI</div>
            <input value={visualAcuity.scOi} onChange={e => setVisualAcuity({ ...visualAcuity, scOi: e.target.value })} className="bg-surface-container-lowest rounded-lg text-center text-sm h-9 border-none focus:ring-2 focus:ring-primary/20" placeholder="20/..." />
            <input value={visualAcuity.ccOi} onChange={e => setVisualAcuity({ ...visualAcuity, ccOi: e.target.value })} className="bg-surface-container-lowest rounded-lg text-center text-sm h-9 border-none focus:ring-2 focus:ring-primary/20" placeholder="20/..." />
          </div>
        </div>
      </section>

      {/* PIO */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant font-headline px-2">PIO (mmHg)</h3>
        <div className="flex gap-3">
          <div className="flex-1 bg-surface-container-low rounded-xl p-3 flex items-center gap-2">
            <span className="text-sm font-bold text-primary">OD</span>
            <input type="number" value={pioOd} onChange={e => setPioOd(e.target.value)} className="flex-1 bg-surface-container-lowest rounded-lg text-center text-sm h-9 border-none focus:ring-2 focus:ring-primary/20" placeholder="--" />
          </div>
          <div className="flex-1 bg-surface-container-low rounded-xl p-3 flex items-center gap-2">
            <span className="text-sm font-bold text-secondary">OI</span>
            <input type="number" value={pioOi} onChange={e => setPioOi(e.target.value)} className="flex-1 bg-surface-container-lowest rounded-lg text-center text-sm h-9 border-none focus:ring-2 focus:ring-primary/20" placeholder="--" />
          </div>
        </div>
      </section>

      {/* RX Grid */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-2">
          <Eye className="text-primary" size={20} />
          <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant font-headline">Graduacion Optica (RX)</h3>
        </div>
        <div className="bg-surface-container-low rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-5 bg-surface-container-high/50 text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest text-center py-2.5 px-2">
            <div className="text-left pl-3">Ojo</div>
            <div>ESF</div>
            <div>CIL</div>
            <div>EJE</div>
            <div>ADD</div>
          </div>
          {(['od', 'oi'] as const).map((eye) => (
            <div key={eye} className={cn("grid grid-cols-5 items-center py-3 px-2 text-center", eye === 'oi' && "bg-surface-container/30")}>
              <div className={cn("text-left pl-3 font-bold font-headline", eye === 'od' ? "text-primary" : "text-secondary")}>
                {eye.toUpperCase()}
              </div>
              {(['sph', 'cyl', 'axis', 'add'] as const).map((field) => (
                <div key={field} className="px-1">
                  <input
                    className="w-full text-center bg-surface-container-lowest border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary h-10 p-0"
                    type="number"
                    step={field === 'axis' ? 1 : 0.25}
                    value={rx[eye][field]}
                    onChange={(e) => setRx({
                      ...rx,
                      [eye]: { ...rx[eye], [field]: parseFloat(e.target.value) || 0 }
                    })}
                  />
                </div>
              ))}
            </div>
          ))}
          {/* DIP row */}
          <div className="flex items-center justify-between px-4 py-3 bg-surface-container/20">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">DIP (mm)</span>
            <input
              className="w-20 text-center bg-surface-container-lowest border-none rounded-lg text-sm font-bold focus:ring-2 focus:ring-primary h-10"
              type="number"
              value={rx.dip}
              onChange={(e) => setRx({ ...rx, dip: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
      </section>

      {/* Diagnosis */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-2">
          <ClipboardCheck className="text-primary" size={20} />
          <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant font-headline">Diagnostico</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {([
            ['myopia', 'Miopia'],
            ['hyperopia', 'Hipermetropia'],
            ['astigmatism', 'Astigmatismo'],
            ['presbyopia', 'Presbicia'],
            ['amblyopia', 'Ambliopia'],
          ] as [keyof Diagnosis, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setDiagnosis({ ...diagnosis, [key]: !diagnosis[key] })}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                diagnosis[key]
                  ? "bg-primary-container text-on-primary-container"
                  : "bg-surface-container-high text-on-surface-variant"
              )}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => {
              const input = prompt('Diagnostico adicional:');
              if (input) setDiagnosis({ ...diagnosis, other: input });
            }}
            className="px-3 py-2 rounded-full text-sm font-medium border border-dashed border-outline text-primary"
          >
            <Plus size={16} className="inline mr-1" /> Otro
          </button>
        </div>
      </section>

      {/* Lens Recommendation */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant font-headline px-2">Recomendacion de Lentes</h3>
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {LENS_TYPES.map(t => (
              <button
                key={t}
                onClick={() => setLensType(t)}
                className={cn(
                  "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all",
                  lensType === t ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {MATERIALS.map(m => (
              <button
                key={m}
                onClick={() => setLensMaterial(m)}
                className={cn(
                  "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all",
                  lensMaterial === m ? "bg-secondary text-on-secondary" : "bg-surface-container-high text-on-surface-variant"
                )}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {TREATMENTS.map(t => (
              <button
                key={t}
                onClick={() => toggleTreatment(t)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  treatments.includes(t) ? "bg-tertiary-container text-tertiary" : "bg-surface-container-high text-on-surface-variant"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Notes */}
      <section>
        <div className="bg-surface-container-low rounded-xl p-4">
          <label className="block text-xs font-bold text-primary mb-2 uppercase tracking-wider">Observaciones</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline p-0 text-sm leading-relaxed resize-none"
            placeholder="Notas adicionales..."
            rows={2}
          />
        </div>
      </section>

      {/* Actions */}
      <section className="grid grid-cols-2 gap-4 pt-2">
        <button
          onClick={handlePrint}
          disabled={!patient}
          className="flex items-center justify-center gap-2 h-14 bg-surface-container-low text-primary font-bold rounded-2xl hover:bg-surface-container transition-all active:scale-95 disabled:opacity-40"
        >
          <Printer size={20} />
          <span className="font-headline">Imprimir RX</span>
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !patientId || patientId === 'new' || !reason}
          className="flex items-center justify-center gap-2 h-14 gradient-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/15 active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          <span className="font-headline">Guardar</span>
        </button>
      </section>
    </div>
  );
}
