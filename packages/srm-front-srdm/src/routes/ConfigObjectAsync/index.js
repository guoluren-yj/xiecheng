import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Button,
  Table,
  DataSet,
  Form,
  TextField,
  Tabs,
  Icon,
  Modal,
  Select,
  CheckBox,
  // DatePicker,
} from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
// import queryString from 'querystring';
import flatten from 'lodash/flatten';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';
import { runInAction } from 'mobx';
import crypto from 'crypto-js';
import { Header } from 'components/Page';
import request from 'utils/request';
import intl from 'utils/intl';
import { setSession } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { HZERO_SRDM } from '@/common/config';
import { closeAndPush } from '@/utils/utils';
import CodeCompare from '@/components/CodeCompare';
import { getConfigSyncDS } from './configDs';
import DetailModal from './DetailModal';
import styles from './index.less';

const { TabPane } = Tabs;

export const compareField = '__compare_$$_same__';
export const compareCodeField = '__compare_$$_code_$$_same__';
const compareData = '__compare_$$_data__';
const compareUrl = `${HZERO_SRDM}/v1/data-migrate-recs/source/compare`;

const ConfigObjectSync = (props) => {
  const {
    objectCode: detailCode,
    tableName: detailTableName,
    detailName,
    mainTableId,
  } = props.match.params;
  const isDetail = detailCode && detailTableName && detailName;
  const [group, setGroup] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [tabKey, setTabKey] = useState(0);
  const [, setObjectId] = useState(0);
  const [details, setDetails] = useState([]);
  const [activeKey, setActiveKey] = useState([]);
  const [detailResponse, setDetailResponse] = useState({});
  const [syncDs] = useState(new DataSet(getConfigSyncDS()));
  const [disparateMode, setDisparateMode] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [compareHidden, setCompareHidden] = useState(true);
  const [compareCodeFieldHidden, setCompareCodeFieldHidden] = useState(true);
  const [tenantInfoHidden, setTenantInfoHidden] = useState(true);
  // const [scanDs] = useState(new DataSet(getScanDs()));

  useEffect(() => {
    if (isDetail) {
      getDetail();
    } else {
      queryGroup();
    }
  }, []);

  const appendQueryField = (fields, name, label, value) => {
    if (value) {
      fields.push({
        type: 'string',
        name,
        label,
        defaultValue: value,
        disabled: true,
      });
    }
    return fields;
  };

  const initDateSet = (fieldList, objectCode, tableName, tab, autoQuery, stateFlag) => {
    let fields = [
      {
        name: compareField,
        label: '对比结果',
        hidden: compareHidden,
      },
      {
        name: compareCodeField,
        label: '代码对比结果',
        hidden: compareHidden,
      },
    ];
    let queryFields = [];
    let autoFields = [];
    let uniqueFlagField = [];
    let primaryFlagField = '';
    if (tab && !isDetail) {
      const { objectCode: code, objectDesc, mainTableName } = tab;
      autoFields = appendQueryField(
        autoFields,
        'objectCode',
        intl.get('hpdm.config-object.model.objectCode').d('配置对象编码'),
        code
      );
      autoFields = appendQueryField(
        autoFields,
        'objectDesc',
        intl.get('hpdm.config-object.model.objectDesc').d('配置对象说明'),
        objectDesc
      );
      autoFields = appendQueryField(
        autoFields,
        'mainTableName',
        intl.get('srdm.config-object.model.mainTable').d('主展示表'),
        mainTableName
      );
    }
    fieldList.forEach((field) => {
      const {
        searchFlag,
        fieldType: type,
        fieldName: name,
        objectFldName,
        enabledFlag,
        showFlag,
        primaryFlag,
        uniqueFlag,
        searchDefaultValue: defaultValue,
      } = field;
      const curField = {
        type,
        name,
        label: tab && tab.showObjectFldNameFlag ? objectFldName : name,
        tooltip: 'overflow',
        minWidth: 120,
      };
      if (enabledFlag && showFlag) {
        fields = fields.concat(curField);
        if (!isDetail && searchFlag) {
          if (type === 'datetime' || type === 'dateTime') {
            queryFields = queryFields.concat({
              ...curField,
              defaultValue,
              type: 'dateTime',
              dateMode: 'dateTime',
              range: ['start', 'end'],
            });
          } else {
            queryFields = queryFields.concat({ ...curField, defaultValue });
          }
        }
      }
      if (primaryFlag) {
        primaryFlagField = name;
      }
      if (uniqueFlag) {
        uniqueFlagField = uniqueFlagField.concat(name);
      }
    });
    const { envCompareFlag } = stateFlag;
    if (autoFields.length) {
      queryFields = [
        envCompareFlag
          ? {
              type: 'string',
              name: 'targetEnv',
              label: '对比环境',
              lookupCode: 'SRDM_COMPARABLE_ENV',
            }
          : {},
        {
          type: 'object',
          name: 'tenantObject',
          label: '租户编码',
          lovCode: 'HPFM.TENANT_ALL',
          valueField: 'tenant_id',
          // defaultValue: searchDefaultValue,
          ignore: 'always',
        },
        {
          name: 'tenant_id',
          bind: 'tenantObject.tenantId',
        },
        {
          name: 'tenant_num',
          bind: 'tenantObject.tenantNum',
        },
        ...queryFields,
        ...autoFields,
      ];
    }
    const queryFieldsData = queryFields.length ? { queryFields } : {};
    const ds = new DataSet({
      autoQuery,
      fields: [...fields],
      primaryKey: primaryFlagField,
      cacheSelection: true,
      paging: !isDetail,
      ...queryFieldsData,
      data: detailResponse[tableName] || [],
      transport: {
        read: ({ data = {}, dataSet }) => {
          const detailParams = {};
          if (isDetail) {
            if (isEmpty(data)) {
              dataSet.loadData(detailResponse[tableName] || []);
              return {};
            }
            detailParams.mainTableId = mainTableId;
          }
          dataSet.setState('compareQueryData', data);
          return {
            url: `${HZERO_SRDM}/v1/data-migrate-recs/source/${isDetail ? 'inner-list' : 'list'}`,
            method: 'POST',
            data: {
              objectCode,
              tableName,
              fieldsKeys: data,
              ...detailParams,
            },
          };
        },
      },
      events: {
        beforeLoad: ({ dataSet, data }) => {
          if (data && data.length && data[0].mg_tenant_info) {
            dataSet.addField('mg_tenant_info', {
              label: '租户信息',
            });
            setTenantInfoHidden(false);
          } else {
            setTenantInfoHidden(true);
          }
        },
        load: ({ dataSet }) => {
          if (!isDetail && dataSet.queryDataSet.current.get('targetEnv') && dataSet.length) {
            queryCompare(compareUrl, dataSet.getState('compareQueryData'), dataSet);
          }
        },
      },
    });
    ds.setState({
      autoQuery,
      primaryFlagField,
      tableName,
      objectCode,
      uniqueFlagField,
      ...stateFlag,
    });
    return ds;
  };

  const tabsDataSet = useMemo(() => {
    if (tabs.length) {
      return tabs.map((tab = {}, index) => {
        const {
          objectCode,
          realConfigObjectTbl,
          envCompareFlag,
          codeCompareFlag,
          fieldCompareFlag,
        } = tab;
        if (objectCode && realConfigObjectTbl) {
          const { tableName, configObjectFieldList } = realConfigObjectTbl;
          if (tableName && configObjectFieldList) {
            return initDateSet(configObjectFieldList, objectCode, tableName, tab, index === 0, {
              envCompareFlag,
              codeCompareFlag,
              fieldCompareFlag,
            });
          }
        }
        return null;
      });
    }
    return [];
  }, [tabs]);

  const detailDataSets = useMemo(() => {
    if (details.length) {
      return details.map((detail) => {
        const {
          objectCode = detailCode,
          tableName = detailTableName,
          configObjectFieldList,
        } = detail;
        return initDateSet(configObjectFieldList, objectCode, tableName, detail, true, {});
      });
    }
    return [];
  }, [details]);

  const compareListener = ({ name, value }) => {
    if (name === 'targetEnv' && !value) {
      setCompareHidden(true);
      setCompareCodeFieldHidden(true);
    }
  };

  useEffect(() => {
    if (tabsDataSet && tabsDataSet.length) {
      tabsDataSet.forEach((ds) => {
        ds.queryDataSet.addEventListener('update', compareListener);
      });
      return () => {
        tabsDataSet.forEach((ds) => {
          ds.queryDataSet.removeEventListener('update', compareListener);
        });
      };
    }
  }, [tabsDataSet]);

  const queryCompare = (url, body, dataSet) => {
    if (body) {
      const { targetEnv, mainTableName, objectCode } = body;
      const primaryField = dataSet.getState('primaryFlagField');
      // eslint-disable-next-line
      dataSet.status = 'loading';
      request(url, {
        method: 'POST',
        body: {
          configObjectCode: objectCode,
          mainTableName,
          targetEnv,
          mainTableIdList: dataSet.map((record) => {
            return record.get(primaryField);
          }),
        },
      }).then((res = {}) => {
        if (res.failed) {
          // eslint-disable-next-line
          dataSet.status = 'ready';
          notification.error({ message: res.message });
        } else {
          runInAction(() => {
            const fieldFlag = !dataSet.getState('fieldCompareFlag');
            const codeFlag = !dataSet.getState('codeCompareFlag');
            setCompareHidden(fieldFlag);
            setCompareCodeFieldHidden(codeFlag);
            dataSet.getField(compareField).set('hidden', fieldFlag);
            dataSet.getField(compareCodeField).set('hidden', codeFlag);
            dataSet.forEach((record) => {
              const data = res[record.get(primaryField)] || {};
              const { isSame, isCodeSame, resultLineDtos, codeCompareResult } = data;
              record.init(compareField, isSame);
              record.init(compareCodeField, isCodeSame);
              record.setState(compareData, {
                resultLineDtos,
                codeCompareResult,
              });
              record.setState('env', targetEnv);
            });
            // eslint-disable-next-line
            dataSet.status = 'ready';
          });
        }
      });
    }
  };
  const getDetail = () => {
    request(`${HZERO_SRDM}/v1/data-migrate-recs/source/refData`, {
      method: 'POST',
      body: {
        objectCode: detailCode,
        tableName: detailTableName,
        mainTableId,
      },
    }).then((res = {}) => {
      setDetailResponse(res);
      getObject(detailName, res);
      if (res.failed) {
        notification.error({ message: res.message });
      }
    });
  };

  const queryGroup = (showGroup) => {
    request(`${HZERO_SRDM}/v1/hpdm-config-objects/showGroup`, {
      query: {
        showGroupOnlyFlag: 1,
        showGroup,
      },
    }).then((res = []) => {
      if (res) {
        setGroup(res);
        getObject(res[0]);
      }
    });
  };

  const searchGroup = useCallback((value) => {
    queryGroup(value);
  }, []);

  const getObject = (data, detailTabs = {}) => {
    if (data) {
      request(`${HZERO_SRDM}/v1/hpdm-config-objects/dist-list?showGroup=${data}`).then(
        (res = []) => {
          if (res.failed) {
            notification.error({ message: res.message });
            return;
          }
          runInAction(() => {
            if (isDetail) {
              const detailGroup = [];
              setGroup(Object.keys(res));
              setActiveKey(0);
              setDetails(
                res
                  .find(
                    (item) =>
                      item.mainTableName === detailTableName && item.objectCode === detailCode
                  )
                  .configObjectTblList.filter((item) => {
                    if (detailTabs[item.tableName]) {
                      detailGroup.push(item.tableName);
                      return true;
                    }
                    return false;
                  })
              );
              setGroup(detailGroup);
            } else {
              const currentTabs = res.map((item) => {
                return {
                  ...item,
                  realConfigObjectTbl:
                    item.configObjectTblList.find((tbl) => tbl.objectTblId === item.mainTableId) ||
                    item.configObjectTblList[0],
                };
              });
              setDisparateMode(uniq(currentTabs.map((tab) => tab.pcMigrateMode)).length > 1);
              setTabs(currentTabs);
              if (currentTabs[0]) {
                const { objectId } = currentTabs[0];
                setTabKey(objectId);
                setObjectId(objectId);
              }
              setActiveKey(data);
            }
          });
        }
      );
    }
  };

  const openAsyncTab = (groupId) => {
    const key = `/srdm/config-object-async/env/${groupId}`;
    closeAndPush('/srdm/config-object-async/env', {
      title: '申请同步',
      key,
      path: key,
      closable: true,
    });
  };

  const openDetailTab = (record) => {
    const key = `/srdm/config-object-async/detail/${record.dataSet.getState(
      'objectCode'
    )}/${record.dataSet.getState('tableName')}/${record.get(
      record.dataSet.getState('primaryFlagField')
    )}/${activeKey}/${Date.now()}`;
    closeAndPush('/srdm/config-object-async/detail', {
      title: intl.get('hpdm.data-distribute.operation.detail').d('明细'),
      key,
      path: key,
      closable: true,
    });
  };

  // const openDiffTab = (record) => {
  //   const objectCode = record.dataSet.getState('objectCode');
  //   const tableName = record.dataSet.getState('tableName');
  //   const uniqueFlagField = record.dataSet.getState('uniqueFlagField');
  //   const key = `/srdm/config-object-async/diff/${objectCode}/${tableName}/${Date.now()}`;
  //   closeAndPush('/srdm/config-object-async', {
  //     title: '配置对象同步-差异对比',
  //     key,
  //     path: key,
  //     closable: true,
  //     search: queryString.stringify(
  //       uniqueFlagField.reduce((obj, item) => {
  //         obj[item] = record.get(item);
  //         return obj;
  //       }, {})
  //     ),
  //   });
  // };
  const handleSyncBefore = () => {
    const data = flatten(tabsDataSet.map((item) => item.selected)).map((record) => {
      return {
        objectCode: record.dataSet.getState('objectCode'),
        tableName: record.dataSet.getState('tableName'),
        mainTableId: record.get(record.dataSet.getState('primaryFlagField')),
        mgTenantInfo: record.get('mg_tenant_info'),
      };
    });
    if (data && data.length) {
      return data;
    } else {
      notification.info({
        message: intl.get(`hpdm.data-distribute.select.one`).d('请选择一条记录'),
      });
      return false;
    }
  };

  const syncTest = () => {
    const data = handleSyncBefore();
    if (data) {
      syncDs.current.set('recList', data);
      Modal.open({
        title: intl.get('srdm.config-object.model.sync.test').d('申请同步测试环境'),
        children: (
          <Form dataSet={syncDs} labelLayout="float">
            <TextField name="issueNum" />
            <Select name="approver" />
            <CheckBox name="blacklistFlag" />
          </Form>
        ),
        onOk: async () => {
          const res = await syncDs.submit();
          return res !== false;
        },
        afterClose: () => {
          syncDs.reset();
        },
      });
    }
  };

  const handleSync = () => {
    const { pcMigrateMode } = tabs.find((tab) => tab.objectId === tabKey) || {};
    if (pcMigrateMode === 1) {
      syncTest();
      return;
    }
    const body = handleSyncBefore();
    if (body) {
      setSession('config-object-sync-env-data', body);
      setSyncLoading(true);
      request(`${HZERO_SRDM}/v1/data-migrate-recs/public-data/scan`, {
        method: 'POST',
        body,
      }).then((res) => {
        setSyncLoading(false);
        if (res.failed) {
          notification.error({ message: res.message });
        } else {
          tabsDataSet.forEach((item) => item.unSelectAll());
          openAsyncTab(res.groupId);
        }
      });
    }
  };

  const openCompareModal = (record, name) => {
    Modal.open({
      style: {
        minWidth: 700,
      },
      title: '对比明细',
      children: (
        <DetailModal name={name} data={record.getState(compareData)} env={record.getState('env')} />
      ),
      okCancel: false,
    });
  };

  // const scanCurrent = () => {
  //   const data =
  //     (isDetail
  //       ? details.find((item) => item.tableName === group[activeKey])
  //       : tabs.find((item) => Number(item.objectId) === Number(objectId))) || {};
  //   scanDs.current.set({
  //     objectId: data.objectId,
  //   });
  //   Modal.open({
  //     title: intl.get('srdm.config-object.model.sync.scan').d('扫描当前对象'),
  //     children: (
  //       <Form dataSet={scanDs}>
  //         <DatePicker mode="dateTime" name="from" />
  //         <DatePicker mode="dateTime" name="to" />
  //       </Form>
  //     ),
  //     onOk: () => {
  //       scanDs.submit();
  //     },
  //     afterClose: () => {
  //       scanDs.reset();
  //     },
  //   });
  // };

  const onChangeGroup = (data, key) => {
    runInAction(() => {
      if (isDetail) {
        setActiveKey(key);
      } else {
        setCompareHidden(true);
        setCompareCodeFieldHidden(true);
        getObject(data);
      }
    });
  };

  const onChangeDist = useCallback(
    (key) => {
      const index = Number(key.split('-')[1]);
      runInAction(() => {
        setTabKey(index);
        if (tabsDataSet) {
          setCompareHidden(true);
          setCompareCodeFieldHidden(true);
          const curDs = tabsDataSet[index];
          if (!curDs.getState('autoQuery')) {
            curDs.query();
            curDs.setState('autoQuery', true);
          }
        }
      });
    },
    [tabsDataSet]
  );

  const openCodeCompareModal = (record) => {
    const { sourceValue = '', targetValue = '', encodeMode } = record.getState(
      compareData
    ).codeCompareResult;
    const needCrypto = encodeMode === 'Base64';
    const oriCode = needCrypto
      ? crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(sourceValue))
      : sourceValue;
    const currentCode = needCrypto
      ? crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(targetValue || ''))
      : targetValue;
    const modal = Modal.open({
      title: '代码比对',
      closable: true,
      movable: false, // 禁止移动
      destroyOnClose: true,
      style: { width: '70vw', height: '70vh' },
      bodyStyle: { width: '100%', height: 'calc(100% - 120px)', overflow: 'auto' },
      footer: (okBtn) => okBtn,
      children: (
        <CodeCompare
          oriCode={oriCode || ''}
          currentCode={currentCode || ''}
          modal={modal}
          oriTitle={`${record.getState('env')}环境值`}
          currentTitle="来源环境值"
        />
      ),
    });
  };

  const compareRenderer = useCallback(({ value, record, name }) => {
    if (value) {
      return '一致';
    }
    if (value === false) {
      if (name === compareField) {
        return <a onClick={() => openCompareModal(record, name)}>不一致</a>;
      }
      return <a onClick={() => openCodeCompareModal(record)}>不一致</a>;
    }
    return '-';
  }, []);

  return (
    <>
      <Header
        title={intl.get('srdm.config-object.model.sync.title').d('配置对象同步')}
        backPath={isDetail ? '/srdm/config-object-async' : null}
      >
        {isDetail ? null : (
          <Button color="primary" loading={syncLoading} onClick={handleSync}>
            {intl.get('srdm.config-object.model.sync.btn').d('申请同步')}
          </Button>
        )}
      </Header>
      <div className={styles['config-object-async']}>
        <div className={styles['config-object-left']}>
          {isDetail ? null : (
            <TextField
              placeholder={intl.get('srdm.config-object.model.sync.search').d('搜索名称/编码')}
              clearButton
              onClear={searchGroup}
              onChange={searchGroup}
              style={{ width: '100%' }}
            />
          )}
          <div className={styles['async-group']}>
            {group.length ? (
              group.map((data, key) => (
                <div
                  onClick={() => onChangeGroup(data, key)}
                  className={activeKey === data || activeKey === key ? 'active' : ''}
                >
                  <Icon type="bookmarks-o" />
                  {data}
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center' }}>
                {intl.get('hzero.common.message.data.none').d('暂无数据')}
              </p>
            )}
          </div>
        </div>
        <div className={styles['async-content']}>
          {disparateMode ? `${activeKey}组内存在不同迁移模式的对象, 请修改后重试` : null}
          {tabs.length && !disparateMode ? (
            <Tabs
              defaultActiveKey={tabs[0].objectId}
              className={styles['function-tabs']}
              onChange={onChangeDist}
            >
              {tabs.map((data, index) => {
                const { objectName, objectDesc, objectId: key } = data;
                return (
                  // eslint-disable-next-line
                  <TabPane tab={objectName} key={`${key}-${index}`}>
                    {objectDesc ? <Alert message={objectDesc} showIcon type="info" /> : null}
                    {tabsDataSet && tabsDataSet[index] ? (
                      <Table
                        dataSet={tabsDataSet[index]}
                        // autoHeight
                        columns={[
                          !compareHidden &&
                            tabsDataSet[index].queryDataSet.current.get('targetEnv') && {
                              name: compareField,
                              width: 85,
                              renderer: compareRenderer,
                            },
                          !compareCodeFieldHidden &&
                            tabsDataSet[index].queryDataSet.current.get('targetEnv') && {
                              name: compareCodeField,
                              width: 85,
                              renderer: compareRenderer,
                            },
                          ...tabsDataSet[index].props.fields,
                          {
                            name: 'mg_tenant_info',
                            lock: 'right',
                            width: 105,
                            hidden: tenantInfoHidden,
                          },
                          {
                            name: 'action',
                            lock: 'right',
                            header: intl.get('hzero.common.button.action').d('操作'),
                            width: 120,
                            align: 'center',
                            renderer: ({ record }) => (
                              <>
                                <a
                                  onClick={() => openDetailTab(record)}
                                  style={{ marginRight: 10 }}
                                >
                                  {intl.get('srdm.config-object.model.sync.detail').d('查看明细')}
                                </a>
                              </>
                            ),
                          },
                        ]}
                      />
                    ) : null}
                  </TabPane>
                );
              })}
            </Tabs>
          ) : null}
          {isDetail && detailDataSets[activeKey] ? (
            <Table
              selectionMode="none"
              dataSet={detailDataSets[activeKey]}
              columns={[...detailDataSets[activeKey].props.fields]}
              // autoHeight
            />
          ) : null}
        </div>
      </div>
    </>
  );
};

export default formatterCollections({
  code: [
    'srdm.config-object',
    'hpdm.config-object',
    'hzero.common',
    'hpdm.data-distribute',
    'srdm.deploy',
  ],
})(React.memo(ConfigObjectSync));
