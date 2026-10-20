export function getParams(options) {
  const { paramList = [], ctxParams = { ctx: {}, url: {} } } = options;
  const paramObj = {};
  paramList.forEach(item => {
    if (item.paramType === 'context') {
      switch (item.paramValue) {
        case 'organizationId':
          paramObj[item.paramKey] = ctxParams.ctx.organizationId;
          break;
        case 'tenantId':
          paramObj[item.paramKey] = ctxParams.ctx.tenantId;
          break;
        default:
      }
    } else if (item.paramType === 'url') {
      paramObj[item.paramKey] = ctxParams.url[item.paramKey];
    } else if (item.paramType === 'fixed') {
      paramObj[item.paramKey] = item.paramValue;
    }
  });
  return paramObj;
}

export function toUnderLine(name) {
  if (typeof name !== "string" || name === "") return;
  return name.replace(/([A-Z])/g, "_$1").toLowerCase();
}

export function underLineToUpperCase(name) {
  if (typeof name !== "string" || name === "") return name;
  let newName = name;
  const res = newName.match(/(_[a-z])/g) || [];
  res.forEach(word => { newName = newName.replace(word, word.slice(1).toUpperCase()); });
  return newName;
}

// 根据组件类型，限制字段可配置的条件关系
export function getFilter(type, unitType) {
  switch (unitType) {
    case "TABPANE": return ["ACTIVE", "UNACTIVE"];
    default:
      switch (type) {
        case 'CURRENCY':
        case 'INPUT_NUMBER':
          return ['>', '<', '>=', '<=', '=', '!=', 'ISNULL', 'NOTNULL'];
        case 'DATE_PICKER':
          return ['BEFORE', 'AFTER', '~BEFORE', '~AFTER', 'SAME', 'NOTSAME', 'ISNULL', 'NOTNULL'];
        case 'LOV':
        case "SELECT":
          return ['LIKE', 'UNLIKE', '~LIKE', '~UNLIKE', '=', '!=', 'ISNULL', 'NOTNULL', "IN", "NOTIN"];
        default:
          return ['LIKE', 'UNLIKE', '~LIKE', '~UNLIKE', '=', '!=', 'ISNULL', 'NOTNULL'];
      }
  }
}