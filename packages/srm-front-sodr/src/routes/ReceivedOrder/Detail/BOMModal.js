import React, { PureComponent } from 'react';
import { Modal, Table, Form, Input } from 'hzero-ui';
import { sum, isNumber } from 'lodash';
import moment from 'moment';
import intl from 'utils/intl';
import { totalRender } from 'utils/renderer';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import ExcelExport from 'components/ExcelExport';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { formatAumont } from '@/routes/components/utils';

const FormItem = Form.Item;
const organizationId = getCurrentOrganizationId();

const Search = ({ form = {}, dataSource = {} }) => {
  const { getFieldDecorator = (e) => e } = form;
  const { itemCode, itemName, poHeaderId, poLineId } = dataSource;
  const otherButtonProps = {
    icon: 'export',
    type: 'primary',
  };
  return (
    <Form layout="inline">
      <FormItem label={intl.get(`entity.item.code`).d('物料编码')}>
        {getFieldDecorator('itemCode', { initialValue: itemCode })(<Input disabled />)}
      </FormItem>
      <FormItem label={intl.get(`entity.item.name`).d('物料名称')}>
        {getFieldDecorator('itemName', { initialValue: itemName })(<Input disabled />)}
      </FormItem>
      <FormItem>
        <ExcelExport
          otherButtonProps={otherButtonProps}
          requestUrl={`${SRM_SPUC}/v1/${organizationId}/po-item-boms/export`}
          queryParams={{ poHeaderId, poLineId }}
        />
      </FormItem>
    </Form>
  );
};

const WrapperSearch = Form.create({ fieldNameProp: null })(Search);

@withCustomize({
  unitCode: ['SODR.SEND_ORDER_DETAIL.BOM_MODAL'],
})
export default class Organization extends PureComponent {
  constructor(props) {
    super(props);
    this.handleSearch = this.handleSearch.bind(this);
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { visible, actionkey } = this.props;
    return visible && prevProps.actionkey !== actionkey;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.handleSearch({ page: 0, size: 10 });
    }
  }

  state = {
    dataSource: [],
    pagination: {
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '50', '100'],
      pageSize: 10,
      total: 0,
      showTotal: totalRender,
    },
  };

  cancel() {
    const { onCancel = (e) => e } = this.props;
    this.setState({
      dataSource: [],
    });
    onCancel();
  }

  handleSearch(params = {}) {
    const { fetchBOM = (e) => e } = this.props;
    fetchBOM(params, (res) => {
      this.setState({
        ...res,
      });
    });
  }

  onTableChange(pagination = {}) {
    const { current = 1, pageSize = 10 } = pagination;
    const { getFieldsValue = (e) => e } = this.wrapperSearch;
    this.handleSearch({ page: current - 1, size: pageSize, ...getFieldsValue() });
  }

  action(params = {}) {
    const { pagination } = this.state;
    const { current = 1, pageSize = 10 } = pagination;
    this.handleSearch({ page: current - 1, size: pageSize, ...params });
  }

  defaultRowkey = 'poItemBomId';

  render() {
    const {
      visible,
      processing,
      itemCode,
      itemName,
      customizeTable,
      poHeaderId,
      poLineId,
    } = this.props;
    const { dataSource, pagination } = this.state;
    const columns = [
      {
        title: intl.get(`sodr.receivedOrder.model.receivedOrder.orderSeq`).d('序号'),
        align: 'center',
        dataIndex: 'orderSeq',
        width: 60,
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        align: 'center',
        dataIndex: 'itemCode',
        width: 100,
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        align: 'center',
        width: 120,
      },
      // {
      //   title: intl.get(`sodr.receivedOrder.model.receivedOrder.description`).d('物料描述'),
      //   align: 'center',
      //   width: 180,
      //   dataIndex: 'itemDescription',
      // },
      {
        title: intl.get(`entity.item.type`).d('物料类型'),
        align: 'center',
        width: 120,
        dataIndex: 'categoryName',
      },
      {
        title: intl.get(`sodr.common.model.common.needQuantity`).d('需求数量'),
        align: 'right',
        width: 120,
        dataIndex: 'quantity',
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get(`sodr.receivedOrder.model.receivedOrder.uomName`).d('单位'),
        align: 'center',
        width: 120,
        dataIndex: 'uomName',
        render: (_, { uomCodeAndName }) => uomCodeAndName,
      },
      {
        title: intl.get(`sodr.receivedOrder.model.receivedOrder.invOrganizationName`).d('收货组织'),
        align: 'center',
        width: 120,
        dataIndex: 'invOrganizationName',
      },
      {
        title: intl.get(`sodr.receivedOrder.model.receivedOrder.needByDate`).d('需求日期'),
        align: 'center',
        width: 120,
        dataIndex: 'needByDate',
        render: (text) => (text ? moment(text).format(DEFAULT_DATE_FORMAT) : text),
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const tableProps = {
      columns,
      rowKey: this.defaultRowkey,
      pagination,
      dataSource,
      loading: processing,
      bordered: true,
      childrenColumnName: 'subMenus',
      onChange: this.onTableChange.bind(this),
      resizable: true,
      scroll: { x: scrollX },
    };

    const wrapperSearchProps = {
      dataSource: { itemCode, itemName, poHeaderId, poLineId },
      ref: (ref) => {
        this.wrapperSearch = ref;
      },
    };

    return (
      <Modal
        title={intl.get(`sodr.receivedOrder.view.message.title.bom`).d('外协BOM')}
        visible={visible}
        onCancel={this.cancel.bind(this)}
        destroyOnClose
        width={700}
        footer={null}
      >
        <WrapperSearch {...wrapperSearchProps} />
        <br />
        {customizeTable(
          {
            code: 'SODR.SEND_ORDER_DETAIL.BOM_MODAL',
          },
          <Table {...tableProps} />
        )}
      </Modal>
    );
  }
}
