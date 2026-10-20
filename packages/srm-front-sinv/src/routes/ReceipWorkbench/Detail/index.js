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
  DateTimePicker,
} from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import qs from 'querystring';
import { runInAction } from 'mobx';
import { Bind, Debounce } from 'lodash-decorators';
import { isEmpty, isNil, isFunction, noop } from 'lodash';
import { yesOrNoRender } from 'utils/renderer';
import { Header, Content } from 'components/Page';
import { PRIVATE_BUCKET } from '_utils/config';
// import DynamicButtons from '_components/DynamicButtons';
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
  handleRevokeApi,
  getUserFlag,
} from '@/services/ReceipWorkbenchService';
import HeaderBtnComps from './BtnsCmp';
import { confirm, isSupplier, c7nModal } from '../util';
import CustomModal from '../../ReceiptExecution/components/CustomModal';
import { formDS, tableDS, batchMaintenanceDS, formRateDS, attachmentDS } from './store/lineDS';
import Operaindex from '../components/Operating/index';
import MessageBoard from '@/routes/components/MessageBoard/index';
import CustomLinkIndex from '@/routes/components/CustomModal';
import ImportModal from '../ThingReceipts/components/importModal';
import LineTable from './columnsList';
import WorkFlowCmp from '../../components/WorkFlowCmp';
import styles from '../index.less';
import SubmitModal from '../components/SubmitModal/index';
import modalDS from '../components/SubmitModal/indexDS';
import {
  showBigNumber,
  globalPrint,
  useDoubleUomConfig,
  queryCalcRuleConfig,
  formatErrorInfo,
  validToken,
  renderRcvStatus,
} from '@/routes/components/utils';
import { isText } from '@/utils/utils';

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
      `SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_SEARCH_A`,
      'SINV.RECEIPT_WORKBENCH_THING.DETAIL.SUBMIT_MODAL_A'
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
      cuxHandleSubmitBefore: undefined,
      handleLineChange: undefined,
      cuxHandleLineBtnsFlag: false,
      cuxHandleLineBtns: (value) => value,
      getLineInfoDs: (value) => value,
    },
    events: {
      approvalPromise(eventProps) {
        const { workFlowApproval } = eventProps || {};
        if (workFlowApproval) return workFlowApproval();
      },
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
    'sinv.common',
    'sinv.receiptExecution',
    'hzero.common',
    'sinv.receiptWorkbench',
    'sinv.common',
    'sinv.deliveryCreation',
    'slod.deliveryWorkbench',
    'ssta.common',
  ],
})
export default class WorkDetail extends Component {
  formRateDs = new DataSet(formRateDS());

  batchMaintenanceDs = new DataSet(batchMaintenanceDS());

  constructor(props) {
    super(props);

    const {
      match: { params = {}, path },
      location: { search, pathname },
      doubleUnitEnabled,
      remote,
    } = this.props;
    const {
      nodeConfigIndex,
      nodeConfigIndexAbc,
      from,
      courseAsLine,
      viewType,
      type,
      isFromTrx,
      isRoleWorkbench,
      docFlow, // 判断页面是否单据流进入 是 1 否 0
      pageFrom, // 页面来源
      showWorkflowFlag, // 判断是否展示工作组件
      pageCurrentIsSelectedNodeCodes, // 列表进入明细前 停留的的页面节点（因为列表有汇总节点，需要做当前的特殊处理）
    } = qs.parse(search.substr(1));
    const _nodeAbc = String.fromCharCode(65 + nodeConfigIndex);
    const { limitAttr, limitator, cuxUpdate, cuxListField, renderValidateField, handleLineChange } =
      remote?.props?.process || {};
    this.attachmentDs = new DataSet(attachmentDS(limitAttr, limitator));
    this.formDs = new DataSet(
      remote
        ? remote.process(
            'SINV_PRDETAIL_REMOTE_PROCESS_FORM_DS',
            formDS(doubleUnitEnabled, cuxUpdate),
            { that: this }
          )
        : formDS(doubleUnitEnabled, cuxUpdate)
    );
    this.tableDs = new DataSet(
      remote?.process(
        'getLineInfoDs',
        tableDS(cuxListField, renderValidateField, handleLineChange),
        {
          comp: 'pur',
          returnedFlag: 0,
          that: this,
        }
      )
    );
    this.tableDs.setState('doubleUnitEnabled', doubleUnitEnabled);
    this.batchMaintenanceDs.bind(this.tableDs, 'tablesDs');
    this.state = {
      docFlow,
      isFromTrx,
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
      isRoleWorkbench,
      customData: [], // 定制化属性Modal的Table数据源
      rcvTrxHeaderId:
        path.includes('pub') || ['flow', 'oldFlow'].includes(docFlow)
          ? params.rcvTrxHeaderId
          : params.id,
      sourceFromPub: path.includes('pub'),
      newNodeConfigIndexAbc: 'K',
      nodeConfigIndexAbc: nodeConfigIndex ? _nodeAbc : nodeConfigIndexAbc,
      nodeConfigTitleName: '...',
      externalSystem: true, // 是否来源srm
      pageFromFlag: pageFrom === 'contract', // ? 协议跳转进来只读、不支持按钮组、保留操作记录、标题自定
      externalSystemFlag: true,
      showWorkflowFlag: showWorkflowFlag === '1',
      pageCurrentIsSelectedNodeCodes,
      userFlag: false, // 查询事务是否启用指定审批人标识
    };
  }

