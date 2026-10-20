import { isNil } from 'lodash';

import intl from 'utils/intl';

export function getSelectedNegActConfirmMsg(action, dataSet) {
  const actionDescMap = {
    delete: intl.get('hzero.common.button.delete').d('删除'),
    cancel: intl.get('hzero.common.button.cancel').d('取消'),
  };
  const actionDesc = actionDescMap[action] || action;
  const msgFlag = isNil(dataSet) ? true : dataSet.selected?.some((item) => item.status !== 'add');
  return (
    msgFlag && {
      title: intl.get('ssrc.quickInquiry.quickReply.commonview.title.tip').d('提示'),
      children: intl
        .get('ssrc.quickInquiry.quickReply.common.view.message.confirmActionSelectedRowsOrNot', {
          actionDesc,
        })
        .d('是否确认{actionDesc}选中行？'),
    }
  );
}
