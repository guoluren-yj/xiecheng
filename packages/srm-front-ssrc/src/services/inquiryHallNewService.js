import request from 'utils/request';
import { getEnvConfig } from 'utils/iocUtils';
import { SRM_SSRC, SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const { HZERO_IAM } = getEnvConfig();
const prefix = `${SRM_SSRC}/v1`;
const curOrganizationId = getCurrentOrganizationId();

const tenantId = getCurrentOrganizationId();

// 寻源维护改变公司、需求部门
export function changeCompanyUnit(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/members/get-default-values`, {
    method: 'POST',
    body: otherParams,
  });
}

// 资格预审-资格预审细项-参考模板
export function prequalScoreDetailReferenceTemplate(params = {}) {
  const { organizationId, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/prequal/score-indic/import-template`, {
    method: 'POST',
    body: otherParams,
  });
}

// 资格预审-分组资格预审细项-参考模板
export function prequalScoreDetailGroupReferenceTemplate(params = {}) {
  const { organizationId, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/prequal-group-headers/score-indic/import-template`, {
    method: 'POST',
    body: otherParams,
  });
}

// 询价单维护新页面 save
export async function saveInquiryHallUpdateVTwo(params) {
  const { organizationId, customizeUnitCode, ...otherParams } = params;
  return request(`${SRM_SSRC}/v2/${organizationId}/rfx/save`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: otherParams,
    headers: {
      's-request-web': 'srm_web',
    },
  });
}

/**
 * 维护新页面 - 发布
 * @async
 * @function releaseInquiryHall
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function releaseInquiryHallVTwo(params) {
  const { organizationId, customizeUnitCode, ...otherParams } = params;
  return request(`${SRM_SSRC}/v2/${organizationId}/rfx/release`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: otherParams,
    headers: {
      's-request-web': 'srm_web',
    },
  });
}

/**
 * 寻源维护(新)-可参与供应商阶段
 * */
export async function fetchParticationSupplierStages(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/get-allow-source-supplier-stages`, {
    method: 'GET',
    query: otherParams,
    responseType: 'text',
  });
}

/**
 * 寻源维护(新)-新单据寻源节点查询
 * */
export async function fetchNewSourceNodes(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v2/${organizationId}/rfx/progress/all/by-template`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 寻源维护(新)-寻源模板改变
 * */
export async function changeSourceTemplateIntegrate(params = {}) {
  const { organizationId, customizeUnitCode = null, ...otherParams } = params;
  return request(`${SRM_SSRC}/v2/${organizationId}/rfx/source-template-change`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: otherParams,
  });
}

/**
 * 供应商筛选物品行修改保存
 * @async
 * @function saveSupplierRecordLine
 * @param {object} params - 保存数据
 * @returns {object} fetch Promise
 */
export async function saveAllotItem(params) {
  const { organizationId, customizeUnitCode, ...other } = params;
  return request(`${prefix}/${organizationId}/rfx/item-sup-assign/save`, {
    method: 'POST',
    body: other,
    query: {
      customizeUnitCode,
    },
  });
}

/**
 * 寻源明细(新)-配置表配置新老节点
 * */
export async function fetchConfigSheetRfxPrepare(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/source_old_ui_config/list-from-site`,
    {
      method: 'POST',
      body: otherParams,
    }
  );
}

