import React, { Component, Fragment, useState } from 'react';
import { Bind } from 'lodash-decorators';
import uuidv4 from 'uuid/v4';
import {
  DataSet,
  Button,
  Table,
  Icon,
  Form,
  Select,
  TextField,
  IntlField,
  Output,
  SelectBox,
  Dropdown,
  Menu,
  Spin,
  Lov,
  Tooltip,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Observer } from 'mobx-react';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import useRuleConfig from '@/hooks/useRuleConfig';

import { precisionEditor } from '../utilsApi/precision';
import {
  fetchTemplate,
  saveTemplate,
  fetchSpuAttrGroup,
  saveSpuAttrGroup,
  deleteAttrGroup,
  deleteAttrLine,
  deleteSpuAttrGroup,
  deleteSpuAttrLine,
} from './api';
import confirm from '../SkuWorkbench/confirm';
import { attrFormDs, voluaDs, attrGroupHeadDs, attrGroupListDs } from './ds';

import styles from './style.less';

const getClassName = (classNames = {}) => {
  let className = '';
  for (const key in classNames) {
    if (classNames[key]) {
      className += ` ${key}`;
    }
  }
  return className;
};

const Card = observer((props) => {
  const [edit, setEdit] = useState(false);
  const {
    title,
    children,
    ds,
    extra,
    isMall,
    deleteOnly,
    titleEdit = false,
    extraProps = {
      prev: false,
      next: false,
      onPrev: (e) => e,
      onNext: (e) => e,
      onDelete: (e) => e,
    },
  } = props;
  const _title = ds && ds.current ? ds.current.get('attrGroupName') : title;
  const menus = (
    <Menu>
      <Menu.Item onClick={() => setEdit(true)}>
        {intl.get('smpc.product.model.rename').d('重新命名')}
      </Menu.Item>
      {extraProps.prev && (
        <Menu.Item onClick={extraProps.onPrev}>
          {intl.get('smpc.product.model.sortPrev').d('前置一组')}
        </Menu.Item>
      )}
      {extraProps.next && (
        <Menu.Item onClick={extraProps.onNext}>
          {intl.get('smpc.product.model.sortNext').d('后置一组')}
        </Menu.Item>
      )}
    </Menu>
  );
  const extras = (
    <span className={styles['extra-icons']}>
      {!deleteOnly && (
        <Dropdown overlay={menus} placement="bottomRight">
          <Icon type="more_horiz" />
        </Dropdown>
      )}
      <Icon type="delete" style={{ marginLeft: 8 }} onClick={extraProps.onDelete} />
    </span>
  );
  return (
    <div className={styles['attr-card-container']}>
      <div className={getClassName({ 'attr-card-head': true, 'mall-attr-card-head': isMall })}>
        {edit || !_title ? (
          <Form dataSet={ds} labelLayout="float" style={{ width: 300 }}>
            <IntlField
              name="attrGroupName"
              style={{ fontWeight: 600 }}
              autoFocus
              onBlur={() => {
                if (_title) {
                  setEdit(false);
                }
              }}
              onChange={(val) => {
                if (val) {
                  setEdit(false);
                }
              }}
            />
          </Form>
        ) : (
          <span
            className={getClassName({ 'attr-card-title': true, 'edit-title': titleEdit })}
            onClick={() => {
              if (titleEdit) {
                setEdit(true);
              }
            }}
          >
            {_title}
          </span>
        )}
        {extra && <span className="attr-card-extra">{extras}</span>}
      </div>
      <div className="attr-card-body">{children}</div>
    </div>
  );
});

const RadioSelect = ({ title, ...props }) => (
  <div className="radio-wrapper">
    <span className="radio-title">{title}</span>
    <SelectBox {...props} />
  </div>
);

