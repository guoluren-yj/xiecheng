export function coverConfig(originConfig = {}, fieldProperty = []) {
  const newConfig = originConfig;
  if (fieldProperty) {
    fieldProperty.forEach(i => {
      newConfig[i.fieldPropertyCode] = !!Number(i.fieldPropertyValue);
    });
  }
  return newConfig;
}
