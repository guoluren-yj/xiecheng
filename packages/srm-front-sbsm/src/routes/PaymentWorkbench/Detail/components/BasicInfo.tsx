import React, { useContext, useMemo } from 'react';
import { TextArea } from 'choerodon-ui/pro';

import { Store } from '../stores';
import { HeadCustCodeMap } from '../../utils/type';
import EditorForm from '../../../../components/EditorForm';
import { statusTagRender } from '../../../../components/StatusTag';

const BasicInfo = () => {

  const {
    boolMap,
    headerDs,
    customizeForm,
  } = useContext(Store);

  const payStatus = headerDs.current?.get('payStatus');

  const editorColumns = useMemo(() => {
    return [
      'payNum',
      { name: 'payStatus', disabled: true, renderer: boolMap.editFlag ? ({ text }) => text : statusTagRender },
      'companyNum',
      'companyName',
      'ouName',
      'displaySupplierNum',
      'displaySupplierName',
      'supplierSiteName',
      'currencyCode',
      'payTypeName',
      'payForm',
      'payAmount',
      'createdByName',
      'creationDate',
      'approveBatchNum',
      { name: 'remark', editor: TextArea, newLine: true, colSpan: 2, resize: 'virtual' },
      ['CANCEL', 'PAY_CANCEL'].includes(payStatus) && { name: 'cancelReason', newLine: true, colSpan: 2 },
      ['REVERSED', 'REVERSING'].includes(payStatus) && { name: 'reverseReason', newLine: true, colSpan: 2 },
    ];
  }, [boolMap, payStatus]);

  return (
    <EditorForm
      useWidthPercent
      columns={3}
      useColon={false}
      dataSet={headerDs}
      editorFlag={boolMap.editFlag}
      customizeForm={customizeForm}
      editorColumns={editorColumns}
      customizeOptions={{ code: HeadCustCodeMap.Basic, readOnly: !boolMap.editFlag }}
    />
  );
};

export default BasicInfo;