  modalDs = this.props.remote
    ? this.props.remote.process(
        'SINV_PRDETAIL_REMOTE_PROCESS_SUBMIT_MODAL_DS',
        new DataSet(modalDS())
      )
    : new DataSet(modalDS());

  // 查询金额计算配置
  @Bind()
  async fetchCalcRuleConfig() {
    const result = await queryCalcRuleConfig();
    this.tableDs.setState('amountCalcRule', result);
  }

  @Bind
  handleRefresh() {
    const { rcvTrxHeaderId, nodeConfigIndexAbc, isFromTrx, pageFromFlag } = this.state;
    const { remote } = this.props;
    this.fetchCalcRuleConfig();
    this.tableDs.setState({ batchData: {} });
    this.tableDs.setState({ fieldMapValues: undefined });
    if (isFromTrx) {
      this.formDs.setQueryParameter('params', {
        rcvTrxHeaderId,
        // customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
      });
      this.formDs.query().then((res) => {
        if (res && !res.failed) {
          this.attachmentDs.loadData([res]);
          const index = String.fromCharCode(65 + res.nodeConfigIndex);
          this.setState(
            {
              rcvStatusCode: res.rcvStatusCode,
              unreadQuantity: res.unreadQuantity,
              newNodeConfigIndexAbc: index,
              nodeConfigTitleName: res?.nodeConfigName ?? '',
              externalSystem: !pageFromFlag && res.externalSystemCode === 'SRM',
              externalSystemFlag: res.externalSystemCode === 'SRM',
              spinning: false,
            },
            () => {
              this.formDs.setQueryParameter('params', {
                rcvTrxHeaderId,
                customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.${this.state.newNodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.ATTRCH_${this.state.newNodeConfigIndexAbc}`,
              });
              this.formDs.query();
              this.tableDs.setQueryParameter('params', {
                rcvTrxHeaderId,
                customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_${this.state.newNodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_SEARCH_A`,
              });
              this.tableDs.query();
              if (remote?.event) {
                const eventProps = {
                  ds: this.formDs,
                };
                remote.event.fireEvent('cuxHandleForm', eventProps);
              }
            }
          );
        } else {
          this.setState({
            spinning: false,
          });
        }
      });
    } else {
      this.formDs.setQueryParameter('params', {
        rcvTrxHeaderId,
        customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
      });
      this.tableDs.setQueryParameter('params', {
        rcvTrxHeaderId,
        customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_SEARCH_A`,
      });
      this.formDs.query().then((res) => {
        if (res && !res.failed) {
          this.attachmentDs.loadData([res]);
          this.setState({
            rcvStatusCode: res.rcvStatusCode,
            unreadQuantity: res.unreadQuantity,
            nodeConfigTitleName: res?.nodeConfigName ?? '',
            externalSystem: !pageFromFlag && res.externalSystemCode === 'SRM',
            externalSystemFlag: res.externalSystemCode === 'SRM',
            spinning: false,
          });
          this.tableDs.query();
          if (remote?.event) {
            const eventProps = {
              ds: this.formDs,
            };
            remote.event.fireEvent('cuxHandleForm', eventProps);
          }
        } else {
          this.setState({
            spinning: false,
          });
        }
      });
    }
  }

  componentDidMount() {
    const { sourceFromPub, rcvTrxHeaderId } = this.state;
    const { onLoad, onFormLoaded, remote } = this.props;
    this.setState({
      spinning: true,
    });
    this.queryUserFlag();
    this.handleRefresh();
    // 二开工作流提供保存接口
    if (sourceFromPub && onLoad) {
      onLoad({
        submit: (approveResult) => {
          if (remote?.event) {
            return remote.event.fireEvent('approvalPromise', {
              that: this,
              approveResult,
              rcvTrxHeaderId,
              workFlowApproval: this.workFlowApproval,
            });
          } else {
            return this.workFlowApproval();
          }
        },
      });
      /**
       1.onFormLoaded 方法用于控制审批按钮是否可点击，传参 true 表示可点击
      2.注册了submit回调函数的话，onFormLoaded必传
      3.onFormLoaded应在表单加载完成后调用
      4.设置了customSubmit为true时，必须要调用onFormLoaded方法！
	   */
      if (onFormLoaded) {
        onFormLoaded(true);
      }
    }
  }

  // 查询是否启用指定审批人标识
  queryUserFlag = async () => {
    const { rcvTrxHeaderId } = this.state;
    const res = await getUserFlag({
      rcvTrxHeaderId,
    });
    if (isText(res)) {
      this.setState({
        userFlag: res === 'true',
      });
    }
  };

  @Bind()
  workFlowApproval() {
    return new Promise(async (resolve, reject) => {
      const { nodeConfigIndexAbc, rcvTrxHeaderId, from, sourceFromPub } = this.state;
      const saveData = {
        customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
        data: {
          ...this.formDs?.current?.toData(),
          ...this.attachmentDs?.current?.toJSONData(),
          saveMethod: sourceFromPub ? 'WFL' : undefined,
          sinvRcvTrxLineDTOS: this.tableDs
            .toJSONData()
            .map((m) => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId })),
        },
      };
      let headerFlag = true;
      let attachmentFlag = true;
      let flag = true;
      // 已完成tab页需要校验字段
      if (from === 'three') {
        headerFlag = await this.formDs.validate();
        attachmentFlag = await this.attachmentDs.validate();
        flag = await this.tableDs.validate();
      }
      if (headerFlag && flag && attachmentFlag) {
        this.setState({ spinning: true });
        const res = await handleSave(saveData).finally(() => {
          this.setState({ spinning: false });
        });
        if (getResponse(res)) {
          resolve();
          this.setState({
            editFieldFlag: false,
          });
          this.formDs.query().then((rec) => {
            if (rec) {
              this.tableDs.query(null, null, false);
            }
          });
          this.formRateDs.setQueryParameter('params', {
            rcvTrxHeaderId,
            customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc}`,
          });
        } else {
          reject();
        }
      }
    });
  }

  @Bind()
  @Debounce(100)
  async handleSave() {
    const { nodeConfigIndexAbc, rcvTrxHeaderId } = this.state;
    validToken(this.formDs);
    const batchData = this.tableDs.getState('batchData') || {};
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
      const res = await handleSave(saveData);
      if (getResponse(res)) {
        this.tableDs.setState({ batchData: {} });
        this.tableDs.setState({ fieldMapValues: undefined });
        Promise.all([
          this.formDs.query().then((rec) => {
            if (rec) {
              this.tableDs.query();
            }
          }),
          this.formRateDs.setQueryParameter('params', {
            rcvTrxHeaderId,
            customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc}`,
          }),
        ])
          .then(() => {
            notification.success();
            this.setState({
              editFieldFlag: false,
            });
            this.setState({ spinning: false });
          })
          .catch((e) => {
            throw e;
          })
          .finally(() => {
            this.setState({
              editFieldFlag: false,
            });
            this.setState({ spinning: false });
          });
      } else {
        this.setState({ spinning: false });
      }
    }
  }

  @Bind()
  @Debounce(100)
  async handleSubmit() {
    const { nodeConfigIndexAbc, userFlag = false } = this.state;
    const { customizeForm = noop } = this.props;
    const batchData = this.tableDs.getState('batchData') || {};
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
    if (!attachmentFlag || !flag) {
      formatErrorInfo(
        this.attachmentDs,
        this.tableDs,
        intl.get(`sinv.receiptWorkbench.view.title.detail.receipLineInfo`).d('收货单明细行信息')
      );
    }
    validToken(this.formDs);
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
      const onSubmit = ({ formData = undefined }) => {
        confirm({
          content: `${intl
            .get(`sinv.receiptExecution.view.message.submitTip`)
            .d(`确定要提交单据`)}${tips}?`,
          onOk: async () => {
            this.setState({ spinning: true });
            const res = await handleSubmit({
              ...saveData,
              data: {
                ...saveData?.data,
                customWorkFlowParam: formData,
              },
            }).finally(() => {
              this.setState({ spinning: false });
            });
            const submitOperation = await (remote
              ? remote.process('SINV_PRDETAIL_REMOTE_PROCESS_BEFORE_SUBMIT', false, {
                  that: this,
                  result: res,
                })
              : false);
            if (submitOperation) return submitOperation;
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
                    pathname: `/sinv/receipt-workbench/list`,
                  });
                  this.onBack();
                }, 800);
                return;
              }
              notification.success();
              this.props.history.push({
                pathname: `/sinv/receipt-workbench/list`,
              });
              this.onBack();
            }
          },
        });
      };
      if (userFlag) {
        const modalProps = {
          remote,
          customizeForm,
          ds: this.modalDs,
          remoteCode: 'SINV_PRDETAIL_REMOTE_PROCESS_SUBMIT_MODAL_FORM',
          customizeUnitCode: 'SINV.RECEIPT_WORKBENCH_THING.DETAIL.SUBMIT_MODAL_A',
        };
        const cuxFlag = await (remote
          ? remote.process('SINV_PRDETAIL_REMOTE_PROCESS_SUBMIT_MODAL', true, {
              saveData,
              modalDs: this.modalDs,
            })
          : true);
        if (cuxFlag) {
          return Modal.open({
            mask: true,
            drawer: true,
            style: { width: '380px' },
            children: <SubmitModal {...modalProps} />,
            title: intl.get('sinv.common.model.common.approve').d('审批'),
            onOk: () => {
              onSubmit({
                formData: this.modalDs?.current?.toData(),
              });
            },
          });
        }
      } else {
        onSubmit({ formData: undefined });
      }
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
            pathname: `/sinv/receipt-workbench/list`,
          });
          this.onBack();
        }
      },
    });
  }

  @Bind()
  @Debounce(100)
  lineDelete(select) {
    // poAllFlag 订单标识 asnAllFlag 送货单标识 fromDisplayPoNum 订单号 fromDisplayAsnNum 送货单号
    const selectData = select
      .map((item) => item.toJSONData())
      .map((m) => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId }));
    const selectDataPoNum = selectData.filter((i) => i.fromDisplayPoNum);
    const selectDataAsnNum = selectData.filter((i) => i.fromDisplayAsnNum);
    const deleteFlag = selectData.some((i) => i.rcvTrxLineId);
    let isPoNum = true;
    if (deleteFlag) {
      const data = selectData.filter((i) => i.rcvTrxLineId);
      const params = { ...this.formDs.toData()[0], sinvRcvTrxLineDTOS: data };
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
          content: intl.get('sinv.receiptExecution.view.message.sureDelete').d('确定要删除此单据?'),
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
          content: intl.get('sinv.receiptExecution.view.message.orderDel').d(`确认删除选中行？`),
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

  @Bind()
  @Debounce(100)
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

  /**
   * 打印功能
   */
  @Bind()
  @Debounce(100)
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
    const { customizeForm } = this.props;
    const { nodeConfigIndexAbc } = this.state;
    this.batchMaintenanceDs.reset();
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
      style: { width: '380px' },
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
              <Lov style={{ width: '100%' }} name="inventoryId" />
              <Lov style={{ width: '100%' }} name="locatorId" />
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
      // _locatorId: dataTemp.locatorId?.locationId,
      // _inventoryId: dataTemp.inventoryId?.inventoryId,
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
    const {
      rcvStatusCode,
      rcvTrxHeaderId,
      nodeConfigIndexAbc,
      sourceFromPub,
      docFlow,
    } = this.state;
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
                readOnly: rcvStatusCode === '20_SUBMITTED' || ['flow', 'oldFlow'].includes(docFlow),
                disableOutput: 'Output',
                dataSet: this.formRateDs,
                __force_record_to_update__: true,
              },
              <Form columns={1} labelLayout="float" dataSet={this.formRateDs}>
                <Rate
                  className={styles['rate-score']}
                  name="overallScore"
                  allowHalf
                  disabled={
                    ['20_SUBMITTED'].includes(rcvStatusCode) ||
                    ['flow', 'oldFlow'].includes(docFlow)
                  }
                />
                <TextArea
                  className={styles['rate-text']}
                  name="overallEvaluate"
                  resize="both"
                  cols={60}
                  autoSize={{ minRows: 2, maxRows: 8 }}
                  disabled={
                    ['20_SUBMITTED'].includes(rcvStatusCode) ||
                    ['flow', 'oldFlow'].includes(docFlow)
                  }
                />
                <Rate
                  className={styles['rate-score']}
                  name="deliveryScore"
                  allowHalf
                  disabled={
                    ['20_SUBMITTED'].includes(rcvStatusCode) ||
                    ['flow', 'oldFlow'].includes(docFlow)
                  }
                />
                <TextArea
                  className={styles['rate-text']}
                  name="deliveryEvaluate"
                  resize="both"
                  cols={60}
                  autoSize={{ minRows: 2, maxRows: 8 }}
                  disabled={
                    ['20_SUBMITTED'].includes(rcvStatusCode) ||
                    ['flow', 'oldFlow'].includes(docFlow)
                  }
                />
                <Rate
                  className={styles['rate-score']}
                  name="qualityScore"
                  allowHalf
                  disabled={
                    ['20_SUBMITTED'].includes(rcvStatusCode) ||
                    ['flow', 'oldFlow'].includes(docFlow)
                  }
                />
                <TextArea
                  className={styles['rate-text']}
                  name="qualityEvaluate"
                  resize="both"
                  cols={60}
                  autoSize={{ minRows: 2, maxRows: 8 }}
                  disabled={
                    ['20_SUBMITTED'].includes(rcvStatusCode) ||
                    ['flow', 'oldFlow'].includes(docFlow)
                  }
                />
                <Rate
                  className={styles['rate-score']}
                  name="serviceScore"
                  allowHalf
                  disabled={
                    ['20_SUBMITTED'].includes(rcvStatusCode) ||
                    ['flow', 'oldFlow'].includes(docFlow)
                  }
                />
                <TextArea
                  className={styles['rate-text']}
                  name="serviceEvaluate"
                  resize="both"
                  cols={60}
                  autoSize={{ minRows: 2, maxRows: 8 }}
                  disabled={
                    ['20_SUBMITTED'].includes(rcvStatusCode) ||
                    ['flow', 'oldFlow'].includes(docFlow)
                  }
                />
              </Form>
            )}
          </div>
        </Spin>
      );
    };
    if (sourceFromPub || ['flow', 'oldFlow'].includes(docFlow)) {
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
        onOk: () => this.handleRateOk(),
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

  @Debounce(400)
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
                pathname: `/sinv/receipt-workbench/list`,
              });
              this.onBack();
            }
            this.setState({ spinning: false });
          } else {
            const res = await handleConfirmApi(saveData);
            if (getResponse(res)) {
              notification.success();
              this.props.history.push({
                pathname: `/sinv/receipt-workbench/list`,
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

  splitLine = (record) => {
    const { remote } = this.props;
    const { cuxDetailLineFieldSplit } = remote?.props?.process || {};
    if (isFunction(cuxDetailLineFieldSplit)) {
      cuxDetailLineFieldSplit(record, this.tableDs);
      return;
    }
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
    const { nodeConfigIndexAbc, from, rcvStatusCode, externalSystem, docFlow } = this.state;
    const basicProps = {
      from,
      header,
      editor: true,
      rcvStatusCode,
      type: linkOrder,
      returnedFlag: 0, // 收货
      nodeConfigIndexAbc,
      externalSystem,
      docFlow,
      customizeTable,
      customizeBtnGroup,
      queryUnitConfig,
      ...record?.get(['rcvTrxHeaderId', 'rcvTrxLineId']),
    };
    const modal = Modal.open({
      drawer: true,
      resizable: true,
      style: { width: '852px' },
      children: <CustomLinkIndex {...basicProps} />,
      footer: (
        <Button color="primary" onClick={() => modal.close()}>
          {intl.get('hzero.common.status.closed').d('关闭')}
        </Button>
      ),
    });
  };

  handleRevoke = async () => {
    const { nodeConfigIndexAbc } = this.state;
    const saveData = {
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
      data: {
        ...this.formDs.toData()[0],
        sinvHeaderAttachmentUuid: this.attachmentDs.toData()[0].sinvHeaderAttachmentUuid,
        sinvRcvTrxLineDTOS: this.tableDs
          .toJSONData()
          .map((m) => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId })),
      },
    };
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
          const res = await handleRevokeApi(saveData);
          if (getResponse(res)) {
            this.setState({ spinning: false });
            notification.success({
              message: intl.get('hzero.common.notification.success').d('操作成功'),
              description: intl
                .get('slod.deliveryWorkbench.view.message.approvalSuccess')
                .d('撤销审批成功'),
            });
            this.props.history.push({
              pathname: `/sinv/receipt-workbench/list`,
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

  getEditForm = () => {
    const { remote } = this.props;
    const { from, externalSystem, docFlow, rcvStatusCode } = this.state;
    const { renderFormFieldRichText } = remote?.props?.process || {};
    const fields = [
      <Output name="displayTrxNum" />,
      <Output name="companyName" />,
      <Output
        name="supplierCompanyName"
        renderer={({ record }) => {
          if (record && record.get('supplierId')) {
            return record && record.get('supplierName');
          } else {
            return record && record.get('supplierCompanyName');
          }
        }}
      />,
      <Output name="unitAll" />,
      <Output
        name="rcvStatusCode"
        renderer={({ record }) => {
          return record && record.get('rcvStatusCodeMeaning');
        }}
      />,
      <Output name="nodeConfigName" />,
      <Output
        name="returnedFlag"
        renderer={({ value }) => {
          if (value === 0) {
            return intl.get('sinv.receiptExecution.model.receipt.aog').d('收货');
          } else if (value === 1) {
            return intl.get('sinv.receiptExecution.model.receipt.returnUps').d('退货');
          }
        }}
      />,
      <Output name="rcvTypeAll" />,
      <Output name="creationName" />,
      <Output name="creationDate" />,
      <Output name="unitAll" />,
      <Output
        name="rcvStatusCode"
        renderer={({ record }) => {
          return record && renderRcvStatus(record);
        }}
      />,
      <Output name="totalQuantity" renderer={({ value }) => showBigNumber(value)} />,
      <Output
        name="totalTaxIncludedAmount"
        renderer={({ value, record }) =>
          record?.get('hidePriceFlag')
            ? '***'
            : showBigNumber(value, record && record.get('financialPrecision'))
        }
      />,
      <Output name="remark" />,
      typeof renderFormFieldRichText === 'function' ? (
        renderFormFieldRichText({ formDs: this.formDs, readOnly: true })
      ) : (
        <></>
      ),
      <Output name="receivedBy" />,
      !isSupplier && (
        <Output name="supplierReceiptFlag" renderer={({ value }) => yesOrNoRender(+value)} />
      ),
      <Output
        name="linkFirst"
        renderer={({ record }) => (
          <a onClick={() => this.onOpenLinkChange(record, Number(1), Number(1))}>
            {from === 'three' ||
            !externalSystem ||
            ['flow', 'oldFlow'].includes(docFlow) ||
            rcvStatusCode === '35_PUBLISH'
              ? intl.get('hzero.common.button.look').d('查看')
              : intl.get('hzero.common.view.button.edit').d('编辑')}
          </a>
        )}
      />,
      <Output
        name="linkSecond"
        renderer={({ record }) => (
          <a onClick={() => this.onOpenLinkChange(record, Number(2), Number(1))}>
            {from === 'three' ||
            !externalSystem ||
            ['flow', 'oldFlow'].includes(docFlow) ||
            rcvStatusCode === '35_PUBLISH'
              ? intl.get('hzero.common.button.look').d('查看')
              : intl.get('hzero.common.view.button.edit').d('编辑')}
          </a>
        )}
      />,
    ];
    return remote
      ? remote.process('SINV_PRDETAIL_REMOTE_PROCESS_EDIT_FORM', fields, { that: this })
      : fields;
  };

  getReadForm = () => {
    const { remote } = this.props;
    const { renderFormFieldRichText } = remote?.props?.process || {};
    const {
      from,
      externalSystem,
      docFlow,
      rcvStatusCode,
      sourceFromPub,
      editFieldFlag,
    } = this.state;
    const opreateFlag =
      rcvStatusCode === '10_NEW' ||
      rcvStatusCode === '30_REJECTED' ||
      rcvStatusCode === '30_SUP_REJECTED';
    const fields = [
      <TextField name="displayTrxNum" disabled />,
      <TextField name="companyName" disabled />,
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
      />,
      <TextField name="nodeConfigName" disabled />,
      <TextField
        name="returnedFlag"
        disabled
        renderer={({ value }) => {
          if (value === 0) {
            return intl.get('sinv.receiptExecution.model.receipt.aog').d('收货');
          } else if (value === 1) {
            return intl.get('sinv.receiptExecution.model.receipt.returnUps').d('退货');
          }
        }}
      />,
      <Lov
        name="rcvTypeAll"
        disabled={
          from === 'five' || !externalSystem || ['flow', 'oldFlow'].includes(docFlow)
            ? true
            : ['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode)
        }
      />,
      <TextField name="creationName" disabled />,
      <DateTimePicker name="creationDate" disabled />,
      <Lov
        name="unitAll"
        disabled={
          !opreateFlag ||
          !externalSystem ||
          ['flow', 'oldFlow'].includes(docFlow) ||
          ['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode)
        }
      />,
      <TextField
        name="rcvStatusCode"
        disabled
        renderer={({ record }) => {
          return record && record.get('rcvStatusCodeMeaning');
        }}
      />,
      <TextField name="totalQuantity" renderer={({ value }) => showBigNumber(value)} disabled />,
      <TextField
        name="totalTaxIncludedAmount"
        renderer={({ value, record }) =>
          record?.get('hidePriceFlag')
            ? '***'
            : showBigNumber(value, record && record.get('financialPrecision'))
        }
        disabled
      />,
      <TextArea
        name="remark"
        newLine
        resize="both"
        colSpan={2}
        autoSize={{ minRows: 2, maxRows: 8 }}
        disabled={
          from === 'five' || !externalSystem || ['flow', 'oldFlow'].includes(docFlow)
            ? true
            : ['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode)
        }
      />,
      typeof renderFormFieldRichText === 'function' ? (
        renderFormFieldRichText({
          formDs: this.formDs,
          readOnly: sourceFromPub,
          layout: 'float',
        })
      ) : (
        <></>
      ),
      <TextField
        name="receivedBy"
        disabled={
          editFieldFlag || sourceFromPub || ['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode)
        }
      />,
      !isSupplier && (
        <Output name="supplierReceiptFlag" renderer={({ value }) => yesOrNoRender(+value)} />
      ),
      <Output
        name="linkFirst"
        renderer={({ record }) => (
          <a onClick={() => this.onOpenLinkChange(record, Number(1), Number(1))}>
            {from === 'three' ||
            !externalSystem ||
            ['flow', 'oldFlow'].includes(docFlow) ||
            rcvStatusCode === '35_PUBLISH'
              ? intl.get('hzero.common.button.look').d('查看')
              : intl.get('hzero.common.view.button.edit').d('编辑')}
          </a>
        )}
      />,
      <Output
        name="linkSecond"
        renderer={({ record }) => (
          <a onClick={() => this.onOpenLinkChange(record, Number(2), Number(1))}>
            {from === 'three' ||
            !externalSystem ||
            ['flow', 'oldFlow'].includes(docFlow) ||
            rcvStatusCode === '35_PUBLISH'
              ? intl.get('hzero.common.button.look').d('查看')
              : intl.get('hzero.common.view.button.edit').d('编辑')}
          </a>
        )}
      />,
    ];
    return remote
      ? remote.process('SINV_PRDETAIL_REMOTE_PROCESS_READ_FORM', fields, { that: this })
      : fields;
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
      isRoleWorkbench,
      nodeConfigTitleName,
      externalSystem,
      docFlow,
      pageFromFlag,
      externalSystemFlag,
      unreadQuantity,
      showWorkflowFlag,
    } = this.state;
    const {
      customizeForm,
      custLoading,
      customizeTable,
      customizeBtnGroup,
      doubleUnitEnabled,
      remote,
    } = this.props;
    const { renderCreateLineColumns, cuxHandleLineBtns, cuxHandleLineBtnsFlag } =
      remote?.props?.process || {};
    const backPath =
      sourceFromPub || ['flow', 'oldFlow'].includes(docFlow)
        ? false
        : editFieldFlag
        ? `${search}${pathname}`
        : `/sinv/receipt-workbench/list`;
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
    const lineProps = {
      type,
      from,
      docFlow,
      that: this,
      custLoading,
      pageFromFlag,
      sourceFromPub,
      rcvStatusCode,
      editFieldFlag,
      externalSystem,
      customizeTable,
      isRoleWorkbench,
      doubleUnitEnabled,
      externalSystemFlag,
      nodeConfigIndexAbc,
      cuxHandleLineBtns,
      cuxHandleLineBtnsFlag,
      formDs: this.formDs,
      tableDs: this.tableDs,
      renderCreateLineColumns,
      attachmentDs: this.attachmentDs,
      splitLine: this.splitLine,
      lineDelete: this.lineDelete, // todo
      operaClick: this.operaClick,
      handleRefresh: this.handleRefresh,
      onOpenLinkChange: this.onOpenLinkChange,
      handleBatchMaintenance: this.handleBatchMaintenance, // todo
      onCustomSpecsJsonChange: this.onCustomSpecsJsonChange,
    };

    const editForm = this.getEditForm();
    const readForm = this.getReadForm();
    // const columns = this.getColumns();
    // const buttons = this.headerBtns();
    const titleName = pageFromFlag
      ? {
          default: `${intl
            .get('sinv.receiptWorkbench.view.title.detail.receiptDetail')
            .d('收货明细')}${nodeConfigTitleName ? '-' : ''}${nodeConfigTitleName}`,
        }
      : {
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
          default: `${intl
            .get('sinv.receiptWorkbench.view.title.detail.receiptDetail')
            .d('收货明细')}${nodeConfigTitleName ? '-' : ''}${nodeConfigTitleName}`,
        };
    const headerBtnProps = {
      type,
      from,
      remote,
      history,
      spinning,
      isSupplier, // *todo
      rcvStatusCode,
      rcvTrxHeaderId, // *todo
      unreadQuantity,
      sourceFromPub,
      editFieldFlag,
      isRoleWorkbench,
      docFlow,
      pageFromFlag,
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
      handleRefresh: this.handleRefresh,
      openEdit: this.openEdit,
    };
    return (
      <Fragment>
        <Header
          title={
            from
              ? titleName[from] || titleName.default
              : type
              ? titleName[type] || titleName.default
              : titleName.default
          }
          backPath={!pageFromFlag && !showWorkflowFlag && backPath}
          onBack={this.onBack}
        >
          <HeaderBtnComps dataSet={this.formDs} _btnObjs={headerBtnProps} />
        </Header>
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
                {((from === 'three' || from === 'four') && !editFieldFlag) ||
                ['flow'].includes(docFlow) ||
                pageFromFlag
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
                        {editForm}
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
                        {readForm}
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
              <LineTable props={lineProps} />
            </Content>
            <Content
              style={
                showWorkflowFlag
                  ? { marginTop: 0, marginBottom: 8, padding: 20 }
                  : { marginTop: 0, padding: 20 }
              }
            >
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
                    readOnly: ['flow', 'oldFlow'].includes(docFlow)
                      ? true
                      : from === 'three'
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
                        !externalSystem ||
                        ['flow', 'oldFlow'].includes(docFlow)
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
            {showWorkflowFlag && <WorkFlowCmp id={rcvTrxHeaderId} />}
          </Spin>
        </div>
        {customVisible && <CustomModal {...customProps} />}
        {messageVisible && <MessageBoard {...messageProps} />}
      </Fragment>
    );
  }
}
