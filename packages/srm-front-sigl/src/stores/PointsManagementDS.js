/**
 * 积分管理 - dataSet
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
import queryString from 'querystring';

const { operationType } = code.memberCentre;
const organizationId = getCurrentOrganizationId();

/**
 * 积分管理列表 DS
 * @returns
 */
const PointsListDS = () => ({
  transport: {
    read({ data }) {
      return {
        url: `${MEMBER_MANAGE}/v1/${organizationId}/member-operations`,
        method: 'GET',
        data: { ...data, customizeUnitCode: 'SIGL.PONIT_MANAGE.SEARCHBAR, SIGL.PONIT_MANAGE.LIST' },
      };
    },
  },
  pageSize: 20,
  primaryKey: 'operationId',
  cacheSelection: true,
  selection: 'multiple',
  fields: [
    {
      label: intl.get(`sigl.memberCenter.view.modal.creationDate`).d('操作时间'),
      name: 'creationDate',
      type: 'dateTime',
    },
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
      label: intl.get(`sigl.memberCenter.view.modal.operationType`).d('变动类型'),
      name: 'operationType',
      type: 'string',
      lookupCode: operationType,
    },
    {
      name: 'pointsTypeName',
      label: intl.get('sigl.memberCenter.view.potinsType').d('积分类型'),
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
      label: intl.get(`sigl.memberCenter.view.modal.expirationDate`).d('失效日期'),
      name: 'expirationDate',
      type: 'date',
    },
    {
      label: intl.get(`sigl.memberCenter.view.modal.remarks`).d('备注'),
      name: 'remarksMeaning',
      type: 'string',
    },
    {
      label: intl.get(`sigl.memberCenter.view.modal.realName`).d('操作人'),
      name: 'realName',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * 选择会员步骤 DS
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
        params: {
          ...obj,
          ...params,
          asyncCountFlag: 'DEFAULT',
          customizeUnitCode: 'SIGL.PONIT_MANAGE.SELECTMEMBER_SEARCH',
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'memberId',
  selection: 'multiple',
  cacheSelection: true,
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
    },
    {
      name: 'memberId',
    },
    {
      name: 'pointsCount',
    },
    {
      name: 'remarks',
    },
    {
      name: 'objectVersionNember',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sigl.memberCenter.view.modal.memberCodeAndName`).d('会员编码、名称'),
      name: 'memberCodeName',
      type: 'string',
      display: true,
      merge: true,
    },
    {
      label: intl.get(`sigl.memberCenter.view.modal.memberTag`).d('会员标签'),
      name: 'labelIdList',
      multiple: true,
      valueField: 'labelId',
      textField: 'labelName',
      noCache: true,
      lookupCode: 'SIGL.MEMBER_LABEL',
      lookupAxiosConfig: () => ({
        url: `${MEMBER_MANAGE}/v1/${organizationId}/member-labels`,
        params: {
          enabledFlag: 1,
        },
      }),
      display: true,
    },
    {
      label: intl.get(`hzero.common.date.createDate`).d('创建时间'),
      name: 'creationDate',
      sortFlag: true,
      visible: false,
    },
  ],
});

/**
 * 积分数量步骤 DS
 * @returns
 */
const CountFormDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'id',
  autoCreate: true,
  fields: [
    {
      name: 'pointsTypeId',
      required: true,
      textField: 'pointsTypeName',
      valueField: 'pointsTypeId',
      // lookupUrl: `/sigl/v1/${organizationId}/points-types/list-no-cache`,
      lookupCode: 'SIGL.POINTS_TYPE_URL',
      label: intl.get('sigl.memberCenter.view.potinsType').d('积分类型'),
    },
    {
      label: intl.get(`sigl.memberCenter.view.distributeNum`).d('发放数量'),
      name: 'pointsCount',
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
      label: intl.get(`sigl.memberCenter.view.modal.remarks`).d('备注'),
      name: 'remarks',
      type: 'string',
      maxLength: 30,
    },
  ],
  queryFields: [],
});

/**
 * 确认发放列表 DS
 * @returns
 */
const IssuanceListDS = () => ({
  submitUrl: `${MEMBER_MANAGE}/v1/${organizationId}/members/modify-list`,
  pageSize: 10000,
  primaryKey: 'memberId',
  selection: 'multiple',
  paging: false,
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
      name: 'pointsTypeId',
      required: true,
      textField: 'pointsTypeName',
      valueField: 'pointsTypeId',
      lookupCode: 'SIGL.POINTS_TYPE_URL',
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
      transformResponse: (_, record) => {
        return record.pointsCount;
      },
    },
    {
      name: 'expirationDate',
      label: intl.get('sigl.memberCenter.view.invalidDate').d('失效日期'),
      type: 'date',
      min: moment().format(DATETIME_MIN),
    },
    {
      label: intl.get(`sigl.memberCenter.view.modal.remarks`).d('备注'),
      name: 'remarks',
      type: 'string',
      maxLength: 30,
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

const batchEditDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'pointsTypeId',
      textField: 'pointsTypeName',
      valueField: 'pointsTypeId',
      lookupCode: 'SIGL.POINTS_TYPE_URL',
      label: intl.get('sigl.memberCenter.view.potinsType').d('积分类型'),
    },
    {
      label: intl.get(`sigl.memberCenter.view.distributeNum`).d('发放数量'),
      name: 'modifyIntegralCount',
      type: 'number',
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
      label: intl.get(`sigl.memberCenter.view.modal.remarks`).d('备注'),
      name: 'remarks',
      type: 'string',
      maxLength: 30,
    },
  ],
});

export { PointsListDS, MemberListDS, CountFormDS, IssuanceListDS, batchEditDS };
