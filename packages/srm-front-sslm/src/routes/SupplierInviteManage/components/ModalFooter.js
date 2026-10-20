/**
 * ModalFooter - 弹窗底部按钮
 * @date: 2021-11-18
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { observer } from 'mobx-react';

@observer
export default class ModalFooter extends Component {
  render() {
    const { okBtn, cancelBtn, modalDs, handlePreviewInvestigation } = this.props;
    const hiddenPreviewBtn = modalDs.current ? !modalDs.current.get('investigateTemplateId') : true;
    return (
      <React.Fragment>
        {okBtn}
        {cancelBtn}
        <Button
          hidden={hiddenPreviewBtn}
          onClick={() => {
            if (handlePreviewInvestigation) {
              handlePreviewInvestigation(modalDs);
            }
          }}
        >
          {intl.get('sslm.common.button.message.previewInvestigation').d('预览调查表')}
        </Button>
      </React.Fragment>
    );
  }
}
