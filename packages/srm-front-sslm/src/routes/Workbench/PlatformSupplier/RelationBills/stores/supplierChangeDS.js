/*
 * @Date: 2023-09-13 15:43:20
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import React, { Fragment } from 'react';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import { renderStatus } from '@/routes/components/utils';

const organizationId = getCurrentOrganizationId();

const supplierChangeDS = params => ({
  pageSize: 20,
  selection: false,
  primaryKey: 'changeReqId',
  fields: [
    {
      name: 'reqStatus',
      lookupCode: 'SSLM.SUPPLIER_CHANGE_REQ_STATUS',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'option',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'changeReqNumber',
      label: intl.get('sslm.supplierInform.model.supplierInform.applicationNum').d('申请单号'),
    },
    {
      name: 'changeLevel',
      lookupCode: 'SSLM.SUPPLIER_CHANGE_LEVEL',
      label: intl.get('sslm.supplierInform.model.supplierInform.latitudeChange').d('变更维度'),
    },
    {
      name: 'companyName',
      label: intl.get(`sslm.common.view.company.name`).d('公司'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get('sslm.common.view.supplier.supplierCompany').d('供应商'),
    },
    {
      name: 'createUserName',
      label: intl.get('sslm.supplierInform.model.supplierInform.creator').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('hzero.common.date.creation').d('创建时间'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { companyId, supplierCompanyId } = params;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supplier-change-reqs`,
        method: 'GET',
        data: {
          ...data,
          companyId,
          supplierCompanyId,
          workbenchQuery: 1,
          customizeUnitCode:
            'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.SUPPLIER_CHANGE_SEARCH_BAR,SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.SUPPLIER_CHANGE_TABLE',
        },
      };
    },
  },
});

// 查看页
const jumpDetail = ({ record, supChange }) => {
  const {
    changeReqId,
    investgHeaderId,
    investigateTemplateId,
    companyId,
    supplierCompanyId,
  } = record.get([
    'changeReqId',
    'investgHeaderId',
    'investigateTemplateId',
    'companyId',
    'supplierCompanyId',
  ]);
  const oldRouter = `/sslm/supplier-inform-change/detail/${changeReqId}/${companyId}`;
  const newRouter = '/sslm/supplier-inform-change-new/detail/read';
  const router = supChange ? newRouter : oldRouter;
  const oldParam = {
    supplierCompanyId,
    pageReadOnly: 1,
    openMenuType: 'openTab',
  };
  const newParams = {
    changeReqId,
    investgHeaderId,
    investigateTemplateId,
    openMenuType: 'openTab',
  };
  const params = supChange ? newParams : oldParam;
  openTab({
    key: router,
    title: intl.get('sslm.common.view.title.view.supplierChangeDetail').d('查看供应商信息变更明细'),
    search: querystring.stringify(filterNullValueObject(params)),
  });
};

const getSupplierChangeColumns = ({
  jumpSupplierChangeDetail,
  operationRecordsModal,
  supChange = false,
}) => {
  return [
    {
      name: 'reqStatus',
      width: 120,
      renderer: renderStatus,
    },
    {
      width: 160,
      name: 'option',
      renderer: ({ record }) => {
        const { changeReqId, reqStatus } = record.get(['changeReqId', 'reqStatus']);
        return (
          <Fragment>
            {['NEW', 'REJECTED'].includes(reqStatus) && (
              <Fragment>
                <Button funcType="link" onClick={() => jumpSupplierChangeDetail(record)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </Button>
              </Fragment>
            )}
            <Button
              funcType="link"
              onClick={() =>
                operationRecordsModal({
                  changeReqId,
                  documentId: changeReqId,
                  documentType: 'SUPPLIER_INFO_CHANGE',
                })
              }
            >
              {intl.get('sslm.supplierInform.model.supplierInform.operationRecords').d('操作记录')}
            </Button>
          </Fragment>
        );
      },
    },
    {
      name: 'changeReqNumber',
      width: 140,
      renderer: ({ value, record }) => (
        <a onClick={() => jumpDetail({ record, supChange })}>{value}</a>
      ),
    },
    {
      name: 'changeLevel',
      width: 120,
    },
    {
      name: 'companyName',
      width: 210,
    },
    {
      name: 'supplierCompanyName',
    },
  ];
};

export { supplierChangeDS, getSupplierChangeColumns };
