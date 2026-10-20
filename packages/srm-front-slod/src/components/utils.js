import { Modal, NumberField } from 'choerodon-ui/pro';
import { isUndefined, isNumber } from 'lodash';
import { getCurrentUser } from 'utils/utils';
import { math } from 'choerodon-ui/dataset';

// 封装通用c7nModal
export function c7nModal(modalProps = {}) {
  return Modal.open({
    movable: false,
    mask: true,
    maskClosable: false,
    destroyOnClose: true,
    drawer: true,
    ...modalProps,
  });
}

/*
 * 千位分隔符
 * @param {String} val - 需要千分位分割
 */
export function numberSeparatorRender(val, precision) {
  if (!val && val !== 0) return val;
  const locale = getCurrentUser()?.language?.replace('_', '-');
  const minimumFractionDigits =
    isUndefined(precision) || !isNumber(precision) ? math.dp(val) : precision;
  return NumberField.format(val, locale, {
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits,
  });
}
