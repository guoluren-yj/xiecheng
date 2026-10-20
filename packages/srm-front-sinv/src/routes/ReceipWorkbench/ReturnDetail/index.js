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
  Rate,
  Attachment,
  Output,
  DateTimePicker,
} from 'choerodon-ui/pro';
import qs from 'querystring';
import { Bind, Debounce } from 'lodash-decorators';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { isEmpty, isNil, noop } from 'lodash';
import { Header, Content } from 'components/Page';
import { yesOrNoRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import cuxRemote from 'hzero-front/lib/utils/remote';
import intl from 'utils/intl';
import notification from 'utils/notification';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
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
import { confirm, isSupplier, c7nModal } from '../util';
import CustomLinkIndex from '@/routes/components/CustomModal';
import HeaderBtnComps from './BtnsCmp';
import { formDS, tableDS, batchMaintenanceDS, formRateDS, attachmentDS } from './store/lineDS';
import CustomModal from '../../ReceiptExecution/components/CustomModal';
import Operaindex from '../components/Operating/index';
import MessageBoard from '@/routes/components/MessageBoard/index';
import styles from '../index.less';
import ImportModal from '../ThingReceipts/components/importModal';
import LineTable from './columnsList';
import WorkFlowCmp from '../../components/WorkFlowCmp';
import SubmitModal from '../components/SubmitModal/index';
import modalDS from '../components/SubmitModal/indexDS';

import {
  globalPrint,
  showBigNumber,
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
      `SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.LINE_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.DETAIL.BUTTON.RETURN_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.ATTRCH_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.LINE_SEARCH_A`,
      'SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.SUBMIT_MODAL_A'
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
      cuxListField: undefined,
      renderValidateField: undefined,
      renderFormFieldRichText: undefined,
      renderCreateLineColumns: undefined,
      cuxHandleLineBtns: value => value,
      getLineInfoDs: value => value,
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
    'sinv.deliveryCreation',
    'ssta.common',
    'sinv.receiptWorkbench',
    'slod.deliveryWorkbench',
  ],
})
export default class ExecutionDetail extends Component {
  formDs = new DataSet(formDS());

  formRateDs = new DataSet(formRateDS());

