/*
 * @Descripttion:
 * @Date: 2021-05-12 21:09:10
 * @Author: xshen <xia.shen@going-link.com>
 * @version:
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';
import LovFilter from '@/components/Filter/LovFilter';
import DatePickerFilter from '@/components/Filter/DatePickerFilter';
import SelectFilter from '@/components/Filter/SelectFilter';
import Tool from '@/components/Filter/tool';
import Sort from '@/components/Filter/Sort';
import MutlTextFieldSearch from '@/components/MutlTextFieldSearch';
import TextFieldFilter from '@/components/Filter/TextFieldFilter';
import styles from './index.less';

export default class ListTable extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      showFilterFlag: true,
    };
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
      `APPROVAL_LIST_TASK_FILTER_SORT.${getCurrentOrganizationId()}.${getCurrentUserId()}`,
      JSON.stringify({ sortCode, sortType })
    );
  };

  render() {
    const { onSearch, formDs, processTag } = this.props;
    const { showFilterFlag } = this.state;
    const userLovData = {
      title: intl.get('hwfp.common.model.apply.owner').d('申请人'),
      filterName: 'startedUserLov',
      lovField: 'name',
      onSearch,
      dataSet: formDs,
      defaultValue: formDs?.current.get('startedUserLov') || '',
    };
    const startedData = {
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

    const preNodeApprovalData = {
      title: intl.get('hwfp.common.view.preStage.approval.time').d('上一节点审批时间'),
      startTitle: intl.get('hzero.common.date.approve.empLastApprovalTimeAfter').d('审批时间从'),
      endTitle: intl.get('hzero.common.date.approve.empLastApprovalTimeBefore').d('审批时间至'),
      filterName: 'createdTime',
      datePickerAfter: 'createdAfter',
      datePickerBefore: 'createdBefore',
      onSearch,
      dataSet: formDs,
      defaultValue: formDs?.current.get('createdTime') || '',
    };

    const toolData = {
      formDs,
      onSearch,
      showFilterFlag,
      onShowFilterFlag: this.handleShowFilterFlag,
    };
    // 是否加急下拉框
    const flagList = [
      { title: intl.get('hzero.common.button.yes').d('是'), value: 1, key: 1 },
      { title: intl.get('hzero.common.button.no').d('否'), value: 0, key: 0 },
    ];
    const nameData = {
      title: intl.get('hwfp.common.view.message.current.stage').d('当前节点'),
      filterName: 'name',
      onSearch,
      dataSet: formDs,
      defaultValue: formDs && formDs.current ? formDs.current.get('startedUserUnitList') : '',
      placeholder: intl
        .get('hwfp.common.approval.filter.textFieldFilter.placeholder')
        .d('请输入当前节点名称'),
    };
    const rushData = {
      title: intl.get('hzero.common.view.title.isRush').d('是否加急'),
      filterName: 'rushFlag',
      selectList: flagList,
      onSearch,
      dataSet: formDs,
    };
    const orderSelect = [
      { title: intl.get('hwfp.common.model.apply.date').d('申请日期'), value: 'startedTime' },
      { title: intl.get('hwfp.common.sort.by.stay').d('停留时长'), value: 'createdTime' },
    ];
    const orderData = {
      selectList: orderSelect,
      filterName: '',
      dataSet: formDs,
      onSearch,
      handleChange: this.onChangeSort,
    };
    const departmentProps = {
      title: intl.get('hwfp.common.task.applyDepartment').d('申请部门'),
      filterName: 'startedUserUnitList',
      lovField: 'unitName',
      onSearch,
      dataSet: formDs,
      defaultValue: formDs?.current.get('startedUserUnitList') || '',
    };
    const labelData = {
      title: intl.get('hwfp.common.view.message.current.label').d('标签'),
      filterName: 'labelIdList',
      selectList: processTag
        ? [
            {
              title: intl.get('hwfp.common.label.not_exists').d('为空'),
              value: -1,
              key: '_empty',
            },
          ].concat(
            processTag.map((tag) => ({
              title: tag.description,
              value: tag.labelId,
              key: tag.labelId,
            }))
          )
        : [
            {
              title: intl.get('hwfp.common.label.not_exists').d('为空'),
              value: -1,
              key: '_empty',
            },
          ],
      onSearch,
      dataSet: formDs,
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
          <div
            className={styles['other-filter']}
            style={{ display: showFilterFlag ? '' : 'none', flexWrap: 'wrap' }}
          >
            <LovFilter {...userLovData} />
            <LovFilter {...departmentProps} />
            <DatePickerFilter {...startedData} />
            <SelectFilter {...rushData} />
            <TextFieldFilter {...nameData} />
            <DatePickerFilter {...preNodeApprovalData} />
            <SelectFilter {...labelData} />
          </div>
        </Form>
      </div>
    );
  }
}
