// 维护业务对象接口
import { lowcodeRequest as request } from '@/utils/lowcodeRequest'; // 权限的APPID添加
import { HZERO_HMDE, HZERO_HMSG } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

/**
 * 获取事务处理流节点列表
 * */
export async function getFlowNodes({ flowId = {} }: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/flow-nodes?flowId=${flowId}`, {
    method: 'GET',
  });
}

/**
 * 获取事务处理流明细
 * */
export async function getFlowDetail({ flowId = {}, version }: any) {
  if (version) {
    return request(
      `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/flows/${flowId}?version=${version}`,
      {
        method: 'GET',
      }
    );
  } else {
    return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/flows/${flowId}`, {
      method: 'GET',
    });
  }
}

/**
 * 获取事务处理流节点明细
 * */
export async function getFlowNodeDetail(flowNodeId) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/flow-nodes/${flowNodeId}`, {
    method: 'GET',
  });
}

/**
 * 业务对象字段创建接口
 * */
export async function createBusinessObjectField({ body = {}, query }: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-fields`, {
    method: 'POST',
    query,
    body,
  });
}

/**
 * 查询业务对象字段
 * */
export async function getBoFieldList({ query = {} }: any) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-fields/list-by-code`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 创建节点对象
 * */
export async function createFlowNode({ body = {}, method }: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/flow-nodes`, {
    method,
    body,
  });
}

/**
 * 配置事务处理流
 * */
export async function deployProcessDefinition({ body = {} }: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/flows/configure`, {
    method: 'PUT',
    body,
  });
}

/**
 * 获取入参
 * */
export async function getInputParameter(flowId) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/flow-scripts/${flowId}/inputParameter`,
    {
      method: 'GET',
    }
  );
}

/**
 * 获取自定义变量
 * */
export async function getCustomVariable(flowId) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/flow-scripts/${flowId}/customVariable`,
    {
      method: 'GET',
    }
  );
}

/**
 * 禁用事务处理流
 * */
export async function forbiddenFlow(flowId) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/flows/${flowId}/disabled`, {
    method: 'PUT',
  });
}

/**
 * 启用事务处理流
 * */
export async function startUseFlow(flowId) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/flows/${flowId}/enabled`, {
    method: 'PUT',
  });
}

/**
 * 发布事务处理流
 * */
export async function publishFlow(flowId) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/flows/${flowId}/publish`, {
    method: 'PUT',
  });
}

/**
 * 获取表达式
 * http://hzeroall.saas.hand-china.com/api/hmde/v1/flow-scripts/{flowId}/expression
 * */
export async function getExpression(flowId) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/flow-scripts/${flowId}/expression`,
    {
      method: 'GET',
    }
  );
}

/**
 * 构建表达式
 * http://hzeroall.saas.hand-china.com/api/hmde/v1/flow-scripts/build-expression
 * */
export async function buildExpression(body) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/flow-scripts/build-expression`, {
    method: 'POST',
    body,
  });
}

/**
 * 获取消息模板
 * */
export async function getMessageTemplate(tenantId, messageCode, lang) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMSG,
    })}/message/templates/template-args/group-by-template`,
    {
      method: 'GET',
      query: {
        lang,
        messageCode,
        tenantId,
      },
    }
  );
}
