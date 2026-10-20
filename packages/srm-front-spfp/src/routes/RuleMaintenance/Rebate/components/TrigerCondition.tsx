/*
 * @Description: 触发条件
 * @Author: yan.xie <yan.xie@gong-link.com>
 * @Date: 2023-03-01 12:57:20
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { useContext, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react';

import EditorForm from '../../../Components/EditorForm';
import { Store, triggerColumns } from '../Detail/stores';
import { setNewColumnsProps } from '../../../utils';

const TrigerCondition = observer(() =>
{
  const { ruleDs, editFlag = true, configFieldsArr, modal } = useContext(Store);

  const editColumns = useMemo(() => setNewColumnsProps(triggerColumns, ruleDs, configFieldsArr), [ruleDs, configFieldsArr]);

  useEffect(() =>
  {
    ruleDs.setState('triggerDisplayFields', editColumns.map(item => item.name));

  }, [ruleDs, editColumns]);
  return (
    <EditorForm
      useWidthPercent={!modal}
      dataSet={ruleDs}
      editorColumns={editColumns}
      editorFlag={editFlag}
      columns={3}
    />
  );
});


export default TrigerCondition;
