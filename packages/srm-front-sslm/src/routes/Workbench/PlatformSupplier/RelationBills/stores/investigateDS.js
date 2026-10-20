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

const jumpDetail = ({ record, menuPermissionsFlag }) => {
  const { investgHeaderId, investigateTemplateId } = record.get([
    'investgHeaderId',
    'investigateTemplateId',
  ]);
  const oldRouter = `/sslm/include/sslm/investigation-send/detail`;
  const newRouter = `/sslm/include/purchaser-investigation/all-investigation/detail/${investgHeaderId}/${investigateTemplateId}`;
  const router = menuPermissionsFlag ? newRouter : oldRouter;
  const params = {
    investgHeaderId,
    investigateTemplateId,
  };
  openTab({
    key: router,
    title: intl.get('sslm.common.view.title.view.investigateDetail').d('查看调查表明细'),
    search: menuPermissionsFlag ? '' : querystring.stringify(params),
  });
};

const investigateDS = params => ({
  pageSize: 20,
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      name: 'processStatus',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'investgNumber',
      label: intl.get(`sslm.common.model.investigate.code`).d('调查表编号'),
    },
    {
      name: 'investgNumberRe',
      label: intl.get(`sslm.common.model.investigate.code`).d('调查表编号'),
    },
    {
      name: 'option',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'partnerCompanyName',
      label: intl.get(`sslm.common.view.supplier.name`).d('供应商名称'),
    },
    {
      name: 'companyName',
      label: intl.get(`sslm.common.view.company.companyName`).d('公司名称'),
    },
    {
      name: 'templateName',
      label: intl.get(`sslm.common.model.investigate.template.name`).d('调查表模板名称'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { companyId, supplierCompanyId } = params;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supplier-workbench/supplier-investigate-info`,
        method: 'GET',
        data: filterNullValueObject({
          companyId,
          supplierCompanyId,
          customizeUnitCode:
            'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.QUESTIONNAIRE,SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.INVESTIGATE_SEARCH_BAR',
          ...data,
        }),
      };
    },
  },
});

const investigateColumns = ({
  handleInvestg,
  operationRecordsModal,
  menuPermissionsFlag = false,
}) => [
  {
    name: 'processStatus',
    width: 120,
    renderer: renderStatus,
  },
  {
    name: 'option',
    width: 110,
    renderer: ({ record }) => {
      const { data: { investgHeaderId, releaseOperateFlag, approveOperateFlag } = {} } = record;
      const params = { documentType: 'INVESTIGATE', documentId: investgHeaderId, investgHeaderId };
      return (
        <Fragment>
          {(releaseOperateFlag || approveOperateFlag) && (
            <Button funcType="link" onClick={() => handleInvestg(record)}>
              {intl.get('sslm.common.model.option.maintain').d('编辑')}
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
    name: 'investgNumber',
    width: 140,
    renderer: ({ value, record }) => {
      const { data: { investgHeaderId, investigateTemplateId } = {} } = record;
      const oldRouter = `/sslm/investigation-send/detail?investgHeaderId=${investgHeaderId}&investigateTemplateId=${investigateTemplateId}`;
      const newRouter = `/sslm/purchaser-investigation/all-investigation/detail/${investgHeaderId}/${investigateTemplateId}`;
      const router = menuPermissionsFlag ? newRouter : oldRouter;
      return <Link to={router}>{value}</Link>;
    },
  },
  {
    name: 'investgNumberRe',
    width: 140,
    renderer: ({ record }) => (
      <a onClick={() => jumpDetail({ record, menuPermissionsFlag })}>
        {record.get('investgNumber')}
      </a>
    ),
  },
  {
    name: 'partnerCompanyName',
    width: 150,
  },
  {
    name: 'companyName',
    width: 150,
  },
  {
    name: 'templateName',
  },
];

export { investigateDS, investigateColumns };
