/**
 * public下的通用方法
 * @date: 2022-08-19
 * @author: ke.wang01 <ke.wang01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import { changeTheme } from 'hzero-front/lib/layouts/NewLayout/utils';
import { HZERO_PLATFORM } from 'utils/config';
import { trim } from 'lodash';
import Cookies from 'universal-cookie';
import request from 'utils/request';
import { getResponse, setSession } from 'utils/utils';
import { getLayoutConfig } from '@/services/portalService';

const cookies = new Cookies();

/**
 * Portal info session name
 * 请求过门户模板信息接口后, response会存储到session中
 * 可通过此字段判断门户，存在为新门户，不存在则为老门户
 */
const portalLayoutInfo = '__portal_layout_info';

/**
 * 获取多语言
 * @param {string} language
 * @param {string} name
 * @param {string} promptKey
 */
export const queryIntl = async (language, name, promptKey) => {
  const sessionIntl = `${language}-${name}`;
  const tenantId = cookies.get('hostTenantId') || cookies.get('tenantId') || 0;
  const res = await request(
    `${HZERO_PLATFORM}/v1/${tenantId}/prompt/${language}?promptKey=${promptKey}`
  );
  if (getResponse(res)) {
    setSession(sessionIntl, res);
    return res;
  }
  return {};
};

/**
 * 获取门户信息
 * @param {string} auto
 * @param {string} themeConfigVO
 */
export const getPortalLayout = async () => {
  const res = await getLayoutConfig();
  if (res && res.id && res.themeConfigVO) {
    const { functionalityCtrl, id, skipAfterLoginFlag, tenantId, themeConfigVO } = res;
    const data = {
      functionalityCtrl,
      id,
      skipAfterLoginFlag,
      tenantId,
      themeConfigVO,
    };
    const dataJson = trim(res.dataJson) ? JSON.parse(trim(res.dataJson)) : [];
    data.dataJson = dataJson;
    setSession(portalLayoutInfo, data);
    return data;
  }
  return res || {};
};

/**
 * 切换主题
 * @param {string} auto
 * @param {string} themeConfigVO
 */
export const changePublicTheme = async (auto, themeConfigVO) => {
  if (auto) {
    const res = await getPortalLayout();
    if (res.themeConfigVO && changeTheme) {
      await changeTheme(res.themeConfigVO);
    }
  } else if (changeTheme) {
    if (themeConfigVO) {
      await changeTheme(themeConfigVO);
    }
  }
};
