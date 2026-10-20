/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import classnames from 'classnames';
import { DataSet, Table, Pagination } from 'choerodon-ui/pro';
import { Modal, Tooltip, Spin } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, omit, uniqWith, isNil } from 'lodash';

import intl from 'utils/intl';

import { employeeTableDS } from '@/stores/oldTaskDS';

import styles from './index.less';

const rowKey = 'employeeId';

export default class EmployeeModal extends Component {
  constructor(props) {
    super(props);
    const { type, data } = props;

    const targetData = !isEmpty(data[type]) ? data[type] : [];
    targetData.forEach((item) => {
      // eslint-disable-next-line no-param-reassign
      item.isSelected = true;
    });
    let approveData = [];
    if (!isEmpty(data.AddSign)) {
      approveData = data.AddSign;
    } else if (!isEmpty(data.ApproveAndAddSign)) {
      approveData = data.ApproveAndAddSign;
    } else if (!isEmpty(data.delegate)) {
      approveData = data.delegate;
    }
    this.sourceTableDs = new DataSet({
      ...employeeTableDS(),
      selection: type !== 'delegate' ? 'multiple' : 'single',
    });
    this.targetTableDs = new DataSet({
      ...omit(employeeTableDS(), 'transport'),
      selection: type !== 'delegate' ? 'multiple' : 'single',
      data: targetData,
    });
    this.state = {
      approveData,
      targetData,
      targetTablePagination: {
        page: 1,
        size: 10,
      },
    };
  }

  componentDidMount() {
    const { startUser } = this.props;
    this.sourceTableDs.setQueryParameter('startUser', startUser || 'invalid');
    this.sourceTableDs.query();
    this.addDsListener();
  }

  @Bind()
  checkRecordsSelected({ dataSet }) {
    const { targetData = [], approveData = [] } = this.state;
    const { type, data } = this.props;
    const currentSourceData = dataSet.data;
    if (!isEmpty(currentSourceData)) {
      currentSourceData.forEach((sourceItem) => {
        if (!isEmpty(targetData)) {
          const item = targetData.find(
            (targetItem) => targetItem.get(rowKey) === sourceItem.get(rowKey)
          );
          if (item) {
            // eslint-disable-next-line no-param-reassign
            sourceItem.isSelected = true;
          }
        }
        // 转交、加签不能选择已添加抄送的员工,反之一样
        if (['AddSign', 'ApproveAndAddSign', 'delegate'].includes(type) && !isEmpty(data.addCc)) {
          const addCcItem = data.addCc.find((i) => i.get(rowKey) === sourceItem.get(rowKey));
          if (addCcItem) {
            // eslint-disable-next-line no-param-reassign
            sourceItem.selectable = false;
          }
        } else if (type === 'addCc') {
          if (!isEmpty(approveData)) {
            const approveItem = approveData.find((i) => i.get(rowKey) === sourceItem.get(rowKey));
            if (approveItem) {
              // eslint-disable-next-line no-param-reassign
              sourceItem.selectable = false;
            }
          }
        }
      });
    }
  }

  @Bind()
  addDsListener() {
    // 注册左侧右侧表格选择监听事件
    this.sourceTableDs.addEventListener('select', this.handleSourceSelected);
    this.sourceTableDs.addEventListener('unSelect', this.handleSourceSelected);
    this.sourceTableDs.addEventListener('selectAll', this.handleSourceSelected);
    this.sourceTableDs.addEventListener('unSelectAll', this.handleSourceSelected);
    this.targetTableDs.addEventListener('select', this.handleTargetSelected);
    this.targetTableDs.addEventListener('unSelect', this.handleTargetSelected);
    this.targetTableDs.addEventListener('selectAll', this.handleTargetSelected);
    this.targetTableDs.addEventListener('unSelectAll', this.handleTargetSelected);
    // 左侧表格加载数据时,校验行数据是否已选择到右侧
    this.sourceTableDs.addEventListener('load', this.checkRecordsSelected);
    this.sourceTableDs.addEventListener('query', this.checkRecordsSelected);
  }

  @Bind()
  handleTargetSelected() {
    const { targetData = [] } = this.state;
    let result = targetData.concat(this.sourceTableDs.data);
    // 去重
    result = uniqWith(result, (a, b) => a.get(rowKey) === b.get(rowKey));
    // 过滤掉选中数据
    result = result.filter((item) => item.isSelected);
    this.sourceTableDs.data.forEach((item) => {
      const targetItem = targetData.find((i) => i.get(rowKey) === item.get(rowKey));
      // eslint-disable-next-line no-param-reassign
      item.isSelected = !isNil(targetItem) && targetItem.isSelected;
    });
    this.setState(
      {
        targetData: result,
      },
      () => {
        this.loadCurrentTargetData();
      }
    );
  }

