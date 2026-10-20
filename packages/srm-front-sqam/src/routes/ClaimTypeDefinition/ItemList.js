/* eslint-disable react/jsx-closing-tag-location */
/**
 * index - 索赔单类型 - 列表页
 * @date: 2019-11-05
 * @author: wuting <ting.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import { sum } from 'lodash';
import React from 'react';
import { Input, Form, Icon, Tooltip } from 'hzero-ui';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';

import intl from 'utils/intl';
import Switch from 'components/Switch';
import TLEditor from 'components/TLEditor';
import EditTable from 'components/EditTable';
import warning from '@/assets/warning.svg';

const FormItem = Form.Item;
const tenantId = getCurrentOrganizationId();
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: ['SQAM.CLAIM_TYPE_DEFINITION_LIST.ITEM_GRID'],
})
export default class ClaimTypeList extends React.Component {
  render() {
    const {
      loading,
      onSearch,
      pagination,
      // enumMap,
      dataSource,
      selectedRowKeys,
      onRowSelectChange = e => e, // 勾选按钮
      // onFetchList = (e) => e, // 获取数据
      customizeTable,
    } = this.props;
    // const { chargeCode = [] } = enumMap;

    const columns = [
      {
        title: intl.get(`sqam.common.model.claimItemCode`).d('索赔项目编码'),
        dataIndex: 'claimItemNum',
        width: 160,
        render: (val, record) => (
          <FormItem record={record}>
            {record.$form.getFieldDecorator(`claimItemNum`, {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`sqam.common.model.claimItemCode`).d('索赔项目编码'),
                  }),
                },
                {
                  pattern: /^[A-Z]/,
                  message: intl
                    .get(`sqam.common.view.message.startWithLetter`)
                    .d('请以大写英文字母开头'),
                },
              ],
              initialValue: record.claimItemNum,
            })(
              <Input
                typeCase="upper"
                onChange={() => {
                  record.$form.validateFields(['claimItemNum'], {
                    force: true,
                  });
                }}
              />
            )}
          </FormItem>
        ),
      },
      {
        title: intl.get(`sqam.common.common.claimItemDesc`).d('索赔项目描述'),
        dataIndex: 'claimItemDesc',
        width: 160,
        render: (val, record) => (
          <FormItem record={record}>
            {record.$form.getFieldDecorator(`claimItemDesc`, {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`sqam.common.common.claimItemDesc`).d('索赔项目描述'),
                  }),
                },
              ],
              initialValue: record.claimItemDesc,
            })(
              <TLEditor
                label={intl.get(`sqam.common.common.claimItemDesc`).d('索赔项目描述')}
                field="claimItemDesc"
                token={record._token}
              />
            )}
          </FormItem>
        ),
      },
      {
        title: intl.get(`sqam.common.model.itemExplain`).d('项目说明'),
        dataIndex: 'itemExplain',
        width: 120,
        render: (val, record) => (
          <FormItem record={record}>
            {record.$form.getFieldDecorator(`itemExplain`, {
              initialValue: record.itemExplain,
            })(<Input />)}
          </FormItem>
        ),
      },
      {
        title: (
          <div>
            {intl.get(`sqam.common.model.chargeCode`).d('匹配费用单项目')}
            <span style={{ marginLeft: 4 }}>
              <Tooltip
                title={intl
                  .get(`sqam.common.model.promptInformationing`)
                  .d(
                    '配置索赔自动创建费用单时，索赔项目与费用项目的匹配关系（费用项目可至【值集配置】搜索SSTA.CHARGE查询）'
                  )}
              >
                {' '}
                <img src={warning} alt="img" />
              </Tooltip>
            </span>
          </div>
        ),
        dataIndex: 'chargeCode',
        filterIcon: filtered => (
          <Icon type="exclamation-circle-o" style={{ color: filtered ? '#108ee9' : '#ff0000' }} />
        ),
        width: 150,
        render: (val, record) => (
          <FormItem record={record}>
            {record.$form.getFieldDecorator(`chargeCode`, {
              initialValue: record.chargeCode,
            })(
              <Lov
                code="SQAM.CHARGE_CODE"
                textValue={record.chargeCodeMeaning}
                queryParams={{ tenantId }}
              />
            )}
          </FormItem>
        ),
      },

      {
        title: intl.get(`sqam.common.model.defaultFlag`).d('默认'),
        dataIndex: 'defaultFlag',
        width: 100,
        render: (_, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`defaultFlag`, {
              initialValue: record.defaultFlag === 0 ? 0 : 1,
            })(<Switch disabled={record.$form.getFieldValue('enabledFlag') === 0} />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`hzero.common.status.enable`).d('启用'),
        dataIndex: 'enabledFlag',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`enabledFlag`, {
              initialValue: record.enabledFlag === 0 ? 0 : 1,
            })(
              <Switch
                onChange={value => {
                  if (value === 0 && record.$form.getFieldValue('defaultFlag') === 1) {
                    record.$form.setFieldsValue({ defaultFlag: 0 });
                  }
                }}
              />
            )}
          </FormItem>
        ),
      },
    ];
    const rowSelection = {
      selectedRowKeys,
      onChange: onRowSelectChange,
    };

    const tableProps = {
      loading,
      columns,
      dataSource,
      pagination,
      rowSelection,
      bordered: true,
      rowKey: 'claimItemId',
      onChange: page => onSearch(page),
    };
    tableProps.scroll = { x: sum(tableProps.columns.map(n => n.width)) + 60 };
    return customizeTable(
      {
        code: 'SQAM.CLAIM_TYPE_DEFINITION_LIST.ITEM_GRID',
      },
      <EditTable {...tableProps} />
    );
  }
}
