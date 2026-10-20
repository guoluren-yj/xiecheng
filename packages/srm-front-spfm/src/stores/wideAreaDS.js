/* eslint-disable no-param-reassign */
/**
 * 广域寻源 - dataSet
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2021-08-13
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 广域寻源列表 - DS
 * @returns
 */
const WideAreaListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      const { page, size } = params;

      if (data.capitalType === 'all') {
        data.capitalType = '';
      }

      if (data.areaCode === 'all') {
        data.areaCode = '';
      }

      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/wide-area-sourcing/supplier`,
        data: {
          ...data,
          pageNum: page + 1,
          pageSize: size,
        },
        method: 'POST',
      };
    },
  },
  pageSize: 10,
  selection: false,
  fields: [
    {
      label: intl.get(`spfm.wideArea.modal.companyName`).d('公司名称'),
      name: 'xsfmc',
      type: 'string',
    },
    {
      label: intl.get(`spfm.wideArea.modal.operatingIndexScore`).d('经营指数评分'),
      name: 'final_score',
      type: 'number',
    },
    {
      label: intl.get(`spfm.wideArea.modal.localArea`).d('所在地区'),
      name: 'province_code',
      type: 'string',
      lookupCode: 'SPFM.WIDE_AREA_LIST',
    },
    {
      label: intl.get(`spfm.wideArea.modal.registeredCapitalWithUnit`).d('注册资本'),
      name: 'regist_capi',
      type: 'string',
    },
    {
      label: intl.get(`spfm.wideArea.modal.creationDate`).d('成立日期'),
      name: 'start_date',
      type: 'string',
    },
  ],
  queryFields: [
    // {
    //   label: intl.get(`spfm.wideArea.modal.localArea`).d('所在地区'),
    //   name: 'areaCode',
    //   type: 'string',
    // },
    // {
    //   label: intl.get(`spfm.wideArea.modal.registeredCapital`).d('注册资本'),
    //   name: 'capitalType',
    //   type: 'string',
    //   // lookupCode: 'SPFM.REGISTERED_CAPITAL',
    // },
  ],
  events: {},
});

/**
 * 发送邀请 DS
 * @returns
 */
const InviteDS = () => ({
  transport: {},
  pageSize: 10,
  autoCreate: true,
  fields: [
    {
      label: intl.get(`spfm.wideArea.modal.levelTypeFlag`).d('与集团下所有公司建立合作伙伴关系'),
      name: 'levelTypeFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get(`spfm.wideArea.modal.privateFlag`).d('供应商无法被其他企业发现'),
      name: 'privateFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get(`spfm.wideArea.modal.companyIds`).d('邀请方'),
      name: 'companyIds',
      type: 'object',
      ignore: 'always',
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      required: true,
    },
    {
      label: intl.get(`spfm.wideArea.modal.flag`).d('发送调查表'),
      name: 'flag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get(`spfm.wideArea.modal.investigateType`).d('调查类型'),
      name: 'investigateType',
      type: 'string',
      lookupCode: 'SSLM.INVESTIGATE_TYPE',
      required: true,
    },
    {
      label: intl.get(`spfm.wideArea.modal.investigateTemplate`).d('调查表模板'),
      name: 'investigateTemplateId',
      type: 'object',
      ignore: 'always',
      lovCode: 'SSLM.INVESTIGATE_TEMPLATE_ID',
      required: true,
    },
    {
      label: intl.get(`spfm.wideArea.modal.occupiedStatus`).d('调查说明'),
      name: 'remark',
      type: 'string',
    },
    {
      label: intl.get(`spfm.wideArea.modal.category`).d('准入品类'),
      name: 'categoryId',
      type: 'object',
      lovCode: 'SMDM.TREE_ITEM_CATEGORY',
      ignore: 'always',
    },
    {
      label: intl.get(`spfm.wideArea.modal.purchaseAgent`).d('采购员'),
      name: 'purchaseAgentId',
      type: 'object',
      lovCode: 'SPFM.PURCHASE_AGENT_NOUSER',
      ignore: 'always',
    },
    {
      label: intl.get(`spfm.wideArea.modal.multiSupplierCategory`).d('供应商分类'),
      name: 'multiSupplierCategoryId',
      type: 'object',
      lovCode: 'SSLM.SUPPLIER_CATEGORY',
      ignore: 'always',
    },
    {
      label: intl.get(`spfm.wideArea.modal.inviteRemark`).d('邀请说明'),
      name: 'inviteRemark',
      type: 'string',
    },
  ],
  queryFields: [],
});

export { WideAreaListDS, InviteDS };
