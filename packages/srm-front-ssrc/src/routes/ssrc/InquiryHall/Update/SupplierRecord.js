/**
 * supplierRecord - 供应商查看页面
 * @date: 2019 1/2
 * @author: zili.hou@hand-china
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Form, Button } from 'hzero-ui';
import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';
import { enableRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import { sum, isNumber } from 'lodash';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';

const FormItem = Form.Item;

export default class supplierRecord extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      supplierDataSource,
      visible,
      hideModal,
      onSaveSupplierRecordLine,
      saveSupplierLoading,
      header,
    } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyCode',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.miniMumPrice`).d('最低限价'),
        dataIndex: 'minLimitPrice',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('minLimitPrice', {
                initialValue: record.minLimitPrice,
                rules: [
                  {
                    required: false,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.miniMumPrice`)
                        .d('最低限价'),
                    }),
                  },
                ],
              })(
                <PrecisionInputNumber
                  type="hzero"
                  currency={header.currencyCode}
                  min="0"
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.maxiMumPrice`).d('最高限价'),
        dataIndex: 'maxLimitPrice',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('maxLimitPrice', {
                initialValue: record.maxLimitPrice,
                rules: [
                  {
                    required: false,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.maxiMumPrice`)
                        .d('最高限价'),
                    }),
                  },
                ],
              })(
                <PrecisionInputNumber
                  type="hzero"
                  currency={header.currencyCode}
                  min="0"
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherToInvite`).d('是否邀请'),
        dataIndex: 'inviteFlag',
        width: 100,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('inviteFlag', {
                  initialValue: record.inviteFlag,
                })(<Checkbox />)}
              </FormItem>
            );
          } else {
            return <span>{enableRender(val)}</span>;
          }
        },
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const modalProps = {
      visible,
      width: 680,
      footer: null,
      onCancel: hideModal,
      bodyStyle: { maxHeight: '650px', overflow: 'auto' },
      title: (
        <span>
          {intl.get(`ssrc.inquiryHall.view.message.title.filterSupplier`).d('筛选供应商')}
        </span>
      ),
    };
    return (
      <React.Fragment>
        <Modal {...modalProps}>
          <Form style={{ marginBottom: '26px', textAlign: 'right' }}>
            <Button
              disabled={supplierDataSource.length === 0}
              type="primary"
              style={{ margin: '0px 24px 0px 8px' }}
              onClick={onSaveSupplierRecordLine}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          </Form>
          <EditTable
            loading={saveSupplierLoading}
            rowKey="rfxLineSupplierId"
            dataSource={supplierDataSource}
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
