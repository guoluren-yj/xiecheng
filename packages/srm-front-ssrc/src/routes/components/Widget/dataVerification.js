// 数据校验工具

import { isEmpty } from 'choerodon-ui/dataset/utils';

// 数字校验-值不存在
export function valueIncorrect(value = null) {
  return (
    value === null ||
    value === undefined ||
    isNaN(value) ||
    typeof value !== 'number' ||
    value === 'null' ||
    value === 'NULL' ||
    value === false ||
    !isFinite(value)
  );
}

/**
 * 主键校验 有效性
 * @param id null any
 * @param options {} object
 *    @key reFormatKey?: (id: any): any => {} id操作函数, id校验通过后对id做转换
 *
 * @return id || ReferenceError
 * */
export function idValidation(id = null, options = {}) {
  const { reFormatKey = null } = options || {};

  const CommonSymbolsReg = /[{}%[\]().*+?^#@$\\'"]/g; // 特殊字符
  const errorIdValue = new Set([
    'null',
    null,
    'undefined',
    undefined,
    'false',
    false,
    'true',
    true,
    '',
  ]); // error id 数据集合

  let InValidationFlag = false; // 非法id标识,  true id非法, false id正确

  InValidationFlag = CommonSymbolsReg.test(id) || errorIdValue.has(id);

  if (InValidationFlag) {
    const ErrTitle = `${id} Is An Invalid Id, Please Check!!!`;
    console.error(ErrTitle);
    throw new ReferenceError(ErrTitle);
  }

  let formatId = id;
  if (reFormatKey && typeof reFormatKey === 'function') {
    formatId = reFormatKey(id);
  }

  return formatId;
}

export function idValidations(ids = [], options) {
  if (!ids || isEmpty(ids)) {
    return;
  }

  ids.forEach((id) => {
    if (!id) {
      return;
    }
    idValidation(id, options);
  });
}
