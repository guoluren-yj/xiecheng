import React, { useMemo, useContext } from 'react';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import EditorForm from '../../../../components/EditorForm';
import { DetailBasicCode } from '../../utils/type';
import { statusTagRender } from '../../../../components/StatusTag';

const Basic = () => {
  const {
    stageTermDetailDs,
    customizeForm,
  } = useContext<StoreValueType>(Store);
  const { controlDimension } = stageTermDetailDs.current?.get(['controlDimension']) || {};

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
      'sourceAmount',
      'docTermAmount',
      'diffAmount',
      'poConfirmedDate',
    ];
  }, [controlDimension]);

  return (
    <EditorForm
      useWidthPercent
      columns={3}
      useColon={false}
      dataSet={stageTermDetailDs}
      editorFlag={false}
      customizeForm={customizeForm}
      editorColumns={editorColumns}
      customizeOptions={{ code: DetailBasicCode, readOnly: true }}
    />
  );
};


export default Basic;
