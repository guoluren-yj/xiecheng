/*
 * OperationRecord - 我的送货单操作记录页面
 * @date: 2019/08/20 18:48
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Table, Modal, Form, Row, Col, DatePicker, Button } from 'hzero-ui';
import moment from 'moment';

import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import { dateTimeRender } from 'utils/renderer.js';
import { countBy, isEmpty, isUndefined } from 'lodash';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { createPagination, filterNullValueObject, getDateTimeFormat } from 'utils/utils';
import { fetchOperationList } from '../../../services/supplierDeliveryService';

const FormItem = Form.Item;
const modelPrompt = 'sinv.common.model.common';
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
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
    };
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
        message: intl.get('hzero.common.validation.date.after', {
          startDate: intl.get(`${modelPrompt}.operationTimeStart`).d('操作时间从'),
          endDate: intl.get(`${modelPrompt}.operationTimeEnd`).d('操作时间至'),
        }),
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
    const { pagination = {}, dataSource = [], tableLoading = false } = this.state;
    const columns = [
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
    ];

    const tableProps = {
      columns,
      dataSource,
      pagination,
      bordered: true,
      loading: tableLoading,
      rowKey: (record) => record.asnActionId + record.asnChangeRecordId,
      onChange: this.handleSearch,
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
        <Form layout="inline" onSubmit={this.handleSubmit}>
          <div className="table-search" style={{ paddingBottom: '16px' }}>
            {this.renderForm()}
          </div>
        </Form>
        <Table {...tableProps} />
      </Modal>
    );
  }
}
