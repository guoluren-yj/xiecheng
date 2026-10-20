/*
 * @Descripttion: 复制历史单据--DS
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-09-06 09:56:19
 * @LastEditors: yiping.liu
 */
import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const RFCopyDS = ({ sourceCategory }) => ({
  autoQuery: false,
  selection: 'single',
  fields: [
    {
      name: 'displayRfStatusMeaning',
      label: intl.get('ssrc.inquiryHall.view.status').d('状态'),
      type: 'string',
    },
    {
      name: 'rfNum',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.${sourceCategory}No.`)
        .d(`${sourceCategory}单号`),
      type: 'string',
    },
    {
      name: 'rfTitle',
      label:
        sourceCategory === 'RFI'
          ? intl.get(`ssrc.inquiryHall.model.inquiryHall.rfiTitle`).d('信息征询书标题')
          : intl.get(`ssrc.inquiryHall.model.inquiryHall.rfpTitle`).d('方案征询书标题'),
      type: 'string',
    },
    {
      name: 'purOrganizationName',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`).d('采购组织名称'),
      type: 'string',
    },
    {
      name: 'companyName',
      label: intl.get('ssrc.common.company').d('公司'),
      type: 'string',
    },
    {
      name: 'expertScoreTypeMeaning',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertScoreType`).d('专家评分'),
      type: 'string',
    },
    {
      name: 'sourceMethodMeaning',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.sourcingApproach').d('寻源方式'),
    },
    {
      name: 'creationDate',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.creationDate`).d('创建日期'),
    },
    {
      name: 'createdByName',
      type: 'string',
      label: intl.get(`ssrc.common.model.common.createdByName`).d('创建人'),
    },
    {
      name: 'createdUnitName',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.createdUnitName`).d('创建人部门'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const url = `${SRM_SSRC}/v1/${organizationId}/rf/copy-lov`;
      return {
        url,
        method: 'GET',
        data: {
          ...data,
          sourceCategory,
          customizeUnitCode: `SSRC.INQUIRY_HALL.RF_LIST.COPY.${sourceCategory}.LIST,SSRC.INQUIRY_HALL.RF_LIST.COPY.${sourceCategory}`,
        },
      };
    },
  },
});

export { RFCopyDS };
