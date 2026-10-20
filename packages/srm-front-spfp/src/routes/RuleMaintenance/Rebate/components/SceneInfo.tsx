/*
 * @Description: 折扣/返利场景
 * @Author: yan.xie <yan.xie@gong-link.com>
 * @Date: 2023-03-01 12:57:20
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { useMemo, useContext } from 'react';
import { observer } from 'mobx-react';
import
{
  IntlField,
  Lov,
  DatePicker,
} from 'choerodon-ui/pro';

import EditorForm from '../../../Components/EditorForm';
import { Store } from '../Detail/stores';
import { setNewColumnsProps } from '../../../utils';
import { statusTagRender } from '../../../Components/StatusTag';

const SceneInfo = observer(() =>
{
  const { ruleDs, editFlag = true, modal, changeFlag, configFieldsArr, remoteProps } = useContext(Store);

  const { ruleId, ruleStatus } = ruleDs?.current?.get(['ruleId', 'ruleStatus']) || {};

  const formColumns = useMemo(() => [
    'ruleNum',
    { name: 'ruleName', editor: IntlField },
    { name: 'scenarioConfigIdLov', editor: Lov, disabled: ruleId },
    {
      name: 'date',
      editor: DatePicker,
      changeFlag,
      aliasFieldName: 'startDate',
    },
    'sourceType',
    'versionNumber',
    !modal && !editFlag && {
      name: 'displayStatus',
      renderer: statusTagRender,
    },
    ruleStatus === 'PUBLISHED' && 'publishedByName',
    ruleStatus === 'PUBLISHED' && 'publishedDate',
  ].filter(item => item), [ruleId, modal, editFlag, changeFlag, ruleStatus]);

  const editColumns = useMemo(() => setNewColumnsProps(formColumns, ruleDs, configFieldsArr), [ruleDs, configFieldsArr, formColumns]);

  return (
    <EditorForm
      useWidthPercent={!modal}
      columns={3}
      dataSet={ruleDs}
      editorFlag={editFlag}
      editorColumns={remoteProps ? remoteProps.process('SPFP.RULE_REBATE_DETAIL_CUX.SCENE_INFO', editColumns, {
        ruleDs,
      })
    : editColumns}

    />
  );
}
);
export default SceneInfo;
