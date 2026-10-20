/*
 * @Description: 场景字段配置
 * @Author: yan.xie <yan.xie@gong-link.com>
 * @Date: 2023-02-17 12:57:20
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { useContext, useMemo } from 'react';
import { Table } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import type { Record as DSRecord } from 'choerodon-ui/dataset';

import type { StoreValueType } from '../stores';
import { Store } from '../stores';

interface SceneContentProps {
  recordProps: DSRecord;
}

const SceneContent = (props: SceneContentProps) =>
{
  const { recordProps } = props;
  const { fieldDefineDs, sceneMenuDs, remoteProps } = useContext<StoreValueType>(Store);


  const fieldColumns: ColumnProps[] = useMemo(() =>
  {
    const editFlag = remoteProps ? remoteProps.process('SPFP.BASIC_CONFIGURATION_DETAIL_CUX.SCENE_EDIT_FLAG', true, {
      sceneMenuDs,
      recordProps,
    }) : true;
    return [
      { name: 'scenarioInfoType', width: 250 },
      { name: 'displayFlag', width: 100, editor: editFlag },
      { name: 'requiredFlag', width: 100, editor: editFlag },
      { name: 'displayName', editor: editFlag, width: 300 },
      {name: 'bubblePrompt', editor: editFlag, width: 300 },
      { name: 'defaultValue', width: 300, editor: editFlag },
      { name: 'editFlag', editor: editFlag },
    ];

  }, [remoteProps, sceneMenuDs, recordProps]);

  return (
    <div style={{ height: '100%' }}>
      <Table
        dataSet={fieldDefineDs}
        columns={fieldColumns}
        style={{ height: 'calc(100vh - 170px)' }}
      />
    </div>
  );

};

export default SceneContent;
