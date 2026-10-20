/*
 * @Date: 2023-10-07 17:03:00
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 指标启用/禁用
export async function indicatorsEnable(enabledFlag, record) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/indicators/${enabledFlag ? 'disable' : 'enable'}`,
    {
      body: record,
      method: 'PUT',
    }
  );
}

// 删除评分指标
export async function deleteIndicators(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/indicators/delete`, {
    method: 'DELETE',
    body: params,
  });
}

// 查询指标被哪些评分模板引用
export async function queryScoreTemp(params, type) {
  const path = type === 'BATCH_UPDATE' ? 'eval-tpls' : 'eval-tpl';
  return request(`${SRM_SSLM}/v1/${organizationId}/indicators/display/${path}`, {
    method: 'POST',
    body: params,
  });
}

// 将指标更新至对应评分模板
export async function updateScoreTemp(params, type) {
  const path =
    type === 'BATCH_UPDATE'
      ? 'indicators/update/eval-inds'
      : type === 'MODAL'
      ? 'indicators/new/update/eval-ind'
      : 'indicators/update/eval-ind';
  return request(`${SRM_SSLM}/v1/${organizationId}/${path}`, {
    method: 'POST',
    body: params,
  });
}

// 保存引用平台的指标
export async function savePlatformIndicator(data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/indicators/ref`, {
    body: data,
    method: 'POST',
  });
}

// 保存手工新建的指标
export async function saveManualIndicator(params) {
  const { customizeUnitCode, queryParams = {}, ...rest } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/indicators/new/build`, {
    body: rest,
    method: 'POST',
    query: queryParams,
  });
}

// 评分模板启用/禁用
export async function enableEvalTemplate(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates`, {
    body: params,
    method: 'POST',
    // query: { customizeUnitCode: "" },
  });
}

// 评分模板历史记录
export async function fetchHistoricalVersion(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/history/kpi-eval-tpl-code/new`, {
    method: 'GET',
    query: params,
  });
}

// 保存评分模板
export async function createTemplate(data, type) {
  const path = type === 'COPY' ? 'eval-templates/new/copy' : 'eval-templates/new/bulid';
  return request(`${SRM_SSLM}/v1/${organizationId}/${path}`, {
    body: data,
    method: 'POST',
  });
}

// 更新评分模板
export async function saveTemplate(data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/new/add`, {
    body: data,
    method: 'POST',
  });
}

// 明细发布评分模板
export async function publishTemplate(data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/new/publish`, {
    body: data,
    method: 'PUT',
  });
}

// 列表发布评分模板
export async function publishListTemplate(data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/list/new/publish`, {
    body: data,
    method: 'PUT',
  });
}

// 考评模板-保存新增的指标
export async function saveCreateIndicator(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/new/ref`, {
    body: params,
    method: 'POST',
  });
}

// 保存参评供应商
export async function saveEvaluatedSupplier(evalTplId, data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/${evalTplId}/scope/new`, {
    body: data,
    method: 'POST',
  });
}

// 评分人-批量新增供应商、品类、物料、评分人
export async function raterDimensionAdd(params) {
  const { evalRespRule, evalTplId, data } = params;
  const path =
    evalRespRule === 'RATER'
      ? `kpi-eval-tpl-resp-dmss/${evalTplId}/tpl/add`
      : `kpi-eval-tpl-datas/${evalRespRule}/${evalTplId}`;
  const saveData =
    evalRespRule === 'RATER'
      ? data.map(item => {
          const { userId, userName, loginName, ...others } = item;
          return {
            ...others,
            respUserId: userId,
            respUserName: userName,
            respLoginName: loginName,
          };
        })
      : data;
  return request(`${SRM_SSLM}/v1/${organizationId}/${path}`, {
    body: saveData,
    method: 'POST',
  });
}

// 评分人-分配评分人
export async function assignScorer(params) {
  const { evalDataType } = params;
  const path =
    evalDataType === 'INDICATOR'
      ? `eval-templates/indicators/operate/new`
      : `kpi-eval-tpl-resp-dmss/${params.evalTplId}/operate`;
  return request(`${SRM_SSLM}/v1/${organizationId}/${path}`, {
    body: filterNullValueObject(params),
    method: 'POST',
  });
}

// 策略保存
export async function saveStrategy(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-eval-tpl-strategys/${params.evalTplId}`, {
    body: params,
    method: 'POST',
  });
}

// 评分等级保存
export async function saveScoreLevel(params) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-templates/${params.evalTplId}/levelList/new`,
    {
      body: params,
      method: 'POST',
    }
  );
}

// 分数提醒设置保存
export async function saveScoreReminder(params) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-templates/${params.evalTplId}/remind/tpl/indicators/operate`,
    {
      body: params,
      method: 'POST',
    }
  );
}

// 解锁模板
export async function unlockTemp(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/new/unlock`, {
    body: params,
    method: 'POST',
  });
}

// 查询总分等级条件配置
export async function fetchTotalLevelCondition({ strategyId, ...rest }) {
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-level-strategy/detail/${strategyId}`, {
    method: 'GET',
    query: rest,
  });
}

// 保存总分等级条件配置
export async function saveTotalLevelCondition(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-level-strategy/${params.evalTplId}`, {
    method: 'POST',
    body: params,
  });
}

// 批量分配品类/物料
export async function batchAssignItemOrCategory(params) {
  const { evalTplId } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-templates/eval-manage/batch-save-eval-line/${evalTplId}`,
    {
      method: 'POST',
      body: params,
    }
  );
}
