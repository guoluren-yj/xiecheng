/* eslint-disable react/no-danger */
/**
 * 指标探查页面（平台级）
 * @date: 2021-11-1
 * @author: Zepeng Huang <zepeng.Huang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import React, { useState, useEffect } from 'react';
import {
  DataSet,
  Table,
  Form,
  TextField,
  Lov,
  Button,
  Select,
  DatePicker,
  Spin,
} from 'choerodon-ui/pro';
import _ from 'lodash';
import { Popover, Icon, message } from 'choerodon-ui';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import LovCodeStore from 'choerodon-ui/pro/lib/stores/LovCodeStore';
import moment from 'moment';

import { copyText, getLocalUrlParam } from '@/utils/utils';

import {
  getIndexDimensionQueryFormDs,
  getIndexDimensionFormDs,
  getIndexResultDs,
} from './store/indexSearchDs';
import { queryIndexDimension, fetchPreview } from '../../services/indexSearchService';

import './index.less';

let dynamicDs = null;
let prevSearchParam = {};

function IndexSearch(props = {}) {
  const { indexDimensionQueryFormDs, indexResultDs } = props.valueDs; // 获取DS对象

  const [indexDimensionFormDs, handleIndexDimensionFormDs] = useState(null); // 维度表单DS
  const [formDom, handleFormDom] = useState(null); // 指标维度表单DOM
  const [contentSpin, handleContentSpin] = useState(false); // 页面加载中
  const [urlContent, setContent] = useState(''); // 预览 url 内容
  const [visible, setVisible] = useState(false);

  // 防止tab页刷新的数据遗留
  useEffect(() => {
    indexDimensionQueryFormDs.loadData([]);
    return () => {
      prevSearchParam = {};
    };
  }, []);

  /**
   * handleIndDimFormChange: 指标编码变化时的回调
   */
  const handleIndDimFormChange = () => {
    // 获取当前选中的指标编码
    const serviceCode = indexDimensionQueryFormDs.current.get('serviceCode');
    // 若清空lov
    if (!serviceCode) {
      handleFormDom(null);
      return;
    }
    queryIndexDimensionData(serviceCode);
  };

  /**
   * 查询指标维度数据：queryIndexDimensionData
   * @param {string} interfaceParameters 接口参数，查询需要传参
   */
  const queryIndexDimensionData = (serviceCode) => {
    // 加载中增强交互效果
    handleContentSpin(true);
    queryIndexDimension(serviceCode)
      .then((res) => {
        if (getResponse(res)) {
          createIndexDimensionForm(res.dimensionalityInfoVOS);
        }
      })
      .catch(() => {
        handleFormDom(null);
      })
      .finally(() => {
        indexResultDs.loadData([]);
        handleContentSpin(false);
      });
  };

  /**
   * createIndexDimensionForm: 动态生成表单DS和表单对象
   * @param {Object[]} indexDimensionDsDataArr 指标维度Ds对象Data化的数组
   */
  const createIndexDimensionForm = (indexDimensionDsDataArr) => {
    // 构建field数据
    const fields = indexDimensionDsDataArr.map((item) => {
      const {
        componentType,
        componentValue,
        defaultValue,
        dimensionalityCode,
        dimensionalityName,
        requiredFlag,
      } = item;
      return {
        name: dimensionalityCode,
        require: requiredFlag,
        type:
          componentType === 'lov_view' ? 'object' : componentType === 'date' ? 'date' : 'string',
        label: dimensionalityName
          ? `${dimensionalityName}-${dimensionalityCode}`
          : `${dimensionalityCode}`,
        defaultValue,
        lookupCode: componentType === 'lookup' && componentValue,
        lovCode:
          componentType === 'lov_view' &&
          dimensionalityCode !== 'evalDimensionValue' &&
          componentValue,
        lovMap: dimensionalityCode === 'evalDimensionValue' && JSON.parse(componentValue), // 自定义字段，保留lovCode的映射关系
        computedProps: {
          disabled:
            // 非tenantId取决于tenantId
            // evalDimensionValue取决于evalDimension
            dimensionalityCode !== 'tenantId'
              ? dimensionalityCode !== 'evalDimensionValue'
                ? ({ record }) => {
                    return !record.get('tenantId');
                  }
                : ({ record }) => {
                    return !record.get('evalDimension');
                  }
              : null,
          lovPara:
            componentType === 'lov_view' &&
            (({ record }) => {
              return { tenantId: record.get('tenantId')?.tenantId };
            }),
          lovCode:
            dimensionalityCode === 'evalDimensionValue' &&
            (({ record }) => {
              const evalDimension = record.get('evalDimension');
              return (
                evalDimension &&
                record.getField('evalDimensionValue').get('lovMap')[evalDimension.value]
              );
            }),
        },
      };
    });
    // 动态生成DS
    dynamicDs = new DataSet(getIndexDimensionFormDs(fields));
    // 动态生成对应的表单DOM
    handleFormDom(
      <React.Fragment>
        <Form
          dataSet={dynamicDs}
          columns={3}
          labelLayout="float"
          header={intl.get('sdps.indexSearch.view.title.indexDimension').d('指标维度')}
        >
          {fields.map((item) => {
            const { name, type, lookupCode } = item;
            if (lookupCode) return <Select name={name} colSpan={1} key={name} />;
            else if (type === 'object') {
              return (
                <Lov
                  name={name}
                  colSpan={1}
                  key={name}
                  onChange={
                    name === 'tenantId'
                      ? () => {
                          handleTenantChange(dynamicDs.current);
                        }
                      : undefined
                  }
                />
              );
            } else if (type === 'date') {
              return <DatePicker name={name} colSpan={1} key={name} />;
            }
            return <TextField name={name} key={name} />;
          })}
        </Form>
      </React.Fragment>
    );
    handleIndexDimensionFormDs(dynamicDs);
  };

  /**
   * handleTenantChange：维度表单租户信息更改时回调
   */
  const handleTenantChange = (record) => {
    const tenantId = record.get('tenantId');
    record.clear();
    record.set('tenantId', tenantId);
  };

  /**
   * queryIndexResultData:查询指标结果
   */
  const queryIndexResultData = () => {
    indexDimensionFormDs.validate().then((flag) => {
      if (!flag) {
        notification.warning({
          message: intl.get('hzero.common.message.confirm.title').d('提示'),
          description: intl
            .get('sdps.indexSearch.view.notification.writeRequiredField')
            .d('请填写必填字段'),
        });
        return;
      }
      // 查询指标结果
      indexResultDs.query(1, {
        record: indexDimensionFormDs.current,
        queryUri: indexDimensionQueryFormDs.current.get('serviceRoute'),
      });
    });
  };

  // 表格的columns对象
  const indexResultColumns = [
    {
      name: 'indexKey',
      width: 300,
    },
    {
      name: 'indexName',
      width: 500,
    },
    {
      name: 'indexValue',
    },
  ];

  /**
   * 预览查询接口
   */
  const handleQueryUrl = () => {
    const dimensionalityInfoMap = _.mapValues(dynamicDs?.current?.toData() ?? {}, (value, key) => {
      // 排除dirty字段
      if (key === '__dirty') return undefined;
      // 处理日期字段
      if ((key === 'evalDateFrom' || key === 'evalDateTo') && value) {
        const dateObj = moment(value);
        const dateYear = dateObj.year();
        const dateMonth = dateObj.month() < 9 ? `0${dateObj.month() + 1}` : dateObj.month() + 1;
        const dateDay = dateObj.date() < 10 ? `0${dateObj.date()}` : dateObj.date();
        return `${dateYear}${dateMonth}${dateDay}`;
      }
      // 根据字段名获取字段值
      const field = dynamicDs?.current?.getField(key) ?? '';

      const textVal =
        typeof value === 'object' && value
          ? value[LovCodeStore.getConfig(field.get('lovCode')).valueField] // 取得配置的值字段的值
          : value;

      return textVal && typeof textVal === 'string' && textVal.includes(' 00:00:00')
        ? textVal.substring(0, 10)
        : textVal;
    });

    const queryUri =
      dynamicDs?.getState('queryUri') ??
      indexDimensionQueryFormDs?.current?.get('serviceRoute') ??
      '';

    if (!visible || !_.isEqual(prevSearchParam, dimensionalityInfoMap)) {
      // 两次查询参数不一致，调接口
      prevSearchParam = { ...dimensionalityInfoMap };
      fetchPreview({ dimensionalityInfoMap, queryUri }).then((res) => {
        if (res && typeof res === 'string' && !res.includes('failed')) {
          setContent(res);
          setVisible(true);
        } else {
          setVisible(false);
          const params = JSON.parse(res);
          if (params.code || params.message) {
            notification.error({
              message: intl.get('hzero.common.status.mistake').d('错误'),
              description: params.message,
            });
          }
        }
      });
    } else {
      setVisible(false);
    }
  };

  /**
   * 复制内容
   */
  const handleCopy = () => {
    if (urlContent) {
      const ele = document.getElementById('index-search-popover-popover');
      copyText(ele);
      message.success(
        intl.get('sdps.indexSearch.view.message.copySuccess').d('复制成功'),
        undefined,
        undefined,
        'top'
      );
    }
  };

  const content = () => {
    return (
      <div>
        <div>
          <span style={{ fontWeight: '500' }}>
            {intl.get('sdps.indexSearch.view.message.calledLink').d('调用链接')}
          </span>
          <span
            style={{
              color: '#36C2CF',
              float: 'right',
              cursor: 'pointer',
            }}
            onClick={handleCopy}
          >
            <Icon type="copy" />
            {intl.get('hzero.common.button.copy').d('复制')}
          </span>
        </div>
        <div
          id="index-search-popover-popover"
          style={{
            fontWeight: '400',
            overflowY: 'auto',
            wordWrap: 'break-word',
          }}
          dangerouslySetInnerHTML={{ __html: parseContent(urlContent) }}
        />
      </div>
    );
  };

  /**
   * 解析值，更改颜色
   * @param {*} content
   */
  const parseContent = (url) => {
    if (url.indexOf('?') === -1) {
      return url;
    }

    const hostUrl = url.substring(0, url.indexOf('?') + 1);
    const str = url.substr(url.indexOf('?') + 1);

    const params = getLocalUrlParam(url);
    const keys = Object.keys(params);

    let rtnStr = str;

    if (keys.length) {
      keys.forEach((key) => {
        const res = new RegExp(`=${params[key].toString()}`, 'g'); // 匹配 =XXX 字符串，替换为带颜色标签
        if (key !== 'token') {
          rtnStr = rtnStr.replaceAll(
            res,
            `=<span style='color:#FC8F00;'>${params[key].toString()}</span>`
          );
        }
      });
    }
    return hostUrl + rtnStr;
  };

  return (
    <div id="index-search-page-basic">
      <Header title={intl.get('sdps.indexSearch.view.title.indexSearch').d('指标探查')}>
        {formDom && (
          <Button color="primary" onClick={queryIndexResultData}>
            {intl.get('sdps.indexSearch.view.button.query').d('查询')}
          </Button>
        )}
        {formDom && (
          <Popover
            content={content()}
            title=""
            placement="bottomLeft"
            trigger="click"
            popupClassName="indexSearch-popover-card"
            getPopupContainer={() => document.getElementById('index-search-page-basic')}
            visible={visible}
          >
            <Button onClick={handleQueryUrl}>
              {intl.get('hzero.common.button.review').d('预览')}
            </Button>
          </Popover>
        )}
      </Header>
      <Content>
        <Spin spinning={contentSpin}>
          <Form dataSet={indexDimensionQueryFormDs} labelWidth="auto" columns={2}>
            <Lov name="serviceLov" colSpan={1} onChange={handleIndDimFormChange} />
          </Form>
          {formDom}
          {formDom && (
            <Table
              style={{ marginTop: '0.1rem' }}
              dataSet={indexResultDs}
              columns={indexResultColumns}
              header={intl.get('sdps.indexSearch.view.title.indexResult').d('指标结果')}
            />
          )}
        </Spin>
      </Content>
    </div>
  );
}

export default formatterCollections({
  code: ['sdps.indexSearch'],
})(
  withProps(
    () => {
      const indexDimensionQueryFormDs = new DataSet(getIndexDimensionQueryFormDs()); // 查询指标维度的表单DS
      const indexResultDs = new DataSet(getIndexResultDs()); // 指标结果DS
      const valueDs = {
        indexDimensionQueryFormDs,
        indexResultDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true } // 缓存数据状态+保持原来的DataSet对象
  )(IndexSearch)
);
