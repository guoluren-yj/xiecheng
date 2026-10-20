import React, { useMemo, useContext } from 'react';

import { Store } from '../stores';
import EditorForm from '../../../../components/EditorForm';
import { ErrorHeadCustCodeMap, HeadCustCodeMap } from '../../utils/type';

const Counterparty = () => {
  const {
    boolMap,
    headerDs,
    customizeForm,
  } = useContext(Store);

  const editorColumns = useMemo(() => {
    return [
      'companyNum',
      'companyName',
      'displaySupplierNum',
      'displaySupplierName',
      'payBankName',
      'payBankBranchName',
      'payBankFirm',
      'payBankAccountNum',
      'payBankAccountName',
      'bankName',
      'bankBranchName',
      'bankFirm',
      'bankAccountNum',
      'bankAccountName',
      'ouName',
      'supplierSiteName',
    ];
  }, []);

  return (
    <EditorForm
      useWidthPercent
      columns={3}
      useColon={false}
      dataSet={headerDs}
      customizeForm={customizeForm}
      editorColumns={editorColumns}
      customizeOptions={{ code: boolMap.errorFlag ? ErrorHeadCustCodeMap.Counterparty : HeadCustCodeMap.Counterparty }}
    />
  );
};

export default Counterparty;