const PricingAttr = observer(
  ({ dataSet, isMall, readOnly, dsMappings, columns, onDelete = (e) => e }) => {
    const uomType = dataSet.current ? dataSet.current.get('saleUnitType') : 'AREA';
    const { ds } = dsMappings.find((f) => f.value === uomType) || {};
    return (
      <Card
        title={intl.get('smpc.product.view.valuationAttr').d('计价属性')}
        extra={!readOnly}
        deleteOnly
        isMall={isMall}
        extraProps={{ onDelete }}
      >
        {readOnly ? (
          <Form
            dataSet={dataSet}
            labelLayout="vertical"
            style={{ width: 680, marginBottom: 16 }}
            columns={2}
            className="c7n-pro-vertical-form-display"
          >
            <Output name="saleUnitTypeMeaning" />
            <Output name="shipper" />
          </Form>
        ) : (
          <Fragment>
            <RadioSelect
              dataSet={dataSet}
              name="saleUnitType"
              title={intl.get('smpc.product.model.oldSaleUomTypes').d('原销售单位类型')}
            />
            <Form
              dataSet={dataSet}
              labelLayout="float"
              style={{ width: 340, marginBottom: 16 }}
              columns={1}
            >
              <Lov name="shipperLov" />
            </Form>
          </Fragment>
        )}
        <Table dataSet={ds} columns={columns} customizedCode="PRICING_ATTR.LIST" />
      </Card>
    );
  }
);

class TemplateDetail extends Component {
  voluaHeadDs = new DataSet(attrGroupHeadDs());

  vlouaMaps = [
    {
      value: 'WEIGHT', // 重量
      ds: new DataSet(voluaDs()),
      nameMsg: intl.get('smpc.product.view.weightMsg').d('例：重量（单位）'),
      factorMsg: intl.get('smpc.product.view.weightFactor').d('例：g和kg的单位系数为1000'),
      data: [
        {
          orderSeq: 0,
          componentPrecision: 0,
          componentName: intl.get('smpc.product.view.weightInitVal').d('重量（kg）'),
        },
      ],
    },
    {
      value: 'LENGTH', // 长度
      ds: new DataSet(voluaDs()),
      nameMsg: intl.get('smpc.product.view.lengthSizeMsg').d('例：长度（单位）'),
      factorMsg: intl.get('smpc.product.view.lengthFactor').d('例：cm和m的单位系数为100'),
      data: [
        {
          orderSeq: 0,
          componentPrecision: 0,
          componentName: intl.get('smpc.product.view.lengthSizeInitVal').d('长度（米）'),
        },
      ],
    },
    {
      value: 'AREA', // 面积
      nameMsg: intl.get('smpc.product.view.lengthMsg').d('例：长（单位）'),
      factorMsg: intl.get('smpc.product.view.lengthFactor').d('例：cm和m的单位系数为100'),
      ds: new DataSet(voluaDs()),
      data: [
        {
          orderSeq: 0,
          componentPrecision: 0,
          componentName: intl.get('smpc.product.view.lengthInitVal').d('长（米）'),
        },
        {
          orderSeq: 1,
          componentPrecision: 0,
          componentName: intl.get('smpc.product.view.widthInitVal').d('宽（米）'),
          nameMsg: intl.get('smpc.product.view.widthMsg').d('例：宽（单位）'),
          factorMsg: intl.get('smpc.product.view.lengthFactor').d('例：cm和m的单位系数为100'),
        },
      ],
    },
    {
      value: 'VOLUME', // 体积
      ds: new DataSet(voluaDs()),
      nameMsg: intl.get('smpc.product.view.lengthMsg').d('例：长（单位）'),
      factorMsg: intl.get('smpc.product.view.lengthFactor').d('例：cm和m的单位系数为100'),
      data: [
        {
          orderSeq: 0,
          componentPrecision: 0,
          componentName: intl.get('smpc.product.view.lengthInitVal').d('长（米）'),
          nameMsg: intl.get('smpc.product.view.lengthMsg').d('例：长（单位）'),
          factorMsg: intl.get('smpc.product.view.lengthFactor').d('例：cm和m的单位系数为100'),
        },
        {
          orderSeq: 1,
          componentPrecision: 0,
          componentName: intl.get('smpc.product.view.widthInitVal').d('宽（米）'),
          nameMsg: intl.get('smpc.product.view.widthMsg').d('例：宽（单位）'),
          factorMsg: intl.get('smpc.product.view.lengthFactor').d('例：cm和m的单位系数为100'),
        },
        {
          orderSeq: 2,
          componentPrecision: 0,
          componentName: intl.get('smpc.product.view.heightInitVal').d('高（米）'),
          nameMsg: intl.get('smpc.product.view.heightMsg').d('例：高（单位）'),
          factorMsg: intl.get('smpc.product.view.lengthFactor').d('例：cm和m的单位系数为100'),
        },
      ],
    },
  ];

