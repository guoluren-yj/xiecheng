import React, { useMemo, useContext } from 'react';

import { Store } from '../stores';
import EditorForm from '../../../../components/EditorForm';
import { statusTagRender } from '../../../../components/StatusTag';
import { ErrorHeadCustCodeMap, HeadCustCodeMap } from '../../utils/type';

const Transaction = () => {
  const {
    boolMap,
    headerDs,
    customizeForm,
  } = useContext(Store);

  const editorColumns = useMemo(() => {
    return [
      boolMap.errorFlag ? 'payErrorNum' : 'payNum',
      'documentSystemMeaning',
      'documentTypeMeaning',
      'payAmount',
      'currencyCode',
      'payTypeName',
      'payFormMeaning',
      'exPaymentDate',
      { name: 'payStatus', renderer: statusTagRender },
      'documentNum',
      'documentLineNum',
      'itemCode',
      'itemName',
      'srmPoNum',
      'srmPoLineNum',
      'pcNum',
      'pcSubjectLineNum',
      'agentName',
      'createdByName',
      'creationDate',
    ];
  }, [boolMap]);

  return (
    <EditorForm
      useWidthPercent
      columns={3}
      useColon={false}
      dataSet={headerDs}
      customizeForm={customizeForm}
      editorColumns={editorColumns}
      customizeOptions={{ code: boolMap.errorFlag ? ErrorHeadCustCodeMap.Transaction : HeadCustCodeMap.Transaction }}
    />
  );
};

export default Transaction;