/*
 * @Description: 关联公司 Dataset
 * @Date: 2022-08-17 14:56:49
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 关联公司
const AffiliatedCompanyDS = ({ rebateInformationId, editable } = {}) => {
  return {
    paging: true,
    selection: editable && 'multiple',
    pageSize: 20,
    fields: [
      {
        label: intl.get('entity.company.code').d('公司编码'),
        name: 'companyNum',
      },
      {
        label: intl.get('entity.company.name').d('公司名称'),
        name: 'companyName',
      },
      {
        label: intl.get('entity.company.enabledFlag').d('启用'),
        name: 'enabledFlag',
        type: 'boolean',
        defaultValue: 1,
        trueValue: 1,
        falseValue: 0,
      },
    ],
    queryFields: [
      {
        label: intl.get('entity.company.code').d('公司编码'),
        name: 'companyNum',
        display: true,
      },
      {
        label: intl.get('entity.company.name').d('公司名称'),
        name: 'companyName',
        merge: true,
      },
    ],
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach((record) => {
          if (['sync', 'update'].includes(record?.status)) {
            record.selectable = false;
          }
        });
      },
    },
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/pc-affiliated-companys/${rebateInformationId}/page`,
          method: 'GET',
          data,
        };
      },
      submit: ({ data }) => {
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/pc-affiliated-companys/${rebateInformationId}/company`,
          method: 'POST',
          data,
        };
      },
    },
  };
};

// 选择公司
const AddCompanyDS = () => {
  return {
    autoQuery: false,
    pageSize: 10,
    fields: [
      {
        label: intl.get('entity.company.code').d('公司编码'),
        name: 'companyNum',
      },
      {
        label: intl.get('entity.company.name').d('公司名称'),
        name: 'companyName',
      },
    ],
    queryFields: [
      {
        label: intl.get('entity.company.code').d('公司编码'),
        name: 'companyNum',
      },
      {
        label: intl.get('entity.company.name').d('公司名称'),
        name: 'companyName',
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/page/increase_company`,
          method: 'GET',
          data,
        };
      },
    },
  };
};

export { AffiliatedCompanyDS, AddCompanyDS };
