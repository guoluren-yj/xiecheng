import React, { useContext } from 'react';
import { observer } from 'mobx-react';

import CollapseForm from '_components/CollapseForm';

import { Store } from '../store/index';

export default observer(function ReplyHeader() {
  const {
    routerParams: { sourceCategory },
    commonDs: { attachementDs },
    customizeCollapseForm,
  } = useContext(Store);

  return customizeCollapseForm(
    {
      code: `SSRC.SUPPLIER_REPLY_${sourceCategory}.REPLY_HEADER`,
      dataSet: attachementDs,
      enableEmpty: true,
    },
    <CollapseForm
      dataSet={attachementDs}
      columns={3}
      showLines={3}
      labelLayout="vertical"
      useWidthPercent
      className="c7n-pro-vertical-form-display"
    />
  );
});
