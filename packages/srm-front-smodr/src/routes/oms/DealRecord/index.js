import React from 'react';
import {
  DataSet,
  Button,
  Modal,
  Dropdown,
  Menu,
  Icon,
  Lov,
  TextField,
  Form,
} from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'react-router-dom';

import intl from 'utils/intl';
import { SMALL_ORDER } from '_utils/config';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import Store from '@/routes/components/ModalProvider/Store';
import { handleSubmitPay, handleSubmit } from '@/services/oms/dealRecordService';
import notification from 'utils/notification';

import { UpdateModalClass } from '@/routes/components/ModalProvider';
import DetailModal from './DetailModal';
import { tableDS } from './ds';

const organizationId = getCurrentOrganizationId();

@withCustomize({
  unitCode: [
    'SMODR.PAYMENT.TRADING.ALL',
    'SMODR.PAYMENT.TRADING.DETAIL',
    'SMODR.PAYMENT.TRADING.RETURNED',
  ],
})
@formatterCollections({
  code: ['smodr.deal', 'smodr.orderLine', 'smodr.payment'],
})
@withRouter
export default class DealRecord extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      containerRef: null,
    };
  }

  initDs = new DataSet(tableDS());

  attDs = new DataSet({
    fields: [
      {
        name: 'attachmentUuid',
        type: 'attachment',
        label: <span>{intl.get('smodr.deal.view.detail.payDoc').d('汇款凭证')}</span>,
        max: 10,
      },
    ],
  });

  detailModal;

  componentDidMount() {
    this.setState({ containerRef: this.containerRef });
    Modal.destroyAll();
  }

  @Bind()
  handleRef(ref = {}) {
    this.detailModal = ref;
  }

  @Bind()
  openTips(record) {
    const ds = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'accountLov',
          type: 'object',
          lovCode: 'S2FUL.COMPANY_BANK_ACCOUNT',
          lovPara: { companyId: record.get('purchaseCompanyId') },
          label: intl.get('smodr.deal.view.detail.bankAccount').d('银行账户'),
          required: true,
        },
        {
          name: 'payBankFirm',
          type: 'string',
          required: true,
          bind: 'accountLov.payBankFirm',
          label: intl.get('smodr.deal.view.detail.bankNum').d('银行大额支付行号'),
        },
      ],
    });
    Modal.confirm({
      title: intl.get('smodr.deal.view.chooseBank').d('选择银行信息'),
      style: { width: 560 },
      children: (
        <div style={{ marginTop: '16px' }}>
          <Form dataSet={ds} labelLayout="float">
            <Lov name="accountLov" />
            <TextField name="payBankFirm" />
          </Form>
          <div style={{ marginTop: '16px' }}>
            <Icon
              type="error"
              style={{ fontSize: '13px', color: '#F88D10', marginRight: '10px' }}
            />
            <span style={{ color: 'rgba(0,0,0,0.65)' }}>
              {intl
                .get('smodr.deal.view.tips')
                .d('线下汇款支付单需填写支付渠道合单号、支付渠道结算流水号。')}
            </span>
          </div>
        </div>
      ),
      onOk: async () => {
        const flag = await ds.validate();
        if (flag) {
          const param = ds?.current?.get('accountLov');
          delete param.__dirty;
          const res = getResponse(
            await handleSubmitPay({ paymentId: record.get('paymentId'), ...param })
          );
          if (res && !res.failed) {
            this.initDs.query();
            notification.success();
          }
        } else {
          return false;
        }
      },
    });
  }

  @Bind()
  async handleSubmit(record, modal = {}) {
    const attachmentUuid = this.attDs?.current?.get('attachmentUuid');
    const param = { paymentId: record.get('paymentId'), attachmentUuid };
    const res = getResponse(await handleSubmit(param));
    if (res && !res.failed) {
      this.initDs.query();
      modal.close();
    }
  }

  @Bind()
  handleDetailModal(record = {}, value) {
    const { openModal, setModalValue } = value;
    const { customizeForm } = this.props;
    const modal = openModal({
      title: intl.get('smodr.deal.view.payDealDetail').d('交易记录详情'),
      mask: false,
      drawer: true,
      closable: true,
      closeOnLocationChange: false,
      resizable: true,
      customizable: true,
      key: '1',
      style: {
        minWidth: '50vw',
      },
      customizedCode: 'DEAL_RECORD_EXECUTE_MODAL',
      children: <DetailModal record={record} attDs={this.attDs} customizeForm={customizeForm} />,
      footer: (
        <>
          <Button color="primary" onClick={() => this.handleSubmit(record, modal)}>
            {intl.get('smodr.deal.view.save').d('保存')}
          </Button>
          <Button onClick={() => modal?.close()}>
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>
        </>
      ),
      onClose: () => {
        setModalValue('');
      },
    });
  }

  render() {
    const { containerRef } = this.state;
    const { customizeTable } = this.props;
    const colorStyle = (record) => {
      if (record?.get('status') === 'ALL_PAYMENT' || record?.get('status') === 'PAID') {
        return 'green';
      } else {
        return 'yellow'; // 黄
      }
    };
    const columns = [
      {
        name: 'statusMeaning',
        width: 100,
        renderer: ({ value, record }) => {
          return <Tag color={colorStyle(record)} style={{ border: 'none' }}>{value}</Tag>;
        },
      },
      {
        name: 'operation',
        renderer: ({ record }) => {
          if (
            record.get('typeCode') === 'REMITTANCE_PAYMENT' &&
            record.get('status') === 'PAYMENT_PROCESSING'
          ) {
            return (
              <Button color="primary" funcType="link" onClick={() => this.openTips(record)}>
                {intl.get('smodr.deal.view.submitPay').d('确认支付')}
              </Button>
            );
          } else {
            return <span>-</span>;
          }
        },
      },
      {
        name: 'code',
        width: 180,
        renderer: ({ record, value: val }) => (
          <Store.Consumer>
            {(value) => <a onClick={() => this.handleDetailModal(record, value)}>{val}</a>}
          </Store.Consumer>
        ),
      },
      { name: 'cecSerialNumber', width: 150 },
      { name: 'operationTypeMeaning', width: 100 },
      { name: 'channelMeaning' },
      { name: 'currencyName' },
      { name: 'amountMeaning', align: 'right' },
      { name: 'operationTime' },
      { name: 'payerName' },
      { name: 'receiverName' },
    ];

    const fieldValuesFn = (ds) => {
      if (ds.selected.length > 0) {
        const fieldValues = ds?.queryDataSet?.current?.toJSONData();
        delete fieldValues.__dirty;
        delete fieldValues.__id;
        delete fieldValues._status;
        const paymentIds = ds.selected.map((i) => i.toData()).map((item) => item.paymentId);
        fieldValues.paymentIds = paymentIds;
        return filterNullValueObject(fieldValues);
      } else {
        const fieldValues = ds.getQueryParameter('filterParams');
        return filterNullValueObject(fieldValues);
      }
    };

    const menu = (
      <Menu>
        <Menu.Item style={{ padding: 0 }}>
          <ExcelExportPro
            requestUrl={`${SMALL_ORDER}/v1/${organizationId}/trading-record/detail-export`}
            queryParams={() => {
              const query = fieldValuesFn(this.initDs);
              return query;
            }}
            templateCode="SRM_C_SRM_S2FUL_PAYMENT_RECORD_DETAIL"
            buttonText={intl.get('smodr.orderLine.view.exportDetail').d('明细导出')}
            otherButtonProps={{
              icon: '',
              type: 'c7n-pro',
              style: { border: 'none', fontWeight: 400 },
            }}
          />
        </Menu.Item>
        <Menu.Item style={{ padding: 0 }}>
          <ExcelExportPro
            requestUrl={`${SMALL_ORDER}/v1/${organizationId}/trading-record/list-export`}
            queryParams={() => {
              const query = fieldValuesFn(this.initDs);
              return filterNullValueObject(query);
            }}
            templateCode="SRM_C_SRM_S2FUL_PAYMENT_RECORD_EXPORT"
            buttonText={intl.get('smodr.orderLine.view.exportWhole').d('整单导出')}
            otherButtonProps={{
              icon: '',
              type: 'c7n-pro',
              style: { border: 'none', fontWeight: 400 },
            }}
          />
        </Menu.Item>
      </Menu>
    );

    return (
      <div
        ref={(ref) => {
          this.containerRef = ref;
        }}
      // style={{ height: '100vh' }}
      >
        <UpdateModalClass location={this.props.location} containerRef={containerRef}>
          <Header title={intl.get('smodr.deal.view.dealRecord').d('交易记录')}>
            <Dropdown overlay={menu} placement="bottomLeft">
              <Button funcType="flat" icon="unarchive">
                {intl.get('smodr.deal.view.export').d('导出')}
                <Icon
                  type="expand_more"
                  style={{
                    marginLeft: 4,
                    marginTop: -2,
                    fontSize: '16px',
                  }}
                />
              </Button>
            </Dropdown>
          </Header>
          <Content>
            <div style={{ height: 'calc(100vh - 190px)' }}>
              {customizeTable(
                { code: 'SMODR.PAYMENT.TRADING.ALL' },
                <SearchBarTable
                  dataSet={this.initDs}
                  columns={columns}
                  style={{ maxHeight: `calc(100% - 22px)` }}
                  searchCode="SMODR.PAYMENT.TRADING.SELECT"
                  customizedCode="SMODR.DEAL.RECORD.SELECT"
                  searchBarConfig={{
                    onQuery: ({ params }) => {
                      this.initDs.setQueryParameter('filterParams', params);
                      this.initDs.query();
                    },
                  }}
                />
              )}
            </div>
          </Content>
        </UpdateModalClass>
      </div>
    );
  }
}
