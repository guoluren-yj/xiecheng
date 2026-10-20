import React, { useEffect } from 'react';
import { getCurrentOrganizationId } from 'utils/utils';
import { DataSet, Table, Output, Form } from 'choerodon-ui/pro';
import { SRM_SPUC } from '_utils/config';
import intl from 'utils/intl';
import { useUomRender } from './hooks';

const organizationId = getCurrentOrganizationId();

function BomModal(params) {
  const { asnHeaderId, asnLineId, itemName, itemCode } = params;
  const bomDs = new DataSet({
    dataToJSON: 'all',
    autoQuery: false,
    selection: false,
    fields: [
      {
        name: 'orderSeq',
        label: intl.get(`sinv.common.model.common.orderSeq`).d('序号'),
      },
      {
        name: 'itemCode',
        label: intl.get(`entity.item.code`).d('物料编码'),
      },
      {
        name: 'itemName',
        label: intl.get(`entity.item.name`).d('物料名称'),
      },
      {
        name: 'categoryName',
        label: intl.get(`entity.item.type`).d('物料类别'),
      },
      {
        label: intl.get(`sinv.common.model.common.refQuantity`).d('参考数量'),
        name: 'refQuantity',
      },
      {
        name: 'quantity',
        label: intl.get(`sinv.common.model.common.demandQuantity`).d('需求数量'),
        type: 'number',
      },
      {
        name: 'uomName',
        label: intl.get(`sinv.common.model.common.uomId`).d('单位'),
      },
      {
        name: 'invOrganizationName',
        label: intl.get(`sinv.common.model.common.invOrganization`).d('收货组织'),
      },
      {
        name: 'needByDate',
        label: intl.get(`sinv.common.model.common.needByDate`).d('需求日期'),
        type: 'date',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_SPUC}/v1/${organizationId}/po-item-boms?poHeaderId=${asnHeaderId}&poLineId=${asnLineId}`,
          method: 'GET',
        };
      },
    },
  });

  useEffect(() => {
    bomDs.query();
  }, []);

  const columns = [
    {
      name: 'orderSeq',
      width: 80,
    },
    {
      name: 'itemCode',
      width: 100,
    },
    {
      name: 'itemName',
      width: 120,
    },
    {
      width: 120,
      name: 'categoryName',
    },
    {
      width: 120,
      name: 'refQuantity',
    },
    {
      width: 100,
      name: 'quantity',
    },
    {
      width: 120,
      name: 'uomName',
      renderer: useUomRender(),
    },
    {
      width: 120,
      name: 'invOrganizationName',
    },
    {
      width: 120,
      name: 'needByDate',
    },
  ];
  return (
    <>
      <Form columns={4} labelLayout="vertical" style={{ marginBottom: '16px' }}>
        <Output
          label={intl.get('sinv.common.model.common.itemCode').d('物料编码')}
          value={itemCode}
        />
        <Output
          label={intl.get('sinv.common.model.common.itemName').d('物料名称')}
          value={itemName}
        />
      </Form>
      <Table dataSet={bomDs} columns={columns} />
    </>
  );
}

export default BomModal;
