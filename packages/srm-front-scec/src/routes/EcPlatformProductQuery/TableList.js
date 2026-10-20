/**
 * TableList -平台电商商品查询
 * @date: 2019-6-26
 * @author LH <heng.liu@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
import { numberRender } from 'utils/renderer';
import { Table } from 'hzero-ui';

import intl from 'utils/intl';

@withRouter
export default class TableList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // 显示保留小数点后两位小数
  @Bind()
  toFixedTax(data = '') {
    if (data === null) {
      return '';
    } else {
      const taxData = numberRender(data, 2, false);
      return taxData;
    }
  }

  render() {
    const { loading, onFetchGoods, pagination, list, preview } = this.props;
    const columns = [
      {
        title: intl.get('scec.common.model.productNum').d('商品编码'),
        dataIndex: 'ecProductNum',
        width: 100,
      },
      {
        title: intl.get('scec.common.model.productName').d('商品名称'),
        dataIndex: 'ecProductName',
        width: 180,
        render: (_, record) => {
          return <span title={record.ecProductName}>{record.ecProductName}</span>;
        },
      },
      {
        title: intl.get('scec.common.model.ecPlatformName').d('电商名称'),
        dataIndex: 'ecPlatformName',
        width: 90,
      },
      {
        title: intl.get('scec.ecCategoryPlatformCatalog.model.ecCategoryName').d('电商分类名称'),
        dataIndex: 'ecCategoryName',
        width: 110,
      },
      {
        title: intl.get('scec.ecCategoryPlatformCatalog.model.mappingStatus').d('映射状态'),
        dataIndex: 'mappingFlag',
        render: value => {
          return value === 0
            ? intl.get('scec.ecCategoryPlatformCatalog.model.noMapping').d('未映射')
            : intl.get('scec.ecCategoryPlatformCatalog.model.hadMapping').d('已映射');
        },
        width: 80,
      },
      {
        title: intl.get('scec.common.model.platformDirectoryName').d('平台目录名称'),
        dataIndex: 'catalogName',
        width: 100,
      },
      {
        title: intl.get('scec.common.model.supplier').d('供应商'),
        dataIndex: 'ecCompanyName',
        width: 110,
        render: (_, record) => {
          return <span title={record.ecCompanyName}>{record.ecCompanyName}</span>;
        },
      },
      {
        title: intl.get('scec.common.model.negotiatedPrice').d('协议价'),
        dataIndex: 'agreementPrice',
        width: 80,
        align: 'right',
        render: val => {
          return <span>{this.toFixedTax(val)}</span>;
        },
      },
      {
        title: intl.get('scec.common.model.electricityPrice').d('电商价'),
        dataIndex: 'ecPrice',
        width: 80,
        align: 'right',
        render: val => {
          return <span>{this.toFixedTax(val)}</span>;
        },
      },
      {
        title: intl.get('scec.common.model.uomName').d('单位'),
        dataIndex: 'wareQd',
        width: 50,
      },
      {
        title: intl.get('scec.common.model.onState').d('上架状态'),
        dataIndex: 'shelfFlag',
        render: value => {
          return value === 1
            ? intl.get('scec.common.model.hadAdded').d('已上架')
            : intl.get('scec.common.model.noAdded').d('未上架');
        },
        width: 80,
      },
      {
        title: intl.get('scec.common.model.button.action').d('操作'),
        dataIndex: '_edit',
        width: 80,
        render: (_, record) => {
          return (
            <a
              onClick={() => {
                preview(record);
              }}
            >
              {intl.get('scec.customBar.model.customBar.preview').d('预览')}
            </a>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <Table
          pagination={pagination}
          rowKey="ecProductNum"
          dataSource={list.content || []}
          columns={columns}
          scroll={{ x: 1650 }}
          loading={loading}
          bordered
          onChange={page => onFetchGoods(page)}
        />
      </React.Fragment>
    );
  }
}
