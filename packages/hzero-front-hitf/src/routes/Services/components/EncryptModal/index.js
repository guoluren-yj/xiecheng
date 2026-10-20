/**
 * 加密弹窗（服务和接口公用）
 * @author HBT <baitao.huang@hand-china.com>
 * @creationDate 2021/8/12
 * @copyright HAND ® 2021
 */
import React from 'react';
import notification from 'hzero-front/lib/utils/notification';
import { DataSet, Form, Select, Switch, Button, TextField } from 'choerodon-ui/pro';
import { Tabs, Tooltip } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { omit, isEmpty } from 'lodash';
import { basicFormDS, fetchEncryKeyDS } from '@/stores/Services/EncryptDS';
import getLang from '@/langs/serviceLang';
import { PACKET_ENCRYPT_DIRECTION_CONSTANTS } from '@/constants/constants';

export default class EncryptModal extends React.Component {
  constructor(props) {
    super(props);
    this.inFormDS = new DataSet(basicFormDS());
    this.outFormDS = new DataSet(basicFormDS());
    this.state = {
      currentActiveKey: 'in',
    };
  }

  componentDidMount() {
    const { packetEncrypts = [] } = this.props;
    const inData = packetEncrypts.find(
      (item) => item.encryptDirection === PACKET_ENCRYPT_DIRECTION_CONSTANTS.IN
    );
    const outData = packetEncrypts.find(
      (item) => item.encryptDirection === PACKET_ENCRYPT_DIRECTION_CONSTANTS.OUT
    );
    if (inData) {
      this.inFormDS.loadData([inData]);
      this.inFormDS.getField('encryptKey').set('placeholder', getLang('UNCHANGE'));
    } else {
      this.inFormDS.create({ encryptDirection: PACKET_ENCRYPT_DIRECTION_CONSTANTS.IN });
    }
    if (outData) {
      this.outFormDS.loadData([outData]);
      this.outFormDS.getField('encryptKey').set('placeholder', getLang('UNCHANGE'));
    } else {
      this.outFormDS.create({ encryptDirection: PACKET_ENCRYPT_DIRECTION_CONSTANTS.OUT });
    }
    this.handleUpdateModalProp();
  }

  /**
   * 更新当前Modal的属性
   */
  @Bind()
  handleUpdateModalProp() {
    const { readOnly } = this.props;
    this.props.modal.update({
      onOk: this.handleOk,
      okProps: { disabled: readOnly },
    });
  }

  /**
   * 保存
   */
  @Bind()
  async handleOk() {
    const { onSetPacketEncrypts = () => {} } = this.props;
    const { currentActiveKey } = this.state;
    const validates = await Promise.all([this.inFormDS.validate(), this.outFormDS.validate()]);
    // 入站和出战都含有必输字段
    // 只有在当前激活的Tab校验不通过时才会报错，其它情况无需报错
    if (
      (currentActiveKey === 'in' && !validates[0]) ||
      (currentActiveKey === 'out' && !validates[1])
    ) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    const packetEncrypts = [];
    const inData = omit(this.inFormDS.current.toJSONData(), ['__dirty']);
    const outData = omit(this.outFormDS.current.toJSONData(), ['__dirty']);
    // 校验通过则往packetEncrypts新增一条数据
    if (validates[0]) {
      packetEncrypts.push(inData);
    }
    if (validates[1]) {
      packetEncrypts.push(outData);
    }
    onSetPacketEncrypts(packetEncrypts);
    return true;
  }

  @Bind()
  handleTabKeyChange(key) {
    this.setState({ currentActiveKey: key });
  }

  /**
   * 获取密钥
   */
  @Bind()
  fetchEncryKey(dataSet) {
    const encryptAlgorithm = dataSet.records[0].get('encryptAlgorithm');
    if (isEmpty(encryptAlgorithm)) {
      notification.error({
        message: getLang('ALGORITHM_NOT_EMPTY'),
      });
      return false;
    }
    const encryKeyDS = new DataSet(fetchEncryKeyDS());
    encryKeyDS.current.set('encryptAlgorithm', encryptAlgorithm);
    return encryKeyDS.submit().then((res) => {
      if (res && !res.failed) {
        const { encryptKey } = res.content[0];
        dataSet.records[0].set('encryptKey', encryptKey);
      }
    });
  }

  render() {
    const { readOnly } = this.props;
    const { currentActiveKey } = this.state;
    return (
      <Tabs activeKey={currentActiveKey} onChange={this.handleTabKeyChange}>
        <Tabs.TabPane tab={getLang('IN')} key="in">
          <Form dataSet={this.inFormDS} columns={2} disabled={readOnly}>
            <Select name="encryptDirection" />
            <Select name="encryptPolicy" />
            <Select name="encryptAlgorithm" />
            <TextField
              name="encryptKey"
              suffix={
                <Tooltip title={getLang('RESET_ENCRY_KEY')}>
                  <Button
                    icon="refresh"
                    funcType="flat"
                    size="small"
                    onClick={() => this.fetchEncryKey(this.inFormDS)}
                  />
                </Tooltip>
              }
            />
            <Switch name="enabledFlag" />
          </Form>
        </Tabs.TabPane>
        <Tabs.TabPane tab={getLang('OUT')} key="out">
          <Form dataSet={this.outFormDS} columns={2} disabled={readOnly}>
            <Select name="encryptDirection" />
            <Select name="encryptPolicy" />
            <Select name="encryptAlgorithm" />
            <TextField
              name="encryptKey"
              suffix={
                <Tooltip title={getLang('RESET_ENCRY_KEY')}>
                  <Button
                    icon="refresh"
                    funcType="flat"
                    size="small"
                    onClick={() => this.fetchEncryKey(this.outFormDS)}
                  />
                </Tooltip>
              }
            />
            <Switch name="enabledFlag" />
          </Form>
        </Tabs.TabPane>
      </Tabs>
    );
  }
}
