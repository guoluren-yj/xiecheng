import React, { useMemo, useContext, Fragment } from 'react';
import { observer } from 'mobx-react';
import { Select, Switch } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { Store } from '../Detail';
import DynamicAlert from '../../Components/DynamicAlert';
import EditorForm from '../../Components/EditorForm';


const ToBeInvedMergeRule = observer(() => {

  const { editFlag, formDs } = useContext(Store);

  const mergeRemarkFlag = Number(formDs.current?.get('mergeRemarkFlag'));

  const editorColumns = useMemo(() => {
    return [
      { name: 'mergeDimension', editor: Select },
      { name: 'mergeRemarkFlag', editor: Switch, renderer: ({ value }) => yesOrNoRender(Number(value)) },
      { name: 'mergeRemarkCombo', editor: Select, visible: mergeRemarkFlag === 1 },
    ];
  }, [mergeRemarkFlag]);

  return (
    <Fragment>
      <DynamicAlert
        placement="modal-top"
        message={intl.get('ssta.invoiceRule.view.message.mergeLineAndCuszDimensionTip').d('注意：商品信息、基准单价以及税率完全一致的待开票行才可合并，您可以自定义新增其他合并维度')}
      />
      <EditorForm
        columns={1}
        useColon={false}
        dataSet={formDs}
        editorFlag={editFlag}
        editorColumns={editorColumns}
      />
    </Fragment>
  );
});

export default ToBeInvedMergeRule;