import React, { Fragment, Component } from 'react';
import { DataSet, Button, Form, Spin, TextArea, Modal, Rate, Attachment } from 'choerodon-ui/pro';
import { AFBasic, AFExtra } from 'srm-front-boot/lib/components/AFCards';
import qs from 'querystring';
import { Bind } from 'lodash-decorators';
import { yesOrNoRender } from 'utils/renderer';
import { Content } from 'components/Page';
import { PRIVATE_BUCKET } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import ImageList from '@/routes/components/ImageList';
import intl from 'utils/intl';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DocFlow from '_components/DocFlow';
import { handleEvaluate, handleSave } from '@/services/ReceipWorkbenchService';
import { queryDoubleUomConfig } from '@/services/sinvCommonService';
import { btnNumber, c7nModal } from './util';
import DynamicButtons from '_components/DynamicButtons';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import CustomModal from './component/CustomModal/CustomModal';
import { formDS, tableDS, batchMaintenanceDS, formRateDS, attachmentDS } from './store/lineDS';
import Operaindex from './component/Operating/index';
import CustomLinkIndex from '@/routes/components/CustomModal';
import styles from './index.less';
import {
  showBigNumber,
  queryCalcRuleConfig,
  useDoubleUomConfig,
  // useDoubleUomConfigWork,
} from '@/routes/components/utils';

const STAGE_CODE = 'WOKRFLOW_UNIT';

@useDoubleUomConfig()
@WithCustomize({
  // unitCode: ['SINV.RECEIPT_WORKBENCH_NEW_WORKFLO.FILTER'],
  isTemplate: true,
})
@formatterCollections({
  code: [
    'sinv.receiptExecution',
    'hzero.common',
    'sinv.receiptWorkbench',
    'sinv.common',
    'sinv.deliveryCreation',
  ],
})
export default class ExecutionDetail extends Component {
  formRateDs = new DataSet(formRateDS());

  batchMaintenanceDs = new DataSet(batchMaintenanceDS());

  attachmentDs = new DataSet(attachmentDS());

  constructor(props) {
    super(props);

    const {
      match: { params = {}, path },
      location: { search },
      doubleUnitEnabled,
    } = this.props;
    const { type } = qs.parse(search.substr(1));
    this.formDs = new DataSet(formDS(doubleUnitEnabled));
    this.tableDs = new DataSet(tableDS(this.formDs, doubleUnitEnabled));
    this.tableDs.setState('doubleUnitEnabled', doubleUnitEnabled);
    this.batchMaintenanceDs.bind(this.tableDs, 'tablesDs');
    this.state = {
      type,
      returnedFlag: 0,
      spinning: false,
      rcvTrxHeaderId: params.rcvTrxHeaderId,
      sourceFromPub: path.includes('pub'),
      tplInfo: {},
      totalTaxIncludedAmount: 0,
    };
  }

  // 查询金额计算配置
  @Bind()
  async fetchCalcRuleConfig() {
    const result = await queryCalcRuleConfig();
    this.tableDs.setState('amountCalcRule', result);
  }

  @Bind
  handleRefresh() {
    const { rcvTrxHeaderId, tplInfo } = this.state;
    const { onFormLoaded } = this.props;
    this.fetchCalcRuleConfig();
    this.formDs.setQueryParameter('tplInfo', tplInfo);
    this.formDs.setQueryParameter('params', {
      rcvTrxHeaderId,
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_NEW_WORKFLO.BASIC_CARD,SINV.RECEIPT_WORKBENCH_NEW_WORKFLO.COMPANY_CARD,SINV.RECEIPT_WORKBENCH_NEW_WORKFLO.DETAIL_ATTACHMENT`,
    });
    this.formDs.query().then((res) => {
      if (res && !res.failed) {
        this.attachmentDs.loadData([res]);
        this.formDs.loadData([res]);
        this.setState({
          rcvStatusCode: res.rcvStatusCode,
          returnedFlag: res.returnedFlag,
          totalTaxIncludedAmount: res.totalTaxIncludedAmount,
        });
      }
    });
    this.tableDs.setQueryParameter('tplInfo', tplInfo);
    this.tableDs.setQueryParameter('params', {
      rcvTrxHeaderId,
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_NEW_WORKFLO.DETAIL_LINEINFO,SINV.RECEIPT_WORKBENCH_NEW_WORKFLO.DETAIL.LINE_SEARCH_A`,
    });
    this.tableDs.query().then((res) => {
      this.tableDs.loadData(res.content);
      if (onFormLoaded) {
        onFormLoaded(true);
      }
    });
  }

