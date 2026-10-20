/**
 * 标段DS
 */

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { Prefix } from '@/utils/globalVariable';

const defaultPageSize = 5;
const promptCode = 'ssrc.projectSetup';
const organizationId = getCurrentOrganizationId();

// 标段行DS
const SectionLineDS = (sourceProjectId) => ({
  primaryKey: 'projectLineSectionId',
  autoQuery: true,
  pageSize: defaultPageSize,
  queryFields: [
    {
      name: 'sectionCode',
      label: intl.get(`${promptCode}.model.projectSetup.sectionCode`).d('标段编码'),
    },
    {
      name: 'sectionName',
      label: intl.get(`${promptCode}.model.projectSetup.sectionName`).d('标段编码'),
    },
  ],
  fields: [
    {
      name: 'sectionCode',
      label: intl.get(`${promptCode}.model.projectSetup.sectionCode`).d('标段编码'),
    },
    {
      name: 'sectionName',
      label: intl.get(`${promptCode}.model.projectSetup.sectionName`).d('标段编码'),
    },
    {
      name: 'sectionRemark',
      label: intl.get(`${promptCode}.model.projectSetup.remark`).d('备注'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        method: 'GET',
        url: `${Prefix}/${organizationId}/project-line-sections/${sourceProjectId}`,
        data: {
          referenceFlag: 0,
          ...data,
        },
      };
    },
    submit: () => {
      return {
        method: 'POST',
        url: `${Prefix}/${organizationId}/rfx/project-application`,
        data: {},
      };
    },
  },
});

// 物料行DS
const MaterialLineDS = () => ({
  primaryKey: 'projectLineItemId',
  selection: false,
  paging: false,
  dataToJSON: 'all',
  fields: [
    {
      name: 'itemCode',
      label: intl.get(`${promptCode}.model.projectSetup.itemCode`).d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get(`${promptCode}.model.projectSetup.itemName`).d('物料名称'),
    },
    {
      name: 'itemCategoryName',
      label: intl.get(`${promptCode}.model.projectSetup.itemCategoryName`).d('物料类别'),
    },
    {
      name: 'requiredQuantity',
      label: intl.get(`ssrc.common.model.inquiryHall.basicQuantity`).d('基本数量'),
    },
    {
      name: 'uomName',
      label: intl.get(`ssrc.common.model.inquiryHall.basicUomName`).d('基本单位'),
    },
    {
      name: 'secondaryQuantity',
      label: intl.get(`${promptCode}.model.projectSetup.requiredQuantity`).d('需求数量'),
    },
    {
      name: 'secondaryUomName',
      label: intl.get(`${promptCode}.model.projectSetup.uomName`).d('单位'),
    },
    {
      name: 'expand',
      defaultValue: false,
    },
  ],
});

export { SectionLineDS, MaterialLineDS };
