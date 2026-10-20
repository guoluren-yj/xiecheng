export const flagNames = {
  importCheckFlag: '__importCheckFlag',
};

export function lovFieldSet({ record, lovViewInfo, lovFieldName = 'defaultValue_LOV' }) {
  const lovField = record.getField(lovFieldName);
  if (lovField && lovViewInfo && lovViewInfo.valueField && lovViewInfo.displayField) {
    lovField.set('valueField', lovViewInfo.valueField);
    lovField.set('textField', lovViewInfo.displayField);
  }
}
