/**
 * 指标探查页面（租户级）
 * @date: 2021-10-25
 * @author: Zepeng Huang <zepeng.Huang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import React, { useEffect, useState } from 'react';
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
  Modal,
} from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { getCurrentTenant, getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { ReactButton } from './ReactButton';
import {
  getIndexDimensionQueryFormDS,
  getIndexDimensionFormDs,
  getIndexResultDs,
  getCorrectValueFormDs,
} from './store/indexSearchDs';
import {
  queryIndexDimensionOrg,
  getRuleManageLines,
  sendCorrectValue,
} from '../../services/indexSearchService';

import styles from './index.less';

const { tenantName, tenantNum, tenantId } = getCurrentTenant(); // 获取当前租户信息
const { Option } = Select;
const sendInvestigateModalKey = Modal.key();

function IndexSearchOrg(props = {}) {
  // 获取跳转路由的传参
  const paramStr = localStorage.getItem('indexOrgPayload');
  const state = paramStr ? JSON.parse(paramStr) : {};
  const {
    parameterKey = '',
    interfaceParameters = '',
    serviceName = '',
    serviceRoute = '',
    parameters = '',
    serviceCode = '',
  } = state;
  const { indexDimensionQueryFormDs, indexResultDs, correctValueFormDs } = props.valueDs; // 获取DS对象

  const [indexDimensionFormDs, handleIndexDimensionFormDs] = useState(null); // 维度表单DS
  const [formDom, handleFormDom] = useState(null); // 指标维度表单DOM
  const [contentSpin, handleContentSpin] = useState(false); // 页面加载中
  const [indexAllList, setList] = useState([]); //

  useEffect(() => {
    if (parameters) {
      const list = JSON.parse(parameters);
      const headerId = list.length ? list[0].ruleManagementHeaderId : '';
      getRuleManageLines({
        ruleManagementHeaderId: headerId,
      }).then(res => {
        if (getResponse(res)) {
          if (res.content.length) {
            const ortherList = res.content.filter(item => {
              return item.serviceCode === serviceCode && item.indexCode !== parameterKey;
            });
            const self = res.content.filter(item => {
              return item.indexCode === parameterKey;
            });
            setList([...ortherList, ...self]);
          }
        }
      });
    }
  }, [parameters]);

  useEffect(() => {
    // 页面跳转带参的初始工作
    if (Object.keys(state).length !== 0) {
      // 页面的初始化
      indexDimensionQueryFormDs.loadData([{ serviceName, indexCode: parameterKey }]);
      handleFormDom(null);
      indexResultDs.loadData([]);
      // 初始查询维度数据
      queryIndexDimensionData(JSON.parse(interfaceParameters));
    }
  }, [paramStr]); // 当页面传参发生变化，即规则更改时重载

  /**
   * 查询指标维度数据：queryIndexDimensionData
   * @param {string} interfaceParameters 接口参数，查询需要传参
   */
  const queryIndexDimensionData = payloadData => {
    // 加载中增强交互效果
    handleContentSpin(true);
    queryIndexDimensionOrg(payloadData)
      .then(res => {
        if (getResponse(res)) {
          // 生成表单对象
          createIndexDimensionForm(res);
        }
      })
      .catch(() => {
        handleFormDom(null);
      })
      .finally(() => {
        handleContentSpin(false);
      });
  };

  /**
   * createIndexDimensionForm: 动态生成表单DS和表单对象
   * @param {Object[]} indexDimensionDsDataArr 指标维度Ds对象Data化的数组
   */
  const createIndexDimensionForm = indexDimensionDsDataArr => {
    // 构建field数据
    const fields = indexDimensionDsDataArr.map(item => {
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
        lovPara: componentType === 'lov_view' && { tenantId },
        lovCode:
          componentType === 'lov_view' &&
          dimensionalityCode !== 'evalDimensionValue' &&
          componentValue,
        lovMap: dimensionalityCode === 'evalDimensionValue' && JSON.parse(componentValue), // 自定义字段，保留lovCode的映射关系
        computedProps: dimensionalityCode === 'evalDimensionValue' && {
          lovCode: ({ record }) => {
            const evalDimension = record.get('evalDimension');
            return (
              evalDimension &&
              record.getField('evalDimensionValue').get('lovMap')[evalDimension.value]
            );
          },
          disabled: ({ record }) => {
            return !record.get('evalDimension');
          },
        },
      };
    });
    // 动态生成DS
    const dynamicDs = new DataSet(getIndexDimensionFormDs(fields));
    dynamicDs.current.set('tenantId', { tenantName, tenantNum, tenantId }); // 赋值租户
    // 动态生成对应的表单DOM
    handleFormDom(
      <React.Fragment>
        <div className={styles['panel-card-title']} style={{ marginTop: '32px' }}>
          {intl.get('sdps.indexSearch.view.title.indexDimension').d('指标维度')}
        </div>
        <Form
          dataSet={dynamicDs}
          columns={3}
          labelLayout="float"
          // header={intl.get('sdps.indexSearch.view.title.indexDimension').d('指标维度')}
        >
          {fields.map(item => {
            const { name, type, lookupCode } = item;
            if (lookupCode) return <Select name={name} colSpan={1} key={name} />;
            else if (type === 'object') {
              return <Lov name={name} colSpan={1} disabled={name === 'tenantId'} key={name} />;
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
   * queryIndexResultData:查询指标结果
   */
  const queryIndexResultData = () => {
    // 两个表单都需要校验
    Promise.all([indexDimensionFormDs.validate(), indexDimensionQueryFormDs.validate()]).then(
      res => {
        if (res.indexOf(false) !== -1) {
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
          serviceRoute,
          indexCodes: indexDimensionQueryFormDs.current.get('indexCode'),
        });
      }
    );
  };

  /**
   * handleSendInvestigate: 点击推送排查弹窗
   */
  const handleSendInvestigate = () => {
    correctValueFormDs.loadData([]);
    const sendModalObj = Modal.open({
      key: sendInvestigateModalKey,
      movable: false,
      children: (
        <Form dataSet={correctValueFormDs} columns={1}>
          <TextField colSpan={1} name="correctValue" />
        </Form>
      ),
      footer: (_, cancelBtn) => {
        return (
          <>
            <ReactButton
              dataSet={correctValueFormDs}
              btnText={intl.get('sdps.indexSearch.button.sure').d('确定')}
              onClick={handleOkClick}
            />
            {cancelBtn}
          </>
        );
      },
    });
    // handleOkClick：弹窗点击确定后回调
    const handleOkClick = () => {
      // 校验
      if (!correctValueFormDs?.validate() ?? true) return;
      // 页面加载中
      correctValueFormDs.setState('isSubmit', true);
      // 调用接口
      const correctValue = correctValueFormDs?.current?.get('correctValue') ?? '';
      const dimensionalityInfoMap = indexResultDs?.getState('dimensionalityInfoMap') ?? '';
      const queryUri = indexResultDs?.getState('queryUri') ?? '';
      const indexCodes = indexResultDs?.getState('indexCodes') ?? '';
      const queryParams = {
        dimensionalityInfoMap,
        queryUri,
        indexCodes: [indexCodes],
        correctValue,
      };
      // 提交数据
      sendCorrectValue(queryParams)
        .then(res => {
          if (getResponse(res)) {
            notification.success({
              message: intl.get('sdps.indexSearch.notification.success').d('成功'),
            });
            sendModalObj.close();
          }
        })
        .finally(() => {
          correctValueFormDs.setState('isSubmit', false);
        });
    };
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
    {
      name: 'operation',
      width: 150,
      renderer: () => {
        return (
          <a onClick={handleSendInvestigate}>
            {intl.get('sdps.indexSearch.view.sendInvestigate').d('推送排查')}
          </a>
        );
      },
    },
  ];

  const searchStr = location?.search ?? '';
  const searchList = searchStr ? decodeURIComponent(searchStr).split('?') : [];

  let backPath = `/sdps/rule-management-org/detail?backFlag=indexSearch&${
    searchList.length === 3 ? searchList[2] : ''
  }`;
  if (searchStr && searchStr.includes('only-read')) {
    // 只读页面
    backPath = `/sdps/rule-management-org/detail-only-read?backFlag=indexSearch&${
      searchList.length === 3 ? searchList[2] : ''
    }`;
  }

  return (
    <div className={styles['index-search-basic']}>
      <Header
        title={intl.get('sdps.indexSearch.view.title.indexSearch').d('指标探查')}
        backPath={backPath}
      >
        {formDom && (
          <Button color="primary" icon="youtube_searched_for" onClick={queryIndexResultData}>
            {intl.get('sdps.indexSearch.view.button.query').d('查询')}
          </Button>
        )}
      </Header>
      <Content>
        <Spin spinning={contentSpin}>
          <div className={styles['panel-card-title']}>
            {intl.get('sdps.indexSearch.view.title.basicInfo').d('基础信息')}
          </div>
          <Form dataSet={indexDimensionQueryFormDs} columns={2} labelLayout="float">
            <TextField name="serviceName" />
            <Select name="indexCode">
              {(indexAllList || []).map(item => {
                const { indexType, indexCode: itemKey, indexName: itemName } = item;
                return (
                  indexType !== 'transform_parameter' && (
                    <Option value={itemKey}>{`${itemName}-${itemKey}`}</Option>
                  )
                );
              })}
            </Select>
          </Form>
          {formDom}
          {formDom && (
            <>
              <div className={styles['panel-card-title']} style={{ marginTop: '32px' }}>
                {intl.get('sdps.indexSearch.view.title.indexResult').d('指标结果')}
              </div>
              <Table
                style={{ marginTop: '0.1rem' }}
                dataSet={indexResultDs}
                columns={indexResultColumns}
              />
            </>
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
      const indexDimensionQueryFormDs = new DataSet(getIndexDimensionQueryFormDS()); // 查询指标维度的表单DS
      const indexResultDs = new DataSet(getIndexResultDs()); // 指标结果DS
      const correctValueFormDs = new DataSet(getCorrectValueFormDs());
      const valueDs = {
        indexDimensionQueryFormDs,
        indexResultDs,
        correctValueFormDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true } // 缓存数据状态+保持原来的DataSet对象
  )(IndexSearchOrg)
);
