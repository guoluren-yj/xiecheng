import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_MDM, SRM_SLOD } from '_utils/config';
import { HZERO_HWFP } from 'utils/config';

const organizationId = getCurrentOrganizationId();

// 查询状态的节点信息
export async function fetchModal(params) {
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/workbench/node/list`, {
    query: params,
    method: 'GET',
  });
}

// 查询菜单节点
export async function menuChange(params) {
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/workbench/node/list`, {
    method: 'GET',
    query: params,
  });
}

// 创建单据
export async function createData(params) {
  const { nodeTemplateCode, nodeConfigId, query, ...others } = params;
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${nodeConfigId}/create`,
    {
      method: 'POST',
      body: others.data,
      query,
    }
  );
}

// 全选创建单据
export async function createDataAll(params) {
  const { nodeTemplateCode, nodeConfigId, query, ...others } = params;
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${nodeConfigId}/create/condition`,
    {
      method: 'POST',
      body: others.queryParams,
      query,
    }
  );
}

// 明细行删除功能
export async function handleLineDel(params, flag = false) {
  const url = flag ? `line/check` : `line`;
  const { campKey, nodeTemplateCode, nodeConfigId, ...others } = params;
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${nodeConfigId}/${url}?campKey=${campKey}`,
    {
      method: 'DELETE',
      body: others.selectData,
    }
  );
}

// 删除功能 -- 此删除功能，所有列表明细共用一个接口，修改需谨慎
export async function handleDelete(params) {
  const { nodeTemplateCode, nodeConfigId, campKey, ...others } = params;
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${nodeConfigId}/header?campKey=${campKey}`,
    {
      method: 'DELETE',
      body: others.headerInfo,
    }
  );
}

// 提交按钮 -- 此提交功能，所有列表明细共用一个接口，修改需谨慎
export async function handleSubmit(params) {
  const {
    campKey,
    operationType,
    nodeTemplateCode,
    nodeConfigId,
    unitCode,
    tplInfo = {},
    ...others
  } = params;
  let query;
  if (unitCode) {
    query = {
      customizeUnitCode: unitCode,
      cuszTplStageCode: tplInfo?.cuszTplStageCode,
      cuszTplPageCode: tplInfo?.cuszTplPageCode,
      cuszTplTemplateCode: tplInfo?.templateCode,
      cuszTplVersion: tplInfo?.templateVersion,
    };
  }
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${nodeConfigId}/submit/${operationType}?campKey=${campKey}`,
    {
      method: 'PUT',
      body: operationType === 'tabulation' ? others.deliveryLineDTOList : [others.data],
      query,
    }
  );
}

// 确认按钮  -- 此功能，所有列表明细共用一个接口，修改需谨慎
export async function handleAffirm(params) {
  const {
    campKey,
    hdKey,
    operationType,
    nodeTemplateCode,
    num,
    unitCode,
    tplInfo,
    ...others
  } = params;
  const url = hdKey === 'left' ? `${nodeTemplateCode}/confirm` : `${nodeTemplateCode}/confirm-line`;
  let query;
  if (unitCode) {
    query = {
      customizeUnitCode: unitCode,
      cuszTplStageCode: tplInfo?.cuszTplStageCode,
      cuszTplPageCode: tplInfo?.cuszTplPageCode,
      cuszTplTemplateCode: tplInfo?.templateCode,
      cuszTplVersion: tplInfo?.templateVersion,
    };
  }
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/${url}/${operationType}?campKey=${campKey}`,
    {
      method: 'PUT',
      body:
        operationType !== 'detail'
          ? others.deliveryLineDTOList
          : num === 0
          ? [others.headerInfo]
          : others.headerInfo,
      query,
    }
  );
}