// 查询配置表
export async function fetchConfigSheet(params = {}) {
  const { organizationId, configCode = null, data = {} } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${configCode}/list-from-site`,
    {
      method: 'POST',
      body: data,
    }
  );
}

// 查询配置表
export async function fetchNewBidEnable(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/share/common/second-open-bid/enable`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 寻源大厅(新)-查各个tab的数量
 * */
export async function searchInquiryHallNumber(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v2/${organizationId}/rfx/list/count`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 寻源大厅(新)-查各个明细数量
 * */
export async function countDetailLength(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v2/${organizationId}/rfx/list/all/item/count`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 寻源大厅-个人中心配置-创建头默认值查询
 * @async
 * @function fetchCreatedUnitName
 * @returns {object} fetch Promise
 */
export async function fetchCreatedUnitName(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${HZERO_IAM}/v1/${organizationId}/user-defaults/check`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 检验权限
 * @param {array} params.code - 权限编码
 */
export async function checkPermission(params) {
  return request(`${HZERO_IAM}/hzero/v1/menus/check-permissions`, {
    method: 'POST',
    body: params,
  });
}

// rfx明细 横竖版布局查询
export function fetchInquiryHallUserMemory(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/user-config/batch`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 保存初步评审行
 * @async
 * @param {Object} params - 参数
 * @returns {Promise} fetch Promise
 */
export async function saveInitialReviewLines(params) {
  const { organizationId, operationType = '', customizeUnitCode } = params;
  return request(`${prefix}/${organizationId}/evaluate-indics/initial-review`, {
    method: 'POST',
    query: { operationType, customizeUnitCode },
    body: params.otherParams,
  });
}

// 寻源明细-配置查询-集合接口
export async function fetchRfxDetailConfigs(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v2/${organizationId}/rfx/progress`, {
    method: 'POST',
    body: otherParams,
    query: { permissionFilterFlag: params?.permissionFilterFlag || 0 },
  });
}

// 寻源明细-查询头信息+预审小组+寻源小组-集合接口
export async function fetchInquiryHeaderDetails(params = {}) {
  const { organizationId, rfxHeaderId, customizeUnitCode = {}, isPubPage, ...otherParams } = params;
  let url;
  if (isPubPage) {
    url = `${SRM_SSRC}/v1/${organizationId}/rfx/hist/${rfxHeaderId}/detail`;
  } else {
    url = `${SRM_SSRC}/v2/${organizationId}/rfx/${rfxHeaderId}/detail`;
  }
  return request(url, {
    method: 'POST',
    query: { customizeUnitCode, permissionFilterFlag: params?.permissionFilterFlag || 0 },
    body: otherParams,
  });
}

// 寻源维护-新建rfx-配置中心+用户组织+用户部门+供应商阶段-集合接口
export async function fetchRfxCreateConfig(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v2/${organizationId}/rfx/configs`, {
    method: 'POST',
    body: otherParams,
  });
}

// 寻源-寻源创建-单据维护设置：业务规则定义-线下整单录入选用维度配置
export async function fetchRfxOfflineDimensionConfig(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/rfx/offline-whole/suggested-dimension`,
    {
      method: 'POST',
      body: otherParams,
      responseType: 'text',
    }
  );
}

// 申请转寻源管控查询
export async function fetchApplyInquiryControl(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/turn-pr-merge-rule/check-field`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 寻源维护(新)-寻源模板改变
 * */
export async function changeSectionNameLov(params = {}) {
  const { organizationId } = params;
  return request(`${SRM_SSRC}/v2/${organizationId}/rfx/section`, {
    method: 'POST',
    body: params.rfxHeaderDTO,
  });
}

/**
 * 保存初步评审行
 * @async
 * @param {Object} params - 参数
 * @returns {Promise} fetch Promise
 */
export async function validateBeforeRelease(params) {
  const { rfxHeaderId, organizationId, customizeUnitCode, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/release-validate/${rfxHeaderId}`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: otherParams,
  });
}

// 时间控制-查询
export async function fetchTimeControl(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v2/${organizationId}/rfx/adjust-date/query`, {
    method: 'GET',
    query: otherParams,
  });
}

// 询价控制-时间调整-工作流审批-查询
export async function fetchPublicTimeAdjust(params = {}) {
  const { organizationId, rfxHeaderId: rfxHeaderSnapId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/${rfxHeaderSnapId}/adjust-date/detail`, {
    method: 'GET',
    query: otherParams,
  });
}

// 获取标段信息
export async function fetchSctionList(params = {}) {
  const { organizationId, rfxHeaderId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v2/${organizationId}/rfx/${rfxHeaderId}/project/section`, {
    method: 'GET',
    query: otherParams,
  });
}

// 获取新开标信息
export async function fetchBidOpenExecution(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/members/open/execution/status`, {
    method: 'POST',
    body: otherParams,
  });
}

// 获取新开标-执行情况信息
export async function fetchScExecutionList(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/members/open/execution/list`, {
    method: 'POST',
    body: otherParams,
  });
}

// 批量开标
export async function batchOpenBindding(params = {}) {
  const { organizationId, openPassword, projectLineSectionList, rfxHeaderId } = params;
  return request(`${SRM_SSRC}/v2/${organizationId}/rfx/section/open`, {
    method: 'POST',
    query: { openPassword, rfxHeaderId },
    body: projectLineSectionList,
  });
}

// 批量转交
export async function batchTransfer(params = {}) {
  const { organizationId, openUserId, projectLineSectionList, rfxHeaderId } = params;
  return request(`${SRM_SSRC}/v2/${organizationId}/rfx/section/open/deliver`, {
    method: 'POST',
    query: { openUserId, rfxHeaderId },
    body: projectLineSectionList,
  });
}

// 批量发消息
export async function batchSendMessage(params = {}) {
  const { organizationId, projectLineSectionList, rfxHeaderId } = params;
  return request(`${SRM_SSRC}/v2/${organizationId}/rfx/section/open-message`, {
    method: 'POST',
    query: { rfxHeaderId },
    body: projectLineSectionList,
  });
}

/**
 * 供应商筛分配标段保存
 * @async
 * @function saveAllotSection
 * @param {object} params - 保存数据
 * @returns {object} fetch Promise
 */
export async function saveAllotSection(params) {
  const { organizationId, customizeUnitCode, ...other } = params;
  return request(`${prefix}/${organizationId}/rfx/item-sup-assign/sections/save`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: other,
  });
}

// 核价审批-分标段-查询标段
export async function fetchCheckPriceApprovalSectionList(params = {}) {
  const { organizationId, ...others } = params;
  return request(`${SRM_SSRC}/v2/${organizationId}/rfx/project/section`, {
    method: 'GET',
    query: others,
  });
}

// 询价工作台-明细-标段查询
export async function fetchRfxDetailSection(params = {}) {
  const { organizationId, rfxHeaderId, ...others } = params;
  return request(`${SRM_SSRC}/v2/${organizationId}/rfx/${rfxHeaderId}/project/all-section`, {
    method: 'GET',
    query: others,
  });
}

/**
 * 跳转到询报价控制前的校验
 * @async
 * @function validateBeforeDirectController
 * @param {object} params - 接口参数 sourceHeaderId sourceFrom
 * @returns {object} fetch Promise
 */
export async function validateBeforeDirectController(params) {
  const { organizationId, sourceHeaderId, sourceFrom, ...otherParams } = params;
  return request(
    `${prefix}/${organizationId}/share/adjust-record/${sourceHeaderId}/${sourceFrom}/adjust-record-validate`,
    {
      method: 'GET',
      query: { ...otherParams },
    }
  );
}

/**
 * 创建一个时间调整副本
 * @async
 * @function createBeforeDirectController
 * @param {object} params - 接口参数 sourceHeaderId sourceFrom
 * @returns {object} fetch Promise
 */
export async function createBeforeDirectController(params) {
  const { organizationId, sourceHeaderId, sourceFrom } = params;
  return request(
    `${prefix}/${organizationId}/share/adjust-record/${sourceHeaderId}/${sourceFrom}/create-adjust-all`,
    {
      method: 'POST',
    }
  );
}

/**
 * 查询资格预审分组
 * @async
 * @function queryPrequalGroup
 * @param {Object} params - 查询条件
 * @returns {Object} fetch Promise
 */
export async function queryPrequalGroup(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/prequal-group-headers`, {
    method: 'GET',
    query: { ...otherParams },
  });
}

/**
 * 保存资格预审标段分组
 * @async
 * @function savePrequalSectionGroup
 * @param {Object} params - 查询条件
 * @returns {Object} fetch Promise
 */
export async function savePrequalSectionGroup(params) {
  const { organizationId, tempSourceHeaderId, selectedData } = params;
  return request(
    `${prefix}/${organizationId}/prequal-group-lines/add-sections/${tempSourceHeaderId}`,
    {
      method: 'POST',
      body: selectedData,
    }
  );
}

/**
 * 新-询报价控制
 * @async
 * @function fetchControllerData
 * @param {object} params - 接口参数 adjustRecordId 副本ID
 * @returns {object} fetch Promise
 */
export async function fetchControllerData(params) {
  const { organizationId, adjustRecordId, ...otherParams } = params;
  return request(
    `${prefix}/${organizationId}/rfx/adjust/${adjustRecordId}/query-by-adjust-record`,
    {
      method: 'GET',
      query: { ...otherParams },
    }
  );
}

/**
 * 新-询报价控制-当前版本
 * @async
 * @function fetchAfterQueryData
 * @param {object} params - 接口参数 adjustRecordId 副本ID
 * @returns {object} fetch Promise
 */
export async function fetchAfterQueryData(params) {
  const { organizationId, adjustRecordId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/adjust/${adjustRecordId}/after-adjust/query`, {
    method: 'GET',
    query: { ...otherParams },
  });
}

