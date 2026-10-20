import React, { Component, Fragment } from 'react';
import { Table, Select } from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';

const { Option } = Select;
@withRouter
export default class ContractStage extends Component {
  renderColumns() {
    const { editable, stageList } = this.props;
    const columns = [
      {
        name: 'statusCode',
        width: 150,
      },
      {
        name: 'anciContractCode',
        width: 150,
        renderer: (record) =>
          editable && (
            <Select onChange={(value) => this.handleChangeStage(value, record)}>
              {stageList.map((s) => (
                <Option key={s.stageCode} value={s.stageCode}>
                  {s.stageName}
                </Option>
              ))}
            </Select>
          ),
      },
      {
        name: 'version',
        width: 175,
        editor: editable,
      },
      {
        name: 'createByRealName',
        width: 175,
      },
      {
        name: 'creationDate',
        width: 150,
      },
      {
        name: 'approveDate',
        width: 150,
      },
    ];
    return columns;
  }

  render() {
    const { AncillaryDS, customizeTable } = this.props;

    return (
      <Fragment>
        {customizeTable(
          {
            code: '',
          },
          <Table dataSet={AncillaryDS} columns={this.renderColumns()} />
        )}
      </Fragment>
    );
  }
}
