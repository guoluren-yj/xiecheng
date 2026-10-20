import React from 'react';
import { Modal } from 'choerodon-ui/pro';
// import intl from 'utils/intl';
import SkuSelect from './SkuSelect';

export default function openSkuSelect(props) {
  return Modal.open({
    drawer: true,
    header: null,
    bodyStyle: { padding: 0 },
    style: { width: props.selection === 'single' ? 742 : 1042 },
    children: <SkuSelect {...props} />,
  });
}
