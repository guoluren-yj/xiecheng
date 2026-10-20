import React, { useContext, useEffect, useMemo } from 'react';
import { Lov } from 'choerodon-ui/pro';
import { DataToJSON } from 'choerodon-ui/dataset/data-set/enum';

import { Store } from '../../stores';
import { StatementLineCodeMap } from '../../../utils/type';
import EditorForm from '../../../../../components/EditorForm';
import { statusTagRender } from '../../../../../components/StatusTag';

const StatementLineBepInfo = () => {
  const { boolMap, statementLineDs, customizeForm } = useContext(Store);

  useEffect(() => {
    statementLineDs.dataToJSON = DataToJSON.all;
  }, [statementLineDs]);

  const columns = useMemo(() => {
    return [
      'lineNum',
      'payTypeName',
      'payFormMeaning',
      { name: 'payBankLov', editor: Lov },
      { name: 'payBankBranchName' },
      { name: 'payBankFirm' },
      { name: 'payBankAccountNum' },
      { name: 'payBankAccountName' },
      { name: 'bankLov', editor: Lov },
      { name: 'bankBranchName' },
      { name: 'bankFirm' },
      { name: 'bankAccountNum' },
      { name: 'bankAccountName' },
      'payAmount',
      { name: 'payStatus', disabled: true, renderer: boolMap.editFlag ? ({ text }) => text : statusTagRender },
      'payCommandNum',
      { name: 'bankDirectLinkOrgInfoCode' },
    ];
  }, [boolMap]);

  return (
    <EditorForm
      useWidthPercent
      columns={3}
      useColon={false}
      editorColumns={columns}
      dataSet={statementLineDs}
      editorFlag={boolMap.editFlag}
      customizeForm={customizeForm}
      customizeOptions={{ code: StatementLineCodeMap.BepForm, readOnly: !boolMap.editFlag }}
    />
  );
};

export default StatementLineBepInfo;