// 编制阶段信息
import React, { useMemo, useContext } from 'react';
import type { DataSet } from 'choerodon-ui/pro';
import { NumberField } from 'choerodon-ui/pro';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import EditorForm from '../../../../components/EditorForm';
import { DetailCustomizeCode } from '../../utils/type';
// import { statusTagRender } from '../../../../components/StatusTag';

interface InfoProps {
    preStageInfoDs: DataSet,
}
const AdjustBasicInfo = (props: InfoProps) => {
  const { preStageInfoDs } = props;
  const { editFlag, customizeForm, headerDs } = useContext<StoreValueType>(Store);
  const { prepViewType } = headerDs.current?.get(['prepViewType']) || {};

  const editorColumns = useMemo(() => {
    return [
      ...(
        prepViewType === 'STAGE' ? [
          'stageNum',
          'stageDesc',
          'stageType',
          {name: 'stageAmount', disabled: true, editor: NumberField},
        ] : [
          {name: 'documentNum', disabled: true, renderer: ({ text, record}) => {
            const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
              return displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : text;
          }},
          {name: 'prepSourceAmount', disabled: true, editor: NumberField},
          'prepSource',
        ]
      ),
      {name: 'prefabPayAmount', disabled: true, editor: NumberField},
      {name: 'prefabApplyAmount', disabled: true, editor: NumberField},
      {name: 'prepOccupyPayAmount', disabled: true, editor: NumberField},
      {name: 'prepEnablePayAmount', disabled: true, editor: NumberField},
      {name: 'prepPayAmount', disabled: true, editor: NumberField},
      {name: 'prepOccupyApplyAmount', disabled: true, editor: NumberField},
      {name: 'prepEnableApplyAmount', disabled: true, editor: NumberField},
      {name: 'prepApplyAmount', disabled: true, editor: NumberField},
      'prepPaymentDate',
      'prepPaymentDateLast',
    ];
  }, [prepViewType]);

  return (
    <EditorForm
      useWidthPercent
      columns={3}
      useColon={false}
      dataSet={preStageInfoDs}
      editorFlag={editFlag}
      customizeForm={customizeForm}
      editorColumns={editorColumns}
      customizeOptions={{ code: DetailCustomizeCode.PreStageInfoCode, readOnly: true }}
    />
  );
};


export default AdjustBasicInfo;
