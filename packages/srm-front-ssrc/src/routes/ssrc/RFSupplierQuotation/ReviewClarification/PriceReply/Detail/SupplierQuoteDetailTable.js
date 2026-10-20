import React, { Component } from 'react';
import { Table, DataSet, Modal } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { numberSeparatorRender } from '@/utils/renderer';

import LadderLevel from '../LadderLevel';
import { SupplierQuotationTableDS, LadderLevelModalDS } from './TableDS';
import { INQUIRY } from '@/utils/globalVariable';

import styles from '../index.less';

export default class SupplierQuoteDetailTable extends Component {
  constructor(props) {
    super(props);
    const { onTableRef = null } = props;
    if (typeof onTableRef === 'function') {
      onTableRef(this);
    }

    this.state = {};

    this.LadderLevelModalDS = new DataSet(
      LadderLevelModalDS({
        editTable: false,
      })
    );
    this.SupplierQuotationTableDS = new DataSet(
      SupplierQuotationTableDS({ sourceKey: props.sourceKey || INQUIRY })
    );
  }

  componentDidMount() {
    this.fetchSupplierLine();
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  // fetch supplier line
  async fetchSupplierLine() {
    const { clarifyNotifyId, organizationId, supplierCompanyId, supplierTenantId } = this.props;

    this.SupplierQuotationTableDS.setQueryParameter('commonProps', {
      organizationId,
      clarifyNotifyId,
      supplierCompanyId,
      supplierTenantId,
    });

    const quotationLines = await this.SupplierQuotationTableDS.query();
    this.timer = setTimeout(() => {
      this.updateHeaderStatus(quotationLines);
    }, 800);
  }

  // 更新头表单状态
  updateHeaderStatus(lines = {}) {
    const { headerInfoDS = {} } = this.props;

    if (isEmpty(lines) || !headerInfoDS.current) {
      return;
    }

    const { priceClarifyIssueLineStatusMeaning = null } = lines[0] || {};
    headerInfoDS.current.set('clarifyNotifyStatusMeaning', priceClarifyIssueLineStatusMeaning);
  }

  // 查看阶梯报价
  @Bind()
  viewLadderLevelPrepare(record = {}) {
    const { sourceHeaderId, organizationId } = this.props;
    const recordData = record.toData() || {};
    const { sourceQuotationLineId = null } = recordData;
    this.LadderLevelModalDS.setQueryParameter('commonProps', {
      organizationId,
      sourceHeaderId,
      sourceQuotationLineId,
    });
    const modalKey = Modal.key();
    this.LadderLevelModalDS.query();

    const Props = {
      recordData,
      ladderLevelModalDS: this.LadderLevelModalDS,
    };

    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      title: intl.get(`ssrc.inquiryHall.view.message.title.ladderLevelQuot`).d('阶梯报价'),
      children: <LadderLevel {...Props} />,
      footer: null,
    });
  }

  getTableColumns() {
    const Columns = [
      {
        name: 'rfxLineItemNum',
        width: 80,
      },
      {
        name: 'priceClarifyIssueLineStatusMeaning',
        width: 80,
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
      },
      {
        name: 'newQuotationPrice',
        width: 100,
        align: 'left',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'netPrice',
        width: 100,
        align: 'left',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'lastQuotationPrice',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'currentQuotationQuantity',
        width: 120,
        align: 'left',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'taxIncludedFlag',
        width: 100,
      },
      {
        name: 'taxRate',
        width: 120,
      },
      {
        name: 'rfxQuantity',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'uomName',
        width: 100,
      },
      {
        name: 'currentDeliveryCycle',
        width: 120,
      },
      {
        name: 'ladderOffer',
        width: 100,
        renderer: ({ record }) => {
          return record.get('ladderInquiryFlag') ? (
            <a onClick={() => this.viewLadderLevelPrepare(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.ladderLevel`).d('阶梯报价')}
            </a>
          ) : null;
        },
      },
    ];

    return Columns;
  }

  render() {
    const { customizeTable, sourceKey = INQUIRY } = this.props;
    return (
      <div className={styles['ssrc-supplier-quote-table']}>
        {customizeTable(
          {
            code: `SSRC.${sourceKey}_HALL.CLARIFICATION.SUPPLIER_REPLY_DETAIL`,
            dataSet: this.SupplierQuotationTableDS,
          },
          <Table
            rowKey="quotationLineId"
            dataSet={this.SupplierQuotationTableDS}
            columns={this.getTableColumns()}
          />
        )}
      </div>
    );
  }
}