  constructor(props) {
    super(props);
    const { modal, readOnly, entrance = 'temp' } = props;
    this.formDs = new DataSet(attrFormDs(entrance));
    modal.handleOk(() => {
      if (readOnly) return true;
      return this.handleValidate();
    });
    this.state = {
      loading: false,
      isPricing: false,
      attrGroups: [],
    };
  }

  componentDidMount() {
    const { spuId, templateId, data, entrance = 'temp', customGroupList } = this.props;
    if (data) {
      this.initGroupList({ groupList: data });
      return false;
    }
    if (templateId || spuId) {
      if (entrance === 'temp') {
        this.fetchTemplate(templateId);
      } else {
        this.fetchSpuAttrGroup(spuId);
      }
    } else {
      this.formDs.create({});
      this.initGroupList({ groupList: customGroupList || [], isCreate: true });
    }
  }

  initGroupList = ({ groupList, keyDel = false }) => {
    const { readOnly } = this.props;
    const attrGroups = [];
    let voluaInit = false;
    groupList.forEach((f) => {
      const { customDetailList, ...groupHeader } = f;
      if (keyDel) delete groupHeader.groupId;
      if (f.pricingFlag) {
        this.voluaHeadDs.loadData([groupHeader]);
        this.initVoluation(f.saleUnitType, customDetailList || []);
        voluaInit = true;
      } else {
        const head = new DataSet(attrGroupHeadDs());
        const table = new DataSet(attrGroupListDs(readOnly));
        head.loadData([groupHeader]);
        const tableData = (customDetailList || []).map((attrLine) => {
          const detail = attrLine;
          if (keyDel) {
            delete detail.groupId;
            delete detail.detailId;
          }
          return detail;
        });
        table.loadData(tableData);
        attrGroups.push({
          head,
          table,
          ...groupHeader,
          attrGroupKey: uuidv4(),
        });
      }
    });
    if (!voluaInit) {
      this.voluaHeadDs.loadData([]); // 清空上次初始
      this.voluaHeadDs.create({
        pricingFlag: 1,
        shipperFlag: 1,
        saleUnitType: 'AREA',
        attrGroupName: intl.get('smpc.product.view.valuationAttr').d('计价属性'),
      });
      this.initVoluation();
    }
    this.setState({ attrGroups, isPricing: voluaInit });
  };

  initVoluation = (_value, _data) => {
    this.vlouaMaps.forEach((f) => {
      const { ds, value, data, nameMsg, factorMsg } = f;
      let initData = data;
      let isLoad = false;
      if (value === _value && _data.length > 0) {
        initData = _data;
        isLoad = true;
      }
      if (isLoad) {
        ds.loadData(initData.map((m) => ({ ...m, nameMsg, factorMsg })));
      } else {
        ds.loadData([]);
        initData.forEach((_f) => {
          ds.create({ nameMsg, factorMsg, ..._f });
        });
      }
    });
  };

  @Bind
  async fetchTemplate(templateId, keyDel = false) {
    const { entrance = 'temp' } = this.props;
    this.setState({ loading: true });
    const res = getResponse(await fetchTemplate({ templateId, pricingGroup: entrance === 'temp' }));
    if (res) {
      const { customGroupList, ...header } = res;
      if (!keyDel) {
        this.formDs.loadData([header]);
      } else {
        // this.formDs.loadData([]);
        this.formDs.current.set('deleteFlag', 1);
      }
      this.initGroupList({ groupList: customGroupList || [], keyDel });
    }
    this.setState({ loading: false });
  }

  @Bind
  async fetchSpuAttrGroup(spuId) {
    this.setState({ loading: true });
    const res = getResponse(await fetchSpuAttrGroup({ spuId }));
    if (res) {
      const groupList = res || [];
      this.formDs.create({ deleteFlag: 0 });
      this.initGroupList({ groupList, isCreate: groupList.length < 1 });
    }
    this.setState({ loading: false });
  }

