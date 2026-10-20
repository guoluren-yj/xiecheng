/* eslint-disable react/button-has-type */
import React, { Component, Fragment } from 'react';
import { Table, DataSet, Modal, Button } from 'choerodon-ui/pro';
import { Tabs, Card, Tag, Icon } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { isEmpty, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import { observable, runInAction } from 'mobx';

import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import { Button as PermissionButton } from 'components/Permission';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { SRM_INTERFACE } from '_utils/config';
import { downloadFile } from 'hzero-front/lib/services/api';
import { isTenantRoleLevel, getCurrentOrganizationId, getResponse } from 'utils/utils';

import {
  fetchByInterDaceRight,
  fetchContentDetails,
  fetchSearch,
  fetchReExecute,
  fetchAutorenew,
} from '@/services/interfaceMointoringWorkService';
import {
  byBatchData,
  byInterfaceLeftData,
  byInterfaceRightData,
  interfaceMessData,
  interfaceAbnormalData,
  breakerCircuitData,
  circuitDetailsData,
} from './initialDataDs';
import styles from './index.less';
import InterfaceFlowControlDetails from '../InterfaceFlowControl/InterfaceFlowControlDetails';

const prefix = 'sitf.interfaceMointoringWork';
const { TabPane } = Tabs;
const isLevelFlag = isTenantRoleLevel();
const organizationId = getCurrentOrganizationId();
const currentDate = new Date();
const preDate = new Date(currentDate.setDate(currentDate.getDate() - 3));

const cicuitColumns = [
  {
    name: 'actionTypeMeaning',
  },
  {
    name: 'limitTypeMeaning',
  },
  {
    name: 'reason',
  },
  {
    name: 'triggerTime',
  },
  {
    name: 'lockingDuration',
  },
  {
    name: 'expiryDate',
  },
  {
    name: 'sourceFromMeaning',
  },
  {
    name: 'createdRealName',
  },
  {
    name: 'creationDate',
  },
  {
    name: 'lastUpdatedRealName',
  },
  {
    name: 'lastUpdateDate',
  },
];
@formatterCollections({
  code: ['sitf.interfaceMointoringWork'],
})
@observer
export default class InterfaceMointoringWork extends Component {
  @observable columnsRight = []; // 存储新增加的字段

  @observable newColumnsAll = []; // 记录新增加的字段【接口查询】

  @observable newColumnsMess = []; // 记录新增加的字段【报文查询】

  @observable menuName = ''; // 接口查询右侧表格标题

  @observable tabKey = 'byBatch'; // 记录页签

  @observable iconFlag = true; // 处理侧滑标识

  @observable classname = ''; // 侧滑图表样式

  byBatchDataQuery = new DataSet({
    autoCreate: true,
    fields: [
      !isLevelFlag && {
        name: 'tenantIdLov',
        type: 'object',
        label: intl.get(`${prefix}.model.interfaceMointoringWork.tenantId`).d('租户名称'),
        lovCode: 'SITF.TENANT_PAGING',
        required: true,
        ignore: 'always',
      },
      {
        name: 'tenantId',
        bind: 'tenantIdLov.tenantId',
      },
      {
        name: 'interfaceIdLov',
        type: 'object',
        label: intl.get(`${prefix}.model.interfaceMointoringWork.interfaceName`).d('接口名称'),
        lovCode: 'SITF.INTERFACE',
        dynamicProps: ({ record }) => {
          return {
            lovPara: { tenantId: record.get('tenantId') || organizationId },
            disabled: !isLevelFlag && isNil(record.get('tenantId')),
          };
        },
        ignore: 'always',
      },
      {
        name: 'interfaceId',
        bind: 'interfaceIdLov.interfaceId',
      },
      {
        name: 'batchNum',
        type: 'string',
        label: intl.get(`${prefix}.model.interfaceMointoringWork.batchNum`).d('批次号'),
      },
      {
        name: 'externalRequestId',
        type: 'string',
        label: intl
          .get(`${prefix}.model.interfaceMointoringWork.externalRequestId`)
          .d('外部请求编号'),
      },
      {
        name: 'creationDateFrom',
        type: 'dateTime',
        label: intl.get(`${prefix}.model.interfaceMointoringWork.creationDateFrom`).d('时间从'),
        defaultValue: preDate,
        required: true,
        max: 'creationDateTo',
      },
      {
        name: 'creationDateTo',
        type: 'dateTime',
        label: intl.get(`${prefix}.model.interfaceMointoringWork.creationDateTo`).d('时间至'),
        min: 'creationDateFrom',
      },
      {
        name: 'errorFlag',
        type: 'string',
        label: intl.get(`${prefix}.model.interfaceMointoringWork.errorFlag`).d('是否出错'),
        lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'dataExecuteResult',
        type: 'string',
        label: intl
          .get(`${prefix}.model.interfaceMointoringWork.dataExecuteResult`)
          .d('数据执行情况'),
        lookupCode: 'SITF.DATA_EXECUTE_RESULT',
      },
    ],
  });

  byInterfaceRightDataQuery = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'batchNum',
        type: 'string',
        label: intl.get(`${prefix}.model.interfaceMointoringWork.batchNum`).d('批次号'),
      },
      {
        name: 'externalRequestId',
        type: 'string',
        label: intl
          .get(`${prefix}.model.interfaceMointoringWork.externalRequestId`)
          .d('外部请求编号'),
      },
      // {
      //   name: 'documentCode',
      //   type: 'string',
      //   label: intl.get(`${prefix}.model.interfaceMointoringWork.documentCode`).d('单据编号'),
      // },
      {
        name: 'status',
        type: 'string',
        label: intl.get(`${prefix}.model.interfaceMointoringWork.status`).d('状态'),
        lookupCode: 'SITF.BATCH_STATUS',
      },
      {
        name: 'creationDateFrom',
        type: 'dateTime',
        label: intl.get(`${prefix}.model.interfaceMointoringWork.creationDateFrom`).d('时间从'),
        defaultValue: preDate,
        required: true,
        max: 'creationDateTo',
      },
      {
        name: 'creationDateTo',
        type: 'dateTime',
        label: intl.get(`${prefix}.model.interfaceMointoringWork.creationDateTo`).d('时间至'),
        min: 'creationDateFrom',
      },
    ],
  });

  interfaceMessDataQuery = new DataSet({
    autoCreate: true,
    fields: [
      !isLevelFlag && {
        name: 'tenantIdLov',
        type: 'object',
        label: intl.get(`${prefix}.model.interfaceMointoringWork.tenantId`).d('租户名称'),
        lovCode: 'SITF.TENANT_PAGING',
        required: true,
        ignore: 'always',
      },
      {
        name: 'tenantId',
        bind: 'tenantIdLov.tenantId',
      },
      {
        name: 'invokeTypeList',
        type: 'string',
        label: intl.get(`${prefix}.model.interfaceMointoringWork.invokeType`).d('调用类型'),
        lookupCode: 'SITF.REQUEST_INVOKE_TYPE',
        multiple: true,
        transformRequest: value => (!isEmpty(value) ? value.join(',') : undefined),
      },
      {
        name: 'externalSystemCode',
        type: 'object',
        label: intl.get(`${prefix}.model.interfaceMointoringWork.externalSystemCode`).d('外部系统'),
        lovCode: 'SIFC.EXTERNAL_SYSTEM',
        dynamicProps: ({ record }) => {
          return {
            lovPara: { tenantId: record.get('tenantId') },
            disabled: isNil(record.get('tenantId')),
          };
        },
        transformRequest: value => (value ? value.externalSystemCode : undefined),
      },
      {
        name: 'batchNum',
        type: 'string',
        label: intl.get(`${prefix}.model.interfaceMointoringWork.batchNum`).d('批次号'),
      },
      {
        name: 'externalRequestId',
        type: 'string',
        label: intl
          .get(`${prefix}.model.interfaceMointoringWork.externalRequestId`)
          .d('外部请求编号'),
      },
      {
        name: 'interfaceIdLov',
        type: 'object',
        label: intl.get(`${prefix}.model.interfaceMointoringWork.interfaceName`).d('接口名称'),
        lovCode: 'SITF.INTERFACE',
        dynamicProps: ({ record }) => {
          return {
            lovPara: { tenantId: record.get('tenantId') || organizationId },
            disabled: !isLevelFlag && isNil(record.get('tenantId')),
          };
        },
        ignore: 'always',
      },
      {
        name: 'interfaceId',
        bind: 'interfaceIdLov.interfaceId',
      },
      {
        name: 'creationDateFrom',
        type: 'dateTime',
        label: intl.get(`${prefix}.model.interfaceMointoringWork.creationDateFrom`).d('时间从'),
        defaultValue: preDate,
        required: true,
        max: 'creationDateTo',
      },
      {
        name: 'creationDateTo',
        type: 'dateTime',
        label: intl.get(`${prefix}.model.interfaceMointoringWork.creationDateTo`).d('时间至'),
        min: 'creationDateFrom',
      },
      {
        name: 'requestUrl',
        type: 'string',
        label: intl.get(`${prefix}.model.interfaceMointoringWork.requestUrl`).d('请求url'),
      },
      {
        name: 'requestFunction',
        type: 'string',
        label: intl.get(`${prefix}.model.interfaceMointoringWork.requestFunction`).d('请求方法'),
      },
    ],
  });

  interfaceAbnormalDataQuery = new DataSet({
    autoCreate: true,
    fields: [
      !isLevelFlag && {
        name: 'tenantIdLov',
        type: 'object',
        label: intl.get(`${prefix}.model.interfaceMointoringWork.tenantId`).d('租户名称'),
        lovCode: 'SITF.TENANT_PAGING',
        required: true,
        ignore: 'always',
      },
      {
        name: 'tenantId',
        bind: 'tenantIdLov.tenantId',
      },
      {
        name: 'processStatus',
        type: 'string',
        label: intl.get(`${prefix}.model.interfaceMointoringWork.processStatus`).d('重试状态'),
        lookupCode: 'SITF.REQUEST_PROCESS_STATUS',
      },
      {
        name: 'limitType',
        type: 'string',
        label: intl.get(`${prefix}.model.interfaceMointoringWork.limitTypeNew`).d('异常类型'),
        lookupCode: 'SITF.REQUEST_LIMIT_TYPE',
      },
      {
        name: 'externalRequestId',
        type: 'string',
        label: intl
          .get(`${prefix}.model.interfaceMointoringWork.externalRequestId`)
          .d('外部请求编号'),
      },
      {
        name: 'interfaceCode',
        type: 'string',
        label: intl.get(`${prefix}.model.interfaceMointoringWork.interfaceCode`).d('接口编码'),
      },
      {
        name: 'creationDateFrom',
        type: 'dateTime',
        label: intl.get(`${prefix}.model.interfaceMointoringWork.creationDateFrom`).d('时间从'),
        defaultValue: preDate,
        required: true,
        max: 'creationDateTo',
      },
      {
        name: 'creationDateTo',
        type: 'dateTime',
        label: intl.get(`${prefix}.model.interfaceMointoringWork.creationDateTo`).d('时间至'),
        min: 'creationDateFrom',
      },
    ],
  });

  breakerCircuitDataDs = new DataSet(breakerCircuitData());

  byBatchDataDs = new DataSet({ ...byBatchData(), queryDataSet: this.byBatchDataQuery });

  byInterfaceRightDataDs = new DataSet({
    ...byInterfaceRightData(),
    queryDataSet: this.byInterfaceRightDataQuery,
  });

  byInterfaceLeftDataDs = new DataSet({
    ...byInterfaceLeftData(),
    events: {
      load: async ({ dataSet }) => {
        const { current } = dataSet || {};
        if (!isEmpty(current)) {
          this.jumpByInterfaceRight(current);
        }
      },
    },
  });

  interfaceMessDataDs = new DataSet({
    ...interfaceMessData(),
    queryDataSet: this.interfaceMessDataQuery,
  });

  interfaceAbnormalDataDs = new DataSet({
    ...interfaceAbnormalData(),
    queryDataSet: this.interfaceAbnormalDataQuery,
  });

  componentDidMount() {
    if (isLevelFlag) {
      this.byBatchDataDs.setQueryParameter('tenantId', organizationId);
      this.byInterfaceLeftDataDs.setQueryParameter('tenantId', organizationId);
      this.byInterfaceRightDataDs.setQueryParameter('tenantId', organizationId);
      this.interfaceMessDataDs.setQueryParameter('tenantId', organizationId);
      this.interfaceAbnormalDataDs.setQueryParameter('tenantId', organizationId);
    }
  }

  // 动态设置查询条件默认值
  @Bind()
  handleDealParams(type, record) {
    const {
      interfaceId,
      interfaceCode,
      interfaceName,
      tenantName,
      batchNum,
      externalRequestId,
      batchId,
      tenantId,
      creationDate,
    } = record.data;
    const { creationDateTo, creationDateFrom } =
      this.byBatchDataDs?.queryDataSet?.current?.data || {};
    const tenantIdLov = isLevelFlag ? undefined : { tenantId, tenantName };
    const interfaceIdLov = { interfaceId, interfaceCode, interfaceName };
    if (type === 'byInterface') {
      this.byInterfaceLeftDataDs.queryDataSet.current.set({
        tenantIdLov,
        interfaceIdLov,
      });
      this.byInterfaceRightDataDs.queryDataSet.current.set({
        batchNum,
        externalRequestId,
        creationDateFrom,
        creationDateTo,
      });
      this.byInterfaceRightDataDs.setQueryParameter('tenantId', tenantId);
      this.byInterfaceRightDataDs.setQueryParameter('interfaceId', interfaceId);
      this.byInterfaceLeftDataDs.setQueryParameter('batchId', batchId);
      this.byInterfaceLeftDataDs.query();
    } else {
      let creationDate$ = creationDate || creationDateFrom;
      creationDate$ = isNil(creationDate$) ? creationDate$ : moment(creationDate$).subtract(10, 'minutes').format('YYYY-MM-DD HH:mm:ss')
      this.interfaceMessDataDs.queryDataSet.current.set({
        batchNum,
        externalRequestId,
        creationDateFrom: creationDate$,
        creationDateTo,
        tenantIdLov,
        interfaceIdLov,
      });
      this.interfaceMessDataDs.setQueryParameter('batchId', batchId);
      this.interfaceMessDataDs.query();
    }
  }

  // 重试
  @Bind()
  async handleAutoRennw() {
    const { selected } = this.interfaceAbnormalDataDs;
    if (selected.length !== 1) {
      notification.warning({
        message: intl.get(`${prefix}.view.message.only.one.data`).d('每次仅可勾选一条数据重试!'),
      });
      return;
    }

    const someFlag = selected.every(
      record =>
        ['INTERCEPTED', 'FAILED'].includes(record.get('processStatus')) &&
        ['CONCURRENCY', 'FLOW_CONTROL_BREAK'].includes(record.get('limitType'))
    );
    if (!someFlag) {
      notification.warning({
        message: intl
          .get(`${prefix}.view.message.only.one.someFlag`)
          .d('不允许重试的数据不给勾选!'),
      });
      return;
    }

    const response = await fetchAutorenew(selected[0].toData());
    if (getResponse(response)) {
      notification.success();
      this.interfaceAbnormalDataDs.query();
    }
  }

  // 过滤数据
  @Bind()
  getQueryData(datas) {
    if (datas) {
      const data = Object.assign(datas);
      Object.keys(data).forEach(item => {
        if (!data[item]) {
          delete data[item];
        }
      });
      return data;
    }
  }

  @Bind()
  changeTab(key = '') {
    runInAction(() => {
      this.tabKey = key;
    });

    if (key === 'byBatch') {
      this.byBatchDataDs.query();
    } else if (key === 'byInterface') {
      this.byInterfaceLeftDataDs.query();
    } else if (key === 'interfaceAbnormal') {
      this.interfaceAbnormalDataDs.query();
    } else if (key === 'breakerCircuit') {
      this.breakerCircuitDataDs.setQueryParameter('itfSrcPlatform', 'SITF');
      this.breakerCircuitDataDs.setQueryParameter('organizationId', organizationId);
      this.breakerCircuitDataDs.query();
    } else {
      this.addSearchInterFaceMess({}, 0);
      this.interfaceMessDataDs.query();
    }
  }

  // 批次数据 => 接口查询导航
  @Bind()
  jumpBathData(record) {
    this.menuName = record.get('interfaceName');
    this.tabKey = 'byInterface';
    this.handleDealParams('byInterface', record);
  }

  @Bind()
  addSearchInterFaceMess(record, flag) {
    // 清除已插入的列
    this.newColumnsMess.forEach(item => {
      this.interfaceMessDataDs.queryDataSet.fields.delete(item);
    });
    const newColumnsMess = [];
    // 判断是否添加内容搜索框
    if (!isLevelFlag && flag === 0) {
      return;
    }
    fetchSearch(isLevelFlag ? organizationId : record.get('tenantId')).then(res => {
      if (res === 'ES') {
        this.interfaceMessDataDs.queryDataSet.addField('dataContentSearch', {
          name: 'dataContentSearch',
          label: intl
            .get(`${prefix}.view.model.interfaceMointoringWork.dataContentSearch`)
            .d('内容搜索'),
          type: 'string',
        });
        newColumnsMess.push('dataContentSearch');
      }
    });
    this.newColumnsMess = newColumnsMess;
  }

  // 报文详情 => 接口报文查询
  @Bind()
  jumpInterFaceMess(record) {
    this.tabKey = 'interfaceMessage';
    this.handleDealParams('interfaceMessage', record);
    this.addSearchInterFaceMess(record);
  }

  // 动态插入列和查询条件
  @Bind()
  dynamicInsertion(record) {
    // 清除已插入的列
    this.newColumnsAll.forEach(item => {
      this.byInterfaceRightDataDs.queryDataSet.fields.delete(item);
    });
    const newColumns = [];
    const newOneColumns = [];
    const currentData = {
      tenantId: record.get('tenantId'),
      interfaceId: record.get('interfaceId'),
    };
    // 判断是否添加内容搜索框
    fetchSearch(currentData.tenantId).then(res => {
      if (res === 'ES') {
        this.byInterfaceRightDataDs.queryDataSet.addField('dataContentSearch', {
          name: 'dataContentSearch',
          label: intl
            .get(`${prefix}.view.model.interfaceMointoringWork.dataContentSearch`)
            .d('内容搜索'),
          type: 'string',
        });
        newColumns.push('dataContentSearch');
      }
    });
    // 加入动态列
    fetchByInterDaceRight(currentData).then(res => {
      const columnsRight = [];
      if (res && !isEmpty(res.content)) {
        res.content.forEach(item => {
          this.byInterfaceRightDataDs.addField(item.reservedField, {
            name: item.reservedField,
            label: item.fieldDesc,
            type: 'string',
          });
          // 只插入documentCode查询条件
          if (item.reservedField === 'documentCode') {
            this.byInterfaceRightDataDs.queryDataSet.addField(item.reservedField, {
              name: item.reservedField,
              label: item.fieldDesc,
              type: 'string',
            });
          }
          columnsRight.push({
            name: item.reservedField,
          });
          newOneColumns.push(item.reservedField);
        });
      }
      runInAction(() => {
        this.columnsRight = columnsRight;
        this.newColumnsAll = [...newColumns, ...newOneColumns];
      });
    });
  }

  // 接口查询编码 => 接口查询明细
  @Bind()
  jumpByInterfaceRight(record) {
    this.menuName = record.get('interfaceName');
    this.dynamicInsertion(record);
    this.byInterfaceRightDataDs.setQueryParameter('batchId', record.get('batchId'));
    this.byInterfaceRightDataDs.setQueryParameter('interfaceId', record.get('interfaceId'));
    this.byInterfaceRightDataDs.setQueryParameter('tenantId', record.get('tenantId'));
    this.byInterfaceRightDataDs.query();
  }

  // 复制文本
  @Bind()
  handleCopy(text) {
    const input = document.createElement('input');
    input.style.cssText = 'opacity: 0;';
    input.type = 'text';
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    notification.success({
      message: intl.get(`${prefix}.view.message.copySuccess`).d('复制成功!'),
    });
  }

  // 接口数据明细
  @Bind()
  openContentDatalis(record, name, contentId) {
    const currantData = {
      contentId,
      tenantId: record.get('tenantId'),
    };
    fetchContentDetails(currantData).then(res => {
      if (res && !res.failed) {
        if (res.contentDownload) {
          const { dataSource, tenantId, dataSourceId } = res;
          const api = isLevelFlag
            ? `${SRM_INTERFACE}/v1/${organizationId}/data-contents/download`
            : `${SRM_INTERFACE}/v1/data-contents/download`;
          const queryParams = [
            { name: 'sourceId', value: dataSourceId },
            { name: 'dataSource', value: dataSource },
            { name: 'contentId', value: contentId },
            { name: 'tenantId', value: tenantId },
          ];
          downloadFile({ requestUrl: api, queryParams });
        } else {
          let title = '';
          switch (name) {
            case 'requestBody':
              title = intl
                .get(`${prefix}.model.interfaceMointoringWork.requestHBody`)
                .d('请求body');
              break;
            case 'requestParameter':
              title = intl
                .get(`${prefix}.model.interfaceMointoringWork.requestParams`)
                .d('请求参数');
              break;
            case 'responseBody':
              title = intl
                .get(`${prefix}.model.interfaceMointoringWork.feedbackMessage`)
                .d('反馈报文');
              break;
            case 'contentId':
              title = intl.get(`${prefix}.model.interfaceMointoringWork.contentId`).d('数据详情');
              break;
            default:
              title = intl
                .get(`${prefix}.model.interfaceMointoringWork.requestHeaxer`)
                .d('请求header');
              break;
          }
          Modal.open({
            title,
            children: (
              <div style={{ marginTop: '-10px' }}>
                <div style={{ textAlign: 'right', marginBottom: '6px' }}>
                  <Button onClick={() => this.handleCopy(res.content)} size="small">
                    {intl.get(`${prefix}.view.title.copyText`).d('复制文本')}
                  </Button>
                </div>
                <p id="sitf_copy_text">{res.content}</p>
              </div>
            ),
            footer: null,
            closable: true,
          });
        }
      } else {
        notification.warning({
          message: res?.message || intl.get(`${prefix}.view.message.noDetalis`).d('暂无详情!'),
        });
      }
    });
  }

  // 查看详情
  @Bind()
  openModalDetails(value) {
    Modal.open({
      title: intl.get(`${prefix}.model.interfaceMointoringWork.errorMessage`).d('错误消息'),
      children: <span>{value}</span>,
      closable: true,
      footer: null,
    });
  }

  // 重新执行
  @Bind()
  async handleReExecute() {
    const selectedData = this.byBatchDataDs.selected.map(item => item.data);
    if (isEmpty(selectedData)) {
      notification.warning({
        message: intl.get('scux.common.message.selectedWarning').d('请先勾选数据!'),
      });
    } else {
      const res = await fetchReExecute(selectedData);
      try {
        if (getResponse(res)) {
          notification.success();
          this.byBatchDataDs.query();
        }
      } catch (error) {
        throw error;
      }
    }
  }

  // 重置
  @Bind()
  handleReset() {
    if (this.tabKey === 'byInterface') {
      this.byInterfaceRightDataDs.queryDataSet.reset();
    } else if (this.tabKey === 'interfaceMessage') {
      this.interfaceMessDataDs.queryDataSet.reset();
    } else if (this.tabKey === 'interfaceAbnormal') {
      this.interfaceAbnormalDataDs.queryDataSet.reset();
    } else if (this.tabKey === 'breakerCircuit') {
      this.breakerCircuitDataDs.queryDataSet.reset();
    } else {
      this.byBatchDataDs.queryDataSet.reset();
    }
  }

  // 查询
  @Bind()
  async handleSearch() {
    if (this.tabKey === 'byInterface') {
      this.byInterfaceRightDataDs.query();
    } else if (this.tabKey === 'interfaceMessage') {
      this.interfaceMessDataDs.query();
    } else if (this.tabKey === 'interfaceAbnormal') {
      this.interfaceAbnormalDataDs.query();
    } else if (this.tabKey === 'breakerCircuit') {
      this.breakerCircuitDataDs.query();
    } else {
      this.byBatchDataDs.query();
    }
  }

  // 处理侧滑
  @Bind()
  handleArrow() {
    runInAction(() => {
      this.iconFlag = !this.iconFlag;
      this.classname = this.iconFlag ? '' : 'sitf-table-bar-arrow';
    });
  }

  render() {
    const queryParams = this.getQueryData(
      this.byInterfaceRightDataDs.queryDataSet.current.toJSONData()
    );
    const { tenantId, interfaceId } = this.byInterfaceRightDataDs.current
      ? this.byInterfaceRightDataDs.current.data
      : {};
    const colors = {
      NEW: 'gray',
      RUNNNING: 'geekblue',
      ERROR: 'red',
      SUCCESS: 'green',
      PART: 'orange',
      FAILED: 'red',
    };
    const columns = [
      {
        name: 'externalSystemCode',
        width: 120,
      },
      {
        name: 'interfaceCode',
      },
      {
        name: 'interfaceName',
      },
      {
        name: 'traceId',
      },
      {
        name: 'batchNum',
        width: 80,
      },
      {
        name: 'externalRequestId',
      },
      {
        name: 'status',
        width: 80,
        align: 'center',
        renderer: ({ value, record }) => {
          return <Tag color={value ? colors[value] : '#ffffff'}>{record.get('statusMeaning')}</Tag>;
        },
      },
      {
        name: 'errorMessage',
        renderer: ({ value }) =>
          value && (
            <a onClick={() => this.openModalDetails(value, 'errorMessage')}>
              {intl.get(`${prefix}.model.interfaceMointoringWork.errorMessage`).d('错误消息')}
            </a>
          ),
      },
      {
        name: 'dataExecuteResultMeaning',
        align: 'center',
        renderer: ({ value, record }) => {
          const dataExcuteResult = record.get('dataExecuteResult');
          return <Tag color={dataExcuteResult ? colors[dataExcuteResult] : '#ffffff'}>{value}</Tag>;
        },
      },
      {
        name: 'errorRunTimes',
        align: 'center',
        width: 80,
      },
      {
        name: 'creationDate',
        width: 150,
      },
      {
        header: intl.get(`${prefix}.model.interfaceMointoringWork.bathData`).d('批次数据'),
        width: 80,
        lock: 'right',
        renderer: ({ record }) => (
          <a onClick={() => this.jumpBathData(record)}>
            {intl.get(`${prefix}.model.interfaceMointoringWork.bathData`).d('批次数据')}
          </a>
        ),
      },
      {
        header: intl.get(`${prefix}.model.interfaceMointoringWork.interfaceMess`).d('接口报文'),
        width: 80,
        lock: 'right',
        renderer: ({ record }) => (
          <a onClick={() => this.jumpInterFaceMess(record)}>
            {intl.get(`${prefix}.model.interfaceMointoringWork.interfaceMess`).d('接口报文')}
          </a>
        ),
      },
    ];

    const byInterfaceLeftColumns = [
      {
        name: 'interfaceCode',
        renderer: ({ value, record }) => (
          <a onClick={() => this.jumpByInterfaceRight(record)}>{value}</a>
        ),
      },
      {
        name: 'interfaceName',
      },
    ];

    const byInterfaceRightColumns = [
      {
        name: 'traceId',
      },
      {
        name: 'batchNum',
      },
      {
        name: 'externalRequestId',
      },
      {
        name: 'statusMeaning',
        align: 'center',
        renderer: ({ value, record }) => {
          const statusCurrent = record.get('status');
          return <Tag color={statusCurrent ? colors[statusCurrent] : '#ffffff'}>{value}</Tag>;
        },
      },
      {
        name: 'errorMessage',
        renderer: ({ value }) =>
          value && (
            <a onClick={() => this.openModalDetails(value, 'errorMessage')}>
              {intl.get(`${prefix}.model.interfaceMointoringWork.errorMessage`).d('错误消息')}
            </a>
          ),
      },
      ...this.columnsRight,
      {
        name: 'contentId',
        width: 80,
        renderer: ({ value, record }) => (
          <a onClick={() => this.openContentDatalis(record, 'contentId', value)}>
            {intl.get(`${prefix}.model.interfaceMointoringWork.contentId`).d('数据详情')}
          </a>
        ),
      },
      {
        header: intl.get(`${prefix}.model.interfaceMointoringWork.interfaceMess`).d('接口报文'),
        width: 80,
        renderer: ({ record }) => (
          <a onClick={() => this.jumpInterFaceMess(record)}>
            {intl.get(`${prefix}.model.interfaceMointoringWork.interfaceMess`).d('接口报文')}
          </a>
        ),
      },
      {
        name: 'creationDate',
      },
      {
        name: 'lastUpdateDate',
      },
      {
        name: 'errorTypeMeaning',
      },
      {
        name: 'errorRunTimes',
      },
    ];

    const interfaceMessColumns = [
      {
        name: 'invokeTypeMeaning',
      },
      {
        name: 'externalSystemCode',
      },
      {
        name: 'traceId',
      },
      {
        name: 'batchNum',
      },
      {
        name: 'externalRequestId',
      },
      {
        name: 'interfaceCode',
      },
      {
        name: 'interfaceName',
      },
      {
        name: 'requestUrl',
      },
      {
        name: 'requestFunction',
      },
      {
        name: 'requestMethod',
      },
      {
        name: 'requestHeader',
        width: 90,
        renderer: ({ value, record }) =>
          value && (
            <a onClick={() => this.openContentDatalis(record, 'requestHeader', value)}>
              {intl.get(`${prefix}.model.interfaceMointoringWork.requestHeaxer`).d('请求header')}
            </a>
          ),
      },
      {
        name: 'requestBody',
        width: 80,
        renderer: ({ value, record }) =>
          value && (
            <a onClick={() => this.openContentDatalis(record, 'requestBody', value)}>
              {intl.get(`${prefix}.model.interfaceMointoringWork.requestHBody`).d('请求body')}
            </a>
          ),
      },
      {
        name: 'requestParameter',
        width: 80,
        renderer: ({ value, record }) =>
          value && (
            <a onClick={() => this.openContentDatalis(record, 'requestParameter', value)}>
              {intl.get(`${prefix}.model.interfaceMointoringWork.requestParams`).d('请求参数')}
            </a>
          ),
      },
      {
        name: 'responseBody',
        width: 80,
        renderer: ({ value, record }) =>
          value && (
            <a onClick={() => this.openContentDatalis(record, 'responseBody', value)}>
              {intl.get(`${prefix}.model.interfaceMointoringWork.feedbackMessage`).d('反馈报文')}
            </a>
          ),
      },
      {
        name: 'creationDate',
      },
      {
        name: 'clientPort',
      },
      {
        name: 'clientIp',
      },
    ];

    const interfaceAbnormalColumns = [
      {
        name: 'processStatus',
      },
      {
        name: 'limitType',
      },
      {
        name: 'externalSystemCode',
      },
      {
        name: 'traceId',
      },
      {
        name: 'batchNum',
      },
      {
        name: 'externalRequestId',
      },
      {
        name: 'interfaceCode',
      },
      {
        name: 'interfaceName',
      },
      {
        name: 'requestUrl',
      },
      {
        name: 'requestFunction',
      },
      {
        name: 'requestMethod',
      },
      {
        name: 'requestHeader',
        width: 90,
        renderer: ({ value, record }) =>
          value && (
            <a onClick={() => this.openContentDatalis(record, 'requestHeader', value)}>
              {intl.get(`${prefix}.model.interfaceMointoringWork.requestHeaxer`).d('请求header')}
            </a>
          ),
      },
      {
        name: 'requestBody',
        width: 80,
        renderer: ({ value, record }) =>
          value && (
            <a onClick={() => this.openContentDatalis(record, 'requestBody', value)}>
              {intl.get(`${prefix}.model.interfaceMointoringWork.requestHBody`).d('请求body')}
            </a>
          ),
      },
      {
        name: 'requestParameter',
        width: 80,
        renderer: ({ value, record }) =>
          value && (
            <a onClick={() => this.openContentDatalis(record, 'requestParameter', value)}>
              {intl.get(`${prefix}.model.interfaceMointoringWork.requestParams`).d('请求参数')}
            </a>
          ),
      },
      {
        name: 'responseBody',
        width: 80,
        renderer: ({ value, record }) =>
          value && (
            <a onClick={() => this.openContentDatalis(record, 'responseBody', value)}>
              {intl.get(`${prefix}.model.interfaceMointoringWork.feedbackMessage`).d('反馈报文')}
            </a>
          ),
      },
      {
        name: 'creationDate',
      },
      {
        name: 'clientPort',
      },
      {
        name: 'clientIp',
      },
    ];

    // 接口限流详情
    const handleOpenInterfaceDetails = record => {
      Modal.open({
        title: intl.get(`${prefix}.model.interfaceFlowControl.details`).d('接口限流详情'),
        drawer: true,
        footer: null,
        style: { width: 800 },
        children: (
          <InterfaceFlowControlDetails
            dataSource={record.toData()}
            dataSetSource={this.breakerCircuitDataDs}
            rederOnly={!false}
            itfSrcPlatform={record.get('itfSrcPlatform')}
          />
        ),
      });
    };

    // 熔断详情
    const handleOpenCircuitDetails = record => {
      const circuitDetailsDataDs = new DataSet(circuitDetailsData());
      circuitDetailsDataDs.setQueryParameter('tenantId', record.get('tenantId'));
      circuitDetailsDataDs.setQueryParameter('itfSrcPlatform', record.get('itfSrcPlatform'));
      circuitDetailsDataDs.setQueryParameter('interfaceId', record.get('interfaceId'));
      circuitDetailsDataDs.query();
      Modal.open({
        title: intl.get(`${prefix}.model.interfaceFlowControl.circuit.details`).d('熔断详情'),
        closable: true,
        style: { width: 800 },
        drawer: true,
        footer: null,
        children: (
          <>
            <span>
              {intl.get(`${prefix}.model.number.circuit.breakers`).d('熔断次数')}{' '}
              {record.get('limitRecCount')} {intl.get(`${prefix}.model.number.order`).d('次')}
            </span>
            <Table dataSet={circuitDetailsDataDs} columns={cicuitColumns} />
          </>
        ),
      });
    };

    const breakerCircuitColumns = [
      {
        name: 'cnfStatusMeaning',
      },
      {
        name: 'interfaceCode',
      },
      {
        name: 'interfaceName',
      },
      {
        header: intl.get(`${prefix}.model.interfaceFlowControl.details`).d('接口限流详情'),
        renderer: ({ record }) => (
          <a onClick={() => handleOpenInterfaceDetails(record)}>
            {intl.get(`${prefix}.model.interfaceFlowControl.details`).d('接口限流详情')}
          </a>
        ),
      },
      {
        header: intl.get(`${prefix}.model.interfaceFlowControl.circuit.details`).d('熔断详情'),
        renderer: ({ record }) => (
          <a onClick={() => handleOpenCircuitDetails(record)}>
            {intl.get(`${prefix}.model.interfaceFlowControl.circuit.details`).d('熔断详情')}
          </a>
        ),
      },
      {
        name: 'limitRecCount',
      },
      {
        name: 'tenantName',
      },
      {
        name: 'createdRealName',
      },
      {
        name: 'creationDate',
      },
      {
        name: 'lastUpdatedRealName',
      },
      {
        name: 'lastUpdateDate',
      },
    ];

    const buttonRender = [
      <Button icon="undo" onClick={this.handleReset}>
        {intl.get(`${prefix}.view.button.reset`).d('重置')}
      </Button>,
      <Button icon="search" onClick={this.handleSearch}>
        {intl.get(`${prefix}.view.button.search`).d('查询')}
      </Button>,
    ];

    return (
      <Fragment>
        <Header
          title={intl.get(`${prefix}.view.title.interfaceMointoringWork`).d('接口监控工作台')}
        />
        <Content>
          <Tabs animated={false} activeKey={this.tabKey} onChange={this.changeTab}>
            <TabPane tab={intl.get(`${prefix}.view.tab.byBatch`).d('按批次查询')} key="byBatch">
              <Table
                dataSet={this.byBatchDataDs}
                columns={columns}
                queryFieldsLimit={8}
                queryBar="filterBar"
                className={styles['sitf-table-bar']}
                buttons={[
                  <PermissionButton
                    icon="retweet"
                    className="c7n-pro-btn-wrapper c7n-pro-btn c7n-pro-btn-flat c7n-pro-btn-primary dispalyBorder"
                    onClick={this.handleReExecute}
                    permissionList={[
                      {
                        code: isLevelFlag
                          ? `srm.sitf.itf-setup.org.interface-monitoring-workbench.button.data-rerun`
                          : `srm.sitf.itf-setup.interface-monitoring-workbench.button.data-rerun`,
                        type: 'button',
                        meaning:
                          intl
                            .get(`${prefix}.view.message.interfaceMointoringWork`)
                            .d('接口监控工作台') -
                          intl.get(`${prefix}.view.button.reExecute`).d('重新执行'),
                      },
                    ]}
                  >
                    {intl.get(`${prefix}.view.button.reExecute`).d('重新执行')}
                  </PermissionButton>,
                  ...buttonRender,
                ]}
              />
            </TabPane>
            <TabPane
              tab={intl.get(`${prefix}.view.tab.byInterface`).d('按接口查询')}
              key="byInterface"
              className={styles['sitf-tabpane']}
            >
              <Card className={this.classname}>
                <Table
                  dataSet={this.byInterfaceLeftDataDs}
                  columns={byInterfaceLeftColumns}
                  queryFieldsLimit={2}
                  queryBar="filterBar"
                  className={styles['sitf-table-bar']}
                />
              </Card>
              <Card>
                <Icon
                  type={this.iconFlag ? 'navigate_before' : 'navigate_next'}
                  onClick={this.handleArrow}
                  className="iconArrow"
                />
                <Table
                  dataSet={this.byInterfaceRightDataDs}
                  columns={byInterfaceRightColumns}
                  queryBar="filterBar"
                  queryFieldsLimit={50}
                  className={styles['sitf-table-bar']}
                  buttons={[
                    <ExcelExport
                      buttonText={intl.get(`hzero.common.button.export`).d('导出')}
                      requestUrl={
                        isLevelFlag
                          ? `${SRM_INTERFACE}/v1/${organizationId}/document-infos/export`
                          : `${SRM_INTERFACE}/v1/document-infos/export`
                      }
                      queryParams={{
                        ...queryParams,
                        tenantId,
                        interfaceId,
                      }}
                    />,
                    <Button icon="undo" onClick={this.handleReset}>
                      {intl.get(`${prefix}.view.button.reset`).d('重置')}
                    </Button>,
                    <Button icon="search" onClick={this.handleSearch} help={intl.get(`${prefix}.view.tab.queryHelp`).d('当使用内容搜索模糊匹配结果时，结果将不能翻页（仅查询第一页结果）。如需查看更多结果，请调整每页行数或使用其他条件（如时间）。')}>
                      {intl.get(`${prefix}.view.button.search`).d('查询')}
                    </Button>,
                    this.menuName && <Tag color="cyan-inverse">{this.menuName}</Tag>,
                  ]}
                />
              </Card>
            </TabPane>
            <TabPane
              tab={intl.get(`${prefix}.view.tab.interfaceMessage`).d('接口报文查询')}
              key="interfaceMessage"
            >
              <Table
                dataSet={this.interfaceMessDataDs}
                className={styles['sitf-table-bar']}
                columns={interfaceMessColumns}
                queryBar="filterBar"
                queryFieldsLimit={11}
                buttons={[
                  <Button icon="undo" onClick={this.handleReset}>
                    {intl.get(`${prefix}.view.button.reset`).d('重置')}
                  </Button>,
                  <Button icon="search" onClick={this.handleSearch} help={intl.get(`${prefix}.view.tab.queryHelp`).d('当使用内容搜索模糊匹配结果时，结果将不能翻页（仅查询第一页结果）。如需查看更多结果，请调整每页行数或使用其他条件（如时间）。')}>
                    {intl.get(`${prefix}.view.button.search`).d('查询')}
                  </Button>,
                ]}
              />
            </TabPane>
            <TabPane
              tab={intl.get(`${prefix}.view.tab.interfaceAbnormal`).d('异常调用查询')}
              key="interfaceAbnormal"
            >
              <Table
                dataSet={this.interfaceAbnormalDataDs}
                className={styles['sitf-table-bar']}
                columns={interfaceAbnormalColumns}
                queryBar="filterBar"
                queryFieldsLimit={11}
                buttons={[
                  <Button icon="autorenew" onClick={this.handleAutoRennw} funcType="flat">
                    {intl.get(`${prefix}.view.btn.retry`).d('重试')}
                  </Button>,
                  ...buttonRender,
                ]}
              />
            </TabPane>
            <TabPane
              tab={intl.get(`${prefix}.view.tab.breakerCircuit`).d('熔断纪录')}
              key="breakerCircuit"
            >
              <Table
                dataSet={this.breakerCircuitDataDs}
                className={styles['sitf-table-bar']}
                columns={breakerCircuitColumns}
                queryBar="filterBar"
                queryFieldsLimit={11}
                buttons={buttonRender}
              />
            </TabPane>
          </Tabs>
        </Content>
      </Fragment>
    );
  }
}