/**
 * 新-询报价控制-历史版本
 * @async
 * @function fetchBeforeQueryData
 * @param {object} params - 接口参数 adjustRecordId 副本ID
 * @returns {object} fetch Promise
 */
export async function fetchBeforeQueryData(params) {
  const { organizationId, adjustRecordId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/adjust/${adjustRecordId}/before-adjust/query`, {
    method: 'GET',
    query: { ...otherParams },
  });
}

/**
 * 新-询报价控制-预览
 * @async
 * @function fetchBeforeQueryData
 * @param {object} params - 接口参数 adjustRecordId 副本ID
 * @returns {object} fetch Promise
 */
export async function fetchPreviewData(params) {
  const { organizationId, adjustRecordId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/adjust/${adjustRecordId}/detail-preview`, {
    method: 'GET',
    query: { ...otherParams },
  });
}

/**
 * 新-询报价控制-保存分配物料
 * @param {*} params - organizationId rfxItemSupAssinAdjust<List>
 * @returns Promise
 */
export async function saveDistributionItems(params) {
  const { organizationId, rfxItemSupAssinAdjust, customizeUnitCode } = params;
  return request(`${prefix}/${organizationId}/rfx/item-sup-assign/adjust/save`, {
    method: 'POST',
    body: rfxItemSupAssinAdjust,
    query: {
      customizeUnitCode,
    },
  });
}

/**
 * 新-询报价控制-保存供应商
 * @param {*} params - organizationId rfxItemSupAssinAdjust<List>
 * @returns Promise
 */
export async function saveDistributionSupplier(params) {
  const { organizationId, rfxLineSupplierAdjust } = params;
  return request(`${prefix}/${organizationId}/rfx/suppliers/adjust/save`, {
    method: 'POST',
    body: rfxLineSupplierAdjust,
  });
}

/**
 * 批量应用至其他分组
 * @async
 * @function batchApplyToOtherGroups
 * @param {Object} params - 查询条件
 * @returns {Object} fetch Promise
 */
