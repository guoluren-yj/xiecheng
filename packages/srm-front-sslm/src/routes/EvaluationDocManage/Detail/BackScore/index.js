import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { DataSet, Table, Form, Lov } from 'choerodon-ui/pro';
import { getBackScoreDS, backScoreColumns } from './stores/getBackScoreDS';

export default class BackScore extends Component {
  constructor(props) {
    super(props);
    const { onRef, headerId, evalTplId } = this.props;
    this.dataSet = new DataSet(getBackScoreDS({ headerId, evalTplId }));
    onRef(this);
  }

  @Bind
  renderBar(props) {
    const { queryDataSet, dataSet } = props;
    const { granularity } = this.props;
    if (queryDataSet) {
      return (
        <Form columns={2} dataSet={queryDataSet}>
          <Lov
            clearButton
            name="indicatorId"
            onChange={(value) => {
              queryDataSet.current.set('indicatorId', value);
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
          <Lov
            clearButton
            name="supplierId"
            onChange={(value) => {
              queryDataSet.current.set('supplierId', value);
              dataSet.query();
            }}
          />
          {granularity === 'SU+CA' && (
            <Lov
              clearButton
              name="categoryIds"
              onChange={(value) => {
                queryDataSet.current.set('categoryIds', value);
                dataSet.query();
              }}
            />
          )}
          {granularity === 'SU+IT' && (
            <Lov
              clearButton
              name="itemId"
              onChange={(value) => {
                queryDataSet.current.set('itemId', value);
                dataSet.query();
              }}
            />
          )}
        </Form>
      );
    }
  }

  render() {
    return (
      <Table
        border
        dataSet={this.dataSet}
        columns={backScoreColumns(this.props.granularity)}
        queryBar={this.renderBar}
        showAllPageSelectionButton
      />
    );
  }
}
