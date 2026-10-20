/**
 * ExamineDetail - 非寄销发票退回界面
 * @date: 2018-12-14
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
    loading.effects['invoice/returnInvoice'] ||
    loading.effects['invoice/queryDetailLine'],
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
    } = props;
    this.state = {
      tabKey: 'invoiceLine',
      recordModal: false,
      invoiceHeaderId,
      infDataSource: [],
      infPagination: {},
    };
  }

  componentDidMount() {
    this.handleSearchInf();
  }

  /**
   * 审核退回
   */
  @Bind()
  @Throttle(1000)
  handleShowRejectModal() {
    const { dispatch, history } = this.props;
    const { invoiceHeaderId } = this.state;
    this.headerForm.validateFieldsAndScroll((err, values) => {
      const { returnedRemark } = values;
      if (!err) {
        confirm({
          title: intl.get(`${promptCode}.view.message.title.modal.detail`).d('是否确认要退回?'),
          onOk() {
            dispatch({
              type: 'invoice/returnInvoice',
              payload: { invoiceHeaderId, returnedRemark },
            }).then((res) => {
              if (res) {
                notification.success();
                history.push(`/sfin/invoice-return/list`);
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

  render() {
    const { tabKey, recordModal, infDataSource = [], infPagination = {} } = this.state;
    const {
      dispatch,
      organizationId,
      invoice: { detailHeader },
      customizeTable,
      customizeForm,
      customizeTabPane,
      loading,
    } = this.props;
    const type = 'return';
    const detailHeaderProps = {
      type,
      onRef: (ref) => {
        this.headerForm = ref.props.form;
      },
      customizeForm,
    };
    const detailTableProps = {
      type,
    };
    const taxDetailTableProps = {
      customizeTable,
      hcuzCode,
      code: 'SFIN.INVOICE_CREATE_DETAIL.TAX_LINE',
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
      btnProps: { icon: 'save' },
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
    };
    const glaProps = {
      // tenantId,
      dataSource: infDataSource,
      pagination: infPagination,
      onTableChange: this.handleSearchInf,
    };
    return (
      <React.Fragment>
        <Header
          backPath="/sfin/invoice-return/list"
          title={intl.get(`${promptCode}.view.message.title.invoiceReturn.detail`).d('发票退回')}
        >
          <Button
            type="primary"
            icon="close"
            loading={loading}
            onClick={this.handleShowRejectModal}
          >
            {intl.get(`${promptCode}.model.invoiceBill.return`).d('退回')}
          </Button>
          <Upload {...attachment} />
          <Button icon="clock-circle-o" onClick={this.openOperationRecord}>
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </Button>
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
