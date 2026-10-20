// 编制阶段信息
import React, { useMemo } from 'react';
import type { DataSet } from 'choerodon-ui/pro';
import type { Record as DSRecord } from 'choerodon-ui/dataset';
import { NumberField } from 'choerodon-ui/pro';

import EditorForm from '../../../../components/EditorForm';
import { LineDetailCuszCode } from '../../utils/type';

interface BasicProps {
  basicDs: DataSet,
  editFlag?: boolean,
  topRecord: DSRecord,
  customizeForm: Function,
}
const Basic = (props: BasicProps) => {
  const { basicDs, editFlag, topRecord, customizeForm } = props;
  const prepViewType = topRecord?.get('prepViewType');
  const editorColumns = useMemo(() => {
    return [
      ...(prepViewType === 'STAGE' ? [
        'stageNum',
        'stageDesc',
        'stageTypeMeaning',
        {name: 'stageAmount', disabled: true, editor: NumberField},
      ] : [
        'documentNum',
        {name: 'documentAmount', disabled: true, editor: NumberField},
        'termSourceNum',
      ]),
      {name: 'prepPayAmount', disabled: true, editor: NumberField},
      {name: 'prepApplyAmount', disabled: true, editor: NumberField},
      {name: 'balOccupyPayAmount', disabled: true, editor: NumberField},
      {name: 'balEnablePayAmount', disabled: true, editor: NumberField},
      {name: 'balPayAmount', disabled: true, editor: NumberField},
      {name: 'balOccupyApplyAmount', disabled: true, editor: NumberField},
      {name: 'balEnableApplyAmount', disabled: true, editor: NumberField},
      {name: 'balApplyAmount'},
      'balPaymentDate',
      'balPaymentDateLast',
    ];
  }, [prepViewType]);

  return (
    <EditorForm
      useWidthPercent
      columns={3}
      useColon={false}
      dataSet={basicDs}
      editorFlag={editFlag}
      customizeForm={customizeForm}
      editorColumns={editorColumns}
      customizeOptions={{ code: LineDetailCuszCode.Basic }}
    />
  );
};


export default Basic;
