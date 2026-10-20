import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { Input, Form } from 'hzero-ui';
import { phoneRender } from '@/utils/renderer';

const FormItem = Form.Item;
const promptCode = 'ssrc.quoController';

export default class ItemDetailsTable extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      dataSource = [],
      pagination,
      onSearch,
      type,
      handleAllot,
      customizeTable = () => {},
    } = this.props;
    let columns;
    let pageData;
    if (type === 0) {
      pageData = pagination;
      columns = [
        {
          title: intl.get(`${promptCode}.model.quoController.supplierCode`).d('供应商编码'),
          dataIndex: 'supplierCompanyNum',
          width: 100,
        },
        {
          title: intl.get(`${promptCode}.model.quoController.supplierName`).d('供应商名称'),
          dataIndex: 'supplierCompanyName',
          width: 100,
        },
        {
          title: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCoefficient`).d('价格系数'),
          dataIndex: 'priceCoefficient',
          width: 100,
        },
        // {
        //   title: intl.get(`${promptCode}.model.quoController.certified`).d('通过启信宝认证'),
        //   dataIndex: 'uomTypeCode',
        //   width: 100,
        // },
        {
          title: intl.get(`${promptCode}.model.quoController.lifeCycle`).d('生命周期阶段'),
          dataIndex: 'stageDescription',
          width: 100,
        },
        {
          title: intl.get(`${promptCode}.model.quoController.contacts`).d('联系人'),
          dataIndex: 'contactName',
          width: 100,
        },
        {
          title: intl.get(`${promptCode}.model.quoController.tel`).d('联系电话'),
          dataIndex: 'contactMobilephone',
          width: 200,
          render: (value, record) => phoneRender(record.internationalTelCodeMeaning, value),
        },
        {
          title: intl.get(`${promptCode}.model.quoController.Email`).d('电子邮件'),
          dataIndex: 'contactMail',
          width: 100,
        },
      ];
    } else if (type === 1) {
      pageData = false;
      columns = [
        {
          title: intl.get(`${promptCode}.model.quoController.supplierCode`).d('供应商编码'),
          dataIndex: 'supplierCompanyNum',
          width: 100,
          render: (val, record) => {
            if (record._status === 'create') {
              const { getFieldDecorator } = record.$form;
              return (
                <FormItem>
                  {getFieldDecorator('uomCode', {
                    initialValue: record.uomCode,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`${promptCode}.model.quoController.supplierCode`)
                            .d('供应商编码'),
                        }),
                      },
                    ],
                  })(<Input inputChinese={false} />)}
                </FormItem>
              );
            } else {
              return val;
            }
          },
        },
        {
          title: intl.get(`${promptCode}.model.quoController.supplierName`).d('供应商名称'),
          dataIndex: 'supplierCompanyName',
        },
        {
          title: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCoefficient`).d('价格系数'),
          dataIndex: 'priceCoefficient',
          width: 100,
        },
        {
          title: intl.get(`${promptCode}.model.quoController.contacts`).d('联系人'),
          dataIndex: 'contactName',
          width: 80,
        },
        {
          title: intl.get(`${promptCode}.model.quoController.tel`).d('联系电话'),
          dataIndex: 'contactMobilephone',
          width: 95,
        },
        {
          title: intl.get(`${promptCode}.model.quoController.Email`).d('电子邮件'),
          dataIndex: 'contactMail',
          width: 140,
        },
        {
          title: intl.get(`${promptCode}.model.quoController.addingResult`).d('添加理由'),
          dataIndex: 'appendRemark',
          width: 100,
          align: 'left',
          render: (val, record) => {
            if (record._status === 'create') {
              const { getFieldDecorator } = record.$form;
              return (
                <FormItem>
                  {getFieldDecorator('appendRemark', {
                    initialValue: record.appendRemark,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`${promptCode}.model.quoController.addingResult`)
                            .d('添加理由'),
                        }),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              );
            } else {
              return val;
            }
          },
        },
        {
          title: intl.get(`${promptCode}.model.quoController.assignVisibleItems`).d('分配可见物品'),
          dataIndex: 'operate',
          width: 100,
          render: (text, record) => {
            return (
              <a onClick={() => handleAllot(record)}>
                {intl.get(`${promptCode}.view.message.button.view`).d('查看')}
              </a>
            );
          },
        },
      ];
    }
    return (
      <React.Fragment>
        {customizeTable(
          { code: 'SSRC.QUOTATION_CONTROLLER_DETAIL.SUPPLIERLIST', readOnly: true },
          <EditTable
            disabled
            bordered
            rowKey="rfxLineSupplierId"
            loading={loading}
            columns={columns}
            dataSource={dataSource}
            pagination={pageData}
            onChange={(page) => onSearch(page)}
          />
        )}
      </React.Fragment>
    );
  }
}