  @Bind
  voluaColumns() {
    const { readOnly } = this.props;
    return [
      {
        name: 'componentName',
        width: 240,
        editor: (record) => {
          if (readOnly) return false;
          const nameMsg = record.get('nameMsg');
          return <IntlField placeholder={nameMsg} />;
        },
      },
      {
        name: 'orderSeq',
        width: 100,
        align: 'left',
        editor: !readOnly,
      },
      {
        name: 'componentType',
        width: 200,
      },
      {
        name: 'componentPrecision',
        width: 100,
        editor: !readOnly,
      },
      {
        name: 'unitCoefficient',
        width: 260,
        editor: (record) => {
          if (readOnly) return false;
          const factorMsg = record.get('factorMsg');
          return precisionEditor({
            record,
            name: 'unitCoefficient',
            precision: 10,
            placeholder: factorMsg,
          });
        },
      },
      {
        name: 'requiredFlag',
        width: 100,
      },
    ];
  }

  @Bind
  attrGroupColumns() {
    const { readOnly } = this.props;
    const columns = [
      {
        name: 'componentName',
        minWidth: 240,
        editor: () => {
          if (readOnly) return false;
          return <IntlField />;
        },
      },
      {
        name: 'orderSeq',
        width: 100,
        align: 'left',
        editor: !readOnly,
      },
      {
        name: 'componentType',
        width: 120,
        editor: !readOnly,
      },
      {
        name: 'componentPrecision',
        width: 100,
        editor: (record) => !readOnly && record.get('componentType') === 'INPUT_NUMBER',
        renderer: ({ record, text }) => {
          if (record.get('componentType') !== 'INPUT_NUMBER') {
            return '-';
          }
          return text;
        },
      },
      {
        name: 'remark',
        width: 200,
        editor: !readOnly,
      },
      {
        name: 'inputMethod',
        width: 200,
        editor: !readOnly,
      },
      {
        name: 'lovObj',
        width: 180,
        editor: !readOnly,
      },
      {
        name: 'requiredFlag',
        width: 100,
        editor: !readOnly,
      },
    ];

    // if (!readOnly) {
    //   columns.push({
    //     name: 'action',
    //     width: 80,
    //     lock: 'right',
    //     renderer: ({ record }) => (
    //       <a onClick={() => this.handleDeleteLine(ds, record)}>
    //         {intl.get('hzero.common.button.delete').d('删除')}
    //       </a>
    //     ),
    //   });
    // }

    return columns;
  }

  groupCount = 1;

  @Bind
  handleAddGroup() {
    const { attrGroups } = this.state;
    const head = new DataSet(attrGroupHeadDs());
    const table = new DataSet(attrGroupListDs());
    head.create({
      // attrGroupName: intl
      //   .get('smpc.product.view.attrCusGroup', { count: this.groupCount })
      //   .d(`自定义属性组${this.groupCount}`),
      pricingFlag: 0,
    });
    table.create({ orderSeq: 0 }, 0);
    const newGroup = {
      head,
      table,
      attrGroupKey: uuidv4(),
    };
    this.groupCount++;
    this.setState({ attrGroups: [...attrGroups, newGroup] });
  }

  @Bind
  async handleValidate() {
    const { attrGroups, isPricing } = this.state;
    const formFlag = await this.formDs.validate();
    const voluaHeadFlag = isPricing ? await this.voluaHeadDs.validate() : true;

    // 模板头+计价属性头校验
    if (!(formFlag && voluaHeadFlag)) return false;
    const detailHeader = this.formDs.current.toData();
    const voluaHeader = this.voluaHeadDs.current.toData();
    const customGroupList = [];

    // 计价属性
    if (isPricing) {
      const { ds: voluationDs } =
        this.vlouaMaps.find((f) => f.value === voluaHeader.saleUnitType) || {};
      const voluaFlag = await voluationDs.validate();
      if (!voluaFlag) return false;
      const customDetailList = voluationDs.toData();
      customGroupList.push({
        ...voluaHeader,
        customDetailList,
      });
    }

    // 自定义属性组校验
    const groupDsList = [];
    attrGroups.forEach((f) => {
      const { head, table, orderSeq } = f;
      const groupHeader = head.current.toData();
      const customDetailList = table.toData().map((m) => {
        return {
          ...m,
          componentPrecision: m.componentType === 'INPUT_NUMBER' ? m.componentPrecision : 0,
        };
      });
      groupDsList.push(head);
      groupDsList.push(table);
      customGroupList.push({
        ...groupHeader,
        orderSeq,
        customDetailList,
      });
    });

    const res = await Promise.all(groupDsList.map((m) => m.validate()));

    const flag = res.some((s) => !s);

    if (flag) return false;
    return this.handleSave({
      enabledFlag: 1,
      ...detailHeader,
      customGroupList,
    });
  }

