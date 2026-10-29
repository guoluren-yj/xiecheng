import React, { Component } from 'react';
import { Form, InputNumber, Select } from 'hzero-ui';
import { isEmpty, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';

import styles from './index.less';

const PROMPT_CODE = 'ssrc.expertScoring';

@Form.create({ fieldNameProp: null })
export default class ScoreElementTable extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(props.bidLineItemId, this);
    }
    this.state = {
      scoresFlag: false, // 供应商分数是否发生改变
    };
  }

  /**
   * 渲染供应商表格数据源
   *
   * @param {*} [dataSource=[]]
   * @returns
   * @memberof ScoreElementTable
   */
  renderDataSource(dataSource = []) {
    const supplierDataSource = dataSource.map((item) => {
      let elementValue = {};
      const { evaluateScoreDTOS = [], ...otherItem } = item;
      evaluateScoreDTOS.forEach((elementItem) => {
        elementValue = {
          ...elementValue,
          [elementItem.supplierCompanyName]:
            item.indicateName === intl.get('ssrc.expertScoring.view.message.total').d('合计')
              ? elementItem.indicSumScore
              : item.indicateType === 'SCORE'
              ? elementItem.indicScore
              : elementItem.passStatus,
        };
      });
      return {
        ...otherItem,
        ...elementValue,
      };
    });
    return supplierDataSource;
  }

  /**
   * 供应商打分分数是否改变
   *
   */
  @Bind()
  setValue(e, val) {
    const { scoresFlag } = this.state;
    if (scoresFlag) {
      this.setState({ scoresFlag: true });
    } else if (e === val) {
      this.setState({ scoresFlag: false });
    } else {
      this.setState({ scoresFlag: true });
    }
  }

  /**
   * @function handleScoreStatus - 通过制专家评分
   */
  @Bind()
  handleScoreStatus(value) {
    const { scoresFlag } = this.state;
    if (scoresFlag) {
      this.setState({ scoresFlag: true });
    } else if (value) {
      this.setState({ scoresFlag: true });
    } else {
      this.setState({ scoresFlag: false });
    }
  }

  /**
   * 渲染供应商打分分数操作
   */
  @Bind()
  renderSupplierScore(val, record, quotationHeaderId, scoreStatus) {
    const {
      bidLineItemId,
      code: { detailApprovedStatus = [] },
    } = this.props;
    let mean = '';
    if (record.indicateType === 'SCORE') {
      mean = (
        <InputNumber
          disabled={scoreStatus === 'SCORED' || record.calculateType === 'AUTO'}
          min={record.minScore ? record.minScore : 0}
          max={record.maxScore ? record.maxScore : 9999999999}
          style={{ width: '100%' }}
          onChange={(e) => this.setValue(e, val)}
        />
      );
    } else {
      mean = (
        <Select
          disabled={scoreStatus === 'SCORED'}
          allowClear
          style={{ width: '100%' }}
          onChange={this.handleScoreStatus}
        >
          {detailApprovedStatus.map((n) => (
            <Select.Option value={n.value} key={n.value}>
              {n.meaning}
            </Select.Option>
          ))}
        </Select>
      );
    }
    return (
      <Form.Item>
        {this.props.form.getFieldDecorator(
          `${bidLineItemId}#${record.evaluateIndicId}#${record.team}#${quotationHeaderId}`,
          {
            initialValue: val,
          }
        )(mean)}
      </Form.Item>
    );
  }

  /**
   * 一个供应商对应多个评分要素
   * 前几列固定为评分要素列，其他的是供应商列，非固定
   * @param {*} [dataSource=[]]
   * @returns
   * @memberof ScoreElementTable
   */
  renderColumns = (dataSource = []) => {
    const { exportScoringBuss } = this.props;

    let elementColumns = [];
    if (!isEmpty(dataSource)) {
      // 同步开标
      elementColumns =
        dataSource[0].evaluateScoreDTOS &&
        dataSource[0].evaluateScoreDTOS.map((item) => {
          return {
            dataIndex: `${item.supplierCompanyName}`,
            title:
              item.expensesFlag === 1 ? (
                <span>
                  {`${item.supplierCompanyName}`}
                  {
                    <span style={{ color: 'red' }}>
                      {`(${intl
                        .get('ssrc.expertScoring.model.expertScoring.noPayBond')
                        .d('未缴保证金')})`}
                    </span>
                  }
                </span>
              ) : (
                item.supplierCompanyName
              ),
            width: 250,
            render: (val, record) => {
              let childrenFieldEdit =
                record.indicateName !== intl.get('ssrc.expertScoring.view.message.total').d('合计');
              childrenFieldEdit = exportScoringBuss
                ? exportScoringBuss.render(
                    'SSRC_EXPERT_SCORING_BID_DYNAMIC_COLUMN_EDIT',
                    childrenFieldEdit,
                    {
                      that: this,
                      val,
                      record,
                      dataSource,
                      item,
                    }
                  )
                : childrenFieldEdit;

              return childrenFieldEdit ? (
                this.renderSupplierScore(val, record, item.quotationHeaderId, item.scoreStatus)
              ) : (
                <span style={{ fontWeight: 'bold', marginLeft: 8 }}>{val}</span>
              );
            },
          };
        });
      return [
        {
          dataIndex: 'indicateName',
          title: intl.get(`${PROMPT_CODE}.model.expertScoring.indicateName`).d('要素名称'),
          width: 200,
          render: (val, record) =>
            record.indicateName !== intl.get('ssrc.expertScoring.view.message.total').d('合计') ? (
              <span>{val}</span>
            ) : (
              <span style={{ fontWeight: 'bold' }}>{val}</span>
            ),
        },
        {
          dataIndex: 'indicateTypeMeaning',
          title: intl.get(`${PROMPT_CODE}.model.expertScoring.indicateType`).d('要素类型'),
          width: 80,
        },
        {
          dataIndex: 'weight',
          title: intl.get(`${PROMPT_CODE}.model.expertScoring.weight`).d('权重'),
          width: 80,
          render: (val, record) => (record.weight ? `${record.weight}%` : ''),
        },
        {
          dataIndex: '',
          title: intl.get(`${PROMPT_CODE}.model.expertScoring.betweenScore`).d('评分区间'),
          width: 80,
          render: (val, record) =>
            record.indicateType === 'SCORE' ? `[${record.minScore},${record.maxScore}]` : '',
        },
        {
          dataIndex: 'detail',
          title: intl.get(`${PROMPT_CODE}.model.expertScoring.detail`).d('评分细则'),
          width: 80,
        },
        ...elementColumns,
      ];
    } else {
      return elementColumns;
    }
  };

  render() {
    const { scoreElementList = [], loading } = this.props;

    // elementNumberX 供应商个数
    const elementNumberX =
      scoreElementList && scoreElementList[0] && scoreElementList[0].evaluateScoreDTOS
        ? scoreElementList[0].evaluateScoreDTOS.length
        : 0;
    const scrollX =
      elementNumberX && Math.ceil(elementNumberX / 2) > 1 && elementNumberX * 220 + 550;
    return (
      <React.Fragment>
        <div className={styles.supplierList}>
          <span className={styles.supplierTip}>
            {intl
              .get(`${PROMPT_CODE}.model.expertScoring.selectNotBid`)
              .d('如需选择无效投标供应商或查看评审澄清，请切换至供应商维度进行操作！')}
          </span>
        </div>
        <EditTable
          bordered
          loading={loading}
          columns={this.renderColumns(scoreElementList)}
          rowKey="evaluateIndicId"
          dataSource={this.renderDataSource(scoreElementList) || []}
          pagination={false}
          scroll={{ x: scrollX }}
        />
      </React.Fragment>
    );
  }
}
