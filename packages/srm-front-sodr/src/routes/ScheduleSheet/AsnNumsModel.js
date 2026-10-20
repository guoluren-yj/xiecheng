/**
 * OperationRecord - 关联送货单查询页面
 * @date: 2019 1/1
 * @author: LC <chao.li03@hand-china>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Table, Modal, Form } from 'hzero-ui';

import moment from 'moment';
import intl from 'utils/intl';
import {
  dateRender, // 日期格式化
} from 'hzero-front/lib/utils/renderer';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { formatAumont } from '../components/utils';

const modelPrompt = 'sodr.sendOrder.model.common';

@Form.create({ fieldNameProp: null })
export default class OperationRecord extends PureComponent {
  componentDidMount() {
    const { handleAsnNumsSearch } = this.props;
    handleAsnNumsSearch();
  }

  render() {
    const {
      visible,
      hideAsnNumsModel,
      operationAsnNumsLoading,
      handleAsnNumsSearch,
      pagination = {},
      dataSource = [],
    } = this.props;
    const columns = [
      {
        title: intl.get(`${modelPrompt}.asnNum`).d('送货单号'),
        dataIndex: 'asnNum',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.lineNum`).d('行号'),
        dataIndex: 'displayAsnLineNum',
        width: 80,
      },
      {
        title: intl.get(`${modelPrompt}.shipQuantity`).d('发运数量'),
        dataIndex: 'shipQuantity',
        width: 100,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get(`${modelPrompt}.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.shipDate`).d('发货日期'),
        dataIndex: 'shipDate',
        width: 120,
        render: (text) => {
          const dom = text ? moment(text).format(DEFAULT_DATE_FORMAT) : text;
          const formatDom = dateRender(dom) || null;
          return <>{formatDom}</>;
        },
      },
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'asnStatusMeaning',
        width: 90,
      },
    ];
    const modalProps = {
      visible,
      width: 800,
      footer: null,
      onCancel: () => hideAsnNumsModel(false),
      bodyStyle: { maxHeight: '650px', overflow: 'auto' },
      title: intl.get(`sodr.common.view.message.title.associatedDeliveryNote`).d('关联送货单'),
    };
    const tableProps = {
      rowKey: (record, index) => index,
      columns,
      dataSource,
      pagination,
      loading: operationAsnNumsLoading,
      onChange: (page) => handleAsnNumsSearch(page),
    };
    return (
      <Modal {...modalProps}>
        <Table {...tableProps} bordered />
      </Modal>
    );
  }
}
