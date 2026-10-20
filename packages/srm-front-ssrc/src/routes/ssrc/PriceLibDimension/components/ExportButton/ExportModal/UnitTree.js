import React, { useEffect, useCallback } from 'react';
import { Tree } from 'choerodon-ui/pro';

const UnitTree = ({ treeDs, onCheck }) => {
  useEffect(() => {
    // 已发布状态
    treeDs.setQueryParameter('templateStatus', 'RELEASED');
    treeDs.query();
  }, []);

  const nodeRenderer = useCallback(({ record }) => {
    return <span>{record.get('templateName')}</span>;
  }, []);

  return (
    <>
      <Tree
        showLine={{
          showLeafIcon: false,
        }}
        showIcon={false}
        checkable
        dataSet={treeDs}
        renderer={nodeRenderer}
        onCheck={onCheck}
      />
    </>
  );
};

export default UnitTree;