  componentDidMount() {
    // this.handleRefresh();
    const { sourceFromPub } = this.state;
    const { onLoad, queryTemplateConfig, workflowTemplateProps = {} } = this.props;
    console.log(workflowTemplateProps, 'workflowTemplateProps');
    queryDoubleUomConfig().then((res) => {
      if (res) {
        const num = [1, 2].includes(res) ? res : 0;
        this.formDs = new DataSet(formDS(num));
        this.tableDs = new DataSet(tableDS(this.formDs, num));
        this.tableDs.setState('doubleUnitEnabled', num);
        this.batchMaintenanceDs.bind(this.tableDs, 'tablesDs');
      }
    });
    // 二开工作流提供保存接口
    if (sourceFromPub && onLoad) {
      onLoad({
        submit: this.workFlowApproval,
      });
      // if (onFormLoaded) {
      //   onFormLoaded(true);
      // }
    }
    this.setState(
      {
        tplInfo: {
          cuszTplStageCode: STAGE_CODE,
          cuszTplPageCode: 'DELIVERY_WORKBENCH.DETAIL_WORKS_NEW',
          templateCode: workflowTemplateProps?.templateCode,
          templateVersion: workflowTemplateProps?.templateVersion,
        },
      },
      () => {
        const workflowParams = {
          stageCode: workflowTemplateProps?.stageCode,
          pageCode: workflowTemplateProps?.pageCode,
          templateCode: workflowTemplateProps?.templateCode,
          templateVersion: workflowTemplateProps?.templateVersion,
        };
        queryTemplateConfig(
          Promise.resolve({
            templateVersion: workflowTemplateProps?.templateVersion,
            templateCode: workflowTemplateProps?.templateCode,
          }),
          workflowParams
        ).then(() => {
          this.handleRefresh();
        });
      }
    );
  }

