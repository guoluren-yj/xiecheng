/*
 * ListTable - 我收到的计划单
 * @date: 2019/12/11 15:04:50
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Fragment } from 'react';
import { Form, InputNumber, Table } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { dateRender } from 'utils/renderer';
import { formatAumont } from '../../components/utils';
@Form.create({ fieldNameProp: null })
export default class ListTable extends React.Component {
  @Bind()
  renderPlanNum(val, record, index) {
    return (
      <Form.Item>
        {this.props.form.getFieldDecorator(`${record}#key${index + 1}#${record.planLineId}`, {
          initialValue: val,
        })(
          <InputNumber
            min={0}
            onChange={(text) => this.handleChangePlanData(text, record, index)}
          />
        )}
      </Form.Item>
    );
  }

  /**
   * 渲染动态列表格数据源
   *
   * @param {*} [dataSource=[]]
   * @returns
   */
  @Bind()
  renderDataSource(dataSource = []) {
    if (dataSource.length > 0) {
      const planDataSource = dataSource.map((item) => {
        let elementValue = {};
        const { scheduleDetailList = [], ...otherItem } = item;
        scheduleDetailList.forEach((elementItem) => {
          elementValue = {
            ...elementValue,
            [`key${elementItem.key}`]: elementItem.planQuantity,
          };
        });
        return {
          ...otherItem,
          ...elementValue,
        };
      });
      return planDataSource;
    } else {
      return [];
    }
  }

  /**
   * 动态列
   */
  @Bind()
  renderPlanCol(dataSource) {
    if (dataSource.length !== 0) {
      let childrenColumns = [];
      childrenColumns =
        dataSource[0].scheduleDetailList &&
        dataSource[0].scheduleDetailList.map((item) => {
          return {
            dataIndex: `key${item?.key}`,
            title: dateRender(item?.planDate),
            width: 200,
            // render: (val, record) => this.renderPlanNum(val, record, index),
          };
        });
      return childrenColumns;
    }
  }

  @Bind()
  handleChangeData(value, record, index) {
    const { dispatch, dataSource } = this.props;
    dataSource[index].planQuantity = value;
    dispatch({
      type: 'planSheet/updateState',
      payload: { planDataSource: dataSource },
    });
  }

  @Bind()
  handleChangePlanData(value, record, colIndex) {
    // value 为当前值
    const { dispatch, dataSource } = this.props;
    const index = dataSource.findIndex((e) => e?.planLineId === record?.planLineId);
    const keys = `key${colIndex + 1}`;
    dataSource[index][keys] = value;
    dispatch({
      type: 'planSheet/updateState',
      payload: { planDataSource: dataSource },
    });
  }

  @Bind()
  getColumns(dataSource) {
    const columns = [
      {
        title: intl.get(`sodr.common.model.common.orderSeq`).d('序号'),
        dataIndex: 'serialLineNum',
        width: 90,
      },
      {
        title: intl.get(`sodr.common.model.common.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.unitName`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.needQuantity`).d('需求数量'),
        dataIndex: 'quantity',
        width: 100,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get(`sodr.common.model.common.readyPlanQuantity`).d('可计划数量'),
        dataIndex: 'readyPlanQuantity',
        width: 130,
      },
      {
        title: intl.get(`sodr.common.model.common.planQuantity`).d('本次计划数量'),
        dataIndex: 'planQuantity',
        width: 140,
      },
      {
        title: this.planTitle(),
        children: this.renderPlanCol(dataSource),
      },
      {
        title: intl.get(`sodr.common.model.common.displayPoNum`).d('订单号'),
        dataIndex: 'displayPoNum',
        width: 180,
      },
      {
        title: intl.get(`sodr.common.model.common.poLineId`).d('订单行号'),
        dataIndex: 'lineNum',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.orderDisplayLineLocationNum`).d('订单发运号'),
        dataIndex: 'lineLocationNum',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.purchaserRemark1`).d('采购方备注'),
        dataIndex: 'purchaserRemark',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.supplierRemark`).d('供应商备注'),
        dataIndex: 'supplierRemark',
        width: 150,
      },
    ];
    return columns;
  }

  /**
   * 计划单动态title
   */
  @Bind()
  planTitle() {
    const { planDetailHeader = {} } = this.props;
    let title;
    switch (planDetailHeader.planningCycle) {
      case 'WEEK':
        title = intl.get(`sodr.common.model.common.weekPlan`).d('周度计划排程数量');
        break;
      case 'DOUBLE_WEEK':
        title = intl.get(`sodr.common.model.common.doubleWeekPlan`).d('双周计划排程数量');
        break;
      case 'MONTH':
        title = intl.get(`sodr.common.model.common.monthPlan`).d('月度计划排程数量');
        break;
      default:
        title = intl.get(`sodr.common.model.common.weekPlan`).d('周度计划排程数量');
        break;
    }
    return title;
  }

  render() {
    const { dataSource = [], renderDataSource } = this.props;
    const columns = this.getColumns(dataSource);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 1000;
    return (
      <Fragment>
        <Table
          // loading={loading}
          rowKey="planLineId"
          bordered
          scroll={{ x: scrollX }}
          columns={columns}
          // dataSource={dataSource}
          dataSource={renderDataSource(dataSource) || []}
        />
      </Fragment>
    );
  }
}
