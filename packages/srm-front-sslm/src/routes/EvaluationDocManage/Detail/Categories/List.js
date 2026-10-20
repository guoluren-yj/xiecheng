/**
 *
 * @date: 2020/6/18
 * @author: zhanghao <hao.zhang07@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import { sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

@formatterCollections({ code: ['sslm.supplierDocManage'] })
@connect(({ evaluationDocManage, loading }) => ({
  evaluationDocManage,
  EvalTplScopeCategoryListLoading:
    loading.effects['evaluationDocManage/queryEvalTplScopeCategoryList'],
}))
export default class List extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

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
    const {
      evaluationDocManage: { evalTplScopeCategoryList = {}, evalTplScopeItemList = {} },
      EvalTplScopeCategoryListLoading,
      onTableRowSelectChange,
      granularity,
      onChange,
    } = this.props;
    const DataSource = granularity === 'SU+CA' ? evalTplScopeCategoryList : evalTplScopeItemList;
    const columns =
      granularity === 'SU+CA'
        ? [
            {
              title: intl.get(`sslm.supplierDocManage.model.docManage.productCode`).d('品类编码'),
              dataIndex: 'categoryCode',
              width: 150,
              onCell: this.onCell,
            },
            {
              title: intl.get(`sslm.supplierDocManage.model.docManage.categoryName`).d('品类名称'),
              dataIndex: 'categoryName',
              width: 180,
              onCell: this.onCell,
            },
          ]
        : [
            {
              title: intl.get('sslm.supplierDocManage.model.docManage.itemNum').d('物料编码'),
              dataIndex: 'itemCode',
              width: 150,
              onCell: this.onCell,
            },
            {
              title: intl.get(`sslm.supplierDocManage.model.docManage.itemName`).d('物料名称'),
              dataIndex: 'itemName',
              width: 180,
              onCell: this.onCell,
            },
          ];
    const tableProps = {
      ...DataSource,
      columns,
      rowKey: granularity === 'SU+CA' ? 'categoryId' : 'itemId',
      bordered: true,
      loading: EvalTplScopeCategoryListLoading,
      rowSelection: {
        onChange: onTableRowSelectChange,
      },
      onChange,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) };
    return <Table {...tableProps} />;
  }
}
