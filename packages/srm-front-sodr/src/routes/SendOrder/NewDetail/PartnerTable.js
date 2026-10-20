import { memo, useContext, useMemo } from 'react';
import { useTable } from './hooks';
import { Store } from './stores';

const PartnerTable = function PartnerTable() {
  const { partnerDs } = useContext(Store);
  const columns = useMemo(
    () => [
      {
        name: 'partnerType',
        width: 150,
      },
      {
        name: 'partnerNum',
        width: 120,
      },
      {
        name: 'partnerName',
        width: 120,
      },
      {
        name: 'externalSystemCode',
        width: 120,
      },
    ],
    []
  );
  return useTable(partnerDs, columns);
};

export default memo(PartnerTable);
