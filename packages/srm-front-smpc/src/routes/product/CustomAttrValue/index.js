import React, { Component, Fragment } from 'react';
import {
  Button,
  Table,
  DataSet,
  Modal,
  Form,
  TextField,
  NumberField,
  Select,
  Lov,
  Switch,
  IntlField,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { enableRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';

import CustomAttrValueDs from './CustomAttrValueDs';

const RightForm = observer(({ record }) => {
  const inputMethod = record.get('inputMethod');
  return (
    <Form record={record} labelLayout="float">
      <IntlField name="customAttrValueName" />
      <NumberField name="orderSeq" />
      <Lov name="tenantLov" />
      <Select name="inputMethod" />
      <Select
        name="componentType"
        optionsFilter={(r) => {
          if (inputMethod === 'MANUAL') {
            return ['LOV', 'SELECT'].includes(r.get('value'));
          } else {
            return !['LOV', 'SELECT'].includes(r.get('value'));
          }
        }}
      />
      <Lov name="bindValueCodeLov" />
      {inputMethod === 'SYSTEM' && <TextField name="displayField" />}
      <TextField name="remark" />
      <Switch name="enabledFlag" />
    </Form>
  );
});

@formatterCollections({ code: ['smpc.customAttrValue'] })
@withProps(
  () => ({
    ds: new DataSet(CustomAttrValueDs()),
  }),
  { keepOriginDataSet: true }
)
export default class CustomAttrValue extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.ds.query();
  }

  getColumns = () => {
    return [
      { name: 'customAttrValueName', minWidth: 200 },
      { name: 'orderSeq', width: 100, align: 'left' },
      { name: 'tenantName', width: 200 },
      { name: 'inputMethod', width: 100 },
      { name: 'componentType', width: 100 },
      { name: 'lovCode', width: 180 },
      { name: 'displayField', width: 100 },
      { name: 'remark', width: 240 },
      { name: 'enabledFlag', width: 100, renderer: ({ value }) => enableRender(value) },
      {
        name: 'action',
        width: 100,
        lock: 'right',
        renderer: ({ record }) => (
          <a onClick={() => this.handleOpenModal(record)}>
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      },
    ];
  };

  handleCreate = () => {
    const record = this.props.ds.create({ enabledFlag: 1 });
    this.handleOpenModal(record, true);
  };

  handleOpenModal = (record, isCreate = false) => {
    const { ds } = this.props;
    const title = isCreate
      ? intl.get('smpc.customAttrValue.view.title.createAttrValue').d('新建属性值')
      : intl.get('smpc.customAttrValue.view.title.editAttrValue').d('编辑属性值');
    Modal.open({
      title,
      drawer: true,
      closable: true,
      style: { width: 380 },
      onOk: async () => {
        const flag = await ds.validate();
        if (flag) {
          await ds.submit();
          ds.query(isCreate ? 1 : ds.currentPage);
        }
        return flag;
      },
      onCancel: () => {
        if (isCreate) {
          ds.remove(record);
        } else {
          record.reset();
        }
      },
      children: <RightForm record={record} />,
    });
  };

  render() {
    const { ds } = this.props;
    return (
      <Fragment>
        <Header
          title={intl.get('smpc.customAttrValue.view.title.customAttrValue').d('定制品属性值管理')}
        >
          <Button color="primary" icon="add" onClick={this.handleCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <Table dataSet={ds} columns={this.getColumns()} />
        </Content>
      </Fragment>
    );
  }
}
