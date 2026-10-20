import React, { useContext, useEffect, useCallback } from 'react';
import { CheckBox, Form, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import intl from 'utils/intl';

import type { StoreValueType } from '../stores';
import { Store } from '../stores';

const BasicConfig = observer(() =>
{
  const { enableDs, billDs, reflexDimensionDs, dimensionDs, cumulativeDimensionDs, querySceneInfo } = useContext<StoreValueType>(Store);

  const handlEnableUpdate = useCallback(
    async ({ name, dataSet }) =>
    {
      if (['rebateEnableFlag', 'discountEnableFlag'].includes(name))
      {
        const res = await dataSet.submit();
        if (res)
        {
          // 重新加载一遍页面数据
          billDs.query();
          reflexDimensionDs.query();
          dimensionDs.query();
          cumulativeDimensionDs.query();
          querySceneInfo();
        }
      }
    },
    [billDs, reflexDimensionDs, dimensionDs, cumulativeDimensionDs, querySceneInfo],
  );

  useEffect(() =>
  {
    enableDs.addEventListener('update', handlEnableUpdate);
    return () =>
    {
      enableDs.removeEventListener('update', handlEnableUpdate);
    };
  }, [enableDs, handlEnableUpdate]);

  return (
    <Spin spinning={enableDs.status !== 'ready'}>
      <Form
        columns={3}
        dataSet={enableDs}
        labelLayout={LabelLayout.vertical}>
        <CheckBox name='rebateEnableFlag'>{intl.get(`hzero.common.enable`).d('启用')}</CheckBox>
        <CheckBox name='discountEnableFlag'>{intl.get(`hzero.common.enable`).d('启用')}</CheckBox>
      </Form>
    </Spin>
  );

});

export default BasicConfig;