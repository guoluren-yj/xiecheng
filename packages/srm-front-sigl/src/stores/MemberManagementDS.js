/**
 * 会员管理 - dataSet
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2021-03-23
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import moment from 'moment';
import { getCurrentOrganizationId } from 'utils/utils';
import { DATETIME_MIN } from 'utils/constants';
import { MEMBER_MANAGE } from '@/utils/config';
import { code } from '@/utils/codeConfig';
import queryString from 'query-string';

const { isEnabled, associateAccount, operationType } = code.memberCentre;
const organizationId = getCurrentOrganizationId();

/**
 * 会员列表 DS
 * @returns
 */
const MemberListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      const obj = data;
      const list = obj.labelIdList;
      delete obj.labelIdList;
      return {
        url: `${MEMBER_MANAGE}/v1/${organizationId}/members?${queryString.stringify({
          labelIdList: list,
        })}`,
        params: { ...obj, ...params },
        method: 'GET',
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${MEMBER_MANAGE}/v1/${organizationId}/members`,
        data,
        method: 'DELETE',
      };
    },
  },
  pageSize: 20,
  cacheSelection: true,
  primaryKey: 'memberId',
  fields: [
    {
      label: intl.get(`sigl.memberCenter.view.modal.memberCode`).d('会员编码'),
      name: 'memberCode',
      type: 'string',
    },
    {
      label: intl.get(`sigl.memberCenter.view.modal.memberName`).d('会员名称'),
      name: 'memberName',
      type: 'string',
    },
    {
      label: intl.get(`sigl.memberCenter.view.modal.memberTag`).d('会员标签'),
      name: 'memberLabelRelationList',
      type: 'object',
    },
    {
      label: intl.get(`sigl.memberCenter.view.modal.status`).d('状态'),
      name: 'enabledFlag',
      lookupCode: isEnabled,
    },
    {
      label: intl.get(`sigl.memberCenter.view.modal.integralGrantTotal`).d('累计发放'),
      name: 'integralGrantTotal',
      type: 'number',
      align: 'right',
      help: intl
        .get('sigl.memberCenter.view.modal.integralGrantTotalHelp')
        .d('累计发放=发放总数-扣减总数'),
    },
    {
      label: intl.get(`sigl.memberCenter.view.modal.integralUseTotal`).d('累计消费'),
      name: 'integralUseTotal',
      type: 'number',
      align: 'right',
      help: intl.get('sigl.memberCenter.view.modal.integralUseTotalHelp').d('累计商城消费积分'),
    },
    {
      label: intl.get(`sigl.memberCenter.view.modal.integralBalance`).d('积分余额'),
      name: 'integralBalance',
      type: 'number',
    },
  ],
  events: {},
});

/**
 * 会员详情，新建、编辑 DS
 * @returns
 */
const MemberDetailDS = () => ({
  transport: {
    read: (config) => {
      const url = `${MEMBER_MANAGE}/v1/${organizationId}/members`;
      const axiosConfig = {
        ...config,
        url,
        method: 'GET',
      };
      return axiosConfig;
    },
    create: ({ data }) => {
      return {
        url: `${MEMBER_MANAGE}/v1/${organizationId}/members`,
        data: { ...data[0] },
        method: 'POST',
      };
    },
    update: ({ data }) => {
      return {
        url: `${MEMBER_MANAGE}/v1/${organizationId}/members`,
        data: { ...data[0] },
        method: 'POST',
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${MEMBER_MANAGE}/v1/${organizationId}/members`,
        data,
        method: 'DELETE',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'memberId',
  autoCreate: true,
  fields: [
    {
      label: intl.get(`sigl.memberCenter.view.modal.memberCode`).d('会员编码'),
      name: 'memberCode',
      type: 'string',
      required: true,
      maxLength: 30,
      validator: (value) => {
        const pattern = /^[A-Za-z0-9][A-Za-z0-9-_.]*$/;
        if (!pattern.test(value)) {
          return intl
            .get('halt.alertAdvanced.validation.message.groupBy.warning')
            .d('请输入字母及数字，只能以字母或数字开头，可包含“-”、“_”、“.”');
        }
      },
    },
    {
      label: intl.get(`sigl.memberCenter.view.modal.memberName`).d('会员名称'),
      name: 'memberName',
      type: 'string',
      maxLength: 30,
      required: true,
    },
    {
      label: intl.get(`sigl.memberCenter.view.modal.memberTag`).d('会员标签'),
      name: 'labelRelationList',
      multiple: true,
      // valueField: 'labelId',
      // textField: 'labelName',
      // dynamicProps: {
      //   lookupAxiosConfig: () => ({
      //     url: `${MEMBER_MANAGE}/v1/${organizationId}/member-labels?enabledFlag=1`,
      //   }),
      // },
      transformResponse(_, recordData) {
        return (recordData.memberLabelRelationList || []).map((item) => item.labelId);
      },
    },
    {
      name: 'memberLabelRelationList',
    },
    {
      label: intl.get(`sigl.memberCenter.view.modal.isEnabled`).d('是否启用'),
      name: 'enabledFlag',
      lookupCode: isEnabled,
      required: true,
      defaultValue: 1,
    },
    {
      label: intl.get(`sigl.memberCenter.view.modal.associateAccount`).d('关联账号'),
      name: 'associateAccount',
      type: 'object',
      lovCode: associateAccount,
      ignore: 'always',
      textField: 'realName',
      valueField: 'id',
    },
    {
      name: 'userId',
      bind: 'associateAccount.id',
    },
    {
      name: 'realName',
      bind: 'associateAccount.realName',
    },
  ],
  queryFields: [],
});

