/**
 * 以配置的方式生成筛选头和表单头
 * @date: 2020-1-1
 * @author DTM <ou.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { memo, useCallback, useState, useEffect, Fragment } from 'react';
import {
  Input,
  Button,
  Form,
  Row,
  Col,
  DatePicker,
  Select,
  Switch,
  Collapse,
  Icon,
  Spin,
} from 'hzero-ui';
import { queryUnifyIdpValue } from 'services/api';
import moment from 'moment';
import { isEqual, compose, partialRight } from 'lodash';

import Lov from 'components/Lov';
import { getDateFormat, getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT, DATETIME_MIN } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

const tenantId = getCurrentOrganizationId();
const organizationId = getUserOrganizationId();

// 自定义setState函数
const useSetState = (initialState) => {
  const [state, set] = useState(initialState);
  const setState = useCallback(
    (newState) => {
      set((prevState) => ({ ...prevState, ...newState }));
    },
    [set]
  );
  return { state, setState };
};

const FormItem = Form.Item;
const { Panel } = Collapse;
const { Option } = Select;
const { TextArea } = Input;

// const FilterContext = createContext({});

// 非TextArea布局配置
const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

// TextArea布局配置
const formLayoutt = {
  labelCol: { span: 7 },
  wrapperCol: { span: 17 },
};

// 二次封装组件配置表
const componentTypeS = {
  // 二次封装Input组件
  Input_: (props) => {
    return <Input {...props} />;
  },
  // 二次封装Switch组件
  Switch_: (props) => {
    return <Switch {...props} />;
  },
  // 二次封装Lov组件
  Lov_: (props) => {
    return <Lov {...props} />;
  },
  // 二次封装DatePicker组件
  DatePicker_: (props) => {
    return (
      <DatePicker
        allowClear
        showToday
        format={getDateFormat()}
        placeholder={null}
        // defaultValue={moment()}
        // showTime={{
        //   defaultValue: moment().format(DEFAULT_DATETIME_FORMAT),
        // }}
        showTime={{
          defaultValue: moment().format(DEFAULT_DATETIME_FORMAT),
        }}
        {...props}
      />
    );
  },
  // 二次封装Select组件
  Select_: ({ code, queryParams = {}, ...props }) => {
    const [list, setlist] = useState([]);
    useEffect(() => {
      queryUnifyIdpValue(code, queryParams).then(setlist);
    }, [code]);
    return (
      <Select allowClear {...props}>
        {(list || []).map(({ meaning, value }) => (
          <Option key={value} value={value}>
            {meaning}
          </Option>
        ))}
      </Select>
    );
  },
  // 二次封装只读组件
  Div_: ({ val, ...props }) => {
    return <div {...props}>{val}</div>;
  },
  // 二次封装TextArea组件
  TextArea_: (props) => {
    return <TextArea {...props} />;
  },
};

// 筛选头组件
const FilterForm_ = (props) => {
  const {
    form,
    visible,
    dispatch,
    loading = false,
    pagination = {},
    customizeFilterForm,
    onSearch = () => {},
    getQuery = () => {}, // 获取筛选数据
    // updateState = () => {},
    getFilterData = () => {}, // 筛选头配置表
    form: { validateFields, resetFields, getFieldDecorator, getFieldValue, ...rest },
  } = props;

  // 自定义状态默认空对象
  const { state, setState } = useSetState({
    pcKindCode: [],
  });

  useEffect(() => {
    fetchLov();
  }, []);

  const fetchLov = useCallback(() => {
    dispatch({
      type: 'orderMaintenanceEntry/fetchLov',
    }).then((res = {}) => {
      setState({
        pcKindCode: res.pcKindCode,
      });
    });
  }, []);

  const { pcKindCode } = state;

  // 获取筛选配置表
  const FilterData =
    getFilterData({
      form: { validateFields, resetFields, getFieldValue, ...rest },
      tenantId,
      organizationId,
      state,
      setState,
    }) || [];

  const handleFormReset = () => {
    form.resetFields();
  };

  // 搜索函数
  const handleSearch = useCallback(() => {
    validateFields((err, values) => {
      if (err) return;
      const value = { ...values };
      FilterData.forEach(({ type, dataIndex, dateFlag }) => {
        if (type === 'DatePicker_') {
          if (dateFlag === 'date') {
            value[dataIndex] = values[dataIndex] && values[dataIndex].format(DATETIME_MIN);
          } else {
            value[dataIndex] =
              values[dataIndex] && values[dataIndex].format(DEFAULT_DATETIME_FORMAT);
          }
        } else if (type === 'Switch_') {
          value[dataIndex] = values[dataIndex] ? 1 : 0;
        }
      });
      getQuery(value);
      onSearch(pagination, value, 1);
    });
  }, [pagination, loading]);

  // 控制显示与否
  // const [visible, setVisible] = useState(false);
  const setVisible = (flag) => {
    dispatch({
      type: 'orderMaintenanceEntry/updateState',
      payload: {
        visible: flag,
      },
    });
  };

  return customizeFilterForm(
    {
      form,
      expand: visible,
      code: 'SODR.REFERENCE_PURCHASE_AGREEMENT.FILTER',
    },
    <Form layout="inline" className="more-fields-search-form">
      <Row>
        <Col span={18}>
          <Row>
            <Col span={8}>
              <Form.Item
                {...formItemLayout}
                label={intl
                  .get('spcm.orderMaintenanceEntry.model.common.orderNumber')
                  .d('采购协议编号')}
              >
                {getFieldDecorator('pcNum')(<Input />)}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get('sodr.orderMaintain.sourceFrom.pcName').d('采购协议名称')}
                {...formItemLayout}
              >
                {getFieldDecorator('pcName')(<Input />)}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get('sodr.orderMaintain.sourceFrom.supplierCompanyId').d('协议对象')}
                {...formItemLayout}
              >
                {getFieldDecorator('supplierCompanyId')(
                  <Lov
                    code="SPCM.USER_AUTH.SUPPLIER"
                    textField="supplierCompanyName"
                    queryParams={{ tenantId }}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row
            // {...SEARCH_FORM_ROW_LAYOUT}
            style={{ display: visible ? 'block' : 'none' }}
          >
            <Col span={8}>
              <Form.Item label={intl.get(`entity.company.tag`).d('公司')} {...formItemLayout}>
                {getFieldDecorator('companyId')(
                  <Lov
                    code="SPCM.USER_AUTH.COMPANY"
                    textField="companyName"
                    queryParams={{ tenantId }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get('sodr.orderMaintain.sourceFrom.pcKindCode').d('协议性质')}
                {...formItemLayout}
              >
                {getFieldDecorator('pcKindCode')(
                  <Select allowClear>
                    {pcKindCode?.map((item) => (
                      <Select.Option key={item.value}>{item.meaning}</Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get('sodr.orderMaintain.sourceFrom.pcType').d('协议类型')}
                {...formItemLayout}
              >
                {getFieldDecorator('pcTypeId')(
                  <Lov
                    code="SPCM.PC_TYPE"
                    textField="pcTypeName"
                    queryParams={{
                      companyId: getFieldValue('companyId'),
                      tenantId,
                    }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              {/* <Form.Item
                label={intl.get('sodr.orderMaintain.sourceFrom.pcHeaderId').d('主协议编码')}
                {...formItemLayout}
              >
                {getFieldDecorator('pcHeaderId')(
                  <Lov code="SPCM.CONTRACT" textField="displaySupplierName" />
                )}
              </Form.Item> */}
              <Form.Item
                label={intl.get('sodr.orderMaintain.sourceFrom.pcHeaderId').d('主协议编码')}
                {...formItemLayout}
              >
                {getFieldDecorator('mainContractId')(
                  <Lov code="SPCM.CONTRACT" textField="displaySupplierName" />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={intl.get('entity.roles.creator').d('创建人')} {...formItemLayout}>
                {getFieldDecorator('createdByName')(<Input />)}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get('hzero.common.date.creation.from').d('创建日期从')}
                {...formItemLayout}
              >
                {getFieldDecorator('creationDateFrom')(
                  <DatePicker
                    format={getDateFormat()}
                    placeholder={null}
                    disabledDate={(currentDate) =>
                      getFieldValue('creationDateTo') &&
                      moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
                    }
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get('hzero.common.date.creation.to').d('创建日期至')}
                {...formItemLayout}
              >
                {getFieldDecorator('creationDateTo')(
                  <DatePicker
                    format={getDateFormat()}
                    placeholder={null}
                    disabledDate={(currentDate) =>
                      getFieldValue('creationDateFrom') &&
                      moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
                    }
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get('sodr.orderMaintain.sourceFrom.itemName').d('物品')}
                {...formItemLayout}
              >
                {getFieldDecorator('itemName')(<Input />)}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                {...formItemLayout}
                label={intl.get(`sodr.orderMaintain.sourceFrom.pendingFlag`).d('是否暂挂')}
              >
                {getFieldDecorator('pendingFlag', {
                  initialValue: '0',
                })(
                  <Select style={{ width: '100%' }}>
                    <Select.Option value="1">{intl.get(`hzero.common.yes`).d('是')}</Select.Option>
                    <Select.Option value="0">{intl.get(`hzero.common.no`).d('否')}</Select.Option>
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
        </Col>
        <Col span={6} className="search-btn-more">
          <FormItem>
            {FilterData.length > 3 &&
              (visible ? (
                <Button onClick={() => setVisible(false)}>
                  {intl.get('hzero.common.button.collected').d('收起查询')}
                </Button>
              ) : (
                <Button onClick={() => setVisible(true)}>
                  {intl.get('hzero.common.button.viewMore').d('更多查询')}
                </Button>
              ))}
            <Button data-code="reset" onClick={() => handleFormReset()}>
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
            <Button
              data-code="search"
              type="primary"
              htmlType="submit"
              onClick={handleSearch}
              loading={loading}
            >
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
          </FormItem>
        </Col>
      </Row>
    </Form>
  );
};

// 导出筛选头组件
export const FilterForm = compose(
  partialRight(memo, (o1, o2) => {
    return isEqual(o1.pagination, o2.pagination) && isEqual(o1.visible, o2.visible);
  }),
  Form.create({ fieldNameProp: null }),
  withCustomize({
    unitCode: ['SODR.REFERENCE_PURCHASE_AGREEMENT.FILTER'],
  })
)(FilterForm_);

// 表单头头布局函数
const HeaderRows = ({ item: [i1 = {}, i2 = {}, i3 = {}] }) => (
  <Row gutter={48} className={i1.type === 'TextArea_' ? 'half-row' : 'writable-row'}>
    <Col span={i1.type === 'TextArea_' ? 10 : 8}>{i1.com}</Col>
    {i1.type !== 'TextArea_' && [<Col span={8}>{i2.com}</Col>, <Col span={8}>{i3.com}</Col>]}
  </Row>
);

// 表单头渲染函数
const HeaderRender = ({ HeaderData, form: { getFieldDecorator }, dataSource = {} }) => {
  const newRows = [[]];
  (HeaderData || []).forEach(({ type, label, dataIndex, rules = [], ...rest }) => {
    const Child = componentTypeS[type];
    const val = dataSource[dataIndex];
    const Item = (
      <FormItem {...(type === 'TextArea_' ? formLayoutt : formLayout)} label={label}>
        {getFieldDecorator(dataIndex, {
          initialValue: val,
          rules,
        })(<Child {...rest} val={val} />)}
      </FormItem>
    );
    const com = {
      com: Item,
      type,
    };
    if (type === 'TextArea_') {
      newRows.push([com]);
      newRows.push([]);
    } else {
      const last = newRows[newRows.length - 1];
      if (last.length >= 3) {
        newRows.push([com]);
      } else {
        last.push(com);
      }
    }
  });
  return newRows.map((item) => <HeaderRows item={item} />);
};

// 表单头组件
const HeaderForm_ = ({
  getHeaderData, // 获取表单头
  form,
  title, // 折叠标题头
  dataSource, // 表单头初始数据
  loading = false,
  headerRef = {}, // 设置表单头ref
}) => {
  // 自定义状态默认空对象
  const { state, setState } = useSetState({});

  // 获取表单头配置表
  const HeaderData = getHeaderData({ form, state, setState, tenantId, organizationId }) || [];

  // 初始化表单头ref
  useEffect(() => {
    // eslint-disable-next-line no-param-reassign
    headerRef.form = form;
    // eslint-disable-next-line no-param-reassign
    headerRef.validateFields = () => {
      let data = {};
      form.validateFields((err, values) => {
        data = { err, values };
      });
      if (!data.err) {
        HeaderData.forEach(({ type, dataIndex }) => {
          if (type === 'DatePicker_') {
            data.values[dataIndex] =
              data.values[dataIndex] && data.values[dataIndex].format(DEFAULT_DATETIME_FORMAT);
          } else if (type === 'Switch_') {
            data.values[dataIndex] = data.values[dataIndex] ? 1 : 0;
          }
        });
      }
      return data;
    };
  }, []);

  return (
    <Collapses title={title}>
      <Spin spinning={loading}>
        <Form>
          <HeaderRender
            {...{
              HeaderData,
              dataSource,
              form,
            }}
          />
        </Form>
      </Spin>
    </Collapses>
  );
};

// 导出表单头组件
export const HeaderForm = compose(
  partialRight(memo, (o1, o2) => isEqual(o1, o2)),
  Form.create({ fieldNameProp: null })
)(HeaderForm_);

// 二次封装折叠组件
export const Collapses = ({ title, children }) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="ued-detail-wrapper">
      <Collapse
        className="form-collapse"
        defaultActiveKey="1"
        onChange={() => setCollapsed((t) => !t)}
      >
        <Panel
          key="1"
          style={{ width: '100%' }}
          header={
            <Fragment>
              <h3>{title}</h3>
              <a>
                {collapsed
                  ? intl.get('hzero.common.button.expand').d('展开')
                  : intl.get('hzero.common.button.up').d('收起')}
                <Icon type={collapsed ? 'up' : 'down'} />
              </a>
            </Fragment>
          }
          showArrow={false}
        >
          {children}
        </Panel>
      </Collapse>
    </div>
  );
};
