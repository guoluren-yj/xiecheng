import React, { useCallback, useContext, useMemo } from 'react';
import { Lov, Select, DatePicker, NumberField } from 'choerodon-ui/pro';

import { Store } from '../stores';
import { HeadCustCodeMap } from '../../utils/type';
import EditorForm from '../../../../components/EditorForm';

const BasicInfo = () => {

  const {
    boolMap,
    headerDs,
    customizeForm,
  } = useContext(Store);

  const paperSystemStatusOptionsFilter = useCallback((record) => {
    return ['NEW', 'NO_NEED_USE'].includes(record.get('value'));
  }, []);


  const editorColumns = useMemo(() => [
    { name: 'paperNum', disabled: !boolMap.createFlag },
    { name: 'companyLov', editor: Lov },
    'companyName',
    { name: 'dataSource', editor: Select },
    { name: 'paperType', editor: Select },
    { name: 'paperStatus', editor: Select },
    { name: 'paperSystemStatus', editor: Select, optionsFilter: paperSystemStatusOptionsFilter },
    { name: 'bankName' },
    { name: 'drawer' },
    { name: 'acceptor' },
    { name: 'payer' },
    { name: 'invoiceDate', editor: DatePicker },
    { name: 'issueDate', editor: DatePicker },
    { name: 'draftsDeadLine', editor: DatePicker },
    { name: 'paperAmount', editor: NumberField },
    'associatePayNum',
    'associateStatementLineNum',
    'sourcePaperNum',
    'createdByName',
    'creationDate',
  ], [
    boolMap,
    paperSystemStatusOptionsFilter,
  ]);

  return (
    <EditorForm
      columns={3}
      useWidthPercent
      useColon={false}
      dataSet={headerDs}
      customizeForm={customizeForm}
      editorColumns={editorColumns}
      editorFlag={boolMap.createFlag || boolMap.editFlag}
      customizeOptions={{ code: HeadCustCodeMap.Basic }}
    />
  );

};

export default BasicInfo;