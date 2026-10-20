/**
 * 批量录入Popover
 * @author baitao.huang@hand-china.com
 * @date 2021/8/23
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Popover } from 'choerodon-ui';
import { Form, DataSet, Button, TextArea } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import getLang from '@/langs/commonLang';

class TextAreaPopover extends React.Component {
  constructor(props) {
    super(props);
    this.formDS = new DataSet({
      autoCreate: true,
      autoQuery: false,
      paging: false,
      fields: [
        {
          name: 'inputArea',
          type: 'string',
          placeholder: getLang('BATCH_INPUT_PLACEHOLDER'),
        },
      ],
    });
    this.state = {
      visible: false,
    };
  }

  init() {
    const { onGetdata } = this.props;
    const data = onGetdata();
    if (!isEmpty(data)) {
      let inputArea = '';
      data.forEach((item) => {
        const { key = '', value = '' } = item;
        if (!isEmpty(key)) {
          if (isEmpty(inputArea)) {
            inputArea = `${key}: ${value}`;
          } else {
            inputArea = `${inputArea}\n${key}: ${value}`;
          }
        }
      });
      this.formDS.current.set('inputArea', inputArea);
    }
  }

  @Bind()
  handleOk() {
    const { onCallback = () => {} } = this.props;
    const temps = [];
    const input = this.formDS.current.get('inputArea');
    if (!isEmpty(input)) {
      const inputList = input.split('\n');
      inputList.forEach((item) => {
        const [key, ...others] = item.split(':');
        temps.push({ key, value: others.join(':') });
      });
    }
    onCallback(temps);
    this.formDS.reset();
    this.setState({ visible: false });
  }

  @Bind()
  handleVisibleChange(visible) {
    this.setState({ visible });
  }

  render() {
    const { title, icon = '', funcType = 'raised' } = this.props;
    const { visible } = this.state;
    this.init();
    return (
      <Popover
        trigger="click"
        title={title || getLang('BATCH_INPUT')}
        visible={visible}
        content={
          <Form dataSet={this.formDS} style={{ width: 450 }}>
            <TextArea name="inputArea" rows={12} resize="vertical" />
            <Button color="primary" style={{ width: 60, float: 'right' }} onClick={this.handleOk}>
              {getLang('OK')}
            </Button>
          </Form>
        }
        onVisibleChange={this.handleVisibleChange}
      >
        <Button icon={icon} funcType={funcType}>
          {getLang('BATCH_INPUT')}
        </Button>
      </Popover>
    );
  }
}
export default TextAreaPopover;
