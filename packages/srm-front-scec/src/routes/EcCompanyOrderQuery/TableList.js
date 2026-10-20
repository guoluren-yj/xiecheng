/**
 * ecCompanyOrderQuery -订单查询 -table
 * @date: 2019-08-27
 * @author  <xia.li05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Table } from 'hzero-ui';
import { numberRender } from 'utils/renderer';
import intl from 'utils/intl';

const modelPrompt = 'scec.ecCompanyOrderQuery.model';

export default class TableList extends Component {
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
    const { onChange, pagination, loading, dataSource } = this.props;
    const columns = [
      {
        title: intl.get(`${modelPrompt}.tenant`).d('租户'),
        dataIndex: 'tenantName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.username`).d('用户名'),
        dataIndex: 'loginName',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.receivert`).d('收货人'),
        dataIndex: 'receivingContactName',
        width: 80,
      },
      {
        title: intl.get(`${modelPrompt}.productName`).d('商品名称'),
        dataIndex: 'ecProductName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.productNumber`).d('商品编号'),
        dataIndex: 'ecProductNum',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.e-commerceDirectoryName`).d('电商目录名称'),
        dataIndex: 'ecCategoryName',
        width: 110,
      },
      {
        title: intl.get(`${modelPrompt}.electronicBusinessPlatform`).d('电商平台'),
        dataIndex: 'ecPlatformName',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.quantity`).d('数量'),
        dataIndex: 'quantity',
        width: 60,
        render: text => text && parseInt(text, 0),
      },
      {
        title: intl.get(`${modelPrompt}.unitPrice`).d('单价'),
        dataIndex: 'price',
        align: 'right',
        width: 70,
        render: val => {
          return <span>{this.toFixedTax(val)}</span>;
        },
      },
      {
        title: intl.get(`${modelPrompt}.orderAmount`).d('订单金额'),
        dataIndex: 'orderAmount',
        align: 'right',
        width: 90,
        render: val => {
          return <span>{this.toFixedTax(val)}</span>;
        },
      },
      {
        title: intl.get(`${modelPrompt}.agreementPrice`).d('协议价'),
        dataIndex: 'agreementPrice',
        align: 'right',
        width: 70,
        render: val => {
          return <span>{this.toFixedTax(val)}</span>;
        },
      },
      {
        title: intl.get(`${modelPrompt}.JDPrice`).d('京东价'),
        dataIndex: 'jdPrice',
        align: 'right',
        width: 70,
        render: val => {
          return <span>{this.toFixedTax(val)}</span>;
        },
      },
      {
        title: intl.get(`${modelPrompt}.eCOrderCreationTime`).d('EC订单创建时间'),
        dataIndex: 'creationDate',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.confirmTime`).d('确认时间'),
        dataIndex: 'comfirmedDate',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.properTime`).d('妥投时间'),
        dataIndex: 'deliverTime',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.paymentMethod`).d('支付方式'),
        dataIndex: 'paymentType',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.paymentStatus`).d('支付状态'),
        dataIndex: 'paymentStatus',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.discountRate`).d('折扣率'),
        dataIndex: 'discount',
        width: 80,
        render: val => {
          return <span>{this.toFixedTax(val)}</span>;
        },
      },
      {
        title: intl.get(`${modelPrompt}.shippingAddress`).d('收货地址'),
        dataIndex: 'receivingAddress',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.eCOrderStatus`).d('EC订单状态'),
        dataIndex: 'status',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.childOrderStatus`).d('子订单状态'),
        dataIndex: 'subStatus',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.operating`).d('操作'),
        width: 60,
        // render: record => {
        //   return (
        //     <span className="action-link">
        //       <a
        //         disabled={!record.mappingId}
        //         onClick={() => {
        //           if (record.enabledFlag === 1) {
        //             Modal.confirm({
        //               title: intl
        //                 .get('scec.ecPlatformCategory.view.confirm.enabledTitle')
        //                 .d('确认禁用?'),
        //               onOk: () => {
        //                 this.handleDisable(record);
        //               },
        //             });
        //           } else {
        //             this.handleDisable(record);
        //           }
        //         }}
        //       >
        //         {
        //         record.mappingId && record.enabledFlag
        //           ? '禁用'
        //           : '启用'
        //         }
        //       </a>
        //     </span>
        //   );
        // },
      },
    ];

    return (
      <Table
        bordered
        columns={columns}
        scroll={{ x: '200%' }}
        rowKey="lineId"
        pagination={pagination}
        dataSource={dataSource}
        onChange={page => onChange(page)}
        loading={loading}
      />
    );
  }
}
