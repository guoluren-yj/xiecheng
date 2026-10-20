import React, { useContext, useMemo } from 'react';
import { observer } from 'mobx-react';
import { Select, Lov } from 'choerodon-ui/pro';

import type { StoreValueType } from '../stores';
import { Store } from '../stores';
import { DetailCustomizeCode } from '../utils/type';
import EditorForm from '../../../components/EditorForm';
import { statusTagRender } from '../../../components/StatusTag';


const BasicInfo = () => {

  const { sourceDocHeaderDs, customizeForm, editFlag, sourceDocListDs } = useContext<StoreValueType>(Store);

  const { controlDimension, dtAmount, dtLineAmount } = sourceDocHeaderDs.current?.get(['controlDimension', 'dtAmount', 'dtLineAmount']) || {};

  const editorColumns = useMemo(() => {
    return [
      {name: 'docTermStatus', disabled: true, renderer: !editFlag ? statusTagRender : ({ text }) => text },
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
      {name: 'amountComputeRule', editor: Select, disabled: !editFlag },
      {name: 'termNumLov', editor: Lov, disabled: !editFlag,
        onChange: (record) => {
          const { amountComputeMode, termLineList = [], autoFillFieldDTO={} } = record || {};
          if (sourceDocHeaderDs.current) {
            sourceDocHeaderDs.current.set({
              existStageFlag: 1,
              amountComputeRule: amountComputeMode,
              ...autoFillFieldDTO,
            });
            const lineList = termLineList?.map((item) => {
              item.amountComputeRule = amountComputeMode;
              item.dtAmount = dtAmount;
              item.dtLineAmount = dtLineAmount;
              return {
                ...item,
                ...item?.autoFillFieldDTO,
              };
            });
            // @ts-ignore
            const docTermLineListDs = sourceDocHeaderDs.current.children?.docTermLineList;
            // eslint-disable-next-line no-unused-expressions
            docTermLineListDs?.loadData(lineList || []);
            sourceDocListDs.loadData(lineList || []);
          }
        },
      },
      'termName',
      'currencyCode',
      ['ORDER'].includes(controlDimension) && 'dtAmount',
      ['PO_LINE'].includes(controlDimension) && 'dtLineAmount',
      'docTermAmount',
      'diffAmount',
    ];
  }, [editFlag, controlDimension, sourceDocHeaderDs, sourceDocListDs, dtAmount, dtLineAmount]);

  return (
    <EditorForm
      useWidthPercent
      columns={3}
      useColon={false}
      editorFlag={editFlag}
      dataSet={sourceDocHeaderDs}
      editorColumns={editorColumns}
      customizeForm={customizeForm}
      customizeOptions={{ code: DetailCustomizeCode.BASIC }}
    />
  );
};

export default observer(BasicInfo);
