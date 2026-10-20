/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-02-09 14:26:21
 * @FilePath: /srm-front-sslm/src/routes/PurchaserEvaluationWorkbench/Details/BackScore/index.js
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { DataSet, Form, Lov } from 'choerodon-ui/pro';
import { isFunction, isEmpty } from 'lodash';
import SearchBarTable from '_components/SearchBarTable';
// import { tableMaxHeight } from '@/routes/components/utils';
import { getBackScoreDS, backScoreColumns } from './stores/getBackScoreDS';

export default class BackScore extends Component {
  constructor(props) {
    super(props);
    const { remote, onRef, headerId, evalTplId, searchCode } = this.props;
    const dsProps = getBackScoreDS({ headerId, evalTplId, searchCode });
    const remoteDsProps = remote
      ? remote.process('SSLM.PURCHASER_EVALUATION_WORKBENCH_DETAILS_BACK_SCORE_DS_PROPS', dsProps, {
          ...props,
        })
      : dsProps;
    this.dataSet = new DataSet(remoteDsProps);
    if (isFunction(onRef)) {
      onRef(this.dataSet);
    }
  }

  @Bind
  renderBar(props) {
    const { queryDataSet, dataSet } = props;
    if (queryDataSet) {
      return (
        <Form columns={2} dataSet={queryDataSet}>
          <Lov
            clearButton
            name="indicatorId"
            onChange={value => {
              queryDataSet.current.set('indicatorId', value);
              dataSet.query();
            }}
          />
          <Lov
            clearButton
            name="userId"
            onChange={value => {
              queryDataSet.current.set('userId', value);
              dataSet.query();
            }}
          />
        </Form>
      );
    }
  }

  @Bind
  // 查询
  handleQuery(queryProps) {
    const { params } = queryProps;
    if (this.dataSet.queryDataSet?.current) {
      const clearParams = {}; // 清理
      const dataObj = this.dataSet.queryDataSet.current.toData();
      if (dataObj) {
        for (const key in dataObj) {
          if (!['indicatorCode', 'indicatorName'].includes(key)) {
            // 排除掉自定义的查询条件
            if (!Object.prototype.hasOwnProperty.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
      }
      this.dataSet.queryDataSet.current.set({
        ...params,
        ...clearParams,
      });
      this.dataSet.query();
    } else {
      this.dataSet.query();
    }
  }

  render() {
    const { searchCode, headerId, modal } = this.props;
    return (
      <SearchBarTable
        cacheState
        dataSet={this.dataSet}
        columns={backScoreColumns()}
        searchCode={searchCode}
        searchBarConfig={{
          autoQuery: true,
          closeFilterSelector: true,
          expandable: false,
          onQuery: queryProps => this.handleQuery(queryProps),
          onReset: () => this.dataSet.queryDataSet?.current.reset(),
          onClear: () => this.dataSet.queryDataSet?.current.reset(),
          fieldProps: {
            indicatorId: {
              lovPara: { evalHeaderId: headerId },
            },
          },
        }}
        onChange={() => {
          const disabledFlag = isEmpty(this.dataSet.selected);
          modal.update({
            okProps: { disabled: disabledFlag },
          });
        }}
        customizable
        customizedCode="sslm-purchaser-evaluation-workbench-back-scorer"
        autoHeight={{ type: 'maxHeight', diff: 0 }}
      />
    );
  }
}
