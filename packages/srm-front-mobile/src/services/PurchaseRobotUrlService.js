import request from 'utils/request';
import { SRM_SMBL, SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 获取知识库配置页面链接
 */
export async function getKnowledgeConfigLinkApi(language) {
  const url = `${SRM_SMBL}/v1/link/${organizationId}/imab-login-page`;
  const query = { code: 'knowledge' };
  if (language) {
    query.language = language;
  }
  return request(url, {
    method: 'GET',
    query,
    responseType: 'text',
  });
}

/**
 * 获取远端控制url
 */
export async function getUrlWithCodeApi(code = 'knowledge', language) {
  const url = `${SRM_SMBL}/v1/link/${organizationId}/imab-login-page`;
  const query = { code };
  if (language) {
    query.language = language;
  }
  return request(url, {
    method: 'GET',
    query,
    responseType: 'text',
  });
}

// 获取阿里云机器人配置链接
export async function getAliChatbotConfigUrl() {
  const url = `${SRM_SMBL}/v1/${organizationId}/ali-chatbot/login-url`;
  return request(url, {
    method: 'GET',
    responseType: 'text',
  });
}

// 获取服务编码
export async function getPurchaseHelperService() {
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/application-market-client/has-buy-purchase`
  );
}
