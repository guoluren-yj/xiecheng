import React from "react";
import { Modal } from "choerodon-ui/pro";
import intl from "srm-front-boot/lib/utils/intl";
import { getActiveTabKey, refreshTab } from "hzero-front/lib/utils/menuTab";
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';

export function uiQueryError() {
  const E = formatterCollections({ code: ['hpfm.customize'] })(function Error() {
    return <div style={{fontSize: "14px"}}>{intl.get('hpfm.customize.common.uiCustomizeError').d("页面数据加载失败，请刷新或重新打开该页面后进行操作.")}</div>;
  })
  Modal.error({
    closable: false,
    children: <E />,
    onOk: () => {
      refreshTab(getActiveTabKey());
    }
  });
}