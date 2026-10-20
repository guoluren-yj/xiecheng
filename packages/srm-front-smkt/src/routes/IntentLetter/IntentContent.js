import React, { useMemo, useEffect } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import Card from '@/components/Card';
import FormPro from '@/components/FormPro';
import Image from '@/components/Image';
import { getIntentSkuDsProps } from './ds';

function IntentSku({ letterId }) {
  const dataSet = useMemo(() => new DataSet(getIntentSkuDsProps()), []);

  useEffect(() => {
    dataSet.setQueryParameter('letterId', letterId);
    dataSet.query();
  }, [letterId]);

  const columns = [
    {
      name: 'skuImageUrl',
      width: 100,
      renderer: ({ value }) => <Image value={value} width={32} height={32} />,
    },
    { name: 'intentSkuCode', width: 120 },
    { name: 'intentSkuName', minWidth: 180 },
    { name: 'skuPrice', width: 160 },
  ];
  return (
    <>
      <div style={{ color: 'rgba(0, 0, 0, 0.65)', lineHeight: 1.5, margin: '16px 0 4px' }}>
        {intl.get('smkt.supplierManage.view.intentSku').d('意向商品')}
      </div>
      <Table columns={columns} dataSet={dataSet} rowHeight={38} />
    </>
  );
}

export default function IntentContent(props) {
  const { dataSet, letterId } = props;
  return (
    <Card
      style={{ marginTop: 32 }}
      title={intl.get('smkt.supplierManage.view.title.intentContent').d('意向内容')}
    >
      <FormPro
        readOnly
        dataSet={dataSet}
        fields={[
          {
            name: 'letterRemark',
          },
          {
            name: 'intentCatalogs',
          },
        ]}
      />
      <IntentSku letterId={letterId} />
    </Card>
  );
}
