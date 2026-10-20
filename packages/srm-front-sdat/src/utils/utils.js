/* eslint-disable prefer-destructuring */
import React from 'react';
import intl from 'utils/intl';
import { notification } from 'hzero-ui';
import { queryUUID } from 'hzero-front/lib/services/api';

import styles from './index.less';

const JD_PREFIX_IMG_URL = 'http://img13.360buyimg.com';

export function jdConvertImg(path, level = 0) {
  return `${JD_PREFIX_IMG_URL}/n${level}/${path}`;
}

export function formatDuring(mss) {
  const days = Math.abs(parseInt(mss / (1000 * 60 * 60 * 24), 10));
  const hours = Math.abs(parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60), 10));
  const minutes = Math.abs(parseInt((mss % (1000 * 60 * 60)) / (1000 * 60), 10));
  const seconds = Math.abs((mss % (1000 * 60)) / 1000).toFixed(0);

  const dayStr = days ? `${days} ${intl.get('hzero.common.date.unit.day').d('天')}` : '';
  const hoursStr = hours ? `${hours} ${intl.get('hzero.common.date.unit.hours').d('小时')}` : '';
  const minutesStr = minutes
    ? `${minutes} ${intl.get('hzero.common.date.unit.minutes').d('分钟')}`
    : '';
  const secondsStr = seconds
    ? `${seconds} ${intl.get('hzero.common.date.unit.second').d('秒')}`
    : '';

  return `${dayStr} ${hoursStr} ${minutesStr} ${secondsStr}`;
}

/**
 * 换算 B -> Kb || Mb || Gb
 * @param {*} size
 * @returns
 */
