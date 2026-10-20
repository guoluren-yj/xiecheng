import React, { Component } from 'react';
import { Form, Button, DatePicker, TextField, Lov, Select } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

const prefix = 'scux.companySubAccount';
const { Option } = Select;

export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      display: false,
    };
  }

  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({ display: !display });
  }

  @Bind()
  handleSearch() {
    const { formDs, tableDs } = this.props;
    tableDs.setQueryParameter('params', formDs.current.toData());
    tableDs.query();
  }

  render() {
    const { formDs } = this.props;
    const { display } = this.state;
    return (
      <div style={{ marginBottom: '12px' }}>
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Form dataSet={formDs} columns={3}>
                <TextField name="docNum" clearButton={!false} />
                <TextField name="esInterfaceCode" clearButton={!false} />
                <TextField name="batchNum" clearButton={!false} />
              </Form>
            </Row>
            <Row style={{ display: !display ? 'none' : 'block' }}>
              <Form dataSet={formDs} columns={3}>
                <Lov
                  name="externalSystemCode"
                  clearButton={!false}
                  modalProps={{ movable: false }}
                />
                <Select name="errorFlag" clearButton={!false}>
                  <Option value={0} key={0}>
                    {intl.get(`hzero.common.status.no`).d('否')}
                  </Option>
                  <Option value={1} key={1}>
                    {intl.get(`hzero.common.status.yes`).d('是')}
                  </Option>
                </Select>
                <Select name="consumedFlag" clearButton={!false}>
                  <Option value={0} key={0}>
                    {intl.get(`hzero.common.status.no`).d('否')}
                  </Option>
                  <Option value={1} key={1}>
                    {intl.get(`hzero.common.status.yes`).d('是')}
                  </Option>
                </Select>
                <Lov
                  name="applicationGroupCode"
                  clearButton={!false}
                  modalProps={{ movable: false }}
                />
                <DatePicker name="creationDateFrom" clearButton={!false} />
                <DatePicker name="creationDateTo" clearButton={!false} />
              </Form>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form dataSet={formDs} columns={3}>
              <Button onClick={this.toggleForm}>
                {!display
                  ? intl.get(`${prefix}.view.button.unfold`).d('展开查询')
                  : intl.get(`${prefix}.view.button.fold`).d('收起查询')}
              </Button>
              <Button type="reset">{intl.get('hzero.common.button.reset').d('重置')}</Button>
              <Button color="primary" onClick={this.handleSearch}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form>
          </Col>
        </Row>
      </div>
    );
  }
}
