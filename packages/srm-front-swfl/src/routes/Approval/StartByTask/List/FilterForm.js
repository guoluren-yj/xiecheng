import React, { Component } from 'react';
import { Form } from 'choerodon-ui/pro';

import cacheComponent from 'components/CacheComponent';

import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';

import LovFilter from '@/components/Filter/LovFilter';
import DatePickerFilter from '@/components/Filter/DatePickerFilter';
import SelectFilter from '@/components/Filter/SelectFilter';
import Sort from '@/components/Filter/Sort';
import Tool from '@/components/Filter/tool';
import TextFieldFilter from '@/components/Filter/TextFieldFilter';

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
      `APPROVAL_LIST_START_TASK_FILTER_SORT.${getCurrentOrganizationId()}.${getCurrentUserId()}`,
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
      title: intl.get('hwfp.common.view.message.handler').d('当前处理人'),
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
      filterName: 'createdTime',
      datePickerAfter: 'startedAfter',
      datePickerBefore: 'startedBefore',
      onSearch,
      dataSet: formDs,
      defaultValue: formDs?.current.get('createdTime') || '',
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
    const orderSelect = [
      { title: intl.get('hwfp.common.model.apply.date').d('申请日期'), value: 'createdTime' },
      {
        title: intl.get('hwfp.involvedTask.model.involvedTask.endTime').d('结束时间'),
        value: 'endTime',
      },
    ];
    const orderData = {
      selectList: orderSelect,
      filterName: '',
      dataSet: formDs,
      onSearch,
      handleChange: this.onChangeSort,
    };
    // 是否加急下拉框
    const flagList = [
      { title: intl.get('hzero.common.button.yes').d('是'), value: 1, key: 1 },
      { title: intl.get('hzero.common.button.no').d('否'), value: 0, key: 0 },
    ];
    const rushData = {
      title: intl.get('hzero.common.view.title.isRush').d('是否加急'),
      filterName: 'rushFlag',
      selectList: flagList,
      onSearch,
      dataSet: formDs,
    };
    const toolData = {
      formDs,
      onSearch,
      showFilterFlag,
      onShowFilterFlag: this.handleShowFilterFlag,
    };
    const departmentProps = {
      title: intl.get('hwfp.common.current.department').d('当前处理部门'),
      filterName: 'assigneeUnitList',
      onSearch,
      lovField: 'unitName',
      dataSet: formDs,
      defaultValue: formDs?.current.get('assigneeUnitList') || '',
    };
    const nameData = {
      title: intl.get('hwfp.common.view.message.current.stage').d('当前节点'),
      filterName: 'currentNodeName',
      onSearch,
      dataSet: formDs,
      defaultValue: formDs && formDs.current ? formDs.current.get('startedUserUnitList') : '',
      placeholder: intl
        .get('hwfp.common.approval.filter.textFieldFilter.placeholder')
        .d('请输入当前节点名称'),
    };
    return (
      <div className={styles['filter-form']}>
        <Form style={{ flex: 'auto' }} dataSet={formDs} labelLayout="none">
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
            <TextFieldFilter {...nameData} />
            <DatePickerFilter {...createTimeData} />
            <SelectFilter {...approveStatusData} />
            <SelectFilter {...rushData} />
          </div>
        </Form>
      </div>
    );
  }
}
