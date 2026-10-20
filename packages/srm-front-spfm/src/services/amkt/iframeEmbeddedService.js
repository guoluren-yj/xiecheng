/*
 * iframeEmbeddedService - 内嵌页面service
 * @date: 2019/08/09
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询内嵌页面url
 */
export async function fetchUrl(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/interface/splice-url-with-token`, {
    method: 'GET',
    query: params,
  });
}