  @Bind()
  workFlowApproval() {
    return new Promise(async (resolve, reject) => {
      const { rcvTrxHeaderId, sourceFromPub, tplInfo } = this.state;
      const fromFlag = await this.formDs.validate();
      const lineFlag = await this.tableDs.validate();
      const uuidFlag = await this.attachmentDs.validate();
      const saveData = {
        tplInfo,
        customizeUnitCode: `SINV.RECEIPT_WORKBENCH_NEW_WORKFLO.BASIC_CARD,SINV.RECEIPT_WORKBENCH_NEW_WORKFLO.COMPANY_CARD,SINV.RECEIPT_WORKBENCH_NEW_WORKFLO.DETAIL_ATTACHMENT,SINV.RECEIPT_WORKBENCH_NEW_WORKFLO.DETAIL_LINEINFO`,
        data: {
          ...this.formDs.toData()[0],
          saveMethod: sourceFromPub ? 'WFL' : undefined,
          sinvHeaderAttachmentUuid: this.attachmentDs.toData()[0].sinvHeaderAttachmentUuid,
          sinvRcvTrxLineDTOS: this.tableDs
            .toJSONData()
            .map((m) => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId })),
        },
      };
      if (!saveData.data._token) return false;
      if (lineFlag && uuidFlag && fromFlag) {
        // 已完成tab页需要校验字段
        this.setState({ spinning: true });
        const res = await handleSave(saveData).finally(() => {
          this.setState({ spinning: false });
        });
        if (getResponse(res)) {
          resolve();
          this.formDs.query();
          this.tableDs.query(null, null, false);
          this.formRateDs.setQueryParameter('tplInfo', tplInfo);
          this.formRateDs.setQueryParameter('params', {
            rcvTrxHeaderId,
            customizeUnitCode: `SINV.RECEIPT_WORKBENCH_NEW_WORKFLO.DETAIL_RATE`,
          });
        } else {
          reject();
        }
      } else {
        reject();
      }
    });
  }

  /*
   *操作记录打开
   */
  operaChange = () => {
    const { rcvTrxHeaderId } = this.state;
    const operaRecord = { data: { rcvTrxHeaderId } };
    const operaProps = {
      operaRecord,
    };
    c7nModal({
      title: intl.get('sinv.common.model.common.operationRecord').d('操作记录'),
      closable: false,
      style: {
        width: '742px',
      },
      okCancel: false,
      children: <Operaindex {...operaProps} />,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  @Bind()
  handRate() {
    const { customizeForm } = this.props;
    const { rcvStatusCode, rcvTrxHeaderId, sourceFromPub, tplInfo } = this.state;
    this.formRateDs.reset();
    this.formRateDs.setQueryParameter('tplInfo', tplInfo);
    this.formRateDs.setQueryParameter('params', {
      rcvTrxHeaderId,
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_NEW_WORKFLO.DETAIL_RATE`,
    });
    this.formRateDs.query();
    const Comp = () => {
      return (
        <Spin dataSet={this.formRateDs}>
          <div className={styles['rate-all']}>
            {customizeForm(
              {
                code: `SINV.RECEIPT_WORKBENCH_NEW_WORKFLO.DETAIL_RATE`,
                readOnly: rcvStatusCode === '20_SUBMITTED',
                disableOutput: 'Output',
                dataSet: this.formRateDs,
                __force_record_to_update__: true,
              },
              <Form columns={1} labelLayout="float" dataSet={this.formRateDs}>
                <Rate
                  className={styles['rate-score']}
                  name="overallScore"
                  allowHalf
                  disabled={['20_SUBMITTED'].includes(rcvStatusCode)}
                />
                <TextArea
                  className={styles['rate-text']}
                  name="overallEvaluate"
                  resize="both"
                  cols={60}
                  autoSize={{ minRows: 2, maxRows: 8 }}
                  disabled={['20_SUBMITTED'].includes(rcvStatusCode)}
                />
                <Rate
                  className={styles['rate-score']}
                  name="deliveryScore"
                  allowHalf
                  disabled={['20_SUBMITTED'].includes(rcvStatusCode)}
                />
                <TextArea
                  className={styles['rate-text']}
                  name="deliveryEvaluate"
                  resize="both"
                  cols={60}
                  autoSize={{ minRows: 2, maxRows: 8 }}
                  disabled={['20_SUBMITTED'].includes(rcvStatusCode)}
                />
                <Rate
                  className={styles['rate-score']}
                  name="qualityScore"
                  allowHalf
                  disabled={['20_SUBMITTED'].includes(rcvStatusCode)}
                />
                <TextArea
                  className={styles['rate-text']}
                  name="qualityEvaluate"
                  resize="both"
                  cols={60}
                  autoSize={{ minRows: 2, maxRows: 8 }}
                  disabled={['20_SUBMITTED'].includes(rcvStatusCode)}
                />
                <Rate
                  className={styles['rate-score']}
                  name="serviceScore"
                  allowHalf
                  disabled={['20_SUBMITTED'].includes(rcvStatusCode)}
                />
                <TextArea
                  className={styles['rate-text']}
                  name="serviceEvaluate"
                  resize="both"
                  cols={60}
                  autoSize={{ minRows: 2, maxRows: 8 }}
                  disabled={['20_SUBMITTED'].includes(rcvStatusCode)}
                />
              </Form>
            )}
          </div>
        </Spin>
      );
    };
    Modal.open({
      closable: sourceFromPub,
      mask: true,
      drawer: true,
      style: { width: '380px' },
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      title: intl.get(`sinv.common.view.message.button.rate`).d('评价'),
      children: <Comp />,
    });
  }

  @Bind()
  async handleRateOk() {
    const { rcvTrxHeaderId } = this.state;
    const rateList = { ...this.formRateDs.toData()[0] };
    const params = {
      rcvTrxHeaderId,
      ...rateList,
      overallScore: rateList.overallScore === 0 ? null : rateList.overallScore,
      deliveryScore: rateList.deliveryScore === 0 ? null : rateList.deliveryScore,
      qualityScore: rateList.qualityScore === 0 ? null : rateList.qualityScore,
      serviceScore: rateList.serviceScore === 0 ? null : rateList.serviceScore,
    };
    const flag = await this.formRateDs.validate();
    if (flag) {
      handleEvaluate(params);
    } else {
      return false;
    }
  }

  // 编辑弹框
  @Bind()
  onOpenLinkChange = (record = {}, linkOrder = null, header) => {
    const {
      workflowTemplateProps,
      customizeTable,
      customizeBtnGroup,
      queryUnitConfig,
    } = this.props;
    const { rcvStatusCode, tplInfo = {} } = this.state;
    const basicProps = {
      header,
      tplInfo,
      chart: false,
      rcvStatusCode,
      type: linkOrder,
      customizeTable,
      customizeBtnGroup,
      workflowTemplateProps,
      queryUnitConfig,
      nodeConfigIndexAbc: this.formDs?.toData()[0]?.nodeConfigIndexAbc,
      ...record?.get(['rcvTrxHeaderId', 'rcvTrxLineId', 'returnedFlag']),
    };
    const modal = Modal.open({
      drawer: true,
      style: { width: '852px' },
      children: <CustomLinkIndex {...basicProps} />,
      footer: (
        <Button color="primary" onClick={() => modal.close()}>
          {intl.get('hzero.common.status.closed').d('关闭')}
        </Button>
      ),
    });
  };

  getColumns = () => {
    const { type, rcvStatusCode, returnedFlag, tplInfo } = this.state;
    const { doubleUnitEnabled } = this.props;
    const columns = {
      action: [
        {
          name: 'action',
          width: 160,
          renderer: ({ record }) => {
            return (
              <a onClick={() => this.splitLine(record)}>
                {intl.get(`sinv.deliveryCreation.view.button.split`).d('拆分')}
              </a>
            );
          },
        },
      ],
      other: [
        {
          name: 'itemCode',
          width: 160,
          sortable: true,
        },
        {
          name: 'itemName',
          width: 160,
        },
        doubleUnitEnabled && {
          name: 'secondaryUomId',
          width: 180,
          renderer: ({ record }) => record.get('secondaryUomName'),
          header: intl.get('sinv.receiptExecution.model.receipt.secondaryUomName').d('单位'),
        },
        {
          name: 'uomName',
          width: 150,
        },
        doubleUnitEnabled && {
          name: 'secondaryQuantity',
          width: 120,
          header:
            returnedFlag === 0
              ? intl.get('sinv.receiptExecution.model.receipt.exec.quantity').d('执行数量')
              : intl.get('sinv.receiptExecution.model.receipt.return.quantitys').d('退货数量'),
          renderer: ({ value }) => showBigNumber(value),
        },
        doubleUnitEnabled && {
          name: 'secondaryLeftQuantity',
          width: 100,
          renderer: ({ value }) => showBigNumber(value),
          header:
            returnedFlag === 0
              ? intl.get('sinv.receiptExecution.model.receipt.leftQuantity').d('可执行数量')
              : intl
                  .get('sinv.receiptExecution.model.receipt.canLeftSecondaryLeftQuantity')
                  .d('可退货数量'),
        },
        {
          name: 'quantity',
          width: 120,
          renderer: ({ value }) => showBigNumber(value),
          header:
            returnedFlag === 0
              ? doubleUnitEnabled
                ? intl
                    .get('sinv.receiptExecution.model.receipt.exec.baseQuantity')
                    .d('执行基本数量')
                : intl.get('sinv.receiptExecution.model.receipt.exec.quantity').d('执行数量')
              : doubleUnitEnabled
              ? intl
                  .get('sinv.receiptExecution.model.receipt.return.baseQuantity')
                  .d('退货基本数量')
              : intl.get('sinv.receiptExecution.model.receipt.return.quantitys').d('退货数量'),
        },
        {
          name: 'leftQuantity',
          width: 120,
          renderer: ({ value }) => showBigNumber(value),
          header:
            returnedFlag === 0
              ? doubleUnitEnabled
                ? intl
                    .get('sinv.receiptExecution.model.receipt.baseLeftQuantity')
                    .d('可执行基本数量')
                : intl.get('sinv.receiptExecution.model.receipt.leftQuantity').d('可执行数量')
              : doubleUnitEnabled
              ? intl
                  .get('sinv.receiptExecution.model.receipt.canLeftBaseQuantity')
                  .d('可退货基本数量')
              : intl.get('sinv.receiptExecution.model.receipt.canLeftQuantitys').d('可退货数量'),
        },
        {
          name: 'taxIncludedAmount',
          width: 130,
          renderer: ({ value, record }) =>
            record.get('hidePriceFlag') === 1
              ? '***'
              : showBigNumber(value, record.get('financialPrecision')),
          header:
            returnedFlag === 0
              ? intl
                  .get('sinv.receiptExecution.model.receipt.taxIncludedAmount')
                  .d('执行金额(含税)')
              : intl
                  .get('sinv.receiptExecution.model.receipt.returnTaxIncludedAmounts')
                  .d('退货金额'),
        },
        {
          name: 'leftTaxAmount',
          width: 120,
          renderer: ({ value, record }) =>
            record.get('hidePriceFlag') === 1
              ? '***'
              : showBigNumber(value, record.get('financialPrecision')),
          header:
            returnedFlag === 0
              ? intl
                  .get('sinv.receiptExecution.model.receipt.leftTaxAmount.tax')
                  .d('可执行金额(含税)')
              : intl.get('sinv.receiptExecution.model.receipt.canLeftTaxAmounts').d('可退货金额'),
        },
        {
          name: 'trxDate',
          width: 160,
          sortable: true,
        },
        {
          name: 'invOrganizationName',
          width: 150,
        },
        {
          name: 'inventoryId',
          width: 160,
        },
        {
          name: 'locatorId',
          width: 160,
        },
        {
          name: 'fromDisplayPoNum',
          width: 170,
          renderer: ({ value, record }) =>
            value && <span>{`${value}-${record.get('fromDisplayPoLineNum')}`}</span>,
          sortable: true,
        },
        {
          name: 'fromPcNum',
          width: 170,
          renderer: ({ value, record }) =>
            value && <span>{`${value}-${record.get('fromPcSubjectNum')}`}</span>,
          sortable: true,
        },
        {
          name: 'fromDisplayAsnNum',
          width: 170,
          renderer: ({ value, record }) =>
            value && <span>{`${value}-${record.get('fromDisplayAsnLineNum')}`}</span>,
          sortable: true,
        },
        {
          name: 'fromOrderTypeName',
          width: 135,
        },
        {
          name: 'fromDisplayTrxNum',
          width: 170,
          renderer: ({ value, record }) =>
            value && <span>{`${value}-${record.get('fromDisplayTrxLineNum')}`}</span>,
          sortable: true,
        },
        {
          name: 'productNum',
          width: 150,
          sortable: true,
        },
        {
          name: 'productName',
          width: 150,
        },
        {
          name: 'deliverTime',
          width: 150,
        },
        {
          name: 'supplierCompanyName',
          width: 180,
        },
        {
          name: 'companyName',
          width: 180,
        },
        {
          name: 'agentName',
          width: 150,
        },
        doubleUnitEnabled && {
          name: 'secondaryExecuteReverseQuantity',
          width: 120,
          renderer: ({ value }) => showBigNumber(value),
        },
        returnedFlag === 0 && {
          name: 'executeReverseQuantity',
          width: 120,
          renderer: ({ value }) => showBigNumber(value),
        },
        returnedFlag === 0 && {
          name: 'reverseNodeLov',
          width: 120,
        },
        {
          name: 'remark',
          width: 150,
        },
        {
          name: 'sinvLineAttachmentUuid',
        },
        {
          name: 'customSpecsJson',
          width: 120,
          renderer: ({ value }) => {
            return (
              <a
                onClick={() => {
                  const customProps = {
                    tplInfo,
                    dataSource: value ? JSON.parse(value) : [],
                  };
                  c7nModal({
                    bodyStyle: { minHeight: `calc(100vh - 121px)` },
                    style: {
                      width: '742px',
                    },
                    okText: intl.get('hzero.common.button.close').d('关闭'),
                    title: intl
                      .get(`sinv.receiptExecution.model.title}.customSpecsJson`)
                      .d('定制品属性'),
                    children: <CustomModal {...customProps} />,
                  });
                }}
              >
                {intl.get(`sinv.receiptExecution.model.title.customSpecsJson`).d('定制品属性')}
              </a>
            );
          },
        },
        {
          name: 'orderReturnedFlag',
          width: 100,
          renderer: ({ value }) => yesOrNoRender(+value),
        },
        {
          name: 'attachmentUrlList',
          width: 80,
          renderer: ({ record, value }) => {
            return value?.length ? (
              <ImageList imageDTO={record.get('attachmentUrlList').slice() || []} />
            ) : (
              <span>-</span>
            );
          },
        },
        {
          name: 'linkFirst',
          width: 100,
          renderer: ({ record }) => (
            <a
              disabled={!record.get('rcvTrxLineId')}
              onClick={() => this.onOpenLinkChange(record, Number(1), Number(0))}
            >
              {intl.get('hzero.common.button.look').d('查看')}
            </a>
          ),
        },
        {
          name: 'linkSecond',
          width: 100,
          renderer: ({ record }) => (
            <a
              disabled={!record.get('rcvTrxLineId')}
              onClick={() => this.onOpenLinkChange(record, Number(2), Number(0))}
            >
              {intl.get('hzero.common.button.look').d('查看')}
            </a>
          ),
        },
        {
          name: 'processDocuments',
          width: 80,
          renderer: ({ record }) => (
            <DocFlow
              tableName="sinv_rcv_trx_line"
              tablePk={record.get('rcvTrxLineId')}
              buttonType="button"
            />
          ),
        },
      ],
    };
    if (
      (type === 'COURSE' || type === 'SOURCE') &&
      !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode)
    ) {
      return columns.action.concat(columns.other);
    } else {
      return columns.other;
    }
  };

  @Bind()
  headerBtns() {
    const { spinning, returnedFlag } = this.state;
    const { customizeBtnGroup } = this.props;
    const btns = [
      {
        name: 'rate',
        child: intl.get(`sinv.common.view.message.button.rate`).d('评价'),
        hidden: returnedFlag === 1,
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'rate_review1',
          loading: spinning,
          onClick: this.handRate,
          btnType: 'c7n-pro',
          funcType: 'flat',
        },
      },
      {
        name: 'operation',
        child: intl.get(`hzero.common.view.message.operateHistory`).d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          onClick: this.operaChange,
          btnType: 'c7n-pro',
          type: 'c7n-pro',
          funcType: 'flat',
        },
      },
    ];
    return (
      <div className="content-bottom-render">
        {customizeBtnGroup(
          { code: `SINV.RECEIPT_WORKBENCH_NEW_WORKFLO.BTNS`, pro: true },
          <DynamicButtons
            buttons={btnNumber(btns.filter((i) => !i.hidden))}
            defaultBtnType="c7n-pro"
          />
        )}
      </div>
    );
  }

  fieldsConfig = {
    displayTrxNum: {
      useLabel: false,
    },
    creationName: {
      useLabel: true,
    },
    creationDate: {
      useLabel: true,
    },
    unitAll: {
      render: ({ record }) => (
        <span>
          {intl.get('sinv.receiptExecution.model.receipt.unitAll').d('创建人部门')}:
          {record && record.get('unitNames')?.join()}
        </span>
      ),
    },
  };

  fieldsConfig2 = {
    companyName: {
      widthRatio: '1x',
    },
    supplierCompanyName: {
      widthRatio: '1x',
    },
    remark: {
      widthRatio: '2x',
    },
  };

  render() {
    const { spinning, rcvStatusCode } = this.state;
    const { customizeForm, custLoading, customizeTable, customizeCommon } = this.props;
    const columns = this.getColumns();
    return (
      <Fragment>
        <div style={{ overflowY: 'auto', backgroundColor: '#f7f8fa' }} className="maxWrap">
          <Spin spinning={custLoading || spinning || false}>
            {customizeCommon(
              {
                code: 'SINV.RECEIPT_WORKBENCH_NEW_WORKFLO.BASIC_CARD',
                processUnitTag: 'AF-BASIC',
              },
              <AFBasic
                dataSet={this.formDs}
                titleField="displayTrxNum"
                normalFields={['creationName', 'unitAll', 'creationDate']}
                fieldsConfig={this.fieldsConfig}
                tagFields={['returnedFlagMeaning', 'rcvTypeName']}
                maxTagCount={3}
                contentRemainWidth="25%"
                contentRemainRender={() => (
                  <div
                    style={{
                      display: 'flex',
                      height: '100%',
                      alignItems: 'flex-end',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <div style={{ fontSize: '12px', paddingRight: '15px', color: '#868D9C' }}>
                      {intl
                        .get('sinv.receiptExecution.model.receipt.totalTaxIncludedAmount')
                        .d('汇总金额')}
                    </div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '24px',
                        paddingRight: '15px',
                        color: '#1D2129',
                      }}
                    >
                      {this.state.totalTaxIncludedAmount}
                    </div>
                  </div>
                )}
                contentBottomRender={() => (
                  <div style={{ display: 'flex' }}>{this.headerBtns()}</div>
                )}
              />
            )}
            {/* <AFOperation>{this.headerBtns()}</AFOperation> */}

            {customizeCommon(
              {
                code: 'SINV.RECEIPT_WORKBENCH_NEW_WORKFLO.COMPANY_CARD',
                processUnitTag: 'AF-EXTRA',
              },
              <AFExtra
                className="myExtra"
                dataSet={this.formDs}
                fieldsConfig={this.fieldsConfig2}
                fields={['companyName', 'supplierCompanyName', 'remark']}
              />
            )}

            <Content style={{ padding: 20, margin: '0px 8px' }}>
              <div
                style={{
                  marginBottom: !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode) ? 8 : 16,
                }}
              >
                <h3 className={styles['page-title']} style={{ color: '#1d2129' }}>
                  {intl
                    .get(`sinv.receiptWorkbench.view.title.detail.receipLineInfo`)
                    .d('收货单明细行信息')}
                </h3>
              </div>
              {customizeTable(
                {
                  code: `SINV.RECEIPT_WORKBENCH_NEW_WORKFLO.DETAIL_LINEINFO`,
                  readOnly: true,
                  __force_record_to_update__: true,
                },
                <SearchBarTable
                  virtual
                  dataSet={this.tableDs}
                  custLoading={custLoading}
                  columns={columns}
                  searchCode="SINV.RECEIPT_WORKBENCH_NEW_WORKFLO.DETAIL.LINE_SEARCH_A"
                  pagination={{
                    pageSizeOptions: ['20', '50', '100', '200'],
                  }}
                  style={{ maxHeight: 400 }}
                  virtualCell
                  queryFieldsLimit={3}
                  selectionMode="none"
                  searchBarConfig={{
                    checkDataSetStatus: false,
                    closeFilterSelector: true,
                  }}
                />
              )}
            </Content>
            <Content style={{ margin: '8px 8px 8px', padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <h3 className={styles['page-title']} style={{ color: '#1d2129' }}>
                  {intl.get(`sinv.receiptWorkbench.view.title.detail.singleAttachment`).d('附件')}
                </h3>
              </div>
              <div className={styles['footer-form']}>
                {customizeForm(
                  {
                    code: `SINV.RECEIPT_WORKBENCH_NEW_WORKFLO.DETAIL_ATTACHMENT`,
                    readOnly: true,
                    __force_record_to_update__: true,
                  },
                  <Form columns={2} labelLayout="float" dataSet={this.attachmentDs}>
                    <Attachment
                      labelLayout="float"
                      bucketName={PRIVATE_BUCKET}
                      name="sinvHeaderAttachmentUuid"
                      readOnly
                    />
                  </Form>
                )}
              </div>
            </Content>
          </Spin>
        </div>
      </Fragment>
    );
  }
}
