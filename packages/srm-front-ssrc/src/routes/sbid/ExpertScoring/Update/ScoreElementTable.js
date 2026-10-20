import React, { Component } from 'react';
import { Form, InputNumber, Select, Popover, Input } from 'hzero-ui';
import { isEmpty, isFunction, isUndefined, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { getContentScrollHeight } from '@/utils/utils';
import EditTable from 'components/EditTable';
import { scoreIntervalRender, zeroAmountScoreRender } from '@/utils/renderer';

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
   * 处理供应商表格数据
   *
   * @param {*} supplierDataSource
   * @memberof ScoreElementTable
   */
  @Bind()
  handleDisposeData(supplierDataSource) {
    const arrayItem = [];
    const newArrayItem = [];
    supplierDataSource.forEach((item) => {
      if (Array.isArray(item)) {
        arrayItem.push(...item);
      } else {
        arrayItem.push(item);
      }
    });
    arrayItem.forEach((item, index) => {
      newArrayItem.push({ ...item, index });
    });
    return newArrayItem;
  }

  /**
   * 渲染供应商表格数据源
   *
   * @param {*} [dataSource=[]]
   * @returns
   * @memberof ScoreElementTable
   */
  renderDataSource(scoreElementList = {}) {
    let totalDataSource = {};
    const {
      evaluateScoreTotal = [],
      evaluateScoreLineDTOS = [],
      evaluateSuggestionDTOS = [],
    } = scoreElementList;
    const supplierDataSource = evaluateScoreLineDTOS.map((item) => {
      let elementValue = {};
      const { evaluateScoreDTOS = [], evaluateScoreLineDetailS = [], ...otherItem } = item;
      const { detailEnabledFlag = 0 } = otherItem;
      if (detailEnabledFlag) {
        let subtotalDataSource = {};
        evaluateScoreDTOS.forEach((subtotalItem) => {
          subtotalDataSource = {
            ...subtotalDataSource,
            [subtotalItem.supplierCompanyName]: subtotalItem.indicScore,
            indicateName: intl.get('ssrc.expertScoring.view.message.subtotal').d('小计'),
            indicateNameFlag: 1,
          };
        });
        const detailEnabledSource = evaluateScoreLineDetailS.map((supplierDetail) => {
          let elementDetail = {};
          const {
            team = '',
            weight = '',
            minScore = '',
            maxScore = '',
            indicateId = '',
            indicateType = '',
            indicateName = '',
            remark: detail = '',
            evaluateIndicId = '',
            // eslint-disable-next-line no-shadow
            evaluateScoreDTOS = [],
          } = supplierDetail;
          evaluateScoreDTOS.forEach((elements) => {
            elementDetail = {
              ...elementDetail,
              team,
              weight,
              minScore,
              maxScore,
              indicateId,
              indicateType,
              indicateName,
              detail,
              evaluateIndicId,
              [elements.supplierCompanyName]:
                item.indicateType === 'SCORE' ? elements.indicScore : elements.passStatus,
            };
          });
          return elementDetail;
        });
        detailEnabledSource.unshift({
          ...otherItem,
          indicateNameFlag: 0,
          weight: otherItem.weight,
          indicateName: otherItem.indicateName,
        });
        detailEnabledSource.push(subtotalDataSource);
        return detailEnabledSource;
      } else {
        evaluateScoreDTOS.forEach((elementItem) => {
          elementValue = {
            ...elementValue,
            [elementItem.supplierCompanyName]:
              item.indicateType === 'SCORE' ? elementItem.indicScore : elementItem.passStatus,
            [`${elementItem.supplierCompanyName}#zeroAmountScoreFlag`]: Number(
              elementItem.zeroAmountScoreFlag
            ),
          };
        });
        return {
          ...otherItem,
          ...elementValue,
        };
      }
    });
    evaluateScoreTotal.forEach((totalItem) => {
      totalDataSource = {
        ...totalDataSource,
        indicateNameFlag: 1,
        [`${totalItem.supplierCompanyName}Flag`]: totalItem.sumPassStatus || '',
        [totalItem.supplierCompanyName]: totalItem.sumPassStatusMeaning || totalItem.indicSumScore,
        indicateName: intl.get('ssrc.inquiryHall.model.inquiryHall.summaryScore').d('汇总'),
      };
    });
    let expertSuggestion = {};
    evaluateSuggestionDTOS.forEach((totalItem) => {
      expertSuggestion = {
        ...expertSuggestion,
        indicateNameFlag: 1,
        expertSuggestionFlag: 1, // 评审意见
        [totalItem.supplierCompanyName]: totalItem.expertSuggestion,
        indicateName: intl.get('ssrc.expertScoring.view.message.expertSuggestion').d('评审意见'),
      };
    });
    supplierDataSource.push(totalDataSource, expertSuggestion);
    return this.handleDisposeData(supplierDataSource);
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
  renderSupplierScore(val, record = {}, supplierChildrenItem = {}) {
    const {
      bidLineItemId,
      code: { detailApprovedStatus = [] },
      exportScoringBuss,
      bidFlag,
    } = this.props;
    const { quotationHeaderId, scoreStatus } = supplierChildrenItem;
    let mean = '';

    const disabledAllSupplierScoreFieldFlag = exportScoringBuss
      ? exportScoringBuss.process(
          'SSRC_EXPERT_SCORING_BUSS_PROCESS_SCORE_DISABLEDEVERYFIELD',
          false,
          {
            bidFlag,
            that: this,
          }
        )
      : false;

    const inputValidator = (_, value, callback) => {
      // 非SCORE不校验
      if (record.indicateType !== 'SCORE') return true;
      if (!isNil(record.maxScore) && value > record.maxScore) {
        callback(
          intl
            .get('ssrc.expertScoring.expertScoring.validateError', {
              value: record.maxScore,
            })
            .d(`必须小于或等于${record.maxScore}。`)
        );
      } else if (!isNil(record.minScore) && value < record.minScore) {
        callback(
          intl
            .get('ssrc.expertScoring.expertScoring.validateErrorLower', {
              value: record.minScore,
            })
            .d(`必须大于或等于${record.minScore}。`)
        );
      } else {
        callback();
      }
    };
    if (record[`${supplierChildrenItem.supplierCompanyName}#zeroAmountScoreFlag`]) {
      return zeroAmountScoreRender();
    }

    if (record.indicateType === 'SCORE') {
      const minValue = record.calculateType === 'AUTO' ? null : 0;

      mean = (
        <InputNumber
          disabled={
            scoreStatus === 'SCORED' ||
            record.calculateType === 'AUTO' ||
            disabledAllSupplierScoreFieldFlag
          }
          min={
            exportScoringBuss
              ? exportScoringBuss.process(
                  'SSRC_EXPERT_SCORING_BUSS_PROCESS_SCORE_MIN_VALUE',
                  minValue,
                  {
                    bidFlag,
                  }
                )
              : minValue
          }
          // max={
          //   record.calculateType === 'AUTO' ? null : record.maxScore ? record.maxScore : 9999999999
          // }
          style={{ width: '100%' }}
          onChange={(e) => this.setValue(e, val)}
        />
      );
    } else {
      mean = (
        <Select
          disabled={scoreStatus === 'SCORED' || disabledAllSupplierScoreFieldFlag}
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
    // 评审意见
    if (record.expertSuggestionFlag) {
      mean = (
        <Input
          disabled={scoreStatus === 'SCORED' || disabledAllSupplierScoreFieldFlag}
          style={{ width: '100%' }}
          onChange={this.handleScoreStatus}
        />
      );
      return (
        <Form.Item>
          {this.props.form.getFieldDecorator(`${supplierChildrenItem.supplierCompanyName}`, {
            initialValue: val,
          })(mean)}
        </Form.Item>
      );
    }

    mean = exportScoringBuss
      ? exportScoringBuss.process(
          'SSRC_EXPERT_SCORING_BUSS_PROCESS_SCORE_SUPPLIER_SCORED_COMPONENT',
          mean,
          {
            record,
            supplierChildrenItem,
            that: this,
          }
        )
      : mean;

    return (
      <Form.Item>
        {this.props.form.getFieldDecorator(
          record.indicateId
            ? `${bidLineItemId}#${record.evaluateIndicId}#${record.team}#${quotationHeaderId}#${record.indicateId}`
            : `${bidLineItemId}#${record.evaluateIndicId}#${record.team}#${quotationHeaderId}`,
          {
            initialValue: val,
            rules: [
              {
                validator: inputValidator,
              },
            ],
          }
        )(mean)}
      </Form.Item>
    );
  }

  @Bind()
  handleSupplierChildren(dataSource) {
    const { exportScoringBuss } = this.props;
    let elementColumns = [];
    elementColumns =
      dataSource[0].evaluateScoreDTOS &&
      dataSource[0].evaluateScoreDTOS.map((item) => {
        return {
          dataIndex: `${item.supplierCompanyName}`,
          title:
            item.expensesFlag === 1 ? (
              <span>
                {`${item.supplierCompanyName}`}
                {exportScoringBuss
                  ? exportScoringBuss.render(
                      'SSRC_EXPERT_SCORING_BUSS_RENDER_EXPERT_BUSS_DEVIATE_EXPENSE',
                      null,
                      {
                        supplier: item,
                      }
                    )
                  : null}
                {
                  <span style={{ color: 'red' }}>
                    {`(${intl
                      .get('ssrc.expertScoring.model.expertScoring.noPayBond')
                      .d('未缴保证金')})`}
                  </span>
                }
              </span>
            ) : (
              <span>
                {item.supplierCompanyName}
                {exportScoringBuss
                  ? exportScoringBuss.render(
                      'SSRC_EXPERT_SCORING_BUSS_RENDER_EXPERT_BUSS_DEVIATE',
                      null,
                      {
                        supplier: item,
                      }
                    )
                  : null}
              </span>
            ),
          width: 250,
          render: (val, record) => this.handleColCalculate(val, record, 'children', item),
        };
      });
    return elementColumns;
  }

  /**
   * 计算Table单元格缩进
   *
   * @param {*} val
   * @param {*} record
   * @param {*} info
   */
  @Bind()
  handleColCalculate(val, record, info, supplierChildrenItem) {
    let colSpan = {};
    let mean = '';
    const {
      scoreElementList: { evaluateScoreLineDTOS = [] },
      exportScoringBuss,
    } = this.props;
    // elementNumberX 供应商个数
    const elementNumberX =
      evaluateScoreLineDTOS &&
      evaluateScoreLineDTOS[0] &&
      evaluateScoreLineDTOS[0].evaluateScoreDTOS
        ? evaluateScoreLineDTOS[0].evaluateScoreDTOS.length
        : 0;

    let childrenFieldEdit =
      (isUndefined(record.indicateNameFlag) && !record.indicateNameFlag) ||
      record.expertSuggestionFlag;
    childrenFieldEdit = exportScoringBuss
      ? exportScoringBuss.render('SSRC_EXPERT_SCORING_DYNAMIC_COLUMN_EDIT', childrenFieldEdit, {
          that: this,
          val,
          record,
          info,
          supplierChildrenItem,
          elementNumberX,
        })
      : childrenFieldEdit;

    switch (info) {
      case 'indicateName':
        mean =
          !isUndefined(record.indicateNameFlag) && record.indicateNameFlag ? (
            <span style={{ fontWeight: 'bold' }}>{val}</span>
          ) : (
            <span>
              {
                <Popover placement="topLeft" content={val}>
                  {val}
                </Popover>
              }
            </span>
          );
        break;
      case 'indicateRemark':
        mean = (
          <Popover
            placement="topLeft"
            content={val}
            overlayClassName={styles['indicateRemark-popover']}
          >
            <span className={styles['indicateRemark-span']}>{val}</span>
          </Popover>
        );
        break;
      case 'betweenScore':
        mean =
          record.indicateType === 'SCORE'
            ? scoreIntervalRender(record.minScore, record.maxScore)
            : '';
        break;
      case 'children':
        mean = childrenFieldEdit ? (
          this.renderSupplierScore(val, record, supplierChildrenItem)
        ) : (
          <span
            style={{
              fontWeight: 'bold',
              marginLeft: 8,
              color:
                record[`${supplierChildrenItem?.supplierCompanyName}Flag`] === 'UN_PASS'
                  ? 'red'
                  : '',
            }}
          >
            {val}
          </span>
        );
        break;
      default:
        break;
    }
    if (!isUndefined(record.indicateNameFlag)) {
      if (record.indicateNameFlag) {
        colSpan = {
          children: mean,
          props: {
            colSpan: info === 'indicateName' ? 3 : info === 'children' ? 1 : 0,
          },
        };
      } else {
        colSpan = {
          children: mean,
          props: {
            colSpan: info === 'indicateName' ? elementNumberX + 3 : 0,
          },
        };
      }
    } else {
      colSpan = {
        children: mean,
      };
    }
    return colSpan;
  }

  renderSupplierTitle = (list) => {
    if (!list || !list.length) {
      return intl.get(`ssrc.expertScoring.model.expertScoring.supplierScore`).d('供应商分数');
    }

    switch (list[0].supplierScoreTitle) {
      case 'SCORE':
        return intl.get(`ssrc.expertScoring.model.expertScoring.supplierScore`).d('供应商分数');
      case 'SCORE_PASS':
        return `${intl
          .get(`ssrc.expertScoring.model.expertScoring.supplierScore`)
          .d('供应商分数')}(${intl
          .get(`ssrc.expertScoring.model.expertScoring.passStatus`)
          .d('是否通过')})`;
      case 'PASS':
        return intl.get(`ssrc.expertScoring.model.expertScoring.passStatus`).d('是否通过');
      default:
        return intl.get(`ssrc.expertScoring.model.expertScoring.supplierScore`).d('供应商分数');
    }
  };

  /**
   * 一个供应商对应多个评分要素
   * 前几列固定为评分要素列，其他的是供应商列，非固定
   * @param {*} [dataSource=[]]
   * @returns
   * @memberof ScoreElementTable
   */
  renderColumns = (dataSource = []) => {
    let elementColumns = [];
    if (!isEmpty(dataSource)) {
      // elementNumberX 供应商个数
      const elementNumberX =
        dataSource && dataSource[0] && dataSource[0].evaluateScoreDTOS
          ? dataSource[0].evaluateScoreDTOS.length
          : 0;

      // 同步开标
      elementColumns = [
        {
          dataIndex: 'supplierScore',
          title: this.renderSupplierTitle(dataSource),
          children: this.handleSupplierChildren(dataSource),
          width: elementNumberX * 250 || 120,
        },
      ];
      elementColumns.push({
        dataIndex: 'weight',
        title: intl.get(`${PROMPT_CODE}.model.expertScoring.weight`).d('权重'),
        width: 80,
        render: (val, record) =>
          record.indicateType === 'PASS' ? '' : record.weight ? `${record.weight}%` : '',
      });
      return [
        {
          dataIndex: 'indicateName',
          title: intl.get(`${PROMPT_CODE}.model.expertScoring.elementsItems`).d('要素细项'),
          width: 150,
          render: (val, record) => this.handleColCalculate(val, record, 'indicateName'),
        },
        {
          dataIndex: 'detail',
          title: intl.get(`${PROMPT_CODE}.model.expertScoring.detail`).d('评分细则'),
          width: 150,
          render: (val, record) => this.handleColCalculate(val, record, 'indicateRemark'),
        },
        {
          dataIndex: 'betweenScore',
          title: intl.get(`${PROMPT_CODE}.model.expertScoring.betweenScore`).d('评分区间'),
          width: 80,
          render: (val, record) =>
            record.indicateType === 'PASS'
              ? ''
              : this.handleColCalculate(val, record, 'betweenScore'),
        },
        ...elementColumns,
      ];
    } else {
      return elementColumns;
    }
  };

  render() {
    const {
      scoreElementList: { evaluateScoreLineDTOS = [] },
      scoreElementList,
      loading,
      customizeTable,
      scoredStatus,
      tableKey,
      exportScoringBuss,
    } = this.props;
    // elementNumberX 供应商个数
    const elementNumberX =
      evaluateScoreLineDTOS &&
      evaluateScoreLineDTOS[0] &&
      evaluateScoreLineDTOS[0].evaluateScoreDTOS
        ? evaluateScoreLineDTOS[0].evaluateScoreDTOS.length
        : 0;
    const scrollX =
      elementNumberX && Math.ceil(elementNumberX / 2) > 1 && elementNumberX * 250 + 550;

    let selectBidWarningNode = (
      <div className={styles.supplierList}>
        <span className={styles.supplierTip}>
          {intl
            .get(`${PROMPT_CODE}.model.expertScoring.selectNotBid`)
            .d('如需选择无效投标供应商或查看评审澄清，请切换至供应商维度进行操作！')}
        </span>
      </div>
    );

    selectBidWarningNode = exportScoringBuss
      ? exportScoringBuss.process(
          'SSRC_EXPERT_SCORING_BUSS_PROCESS_SCOREELEMENT_SELECTDIMENSIONWARNINGNODE',
          selectBidWarningNode,
          {
            that: this,
          }
        )
      : selectBidWarningNode;

    return (
      <React.Fragment>
        {selectBidWarningNode}
        {customizeTable(
          {
            code:
              scoredStatus === 'SCORED'
                ? 'SSRC.EXPERT_SCORE_SCORING.ELEMENT_LINE_DETAIL_RFX'
                : 'SSRC.EXPERT_SCORE_SCORING.ELEMENT_LINE_EDIT_RFX',
          },
          <EditTable
            bordered
            className={tableKey}
            loading={loading}
            columns={this.renderColumns(evaluateScoreLineDTOS)}
            rowKey="index"
            dataSource={this.renderDataSource(scoreElementList) || []}
            pagination={false}
            scroll={{ x: scrollX, y: getContentScrollHeight(30, false, tableKey) }}
          />
        )}
      </React.Fragment>
    );
  }
}
