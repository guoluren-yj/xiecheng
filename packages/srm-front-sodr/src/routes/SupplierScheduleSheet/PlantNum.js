/**
 * plantNum - 新建分配
 * @date: 2019 1/1
 * @author: LC <chao.li03@hand-china>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import moment from 'moment';
import { Modal, Form, Button, InputNumber, DatePicker, Input } from 'hzero-ui';
import { isNumber, sum, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import EditTable from 'components/EditTable';
// import { getDateTimeFormat } from 'utils/utils';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import { formatAumont } from '../components/utils';

import styles from './index.less';
import PlanFilterForm from './PlanFilterForm';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class PlantNum extends Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
  }
  // componentDidMount() {
  //   // this.handleSearch();
  // }

  /**
   * 查询计划分配数量
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearch(page, isChangePage) {
    const { handleCreateQuery } = this.props;
    handleCreateQuery(true, page, isChangePage);
  }

  /**
   * 批量变更本次计划到货日期
   */
  @Bind()
  handleMaintain() {
    const {
      selectedCreateQueryRowKeys,
      form: { getFieldsValue },
      dataSource,
    } = this.props;
    const { planDate } = getFieldsValue();

    dataSource.map((item) => {
      if (
        !isEmpty(selectedCreateQueryRowKeys) &&
        selectedCreateQueryRowKeys.includes(item.planIdAndPoLineLocationId)
      ) {
        item.$form.setFieldsValue({ planDate });
      } else if (isEmpty(selectedCreateQueryRowKeys)) {
        item.$form.setFieldsValue({ planDate });
      }
      return item;
    });
  }

  // 自定义表单校验
  @Bind()
  validator(record, value, callback) {
    if (value <= 0 || value > record.availableQuantity) {
      callback(
        intl.get(`sodr.orderType.view.message.numberPlanError`).d('大于0小于剩余可计划数量')
      );
    }
    callback();
  }

  render() {
    const {
      visible,
      handleChangeVisible,
      pagination,
      dataSource,
      // handleChangeSure,
      rowSelection,
      loading,
      selectedCreateQueryRowKeys,
      handleSupplierSave,
      handleSupplierRelease,
      handleTranslate,
      form: { getFieldDecorator },
    } = this.props;
    const columns = [
      {
        title: intl.get(`sodr.common.model.common.orderSeq`).d('序号'),
        dataIndex: 'serialNum',
        width: 60,
        fixed: 'left',
      },
      /* 操作列 */
      {
        title: intl.get(`sodr.common.model.common.translate`).d('拆分'),
        dataIndex: 'translate',
        width: 60,
        render: (__, record) => (
          <a onClick={() => handleTranslate(record)}>
            {intl.get(`sodr.common.model.common.translate`).d('拆分')}
          </a>
        ),
      },
      {
        title: intl.get(`sodr.common.model.common.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.readyPlanQuantity`).d('可计划数量'),
        dataIndex: 'availableQuantity',
        width: 80,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get(`sodr.common.model.common.displayPoNum`).d('订单号'),
        dataIndex: 'displayPoNum',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.planQuantity`).d('本次计划数量'),
        dataIndex: 'planQuantity',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('planQuantity', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sodr.common.model.common.planQuantity`).d('本次计划数量'),
                    }),
                  },
                  {
                    validator: (_, value, callback) => this.validator(record, value, callback),
                  },
                ],
                initialValue: val,
              })(
                <InputNumber
                  max={record.availableQuantity}
                  min={0}
                  onChange={() => setTimeout(() => this.forceUpdate(), 600)}
                  precision={2}
                  style={{ width: '100%' }}
                  allowThousandth="true"
                />
              )}
            </FormItem>
          ) : (
            formatAumont(val)
          ),
      },
      {
        title: intl.get(`sodr.common.model.common.planDate`).d('本次计划到货日期'),
        dataIndex: 'planDate',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('planDate', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sodr.common.model.common.planDate`).d('本次计划到货日期'),
                    }),
                  },
                ],
                initialValue: val && moment(val),
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  onChange={() => setTimeout(() => this.forceUpdate(), 600)}
                  showTime={false}
                  format="YYYY-MM-DD"
                />
              )}
            </FormItem>
          ) : (
            moment(val).format('YYYY-MM-DD')
          ),
      },
      {
        title: intl.get(`sodr.common.model.common.2`).d('供应商备注'),
        dataIndex: 'supplierRemark',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('supplierRemark', {
                initialValue: val,
              })(<Input onChange={() => setTimeout(() => this.forceUpdate(), 600)} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sodr.common.model.common.netReceivedQuantitys`).d('净接收数量'),
        dataIndex: 'netReceivedQuantity',
        width: 100,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get(`sodr.common.model.common.sendingQuantity`).d('送货中数量'),
        dataIndex: 'sendingQuantity',
        width: 100,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get(`sodr.common.model.common.uomNames`).d('单位'),
        dataIndex: 'uomName',
        width: 80,
      },
      {
        title: intl.get(`sodr.common.model.common.poLineId`).d('订单行号'),
        dataIndex: 'lineNum',
        width: 80,
      },
      {
        title: intl.get(`sodr.common.model.common.orderDisplayLineLocationNum`).d('订单发运号'),
        dataIndex: 'lineLocationNum',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.needByDate`).d('需求日期'),
        dataIndex: 'needByDate',
        width: 80,
        render: dateRender,
      },
      {
        title: intl.get(`sodr.common.model.common.agentId`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 70,
      },
      {
        title: intl.get(`entity.item.companyId`).d('公司'),
        dataIndex: 'companyName',
        width: 140,
      },
      {
        title: intl.get(`entity.organization.class.inventory`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 100,
      },
    ];
    const planFilterProps = {
      onSearch: this.handleSearch,
      onRef: (node) => {
        this.planNumForm = node;
      },
    };
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const modalProps = {
      visible,
      width: '1000px',
      onCancel: () => handleChangeVisible(false),
      bodyStyle: { overflow: 'auto' },
      title: intl.get(`sodr.schedule.view.message.title.num`).d('新建计划单'),
      footer: null,
    };
    const tableProps = {
      rowKey: 'planIdAndPoLineLocationId',
      columns,
      dataSource,
      pagination,
      rowSelection,
      loading,
      width: '100%',
      onChange: (page) => this.handleSearch(page, true),
    };
    return (
      <Modal {...modalProps}>
        <div className="table-list-search">
          <PlanFilterForm {...planFilterProps} />
          <div className={styles['item-list-search']}>
            <Form layout="inline">
              <Button
                onClick={handleSupplierSave}
                disabled={isEmpty(selectedCreateQueryRowKeys)}
                type="primary"
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
              <Button
                onClick={handleSupplierRelease}
                disabled={isEmpty(selectedCreateQueryRowKeys)}
              >
                {intl.get('hzero.common.button.release').d('发布')}
              </Button>
            </Form>
            <Form layout="inline">
              <FormItem>
                <Button
                  data-code="search"
                  htmlType="submit"
                  type="primary"
                  onClick={this.handleMaintain}
                  disabled={dataSource.length === 0}
                >
                  <a
                    title={intl
                      .get(`sodr.quotePurchase.model.quotePurchase.batchMaintainTip`)
                      .d('一键修改需求日期')}
                  >
                    {intl.get(`sodr.quotePurchase.model.quotePurchase.batchMaintain`).d('批量维护')}
                  </a>
                </Button>
              </FormItem>
              <FormItem label={intl.get(`sodr.common.model.common.planDate`).d('本次计划到货日期')}>
                {getFieldDecorator(`planDate`)(
                  <DatePicker placeholder={null} format="YYYY-MM-DD" />
                )}
              </FormItem>
            </Form>
            <EditTable {...tableProps} scroll={{ x: scrollX, y: '600px' }} bordered />
          </div>
        </div>
      </Modal>
    );
  }
}
