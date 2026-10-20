/**
 * LocationInfo - 地点层信息
 * @date: 2021-04-01
 * @author: xiaomei.lv <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import { connect } from 'dva';
import React, { Component, Fragment } from 'react';
import { sum, isNumber } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Table, Modal, Row, Col } from 'hzero-ui';

import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import { formatInternationalTel, formatYesOrNo } from '@/routes/components/utils';

@connect(({ supplierInform, loading }) => ({
  supplierInform,
  queryOuLoading: loading.effects['supplierInform/fetchOuList'],
}))
export default class LocationInfo extends Component {
  state = {
    visible: false,
    ouList: [],
  };

  /**
   * 获取地点层信息
   */
  @Bind()
  fetchDestinationList() {
    const { dispatch, changeReqId } = this.props;
    dispatch({
      type: 'supplierInform/fetchDestinationList',
      payload: {
        changeReqId,
      },
    });
  }

  /**
   * 获取ou层信息
   * @param {}} record
   */
  @Bind()
  handleFetchOu(record = {}) {
    const { dispatch, changeReqId } = this.props;
    const { visible } = this.state;
    const { supChangeAddId } = record;
    this.setState({ visible: !visible });
    if (!visible) {
      dispatch({
        type: 'supplierInform/fetchOuList',
        payload: {
          changeReqId,
          supChangeAddId,
        },
      }).then(res => {
        if (res) {
          this.setState({ ouList: res });
        }
      });
    }
  }

  /**
   * 表格的滚动属性
   */
  @Bind()
  handleScroll(columns) {
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));
    return scrollX;
  }

  render() {
    const { dataSource, queryOuLoading } = this.props;
    const { visible, ouList } = this.state;
    const columns = [
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.countryName').d('国家'),
        dataIndex: 'countryName',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.regionIds').d('地区'),
        dataIndex: 'regionName',
        width: 100,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.city').d('城市'),
        dataIndex: 'city',
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.addressDetail').d('详细地址'),
        dataIndex: 'address',
        width: 150,
      },
      {
        title: intl
          .get('sslm.supplierInform.model.supplierInform.supplierLocation')
          .d('供应商地点'),
        dataIndex: 'supplierAddress',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.contacts').d('联系人'),
        dataIndex: 'name',
        width: 100,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.contactsMethod').d('联系方式'),
        width: 240,
        dataIndex: 'mobilephone',
        render: (val, record) => {
          return (
            <div
              style={{
                color:
                  (['update', 'insert', 'delete'].includes(record.mobilephoneStateFlag) ||
                    ['update', 'insert', 'delete'].includes(record.internationalTelCodeStateFlag) ||
                    ['insert', 'delete'].includes(record.supChangeBeanStateFlag)) &&
                  'red',
              }}
            >
              {formatInternationalTel(record.internationalTelMeaning, val)}
            </div>
          );
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.OUMessage').d('OU层信息'),
        width: 120,
        dataIndex: 'ouMessage',
        render: (_, record) => {
          return (
            <span className="action-link">
              <a onClick={() => this.handleFetchOu(record)} disabled={record.dataChangeFlag === 1}>
                {intl
                  .get('sslm.supplierInform.model.supplierInform.OUMessageCompare')
                  .d('OU层信息对比')}
              </a>
            </span>
          );
        },
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 60,
        render: val => formatYesOrNo(val),
      },
    ].map(n => ({
      ...n,
      render: (val, record) => {
        return (
          <div
            style={{
              color:
                (['update', 'insert', 'delete'].includes(record[`${n.dataIndex}StateFlag`]) ||
                  ['insert', 'delete'].includes(record.supChangeBeanStateFlag)) &&
                'red',
            }}
          >
            {n.render ? n.render(val, record) : val}
          </div>
        );
      },
    }));

    const ouColumns = [
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.OULayer').d('OU层'),
        dataIndex: 'ouName',
        width: 150,
        render: (val, record) => {
          return (
            <div
              style={{
                color:
                  (['update', 'insert', 'delete'].includes(record.ouIdStateFlag) ||
                    ['insert', 'delete'].includes(record.supChangeBeanStateFlag)) &&
                  'red',
              }}
            >
              {val}
            </div>
          );
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.billPeriod').d('账期'),
        dataIndex: 'billPeriodMeaning',
        width: 150,
        render: (val, record) => {
          return (
            <div
              style={{
                color:
                  (['update', 'insert', 'delete'].includes(record.billPeriodStateFlag) ||
                    ['insert', 'delete'].includes(record.supChangeBeanStateFlag)) &&
                  'red',
              }}
            >
              {val}
            </div>
          );
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.typeName').d('付款方式'),
        dataIndex: 'typeName',
        width: 120,
        render: (val, record) => {
          return (
            <div
              style={{
                color:
                  (['update', 'insert', 'delete'].includes(record.typeCodeStateFlag) ||
                    ['insert', 'delete'].includes(record.supChangeBeanStateFlag)) &&
                  'red',
              }}
            >
              {val}
            </div>
          );
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.ticketDay').d('票据天数'),
        dataIndex: 'ticketDay',
        width: 100,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.termName').d('付款条件'),
        dataIndex: 'termName',
        render: (val, record) => {
          return (
            <div
              style={{
                color:
                  (['update', 'insert', 'delete'].includes(record.termCodeStateFlag) ||
                    ['insert', 'delete'].includes(record.supChangeBeanStateFlag)) &&
                  'red',
              }}
            >
              {val}
            </div>
          );
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.bankCode').d('银行代码'),
        dataIndex: 'bankCode',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.bankName').d('银行名称'),
        dataIndex: 'bankName',
        width: 120,
        render: (val, record) => {
          return (
            <div
              style={{
                color:
                  (['update', 'insert', 'delete'].includes(record.bankCodeStateFlag) ||
                    ['insert', 'delete'].includes(record.supChangeBeanStateFlag)) &&
                  'red',
              }}
            >
              {val}
            </div>
          );
        },
      },
      {
        title: intl
          .get('sslm.supplierInform.view.model.supplierInform.depositBank')
          .d('开户行名称'),
        dataIndex: 'bankBranchName',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.bankAccountNum').d('银行账号'),
        dataIndex: 'bankAccountNum',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.bankFirm').d('联行行号'),
        dataIndex: 'bankFirm',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.taxRate').d('税率'),
        dataIndex: 'taxRate',
        width: 120,
        render: (val, record) => {
          return (
            <div
              style={{
                color:
                  (['update', 'insert', 'delete'].includes(record.taxIdStateFlag) ||
                    ['insert', 'delete'].includes(record.supChangeBeanStateFlag)) &&
                  'red',
              }}
            >
              {val}
            </div>
          );
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.currencyName').d('币种'),
        dataIndex: 'currencyName',
        width: 100,
        render: (val, record) => {
          return (
            <div
              style={{
                color:
                  (['update', 'insert', 'delete'].includes(record.currencyCodeStateFlag) ||
                    ['insert', 'delete'].includes(record.supChangeBeanStateFlag)) &&
                  'red',
              }}
            >
              {val}
            </div>
          );
        },
      },
      {
        title: intl
          .get('sslm.supplierInform.model.supplierInform.layerCreationDate')
          .d('层创建日期'),
        dataIndex: 'creationDate',
        width: 100,
        render: (val, record) => {
          return (
            <div
              style={{
                color:
                  (['update', 'insert', 'delete'].includes(record.createDateStateFlag) ||
                    ['insert', 'delete'].includes(record.supChangeBeanStateFlag)) &&
                  'red',
              }}
            >
              {dateRender(val)}
            </div>
          );
        },
      },
      {
        title: intl
          .get('sslm.supplierInform.model.supplierInform.layerExpirationDate')
          .d('层失效日期'),
        dataIndex: 'expirationDate',
        width: 100,
        render: val => dateRender(val),
      },
    ].map(n => ({
      ...n,
      render: (val, record) => {
        return (
          <div
            style={{
              color:
                (['update', 'insert', 'delete'].includes(record[`${n.dataIndex}StateFlag`]) ||
                  ['insert', 'delete'].includes(record.supChangeBeanStateFlag)) &&
                'red',
            }}
          >
            {n.render ? n.render(val, record) : val}
          </div>
        );
      },
    }));

    return (
      <Fragment>
        <Table
          bordered
          rowKey="addressLineId"
          pagination={false}
          dataSource={dataSource}
          columns={columns}
          scroll={{ x: this.handleScroll(columns) }}
        />

        <Modal
          visible={visible}
          width={1000}
          footer={null}
          onCancel={this.handleFetchOu}
          title={intl.get('sslm.supplierInform.model.supplierInform.OUMessage').d('OU层信息')}
        >
          <Row gutter={24}>
            <Col span={12}>
              <h3 style={{ marginBottom: 15 }}>
                {intl.get('sslm.supplierInform.view.title.beforeChange').d('变更前')}
              </h3>
              <Table
                bordered
                rowKey="pcSubjectId"
                columns={ouColumns}
                dataSource={ouList[0]}
                pagination={false}
                loading={queryOuLoading}
                scroll={{ x: this.handleScroll(ouColumns) }}
              />
            </Col>
            <Col span={12}>
              <h3 style={{ marginBottom: 15 }}>
                {intl.get('sslm.supplierInform.view.title.afterChange').d('变更后')}
              </h3>
              <Table
                bordered
                rowKey="pcSubjectId"
                columns={ouColumns}
                dataSource={ouList[1]}
                pagination={false}
                loading={queryOuLoading}
                scroll={{ x: this.handleScroll(ouColumns) }}
              />
            </Col>
          </Row>
        </Modal>
      </Fragment>
    );
  }
}
