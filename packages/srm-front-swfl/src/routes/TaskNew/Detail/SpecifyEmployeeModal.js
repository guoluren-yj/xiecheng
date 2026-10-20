import React, { Component } from 'react';
import { DataSet, Table, Button, Form } from 'choerodon-ui/pro';
import { Modal, Tooltip, Spin } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, omit, uniqWith } from 'lodash';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { specifyEmployeeTableDS } from '@/stores/oldTaskDS';

import styles from './index.less';

const rowKey = 'employeeId';

export default class SpecifyEmployeeModal extends Component {
  constructor(props) {
    super(props);
    const { targetData: data = {}, type, specifyEmployeeDataObj } = props;
    const targetData = !isEmpty(data[type]) ? data[type] : [];
    targetData.forEach((item) => {
      // eslint-disable-next-line no-param-reassign
      item.isSelected = true;
    });
    const queryAppointApproverFlag =
      specifyEmployeeDataObj &&
      (specifyEmployeeDataObj.appointApproverEmpStr ||
        specifyEmployeeDataObj.appointApproverPostStr ||
        specifyEmployeeDataObj.appointApproverRoleStr);
    this.sourceTableDs = new DataSet({
      ...omit(specifyEmployeeTableDS(), 'transport'),
      paging: queryAppointApproverFlag,
      pageSize: queryAppointApproverFlag ? 5 : undefined,
      cacheSelection: queryAppointApproverFlag,
      primaryKey: queryAppointApproverFlag ? rowKey : undefined,
      transport: !queryAppointApproverFlag
        ? undefined
        : {
            read: ({ dataSet }) => {
              const appointApproverEmpStr = dataSet.getState('appointApproverEmpStr') || '';
              const appointApproverPostStr = dataSet.getState('appointApproverPostStr') || '';
              const appointApproverRoleStr = dataSet.getState('appointApproverRoleStr') || '';
              return {
                url: `/hwfp/v1/${getCurrentOrganizationId()}/hr/appoint-approver/query?appointApproverEmpStr=${appointApproverEmpStr}&appointApproverPostStr=${appointApproverPostStr}&appointApproverRoleStr=${appointApproverRoleStr}`,
                method: 'GET',
              };
            },
          },
    });
    this.targetTableDs = new DataSet({
      ...omit(specifyEmployeeTableDS(), 'transport'),
      paging: false,
      data: targetData,
    });
    this.state = {
      targetData,
      queryAppointApproverFlag,
      queryLoading: false,
    };
  }

  componentDidMount() {
    this.addDsListener();
    this.initData();
  }

  @Bind()
  addDsListener() {
    // 注册左侧右侧表格选择监听事件
    this.sourceTableDs.addEventListener('select', this.handleSelected);
    this.sourceTableDs.addEventListener('unSelect', this.handleSelected);
    this.sourceTableDs.addEventListener('selectAll', this.handleSelected);
    this.sourceTableDs.addEventListener('unSelectAll', this.handleSelected);
    this.targetTableDs.addEventListener('select', this.handleSelected);
    this.targetTableDs.addEventListener('unSelect', this.handleSelected);
    this.targetTableDs.addEventListener('selectAll', this.handleSelected);
    this.targetTableDs.addEventListener('unSelectAll', this.handleSelected);
    // 左侧表格加载数据时,校验行数据是否已选择到右侧
    this.sourceTableDs.addEventListener('load', this.checkRecordsSelected);
  }

  @Bind()
  initData() {
    const { sourceData = [], specifyEmployeeDataObj } = this.props;
    if (sourceData && sourceData.length) {
      this.sourceTableDs.loadData(sourceData);
    } else if (specifyEmployeeDataObj) {
      const {
        appointApproverEmpStr,
        appointApproverPostStr,
        appointApproverRoleStr,
      } = specifyEmployeeDataObj;
      this.sourceTableDs.setState('appointApproverEmpStr', appointApproverEmpStr);
      this.sourceTableDs.setState('appointApproverPostStr', appointApproverPostStr);
      this.sourceTableDs.setState('appointApproverRoleStr', appointApproverRoleStr);
      this.sourceTableDs.query();
    }
  }