// 拒绝按钮  -- 此功能，所有列表明细共用一个接口，修改需谨慎
export async function handleClose(params) {
  const {
    operationType,
    hdKey,
    campKey,
    nodeTemplateCode,
    nodeConfigId,
    num,
    unitCode,
    tplInfo,
    ...others
  } = params;
  const url = hdKey === 'left' ? `refuse` : `refuse/line`;
  let query;
  if (unitCode) {
    query = {
      customizeUnitCode: unitCode,
      cuszTplStageCode: tplInfo?.cuszTplStageCode,
      cuszTplPageCode: tplInfo?.cuszTplPageCode,
      cuszTplTemplateCode: tplInfo?.templateCode,
      cuszTplVersion: tplInfo?.templateVersion,
    };
  }
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${url}/${operationType}?campKey=${campKey}`,
    {
      method: 'PUT',
      body:
        operationType !== 'detail'
          ? others.deliveryLineDTOList
          : num === 0
          ? [others.headerInfo]
          : others.headerInfo,
      query,
    }
  );
}

// 撤回按钮
export async function handleRecall(params) {
  const {
    hdKey,
    tplInfo,
    campKey,
    unitCode,
    operationType,
    nodeConfigId,
    nodeTemplateCode,
    ...others
  } = params;
  let query;
  if (unitCode) {
    query = {
      customizeUnitCode: unitCode,
      cuszTplStageCode: tplInfo?.cuszTplStageCode,
      cuszTplPageCode: tplInfo?.cuszTplPageCode,
      cuszTplTemplateCode: tplInfo?.templateCode,
      cuszTplVersion: tplInfo?.templateVersion,
    };
  }
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${nodeConfigId}/withdraw/${operationType}?campKey=${campKey}`,
    {
      method: 'PUT',
      body: operationType !== 'detail' ? others.deliveryLineDTOList : [others.headerInfo],
      query,
    }
  );
}

// 关闭按钮
export async function handleOff(params) {
  const {
    num,
    hdKey,
    tplInfo,
    campKey,
    unitCode,
    nodeConfigId,
    operationType,
    nodeTemplateCode,
    ...others
  } = params;
  const url = hdKey === 'left' ? `close` : `close-line`;
  let query;
  if (unitCode) {
    query = {
      customizeUnitCode: unitCode,
      cuszTplStageCode: tplInfo?.cuszTplStageCode,
      cuszTplPageCode: tplInfo?.cuszTplPageCode,
      cuszTplTemplateCode: tplInfo?.templateCode,
      cuszTplVersion: tplInfo?.templateVersion,
    };
  }
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${url}?campKey=${campKey}`,
    {
      method: 'PUT',
      body:
        operationType !== 'detail'
          ? others.deliveryLineDTOList
          : num === 0
          ? [others.headerInfo]
          : others.headerInfo,
      query,
    }
  );
}

// 取消按钮
export async function handleCancel(params) {
  const {
    operationType,
    hdKey,
    campKey,
    nodeTemplateCode,
    nodeConfigId,
    unitCode,
    tplInfo,
    ...others
  } = params;
  const url = hdKey === 'left' ? `cancel` : `cancel-line`;
  let query;
  if (unitCode) {
    query = {
      customizeUnitCode: unitCode,
      cuszTplStageCode: tplInfo?.cuszTplStageCode,
      cuszTplPageCode: tplInfo?.cuszTplPageCode,
      cuszTplTemplateCode: tplInfo?.templateCode,
      cuszTplVersion: tplInfo?.templateVersion,
    };
  }
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${url}?campKey=${campKey}`,
    {
      method: 'PUT',
      body: operationType !== 'detail' ? others.deliveryLineDTOList : [others.headerInfo],
      query,
    }
  );
}

