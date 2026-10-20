/**
 * routes 寻源立项-维护／详情/项目计划
 * @date: 2020-2-24
 * @author: meiqi.liu@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Select, DatePicker, Button, Table } from 'hzero-ui';
import { isFunction, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { TooltipButton } from '@/routes/components/TooltipButton';

import intl from 'utils/intl';
import { tableScrollWidth, getDateFormat } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import moment from 'moment';

import EditTable from 'components/EditTable';

const { Option } = Select;

export default class PlanLineTable extends PureComponent {
  constructor(props) {
    super(props);

    const { onRef } = this.props;
    if (isFunction(onRef)) {
      onRef(this);
    }

    this.state = {};
  }

  componentDidMount() {}

  /**
   * updateState
   * 保存以改变的行
   */
  @Bind()
  changeDataSoruce(record, data) {
    const { dispatch } = this.props;
    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        planLine: data,
      },
    });
  }

  /**
   * 检查表格内容值发生变化
   */
  @Bind()
  hasChangeData(record, changeValues) {
    const { onChangeTableData } = this.props;
    if (!isEmpty(changeValues)) {
      onChangeTableData();
    }
  }

  @Bind()
  getButtons() {
    const {
      saveLoading,
      dataSource = [],
      onCreateLine,
      onSaveLine,
      onDeleteLines,
      deleteLoading,
      planLineSelectedRowKeys = [],
      ssrcRemote,
    } = this.props;
    const buttons = [
      <TooltipButton
        onClick={onDeleteLines}
        loading={deleteLoading}
        disabled={planLineSelectedRowKeys.length === 0}
        help={intl.get('ssrc.common.view.message.plan-line.select.tip').d('请先勾选项目计划行')}
      >
        {intl.get('hzero.common.button.delete').d('删除')}
      </TooltipButton>,
      <TooltipButton
        onClick={onSaveLine}
        disabled={dataSource.length === 0}
        help={intl.get('ssrc.common.view.message.plan-line.add.tip').d('请先新增项目计划行')}
        style={{ marginLeft: '8px', marginRight: '8px' }}
        loading={saveLoading}
      >
        {intl.get('hzero.common.button.save').d('保存')}
      </TooltipButton>,
      <Button type="primary" onClick={onCreateLine}>
        {intl.get('hzero.common.button.create').d('新建')}
      </Button>,
    ];
    if (!ssrcRemote) return buttons;
    return ssrcRemote.process('SSRC_PROJECT_SETUP_UPDATE_PROCESS_PLAN_LINE_BUTTONS', buttons);
  }

  // 渲染维护表单
  renderEditTableColumns() {
    const { detailFlag = false, projectPlanStages = [] } = this.props;

    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        dataIndex: 'projectLinePlanNum',
        width: 80,
        // fixed: 'left',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.projectStage`).d('项目阶段'),
        dataIndex: 'projectStage',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('projectStage', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.projectStage`)
                        .d('项目阶段'),
                    }),
                  },
                ],
                initialValue: record.projectStage,
              })(
                <Select allowClear style={{ width: '100%' }}>
                  {projectPlanStages &&
                    projectPlanStages.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.planCompleteDate`).d('计划完成日期'),
        dataIndex: 'planCompleteDate',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('planCompleteDate', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.planCompleteDate`)
                        .d('计划完成日期'),
                    }),
                  },
                ],
                initialValue: val && moment(val),
              })(<DatePicker format={getDateFormat()} placeholder="" style={{ width: '100%' }} />)}
            </Form.Item>
          ) : (
            dateRender(val)
          ),
      },
    ];

    return columns;
  }

  // 渲染维护表单
  renderDetailTableColumns() {
    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        dataIndex: 'projectLinePlanNum',
        width: 80,
        // fixed: 'left',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessEntity`).d('业务实体'),
        dataIndex: 'projectStageMeaning',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.planCompleteDate`).d('计划完成日期'),
        dataIndex: 'planCompleteDate',
        width: 150,
        render: (value) => value && dateRender(value),
      },
    ];

    return columns;
  }

  render() {
    const {
      loading,
      detailFlag = false,
      dataSource = [],
      pagination = {},
      onSearch,
      customizeTable,
      custLoading = false,
      planLineRowSelection,
    } = this.props;

    const columns = detailFlag ? this.renderDetailTableColumns() : this.renderEditTableColumns();
    const scrollX = tableScrollWidth(columns || []);

    const CommonProps = {
      bordered: true,
      rowKey: 'projectLinePlanId',
      loading,
      columns,
      scroll: { x: scrollX, y: 480 },
      dataSource,
      pagination,
      onChange: (page) => onSearch(page),
      custLoading,
    };

    if (detailFlag) {
      return customizeTable(
        {
          code: 'SSRC.PROJECT_SETUP_DETAIL.LINE_PLAN', // 单元编码，必传
        },
        <Table {...CommonProps} />
      );
    } else {
      return (
        <React.Fragment>
          <div style={{ display: 'flex', flexDirection: 'row-reverse', marginBottom: '16px' }}>
            <Form layout="inline">{this.getButtons()}</Form>
          </div>
          {customizeTable(
            {
              code: 'SSRC.PROJECT_SETUP_EDIT.LINE_PLAN',
            },
            <EditTable
              {...CommonProps}
              scrollX={{ x: scrollX }}
              rowSelection={planLineRowSelection}
            />
          )}
        </React.Fragment>
      );
    }
  }
}
