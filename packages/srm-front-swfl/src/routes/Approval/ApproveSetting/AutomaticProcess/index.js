import React, { Component } from 'react';
import { connect } from 'dva';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { isEmpty, isNil, omit } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import classnames from 'classnames';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import withProps from 'utils/withProps';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { queryMapIdpValue } from 'services/api';
import { queryDelegateSet } from '@/services/delegateService';
import { listFormDS, listTableDS } from '@/stores/automaticProcessDS';
import { getCheckDelegateMessage } from '@/utils/util';

import FilterForm from './FilterForm';
import List from './List';
import Drawer from './Modal';
import styles from '../index.less';

@formatterCollections({ code: ['hwfp.automaticProcess', 'hwfp.common', 'srm.filterBar'] })
@withProps(() => {
  const formDs = new DataSet(listFormDS());
  const tableDs = new DataSet(listTableDS());
  return { formDs, tableDs };
}, {})
@connect(({ loading }) => ({
  fetchProcessListLoading: loading.effects['automaticProcess/fetchProcessList'],
  removeProcessLoading: loading.effects['automaticProcess/removeProcess'],
  modifyProcessLoading: loading.effects['automaticProcess/modifyProcess'],
  addProcessLoading: loading.effects['automaticProcess/addProcess'],
}))
export default class AutomaticProcess extends Component {
  form;

  constructor(props) {
    super(props);
    this.state = {
      selectedLines: [], // 选择的行数据主键
      selectedLinesData: [], // 选择菜单行数据
      // processList: [], // 流程数据
      // processListPagination: {}, // 流程数据分页对象
      isBatchEdit: false, // 是否批量编辑标识
      processtimeOutOptions: [], // 侧滑编辑框超时单位值集数据
      autoDelegateConfigTip: undefined,
    };
  }

  componentDidMount() {
    this.fetchProcessList();
    this.fetchLovData();
    this.fetchDelegateProcess();
    // 监听表格事件
    this.props.tableDs.addEventListener('select', this.handleSelect);
    this.props.tableDs.addEventListener('unSelect', this.handleSelect);
    this.props.tableDs.addEventListener('selectAll', this.handleSelect);
    this.props.tableDs.addEventListener('unSelectAll', this.handleSelect);
  }

  @Bind()
  fetchLovData() {
    queryMapIdpValue({
      processtimeOutOptions: 'HWFP.TIMEOUT_UNIT',
    }).then((res) => {
      if (res) {
        this.setState({
          processtimeOutOptions: res.processtimeOutOptions || [],
        });
      }
    });
  }

  @Bind()
  fetchProcessList() {
    // 过滤条件
    let filterValues = isNil(this.props.formDs.current)
      ? {}
      : filterNullValueObject(this.props.formDs.current.toData());
    filterValues = omit(filterValues, ['__dirty']);
    this.props.tableDs.setQueryParameter('queryParams', {
      // ...filterValues,
      processKey: filterValues.keyOrName,
      processName: filterValues.keyOrName,
    });
    this.props.tableDs.query();
  }

  @Bind()
  fetchDelegateProcess() {
    queryDelegateSet({ organizationId: getCurrentOrganizationId() }).then((res) => {
      if (getResponse(res) && res && res.autoDelegateConfigTip) {
        this.setState({ autoDelegateConfigTip: res.autoDelegateConfigTip });
      }
    });
  }

  @Bind()
  deleteSelectedLines() {
    const { selectedLines, selectedLinesData = [] } = this.state;
    if (selectedLines.length === 0) {
      return;
    }
    this.props
      .dispatch({
        type: 'automaticProcess/removeProcess',
        params: selectedLinesData,
      })
      .then((res) => {
        if (isEmpty(res)) {
          notification.success();
          this.fetchProcessList();
          this.setState({
            selectedLines: [],
            selectedLinesData: [],
          });
        }
      });
  }

  @Bind()
  openBatchEditModal() {
    const { selectedLines = [] } = this.state;
    if (selectedLines.length === 0) {
      return;
    }
    this.setState(
      {
        isBatchEdit: true,
        modelEditData: [],
      },
      () => {
        this.openDrawer();
      }
    );
  }

