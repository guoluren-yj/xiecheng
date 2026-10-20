import React, { useContext, memo, useMemo } from 'react';
import { Select } from 'choerodon-ui/pro';

import EditorForm from '@/routes/Components/EditorForm';
import { Store } from '../StoreProvider';

/**
 * @description: 同步支付池配置
 * @param {Object} props
 * @return {*}
 */
export default memo(() => {
  const { editFlag, headerDs } = useContext(Store);


  const eidtorColumns = useMemo(() => {
    return [
      { name: 'paymentSyncPayPlatformType', editor: Select },
    ];
  }, []);

  return (
    <EditorForm
      columns={1}
      useColon={false}
      editorFlag={editFlag}
      dataSet={headerDs}
      editorColumns={eidtorColumns}
    />
  );
});
