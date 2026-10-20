/*
 * PeopleNotScore - 未评分人
 * @Date: 2022-10-18 19:17:25
 * @Author: ZLH
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */

import React, { Component } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { getPeopleScoreDS, peopleScoreColumns } from './stores/getPeopleScoreDS';

export default class PeopleNotScore extends Component {
  constructor(props) {
    super(props);
    const { evalHeaderId } = this.props;
    this.dataSet = new DataSet(getPeopleScoreDS({ evalHeaderId }));
    this.dataSet.query();
    this.columns = peopleScoreColumns();
  }

  render() {
    return <Table border dataSet={this.dataSet} columns={this.columns} selectionMode="click" />;
  }
}
