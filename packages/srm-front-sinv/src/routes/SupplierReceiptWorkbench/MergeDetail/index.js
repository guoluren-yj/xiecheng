/* eslint-disable no-unused-expressions */
import React, { Fragment, Component } from 'react';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import {
  DataSet,
  Button,
  TextField,
  Form,
  Spin,
  Lov,
  Icon,
  Modal,
  DatePicker,
  TextArea,
  Tooltip,
  Dropdown,
  Rate,
  Attachment,
  Output,
} from 'choerodon-ui/pro';
import { Button as PermissionButton } from 'components/Permission';

import { Menu, Alert, Tag } from 'choerodon-ui';
import qs from 'querystring';
import { Bind, Debounce } from 'lodash-decorators';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import moment from 'moment';
import { yesOrNoRender } from 'utils/renderer';
import { Header, Content } from 'components/Page';
import { isEmpty, isNil } from 'lodash';
import { PRIVATE_BUCKET, SRM_SPUC } from '_utils/config';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import C7nPrecisionInputNumber from '@/components/Precision/C7nPrecisionInputNumber';
import ImageList from '@/routes/components/ImageList';
import cuxRemote from 'hzero-front/lib/utils/remote';
import DynamicButtons from '_components/DynamicButtons';

import {
  handleDel,
  handleEvaluate,
  handleSave,
  treeFetch,
  subDelPriFetch,
} from '@/services/ReceipWorkbenchService';
import { formDS, tableDS, batchMaintenanceDS, formRateDS, attachmentDS } from './store/lineDS.ts';
import CompositeComposite, { isSupplier, confirm, c7nModal, TooltipButton } from '../util';
import CustomLinkIndex from '@/routes/components/CustomModal';
import CustomModal from '../../ReceiptExecution/components/CustomModal';
import Operaindex from '../components/Operating/index';
import ImportModal from '../ThingReceipts/components/importModal';
import styles from '../index.less';
import {
  showBigNumber,
  globalPrint,
  useDoubleUomConfig,
  queryCalcRuleConfig,
  filterObjVal,
  formatErrorInfo,
} from '@/routes/components/utils';

const organizationId = getCurrentOrganizationId();

