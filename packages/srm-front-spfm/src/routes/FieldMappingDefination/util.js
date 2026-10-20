import { useState, useEffect } from 'react';

export function useSelect({ dataSet, primaryKey = 'id' }) {
  const [selected, setSelected] = useState([]);

  const handleSelect = () => {
    setSelected(dataSet.selected.map((item) => (item.toData() || {})[primaryKey]));
  };

  useEffect(() => {
    dataSet.addEventListener('select', handleSelect);
    dataSet.addEventListener('unSelect', handleSelect);
    dataSet.addEventListener('selectAll', handleSelect);
    dataSet.addEventListener('unSelectAll', handleSelect);
  }, []);

  return { selected, dataSet };
}