  @Bind
  async handleSave(params) {
    const { spuId, templateId, entrance = 'temp', afterSave = (e) => e } = this.props;
    const api = () =>
      entrance === 'temp' ? saveTemplate(params) : saveSpuAttrGroup({ spuId, ...params });
    const res = getResponse(await api());
    if (res) {
      notification.success();
      afterSave(templateId);
    } else {
      return false;
    }
  }

  @Bind
  async handleDeletePricing() {
    const { entrance = 'temp' } = this.props;
    const pricingGroup = this.voluaHeadDs.current.toData();
    const api = entrance === 'temp' ? deleteAttrGroup : deleteSpuAttrGroup;
    const deleteStatic = () => {
      this.setState({ isPricing: false });
      this.voluaHeadDs.loadData([]);
      this.voluaHeadDs.create({
        pricingFlag: 1,
        shipperFlag: 1,
        saleUnitType: 'AREA',
        attrGroupName: intl.get('smpc.product.view.valuationAttr').d('计价属性'),
      });
      this.initVoluation();
    };
    if (pricingGroup.groupId) {
      this.setState({ loading: true });
      const res = getResponse(await api(pricingGroup));
      this.setState({ loading: false });
      if (res) {
        notification.success();
        deleteStatic();
      }
    } else {
      deleteStatic();
    }
  }

  @Bind
  async handleDeleteGroup(attrGroup) {
    const { entrance = 'temp' } = this.props;
    const { attrGroups } = this.state;
    const api = entrance === 'temp' ? deleteAttrGroup : deleteSpuAttrGroup;
    const delFn = () => {
      const filterGroups = attrGroups.filter((f) => f.attrGroupKey !== attrGroup.attrGroupKey);
      this.setState({ attrGroups: filterGroups });
    };
    if (attrGroup.groupId) {
      this.setState({ loading: true });
      const res = getResponse(await api(attrGroup));
      this.setState({ loading: false });
      if (res) {
        notification.success();
        delFn();
      }
    } else {
      delFn();
    }
  }

  @Bind
  async handleDeleteLine(_ds) {
    const { entrance = 'temp' } = this.props;
    const ds = _ds;
    const api = entrance === 'temp' ? deleteAttrLine : deleteSpuAttrLine;
    const data = ds.selected || [];
    data.forEach(async (record) => {
      if (record.get('detailId')) {
        ds.status = 'loading';
        const res = getResponse(await api(record.toData()));
        ds.status = 'ready';
        if (res) {
          notification.success();
          Object.assign(record, { status: 'add' });
          ds.remove(record);
        }
      } else {
        Object.assign(record, { status: 'add' });
        ds.remove(record);
      }
    });
  }

  renderField = ({ type = 'text', readOnly = false, ...props }) => {
    const formFieldMap = {
      intl: IntlField,
      text: TextField,
      select: Select,
    };
    const ResField = readOnly ? Output : formFieldMap[type] || TextField;
    return <ResField {...props} />;
  };

