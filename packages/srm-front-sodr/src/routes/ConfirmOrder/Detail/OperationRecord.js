/*
 * OperationRecord - 操作记录页面
 * @date: 2018/11/22 17:08:49
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Table, Modal, Form, Button, InputNumber, DatePicker, Col, Row } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import ExcelExport from 'components/ExcelExport';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { SRM_SPUC } from '_utils/config';
import { isUndefined, countBy, isEmpty } from 'lodash';
import { filterNullValueObject, getDateTimeFormat } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { dateTimeRender } from 'utils/renderer.js';

import moment from 'moment';
// import { DEFAULT_DATE_FORMAT } from 'utils/constants';
// import cacheComponent from 'components/CacheComponent';

const FormItem = Form.Item;
const commonModelPrompt = 'sodr.confirmOrder.model.common';
const viewPrompt = 'sodr.confirmOrder.view.message';

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
export default class OperationRecord extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询操作记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch, match = {}, organizationId, form } = this.props;
    const { params } = match;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    const { processedDateStart, processedDateEnd } = filterValues;
    if (
      processedDateStart &&
      processedDateEnd &&
      processedDateEnd.isBefore(processedDateStart, 'time')
    ) {
      notification.warning({
        message: intl
          .get('hzero.common.validation.date.after', {
            startDate: intl.get(`${commonModelPrompt}.operationDateStart`).d('操作日期从'),
            endDate: intl.get(`${commonModelPrompt}.operationDateEnd`).d('操作日期至'),
          })
          .d('操作日期从不晚于操作日期至'),
      });
    } else {
      dispatch({
        type: 'confirmOrder/fetchOperationRecordList',
        payload: {
          page: fields,
          ...filterValues,
          poHeaderId: params.id,
          tenantId: organizationId,
          processedDateStart: processedDateStart
            ? processedDateStart.format(DEFAULT_DATETIME_FORMAT)
            : undefined,
          processedDateEnd: processedDateEnd
            ? processedDateEnd.format(DEFAULT_DATETIME_FORMAT)
            : undefined,
        },
      }).then((res) => {
        if (res && res.content && res.content.length && res.content.length > 1) {
          this.handleRecordListRows(res.content);
        }
      });
    }
  }

  /**
   * 对查询到的操作记录列表行进行处理
   * @param {Array} dataList 操作记录列表
   */
  handleRecordListRows(dataList) {
    const { dispatch } = this.props;
    const mergeRowsIds = this.handleMergeRowIds(dataList);
    const mergeIds = Object.keys(mergeRowsIds);
    const mergeCounts = Object.values(mergeRowsIds);
    dataList.map((item) => {
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
    dispatch({
      type: 'confirmOrder/updateState',
      payload: {
        operationRecordList: dataList,
      },
    });
  }

  /**
   * 对需要合并的行id集合进行
   * @param {Array} dataList 操作记录列表
   */
  handleMergeRowIds(datas) {
    const mergeRowsIds = countBy(datas, 'poProcessActionId');
    for (const poProcessActionId in mergeRowsIds) {
      if (mergeRowsIds[poProcessActionId] <= 1) {
        delete mergeRowsIds[poProcessActionId];
      }
    }
    return mergeRowsIds;
  }

  /**
   * 判断对应列是否需要合并及其返回值
   * @param {String} value 当前操作记录的值
   * @param {Object} record 操作记录当前行数据
   */
  handleMergeRows(value, record, index, dateFlag) {
    const obj = {
      children: value,
      props: {},
    };
    if (dateFlag) {
      obj.children = dateTimeRender(value);
    }
    const { dataSource } = this.props;
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
   * 重置表单
   */
  @Bind()
  handleFormReset() {
    const { form, handleReset } = this.props;
    form.resetFields();
    if (handleReset) {
      handleReset();
    }
  }

  /**
   * render查询表单
   */
  renderForm() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={6}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`${commonModelPrompt}.versionNum`).d('版本号')}
            >
              {getFieldDecorator('versionNum')(<InputNumber min={1} max={999999999} />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`${commonModelPrompt}.operationDateStart`).d('操作日期从')}
            >
              {getFieldDecorator('processedDateStart')(
                <DatePicker
                  format={getDateTimeFormat()}
                  placeholder={null}
                  disabledDate={(currentDate) =>
                    getFieldValue('processedDateEnd') &&
                    moment(getFieldValue('processedDateEnd')).isBefore(currentDate, 'time')
                  }
                  showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`${commonModelPrompt}.operationDateEnd`).d('操作日期至')}
            >
              {getFieldDecorator('processedDateEnd')(
                <DatePicker
                  disabledDate={(currentDate) =>
                    getFieldValue('processedDateStart') &&
                    moment(getFieldValue('processedDateStart')).isAfter(currentDate, 'time')
                  }
                  format={getDateTimeFormat()}
                  placeholder={null}
                  showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                />
              )}
            </FormItem>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.handleSearch}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
              <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      loading,
      match = {},
      pagination,
      dataSource,
      visible,
      hideModal,
      organizationId,
      detailOperationQuery,
    } = this.props;
    const { params } = match;
    const poHeaderId = params.id;
    const columns = [
      {
        title: intl.get(`${commonModelPrompt}.statusChangeRecord`).d('状态变更记录'),
        children: [
          {
            title: intl.get(`${commonModelPrompt}.operatedByName`).d('操作人'),
            dataIndex: 'processUserName',
            width: 80,
            render: this.handleMergeRows.bind(this),
          },
          {
            title: intl.get(`${commonModelPrompt}.operationDate`).d('操作日期'),
            dataIndex: 'processedDate',
            width: 150,
            render: (value, record, index) => this.handleMergeRows(value, record, index, true),
          },
          {
            title: intl.get(`${commonModelPrompt}.operationCode`).d('动作'),
            dataIndex: 'processTypeMeaning',
            width: 80,
            render: this.handleMergeRows.bind(this),
          },
          {
            title: intl.get(`${commonModelPrompt}.operationReason`).d('说明'),
            dataIndex: 'processRemark',
            render: this.handleMergeRows.bind(this),
          },
          {
            title: intl.get(`${commonModelPrompt}.versionNum`).d('版本号'),
            dataIndex: 'versionNum',
            width: 80,
            render: this.handleMergeRows.bind(this),
          },
        ],
      },
      {
        title: intl.get(`${commonModelPrompt}.dataChangeRecord`).d('数据变更记录'),
        children: [
          {
            title: intl.get(`${commonModelPrompt}.operationCode`).d('动作'),
            dataIndex: 'changeTypeMeaning',
            width: 80,
          },
          {
            title: intl.get(`${commonModelPrompt}.displayLineNum`).d('行号'),
            dataIndex: 'displayLineNum',
            width: 80,
          },
          {
            title: intl.get(`${commonModelPrompt}.shipmentNum`).d('发运号'),
            dataIndex: 'displayLineLocationNum',
            width: 90,
          },
          {
            title: intl.get(`${commonModelPrompt}.changeContent`).d('修改内容'),
            dataIndex: 'changeFieldNameMeaning',
          },
          {
            title: intl.get(`${commonModelPrompt}.oldValue`).d('修改前'),
            dataIndex: 'oldValue',
            width: 80,
          },
          {
            title: intl.get(`${commonModelPrompt}.newValue`).d('修改后'),
            dataIndex: 'newValue',
            width: 80,
          },
        ],
      },
    ];
    const otherButtonProps = {
      icon: 'export',
      type: 'primary',
    };
    const modalProps = {
      visible,
      width: 1200,
      footer: null,
      onCancel: hideModal,
      bodyStyle: { maxHeight: '600px', overflow: 'auto' },
      title: intl.get(`${viewPrompt}.title.actionHistory`).d('操作记录'),
    };
    const tableProps = {
      loading,
      rowKey: (record, index) => index,
      columns,
      dataSource,
      pagination,
      onChange: this.handleSearch,
    };
    return (
      <Modal {...modalProps}>
        <div className="table-list-search">{this.renderForm()}</div>
        <Row style={{ paddingBottom: '16px', textAlign: 'right' }}>
          <ExcelExport
            otherButtonProps={otherButtonProps}
            requestUrl={`${SRM_SPUC}/v1/${organizationId}/po-process-actions/${poHeaderId}/export`}
            queryParams={detailOperationQuery}
          />
        </Row>
        <Table {...tableProps} bordered />
      </Modal>
    );
  }
}