// 打印按钮
export async function handlePrint(params) {
  const { hdKey, nodeTemplateCode, deliveryLineDTOList, campKey, responseType, headers } = params;
  const code = nodeTemplateCode === 'ASN' ? 'asn' : 'label';
  const list = deliveryLineDTOList.map((item) => {
    if (nodeTemplateCode === 'ASN') {
      return item?.asnHeaderId;
    } else if (hdKey === 'left') {
      return {
        labelHeaderId: item?.labelHeaderId,
      };
    } else {
      return {
        labelHeaderId: item?.labelHeaderId,
        labelLineId: item?.labelLineId,
        patchFlag: item.patchFlag || null,
      };
    }
  });
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/${code}/batch-print?campKey=${campKey}`,
    {
      headers,
      responseType,
      method: 'POST',
      body: list,
    }
  );
}

// 打印按钮-明细
export async function handleDetailPrint(params) {
  const { hdKey, campKey, nodeTemplateCode, deliveryLineDTOList, headers, responseType } = params;
  const code = nodeTemplateCode === 'ASN' ? 'asn' : 'label';
  const list = deliveryLineDTOList.map((item) => {
    if (nodeTemplateCode === 'ASN') {
      return item?.asnHeaderId;
    } else if (hdKey === 'left') {
      return {
        labelHeaderId: item?.labelHeaderId,
      };
    } else {
      return {
        labelHeaderId: item?.labelHeaderId,
        labelLineId: item?.labelLineId,
      };
    }
  });
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/${code}/batch-print?campKey=${campKey}`,
    {
      headers,
      responseType,
      method: 'POST',
      body: list,
    }
  );
}

// 保存功能 --明细页保存
export async function handleSave(params) {
  const { nodeTemplateCode, nodeConfigId, data, unitCode, tplInfo = {}, campKey } = params;
  let query;
  if (unitCode) {
    query = {
      customizeUnitCode: unitCode,
      cuszTplStageCode: tplInfo?.cuszTplStageCode,
      cuszTplPageCode: tplInfo?.cuszTplPageCode,
      cuszTplTemplateCode: tplInfo?.templateCode,
      cuszTplVersion: tplInfo?.templateVersion,
    };
  }
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${nodeConfigId}/save?campKey=${campKey}`,
    {
      method: 'PUT',
      body: data,
      query,
    }
  );
}

// 保存功能 --“全部”明细页保存
export async function handleAllSave(params) {
  const { nodeTemplateCode, nodeConfigId, data, unitCode, tplInfo = {}, campKey } = params;
  let query;
  if (unitCode) {
    query = {
      customizeUnitCode: unitCode,
      cuszTplStageCode: tplInfo?.cuszTplStageCode,
      cuszTplPageCode: tplInfo?.cuszTplPageCode,
      cuszTplTemplateCode: tplInfo?.templateCode,
      cuszTplVersion: tplInfo?.templateVersion,
    };
  }
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${nodeConfigId}/all/save?campKey=${campKey}`,
    {
      method: 'PUT',
      body: data,
      query,
    }
  );
}

// 保存功能 --“全部”明细页变更
export async function handleAllChange(params) {
  const { campKey, nodeTemplateCode, nodeConfigId, data, unitCode, tplInfo = {} } = params;
  let query;
  if (unitCode) {
    query = {
      customizeUnitCode: unitCode,
      cuszTplStageCode: tplInfo?.cuszTplStageCode,
      cuszTplPageCode: tplInfo?.cuszTplPageCode,
      cuszTplTemplateCode: tplInfo?.templateCode,
      cuszTplVersion: tplInfo?.templateVersion,
    };
  }
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${nodeConfigId}/change?campKey=${campKey}`,
    {
      method: 'PUT',
      body: data,
      query,
    }
  );
}

// 查询创建tab数量
export async function queryTabCount(params) {
  const { nodeTemplateCode, nodeConfigId, tabKey } = params;
  const url =
    tabKey === 'create' || (nodeTemplateCode === 'PLAN' && tabKey === 'all') ? `line` : `header`;
  const key = tabKey === 'affirm' ? 'confirm' : tabKey;
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/workbench/${nodeTemplateCode}/${nodeConfigId}/${key}-${url}/count?onlyCountLimit=100`,
    {
      method: 'GET',
      query: {
        page: 0,
        size: 100,
        onlyCountFlag: 'Y',
        campKey: params.campKey,
      },
    }
  );
}

