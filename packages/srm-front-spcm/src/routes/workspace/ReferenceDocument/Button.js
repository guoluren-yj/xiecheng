/**
 * 协议工作台-引用单据创建按钮
 */
import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import ReferenceDocument from './index';

const ButtonModal = (props) => {
  const { setting = {}, extractConfig } = props;

  const referenceModal = Modal.open({
    key: Modal.key(),
    drawer: true,
    title: intl.get('spcm.workspace.view.title.referenceDocument').d('引用单据创建'),
    children: (
      <ReferenceDocument
        onClose={() => referenceModal.close()}
        setting={setting}
        extractConfig={extractConfig}
      />
    ),
    closable: true,
    movable: false,
    destroyOnClose: true,
    style: { width: 1090 },
    footer: null,
  });
};

export default ButtonModal;