  @Bind()
  handleSelected() {
    const { targetData = [] } = this.state;

    // 将右侧也有数据和左侧选择数据合并
    // let result = this.sourceTableDs.data.concat(targetData);
    let result = targetData.concat(this.sourceTableDs.data);
    // 去重
    result = uniqWith(result, (a, b) => a.get(rowKey) === b.get(rowKey));
    // 过滤掉选中数据
    result = result.filter((item) => item.isSelected);
    this.setState(
      {
        targetData: result,
      },
      () => {
        this.sourceTableDs.loadData(this.sourceTableDs.data);
        this.loadCurrentTargetData();
      }
    );
  }

  @Bind()
  checkRecordsSelected({ dataSet }) {
    const { targetData = [] } = this.state;
    if (!isEmpty(targetData)) {
      const currentSourceData = dataSet.data;
      if (!isEmpty(currentSourceData)) {
        currentSourceData.forEach((sourceItem) => {
          const item = targetData.find(
            (targetItem) => targetItem.get(rowKey) === sourceItem.get(rowKey)
          );
          if (item) {
            // eslint-disable-next-line no-param-reassign
            sourceItem.isSelected = true;
          }
        });
      }
    }
  }

  @Bind()
  loadCurrentTargetData() {
    const { targetData = [] } = this.state;
    this.targetTableDs.loadData(targetData);
  }

  @Bind()
  showColumnTooltip({ text }) {
    return <Tooltip title={text}>{text}</Tooltip>;
  }

  @Bind()
  getTableColumns() {
    return [
      { name: 'employeeCode', width: 100, renderer: this.showColumnTooltip },
      { name: 'name', width: 150, renderer: this.showColumnTooltip },
      { name: 'unitName', width: 100, renderer: this.showColumnTooltip },
      { name: 'positionName', width: 150, renderer: this.showColumnTooltip },
    ];
  }

  @Bind()
  submit() {
    const { targetData = [] } = this.state;
    // if (isEmpty(targetData)) {
    //   notification.warning({
    //     message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
    //   });
    // } else {
    this.props.onAfterSubmit(targetData);
    // }
  }

  @Bind()
  handleSearch() {
    const { queryAppointApproverFlag } = this.state;
    if (queryAppointApproverFlag) {
      this.sourceTableDs.query();
    } else {
      const { sourceData = [] } = this.props;
      const { employeeCode, name } = this.sourceTableDs.queryDataSet.current.toData();
      let result = [];
      result = sourceData.filter((item) => {
        if (employeeCode && !item.employeeCode.includes(employeeCode)) {
          return false;
        } else if (name && !item.name.includes(name)) {
          return false;
        } else {
          return true;
        }
      });
      this.sourceTableDs.loadData(result);
    }
  }

  @Bind()
  handleQueryBar({ queryFields, dataSet, queryDataSet }) {
    return (
      <div>
        <div style={{ display: 'flex', marginBottom: '10px', alignItems: 'flex-start' }}>
          <Form
            style={{ flex: 'auto' }}
            columns={2}
            dataSet={queryDataSet}
            onKeyDown={(e) => {
              if (e.keyCode === 13) return this.handleSearch();
            }}
          >
            {queryFields}
          </Form>
          <div style={{ marginTop: '10px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            <Button
              onClick={() => {
                queryDataSet.current.reset();
                dataSet.fireEvent('queryBarReset', {
                  dataSet,
                  queryFields,
                });
              }}
            >
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
            <Button dataSet={null} color="primary" onClick={this.handleSearch}>
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { queryLoading } = this.state;
    const { onClose } = this.props;
    return (
      <Modal
        title={intl.get('hwfp.task.view.title.chooseApprover').d('选择审批人')}
        destroyOnClose
        visible
        center
        width={1200}
        className={styles['employee-drawer']}
        onOk={this.submit}
        okButtonProps={{ funcType: 'raised' }}
        cancelButtonProps={{ funcType: 'raised' }}
        onCancel={onClose}
      >
        <div className={styles['modal-content']}>
          <div className={styles['modal-content-left']}>
            <Spin spinning={queryLoading}>
              <Table
                dataSet={this.sourceTableDs}
                queryFieldsLimit={2}
                columns={this.getTableColumns()}
                queryBar={this.handleQueryBar}
                customizable={false}
              />
            </Spin>
          </div>
          <div className={styles['modal-content-right']}>
            <div className={styles['modal-content-right-title']}>
              {intl.get('hwfp.task.view.message.haveChooseApprover').d('已选择的审批人')}
            </div>
            <Table
              dataSet={this.targetTableDs}
              columns={this.getTableColumns()}
              queryBar="none"
              customizable={false}
            />
          </div>
        </div>
      </Modal>
    );
  }
}