  @Bind()
  handleSourceSelected() {
    const { targetData = [] } = this.state;
    let result = this.sourceTableDs.data.concat(targetData);
    // 去重
    result = uniqWith(result, (a, b) => a.get(rowKey) === b.get(rowKey));
    // 过滤掉选中数据
    result = result.filter((item) => item.isSelected);
    const resultTargetData = [];
    result.forEach((item) => {
      const record = this.targetTableDs.create(item.toData());
      record.isSelected = true;
      resultTargetData.push(record);
    });
    this.setState(
      {
        targetData: resultTargetData,
      },
      () => {
        this.loadCurrentTargetData();
      }
    );
  }

  @Bind()
  loadCurrentTargetData() {
    const {
      targetData = [],
      targetTablePagination: { page, size },
    } = this.state;
    const allSize = targetData.length;
    let result = [];
    if (!isEmpty(targetData)) {
      let startIndex = (page - 1) * size;
      let endIndex = page * size;
      // 最后一页没数据时展示前一页
      if (startIndex >= allSize) {
        startIndex -= size;
        endIndex -= size;
        this.setState({
          targetTablePagination: { page: page - 1, size },
        });
      }
      result = targetData.slice(startIndex, endIndex);
    }
    this.targetTableDs.loadData(result);
  }

  @Bind()
  showColumnTooltip({ text }) {
    return <Tooltip title={text}>{text}</Tooltip>;
  }

  @Bind()
  getTableColumns() {
    return [
      { name: 'employeeNum', width: 100, renderer: this.showColumnTooltip },
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
  handleChangePagination(newPage, newSize) {
    const {
      targetTablePagination: { size },
    } = this.state;
    // 改变页行数时 更新右侧表格的pageSize
    if (size !== newSize) {
      this.targetTableDs.pageSize = newSize;
    }
    this.setState(
      {
        targetTablePagination: { page: newPage, size: newSize },
      },
      () => {
        this.loadCurrentTargetData();
      }
    );
  }

  render() {
    const {
      targetData = [],
      targetTablePagination: { page, size },
    } = this.state;
    const { onClose, fetchLoading, saveLoading, type } = this.props;
    return (
      <Modal
        title={
          // eslint-disable-next-line
          type === 'addCc'
            ? intl.get('hwfp.task.view.title.chooseCopyer').d('选择抄送人')
            : type === 'AddSign'
            ? intl.get('hwfp.task.view.title.chooseAddSigner').d('选择加签人')
            : type === 'delegate'
            ? intl.get('hwfp.task.view.title.chooseDelegater').d('选择转交人')
            : intl.get('hwfp.task.view.title.chooseApprover').d('选择审批人')
        }
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
        <Spin spinning={fetchLoading || saveLoading || false}>
          <div className={styles['modal-content']}>
            <div className={styles['modal-content-left']}>
              <Table
                dataSet={this.sourceTableDs}
                queryFieldsLimit={2}
                customizable={false}
                columns={this.getTableColumns()}
              />
            </div>
            <div className={styles['modal-content-right']}>
              <div className={styles['modal-content-right-title']}>
                {type === 'addCc'
                  ? intl.get('hwfp.task.view.message.haveChoosedCopyer').d('已选择的抄送人')
                  : type === 'AddSign'
                  ? intl.get('hwfp.task.view.message.haveChoosedAddSigner').d('已选择的加签人')
                  : type === 'delegate'
                  ? intl.get('hwfp.task.view.message.haveChoosedDelegater').d('已选择的转交人')
                  : intl.get('hwfp.task.view.message.haveChooseApprover').d('已选择的审批人')}
              </div>
              <Table
                dataSet={this.targetTableDs}
                queryFieldsLimit={2}
                queryBar="none"
                customizable={false}
                pagination={false}
                columns={this.getTableColumns()}
              />
              <Pagination
                total={targetData.length}
                page={page}
                pageSize={size}
                onChange={this.handleChangePagination}
                className={classnames(
                  'c7n-pro-table-pagination',
                  targetData.length === 0 && styles['c7n-pro-table-pagination-empty']
                )}
              />
            </div>
          </div>
        </Spin>
      </Modal>
    );
  }
}
