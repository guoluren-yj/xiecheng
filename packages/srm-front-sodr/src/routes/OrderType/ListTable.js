/*
 * ListTable - 采购订单类型列表
 * @date: 2018/08/07 14:49:19
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Table, Badge, Icon, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber } from 'lodash';

import intl from 'utils/intl';
// import { enableRender } from 'utils/renderer';

/**
 * 采购订单类型列表
 * @extends {Component} - React.Component
 * @reactProps {Function} editRow 修改行
 * @reactProps {Function} handleSave 保存行
 * @reactProps {Function} deleteRow 删除行
 * @reactProps {Function} cancelRow 取消行
 * @reactProps {Function} 取消行handleLovOnChange Lov发生改变的回调
 * @reactProps {Object} form 表单
 * @return React.element
 */
export default class ListTable extends Component {
  /**
   * 打开编辑弹窗
   * @param {Object} record
   */
  @Bind()
  showEditModal(record) {
    if (this.props.showEditModal) {
      this.props.showEditModal(record);
    }
  }

  /**
   * 渲染是否
   * @param {Boolean} v
   */
  @Bind()
  yesOrNoRender(v = 0) {
    const statusMap = ['default', 'success'];
    return (
      <Badge
        status={statusMap[v]}
        text={v === 1 ? intl.get('hzero.common.status.yes') : intl.get('hzero.common.status.no')}
      />
    );
  }

  render() {
    const { loading, dataSource, pagination, customizeTable } = this.props;
    const columns = [
      {
        title: intl.get(`entity.order.type.code`).d('订单类型编码'),
        dataIndex: 'orderTypeCode',
        width: 150,
      },
      {
        title: intl.get(`entity.order.type.name`).d('订单类型名称'),
        dataIndex: 'orderTypeName',
        width: 220,
      },
      {
        title: intl.get(`sodr.orderType.model.orderType.orderSeq`).d('排序号'),
        dataIndex: 'orderSeq',
        width: 80,
      },
      {
        title: intl.get(`sodr.common.model.common.sourceCode`).d('来源系统'),
        width: 100,
        dataIndex: 'dataSourceCodeMeaning',
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 80,
        render: this.yesOrNoRender,
      },
      {
        title: intl.get(`sodr.orderType.model.orderType.returnOrderFlag`).d('退货订单'),
        dataIndex: 'returnOrderFlag',
        width: 100,
        render: this.yesOrNoRender,
      },
      {
        title: intl.get(`sodr.orderType.model.orderType.outsourceOrderFlag`).d('委外订单'),
        dataIndex: 'outsourceOrderFlag',
        width: 100,
        render: this.yesOrNoRender,
      },
      {
        title: (
          <>
            {intl.get(`sodr.orderType.model.orderType.fixedAssetsFlag`).d('固定资产订单')}
            <Tooltip
              title={intl
                .get('sodr.orderType.model.orderType.fixedAssetsFlagTooltip')
                .d('开启该配置，则所有订单行默认为固定资产行，订单提交将校验固定资产行数量必须为1')}
            >
              <Icon type="question-circle-o" />
            </Tooltip>
          </>
        ),
        dataIndex: 'fixedAssetsFlag',
        width: 130,
        render: this.yesOrNoRender,
      },
      {
        title: intl.get(`sodr.orderType.model.orderType.createDeliveryFlag`).d('可创建送货单'),
        dataIndex: 'createDeliveryFlag',
        width: 110,
        render: this.yesOrNoRender,
      },
      {
        title: intl.get(`sodr.orderType.model.orderType.defaultFlag`).d('是否默认'),
        dataIndex: 'defaultFlag',
        width: 100,
        render: this.yesOrNoRender,
      },
      {
        title: intl.get(`sodr.orderType.model.orderType.linkOrderTypeCode`).d('关联平台级类型'),
        dataIndex: 'linkOrderTypeName',
        // width: 150,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 80,
        fixed: 'right',
        render: (val, record) => (
          <a
            onClick={() => {
              this.showEditModal(record);
            }}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 300;
    return customizeTable(
      {
        code: 'SODR.ORDER_TYPE.LIST.ORDER_GRID',
      },
      <Table
        bordered
        loading={loading}
        rowKey="orderTypeId"
        columns={columns}
        scroll={{ x: scrollX }}
        dataSource={dataSource}
        pagination={pagination}
      />
    );
  }
}
