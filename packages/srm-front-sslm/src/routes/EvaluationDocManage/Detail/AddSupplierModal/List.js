/**
 *
 * @date: 2020/6/17
 * @author: zhanghao <hao.zhang07@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Button } from 'choerodon-ui/pro';

import EditTable from 'srm-front-boot/lib/components/EditTable';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

/**
 * List - 供应商绩效标准指标定义 - 列表组件
 * @extends {Component} - React.Component
 * @reactProps {function} [ref= (e => e)] - react ref属性
 * @reactProps {boolean} [loading=false] - 表格处理状态
 * @reactProps {function} [onChange= (e => e)] - 表格onChange事件
 * @reactProps {object} [pagination={}] - 分页数据
 * @reactProps {Array<Object>} [dataSource=[]] - 表格数据源
 * @reactProps {object} [rowSelection={}] - 表格选择框配置
 * @return React.element
 */
@formatterCollections({ code: ['sslm.evaluationTemplate'] })
export default class List extends PureComponent {
  /**
   * onCell - 设置表格单元格属性函数
   */
  @Bind()
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 180,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  /**
   * 全选按钮处理逻辑
   */
  @Bind()
  handleSelect() {
    const { handleSelectAll = () => {} } = this.props;
    handleSelectAll();
  }

  render() {
    const {
      loading,
      onChange,
      pagination,
      dataSource,
      rowSelection = {},
      defaultTableRowKey,
      customizeTable = () => {},
      selectAllFlag = 0,
    } = this.props;
    const tableProps = {
      style: { marginBottom: 20 },
      dataSource,
      columns: [
        {
          title: intl
            .get('sslm.evaluationTemplate.view.supplier.platformSupplierCode')
            .d('平台供应商编码'),
          dataIndex: 'companyNum',
          width: 140,
          onCell: this.onCell,
        },
        {
          title: intl
            .get('sslm.evaluationTemplate.view.supplier.platformSupplierName')
            .d('平台供应商名称'),
          dataIndex: 'companyName',
          width: 180,
          onCell: this.onCell,
        },
        {
          title: intl
            .get('sslm.evaluationTemplate.view.supplier.erpSupplierCode')
            .d('ERP供应商编码'),
          dataIndex: 'erpSupplierNum',
          width: 140,
          onCell: this.onCell,
        },
        {
          title: intl
            .get('sslm.evaluationTemplate.view.supplier.erpSupplierName')
            .d('ERP供应商名称'),
          dataIndex: 'erpSupplierName',
          width: 180,
          onCell: this.onCell,
        },
        {
          title: intl.get('sslm.evaluationTemplate.model.evalTemplate.purchaseAgent').d('采购员'),
          dataIndex: 'purchaseAgentNameJoint',
          width: 180,
          onCell: this.onCell,
        },
      ],
      rowKey: defaultTableRowKey,
      bordered: true,
      loading,
      onChange,
      pagination,
      rowSelection,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map(n => n.width)) };
    return (
      <Fragment>
        <div>
          <Button funcType="flat" color="primary" onClick={this.handleSelect}>
            {selectAllFlag === 0
              ? intl.get('hzero.common.button.selectAll').d('全选')
              : intl.get('sslm.supplierDocManage.view.button.unSelectAll').d('取消全选')}
          </Button>
        </div>
        {customizeTable(
          {
            code: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREVENDOR_ADDMODAL',
          },
          <EditTable {...tableProps} />
        )}
      </Fragment>
    );
  }
}
