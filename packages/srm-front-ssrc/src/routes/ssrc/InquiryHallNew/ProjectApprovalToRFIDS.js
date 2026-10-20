import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { Prefix } from '@/utils/globalVariable';

const organizationId = getCurrentOrganizationId();

const fetchProjectDS = ({ type }) => ({
  selection: 'single',
  primaryKey: 'sourceProjectId',
  dataToJSON: 'all',
  pageSize: 20,
  fields: [
    {
      name: 'sourceProjectNum',
      type: 'string',
      label: intl.get(`ssrc.common.model.common.projectDecode`).d('项目编码'),
    },
    {
      name: 'sourceProjectName',
      type: 'string',
      label: intl.get(`ssrc.common.model.common.projectName`).d('项目名称'),
    },
    {
      name: 'projectLineSections',
      type: 'object',
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.companyId`).d('公司'),
    },
    {
      name: 'parentRfxHeaderLov',
      type: 'object',
      label: intl.get(`ssrc.common.model.common.quoteRule`).d('引用规则'),
      lovCode: 'SSRC.PROJECT_REFERENCE_RFX',
      textField: 'rfxTitle',
      valueField: 'rfxHeaderId',
      ignore: 'always',
      dynamicProps: {
        // disabled({ record }) {
        //   const sectionFlag =
        //     record.get('projectLineSections') && record.get('projectLineSections').length;
        //   return sectionFlag;
        // },
        lovPara({ record }) {
          return {
            organizationId,
            sourceCategory: record.get('sourceCategory'),
          };
        },
      },
    },
    {
      name: 'rfxHeaderId',
      type: 'string',
      bind: 'parentRfxHeaderLov.rfxHeaderId',
    },
    {
      name: 'rfxTitle',
      type: 'string',
      bind: 'parentRfxHeaderLov.rfxTitle',
    },
  ],
  // queryFields: [
  //   {
  //     name: 'sourceProjectNum',
  //     type: 'string',
  //     label: intl.get(`ssrc.common.model.common.projectDecode`).d('项目编码'),
  //   },
  //   {
  //     name: 'sourceProjectName',
  //     type: 'string',
  //     label: intl.get(`ssrc.common.model.common.projectName`).d('项目名称'),
  //   },
  // ],
  // events: {
  //   load: ({ dataSet }) => {
  //     dataSet.forEach((record) => {
  //       const currentRecord = record;
  //       if (currentRecord.get('projectLineSections')) {
  //         currentRecord.selectable = false;
  //       }
  //     });
  //   },
  // },
  transport: {
    read: ({ data }) => {
      return {
        url: `${Prefix}/${organizationId}/source-projects/lov-rf-project`,
        method: 'GET',
        data: {
          ...data,
          rfHeaderSourceCategory: type,
          customizeUnitCode: `SSRC.INQUIRY_HALL_PROJECT_TO_RF.${type}_FILTER_BAR,SSRC.INQUIRY_HALL_PROJECT_TO_RF.${type}_LIST`,
        },
      };
    },
  },
});

export { fetchProjectDS };
