import React, { Component } from 'react';
import { Form } from 'choerodon-ui/pro';

import cacheComponent from 'components/CacheComponent';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';
import intl from 'utils/intl';

import LovFilter from '@/components/Filter/LovFilter';
import DatePickerFilter from '@/components/Filter/DatePickerFilter';
import SelectFilter from '@/components/Filter/SelectFilter';
import Sort from '@/components/Filter/Sort';
import Tool from '@/components/Filter/tool';
import MutlTextFieldSearch from '@/components/MutlTextFieldSearch';
import styles from './index.less';

/**
 * 参与流程查询表单
 * @extends {Component} - React.Component
 * @reactProps {Function} search - 查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@cacheComponent({ cacheKey: '/hwfp/involved-task/list' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showFilterFlag: true,
    };
    props.onRef(this);
  }

  handleShowFilterFlag = () => {
    const { showFilterFlag } = this.state;
    this.setState({ showFilterFlag: !showFilterFlag });
  };

  onChangeSort = () => {
    const { formDs } = this.props;
    let sortCode = 'startedTime';
    let sortType = 'desc';
    if (formDs.current) {
      if (formDs.current.get('sortCode')) {
        sortCode = formDs.current.get('sortCode');
      }
      if (formDs.current.get('sortType')) {
        sortType = formDs.current.get('sortType');
      }
    }
    localStorage.setItem(
      `APPROVAL_LIST_INVOLVED_TASK_FILTER_SORT.${getCurrentOrganizationId()}.${getCurrentUserId()}`,
      JSON.stringify({ sortCode, sortType })
    );
  };

  /**
   * render
   * @returns React.element
   */
  render() {
    const { onSearch, formDs, processStatus = [] } = this.props;
    const { showFilterFlag } = this.state;
    const userLovData = {
      title: intl.get('hwfp.common.model.apply.owner').d('申请人'),
      filterName: 'startedUserLov',
      lovField: 'name',
      onSearch,
      dataSet: formDs,
      defaultValue: formDs?.current.get('startedUserLov') || '',
    };
    const createTimeData = {
      title: intl.get('hwfp.common.model.apply.date').d('申请日期'),
      startTitle: intl.get('hwfp.common.model.apply.date.from').d('申请日期从'),
      endTitle: intl.get('hwfp.common.model.apply.date.to').d('申请日期至'),
      filterName: 'startedTime',
      datePickerAfter: 'startedAfter',
      datePickerBefore: 'startedBefore',
      onSearch,
      dataSet: formDs,
      defaultValue: formDs?.current.get('startedTime') || '',
    };
    const approveData = {
      title: intl.get('hwfp.common.model.approval.time').d('审批时间'),
      startTitle: intl.get('hzero.common.date.approve.empLastApprovalTimeAfter').d('审批时间从'),
      endTitle: intl.get('hzero.common.date.approve.empLastApprovalTimeBefore').d('审批时间至'),
      filterName: 'empLastApprovalTime',
      datePickerAfter: 'empLastApprovalTimeAfter',
      datePickerBefore: 'empLastApprovalTimeBefore',
      onSearch,
      dataSet: formDs,
      defaultValue: formDs?.current.get('empLastApprovalTime') || '',
    };
    const processStatusList = processStatus.map((item) => ({
      title: item.meaning,
      value: item.value,
      key: item.value,
    }));
    const approveStatusData = {
      title: intl.get('hwfp.common.model.process.approvalStatus').d('审批状态'),
      filterName: 'processStatusList',
      selectList: processStatusList,
      onSearch,
      dataSet: formDs,
    };
    const selfApproveData = {
      title: intl.get('hwfp.common.model.process.selfApprove').d('本人审批单据'),
      filterName: 'practicalApprovalFlag',
      selectList: [{ title: intl.get('hzero.common.status.yes').d('是'), value: 1, key: 'yes' }],
      onSearch,
      dataSet: formDs,
    };
    const orderSelect = [
      { title: intl.get('hwfp.common.model.apply.date').d('申请日期'), value: 'startedTime' },
      {
        title: intl.get('hwfp.involvedTask.model.involvedTask.endTime').d('结束时间'),
        value: 'endTime',
      },
      {
        title: intl.get('hwfp.common.model.approval.time').d('审批时间'),
        value: 'empLastApprovalTime',
      },
    ];
    const orderData = {
      selectList: orderSelect,
      filterName: '',
      dataSet: formDs,
      onSearch,
      handleChange: this.onChangeSort,
    };
    const toolData = {
      formDs,
      onSearch,
      showFilterFlag,
      onShowFilterFlag: this.handleShowFilterFlag,
      clearButton: true,
      omitFields: ['sortCode', 'sortType'],
    };
    const departmentProps = {
      title: intl.get('hwfp.common.task.applyDepartment').d('申请部门'),
      filterName: 'startedUserUnitList',
      lovField: 'unitName',
      onSearch,
      dataSet: formDs,
      defaultValue: formDs?.current.get('startedUserUnitList') || '',
    };
    const assignLovProps = {
      title: intl.get('hwfp.common.view.message.handler').d('当前处理人'),
      filterName: 'assignLov',
      onSearch,
      dataSet: formDs,
      lovField: 'name',
      multiple: false,
      defaultValue: formDs?.current.get('assignLov') || '',
    };
    return (
      <div className={styles['filter-form']}>
        <Form
          style={{ flex: 'auto' }}
          // columns={3}
          dataSet={formDs}
          labelLayout="none"
        >
          <div className={styles['other-filter']}>
            <MutlTextFieldSearch
              dataSet={formDs}
              name="processSearch"
              placeholder={intl
                .get('hwfp.common.model.apply.queryKeyName')
                .d('请输入流程描述、名称、标识查询')}
              onSearch={onSearch}
            />
            <Tool {...toolData} />
            <Sort {...orderData} />
          </div>
          <div className={styles['other-filter']} style={{ display: showFilterFlag ? '' : 'none' }}>
            <LovFilter {...userLovData} />
            <LovFilter {...departmentProps} />
            {/* 创建日期 */}
            <DatePickerFilter {...createTimeData} />
            {/* 审批时间 */}
            <DatePickerFilter {...approveData} />
            <SelectFilter {...approveStatusData} />
            <SelectFilter {...selfApproveData} />
            <LovFilter {...assignLovProps} />
          </div>
        </Form>
      </div>
    );
  }
}