  // 设置form
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  openEditModal(processInfo = {}) {
    this.setState(
      {
        isBatchEdit: false,
        modelEditData: isEmpty(processInfo) ? {} : processInfo.toData(),
      },
      () => {
        this.openDrawer();
      }
    );
  }

  @Bind()
  selectProcessLines(processLines = [], processLinesData = []) {
    this.setState({
      selectedLines: processLines,
      selectedLinesData: processLinesData,
    });
  }

  @Bind()
  closeModal() {
    this.setState({
      modelEditData: [],
    });
  }

  @Bind()
  async saveProcess(record) {
    const flag = await record.validate();
    if (!flag) {
      return false;
    }
    let params = record.toData();
    if (params.delegateActId) {
      params.delegateActId = params.delegateActId.join(',');
    }
    if (params.processCondition === 'FIXED_PERIOD') {
      if (params.processStartDate) {
        params.processStartDate = moment(params.processStartDate).format(DEFAULT_DATE_FORMAT);
      } else {
        params.processStartDate = moment().format(DEFAULT_DATE_FORMAT);
      }
      if (params.processEndDate) {
        params.processEndDate = moment(params.processEndDate).format(DEFAULT_DATE_FORMAT);
      }
      params = {
        ...params,
        processStartDate: params.processStartDate.concat(' 00:00:00'),
        processEndDate: params.processEndDate.concat(' 23:59:59'),
      };
    }
    if (params.delegateCode && params.delegateCode.employeeNum) {
      params.delegateCode = params.delegateCode.employeeNum;
    }
    const { isBatchEdit = false, modelEditData = {}, selectedLines = [] } = this.state;
    const { processKey, automaticId } = modelEditData;
    // 非批量编辑
    if (!isBatchEdit) {
      // 已存在automaticId 则是更新， 不存在则是新建
      if (automaticId) {
        const newParams = {
          ...modelEditData,
          ...params,
        };
        const res = await this.fetchModifyProcess(newParams);
        return res;
      } else {
        const newParams = {
          ...params,
          processKeyList: [processKey],
        };
        const res = await this.fetchAddProcess(newParams);
        return res;
      }
    } else {
      const newParams = {
        ...params,
        processKeyList: selectedLines,
      };
      const res = await this.fetchAddProcess(newParams);
      return res;
    }
  }

  @Bind()
  async fetchModifyProcess(params) {
    const res = await this.props.dispatch({
      type: 'automaticProcess/modifyProcess',
      params,
    });
    if (!isEmpty(res)) {
      notification.success();
      this.fetchProcessList();
      this.setState({
        selectedLines: [],
        selectedLinesData: [],
      });
      return true;
    }
    return false;
  }

  @Bind()
  async fetchAddProcess(params) {
    const res = await this.props.dispatch({
      type: 'automaticProcess/addProcess',
      params,
    });
    if (!isEmpty(res)) {
      notification.success();
      this.fetchProcessList();
      this.setState({
        selectedLines: [],
        selectedLinesData: [],
      });
      return;
    }
    return false;
  }

  // @Bind()
  // handleChangePagination(pagination) {
  //   this.setState({ processListPagination: pagination });
  //   this.fetchProcessList();
  // }

  @Bind()
  handleChangePagination() {
    this.fetchProcessList();
  }

  // 表格选中行
  handleSelect = ({ dataSet }) => {
    // 当前页已选
    const currentSelectedSize = dataSet.selected.length;
    const processLines = [];
    const processLinesData = [];
    for (let i = 0; i < currentSelectedSize; i++) {
      processLines.push(dataSet.selected[i].toData().processKey);
      processLinesData.push(dataSet.selected[i].toData());
    }
    this.setState({
      selectedLines: processLines,
      selectedLinesData: processLinesData,
    });
  };

