import React from 'react';
import notification from 'hzero-front/lib/utils/notification';
import { DataSet, Form, TextArea, Spin } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import { basicFormDS } from '@/stores/MyApplication/MyApplicationDS';
import getLang from '@/langs/myApplicationLang';

export default class ApplyModal extends React.Component {
  constructor(props) {
    super(props);
    this.basicFormDS = new DataSet(basicFormDS());
  }

  componentDidMount() {
    const { applyId } = this.props;
    if (!isUndefined(applyId)) {
      this.handleFetchDetail(applyId);
    }
    this.updateModalProps();
  }

  /**
   * 查询
   */
  @Bind()
  async handleFetchDetail(applyId) {
    this.basicFormDS.setQueryParameter('applyId', applyId);
    this.basicFormDS.query();
  }

  @Bind()
  updateModalProps() {
    this.props.modal.update({
      onOk: this.handleOk,
    });
  }

  /**
   * 提交方法
   */
  @Bind()
  async handleOk() {
    const validate = await this.basicFormDS.validate();
    if (!validate) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    const { interfaces, onCallback } = this.props;
    this.basicFormDS.current.set('permissionApplyLineList', interfaces);
    return this.basicFormDS.submit().then((res) => {
      if (res && !res.failed) {
        onCallback();
      }
    });
  }

  render() {
    return (
      <Spin dataSet={this.basicFormDS}>
        <Form dataSet={this.basicFormDS}>
          <TextArea name="applyReason" rows={8} />
        </Form>
      </Spin>
    );
  }
}
