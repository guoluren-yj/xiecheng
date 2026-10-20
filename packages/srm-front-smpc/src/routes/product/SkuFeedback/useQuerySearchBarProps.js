import React, { useRef, useMemo } from 'react';
import intl from 'utils/intl';
import QueryField from '../SkuWorkbench/QueryField';

export default function useQuerySearchBarProps(dataSet) {
  const queryRef = useRef();
  return useMemo(() => {
    return {
      onReset: () => {
        if (queryRef.current) queryRef.current.handleClear();
      },
      onClear: () => {
        if (queryRef.current) queryRef.current.handleClear();
      },
      left: {
        render: () => (
          <QueryField
            name="skuCodes"
            dataSet={dataSet}
            onRef={(ref) => {
              queryRef.current = ref;
            }}
            placeholder={intl.get('smpc.product.view.queryMsg.skuCode').d('请输入商品编码查询')}
          />
        ),
      },
    };
  }, [dataSet]);
}