  render() {
    const { loading, attrGroups, isPricing } = this.state;
    const { readOnly, isMall, entrance = 'temp', uomConfig } = this.props;
    const isSpuReadOnly = entrance !== 'temp' && readOnly;
    return (
      <div className={styles['template-wrapper']}>
        <Spin spinning={loading}>
          <Form
            columns={readOnly ? 3 : 2}
            dataSet={this.formDs}
            labelLayout={readOnly ? 'vertical' : 'float'}
            style={{ marginBottom: isSpuReadOnly ? 0 : 32, width: readOnly ? 1020 : 680 }}
            className={getClassName({
              'c7n-pro-vertical-form-display': readOnly,
              [styles['c7n-form-wrapper']]: !readOnly,
            })}
          >
            {/* 只读时不应有*， 组件渲染的写法不对 */}
            {entrance === 'temp' &&
              this.renderField({ readOnly, name: 'templateName', type: 'intl' })}
            {entrance === 'temp' && this.renderField({ readOnly, name: 'templateCode' })}
            {entrance !== 'temp' &&
              !readOnly &&
              this.renderField({
                // readOnly: false,
                name: 'template',
                type: 'select',
                noCache: true,
                onChange: (val) => {
                  if (val) {
                    const field = this.formDs.getField('template');
                    const templateName = field.getText(val);
                    confirm({
                      title: intl.get('smpc.product.view.templateApplyTitle').d('模版应用覆盖确认'),
                      content: intl
                        .get('smpc.product.view.templateApplyMsg', { name: templateName })
                        .d(
                          `引用${templateName}模版会覆盖当前编辑内容（根据商城双单位配置开启与否应用模板的计价属性组内容），确定使用该模版吗？`
                        ),
                      onOk: () => this.fetchTemplate(val, true),
                      onCancel: () => {
                        this.formDs.current.set('template', null);
                      },
                    });
                  }
                },
              })}
          </Form>
          {isPricing && (
            <PricingAttr
              isMall={isMall}
              readOnly={readOnly}
              dataSet={this.voluaHeadDs}
              dsMappings={this.vlouaMaps}
              columns={this.voluaColumns()}
              onDelete={this.handleDeletePricing}
            />
          )}
          {attrGroups.map((m, index) => {
            const { head, table, attrGroupKey, ...other } = m;
            const extraProps = {
              prev: index !== 0,
              next: index !== attrGroups.length - 1,
              onPrev: () => {
                const prev = attrGroups[index - 1];
                const prevOrderSeq = prev.orderSeq;
                const currentOrderSeq = m.orderSeq;
                attrGroups[index - 1] = { ...m, orderSeq: prevOrderSeq };
                attrGroups[index] = { ...prev, orderSeq: currentOrderSeq };
                this.setState({ attrGroups });
              },
              onNext: () => {
                const next = attrGroups[index + 1];
                const nextOrderSeq = next.orderSeq;
                const currentOrderSeq = m.orderSeq;
                attrGroups[index + 1] = { ...m, orderSeq: nextOrderSeq };
                attrGroups[index] = { ...next, orderSeq: currentOrderSeq };
                this.setState({ attrGroups });
              },
              onDelete: () => this.handleDeleteGroup({ attrGroupKey, ...other }),
            };
            const addAttr = [
              <Button icon="playlist_add" onClick={() => table.create({ orderSeq: 0 }, 0)}>
                {intl.get('smpc.product.model.addAttr').d('新增属性')}
              </Button>,
              // eslint-disable-next-line react/jsx-indent
              <Observer>
                {() => (
                  <Button
                    funcType="flat"
                    disabled={table.selected.length === 0}
                    icon="delete_sweep"
                    onClick={() => this.handleDeleteLine(table)}
                  >
                    {intl.get('smpc.product.button.batchDelete').d('批量删除')}
                  </Button>
                )}
              </Observer>,
            ];
            const buttons = readOnly ? [] : [...addAttr];
            return (
              <Card
                key={attrGroupKey}
                ds={head}
                titleEdit={!readOnly}
                extra={!readOnly}
                extraProps={extraProps}
                isMall={isMall}
              >
                <Table
                  dataSet={table}
                  columns={this.attrGroupColumns(table)}
                  buttons={buttons}
                  customizedCode="ATTR_GROUP.LIST"
                />
              </Card>
            );
          })}
          {!readOnly && (
            <div className="add-btns">
              {!isPricing && (
                <Tooltip
                  title={
                    uomConfig
                      ? null
                      : intl
                          .get('smpc.product.view.message.doubleUomTip')
                          .d('请在业务规则开启商城双单位后新增计价属性组')
                  }
                >
                  <Button
                    funcType="flat"
                    color="primary"
                    icon="add"
                    disabled={!uomConfig}
                    onClick={() => this.setState({ isPricing: true })}
                  >
                    {intl.get('smpc.product.model.addPricAttrGroup').d('新增计价属性组')}
                  </Button>
                </Tooltip>
              )}
              <Button funcType="flat" color="primary" icon="add" onClick={this.handleAddGroup}>
                {intl.get('smpc.product.model.addCusAttrGroup').d('新增自定义属性组')}
              </Button>
            </div>
          )}
        </Spin>
      </div>
    );
  }
}

export default function TemplateDetailHoc(props) {
  const [uomConfig] = useRuleConfig({ code: 'secondaryUom' });
  return <TemplateDetail {...props} uomConfig={uomConfig} />;
}
