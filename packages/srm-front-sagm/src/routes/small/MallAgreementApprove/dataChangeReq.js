import intl from 'utils/intl';
import notification from 'utils/notification';
import { openTextArea } from '@/utils/modals';

export default function dataChangeReq({ dispatch, type, data }, callback = e => e) {
  const dvaType =
    type === 'approve'
      ? 'mallAgreementApprove/agreementApprove'
      : type === 'reject'
      ? 'mallAgreementApprove/agreementReject'
      : 'mallAgreementApprove/agreementPublish';

  const _req = payload => {
    return dispatch({
      type: dvaType,
      payload,
    }).then(res => {
      if (res) {
        notification.success();
        callback();
      }
    });
  };

  if (type === 'reject') {
    openTextArea({
      title: intl.get('small.common.view.approveReject').d('审批拒绝'),
      name: 'rejectRemark',
      maxLength: 100,
      label: intl.get('small.common.view.rejectReason').d('拒绝原因'),
      onOk: param => _req(data.map(m => ({ ...m, ...param }))),
    });
  } else {
    _req(data);
  }
}
