import { Modal } from 'hzero-ui';
import intl from 'utils/intl';

/**
 * 弹出的提示框
 * @param {object} opt
 */
export const handleVerifyIs = (opt) => {
  const { isLaunch = true, callback = (e) => e, title } = opt;
  // callback是确定后执行的函数，isLaunch是标识是否有为保存数据
  if (isLaunch) {
    Modal.confirm({
      title,
      onOk: callback,
      cancelText: intl.get('hzero.common.status.cancel').d('取消'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
    });
  } else {
    callback();
  }
};
