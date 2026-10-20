/**
 * @param {MessageEvent} m
 * 将外部报表平台数据转换为SRM可处理的数据
 * 不同报表平台需适配不同逻辑
 */
 export function processMessageData(m) {
  const { data: dataStr, compData = {} } = m.data.payload;
  const dataObj = JSON.parse(dataStr);
  const returnObj = {...dataObj};
  let index = -1;
  const headArray = compData.head || [];
  for(let i = 0; i < headArray.length; i++) {
    if (headArray[i] === dataObj.url) {
      index = i;
      break;
    }
  }
  // 明细表，明细表compData数据结构：{ "head": [ "订单编号", "附件索引", "附件", "索引号" ], "body": [ "4600023357", "附件索引", "482565a1524bbb34a4dfd810448314f86a9e7;", "482565a1524bbb34a4dfd810448314f86a9e7" ] }
  if (index !== -1) {
    returnObj.url = (compData.body || [])[index];
  } else {
    // 兼容交叉表情况 , 交叉表compData数据结构 : { "附件索引": "附件索引", "附件": "482565a1524bbb34a4dfd810448314f86a9e7;", "订单编号": "4600023357" }
    if (compData[returnObj.url]) {
      returnObj.url = compData[returnObj.url];
    } else {
      returnObj.url = '';
    }
  }
  return returnObj;
}

export function parseUrlParams(path, pathRegexp, realUrl) {
  const params = {};
  let paramKeys = [];
  if (path) {
    paramKeys = (path.match(/\/:([^\/]+)/g) || []).map(str => (str || "").replace(/^\/:/, ""));
  }
  const [pathname, search] = (realUrl || "").split("?");
  if (paramKeys.length && pathname) {
    const pathParams = pathname.match(pathRegexp) || [];
    paramKeys.forEach((k, index) => {
      params[k] = pathParams[index + 1];
    })
  }
  if (search) {
    search.split("&").forEach(paramPar => {
      const [paramKey, paramValue] = paramPar.split("=");
      params[paramKey] = paramValue;
    });
  }
  return params;
}