export async function batchApplyToOtherGroups(params) {
  const { organizationId, formData } = params;
  return request(`${prefix}/${organizationId}/prequal-group-headers/apply-to-other-groups`, {
    method: 'POST',
    body: formData,
  });
}

/**
 * 新-询报价控制-批量添加供应商保存-资格预审校验-全部通过则保存
 * @param {*} params
 * @returns Promise
 */
export async function bathAddSupplierAndValidate(params) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/rfx/suppliers/adjust/getSupExpirAttachment`, {
    method: 'POST',
    body: { ...other },
  });
}

/**
 * 新-询报价控制-批量添加供应商保存
 * @param {*} params
 * @returns Promise
 */
export async function bathAddSupplier(params) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/rfx/suppliers/adjust/batch-add`, {
    method: 'POST',
    body: { ...other },
  });
}

/**
 * 新-询报价控制-废弃
 * @param {*} params
 * @returns Promise
 */
export async function discardAdjust(params) {
  const { organizationId, adjustRecordId } = params;
  return request(`${prefix}/${organizationId}/share/adjust-record/discard/${adjustRecordId}`, {
    method: 'POST',
  });
}

/**
 * 新-征询单控制--废弃
 * @param {*} params
 * @returns Promise
 */
export async function discardRfAdjust(params) {
  const { organizationId, adjustRecordId } = params;
  return request(`${prefix}/${organizationId}/rf/adjust-record/discard/${adjustRecordId}`, {
    method: 'POST',
  });
}

/**
 * 新-询报价控制-整体保存
 * @param {*} params
 * @returns Promise
 */
export async function saveAdjust(params) {
  const { organizationId, customizeUnitCode, ...other } = params;
  return request(`${prefix}/${organizationId}/rfx/adjust/save`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: { ...other },
  });
}

/**
 * 新-询报价控制-整体提交
 * @param {*} params
 * @returns Promise
 */
export async function submitAdjust(params) {
  const { organizationId, customizeUnitCode, ...other } = params;
  return request(`${prefix}/${organizationId}/rfx/adjust/submit`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: { ...other },
  });
}

/**
 * 新-询报价控制-批量整体提交
 * @param {*} params
 * @returns Promise
 */
export async function submitSectionAdjust(params) {
  const { organizationId, customizeUnitCode, ...other } = params;
  return request(`${prefix}/${organizationId}/rfx/adjust/section-batch-submit`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: { ...other },
  });
}

// 询价监控台-供应商列表-提醒供应商报价  /v1/{{organizationId}}/rfx/{{rfxHeaderId}}/supplier-quotation/notice
export async function handleWarningSupplierQuotation(params = {}) {
  const { organizationId = null, rfxHeaderId = null, ...others } = params;
  return request(`${prefix}/${organizationId}/rfx/${rfxHeaderId}/supplier-quotation/notice`, {
    method: 'GET',
    query: others,
  });
}

// 配置中心-寻源事项-公司配置
export async function companyConfigCenter(params = {}) {
  const { organizationId, companyId } = params;
  return request(`${prefix}/${organizationId}/source-matter-conf/detail`, {
    method: 'GET',
    query: { companyId, tenantId: organizationId },
  });
}

/**
 * 修改合并分组方式
 * @async
 * @function changeGroupMergeType
 * @param {Object} params - 新的分组方式参数
 * @returns {Object} fetch Promise
 */
export async function changeGroupMergeType(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/prequal-group-headers/switch-merge-type`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 新-询报价控制-整体提交-校验
 * @param {*} params
 * @returns Promise
 */
export async function submitAdjustValidate(params) {
  const { organizationId, customizeUnitCode, ...other } = params;
  return request(`${prefix}/${organizationId}/rfx/adjust/submit-validate`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: { ...other },
  });
}

export async function createRF(params) {
  const { organizationId, ...others } = params;
  return request(`${prefix}/${organizationId}/rf/create`, {
    method: 'POST',
    body: others,
  });
}

/**
 * 获取相同询价单状态下的标段信息
 * @param {*} params 查询参数
 * @returns Promise
 */
export async function fetchOtherSectionInfo(params = {}) {
  const { adjustRecordId, organizationId, ...otherParams } = params;
  return request(
    `${prefix}/${organizationId}/rfx/adjust/${adjustRecordId}/quote-section-batch-list/query`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}

/**
 * 获取相同询价单状态下的预审分组信息
 * @param {*} params 查询参数
 * @returns Promise
 */
export async function fetchOtherGroupInfo(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/prequal-group-headers/list-without-current-group`, {
    method: 'GET',
    query: otherParams,
  });
}

// =======================================================
// RF寻源过程控制接口

// 查询
export async function controllerQuery(params) {
  const { adjustRecordId, customizeUnitCode } = params;
  return request(`${prefix}/${tenantId}/rf/adjust/${adjustRecordId}/query-by-adjust-record`, {
    method: 'GET',
    query: {
      customizeUnitCode,
    },
  });
}

/**
 * 新-询报价控制-引用至其他标段-确定
 * @param {*} params
 * @returns Promise
 */
