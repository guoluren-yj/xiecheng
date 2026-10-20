import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';

export function deleteCofirmModal({
  title,
  children,
  ...other
}) {
  Modal.confirm({
    title: title || intl.get('small.common.model.tips').d('提示'),
    children: children || intl.get('small.common.view.confirmDelete').d('确认删除？'),
    ...other,
  });
}
