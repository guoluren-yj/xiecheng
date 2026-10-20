import React, { useCallback, useContext, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Text } from 'choerodon-ui';
import { AFExtra } from '_components/AFCards';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';

// 头信息基础卡片
const HeaderInfoCmp = observer(() => {
  const {
    depositHeaderDs,
    customizeCommon,
    getCustomizeUnitCode,
  } = useContext<StoreValueType>(Store);

  // 基础卡片字段配置
  const fieldsConfig = {
    sourceDocumentTitle: {
        renderValue({ value, record }) {
        return value && <Text style={{ maxWidth: '350px' }}>{value}-{record.get('sourceDocumentNum')}</Text>;
      },
    },
  };

  return customizeCommon(
    {
      code: getCustomizeUnitCode('extra'),
      processUnitTag: 'AF-EXTRA',
    },
    <AFExtra
        dataSet={depositHeaderDs}
        fieldsConfig={fieldsConfig}
        fields={["supplierCompanyName", "sourceDocumentTitle", "operationRemark"]}
    />
  );
});

export default HeaderInfoCmp;
