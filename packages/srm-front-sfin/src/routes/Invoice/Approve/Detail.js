/**
 * ExamineDetail - 非寄销应付发票审核明细界面
 * @date: 2018-12-11
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Tabs, Modal, Badge } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import { Content, Header } from 'components/Page';
import Upload from '_components/Upload';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, createPagination } from 'utils/utils';
import notification from 'utils/notification';

import DetailHeader from '../Components/DetailHeader';
import DetailTable from '../Components/DetailTable';
import TaxDetailTable from '../Components/TaxDetailTable';
import ActionHistory from '../Components/ActionHistory';
import SupplierTable from '../../components/SupplierTable';
import Styles from './index.less';
import CommonStyle from '../../common.less';

const { TabPane } = Tabs;
const { confirm } = Modal;
const promptCode = 'sfin.invoiceBill';
const hcuzCode =
  'SFIN.INVOICE_CREATE_DETAIL.TAX_LINE,SFIN.INVOICE_UPDATE_DETAIL.HEADER_INFO,SFIN.INVOICE_UPDATE_DETAIL.TAB';

@connect(({ invoice, bill, loading }) => ({
  invoice,
  bill,
  loading:
    loading.effects['invoice/queryDetail'] ||
    loading.effects['invoice/confirm'] ||
    loading.effects['invoice/reject'] ||
    loading.effects['invoice/queryDetailHeader'],
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
    'SFIN.INVOICE_APPROVE_DETAIL.BTNS',
  ],
})
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { invoiceHeaderId },
      },
    } = props;
    this.state = {
      tabKey: 'invoiceLine',
      recordModal: false,
      invoiceHeaderId,
      infDataSource: [],
      infPagination: {},
    };
  }

  componentDidUpdate(prevProps) {
    const {
      match: {
        params: { invoiceHeaderId },
      },
    } = prevProps;
    if (this.props.match.params.invoiceHeaderId !== invoiceHeaderId) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ invoiceHeaderId });
    }
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

  /**
   * 发票审核确认
   */
  @Bind()
  @Throttle(1000)
  confirm() {
    const { dispatch, history } = this.props;
    const { invoiceHeaderId } = this.state;
    this.headerForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        confirm({
          title: intl.get(`${promptCode}.view.message.title.modal.pass`).d('是否确认通过?'),
          onOk: () => {
            dispatch({
              type: 'invoice/confirm',
              payload: {
                type: 'approve',
                body: [{ ...values, invoiceHeaderId, checkSource: 'COPE' }],
              },
            })
              .then((res) => {
                if (res) {
                  notification.success();
                  history.push(`/sfin/invoice-approve/list`);
                } else {
                  // 重新查询税务发票信息
                  // eslint-disable-next-line no-lonely-if
                  if (this?.taxTicketTableRef?.handleSearch) {
                    this.taxTicketTableRef.handleSearch();
                  }
                }
              })
              .catch(() => {
                // 重新查询税务发票信息
                // eslint-disable-next-line no-lonely-if
                if (this?.taxTicketTableRef?.handleSearch) {
                  this.taxTicketTableRef.handleSearch();
                }
              });
          },
        });
      }
    });
  }

  /**
   * 审核退回
   */
  @Bind()
  @Throttle(1000)
  reject() {
    const { dispatch, history } = this.props;
    const { invoiceHeaderId } = this.state;
    this.headerForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        confirm({
          title: intl.get(`${promptCode}.view.message.title.modal.detail`).d('是否确认要退回?'),
          onOk() {
            dispatch({
              type: 'invoice/reject',
              payload: {
                type: 'approve',
                body: [{ ...values, invoiceHeaderId }],
              },
            }).then((res) => {
              if (res) {
                notification.success();
                history.push(`/sfin/invoice-approve/list`);
              }
            });
          },
        });
      }
    });
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

  @Bind()
  changeTab(key) {
    this.setState({
      tabKey: key,
    });
  }

  render() {
    const {
      tabKey,
      recordModal,
      infDataSource = [],
      infPagination = {},
      invoiceHeaderId,
    } = this.state;
    const {
      dispatch,
      loading,
      organizationId,
      invoice: { detailHeader },
      customizeTable,
      customizeForm,
      customizeTabPane,
      customizeBtnGroup,
      match,
    } = this.props;
    const showPubType = match.path !== '/pub/sfin/invoice-approve/detail/:invoiceHeaderId';
    const type = 'approve';
    const detailHeaderProps = {
      type,
      showPubType,
      onRef: (ref) => {
        this.headerForm = ref.props.form;
      },
      customizeForm,
      invoiceHeaderId,
    };
    const detailTableProps = {
      type,
      invoiceHeaderId,
      showPubType,
    };
    const operationRecordProps = {
      dispatch,
      visible: recordModal,
      onRef: this.onRef,
      hideModal: this.hideOperationRecord.bind(this),
    };
    const headerInfo = detailHeader[type] || {};
    const attachmentUUID = headerInfo.attachmentUuid;
    const attachment = {
      tenantId: organizationId,
      viewOnly: true,
      attachmentUUID,
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      btnProps: { icon: 'save' },
    };
    const glaProps = {
      // tenantId,
      dataSource: infDataSource,
      pagination: infPagination,
      onTableChange: this.handleSearchInf,
    };
    const taxDetailProps = {
      customizeTable,
      hcuzCode,
      invoiceHeaderId,
      code: 'SFIN.INVOICE_CREATE_DETAIL.TAX_LINE',
      onRef: (ref) => {
        this.taxTicketTableRef = ref;
      },
    };

    return (
      <React.Fragment>
        {showPubType && (
          <Header
            backPath="/sfin/invoice-approve/list"
            title={intl.get(`${promptCode}.view.message.title.invoiceAudit.detail`).d('发票审核')}
          >
            <React.Fragment>
              {customizeBtnGroup(
                {
                  code: 'SFIN.INVOICE_APPROVE_DETAIL.BTNS',
                },
                [
                  <Button
                    data-name="confirm"
                    type="primary"
                    icon="check"
                    loading={loading}
                    onClick={this.confirm}
                  >
                    {intl.get(`${promptCode}.model.invoiceBill.approve`).d('通过')}
                  </Button>,
                  <Button data-name="return" icon="close" loading={loading} onClick={this.reject}>
                    {intl.get(`${promptCode}.model.invoiceBill.return`).d('退回')}
                  </Button>,
                  <Upload data-name="attachment" {...attachment} />,
                  <Button
                    data-name="operation"
                    icon="clock-circle-o"
                    onClick={this.openOperationRecord}
                  >
                    {intl.get('hzero.common.button.operating').d('操作记录')}
                  </Button>,
                ]
              )}
            </React.Fragment>
          </Header>
        )}
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
                <TaxDetailTable {...taxDetailProps} />
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