/**
 * 会员积分列表 DS
 * @returns
 */
const PointsListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      const obj = data;
      const dateArr = data.creationDate || [];
      delete obj.creationDate;
      const createDateStart =
        dateArr.length && dateArr[0] ? `${moment(dateArr[0]).format('YYYY-MM-DD')} 00:00:00` : '';
      const createDateEnd =
        dateArr.length && dateArr[1] ? `${moment(dateArr[1]).format('YYYY-MM-DD')} 23:59:59` : '';
      return {
        url: `${MEMBER_MANAGE}/v1/${organizationId}/member-operations`,
        params: {
          ...obj,
          ...params,
          createDateStart,
          createDateEnd,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'id',
  selection: false,
  fields: [
    {
      label: intl.get(`sigl.memberCenter.view.modal.creationDate`).d('操作时间'),
      name: 'creationDate',
      type: 'dateTime',
    },
    {
      label: intl.get(`sigl.memberCenter.view.modal.operationType`).d('变动类型'),
      name: 'operationType',
      type: 'string',
      lookupCode: operationType,
    },
    {
      label: intl.get('sigl.memberCenter.view.potinsType').d('积分类型'),
      name: 'pointsTypeName',
    },
    {
      label: intl.get(`sigl.memberCenter.view.modal.operationIntegralTotal`).d('变动积分'),
      name: 'operationIntegralTotal',
      type: 'number',
      step: 1,
      min: 1,
      max: 999999999,
    },
    {
      label: intl.get(`sigl.memberCenter.view.modal.remarks`).d('备注'),
      name: 'remarksMeaning',
      type: 'string',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sigl.memberCenter.view.modal.creationDate`).d('操作时间'),
      name: 'creationDate',
      type: 'date',
      range: true,
    },
    {
      label: intl.get(`sigl.memberCenter.view.modal.operationType`).d('变动类型'),
      name: 'operationType',
      type: 'string',
      lookupCode: operationType,
    },
  ],
  events: {},
});

/**
 * 积分发放DS
 * @returns
 */
const PointsEditDS = () => ({
  transport: {
    read: (config) => {
      const url = `${MEMBER_MANAGE}/v1/${organizationId}/members/modify`;
      const axiosConfig = {
        ...config,
        url,
        method: 'GET',
      };
      return axiosConfig;
    },
    submit: ({ data }) => {
      return {
        url: `${MEMBER_MANAGE}/v1/${organizationId}/members/modify`,
        data: { ...data[0] },
        method: 'POST',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'id',
  fields: [
    {
      label: intl.get(`sigl.memberCenter.view.title.issuer`).d('发放人员'),
      name: 'memberName',
      type: 'string',
    },
    {
      name: 'pointsTypeId',
      required: true,
      textField: 'pointsTypeName',
      valueField: 'pointsTypeId',
      lookupUrl: `/sigl/v1/${organizationId}/points-types/list-no-cache`,
      label: intl.get('sigl.memberCenter.view.potinsType').d('积分类型'),
    },
    {
      label: intl.get(`sigl.memberCenter.view.distributeNum`).d('发放数量'),
      name: 'modifyIntegralCount',
      type: 'number',
      required: true,
      step: 1,
      min: 1,
      max: 999999999,
    },
    {
      name: 'expirationDate',
      label: intl.get('sigl.memberCenter.view.invalidDate').d('失效日期'),
      type: 'date',
      min: moment().format(DATETIME_MIN),
    },
    {
      label: intl.get(`sigl.memberCenter.view.button.issueNotes`).d('发放备注'),
      name: 'remarks',
      type: 'string',
      maxLength: 30,
    },
    {
      name: 'modifyIntegralType',
    },
    {
      name: 'userId',
    },
    {
      name: 'memberId',
    },
    {
      name: 'objectVersionNumber',
    },
  ],
  queryFields: [],
});

// 积分扣减ds
const PointsReduceDS = () => ({
  fields: [
    {
      name: 'memberName',
      disabled: true,
      label: intl.get(`sigl.memberCenter.view.modal.memberName`).d('会员名称'),
    },
    {
      name: 'integralBalance',
      disabled: true,
      label: intl.get(`sigl.memberCenter.view.modal.integralBalance`).d('积分余额'),
    },
    // {
    //   name: 'balanceDetails',
    //   label: intl.get('sigl.memberCenter.model.balanceDetails').d('余额明细'),
    // },
    {
      name: 'currentIntegralBalance',
    },
    {
      name: 'modifyIntegralCount',
      type: 'number',
      required: true,
      step: 1,
      min: 1,
      // max: 999999999,
      label: intl.get('sigl.memberCenter.model.reducePoint').d('扣减数量'),
      computedProps: {
        max: ({ record }) => {
          return record.get('currentIntegralBalance');
        },
      },
    },
    { name: 'remarks', maxLength: 30, label: intl.get('sigl.memberCenter.view.remark').d('备注') },
  ],
});

// 余额明细ds
const BalanceDetailDS = (reduceDs) => ({
  selection: 'single',
  paging: false,
  autoQuery: false,
  fields: [
    {
      name: 'integralBalance',
      label: intl.get(`sigl.memberCenter.view.modal.integralBalance`).d('积分余额'),
    },
    {
      name: 'expirationDate',
      label: intl.get('sigl.memberCenter.view.invalidDate').d('失效日期'),
    },
    { name: 'remarks', label: intl.get('sigl.memberCenter.view.remark').d('备注') },
  ],
  transport: {
    read: {
      url: `${MEMBER_MANAGE}/v1/${organizationId}/efficient-integral-details`,
      method: 'GET',
      transformResponse: (data) => {
        try {
          const res = JSON.parse(data);
          return res?.filter((f) => f.integralBalance > 0 && f.pointsTypeEnableFlag);
        } catch (err) {
          // no
        }
      },
    },
  },
  events: {
    load: ({ dataSet }) => {
      if (dataSet.get(0)) dataSet.select(0);
    },
    select: ({ record }) => {
      if (reduceDs.current) {
        reduceDs.current.set({
          pointsTypeId: record.get('pointsTypeId'),
          integralDetailId: record.get('integralDetailId'),
          currentIntegralBalance: record.get('integralBalance'),
          modifyIntegralCount: record.get('integralBalance'),
        });
      }
    },
    unSelect: ({ record, dataSet }) => {
      dataSet.select(record);
    },
  },
});

export {
  MemberListDS,
  MemberDetailDS,
  PointsListDS,
  PointsEditDS,
  PointsReduceDS,
  BalanceDetailDS,
};
