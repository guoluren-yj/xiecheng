import { Modal } from 'choerodon-ui/pro';
import styles from './index.less';


export default function openTipsModal(modalProps = {}){
  return Modal.open({
    border: false,
    autoCenter: true,
    movable: false,
    className: styles['tips-modal'],
    ...modalProps,
  });
}