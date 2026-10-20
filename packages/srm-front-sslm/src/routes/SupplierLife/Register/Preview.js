/**
 * Recommend - 供应商生命周期配置 - 合格申请只读组件
 * @date: 2018-10-15
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import PreviewHeader from './PreviewHeader';

@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['sslm.investigationReceived', 'sslm.common'],
})
export default class RegisterPreview extends PureComponent {
  state = {
    isEdit: false,
  };

  render() {
    const { isEdit } = this.state;
    const { form, headerInfo = {} } = this.props;
    return (
      <React.Fragment>
        <div className="table-list-search" style={{ marginLeft: 16 }}>
          <PreviewHeader isEdit={isEdit} form={form} headerInfo={headerInfo} />
        </div>
      </React.Fragment>
    );
  }
}
