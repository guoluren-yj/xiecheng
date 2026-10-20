import React from 'react';
import { Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { SRM_SQAM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { renderStatus } from '@/routes/components/utils';
import Process from '../Components/Process';
import ExecuteProcess from '../Components/ExecuteProcess';

const organizationId = getCurrentOrganizationId();

const ppapDocumentDS = () => {
  return {
    pageSize: 20,
    selection: false,
    primaryKey: 'projectHeaderId',
    fields: [
      {
        name: 'projectStatus',
        lookupCode: 'SQAM.PPAP_PROJECT_STATUS',
        label: intl.get('sqam.ppap.model.project.status').d('项目状态'),
      },
      {
        name: 'operate',
        label: intl.get('sqam.ppap.model.common.operate').d('操作'),
      },
      {
        name: 'projectNum',
        label: intl.get('sqam.ppap.model.project.projectNum').d('项目编号'),
      },
      {
        name: 'projectName',
        label: intl.get('sqam.ppap.model.project.projectName').d('项目名称'),
      },
      {
        name: 'process',
        label: intl.get('sqam.ppap.model.project.process').d('进行阶段'),
      },
      {
        name: 'executeProcess',
        label: intl.get('sqam.ppap.model.project.executeProcess').d('执行阶段'),
      },
      {
        name: 'companyName',
        label: intl.get('sqam.ppap.model.project.company').d('公司'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get('sqam.ppap.model.project.supplierCompany').d('供应商'),
      },
      {
        name: 'createName',
        label: intl.get('sqam.ppap.model.project.creator').d('创建人'),
      },
      {
        name: 'creationDate',
        type: 'date',
        label: intl.get('sqam.ppap.model.project.createDate').d('创建日期'),
      },
      {
        name: 'itemCode',
        label: intl.get(`sqam.ppap.model.project.partNum`).d('零件编码'),
      },
    ],
    transport: {
      read: ({ data }) => {
        const { params = {}, ...other } = data;
        return {
          url: `${SRM_SQAM}/v1/${organizationId}/access-project-headers/page`,
          method: 'GET',
          data: filterNullValueObject({ ...params, ...other }),
        };
      },
    },
  };
};

const ppapDocumentColumns = ({ jumpPpapDocument }) => {
  return [
    {
      name: 'projectStatus',
      width: 120,
      renderer: renderStatus,
    },
    {
      name: 'projectNum',
      width: 180,
      renderer: ({ value, record }) => (
        <Button funcType="link" onClick={() => jumpPpapDocument(record)}>
          {value}
        </Button>
      ),
    },
    {
      name: 'projectName',
      width: 120,
    },
    {
      name: 'companyName',
      width: 240,
    },
    {
      name: 'supplierCompanyName',
      width: 240,
    },
    {
      name: 'process',
      tooltip: 'none',
      renderer: ({ record }) => (
        <Process
          hide={record?.get('projectStatus') === 'NEW'}
          stageProcess={record?.get('stageProcess')}
        />
      ),
      width: 350,
    },
    {
      name: 'executeProcess',
      tooltip: 'none',
      renderer: ({ record }) => (
        <ExecuteProcess
          hide={record?.get('projectStatus') === 'NEW'}
          stageProcess={record?.get('stageProcess')}
        />
      ),
    },
    {
      name: 'createName',
      width: 120,
    },
    {
      name: 'creationDate',
      width: 150,
    },
  ];
};

export { ppapDocumentColumns, ppapDocumentDS };
