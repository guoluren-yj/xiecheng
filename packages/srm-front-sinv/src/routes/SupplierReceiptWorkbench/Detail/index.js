import React, { Fragment, Component } from 'react';
import {
  DataSet,
  Button,
  TextField,
  Form,
  Spin,
  Lov,
  TextArea,
  Modal,
  DatePicker,
  Rate,
  Attachment,
  Icon,
  Output,
} from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import qs from 'querystring';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Bind, Debounce } from 'lodash-decorators';
import moment from 'moment';
import { isEmpty, isNil, isFunction } from 'lodash';
import { yesOrNoRender } from 'utils/renderer';
import { Header, Content } from 'components/Page';
import { PRIVATE_BUCKET } from '_utils/config';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import cuxRemote from 'hzero-front/lib/utils/remote';
import {
  handleDel,
  handleEvaluate,
  handleSubmit,
  handleSave,
  print,
  newPrint,
  handleDelete,
  handleConfirmApi,
  handleRejectApi,
  handleSupplierRevokeApprovalApi,
} from '@/services/ReceipWorkbenchService';
import HeaderBtnComps from './BtnsCmp';
import { isSupplier, confirm, c7nModal } from '../util';
import CustomLinkIndex from '@/routes/components/CustomModal';
import CustomModal from '../../ReceiptExecution/components/CustomModal';
import { formDS, tableDS, batchMaintenanceDS, formRateDS, attachmentDS } from './store/lineDS.ts';
import Operaindex from '../components/Operating/index';
import MessageBoard from '@/routes/components/MessageBoard/index';
import ImportModal from '../ThingReceipts/components/importModal';
import LineTable from './columnsList.js';
import styles from '../index.less';
import {
  showBigNumber,
  globalPrint,
  useDoubleUomConfig,
  queryCalcRuleConfig,
  formatErrorInfo,
  validToken,
  renderRcvStatus,
} from '@/routes/components/utils';

function getUnitCode() {
  const code = [];
  for (let i = 0; i < 10; i++) {
    const index = String.fromCharCode(65 + i);
    code.push(
      `SINV.RECEIPT_WORKBENCH_THING.DETAIL.${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.DETAIL.MAINTAIN_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.DETAIL.BUTTON.${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.DETAIL.ATTRCH_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_SEARCH_A`
    );
  }
  return code;
}
@useDoubleUomConfig()
@WithCustomize({
  unitCode: getUnitCode(),
})
@formatterCollections({
  code: [
    'sinv.receiptExecution',
    'hzero.common',
    'sinv.receiptWorkbench',
    'sinv.common',
    'sinv.deliveryCreation',
    'slod.deliveryWorkbench',
    'ssta.common',
  ],
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
      cuxListField: undefined,
      renderValidateField: undefined,
      renderFormFieldRichText: undefined,
      renderCreateLineColumns: undefined,
      cuxDetailLineFieldSplit: undefined,
      cuxHandleLineBtns: (value) => value,
      cuxHandleSubmitBefore: undefined,
      getLineInfoDs: (value) => value,
    },
  },
  {
    events: {
      cuxHandleForm() {}, // 二开执行逻辑
    },
  }
)
export default class ExecutionDetail extends Component {
  formRateDs = new DataSet(formRateDS());

  batchMaintenanceDs = new DataSet(batchMaintenanceDS(this.tableDs));

  attachmentDs = new DataSet(attachmentDS());

