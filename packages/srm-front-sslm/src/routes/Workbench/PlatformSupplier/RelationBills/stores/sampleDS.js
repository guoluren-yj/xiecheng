/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-08-24 11:36:49
 * @FilePath: /srm-front-sslm/src/routes/Workbench/PlatformSupplier/RelationBills/stores/sampleDS.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import querystring from 'querystring';
import React, { Fragment } from 'react';
import { Link } from 'dva/router';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import { renderStatus } from '@/routes/components/utils';

const organizationId = getCurrentOrganizationId();

const jumpDetail = ({ record }) => {
  const { reqId, reqStatus } = record.get(['reqId', 'reqStatus']);
  openTab({
    key: `/sslm/include/buyer-apply-query/detail/${reqId}/${reqStatus}`,
    title: intl.get('sslm.sample.view.title.sampleApplyCheck').d('送样申请单查看'),
    search: querystring.stringify({
      openTab: 1,
    }),
  });
};

const sampleDS = params => ({
  pageSize: 20,
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      name: 'reqStatus',
      label: intl.get('hzero.common.status').d('状态'),
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
      name: 'option',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'supplierName',
      label: intl.get('sslm.sample.model.supplierName').d('供应商名称'),
    },
    {
      name: 'companyAndOuAndOrganizationName',
      label: intl.get('sslm.sample.model.sample.mixtureName').d('公司/业务实体/库存组织'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { companyId, supplierCompanyId } = params;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supplier-workbench/supplier-sample-info`,
        method: 'GET',
        data: filterNullValueObject({
          companyId,
          supplierCompanyId,
          customizeUnitCode:
            'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.SAMPLE,SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.SAMPLE_SEARCH_BAR',
          ...data,
        }),
      };
    },
  },
});

const sampleColumns = ({ handleSample, operationRecordsModal }) => [
  {
    name: 'reqStatus',
    width: 120,
    renderer: renderStatus,
  },
  {
    name: 'option',
    width: 110,
    renderer: ({ record }) => {
      const { data: { reqId, releaseOperateFlag, approveOperateFlag } = {} } = record;
      const params = { documentType: 'SAMPLE_SEND_REQ', documentId: reqId };
      return (
        <Fragment>
          {(releaseOperateFlag || approveOperateFlag) && (
            <Button funcType="link" onClick={() => handleSample(record)}>
              {intl.get('sslm.common.model.option.maintain').d('维护')}
            </Button>
          )}
          <Button funcType="link" onClick={() => operationRecordsModal(params)}>
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </Button>
        </Fragment>
      );
    },
  },
  {
    name: 'reqNum',
    width: 140,
    renderer: ({ value, record }) => {
      const { data: { reqId, reqStatus } = {} } = record;
      return <Link to={`/sslm/buyer-apply-query/detail/${reqId}/${reqStatus}`}>{value}</Link>;
    },
  },
  {
    name: 'reqNumRe',
    width: 140,
    renderer: ({ record }) => <a onClick={() => jumpDetail({ record })}>{record.get('reqNum')}</a>,
  },
  {
    name: 'supplierName',
    width: 200,
  },
  {
    name: 'companyAndOuAndOrganizationName',
    renderer: ({ record = {} }) => {
      const { data: { companyName, ouName, organizationName } = {} } = record;
      return `${companyName || '-'} / ${ouName || '-'} / ${organizationName || '-'}`;
    },
  },
];

export { sampleDS, sampleColumns };
