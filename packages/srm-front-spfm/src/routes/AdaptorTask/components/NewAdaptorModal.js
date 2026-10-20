/**
 * NewAdaptorModal.js
 * 适配器新建，复制适配器，编辑通用Modal组件
 * @date: 2021-09--8
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, zhenyun
 */
import React from 'react';
import { TextField, Form, Lov, Select } from 'choerodon-ui/pro';

export default class NewAdaptorModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowLov: true,
      isEnabled: false,
    };
  }

  componentDidMount() {
    const { newRecord } = this.props;
    if (this.props.isEdit) {
      this.setState({
        isShowLov: newRecord.get('scriptVersion') === '2',
        isEnabled: newRecord.get('enabledFlag'),
      });
    }
  }

  render() {
    return (
      <Form record={this.props.newRecord} disabled={this.state.isEnabled}>
        <Lov name="task" disabled={this.props.isEdit || this.props.isCopy ? 1 : 0} />
        <TextField name="runningService" disabled />
        <Lov name="applyTenant" disabled={this.props.isCopy ? 0 : 1} />
        <Select name="scriptVersion" disabled={!this.props.isEdit || !this.state.isShowLov} />
        <TextField name="description" />
      </Form>
    );
  }
}