  constructor(props) {
    super(props);
    const {
      remote,
      match: { params = {}, path },
      location: { search, pathname },
      doubleUnitEnabled,
    } = this.props;
    const {
      from,
      type,
      viewType,
      courseAsLine,
      nodeConfigIndexAbc,
      pageCurrentIsSelectedNodeCodes,
    } = qs.parse(search.substr(1));
    const { renderValidateField } = remote?.props?.process || {};
    this.formDs = new DataSet(formDS(doubleUnitEnabled));
    this.tableDs = new DataSet(
      remote?.process('getLineInfoDs', tableDS(this.formDs, renderValidateField), {
        comp: 'sup',
        returnedFlag: 0,
      })
    );
    this.tableDs.setState('doubleUnitEnabled', doubleUnitEnabled);
    this.batchMaintenanceDs.bind(this.tableDs, 'tablesDs');
    this.state = {
      search,
      pathname,
      type,
      from,
      viewType,
      spinning: false,
      customVisible: false, // 定制化属性Modal显示
      messageVisible: false,
      editFieldFlag: false,
      courseAsLine,
      unreadQuantity: 0,
      customData: [], // 定制化属性Modal的Table数据源
      nodeConfigIndexAbc,
      nodeConfigTitleName: '...',
      rcvTrxHeaderId: params.id,
      sourceFromPub: path.includes('pub'),
      externalSystem: true, // 是否来源srm
      pageCurrentIsSelectedNodeCodes,
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
    const { rcvTrxHeaderId, nodeConfigIndexAbc } = this.state;
    this.fetchCalcRuleConfig();
    this.tableDs.setState({ batchData: {} });
    this.tableDs.setState({ fieldMapValues: undefined });
    this.formDs.setQueryParameter('params', {
      rcvTrxHeaderId,
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
    });
    this.formDs.query().then((res) => {
      if (res && !res.failed) {
        this.attachmentDs.loadData([res]);
        this.setState({
          rcvStatusCode: res.rcvStatusCode,
          unreadQuantity: res.unreadQuantity,
          nodeConfigTitleName: res?.nodeConfigName ?? '',
          externalSystem: res.externalSystemCode === 'SRM',
          spinning: false,
        });
      } else {
        this.setState({
          spinning: false,
        });
      }
    });
    this.tableDs.setQueryParameter('params', {
      rcvTrxHeaderId,
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_SEARCH_A`,
    });
    this.tableDs.query();
  }

  componentDidMount() {
    this.setState({
      spinning: true,
    });
    this.handleRefresh();
  }

  @Bind()
  @Debounce(100)
  async handleSave() {
    const { nodeConfigIndexAbc, rcvTrxHeaderId } = this.state;
    const batchData = this.tableDs.getState('batchData') || {};

    validToken(this.formDs);
    const saveData = {
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
      data: {
        ...this.formDs?.current?.toData(),
        ...this.attachmentDs?.current?.toJSONData(),
        sinvRcvTrxLineDTOS: this.tableDs
          .toJSONData()
          .map((m) => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId })),
        batchEditLineDTO: isEmpty(batchData)
          ? undefined
          : {
              ...batchData,
              inventoryId: batchData?.inventoryId?.inventoryId,
              locatorId: batchData?.locatorId?.locationId,
            },
        customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.${nodeConfigIndexAbc}`,
      },
    };
    const headerFlag = await this.formDs.validate();
    const attachmentFlag = await this.attachmentDs.validate();
    const flag = await this.tableDs.validate();
    if (headerFlag && flag && attachmentFlag) {
      this.setState({ spinning: true });
      const res = await handleSave(saveData).finally(() => {
        this.setState({ spinning: false });
      });
      if (getResponse(res)) {
        this.tableDs.setState({ batchData: {} });
        this.tableDs.setState({ fieldMapValues: undefined });
        notification.success();
        this.setState({
          editFieldFlag: false,
        });
        this.formDs.query();
        this.tableDs.query();
        this.formRateDs.setQueryParameter('params', {
          rcvTrxHeaderId,
          customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc}`,
        });
      }
    }
  }

  @Bind()
  @Debounce(100)
  async handleSubmit() {
    const { nodeConfigIndexAbc } = this.state;
    const batchData = this.tableDs.getState('batchData') || {};
    validToken(this.formDs);
    let saveData = {
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc}, SINV.RECEIPT_WORKBENCH_THING.DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
      data: {
        ...this.formDs?.current?.toData(),
        ...this.attachmentDs?.current?.toJSONData(),
        sinvRcvTrxLineDTOS: this.tableDs
          .toJSONData()
          .map((m) => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId })),
        batchEditLineDTO: isEmpty(batchData)
          ? undefined
          : {
              ...batchData,
              inventoryId: batchData?.inventoryId?.inventoryId,
              locatorId: batchData?.locatorId?.locationId,
            },
        customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.${nodeConfigIndexAbc}`,
      },
    };
    const headerFlag = await this.formDs.validate();
    const attachmentFlag = await this.attachmentDs.validate();
    const flag = await this.tableDs.validate();
    const tips = this.formDs
      .toData()
      .map((m) => ({
        ...m,
        inventoryId: m._inventoryId,
        locatorId: m._locatorId,
        returnedFlagMeaning:
          m.returnedFlag === 0
            ? intl.get('sinv.receiptExecution.view.message.Receipt').d(`收货`)
            : intl.get('sinv.receiptExecution.view.message.ReturnOrder').d(`退货`),
      }))
      .map(
        (i) =>
          `${i.returnedFlagMeaning}${intl
            .get('sinv.receiptExecution.view.message.bills')
            .d(`单`)}[${i.displayTrxNum}]`
      )
      .join('/');
    if (!attachmentFlag || !flag) {
      formatErrorInfo(
        this.attachmentDs,
        this.tableDs,
        intl.get(`sinv.receiptWorkbench.view.title.detail.receipLineInfo`).d('收货单明细行信息')
      );
    }
    if (headerFlag && flag && attachmentFlag) {
      const { remote } = this.props;
      const { cuxHandleSubmitBefore } = remote?.props?.process || {};
      if (isFunction(cuxHandleSubmitBefore)) {
        const resp = await cuxHandleSubmitBefore(saveData);
        if (!resp.status) {
          return;
        } else {
          saveData = { ...saveData, data: { ...saveData.data, ...resp.newData } };
        }
      }
      confirm({
        content: `${intl
          .get(`sinv.receiptExecution.view.message.submitTip`)
          .d(`确定要提交单据`)}${tips}?`,
        onOk: async () => {
          this.setState({ spinning: true });
          const res = await handleSubmit(saveData).finally(() => {
            this.setState({ spinning: false });
          });
          if (getResponse(res)) {
            if (res.doAsynFlag === 1) {
              notification.warning({
                message: intl
                  .get('sinv.receiptExecution.view.message.showAysncTip')
                  .d(
                    `当前执行行数量超过预置数量，程序转为后台执行，执行进度结果可前往【异步执行记录】按钮明细进行查看`
                  ),
              });
              setTimeout(() => {
                this.props.history.push({
                  pathname: `/sinv/supplier-receipt-workbench/list`,
                });
                this.onBack();
              }, 800);
              return;
            }
            notification.success();
            this.props.history.push({
              pathname: `/sinv/supplier-receipt-workbench/list`,
            });
            this.onBack();
          }
        },
      });
    }
  }

  @Bind()
  @Debounce(400)
  async handleDelete() {
    const headerInfo = this.formDs.toData()[0];
    const lineinfo = this.tableDs
      .map((item) => item.toJSONData())
      .map((m) => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId }));
    const params = {
      ...headerInfo,
      sinvRcvTrxLineDTOS: lineinfo,
    };
    confirm({
      content: intl.get('sinv.receiptExecution.view.message.orderDelBills').d(`确定要整单删除吗？`),
      onOk: async () => {
        const res = await handleDelete(params);
        if (getResponse(res)) {
          this.props.history.push({
            pathname: `/sinv/supplier-receipt-workbench/list`,
          });
          this.onBack();
        }
      },
    });
  }

