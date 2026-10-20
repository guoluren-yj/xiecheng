export function getValueField(record, name) {
  return record.dataSet.getField(name).get('valueField', record);
}
