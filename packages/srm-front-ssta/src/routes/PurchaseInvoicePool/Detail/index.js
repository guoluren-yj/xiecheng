import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { DataSet, Table, Modal, Button, Attachment } from 'choerodon-ui/pro';
import { Spin, Card, Collapse } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import querystring from 'querystring';
import intl from 'utils/intl';
import withRemote from 'utils/remote';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';

import ExcelExport from 'components/ExcelExport';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { formatDynamicBtns, previewFile } from '@/utils/utils';
import InvoiceRecord from '@/routes/Components/InvoiceRecord';
import CommonForm from '../Components/CommonForm';
import { formDs, tableDs } from './mainDS';
import { operationDS } from '../../pubDS/operationDS';

import commonStyles from '@/routes/common.less';

const customizeUnitCodes = {
  basic: 'SSTA.PURCHASE_INVOICE_POOL_DETAIL.BASIC',
  purchase: 'SSTA.PURCHASE_INVOICE_POOL_DETAIL.PURCHASE_INFO',
  supply: 'SSTA.PURCHASE_INVOICE_POOL_DETAIL.SUPPLY_INFO',
  other: 'SSTA.PURCHASE_INVOICE_POOL_DETAIL.OTHER_INFO',
  file: 'SSTA.PURCHASE_INVOICE_POOL_DETAIL.FILE_INFO',
};

const otherCustomizeUnitCodes = {
  line: 'SSTA.PURCHASE_INVOICE_POOL_DETAIL.LINE_LIST',
  btn: 'SSTA.PURCHASE_INVOICE_POOL_DETAIL.HEADER_BTNS',
};

const { Panel } = Collapse;

const Headers = observer(({ handleRecord, props }) => {
  const routerParams = querystring.parse(location.search.substr(1));

  const { invoiceHeaderId = null, status = '', layoutType = '' } = routerParams;
  let url = '/ssta/purchase-invoice-pool/list';
  if (status) url = `${url}?status=${status}&layoutType=${layoutType}`;
  const btns = [
    {
      name: 'export',
      btnComp: ExcelExport,
      childFor: 'buttonText',
      child: intl.get('hzero.common.export').d('导出'),
      btnProps: {
        otherButtonProps: { type: 'c7n-pro', funcType: 'flat', icon: 'unarchive' },
        requestUrl: `/ssta/v1/${getCurrentOrganizationId()}/invoice-header/export/${invoiceHeaderId}`,
        queryParams: {
          invoiceHeaderId,
          customizeUnitCode: `${Object.values({
            ...customizeUnitCodes,
          }).join()},${otherCustomizeUnitCodes.line}`,
        },
      },
    },
    {
      name: 'operate',
      child: intl.get('hzero.common.button.operating').d('操作记录'),
      btnProps: {
        icon: 'operation_service_request',
        funcType: 'flat',
        color: 'default',
        onClick: handleRecord,
      },
    },
  ];
  const { customizeBtnGroup } = props;
  return (
    <Header title={intl.get('ssta.invoiceSheet.costDetail').d('发票详情')} backPath={url}>
      {customizeBtnGroup(
        { code: otherCustomizeUnitCodes.btn, pro: true },
        <DynamicButtons maxNum={5} defaultBtnType="c7n-pro" buttons={formatDynamicBtns(btns)} />
      )}
    </Header>
  );
});

@withRemote({
  code: 'SSTA_PURCHASE_INVOICE_POOL_DETAIL',
  name: 'remote',
})
@withCustomize({
  unitCode: Object.values({ ...customizeUnitCodes, ...otherCustomizeUnitCodes }),
})
@formatterCollections({
  code: [
    'ssta.invoiceSheet',
    'ssta.costSheet',
    'entity.attachment',
    'ssta.settlePool',
    'sbud.budgeting',
    'hzero.common',
    'ssta.common',
  ],
})
class index extends Component {
  formDs = new DataSet(formDs());

  tableDs = new DataSet(tableDs());

