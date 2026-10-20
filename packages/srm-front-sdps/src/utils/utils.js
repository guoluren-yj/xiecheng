import intl from 'utils/intl';

const JD_PREFIX_IMG_URL = 'http://img13.360buyimg.com';

export function jdConvertImg(path, level = 0) {
  return `${JD_PREFIX_IMG_URL}/n${level}/${path}`;
}

export function formatDuring(mss) {
  const days = Math.abs(parseInt(mss / (1000 * 60 * 60 * 24), 10));
  const hours = Math.abs(parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60), 10));
  const minutes = Math.abs(parseInt((mss % (1000 * 60 * 60)) / (1000 * 60), 10));
  const seconds = Math.abs((mss % (1000 * 60)) / 1000).toFixed(0);

  const dayStr = days ? `${days} ${intl.get('sdps.common.date.unit.day').d('天')}` : '';
  const hoursStr = hours ? `${hours} ${intl.get('sdps.common.date.unit.hours').d('小时')}` : '';
  const minutesStr = minutes
    ? `${minutes} ${intl.get('sdps.common.date.unit.minutes').d('分钟')}`
    : '';
  const secondsStr = seconds
    ? `${seconds} ${intl.get('sdps.common.date.unit.second').d('秒')}`
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
export function copyText(ele) {
  function otherEle(element) {
    if (document.selection) {
      const range = document.body.createTextRange();
      range.moveToElementText(element);
      range.select();
    } else {
      window.getSelection().removeAllRanges();
      const range = document.createRange();
      range.selectNode(element);
      window.getSelection().addRange(range);
    }
  }
  if (ele.select) {
    ele.select();
  } else {
    otherEle(ele);
  }
  document.execCommand('Copy');
  window.getSelection().removeAllRanges();
}

/**
 * 获取路径？后面拼接的参数值
 */
export function getLocalUrlParam(url) {
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
export function formatTreeData(list = []) {
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