export async function applyToOtherSection(params) {
  const { organizationId, adjustRecordId, adjustType, projectLineSectionList } = params;
  return request(
    `${prefix}/${organizationId}/rfx/adjust/${adjustRecordId}/${adjustType}/quote-section-batch-update`,
    {
      method: 'POST',
      body: projectLineSectionList,
    }
  );
}

/**
 * 新-询报价控制-引用至其他预审分组-确定
 * @param {*} params
 * @returns Promise
 */
export async function applyToOtherGroup(params) {
  const { organizationId, adjustRecordId, adjustType, prequalGroupHeaders } = params;
  return request(
    `${prefix}/${organizationId}/rfx/adjust/${adjustRecordId}/${adjustType}/quote-group-batch-update`,
    {
      method: 'POST',
      body: prequalGroupHeaders,
    }
  );
}

/**
 * 预览分权-查询 rfx/{rfxHeaderId}/decentralization
 * */
export async function fetchPreviewScoreManager(params = {}) {
  const { organizationId, rfxHeaderId = null, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/${rfxHeaderId}/decentralization`, {
    method: 'GET',
    query: otherParams,
  });
}

// 寻源过程控制-专家-GET
export async function fetchExpertOfQuotationController(params) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/evaluate-expert-adjusts`, {
    method: 'GET',
    query: { ...other },
  });
}

// 寻源过程控制-专家-UPDATE
export async function updateExpertOfQuotationController(params) {
  const { organizationId, customizeUnitCode = null, ...other } = params;
  return request(`${prefix}/${organizationId}/evaluate-expert-adjusts`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: { ...other },
  });
}

// 寻源过程控制-专家-DELETE
export async function deleteExpertOfQuotationController(params) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/evaluate-expert-adjusts`, {
    method: 'DELETE',
    body: { ...other },
  });
}

// 寻源过程控制-评分要素-查询
export async function fetchScoreDetailOfQuotationController(params) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/evaluate-indic-adjusts`, {
    method: 'GET',
    query: { ...other },
  });
}

// 寻源过程控制-评分要素-update
export async function updateScoreDetailOfQuotationController(params) {
  const { organizationId, customizeUnitCode, otherParams = [] } = params;
  return request(`${prefix}/${organizationId}/evaluate-indic-adjusts`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: otherParams,
  });
}

// 寻源过程控制-评分要素-UPdate
export async function deleteScoreDetailOfQuotationController(params) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/evaluate-indic-adjusts`, {
    method: 'POST',
    body: { ...other },
  });
}

// 寻源过程控制-评分要素-分配专家-UPDATE
export async function assignExpertScoreDetailOfQuotationController(params) {
  const { organizationId, queryParams = {}, data = [] } = params;
  return request(`${prefix}/${organizationId}/evaluate-indic-adjusts/assigns`, {
    method: 'POST',
    query: queryParams,
    body: data,
  });
}

// 寻源过程控制-二级要素-GET
export async function fetchScoreDetailLevelTwoOfQuotationController(params = {}) {
  const { organizationId, ...other } = params;
  const param = parseParameters(other);
  return request(`${prefix}/${organizationId}/evaluate-indic-adjusts/two`, {
    method: 'GET',
    query: { ...param },
  });
}

// 寻源过程控制-二级要素-UPDATE
export async function updateScoreDetailLevelTwoOfQuotationController(params) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/evaluate-indic-adjusts/two`, {
    method: 'POST',
    body: { ...other },
  });
}

// 寻源过程控制-二级要素-DELETE
export async function deleteScoreDetailLevelTwoOfQuotationController(params) {
  const { organizationId, data = [] } = params;
  return request(`${prefix}/${organizationId}/evaluate-indic-adjusts/two`, {
    method: 'DELETE',
    body: data,
  });
}

// 寻源过程控制-评分要素-参考模板-确定
export async function referenceTemplateSavedOfQuotationController(params = {}) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/evaluate-indic-adjusts/template-import`, {
    method: 'POST',
    body: { ...other },
  });
}

// 寻源过程控制-专家-fetch-current
export async function fetchExpertCurrent(params = {}) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/evaluate-expert-adjusts/after-query`, {
    method: 'GET',
    query: { ...other },
  });
}

// 寻源过程控制-专家-fetch-HISTORY
export async function fetchExpertHistory(params = {}) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/evaluate-expert-adjusts/before-query`, {
    method: 'GET',
    query: { ...other },
  });
}

// 寻源过程控制-评分要素-fetch-Current
export async function fetchScoreCurrent(params = {}) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/evaluate-indic-adjusts/after-query`, {
    method: 'GET',
    query: { ...other },
  });
}

// 寻源过程控制-评分要素-fetch-HISTORY
export async function fetchScoreHistory(params = {}) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/evaluate-indic-adjusts/before-query`, {
    method: 'GET',
    query: { ...other },
  });
}

// 寻源过程控制-评分要素-二级-fetch-Current
export async function fetchScoreDetailCurrent(params = {}) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/evaluate-indic-adjusts/two/after-query`, {
    method: 'GET',
    query: { ...other },
  });
}