  titleMap = {
    basic: intl.get(`ssta.costSheet.view.message.panel.baseInfos`).d('基本信息'),
    purchase: intl.get(`ssta.costSheet.view.message.panel.purchaseInfos`).d('购方信息'),
    supply: intl.get(`ssta.costSheet.view.message.panel.supplyInfos`).d('销方信息'),
    other: intl.get(`ssta.costSheet.view.message.panel.otherInfos`).d('其他信息'),
    file: intl.get(`ssta.common.view.title.fileInfo`).d('文件信息'),
  };

  constructor(props) {
    super(props);
    const routerParams = querystring.parse(props.location.search.substr(1));
    const { invoiceHeaderId = null } = routerParams;
    this.state = {
      invoiceHeaderId,
    };
    this.operationDs = new DataSet(
      operationDS({
        url: `/ssta/v1/${getCurrentOrganizationId()}/invoice-action/${invoiceHeaderId}`,
        pk: 'invoiceHeaderId',
        lookupCode: 'SSTA.INVOICE_ACTION_STATUS',
        lovPara: { invoiceHeaderId },
        isFilter: true,
      })
    );
  }

  componentDidMount() {
    const { invoiceHeaderId } = this.state;

    this.tableDs.setQueryParameter('invoiceHeaderId', invoiceHeaderId);
    this.tableDs.setQueryParameter('customizeUnitCode', otherCustomizeUnitCodes.line);
    this.formDs.setQueryParameter('invoiceHeaderId', invoiceHeaderId);
    this.formDs.setQueryParameter('customizeUnitCode', Object.values(customizeUnitCodes).join());
    this.tableDs.query();

    this.formDs.query();

    this.setState({
      loading: false,
    });
  }