  @Bind()
  openDrawer() {
    const { isBatchEdit, modelEditData = [], processtimeOutOptions = [] } = this.state;
    const editFormDs = new DataSet({
      fields: [
        {
          name: 'processName',
          label: intl.get('hwfp.automaticProcess.model.automaticProcess.processName').d('流程名称'),
        },
        {
          name: 'processCondition',
          label: intl.get('hwfp.automaticProcess.model.automaticProcess.condition').d('处理条件'),
          required: true,
          lookupCode: 'HWFP.PROCESS_CONDITION',
          dynamicProps: {
            help: ({ record, name }) => {
              if (!record) {
                return undefined;
              }
              const value = record.get(name);
              if (value === 'FIXED_PERIOD') {
                return intl
                  .get('hwfp.automaticProcess.view.help.fixedPeriod')
                  .d('固定期间：用户收到待办会立刻自动同意或自动转交');
              }
              if (value === 'TIME_OUT') {
                return intl
                  .get('hwfp.automaticProcess.view.help.timeout')
                  .d(
                    '超时时间：用户收到，定时任务执行没半小时执行一次，确定待办是否超过配置的“超时时间”，若超过待办则会按照处理规则制定待办的转交或者自动同意。'
                  );
              }
              return undefined;
            },
          },
        },
        {
          name: 'processRule',
          label: intl.get('hwfp.automaticProcess.model.automaticProcess.rule').d('处理规则'),
          required: true,
          lookupCode: 'HWFP.PROCESS_RULE',
        },
        {
          name: 'delegateActId',
          label: intl.get('hwfp.common.model.approval.processNode').d('审批节点'),
          multiple: true,
        },
        {
          name: 'enabledFlag',
          label: intl.get('hzero.common.status.enable').d('启用'),
          type: 'boolean',
          trueValue: 1,
          falseValue: 0,
        },
        {
          name: 'processStartDate',
          label: intl.get('hwfp.automaticProcess.model.automaticProcess.startDate').d('开始时间'),
          format: DEFAULT_DATE_FORMAT,
          dynamicProps: {
            required: ({ record }) => {
              return record.get('processCondition') === 'FIXED_PERIOD';
            },
          },
        },
        {
          name: 'processEndDate',
          label: intl
            .get('hwfp.automaticProcess.model.automaticProcess.processEndDate')
            .d('结束时间'),
          format: DEFAULT_DATE_FORMAT,
          dynamicProps: {
            required: ({ record }) => {
              return record.get('processCondition') === 'FIXED_PERIOD';
            },
          },
        },
        {
          name: 'timeoutValue',
          label: intl
            .get('hwfp.automaticProcess.model.automaticProcess.timeoutValue')
            .d('超时时间'),
          min: 0,
          dynamicProps: {
            required: ({ record }) => {
              return record.get('processCondition') === 'TIME_OUT';
            },
          },
        },
        {
          name: 'timeoutUnit',
          label: intl.get('hwfp.automaticProcess.model.automaticProcess.timeoutUnit').d('超时单位'),
          dynamicProps: {
            required: ({ record }) => {
              return record.get('processCondition') === 'TIME_OUT';
            },
          },
        },
        {
          name: 'delegateCode',
          label: intl.get('hwfp.automaticProcess.model.automaticProcess.delegater').d('转交人'),
          lovCode: 'HWFP.EMPLOYEE',
          type: 'object',
          lovPara: {
            tenantId: getCurrentOrganizationId(),
            enabledFlag: 1,
          },
          textField: 'name',
          valueField: 'employeeNum',
          dynamicProps: {
            required: ({ record }) => {
              return record.get('processRule') === 'AutoDelegate';
            },
          },
          validator: (value, name, record) => {
            if (
              record.get('processRule') === 'AutoDelegate' &&
              value &&
              !isNil(value.employeeNum)
            ) {
              return getCheckDelegateMessage(value.employeeNum);
            }
          },
        },
        {
          name: 'processRemark',
          label: intl
            .get('hwfp.automaticProcess.model.automaticProcess.processRemark')
            .d('处理意见'),
          maxLength: 100,
        },
        {
          name: 'hisDelegateFlag',
          type: 'boolean',
          trueValue: 1,
          falseValue: 0,
        },
      ],
      events: {
        update: ({ name, record }) => {
          if (name === 'processRule') {
            record.set('delegateActId', []);
          }
          if (['processCondition', 'processRule'].includes(name)) {
            record.set('hisDelegateFlag', undefined);
          }
        },
      },
    });
    const {
      processName,
      processCondition,
      enabledFlag,
      delegateActList,
      processRule,
      processStartDate,
      processEndDate,
      timeoutUnit,
      timeoutValue,
      delegateCode,
      delegateName,
      processRemark,
      hisDelegateFlag,
    } = modelEditData;
    const delegateActId = Array.isArray(delegateActList) ? delegateActList.map((n) => n.id) : [];
    const record = editFormDs.create();
    record.init('processName', isBatchEdit ? undefined : processName);
    record.init('processCondition', isBatchEdit ? undefined : processCondition);
    record.init('delegateActId', isBatchEdit ? undefined : delegateActId);
    record.init('enabledFlag', isBatchEdit ? 1 : enabledFlag || 0);
    record.init('processRule', isBatchEdit ? '' : processRule);
    record.init('hisDelegateFlag', isBatchEdit ? 0 : hisDelegateFlag);
    if (processCondition === 'FIXED_PERIOD') {
      record.init(
        'processStartDate',
        !isBatchEdit && !isNil(processStartDate)
          ? moment(processStartDate, DEFAULT_DATE_FORMAT)
          : undefined
      );
      record.init(
        'processEndDate',
        !isBatchEdit && !isNil(processEndDate)
          ? moment(processEndDate, DEFAULT_DATE_FORMAT)
          : undefined
      );
    } else if (processCondition === 'TIME_OUT') {
      record.init('timeoutValue', !isBatchEdit ? timeoutValue : '');
      record.init(
        'timeoutUnit',
        !isBatchEdit && timeoutUnit ? timeoutUnit : (processtimeOutOptions[0] || {}).value
      );
    }
    if (processRule === 'AutoDelegate') {
      record.init(
        'delegateCode',
        isBatchEdit ? undefined : { employeeNum: delegateCode, name: delegateName }
      );
    } else if (processRule === 'AutoApprove') {
      record.init('processRemark', isBatchEdit ? undefined : processRemark);
    }
    Modal.open({
      drawer: true,
      title: !isBatchEdit
        ? intl.get('hwfp.automaticProcess.view.message.title.editRule').d('编辑处理规则')
        : intl.get('hwfp.automaticProcess.view.message.title.batchEditRule').d('批量编辑处理规则'),
      style: { width: 400 },
      className: styles['modal-drawer'],
      children: (
        <Drawer
          record={record}
          isBatch={isBatchEdit}
          editData={modelEditData}
          handleClose={this.closeModal}
          processtimeOutOptions={processtimeOutOptions}
        />
      ),
      onOk: async () => {
        const res = await this.saveProcess(record);
        return res;
      },
    });
  }

