/**
 * ExamineDetail - 我的应收发票-非寄销发票明细
 * @date: 2018-12-15
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Tabs, Badge, Form } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { Content, Header } from 'components/Page';
import Upload from '_components/Upload';
import { isEmpty } from 'lodash';
import ExcelExport from 'components/ExcelExport';
import intl from 'utils/intl';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { SRM_FINANCE } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, createPagination } from 'utils/utils';
import querystring from 'querystring';
import remote from 'hzero-front/lib/utils/remote';

import TaxDetailTable from '../Components/TaxDetailTable';
import DetailHeader from '../Components/DetailHeader';
import DetailTable from '../Components/DetailTable';
import ActionHistory from '../Components/ActionHistory';
import SupplierTable from '../../components/SupplierTable';
import Styles from './index.less';
import CommonStyle from '../../common.less';

const { TabPane } = Tabs;
const promptCode = 'sfin.invoiceBill';
const hcuzCode =
  'SFIN.INVOICE_CREATE_DETAIL.TAX_LINE,SFIN.INVOICE_UPDATE_DETAIL.HEADER_INFO,SFIN.INVOICE_UPDATE_DETAIL.TAB';

@remote({
  code: 'SFIN_INVOICE_SUPPLIER_DETAIL_CUX',
  name: 'remote',
})
@connect(({ invoice, loading }) => ({
  invoice,
  loading: loading.effects['bill/queryDetail'],
  printLoading: loading.effects['invoice/print'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['sfin.invoiceBill'],
})
@withCustomize({
  // unitCode: [hcuzCode],
  unitCode: [
    'SFIN.INVOICE_CREATE_DETAIL.TAX_LINE',
    'SFIN.INVOICE_UPDATE_DETAIL.HEADER_INFO',
    'SFIN.INVOICE_UPDATE_DETAIL.TAB',
  ],
})
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { invoiceHeaderId },
      },
      location: { search },
    } = props;

    const { isOutputInvoice } = querystring.parse(search.substr(1));
    this.state = {
      recordModal: false,
      invoiceHeaderId,
      isOutputInvoice,
      infDataSource: [],
      infPagination: {},
      tabKey: 'detail',
      taxDetailList: [],
    };
  }

  headerDate = {};

  /**
   * openOperationRecord - 打开操作记录弹窗
   */
  @Bind()
  openOperationRecord() {
    this.setState(
      {
        recordModal: true,
      },
      () => {
        this.historyModal.handleSearch();
      }
    );
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */
  @Bind()
  hideOperationRecord() {
    this.setState(
      {
        recordModal: false,
      },
      () => {
        this.historyModal.closeSearch();
      }
    );
  }

  @Bind()
  onRef(ref) {
    this.historyModal = ref;
  }

  componentDidMount() {
    this.handleSearchInf();
  }

  /**
   * 设置 _status
   * @param {Object} data
   */
  @Bind()
  setStatus(data = {}) {
    const { content = [], ...other } = data;
    const newContent = content.map((o) => ({ ...o, _status: 'update' }));
    return { content: newContent, ...other };
  }

  /**
   * 查询总账科目Table
   * @param {Object} params 分页信息
   */
  @Bind()
  handleSearchInf(params = {}) {
    const {
      dispatch,
      organizationId,
      // invoice: { infPagination },
    } = this.props;

    const { invoiceHeaderId, infPagination } = this.state;
    dispatch({
      type: 'invoice/fetchInvoicePage',
      payload: {
        organizationId,
        invoiceHeaderId,
        page: isEmpty(params) ? infPagination : params,
        customizeUnitCode: 'SFIN.BILL_SALE_DETAIL.LEDGER_ACCOUNT',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          infDataSource: res.content.map((n) => ({ ...n, _status: 'update' })),
          infPagination: createPagination(res),
        });
      }
    });
  }

  @Bind()
  changeTab(key) {
    this.setState({
      tabKey: key,
    });
  }

  /**
   * 打印功能
   */
  @Bind()
  handlePrint() {
    const { invoiceHeaderId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'invoice/print',
      invoiceHeaderId,
    }).then((res) => {
      if (!res) return;
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result;
        try {
          const failedInfo = JSON.parse(content);
          notification.error({
            description: failedInfo.message,
          });
        } catch (e) {
          const file = new Blob([res], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          const printWindow = window.open(fileURL);
          if (printWindow?.print) {
            printWindow.print();
          }
        }
      };
      reader.readAsText(res);
    });
  }

  @Bind()
  invoicePage() {
    const { taxDetailList } = this.state;
    const { history } = this.props;
    const taxType = taxDetailList[0]?.invoiceTypeCode || '';
    const path = '/sfin/invoice-supplier/';
    const type = 'invoiceSupplier';
    const { invoiceHeaderId } = this.state;
    if (taxType === 'VAT_ORDINARY_INVOICE' || taxType === 'VAT_SPECIAL_INVOICE') {
      history.push({
        pathname: `${path}view`,
        search: querystring.stringify({ invoiceHeaderId, type }),
      });
    } else if (taxType === 'VAT_ELECTRONIC_INVOICE') {
      history.push({
        pathname: `${path}elcview`,
        search: querystring.stringify({ invoiceHeaderId, type }),
      });
    }
  }

  @Bind()
  getTaxDetailList(list) {
    this.setState({
      taxDetailList: list,
    });
  }

  render() {
    const {
      tabKey,
      recordModal,
      invoiceHeaderId,
      infDataSource = [],
      infPagination = {},
      isOutputInvoice,
      isApprovalShow = true,
      taxDetailList = [],
    } = this.state;
    const {
      dispatch,
      organizationId,
      invoice: { detailHeader },
      customizeTable,
      customizeForm,
      customizeTabPane,
      printLoading,
      remote: remoteProps,
    } = this.props;
    const type = 'supplier';
    const detailHeaderProps = {
      type,
      onRef: (ref = {}) => {
        this.headerDate = ref;
      },
      customizeForm,
    };
    const detailTableProps = {
      type,
    };
    const operationRecordProps = {
      dispatch,
      visible: recordModal,
      onRef: this.onRef,
      hideModal: this.hideOperationRecord.bind(this),
      isApprovalShow: true,
      showRejected: true,
    };
    const headerInfo = detailHeader[type] || {};
    const attachmentUUID = headerInfo.attachmentUuid;
    const attachment = {
      tenantId: organizationId,
      viewOnly: true,
      attachmentUUID,
      btnProps: { icon: 'save', type: 'primary' },
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
    };
    const glaProps = {
      // tenantId,
      dataSource: infDataSource,
      pagination: infPagination,
      onTableChange: this.handleSearchInf,
    };

    const taxDetailTableProps = {
      customizeTable,
      hcuzCode,
      code: 'SFIN.INVOICE_CREATE_DETAIL.TAX_LINE',
      getTaxDetailList: this.getTaxDetailList,
    };

    const outputInvoice = isOutputInvoice ? '/sfin/output-invoice/list' : undefined;
    const backUrl = '/sfin/invoice-supplier/list';

    return (
      <React.Fragment>
        <Header
          backPath={outputInvoice || backUrl}
          title={intl.get(`${promptCode}.view.message.title.invoiceSupplier.detail`).d('发票明细')}
        >
          <Upload {...attachment} />
          <Button icon="clock-circle-o" onClick={this.openOperationRecord}>
            {isApprovalShow && `${intl.get('hzero.common.button.approval').d('审批')}/`}

            {intl.get('hzero.common.button.operating').d('操作记录')}
          </Button>
          <ExcelExport
            requestUrl={`${SRM_FINANCE}/v1/${organizationId}/invoice-line/supplier/${invoiceHeaderId}/export`}
            queryParams={{
              invoiceHeaderId,
              customizeUnitCode: 'SFIN.INVOICE_UPDATE_DETAIL.INVOICE_LINE',
            }}
            otherButtonProps={{ icon: 'export', type: 'default' }}
          />
          {this.headerDate.headerInfo &&
            [
              'SUBMITTED',
              'APPROVED',
              'REVIEWED',
              'RETURN_TO_APPROVE',
              'RETURN_TO_REVIEW',
              'SYNCHRONIZING',
              'EXT_SYSTEM_SIGN',
            ].includes(this.headerDate.headerInfo.invoiceStatus) && (
              <Button
                icon="printer"
                onClick={() => Throttle(this.handlePrint(), 2000)}
                loading={printLoading}
              >
                {intl.get(`sfin.invoiceBill.view.button.print`).d('打印')}
              </Button>
            )}
          {remoteProps
            ? remoteProps.render('SFIN_INVOICE_SUPPLIER_DETAIL_CUX_HEADER_BTNS', null, {
                headerInfo,
              })
            : null}
        </Header>
        <Content>
          <DetailHeader {...detailHeaderProps} />
          {customizeTabPane(
            { code: 'SFIN.INVOICE_UPDATE_DETAIL.TAB' },
            <Tabs
              animated={false}
              onChange={this.changeTab}
              activeKey={tabKey}
              className={CommonStyle['tabpane-style']}
            >
              <TabPane tab={intl.get(`${promptCode}.view.invoiceRow`).d('发票行')} key="detail">
                <DetailTable {...detailTableProps} />
              </TabPane>
              <TabPane
                tab={intl.get(`${promptCode}.view.taxInvoiceRow`).d('税务发票行')}
                key="TaxInvoiceLine"
                className={Styles['purchase-application']}
              >
                {headerInfo?.issueStatusCode === 'SUCCESS' && (
                  <Form layout="inline">
                    <Button
                      type="primary"
                      onClick={this.invoicePage}
                      disabled={isEmpty(taxDetailList)}
                    >
                      {intl.get(`${promptCode}.model.invoiceBill.viewInvoice`).d('查看发票')}
                    </Button>
                  </Form>
                )}

                <TaxDetailTable {...taxDetailTableProps} />
              </TabPane>
              <TabPane
                tab={
                  <span>
                    {intl.get(`${promptCode}.view.inf`).d('总账科目')}
                    <Badge
                      className={Styles['badge-tab']}
                      style={{
                        backgroundColor: '#fff',
                        color: tabKey === 'inf' ? '#29BECE' : '#000',
                      }}
                      overflowCount={99}
                      offset={[6, 0]}
                      showZero
                      count={infDataSource.length}
                    />
                  </span>
                }
                key="inf"
              >
                <SupplierTable {...glaProps} />
              </TabPane>
            </Tabs>
          )}
          <ActionHistory {...operationRecordProps} />
        </Content>
      </React.Fragment>
    );
  }
}
