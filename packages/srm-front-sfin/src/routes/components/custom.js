/**
 * 以配置的方式生成筛选头和表单头
 * @date: 2020-1-1
 * @author DTM <ou.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, {
  memo,
  // createContext,
  useCallback,
  useState,
  useEffect,
  Fragment,
} from 'react';
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
// import moment from 'moment';
import { isEqual, compose, partialRight, isFunction } from 'lodash';

import Lov from 'components/Lov';
import { getDateFormat, getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { SEARCH_FORM_ROW_LAYOUT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';

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
        {(list || [])
          .filter((n) => ['PENDING', 'REJECTED', 'RETURNED'].includes(n.value)) // 此处不公共
          .map(({ meaning, value }) => (
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

// 筛选头布局函数
// const FilterRows = ({ children, index }) => {
//   const { visible = true } = useContext(FilterContext);
//   return (
//     <Row
//       {...SEARCH_FORM_ROW_LAYOUT}
//       style={{ display: index === 1 && (visible ? 'block' : 'none') }}
//     >
//       {children}
//     </Row>
//   );
// };

// 筛选头渲染函数
const FilterRender = ({ FilterData, getFieldDecorator, dataSource, reset, resets, visible }) => {
  const Row1 = [];
  const Row2 = [];
  FilterData.forEach(({ type, label, dataIndex, options = {}, ...rest }, index) => {
    const Child = componentTypeS[type];
    let val = dataSource[dataIndex];
    if (resets) {
      val = undefined;
    } else if (reset && reset.length > 0) {
      val = reset.includes(dataIndex) ? undefined : dataSource[dataIndex];
    }
    const Item = (
      <Col span={8}>
        <FormItem {...formLayout} label={label}>
          {getFieldDecorator(dataIndex, {
            initialValue: val,
            ...options,
          })(<Child {...rest} />)}
        </FormItem>
      </Col>
    );
    if (index < 3) {
      Row1.push(Item);
    } else {
      Row2.push(Item);
    }
  });
  const Rows = [
    <Row {...SEARCH_FORM_ROW_LAYOUT}>{Row1}</Row>,
    <Row
      {...SEARCH_FORM_ROW_LAYOUT}
      style={{ display: FilterData.length > 3 && visible ? 'block' : 'none' }}
    >
      {Row2}
    </Row>,
  ];
  return Rows;
};
// const FilterRender = ({ FilterData, getFieldDecorator, dataSource, reset, resets, visible }) => {
//   const Rows_ = [[], []];
//   FilterData.forEach(({ type, label, dataIndex, options = {}, ...rest }, index) => {
//     const Child = componentTypeS[type];
//     let val = dataSource[dataIndex];
//     if (resets) {
//       val = undefined;
//     } else if (reset && reset.length > 0) {
//       val = reset.includes(dataIndex) ? undefined : dataSource[dataIndex];
//     }
//     const Item = (
//       <Col span={8}>
//         <FormItem {...formLayout} label={label}>
//           {getFieldDecorator(dataIndex, {
//             initialValue: val,
//             ...options,
//           })(<Child {...rest} />)}
//         </FormItem>
//       </Col>
//     );
//     if (index < 3) {
//       Rows_[0].push(Item);
//     } else {
//       Rows_[1].push(Item);
//     }
//   });

//   const childrens = Rows_.map((children, index) => (
//     <FilterRows index={index}>{children}</FilterRows>
//   ));

//   return <FilterContext.Provider value={{ visible }}>{childrens}</FilterContext.Provider>;
// };

// 筛选头组件
const FilterForm_ = ({
  form,
  onSearch = () => {},
  loading = false,
  getFilterData = () => {}, // 筛选头配置表
  dataSource = {}, // 初始化筛选数据
  getQuery = () => {}, // 获取筛选数据
  pagination = {},
  customizeFilterForm,
  onRef,
}) => {
  if (onRef) {
    onRef(form);
  }

  const { validateFields, resetFields, ...rest } = form;
  // 自定义状态默认空对象
  const { state, setState } = useSetState({});
  // 获取筛选配置表
  const FilterData =
    getFilterData({
      form: { validateFields, resetFields, ...rest },
      tenantId,
      organizationId,
      state,
      setState,
    }) || [];

  // 重置功能相关状态以及回调
  const [reset, setReset] = useState(undefined);
  const [resets, setResets] = useState(false);

  // 重写resetFields函数
  const resetFields_ = (e, m) => {
    if (m) {
      setResets(true);
    } else {
      setReset((t) => Array.from(new Set([...(t || []), ...(e || [])])));
    }
    resetFields(e);
  };

  // 搜索函数
  const handleSearch = useCallback(() => {
    validateFields((err, values) => {
      if (err) return;
      const value = { ...values };
      FilterData.forEach(({ type, dataIndex }) => {
        if (type === 'DatePicker_') {
          value[dataIndex] = values[dataIndex] && values[dataIndex].format(DEFAULT_DATETIME_FORMAT);
        } else if (type === 'Switch_') {
          value[dataIndex] = values[dataIndex] ? 1 : 0;
        }
      });
      getQuery(value);
      onSearch(pagination, value, true);
    });
  }, [pagination, loading]);

  // 控制显示与否
  const [visible, setVisible] = useState(false);

  const FormRender = () => (
    <Form layout="inline" className="more-fields-form">
      <Row {...SEARCH_FORM_ROW_LAYOUT}>
        <Col span={18}>
          {FilterRender({
            FilterData,
            visible,
            validateFields,
            resetFields: resetFields_,
            dataSource,
            reset,
            resets,
            ...rest,
          })}
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
            <Button data-code="reset" onClick={() => resetFields_(undefined, true)}>
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

  return isFunction(customizeFilterForm)
    ? customizeFilterForm(
        {
          code: 'SFIN.ADVANCE_PAYMENT_RECORD_LIST.FILTER',
          form,
          expand: visible,
        },
        FormRender()
      )
    : FormRender();
};

// 导出筛选头组件
export const FilterForm = compose(
  partialRight(memo, (o1, o2) => isEqual(o1.pagination, o2.pagination)),
  Form.create({ fieldNameProp: null })
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
          forceRender
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