  @Bind()
  lineDelete(select) {
    // poAllFlag 订单标识 asnAllFlag 送货单标识 fromDisplayPoNum 订单号 fromDisplayAsnNum 送货单号
    const selectData = select
      .map((item) => item.toJSONData())
      .map((m) => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId }));
    const selectDataPoNum = selectData.filter((i) => i.fromDisplayPoNum);
    const selectDataAsnNum = selectData.filter((i) => i.fromDisplayAsnNum);
    const deleteFlag = selectData.some((i) => i.rcvTrxLineId);
    const data = selectData.filter((i) => i.rcvTrxLineId);
    const params = { ...this.formDs.toData()[0], sinvRcvTrxLineDTOS: data };
    let isPoNum = true;
    if (deleteFlag) {
      if (
        (selectData[0].poAllFlag === 1 && selectDataPoNum.length > 0) ||
        (selectData[0].asnAllFlag === 1 && selectDataAsnNum.length > 0)
      ) {
        if (selectData[0].asnAllFlag === 1 && selectData[0].poAllFlag === 0) isPoNum = false;
        const tip = isPoNum
          ? intl.get('sinv.receiptExecution.view.message.order').d('订单')
          : intl.get('sinv.receiptExecution.view.message.delivey').d('送货单');
        const tipNums = isPoNum
          ? [...new Set(selectDataPoNum.map((i) => i.fromDisplayPoNum))].join(',')
          : [...new Set(selectDataAsnNum.map((i) => i.fromDisplayAsnNum))].join(',');
        confirm({
          contentStyle: { width: '550px' },
          children: intl
            .get('sinv.receiptExecution.view.message.sureDelete')
            .d('确定要删除此单据?'),
          okText: intl.get('hzero.common.button.sure').d('确定'),
          cancelText: intl.get('hzero.common.button.cancel').d('取消'),
          title: `${intl
            .get(`sinv.receiptExecution.view.message.orderTip`)
            .d(`单据`)}【${tip}：${tipNums}】${intl
            .get(`sinv.receiptExecution.view.message.orderNums`)
            .d(`需按整单收货，如需删除，则系统会将收货单下该单据对应所有行进行删除操作`)}`,
          onOk: async () => {
            const res = await handleDel({ ...params, orderAllDeleteFlag: 1 });
            if (getResponse(res)) {
              notification.success();
              this.handleRefresh();
            }
          },
        });
      } else {
        confirm({
          contentStyle: { width: '550px' },
          content: intl.get('sinv.receiptExecution.view.message.orderDel').d(`确认删除选中行？`),
          okText: intl.get('hzero.common.button.sure').d('确定'),
          cancelText: intl.get('hzero.common.button.cancel').d('取消'),
          onOk: async () => {
            const res = await handleDel({ ...params, orderAllDeleteFlag: 1 });
            if (getResponse(res)) {
              notification.success();
              this.handleRefresh();
            }
          },
        });
      }
    } else {
      this.tableDs.remove(select);
    }
  }

  /**
   * 打印功能
   */
  @Bind()
  @Debounce(400)
  handlePrint() {
    const params = [];
    const { rcvTrxHeaderId } = this.state;
    params.push(rcvTrxHeaderId);
    this.setState({ spinning: true });
    getResponse(print(params)).then((res) => {
      globalPrint(res, this.handleRefresh);
      this.setState({ spinning: false });
    });
  }

  @Bind()
  @Debounce(400)
  handleNewPrint() {
    const params = [];
    const { rcvTrxHeaderId } = this.state;
    params.push(rcvTrxHeaderId);
    this.setState({ spinning: true });
    getResponse(newPrint(params)).then((res) => {
      globalPrint(res, this.handleRefresh);
      this.setState({ spinning: false });
    });
  }

  /*
   *操作记录
   */
  operaChange = () => {
    const { rcvTrxHeaderId } = this.state;
    const operaRecord = { data: { rcvTrxHeaderId } };
    const operaProps = {
      operaRecord,
    };
    const modal = Modal.open({
      mask: true,
      drawer: true,
      // closable: true,
      // resizable: true,
      okCancel: false,
      style: { width: '742px' },
      children: <Operaindex {...operaProps} modal={modal} />,
      title: intl.get('sinv.common.model.common.operationRecord').d('操作记录'),
      okText: intl.get('hzero.common.status.closed').d('关闭'),
    });
  };

  /*
   *留言板打开
   */
  openMessage = () => {
    this.setState({
      messageVisible: true,
    });
  };

  /*
   *变更打开
   */
  openEdit = () => {
    this.setState({
      editFieldFlag: true,
    });
  };

  /*
   *留言板关闭
   */
  offMessage = () => {
    this.setState({
      messageVisible: false,
      unreadQuantity: 0, // 清除留言版按钮上的数字
    });
  };

  @Bind()
  handleBatchMaintenance(symbol) {
    this.batchMaintenanceDs.reset();
    const { customizeForm } = this.props;
    const { nodeConfigIndexAbc } = this.state;
    const alertMessage = symbol
      ? intl
          .get('sinv.receiptWorkbench.view.title.detail.modeEditAllData')
          .d('针对全部数据进行批量维护')
      : `${intl.get('sinv.receiptWorkbench.view.title.detail.modeHasCheck').d('已勾选')}${
          this.tableDs?.selected.length
        }${intl.get('sinv.receiptWorkbench.view.title.detail.EditData').d('条数据进行维护')}`;
    Modal.open({
      mask: true,
      drawer: true,
      destroyOnClose: true,
      style: { width: '385px' },
      onOk: () => this.handleBatchOk(),
      onCancel: () => this.handCancel(),
      title: intl.get(`sinv.receiptExecution.model.receipt.batchMaintenance`).d('批量维护'),
      children: (
        <div>
          <Alert
            border={false}
            className={styles['alert-style']}
            message={
              <div className={styles['help-style']}>
                <Icon type="help" /> {alertMessage}
              </div>
            }
            closable
          />
          {customizeForm(
            {
              code: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.MAINTAIN_${nodeConfigIndexAbc}`,
              disableOutput: 'Output',
              __force_record_to_update__: true,
            },
            <Form labelLayout="float" dataSet={this.batchMaintenanceDs} columns={1}>
              <DatePicker name="trxDate" />
              {!isSupplier && <Lov style={{ width: '100%' }} name="inventoryId" />}
              {!isSupplier && <Lov style={{ width: '100%' }} name="locatorId" />}
            </Form>
          )}
        </div>
      ),
    });
  }

  @Bind()
  handCancel() {
    this.batchMaintenanceDs.reset();
  }

  @Bind()
  async handleBatchOk() {
    const ds = this.tableDs;
    const dataDs = this.batchMaintenanceDs;

    const { __id, _status, __dirty, ...values } = dataDs?.current?.toData() || {};
    const fields = dataDs?.fields.toJSON();
    const batchRecord = dataDs?.current;
    const initFields = dataDs.props.fields;
    // Reflect.deleteProperty(formData, '__dirty');
    const formFlag = await dataDs.validate();
    if (isEmpty(values)) return true;
    if (!formFlag) return false;
    const custStandardFields = [];
    const fieldMapValues = [];

    for (const i in fields) {
      if (Object.prototype.hasOwnProperty.call(fields, i) && fields[i]) {
        const value = fields[i].getValue(batchRecord);
        const lable = fields[i].get('label');
        const bind = fields[i].get('bind');
        // 是否是扩展的标准字段
        const isCustStandardField = !(
          initFields.find((n) => n.name === fields[i].name) || fields[i].name.includes('attribute')
        );
        if (isCustStandardField && lable && value) {
          custStandardFields.push(lable);
        }
        if (value && !bind) {
          fieldMapValues.push([i, value]);
        }
      }
    }
    if (!isEmpty(custStandardFields)) {
      notification.error({
        message: intl
          .get(`slod.deliveryWorkbench.view.message.hasCustStandardFields`, {
            fields: String(custStandardFields.map((i) => `【${i}】`)),
          })
          .d('{fields}为扩展的标准字段，不允许批量编辑！'),
      });
      return false;
    }

    const selectList = ds?.selected.map((item) => item?.toData()) || [];
    const { nodeConfigIndexAbc } = this.state;
    if (isEmpty(selectList)) {
      const oldBatchData = ds.getState('batchData') || {};
      const oldFieldMapValues = ds.getState('fieldMapValues') || [];
      ds.setState({
        batchData: {
          ...oldBatchData,
          ...values,
          customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_${nodeConfigIndexAbc}`,
        },
        fieldMapValues: [...oldFieldMapValues, ...fieldMapValues],
      });
    }
    const tempArr = [];
    dataDs.fields.forEach((i) => {
      tempArr.push(i.get('name'));
    });
    const dataTemp = dataDs.current.get(tempArr);
    const data = {
      ...dataTemp,
    };
    runInAction(() => {
      Object.keys(data).forEach((item) => {
        if (!isNil(data[item])) {
          (isEmpty(ds.selected) ? ds.all : ds.selected).forEach((i) => {
            tempArr.forEach((key) => {
              const field = i.getField(key);
              if (!isNil(data[key]) && field.name === 'locatorId' && !field.disabled) {
                i.setState({ batchFlag: true });
                i.set({ locationName: data.locationName, locatorId: data.locatorId });
                return false;
              }
              if (!isNil(data[key]) && field.name === 'inventoryId' && !field.disabled) {
                i.setState({ batchFlag: true });
                i.set({ inventoryName: data.inventoryName, inventoryId: data.inventoryId });
                return false;
              }
              if (
                !isNil(data[key]) &&
                !field.disabled &&
                field.name !== 'inventoryId' &&
                field.name !== '_inventoryId' &&
                field.name !== 'inventoryName' &&
                field.name !== '_locatorId' &&
                field.name !== 'locatorId' &&
                field.name !== 'locationName'
              ) {
                i.setState({ batchFlag: true });
                i.set({ [key]: data[key] });
              }
            });
          });
        }
      });
    });
    return true;
  }

  handleAffirm = async (type) => {
    const { nodeConfigIndexAbc } = this.state;
    const tips = this.formDs
      .toData()
      .map((m) => ({
        ...m,
        inventoryId: m._inventoryId,
        locatorId: m._locatorId,
        returnedFlagMeaning:
          m.returnedFlag === 0
            ? intl.get('sinv.receiptExecution.view.message.Receipt').d(`收货`)
            : intl.get('sinv.receiptExecution.view.message.ReturnOrder').d(`退货`),
      }))
      .map(
        (i) =>
          `${i.returnedFlagMeaning}${intl
            .get('sinv.receiptExecution.view.message.bills')
            .d(`单`)}[${i.displayTrxNum}]`
      )
      .join('/');
    const saveData = {
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc}, SINV.RECEIPT_WORKBENCH_THING.DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
      data: {
        ...this.formDs.toData()[0],
        sinvHeaderAttachmentUuid: this.attachmentDs.toData()[0].sinvHeaderAttachmentUuid,
        // sinvRcvTrxLineDTOS: this.tableDs.toData(),
        sinvRcvTrxLineDTOS: this.tableDs
          .toJSONData()
          .map((m) => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId })),
      },
    };

    const headerFlag = await this.formDs.validate();
    const attachmentFlag = await this.attachmentDs.validate();
    const flag = await this.tableDs.validate();
    if (headerFlag && flag && attachmentFlag) {
      confirm({
        content:
          type === '30_SUP_REJECTED'
            ? `${intl
                .get(`sinv.receiptExecution.view.message.refuseTip`)
                .d(`确定要拒绝单据`)}${tips}?`
            : `${intl
                .get(`sinv.receiptExecution.view.message.confirmTip`)
                .d(`确定要确认单据`)}${tips}?`,
        onOk: async () => {
          this.setState({ spinning: true });
          if (type === '30_SUP_REJECTED') {
            const res = await handleRejectApi(saveData);
            if (getResponse(res)) {
              notification.success();
              this.props.history.push({
                pathname: `/sinv/supplier-receipt-workbench/list`,
              });
              this.onBack();
            }
            this.setState({ spinning: false });
          } else {
            const res = await handleConfirmApi(saveData);
            if (getResponse(res)) {
              notification.success();
              this.props.history.push({
                pathname: `/sinv/supplier-receipt-workbench/list`,
              });
              this.onBack();
            }
            this.setState({ spinning: false });
          }
        },
        okCancel: () => {
          this.setState({ spinning: false });
        },
      });
    }
  };

  onBack = () => {
    const {
      from,
      viewType,
      courseAsLine,
      editFieldFlag,
      nodeConfigIndexAbc,
      pageCurrentIsSelectedNodeCodes,
    } = this.state;
    const backPageNodeCode = pageCurrentIsSelectedNodeCodes === '1' ? nodeConfigIndexAbc : 'K';
    if (editFieldFlag) {
      this.handleRefresh();
      return this.setState({ editFieldFlag: false });
    }
    this.props.history.replace({
      from,
      viewType,
      courseAsLine,
      nodeConfigIndexAbc: backPageNodeCode,
    });
  };

  @Bind()
  handRate() {
    const { customizeForm } = this.props;
    const { rcvStatusCode, rcvTrxHeaderId, nodeConfigIndexAbc, sourceFromPub } = this.state;
    this.formRateDs.reset();
    this.formRateDs.setQueryParameter('params', {
      rcvTrxHeaderId,
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc}`,
    });
    this.formRateDs.query();
    const Comp = () => {
      return (
        <Spin dataSet={this.formRateDs}>
          <div className={styles['rate-all']}>
            {customizeForm(
              {
                code: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc}`,
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
    if (sourceFromPub) {
      Modal.open({
        closable: sourceFromPub,
        mask: true,
        drawer: true,
        style: { width: '380px' },
        okCancel: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
        title: intl.get(`sinv.common.view.message.comments`).d('评价'),
        children: <Comp />,
      });
    } else {
      const modal = Modal.open({
        mask: true,
        drawer: true,
        style: { width: '380px' },
        // onOk: () => this.handleRateOk(),
        title: intl.get(`sinv.common.view.message.comments`).d('评价'),
        children: <Comp />,
        footer: () => (
          <div>
            <Button color="primary" onClick={() => this.handleRateOk(modal)}>
              {intl.get('hzero.common.button.sure').d('确定')}
            </Button>
            <Button onClick={() => modal.close()}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
          </div>
        ),
      });
    }
  }

  @Bind()
  async handleRateOk(modal) {
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
      handleEvaluate(params).then((res) => {
        if (getResponse(res)) {
          modal.close();
        }
      });
    }
  }

  @Bind()
  async handleRevoke() {
    const businessKey = this.formDs?.current?.get('businessKey');
    Modal.confirm({
      contentStyle: { width: '550px' },
      title: intl.get('slod.deliveryWorkbench.view.message.help').d('提示'),
      children: (
        <div>
          <span>
            {intl
              .get('slod.deliveryWorkbench.view.message.revokeApprovalMessage')
              .d('是否确认撤销审批？撤销后您仍可在此提交发起审批（仅工作流审批发起人可执行撤销）')}
          </span>
        </div>
      ),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: async () => {
        try {
          this.setState({ spinning: true });
          const res = await handleSupplierRevokeApprovalApi({ businessKey });
          if (getResponse(res)) {
            this.setState({ spinning: false });
            notification.success({
              message: intl.get('hzero.common.notification.success').d('操作成功'),
              description: intl
                .get('slod.deliveryWorkbench.view.message.approvalSuccess')
                .d('撤销审批成功'),
            });
            this.props.history.push({
              pathname: `/sinv/supplier-receipt-workbench/list`,
            });
            this.onBack();
          } else {
            this.setState({ spinning: false });
          }
        } finally {
          this.setState({ spinning: false });
        }
      },
    });
  }

  splitLine = (record) => {
    const { data } = record;
    const dataList = {
      ...data,
      rcvTrxLineId: null,
      trxLineNum: 0,
      displayTrxLineNum: 0,
      _token: null,
      inventoryId: data.inventoryId?.inventoryId,
      locatorId: data.locatorId?.locationId,
      secondaryUomId: data.secondaryUomId.uomId,
      locationName: data.locatorId?.locationName,
      inventoryName: data.inventoryId?.inventoryName,
    };
    this.tableDs.create(dataList);
  };

  @Bind()
  onOpenLinkChange = (record = {}, linkOrder = null, header) => {
    const { customizeTable, customizeBtnGroup, queryUnitConfig } = this.props;
    const { nodeConfigIndexAbc, from, rcvStatusCode, externalSystem } = this.state;
    const basicProps = {
      from,
      header,
      editor: true,
      rcvStatusCode,
      type: linkOrder,
      returnedFlag: 0, // 收货
      nodeConfigIndexAbc,
      externalSystem,
      customizeTable,
      customizeBtnGroup,
      queryUnitConfig,
      ...record?.get(['rcvTrxHeaderId', 'rcvTrxLineId']),
    };
    const modal = Modal.open({
      drawer: true,
      closable: true,
      resizable: true,
      style: { width: '742px' },
      children: <CustomLinkIndex {...basicProps} />,
      footer: (
        <Button color="primary" onClick={() => modal.close()}>
          {intl.get('hzero.common.status.closed').d('关闭')}
        </Button>
      ),
    });
  };

  // 已收货-导出状态
  operaClick = (record) => {
    const { rcvTrxLineId, rcvTrxHeaderId } = record?.data || {};
    c7nModal({
      style: { width: 742 },
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      title: intl.get(`sinv.common.view.title.detailStatus`).d('状态明细'),
      children: (
        <ImportModal
          id={rcvTrxLineId}
          headerId={rcvTrxHeaderId}
          fetchDataSource={() => this.fetchReceiveTransactionDetails}
        />
      ),
    });
  };

  /**
   * fetchReceiveTransactionDetails - 获取列表数据
   * @param {Object} payload - 查询参数
   */
  fetchReceiveTransactionDetails = (page = {}, id) => {
    const { dispatch } = this.props;
    return dispatch({
      type: 'purchaseReceiptRecord/queryReceiveTransactionDetails',
      payload: {
        page,
        rcvTrxLineId: id,
      },
    });
  };

  onCustomSpecsJsonChange = (value) => {
    this.setState({
      customData: value ? JSON.parse(value) : [],
      customVisible: true,
    });
  };

  render() {
    const {
      type,
      from,
      editFieldFlag,
      spinning,
      customData,
      customVisible,
      rcvStatusCode,
      rcvTrxHeaderId,
      messageVisible,
      nodeConfigIndexAbc,
      sourceFromPub,
      search,
      pathname,
      nodeConfigTitleName,
      externalSystem,
      unreadQuantity,
    } = this.state;
    const {
      remote,
      customizeForm,
      custLoading,
      customizeTable,
      customizeBtnGroup,
      doubleUnitEnabled,
    } = this.props;
    const { renderFormFieldRichText, cuxHandleLineBtns } = remote?.props?.process || {};
    const opreateFlag =
      rcvStatusCode === '10_NEW' ||
      rcvStatusCode === '30_REJECTED' ||
      rcvStatusCode === '30_SUP_REJECTED';
    const backPath = sourceFromPub
      ? false
      : editFieldFlag
      ? `${search}${pathname}`
      : `/sinv/supplier-receipt-workbench/list`;
    const customProps = {
      visible: customVisible,
      dataSource: customData,
      hideModal: () => {
        this.setState({ customVisible: false });
      },
    };
    const messageProps = {
      rcvTrxHeaderId,
      messageVisible,
      offMessage: this.offMessage,
    };
    const titleName = {
      SOURCE: `${intl
        .get('sinv.receiptWorkbench.view.title.detail.createReceiptRecord')
        .d('新建收货单')}${nodeConfigTitleName ? '-' : ''}${nodeConfigTitleName}`,
      two: `${intl
        .get('sinv.receiptWorkbench.view.title.detail.editReceiptRecord')
        .d('编辑收货单')}${nodeConfigTitleName ? '-' : ''}${nodeConfigTitleName}`,
      three: editFieldFlag
        ? `${intl
            .get('sinv.receiptWorkbench.view.title.detail.updateReceiptRecord')
            .d('变更收货单')}${nodeConfigTitleName ? '-' : ''}${nodeConfigTitleName}`
        : `${intl
            .get('sinv.receiptWorkbench.view.title.detail.lookReceiptRecord')
            .d('查看收货单')}${nodeConfigTitleName ? '-' : ''}${nodeConfigTitleName}`,
      four: `${intl
        .get('sinv.receiptWorkbench.view.title.detail.lookReceiptRecord')
        .d('查看收货单')}${nodeConfigTitleName ? '-' : ''}${nodeConfigTitleName}`,
      five: `${intl
        .get('sinv.receiptWorkbench.view.title.detail.affirmReceiptRecord')
        .d('确认收货单')}${nodeConfigTitleName ? '-' : ''}${nodeConfigTitleName}`,
      default: `${intl.get('sinv.receiptWorkbench.view.title.detail.receiptDetail').d('收货明细')}${
        nodeConfigTitleName ? '-' : ''
      }${nodeConfigTitleName}`,
    };
    const lineProps = {
      type,
      from,
      custLoading,
      editFieldFlag, //
      sourceFromPub, // todo
      rcvStatusCode,
      externalSystem,
      customizeTable,
      cuxHandleLineBtns,
      doubleUnitEnabled,
      nodeConfigIndexAbc,
      formDs: this.formDs,
      tableDs: this.tableDs,
      operaClick: this.operaClick,
      splitLine: this.splitLine,
      lineDelete: this.lineDelete,
      onOpenLinkChange: this.onOpenLinkChange,
      handleBatchMaintenance: this.handleBatchMaintenance,
      onCustomSpecsJsonChange: this.onCustomSpecsJsonChange,
    };

    const headerBtnProps = {
      type,
      from,
      history,
      spinning,
      isSupplier, // *todo
      rcvStatusCode,
      rcvTrxHeaderId, // *todo
      unreadQuantity,
      sourceFromPub,
      editFieldFlag,
      customizeBtnGroup,
      nodeConfigIndexAbc, // *todo
      formDs: this.formDs,
      handRate: this.handRate,
      handlePrint: this.handlePrint,
      handleAffirm: this.handleAffirm,
      openMessage: this.openMessage,
      operaChange: this.operaChange,
      handleRevoke: this.handleRevoke,
      handleSubmit: this.handleSubmit,
      handleSave: this.handleSave,
      handleDelete: this.handleDelete,
      openEdit: this.openEdit,
    };

    const CoHeader = observer(() => {
      return (
        <Header
          title={
            from
              ? titleName[from] || titleName.default
              : type
              ? titleName[type] || titleName.default
              : titleName.default
          }
          backPath={backPath}
          onBack={this.onBack}
        >
          <HeaderBtnComps dataSet={this.formDs} _btnObjs={headerBtnProps} />
          {/* {customizeBtnGroup(
            { code: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.BUTTON.${nodeConfigIndexAbc}`, pro: true },
            <DynamicButtons
              buttons={buttons}
              maxNum={7}
              defaultBtnType="c7n-pro"
              permissions={[
                {
                  code: 'srm.logistics.receive.supplier-receipt-workbench.button.print',
                  name: 'print',
                },
                {
                  code: 'srm.logistics.receive.supplier-receipt-workbench.button.newPrint',
                  name: 'newPrint',
                },
                {
                  code: 'srm.logistics.receive.supplier-receipt-workbench.button.onlinechat',
                  name: 'onlineChat',
                },
                {
                  code: 'srm.logistics.receive.supplier-receipt-workbench.button.line.approval',
                  name: 'approval',
                },
                {
                  code: 'srm.logistics.receive.supplier-receipt-workbench.button.line.revokeapproval',
                  name: 'revoke',
                },
              ]}
            />
          )} */}
        </Header>
      );
    });
    return (
      <Fragment>
        <CoHeader />
        <div style={{ overflowY: 'auto' }}>
          <Spin spinning={spinning || false}>
            <Content style={{ marginBottom: 8, padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <h3 className={styles['page-title']}>
                  {intl
                    .get(`sinv.receiptWorkbench.view.title.detail.receipHeaderInfo`)
                    .d('收货单基础信息')}
                </h3>
              </div>
              <div className={styles['form-info']}>
                {(from === 'three' || from === 'four') && !editFieldFlag
                  ? // 已完成 不可编辑
                    customizeForm(
                      {
                        code: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.${nodeConfigIndexAbc}`,
                        readOnly: true,
                      },
                      <Form
                        labelLayout="vertical"
                        dataSet={this.formDs}
                        columns={3}
                        className="form-readOnly"
                        useWidthPercent
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
                        {!isSupplier && <Output name="unitAll" />}
                        <Output
                          name="rcvStatusCode"
                          renderer={({ record }) => {
                            return record && renderRcvStatus(record);
                          }}
                        />
                        {/* {doubleUnitEnabled && (
                          <Output
                            name="secondaryTotalQuantity"
                            renderer={({ value }) => showBigNumber(value)}
                          />
                        )} */}
                        <Output
                          name="totalQuantity"
                          renderer={({ value }) => showBigNumber(value)}
                        />
                        <Output
                          name="totalTaxIncludedAmount"
                          renderer={({ value, record }) =>
                            record?.get('hidePriceFlag')
                              ? '***'
                              : showBigNumber(value, record && record.get('financialPrecision'))
                          }
                        />
                        <Output name="remark" />
                        {typeof renderFormFieldRichText === 'function' ? (
                          renderFormFieldRichText({ formDs: this.formDs, readOnly: true })
                        ) : (
                          <></>
                        )}
                        <Output name="receivedBy" />
                        {isSupplier && (
                          <Output
                            name="supplierReceiptFlag"
                            renderer={({ value }) => yesOrNoRender(+value)}
                          />
                        )}
                        <Output
                          name="linkFirst"
                          renderer={({ record }) => (
                            <a onClick={() => this.onOpenLinkChange(record, Number(1), Number(1))}>
                              {from === 'three' || !externalSystem || rcvStatusCode === '35_PUBLISH'
                                ? intl.get('hzero.common.button.look').d('查看')
                                : intl.get('hzero.common.view.button.edit').d('编辑')}
                            </a>
                          )}
                        />
                        <Output
                          name="linkSecond"
                          renderer={({ record }) => (
                            <a onClick={() => this.onOpenLinkChange(record, Number(2), Number(1))}>
                              {from === 'three' || !externalSystem || rcvStatusCode === '35_PUBLISH'
                                ? intl.get('hzero.common.button.look').d('查看')
                                : intl.get('hzero.common.view.button.edit').d('编辑')}
                            </a>
                          )}
                        />
                      </Form>
                    )
                  : // 其他
                    customizeForm(
                      {
                        code: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.${nodeConfigIndexAbc}`,
                        readOnly: sourceFromPub
                          ? from === 'three'
                            ? !editFieldFlag || rcvStatusCode === '20_SUBMITTED'
                            : rcvStatusCode === '20_SUBMITTED'
                          : from === 'three' && !editFieldFlag,
                        disableOutput: 'Output',
                        __force_record_to_update__: true,
                      },
                      <Form labelLayout="float" dataSet={this.formDs} columns={3} useWidthPercent>
                        <TextField name="displayTrxNum" disabled />
                        <TextField name="companyName" disabled />
                        <TextField
                          name="supplierCompanyName"
                          disabled
                          renderer={({ record }) => {
                            if (record && record.get('supplierId')) {
                              return record && record.get('supplierName');
                            } else {
                              return record && record.get('supplierCompanyName');
                            }
                          }}
                        />
                        <TextField name="nodeConfigName" disabled />
                        <TextField
                          name="returnedFlag"
                          disabled
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
                        <Lov
                          name="rcvTypeAll"
                          disabled={
                            from === 'five' || !externalSystem
                              ? true
                              : ['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode)
                          }
                        />
                        <TextField name="creationName" disabled />
                        <TextField
                          name="creationDate"
                          disabled
                          renderer={({ value }) =>
                            value ? moment(value).format(DEFAULT_DATETIME_FORMAT) : null
                          }
                        />
                        {!isSupplier && (
                          <Lov
                            name="unitAll"
                            disabled={
                              !opreateFlag ||
                              !externalSystem ||
                              ['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode)
                            }
                          />
                        )}
                        <TextField
                          name="rcvStatusCode"
                          disabled
                          renderer={({ record }) => {
                            return record && record.get('rcvStatusCodeMeaning');
                          }}
                        />
                        {/* {doubleUnitEnabled && (
                          <TextField
                            name="secondaryTotalQuantity"
                            renderer={({ value }) => showBigNumber(value)}
                            disabled
                          />
                        )} */}
                        <TextField
                          name="totalQuantity"
                          renderer={({ value }) => showBigNumber(value)}
                          disabled
                        />
                        <TextField
                          name="totalTaxIncludedAmount"
                          renderer={({ value, record }) =>
                            record?.get('hidePriceFlag')
                              ? '***'
                              : showBigNumber(value, record && record.get('financialPrecision'))
                          }
                          disabled
                        />
                        <TextArea
                          name="remark"
                          newLine
                          resize="both"
                          colSpan={2}
                          autoSize={{ minRows: 2, maxRows: 8 }}
                          disabled={
                            from === 'five' || !externalSystem
                              ? true
                              : ['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode)
                          }
                        />
                        {typeof renderFormFieldRichText === 'function' ? (
                          renderFormFieldRichText({ formDs: this.formDs })
                        ) : (
                          <></>
                        )}
                        <TextField
                          name="receivedBy"
                          disabled={
                            editFieldFlag || ['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode)
                          }
                        />
                        {isSupplier && (
                          <Output
                            name="supplierReceiptFlag"
                            renderer={({ value }) => yesOrNoRender(+value)}
                          />
                        )}
                        <Output
                          name="linkFirst"
                          renderer={({ record }) => (
                            <a onClick={() => this.onOpenLinkChange(record, Number(1), Number(1))}>
                              {from === 'three' || !externalSystem || rcvStatusCode === '35_PUBLISH'
                                ? intl.get('hzero.common.button.look').d('查看')
                                : intl.get('hzero.common.view.button.edit').d('编辑')}
                            </a>
                          )}
                        />
                        <Output
                          name="linkSecond"
                          renderer={({ record }) => (
                            <a onClick={() => this.onOpenLinkChange(record, Number(2), Number(1))}>
                              {from === 'three' || !externalSystem || rcvStatusCode === '35_PUBLISH'
                                ? intl.get('hzero.common.button.look').d('查看')
                                : intl.get('hzero.common.view.button.edit').d('编辑')}
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
              <LineTable {...lineProps} />
              {/* {customizeTable(
                {
                  code: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_${nodeConfigIndexAbc}`,
                  readOnly: sourceFromPub
                    ? from === 'five' || !externalSystem
                      ? false
                      : from === 'three' || from === 'four'
                      ? !editFieldFlag || rcvStatusCode === '20_SUBMITTED'
                      : rcvStatusCode === '20_SUBMITTED'
                    : from === 'five' || !externalSystem
                    ? false
                    : from === 'three' || (from === 'four' && !editFieldFlag),
                  __force_record_to_update__: true,
                },
                <Table
                  virtual
                  dataSet={this.tableDs}
                  custLoading={custLoading}
                  columns={columns}
                  pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
                  style={{ maxHeight: 400 }}
                  virtualCell
                  queryFieldsLimit={3}
                  buttons={
                    from === 'five' || !externalSystem
                      ? []
                      : !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode) && [
                        <LineBtn dataSet={this.tableDs} />,
                        ]
                  }
                  selectionMode={
                    from === 'five' || !externalSystem
                      ? 'none'
                      : !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode)
                      ? 'rowbox'
                      : 'none'
                  }
                />
              )} */}
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
                    code: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
                    readOnly:
                      from === 'three'
                        ? !editFieldFlag || rcvStatusCode === '20_SUBMITTED'
                        : rcvStatusCode === '20_SUBMITTED',
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
                      readOnly={
                        rcvStatusCode === '40_FINISHED' ||
                        rcvStatusCode === '20_SUBMITTED' ||
                        from === 'five' ||
                        !externalSystem
                      }
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
        {customVisible && <CustomModal {...customProps} />}
        {messageVisible && <MessageBoard {...messageProps} />}
      </Fragment>
    );
  }
}
