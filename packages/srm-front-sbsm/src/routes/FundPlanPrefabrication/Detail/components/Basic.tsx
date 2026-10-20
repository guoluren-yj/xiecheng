import React, { useMemo, useContext } from 'react';
import { observer } from 'mobx-react';
import { NumberField } from 'choerodon-ui/pro';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import EditorForm from '../../../../components/EditorForm';
import { StageAllDetailBasicCode } from '../../utils/type';
import { statusTagRender } from '../../../../components/StatusTag';

const Basic = () => {
  const {
    termDetailDs,
    customizeForm,
  } = useContext<StoreValueType>(Store);
  const { controlDimension } = termDetailDs.current?.get(['controlDimension']) || {};

  const editorColumns = useMemo(() => {
    return [
      {name: 'docTermStatus', disabled: true, renderer: statusTagRender },
      'docTermNum',
      'termVersionNumber',
      'controlDimension',
      ['ORDER'].includes(controlDimension) && {
        name: 'sourceDocNum',
        disabled: true,
        renderer: ({ text, record}) => `${record?.get('displaySourceDocNum') || record?.get('displayPoNum') || text}`,
      },
      ['PO_LINE'].includes(controlDimension) && {
        name: 'sourceDocLineNum',
        disabled: true,
        renderer: ({ text, record}) => `${record?.get('displaySourceDocNum') || record?.get('displayPoNum') || record?.get('sourceDocNum')}-${record?.get('displaySourceDocLineNum') || record?.get('displayLineNum') || text}`,
      },
      'amountComputeRule',
      'termNum',
      'termName',
      'currencyCode',
      {name: 'sourceDocAmount', disabled: true, editor: NumberField},
      {name: 'docTermAmount', disabled: true, editor: NumberField},
      {name: 'diffAmount', disabled: true, editor: NumberField},
      'stageEffectiveDate',
    ];
  }, [controlDimension]);

  return (
    <EditorForm
      useWidthPercent
      columns={3}
      useColon={false}
      dataSet={termDetailDs}
      editorFlag={false}
      customizeForm={customizeForm}
      editorColumns={editorColumns}
      customizeOptions={{ code: StageAllDetailBasicCode, readOnly: true }}
    />
  );
};


export default observer(Basic);
