/**
 * 要素维度 - 初步评审(暂不包含招投标)
 * @date: 2020-12-28
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Form, Select, Popover } from 'hzero-ui';
import { isEmpty, isFunction, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import { getContentScrollHeight } from '@/utils/utils';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';

const promptCode = 'ssrc.expertScoring';

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
    const { evaluateScoreTotal = [], evaluateScoreLineDTOS = [] } = scoreElementList;
    const supplierDataSource = evaluateScoreLineDTOS.map((item) => {
      let elementValue = {};
      const { evaluateScoreDTOS = [], evaluateScoreLineDetailS = [], ...otherItem } = item;
      const { detailEnabledFlag = 0 } = otherItem;
      if (detailEnabledFlag) {
        // 二级要素flag
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
              indicateId,
              indicateType,
              indicateName,
              detail,
              evaluateIndicId,
              [elements.supplierCompanyName]: elements.passStatus,
            };
          });
          return elementDetail;
        });
        detailEnabledSource.unshift({
          indicateNameFlag: 0,
          indicateName: otherItem.indicateName,
        });
        detailEnabledSource.push(subtotalDataSource);
        return detailEnabledSource;
      } else {
        // 一级要素
        evaluateScoreDTOS.forEach((elementItem) => {
          elementValue = {
            ...elementValue,
            [elementItem.supplierCompanyName]: elementItem.passStatus,
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
        [totalItem.supplierCompanyName]: totalItem.reviewResultMeaning,
        indicateName: intl.get('ssrc.expertScoring.view.message.reviewResult').d('评审结果'),
      };
    });
    supplierDataSource.push(totalDataSource);
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
   * 渲染供应商列
   */
  @Bind()
  renderSupplierField(val, record, quotationHeaderId, scoreStatus) {
    const {
      bidLineItemId,
      code: { detailApprovedStatus = [] },
    } = this.props;
    let mean = '';
    // indicateType为通过制
    mean = (
      <Select
        disabled={scoreStatus === 'SCORED'}
        allowClear
        style={{ width: '100%' }}
        onChange={this.handleScoreStatus}
      >
        {detailApprovedStatus &&
          detailApprovedStatus.map((n) => (
            <Select.Option value={n.value} key={n.value}>
              {n.meaning}
            </Select.Option>
          ))}
      </Select>
    );
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
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl
                    .get(`${promptCode}.model.expertScoring.supplierPassedFlag`)
                    .d('供应商是否通过'),
                }),
              },
            ],
          }
        )(mean)}
      </Form.Item>
    );
  }

  @Bind()
  handleSupplierChildren(dataSource) {
    let elementColumns = [];
    elementColumns =
      dataSource[0].evaluateScoreDTOS &&
      dataSource[0].evaluateScoreDTOS.map((item) => {
        return {
          dataIndex: `${item.supplierCompanyName}`,
          title: item.supplierCompanyName,
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
    } = this.props;
    // elementNumberX 供应商个数
    const elementNumberX =
      evaluateScoreLineDTOS &&
        evaluateScoreLineDTOS[0] &&
        evaluateScoreLineDTOS[0].evaluateScoreDTOS
        ? evaluateScoreLineDTOS[0].evaluateScoreDTOS.length
        : 0;
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
          <Popover placement="topLeft" content={val}>
            {val}
          </Popover>
        );
        break;
      case 'children':
        mean =
          isUndefined(record.indicateNameFlag) && !record.indicateNameFlag ? (
            this.renderSupplierField(
              val,
              record,
              supplierChildrenItem.quotationHeaderId,
              supplierChildrenItem.scoreStatus
            )
          ) : (
            <span style={{ fontWeight: 'bold', marginLeft: 8 }}>{val}</span>
          );
        break;
      default:
        break;
    }
    if (!isUndefined(record.indicateNameFlag)) {
      if (record.indicateNameFlag) {
        // flag => 1
        colSpan = {
          children: mean,
          props: {
            colSpan: info === 'indicateName' ? 2 : info === 'children' ? 1 : 0,
          },
        };
      } else {
        // flag => 0
        colSpan = {
          children: mean,
          props: {
            colSpan: info === 'indicateName' ? elementNumberX + 2 : 0,
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

  /**
   * 一个供应商对应多个评分要素
   * 前几列固定为评分要素列，其他的是供应商列，非固定
   * @param {*} [dataSource=[]]
   * @returns
   * @memberof ScoreElementTable
   */
  renderColumns(dataSource = []) {
    let elementColumns = [];
    if (!isEmpty(dataSource)) {
      // 同步开标
      elementColumns = [
        {
          dataIndex: 'supplierScore',
          title: intl.get(`${promptCode}.model.expertScoring.passedFlag`).d('是否通过'),
          children: this.handleSupplierChildren(dataSource),
        },
      ];
      return [
        {
          dataIndex: 'indicateName',
          title: intl.get(`${promptCode}.model.expertScoring.elementsItems`).d('要素细项'),
          width: 150,
          render: (val, record) => this.handleColCalculate(val, record, 'indicateName'),
        },
        {
          dataIndex: 'detail',
          title: intl.get(`${promptCode}.model.expertScoring.detail`).d('评分细则'),
          width: 150,
          render: (val, record) => this.handleColCalculate(val, record, 'indicateRemark'),
        },
        ...elementColumns,
      ];
    } else {
      return elementColumns;
    }
  }

  render() {
    const {
      scoreElementList: { evaluateScoreLineDTOS = [] },
      scoreElementList,
      loading,
      customizeTable,
      reviewScoredStatus,
    } = this.props;
    // elementNumberX 供应商个数
    const elementNumberX =
      evaluateScoreLineDTOS &&
        evaluateScoreLineDTOS[0] &&
        evaluateScoreLineDTOS[0].evaluateScoreDTOS
        ? evaluateScoreLineDTOS[0].evaluateScoreDTOS.length
        : 0;
    const scrollX =
      elementNumberX && Math.ceil(elementNumberX / 2) > 1 && elementNumberX * 220 + 550;
    return customizeTable(
      {
        code:
          reviewScoredStatus === 'SCORED'
            ? 'SSRC.EXPERT_SCORE_REVIEW.ELEMENT_LINE_DETAIL'
            : 'SSRC.EXPERT_SCORE_REVIEW.ELEMENT_LINE_EDIT',
      },
      <EditTable
        bordered
        loading={loading}
        columns={this.renderColumns(evaluateScoreLineDTOS)}
        rowKey="index"
        dataSource={this.renderDataSource(scoreElementList) || []}
        pagination={false}
        // scroll={{ x: scrollX }}
        scroll={{ x: scrollX, y: getContentScrollHeight(30, false, false) }}
      />
    );
  }
}
