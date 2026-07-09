import { useState, useEffect, useCallback } from 'react';
import { FieldDefinition, TabDefinition, SectionDefinition, DynamicForm, AuditRecord, FieldHistory } from '../types';
import { MetadataEngine } from '../engine';

export function useMetadata(moduleKey: string = 'products') {
  const [schema, setSchema] = useState<DynamicForm | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load schema on mount or module key change
  const loadSchema = useCallback(() => {
    setLoading(true);
    const formSchema = MetadataEngine.initialize(moduleKey);
    setSchema(formSchema);
    setLoading(false);
  }, [moduleKey]);

  useEffect(() => {
    loadSchema();
  }, [loadSchema]);

  // Persists changes to the schema back to local storage and memory cache
  const updateSchema = (updatedFields: FieldDefinition[]) => {
    if (!schema) return;
    const newSchema: DynamicForm = {
      ...schema,
      fields: updatedFields,
    };
    MetadataEngine.saveMetadata(moduleKey, newSchema);
    setSchema(newSchema);
  };

  const addCustomField = (newField: FieldDefinition) => {
    if (!schema) return;
    const updated = [...schema.fields, newField];
    updateSchema(updated);
  };

  const removeCustomField = (fieldId: string) => {
    if (!schema) return;
    const updated = schema.fields.filter((f) => f.id !== fieldId);
    updateSchema(updated);
  };

  /**
   * Tracks and returns a list of exact field histories between old and new form values.
   */
  const computeFieldAuditHistory = (
    oldData: Record<string, any>,
    newData: Record<string, any>,
    fields: FieldDefinition[],
    updatedBy: string = 'Administrator'
  ): FieldHistory[] => {
    const changes: FieldHistory[] = [];
    const timestamp = new Date().toISOString();

    fields.forEach((field) => {
      const oVal = oldData[field.fieldKey] !== undefined ? String(oldData[field.fieldKey]) : '';
      const nVal = newData[field.fieldKey] !== undefined ? String(newData[field.fieldKey]) : '';

      if (oVal !== nVal) {
        changes.push({
          timestamp,
          fieldKey: field.fieldKey,
          displayName: field.displayName,
          oldValue: oVal,
          newValue: nVal,
          updatedBy,
        });
      }
    });

    return changes;
  };

  /**
   * Commits a complete product audit log to localStorage.
   */
  const logAuditRecord = (
    recordId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RECONCILE',
    details: string,
    changes: FieldHistory[],
    user: string = 'Administrator',
    role: string = 'Administrator'
  ) => {
    try {
      const logs: AuditRecord[] = JSON.parse(localStorage.getItem('nexova_product_audit_logs') || '[]');
      const newRecord: AuditRecord = {
        id: `audit_rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        moduleKey,
        recordId,
        timestamp: new Date().toISOString(),
        user,
        role,
        action,
        details,
        changes,
        ipAddress: '127.0.0.1',
        browser: 'Enterprise Client Interface',
      };
      logs.unshift(newRecord);
      localStorage.setItem('nexova_product_audit_logs', JSON.stringify(logs));
    } catch (e) {
      console.error('Audit recording logging error:', e);
    }
  };

  return {
    schema,
    loading,
    fields: schema?.fields || [],
    tabs: schema?.layout?.tabs || [],
    sections: schema?.layout?.sections || [],
    addCustomField,
    removeCustomField,
    updateSchema,
    computeFieldAuditHistory,
    logAuditRecord,
    refreshSchema: loadSchema,
  };
}
export default useMetadata;
