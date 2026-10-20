import React, { Component } from 'react';
import { Table, DataSet, Modal } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { numberSeparatorRender } from '@/utils/renderer';

import { INQUIRY, BID } from '@/utils/globalVariable';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import LadderLevel from '../LadderLevel';
import { SupplierQuotationTableDS, LadderLevelModalDS } from './TableDS';

import styles from '../index.less';

@observer
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

  componentDidUpdate() {
    if (this.props.doubleUnitFlag) {
      this.SupplierQuotationTableDS.setState('doubleUnitFlag', true);
    } else {
      this.SupplierQuotationTableDS.setState('doubleUnitFlag', false);
    }
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
    const {
      sourceHeaderId,
      organizationId,
      doubleUnitFlag,
      sourceKey,
      customizeTable,
    } = this.props;
    const recordData = record.toData() || {};
    const { sourceQuotationLineId = null } = recordData || {};

    const LadderCode = `SSRC.${sourceKey}_HALL.CLARIFICATION.SUPPLIER_REPLY_LADDER_LEVEL_DETAIL`;

    this.LadderLevelModalDS.setQueryParameter('commonProps', {
      organizationId,
      sourceHeaderId,
      sourceQuotationLineId,
      customizeUnitCode: LadderCode,
    });
    const modalKey = Modal.key();
    this.LadderLevelModalDS.setState('doubleUnitFlag', doubleUnitFlag);
    this.LadderLevelModalDS.query();

    const Props = {
      recordData,
      ladderLevelModalDS: this.LadderLevelModalDS,
      doubleUnitFlag,
      customizeTable,
      LadderCode,
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
    const { doubleUnitFlag, headerInfoDS, sourceKey = INQUIRY } = this.props;
    const { current } = headerInfoDS || {};
    const { benchmarkPriceType } = current ? current.get(['benchmarkPriceType']) : {};
    const isUnTaxPriceFlag = benchmarkPriceType && benchmarkPriceType === 'NET_PRICE';

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
        name: 'model',
        width: 100,
      },
      {
        name: 'specs',
        width: 100,
      },
      doubleUnitFlag
        ? {
            name: 'newQuotationSecPrice',
            width: 100,
            // align: 'left',
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'newNetSecPrice',
            width: 100,
            // align: 'left',
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      {
        name: 'newQuotationPrice',
        width: 100,
        // align: 'left',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'netPrice',
        width: 100,
        // align: 'left',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'quotationDetail',
        width: 100,
        align: 'left',
        renderer: ({ record }) => {
          return (
            <QuotationDetail
              rowData={record}
              sourceFrom="RFX"
              uiType="c7n-pro"
              allowSupplierViewFlag
              bidFlag={sourceKey === BID}
            />
          );
        },
      },
      doubleUnitFlag
        ? !isUnTaxPriceFlag
          ? {
              name: 'lastQuotationSecPrice',
              width: 100,
              // align: 'left',
              renderer: ({ value }) => numberSeparatorRender(value),
            }
          : {
              name: 'lastNetSecPrice',
              width: 100,
              // align: 'left',
              renderer: ({ value }) => numberSeparatorRender(value),
            }
        : !isUnTaxPriceFlag
        ? {
            name: 'lastQuotationPrice',
            width: 100,
            // align: 'left',
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : {
            name: 'lastNetPrice',
            width: 100,
            // align: 'left',
            renderer: ({ value }) => numberSeparatorRender(value),
          },
      doubleUnitFlag
        ? {
            name: 'secondaryQuantity',
            width: 100,
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'validQuotationSecQuantity',
            width: 120,
            // align: 'left',
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'secondaryUomName',
            width: 100,
          }
        : null,
      {
        name: 'rfxQuantity',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'currentQuotationQuantity',
        width: 120,
        // align: 'left',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'uomName',
        width: 100,
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
        name: 'deliveryCycle',
        width: 120,
      },
      {
        name: 'ladderOffer',
        width: 100,
        renderer: ({ record }) => {
          return record.get('ladderInquiryFlag') ? (
            <>
              <a onClick={() => this.viewLadderLevelPrepare(record)}>
                {intl.get(`ssrc.inquiryHall.view.message.button.ladderLevel`).d('阶梯报价')}
              </a>
              {record.get('ladderInquiryRequire') === 1 && (
                <Badge style={{ marginLeft: '2px' }} status="error" />
              )}
            </>
          ) : null;
        },
      },
    ].filter(Boolean);

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
