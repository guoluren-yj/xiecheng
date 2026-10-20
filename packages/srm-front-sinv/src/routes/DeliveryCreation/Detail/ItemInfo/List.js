/**
 * List - 送货单创建 - 汇总tab列表组件
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import { sum } from 'lodash';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import { showBigNumber } from '@/routes/components/utils';

/**
 * List - 业务组件 - 送货单创建 - 送货单创建汇总tab内容列表
 * @extends {Component} - React.Component
 * @reactProps {function} [ref= (e => e)] - react ref属性
 * @reactProps {boolean} [loading=false] - 表格处理状态
 * @reactProps {function} [onChange= (e => e)] - 表格onChange事件
 * @reactProps {object} [pagination={}] - 分页数据
 * @reactProps {Array<Object>} [dataSource=[]] - 表格数据源
 * @reactProps {object} [rowSelection={}] - 表格选择框配置
 * @return React.element
 */
export default class List extends PureComponent {
  constructor(props) {
    super(props);
    // 方法注册
    ['onCell'].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  // defaultTableRowKey = 'poLineLocationId';
  defaultTableRowKey = 'index';

  /**
   * onCell - 设置表格单元格属性函数
   */
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 180,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: (e) => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  render() {
    const { dataSource = [], rowKey, ...others } = this.props;
    const tableProps = {
      dataSource,
      columns: [
        {
          title: intl.get(`sinv.common.model.common.customerItemCode`).d('客户物料编码'),
          width: 150,
          dataIndex: 'itemCode',
          fixed: 'left',
          onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.customerItemName`).d('客户物料名称'),
          width: 160,
          dataIndex: 'itemName',
          fixed: 'left',
          onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.quantity`).d('订单数量'),
          dataIndex: 'quantity',
          width: 100,
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.common.model.common.canAsnQuantity`).d('可发货数量'),
          dataIndex: 'canAsnQuantity',
          width: 120,
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.common.model.common.uomName`).d('单位'),
          dataIndex: 'uomName',
          width: 120,
          onCell: this.onCell,
          render: (_val, record) =>
            record.uomName && record.uomCode ? (
              <span>{`${record.uomCode}/${record.uomName}`}</span>
            ) : null,
        },
        {
          title: intl.get(`sinv.common.model.common.displayPoNum`).d('订单号'),
          dataIndex: 'displayPoNum',
          width: 120,
          onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号'),
          dataIndex: 'displayLineNum',
          width: 120,
          onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.displayLineLocationNum`).d('发运号'),
          dataIndex: 'displayLineLocationNum',
          width: 120,
          onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.displayReleaseNum`).d('发放号'),
          dataIndex: 'releaseNum',
          width: 120,
          onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.versionNum`).d('版本号'),
          dataIndex: 'versionNum',
          width: 120,
        },

        {
          title: intl.get(`sinv.common.model.common.neededDate`).d('需求日期'),
          dataIndex: 'needByDate',
          width: 120,
          render: dateRender,
        },
        {
          title: intl.get(`sinv.common.model.common.promisedDate`).d('承诺日期'),
          dataIndex: 'promiseDeliveryDate',
          width: 120,
          render: dateRender,
        },
        {
          title: intl.get(`entity.customer.tag`).d('客户'),
          dataIndex: 'companyName',
          width: 180,
          onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.actualReceiverName`).d('送达方'),
          dataIndex: 'shipToThirdPartyName',
          width: 180,
          onCell: this.onCell,
        },
      ],
      rowKey: this.defaultTableRowKey,
      bordered: true,
      ...others,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) };
    return <Table {...tableProps} />;
  }
}