// 寻源过程控制-评分要素-二级-fetch-HISTORY
export async function fetchScoreDetailHistory(params = {}) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/evaluate-indic-adjusts/two/before-query`, {
    method: 'GET',
    query: { ...other },
  });
}

// 寻源过程控制-评分要素-专家分配-Current
export async function fetchScoreAssignExpertCurrent(params = {}) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/evaluate-indic-adjusts/assigns/after-query`, {
    method: 'GET',
    query: { ...other },
  });
}

// 寻源过程控制-评分要素-专家分配-HISTORY
export async function fetchScoreAssignExpertHistory(params = {}) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/evaluate-indic-adjusts/assigns/before-query`, {
    method: 'GET',
    query: { ...other },
  });
}

// 转RF之前校验
export async function projectToRFValidate(params = {}) {
  return request(`${prefix}/${curOrganizationId}/rf/project-application-validate`, {
    method: 'POST',
    body: params,
  });
}

// 立项转RF
export async function projectToRF(params = {}) {
  return request(`${prefix}/${curOrganizationId}/rf/project-application`, {
    method: 'POST',
    body: params,
  });
}

export async function projectFinish(params = {}) {
  return request(`${prefix}/${curOrganizationId}/source-projects/close`, {
    method: 'POST',
    body: params,
  });
}
// 跳转寻源过程控制校验
export async function validateBeforeDirectControllerRF(params) {
  const { rfHeaderId, sourceCategory } = params;
  return request(
    `${prefix}/${tenantId}/rf/adjust-record/${rfHeaderId}/${sourceCategory}/validate`,
    {
      method: 'GET',
    }
  );
}

// 创建时间副本
export async function createBeforeDirectControllerRF(params) {
  const { rfHeaderId, sourceCategory } = params;
  return request(
    `${prefix}/${tenantId}/rf/adjust-record/${rfHeaderId}/${sourceCategory}/create-adjust-all`,
    {
      method: 'POST',
    }
  );
}

// 批量添加供应商
export async function getSupExpirAttachment(params) {
  return request(`${prefix}/${tenantId}/rf/supplier/adjust/getSupExpirAttachment`, {
    method: 'POST',
    body: params,
  });
}

// 资质到期添加供应商
export async function batchAdd(params) {
  return request(`${prefix}/${tenantId}/rf/supplier/adjust/batch-add`, {
    method: 'POST',
    body: params,
  });
}

// 过程控制保存
export async function controllerSave(params) {
  const { param, customizeUnitCode } = params;
  return request(`${prefix}/${tenantId}/rf/adjust/save`, {
    method: 'POST',
    body: param,
    query: {
      customizeUnitCode,
    },
  });
}

// 过程控制提交前校验
export async function validateSubmit(params) {
  return request(`${prefix}/${tenantId}/rf/adjust/submit-validate`, {
    method: 'POST',
    body: params.param,
  });
}

// 提交
export async function submit(params) {
  const { param, customizeUnitCode } = params;
  return request(`${prefix}/${tenantId}/rf/adjust/submit`, {
    method: 'POST',
    body: param,
    query: {
      customizeUnitCode,
    },
  });
}

// RF报价响应不足，下发专家评分
export async function toScoreRF(params) {
  return request(`${prefix}/${tenantId}/rf/${params.rfHeaderId}/to-score`, {
    method: 'PUT',
  });
}

// 复制历史单据
export async function historyCopy(params) {
  return request(`${prefix}/${tenantId}/rf/copy-history`, {
    method: 'POST',
    body: params,
  });
}

// 转RFQ
export async function createRFQ(params) {
  return request(`${prefix}/${tenantId}/rfx/rfi-application`, {
    method: 'POST',
    body: params,
  });
}

// 转RFP
export async function createRFP(params) {
  return request(`${prefix}/${tenantId}/rf/rfi-application`, {
    method: 'POST',
    body: params,
  });
}

// rf操作记录
export async function rfOperation(params) {
  const { rfHeaderId, ...otherParams } = params;
  return request(`${prefix}/${tenantId}/rf/actions/${rfHeaderId}`, {
    method: 'GET',
    query: otherParams,
  });
}

// rf审批记录
export async function fetchApprovalRecords(params) {
  const { rfHeaderId } = params;
  return request(`${prefix}/${tenantId}/rf/actions/${rfHeaderId}/approval-records`, {
    method: 'GET',
  });
}

/**
 * RFQ维护页面批量编辑业务实体和库存组织时判断物料是否需要清空
 * @function getClearLogic
 */
export async function getClearLogic(params) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/source/common-process/line-item/get-clear-logic`, {
    method: 'POST',
    query: {
      customizeUnitCode: 'SSRC.INQUIRY_HALL.NEW_EDIT.BATCH_ITEM_FORM',
    },
    body: { ...other },
  });
}

// 新建RFX 申请转询价 立项转寻源获取业务设置的默认模板
export async function fetchInitTemplate(params) {
  // const { sourceFrom } = params;
  return request(`${prefix}/${tenantId}/source-template/default`, {
    method: 'GET',
    query: { ...(params || {}) },
  });
}

