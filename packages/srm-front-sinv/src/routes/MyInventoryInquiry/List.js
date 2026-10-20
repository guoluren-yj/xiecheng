import React, { PureComponent } from 'react';
import { Form } from 'hzero-ui';
import EditTable from 'components/EditTable';
import { dateTimeRender } from 'utils/renderer';
import { sum, isNumber, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { showBigNumber } from '../components/utils';

/**
 * 我的库存录入查询列表信息
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form 表单
 * @return React.element
 */

const modelPrompt = 'sinv.common.model.common';
@Form.create({ fieldNameProp: null })
export default class List extends PureComponent {
  /**
   * showUomText - unitCodeIsShow为1 显示code/name,为0 显示name,不存在则按旧逻辑显示
   * @param {object} record - 单条数据
   */
  @Bind()
  showUomText(record) {
    const { uomName, uomCode, unitCodeIsShow } = record;
    let text = uomName && uomCode ? <span>{`${uomCode}/${uomName}`}</span> : uomName;
    if (!isNil(unitCodeIsShow)) {
      text = unitCodeIsShow === '1' && uomCode && uomName ? `${uomCode}/${uomName}` : uomName;
    }
    return text;
  }

  render() {
    const { loading, dataSource, onSearch, pagination = {}, customizeTable } = this.props;
    const columns = [
      {
        title: intl.get(`${modelPrompt}.lastUpdate`).d('最后更新时间'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${modelPrompt}.vendorCode`).d('供应商'),
        dataIndex: 'supplierCompanyName',
        // width: 200,
      },
      {
        title: intl.get(`${modelPrompt}.clientCompanyName`).d('客户公司名称'),
        dataIndex: 'companyName',
        width: 200,
      },
      {
        title: intl.get(`${modelPrompt}.ouId`).d('业务实体'),
        dataIndex: 'ouName',
        width: 200,
      },
      {
        title: intl.get(`${modelPrompt}.invOrganizationId`).d('收货组织'),
        dataIndex: 'organizationName',
        width: 200,
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 150,
        render: (_val, record) => this.showUomText(record),
      },
      {
        title: intl.get(`${modelPrompt}.lastStockQuantity`).d('上一次库存现有量'),
        dataIndex: 'lastStockQuantity',
        width: 150,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`${modelPrompt}.changeQuantity`).d('变动数量'),
        dataIndex: 'variableQuantity',
        width: 150,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`${modelPrompt}.stockQuantity`).d('库存现有量'),
        dataIndex: 'stockQuantity',
        width: 150,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`${modelPrompt}.comment`).d('备注'),
        dataIndex: 'comment',
        width: 150,
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 200;
    return customizeTable(
      {
        code: 'SINV.MY_INVENTORY_INQUIRY.LISTS',
        __force_record_to_update__: true,
      },
      <EditTable
        resizable
        bordered
        loading={loading}
        scroll={{ x: scrollX }}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={(page) => onSearch(page)}
      />
    );
  }
}
