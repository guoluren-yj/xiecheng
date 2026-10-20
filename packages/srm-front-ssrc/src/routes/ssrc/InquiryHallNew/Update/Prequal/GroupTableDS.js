/**
 * 分组DS配置
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { Prefix } from '@/utils/globalVariable';

const organizationId = getCurrentOrganizationId();
const promptCode = 'ssrc.inquiryHall';

const groupTableDS = ({ sourceProjectId, tempRfxHeaderId, mergeType }) => ({
  primaryKey: 'prequalGroupHeaderId',
  paging: false,
  fields: [
    {
      name: 'groupName',
      type: 'string',
      label: intl.get(`${promptCode}.model.inquiryHall.groupName`).d('名称'),
    },
    {
      name: 'sectionLov',
      type: 'object',
      required: true,
      ignore: 'always',
      label: intl.get(`${promptCode}.view.title.sectionBiding`).d('标段'),
      lovCode: 'SSRC_PROJECT_SECTION_LINE',
      textField: 'sectionName',
      valueField: 'sectionCode',
      multiple: true,
      dynamicProps: {
        lovPara({ dataSet }) {
          const projectLineSectionIds = [];
          dataSet.data.forEach((r) => {
            projectLineSectionIds.push(...r.get('sectionLineIds'));
          });
          return {
            sourceProjectId,
            organizationId,
            tempRfxHeaderId,
            projectLineSectionIds: projectLineSectionIds.join(','),
            // referenceFlag: 0,
          };
        },
      },
    },
    {
      name: 'sectionNames',
      bind: 'sectionLov.sectionName',
    },
    {
      name: 'sectionCodes',
      bind: 'sectionLov.sectionCode',
    },
    {
      name: 'sectionLineIds',
      bind: 'sectionLov.projectLineSectionId',
    },
    {
      name: 'indexNum',
      transformRequest: (_, record) => record.index + 1,
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${Prefix}/${organizationId}/prequal-group-headers`,
        method: 'GET',
        data: {
          sourceProjectId,
          tempSourceHeaderId: tempRfxHeaderId,
        },
      };
    },
    destroy: ({ data }) => {
      const selectedKeys = data.map((r) => r.prequalGroupHeaderId);
      return {
        url: `${Prefix}/${organizationId}/prequal-group-headers/${selectedKeys.join(',')}`,
        method: 'DELETE',
      };
    },
    submit: ({ data }) => {
      return {
        url: `${Prefix}/${organizationId}/prequal-group-headers`,
        method: 'POST',
        data: {
          mergeType,
          sourceProjectId,
          tempSourceHeaderId: tempRfxHeaderId,
          prequalGroupHeaders: data,
        },
      };
    },
  },
});

export { groupTableDS };