// 查询询价单添加供应商的关联数据和系统配置
export async function fetchSourceSupplierRelativeConfig(params = {}) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/rfx/suppliers/supplier-lov-param`, {
    method: 'GET',
    query: { ...other },
  });
}

// 查询CNY币种默认值是否被禁用
export async function fetchCurrencyIsExist(params) {
  const { organizationId, ...other } = params;
  return request(`/smdm/v1/${organizationId}/currency`, {
    method: 'GET',
    query: { ...other },
  });
}

// 查询询价单添加供应商的关联数据和系统配置
export async function fetchSourceRFSupplierRelativeConfig(params = {}) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/rf/suppliers/supplier-lov-param`, {
    method: 'GET',
    query: { ...other },
  });
}

// 供应商找关系
export async function supplierRelationSearch(params = {}) {
  const { organizationId, queryParams = {}, ...other } = params;
  return request(`${prefix}/${organizationId}/source/common-process/line-item/get-clear-logic`, {
    method: 'POST',
    query: queryParams,
    body: { ...other },
  });
}

// 线下整单录入-询价头信息查询
export async function fetchWholeHeader(params = {}) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/rfx/offline-whole/header-query`, {
    method: 'GET',
    query: { ...other },
  });
}

// 线下整单录入-报价行信息查询
// export async function fetchWholeLine(params = {}) {
//   const { organizationId, ...other } = params;
//   return request(`${prefix}/${organizationId}/rfx/offline-whole/line-query`, {
//     method: 'GET',
//     query: { ...other },
//   });
// }

// 线下整单录入-保存API
export async function saveWhole(params = {}) {
  const { organizationId, queryParams = {}, ...other } = params || {};
  return request(`${prefix}/${organizationId}/rfx/offline-whole/save`, {
    method: 'POST',
    query: queryParams,
    body: { ...other },
  });
}

// 线下整单录入-保存API
export async function submitWhole(params = {}) {
  const { organizationId, queryParams = {}, ...other } = params || {};
  return request(`${prefix}/${organizationId}/rfx/offline-whole/submit`, {
    method: 'POST',
    query: queryParams,
    body: { ...other },
  });
}

// 线下整单录入-保存API
export async function wholeChangeCompany(params = {}) {
  const { organizationId, queryParams = {}, ...other } = params || {};
  return request(`${prefix}/${organizationId}/rfx/offline-whole/changeCompany`, {
    method: 'POST',
    query: queryParams,
    body: { ...other },
  });
}

// 线下整单录入-保存API
export async function wholeReSubmit(params = {}) {
  const { organizationId, queryParams = {}, ...other } = params || {};
  return request(`${prefix}/${organizationId}/rfx/offline-whole/resubmit`, {
    method: 'POST',
    query: queryParams,
    body: { ...other },
  });
}

// 选择寻源方式
export async function offlineWholeService(params = {}) {
  const { organizationId, sourcePageFrom = 'inquiryRFQCreate', ...other } = params;
  let url;
  switch (sourcePageFrom) {
    // 新建
    case 'inquiryRFQCreate':
      url = `${prefix}/${organizationId}/rfx/offline-whole/create-by-manually`;
      break;
    // 申请转询价
    case 'applyToInquiry':
      url = `${prefix}/${organizationId}/rfx/offline-whole/create-by-pr`;
      break;
    default:
      url = `${prefix}/${organizationId}/rfx/offline-whole/create-by-manually`;
  }
  return request(url, {
    method: 'POST',
    body: { ...other },
  });
}

// 寻源过程控制-符合性检查查询
export async function queryControllerReviewElements(params = {}) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/evaluate-indic-adjusts/review`, {
    method: 'GET',
    query: { ...other },
  });
}

