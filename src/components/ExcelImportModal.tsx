import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Upload, Download, CheckCircle, AlertTriangle, AlertCircle, 
  HelpCircle, ChevronRight, RefreshCw, FileText, Check, ArrowRight, Minus 
} from 'lucide-react';
import { 
  validateRequired, 
  validatePositiveNumber, 
  validateEmail, 
  validatePhone 
} from '../lib/validation';
import { useWindowManager } from '../context/WindowManagerContext';

export interface FieldSchema {
  key: string;
  labelEn: string;
  labelBn: string;
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  validationType?: 'email' | 'phone' | 'positiveNumber' | 'positiveNumberNonZero';
}

export interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  schema: FieldSchema[];
  existingData: any[];
  uniqueKey: string; // e.g., 'sku' or 'email' or 'id'
  collectionNameEn: string;
  collectionNameBn: string;
  onSave: (importedRecords: any[]) => Promise<void> | void;
}

interface ParsedRow {
  index: number;
  data: any;
  isValid: boolean;
  errors: string[];
  isDuplicate: boolean;
  existingItem?: any;
}

export default function ExcelImportModal({
  isOpen,
  onClose,
  schema,
  existingData,
  uniqueKey,
  collectionNameEn,
  collectionNameBn,
  onSave,
}: ExcelImportModalProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'conflicts' | 'summary'>('upload');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [conflictDecisions, setConflictDecisions] = useState<Record<string, 'overwrite' | 'skip'>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [summary, setSummary] = useState({ success: 0, skipped: 0, errorsCount: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { openWindow, windows, minimizeWindow, closeWindow } = useWindowManager();

  useEffect(() => {
    if (isOpen) {
      openWindow('excel-import', collectionNameEn, `এক্সেল ইমপোর্ট — ${collectionNameBn}`, 'FileSpreadsheet');
    }
  }, [isOpen, collectionNameEn, collectionNameBn]);

  const modalWin = windows.find((w) => w.tab === 'excel-import');
  const isMinimized = modalWin?.isMinimized;

  if (!isOpen) return null;

  // 1. Download Blank Excel Template
  const handleDownloadTemplate = () => {
    // Generate headers with Bilingual names
    const headers = schema.map(s => `${s.labelEn} (${s.labelBn})${s.required ? ' *' : ''}`);
    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });

    // Add dummy row for user guidance
    const sampleRow = schema.map(s => {
      if (s.validationType === 'email') return 'info@example.com';
      if (s.validationType === 'phone') return '01712345678';
      if (s.type === 'number') return '100';
      if (s.type === 'boolean') return 'TRUE';
      return 'Sample Text';
    });
    XLSX.utils.sheet_add_aoa(ws, [sampleRow], { origin: 'A2' });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `${collectionNameEn.replace(/\s+/g, '_')}_Template.xlsx`);
  };

  // 2. Upload and Parse File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Read headers first to map properly
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        if (rawRows.length === 0) {
          alert('The uploaded file is empty! / আপলোড করা ফাইলটি খালি!');
          return;
        }

        const fileHeaders = rawRows[0] as string[];
        const dataRows = rawRows.slice(1);

        const tempParsed: ParsedRow[] = dataRows.map((rowCells, idx) => {
          const rowData: any = {};
          
          schema.forEach(field => {
            // Find column in file headers matching schema label (English or Bengali) or key
            const headerIndex = fileHeaders.findIndex(h => {
              if (!h) return false;
              const cleanH = String(h).toLowerCase().trim();
              const cleanKey = field.key.toLowerCase().trim();
              const cleanEn = field.labelEn.toLowerCase().trim();
              const cleanBn = field.labelBn.toLowerCase().trim();
              return cleanH === cleanKey || cleanH.includes(cleanEn) || cleanH.includes(cleanBn);
            });

            let val = headerIndex !== -1 ? rowCells[headerIndex] : undefined;
            
            // Format types
            if (field.type === 'number') {
              if (val === undefined || val === '') {
                rowData[field.key] = undefined;
              } else {
                const parsedVal = parseFloat(String(val).replace(/,/g, ''));
                rowData[field.key] = isNaN(parsedVal) ? val : parsedVal;
              }
            } else if (field.type === 'boolean') {
              if (val === undefined) {
                rowData[field.key] = false;
              } else {
                const strVal = String(val).toLowerCase().trim();
                rowData[field.key] = strVal === 'true' || strVal === 'yes' || strVal === '1';
              }
            } else {
              rowData[field.key] = val !== undefined ? String(val).trim() : '';
            }
          });

          // Validate row data
          const errors: string[] = [];
          schema.forEach(field => {
            const val = rowData[field.key];
            if (field.required) {
              const res = validateRequired(String(val || ''), field.labelEn, field.labelBn);
              if (!res.isValid) errors.push(res.message);
            }
            if (field.type === 'number' && val !== undefined && val !== '') {
              const res = validatePositiveNumber(
                val,
                field.labelEn,
                field.labelBn,
                field.validationType !== 'positiveNumberNonZero'
              );
              if (!res.isValid) errors.push(res.message);
            }
            if (field.validationType === 'email' && val) {
              const res = validateEmail(String(val));
              if (!res.isValid) errors.push(res.message);
            }
            if (field.validationType === 'phone' && val) {
              const res = validatePhone(String(val));
              if (!res.isValid) errors.push(res.message);
            }
          });

          // Check duplicate conflict
          let isDuplicate = false;
          let existingItem: any = null;
          const matchVal = String(rowData[uniqueKey] || '').toLowerCase().trim();

          if (matchVal && uniqueKey) {
            existingItem = existingData.find(item => 
              String(item[uniqueKey] || '').toLowerCase().trim() === matchVal
            );
            if (existingItem) {
              isDuplicate = true;
            }
          }

          return {
            index: idx + 2, // 1-based, index 1 is header
            data: rowData,
            isValid: errors.length === 0,
            errors,
            isDuplicate,
            existingItem,
          };
        });

        setParsedRows(tempParsed);
        
        // Populate initial conflict decisions as "overwrite"
        const initialDecisions: Record<string, 'overwrite' | 'skip'> = {};
        tempParsed.forEach(row => {
          if (row.isDuplicate && row.isValid) {
            const conflictId = String(row.data[uniqueKey]);
            initialDecisions[conflictId] = 'overwrite';
          }
        });
        setConflictDecisions(initialDecisions);

        setStep('preview');
      } catch (err) {
        console.error(err);
        alert('Failed to parse Excel file. / এক্সেল ফাইল রিড করা যায়নি।');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Drag and Drop support
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      const event = { target: { files: dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(event);
    }
  };

  // 3. Export Error Report
  const handleDownloadErrorReport = () => {
    const invalidRows = parsedRows.filter(r => !r.isValid);
    if (invalidRows.length === 0) return;

    const errorData = invalidRows.map(r => ({
      'Row Number': r.index,
      ...r.data,
      'Validation Errors / ত্রুটিসমূহ': r.errors.join('; '),
    }));

    const ws = XLSX.utils.json_to_sheet(errorData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Errors');
    XLSX.writeFile(wb, `${collectionNameEn.replace(/\s+/g, '_')}_Import_Errors.xlsx`);
  };

  // 4. Handle Save & Commit
  const handleProceedFromPreview = () => {
    const hasConflicts = parsedRows.some(r => r.isValid && r.isDuplicate);
    if (hasConflicts) {
      setStep('conflicts');
    } else {
      commitImport();
    }
  };

  const commitImport = async () => {
    setIsSaving(true);
    try {
      const finalToSave: any[] = [];
      let skippedCount = 0;
      let successCount = 0;

      // Extract existing list and compile updates
      const updatedList = [...existingData];

      parsedRows.forEach(row => {
        if (!row.isValid) return; // Skip invalid completely

        if (row.isDuplicate) {
          const conflictId = String(row.data[uniqueKey]);
          const decision = conflictDecisions[conflictId];
          
          if (decision === 'overwrite') {
            const existingIdx = updatedList.findIndex(item => 
              String(item[uniqueKey] || '').toLowerCase().trim() === conflictId.toLowerCase().trim()
            );
            if (existingIdx !== -1) {
              // Retain original record's primary ID but update other fields
              const originalId = updatedList[existingIdx].id;
              updatedList[existingIdx] = {
                ...updatedList[existingIdx],
                ...row.data,
                id: originalId,
              };
              successCount++;
            }
          } else {
            skippedCount++;
          }
        } else {
          // New unique record
          const newRecord = {
            ...row.data,
            id: row.data.id || Math.random().toString(36).substring(2, 9),
          };
          updatedList.push(newRecord);
          successCount++;
        }
      });

      // Invoke save handler to sync updated list to database
      await onSave(updatedList);

      setSummary({
        success: successCount,
        skipped: skippedCount,
        errorsCount: parsedRows.filter(r => !r.isValid).length,
      });
      setStep('summary');
    } catch (err) {
      console.error(err);
      alert('Error updating database during import. / ডাটাবেজ ইমপোর্ট সম্পন্ন করা যায়নি।');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setParsedRows([]);
    setFileName('');
    setConflictDecisions({});
  };

  const validRows = parsedRows.filter(r => r.isValid);
  const invalidRows = parsedRows.filter(r => !r.isValid);
  const conflictRows = parsedRows.filter(r => r.isValid && r.isDuplicate);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 ${
      isMinimized ? 'hidden' : 'block'
    }`}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-slate-100">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Bulk Excel / CSV Import — {collectionNameEn}</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full font-mono">
                {collectionNameBn}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              মিনিমাইজ করে টাস্কবারে রেখে অন্য পেজে কাজ করতে পারেন
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => minimizeWindow('excel-import')}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
              title="মিনিমাইজ করুন (Minimize to Taskbar)"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button 
              onClick={() => {
                closeWindow('excel-import');
                onClose();
              }}
              className="p-1.5 hover:bg-rose-600 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body / Steps */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: UPLOAD & TEMPLATE */}
            {step === 'upload' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 max-w-2xl mx-auto py-8"
              >
                {/* Instruction Banner */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-800">Important Instruction / গুরুত্বপূর্ণ নির্দেশনা</h4>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                      To ensure seamless import, download our customized Excel template first. Fill in your data, and upload the file below. Duplicate entries will show a comparison preview for you to resolve.
                    </p>
                    <p className="text-xs text-amber-600/90 mt-1 leading-relaxed">
                      নির্ভুলভাবে ইমপোর্ট করার জন্য প্রথমে কাস্টমাইজড এক্সেল টেমপ্লেটটি ডাউনলোড করুন। ডেটা পূরণ করে আপলোড করুন। ডুপ্লিকেট এন্ট্রিগুলোর জন্য স্কিপ বা ওভাররাইট করার অপশন পাবেন।
                    </p>
                  </div>
                </div>

                {/* Download Template Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-xl">
                      <FileText className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">Download Excel Template</h4>
                      <p className="text-xs text-slate-500 mt-0.5">এক্সেল টেমপ্লেট ডাউনলোড করুন</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-xs transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
                  >
                    <Download className="h-4 w-4" /> Download / ডাউনলোড
                  </button>
                </div>

                {/* Upload Area */}
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-indigo-500 transition-all cursor-pointer relative shadow-sm group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".xlsx, .xls, .csv"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="max-w-xs mx-auto space-y-3">
                    <div className="mx-auto w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Drag & Drop file here or Click to select</p>
                      <p className="text-xs text-slate-400 mt-1">Supports XLSX, XLS or CSV files</p>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      ফাইলটি এখানে টেনে আনুন অথবা সিলেক্ট করতে ক্লিক করুন
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: PREVIEW TABLE & VALIDATION */}
            {step === 'preview' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* File Metadata & Quick Stats */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Selected File</span>
                    <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2 mt-0.5">
                      <FileText className="h-4 w-4 text-indigo-600" /> {fileName}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-emerald-100">
                      <CheckCircle className="h-4 w-4" /> {validRows.length} Valid / সঠিক
                    </span>

                    {invalidRows.length > 0 && (
                      <span className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-rose-100">
                        <AlertCircle className="h-4 w-4" /> {invalidRows.length} Errors / ত্রুটিযুক্ত
                      </span>
                    )}
                  </div>
                </div>

                {/* Table View */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto max-h-[40vh]">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-[11px] text-slate-500 font-bold sticky top-0 border-b border-slate-100 z-10">
                        <tr>
                          <th className="py-3 px-4 w-16">Row</th>
                          <th className="py-3 px-4 w-28">Status</th>
                          {schema.map(field => (
                            <th key={field.key} className="py-3 px-4 min-w-[120px]">
                              {field.labelEn}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {parsedRows.map((row) => (
                          <tr 
                            key={row.index} 
                            className={`hover:bg-slate-50/50 transition-colors ${!row.isValid ? 'bg-rose-50/20' : ''}`}
                          >
                            <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">#{row.index}</td>
                            <td className="py-2.5 px-4">
                              {row.isValid ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                  <Check className="h-3 w-3" /> Valid
                                </span>
                              ) : (
                                <div className="space-y-0.5">
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                                    <AlertCircle className="h-3 w-3" /> Error
                                  </span>
                                  <div className="text-[9px] text-rose-600 max-w-[200px] leading-tight font-medium">
                                    {row.errors[0]}
                                  </div>
                                </div>
                              )}
                            </td>
                            {schema.map(field => (
                              <td key={field.key} className="py-2.5 px-4 text-slate-700">
                                {row.data[field.key] !== undefined && row.data[field.key] !== null 
                                  ? String(row.data[field.key]) 
                                  : <span className="text-slate-300 italic">None</span>
                                }
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Error Report Actions if present */}
                {invalidRows.length > 0 && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-rose-800">Errors detected! / ত্রুটি সনাক্ত করা হয়েছে!</h4>
                        <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                          We found {invalidRows.length} row(s) containing errors. Invalid rows cannot be imported. You can proceed with valid records only, or download the error report to fix and re-upload.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadErrorReport}
                      className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-all shadow-md shrink-0 cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" /> Error Report / ত্রুটি রিপোর্ট
                    </button>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Upload Another / অন্য ফাইল
                  </button>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Cancel / বাতিল
                    </button>
                    <button
                      type="button"
                      disabled={validRows.length === 0}
                      onClick={handleProceedFromPreview}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-lg text-xs transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                    >
                      Import Valid Records ({validRows.length}) <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: CONFLICTS / DUPLICATE COMPARISON RESOLUTION */}
            {step === 'conflicts' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" /> Duplicate SKU/ID/Email Detected / ডুপ্লিকেট রেকর্ড সনাক্ত হয়েছে
                  </h4>
                  <p className="text-xs text-amber-700 mt-1">
                    {conflictRows.length} imported records match existing database entries based on <strong>"{uniqueKey}"</strong>. Please choose whether to SKIP or OVERWRITE each conflict below.
                  </p>
                </div>

                {/* Bulk Actions */}
                <div className="flex justify-end gap-3 bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...conflictDecisions };
                      conflictRows.forEach(row => {
                        updated[String(row.data[uniqueKey])] = 'overwrite';
                      });
                      setConflictDecisions(updated);
                    }}
                    className="text-indigo-600 hover:bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
                  >
                    Overwrite All / সব ওভাররাইট
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...conflictDecisions };
                      conflictRows.forEach(row => {
                        updated[String(row.data[uniqueKey])] = 'skip';
                      });
                      setConflictDecisions(updated);
                    }}
                    className="text-slate-600 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
                  >
                    Skip All / সব স্কিপ
                  </button>
                </div>

                {/* Side-by-side List */}
                <div className="space-y-4 max-h-[45vh] overflow-y-auto">
                  {conflictRows.map((row) => {
                    const matchVal = String(row.data[uniqueKey]);
                    const decision = conflictDecisions[matchVal] || 'overwrite';
                    
                    return (
                      <div key={matchVal} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px]">Conflict</span>
                            <span>{uniqueKey.toUpperCase()}: <strong className="font-mono">{matchVal}</strong></span>
                          </div>

                          {/* Side-by-side grids */}
                          <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
                            {/* Existing Record */}
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[9px]">Existing In Database</span>
                              <div className="space-y-1 mt-1 font-medium text-slate-700">
                                <p>Name: {row.existingItem?.name || 'N/A'}</p>
                                {schema.slice(1, 4).map(f => (
                                  <p key={f.key} className="text-slate-600 truncate">
                                    {f.labelEn}: {String(row.existingItem?.[f.key] ?? 'N/A')}
                                  </p>
                                ))}
                              </div>
                            </div>

                            {/* Imported Excel Record */}
                            <div className="bg-indigo-50/30 p-3 rounded-lg border border-indigo-100">
                              <span className="font-semibold text-indigo-600 uppercase tracking-wider text-[9px]">New Imported Excel</span>
                              <div className="space-y-1 mt-1 font-medium text-slate-800">
                                <p>Name: {row.data.name || 'N/A'}</p>
                                {schema.slice(1, 4).map(f => (
                                  <p key={f.key} className="text-slate-700 truncate">
                                    {f.labelEn}: {String(row.data[f.key] ?? 'N/A')}
                                  </p>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Toggle Controls */}
                        <div className="flex md:flex-col items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4 min-w-[150px]">
                          <button
                            type="button"
                            onClick={() => {
                              setConflictDecisions(prev => ({ ...prev, [matchVal]: 'overwrite' }));
                            }}
                            className={`w-full text-center py-2 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              decision === 'overwrite' 
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Overwrite / ওভাররাইট
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setConflictDecisions(prev => ({ ...prev, [matchVal]: 'skip' }));
                            }}
                            className={`w-full text-center py-2 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              decision === 'skip' 
                                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Skip / বাদ দিন
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep('preview')}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Back to Preview / পূর্ববর্তী
                  </button>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Cancel / বাতিল
                    </button>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={commitImport}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" /> Importing...
                        </>
                      ) : (
                        <>
                          Complete Import / ইমপোর্ট শেষ করুন
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: SUMMARY & STATISTICS REPORT */}
            {step === 'summary' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-md mx-auto text-center py-12 space-y-6"
              >
                <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                  <CheckCircle className="h-10 w-10 animate-bounce" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-800">Import Process Completed!</h3>
                  <p className="text-xs text-slate-500">ইমপোর্ট প্রক্রিয়া সফলভাবে সম্পন্ন হয়েছে!</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left space-y-3.5 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Summary Statistics</h4>
                  
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Imported / সফল ইমপোর্ট:
                    </span>
                    <strong className="text-emerald-700 font-mono text-base">{summary.success} records</strong>
                  </div>

                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span> Skipped / বাদ পড়া:
                    </span>
                    <strong className="text-amber-700 font-mono text-base">{summary.skipped} records</strong>
                  </div>

                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span> Had Errors / ত্রুটিযুক্ত:
                    </span>
                    <strong className="text-rose-700 font-mono text-base">{summary.errorsCount} records</strong>
                  </div>
                </div>

                {summary.errorsCount > 0 && (
                  <button
                    type="button"
                    onClick={handleDownloadErrorReport}
                    className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold py-2.5 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    <Download className="h-4 w-4" /> Download Error Log / ত্রুটি ফাইল ডাউনলোড
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-lg text-xs transition-all shadow-md cursor-pointer"
                >
                  Close / উইন্ডো বন্ধ করুন
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
