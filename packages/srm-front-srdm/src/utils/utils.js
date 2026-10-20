import { getCurrentUser } from 'utils/utils';
import { closeTab, openTab, getTabData } from 'utils/menuTab';

export const currentRoleCode = () => {
  return (getCurrentUser() || {}).currentRoleCode;
};

export const isAdministrator = currentRoleCode() === 'role/site/default/administrator';
export const isLeader = currentRoleCode() === 'srm-data-migrate/leader';
export const isMember = currentRoleCode() === 'srm-data-migrate/member';
export const isUpgrader = currentRoleCode() === 'srm-data-migrate/upgrader';

export const closeAndPush = (key, newTab) => {
  getTabData().forEach((item) => {
    if (item.path.includes(key)) {
      closeTab(item.key, newTab.key);
    }
  });
  openTab(newTab);
};

/**
 * 获取路径？后面拼接的参数值
 */
export function getUrlParam() {
  const url = location.search;
  const theParam = {};
  if (url.indexOf('?') !== -1) {
    const str = url.substr(1);
    const strs = str.split('&');
    for (let i = 0; i < strs.length; i++) {
      theParam[strs[i].split('=')[0]] = decodeURIComponent(strs[i].split('=')[1]);
    }
  }
  return theParam;
}
