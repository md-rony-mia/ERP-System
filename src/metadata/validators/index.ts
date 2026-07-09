import { FieldDefinition } from '../types';

/**
 * Validates a single value against field definition constraints defined in metadata.
 */
export function validateField(
  field: FieldDefinition,
  value: any,
  formData: Record<string, any> = {}
): string | null {
  // 1. Required Check
  const isRequired = !!field.required;
  const isEmpty = value === undefined || value === null || value === '';
  
  if (isRequired && isEmpty) {
    return `${field.displayName} is required.`;
  }

  if (isEmpty) {
    return null; // Skip further validations on empty optional fields
  }

  // 2. Type-specific quick-checks
  if (field.fieldType === 'Integer') {
    const intVal = parseInt(value, 10);
    if (isNaN(intVal)) {
      return `${field.displayName} must be a valid integer.`;
    }
  }

  if (field.fieldType === 'Decimal' || field.fieldType === 'Currency' || field.fieldType === 'Percentage') {
    const decVal = parseFloat(value);
    if (isNaN(decVal)) {
      return `${field.displayName} must be a valid numeric value.`;
    }
  }

  // 3. Min/Max Length checks (for strings)
  const strValue = String(value);
  if (field.minLength > 0 && strValue.length < field.minLength) {
    return `${field.displayName} must be at least ${field.minLength} characters.`;
  }
  if (field.maxLength > 0 && strValue.length > field.maxLength) {
    return `${field.displayName} cannot exceed ${field.maxLength} characters.`;
  }

  // 4. Minimum/Maximum value checks (for numbers)
  const numVal = parseFloat(value);
  if (!isNaN(numVal)) {
    if (field.minimum > 0 && numVal < field.minimum) {
      return `${field.displayName} cannot be less than ${field.minimum}.`;
    }
    if (field.maximum > 0 && numVal > field.maximum) {
      return `${field.displayName} cannot exceed ${field.maximum}.`;
    }
  }

  // 5. Custom Regex checks
  if (field.regex) {
    try {
      const rx = new RegExp(field.regex);
      if (!rx.test(strValue)) {
        return `${field.displayName} is formatted incorrectly.`;
      }
    } catch (e) {
      console.warn(`Invalid regex pattern on field ${field.fieldKey}:`, field.regex);
    }
  }

  // 6. Metadata Validation Definition Rules list
  if (field.validationRules && field.validationRules.length > 0) {
    for (const rule of field.validationRules) {
      switch (rule.ruleType) {
        case 'required':
          if (isEmpty) return rule.errorMessage;
          break;
        case 'minLength':
          if (strValue.length < (rule.ruleValue || 0)) return rule.errorMessage;
          break;
        case 'maxLength':
          if (strValue.length > (rule.ruleValue || 0)) return rule.errorMessage;
          break;
        case 'min':
          if (parseFloat(value) < (rule.ruleValue || 0)) return rule.errorMessage;
          break;
        case 'max':
          if (parseFloat(value) > (rule.ruleValue || 0)) return rule.errorMessage;
          break;
        case 'regex':
          try {
            const rx = new RegExp(rule.ruleValue);
            if (!rx.test(strValue)) return rule.errorMessage;
          } catch (e) {}
          break;
      }
    }
  }

  return null;
}

/**
 * Validates a whole form object against metadata field definitions list.
 */
export function validateForm(
  fields: FieldDefinition[],
  formData: Record<string, any>
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    // Only validate active, non-hidden fields
    if (field.hidden || !field.visible) {
      continue;
    }

    const value = formData[field.fieldKey];
    const errorMsg = validateField(field, value, formData);
    if (errorMsg) {
      errors[field.fieldKey] = errorMsg;
    }
  }

  return errors;
}
