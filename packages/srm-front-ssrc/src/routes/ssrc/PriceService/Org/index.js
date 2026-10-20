/**
 * 价格服务-租户
 * @date: 2020-06-08
 * @author: chenjuan <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import {
  DataSet,
  Table,
  Button,
  Modal,
  Form,
  TextField,
  Select,
  Switch,
  Lov,
  IntlField,
  CheckBox,
} from 'choerodon-ui/pro';
import { Tag, Tabs, Collapse } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { operateModal } from '@/routes/spc/components/OperationRecord/operateModal';
import { savePriceServiceOrg } from '@/services/priceServiceService.js';
import styles from '../index.less';
import { listLineDS, drawerFormDS, templateFormDs, inputParamsDS } from './lineDS';
// import style from '../index.less';

const organizationId = getCurrentOrganizationId();
const { TabPane } = Tabs;
const { Panel } = Collapse;

const RenderPriceStrategy = observer((props) => {
  const { dataSet } = props;
  return (
    <Collapse bordered={false} defaultActiveKey={[]} className={styles['collapse-card']}>
      <Panel
        header={intl.get('ssrc.priceService.view.title.priceStrategy').d('取价策略')}
        key="priceStrategy"
      >
        <h3 className={styles['card-sub-title']} style={{ marginTop: '16px' }}>
          <div className={styles['card-sub-title-line']} />
          {intl.get('ssrc.priceService.view.title.priceSource').d('价格来源')}
        </h3>
        <Form dataSet={dataSet} columns={2} labelLayout="float">
          <Select name="priceType" clearButton={false} />
          {/* {dataSet.current.get('priceType') === 'FORMULA_PRICING' && (
            <CheckBox name="priceLibPriceFlag" />
          )} */}
        </Form>
        <h3 className={styles['card-sub-title']} style={{ marginTop: '16px' }}>
          <div className={styles['card-sub-title-line']} />
          {intl.get('ssrc.priceService.view.title.priceDiscount').d('价格折扣')}
        </h3>
        <Form dataSet={dataSet} columns={2} labelLayout="float">
          <CheckBox name="priceDiscountFlag" />
        </Form>
      </Panel>
    </Collapse>
  );
});
// const { Column } = Table;
@formatterCollections({ code: ['ssrc.priceService'] })
export default class PriceService extends PureComponent {
  tableDs = new DataSet(listLineDS());

  drawerFormDs = new DataSet(drawerFormDS());

  templateDs = new DataSet(templateFormDs());

  inputParamsDs = new DataSet(inputParamsDS(this.drawerFormDs));

  @Bind()
  getColumns() {
    const columns = [
      {
        name: 'dimensionCodeLov',
        width: 150,
        editor: true,
      },
      {
        name: 'dimensionName',
        width: 150,
      },
      {
        name: 'sourceMethod',
        width: 120,
        editor: (record) => ['LOV', 'SELECT'].includes(record?.get('fieldWidget')),
      },
      {
        name: 'defaultValue',
        width: 150,
        // 来源方式为固定值
        editor: (record) => record?.get('sourceMethod') === 'serviceFixed',
      },
      {
        name: 'dimensionType',
        width: 100,
        editor: (record) => ['DATE_PICKER', 'INPUT_NUMBER'].includes(record?.get('fieldWidget')),
      },
      {
        name: 'conExpression',
        width: 100,
        // 查询方式为逻辑查询
        editor: (record) => record?.get('dimensionType') === 'RANGE',
      },
      {
        name: 'enabledFlag',
        width: 100,
        editor: true,
      },
      {
        name: 'isVerify',
        width: 100,
        editor: true,
      },
    ];
    return columns;
  }

