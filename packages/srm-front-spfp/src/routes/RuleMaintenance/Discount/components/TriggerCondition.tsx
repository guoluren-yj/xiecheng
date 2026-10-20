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


const TriggerCondition = observer(() => {
  const { ruleDs, editFlag = true, configFieldsArr, changeFlag } = useContext(Store);

  const editColumns = useMemo(() => setNewColumnsProps(triggerColumns, ruleDs, configFieldsArr), [ruleDs, configFieldsArr]);

  useEffect(() => {
    ruleDs.setState('triggerDisplayFields', editColumns.map(item => item.name));
  }, [ruleDs, editColumns]);
  return (
    <EditorForm
      dataSet={ruleDs}
      editorColumns={editColumns}
      editorFlag={editFlag && !changeFlag}
      columns={3}
      style={{ paddingTop: 5 }}
    />
  );
});


export default TriggerCondition;
