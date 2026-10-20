import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { throttle } from 'lodash';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';

const { confirm } = Modal;

function confirmModal(info, callBackFn) {
  // const action = intl.get(`hzero.common.button.delete`).d('删除');
  confirm({
    // style: { width: 560 },
    // title: (
    //   <span style={{ fontSize: '18px' }}>
    //     {/* {action} */}
    //     {/* {info.orderConfirm} */}
    //     {intl
    //       .get('sodr.workspace.view.confirm.deletePo', {
    //         displayPoNum: info.displayPoNum,
    //       })
    //       .d('删除订单{displayPoNum}')}
    //   </span>
    // ),
    title: intl.get('sodr.common.model.common.errorMessage').d('提示'),
    children: intl.get('sodr.workspace.view.confirm.children.deletePo').d('确定要删除订单？'),
    onOk: throttle(() => callBackFn(), THROTTLE_TIME, { trailing: false }),
    ...info,
  });
}

export { confirmModal };
