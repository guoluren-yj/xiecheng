import React, { useMemo, useContext } from 'react';
import { observer } from 'mobx-react';
import {
  IntlField,
  Lov,
  Output,
  DatePicker,
} from 'choerodon-ui/pro';

import intl from 'utils/intl';

import EditorForm from '../../../Components/EditorForm';
import { Store } from '../Detail/stores';
import { statusTagRender } from '../../../../utils/renderer';
import { StatusColorMap } from '../utils/type';
import { setNewColumnsProps } from '../../../utils';

const SceneInfo = observer(() => {
  const { ruleDs, editFlag = true, modal, changeFlag, configFieldsArr, discountRemote } = useContext(Store);

  const ruleId = ruleDs?.current?.get('ruleId');

  const formColumns = useMemo(() => [
    'ruleNum',
    { name: 'ruleName', editor: IntlField },
    { name: 'scenarioConfigIdLov', editor: Lov, disabled: ruleId },
    {
      name: 'date',
      editor: DatePicker,
      changeFlag,
    },
    'sourceType',
    'versionNumber',
    'createdByName',
    !modal && !editFlag && {
      name: 'ruleStatus',
      editor: Output,
      renderer: ({ value, text }) => {
        const { ruleStatus, enableFlag } = ruleDs?.current?.get(['ruleStatus', 'enableFlag', 'ruleStatusMeaning']) || {};
        const disabledStatus = ruleStatus === 'PUBLISHED' && !enableFlag ? 'DISABLED' : undefined;
        return value ?
          statusTagRender(
            disabledStatus ? intl.get('hzero.common.status.alreadyDisabled').d('已禁用') : text,
            StatusColorMap[disabledStatus || ruleStatus]
          )
          : null;
      },
    },
  ].filter(item => item), [ruleId, modal, editFlag, changeFlag, ruleDs]);

  const editColumns = useMemo(() => setNewColumnsProps(formColumns, ruleDs, configFieldsArr), [ruleDs, configFieldsArr, formColumns]);

  return (
    <EditorForm
      columns={3}
      dataSet={ruleDs}
      editorFlag={editFlag}
      editorColumns={discountRemote ? discountRemote.process('SPFP.RULE_DISCOUNT_DETAIL_CUX.SCENE_INFO', editColumns, {
        ruleDs,
      })
    : editColumns}

    />
  );
});
export default SceneInfo;