// 寻源过程控制-符合性检查提交
export async function saveControllerInitialReviewLines(params = {}) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/evaluate-indic-adjusts/initial-review`, {
    method: 'POST',
    body: other.otherParams,
  });
}

// 线下整单录入-物料-删除前校验
export async function wholeBatchDeleteItemLinesValid(params = {}) {
  const { organizationId, queryParams = {}, data } = params || {};
  return request(`${prefix}/${organizationId}/rfx/offline-whole/items/remove/valid`, {
    method: 'POST',
    query: queryParams,
    body: data,
  });
}

// 线下整单录入-supplier-删除前校验
export async function wholeBatchDeleteSupplierLinesValid(params = {}) {
  const { organizationId, queryParams = {}, data } = params || {};
  return request(`${prefix}/${organizationId}/rfx/offline-whole/suppliers/remove/valid`, {
    method: 'POST',
    query: queryParams,
    body: data,
  });
}

// 线下整单录入-supplier文件有效校验and保存
export async function wholeValidateSupplierAndSave(params = {}) {
  const { organizationId, queryParams = {}, data } = params || {};
  return request(`${prefix}/${organizationId}/rfx/offline-whole/suppliers/expired-attachment`, {
    method: 'POST',
    query: queryParams,
    body: data,
  });
}

// 线下整单录入-supplier-保存
export async function wholeSupplierSave(params = {}) {
  const { organizationId, queryParams = {}, data } = params || {};
  return request(`${prefix}/${organizationId}/rfx/offline-whole/suppliers`, {
    method: 'POST',
    query: queryParams,
    body: data,
  });
}

// 批量查一键展开数据
export async function bacthSearchTableData(params = {}) {
  const { organizationId, queryParams = {}, data } = params || {};
  return request(`${prefix}/${organizationId}/rfx/check/once-for-all`, {
    method: 'POST',
    query: queryParams,
    body: data,
  });
}

// 询价单关闭提示
export async function getRfxRefundData(params = {}) {
  const { organizationId, ...others } = params || {};
  return request(`${prefix}/${organizationId}/rfx/close/validate`, {
    method: 'GET',
    query: others,
  });
}

// 询价单发布-工作流审批
export async function validateRfxApproval(params = {}) {
  const { organizationId, rfxHeaderId } = params;
  return request(`${prefix}/${organizationId}/rfx/${rfxHeaderId}/release/approve/validate`, {
    method: 'GET',
  });
}

// 寻源过程控制-工作流审批
export async function validateControllerApproval(params = {}) {
  const { organizationId, adjustRecordId, ...other } = params;
  return request(`${prefix}/${organizationId}/rfx/adjust/${adjustRecordId}/approve/validate`, {
    method: 'GET',
    query: { ...other },
  });
}

// 询价单维护-资质到期信息提醒
export async function getQualificationWarnInfo(rfxHeaderId) {
  return request(`${prefix}/${curOrganizationId}/rfx/suppliers/qualification-expired-info`, {
    method: 'POST',
    body: { rfxHeaderId },
  });
}

// 删除供应商列表行数据
export async function deleteSupplierDatas(body) {
  return request(`${prefix}/${curOrganizationId}/rfx/suppliers`, {
    method: 'DELETE',
    body: body.map((item) => ({ ...item, tenantId: curOrganizationId })),
  });
}

// 过程控制-资质到期信息提醒
export async function getControllerQualificationWarn(adjustRecordId) {
  return request(`${prefix}/${curOrganizationId}/rfx/suppliers/adjust/qualification-expired-info`, {
    method: 'POST',
    body: { adjustRecordId },
  });
}

export async function deleteSuppControllerDatas(body) {
  return request(`${prefix}/${curOrganizationId}/rfx/suppliers/adjust/delete`, {
    method: 'DELETE',
    body: body.map((item) => ({ ...item, tenantId: curOrganizationId })),
  });
}

/**
 * RF页面头
 * @async
 * @function fetchRFScoreHeader
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchRFScoreHeader(params) {
  const { organizationId, sourceHeaderId, customizeUnitCode, ...others } = params;
  return request(`${prefix}/${organizationId}/rf/score/${sourceHeaderId}`, {
    method: 'GET',
    query: { customizeUnitCode, ...others },
  });
}

// 寻源过程控制-资质多标段-删除供应商数据
export async function deleteSectionSuppControllerData(payload = {}) {
  return request(
    `${prefix}/${curOrganizationId}/rfx/suppliers/adjust/remove-qualification-expired-suppliers`,
    {
      method: 'POST',
      body: {
        tenantId: curOrganizationId,
        ...(payload || {}),
      },
    }
  );
}
// 快速询价工作台-查看报价-获取报价和价钱信息
export async function getQuotationAndPrice(params) {
  const { organizationId, rfqQuotationId } = params;
  return request(
    `${prefix}/${organizationId}/purchase/quick-rfq-quotations/view/quotation-record`,
    {
      method: 'POST',
      body: { rfqQuotationId },
    }
  );
}

// 还比价更新已读
export async function updateFeedBackReadedFlag(params) {
  const { organizationId, ...others } = params || {};
  return request(`${prefix}/${organizationId}/rfx/bargain/update-supplier-bargain-info`, {
    method: 'POST',
    body: others,
  });
}

// 查询拓展寻源结果数据-公司与库存组织关联关系
export async function fetchExpandSourceResults() {
  return request(`${prefix}/${getCurrentOrganizationId()}/share/common/company-inv-organization`, {
    method: 'GET',
  });
}

// 清除拓展库存组织
export async function clearExpandInvOrganization(params) {
  return request(
    `${SRM_SSRC}/v2/${getCurrentOrganizationId()}/rfx/results-expanding/dimensions-or-hierarchy/change`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 待定候选人退回至汇总
export async function returnToSummary(params) {
  return request(`${prefix}/${getCurrentOrganizationId()}/evaluate-summary/return-summery`, {
    method: 'POST',
    body: params,
  });
}

// 核价智能预审
export async function checkPriceIntelligentPreReview(params) {
  const { organizationId, ...others } = params || {};
  return request(`${prefix}/${organizationId}/ai-approve-result/submit-task`, {
    method: 'POST',
    body: others,
  });
}

export async function fetchIntelligentPreReviewResult(params) {
  const { organizationId, ...others } = params || {};
  return request(`${prefix}/${organizationId}/ai-approve-result/query-result`, {
    method: 'POST',
    body: others,
  });
}
