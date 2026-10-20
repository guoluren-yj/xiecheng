import { Modal } from 'hzero-ui';
import intl from 'utils/intl';

export const handleVerifyIsChange = (opt) => {
  const {
    isChange = false,
    callback = (e) => e,
    title = intl.get('hzero.common.view.message.lostData').d('存在未保存数据，操作将导致数据丢失，是否继续？'),
  } = opt;
  // callback是确定后执行的函数，isChange是标识是否有为保存数据
  if (isChange) {
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