  render() {
    const { selectedLines = [], autoDelegateConfigTip } = this.state;
    const { formDs, tableDs } = this.props;
    return (
      <div className={classnames(styles['automatic-process-content'], 'swfl-approval-workbench-automatic-process')}>
        <div
          style={{
            flex: '1',
            overflow: 'auto',
          }}
        >
          <Alert
            closable
            type="info"
            showIcon
            className={styles['automatic-process-alert']}
            description={
              <>
                <div>
                  {intl
                    .get('hwfp.common.view.message.automaticProcess.alert')
                    .d(
                      '提示：自动处理规则可配置一段时间/固定时间，你收到的对应流程自动审批通过，或配置自动转交给“转交人”进行审批；开启“未审批单据自动转交”。'
                    )}
                </div>
                {autoDelegateConfigTip && (
                  <div>
                    {intl.get('hwfp.common.view.label.remind').d('提醒')}：{autoDelegateConfigTip}
                  </div>
                )}
              </>
            }
          />
          <FilterForm
            selectedLines={selectedLines}
            bindRef={this.handleBindRef}
            onSearch={this.fetchProcessList}
            formDs={formDs}
            handleSelectProcessLines={this.selectProcessLines}
            deleteSelectedLines={this.deleteSelectedLines}
            openBatchEditModal={this.openBatchEditModal}
          />
          <List tableDs={tableDs} handleEdit={this.openEditModal} />
        </div>
        <div className={styles['automatic-process-content-footer']}>
          <Button onClick={this.props.handleCancel}>
            {intl.get('hwfp.common.model.apply.cancel').d('取消')}
          </Button>
        </div>
      </div>
    );
  }
}
