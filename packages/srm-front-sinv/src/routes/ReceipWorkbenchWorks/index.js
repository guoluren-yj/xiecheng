/* eslint-disable react/jsx-wrap-multilines */
/*
 * @Description:
 * @Date: 2021-07-06 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Fragment, Component } from 'react';
import {
  DataSet,
  Button,
  Form,
  Spin,
  TextArea,
  Modal,
  Rate,
  Attachment,
  Output,
} from 'choerodon-ui/pro';
import qs from 'querystring';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import moment from 'moment';
import { isNil, isFunction } from 'lodash';
import { yesOrNoRender } from 'utils/renderer';
import { Header, Content } from 'components/Page';
import { PRIVATE_BUCKET } from '_utils/config';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import ImageList from '@/routes/components/ImageList';
import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DocFlow from '_components/DocFlow';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import C7nPrecisionInputNumber from '@/components/Precision/C7nPrecisionInputNumber';
import { handleEvaluate, handleSave } from '@/services/ReceipWorkbenchService';
import { queryDoubleUomConfig } from '@/services/sinvCommonService';
import cuxRemote from 'hzero-front/lib/utils/remote';
import { isSupplier, btnNumber, c7nModal } from './util';
import CustomModal from '../ReceiptExecution/components/CustomModal';
import { formDS, tableDS, batchMaintenanceDS, formRateDS, attachmentDS } from './store/lineDS';
import Operaindex from './Operating/index';
import CustomLinkIndex from '@/routes/components/CustomModal';
import styles from './index.less';
import {
  showBigNumber,
  queryCalcRuleConfig,
  useDoubleUomConfig,
  // useDoubleUomConfigWork,
} from '@/routes/components/utils';

const STAGE_CODE = 'WORKFLOW';

@useDoubleUomConfig()
@WithCustomize({
  // unitCode: getUnitCode(),
  isTemplate: true,
})
@cuxRemote(
  {
    code: 'SINV_PRDETAIL_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    process: {
      limitAttr: undefined,
      limitator: undefined,
      cuxUpdate: undefined,
      cuxLineUpdate: undefined,
      cuxListField: undefined,
      cuxWorkflowChange: undefined,
      cuxHandleLineBtns: (value) => value,
    },
  }
)
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
      remote,
    } = this.props;
    const { type } = qs.parse(search.substr(1));
    const { cuxUpdate, cuxLineUpdate, cuxListField } = remote?.props?.process || {};
    this.formDs = new DataSet(formDS(doubleUnitEnabled, cuxUpdate));
    this.tableDs = new DataSet(
      remote
        ? remote.process(
            'SINV_PRDETAIL_REMOTE_PROCESS_TABLE_DS',
            tableDS(this.formDs, cuxLineUpdate, cuxListField, doubleUnitEnabled),
            { props: this.props }
          )
        : tableDS(this.formDs, cuxLineUpdate, cuxListField, doubleUnitEnabled)
    );
    this.tableDs.setState('doubleUnitEnabled', doubleUnitEnabled);
    this.batchMaintenanceDs.bind(this.tableDs, 'tablesDs');
    this.state = {
      type,
      returnedFlag: 0,
      spinning: false,
      customVisible: false, // 定制化属性Modal显示
      customData: [], // 定制化属性Modal的Table数据源
      rcvTrxHeaderId: params.rcvTrxHeaderId,
      sourceFromPub: path.includes('pub'),
      tplInfo: {},
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
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_WORKFLOW.DEATAIL_HEADERINFO,SINV.RECEIPT_WORKBENCH_WORKFLOW.DETAIL_ATTACHMENT`,
    });
    this.formDs.query().then((res) => {
      if (res && !res.failed) {
        this.attachmentDs.loadData([res]);
        this.formDs.loadData([res]);
        this.setState({
          rcvStatusCode: res.rcvStatusCode,
          returnedFlag: res.returnedFlag,
        });
      }
    });
    this.tableDs.setQueryParameter('tplInfo', tplInfo);
    this.tableDs.setQueryParameter('params', {
      rcvTrxHeaderId,
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_WORKFLOW.DETAIL_LINEINFO,SINV.RECEIPT_WORKBENCH_WORKFLOW.DETAIL.LINE_SEARCH_A`,
    });
    this.tableDs.query().then((res) => {
      this.tableDs.loadData(res.content);
      /**
       1.onFormLoaded 方法用于控制审批按钮是否可点击，传参 true 表示可点击
      2.注册了submit回调函数的话，onFormLoaded必传
      3.onFormLoaded应在表单加载完成后调用
      4.设置了customSubmit为true时，必须要调用onFormLoaded方法！
	   */
      if (onFormLoaded) {
        onFormLoaded(true);
      }
    });
  }

  componentDidMount() {
    // this.handleRefresh();
    const { sourceFromPub } = this.state;
    const { onLoad, queryTemplateConfig, workflowTemplateProps = {} } = this.props;
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
      /**
       1.onFormLoaded 方法用于控制审批按钮是否可点击，传参 true 表示可点击
      2.注册了submit回调函数的话，onFormLoaded必传
      3.onFormLoaded应在表单加载完成后调用
      4.设置了customSubmit为true时，必须要调用onFormLoaded方法！
	   */
      // if (onFormLoaded) {
      //   onFormLoaded(true);
      // }
    }
    this.setState({
      tplInfo: {
        cuszTplStageCode: STAGE_CODE,
        cuszTplPageCode: 'DELIVERY_WORKBENCH.DETAIL_WORKS',
        templateCode: workflowTemplateProps?.templateCode,
        templateVersion: workflowTemplateProps?.templateVersion,
      },
    });
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

  @Bind()
  workFlowApproval(approveResult) {
    return new Promise(async (resolve, reject) => {
      const { remote, workflowTemplateProps } = this.props;
      const { cuxWorkflowChange } = remote?.props?.process || {};
      const { rcvTrxHeaderId, sourceFromPub, tplInfo } = this.state;
      const fromFlag = await this.formDs.validate();
      const lineFlag = await this.tableDs.validate();
      const uuidFlag = await this.attachmentDs.validate();
      const cfmoFlag =
        isFunction(cuxWorkflowChange) &&
        cuxWorkflowChange({ reject, dataSet: this.tableDs, approveResult });
      if (cfmoFlag && approveResult === 'Approved') {
        return;
      }
      const savePreData = {
        tplInfo,
        customizeUnitCode: `SINV.RECEIPT_WORKBENCH_WORKFLOW.DEATAIL_HEADERINFO,SINV.RECEIPT_WORKBENCH_WORKFLOW.DETAIL_ATTACHMENT,SINV.RECEIPT_WORKBENCH_WORKFLOW.DETAIL_LINEINFO`,
        data: {
          ...this.formDs?.current?.toData(),
          ...this.attachmentDs?.current?.toJSONData(),
          saveMethod: sourceFromPub ? 'WFL' : undefined,
          sinvRcvTrxLineDTOS: this.tableDs
            .toJSONData()
            .map((m) => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId })),
        },
      };
      const saveData = remote
        ? remote.process('SINV_PRDETAIL_REMOTE_PROCESS_SAVE_DATA', savePreData, {
            approveResult,
            workflowTemplateProps,
          })
        : savePreData;
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
            customizeUnitCode: `SINV.RECEIPT_WORKBENCH_WORKFLOW.DETAIL_RATE`,
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
   * 操作记录关闭
   */
  operaCancel = () => {
    this.setState({
      operaVisible: false,
    });
  };

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
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_WORKFLOW.DETAIL_RATE`,
    });
    this.formRateDs.query();
    const Comp = () => {
      return (
        <Spin dataSet={this.formRateDs}>
          <div className={styles['rate-all']}>
            {customizeForm(
              {
                code: `SINV.RECEIPT_WORKBENCH_WORKFLOW.DETAIL_RATE`,
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
      style: { width: '742px' },
      children: <CustomLinkIndex {...basicProps} />,
      footer: (
        <Button color="primary" onClick={() => modal.close()}>
          {intl.get('hzero.common.status.closed').d('关闭')}
        </Button>
      ),
    });
  };

  getColumns = () => {
    const { type, rcvStatusCode, returnedFlag, sourceFromPub, tplInfo } = this.state;
    const { doubleUnitEnabled } = this.props;
    const opreateFlag = rcvStatusCode === '10_NEW' || rcvStatusCode === '30_REJECTED';
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
          editor: (record) =>
            !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode) &&
            record.get('itemId') &&
            record.get('firstNodeFlag') === 1 &&
            doubleUnitEnabled === 2 &&
            record.get('upStreamSuFlag') === 0,
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
          editor: (record) =>
            !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode) &&
            sourceFromPub &&
            record.get('subjectType') === 'QUANTITY' && (
              <C7nPrecisionInputNumber
                name="secondaryQuantity"
                record={record}
                precision={
                  !isNil(record.get('secondaryUomPrecision'))
                    ? record.get('secondaryUomPrecision')
                    : 10
                }
              />
            ),
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
          editor: (record) =>
            !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode) &&
            record.get('subjectType') === 'QUANTITY' && (
              <C7nPrecisionInputNumber
                name="quantity"
                record={record}
                precision={!isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10}
              />
            ),
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
          editor: (record) =>
            !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode) &&
            record.get('subjectType') === 'AMOUNT',
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
          editor: !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode),
          sortable: true,
        },
        {
          name: 'invOrganizationName',
          width: 150,
        },
        {
          name: 'inventoryId',
          width: 160,
          editor: !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode),
        },
        {
          name: 'locatorId',
          width: 160,
          editor: !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode),
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
          editor: (record) => record.get('subjectType') === 'QUANTITY',
          renderer: ({ value }) => showBigNumber(value),
        },
        returnedFlag === 0 &&
          doubleUnitEnabled && {
            name: 'executeReverseQuantity',
            width: 120,
            renderer: ({ value }) => showBigNumber(value),
          },
        returnedFlag === 0 && {
          name: 'reverseNodeLov',
          width: 120,
          editor: (record) =>
            record.get('subjectType') === 'QUANTITY' &&
            !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode),
        },
        {
          name: 'remark',
          width: 150,
          editor: !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode),
        },
        {
          name: 'sinvLineAttachmentUuid',
          editor: opreateFlag,
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
    const btns = [
      {
        name: 'rate',
        child: intl.get(`sinv.common.view.message.button.rate`).d('评价'),
        hidden: returnedFlag === 1,
        btnProps: {
          icon: 'rate_review1',
          loading: spinning,
          onClick: this.handRate,
        },
      },
      {
        name: 'operation',
        child: intl.get(`hzero.common.view.message.operateHistory`).d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          onClick: this.operaChange,
        },
      },
    ];
    return btnNumber(btns.filter((i) => !i.hidden));
  }

  render() {
    const {
      tplInfo,
      spinning,
      customData,
      operaVisible,
      customVisible,
      rcvStatusCode,
      rcvTrxHeaderId,
    } = this.state;
    const { customizeForm, custLoading, customizeTable, remote } = this.props;
    const operaRecord = { data: { rcvTrxHeaderId } };
    const operaProps = {
      operaRecord,
      visible: operaVisible,
      operaCancel: this.operaCancel,
    };
    const customProps = {
      tplInfo,
      visible: customVisible,
      dataSource: customData,
      hideModal: () => {
        this.setState({ customVisible: false });
      },
    };
    const columns = this.getColumns();

    const LineBtn = observer(() => {
      const { cuxHandleLineBtns } = remote?.props?.process || {};
      const buttons = [];
      const btns = cuxHandleLineBtns(buttons, { formDs: this.formDs, that: this });
      return <DynamicButtons buttons={btns} />;
    });
    return (
      <Fragment>
        <Header>
          <DynamicButtons buttons={this.headerBtns()} />
        </Header>
        <div style={{ overflowY: 'auto' }}>
          <Spin spinning={custLoading || spinning || false}>
            <Content style={{ marginBottom: 8, padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <h3 className={styles['page-title']}>
                  {intl
                    .get(`sinv.receiptWorkbench.view.title.detail.receipHeaderInfo`)
                    .d('收货单基础信息')}
                </h3>
              </div>
              <div className={styles['form-info']}>
                {customizeForm(
                  {
                    code: `SINV.RECEIPT_WORKBENCH_WORKFLOW.DEATAIL_HEADERINFO`,
                    // readOnly: true,
                    __force_record_to_update__: true,
                  },
                  <Form
                    labelLayout="vertical"
                    dataSet={this.formDs}
                    columns={3}
                    className="form-readOnly"
                  >
                    <Output name="displayTrxNum" />
                    <Output name="companyName" />
                    <Output
                      name="supplierCompanyName"
                      renderer={({ record }) => {
                        if (record && record.get('supplierId')) {
                          return record && record.get('supplierName');
                        } else {
                          return record && record.get('supplierCompanyName');
                        }
                      }}
                    />
                    <Output name="nodeConfigName" />
                    <Output
                      name="returnedFlag"
                      renderer={({ value }) => {
                        if (value === 0) {
                          return intl.get('sinv.receiptExecution.model.receipt.aog').d('收货');
                        } else if (value === 1) {
                          return intl
                            .get('sinv.receiptExecution.model.receipt.returnUps')
                            .d('退货');
                        }
                      }}
                    />
                    <Output name="rcvTypeAll" />
                    <Output name="creationName" />
                    <Output
                      name="creationDate"
                      renderer={({ value }) =>
                        value ? moment(value).format(DEFAULT_DATETIME_FORMAT) : null
                      }
                    />
                    <Output name="unitAll" />
                    <Output
                      name="rcvStatusCode"
                      renderer={({ record }) => {
                        return record && record.get('rcvStatusCodeMeaning');
                      }}
                    />
                    <Output name="totalQuantity" renderer={({ value }) => showBigNumber(value)} />
                    <Output
                      name="totalTaxIncludedAmount"
                      renderer={({ value, record }) =>
                        record?.get('hidePriceFlag')
                          ? '***'
                          : showBigNumber(value, record && record.get('financialPrecision'))
                      }
                    />
                    <Output name="remark" />
                    <Output name="receivedBy" />
                    {!isSupplier && (
                      <Output
                        name="supplierReceiptFlag"
                        renderer={({ value }) => yesOrNoRender(+value)}
                      />
                    )}
                    <Output
                      name="linkFirst"
                      renderer={({ record }) => (
                        <a onClick={() => this.onOpenLinkChange(record, Number(1), Number(1))}>
                          {intl.get('hzero.common.button.look').d('查看')}
                        </a>
                      )}
                    />
                    <Output
                      name="linkSecond"
                      renderer={({ record }) => (
                        <a onClick={() => this.onOpenLinkChange(record, Number(2), Number(1))}>
                          {intl.get('hzero.common.button.look').d('查看')}
                        </a>
                      )}
                    />
                  </Form>
                )}
              </div>
            </Content>
            <Content style={{ marginTop: 0, marginBottom: 8, padding: 20 }}>
              <div
                style={{
                  marginBottom: !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode) ? 8 : 16,
                }}
              >
                <h3 className={styles['page-title']}>
                  {intl
                    .get(`sinv.receiptWorkbench.view.title.detail.receipLineInfo`)
                    .d('收货单明细行信息')}
                </h3>
              </div>
              {customizeTable(
                {
                  code: `SINV.RECEIPT_WORKBENCH_WORKFLOW.DETAIL_LINEINFO`,
                  // readOnly: true,
                  __force_record_to_update__: true,
                },
                <SearchBarTable
                  virtual
                  dataSet={this.tableDs}
                  custLoading={custLoading}
                  columns={columns}
                  searchCode="SINV.RECEIPT_WORKBENCH_WORKFLOW.DETAIL.LINE_SEARCH_A"
                  pagination={{
                    pageSizeOptions: ['20', '50', '100', '200'],
                  }}
                  style={{ maxHeight: 400 }}
                  virtualCell
                  queryFieldsLimit={3}
                  selectionMode={
                    remote
                      ? remote.process('SINV_PRDETAIL_REMOTE_PROCESS_TABLE_SELECTION', 'none', {
                          that: this,
                        })
                      : 'none'
                  }
                  buttons={[<LineBtn />]}
                  searchBarConfig={{
                    checkDataSetStatus: false,
                    closeFilterSelector: true,
                  }}
                />
              )}
            </Content>
            <Content style={{ marginTop: 0, padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <h3 className={styles['page-title']}>
                  {intl
                    .get(`sinv.receiptWorkbench.view.title.detail.receipattachmentUuid`)
                    .d('收货单附件信息')}
                </h3>
              </div>
              <div className={styles['footer-form']}>
                {customizeForm(
                  {
                    code: `SINV.RECEIPT_WORKBENCH_WORKFLOW.DETAIL_ATTACHMENT`,
                    // readOnly: true,
                    __force_record_to_update__: true,
                  },
                  <Form columns={4} labelLayout="float" dataSet={this.attachmentDs}>
                    <Attachment
                      readOnly
                      labelLayout="float"
                      bucketName={PRIVATE_BUCKET}
                      name="attachmentTemplateUuid"
                      help={
                        <span>
                          {intl
                            .get('sinv.common.view.attachment.supportExtensions')
                            .d('支持扩展名')}
                          : .rar .zip .doc .docx .pdf .jpg...
                        </span>
                      }
                    />
                    <Attachment
                      labelLayout="float"
                      bucketName={PRIVATE_BUCKET}
                      name="sinvHeaderAttachmentUuid"
                      help={
                        <span>
                          {intl
                            .get('sinv.common.view.attachment.supportExtensions')
                            .d('支持扩展名')}
                          : .rar .zip .doc .docx .pdf .jpg...
                        </span>
                      }
                    />
                  </Form>
                )}
              </div>
            </Content>
          </Spin>
        </div>
        {operaVisible && <Operaindex {...operaProps} />}
        {customVisible && <CustomModal {...customProps} />}
      </Fragment>
    );
  }
}
