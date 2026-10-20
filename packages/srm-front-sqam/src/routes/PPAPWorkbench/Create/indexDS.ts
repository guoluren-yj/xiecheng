import { FieldType, DataSetSelection, DataToJSON } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import intl from 'utils/intl';
import { SRM_SQAM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { CreateListCustomizeCode, DetailProjectFormCode } from '../utils/type';

const organizationId = getCurrentOrganizationId();

export const listDS = (): DataSetProps => {
  return {
    pageSize: 20,
    selection: DataSetSelection.single,
    autoQuery: true,
    queryParameter: {
      customizeUnitCode: CreateListCustomizeCode.SearchBarCode,
    },
    fields: [
      {
        name: 'templateNum',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.templateNum`).d('模板编码'),
      },
      {
        name: 'templateName',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.templateName`).d('模板名称'),
      },
      {
        name: 'versionNumber',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.version`).d('版本号'),
      },
    ],
    transport: {
      read: () => ({
        url: `${SRM_SQAM}/v1/${organizationId}/access-template-headers/query/release-template?enableSingleItemFlag=0`,
        method: 'GET',
      }),
    },
  };
};

export const detailDS = (): DataSetProps => {
  return {
    dataToJSON: DataToJSON.all,
    fields: [
      {
        name: 'projectName',
        type: FieldType.string,
        required: true,
        label: intl.get(`sqam.ppap.model.project.projectName`).d('项目名称'),
      },
      {
        name: 'companLov',
        type: FieldType.object,
        required: true,
        label: intl.get(`sqam.ppap.model.common.companyName`).d('公司'),
        lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
        textField: 'companyName',
        lovPara: {
          tenantId: organizationId,
        },
      },
      {
        name: 'companyId',
        type: FieldType.string,
        bind: 'companLov.companyId',
      },
      {
        name: 'companyName',
        type: FieldType.string,
        bind: 'companLov.companyName',
      },
      {
        name: 'companyNum',
        type: FieldType.string,
        bind: 'companLov.companyNum',
      },
      {
        name: 'invOrganizationLov',
        type: FieldType.object,
        label: intl.get('sqam.ppap.model.common.invOrganization').d('库存组织'),
        lovCode: 'HPFM.INV_ORGANIZATION',
        lovPara: {
          tenantId: organizationId,
        },
      },
      {
        name: 'purOrganizationId',
        type: FieldType.string,
        bind: 'invOrganizationLov.organizationId',
      },
      {
        name: 'supplierCompanyLov',
        type: FieldType.object,
        required: true,
        label: intl.get('sqam.ppap.model.common.supplierCompany').d('供应商'),
        lovCode: 'SQAM.CLAIM_SUPPLIER_COMPANY',
        dynamicProps: {
          disabled: ({ record }) => !record?.get('companyId'),
          lovPara: ({ record }) => ({
            tenantId: organizationId,
            companyId: record?.get('companyId'),
          }),
        },
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        bind: 'supplierCompanyLov.supplierCompanyName',
      },
      {
        name: 'supplierCompanyId',
        type: FieldType.string,
        bind: 'supplierCompanyLov.supplierCompanyId',
      },
      {
        name: 'supplierTenantId',
        type: FieldType.string,
        bind: 'supplierCompanyLov.supplierTenantId',
      },
      {
        name: 'supplierCompanyNum',
        type: FieldType.string,
        bind: 'supplierCompanyLov.supplierCompanyNum',
      },
      {
        name: 'supplierId',
        type: FieldType.string,
        bind: 'supplierCompanyLov.supplierId',
      },
      {
        name: 'supplierNum',
        type: FieldType.string,
        bind: 'supplierCompanyLov.supplierNum',
      },
    ],
    transport: {
      submit: ({ data }) => {
        return {
          url: `${SRM_SQAM}/v1/${organizationId}/access-project-headers/create-by-template`,
          method: 'POST',
          data: {
            ...data[0],
            tenantId: organizationId,
            customizeUnitCode: DetailProjectFormCode,
          },
        };
      },
    },
  };
};
