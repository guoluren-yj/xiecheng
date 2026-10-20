import React from 'react';

import {
  Form,
  Lov,
  TextField,
  Select,
  NumberField,
  Table,
  Switch,
  TextArea,
  IntlField,
  Button,
  DataSet,
  Modal as Modal1,
  Row,
} from 'choerodon-ui/pro';
import { Modal, Tabs } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';

import intl from 'utils/intl';

import ConditionModal from '../components/conditionModal/index';

import style from './index.less';

import { sqlMappingDs } from './DS/mainDS';

const { Sidebar } = Modal;
const { TabPane } = Tabs;

export default class Drawer extends React.Component {
  sqlMappingDs = new DataSet(sqlMappingDs());

  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      componentType: 'INPUT',
      activityTabKey: 'mappingRelations',
    };
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  /**
   * 新增
   * @memberof PriceLibDimension
   */
  @Bind()
  handleAdd(ds) {
    const record = ds.create({}, 0);
    record.setState('_status', 'create');
  }

  /**
   * 编辑
   * record 行信息
   * @memberof PriceLibDimension
   */
  @Bind()
  handelEdit(record) {
    record.setState('_status', 'update');
  }

  /**
   * 取消
   * record 行信息
   * @memberof PriceLibDimension
   */
  @Bind()
  handleCancel(record) {
    record.reset();
    record.setState('_status', '');
  }

  // 按钮
  @Bind()
  renderButtons(ds) {
    return [
      <Button icon="playlist_add" onClick={() => this.handleAdd(ds)} key="add">
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      ['delete', { color: 'red' }],
    ];
  }

  /**
   * 关闭弹框
   */
  @Bind()
  handleCancelDrawer() {
    this.setState({
      componentType: 'INPUT',
      activityTabKey: 'mappingRelations',
    });
    this.props.onCancel();
  }

  /**
   * 改变tab标签
   */
  @Bind()
  changeTabs(activityKey) {
    this.setState({
      activityTabKey: activityKey,
    });
  }

  @Bind()
  changeComponentType(value) {
    const { basicDrawerFormDs } = this.props;
    this.setState({
      componentType: value,
    });
    basicDrawerFormDs.getField('lovCodeObj').reset();
    basicDrawerFormDs.getField('multipleFlag').reset();

    basicDrawerFormDs.current.set('lovCodeObj', null);
    basicDrawerFormDs.current.set('multipleFlag', null);
  }

  @Bind()
  renderDynamicComponents() {
    // const { basicDrawerFormDs } = this.props;
    const { componentType } = this.state;
    let dynamicComponents = [];
    switch (componentType) {
      case 'LOV':
        dynamicComponents = [<Lov name="lovCodeObj" />];
        break;
      case 'SELECT':
        dynamicComponents = [<Lov name="lovCodeObj" />];
        break;

      default:
        break;
    }
    return dynamicComponents;
  }

  /**
   * 操作记录
   * @param {记录} record
   */
  @Bind()
  openOprationModal(record) {
    const { sqlMapping: orgData = '' } = record.toData();
    this.sqlMappingDs.loadData([{ sqlMapping: orgData }]);
    Modal1.open({
      key: Modal1.key(),
      title: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.mappingsql')
        .d('复杂sql映射'),
      style: {
        width: 680,
      },
      children: (
        <Form dataSet={this.sqlMappingDs}>
          {' '}
          <TextArea style={{ width: '100%' }} name="sqlMapping" />
        </Form>
      ),
      onOk: () => {
        const { sqlMapping = '' } = this.sqlMappingDs.toData()[0]
          ? this.sqlMappingDs.toData()[0]
          : {};
        record.set('sqlMapping', sqlMapping);
        this.sqlMappingDs.reset();
      },
      onCancel: () => {},
    });
  }

  /**
   * 渲染基础维度弹框内容
   */
  @Bind()
  renderBasicChild() {
    const { editor = false, basicDrawerFormDs, basicDrawerMapDs, basicDrawerLovMapDs } = this.props;

    const { componentType, activityTabKey } = this.state;
    // 映射关系columns
    const mappingListColumns = [
      {
        name: 'documentType',
        width: 150,
        editor: true,
      },
      {
        name: 'fieldName',
        width: 200,
        editor: true,
      },
      {
        name: 'fieldNameDesc',
        width: 250,
        tooltip: 'overflow',
        editor: true,
      },
      {
        name: 'mapping',
        width: 100,
        renderer: ({ record }) => (
          <a onClick={() => this.openOprationModal(record)}>
            {intl
              .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.mapping')
              .d('复杂映射')}{' '}
          </a>
        ),
      },
    ];

    // 值集映射关系columns
    const lovMappingListColumns = [
      {
        name: 'mappingItem',
        width: 150,
        tooltip: 'overflow',
        editor: true,
      },
      {
        name: 'mappingItemName',
        width: 120,
        tooltip: 'overflow',
        editor: true,
      },
      {
        name: 'valueField',
        width: 150,
        tooltip: 'overflow',
        editor: true,
      },
      {
        name: 'valueFieldName',
        width: 200,
        tooltip: 'overflow',
        editor: true,
      },
    ];
    return (
      <React.Fragment>
        <Form dataSet={basicDrawerFormDs} columns={2} className={style['c7n-form-label-required']}>
          <TextField
            name="budgetItemCode"
            disabled={!editor}
            placeholder={intl.get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.pattern').d('字母（含大小写）数字下划线，开头必须是字母')}
          />
          <IntlField name="budgetItemName" />
          <Switch name="enabledFlag" />
          <Row
            label={intl
              .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.requiredFlag')
              .d('是否必输')}
          >
            <Switch name="requiredFlag" dataSet={basicDrawerFormDs} />
            <ConditionModal dataSet={basicDrawerFormDs} name="requiredCondition" />
          </Row>
          <Switch name="queryFlag" />
          <NumberField name="gridSeq" />
          <NumberField name="gridWidth" />
          <Select name="componentType" onChange={this.changeComponentType} clearButton={false} />
          {this.renderDynamicComponents()}
          <Select name="encryptFlag" clearButton={false} />
          <Switch name="budgetFlag" />
          <Switch name="multipleFlag" />
          <Switch name="cycleFlag" />
          <Switch name="predefinedFlag" />
          {/* <Switch name="mergeApproveFlag" /> */}
        </Form>
        <Tabs
          activeKey={activityTabKey}
          onChange={this.changeTabs}
          style={{ marginTop: '16px' }}
          animated={false}
        >
          <TabPane
            tab={intl.get('ssrc.budgetAttributeMapping.view.tab.mappingRelations').d('映射关系')}
            key="mappingRelations"
          >
            <Table
              rowHeight="auto"
              dataSet={basicDrawerMapDs}
              columns={mappingListColumns}
              buttons={this.renderButtons(basicDrawerMapDs)}
            />
          </TabPane>
          {componentType === 'LOV' && (
            <TabPane
              tab={intl.get('ssrc.budgetAttributeMapping.view.tab.lovMappings').d('值集映射')}
              key="lovMappings"
            >
              <Table
                dataSet={basicDrawerLovMapDs}
                columns={lovMappingListColumns}
                buttons={this.renderButtons(basicDrawerLovMapDs)}
              />
            </TabPane>
          )}
        </Tabs>
      </React.Fragment>
    );
  }

  render() {
    const { visible = true, onOk, saveLoading } = this.props;
    return (
      <Sidebar
        closable
        destroyOnClose
        width={850}
        title={intl
          .get('ssrc.budgetAttributeMapping.view.title.dimensionConfiguration')
          .d('维度配置')}
        visible={visible}
        onOk={onOk}
        onCancel={this.handleCancelDrawer}
        confirmLoading={saveLoading}
        maskStyle={{ zIndex: 997 }}
        wrapClassName={style['c7n-modal-price-warp']}
      >
        {this.renderBasicChild()}
      </Sidebar>
    );
  }
}
