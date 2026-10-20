/**
 * 个性化日志弹窗（接口层）
 * @author HBT <baitao.huang@hand-china.com>
 * @creationDate 2021/8/23
 * @copyright HAND ® 2021
 */
import React from 'react';
import { Form, DataSet, TextField } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { omit } from 'lodash';
import notification from 'hzero-front/lib/utils/notification';
import getLang from '@/langs/serviceLang';
import { basicFormDS } from '@/stores/Services/customLogDS';

class CustomAttrModal extends React.Component {
  constructor(props) {
    super(props);
    this.basicFormDS = new DataSet(basicFormDS());
  }

  componentDidMount() {
    const { customLogRuleData = '{}' } = this.props;
    this.basicFormDS.create(JSON.parse(customLogRuleData));
    this.updateModalProps();
  }

  @Bind()
  updateModalProps() {
    this.props.modal.update({
      onOk: this.handleOk,
    });
  }

  @Bind()
  async handleOk() {
    const validate = await this.basicFormDS.validate();
    if (!validate) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    const { onSetCustomLog = () => {} } = this.props;
    const data = omit(this.basicFormDS.current.toData(), ['__dirty']);
    onSetCustomLog(JSON.stringify(data));
    return true;
  }

  render() {
    const { readOnly } = this.props;
    return (
      <Form disabled={readOnly} labelWidth={130} dataSet={this.basicFormDS}>
        <TextField name="sourceSystem" />
        <TextField name="sourceDocumentNum" />
        <TextField name="sourceDocumentId" />
      </Form>
    );
  }
}
export default CustomAttrModal;
