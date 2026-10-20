import React, { useMemo, useEffect } from 'react';
import { Content } from 'components/Page';
import { DataSet } from 'choerodon-ui/pro';
import FormPro from '../SkuDetail/FormPro';
import { skuInfoDs } from '../SkuDetail/ds';
import customStore from './customStore';

export default function ItemInfo({ sku, title }) {
  const dataSet = useMemo(() => new DataSet(skuInfoDs()), []);
  const prexCode = sku.sourceFrom === 'CATA' ? 'CATA' : 'EC';
  const { customizeForm } = customStore.getCustFuncs();
  const customizeCode = customStore.getCustomCode(`${prexCode}_ITEM_INFO`);
  useEffect(() => {
    dataSet.loadData([sku]);
  }, [sku]);
  return (
    <Content>
      <div className="item-info">
        <div className="part-title">{title}</div>
        <FormPro
          readOnly
          dataSet={dataSet}
          columns={3}
          customizeForm={customizeForm}
          customizeCode={customizeCode}
          fields={[
            { name: 'itemCode' },
            { name: 'itemName' },
            { name: 'itemCategoryCode' },
            { name: 'itemCategoryName' },
          ]}
        />
      </div>
    </Content>
  );
}
