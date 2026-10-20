import React, { Component, Fragment } from 'react';
import { Transfer, Spin, Table } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

@connect(({ evaluationTemplate, loading }) => ({
  evaluationTemplate,
  EvaluationAutoCategoryData: evaluationTemplate.EvaluationAutoCategoryData,
  EvaluationAutoCategoryKeys: evaluationTemplate.EvaluationAutoCategoryKeys,
  EvaluationAutoCategoryDatapagination: evaluationTemplate.EvaluationAutoCategoryDatapagination,
  queryEvaluationAutoCategoryPageLoading:
    loading.effects['evaluationTemplate/queryEvaluationAutoCategoryPage'],
}))
@formatterCollections({ code: ['sslm.supplierKpiIndicator'] })
export default class AutoCategory extends Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
  }

  componentDidMount() {
    const { evalStatusCode } = this.props;
    if (evalStatusCode === 'PUBLISHED') {
      this.handleCategoryGroupPage();
    } else if (evalStatusCode !== 'PUBLISHED') {
      this.props.handleCategoryGroup();
    }
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'evaluationTemplate/updateState',
      payload: {
        EvaluationAutoCategoryData: [],
        EvaluationAutoCategoryKeys: [],
        EvaluationAutoCategoryDatapagination: [],
      },
    });
  }

  /**
   * 查询
   */
  @Bind()
  handleCategoryGroupPage() {
    const { dispatch, templateId, evalTplCode } = this.props;
    dispatch({
      type: 'evaluationTemplate/queryEvaluationAutoCategoryPage',
      payload: {
        evalTplId: templateId,
        evalDimension: evalTplCode,
      },
    });
  }

  /**
   * 选项在两栏之间转移时的回调
   */
  @Bind()
  handleChange(targetKeys) {
    const { dispatch } = this.props;
    dispatch({
      type: 'evaluationTemplate/updateState',
      payload: {
        EvaluationAutoCategoryKeys: targetKeys,
      },
    });
  }

  /**
   * Transfer
   */
  @Bind()
  renderTransfer(item) {
    const label = (
      <Fragment>
        <span style={{ marginRight: '20px' }}>{item.valueCode}</span>
        <span>{item.valueName}</span>
      </Fragment>
    );
    return {
      label,
      value: `${item.valueCode} ${item.valueName}`,
    };
  }

  render() {
    const {
      EvaluationAutoCategoryData = [],
      EvaluationAutoCategoryKeys = [],
      EvaluationAutoCategoryDatapagination = [],
      evalStatusCode,
      queryEvaluationAutoCategoryLoading,
      queryEvaluationAutoCategoryPageLoading,
    } = this.props;
    const columns = [
      {
        title: intl.get(`sslm.supplierKpiIndicator.model.supplierKpiIndicator.code`).d('编码'),
        dataIndex: 'valueCode',
        width: 300,
      },
      {
        title: intl.get(`sslm.supplierKpiIndicator.model.supplierKpiIndicator.name`).d('名称'),
        dataIndex: 'valueName',
        width: 300,
      },
    ];
    return (
      <Fragment>
        {evalStatusCode !== 'PUBLISHED' && (
          <Spin spinning={queryEvaluationAutoCategoryLoading}>
            <Transfer
              rowKey={item => item.evalDimensionValue}
              showSearch
              dataSource={EvaluationAutoCategoryData}
              targetKeys={EvaluationAutoCategoryKeys}
              render={this.renderTransfer}
              listStyle={{ height: 400, width: 303 }}
              onChange={this.handleChange}
            />
          </Spin>
        )}
        {evalStatusCode === 'PUBLISHED' && (
          <Table
            bordered
            pagination={EvaluationAutoCategoryDatapagination}
            loading={queryEvaluationAutoCategoryPageLoading}
            columns={columns}
            disabled
            dataSource={EvaluationAutoCategoryData}
            style={{ marginTop: 15 }}
          />
        )}
      </Fragment>
    );
  }
}