// 勾选生成标签
export async function handLineBuilder(params, tplInfo) {
  const { campKey, nodeTemplateCode, nodeConfigId, ...others } = params;
  const query = {
    customizeUnitCode:
      'SLOD.DELIVERY__WORKBENCH_UNIQUE_LABEL_A.DETAIL_HEADER,SLOD.DELIVERY__WORKBENCH_UNIQUE_LABEL_A.DETAIL_LIST,SLOD.DELIVERY__WORKBENCH_UNIQUE_LABEL_A.LIST_UNLBBEL',
    cuszTplStageCode: tplInfo?.cuszTplStageCode,
    cuszTplPageCode: tplInfo?.cuszTplPageCode,
    cuszTplTemplateCode: tplInfo?.templateCode,
    cuszTplVersion: tplInfo?.templateVersion,
  };
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/unique-label/${nodeConfigId}?campKey=${campKey}`,
    {
      method: 'POST',
      body: others,
      query,
    }
  );
}

// 物流轨迹刷新
export async function handleRefreshLogistics(params) {
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/asn/${params.headerId}/logistics/refresh?campKey=${params.campKey}`,
    {
      method: 'PUT',
    }
  );
}

// 物流轨迹查询
export async function fetchLogistics(params) {
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/asn/${params.headerId}/logistics/locus`,
    {
      method: 'GET',
    }
  );
}

// 物流信息补录
export async function handleRecordLogistics(params) {
  const { asnHeaderId, data } = params;
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/asn/${asnHeaderId}/logistics`, {
    method: 'PUT',
    body: data,
  });
}

// 附件上传uuid
export async function getHeaderAttachmentUuid(params) {
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/asn/${params.asnHeaderId}/attachment?campKey=${params.campKey}`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

// 引用推荐配置
export async function getRecommendConfig() {
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/strategy/copy`, {
    method: 'PUT',
  });
}

// 引用推荐配置
export async function queryNodeTitle(params) {
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/plan/${params.nodeConfigId}/all/date/ui`,
    {
      method: 'GET',
      query: params,
    }
  );
}

// 查询变更字段
export async function queryChangeFields(params) {
  const { nodeTemplateCode = '', campKey } = params;
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/change-fields?campKey=${campKey}`,
    {
      method: 'GET',
      query: params,
    }
  );
}

// 并单查询根数据
export async function combineTabQuery(params) {
  const { nodeTemplateCode, nodeConfigId, cacheKey, campKey } = params;
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${nodeConfigId}/creating/list/${cacheKey}?campKey=${campKey}`,
    {
      method: 'GET',
      // query: params,
    }
  );
}

// 销毁tab缓存数据
export async function destroyChange(params) {
  const { nodeTemplateCode, nodeConfigId, cacheKey, campKey } = params;
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${nodeConfigId}/creating/list/${cacheKey}?campKey=${campKey}`,
    {
      method: 'DELETE',
      query: params,
    }
  );
}

// 工作流保存数据接口
export async function handWorkFlowSave(params) {
  const { nodeTemplateCode, data, unitCode, updateType, tplInfo = {} } = params;
  let query;
  if (unitCode) {
    query = {
      customizeUnitCode: unitCode,
      cuszTplStageCode: tplInfo?.cuszTplStageCode,
      cuszTplPageCode: tplInfo?.cuszTplPageCode,
      cuszTplTemplateCode: tplInfo?.templateCode,
      cuszTplVersion: tplInfo?.templateVersion,
    };
  }
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/save-field/for-feign?updateType=${updateType}`,
    {
      method: 'POST',
      body: data,
      query,
    }
  );
}

// modal增删改功能
export async function handLink(params) {
  const {
    isForm,
    methods,
    nodeTemplateCode,
    nodeConfigId,
    unitCode,
    campKey,
    tplInfo = {},
    ...others
  } = params;
  let query;
  if (unitCode) {
    query = {
      customizeUnitCode: unitCode,
      cuszTplStageCode: tplInfo?.cuszTplStageCode,
      cuszTplPageCode: tplInfo?.cuszTplPageCode,
      cuszTplTemplateCode: tplInfo?.templateCode,
      cuszTplVersion: tplInfo?.templateVersion,
    };
  }
  const url = isForm ? 'header' : 'line';
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${nodeConfigId}/${url}/ext?campKey=${campKey}`,
    {
      query,
      method: methods || 'PUT',
      body: others.data,
    }
  );
}

