import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { Alert } from 'choerodon-ui';
import { DataSet, Modal, Form, Select, NumberField, DatePicker, Switch } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';

import moment from 'moment';
import { compose } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';

import { queryFieldDataSet } from './indexDataSet';
import styles from './index.less';

function QueryForm(props) {
  const { queryFieldDs } = props;
  return (
    <Form labelLayout="float" dataSet={queryFieldDs} columns={1}>
      <Select clearButton={false} name="planDateTimeDimension" />
      <Select clearButton={false} name="quantityDimension" />
      <DatePicker clearButton={false} name="planStartDate" format="YYYY-MM-DD" />
      <NumberField name="planDatePeriod" />
      <Switch name="itemGroupViewFlag" />
    </Form>
  );
}

function QueryField(props) {
  const { queryTitle, itemGroupViewFlag, planTimer = (e) => e, queryCallBack = (e) => e } = props;

  const queryFieldDs = useMemo(() => new DataSet(queryFieldDataSet({ itemGroupViewFlag })), []);

  // 保留上一次查询的数据参数字段描述
  const [lastShow, useLastShow] = useState([]);

  // 保留上一次查询的数据对象
  const [queryValue, setQueryValue] = useState([]);

  const [retList, useRetList] = useState([...queryValue]);

  // 当前查询的数据参数字段描述
  const [textContent, useTextContent] = useState([]);

  useEffect(() => {
    loadQueryChange();
  }, []);

  useEffect(() => {
    queryFieldDs.addEventListener('update', selectQueryChange);
    return () => {
      // eslint-disable-next-line no-unused-expressions
      queryFieldDs?.removeEventListener('update', selectQueryChange);
    };
  }, [queryFieldDs]);

  // 初始化输入框赋值
  const loadQueryChange = () => {
    const _arrQuery = [];
    const myDate = new Date();
    const _year = myDate.getFullYear();
    const _month = myDate.getMonth() + 1;
    const _day = myDate.getDate();
    const _date = `【${intl
      .get('slod.deliveryWorkbench.model.common.planStartDateTime')
      .d('计划起始日')}:${_year}-${_month}-${_day}】`;
    const _text = `【${intl
      .get('slod.deliveryWorkbench.model.common.timeDatePeriod')
      .d('时间周期')}:7】`;
    const _sel1 = `【${intl
      .get('slod.deliveryWorkbench.model.common.planDateTimeDimension')
      .d('时间维度')}:${intl
      .get('slod.deliveryWorkbench.model.common.planDateTimeDetail')
      .d('计划日期')}】`;
    const _sel2 = `【${intl
      .get('slod.deliveryWorkbench.model.common.quantityDimension')
      .d('数量维度')}:${intl
      .get('slod.deliveryWorkbench.model.common.presentQuantitys')
      .d('计划数量')}】`;
    const _val = itemGroupViewFlag
      ? intl.get('hmde.common.switch.status.open').d('开启')
      : intl.get('hzero.common.view.message.close').d('关闭');
    const _switch = `【${intl
      .get('slod.deliveryWorkbench.model.common.itemGroupViewFlagAlert')
      .d('按物料和日期汇总订单数量')}: ${_val}】`;
    const queryList = [
      { planDateTimeDimension: 'PLAN' },
      { quantityDimension: '1' },
      { planStartDate: `${_year}-${_month}-${_day}` },
      { planDatePeriod: 7 },
      { itemGroupViewFlag },
    ];
    _arrQuery.push(_sel1);
    _arrQuery.push(_sel2);
    _arrQuery.push(_date);
    _arrQuery.push(_text);
    _arrQuery.push(_switch);
    useLastShow([..._arrQuery]);
    setQueryValue([...queryList]); // 解决初次 进入弹框返回时不修改form问题
    useTextContent([...textContent, ..._arrQuery]);
  };

  // 事件监听-输入框改变
  const selectQueryChange = ({ record }) => {
    const queryFields = record.toData();
    Reflect.deleteProperty(queryFields, '__dirty');
    const _arrQuery = [];
    const _arrrQueryValue = [];
    // eslint-disable-next-line guard-for-in
    for (const i in queryFields) {
      const label = queryTitle[i] || null; // 字段标题
      // 将日期类型字段拼接
      if (i === 'planStartDate') {
        const _objQuery = {};
        const value = queryFields[i] || null; // 字段描述
        const _date = moment(value).format('YYYY-MM-DD');
        const _text = `【${label}:${_date}】`;
        _objQuery[i] = _date;
        _arrQuery.push(_text);
        _arrrQueryValue.push(_objQuery);
      } else if (i === 'itemGroupViewFlag') {
        // 按物料和日期汇总订单数量拼接
        const _objQuery = {};
        const values = queryFields[i] || null; // 字段value
        const value = record?.getField(i)?.getText(); // 字段描述
        planTimer(value); // 记录是否开启按物料和日期汇总订单数量
        const _val = value
          ? intl.get('hmde.common.switch.status.open').d('开启')
          : intl.get('hzero.common.view.message.close').d('关闭');
        const _text = `【${label}:${_val}】`;
        _objQuery[i] = values;
        _arrQuery.push(_text);
        _arrrQueryValue.push(_objQuery);
      } else {
        // 将非日期字段类型拼接
        const _objQuery = {};
        const values = queryFields[i] || null; // 字段value
        const value = record.getField(i).getText() || null; // 字段描述
        const _text = `【${label}:${value}】`;
        _objQuery[i] = values;
        _arrQuery.push(_text);
        _arrrQueryValue.push(_objQuery);
      }
    }
    queryFieldDs.setState('retList', [..._arrrQueryValue]);
    useLastShow([..._arrQuery]);
    useRetList(_arrrQueryValue);
    useTextContent([...textContent, ..._arrQuery]);
    setQueryValue([...queryValue, ..._arrrQueryValue]);
  };

  const handClick = () => {
    const modalProps = {
      queryFieldDs,
    };
    Modal.open({
      drawer: true,
      size: 'small',
      closable: true,
      title: intl.get('slod.deliveryWorkbench.model.common.dimensionality').d('更改维度'),
      children: <QueryForm {...modalProps} />,
      onOk: () => confirmBack(),
      onCancel: () => returnBack(),
    });
  };
  const confirmBack = useCallback(async () => {
    const flag = await queryFieldDs.validate();
    const params = {
      ...queryFieldDs?.current?.toData(),
    };
    Reflect.deleteProperty(params, '__dirty');
    if (flag && !(params.planDatePeriod < 1 || params.planDatePeriod >= 32)) {
      try {
        queryCallBack(params);
      } catch (e) {
        throw e;
      }
    } else {
      return false;
    }
  }, [retList, textContent]);

  const returnBack = () => {
    // 展示框设置上一次的文字
    const _arrQuery = [];
    lastShow.forEach((ele) => {
      _arrQuery.push(ele);
    });
    // form表单设置上一次的数据
    queryValue.forEach((ele) => {
      const _key = Object.keys(ele);
      const _value = Object.values(ele);
      queryFieldDs.current.set(..._key, ..._value);
    });
    useTextContent([..._arrQuery]);
    useLastShow([..._arrQuery]);
    return true;
  };

  return (
    <>
      <Alert
        className={styles.alert_css}
        description={textContent}
        type="info"
        message={
          <a onClick={handClick}>
            {intl.get('slod.deliveryWorkbench.model.common.dimensionality').d('更改维度')}
          </a>
        }
      />
    </>
  );
}
export default compose(
  formatterCollections({
    code: ['hzero.common', 'slod.deliveryWorkbench', 'slod.common', 'hmde.common'],
  })
)(observer(QueryField));
