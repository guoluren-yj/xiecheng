import React from 'react';
import { DataSet, Form, Button, TextField, Select, TextArea } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';

import { formDs } from './tableDs';
import { updateDoc } from '@/services/docManageService';

export default class Detail extends React.Component {
  constructor(props) {
    super(props);
    const { state } = props.history?.location;
    this.state = {
      recordData: state?.recordData,
    };
  }

  formDS = new DataSet(formDs());

  componentDidMount() {
    this.formDS.create(this.state.recordData || {});
  }

  @Bind()
  async handleSave() {
    const flag = await this.formDS.validate();
    if (flag) {
      const data = this.formDS.toData();
      const res = await updateDoc(data[0]);
      if (res) {
        notification.success();
      }
    }
  }

  render() {
    return (
      <React.Fragment>
        <Header
          backPath="/smop/doc-manage/list"
          title={intl.get('smop.common.view.proSerDetail').d('新增/更新商品服务详情')}
        >
          <Button color="primary" icon="check" onClick={this.handleSave}>
            {intl.get('smop.common.view.confirm').d('确认')}
          </Button>
        </Header>
        <Content>
          <div style={{ fontSize: 16, marginBottom: 12 }}>
            {intl.get('smop.common.view.baseInfo').d('基础信息')}
          </div>
          <Form dataSet={this.formDS} columns={3} labelLayout="float" style={{ width: '75%' }}>
            <Select name="menuTitleId" />
            <TextField name="title" />
            <Select name="level" />
            <Select name="parentMenuDeployId" />
            <Select name="status" />
          </Form>
        </Content>
        <Content>
          <div style={{ fontSize: 16, marginBottom: 12 }}>
            {intl.get('smop.common.view.serviceDetail').d('服务详情')}
          </div>
          {/* <RichText dataSet={this.formDS} name='richTextId' style={{ height: 300 }} /> */}
          <TextArea dataSet={this.formDS} name="richTextId" style={{ width: 700, height: 200 }} />
        </Content>
      </React.Fragment>
    );
  }
}
