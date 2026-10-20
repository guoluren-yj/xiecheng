/**
 * 会员管理 - dataSet
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2021-03-23
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { MEMBER_MANAGE } from '@/utils/config';
import { code } from '@/utils/codeConfig';

const { isEnabled } = code.memberCentre;

const organizationId = getCurrentOrganizationId();

/**
 * 会员标签列表 DS
 * @returns
 */
const TagListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${MEMBER_MANAGE}/v1/${organizationId}/member-labels`,
        params: { ...data, ...params, customizeUnitCode: 'SIGL.TAG_MANAGE.LIST.SEARCH_NEW' },
        method: 'get',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'labelId',
  selection: false,
  fields: [
    {
      label: intl.get(`sigl.memberCenter.view.modal.labelCode`).d('标签编码'),
      name: 'labelCode',
      type: 'string',
    },
    {
      label: intl.get(`sigl.memberCenter.view.modal.labelName`).d('标签名称'),
      name: 'labelName',
      type: 'string',
    },
    {
      label: intl.get(`sigl.memberCenter.view.modal.remarks`).d('备注'),
      name: 'remarks',
      type: 'string',
      maxLength: 30,
    },
    {
      label: intl.get(`sigl.memberCenter.view.modal.status`).d('状态'),
      name: 'enabledFlag',
      lookupCode: isEnabled,
    },
  ],
  events: {},
});

/**
 * 会员标签详情，新建、编辑 DS
 * @returns
 */
const TagDetailDS = () => ({
  transport: {
    read: (config) => {
      const url = `${MEMBER_MANAGE}/v1/${organizationId}/member-labels`;
      const axiosConfig = {
        ...config,
        url,
        method: 'GET',
      };
      return axiosConfig;
    },
    create: ({ data }) => {
      return {
        url: `${MEMBER_MANAGE}/v1/${organizationId}/member-labels`,
        data: { ...data[0] },
        method: 'POST',
      };
    },
    update: ({ data }) => {
      return {
        url: `${MEMBER_MANAGE}/v1/${organizationId}/member-labels`,
        data: { ...data[0] },
        method: 'POST',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'id',
  fields: [
    {
      label: intl.get(`sigl.memberCenter.view.modal.labelCode`).d('标签编码'),
      name: 'labelCode',
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
      label: intl.get(`sigl.memberCenter.view.modal.labelName`).d('标签名称'),
      name: 'labelName',
      type: 'string',
      maxLength: 10,
      required: true,
    },
    {
      label: intl.get(`sigl.memberCenter.view.modal.remarks`).d('备注'),
      name: 'remarks',
      type: 'string',
      maxLength: 30,
    },
    {
      label: intl.get(`sigl.memberCenter.view.modal.status`).d('状态'),
      name: 'enabledFlag',
      lookupCode: isEnabled,
      required: true,
      defaultValue: 1,
    },
  ],
  queryFields: [],
});

export { TagListDS, TagDetailDS };
