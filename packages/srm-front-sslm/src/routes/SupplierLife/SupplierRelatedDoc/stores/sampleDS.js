/**
 * sampleDS - 送样申请DS
 * @date: 2020-12-15
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React from 'react';
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import { renderStatus } from '@/routes/components/utils';

const organizationId = getCurrentOrganizationId();

const sampleDS = () => ({
  pageSize: 20,
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      name: 'reqStatus',
      label: intl.get('sslm.sample.model.reqStatusMeaning').d('单据状态'),
    },
    {
      name: 'reqNum',
      label: intl.get('sslm.sample.model.reqNum').d('申请单号'),
    },
    {
      name: 'reqNumRe',
      label: intl.get('sslm.sample.model.reqNum').d('申请单号'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.sample.model.companyName').d('公司'),
    },
    {
      name: 'ouName',
      label: intl.get('sslm.sample.model.ouName').d('业务实体'),
    },
    {
      name: 'organizationName',
      label: intl.get('sslm.sample.model.organizationName').d('库存组织'),
    },
    {
      name: 'supplierNum',
      type: 'object',
      label: intl.get('sslm.sample.model.supplierNum').d('供应商编码'),
    },
    {
      name: 'supplierName',
      label: intl.get('sslm.sample.model.supplierName').d('供应商名称'),
    },
    {
      name: 'supplierTypeCode',
      label: intl.get('sslm.sample.model.supplierTypeCodeMeaning').d('供应商类型'),
    },
    {
      name: 'originFactoryName',
      label: intl.get('sslm.sample.model.originFactoryName').d('原厂名称'),
    },
    {
      name: 'typeCode',
      label: intl.get('sslm.sample.model.typeCodeMeaning').d('送样类型'),
    },
    {
      name: 'reqUserName',
      label: intl.get('sslm.sample.model.reqUserName').d('申请人'),
    },
    {
      name: 'reqUserPhone',
      label: intl.get('sslm.sample.model.reqUserPhone').d('申请人联系电话'),
    },
    {
      name: 'recUserName',
      label: intl.get('sslm.sample.model.recUserName').d('接样人'),
    },
    {
      name: 'recUserPhone',
      label: intl.get('sslm.sample.model.recUserPhone').d('接样人联系电话'),
    },
    {
      name: 'sampleSendAddress',
      label: intl.get('sslm.sample.model.sampleSendAddress').d('送样地址'),
    },
    {
      name: 'sendUserName',
      label: intl.get('sslm.sample.model.sample.sendUser').d('送样人'),
    },
    {
      name: 'sendUserPhone',
      label: intl.get('sslm.sample.model.sendUserPhone').d('送样人联系电话'),
    },
    {
      name: 'sendTypeCode',
      label: intl.get('sslm.sample.model.sendTypeCodeMeaning').d('送样方式'),
    },
    {
      name: 'trackingNumber',
      label: intl.get('sslm.sample.model.trackingNumber').d('快递单号'),
    },
    {
      name: 'expectedDeliveryDate',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.expectedDeliveryDate').d('预计送达时间'),
    },
    {
      name: 'urgencyDegree',
      label: intl.get('sslm.sample.model.urgencyDegreeMeaning').d('紧急程度'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.creationDate').d('创建时间'),
    },
    {
      name: 'releaseDate',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.releaseDate').d('发布时间'),
    },
    {
      name: 'feedbackDate',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.feedbackDate').d('反馈时间'),
    },
    {
      name: 'remark',
      label: intl.get('sslm.sample.model.remark').d('备注'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params = {}, ...other } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/pageSampleSendReq/fetch/purchase`,
        method: 'GET',
        data: filterNullValueObject({ ...params, ...other }),
      };
    },
  },
});

// 送样申请Columns
const sampleColumns = ({ jumpSample }) => [
  {
    name: 'reqStatus',
    width: 100,
    renderer: renderStatus,
  },
  {
    name: 'reqNum',
    width: 140,
    renderer: ({ value, record }) => {
      const { data: { reqId, reqStatus } = {} } = record;
      return <a onClick={() => jumpSample({ reqId, reqStatus })}>{value}</a>;
    },
  },
  {
    name: 'reqNumRe',
    width: 140,
    renderer: ({ record }) => {
      const { reqId, reqStatus, reqNum } = record.get(['reqId', 'reqStatus', 'reqNum']);
      return <a onClick={() => jumpSample({ reqId, reqStatus, openTabFlag: true })}>{reqNum}</a>;
    },
  },
  {
    name: 'supplierNum',
    width: 120,
  },
  {
    name: 'supplierName',
    width: 200,
  },
  {
    name: 'companyName',
    width: 200,
  },
  {
    name: 'ouName',
    width: 200,
  },
  {
    name: 'organizationName',
    width: 200,
  },
  {
    name: 'supplierTypeCode',
    width: 120,
    renderer: ({ record }) => record.get('supplierTypeCodeMeaning'),
  },
  {
    name: 'originFactoryName',
    width: 160,
  },
  {
    name: 'typeCode',
    width: 120,
    renderer: ({ record }) => record.get('typeCodeMeaning'),
  },
  {
    name: 'reqUserName',
    width: 100,
  },
  {
    name: 'reqUserPhone',
    width: 140,
  },
  {
    name: 'recUserName',
    width: 100,
  },
  {
    name: 'recUserPhone',
    width: 140,
  },
  {
    name: 'sampleSendAddress',
    width: 200,
  },
  {
    name: 'sendUserName',
    width: 100,
  },
  {
    name: 'sendUserPhone',
    width: 140,
  },
  {
    name: 'sendTypeCode',
    width: 100,
    renderer: ({ record }) => record.get('sendTypeCodeMeaning'),
  },
  {
    name: 'trackingNumber',
    width: 160,
  },
  {
    name: 'expectedDeliveryDate',
    width: 150,
  },
  {
    name: 'urgencyDegree',
    width: 100,
    renderer: ({ record }) => record.get('urgencyDegreeMeaning'),
  },
  {
    name: 'creationDate',
    width: 150,
  },
  {
    name: 'releaseDate',
    width: 150,
  },
  {
    name: 'feedbackDate',
    width: 150,
  },
  {
    name: 'remark',
    width: 200,
  },
];

export { sampleDS, sampleColumns };
