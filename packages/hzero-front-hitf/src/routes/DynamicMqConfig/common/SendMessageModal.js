/**
 * @author HBT <baitao.huang@hand-china.com>
 * @creationDate 2020/5/13
 * @copyright HAND ® 2020
 */
import React, { PureComponent } from 'react';
import { DataSet, Form, TextArea } from 'choerodon-ui/pro';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { sendMessageFormDS } from '@/stores/DynamicMqConfig/DynamicMqConfigDS';
import getLang from '@/langs/dynamicMqConfigLang';

@formatterCollections({ code: ['hzero.common', 'hitf.dynamicMqConfig'] })
export default class SendMessageModal extends PureComponent {
  constructor(props) {
    super(props);
    this.sendMessageFormDS = new DataSet(sendMessageFormDS());
  }

  componentDidMount() {
    this.handleUpdateModalFooter();
  }

  /**
   * 更新Modal的footer
   */
  handleUpdateModalFooter() {
    const { match, modal } = this.props;
    const { path } = match;
    modal.update({
      footer: () => (
        <ButtonPermission
          permissionList={[
            {
              code: `${path}.button.send`,
              type: 'button',
              meaning: '消息中间件-消息队列-发送',
            },
          ]}
          type="c7n-pro"
          color="primary"
          onClick={this.handleSend}
        >
          {getLang('SEND')}
        </ButtonPermission>
      ),
    });
  }

  /**
   * 发送消息
   */
  @Bind()
  async handleSend() {
    const { channelName } = this.props;
    const validate = await this.sendMessageFormDS.validate();
    if (validate) {
      this.sendMessageFormDS.current.set('channelName', channelName);
      await this.sendMessageFormDS.submit();
    }
  }

  render() {
    return (
      <Form labelLayout="horizontal" dataSet={this.sendMessageFormDS}>
        <TextArea name="message" />
      </Form>
    );
  }
}