  /**
   * 打开-弹框
   */
  @Bind()
  showDrawer(editAble = false) {
    const buttons = ['add', 'delete'];

    Modal.open({
      key: Modal.key(),
      title: intl.get('ssrc.priceService.view.title.priceService').d('价格服务'),
      drawer: true,
      style: {
        width: 1090,
      },
      children: (
        <React.Fragment>
          <Form
            dataSet={this.drawerFormDs}
            columns={2}
            labelLayout="float"
            // className={style['c7n-form-label-required']}
          >
            <TextField name="serviceCode" disabled={editAble} />
            <IntlField name="serviceName" />
            <Select name="sourceFrom" />
            <Switch name="enabledFlag" />
            <Lov name="templateIdLov" />
            <Switch name="summaryFlag" />
            <Lov colSpan={1.5} name="computeFunctionLov" />
            {/* <TextField
              colSpan={1.5}
              name="computeFunction"
              disabled={this.drawerFormDs.toData()[0].comeFrom === 'COPY'}
            /> */}
            <IntlField colSpan={1.5} resize="vertical" name="serviceRemark" type="multipleLine" />
            <IntlField colSpan={1.5} resize="vertical" name="computeLogic" type="multipleLine" />
            <TextField colSpan={1.5} name="computeOutput" />
          </Form>
          <RenderPriceStrategy dataSet={this.drawerFormDs} />
          <Tabs
            activeKey="inputParameters"
            onChange={this.changeTabs}
            style={{ marginTop: '16px' }}
            animated={false}
          >
            <TabPane
              tab={intl.get('ssrc.priceService.view.tab.inputParameters').d('输入参数')}
              key="inputParameters"
            >
              <Table dataSet={this.inputParamsDs} buttons={buttons} columns={this.getColumns()}>
                {/* <Column
                  name="dimensionCodeLov"
                  width={200}
                  editor={(record) => record.status === 'add'}
                />
                <Column name="dimensionName" />
                <Column
                  name="dimensionType"
                  width={200}
                  editor={(record) => record.status === 'add'}
                />
                <Column name="enabledFlag" width={100} editor />
                <Column
                  name="action"
                  header={intl.get('hzero.common.action').d('操作')}
                  width={100}
                  renderer={({ record }) =>
                    record.status === 'add' && (
                      <a onClick={() => this.inputParamsDs.remove(record)}>
                        {intl.get('hzero.common.delete').d('清除')}
                      </a>
                    )
                  }
                /> */}
              </Table>
            </TabPane>
          </Tabs>
        </React.Fragment>
      ),
      onOk: async () => {
        if ((await this.drawerFormDs.validate()) && (await this.inputParamsDs.validate())) {
          const params = [
            {
              ...this.drawerFormDs.toData()[0],
              // priceLibPriceFlag:
              //   this.drawerFormDs.current.get('priceType') !== 'PRICE_OF_SOURCE_FROM'
              //     ? this.drawerFormDs.current?.get('priceLibPriceFlag') || 0
              //     : this.drawerFormDs.current?.get('priceLibPriceFlag'),
              priceDiscountFlag: this.drawerFormDs.current?.get('priceDiscountFlag') || 0,
              priceLibServiceDims: this.inputParamsDs.toData(),
            },
          ];
          const saveRes = getResponse(await savePriceServiceOrg(params));
          if (saveRes && !saveRes.failed) {
            notification.success();
            this.tableDs.query();
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      },
      onCancel: () => true,
      afterClose: () => {
        this.drawerFormDs.reset();
        this.drawerFormDs.removeAll(true);
        this.inputParamsDs.loadData([]);
      },
    });
  }

  /**
   * 打开-弹框
   */
  @Bind()
  showTemplate() {
    Modal.open({
      key: Modal.key(),
      title: intl.get('ssrc.priceService.view.title.selectTemplate').d('选择模板'),
      drawer: true,
      style: {
        width: 400,
      },
      children: (
        <Form dataSet={this.templateDs} columns={1}>
          <TextField name="serviceCode" />
          <TextField name="serviceName" />
          <Lov colSpan={1.5} name="templateIdLov" />
        </Form>
      ),
      onOk: async () => {
        if (await this.templateDs.validate()) {
          const res = await this.templateDs.submit();
          this.tableDs.query();
          return res;
        } else {
          return false;
        }
      },
      onCancel: () => true,
      afterClose: () => this.templateDs.reset(),
    });
  }

  /**
   * 新建
   */
  @Bind()
  handleCreate() {
    this.drawerFormDs.create({});
    this.showDrawer(false);
  }

  /**
   * 编辑
   */
  @Bind()
  handleEdit(record) {
    const data = record.toData();
    this.drawerFormDs.loadData([data]);
    this.inputParamsDs.setQueryParameter('serviceId', data.serviceId);
    this.inputParamsDs.query();
    this.showDrawer(true);
  }

  /**
   * 复制
   */
  @Bind()
  handCopy(record) {
    const data = record.toData();
    this.templateDs.create(data);
    this.showTemplate(true);
  }

  /**
   * 操作记录
   */
  @Bind()
  showOperation(record) {
    operateModal({
      onlyOperation: true,
      docType: 'SERVICE',
      docId: record?.get('serviceId'),
      title: intl.get('ssrc.priceService.view.title.priceServiceDefine').d('价格服务定义'),
    });
  }

  render() {
    const listColumns = [
      {
        name: 'serviceCode',
        width: 120,
      },
      {
        name: 'serviceName',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'serviceRemark',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'computeLogic',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'computeOutput',
        width: 100,
        tooltip: 'overflow',
      },
      {
        name: 'templateName',
        width: 100,
        tooltip: 'overflow',
      },
      {
        name: 'computeFunction',
        width: 100,
        tooltip: 'overflow',
      },
      {
        name: 'sourceFromMeaning',
        width: 100,
        tooltip: 'overflow',
      },
      {
        name: 'comeFrom',
        width: 100,
        tooltip: 'overflow',
        renderer: ({ record }) =>
          record.toData().comeFrom === 'CUSTOMIZE' ? (
            <Tag color="green">{intl.get('hzero.common.custom').d('自定义')}</Tag>
          ) : record.toData().comeFrom === 'PREDEFINED' ? (
            <Tag color="orange">{intl.get('hzero.common.predefined').d('预定义')}</Tag>
          ) : (
            <Tag color="blue">{intl.get('hzero.common.copy').d('复制')}</Tag>
          ),
      },
      {
        name: 'enabledFlag',
        width: 100,
        renderer: ({ value }) => enableRender(value),
      },
      {
        name: 'realName',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'creationDate',
        width: 180,
      },
      {
        name: 'edit',
        width: 100,
        renderer: ({ record }) => (
          <div>
            <a
              onClick={() => this.handleEdit(record)}
              disabled={Number(organizationId) !== record.toData().tenantId}
            >
              {intl.get('hzero.common.button.editor').d('编辑')}
            </a>
            {Number(organizationId) !== record.toData().tenantId && (
              <a onClick={() => this.handCopy(record)} style={{ marginLeft: '15px' }}>
                {intl.get('hzero.common.button.copy').d('复制')}
              </a>
            )}
          </div>
        ),
      },
      {
        name: 'operation',
        width: 120,
        renderer: ({ record }) => (
          <a onClick={() => this.showOperation(record)}>
            {intl.get('hzero.common.button.view').d('查看')}
          </a>
        ),
      },
    ];

    return (
      <Fragment>
        <Header
          title={intl.get('ssrc.priceService.view.title.priceServiceDefine').d('价格服务定义')}
        >
          <Button icon="add" color="primary" funcType="raised" onClick={this.handleCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <Table dataSet={this.tableDs} columns={listColumns} />
        </Content>
      </Fragment>
    );
  }
}
