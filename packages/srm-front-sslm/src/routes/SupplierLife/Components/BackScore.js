import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { DataSet, Table, Form, Lov } from 'choerodon-ui/pro';
import { getBackScoreDS, backScoreColumns } from './stores/getBackScoreDS';

export default class BackScore extends Component {
  constructor(props) {
    super(props);
    const { onRef, stageCode, requisitionId, templateId } = this.props;
    this.dataSet = new DataSet(getBackScoreDS({ stageCode, requisitionId, templateId }));
    onRef(this);
  }

  @Bind
  renderBar(props) {
    const { queryDataSet, dataSet } = props;
    if (queryDataSet) {
      return (
        <Form columns={2} dataSet={queryDataSet}>
          <Lov
            clearButton
            name="indicateId"
            onChange={(value) => {
              queryDataSet.current.set('indicateId', value);
              dataSet.query();
            }}
          />
          <Lov
            clearButton
            name="userId"
            onChange={(value) => {
              queryDataSet.current.set('userId', value);
              dataSet.query();
            }}
          />
        </Form>
      );
    }
  }

  render() {
    return (
      <Table
        border
        dataSet={this.dataSet}
        columns={backScoreColumns()}
        queryBar={this.renderBar}
        showAllPageSelectionButton
      />
    );
  }
}
