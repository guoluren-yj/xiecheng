/*
 * getScoreLevelDS - 定义评分等级ds
 * @Date: 2023-10-19 11:16:38
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

// 按总分定义等级ds
export const getTotalPointsLevelDs = ({ evalTplId } = {}) => ({
  paging: false,
  autoQuery: true,
  forceValidate: true,
  fields: [
    {
      name: 'orderReq',
      type: 'number',
      min: 0,
      step: 1,
      precision: 1,
      required: true,
      label: intl.get('hzero.common.priority').d('优先级'),
    },
    {
      name: 'levelType',
      defaultValue: 1, // 后端标识，总分是1，指标是2
    },
    {
      name: 'levelCode',
      required: true,
      maxLength: 20,
      pattern: /^[^\u4e00-\u9fa5]+$/,
      label: intl.get('sslm.scoreLevel.model.scoreLevel.levelCode').d('等级编码'),
    },
    {
      name: 'levelDesc',
      required: true,
      maxLength: 120,
      label: intl.get('sslm.scoreLevel.model.scoreLevel.levelDesc').d('等级描述'),
    },
    {
      name: 'scoreFrom',
      type: 'number',
      required: true,
      numberGrouping: false,
      label: intl.get('sslm.scoreLevel.model.scoreLevel.scoreFromTitle').d('分值从(=)'),
    },
    {
      name: 'scoreTo',
      type: 'number',
      required: true,
      min: 'scoreFrom',
      numberGrouping: false,
      label: intl.get('sslm.scoreLevel.model.scoreLevel.scoreToTitle').d('分值至(<)'),
    },
    {
      name: 'dataTacticsRuleDesc',
      label: intl.get('sslm.scoreLevel.model.scoreLevel.conditionConfig').d('总分等级条件配置'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('hzero.common.status.enable').d('启用'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${tenantId}/eval-templates/${evalTplId}/levels`,
      method: 'GET',
    },
    destroy: {
      url: `${SRM_SSLM}/v1/${tenantId}/eval-templates/${evalTplId}/levelList/delete`,
      method: 'DELETE',
    },
  },
});

// 按指标分数定义等级ds
export const getIndicatorScoreLevelDs = ({ evalTplId } = {}) => ({
  paging: false,
  autoQuery: true,
  forceValidate: true,
  fields: [
    {
      name: 'orderReq',
      type: 'number',
      min: 0,
      step: 1,
      precision: 1,
      required: true,
      label: intl.get('hzero.common.priority').d('优先级'),
    },
    {
      name: 'levelType',
      defaultValue: 2, // 后端标识，总分是1，指标是2
    },
    {
      name: 'indicatorCode',
      label: intl.get(`sslm.scoreLevel.model.scoreLevel.indicatorCode`).d('指标编码'),
    },
    {
      name: 'indicatorName',
      label: intl.get(`sslm.scoreLevel.model.scoreLevel.indicatorName`).d('指标名称'),
    },
    {
      name: 'scoreTypeMeaning',
      label: intl.get(`sslm.scoreLevel.model.scoreLevel.scoreType`).d('评分方式'),
    },
    {
      name: 'indicatorScoreFrom',
      type: 'number',
      label: intl.get('sslm.scoreLevel.model.scoreLevel.indicatorScoreFrom').d('指标分值从(=)'),
    },
    {
      name: 'indicatorScoreTo',
      type: 'number',
      label: intl.get('sslm.scoreLevel.model.scoreLevel.indicatorScoreTo').d('指标分值至(<)'),
    },
    {
      name: 'levelCode',
      required: true,
      maxLength: 20,
      pattern: /^[^\u4e00-\u9fa5]+$/,
      label: intl.get('sslm.scoreLevel.model.scoreLevel.levelCode').d('等级编码'),
    },
    {
      name: 'levelDesc',
      required: true,
      maxLength: 120,
      label: intl.get('sslm.scoreLevel.model.scoreLevel.levelDesc').d('等级描述'),
    },
    {
      name: 'scoreFrom',
      type: 'number',
      required: true,
      numberGrouping: false,
      label: intl.get('sslm.scoreLevel.model.scoreLevel.scoreFromTitle').d('分值从(=)'),
    },
    {
      name: 'scoreTo',
      type: 'number',
      min: 'scoreFrom',
      required: true,
      numberGrouping: false,
      label: intl.get('sslm.scoreLevel.model.scoreLevel.scoreToTitle').d('分值至(<)'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('hzero.common.status.enable').d('启用'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${tenantId}/eval-templates/${evalTplId}/indicators/levels`,
      method: 'GET',
    },
    destroy: {
      url: `${SRM_SSLM}/v1/${tenantId}/eval-templates/${evalTplId}/levelList/delete`,
      method: 'DELETE',
    },
  },
});
