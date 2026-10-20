// 供应商列表table SupplierListTablePrepare

import React, { Component } from 'react';
import { Table, Row, Col, Output } from 'choerodon-ui/pro';
import { Badge, Popover } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';

import { riskLevelRender } from '@/utils/renderer';

export default class SupplierListTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPageSize: 10,
    };
  }

  componentDidMount() {
    this.props.supplierListTableDS.query();
  }

  // table columns
  getColumns() {
    const { supplierLineAllotItem, currentMode } = this.props;
    const showDiff = currentMode === 'current' || currentMode === 'history';

    const columns = [
      {
        name: 'supplierLov',
        width: 150,
        renderer: ({ record }) => (
          <div>
            {showDiff && record.get('addFlag') ? (
              <Popover
                content={intl.get('ssrc.inquiryHall.model.inquiryHall.newLine').d('新增行')}
                placement="bottom"
              >
                <span>
                  {currentMode === 'history' ? (
                    <Badge status="error" />
                  ) : (
                    <Badge status="success" />
                  )}
                </span>
              </Popover>
            ) : (
              ''
            )}
            {showDiff && record.get('updateFlag') ? (
              <Popover
                content={intl.get('ssrc.inquiryHall.model.inquiryHall.infoChange').d('信息更改')}
                placement="bottom"
              >
                <span>
                  {currentMode === 'history' ? (
                    <Badge status="error" />
                  ) : (
                    <Badge status="success" />
                  )}
                </span>
              </Popover>
            ) : (
              ''
            )}
            {record.get('supplierCompanyNum')}
          </div>
        ),
      },
      {
        name: 'supplierCompanyName',
        width: 250,
      },
      {
        name: 'priceCoefficient',
        width: 150,
        align: 'left',
      },
      {
        name: 'riskLevel',
        width: 120,
        renderer: ({ record, value }) => {
          return riskLevelRender(value, record.get('riskLevelMeaning'));
        },
      },
      {
        name: 'contactNameLov',
        width: 150,
      },
      {
        name: 'contactMobilephoneContainer',
        width: 300,
        renderer: ({ dataSet, record }) => {
          return (
            <Row>
              <Col span={12}>
                <Output dataSet={dataSet} record={record} name="internationalTelCode" />
              </Col>
              <Col span={12}>
                <Output dataSet={dataSet} record={record} name="contactMobilephone" />
              </Col>
            </Row>
          );
        },
      },
      {
        name: 'contactMail',
        width: 250,
      },
      {
        name: 'allotItem',
        width: 100,
        lock: 'right',
        renderer: ({ record }) =>
          !(currentMode === 'history' && record.get('addFlag')) ? (
            <a onClick={() => supplierLineAllotItem(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.allotItem`).d('分配物料')}
            </a>
          ) : null,
      },
    ].filter(Boolean);

    return columns;
  }

  @Bind
  onChangePagination(currentPage, pageSize) {
    const { disWrap } = this.props;
    const _disWrap = typeof disWrap === 'function' ? disWrap() : disWrap;
    if (_disWrap && !isEmpty(_disWrap)) {
      const { currentPageSize } = this.state;
      if (currentPageSize !== pageSize) {
        _disWrap.SupplierRef.supplierListTableDS.pageSize = pageSize;
        _disWrap.SupplierRef.supplierListTableDS.currentPage = 1;
        _disWrap.SupplierRef.supplierListTableDS.query(1);
      } else {
        _disWrap.SupplierRef.supplierListTableDS.pageSize = pageSize;
        _disWrap.SupplierRef.supplierListTableDS.currentPage = currentPage;
        _disWrap.SupplierRef.supplierListTableDS.query(currentPage);
      }
      this.setState({
        currentPageSize: pageSize,
      });
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { customizeTable, custLoading, supplierListTableDS, custKey, currentMode } = this.props;

    return (
      <React.Fragment>
        {customizeTable(
          {
            code:
              currentMode === 'history'
                ? `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SUPPLIER_HIS`
                : `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SUPPLIER_ONLYRED`,
          },
          <Table
            bordered
            custLoading={custLoading}
            dataSet={supplierListTableDS}
            rowKey="rfxLineSupplierId"
            columns={this.getColumns()}
            pagination={{
              onChange: this.onChangePagination,
            }}
          />
        )}
      </React.Fragment>
    );
  }
}
