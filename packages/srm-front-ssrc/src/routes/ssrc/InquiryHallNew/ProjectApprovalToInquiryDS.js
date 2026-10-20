import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { Prefix } from '@/utils/globalVariable';

const organizationId = getCurrentOrganizationId();
// const userId = getCurrentUserId();

const fetchProjectDS = (bidFlag, otherPayload = {}) => ({
  selection: 'single',
  primaryKey: 'sourceProjectId',
  pageSize: 20,
  dataToJSON: 'all',
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
          const { sourceRequest } = otherPayload || {};
          return {
            organizationId,
            sourceCategory: record.get('sourceCategory'),
            sourceRequest,
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
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        const currentRecord = record;
        if (currentRecord.get('projectLineSections')) {
          currentRecord.selectable = false;
        }
      });
    },
  },
  transport: {
    read: ({ data }) => {
      const { sourceRequest } = otherPayload || {};
      // TODO: 立项转整单线下后期加个性化记得修改这里的传参
      return {
        url: `${Prefix}/${organizationId}/source-projects`,
        method: 'GET',
        data: {
          ...data,
          sourceProjectStatus: 'APPROVED',
          referenceFlag: 0,
          // contactUserId: userId,
          sourceCategory: 'RFX',
          customizeUnitCode: `SSRC.PROJECT_SETUP_DETAIL.BASEINFOS,SSRC.${
            bidFlag ? 'BID' : 'INQUIRY'
          }_HALL_PROJECT_TO_${bidFlag ? 'BID' : 'RFX'}.FILTER_BAR,SSRC.${
            bidFlag ? 'BID' : 'INQUIRY'
          }_HALL_PROJECT_TO_${bidFlag ? 'BID' : 'RFX'}.LIST`,
          projectToRfxFlag: 1,
          secondarySourceCategory: bidFlag ? 'NEW_BID' : '',
          sourceRequest,
        },
      };
    },
  },
});

const fetchBidSectionDS = () => ({
  paging: false,
  // selection: 'single',
  dataToJSON: 'all',
  fields: [
    {
      name: 'sectionCode',
      type: 'string',
      label: intl.get(`ssrc.common.model.common.sectionCode`).d('标段编码'),
    },
    {
      name: 'sectionName',
      type: 'string',
      label: intl.get(`ssrc.common.model.common.sectionName`).d('标段名称'),
    },
    {
      name: 'sectionRemark',
      type: 'string',
      label: intl.get(`ssrc.common.model.common.sectionRemark`).d('备注'),
    },
    // {
    //   name: 'rfxHeaderLov',
    //   type: 'object',
    //   label: intl.get(`ssrc.common.model.common.quoteRule`).d('引用规则'),
    //   lovCode: 'SSRC.PROJECT_REFERENCE_RFX',
    //   textField: 'rfxTitle',
    //   valueField: 'rfxHeaderId',
    //   ignore: 'always',
    //   dynamicProps: {
    //     lovPara() {
    //       return {
    //         organizationId,
    //         sourceCategory: params.get('sourceCategory'),
    //       };
    //     },
    //   },
    // },
    {
      name: 'rfxHeaderId',
      bind: 'rfxHeaderLov.rfxHeaderId',
    },
    {
      name: 'rfxTitle',
      bind: 'rfxHeaderLov.rfxTitle',
    },
  ],
});

export { fetchProjectDS, fetchBidSectionDS };
