/*
 * @Description:
 * @Date: 2021-05-01 09:20:13
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Fragment, Component } from 'react';
import {
  DataSet,
  Button,
  TextField,
  Form,
  TextArea,
  Spin,
  Modal,
  DatePicker,
  Lov,
  Tooltip,
  Attachment,
  Output,
  Icon,
} from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import qs from 'querystring';
import { Bind, Debounce } from 'lodash-decorators';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { isEmpty, isNil } from 'lodash';
import { Header, Content } from 'components/Page';
import moment from 'moment';
import { yesOrNoRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import intl from 'utils/intl';
import notification from 'utils/notification';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import ImageList from '@/routes/components/ImageList';
import cuxRemote from 'hzero-front/lib/utils/remote';
import DynamicButtons from '_components/DynamicButtons';
import C7nPrecisionInputNumber from '@/components/Precision/C7nPrecisionInputNumber';
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
import { formDS, tableDS, batchMaintenanceDS, formRateDS, attachmentDS } from './store/lineDS.ts';
import CustomModal from '../../ReceiptExecution/components/CustomModal';
import Operaindex from '../components/Operating/index';
import MessageBoard from '@/routes/components/MessageBoard/index';
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
import ImportModal from '../ThingReceipts/components/importModal';

function getUnitCode() {
  const code = [];
  for (let i = 0; i < 10; i++) {
    const index = String.fromCharCode(65 + i);
    code.push(
      `SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.LINE_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.DETAIL.BUTTON.RETURN_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.ATTRCH_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.LINE_SEARCH_A`
    );
  }
  return code;
}
@useDoubleUomConfig()
@WithCustomize({
  unitCode: getUnitCode(),
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
      getLineInfoDs: (value) => value,
    },
  },
  {
    events: {
      cuxHandleForm() {}, // 二开执行逻辑
    },
  }
)
@formatterCollections({
  code: [
    'sinv.receiptExecution',
    'hzero.common',
    'sinv.deliveryCreation',
    'ssta.common',
    'sinv.receiptWorkbench',
  ],
})
export default class ExecutionDetail extends Component {
  formDs = new DataSet(formDS());

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
    const { renderValidateField } = remote?.props?.process || {};
    // this.tableDs = new DataSet(tableDS(this.formDs, renderValidateField));
    this.tableDs = new DataSet(
      remote?.process('getLineInfoDs', tableDS(this.formDs, renderValidateField), {
        comp: 'sup',
        returnedFlag: 1,
      })
    );
    this.tableDs.setState('doubleUnitEnabled', doubleUnitEnabled);
    const {
      type,
      from,
      viewType,
      courseAsLine,
      nodeConfigIndexAbc,
      pageCurrentIsSelectedNodeCodes,
    } = qs.parse(search.substr(1));

    this.state = {
      search,
      pathname,
      type,
      from,
      viewType,
      courseAsLine,
      unreadQuantity: 0,
      nodeConfigIndexAbc,
      spinning: false,
      customVisible: false, // 定制化属性Modal显示
      messageVisible: false,
      rcvTrxHeaderId: params.id,
      editFieldFlag: false,
      nodeConfigTitleName: '...',
      editFlag: type === 'END' || type === 'COURSE',
      customData: [], // 定制化属性Modal的Table数据源
      sourceFromPub: path.includes('pub'),
      externalSystem: true, // 是否来源srm
      pageCurrentIsSelectedNodeCodes,
    };
  }

  @Bind
  handleRefresh() {
    const { rcvTrxHeaderId, nodeConfigIndexAbc } = this.state;
    this.formDs.setQueryParameter('params', {
      rcvTrxHeaderId,
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
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
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.LINE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.LINE_SEARCH_A`,
    });
    this.tableDs.query();
  }

  componentDidMount() {
    this.setState({
      spinning: true,
    });
    this.handleRefresh();
    this.fetchCalcRuleConfig();
  }

  // 查询金额计算配置
  @Bind()
  async fetchCalcRuleConfig() {
    const result = await queryCalcRuleConfig();
    this.tableDs.setState('amountCalcRule', result);
  }

  @Bind()
  @Debounce(400)
  async handleSave() {
    const { nodeConfigIndexAbc, rcvTrxHeaderId } = this.state;
    validToken(this.formDs);
    const saveData = {
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.LINE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
      data: {
        ...this.formDs?.current?.toData(),
        ...this.attachmentDs?.current?.toJSONData(),
        sinvRcvTrxLineDTOS: this.tableDs
          .toJSONData()
          .map((m) => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId })),
      },
    };
    const headerFlag = await this.formDs.validate();
    const attachmentFlag = await this.attachmentDs.validate();
    const flag = await this.tableDs.validate();
    if (headerFlag && flag && attachmentFlag) {
      this.setState({ spinning: true });
      const res = getResponse(
        await handleSave(saveData).finally(() => {
          this.setState({ spinning: false });
        })
      );
      if (res) {
        notification.success();
        this.setState({
          editFieldFlag: false,
        });
        this.formDs.query();
        this.tableDs.query();
        this.formRateDs.setQueryParameter('params', {
          rcvTrxHeaderId,
          customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
        });
      }
    }
  }

  @Bind()
  @Debounce(400)
  async handleSubmit() {
    const { nodeConfigIndexAbc } = this.state;
    validToken(this.formDs);
    const saveData = {
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.LINE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.ATTRCH_${nodeConfigIndexAbc}`,

      data: {
        ...this.formDs?.current?.toData(),
        ...this.attachmentDs?.current?.toJSONData(),
        sinvRcvTrxLineDTOS: this.tableDs
          .toJSONData()
          .map((m) => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId })),
      },
    };
    const headerFlag = await this.formDs.validate();
    const attachmentFlag = await this.attachmentDs.validate();
    const flag = await this.tableDs.validate();
    if (!attachmentFlag || !flag) {
      formatErrorInfo(
        this.attachmentDs,
        this.tableDs,
        intl.get(`sinv.receiptWorkbench.view.title.detail.receipLineInfo`).d('收货单明细行信息')
      );
    }
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
    if (headerFlag && flag && attachmentFlag) {
      confirm({
        content: `${intl
          .get(`sinv.receiptExecution.view.message.submitTip`)
          .d(`确定要提交单据`)}${tips}?`,
        onOk: async () => {
          this.setState({ spinning: true });
          const res = getResponse(
            await handleSubmit(saveData).finally(() => {
              this.setState({ spinning: false });
            })
          );
          if (res && res.doAsynFlag === 1) {
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
          if (res) {
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
  lineDelete(select) {
    // poAllFlag 订单标识 asnAllFlag 送货单标识 fromDisplayPoNum 订单号 fromDisplayAsnNum 送货单号
    const selectData = select
      .map((item) => item.toJSONData())
      .map((m) => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId }));
    const selectDataPoNum = selectData.filter((i) => i.fromDisplayPoNum);
    const selectDataAsnNum = selectData.filter((i) => i.fromDisplayAsnNum);
    const params = { ...this.formDs.toData()[0], sinvRcvTrxLineDTOS: selectData };
    let isPoNum = true;
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
      Modal.confirm({
        contentStyle: { width: '550px' },
        children: intl.get('sinv.receiptExecution.view.message.sureDelete').d('确定要删除此单据?'),
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
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl.get('sinv.receiptExecution.view.message.orderDel').d(`确认删除选中行？`),
        onOk: async () => {
          const res = await handleDel(params);
          if (getResponse(res)) {
            notification.success();
            this.handleRefresh();
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
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: async () => {
        const res = getResponse(await handleDelete(params));
        if (res) {
          this.props.history.push({
            pathname: `/sinv/supplier-receipt-workbench/list`,
          });
          this.onBack();
        }
      },
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
    Modal.open({
      mask: true,
      drawer: true,
      // closable: true,
      // resizable: true,
      okCancel: false,
      style: { width: '742px' },
      children: <Operaindex {...operaProps} />,
      title: intl.get('sinv.common.model.common.operationRecord').d('操作记录'),
      okText: intl.get('hzero.common.status.closed').d('关闭'),
    });
  };

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

  /**
   * 打印功能
   */
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
  handleBatchMaintenance() {
    const ds = this.tableDs;
    const listData = ds.toJSONData();
    const selectList = ds.selected.map((item) => item.toJSONData());
    const invData = (isEmpty(ds.selected) ? listData : selectList).map(
      (item) => item.invOrganizationId
    );
    const invenData = (isEmpty(ds.selected) ? listData : selectList).map(
      (item) => item.inventoryId
    );
    const invFlag = new Set(invData).size === 0 || new Set(invData).size === 1; // 判断采购组织是否相等 相等true 不等 false
    const invenFlag = new Set(invenData).size === 1; // 判断库房是否相等 相等true 不等 false
    const invenIdFlag = isNil(invenData[0]); // 判断inventoryId是否为null 或 undefined
    Modal.open({
      mask: true,
      drawer: true,
      style: { width: '388px' },
      onOk: () => this.handleBatchOk(),
      title: intl.get(`sinv.receiptExecution.model.receipt.batchMaintenance`).d('批量维护'),
      children: (
        <div style={{ with: 380 }}>
          <Form labelLayout="float" dataSet={this.batchMaintenanceDs} columns={1}>
            <DatePicker name="trxDate" />
            {invFlag ? (
              <Lov style={{ width: '100%' }} name="inventoryId" />
            ) : (
              <Tooltip
                placement="topLeft"
                title={intl
                  .get(`sinv.receiptWorkbench.model.receipt.noInventoryNameLov`)
                  .d('收货组织不一致')}
              >
                <Lov style={{ width: '100%' }} disabled={!invFlag} name="inventoryId" />
              </Tooltip>
            )}
            {invFlag && invenFlag && !invenIdFlag ? (
              <Lov style={{ width: '100%' }} name="locatorId" />
            ) : (
              <Tooltip
                placement="topLeft"
                title={intl
                  .get(`sinv.receiptWorkbench.model.receipt.noLocationName`)
                  .d('收货库房不一致')}
              >
                <Lov
                  style={{ width: '100%' }}
                  disabled={!invFlag || !invenFlag || invenIdFlag}
                  name="locatorId"
                />
              </Tooltip>
            )}
          </Form>
        </div>
      ),
    });
  }

  @Bind()
  async handleBatchOk() {
    const ds = this.tableDs;
    const dataDs = this.batchMaintenanceDs;
    const formFlag = await dataDs.validate();
    if (!formFlag) return false;
    const tempArr = [];
    dataDs.fields.forEach((i) => {
      tempArr.push(i.get('name'));
    });
    const data = dataDs.current.get(tempArr);
    runInAction(() => {
      (isEmpty(ds.selected) ? ds : ds.selected).forEach((i) => {
        tempArr.forEach((key) => {
          const field = i.getField(key);
          if (!isNil(data[key]) && !field.disabled) {
            i.set({ [key]: data[key] });
          }
        });
      });
    });
    this.batchMaintenanceDs.reset();
  }

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
      handleEvaluate(params).then((res) => {
        if (getResponse(res)) {
          return false;
        } else {
          return true;
        }
      });
    } else {
      return false;
    }
  }

  @Debounce(400)
  handleAffirm = async (type) => {
    const { nodeConfigIndexAbc } = this.state;
    const saveData = {
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.LINE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
      data: {
        ...this.formDs.toData()[0],
        sinvHeaderAttachmentUuid: this.attachmentDs.toData()[0].sinvHeaderAttachmentUuid,
        sinvRcvTrxLineDTOS: this.tableDs
          .toJSONData()
          .map((m) => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId })),
      },
    };
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
    };
    this.tableDs.create(dataList);
  };

  @Bind()
  onOpenLinkChange = (record = {}, linkOrder = null, header) => {
    const { customizeTable, customizeBtnGroup, queryUnitConfig } = this.props;
    const { nodeConfigIndexAbc, from, editFieldFlag, rcvStatusCode, externalSystem } = this.state;
    const basicProps = {
      from,
      header,
      rcvStatusCode,
      type: linkOrder,
      returnedFlag: 1, // 退货
      nodeConfigIndexAbc,
      editor: editFieldFlag,
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

  render() {
    const {
      type,
      from,
      editFlag,
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
      customizeTable,
      custLoading,
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
    const messageProps = {
      rcvTrxHeaderId,
      messageVisible,
      offMessage: this.offMessage,
    };
    const LineBtn = observer(({ dataSet }) => {
      const flags1 = from === 'five' || !externalSystem;
      const flags2 = ['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode);
      const lineBtns = [
        {
          name: 'delete',
          btnType: 'c7n-pro',
          hidden: flags1 || flags2,
          child: (name) => name || intl.get(`hzero.common.button.batchdelete`).d('批量删除'),
          btnProps: {
            funcType: 'flat',
            color: 'primary',
            icon: 'delete_sweep',
            onClick: () => this.lineDelete(dataSet.selected),
            disabled: isEmpty(dataSet?.selected) || !editFlag,
          },
        },
      ];
      const btns = cuxHandleLineBtns(lineBtns, { formDs: this.formDs });

      return <DynamicButtons buttons={btns} />;
    });
    const columns = [
      {
        name: 'importStatusMeaning',
        width: 160,
        renderer: ({ record, value }) => {
          let dom = null;
          const importStatus = record.get('importStatus');
          if (importStatus === 'SUCCESS') {
            dom = (
              <Tag onClick={() => this.operaClick(record)} color="green" style={{ border: 'none' }}>
                {value}
                <Icon
                  type="wysiwyg"
                  style={{ fontSize: '14px', margin: '0 0 2px 3px', fontWeight: 'normal' }}
                />
              </Tag>
            );
          } else if (importStatus === 'FAIL') {
            dom = (
              <Tag onClick={() => this.operaClick(record)} color="red" style={{ border: 'none' }}>
                {value}
                <Icon
                  type="wysiwyg"
                  style={{ fontSize: '14px', margin: '0 0 2px 3px', fontWeight: 'normal' }}
                />
              </Tag>
            );
          } else if (importStatus === 'IMPORTING') {
            dom = (
              <Tag
                onClick={() => this.operaClick(record)}
                color="yellow"
                style={{ border: 'none' }}
              >
                {value}
                <Icon
                  type="wysiwyg"
                  style={{ fontSize: '14px', margin: '0 0 2px 3px', fontWeight: 'normal' }}
                />
              </Tag>
            );
          } else {
            dom = '-';
          }
          return dom;
        },
      },
      {
        name: 'itemCode',
        width: 120,
        sortable: true,
      },
      {
        name: 'itemName',
        width: 160,
      },
      doubleUnitEnabled && {
        name: 'secondaryUomId',
        width: 160,
        renderer: ({ record }) => record.get('secondaryUomName'),
        editor: (from === 'five' || !externalSystem) && false,
        header: intl.get('sinv.receiptExecution.model.receipt.secondaryUomName').d('单位'),
      },
      {
        name: 'uomName',
        width: 150,
        header: doubleUnitEnabled
          ? intl.get('sinv.receiptExecution.model.receipt.uomBaseName').d('基本单位')
          : intl.get('sinv.receiptExecution.model.receipt.uomName').d('单位'),
      },
      doubleUnitEnabled && {
        name: 'secondaryQuantity',
        width: 150,
        editor: (
          record // 开启则退货数量可编辑必填
        ) =>
          from === 'five' || !externalSystem
            ? false
            : !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode) &&
              record.get('subjectType') === 'QUANTITY' &&
              editFlag && (
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
      doubleUnitEnabled &&
        !['40_FINISHED'].includes(rcvStatusCode) && {
          name: 'secondaryLeftQuantity',
          width: 150,
        },
      {
        name: 'quantity',
        width: 120,
        editor: (record) =>
          from === 'five' || !externalSystem
            ? false
            : !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode) &&
              record.get('subjectType') === 'QUANTITY' &&
              editFlag && (
                <C7nPrecisionInputNumber
                  name="quantity"
                  record={record}
                  precision={!isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10}
                />
              ),
        renderer: ({ value }) => showBigNumber(value),
        header: doubleUnitEnabled
          ? intl.get('sinv.receiptExecution.model.receipt.return.baseQuantity').d('退货基本数量')
          : intl.get('sinv.receiptExecution.model.receipt.return.quantitys').d('退货数量'),
      },
      {
        name: 'moveReason',
        width: 160,
        editor:
          from === 'five' || !externalSystem
            ? false
            : !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode) && editFlag,
      },
      externalSystem &&
        !['40_FINISHED'].includes(rcvStatusCode) && {
          name: 'leftQuantity',
          width: 120,
          renderer: ({ value, record }) =>
            record.get('parentLimitlessReceiptFlag') === 1 &&
            record.get('subjectType') === 'QUANTITY' &&
            value === 0
              ? '-'
              : showBigNumber(value),
          header: doubleUnitEnabled
            ? intl
                .get('sinv.receiptExecution.model.receipt.canLeftBaseQuantity')
                .d('可退货基本数量')
            : intl.get('sinv.receiptExecution.model.receipt.canLeftQuantitys').d('可退货数量'),
        },
      {
        name: 'taxIncludedAmount',
        width: 130,
        editor: (record) =>
          from === 'five' || !externalSystem
            ? false
            : !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode) &&
              editFlag &&
              record.get('subjectType') === 'AMOUNT',
        renderer: ({ value, record }) =>
          record.get('hidePriceFlag') === 1
            ? '***'
            : record.get('parentLimitlessReceiptFlag') === 1 &&
              record.get('subjectType') === 'QUANTITY' &&
              value === 0
            ? '-'
            : showBigNumber(value, record.get('financialPrecision')),
      },
      externalSystem &&
        !['40_FINISHED'].includes(rcvStatusCode) && {
          name: 'leftTaxAmount',
          width: 120,
          renderer: ({ value, record }) =>
            record.get('hidePriceFlag') === 1
              ? '***'
              : record.get('parentLimitlessReceiptFlag') === 1 &&
                record.get('subjectType') === 'QUANTITY' &&
                value === 0
              ? '-'
              : showBigNumber(value, record.get('financialPrecision')),
        },
      {
        name: 'trxDate',
        width: 160,
        editor:
          from === 'five' || !externalSystem
            ? false
            : !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode) && editFlag,
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
      {
        name: 'remark',
        width: 150,
        editor:
          from === 'five' || !externalSystem
            ? false
            : !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode) && editFlag,
      },
      {
        name: 'sinvLineAttachmentUuid',
        editor: from === 'five' || !externalSystem ? false : opreateFlag,
      },
      {
        name: 'customSpecsJson',
        width: 120,
        renderer: ({ value }) => {
          return (
            <a
              onClick={() => {
                this.setState({
                  customData: value ? JSON.parse(value) : [],
                  customVisible: true,
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
          <a onClick={() => this.onOpenLinkChange(record, Number(1), Number(0))}>
            {from === 'three' || !externalSystem || rcvStatusCode === '35_PUBLISH'
              ? intl.get('hzero.common.button.look').d('查看')
              : intl.get('hzero.common.view.button.edit').d('编辑')}
          </a>
        ),
      },
      {
        name: 'linkSecond',
        width: 100,
        renderer: ({ record }) => (
          <a onClick={() => this.onOpenLinkChange(record, Number(2), Number(0))}>
            {from === 'three' || !externalSystem || rcvStatusCode === '35_PUBLISH'
              ? intl.get('hzero.common.button.look').d('查看')
              : intl.get('hzero.common.view.button.edit').d('编辑')}
          </a>
        ),
      },
      {
        name: 'projectTaskId',
        width: 110,
        renderer: ({ record }) => {
          return record.get('projectTaskName');
        },
      },
    ];
    const titleName = {
      END: `${intl
        .get('sinv.receiptWorkbench.view.title.detail.createReturnRecord')
        .d('新建退货单')}${nodeConfigTitleName ? '-' : ''}${nodeConfigTitleName}`,
      two: `${intl
        .get('sinv.receiptWorkbench.view.title.detail.editedReturnRecord')
        .d('编辑退货单')}${nodeConfigTitleName ? '-' : ''}${nodeConfigTitleName}`,
      three: editFieldFlag
        ? `${intl
            .get('sinv.receiptWorkbench.view.title.detail.updateReturnRecord')
            .d('变更退货单')}${nodeConfigTitleName ? '-' : ''}${nodeConfigTitleName}`
        : `${intl.get('sinv.receiptWorkbench.view.title.detail.lookReturnRecord').d('查看退货单')}${
            nodeConfigTitleName ? '-' : ''
          }${nodeConfigTitleName}`,
      five: `${intl
        .get('sinv.receiptWorkbench.view.title.detail.affirmReturnRecord')
        .d('确认退货单')}${nodeConfigTitleName ? '-' : ''}${nodeConfigTitleName}`,
      default: `${intl.get('sinv.receiptWorkbench.view.title.detail.returnDetail').d('退货明细')}${
        nodeConfigTitleName ? '-' : ''
      }${nodeConfigTitleName}`,
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
        </Header>
      );
    });

    return (
      <Fragment>
        <CoHeader dataSet={this.tableDs} formDataSet={this.formDs} />
        <div style={{ overflowY: 'auto' }}>
          <Spin spinning={spinning || false}>
            <Content style={{ marginBottom: 8 }}>
              <div style={{ marginBottom: 16 }}>
                <h3 className={styles['page-title']}>
                  {intl
                    .get(`sinv.receiptWorkbench.view.title.detail.receipHeaderInfo`)
                    .d('收货单基础信息')}
                </h3>
              </div>
              <div className={styles['form-info']}>
                {from === 'three' && !editFieldFlag
                  ? // 已完成 不可编辑
                    customizeForm(
                      {
                        code: `SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.${nodeConfigIndexAbc}`,
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
                  : customizeForm(
                      {
                        code: `SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.${nodeConfigIndexAbc}`,
                        readOnly:
                          from === 'three'
                            ? !editFieldFlag || rcvStatusCode === '20_SUBMITTED'
                            : rcvStatusCode === '20_SUBMITTED',
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
                          // renderer={({ value }) =>
                          //   value &&
                          //   (value === 1
                          //     ? intl.get('sinv.receiptExecution.model.receipt.aog').d('收货')
                          //     : intl.get('sinv.receiptExecution.model.receipt.returnUps').d('退货'))
                          // }
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
                      <Lov name="rcvTypeAll" disabled />
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
                              from === 'five' || !externalSystem
                                ? true
                                : rcvStatusCode === '40_FINISHED' ||
                                  rcvStatusCode === '20_SUBMITTED'
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
                              : !editFlag ||
                                rcvStatusCode === '40_FINISHED' ||
                                rcvStatusCode === '20_SUBMITTED'
                          }
                      />
                      {typeof renderFormFieldRichText === 'function' ? (
                          renderFormFieldRichText({ formDs: this.formDs })
                        ) : (
                          <></>
                        )}
                      <TextField name="receivedBy" disabled={editFieldFlag} />
                      {isSupplier && (
                      <TextField
                        name="supplierReceiptFlag"
                        disabled
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
            <Content style={{ marginTop: 0, marginBottom: 8 }}>
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
                  code: `SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.LINE_${nodeConfigIndexAbc}`,
                  readOnly:
                    from === 'five'
                      ? false
                      : from === 'three'
                      ? !editFieldFlag || rcvStatusCode === '20_SUBMITTED'
                      : rcvStatusCode === '20_SUBMITTED',
                },
                <SearchBarTable
                  dataSet={this.tableDs}
                  custLoading={custLoading}
                  columns={columns}
                  pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
                  searchCode="SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.LINE_SEARCH_A"
                  style={{ maxHeight: 370 }}
                  queryFieldsLimit={3}
                  virtual
                  virtualCell
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
                  searchBarConfig={{
                    checkDataSetStatus: false,
                    closeFilterSelector: true,
                  }}
                />
              )}
            </Content>
            <Content style={{ marginTop: 0 }}>
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
                    code: `SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
                    readOnly:
                      from === 'three'
                        ? !editFieldFlag || rcvStatusCode === '20_SUBMITTED'
                        : rcvStatusCode === '20_SUBMITTED',
                    __force_record_to_update__: true,
                  },
                  <Form columns={2} labelLayout="float" dataSet={this.attachmentDs}>
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