/**
 * 查询是否开启双单位配置
 * @param {moduleCode} moduleCode
 * @returns 0上下游都不开启双单位，1上下游和物流都开启双单位，2仅物流开启
 */

export async function queryDoubleUomConfig() {
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/secondary-uom-flag`, {
    method: 'GET',
  });
}

/*
  secondaryQuantity：辅助数量，类型:BigDecimal，非必填
  primaryQuantity:基本数量，类型:BigDecimal，非必填
  businessKey：业务主键，为加密后的值，类型：Long，必填
  itemId:物料id(smdm_item)，类型：Long,必填
  doublePrimaryUomId:基本单位id(smdm_uom),为加密后的值，类型：Long，必填
  secondaryUomId: 辅助单位id(smdm_uom).为加密后的值，类型：Long，必填
*/
export async function queryDoubleUnitConversion(params) {
  return request(`${SRM_MDM}/v1/${organizationId}/items/uom/calculate/quantity`, {
    method: 'POST',
    body: params,
  });
}

// 打印按钮
export async function handleExport(params) {
  const { nodeConfigId, campKey, queryParamsDate, unitCuzCode } = params;
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/plan/${nodeConfigId}/all/date/export`, {
    query: {
      campKey,
      customizeUnitCode: unitCuzCode,
      ...queryParamsDate,
    },
    method: 'POST',
    responseType: 'blob',
  });
}

/**
 * 查询是否开启双单位配置
 * @param {moduleCode} moduleCode
 * @returns 0上下游都不开启双单位，1上下游和物流都开启双单位，2仅物流开启
 */

export async function queryHistoryTag(params) {
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/${params.nodeTemplateCode}/history/${params.headerId}?campKey=${params.campKey}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 查询变更是否开启
 * @param {moduleCode} moduleCode
 */
export async function queryChangeConfiguration() {
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/change-split/enable`, {
    method: 'GET',
  });
}

/**
 * 查询节点tab计数
 * @param {moduleCode} moduleCode
 */
export async function queryCountList({ campKey }) {
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/workbench/node/list/count?campKey=${campKey}`,
    {
      method: 'GET',
    }
  );
}

// 撤销审批
export async function handleRevokeApprovalChange(params) {
  let realRes;
  const res = await request(
    `${HZERO_HWFP}/v1/${organizationId}/runtime/prc/revoke-by-key/${params.businessKey}`,
    { responseType: 'text' }
  );
  try {
    realRes = JSON.parse(res);
  } catch (error) {
    realRes = res;
  }
  return realRes;
}

// 判断是否属于第一个审批人员
export async function handleBusinesskeyFlag() {
  return request(`${SRM_SLOD}/v1/${organizationId}/runtime/prc/operation-flag`, {
    method: 'POST',
    // body: data,
  });
}

/**
 * 批量获取该工作流流程是否允许撤销
 * @param {object} params - 接口传参
 */
export async function fetchOperationFlag(params) {
  const { body, query } = params;
  return request(`${HZERO_HWFP}/v1/${organizationId}/runtime/prc/operation-flag`, {
    body,
    query,
    method: 'POST',
  });
}

/**
 * 撤销变更接口
 * method: 'PUT'
 * @param {object} params - 接口传参
 */
export async function handleCancelChangeApi(params) {
  const { deliveryLineDTOList, ...others } = params;
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/${others.nodeTemplateCode}/${others.nodeConfigId}/revoke-change`,
    {
      body: deliveryLineDTOList,
      query: others,
      method: 'PUT',
    }
  );
}
