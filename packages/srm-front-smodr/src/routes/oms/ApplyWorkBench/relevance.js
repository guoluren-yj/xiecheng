import React, { useMemo, useEffect, useState } from 'react';
import { DataSet } from 'choerodon-ui/pro';

import RenderForm from '@/routes/components/RenderForm';
import intl from 'utils/intl';
import HeadLine from '@/routes/components/HeadLine';
import Image from '@/components/Image';
import { handleSearchData } from '@/services/oms/applyWorkBenchService';

import styles from './relevance.less';

export default function Relevance(props) {
  const { recordData } = props;
  const ds = useMemo(() => new DataSet(), []);
  const [data, setData] = useState({});
  const renderFields = useMemo(() => [
    {
      name: 'ecOrderCode',
      type: 'string',
      label: intl.get('smodr.apply.model.lineEc').d('电商订单编码-行号'),
    },
    {
      name: 'prNumLine',
      type: 'string',
      label: intl.get('smodr.apply.model.linePur').d('采购申请编码-行号'),
    },
    {
      name: 'poNumLine',
      type: 'string',
      label: intl.get('smodr.apply.model.linePurOrder').d('采购订单编码-行号'),
    },
    {
      name: 'mallOrderCodeLine',
      type: 'string',
      label: intl.get('smodr.apply.model.lineOrder').d('商城订单编码-行号'),
    },
  ], []);
  async function fetchData() {
    const res = await handleSearchData({ requestEntryId: recordData.get('requestEntryId') });
    if (res) {
      setData(res);
      ds.loadData([res]);
    }
  }
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className={styles.releContent}>
      <div className='head'>
        <Image value={data.primaryUrl} width={66} height={66} style={{ marginRight: '8px' }} />
        <div className='label'>
          <div className='sku-name'>{data.skuName}</div>
          <div className='label-code'>{intl.get('smodr.apply.model.skuCode').d('商品编码')}:{data.skuCode}</div>
          <div className='label-code'>{intl.get('smodr.apply.model.requestMallCodeLine').d('商城申请编码-行号')}:{data.mallRequestCodeLine}</div>
        </div>
      </div>
      <HeadLine title={intl.get('smodr.apply.model.relevanceInfo').d('关联信息')} />
      <RenderForm
        dataSet={ds}
        fields={renderFields}
        style={{
          width: '75%',
        }}
      />
    </div>
  );
}
