/**
 * AssociatedInvoice - 交期审核 - 明细页面表格-关联单据
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { sum, isNumber, isFunction } from 'lodash';
import { Table, Tabs } from 'hzero-ui';
import moment from 'moment';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { dateRender } from 'utils/renderer';

// import { formatUom } from '@/routes/components/utils';
// import Record from 'choerodon-ui/pro/lib/data-set/Record';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import { Bind } from 'lodash-decorators';
import { formatAumont } from '../../components/utils';
import { BUCKET_NAME } from '@/routes/components/utils/constant';
import AsnAttchment from './AsnAttchment';
import styles from './index.less';

const { TabPane } = Tabs;
// 设置sodr国际化前缀 - common - model
const modelPrompt = 'sodr.deliveryDateReview.model.common';
// 设置sodr国际化前缀 - common - message
const viewMessagePrompt = 'sodr.deliveryDateReview.view.message';

const queryTableDataSourceMap = {
  asn: {
    loading: 'asnLinesLoading',
    rowKey: 'key',
    action: 'fetchAsnLines',
  },
  rcv: {
    loading: 'rcvRecordsLoading',
    rowKey: 'rcvTrxLineId',
    action: 'fetchRcvRecords',
  },
  bill: {
    loading: 'billLinesLoading',
    rowKey: 'billLineId',
    action: 'fetchBillLines',
  },
  invoice: {
    loading: 'invoiceLinesLoading',
    rowKey: 'invoiceLineId',
    action: 'fetchInvoiceLines',
  },
};

export default class AssociatedInvoice extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      currentRadioGroupValue: 'asn',
      asn: {
        dataSource: [],
        pagination: {},
      },
      rcv: {
        dataSource: [],
        pagination: {},
      },
      bill: {
        dataSource: [],
        pagination: {},
      },
      invoice: {
        dataSource: [],
        pagination: {},
      },
      asnVisible: false,
      approveAttachmentUuid: undefined,
      reviewAttachmentUuid: undefined,
      otherAttachmentUuid: undefined,
      supplierAttachmentUuid: undefined,
      supplierAttaUuid: undefined,
    };

    // 方法注册
    ['onRadioGroupChange', 'onTableChange', 'fetchTableDataSourceAll', 'getColumns'].forEach(
      (method) => {
        this[method] = this[method].bind(this);
      }
    );
  }

  componentDidMount() {
    this.fetchTableDataSourceAll();
  }

  componentDidUpdate(prevProps) {
    const { actionListCommonRow } = this.props;
    if (
      actionListCommonRow.poLineLocationId &&
      prevProps.actionListCommonRow.poLineLocationId !== actionListCommonRow.poLineLocationId
    ) {
      this.fetchTableDataSourceAll();
    }
  }

  fetchTableDataSourceAll() {
    const { poLineLocationId, actionListCommonRow } = this.props;
    Promise.all(
      Object.keys(queryTableDataSourceMap).map((n) => {
        const action = this.props[queryTableDataSourceMap[n].action];
        return isFunction(action) && actionListCommonRow.poLineLocationId
          ? action({ poLineLocationId }).then((res) => {
              if (res) {
                this.setTableDataSource(res, n);
              }
            })
          : {};
      })
    );
  }

  onRadioGroupChange(e) {
    this.setState({
      currentRadioGroupValue: e,
    });
  }

  onTableChange(page) {
    const { currentRadioGroupValue } = this.state;
    const action = this.props[queryTableDataSourceMap[currentRadioGroupValue].action];
    if (isFunction(action)) {
      action(page).then((res) => {
        if (res) {
          this.setTableDataSource(res);
        }
      });
    }
  }

  getColumns() {
    const { currentRadioGroupValue } = this.state;
    const { associatedConfigFlag } = this.props;
    const dynamicColumns = new Map([
      [
        'asn',
        [
          {
            title: intl.get(`${modelPrompt}`).d('送货单号'),
            dataIndex: 'asnNum',
            width: 150,
          },
          {
            title: intl.get(`${modelPrompt}.displayLineNum`).d('行号'),
            dataIndex: 'displayAsnLineNum',
            width: 60,
          },
          {
            title: intl.get(`${modelPrompt}.shipmentQuantity`).d('发运数量'),
            dataIndex: 'shipQuantity',
            width: 100,
            render: (text) => formatAumont(text),
          },
          {
            title: intl.get(`${modelPrompt}.unit`).d('单位'),
            dataIndex: 'uomName',
            width: 100,
            render: (_, { uomCodeAndName }) => uomCodeAndName,
          },
          {
            title: intl.get(`${modelPrompt}.deliveryDate`).d('发货日期'),
            dataIndex: 'shipDate',
            width: 120,
            render: (text) => (text ? moment(text).format(DEFAULT_DATE_FORMAT) : text),
          },
          {
            title: intl.get(`${modelPrompt}.status`).d('状态'),
            dataIndex: 'asnStatusMeaning',
            width: 90,
          },
          {
            title: intl.get('entity.attachment.tag').d('附件'),
            dataIndex: 'approveAttachmentUuid',
            width: 60,
            render: (_, record) => (
              <Fragment>
                <a onClick={() => this.setAttachmentProps(record)}>
                  {intl.get('entity.attachment.tag').d('附件')}
                </a>
              </Fragment>
            ),
          },
        ],
      ],
      [
        'rcv',
        [
          {
            title: intl.get(`${modelPrompt}.transactionType`).d('事务类型'),
            dataIndex: 'rcvTrxTypeName',
            width: 100,
          },
          {
            title: intl.get(`${modelPrompt}.transactionNumber`).d('事务编号'),
            dataIndex: 'displayTrxNum',
            width: 100,
          },
          {
            title: intl.get(`${modelPrompt}.displayLineNum`).d('行号'),
            dataIndex: 'trxLineNum',
            width: 60,
          },
          {
            title: intl.get(`${modelPrompt}.quantity`).d('数量'),
            dataIndex: 'quantity',
            width: 60,
            render: (text) => formatAumont(text),
          },
          {
            title: intl.get(`${modelPrompt}.unit`).d('单位'),
            dataIndex: 'uomName',
            width: 100,
            render: (_, { uomCodeAndName }) => uomCodeAndName,
          },
          {
            title: intl.get(`${modelPrompt}.transactionDate`).d('事务日期'),
            dataIndex: 'trxDate',
            render: dateRender,
            width: 100,
          },
          {
            title: intl.get('entity.attachment.tag').d('附件'),
            dataIndex: 'sinvHeaderAttachmentUuid',
            width: 60,
            render: (_, record) => {
              return (
                <UploadModal
                  btnText={intl.get('entity.attachment.tag').d('附件')}
                  icon=" "
                  viewOnly
                  showFilesNumber={false}
                  attachmentUUID={record.sinvHeaderAttachmentUuid}
                  bucketName={BUCKET_NAME}
                  bucketDirectory="sodr-order"
                />
              );
            },
          },
        ],
      ],
      [
        'bill',
        [
          {
            title: intl.get(`${modelPrompt}.reconciliationNumber`).d('对账单号'),
            dataIndex: 'billNum',
            width: 120,
          },
          {
            title: intl.get(`${modelPrompt}.displayLineNum`).d('行号'),
            dataIndex: associatedConfigFlag ? 'lineNum' : 'billLineNum',
            width: 60,
          },
          {
            title: intl.get(`${modelPrompt}.quantity`).d('数量'),
            dataIndex: 'quantity',
            width: 90,
            render: (text) => formatAumont(text),
          },
          {
            title: intl.get(`${modelPrompt}.unit`).d('单位'),
            dataIndex: associatedConfigFlag ? 'uom' : 'uomName',
            width: 100,
            // render: (_, { uomCode, uomName }) => formatUom(uomCode, uomName),
          },
          {
            title: intl.get(`${modelPrompt}.confirmationDate`).d('确认日期'),
            dataIndex: associatedConfigFlag ? 'confirmDate' : 'approvedDate',
            render: dateRender,
            width: 120,
          },
          {
            title: intl.get(`${modelPrompt}.status`).d('状态'),
            dataIndex: 'billStatusMeaning',
            width: 100,
          },
          {
            title: intl.get('entity.attachment.tag').d('附件'),
            dataIndex: 'attachmentUuid',
            width: 60,
            render: (_, record) => (
              <UploadModal
                btnText={intl.get('entity.attachment.tag').d('附件')}
                icon=" "
                viewOnly
                showFilesNumber={false}
                attachmentUUID={record.attachmentUuid}
                bucketName={BUCKET_NAME}
                bucketDirectory="sodr-order"
              />
            ),
          },
        ],
      ],
      [
        'invoice',
        [
          {
            title: intl.get(`${modelPrompt}.onlineInvoiceNumber`).d('网上发票号'),
            dataIndex: associatedConfigFlag ? 'settleHeaderNum' : 'invoiceNum',
            width: 150,
          },
          {
            title: intl.get(`${modelPrompt}.displayLineNum`).d('行号'),
            dataIndex: associatedConfigFlag ? 'lineNum' : 'invoiceLineNum',
            width: 60,
          },
          {
            title: intl.get(`${modelPrompt}.quantity`).d('数量'),
            dataIndex: 'quantity',
            width: 90,
            render: (text) => formatAumont(text),
          },
          {
            title: intl.get(`${modelPrompt}.unit`).d('单位'),
            dataIndex: associatedConfigFlag ? 'uom' : 'uomName',
            width: 100,
            // render: (_, { uomCode, uomName }) => formatUom(uomCode, uomName),
          },
          {
            title: intl.get(`${modelPrompt}.importDate`).d('导入日期'),
            dataIndex: 'syncDate',
            render: dateRender,
            width: 120,
          },
          {
            title: intl.get(`${modelPrompt}.status`).d('状态'),
            dataIndex: associatedConfigFlag ? 'settleStatusMeaning' : 'invoiceStatusMeaning',
            width: 100,
          },
          {
            title: intl.get('entity.attachment.tag').d('附件'),
            dataIndex: 'attachmentUuid',
            width: 60,
            render: (_, record) => (
              <UploadModal
                btnText={intl.get('entity.attachment.tag').d('附件')}
                icon=" "
                viewOnly
                showFilesNumber={false}
                attachmentUUID={record.attachmentUuid}
                bucketName={BUCKET_NAME}
                bucketDirectory="sodr-order"
              />
            ),
          },
        ],
      ],
    ]);
    function onCell() {
      return {
        style: {
          overflow: 'hidden',
          maxWidth: 180,
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
        onClick: (e) => {
          const { target } = e;
          if (target.style.whiteSpace === 'normal') {
            target.style.whiteSpace = 'nowrap';
          } else {
            target.style.whiteSpace = 'normal';
          }
        },
      };
    }

    return (dynamicColumns.get(currentRadioGroupValue) || []).map((n) => ({
      ...n,
      onCell,
    }));
  }

  setTableDataSource(res = {}, actionType) {
    const { currentRadioGroupValue } = this.state;
    const { dataSource = [], pagination = {} } = res;
    this.setState({
      [actionType || currentRadioGroupValue]: {
        dataSource,
        pagination,
      },
    });
  }

  @Bind()
  hideAttachment() {
    this.setState({ asnVisible: false });
  }

  setAttachmentProps(record) {
    this.setState({ asnVisible: true });
    this.setState({ approveAttachmentUuid: record.approveAttachmentUuid });
    this.setState({ reviewAttachmentUuid: record.reviewAttachmentUuid });
    this.setState({ otherAttachmentUuid: record.otherAttachmentUuid });
    this.setState({ supplierAttaUuid: record.supplierAttaUuid });
    this.setState({ supplierAttachmentUuid: record.supplierAttachmentUuid });
  }

  render() {
    const { currentRadioGroupValue } = this.state;
    const { processing = {} } = this.props;
    const columns = this.getColumns();
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const tableProps = {
      columns,
      dataSource: this.state[currentRadioGroupValue].dataSource,
      pagination: false,
      loading: processing[queryTableDataSourceMap[currentRadioGroupValue].loading],
      scroll: { x: scrollX, y: 'calc(100vh - 390px)' },
      bordered: true,
      onChange: this.onTableChange,
      rowKey: queryTableDataSourceMap[currentRadioGroupValue].rowKey,
      className: styles['ant-table-wrapper'],
    };
    const attachmentProps = {
      hideAttachment: this.hideAttachment,
      approveAttachmentUuid: this.state.approveAttachmentUuid,
      reviewAttachmentUuid: this.state.reviewAttachmentUuid,
      otherAttachmentUuid: this.state.otherAttachmentUuid,
      supplierAttachmentUuid: this.state.supplierAttachmentUuid,
      supplierAttaUuid: this.state.supplierAttaUuid,
      onFetchPurchaserAttachmentList: this.props.onFetchPurchaserAttachmentList,
      onFetchSupplierAttachmentList: this.props.onFetchSupplierAttachmentList,
      onRemoveAttachment: this.props.onRemoveAttachment,
      loading: this.props.loading,
      bucketName: BUCKET_NAME,
      bucketDirectory: 'sodr-order',
      onBindUuidToHeader: this.props.onBindUuidToHeader,
    };
    return (
      <Fragment>
        {this.state.asnVisible && <AsnAttchment {...attachmentProps} />}
        <Tabs onChange={this.onRadioGroupChange} animated={false}>
          <TabPane
            key="asn"
            tab={`${intl.get(`${viewMessagePrompt}.panel.asn`).d('送货单')}(${
              this.state.asn.dataSource.length
            })`}
          >
            <Table {...tableProps} />
          </TabPane>
          <TabPane
            key="rcv"
            tab={`${intl.get(`${viewMessagePrompt}.panel.rcv`).d('收货记录')}(${
              this.state.rcv.dataSource.length
            })`}
          >
            <Table {...tableProps} />
          </TabPane>
          <TabPane
            key="bill"
            tab={`${intl.get(`${viewMessagePrompt}.panel.bill`).d('对账单')}(${
              this.state.bill.dataSource.length
            })`}
          >
            <Table {...tableProps} />
          </TabPane>
          <TabPane
            key="invoice"
            tab={`${intl.get(`${viewMessagePrompt}.panel.invoice`).d('网上发票')}(${
              this.state.invoice.dataSource.length
            })`}
          >
            <Table {...tableProps} />
          </TabPane>
        </Tabs>
      </Fragment>
    );
  }
}