function getUnitCode() {
  const code = [];
  for (let i = 0; i < 10; i++) {
    const index = String.fromCharCode(65 + i);
    code.push(
      `SINV.RECEIPT_WORKBENCH_THING.DETAIL.${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.DETAIL.MAINTAIN_${index}`,
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
    'sinv.receiptWorkbench',
    'sinv.common',
    'sinv.deliveryCreation',
    'slod.deliveryWorkbench',
    'ssta.common',
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
      location: { search },
      doubleUnitEnabled,
    } = this.props;
    const { cacheKey, from, viewType, courseAsLine, pageCurrentIsSelectedNodeCodes } = qs.parse(
      search.substr(1)
    );
    const { renderValidateField } = remote?.props?.process || {};
    // this.tableDs = new DataSet(tableDS(renderValidateField));
    this.tableDs = new DataSet(
      remote?.process('getLineInfoDs', tableDS(renderValidateField), {
        comp: 'sup',
        returnedFlag: 0,
      })
    );
    this.tableDs.setState('doubleUnitEnabled', doubleUnitEnabled);
    this.batchMaintenanceDs.bind(this.tableDs, 'tablesDs');
    this.printRef = React.createRef();
    this.state = {
      from,
      viewType,
      cacheKey,
      courseAsLine,
      visible: true,
      newPriVisible: true,
      priVisible: true,
      delVisible: true,
      spinning: false,
      attachFlag: true,
      treeList: [],
      customData: [], // 定制化属性Modal的Table数据源
      customVisible: false, // 定制化属性Modal显示
      rcvTrxHeaderId: null,
      nodeConfigTitleName: '...',
      buttonSourceContent: [],
      buttonDeleteContent: [],
      buttonPrintContent: [],
      buttonNewPrintContent: [],
      instantlyPrintData: '', // 存储新打印参数
      pageCurrentIsSelectedNodeCodes,
    };
  }

  componentDidMount() {
    this.treeFetch();
    this.fetchCalcRuleConfig();
  }

  // 查询金额计算配置
  @Bind()
  async fetchCalcRuleConfig() {
    const result = await queryCalcRuleConfig();
    this.tableDs.setState('amountCalcRule', result);
  }

  @Bind()
  async treeFetch() {
    const { cacheKey } = this.state;
    const res = getResponse(await treeFetch({ cacheKey }));
    if (res) {
      const rcvTrxHeaderId = (res || [])
        ?.map((item) => item.children)[0]
        ?.map((n) => n.rcvTrxHeaderId)[0];
      const nodeConfigIndexAbc = (res || [])
        ?.map((item) => item.children)[0]
        ?.map((n) => n.nodeConfigIndexAbc)[0];
      this.setState({
        visible: true,
        priVisible: true,
        delVisible: true,
        newPriVisible: true,
        treeList: res,
        rcvTrxHeaderId,
        nodeConfigIndexAbc,
        nodeConfigTitleName: '...',
        buttonDeleteContent: (
          <Menu onClick={(key) => this.operationChangeComposite(key, 'delete')}>
            <Menu.Item key="instantly">
              {intl
                .get('sinv.receiptWorkbench.view.title.detail.deleteInstantly')
                .d('删除当前单据')}
            </Menu.Item>
            <Menu.Item key="all">
              {intl.get('sinv.receiptWorkbench.view.title.detail.deleteAll').d('删除所有单据')}
            </Menu.Item>
            <Menu.Item>
              <CompositeComposite
                data={res}
                title={intl
                  .get('sinv.receiptWorkbench.view.title.detail.deletePortion')
                  .d('删除部分单据')}
                btnTitle={intl.get(`hzero.common.button.delete`).d('删除')}
                compositeChange={this.compositeChange}
                componentType="delete"
              />
            </Menu.Item>
          </Menu>
        ),
        buttonSourceContent: (
          <Menu onClick={(key) => this.operationChangeComposite(key, 'submit')}>
            <Menu.Item key="instantly">
              {intl
                .get('sinv.receiptWorkbench.view.title.detail.submitInstantly')
                .d('提交当前单据')}
            </Menu.Item>
            <Menu.Item key="all">
              {intl.get('sinv.receiptWorkbench.view.title.detail.submitAll').d('提交所有单据')}
            </Menu.Item>
            <Menu.Item>
              <CompositeComposite
                data={res}
                title={intl
                  .get('sinv.receiptWorkbench.view.title.detail.submitPortion')
                  .d('提交部分单据')}
                btnTitle={intl.get('hzero.common.button.submit').d('提交')}
                compositeChange={this.compositeChange}
                componentType="submit"
              />
            </Menu.Item>
          </Menu>
        ),
        buttonPrintContent: (
          <Menu onClick={(key) => this.operationChangeComposite(key, 'print')}>
            <Menu.Item key="instantly">
              {intl.get('sinv.receiptWorkbench.view.title.detail.printInstantly').d('打印当前单据')}
            </Menu.Item>
            <Menu.Item key="all">
              {intl.get('sinv.receiptWorkbench.view.title.detail.printAll').d('打印所有单据')}
            </Menu.Item>
            <Menu.Item>
              <CompositeComposite
                data={res}
                title={intl
                  .get('sinv.receiptWorkbench.view.title.detail.printPortion')
                  .d('打印部分单据')}
                btnTitle={intl.get(`sinv.common.view.message.button.print`).d('打印')}
                compositeChange={this.compositeChange}
                componentType="print"
              />
            </Menu.Item>
          </Menu>
        ),
        buttonNewPrintContent: (
          <Menu onClick={(key) => this.operationChangeComposite(key, 'newPrint')}>
            <Menu.Item key="instantly">
              {intl.get('sinv.receiptWorkbench.view.title.detail.printInstantly').d('打印当前单据')}
            </Menu.Item>
            <Menu.Item key="all">
              {intl.get('sinv.receiptWorkbench.view.title.detail.printAll').d('打印所有单据')}
            </Menu.Item>
            <Menu.Item>
              <CompositeComposite
                data={res}
                title={intl
                  .get('sinv.receiptWorkbench.view.title.detail.printPortion')
                  .d('打印部分单据')}
                btnTitle={intl.get(`sinv.common.view.message.button.print`).d('打印')}
                compositeChange={this.compositeChange}
                componentType="newPrint"
              />
            </Menu.Item>
          </Menu>
        ),
      });
      this.formDs.setQueryParameter('params', {
        rcvTrxHeaderId,
        customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
      });
      this.formDs.query().then((rec) => {
        if (rec && !rec.failed) {
          this.attachmentDs.loadData([rec]);
          this.setState({
            rcvStatusCode: rec.rcvStatusCode,
            nodeConfigTitleName: rec.nodeConfigName,
          });
        }
      });
      this.tableDs.setQueryParameter('params', {
        rcvTrxHeaderId,
        customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_SEARCH_A`,
      });
      this.tableDs.query();
      this.tableDs.setState('doubleUnitEnabled', this.props.doubleUnitEnabled);
    }
  }

  // 保存
  @Bind()
  @Debounce(400)
  async handleSave() {
    const { nodeConfigIndexAbc, rcvTrxHeaderId, cacheKey } = this.state;
    const batchData = this.tableDs.getState('batchData') || {};

    const saveData = {
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
      data: {
        ...this.formDs.toData()[0],
        cacheKey,
        sinvHeaderAttachmentUuid: this.attachmentDs.toData()[0].sinvHeaderAttachmentUuid,
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
    this.setState({ spinning: true });
    const res = await handleSave(saveData);

    if (getResponse(res)) {
      this.tableDs.setState({ batchData: {} });
      this.tableDs.setState({ fieldMapValues: undefined });
      Promise.all([
        this.formDs.query().then((rec) => {
          if (rec && !rec.failed) {
            this.attachmentDs.loadData([rec]);
            this.setState({
              rcvStatusCode: rec.rcvStatusCode,
              nodeConfigTitleName: rec.nodeConfigName,
            });
          }
        }),
        this.tableDs.query(),
        this.formRateDs.setQueryParameter('params', {
          rcvTrxHeaderId,
          customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc}`,
        }),
      ])
        .then(() => {
          notification.success();
        })
        .finally(() => {
          this.setState({ spinning: false });
        });
    } else {
      this.setState({ spinning: false });
    }
  }

  @Bind()
  @Debounce(400)
  async handleDelete() {
    Modal.confirm({
      contentStyle: { width: '550px' },
      title: intl.get('sinv.receiptExecution.view.message.orderDelBills').d(`确定要整单删除吗？`),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: async () => {
        const res = await this.tableDs.deleteAll();
        if (res) {
          this.props.history.push({
            pathname: `/sinv/supplier-receipt-workbench/list`,
          });
          this.onBack();
        }
      },
    });
  }

  @Bind()
  treeList(data) {
    const { rcvTrxHeaderId } = this.state;
    return (
      <div>
        <div className={styles['tree-up']}>
          <div className={styles['tree-up-left']}>
            <div className={styles['tree-title']}>
              <div className={styles['tree-title-up']}>
                <span className={styles['tree-title-up-text']}>
                  {intl.get('sinv.receiptWorkbench.model.receipt.receiptLook').d('收货单预览')}
                </span>
              </div>
              <div className={styles['tree-title-down']}>
                <span className={styles['tree-title-down-text']}>
                  {intl.get('sinv.receiptWorkbench.model.receipt.quickEdit').d('快速切换单号编辑')}
                </span>
              </div>
            </div>
            {data.map((item) => {
              return (
                <div className={styles['tree-up-list']}>
                  <div className={styles['tree-up-list-tl']}>
                    <span className={styles['tree-up-list-title']}>{item.nodeConfigName}</span>
                  </div>
                  <ul>
                    {item.children.map((i) => {
                      const supplierName = i.supplierId ? i.supplierName : i.supplierCompanyName;
                      return (
                        <li
                          id={i.rcvTrxHeaderId}
                          style={{
                            backgroundColor:
                              rcvTrxHeaderId === i.rcvTrxHeaderId ? 'rgba(0, 0, 0, 0.05)' : '',
                          }}
                          onClick={() => this.onChangeTree(i.rcvTrxHeaderId, i.nodeConfigIndexAbc)}
                        >
                          <Tooltip title={`${i.displayTrxNum} | ${supplierName}`}>
                            <div>
                              <a
                                style={{
                                  color: rcvTrxHeaderId === i.rcvTrxHeaderId ? '#29bece' : '#000',
                                }}
                                className={styles['tree-up-list-a']}
                              >
                                {i.displayTrxNum}
                              </a>
                            </div>
                            <div className={styles['tree-up-list-text']}>
                              <span>
                                {intl
                                  .get('sinv.receiptExecution.model.receipt.supplierName')
                                  .d('供应商')}
                              </span>
                              ：<span>{supplierName}</span>
                            </div>
                          </Tooltip>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  @Bind()
  onChangeTree(rcvTrxHeaderId, nodeConfigIndexAbc) {
    this.setState({
      rcvTrxHeaderId,
      visible: true,
      priVisible: true,
      delVisible: true,
      newPriVisible: true,
      attachFlag: false,
      nodeConfigIndexAbc,
    });
    this.formDs = new DataSet(formDS());
    this.tableDs = new DataSet(tableDS(this.formDs, this.props.doubleUnitEnabled));
    this.formRateDs = new DataSet(formRateDS());
    this.batchMaintenanceDs = new DataSet(batchMaintenanceDS());
    this.attachmentDs = new DataSet(attachmentDS());
    this.batchMaintenanceDs.bind(this.tableDs, 'tablesDs');
    this.tableDs.setState('doubleUnitEnabled', this.props.doubleUnitEnabled);
    this.formDs.setQueryParameter('params', {
      rcvTrxHeaderId,
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
    });
    this.formDs.query().then((rec) => {
      if (rec && !rec.failed) {
        this.attachmentDs.loadData([rec]);
        this.setState({
          nodeConfigTitleName: rec.nodeConfigName,
          rcvStatusCode: rec.rcvStatusCode,
          attachFlag: true,
        });
      }
    });
    this.tableDs.setQueryParameter('params', {
      rcvTrxHeaderId,
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_SEARCH_A`,
    });
    this.tableDs.query();
  }

  @Bind()
  onVisibleChange(flag) {
    this.setState({ visible: !flag });
  }

  @Bind()
  delVisibleChange(flag) {
    this.setState({ delVisible: !flag });
  }

  @Bind()
  priVisibleChange(flag) {
    this.setState({ priVisible: !flag });
  }

  @Bind()
  newPriVisibleChange(flag) {
    this.setState({ newPriVisible: !flag });
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

  @Bind()
  async operationChangeComposite(_keys, componentType) {
    const { treeList, cacheKey, nodeConfigIndexAbc, rcvTrxHeaderId } = this.state;
    const data = [];
    treeList.forEach((item) => {
      if (componentType === 'print') {
        const list = item.children.map((n) => n.rcvTrxHeaderId);
        data.push(...list);
      } else {
        const list = item.children.map((n) => {
          return {
            rcvTrxHeaderId: n.rcvTrxHeaderId,
          };
        });
        data.push(...list);
      }
    });
    const list = componentType === 'print' ? rcvTrxHeaderId : { rcvTrxHeaderId };
    const params = {
      cacheKey,
      componentType,
      rcvTrxHeaderIds: _keys.key === 'instantly' ? [list] : data,
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
    };
    const batchData = this.tableDs.getState('batchData') || {};
    const saveData = {
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
      data: {
        cacheKey,
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
    if (componentType === 'submit' && _keys.key === 'instantly') {
      const tips = filterObjVal(
        this.formDs.toData().map((m) => ({
          ...m,
          inventoryId: m._inventoryId,
          locatorId: m._locatorId,
          returnedFlagMeaning:
            m.returnedFlag === 0
              ? intl.get('sinv.receiptExecution.view.message.Receipt').d(`收货`)
              : intl.get('sinv.receiptExecution.view.message.ReturnOrder').d(`退货`),
        })),
        'displayTrxNum'
      )
        .map(
          (i) =>
            `${i.returnedFlagMeaning}${intl
              .get('sinv.receiptExecution.view.message.bills')
              .d(`单`)}[${i.displayTrxNum}]`
        )
        .join('/');

      const headerFlag = await this.formDs.validate();
      const flag = await this.tableDs.validate();
      const attachmentFlag = await this.attachmentDs.validate();
      if (!attachmentFlag || !flag) {
        formatErrorInfo(
          this.attachmentDs,
          this.tableDs,
          intl.get(`sinv.receiptWorkbench.view.title.detail.receipLineInfo`).d('收货单明细行信息')
        );
      }
      if (headerFlag && flag && attachmentFlag) {
        confirm({
          content: `${intl
            .get(`sinv.receiptExecution.view.message.submitTip`)
            .d(`确定要提交单据`)}${tips}?`,
          onOk: async () => {
            this.setState({ spinning: true });
            const red = getResponse(await handleSave(saveData));
            if (red) {
              const res = await subDelPriFetch(params);
              if (getResponse(res)) {
                if (res.length && res[0]?.doAsynFlag === 1) {
                  this.setState({ spinning: false });
                  notification.warning({
                    message: intl
                      .get('sinv.receiptExecution.view.message.showAysncTip')
                      .d(
                        `当前执行行数量超过预置数量，程序转为后台执行，执行进度结果可前往【异步执行记录】按钮明细进行查看`
                      ),
                  });
                  if (res[0]?.doReturnFlag === 1) {
                    this.props.history.push({
                      pathname: `/sinv/supplier-receipt-workbench/list`,
                    });
                    this.onBack();
                  } else {
                    this.treeFetch();
                  }
                  return;
                }

                if (data.length > 1) {
                  this.setState({ spinning: false });
                  this.treeFetch();
                  notification.success();
                } else if (data.length === 1) {
                  this.setState({ spinning: false });
                  this.props.history.push({
                    pathname: `/sinv/supplier-receipt-workbench/list`,
                  });
                  this.onBack();
                  notification.success();
                }
              } else {
                this.treeFetch();
              }
            }
            this.setState({ spinning: false });
          },
        });
      }
    } else if (componentType === 'print' && _keys.key === 'instantly') {
      // 打印当前页面数据
      this.setState({ spinning: true });
      getResponse(subDelPriFetch(params)).then((res) => {
        globalPrint(res, this.treeFetch());
      });
      this.setState({ spinning: false });
    } else if (componentType === 'delete' && _keys.key === 'instantly') {
      // 删除当前页面数据
      getResponse(subDelPriFetch(params)).then((res) => {
        if (getResponse(res)) {
          if (data.length > 1) {
            this.setState({ spinning: false });
            this.treeFetch();
            notification.success();
          } else if (data.length === 1) {
            this.setState({ spinning: false });
            this.props.history.push({
              pathname: `/sinv/supplier-receipt-workbench/list`,
            });
            this.onBack();
            notification.success();
          }
        }
        this.setState({ spinning: false });
      });
    } else if (componentType === 'print' && _keys.key === 'all') {
      // 打印所有页面数据
      this.setState({ spinning: true });
      getResponse(subDelPriFetch(params)).then((res) => {
        globalPrint(res, this.treeFetch);
      });
      this.setState({ spinning: false });
    } else if (componentType === 'newPrint' && _keys.key === 'instantly') {
      this.setState(
        {
          instantlyPrintData: [...params.rcvTrxHeaderIds].map((i) => i.rcvTrxHeaderId),
        },
        () => {
          this.printRef?.current.handlePrint();
        }
      );
      // 新 打印当前页面数据
    } else if (componentType === 'newPrint' && _keys.key === 'all') {
      this.setState(
        {
          instantlyPrintData: [...params.rcvTrxHeaderIds].map((i) => i.rcvTrxHeaderId),
        },
        () => {
          this.printRef?.current.handlePrint();
        }
      );
      // 新 打印所有页面数据
    } else if (_keys.key === 'all') {
      // 提交删除所有页面数据
      const listTip = [];
      treeList.forEach((item) => {
        const listDot = item.children;
        listTip.push(...listDot);
      });
      const tips = filterObjVal(listTip, 'displayTrxNum')
        .map(
          (i) =>
            `${i.returnedFlagMeaning}${intl
              .get('sinv.receiptExecution.view.message.bills')
              .d(`单`)}[${i.displayTrxNum}]`
        )
        .join('/');

      if (componentType === 'submit') {
        const headerFlag = await this.formDs.validate();
        const flag = await this.tableDs.validate();
        const attachmentFlag = await this.attachmentDs.validate();
        if (!attachmentFlag || !flag) {
          formatErrorInfo(
            this.attachmentDs,
            this.tableDs,
            intl.get(`sinv.receiptWorkbench.view.title.detail.receipLineInfo`).d('收货单明细行信息')
          );
        }
        if (headerFlag && attachmentFlag && flag) {
          confirm({
            content: `${intl
              .get(`sinv.receiptExecution.view.message.submitTip`)
              .d(`确定要提交单据`)}${tips}?`,
            onOk: async () => {
              this.setState({ spinning: true });
              const red = getResponse(await handleSave(saveData));
              if (red) {
                const res = await subDelPriFetch(params);
                if (getResponse(res)) {
                  if (res.length && res[0]?.doAsynFlag === 1) {
                    this.setState({ spinning: false });
                    notification.warning({
                      message: intl
                        .get('sinv.receiptExecution.view.message.showAysncTip')
                        .d(
                          `当前执行行数量超过预置数量，程序转为后台执行，执行进度结果可前往【异步执行记录】按钮明细进行查看`
                        ),
                    });
                    this.props.history.push({
                      pathname: `/sinv/supplier-receipt-workbench/list`,
                    });
                    this.onBack();
                    notification.success();
                    return;
                  }
                  this.setState({ spinning: false });
                  if (res[0]?.doReturnFlag === 1) {
                    this.props.history.push({
                      pathname: `/sinv/supplier-receipt-workbench/list`,
                    });
                    this.onBack();
                  } else {
                    this.treeFetch();
                  }
                  notification.success();
                } else {
                  this.treeFetch();
                }
                this.setState({ spinning: false });
              }
              this.setState({ spinning: false });
            },
          });
        }
      } else {
        // 全部删除
        this.setState({ spinning: true });
        getResponse(subDelPriFetch(params)).then((res) => {
          if (getResponse(res)) {
            this.setState({ spinning: false });
            this.props.history.push({
              pathname: `/sinv/supplier-receipt-workbench/list`,
            });
            this.onBack();
            notification.success();
          } else {
            this.treeFetch();
          }
          this.setState({ spinning: false });
        });
      }
    }
  }

  @Bind()
  async compositeChange(list, componentType) {
    const { treeList, cacheKey, nodeConfigIndexAbc } = this.state;
    const rcvTrxHeaderIds = [];
    const data = [];
    treeList.forEach((item) => {
      const text = item.children.map((n) => {
        return {
          rcvTrxHeaderId: n.rcvTrxHeaderId,
        };
      });
      data.push(...text);
    });
    list.forEach((item) => {
      if (componentType === 'print') {
        rcvTrxHeaderIds.push(item.value);
      } else {
        const id = { rcvTrxHeaderId: item.value };
        rcvTrxHeaderIds.push(id);
      }
    });
    const batchData = this.tableDs.getState('batchData') || {};
    const saveData = {
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
      data: {
        cacheKey,
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

    const params = {
      cacheKey,
      componentType,
      rcvTrxHeaderIds,
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
      batchEditLineDTO: isEmpty(batchData)
        ? undefined
        : { ...batchData, inventoryId: batchData._inventoryId, locatorId: batchData._locatorId },
    };
    if (componentType === 'print') {
      this.setState({ spinning: true });
      getResponse(subDelPriFetch(params)).then((res) => {
        globalPrint(res, this.treeFetch);
        this.setState({ spinning: false });
      });
    } else if (componentType === 'newPrint') {
      // 打印选中的数据
      this.setState(
        {
          instantlyPrintData: [...params.rcvTrxHeaderIds].map((i) => i.rcvTrxHeaderId),
        },
        () => {
          this.printRef?.current.handlePrint();
        }
      );
    } else if (componentType === 'submit') {
      // 部份提交
      const dataWrap = [];
      treeList.forEach((item) => {
        dataWrap.push(...item.children);
      });
      const newDataWrap = list.map((i) => {
        return dataWrap.filter((x) => i.value === x.rcvTrxHeaderId)?.[0];
      });
      const tips = filterObjVal(newDataWrap, 'displayTrxNum')
        .map(
          (i) =>
            `${i.returnedFlagMeaning}${intl
              .get('sinv.receiptExecution.view.message.bills')
              .d(`单`)}[${i.displayTrxNum}]`
        )
        .join('/');
      const checkedDisNum = newDataWrap.length && newDataWrap.map((i) => i.displayTrxNum);
      const currentDisNum = this.formDs.map((i) => i.toData())[0]?.trxNum;
      const flag = await this.tableDs.validate();
      const attachmentFlag = await this.attachmentDs.validate();
      const validFlag = checkedDisNum.includes(currentDisNum) ? !attachmentFlag || !flag : false;
      if (validFlag) {
        formatErrorInfo(
          this.attachmentDs,
          this.tableDs,
          intl.get(`sinv.receiptWorkbench.view.title.detail.receipLineInfo`).d('收货单明细行信息')
        );
        return false;
      }
      // todo: 没有包含勾选的单据不走校验 , 当前勾选单据包含的话才走校验
      if (!validFlag) {
        confirm({
          content: `${intl
            .get(`sinv.receiptExecution.view.message.submitTip`)
            .d(`确定要提交单据`)}${tips}?`,
          onOk: async () => {
            this.setState({ spinning: true });
            const red = getResponse(await handleSave(saveData));
            if (red) {
              const res = await subDelPriFetch(params);
              if (getResponse(res)) {
                if (res.length && res[0]?.doAsynFlag === 1) {
                  this.setState({ spinning: false });
                  notification.warning({
                    message: intl
                      .get('sinv.receiptExecution.view.message.showAysncTip')
                      .d(
                        `当前执行行数量超过预置数量，程序转为后台执行，执行进度结果可前往【异步执行记录】按钮明细进行查看`
                      ),
                  });
                  if (res[0]?.doReturnFlag === 1) {
                    this.props.history.push({
                      pathname: `/sinv/supplier-receipt-workbench/list`,
                    });
                    this.onBack();
                  } else {
                    this.treeFetch();
                  }
                  return;
                }
                if (rcvTrxHeaderIds.length !== data.length) {
                  this.setState({ spinning: false });
                  this.treeFetch();
                  notification.success();
                } else {
                  this.setState({ spinning: false });
                  this.props.history.push({
                    pathname: `/sinv/supplier-receipt-workbench/list`,
                  });
                  this.onBack();
                  notification.success();
                }
              } else {
                this.treeFetch();
              }
            }
            this.setState({ spinning: false });
          },
        });
      }
    } else {
      // 部份删除
      this.setState({ spinning: true });
      getResponse(subDelPriFetch(params)).then((res) => {
        if (getResponse(res)) {
          if (rcvTrxHeaderIds.length !== data.length) {
            this.setState({ spinning: false });
            this.treeFetch();
            notification.success();
          } else {
            this.setState({ spinning: false });
            this.props.history.push({
              pathname: `/sinv/supplier-receipt-workbench/list`,
            });
            this.onBack();
            notification.success();
          }
        } else {
          this.treeFetch();
        }
        this.setState({ spinning: false });
      });
    }
  }

  @Bind()
  lineDelete(ds) {
    const { cacheKey } = this.state;
    // poAllFlag 订单标识 asnAllFlag 送货单标识 fromDisplayPoNum 订单号 fromDisplayAsnNum 送货单号
    const selectData = ds.selected
      .map((item) => item.toJSONData())
      .map((m) => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId }));
    const selectDataPoNum = selectData.filter((i) => i.fromDisplayPoNum);
    const selectDataAsnNum = selectData.filter((i) => i.fromDisplayAsnNum);
    const deleteFlag = selectData.some((i) => i.rcvTrxLineId);
    let isPoNum = true;
    if (deleteFlag) {
      const data = selectData.filter((i) => i.rcvTrxLineId);
      const params = { ...this.formDs.toData()[0], sinvRcvTrxLineDTOS: data, cacheKey };
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
          content: intl.get('sinv.receiptExecution.view.message.sureDelete').d('确定要删除此单据?'),
          okText: intl.get('hzero.common.button.sure').d('确定'),
          cancelText: intl.get('hzero.common.button.cancel').d('取消'),
          title: `${intl
            .get(`sinv.receiptExecution.view.message.orderTip`)
            .d(`单据`)}【${tip}：${tipNums}】${intl
            .get(`sinv.receiptExecution.view.message.orderNums`)
            .d(`需按整单收货，如需删除，则系统会将收货单下该单据对应所有行进行删除操作`)}`,
          onOk: async () => {
            const res = await handleDel({ ...params, orderAllDeleteFlag: 1 });
            // if (res.failed) return notification.error({ message: res?.message });
            if (getResponse(res)) {
              this.formDs.query().then((rec) => {
                if (rec && !rec.failed) {
                  this.attachmentDs.loadData([rec]);
                  this.setState({
                    rcvStatusCode: rec.rcvStatusCode,
                    nodeConfigTitleName: rec.nodeConfigName,
                  });
                }
              });
              ds.query();
            }
            // this.treeFetch();
          },
        });
      } else {
        confirm({
          content: intl.get('sinv.receiptExecution.view.message.orderDel').d(`确认删除选中行？`),
          onOk: async () => {
            const res = await handleDel(params);
            if (getResponse(res)) {
              // this.treeFetch();
              notification.success();
              this.formDs.query().then((rec) => {
                if (rec && !rec.failed) {
                  this.attachmentDs.loadData([rec]);
                  this.setState({
                    rcvStatusCode: rec.rcvStatusCode,
                    nodeConfigTitleName: rec.nodeConfigName,
                  });
                }
              });
              ds.query();
            }
          },
        });
      }
    } else {
      this.tableDs.remove(ds.selected);
    }
  }

  onBack = () => {
    const {
      from,
      viewType,
      courseAsLine,
      nodeConfigIndexAbc,
      pageCurrentIsSelectedNodeCodes,
    } = this.state;
    const backPageNodeCode = pageCurrentIsSelectedNodeCodes === '1' ? nodeConfigIndexAbc : 'K';
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
    const { rcvStatusCode, rcvTrxHeaderId, nodeConfigIndexAbc } = this.state;
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
      zIndex: 1005,
      title: intl.get(`sinv.common.view.message.comments`).d('评价'),
      children: (
        <Spin dataSet={this.formRateDs}>
          <div className={styles['rate-all']}>
            {customizeForm(
              {
                code: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.RATE_${nodeConfigIndexAbc}`,
                readOnly: rcvStatusCode === '20_SUBMITTED',
                disableOutput: 'Output',
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
      handleEvaluate(params).then((res) => {
        if (getResponse(res)) {
          modal.close();
        }
      });
    }
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
    const { nodeConfigIndexAbc, from, rcvStatusCode } = this.state;
    const basicProps = {
      from,
      header,
      editor: true,
      rcvStatusCode,
      type: linkOrder,
      returnedFlag: 0, // 收货
      nodeConfigIndexAbc,
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
  @Bind()
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

  render() {
    const {
      from,
      spinning,
      visible,
      attachFlag,
      delVisible,
      priVisible,
      customData,
      newPriVisible,
      customVisible,
      // rcvTrxHeaderId,
      rcvStatusCode,
      treeList = [],
      nodeConfigIndexAbc,
      nodeConfigTitleName,
      buttonSourceContent = [],
      buttonDeleteContent = [],
      buttonPrintContent = [],
      buttonNewPrintContent = [],
      instantlyPrintData,
      cacheKey,
    } = this.state;
    const { remote, customizeForm, custLoading, customizeTable } = this.props;
    const { renderFormFieldRichText, cuxHandleLineBtns } = remote?.props?.process || {};
    const opreateFlag = rcvStatusCode === '10_NEW' || rcvStatusCode === '30_SUP_REJECTED';
    const saveFlag =
      rcvStatusCode === '10_NEW' ||
      rcvStatusCode === '30_REJECTED' ||
      rcvStatusCode === '30_SUP_REJECTED' ||
      rcvStatusCode === '40_FINISHED';
    const backPath = `/sinv/supplier-receipt-workbench/list`;
    const customProps = {
      visible: customVisible,
      dataSource: customData,
      hideModal: () => {
        this.setState({ customVisible: false });
      },
    };

    const LineBtn = observer(({ dataSet }) => {
      const symbol = dataSet?.selected.length === 0;
      const buttons = [
        {
          name: 'batchEdit',
          btnType: 'c7n-pro',
          btnComp: TooltipButton,
          childFor: 'buttonText',
          hidden: ['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode),
          child: symbol
            ? intl.get('sinv.receiptWorkbench.view.title.detail.modeEdit').d('批量维护')
            : intl.get('sinv.receiptWorkbench.view.title.detail.modeCheckEdit').d('勾选批量维护'),
          btnProps: {
            tipTitle: symbol
              ? intl
                  .get('sinv.receiptWorkbench.view.title.detail.modeEditData')
                  .d('批量维护全部数据')
              : intl
                  .get('sinv.receiptWorkbench.view.title.detail.modeCheckedData')
                  .d('批量维护勾选数据'),
            btnProps: {
              funcType: 'flat',
              icon: 'mode_edit',
              color: 'primary',
              // type: 'c7n-pro',
              onClick: () => this.handleBatchMaintenance(symbol),
            },
          },
        },
        {
          name: 'delete',
          btnType: 'c7n-pro',
          hidden: ['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode),
          child: (name) => name || intl.get(`hzero.common.button.batchdelete`).d('批量删除'),
          btnProps: {
            funcType: 'flat',
            color: 'primary',
            icon: 'delete_sweep',
            onClick: () => this.lineDelete(dataSet),
            disabled: isEmpty(dataSet?.selected),
          },
        },
      ];
      const btns = cuxHandleLineBtns(buttons, { formDs: this.formDs });
      return <DynamicButtons buttons={btns} />;
    });

    const { doubleUnitEnabled } = this.props;
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
        name: 'action',
        width: 160,
        renderer: ({ record }) => {
          return (
            <a onClick={() => this.splitLine(record)} disabled={from === 'five'}>
              {intl.get(`sinv.deliveryCreation.view.button.split`).d('拆分')}
            </a>
          );
        },
      },
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
          record.get('itemId') &&
          record.get('firstNodeFlag') === 1 &&
          doubleUnitEnabled === 2 &&
          record.get('upStreamSuFlag') === 0, // 当前节点是第一个事务节点、上游模块（订单、协议）未开启双单位、物流开启双单位的情况下，该字段可编辑
        renderer: ({ record }) => record.get('secondaryUomName'),
        header: intl.get('sinv.receiptExecution.model.receipt.secondaryUomName').d('单位'),
      },
      {
        name: 'uomName',
        width: 150,
        header: doubleUnitEnabled
          ? intl.get('sinv.receiptExecution.model.receipt.baseUomName').d('基本单位')
          : intl.get('sinv.receiptExecution.model.receipt.uomName').d('单位'),
      },
      doubleUnitEnabled && {
        name: 'secondaryQuantity',
        width: 120,
        editor: (record) =>
          !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode) &&
          record.get('subjectType') === 'QUANTITY' && (
            <C7nPrecisionInputNumber
              name="secondaryQuantity"
              record={record}
              // precision={record.get('uomPrecision') || 6}
              precision={
                !isNil(record.get('secondaryUomPrecision'))
                  ? record.get('secondaryUomPrecision')
                  : 6
              }
            />
          ),
        renderer: ({ value }) => showBigNumber(value),
      },
      doubleUnitEnabled &&
        !['40_FINISHED'].includes(rcvStatusCode) && {
          name: 'secondaryLeftQuantity',
          width: 120,
          renderer: ({ value }) => showBigNumber(value),
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
        header: doubleUnitEnabled
          ? intl.get('sinv.receiptExecution.model.receipt.exec.baseQuantity').d('执行基本数量')
          : intl.get('sinv.receiptExecution.model.receipt.exec.quantity').d('执行数量'),
      },
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
          ? intl.get('sinv.receiptExecution.model.receipt.baseLeftQuantity').d('可执行基本数量')
          : intl.get('sinv.receiptExecution.model.receipt.leftQuantity').d('可执行数量'),
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
            : record.get('parentLimitlessReceiptFlag') === 1 &&
              record.get('subjectType') === 'QUANTITY' &&
              value === 0
            ? '-'
            : showBigNumber(value, record.get('financialPrecision')),
      },
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
            {from === 'three'
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
            {from === 'three'
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

    return (
      <Fragment>
        <Header
          title={`${intl
            .get('sinv.receiptWorkbench.view.title.detail.receiptDetail')
            .d('收货明细')}-${nodeConfigTitleName}`}
          backPath={backPath}
          onBack={this.onBack}
        >
          <Dropdown
            overlay={spinning || buttonSourceContent}
            visible={visible}
            hidden={visible}
            trigger="hover"
            onVisibleChange={(flag) => this.onVisibleChange(flag)}
          >
            <Button
              icon="check"
              color="primary"
              style={{ border: 'none', color: '#FFF' }}
              loading={spinning || false}
              // onClick={() => this.onVisibleChange(visible)}
            >
              {intl.get('hzero.common.button.submit').d('提交')}{' '}
              <Icon
                type="expand_more"
                style={{ width: '0.16rem', height: '0.16rem', marginBottom: '0.03rem' }}
              />
            </Button>
          </Dropdown>
          <Button
            icon="save"
            loading={spinning || false}
            disabled={!saveFlag}
            onClick={this.handleSave}
            style={{ border: 'none' }}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Dropdown
            overlay={spinning || buttonPrintContent}
            hidden={priVisible}
            visible={priVisible}
            trigger="hover"
            onVisibleChange={(flag) => this.priVisibleChange(flag)}
          >
            <PermissionButton
              loading={spinning || false}
              // onClick={() => this.priVisibleChange(priVisible)}
              style={{ border: 'none' }}
              permissionList={[
                {
                  code: `srm.logistics.receive.supplier-receipt-workbench.button.print`,
                  type: 'button',
                },
              ]}
            >
              <Icon type="print" style={{ fontSize: 14, marginRight: 4 }} />
              {intl.get(`sinv.common.view.message.button.print`).d('打印')}{' '}
              <Icon
                type="expand_more"
                style={{ width: '0.16rem', height: '0.16rem', marginBottom: '0.03rem' }}
              />
            </PermissionButton>
          </Dropdown>
          <Dropdown
            overlay={spinning || buttonNewPrintContent}
            hidden={newPriVisible}
            visible={newPriVisible}
            trigger="hover"
            onVisibleChange={(flag) => this.newPriVisibleChange(flag)}
          >
            <PermissionButton
              loading={spinning || false}
              style={{ border: 'none' }}
              permissionList={[
                {
                  code: `srm.logistics.receive.supplier-receipt-workbench.button.newPrint`,
                  type: 'button',
                },
              ]}
            >
              <Icon type="print" style={{ fontSize: 14, marginRight: 4 }} />
              {intl.get('hzero.common.button.newPrint').d('打印(新)')}{' '}
              <Icon
                type="expand_more"
                style={{ width: '0.16rem', height: '0.16rem', marginBottom: '0.03rem' }}
              />
            </PermissionButton>
          </Dropdown>

          <Dropdown
            overlay={spinning || buttonDeleteContent}
            hidden={delVisible}
            trigger="hover"
            visible={delVisible}
            onVisibleChange={(flag) => this.delVisibleChange(flag)}
          >
            <Button
              // onClick={() => this.delVisibleChange(delVisible)}
              icon="delete"
              style={{ border: 'none' }}
              loading={spinning || false}
            >
              {intl.get(`hzero.common.button.delete`).d('删除')}{' '}
              <Icon
                type="expand_more"
                style={{ width: '0.16rem', height: '0.16rem', marginBottom: '0.03rem' }}
              />
            </Button>
          </Dropdown>
          {!isSupplier && (
            <Button
              funcType="flat"
              loading={spinning || false}
              onClick={this.handRate}
              style={{ border: 'none' }}
            >
              <Icon style={{ fontSize: 14, margin: '0 4px 0 4px' }} type="rate_review1" />
              {intl.get(`sinv.common.view.message.button.rate`).d('评价')}
            </Button>
          )}
        </Header>
        <div className={styles.fa}>
          <div className={styles.son}>
            <div id="dettree" className={styles['det-tree']}>
              {this.treeList(treeList)}
            </div>
            <div id="detcontent" className={styles['det-content']}>
              <Spin spinning={spinning || false}>
                <Content className={styles['content-header']} style={{ margin: '0 8px 0 8px' }}>
                  <Spin dataSet={this.formDs}>
                    <div style={{ marginBottom: 16 }}>
                      <h3 className={styles['page-title']}>
                        {intl
                          .get(`sinv.receiptWorkbench.view.title.detail.receipHeaderInfo`)
                          .d('收货单基础信息')}
                      </h3>
                    </div>
                    {customizeForm(
                      {
                        code: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.${nodeConfigIndexAbc}`,
                        readOnly: rcvStatusCode === '20_SUBMITTED',
                        disableOutput: 'Output',
                        __force_record_to_update__: true,
                      },
                      <Form labelLayout="float" dataSet={this.formDs} columns={3}>
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
                            if (Number(value) === 0) {
                              return intl.get('sinv.receiptExecution.model.receipt.aog').d('收货');
                            } else if (Number(value) === 1) {
                              return intl
                                .get('sinv.receiptExecution.model.receipt.returnUps')
                                .d('退货');
                            }
                          }}
                        />
                        <Lov
                          name="rcvTypeAll"
                          disabled={
                            rcvStatusCode === '40_FINISHED' || rcvStatusCode === '20_SUBMITTED'
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
                        {!isSupplier && <Lov name="unitAll" disabled={!opreateFlag} />}
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
                        />
                        {typeof renderFormFieldRichText === 'function' ? (
                          renderFormFieldRichText({ formDs: this.formDs })
                        ) : (
                          <></>
                        )}
                        <TextField name="receivedBy" />
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
                              {from === 'three'
                                ? intl.get('hzero.common.button.look').d('查看')
                                : intl.get('hzero.common.view.button.edit').d('编辑')}
                            </a>
                          )}
                        />
                        <Output
                          name="linkSecond"
                          renderer={({ record }) => (
                            <a onClick={() => this.onOpenLinkChange(record, Number(2), Number(1))}>
                              {from === 'three'
                                ? intl.get('hzero.common.button.look').d('查看')
                                : intl.get('hzero.common.view.button.edit').d('编辑')}
                            </a>
                          )}
                        />
                      </Form>
                    )}
                  </Spin>
                </Content>
                <Content className={styles['content-line']} style={{ margin: '8px 8px 0 8px' }}>
                  <div
                    style={{
                      marginBottom: !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode)
                        ? 8
                        : 16,
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
                      code: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_${nodeConfigIndexAbc}`,
                      readOnly: rcvStatusCode === '20_SUBMITTED',
                    },
                    <SearchBarTable
                      virtual
                      dataSet={this.tableDs}
                      custLoading={custLoading}
                      columns={columns}
                      searchCode="SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_SEARCH_A"
                      pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
                      style={{ maxHeight: 370 }}
                      virtualCell
                      queryFieldsLimit={3}
                      buttons={
                        !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode) && [
                          <LineBtn dataSet={this.tableDs} />,
                        ]
                      }
                      searchBarConfig={{
                        checkDataSetStatus: false,
                        closeFilterSelector: true,
                      }}
                    />
                  )}
                </Content>
                <Content
                  className={styles['content-atd']}
                  style={{
                    margin: '8px 8px 0 8px',
                    paddingBottom: '150px',
                    height: 'calc(100% - 678px)',
                  }}
                >
                  <Spin dataSet={this.attachmentDs}>
                    <div style={{ marginBottom: 16 }}>
                      <h3 className={styles['page-title']}>
                        {intl
                          .get(`sinv.receiptWorkbench.view.title.detail.receipattachmentUuid`)
                          .d('收货单附件信息')}
                      </h3>
                    </div>
                    {attachFlag && (
                      <div className={styles['footer-form']}>
                        {customizeForm(
                          {
                            code: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.ATTRCH_${nodeConfigIndexAbc}`,
                            readOnly: rcvStatusCode === '20_SUBMITTED',
                            disableOutput: 'Output',
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
                                rcvStatusCode === '40_FINISHED' || rcvStatusCode === '20_SUBMITTED'
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
                    )}
                  </Spin>
                </Content>
              </Spin>
            </div>
          </div>
        </div>
        {customVisible && <CustomModal {...customProps} />}
        {
          <div style={{ display: 'none' }}>
            <PrintProButton
              data-name="newPrint"
              buttonProps={{
                icon: 'print',
                type: 'c7n-pro',
                funcType: 'flat',
                // 权限集配置，可不传
                permissionList: [
                  {
                    code: `srm.logistics.receive.supplier-receipt-workbench.button.newPrint`,
                    type: 'button',
                    meaning: '收货工作台-列表-新打印',
                  },
                ],
              }}
              method="POST"
              requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/batch-print-rcv-token?cacheKey=${cacheKey}`}
              data={instantlyPrintData}
              buttonText={intl.get(`sinv.common.view.message.button.newPrint`).d('打印(新)')}
              printRef={this.printRef}
            />
          </div>
        }
      </Fragment>
    );
  }
}