  constructor(props) {
    super(props);
    const {
      match: { params = {}, path },
      location: { search, pathname },
      doubleUnitEnabled,
      remote,
    } = this.props;
    const { limitAttr, limitator, cuxListField, renderValidateField } =
      remote?.props?.process || {};
    this.attachmentDs = new DataSet(attachmentDS(limitAttr, limitator));
    this.tableDs = new DataSet(
      remote?.process('getLineInfoDs', tableDS(cuxListField, renderValidateField), {
        comp: 'pur',
        returnedFlag: 1,
      })
    );
    this.batchMaintenanceDs = new DataSet(batchMaintenanceDS(this.tableDs));
    this.tableDs.setState('doubleUnitEnabled', doubleUnitEnabled);
    const {
      nodeConfigIndex,
      type,
      nodeConfigIndexAbc,
      from,
      courseAsLine,
      viewType,
      isFromTrx,
      isRoleWorkbench,
      docFlow, // 判断页面是否单据流进入 是 flow
      pageFrom,
      showWorkflowFlag, // 判断是否展示工作组件
      pageCurrentIsSelectedNodeCodes, // 列表进入明细前 停留的的页面节点（因为列表有汇总节点，需要做当前的特殊处理）
    } = qs.parse(search.substr(1));
    const _nodeAbc = String.fromCharCode(65 + nodeConfigIndex);
    this.state = {
      docFlow,
      isFromTrx,
      search,
      pathname,
      type,
      from,
      viewType,
      courseAsLine,
      unreadQuantity: 0,
      isRoleWorkbench,
      spinning: false,
      customVisible: false, // 定制化属性Modal显示
      messageVisible: false,
      rcvTrxHeaderId:
        path.includes('pub') || ['flow', 'oldFlow'].includes(docFlow)
          ? params.rcvTrxHeaderId
          : params.id,
      editFieldFlag: false,
      nodeConfigTitleName: '...',
      editFlag: type === 'END' || type === 'COURSE',
      customData: [], // 定制化属性Modal的Table数据源
      sourceFromPub: path.includes('pub'),
      newNodeConfigIndexAbc: 'K',
      nodeConfigIndexAbc: nodeConfigIndex ? _nodeAbc : nodeConfigIndexAbc,
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
    const { remote } = this.props;
    const { rcvTrxHeaderId, nodeConfigIndexAbc, isFromTrx, pageFromFlag } = this.state;
    this.fetchCalcRuleConfig();
    if (isFromTrx) {
      this.formDs.setQueryParameter('params', {
        rcvTrxHeaderId,
        // customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
      });
      this.formDs.query().then(res => {
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
                customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.${this.state.newNodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.ATTRCH_${this.state.newNodeConfigIndexAbc}`,
              });
              this.formDs.query();
              this.tableDs.setQueryParameter('params', {
                rcvTrxHeaderId,
                customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.LINE_${this.state.newNodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.LINE_SEARCH_A`,
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
        customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
      });
      this.tableDs.setQueryParameter('params', {
        rcvTrxHeaderId,
        customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.LINE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.LINE_SEARCH_A`,
      });
      this.formDs.query().then(res => {
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
    this.setState({
      spinning: true,
    });
    this.queryUserFlag();
    this.handleRefresh();
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
          .map(m => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId })),
      },
    };
    const headerFlag = await this.formDs.validate();
    const attachmentFlag = await this.attachmentDs.validate();
    const flag = await this.tableDs.validate();
    if (headerFlag && flag && attachmentFlag) {
      this.setState({ spinning: true });
      const res = getResponse(await handleSave(saveData));
      if (res) {
        Promise.all([
          this.formDs.query().then(rec => {
            if (rec) {
              this.tableDs.query();
            }
          }),
          this.formRateDs.setQueryParameter('params', {
            rcvTrxHeaderId,
            customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
          }),
        ])
          .then(() => {
            notification.success();
            this.setState({
              editFieldFlag: false,
            });
            this.setState({ spinning: false });
          })
          .catch(e => {
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
  @Debounce(400)
  async handleSubmit() {
    const { nodeConfigIndexAbc, userFlag = false } = this.state;
    const { customizeForm = noop, remote } = this.props;
    validToken(this.formDs);
    const saveData = {
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.LINE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
      data: {
        ...this.formDs?.current?.toData(),
        ...this.attachmentDs?.current?.toJSONData(),
        sinvRcvTrxLineDTOS: this.tableDs
          .toJSONData()
          .map(m => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId })),
      },
    };

    const tips = this.formDs
      .toData()
      .map(m => ({
        ...m,
        inventoryId: m._inventoryId,
        locatorId: m._locatorId,
        returnedFlagMeaning:
          m.returnedFlag === 0
            ? intl.get('sinv.receiptExecution.view.message.Receipt').d(`收货`)
            : intl.get('sinv.receiptExecution.view.message.ReturnOrder').d(`退货`),
      }))
      .map(
        i =>
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
    if (headerFlag && flag && attachmentFlag) {
      const onSubmit = ({ formData = undefined }) => {
        confirm({
          content: `${intl
            .get(`sinv.receiptExecution.view.message.submitTip`)
            .d(`确定要提交单据`)}${tips}?`,
          onOk: async () => {
            this.setState({ spinning: true });
            const res = getResponse(
              await handleSubmit({
                ...saveData,
                data: {
                  ...saveData?.data,
                  customWorkFlowParam: formData,
                },
              }).finally(() => {
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
                  pathname: `/sinv/receipt-workbench/list`,
                });
                this.onBack();
              }, 500);
              return;
            }
            if (res) {
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
          customizeUnitCode: 'SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.SUBMIT_MODAL_A',
        };
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
      } else {
        onSubmit({ formData: undefined });
      }
    }
  }

  @Bind()
  lineDelete(select) {
    // poAllFlag 订单标识 asnAllFlag 送货单标识 fromDisplayPoNum 订单号 fromDisplayAsnNum 送货单号
    const selectData = select
      .map(item => item.toJSONData())
      .map(m => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId }));
    const selectDataPoNum = selectData.filter(i => i.fromDisplayPoNum);
    const selectDataAsnNum = selectData.filter(i => i.fromDisplayAsnNum);
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
        ? [...new Set(selectDataPoNum.map(i => i.fromDisplayPoNum))].join(',')
        : [...new Set(selectDataAsnNum.map(i => i.fromDisplayAsnNum))].join(',');
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
      .map(item => item.toJSONData())
      .map(m => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId }));
    const params = {
      ...headerInfo,
      sinvRcvTrxLineDTOS: lineinfo,
    };
    confirm({
      content: intl.get('sinv.receiptExecution.view.message.orderDelBills').d(`确定要整单删除吗？`),
      onOk: async () => {
        const res = getResponse(await handleDelete(params));
        if (res) {
          this.props.history.push({
            pathname: `/sinv/receipt-workbench/list`,
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
    getResponse(print(params))
      .then(res => {
        globalPrint(res, this.handleRefresh);
        this.setState({ spinning: false });
      })
      .finally(() => {
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
    getResponse(newPrint(params))
      .then(res => {
        globalPrint(res, this.handleRefresh);
        this.setState({ spinning: false });
      })
      .finally(() => {
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
    const selectList = ds.selected.map(item => item.toJSONData());
    const invData = (isEmpty(ds.selected) ? listData : selectList).map(
      item => item.invOrganizationId
    );
    const invenData = (isEmpty(ds.selected) ? listData : selectList).map(item => item.inventoryId);
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
    dataDs.fields.forEach(i => {
      tempArr.push(i.get('name'));
    });
    const data = dataDs.current.get(tempArr);
    runInAction(() => {
      (isEmpty(ds.selected) ? ds : ds.selected).forEach(i => {
        tempArr.forEach(key => {
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
  handRate() {
    // const { customizeForm } = this.props;
    const { rcvStatusCode, rcvTrxHeaderId, nodeConfigIndexAbc, docFlow } = this.state;
    this.formRateDs.reset();
    this.formRateDs.setQueryParameter('params', {
      rcvTrxHeaderId,
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc}`,
    });
    this.formRateDs.query();
    const modal = Modal.open({
      mask: true,
      drawer: true,
      style: { width: '380px' },
      onOk: () => this.handleRateOk(),
      title: intl.get(`sinv.common.view.message.comments`).d('评价'),
      children: (
        <Spin dataSet={this.formRateDs}>
          <div className={styles['rate-all']}>
            <Form columns={1} labelLayout="float" dataSet={this.formRateDs}>
              <Rate
                className={styles['rate-score']}
                name="overallScore"
                allowHalf
                disabled={
                  ['20_SUBMITTED'].includes(rcvStatusCode) || ['flow', 'oldFlow'].includes(docFlow)
                }
              />
              <TextArea
                className={styles['rate-text']}
                name="overallEvaluate"
                resize="both"
                cols={60}
                autoSize={{ minRows: 2, maxRows: 8 }}
                disabled={
                  ['20_SUBMITTED'].includes(rcvStatusCode) || ['flow', 'oldFlow'].includes(docFlow)
                }
              />
              <Rate
                className={styles['rate-score']}
                name="deliveryScore"
                allowHalf
                disabled={
                  ['20_SUBMITTED'].includes(rcvStatusCode) || ['flow', 'oldFlow'].includes(docFlow)
                }
              />
              <TextArea
                className={styles['rate-text']}
                name="deliveryEvaluate"
                resize="both"
                cols={60}
                autoSize={{ minRows: 2, maxRows: 8 }}
                disabled={
                  ['20_SUBMITTED'].includes(rcvStatusCode) || ['flow', 'oldFlow'].includes(docFlow)
                }
              />
              <Rate
                className={styles['rate-score']}
                name="qualityScore"
                allowHalf
                disabled={
                  ['20_SUBMITTED'].includes(rcvStatusCode) || ['flow', 'oldFlow'].includes(docFlow)
                }
              />
              <TextArea
                className={styles['rate-text']}
                name="qualityEvaluate"
                resize="both"
                cols={60}
                autoSize={{ minRows: 2, maxRows: 8 }}
                disabled={
                  ['20_SUBMITTED'].includes(rcvStatusCode) || ['flow', 'oldFlow'].includes(docFlow)
                }
              />
              <Rate
                className={styles['rate-score']}
                name="serviceScore"
                allowHalf
                disabled={
                  ['20_SUBMITTED'].includes(rcvStatusCode) || ['flow', 'oldFlow'].includes(docFlow)
                }
              />
              <TextArea
                className={styles['rate-text']}
                name="serviceEvaluate"
                resize="both"
                cols={60}
                autoSize={{ minRows: 2, maxRows: 8 }}
                disabled={
                  ['20_SUBMITTED'].includes(rcvStatusCode) || ['flow', 'oldFlow'].includes(docFlow)
                }
              />
            </Form>
          </div>
        </Spin>
      ),
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
      handleEvaluate(params).then(res => {
        if (getResponse(res)) {
          modal.close();
        }
      });
    }
  }

  @Debounce(400)
  handleAffirm = async type => {
    const { nodeConfigIndexAbc } = this.state;
    const saveData = {
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.LINE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
      data: {
        ...this.formDs.toData()[0],
        sinvHeaderAttachmentUuid: this.attachmentDs.toData()[0].sinvHeaderAttachmentUuid,
        sinvRcvTrxLineDTOS: this.tableDs
          .toJSONData()
          .map(m => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId })),
      },
    };

    const tips = this.formDs
      .toData()
      .map(m => ({
        ...m,
        inventoryId: m._inventoryId,
        locatorId: m._locatorId,
        returnedFlagMeaning:
          m.returnedFlag === 0
            ? intl.get('sinv.receiptExecution.view.message.Receipt').d(`收货`)
            : intl.get('sinv.receiptExecution.view.message.ReturnOrder').d(`退货`),
      }))
      .map(
        i =>
          `${i.returnedFlagMeaning}${intl
            .get('sinv.receiptExecution.view.message.bills')
            .d(`单`)}[${i.displayTrxNum}]`
      )
      .join('/');

    const headerFlag = await this.formDs.validate();
    const attachmentFlag = await this.attachmentDs.validate();
    const flag = await this.tableDs.validate();
    if (headerFlag && attachmentFlag && flag) {
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

  splitLine = record => {
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
    const {
      nodeConfigIndexAbc,
      from,
      editFieldFlag,
      rcvStatusCode,
      externalSystem,
      docFlow,
    } = this.state;
    const basicProps = {
      from,
      header,
      rcvStatusCode,
      type: linkOrder,
      returnedFlag: 1, // 退货
      nodeConfigIndexAbc,
      editor: editFieldFlag,
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
      style: { width: '742px' },
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
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.LINE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
      data: {
        ...this.formDs.toData()[0],
        sinvHeaderAttachmentUuid: this.attachmentDs.toData()[0].sinvHeaderAttachmentUuid,
        sinvRcvTrxLineDTOS: this.tableDs
          .toJSONData()
          .map(m => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId })),
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
  operaClick = record => {
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

  onCustomSpecsJsonChange = value => {
    this.setState({
      customData: value ? JSON.parse(value) : [],
      customVisible: true,
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
      isRoleWorkbench,
      nodeConfigTitleName,
      externalSystem,
      docFlow,
      unreadQuantity,
      pageFromFlag,
      externalSystemFlag,
      showWorkflowFlag,
    } = this.state;
    const {
      remote,
      history,
      customizeForm,
      customizeTable,
      custLoading,
      customizeBtnGroup,
      doubleUnitEnabled,
    } = this.props;
    const { renderCreateLineColumns, renderFormFieldRichText, cuxHandleLineBtns } =
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
      editFlag,
      custLoading,
      pageFromFlag,
      sourceFromPub,
      rcvStatusCode,
      editFieldFlag,
      externalSystem,
      customizeTable,
      isRoleWorkbench,
      cuxHandleLineBtns,
      doubleUnitEnabled,
      externalSystemFlag,
      nodeConfigIndexAbc,
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
      openEdit: this.openEdit,
    };
    const titleName = pageFromFlag
      ? {
          default: `${intl
            .get('sinv.receiptWorkbench.view.title.detail.returnDetail')
            .d('退货明细')}${nodeConfigTitleName ? '-' : ''}${nodeConfigTitleName}`,
        }
      : {
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
            : `${intl
                .get('sinv.receiptWorkbench.view.title.detail.lookReturnRecord')
                .d('查看退货单')}${nodeConfigTitleName ? '-' : ''}${nodeConfigTitleName}`,
          five: `${intl
            .get('sinv.receiptWorkbench.view.title.detail.affirmReturnRecord')
            .d('确认退货单')}${nodeConfigTitleName ? '-' : ''}${nodeConfigTitleName}`,
          default: `${intl
            .get('sinv.receiptWorkbench.view.title.detail.returnDetail')
            .d('退货明细')}${nodeConfigTitleName ? '-' : ''}${nodeConfigTitleName}`,
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
          backPath={!pageFromFlag && !showWorkflowFlag && backPath}
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
                {((from === 'three' || from === 'four') && !editFieldFlag) ||
                ['flow'].includes(docFlow) ||
                pageFromFlag
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
                        <Output name="creationDate" />
                        <Output name="unitAll" />
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
                              {from === 'three' ||
                              !externalSystem ||
                              rcvStatusCode === '35_PUBLISH' ||
                              ['flow', 'oldFlow'].includes(docFlow)
                                ? intl.get('hzero.common.button.look').d('查看')
                                : intl.get('hzero.common.view.button.edit').d('编辑')}
                            </a>
                          )}
                        />
                        <Output
                          name="linkSecond"
                          renderer={({ record }) => (
                            <a onClick={() => this.onOpenLinkChange(record, Number(2), Number(1))}>
                              {from === 'three' ||
                              !externalSystem ||
                              rcvStatusCode === '35_PUBLISH' ||
                              ['flow', 'oldFlow'].includes(docFlow)
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
                          from === 'three' || from === 'four'
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
                        <DateTimePicker name="creationDate" disabled />
                        <Lov
                          name="unitAll"
                          disabled={
                            from === 'five' ||
                            !externalSystem ||
                            ['flow', 'oldFlow'].includes(docFlow)
                              ? true
                              : rcvStatusCode === '40_FINISHED' || rcvStatusCode === '20_SUBMITTED'
                          }
                        />
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
                            from === 'five' ||
                            !externalSystem ||
                            ['flow', 'oldFlow'].includes(docFlow)
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
                        <TextField
                          name="receivedBy"
                          disabled={from === 'five' || !externalSystem ? true : editFieldFlag}
                        />
                        {!isSupplier && <TextField name="supplierReceiptFlag" disabled />}
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
                        />

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
              <LineTable props={lineProps} />
              {/* {customizeTable(
                {
                  code: `SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.LINE_${nodeConfigIndexAbc}`,
                  readOnly:
                    ['flow', 'oldFlow'].includes(docFlow) || pageFromFlag
                      ? true
                      : from === 'five'
                      ? false
                      : from === 'three'
                      ? !editFieldFlag || rcvStatusCode === '20_SUBMITTED'
                      : rcvStatusCode === '20_SUBMITTED',
                },
                <Table
                  dataSet={this.tableDs}
                  custLoading={custLoading}
                  columns={columns}
                  pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
                  style={{ maxHeight: 400 }}
                  queryFieldsLimit={3}
                  virtual
                  virtualCell
                  buttons={
                    from === 'five' || !externalSystem || ['flow', 'oldFlow'].includes(docFlow)
                      ? []
                      : isNil(isRoleWorkbench) &&
                        !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode) && [
                          <LineBtn dataSet={this.tableDs} />,
                        ]
                  }
                  selectionMode={
                    from === 'five' || !externalSystem || ['flow', 'oldFlow'].includes(docFlow)
                      ? 'none'
                      : !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode)
                      ? 'rowbox'
                      : 'none'
                  }
                />
              )} */}
            </Content>
            <Content
              style={showWorkflowFlag ? { marginTop: 0, marginBottom: 8 } : { marginTop: 0 }}
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
                    code: `SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
                    readOnly: ['flow', 'oldFlow'].includes(docFlow)
                      ? true
                      : from === 'three'
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
