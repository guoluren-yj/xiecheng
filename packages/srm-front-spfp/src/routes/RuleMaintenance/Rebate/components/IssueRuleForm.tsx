/*
 * @Description: 计算规则
 * @Author: yan.xie <yan.xie@gong-link.com>
 * @Date: 2023-03-01 12:57:20
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { useContext, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react';

import EditorForm from '../../../Components/EditorForm';
import { Store, issueColumns } from '../Detail/stores';
import { setNewColumnsProps } from '../../../utils';

const IssueRuleForm = observer(() =>
{

  const { ruleDs, editFlag = true, configFieldsArr, modal } = useContext(Store);
  const editorColumns = useMemo(() =>
  {
    return setNewColumnsProps(issueColumns, ruleDs, configFieldsArr);
  }, [ruleDs, configFieldsArr]);
  useEffect(() =>
  {
    ruleDs.setState('issueDisplayFields', editorColumns.map(item => item.name));

  }, [ruleDs, editorColumns]);
  return (
    <EditorForm
      useWidthPercent={!modal}
      dataSet={ruleDs}
      useColon={false}
      columns={3}
      editorFlag={editFlag}
      editorColumns={editorColumns}
    />
  );
});

export default IssueRuleForm;
