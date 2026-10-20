/*
 * getScoreReminderDS - 分数提醒ds
 * @Date: 2023-10-19 11:16:38
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

// 按总分定义提醒ds
export const getTotalPointsReminderDs = ({ evalTplId } = {}) => ({
  paging: false,
  autoQuery: true,
  forceValidate: true,
  fields: [
    {
      name: 'remindScoreFrom',
      type: 'number',
      required: true,
      numberGrouping: false,
      label: intl.get('sslm.scoreLevel.model.scoreLevel.scoreFromTitle').d('分值从(=)'),
    },
    {
      name: 'remindScoreTo',
      type: 'number',
      required: true,
      numberGrouping: false,
      label: intl.get('sslm.scoreLevel.model.scoreLevel.scoreToTitle').d('分值至(<)'),
    },
    {
      name: 'remindDesc',
      label: intl.get('sslm.scoreLevel.model.reminder.desc').d('提醒内容'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${tenantId}/eval-templates/${evalTplId}/remind/tpl/collect`,
      method: 'GET',
    },
    destroy: {
      url: `${SRM_SSLM}/v1/${tenantId}/eval-templates/${evalTplId}/remind/tpl/indicators/delete`,
      method: 'DELETE',
    },
  },
});

// 按指标分数定义提醒ds
export const getIndicatorScoreReminderDs = ({ evalTplId } = {}) => ({
  paging: false,
  autoQuery: true,
  forceValidate: true,
  fields: [
    {
      name: 'indicatorCode',
      label: intl.get(`sslm.scoreLevel.model.scoreLevel.indicatorCode`).d('指标编码'),
    },
    {
      name: 'indicatorName',
      label: intl.get(`sslm.scoreLevel.model.scoreLevel.indicatorName`).d('指标名称'),
    },
    {
      name: 'remindScoreFrom',
      type: 'number',
      required: true,
      numberGrouping: false,
      label: intl.get('sslm.scoreLevel.model.scoreLevel.scoreFromTitle').d('分值从(=)'),
    },
    {
      name: 'remindScoreTo',
      type: 'number',
      required: true,
      numberGrouping: false,
      label: intl.get('sslm.scoreLevel.model.scoreLevel.scoreToTitle').d('分值至(<)'),
    },
    {
      name: 'remindDesc',
      label: intl.get('sslm.scoreLevel.model.reminder.desc').d('提醒内容'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${tenantId}/eval-templates/${evalTplId}/remind/tpl/indicators`,
      method: 'GET',
    },
    destroy: {
      url: `${SRM_SSLM}/v1/${tenantId}/eval-templates/${evalTplId}/remind/tpl/indicators/delete`,
      method: 'DELETE',
    },
  },
});
