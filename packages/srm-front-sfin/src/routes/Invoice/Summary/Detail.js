/**
 * ExamineDetail - 非寄销应付发票汇总明细界面
 * @date: 2018-12-07
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Tabs, Badge } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import remote from 'hzero-front/lib/utils/remote';

import { Content, Header } from 'components/Page';
import Upload from '_components/Upload';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { SRM_FINANCE } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, createPagination } from 'utils/utils';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';

import querystring from 'querystring';
import DetailHeader from '../Components/DetailHeader';
import DetailTable from '../Components/DetailTable';
import ActionHistory from '../Components/ActionHistory';
import styles from '../../PayableInvoice/index.less';
import TaxDetailTable from '../Components/TaxDetailTable';
import SupplierTable from '../../components/SupplierTable';
import Styles from './index.less';
import CommonStyle from '../../common.less';

const { TabPane } = Tabs;
const promptCode = 'sfin.invoiceBill';
const hcuzCode =
  'SFIN.INVOICE_CREATE_DETAIL.TAX_LINE,SFIN.INVOICE_UPDATE_DETAIL.HEADER_INFO,SFIN.INVOICE_UPDATE_DETAIL.TAB';
@remote({
  code: 'SFIN_INVOICE_SUMMARY_DETAIL_CUX',
  name: 'remote',
})
@connect(({ invoice, loading, bill }) => ({
  invoice,
  bill,
  loading: loading.effects['invoice/queryDetail'],
  printLoading: loading.effects['invoice/print'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: [
    'entity.company',
    'entity.supplier',
    'entity.roles',
    'entity.item',
    'entity.business',
    'sfin.invoiceBill',
    'smdm.materiel',
  ],
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
    const { isInvoiceVerify, isInputInvoice } = querystring.parse(search.substr(1));
    this.state = {
      isInvoiceVerify,
      isInputInvoice,
      recordModal: false,
      invoiceHeaderId,
      collapseKeys: {}, // 打开的折叠面板key
      infDataSource: [],
      infPagination: {},
      tabKey: 'invoiceLine',
    };
  }

  headerDate = {};

  componentDidMount() {
    this.handleSearchInf();
  }

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

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(arr, key) {
    const { collapseKeys } = this.state;
    this.setState({
      collapseKeys: {
        ...collapseKeys,
        [key]: arr,
      },
    });
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
  @Throttle(2000)
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

  render() {
    const {
      tabKey,
      isInvoiceVerify,
      recordModal,
      invoiceHeaderId,
      isInputInvoice,
      infDataSource = [],
      infPagination = {},
      isApprovalShow = true,
    } = this.state;
    const {
      dispatch,
      organizationId,
      invoice: { detailHeader, invoiceVerifyDetailHeader },
      customizeTable,
      customizeForm,
      customizeTabPane,
      printLoading = false,
      remote: remoteProps,
    } = this.props;
    const type = 'summary';
    const detailHeaderProps = {
      type,
      isInvoiceVerify: !isInputInvoice || isInvoiceVerify,
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
    };
    const headerInfo =
      !isInputInvoice || isInvoiceVerify
        ? invoiceVerifyDetailHeader[type] || {}
        : detailHeader[type] || {};
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
    };
    const url = isInvoiceVerify ? '/sfin/invoice-verification/list' : '/sfin/invoice-summary/list';
    const inputInvoice = isInputInvoice ? '/sfin/input-invoice/list' : undefined;

    return (
      <React.Fragment>
        <Header
          backPath={inputInvoice || url}
          title={intl.get(`${promptCode}.view.message.title.invoiceSupplier.detail`).d('发票明细')}
        >
          <Upload {...attachment} />
          <Button icon="clock-circle-o" onClick={this.openOperationRecord}>
            {isApprovalShow && `${intl.get('hzero.common.button.approval').d('审批')}/`}
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </Button>
          <ExcelExport
            requestUrl={`${SRM_FINANCE}/v1/${organizationId}/invoice-line/${invoiceHeaderId}/export`}
            queryParams={{
              invoiceHeaderId,
              customizeUnitCode: 'SFIN.INVOICE_UPDATE_DETAIL.INVOICE_LINE',
            }}
            otherButtonProps={{ icon: 'export' }}
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
              <Button icon="printer" onClick={this.handlePrint} loading={printLoading}>
                {intl.get(`sfin.invoiceBill.view.button.print`).d('打印')}
              </Button>
            )}
          {remoteProps
            ? remoteProps.render('SFIN_INVOICE_SUMMARY_DETAIL_CUX_HEADER_BTNS', null, {
                headerInfo,
              })
            : null}
        </Header>
        <Content wrapperClassName={styles['payable-invoice']}>
          <DetailHeader {...detailHeaderProps} />
          {/* <Collapse
            className={classnames('form-collapse', 'table-line')}
            defaultActiveKey={['centralizedTable']}
            onChange={arr => this.onCollapseChange(arr, 'centralizedTable')}
          >
            <Collapse.Panel
              showArrow={false}
              key="centralizedTable"
              header={
                <React.Fragment>
                  <h3>
                    {intl.get(`${promptCode}.view.message.title.invoice.tab.row`).d('发票行')}
                  </h3>
                  <a>
                    {collapseKeys.centralizedTable
                      ? collapseKeys.centralizedTable.some(o => o === 'centralizedTable')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')
                      : intl.get(`hzero.common.button.up`).d('收起')}
                  </a>
                  <Icon
                    type={
                      collapseKeys.centralizedTable
                        ? collapseKeys.centralizedTable.some(o => o === 'centralizedTable')
                          ? 'up'
                          : 'down'
                        : 'up'
                    }
                  />
                </React.Fragment>
              }
            >
              <DetailTable {...detailTableProps} />
            </Collapse.Panel>
          </Collapse> */}
          {customizeTabPane(
            { code: 'SFIN.INVOICE_UPDATE_DETAIL.TAB' },
            <Tabs
              animated={false}
              onChange={this.changeTab}
              activeKey={tabKey}
              className={CommonStyle['tabpane-style']}
            >
              <TabPane
                tab={intl.get(`${promptCode}.view.invoiceRow`).d('发票行')}
                key="invoiceLine"
              >
                <DetailTable {...detailTableProps} />
              </TabPane>
              <TabPane
                tab={intl.get(`${promptCode}.view.taxInvoiceRow`).d('税务发票行')}
                key="TaxInvoiceLine"
              >
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
                {/* <DetailTable {...detailTableProps} /> */}
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
