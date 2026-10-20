/*
 * OperationRecord - 送货单查询操作记录页面
 * @date: 2019/08/20 18:48
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Table, Modal, Form, Row, Col, DatePicker, Button, Tabs } from 'hzero-ui';
import moment from 'moment';
import UploadModal from 'components/Upload';
import { BKT_HWFP } from 'utils/config';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import { dateTimeRender } from 'utils/renderer.js';
import { approveNameRender } from 'srm-front-swfl/lib/utils/util.js';
import { countBy, isEmpty, isUndefined } from 'lodash';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { createPagination, filterNullValueObject, getDateTimeFormat } from 'utils/utils';
import { fetchOperationList, fetchApproveRecord } from '../../../services/supplierDeliveryService';

const FormItem = Form.Item;
const modelPrompt = 'sinv.common.model.common';
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const { TabPane } = Tabs;
@formatterCollections({
  code: [
    'entity.roles',
    'sinv.common',
    'sinv.deliveryCancelled',
    'entity.supplier',
    'entity.customer',
  ],
})
@Form.create({ fieldNameProp: null })
export default class ActionRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [], // 操作记录数据源
      pagination: {}, // 分页
      tableLoading: false,
      activeKey: 'operate',
      approveData: [], // 审批记录数据源
    };
  }

  @Bind()
  handleTabChange(activeKey) {
    this.setState({ activeKey });
  }

  /**
   * getSnapshotBeforeUpdate 生命周期函数
   * 判断是否加载数据
   * @param {object} prevProps - 上一个状态下的props
   */
  getSnapshotBeforeUpdate(prevProps) {
    const { visible } = this.props;
    return visible && prevProps.visible !== visible;
  }

  componentDidMount() {
    this.handleSearch();
    this.handleQueryApprove();
  }

  /**
   * 查询操作记录
   * @param pagination
   */
  @Bind()
  handleSearch(fields = {}) {
    const { asnHeaderId } = this.props;
    const fieldParams = this.getFieldsParams();
    const params = {
      asnHeaderId,
      changeRecordFlag: 1,
      page: fields,
      ...fieldParams,
    };
    this.setState({ tableLoading: true });
    fetchOperationList(params).then((res) => {
      if (res && res.content) {
        const pagination = createPagination(res);
        const dataSource = res.content;
        // const dataSource = this.handleRecordListRows(res.content); //启用合并行
        this.setState({
          pagination,
          dataSource,
          tableLoading: false,
        });
      } else {
        this.setState({ tableLoading: false });
      }
    });
  }

  /**
   * 查询审批记录
   * @param pagination
   */
  @Bind()
  handleQueryApprove() {
    const { asnHeaderId } = this.props;
    const params = {
      asnHeaderId,
    };
    fetchApproveRecord(params).then((res) => {
      if (res && Array.isArray(res)) {
        this.setState({
          approveData: res
            .reduce((pre, current) => [...pre, ...(current.historicTaskExtList || [])], [])
            .reverse(),
        });
      }
    });
  }

  /**
   * 返回需要合并的行id集合
   * @param {Array} dataList 操作记录列表
   */
  handleMergeRowIds(datas) {
    const mergeRowsIds = countBy(datas, 'poProcessActionId');
    for (const poProcessActionId in mergeRowsIds) {
      // 当不存在poProcessActionId
      if (mergeRowsIds[poProcessActionId] <= 1 || poProcessActionId === 'undefined') {
        delete mergeRowsIds[poProcessActionId];
      }
    }
    return mergeRowsIds;
  }

  /**
   * 判断对应列是否需要合并及其返回值
   * @param {String} value 当前操作记录的值
   * @param {Object} record 操作记录当前行数据
   * @param {Boolean} dateFlag 判断是否是日期
   */
  handleMergeRows(value, record, index, dateFlag) {
    const obj = {
      children: value,
      props: {},
    };
    if (dateFlag) {
      obj.children = dateTimeRender(value);
    }
    const { dataSource } = this.state;
    const mergeRowsIds = this.handleMergeRowIds(dataSource);
    const mergeIds = Object.keys(mergeRowsIds);
    if (!isEmpty(mergeIds) && mergeIds.indexOf(`${record.poProcessActionId}`) >= 0) {
      if (record.mergeRows) {
        obj.props.rowSpan = record.mergeRows;
      } else {
        obj.props.rowSpan = 0;
      }
    }
    return obj;
  }

  /**
   * 对查询到的操作记录列表行进行处理
   * @param {Array} dataList 操作记录列表
   */
  handleRecordListRows(dataList) {
    // const { dispatch } = this.props;
    const mergeRowsIds = this.handleMergeRowIds(dataList);
    if (isEmpty(dataList)) {
      return [];
    }
    const mergeIds = Object.keys(mergeRowsIds);
    const mergeCounts = Object.values(mergeRowsIds);
    return dataList.map((item) => {
      const currentId = `${item.poProcessActionId}`;
      if (mergeIds.indexOf(currentId) > -1) {
        const mappingIndex = mergeIds.indexOf(currentId);
        const dealItem = Object.assign(item, { mergeRows: mergeCounts[mappingIndex] });
        delete mergeIds[mappingIndex];
        delete mergeCounts[mappingIndex];
        return dealItem;
      }
      return item;
    });
  }

  getFieldsParams = () => {
    const { form } = this.props;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    const { processDateFrom, processDateTo } = filterValues;
    return filterNullValueObject({
      processDateFrom: processDateFrom
        ? processDateFrom.format(DEFAULT_DATETIME_FORMAT)
        : undefined,
      processDateTo: processDateTo ? processDateTo.format(DEFAULT_DATETIME_FORMAT) : undefined,
    });
  };

  queryFields = () => {
    const { form } = this.props;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    const { processDateFrom, processDateTo } = filterValues;
    if (processDateFrom && processDateTo && processDateTo.isBefore(processDateFrom, 'time')) {
      notification.warning({
        message: intl
          .get('hzero.common.validation.date.after', {
            startDate: intl.get(`${modelPrompt}.operationTimeStart`).d('操作时间从'),
            endDate: intl.get(`${modelPrompt}.operationTimeEnd`).d('操作时间至'),
          })
          .d('到货日期从不晚于到货日期至'),
      });
    } else {
      this.handleSearch();
    }
  };

  resetFields = () => {
    const { form } = this.props;
    form.resetFields();
    // this.queryFields();
  };

  @Bind()
  getColumns(activeKey) {
    const columns = {
      operate: [
        {
          title: intl.get(`${modelPrompt}.statusChangeRecord`).d('状态变更记录'),
          children: [
            {
              title: intl.get(`${modelPrompt}.lastUpdatedName`).d('操作人'),
              dataIndex: 'processUser',
              width: 80,
              render: this.handleMergeRows.bind(this),
            },
            {
              title: intl.get(`${modelPrompt}.operatorDate`).d('操作时间'),
              dataIndex: 'processDate',
              width: 150,
              render: dateTimeRender,
            },
            {
              title: intl.get(`${modelPrompt}.processStatusMeaning`).d('动作'),
              dataIndex: 'processStatusMeaning',
              width: 80,
              render: this.handleMergeRows.bind(this),
            },
            {
              title: intl.get(`${modelPrompt}.explain`).d('说明'),
              dataIndex: 'processRemark',
              width: 100,
              render: this.handleMergeRows.bind(this),
            },
          ],
        },
        {
          title: intl.get(`${modelPrompt}.dataChangeRecord`).d('数据变更记录'),
          children: [
            {
              title: intl.get(`${modelPrompt}.changeAction`).d('变更动作'),
              dataIndex: 'changeTypeName',
              width: 80,
            },
            {
              title: intl.get(`${modelPrompt}.changeField`).d('变更内容'),
              dataIndex: 'changeFieldNameMeaning',
              width: 100,
            },
            {
              title: intl.get(`${modelPrompt}.beforeModification`).d('修改前'),
              dataIndex: 'oldDisplayValue',
              width: 80,
              render: (val) => {
                return <span>{val}</span>;
              },
            },
            {
              title: intl.get(`${modelPrompt}.afterModification`).d('修改后'),
              dataIndex: 'newDisplayValue',
              width: 80,
              render: (val) => {
                return <span>{val}</span>;
              },
            },
          ],
        },
      ],
      approve: [
        {
          title: intl.get('sinv.common.model.approval.time').d('审批时间'),
          dataIndex: 'endTime',
          width: 180,
          render: dateTimeRender,
        },
        {
          title: intl.get('sinv.common.model.approval.action').d('审批动作'),
          dataIndex: 'action',
          width: 120,
          render: approveNameRender,
        },
        {
          title: intl.get('sinv.common.model.approval.step').d('审批环节'),
          dataIndex: 'name',
          width: 150,
        },
        {
          title: intl.get('sinv.common.model.approval.owner').d('审批人'),
          dataIndex: 'assigneeName',
          width: 150,
        },
        {
          title: intl.get('sinv.common.model.approval.opinion').d('审批意见'),
          dataIndex: 'comment',
        },
        {
          title: intl.get('sinv.common.model.approval.file').d('附件'),
          dataIndex: 'attachmentUuid',
          fixed: 'right',
          width: 150,
          render: (val, record) => {
            if (record.attachmentUuid) {
              return (
                <UploadModal
                  attachmentUUID={val}
                  bucketName={BKT_HWFP}
                  bucketDirectory="hwfp01"
                  viewOnly
                />
              );
            }
          },
        },
      ],
    };
    return columns[activeKey];
  }

  renderForm = () => {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    return (
      <Form layout="inline">
        <Row>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`${modelPrompt}.operatorDateFrom`).d('操作时间从')}
            >
              {getFieldDecorator('processDateFrom')(
                <DatePicker
                  format={getDateTimeFormat()}
                  placeholder={null}
                  showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                  disabledDate={(currentDate) =>
                    getFieldValue('processDateTo') &&
                    moment(getFieldValue('processDateTo')).isBefore(currentDate, 'time')
                  }
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`${modelPrompt}.operatorDateTo`).d('操作时间至')}
            >
              {getFieldDecorator('processDateTo')(
                <DatePicker
                  format={getDateTimeFormat()}
                  placeholder={null}
                  showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                  disabledDate={(currentDate) =>
                    getFieldValue('processDateFrom') &&
                    moment(getFieldValue('processDateFrom')).isAfter(currentDate, 'time')
                  }
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem>
              <Button style={{ marginLeft: 8 }} onClick={this.resetFields}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" style={{ marginLeft: 16 }} onClick={this.queryFields}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  };

  render() {
    const { hideModal, visible = false } = this.props;
    const {
      pagination = {},
      dataSource = [],
      tableLoading = false,
      activeKey,
      approveData,
    } = this.state;
    const columns = this.getColumns(activeKey);
    const tableProps = {
      loading: tableLoading,
      bordered: true,
      rowKey: (record, index) => index,
      columns,
      dataSource,
      pagination,
      onChange: this.handleSearch,
    };

    const newTableProps = {
      loading: tableLoading,
      bordered: true,
      rowKey: (record, index) => index,
      columns,
      dataSource: approveData,
      pagination: {
        totalCount: approveData.length,
        showSizeChanger: true,
        showTotal: (_, range) => `显示 ${range[0]} - ${range[1]} 共 ${approveData.length} 条`,
        hideOnSinglePage: false,
      },
    };
    return (
      <Modal
        title={intl.get(`sinv.common.model.common.operationRecord`).d('操作记录')}
        width={1048}
        visible={visible}
        bodyStyle={{ maxHeight: '600px', overflow: 'auto' }}
        onCancel={hideModal}
        footer={null}
      >
        <Tabs onChange={this.handleTabChange} animated={false}>
          <TabPane key="operate" tab={intl.get(`sinv.common.model.common.operating`).d('操作记录')}>
            <Form layout="inline" onSubmit={this.handleSubmit}>
              <div className="table-search" style={{ paddingBottom: '16px' }}>
                {this.renderForm()}
              </div>
            </Form>
            <Table {...tableProps} />
          </TabPane>
          <TabPane
            key="approve"
            tab={intl.get(`sinv.common.model.common.approvalInfo`).d('审批记录')}
          >
            <Table {...newTableProps} />
          </TabPane>
        </Tabs>
      </Modal>
    );
  }
}
