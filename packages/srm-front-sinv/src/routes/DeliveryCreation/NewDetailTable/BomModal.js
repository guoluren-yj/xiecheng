import React, { useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import { bomDataSet } from './BomDs';

import { saveBOM } from '@/services/deliveryCreationService';

const BomModal = forwardRef((props, ref) => {
  const { asnHeaderId, asnLineId } = props;
  const bomDs = useMemo(() => new DataSet(bomDataSet()), [asnHeaderId]);

  useEffect(() => {
    bomDs.setQueryParameter('params', {
      functionCode: 'ASN_MAINTAIN',
      poHeaderId: asnHeaderId, // 接口为订单接口 涉及接口复用，所以送货单id 使用订单id名称 有问题：找后端
      poLineId: asnLineId, // 接口为订单接口 涉及接口复用，所以送货单id 使用订单id名称 有问题：找后端
    });
    bomDs.query();
  }, [asnHeaderId]);

  useImperativeHandle(ref, () => ({
    ref: ref.current,
    saveOnChange,
  }));

  const saveOnChange = async () => {
    const data = bomDs.toData();
    const flag = await bomDs.validate();
    if (flag) {
      const res = await saveBOM(data);
      if (getResponse(res)) {
        notification.success();
        bomDs.query();
      }
      return false;
    } else {
      return false;
    }
  };

  const columns = [
    {
      name: 'orderSeq',
      with: 120,
    },
    {
      name: 'itemCode',
      with: 120,
    },
    {
      name: 'itemName',
      with: 120,
    },
    {
      name: 'categoryName',
      with: 120,
    },
    {
      name: 'refQuantity',
      with: 120,
    },
    {
      name: 'quantity',
      with: 120,
      editor: true,
    },
    {
      name: 'uomName',
      with: 120,
      renderer: ({ record }) =>
        record?.get('uomName') && record?.get('uomCode') ? (
          <span>{`${record?.get('uomCode')}/${record?.get('uomName')}`}</span>
        ) : null,
    },
    {
      name: 'invOrganizationName',
      with: 120,
    },
    {
      name: 'needByDate',
      with: 120,
    },
  ];
  return (
    <Table
      columns={columns}
      dataSet={bomDs}
      style={{ maxHeight: `calc(100vh - 400px)` }}
      virtual
      virtualCell
    />
  );
});

export default BomModal;
