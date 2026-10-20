export default function applyRecord() {
  const record = {};
  return [
    record,
    (key, value) => {
      return record[key] = value;
    },
    (key) => delete record[key],
  ];
}
