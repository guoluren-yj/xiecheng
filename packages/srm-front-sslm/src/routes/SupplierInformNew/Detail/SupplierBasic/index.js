/*
 * @Date: 2023-04-06 09:34:55
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { Tabs, Badge } from 'choerodon-ui';
import { Spin } from 'choerodon-ui/pro';
import { head, isEmpty, forEach, isArray, concat } from 'lodash';
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';

import DynamicTable from '@/routes/components/DynamicTable/components/DynamicTable';

import intl from 'utils/intl';
import notification from 'utils/notification';

const { TabPane } = Tabs;
const tableMaxHeight = { maxHeight: 'calc(100vh - 350px)' };

const Index = (
  {
    isEdit,
    isRead,
    changeLevel,
    changeReqId,
    custLoading,
    customizeForm,
    customizeTable,
    customizeTabPane,
    headerInfo,
    panelList,
    setLoading,
    relTableList,
    initQueryCompleteFlag,
    setActiveKey: setParentActiveKey,
    headerInfo: { configNames = [] } = {},
    supplierInformRemote,
  },
  ref
) => {
  const { countryCode, isSubdomainsRegister, domesticForeignRelation } = headerInfo;
  const [activeKey, setActiveKey] = useState('comBasicReq');
  const [supplierBasicData, setSupplierBasicData] = useState({});
  const [relTableRef, setRelTableRef] = useState({});

  const remoteRef = useRef({}); // 存储埋点增加的页签ref

  const onRef = (form = {}, tableCode = '') => {
    const tableCodeRef = {
      [tableCode]: form,
    };
    setRelTableRef(prevState => ({ ...prevState, ...tableCodeRef }));
  };

  useEffect(() => {
    // 初始化查询结束后再获取ds
    if (initQueryCompleteFlag) {
      const dsObj = panelList.reduce((acc, cur) => {
        acc[cur.key] = cur.dataSet;
        return acc;
      }, {});
      if (supplierInformRemote && supplierInformRemote.event) {
        supplierInformRemote.event.fireEvent('cuxHandleSupplierBasicInit', {
          headerInfo,
          ...dsObj,
        });
      }
    }
  }, [initQueryCompleteFlag]);

  // 获取组件属性
  const componentProps = {
    isEdit,
    isRead,
    setLoading,
    changeLevel,
    countryCode,
    custLoading,
    customizeForm,
    customizeTable,
    tableMaxHeight,
    isSubdomainsRegister,
    domesticForeignRelation,
    headerInfo,
    supplierInformRemote,
  };

  useImperativeHandle(ref, () => {
    return {
      handleQuery,
      handleIsChange,
      handleSaveParams,
      supplierBasicData,
    };
  });

  // 大查询
  const handleQuery = () => {
    const dsList = [];
    forEach(panelList, panel => {
      const { key, dataSet } = panel;
      if (isArray(dataSet)) {
        forEach(dataSet, ds => {
          dsList.push({
            key: ds.key,
            dataSet: ds.dataSet,
          });
        });
      } else {
        dsList.push({
          key,
          dataSet,
        });
      }
    });
    // 查询模型表
    const relTableQueryList = [];
    relTableList.forEach(n => {
      if (relTableRef[n.tableCode]) {
        relTableQueryList.push(relTableRef[n.tableCode].queryDynamicTable);
      }
    });
    if (!isEmpty(headerInfo)) {
      forEach(dsList, dsItem => {
        const { dataSet } = dsItem;
        dataSet.setState('dsState', headerInfo);
      });
      return Promise.all([
        ...dsList.map(dsItem =>
          dsItem.dataSet?.query().then(res => {
            if (res) {
              setSupplierBasicData(prve => ({
                ...prve,
                [dsItem.key]: res,
              }));
            }
          })
        ),
        ...relTableQueryList.map(query => query()),
      ]);
    }
  };

  // 判断页签是否修改
  const handleIsChange = () => {
    const allDsList = [];
    forEach(panelList, panel => {
      const { dataSet } = panel;
      if (isArray(dataSet)) {
        forEach(dataSet, item => {
          allDsList.push(item.dataSet);
        });
      } else {
        allDsList.push(dataSet);
      }
    });
    const isChange = allDsList.some(ds => ds.dirty);
    return isChange;
  };

  // 处理校验问题
  const handleValidate = useCallback(({ tab, dataSet, isForm, key, parentKey }) => {
    if (dataSet) {
      return new Promise(async (resolve, reject) => {
        const errorsMsg = [];
        const validateFlag = await dataSet.validate();
        const { errors = [] } = head(dataSet.getValidationErrors()) || {};
        if (!validateFlag && !isEmpty(errors)) {
          forEach(errors, curent => {
            const { validationMessage } = head(curent?.errors) || {};
            if (validationMessage) {
              errorsMsg.push(<div>{validationMessage}</div>);
            }
          });
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({ tab, key: parentKey || key, errorsMsg });
        } else {
          const data = isForm ? dataSet.current?.toJSONData() : dataSet.toJSONData();
          resolve({ [key]: data });
        }
      });
    }
  }, []);

  // 获取需校验的tab
  const getValidatePanel = useCallback(() => {
    const validatePanel = [];
    forEach(panelList, panel => {
      // 当前页签作为第一个需校验的页签，其他页签按顺序校验
      if (panel.key === activeKey) {
        validatePanel.unshift(panel);
      } else {
        validatePanel.push(panel);
      }
    });
    return validatePanel;
  }, [panelList, activeKey]);

  // 获取需保存的参数
  const handleSaveParams = async () => {
    const validateResult = [];
    const validatePanel = getValidatePanel();
    forEach(validatePanel, panel => {
      const { tab, key, isForm, dataSet } = panel;
      if (isArray(dataSet)) {
        forEach(dataSet, ds => {
          const errorMsg = handleValidate({
            tab,
            dataSet: ds.dataSet,
            isForm: ds.isForm,
            key: ds.key,
            parentKey: key,
          });
          validateResult.push(errorMsg);
        });
      } else {
        const errorMsg = handleValidate({ tab, dataSet, isForm, key });
        validateResult.push(errorMsg);
      }
    });

    const dataList = await Promise.allSettled(validateResult);
    let saveData = null;
    const dataObj = {};
    forEach(dataList, data => {
      const { status, value, reason } = data;
      if (status === 'rejected') {
        saveData = null;
        const { tab, key, errorsMsg } = reason;
        notification.warning({
          message: intl
            .get('sslm.common.view.warn.infoNotFilled', {
              name: tab,
            })
            .d(`【${tab}】页签信息未填写`),
          description: errorsMsg,
        });
        setActiveKey(key);
        setParentActiveKey('supplierBasic'); // 父级页签需跳转至当前报错页签下
        return false;
      } else {
        for (const key in value) {
          if (Object.hasOwnProperty.call(value, key)) {
            const element = value[key];
            dataObj[key] = element;
          }
        }
        saveData = dataObj;
      }
    });
    // 获取模型表需保存的数据
    let checkModelTableFlag = true;
    let modelDatas = [];
    relTableList.forEach(n => {
      if (relTableRef[n.tableCode]) {
        const tableData = relTableRef[n.tableCode].checkData();
        if (checkModelTableFlag) {
          checkModelTableFlag = tableData;
        }
        if (!tableData) {
          notification.warning({
            message: intl
              .get('sslm.common.view.warn.infoNotFilled', {
                name: n.tableName,
              })
              .d(`【${n.tableName}】页签信息未填写`),
          });
          saveData = null;
          return false;
        }
        if (tableData) {
          modelDatas = concat(modelDatas, tableData);
        }
      }
    });
    if (checkModelTableFlag) {
      dataObj.modelDatas = modelDatas;
    }
    const remotePayload = supplierInformRemote
      ? supplierInformRemote.process(
          'SSLM_SUPPLIER_INFORM_NEW_DETAIL_SUPPLER_BASIC_SAVE_DATA',
          saveData,
          { remoteRef }
        )
      : saveData;
    return remotePayload;
  };

  const handleTabsChange = useCallback(key => {
    setActiveKey(key);
  }, []);

  const renderProps = {
    isEdit,
    remoteRef,
    headerInfo,
    changeReqId,
    configNames,
  };

  return (
    <Spin spinning={false}>
      {customizeTabPane(
        {
          code: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.SUPPLIER_BASIC_TABS',
          custDefaultActive: key => handleTabsChange(key || activeKey),
        },
        <Tabs
          tabPosition="left"
          customizable={false}
          activeKey={activeKey}
          onChange={handleTabsChange}
        >
          {panelList.map(panel => (
            <TabPane
              forceRender
              key={panel.key}
              tab={panel.tab}
              count={1}
              countRenderer={() =>
                !isEdit &&
                configNames.includes(panel.key) && (
                  <Badge dot style={{ marginTop: -3, marginLeft: 3 }} />
                )
              }
            >
              <div className="supplier-info-title">{panel.tab}</div>
              <panel.component {...componentProps} dataSet={panel.dataSet} />
            </TabPane>
          ))}
          {(relTableList || []).map(n => {
            return (
              <TabPane
                forceRender
                tab={n.tableName}
                key={n.uniqueCode}
                countRenderer={() =>
                  !isEdit &&
                  configNames.includes(n.uniqueCode) && (
                    <Badge dot style={{ marginTop: -3, marginLeft: 3 }} />
                  )
                }
              >
                <div className="supplier-info-title">{n.tableName}</div>
                <DynamicTable
                  c7nButton
                  modelTable={n}
                  readOnly={!isEdit}
                  relationId={changeReqId}
                  viewSaveButton={isEdit}
                  onRef={(node = {}) => {
                    onRef(node, n.tableCode);
                  }}
                />
              </TabPane>
            );
          })}
          {supplierInformRemote
            ? supplierInformRemote.process(
                'SSLM_SUPPLIER_INFORM_NEW_DETAIL_SUPPLIER_BASIC_TABS',
                null,
                renderProps
              )
            : null}
        </Tabs>
      )}
    </Spin>
  );
};

const SupplierBasic = forwardRef(Index);

export default SupplierBasic;
