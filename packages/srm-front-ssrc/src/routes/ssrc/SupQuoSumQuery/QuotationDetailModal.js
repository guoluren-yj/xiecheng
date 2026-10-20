/**
 * QuotationDetailModal - 供应商报价汇总查询-报价明细页面
 * @date: 2019 12/18
 * @author: jing.chen05@hand-china.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Form, Button, Row, Col, Tooltip } from 'hzero-ui';
import { sum, isNumber } from 'lodash';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { EDIT_FORM_ITEM_LAYOUT, FORM_COL_3_LAYOUT } from 'utils/constants';
import { numberSeparatorRender } from '@/utils/renderer';

const FormItem = Form.Item;
const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};

@Form.create({ fieldNameProp: null })
export default class QuotationDetailModal extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      dataSource = [],
      visible,
      onCancel,
      loading,
      quoDetailHeaderInfo: { supplierCompanyName, itemCode, itemRemark },
    } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.lineNum`).d('行号'),
        dataIndex: 'quotationDetailLineNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.configName`).d('配置项'),
        dataIndex: 'configName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.configQuantity`).d('数量'),
        dataIndex: 'configQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.configUnitPrice`).d('单价'),
        dataIndex: 'configUnitPrice',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.remark`).d('规格'),
        dataIndex: 'remark',
        width: 120,
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const modalProps = {
      visible,
      width: 700,
      onCancel,
      title: (
        <span>
          {intl.get(`ssrc.supQuoSumQuery.view.message.title.quotationDetail`).d('报价明细')}
        </span>
      ),
    };
    return (
      <React.Fragment>
        <Modal
          {...modalProps}
          destroyOnClose
          footer={[
            <Button key="back" onClick={() => onCancel()}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>,
            <Button key="submit" type="primary" onClick={() => onCancel()}>
              {intl.get('hzero.common.button.confirm').d('确认')}
            </Button>,
          ]}
        >
          <Row gutter={48} className="read-row ssrc-ladder-level-header">
            <Col {...FORM_COL_3_LAYOUT}>
              <UEDDisplayFormItem
                label={intl
                  .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.supplierCompanyName`)
                  .d('供应商名称')}
                value={
                  <Tooltip placement="top" title={supplierCompanyName}>
                    {supplierCompanyName.length > 8
                      ? `${supplierCompanyName.substr(0, 8)}...`
                      : supplierCompanyName}
                  </Tooltip>
                }
              />
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <UEDDisplayFormItem
                label={intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.itemCode`).d('物品编码')}
                value={itemCode}
              />
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <UEDDisplayFormItem
                label={intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.itemsName`).d('物品描述')}
                value={itemRemark}
              />
            </Col>
          </Row>
          <EditTable
            loading={loading}
            rowKey="templateDetailId"
            dataSource={dataSource}
            columns={columns}
            scroll={{ x: scrollX }}
            pagination={false}
            bordered
          />
        </Modal>
      </React.Fragment>
    );
  }
}
