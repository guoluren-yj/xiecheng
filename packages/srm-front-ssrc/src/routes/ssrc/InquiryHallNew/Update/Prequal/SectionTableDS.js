/**
 * 标段DS配置
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { Prefix } from '@/utils/globalVariable';

const organizationId = getCurrentOrganizationId();
const promptCode = 'ssrc.inquiryHall';

const sectionTableDS = ({ sourceProjectId, projectLineSectionId, tempSourceHeaderId }) => ({
  primaryKey: 'projectLineSectionId',
  paging: false,
  fields: [
    {
      name: 'sectionCode',
      type: 'string',
      label: intl.get(`${promptCode}.model.inquiryHall.sectionCode`).d('标段编码'),
    },
    {
      name: 'sectionName',
      type: 'string',
      label: intl.get(`${promptCode}.model.inquiryHall.sectionName`).d('标段名称'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${Prefix}/${organizationId}/project-line-sections/${sourceProjectId}`,
        method: 'GET',
        data: {
          tempSourceHeaderId,
          referenceFlag: 1,
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${Prefix}/${organizationId}/prequal-group-lines/delete-sections/${tempSourceHeaderId}`,
        method: 'DELETE',
        data,
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.data.projectLineSectionId === projectLineSectionId) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
});

const unselectSectionTableDS = ({ sourceProjectId }) => ({
  primaryKey: 'projectLineSectionId',
  paging: false,
  fields: [
    {
      name: 'sectionCode',
      type: 'string',
      label: intl.get(`${promptCode}.model.inquiryHall.sectionCode`).d('标段编码'),
    },
    {
      name: 'sectionName',
      type: 'string',
      label: intl.get(`${promptCode}.model.inquiryHall.sectionName`).d('标段名称'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${Prefix}/${organizationId}/project-line-sections/${sourceProjectId}`,
        method: 'GET',
        data: {
          referenceFlag: 0,
        },
      };
    },
  },
});

export { sectionTableDS, unselectSectionTableDS };