  /**
   * 操作记录
   * @param {记录} record
   */
  @Bind()
  openOprationModal() {
    const { invoiceHeaderId } = this.state;
    this.operationDs.setQueryParameter('invoiceHeaderId', invoiceHeaderId);
    this.operationDs.setQueryParameter('size', 0);
    Modal.open({
      title: intl.get('hzero.common.button.operating').d('操作记录'),
      drawer: true,
      destroyOnClose: true,
      className: commonStyles['ssta-medium-modal'],
      children: <InvoiceRecord record={{}} invoiceHeaderId={invoiceHeaderId} operationDs={this.operationDs} isFilter />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }

  @Bind()
  handleViewOfdFile(jpgUrl, record) {
    const { ofdFileUrl, associatedApplyNum } = record?.get(['ofdFileUrl', 'associatedApplyNum']) || {};
    if (ofdFileUrl && associatedApplyNum) {
      const linkDom = document.createElement('a');
      linkDom.href = ofdFileUrl;
      linkDom.target = '_blank';
      linkDom.click();
      return;
    }
    return previewFile(jpgUrl, { originFileUrl: ofdFileUrl });
  }

  render() {
    const { loading } = this.state;
    const { customizeForm, customizeTable, remote } = this.props;
    const aiAttachmentUrl = this.formDs.current?.get('aiAttachmentUrl');
    const listColumns = [
      {
        name: 'lineNum',
        width: 150,
      },
      {
        name: 'itemName',
        width: 240,
      },
      {
        name: 'netAmount',
        width: 150,
      },
      {
        name: 'quantity',
        width: 150,
      },
      {
        name: 'taxRate',
        width: 150,
      },
      {
        name: 'taxAmount',
        width: 150,
      },
      {
        name: 'taxIncludedPrice',
        width: 150,
      },
      {
        name: 'taxIncludedAmount',
        width: 150,
      },
      {
        name: 'netPrice',
        width: 150,
      },

      {
        name: 'spec',
        width: 150,
      },

      {
        name: 'uom',
        width: 150,
      },
      // {
      //   name: 'expenseItem',
      //   width: 150,
      // },
      {
        name: 'plateNo',
        width: 150,
      },
      {
        name: 'trafficType',
        width: 150,
      },
      {
        name: 'trafficDateStart',
        width: 170,
      },
      {
        name: 'trafficDateEnd',
        width: 170,
      },
    ];

    const basicColumns = [
      'invoiceCode',
      'invoiceNum',
      'invoicingDate',
      'invoiceTypeMeaning',
      'sumCheckTimes',
      'checkTimes',
      'checkCode',
      'netAmount',
      'taxAmount',
      'taxIncludedAmount',
    ];
    const purchaseColumns = ['companyName', 'purUnifiedSocialCode', 'purAccount', 'purAddrAndTel'];
    const supplyColumns = ['supplierCompanyName', 'supUnifiedSocialCode', 'supAccount', 'supAddrAndTel'];
    const otherColumns = [
      'drawer',
      'payee',
      'reviewer',
      'remark',
      'tollFlag',
      'invalidFlagMeaning',
      'invoiceSpecialMark',
      'machineNum',
      'buyerContact',
      'sellerContact',
      'beneficiaryBank',
      'beneficiaryAccountNum',
      'beneficiaryAccountName',
      'beneficiaryBankAddress',
      'paymentTerms',
    ];
    const fileColumns = [
      'fileUrl',
      {
        name: 'jpgUrl',
        renderer: ({ value, record }) => {
          const originFileUrl = record?.get('ofdFileUrl');
          return (
            (value || originFileUrl) && (
              <Button funcType="link" onClick={() => this.handleViewOfdFile(value, record)}>
                {intl.get('hzero.common.button.view').d('查看')}
              </Button>
            )
          );
        },
      },
      'xmlSourceFileUrl',
      {
        name: 'ocrFileUrl',
        renderer: ({ value }) => {
          return (
            value && (
              <Button funcType="link" onClick={() => previewFile(value)}>
                {intl.get('hzero.common.button.view').d('查看')}
              </Button>
            )
          );
        },
      },
      aiAttachmentUrl && {
        name: 'aiAttachmentUrl',
        renderer: ({ value }) => {
          return (
            value && (
              <Button funcType="link" onClick={() => previewFile(value)}>
                {intl.get('hzero.common.button.view').d('查看')}
              </Button>
            )
          );
        },
      },
      { name: 'attachmentUuid', editor: Attachment },
    ];
    const headerColumns = {
      basic: basicColumns,
      purchase: purchaseColumns,
      supply: supplyColumns,
      other: otherColumns,
      file: fileColumns,
    };

    const cardList = Object.entries(this.titleMap).map(([key, value]) => {
      return {
        key,
        title: value,
        content: (
          <CommonForm
            dataSet={this.formDs}
            editorColumns={headerColumns[key]}
            customizeForm={customizeForm}
            customizeCode={customizeUnitCodes[key]}
          />
        ),
      };
    });

    const panelList = (() => {
      const normalList = [
        {
          key: 'head',
          header: intl.get('ssta.invoiceSheet.view.title.invoiceHeaderInfo').d('发票头信息'),
          content: (
            <Fragment>
              {cardList.map((item) => {
                const { key, title, content } = item;
                return (
                  <Card key={key} bordered={false} className={DETAIL_CARD_CLASSNAME} title={title}>
                    {content}
                  </Card>
                );
              })}
            </Fragment>
          ),
        },
        {
          key: 'line',
          header: intl.get('ssta.invoiceSheet.view.title.invoiceHeaderLineInfo').d('发票行信息'),
          content: customizeTable(
            {
              code: otherCustomizeUnitCodes.line,
            },
            <Table
              columns={listColumns}
              dataSet={this.tableDs}
              queryFieldsLimit={3}
              selectionMode="none"
              style={{ maxHeight: 430 }}
            />
          ),
        },
      ];
      return remote ? remote.process('SSTA_PURCHASE_INVOICE_POOL_DETAIL_PANELIST', normalList, {}) : normalList;
    })();

    const defaultActiveKey = panelList.map((item) => item.key);

    return (
      <Fragment>
        <Headers dataSet={this.formDs} handleRecord={this.openOprationModal} props={this.props} />
        <Content className={commonStyles[`collapse-content`]} wrapperClassName={commonStyles[`collapse-content-wrap`]}>
          <Spin spinning={loading}>
            <Collapse ghost trigger="icon" expandIconPosition="text-right" defaultActiveKey={defaultActiveKey}>
              {panelList.map((item) => {
                const { content, ...panelProps } = item;
                return (
                  <Panel forceRender showArrow={false} {...panelProps}>
                    {content}
                  </Panel>
                );
              })}
            </Collapse>
          </Spin>
        </Content>
      </Fragment>
    );
  }
}

export default index;
