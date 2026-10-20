/* eslint-disable no-param-reassign */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { SRM_PLATFORM } from '_utils/config';

/**
 * 公司基础信息 Form DS
 * @returns
 */
const BasicFormDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration/company-detail`,
        params: {
          ...data,
          ...params,
          tenantId: getCurrentOrganizationId(),
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'defineId',
  selection: false,
  fields: [
    {
      label: intl.get(`spfm.buyerElectronicSign.model.companyCode`).d('公司编码'),
      name: 'companyCode',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.companyName`).d('公司名称'),
      name: 'companyName',
      type: 'string',
    },
    {
      // label: intl.get(`spfm.buyerElectronicSign.model.socialCreditCode`).d('统一社会信用代码'),
      name: 'organCode',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.caAuthStatus`).d('CA认证状态'),
      name: 'authStatus',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.authorizedStatus`).d('企业授权状态'),
      name: 'authorizeStatus',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.silentlySignAuthStatus`).d('静默签授权状态'),
      name: 'autoSignStatus',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.authTime`).d('认证时间'),
      name: 'authTime',
      type: 'dateTime',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.authorizedTime`).d('授权时间'),
      name: 'authorizeOperateTime',
      type: 'dateTime',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.authorizedEndTime`).d('授权到期时间'),
      name: 'authorizeTime',
      type: 'dateTime',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.silentlySignAuthTime`).d('静默签授权时间'),
      name: 'autoSignAuthorizeOperateTime',
      type: 'dateTime',
    },
    {
      label: intl
        .get(`spfm.buyerElectronicSign.model.silentlySignAuthEndTime`)
        .d('静默签授权到期时间'),
      name: 'autoSignAuthorizeTime',
      type: 'dateTime',
    },
  ],
  events: {},
});

/**
 * 成员管理列表 DS
 * @returns
 */
const MemberListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration/list-employee`,
        params: {
          ...data,
          ...params,
          tenantId: getCurrentOrganizationId(),
        },
        method: 'GET',
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration/batch/remove-company-person`,
        data,
        method: 'POST',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'signSealEmployeeId',
  fields: [
    {
      label: intl.get(`spfm.buyerElectronicSign.model.realAuthStatus`).d('实名认证状态'),
      name: 'statusMeaning',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.subAccount`).d('子账号编码'),
      name: 'loginName',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.subAccountName`).d('子账号名称'),
      name: 'realName',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.name`).d('姓名'),
      name: 'name',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.phoneNumber`).d('手机号'),
      name: 'phone',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.addUserTime`).d('添加成员时间'),
      name: 'creationDate',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * 静默签授权确认弹窗 DS
 * @returns
 */
const SlientAuthDS = () => ({
  transport: {},
  pageSize: 20,
  primaryKey: 'defineId',
  fields: [
    {
      label: intl.get(`spfm.buyerElectronicSign.model.sealNumber`).d('印章编号'),
      name: 'sealNumber',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.authEndTime`).d('授权失效时间'),
      name: 'authEndTime',
      type: 'dateTime',
      required: true,
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.authBusiness`).d('授权企业'),
      name: 'authBusiness',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.authedBusiness`).d('被授权企业'),
      name: 'authedBusiness',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.doUser`).d('经办人'),
      name: 'doUser',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * 静默签授权历史 DS
 * @returns
 */
const AuthHistoryDS = () => ({
  pageSize: 20,
  selection: false,
  transport: {
    read: ({ data, params }) => {
      const startArr = data?.startDateArr ?? [];
      const endArr = data?.endDateArr ?? [];

      const startDate = startArr && startArr.length && startArr[0] ? `${startArr[0]}` : '';
      const endDate =
        startArr && startArr.length > 1 && startArr[1] ? `${startArr[1].substring(0, 10)} 23:59:59` : '';

      const authorizeStartDate = endArr && endArr.length && endArr[0] ? `${endArr[0]}` : '';
      const authorizeEndDate =
        endArr && endArr.length > 1 && endArr[1] ? `${endArr[1].substring(0, 10)} 23:59:59` : '';

      delete data.startDateArr;
      delete data.endDateArr;

      return {
        url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration/sign-auth-record`,
        params: {
          ...data,
          ...params,
          startDate,
          endDate,
          authorizeStartDate,
          authorizeEndDate,
        },
        method: 'GET',
      };
    },
  },
  fields: [
    {
      label: intl.get(`spfm.buyerElectronicSign.model.authBusiness`).d('授权企业'),
      name: 'companyName',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.sealNumber`).d('印章编号'),
      name: 'sealCode',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.authBeginTime`).d('授权开始时间'),
      name: 'authorizeStartTime',
      type: 'dateTime',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.authEndTime`).d('授权结束时间'),
      name: 'authorizeEndTime',
      type: 'dateTime',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.doUser`).d('经办人'),
      name: 'operationName',
      type: 'string',
    },
  ],
  queryFields: [
    {
      label: intl.get(`spfm.buyerElectronicSign.model.sealNumber`).d('印章编号'),
      name: 'sealCode',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.authTimeRange`).d('授权时间'),
      name: 'startDateArr',
      type: 'date',
      range: true,
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.authEndTime`).d('授权结束时间'),
      name: 'endDateArr',
      type: 'date',
      range: true,
    },
  ],
  events: {},
});

export { BasicFormDS, MemberListDS, SlientAuthDS, AuthHistoryDS };