export function calculateSize(size) {
  let rtnStr = '';
  if (size / (1024 * 1024 * 1024) > 1) {
    rtnStr = `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  } else if (size / (1024 * 1024) > 1) {
    rtnStr = `${(size / (1024 * 1024)).toFixed(1)} MB`;
  } else if (size / 1024 > 1) {
    rtnStr = `${(size / 1024).toFixed(1)} KB`;
  } else {
    rtnStr = `${size} B`;
  }

  return rtnStr;
}

/**
 * 复制指定内容到剪切板
 * @param {dom} ele
 */
// export function copyText(ele) {
//   function otherEle(element) {
//     if (document.selection) {
//       const range = document.body.createTextRange();
//       range.moveToElementText(element);
//       range.select();
//     } else {
//       window.getSelection().removeAllRanges();
//       const range = document.createRange();
//       range.selectNode(element);
//       window.getSelection().addRange(range);
//     }
//   }

//   if (ele.select) {
//     ele.select();
//   } else {
//     otherEle(ele);
//   }

//   window.getSelection().removeAllRanges();
// }

/**
 * 复制指定内容到剪切板
 * @param {dom} ele
 */
export async function copyText(ele) {
  const text = ele.textContent || ele.value;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      console.log('复制成功');
    } else {
      fallbackCopyTextToClipboard(ele);
    }
  } catch (err) {
    console.log('复制失败:', err);
  }
}

function fallbackCopyTextToClipboard(ele) {
  const selection = window.getSelection();
  const range = document.createRange();

  selection.removeAllRanges();
  range.selectNodeContents(ele);
  selection.addRange(range);

  try {
    document.execCommand('copy');
    console.log('复制成功');
  } catch (err) {
    console.log('Fallback: 复制失败', err);
  }

  selection.removeAllRanges();
}

/**
 * 获取路径？后面拼接的参数值
 */
export function getLocalUrlParam() {
  const url = location.search;
  const theParam = {};
  if (url.indexOf('?') !== -1) {
    const str = url.substr(url.indexOf('?') + 1);
    const strs = str.split('&');
    for (let i = 0; i < strs.length; i++) {
      theParam[strs[i].split('=')[0]] = decodeURIComponent(strs[i].split('=')[1]);
    }
  }

  return theParam;
}

/**
 * 获取路径？后面拼接的参数值
 */
export function getRealUrlParam(url) {
  const theParam = {};
  if (url.indexOf('?') !== -1) {
    const str = url.substr(url.indexOf('?') + 1);
    const strs = str.split('&');
    for (let i = 0; i < strs.length; i++) {
      theParam[strs[i].split('=')[0]] = decodeURIComponent(strs[i].split('=')[1]);
    }
  }

  return theParam;
}

// export function replaceHandle(parentStr, searchText) {
//   let res = new RegExp("(" + searchText+ " )",'g');
//   parentStr = parentStr.replace(res, "<span style='color:red;'>" + searchText+"</span>");
//   return parentStr;
// }

/**
 * 数据表管理 左侧menu将一维数组转换成树形数据
 * @param {*} list
 * @returns
 */
export function formatTreeData(list = [], themeList = []) {
  const treeObj = {};
  const treeData = [];

  list.forEach((item) => {
    if (item && item.groupCode) {
      let groupName;
      themeList.forEach((item2) => {
        if (item.groupCode === item2.value) {
          groupName = item2.meaning;
        }
      });
      treeObj[item.groupCode] = groupName;
    } else {
      treeObj.unattributed = intl.get('sdat.common.view.title.unattributedGroup').d('未归属分组');
    }
  });

  const keyList = Object.keys(treeObj); // 主键列表
  keyList.forEach((item) => {
    treeData.push({
      groupCode: item,
      groupName: treeObj[item],
      children: [],
    });
  });

  treeData.forEach((item) => {
    list.forEach((item2) => {
      if (item && item2 && item2.groupCode && item.groupCode === item2.groupCode) {
        item.children.push({
          ...item2,
        });
      }

      if (item && item2 && item.groupCode === 'unattributed' && !item2.groupCode) {
        item.children.push({
          ...item2,
        });
      }
    });
  });

  return { keyList, treeData };
}

/**
 * 数据表管理 左侧menu将一维数组转换成树形数据
 * @param {*} list
 * @returns
 */
export function formatTree2Data(list = [], themeList = []) {
  const treeObj = {};
  const treeData = [];

  list.forEach((item) => {
    if (item && item.topicNum) {
      let topicName;
      themeList.forEach((item2) => {
        if (item.topicNum === item2.topicNum) {
          topicName = item2.topicName;
        }
      });
      treeObj[item.topicNum] = topicName;
    } else {
      treeObj.unattributed = intl.get('sdat.common.view.title.unattributedGroup').d('未归属分组');
    }
  });

  const keyList = Object.keys(treeObj); // 主键列表

  keyList.forEach((item) => {
    treeData.push({
      topicNum: item,
      topicName: treeObj[item],
      children: [],
    });
  });

  treeData.forEach((item) => {
    list.forEach((item2) => {
      if (item && item2 && item2.topicNum && item.topicNum === item2.topicNum) {
        item.children.push({
          ...item2,
        });
      }

      if (item && item2 && item.topicNum === 'unattributed' && !item2.topicNum) {
        item.children.push({
          ...item2,
        });
      }
    });
  });

  return { keyList, treeData };
}

/**
 * 数据表管理 左侧menu将一维数组转换成树形数据
 * @param {*} list
 * @returns
 */
export function formatTree3Data(list = []) {
  const treeObj = {};
  const treeData = [];
  list.forEach((item) => {
    if (item && item.topicNum) {
      treeObj[item.topicNum] = item.topicName;
    } else {
      treeObj.unattributed = intl.get('sdps.common.view.title.unattributedSubject').d('未归属主题');
    }
  });

  const keyList = Object.keys(treeObj); // 主键列表
  keyList.forEach((item) => {
    treeData.push({
      topicNum: item,
      topicName: treeObj[item],
      children: [],
    });
  });

  treeData.forEach((item) => {
    list.forEach((item2) => {
      if (item && item2 && item2.topicNum && item.topicNum === item2.topicNum) {
        item.children.push({
          ...item2,
        });
      }

      if (item && item2 && item.topicNum === 'unattributed' && !item2.topicNum) {
        item.children.push({
          ...item2,
        });
      }
    });
  });

  return { keyList, treeData };
}

/**
 * 返回指定分页的数据
 */
export function getPageData(page = 0, size = 50, source = []) {
  let rtnList = [];
  if (source.length) {
    rtnList = source.slice(page * size, (page + 1) * size);
  }
  return rtnList;
}

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
      theParam[strs[i].split('=')[0]] = decodeURIComponent(unescape(strs[i].split('=')[1]));
    }
  }
  return theParam;
}

export function getLocationParam(searchStr = '') {
  const url = searchStr || '';
  const theParam = {};
  if (url && url.indexOf && url.indexOf('?') !== -1) {
    const str = url.substr(1);
    const strs = str.split('&');
    for (let i = 0; i < strs.length; i++) {
      theParam[strs[i].split('=')[0]] = decodeURIComponent(strs[i].split('=')[1]);
    }
  }
  return theParam;
}

/**
 * 对象数组去重
 * @param {*} arr
 * @param {*} uniId 主键
 * @returns
 */
export function uniqueFunc(arr, uniId) {
  const res = new Map();
  return arr.filter((item) => !res.has(item[uniId]) && res.set(item[uniId], 1));
}

/**
 * 重新 response 解析工具
 */
export function getResponse(response, errorCallback) {
  if (response && response.failed === true) {
    if (errorCallback) {
      errorCallback(response);
    } else {
      switch (response.type) {
        case 'info':
          notification.info({
            message: intl.get('hzero.common.message.confirm.title').d('提示'),
            description: response.message,
          });
          break;
        case 'warn':
          notification.warning({
            message: intl.get('hzero.common.warn').d('警告'),
            description: response.message,
          });
          break;
        case 'error':
        default:
          notification.error({
            message: intl.get('hzero.common.status.mistake').d('错误'),
            description: response.message,
          });
          break;
      }
    }
  } else {
    return response;
  }
}

export const getSortUpIcon = () => {
  return (
    <svg width="14px" height="14px" viewBox="0 0 14 14" version="1.1">
      <g id="组件" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="Search/Components/Sort" transform="translate(-94.000000, -9.000000)">
          <g id="编组-8" transform="translate(8.000000, 7.000000)">
            <g id="icon-ascending" transform="translate(86.000000, 2.000000)">
              <rect id="矩形" x="0" y="0" width="16" height="16" />
              <g id="编组-22" transform="translate(1.300000, 2.500000)">
                <path
                  d="M7,7.05064905 L7,8.28268429 L0,8.28268429 L0,7.05064905 L7,7.05064905 Z M5.6,4.38398238 L5.6,5.61601762 L0,5.61601762 L0,4.38398238 L5.6,4.38398238 Z M4.2,1.71731571 L4.2,2.94935095 L0,2.94935095 L0,1.71731571 L4.2,1.71731571 Z"
                  id="形状结合"
                  fillOpacity="0.85"
                  fill="#000000"
                  fillRule="nonzero"
                />
                <polygon
                  id="路径"
                  className={styles['sort-up-or-down-icon-them']}
                  fill="#00B8CC"
                  points="9.7 2.33333333 11.3666667 2.33333333 9.03333333 0 6.7 2.33333333 8.36666667 2.33333333 8.36666667 8.9849916 9.7 8.9849916"
                />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

export const getSortDownIcon = () => {
  return (
    <svg width="14px" height="14px" viewBox="0 0 14 14" version="1.1" style={{ marginTop: '2px' }}>
      <g id="组件" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="Search/Components/Sort" transform="translate(-94.000000, -9.000000)">
          <g id="编组-8" transform="translate(8.000000, 7.000000)">
            <g id="icon-ascending" transform="translate(86.000000, 2.000000)">
              <rect id="矩形" x="0" y="0" width="16" height="16" />
              <g
                id="编组-22"
                transform="translate(6.983333, 6.992496) scale(1, -1) translate(-6.983333, -6.992496) translate(1.300000, 2.500000)"
              >
                <path
                  d="M7,7.05064905 L7,8.28268429 L0,8.28268429 L0,7.05064905 L7,7.05064905 Z M5.6,4.38398238 L5.6,5.61601762 L0,5.61601762 L0,4.38398238 L5.6,4.38398238 Z M4.2,1.71731571 L4.2,2.94935095 L0,2.94935095 L0,1.71731571 L4.2,1.71731571 Z"
                  id="形状结合"
                  fillOpacity="0.85"
                  fill="#000000"
                  fillRule="nonzero"
                />
                <polygon
                  className={styles['sort-up-or-down-icon-them']}
                  id="路径"
                  fill="#00B8CC"
                  points="9.7 2.33333333 11.3666667 2.33333333 9.03333333 0 6.7 2.33333333 8.36666667 2.33333333 8.36666667 8.9849916 9.7 8.9849916"
                />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

export function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log('内容已复制到剪贴板');
      })
      .catch((err) => {
        console.error('无法复制内容: ', err);
      });
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      console.log('内容已复制到剪贴板');
    } catch (err) {
      console.error('无法复制内容: ', err);
    }
    document.body.removeChild(textArea);
  }
}

export function getURLSearchParams(url) {
  const searchParams = new URLSearchParams(url);

  const paramsMap = {};

  for (const [key, value] of searchParams.entries()) {
    paramsMap[key] = value;
  }

  return paramsMap;
}

/**
 * 格式化删除或新增
 * @param {*} originArray
 * @param {*} newArray
 * @param {*} idKey
 * @returns
 */
export function formatDeleteOrAdd(originArray = [], newArray = [], idKey = 'userId') {
  const result = [];

  const aIds = new Set(originArray.map((item) => item[idKey]));
  const bIds = new Set(newArray.map((item) => item[idKey]));

  originArray.forEach((itemA) => {
    if (!bIds.has(itemA[idKey])) {
      result.push({ ...itemA, _status: 'delete' });
    } else {
      result.push({ ...itemA });
    }
  });

  newArray.forEach((itemB) => {
    if (!aIds.has(itemB[idKey])) {
      result.push({ ...itemB, _status: 'create' });
    }
  });

  return result;
}

/**
 * 是否存在添加失败的企业
 * @param {*} list array | boolean
 * @returns boolean
 */
export function judgeUSCCdoeNull(list) {
  let hasUnsCodeNullCount = list;
  if (Array.isArray(list) && list.length > 0) {
    const getRecordValue = (record, key) =>
      typeof record?.get === 'function' ? record.get(key) : record?.[key];

    const socialCodes = list
      .map(
        (rcd) =>
          getRecordValue(rcd, 'unifiedSocialCode') ||
          getRecordValue(rcd, 'socialCode') ||
          getRecordValue(rcd, 'creditCode') ||
          getRecordValue(rcd, 'enterpriseCode')
      )
      .filter(Boolean);
    const socialCodeCount = socialCodes.reduce(
      (countMap, code) => ({
        ...countMap,
        [code]: (countMap[code] || 0) + 1,
      }),
      {}
    );
    const invalidCount = list.length - socialCodes.length;
    // 累加所有重复条目数量
    const repeatCount = Object.values(socialCodeCount)
      .filter((v) => v > 1)
      .reduce((a, b) => a + b, 0);

    hasUnsCodeNullCount = invalidCount + repeatCount;
  }
  // 统一社会信用代码为空或重复，不允许添加
  if (hasUnsCodeNullCount) {
    notification.warning({
      message: intl.get('hzero.common.message.confirm.title').d('提示'),
      description: intl.get('sdat.riskScanConfig.view.message.hasUnsCodeNullCount', {
        count: hasUnsCodeNullCount,
      }),
    });
  }
  return !!hasUnsCodeNullCount;
}

/**
 * 根据指定字段去重
 * @param {*} array
 * @param {*} fields
 * @returns
 */
export function deduplicateByFields(array = [], fields = ['userId', 'userType', '__status']) {
  const seen = new Map();

  return array.filter((item) => {
    // 创建一个基于指定字段的唯一键
    const key = fields.map((field) => item[field]).join('|');

    if (!seen.has(key)) {
      seen.set(key, true);
      return true;
    }
    return false;
  });
}

/**
 * createAttachmentUUID - 创建返回UUID
 */
export async function createAttachmentUUID() {
  const res = await queryUUID();
  const attachmentUUID = res?.content ?? '';
  return attachmentUUID;
}
