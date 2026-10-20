import { connect } from 'dva';
// import { routerRedux } from 'dva/router';
// import { DataSet, Tabs, Table, DatePicker, Modal } from 'choerodon-ui/pro';
import {
  Form,
  TextArea,
  DataSet,
  Tabs,
  DatePicker,
  Modal,
  Icon,
  Lov,
  useDataSet,
} from 'choerodon-ui/pro';
import momentjs from 'moment';
import React, { Fragment, useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Menu, Layout, Spin, Divider, Tag, Tooltip } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import classnames from 'classnames';
import DynamicButtons from '_components/DynamicButtons';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import queryString from 'querystring';
import { openTab } from 'utils/menuTab';
import { isArray, isEmpty, compose, isFunction, isNil, pick } from 'lodash';
import { SRM_SPRM } from '_utils/config';
import cuxRemote from 'hzero-front/lib/utils/remote';
import { Button as PermissionButton } from 'components/Permission';
import { initiateAsyncExport } from 'hzero-front/lib/services/api';

import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
// import { Button } from 'components/Permission';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import injectGuide from 'srm-front-boot/lib/components/Guide/injectGuideList';
import formatterCollections from 'utils/intl/formatterCollections';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';

// import { wholeDs, operateRecordDs, historyVersionDs } from './indexDs';
import { wholeDs, historyVersionDs, operateRecordDs } from './store.js';
import { config, getFieldType, handleFieldList } from './../ForecastWorkbench/utils.js';
import {
  initLinesValue,
  initCols,
  dynamicArrComp,
  hisotryArrComp,
} from './../forecastComponents/util.js';
import Operation from './../ForecastWorkbench/Operation';
import HistoryTable from './HistoryModal.js';
import ViewFilter from './ViewFilter';
import './../ForcastWorkFlow/index.less';

// eslint-disable-next-line import/order
import { queryMapIdpValue, checkPermission } from 'services/api';
import { getTabsPropsCallback } from './hook';
// eslint-disable-next-line import/order
import {
  handleQueryTemp,
  deletefrstLines,
  releasefrstLines,
  releasefrstBatchLines,
  closefrstLines,
  concelfrstLines,
  updatefrstLines,
  queryTabCount,
  queryStartDate,
  sysExternal,
  aproveFrst,
  rejectFrst,
  fetchAllFrst,
  fetchDateDefaultFlag,
} from '@/services/forecastTemplateDefOrgService';
// eslint-disable-next-line import/order
import SprmImport from '@/routes/components/Imports';
import styles from './index.less';
import { THROTTLE_TIME } from '@/routes/utils';

const { Sider } = Layout;

const organizationId = getCurrentOrganizationId();
const { TabPane } = Tabs;
let baseLine = 'fcstQuantity';
const useSetState = (initialState) => {
  const [state, set] = useState(initialState);
  const setState = useCallback(
    (newState) => {
      set((prevState) => ({ ...prevState, ...newState }));
    },
    [set]
  );
  return [state, setState];
};

const that = {
  changeTab: () => {},
};

const Index = ({ customizeTabPane, remote }) => {
  const {
    cuxCol = null,
    beforeDeleteLine,
    beforeClose,
    beforeCancel,
    cuxRenderAlertInfo,
    cuxSetInitState,
    releaseBtnDisabled,
    cuxListDsProps,
    cuxHistoryColsFc,
    cuxHandleImport,
    cuxUpdateLineArray,
    cuxWholeDsUpdate,
  } = remote?.props?.process || {};
  injectGuide(`/sprm/forecast-workbench/list`, config);
  const [currentTab, setCurrentTab] = useState('awaitRelease');
  const [sourceType, setSourceTab] = useState('all');
  const [queryDate, setQueryDate] = useState({
    fcstDateRangeEnd: undefined,
    fcstDateRangeStart: undefined,
  });
  const [templateHeaderId, setTemplateHeaderId] = useState(null);
  const [expandAllFlag, setExpandAll] = useState(true);
  const [templateCode, setTemplateCode] = useState(null);
  const [templateList, setTemplateList] = useState([]);
  const [countMap, setCountMap] = useState({}); // 各个tab表格数量
  const [loadings, setLoadings] = useState({});
  const [cols, setCols] = useState([]);
  const [init, setInt] = useState(0); // 是否查询过模板
  const [initFlag, setInitFlag] = useState(false); // 是否初始化过
  const historyModalRef = useRef(null);
  const [dsFields, setDsFields] = useState([]);
  const [dateDefaultFlag, setDateDefaultFlag] = useState(false);
  const [waitCustomize, setWaitCustomize] = useState(false);
  const [state, setState] = useSetState({
    needFeedback: 0,
    initStartDate: [],
    showFieldsList: [],
    // permissionsMaps: {},
    lines: initLinesValue(),
    numline: initLinesValue(),
    taxLine: initLinesValue(),
    notTaxLine: initLinesValue(),
    tabNeedFeedback: 1,
    allowChange: 0,
    initCol: initCols,
    collapsed: false, // 设置菜单初始折叠参数
    menuLoading: false,
    predictionDimension: 'QUANTITY',
  });

  const processListDsProps = useCallback(
    (normalProps) => {
      return isFunction(cuxListDsProps) ? cuxListDsProps(normalProps) : normalProps;
    },
    [cuxListDsProps]
  );

  const awaitReleaseDs = useDataSet(
    () =>
      processListDsProps(
        wholeDs({ currentTab: 'awaitRelease', templateHeaderId, dsFields, cuxWholeDsUpdate })
      ),
    [templateHeaderId, dsFields, processListDsProps]
  );
  const awaitFeedbackDs = useDataSet(
    () =>
      processListDsProps(
        wholeDs({ currentTab: 'awaitFeedback', templateHeaderId, dsFields, cuxWholeDsUpdate })
      ),
    [templateHeaderId, dsFields, processListDsProps]
  );
  const hasFeedbackDs = useDataSet(
    () =>
      processListDsProps(
        wholeDs({ currentTab: 'hasFeedback', templateHeaderId, dsFields, cuxWholeDsUpdate })
      ),
    [templateHeaderId, dsFields, processListDsProps]
  );
  const allDs = useDataSet(
    () =>
      processListDsProps(
        wholeDs({ currentTab: 'all', templateHeaderId, dsFields, cuxWholeDsUpdate })
      ),
    [templateHeaderId, dsFields, processListDsProps]
  );
  const versionTableDs = useDataSet(
    () => wholeDs({ currentTab: 'version', templateHeaderId, dsFields, cuxWholeDsUpdate }),
    [templateHeaderId, dsFields]
  );
  const awaitApproveDs = useDataSet(
    () =>
      processListDsProps(
        wholeDs({ currentTab: 'awaitApprove', templateHeaderId, dsFields, cuxWholeDsUpdate })
      ),
    [templateHeaderId, dsFields, processListDsProps]
  );

  const historyDs = useDataSet(() => historyVersionDs({ dsFields }), [templateHeaderId, dsFields]);

  const {
    needFeedback,
    initStartDate,
    showFieldsList,
    // permissionsMaps,
    lines,
    numline,
    taxLine,
    notTaxLine,
    tabNeedFeedback,
    allowChange,
    feedbackChangeCnf,
    initCol,
    offlineInputFlag,
    detailFeedbackFlag,
    feedbackSyncFlag,
    collapsed,
    menuLoading,
    predictionDimension,
    versionViewDimension,
  } = state;

  useEffect(() => {
    const code = [
      'hzero.srm.requirement.forecast.purchaser.workbench.ps.import',
      'hzero.srm.requirement.forecast.purchaser.workbench.ps.export',
      'hzero.srm.requirement.forecast.purchaser.workbench.button.offline-import',
      'hzero.srm.requirement.forecast.purchaser.workbench.button.offline-export',
      'hzero.srm.requirement.forecast.purchaser.workbench.button.feedbacksyn',
      'hzero.srm.requirement.forecast.purchaser.workbench.button.cancel',
      'hzero.srm.requirement.forecast.purchaser.workbench.ps.btn.delete',
    ];
    Promise.all([
      checkPermission(code),
      queryMapIdpValue({
        numline: 'SPRM.FCST_CATEGORY',
        taxLine: 'SPRM.FCST_CATEGORY_AMOUNT_INCLUDING_TAX',
        notTaxLine: 'SPRM.FCST_CATEGORY_AMOUNT_EXCLUDING_TAX',
      }),
      fetchAllFrst(),
      fetchDateDefaultFlag(),
    ]).then((result) => {
      const permissionsMap = new Map();
      const [res1, res2, res3, res4] = result.map((item) => getResponse(item));
      if (res1 && res2) {
        if (isArray(res1)) {
          (res1 || []).forEach((item) => {
            permissionsMap[item.code] = item.approve;
          });
        }
        setState({ permissionsMaps: permissionsMap, ...res2 });
      }
      if (res3) {
        if (getResponse(res3)) {
          const newShowLines =
            res3[0]?.predictionDimensionCnf === 'QUANTITY'
              ? res2?.numline
              : res3[0]?.predictionDimensionCnf === 'AMOUNT_INCLUDING_TAX'
              ? res2?.taxLine
              : res2?.notTaxLine;
          setState({
            lines: newShowLines,
            predictionDimension: res3[0]?.predictionDimensionCnf,
          });
          setTemplateList(res3);
          setTemplateHeaderId(res3[0]?.templateHeaderId);
          setTemplateCode(res3[0]?.templateCode);
        } else {
          setTemplateList([]);
        }
        setState({ menuLoading: false });
      }
      if (res4) {
        setDateDefaultFlag(!isEmpty(res4));
      }
    });
    if (isFunction(cuxSetInitState)) {
      cuxSetInitState(setState);
    }
    setState({ menuLoading: true });
  }, []);

  useEffect(() => {
    if (templateHeaderId) {
      that.templateHeaderId = templateHeaderId;
      that.changeTab = changeTab;
    }
  }, [templateHeaderId, changeTab]);

  useEffect(() => {
    if (templateHeaderId) {
      setCountMap({});
      queryStartDate({ templateHeaderId }).then((res) => {
        if (getResponse(res)) {
          if (isArray(res) && dateDefaultFlag) {
            // 最新日期作为查询日期
            const lastDateStr = res[res.length - 1];
            const lastDate = lastDateStr ? momentjs(lastDateStr) : null;
            setQueryDate({
              fcstDateRangeStart: lastDate,
              fcstDateRangeEnd: lastDate,
            });
          }
          setState({ initStartDate: res });
        }
      });
    }
  }, [templateHeaderId, dateDefaultFlag]);

  // 模版变更设置各种状态且字段值
  useEffect(() => {
    if (templateHeaderId) {
      if (init === 0) {
        if (queryDate?.fcstDateRangeStart?.toJSON() || queryDate?.fcstDateRangeEnd?.toJSON()) {
          console.log('init date');
          const { fcstDateRangeStart, fcstDateRangeEnd } = queryDate;
          handleQueryTemp({
            templateHeaderId,
            fcstStartDate:
              fcstDateRangeStart?.format(DEFAULT_DATE_FORMAT) ||
              fcstDateRangeEnd?.format(DEFAULT_DATE_FORMAT),
          }).then((res) => {
            if (res && !res.failed) {
              const {
                dynamicColumnFields,
                fields,
                allowChange: templateAllowChange,
                offlineInputFlag: tempOfflineInputFlag,
                needFeedback: newNeedFeedback,
                predictionDimensionCnf = 'QUANTITY',
                detailFeedbackFlag: tempDetailFeedbackFlag,
                feedbackChangeCnf: tempFeedbackChangeCnf,
                feedbackSyncFlag: tempFeedbackSyncFlag,
                versionViewDimension: versionViewDimensions,
              } = res;

              const showLines =
                predictionDimensionCnf === 'QUANTITY'
                  ? numline
                  : predictionDimensionCnf === 'AMOUNT_INCLUDING_TAX'
                  ? taxLine
                  : notTaxLine;

              const newdsFields = [];
              // 动态列取值逻辑-ds设置 处理速度很慢
              dynamicColumnFields.forEach((ele) => {
                const { required, fieldCode, fieldName, fcstLineType, fcstSeq } = ele;
                newdsFields.push({
                  required,
                  name: fcstLineType === 'DAY' ? `${fcstLineType}${fcstSeq}` : fieldCode,
                  type: 'number',
                  min: 0,
                  precision: 10,
                  label: fieldName,
                });
              });
              // 动态列取值逻辑-动态列设置
              const dynamicColumn = dynamicArrComp(
                dynamicColumnFields,
                {
                  needFeedback: newNeedFeedback,
                  allowChange: templateAllowChange,
                  offlineInputFlag: tempOfflineInputFlag,
                  feedbackChangeCnf: tempFeedbackChangeCnf,
                  detailFeedbackFlag: tempDetailFeedbackFlag,
                  feedbackSyncFlag: tempFeedbackSyncFlag,
                  predictionDimensionCnf,
                  fcstDateRangeStart: fcstDateRangeStart?.format(DEFAULT_DATE_FORMAT),
                  fcstDateRangeEnd: fcstDateRangeEnd?.format(DEFAULT_DATE_FORMAT),
                  sourceType,
                },
                'purchase'
              );
              // 虚拟字段/供应商字段逻辑处理
              const newShowFieldsList = handleFieldList({
                fields,
                allowChange: templateAllowChange,
                needFeedback: newNeedFeedback,
                predictionDimensionCnf,
              });

              // 模版查询设置 处理速度很慢
              newShowFieldsList.forEach((ele) => {
                const {
                  required,
                  lovCode,
                  fieldType,
                  fieldName,
                  fieldCode,
                  lovInfo,
                  fcstTemplateLovParamsList = [],
                } = ele;
                const { valueField, displayField } = lovInfo || {};
                const type = getFieldType(fieldType);
                const checkedValueSetting =
                  type === 'boolean' ? { trueValue: 1, falseValue: 0 } : {};
                const dynamicProps = {
                  lovPara: ({ record }) => {
                    const data = {};
                    if (fcstTemplateLovParamsList.length > 0) {
                      fcstTemplateLovParamsList.forEach((item) => {
                        const { lovParamName, lovValueCode } = item;
                        data[lovParamName] = record.get(lovValueCode)
                          ? record.get(lovValueCode)[lovValueCode] || record.get(lovValueCode)
                          : record.get(lovValueCode);
                      });
                    }
                    return { ...data };
                  },
                };

                const dsField = newdsFields.find((data) => data.name === fieldCode);
                // 更改已存在的数据的必输性，值集，字段名
                if (dsField) {
                  dsField.required = required;
                  dsField.lovCode = lovCode;
                  dsFields.label = fieldName;
                } else if (lovCode && fieldType === 'SELECT') {
                  // 更改个性化字段且为下拉框数据 的 必输性，值集，字段名
                  newdsFields.push({
                    required,
                    type,
                    name: ele.fieldCode,
                    lookupCode: lovCode,
                    label: fieldName,
                  });
                } else if (
                  lovCode &&
                  !['INPUT', 'INPUT_NUMBER', 'DATE_PICKER'].includes(fieldType)
                ) {
                  newdsFields.push({
                    name: ele.fieldCode,
                    required,
                    type,
                    lovCode,
                    label: fieldName,
                    dynamicProps,
                    transformRequest: (value) => (value ? value[valueField] : undefined),
                    transformResponse: (value, object) => {
                      return object
                        ? {
                            ...object,
                            [valueField]: object ? object[fieldCode] : null,
                            [displayField]: object ? object[`${fieldCode}Meaning`] : null,
                          }
                        : null;
                    },
                  });
                } else {
                  // 其余字段
                  newdsFields.push({
                    name: ele.fieldCode,
                    required,
                    type,
                    lovCode,
                    label: fieldName,
                    ...checkedValueSetting,
                  });
                }
              });
              console.log(templateAllowChange);
              setState({
                lines: showLines,
                showFieldsList: newShowFieldsList,
                allowChange: templateAllowChange,
                needFeedback: newNeedFeedback,
                predictionDimension: predictionDimensionCnf,
                offlineInputFlag: tempOfflineInputFlag,
                feedbackChangeCnf: tempFeedbackChangeCnf,
                detailFeedbackFlag: tempDetailFeedbackFlag,
                feedbackSyncFlag: tempFeedbackSyncFlag,
                versionViewDimension: versionViewDimensions,
              });
              const cuxFields = remote.process('SPRM_FORECAST_WORKBENCH_CUX_FIELDS', newdsFields);
              setDsFields(cuxFields);
              setCols(dynamicColumn);
              setInt(1);
            }
          });
        }
      }
    }
  }, [templateHeaderId, init, queryDate, numline, taxLine, notTaxLine]);

  useEffect(() => {
    const dsList = [
      awaitReleaseDs,
      awaitFeedbackDs,
      hasFeedbackDs,
      allDs,
      versionTableDs,
      awaitApproveDs,
    ];

    const queryFuncback = ({ dataSet }) => {
      queryPurchaseCount({
        templateHeaderId,
        fcstDateRangeStart: dataSet.getQueryParameter('fcstDateRangeStart'),
        fcstDateRangeEnd: dataSet.getQueryParameter('fcstDateRangeEnd'),
      });
    };

    if (templateHeaderId) {
      if (init) {
        dsList.forEach((ds) => {
          ds.setQueryParameter(
            'fcstDateRangeStart',
            queryDate?.fcstDateRangeStart?.format(DEFAULT_DATE_FORMAT)
          );
          ds.setQueryParameter(
            'fcstDateRangeEnd',
            queryDate?.fcstDateRangeEnd?.format(DEFAULT_DATE_FORMAT)
          );
          ds.setQueryParameter('templateHeaderId', templateHeaderId);
          if (init) {
            ds.setState('initParams', {
              needFeedback,
              showLines: lines,
              predictionDimensionCnf: predictionDimension,
            });
            ds.addEventListener('query', queryFuncback);
          }
        });
        console.log(showFieldsList);
        const columns = [
          {
            name: 'viewVersion',
            width: 90,
            hidden: sourceType === 'all' || currentTab !== 'all',
            renderer: ({ record, value }) => record?.get('viewVersionMeaning') || value,
          },
        ];
        const lockObj = { L: 'left', R: 'right', N: false };
        // 模版查询设置 处理速度很慢
        showFieldsList.forEach((ele) => {
          const { fieldCode, editable, supplierEditable, width, fixed } = ele;

          if (fieldCode === 'actionLine') {
            columns.push({
              name: 'actionLine',
              width: 90,
              lock: lockObj[fixed] || false,
              renderer: ({ record }) =>
                record.get('fcrtType') === 'fcstQuantity' &&
                (record.get('fcstHeaderId') || record.get('fcstHeaderIdMain')) ? (
                  <span>
                    <a
                      onClick={() => {
                        actionHistory(record);
                      }}
                    >
                      {intl.get(`hzero.common.button.operation`).d('操作记录')}
                    </a>
                  </span>
                ) : (
                  '-'
                ),
            });
          } else if (fieldCode === 'customizeVersion') {
            columns.push({
              name: 'customizeVersion',
              width: 120,
              lock: lockObj[fixed] || false,
              renderer: ({ record }) =>
                record.get('fcrtType') === 'fcstQuantity' ? (
                  record.get('latestReleaseVersion') ? (
                    <span>
                      <a
                        onClick={() => {
                          handleVersion({ record });
                        }}
                      >
                        {intl.get(`hzero.common.button.historyVersion`).d('历史版本')}-
                        {record.get('latestReleaseVersion')}
                      </a>
                    </span>
                  ) : (
                    '-'
                  )
                ) : (
                  <span />
                ),
            });
          } else if (fieldCode === 'syncStatus') {
            columns.push({
              name: 'syncStatus',
              width: 120,
              renderer: ({ value, record }) => {
                if (value === 'SYNC_SUCCESS') {
                  return (
                    <Tag color="green" style={{ border: 'none' }}>
                      {record.get('syncStatusMeaning')}
                    </Tag>
                  );
                } else if (value === 'SYNC_FAILURE') {
                  return (
                    <Tag color="red" style={{ border: 'none' }}>
                      {record.get('syncStatusMeaning')}
                    </Tag>
                  );
                } else {
                  return (
                    <Tag color="yellow" style={{ border: 'none' }}>
                      {record.get('syncStatusMeaning')}
                    </Tag>
                  );
                }
              },
            });
          } else if (fieldCode === 'dynamicCol') {
            columns.push('dynamicCol');
          } else if (fieldCode === 'sumQiantity' && predictionDimension === 'QUANTITY') {
            columns.push({
              name: 'sumQiantity',
              lock: lockObj[fixed] || false,
              renderer: ({ text, value }) => (
                <span style={{ color: Number(value) < 0 ? 'red' : '#333' }}>{text || '-'}</span>
              ),
            });
          } else if (fieldCode === 'sumAmount' && predictionDimension !== 'QUANTITY') {
            columns.push({
              name: 'sumAmount',
              lock: lockObj[fixed] || false,
              renderer: ({ text, value }) => (
                <span style={{ color: Number(value) < 0 ? 'red' : '#333' }}>{text}</span>
              ),
            });
          } else if (fieldCode === 'fcstStatus') {
            columns.push({
              name: 'fcstStatus',
              lock: lockObj[fixed] || false,
              width,
              headerStyle: { paddingLeft: 38 },
              renderer: ({ record }) => (
                <RenderTag
                  fieldCode={fieldCode}
                  fcrtType={record.get('fcrtType')}
                  record={record}
                />
              ),
            });
          } else if (fieldCode === 'fcstStartDate') {
            columns.push({
              name: 'fcstStartDate',
              lock: lockObj[fixed] || false,
              width,
              editor: (record) => record.get('initFcstStartDate'),
              renderer: ({ record, text }) => (
                <RenderWhiteboard
                  fieldCode={fieldCode}
                  fcrtType={record.get('fcrtType')}
                  text={text}
                  editor={record.get('initFcstStartDate')}
                />
              ),
            });
          } else if (fieldCode === 'categoryId') {
            columns.push({
              name: fieldCode,
              width,
              lock: lockObj[fixed] || false,
              renderer: ({ record, text }) => (
                <RenderWhiteboard
                  fieldCode={fieldCode}
                  fcrtType={record.get('fcrtType')}
                  text={text}
                  editor={editable === 1 && ['NEW'].includes(record.get('fcstStatus'))}
                />
              ),
              editor: (record) =>
                editable === 1 &&
                ['NEW'].includes(record.get('fcstStatus')) &&
                record?.get('sourceType') !== 'version' ? (
                  <Lov
                    name="categoryId"
                    tableProps={{
                      mode: 'tree',
                      selectionMode: 'rowbox',
                      onRow: (row) => {
                        const handleSelect = ({ dataSet, record: _record }) => {
                          if (dataSet && _record) {
                            dataSet.select(_record);
                          }
                        };
                        return {
                          onClick: () => handleSelect(row),
                          onDoubleClick: () => {
                            if (row?.record?.selectable) {
                              handleSelect(row);
                              record.set({
                                categoryId: row?.record?.toData(),
                              });
                              Modal.destroyAll();
                            }
                          },
                        };
                      },
                    }}
                  />
                ) : (
                  false
                ),
            });
          } else if (fieldCode === 'fcrtType') {
            columns.push({
              name: fieldCode,
              width,
              lock: lockObj[fixed] || false,
              renderer: ({ record }) => record.get('fcrtTypeMeaning'),
            });
          } else if (fieldCode === 'operation') {
            if (['all', 'awaitRelease'].includes(currentTab)) {
              columns.push({
                name: fieldCode,
                width: 120,
                hidden: sourceType !== 'all' && currentTab === 'all',
                lock: lockObj[fixed] || false,
                command: ({ record, dataSet }) => {
                  const { fcstStatus, splitSourceFcstNum } = record.get([
                    'fcstStatus',
                    'splitSourceFcstNum',
                  ]);
                  return [
                    <PermissionButton
                      key="split"
                      type="c7n-pro"
                      funcType="link"
                      onClick={() => handleSplit(record, dataSet)}
                      disabled={
                        fcstStatus !== 'NEW' ||
                        !isNil(splitSourceFcstNum) ||
                        !(record.get('fcstHeaderId') || record.get('fcstHeaderIdMain'))
                      }
                      permissionList={[
                        {
                          code: `hzero.srm.requirement.forecast.purchaser.workbench.button.split`,
                          type: 'button',
                          meaning: '拆分',
                        },
                      ]}
                    >
                      {intl.get('sprm.common.view.button.split').d('拆分')}
                    </PermissionButton>,
                  ];
                },
              });
            }
          } else {
            columns.push({
              name: fieldCode,
              width,
              lock: lockObj[fixed] || false,
              renderer: ({ record, text }) => (
                <RenderWhiteboard
                  fieldCode={fieldCode}
                  supplierEditable={supplierEditable}
                  fcrtType={record.get('fcrtType')}
                  text={text}
                  editor={editable === 1 && ['NEW'].includes(record.get('fcstStatus'))}
                />
              ),
              editor: (record) =>
                editable === 1 &&
                ['NEW'].includes(record.get('fcstStatus')) &&
                record?.get('sourceType') !== 'version',
            });
          }
        });

        setState({
          initCol: columns,
        });
      }

      if (init) {
        const currentDs = getCurrentDs(currentTab);
        currentDs.query();
        historyDs.setQueryParameter('templateHeaderId', templateHeaderId);
        historyDs.setState('initParams', {
          needFeedback,
          showLines: lines,
          predictionDimensionCnf: predictionDimension,
        });
      } else {
        setInt(0);
      }
    }

    return () => {
      dsList.forEach((ds) => {
        ds.removeEventListener('query', queryFuncback);
      });
    };
  }, [
    awaitReleaseDs,
    awaitFeedbackDs,
    hasFeedbackDs,
    allDs,
    versionTableDs,
    awaitApproveDs,
    historyDs,
    queryDate,
    templateHeaderId,
    needFeedback,
    lines,
    showFieldsList,
    predictionDimension,
    dsFields,
    init,
    currentTab,
    sourceType,
  ]);

  const collapsedChange = (type) => {
    setState({ collapsed: type });
  };

  // 设置时间且非初始化的动态列
  const handleChange = (moment, frstDateType) => {
    const currentDs = getCurrentDs(currentTab);
    let fcstDateRangeStart;
    let fcstDateRangeEnd;
    if (frstDateType) {
      fcstDateRangeStart =
        frstDateType === 'fcstDateRangeStart' ? moment : queryDate?.fcstDateRangeStart;
      fcstDateRangeEnd = moment;
    } else {
      fcstDateRangeStart = moment?.fcstDateRangeStart;
      fcstDateRangeEnd = moment?.fcstDateRangeEnd;
    }
    if (!fcstDateRangeStart?.toJSON() && !fcstDateRangeEnd?.toJSON()) {
      return;
    }
    setQueryDate({
      fcstDateRangeStart,
      fcstDateRangeEnd,
    });
    if (init === 1) {
      handleQueryTemp({
        templateHeaderId,
        fcstStartDate:
          fcstDateRangeStart?.format(DEFAULT_DATE_FORMAT) ||
          fcstDateRangeEnd?.format(DEFAULT_DATE_FORMAT),
      }).then((res) => {
        if (res && !res.failed) {
          const { dynamicColumnFields, predictionDimensionCnf } = res;
          const dynamicColumn = dynamicArrComp(
            dynamicColumnFields,
            {
              allowChange,
              feedbackChangeCnf,
              needFeedback: tabNeedFeedback,
              detailFeedbackFlag,
              currentDs,
              predictionDimensionCnf,
              fcstDateRangeStart: fcstDateRangeStart?.format(DEFAULT_DATE_FORMAT),
              fcstDateRangeEnd: fcstDateRangeEnd?.format(DEFAULT_DATE_FORMAT),
            },
            'purchase'
          );
          setCols(dynamicColumn);
        }
      });
    }
  };

  const RenderWhiteboard = observer((data) => {
    const { fcrtType, text, fieldCode, supplierEditable, editor } = data;
    return (fcrtType === baseLine && !supplierEditable) ||
      (supplierEditable === 1 && fcrtType === 'feedbackQuantity') ||
      fieldCode === 'fcrtType' ||
      fcrtType === 'fcstQuantity' ? (
      <span>{text || (editor ? '' : '-')}</span>
    ) : (
      <span>{editor ? '' : '-'}</span>
    );
  });

  const RenderTag = observer((data) => {
    const { fcrtType, record } = data;
    const { fcstStatus, fcstStatusMeaning } =
      record?.get(['fcstStatus', 'fcstStatusMeaning']) || {};
    let color = 'gray';
    if (
      [
        'NEW',
        'UNRELEASED',
        'CHANGED',
        'FEEDBACK_IN_APPROVAL',
        'FEEDBACK_PEND_APPROVAL',
        'FEEDBACK_REJECTED',
      ].includes(fcstStatus)
    ) {
      color = 'yellow';
    }
    if (['RELEASED', 'FEEDBACK', 'CLOSED', 'CANCELED'].includes(fcstStatus)) {
      color = 'green';
    }
    return fcrtType === baseLine ? (
      <span>
        <Tag color={color} style={{ border: 'none' }}>
          {fcstStatusMeaning}
        </Tag>
      </span>
    ) : (
      <span />
    );
  });

  // 查询数量
  const queryPurchaseCount = (queryParams) => {
    queryTabCount({ ...queryParams, onlyCountLimit: 100 }).then((res) => {
      setCountMap(res);
    });
  };

  const dayRenderer = (props, text, currentDate) => {
    if (initStartDate.includes(currentDate.format(DEFAULT_DATE_FORMAT))) {
      // eslint-disable-next-line no-param-reassign
      props.className = 'c7n-pro-calendar-cell-color';
      return <td {...props} />;
    } else {
      return <td {...props} />;
    }
  };

  const cellRenderer = (view) => {
    if (view === 'date') {
      return dayRenderer;
    }
  };

  const handleSplit = useCallback((record, dataSet) => {
    const splitRecord = dataSet.create({}, record.index + 1);
    const jsonData = record.toData();
    const getterData = record.get(Array.from(dataSet.fields.keys())); // 解决transform问题
    const { fcstNum, lineNum, fcstHeaderId, fcstHeaderIdMain, fcstLineList = [] } = jsonData;
    splitRecord.init({
      ...jsonData,
      ...getterData,
      fcstNum: null,
      lineNum: null,
      fcstHeaderId: null,
      fcstHeaderIdMain: null,
      version: null,
      latestReleaseVersion: null,
      latestFeedbackVersion: null,
      syncStatus: null,
      syncDate: null,
      syncMsg: null,
      releaseStatus: null,
      objectVersionNumber: null,
      createdBy: null,
      createdByName: null,
      creationDate: null,
      sourcePlatform: 'SRM',
      splitSourceFcstNum: `${fcstNum}-${lineNum}`,
      splitSourceFcstHeaderId: fcstHeaderId || fcstHeaderIdMain,
      fcstLineList: fcstLineList.map(({ fcstSeq, fcstLineType, ...item }) => ({
        ...pick(item, [
          'fcstDate',
          'fcstQuantity',
          'cycleStartTime',
          'cycleEndTime',
          'fcstHeaderId',
        ]),
        fcstLineType,
        fcstSeq: fcstLineType === 'DAY' ? `${fcstLineType}${fcstSeq}` : fcstSeq,
      })),
    });
  }, []);

  const getColums = useMemo(() => {
    const newCol = [];
    initCol.forEach((ele) => {
      if (ele !== 'dynamicCol') {
        newCol.push(ele);
      } else {
        newCol.push(...cols);
      }
    });
    const fcstStatusObj = newCol.find((ele) => ele.name === 'fcstStatus');
    if (fcstStatusObj) {
      if (currentTab === 'awaitRelease') {
        fcstStatusObj.headerStyle = { paddingLeft: 10 };
      } else {
        fcstStatusObj.headerStyle = { paddingLeft: 38 };
      }
    }
    if (isFunction(cuxCol)) {
      return cuxCol(
        newCol.filter((ele) =>
          predictionDimension === 'QUANTITY' ? ele.name !== 'sumAmount' : ele.name !== 'sumQiantity'
        ),
        {
          cols,
          newCol,
          initCol,
          currentTab,
          templateCode,
          predictionDimension,
        }
      );
    } else {
      return newCol.filter((ele) =>
        predictionDimension === 'QUANTITY' ? ele.name !== 'sumAmount' : ele.name !== 'sumQiantity'
      );
    }
  }, [cols, initCol, currentTab, predictionDimension, cuxCol]);

  const HeaderComp = useMemo(() => {
    const { queryDataDom = null } = remote.props.process;
    const QueryDataDom = isFunction(queryDataDom)
      ? queryDataDom({
          onChange: handleChange,
          queryDate,
          cellRenderer,
          setQueryDate,
        })
      : null;
    return (
      <div>
        <span style={{ fontSize: 16, fontWeight: 500 }}>
          {intl.get('sprm.forecastMgt.model.common.forecastWorkbench').d('预测管理工作台')}
        </span>
        {templateHeaderId && (
          <>
            <Divider type="vertical" />
            {isFunction(queryDataDom) ? (
              QueryDataDom
            ) : (
              <Tooltip
                title={intl
                  .get('sprm.forecastMgt.model.enterQueryDate.tooltip')
                  .d('请输入预测起始日期或预测结束日期')}
              >
                <DatePicker
                  style={{ fontSize: '12px' }}
                  onChange={(value) => handleChange(value)}
                  value={queryDate}
                  clearButton={false}
                  showValidation="tooltip"
                  range={['fcstDateRangeStart', 'fcstDateRangeEnd']}
                  cellRenderer={cellRenderer}
                  className={classnames('required-edit-alert', 'required-edit-alert-two')}
                  placeholder={[
                    intl.get('sprm.forecastMgt.model.enterQueryDate').d('请输入预测起始日期'),
                    intl
                      .get('sprm.forecastMgt.model.enterQueryDate.fcstDateRangeEnd')
                      .d('请输入预测结束日期'),
                  ]}
                  required={queryDate}
                />
              </Tooltip>
            )}
          </>
        )}
      </div>
    );
  }, [templateHeaderId, queryDate, state, currentTab]);

  // 删除采购申请行
  const handleLineDelete = () => {
    const lineDs = getCurrentDs(currentTab);
    setLoadings({ ...loadings, saveLoading: true });
    const { selected } = lineDs;
    const deleUpdateArr = selected.filter(
      (ele) => ele.get('fcstHeaderId') || ele.get('fcstHeaderIdMain')
    );
    if (deleUpdateArr.length > 0) {
      const deleteLine = deleUpdateArr.map((ele) => ({
        fcstHeaderId: ele.get('fcstHeaderId') || ele.get('fcstHeaderIdMain'),
        fcstStatus: ele.get('fcstStatus'),
        _token: ele.get('_token'),
        objectVersionNumber: ele.get('objectVersionNumber'),
      }));
      Modal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: (
          <div>
            {intl.get('hzero.c7nProUI.DataSet.delete_selected_row_confirm').d('确认删除选中行？')}
          </div>
        ),
      }).then(async (button) => {
        if (button === 'ok') {
          const remoteFlag = await beforeDeleteLine({
            currentTab,
            deleteLine: deleUpdateArr.map((ele) => ele.toJSONData()),
          });
          if (!remoteFlag) {
            setLoadings({ ...loadings, saveLoading: false });
            return false;
          }
          return new Promise((resolve) => {
            deletefrstLines(deleteLine)
              .then((res) => {
                if (res && !res?.failed) {
                  lineDs.unSelectAll();
                  lineDs.clearCachedSelected();
                  // lineDsResultMap();
                  setLoadings({ ...loadings, saveLoading: false });
                  lineDs.query();
                  notification.success();
                } else {
                  setLoadings({ ...loadings, saveLoading: false });
                  notification.error({ message: res?.message });
                }
              })
              .finally(() => {
                resolve();
                setLoadings({ ...loadings, saveLoading: false });
              });
          });
        } else {
          setLoadings({ ...loadings, saveLoading: false });
        }
      });
    } else {
      lineDs.remove(selected);
      setLoadings({ ...loadings, saveLoading: false });
    }
  };

  const actionHistory = (record, activeCols) => {
    const fcstHeaderId = record.get('fcstHeaderId') || record.get('fcstHeaderIdMain');
    const operateLineDs = new DataSet(operateRecordDs(fcstHeaderId));
    operateLineDs.setQueryParameter('fcstHeaderId', fcstHeaderId);
    operateLineDs.query();
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 742 },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get(`hzero.common.button.operation`).d('操作记录'),
      children: (
        <Operation
          operateLineDs={operateLineDs}
          fcstHeaderId={record.get('fcstHeaderId') || record.get('fcstHeaderIdMain')}
          handleVersion={handleVersion}
          activeCols={activeCols}
        />
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  const handleVersion = (params) => {
    const { record } = params;
    historyDs.setQueryParameter(
      'fcstHeaderId',
      record.get('fcstHeaderId') || record.get('fcstHeaderIdMain')
    );
    historyDs.setQueryParameter('version', record.get('version'));
    historyDs.setQueryParameter(
      'queryDate',
      record.get('fcstStartDate')?.format(DEFAULT_DATE_FORMAT)
    );
    const columns = [];
    handleQueryTemp({
      templateHeaderId,
      fcstStartDate: record.get('fcstStartDate')?.format(DEFAULT_DATE_FORMAT),
    }).then((res) => {
      if (res && !res?.failed) {
        const {
          dynamicColumnFields,
          detailFeedbackFlag: historyDetailFeedbackFlag,
          predictionDimensionCnf = 'QUANTITY',
        } = res || {};
        const hisotryArr = hisotryArrComp(dynamicColumnFields, {
          detailFeedbackFlag: historyDetailFeedbackFlag,
          predictionDimensionCnf,
          viewedBy: 'purchase',
        });
        if (historyModalRef && hisotryArr.length > 0) {
          historyModalRef.current.props.modal.update({
            children: (
              <HistoryTable
                columns={hisotryArr}
                ref={historyModalRef}
                historyDs={historyDs}
                cuxHistoryColsFc={cuxHistoryColsFc}
                predictionDimensionCnf={predictionDimensionCnf}
              />
            ),
          });
        }
      }
    });
    historyDs.query();
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '1090px' },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get(`hzero.common.button.historyVerison`).d('历史版本'),
      children: (
        <HistoryTable
          columns={columns}
          ref={historyModalRef}
          historyDs={historyDs}
          predictionDimensionCnf={predictionDimension}
        />
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  // 保存行
  const handleLineSave = async (createFlag, tabValue) => {
    const lineDs = getCurrentDs(currentTab);
    const aimDs = getCurrentDs(tabValue);
    setLoadings({ ...loadings, saveLoading: true });
    const updateLine = lineDs.toJSONData();
    const validateFlag = await lineDs.validate();
    if (validateFlag) {
      const fieldCodeList = {};
      const updateLineArray = updateLine.map((item) => {
        // 更新
        if (item.fcstHeaderIdMain || item.fcstHeaderId) {
          const { fcstHeaderIdMain } = item;

          const record = lineDs.find((ele) => ele.get('fcstHeaderIdMain') === fcstHeaderIdMain);

          const itemFcstLineList = record?.parent
            ? record.parent?.get('fcstLineList').toJS()
            : item.fcstLineList;
          const fcstLineList = itemFcstLineList.map(
            ({ fcstDate, fcstLineType, fcstSeq, ...ele }) => {
              const fcstName = fcstLineType === 'DAY' ? `${fcstLineType}${fcstSeq}` : fcstDate;
              return {
                ...ele,
                fcstLineType,
                fcstSeq,
                fcstDate,
                fcstQuantity: item[fcstName],
              };
            }
          );
          return {
            ...item,
            fcstHeaderId: item.fcstHeaderIdMain || item.fcstHeaderId,
            fcstLineList,
          };
        } else {
          // 根据动态列,获取数据
          const fcstLineList = cols.map((ele) => {
            const { name, fcstLineType, fcstSeq } = ele;
            fieldCodeList[name] = undefined;
            return {
              fcstLineType,
              fcstSeq,
              fcstQuantity: item[name],
              fcstDate: name,
            };
          });
          return {
            ...item,
            fcstHeaderId: item.fcstHeaderId || item.fcstHeaderIdMain,
            ...fieldCodeList,
            fcstLineList,
          };
        }
      });
      const remoteUpdateLineArray = isFunction(cuxUpdateLineArray)
        ? cuxUpdateLineArray(updateLineArray, { lineDs, currentTab })
        : updateLineArray;
      updatefrstLines({ query: { templateHeaderId }, body: remoteUpdateLineArray }).then((res) => {
        if (res && !res.failed) {
          lineDs.unSelectAll();
          lineDs.clearCachedSelected();
          setLoadings({ ...loadings, saveLoading: false });
          if (createFlag) {
            setCurrentTab('awaitRelease');
            awaitReleaseDs.query();
            const { fcstDateRangeEnd, fcstDateRangeStart } = queryDate || {};
            const initFcstDateFlag =
              fcstDateRangeEnd?.format(DEFAULT_DATE_FORMAT) !==
              fcstDateRangeStart?.format(DEFAULT_DATE_FORMAT);
            awaitReleaseDs.create(
              {
                fcrtType: 'fcstQuantity',
                fcstStatus: 'NEW',
                fcrtTypeMeaning:
                  lines.find((ele) => ele.value === 'fcstQuantity')?.meaning ||
                  (predictionDimension === 'QUANTITY'
                    ? '预测数量'
                    : predictionDimension === 'AMOUNT_INCLUDING_TAX'
                    ? '预测金额（含税）'
                    : '预测金额（不含税）'),
                initFcstStartDate:
                  fcstDateRangeEnd?.format(DEFAULT_DATE_FORMAT) !==
                  fcstDateRangeStart?.format(DEFAULT_DATE_FORMAT),
                fcstStartDate: !initFcstDateFlag
                  ? fcstDateRangeEnd?.format(DEFAULT_DATE_FORMAT)
                  : undefined,
                fcstDateRangeEnd: fcstDateRangeEnd?.format(DEFAULT_DATE_FORMAT),
                fcstDateRangeStart: fcstDateRangeStart?.format(DEFAULT_DATE_FORMAT),
                fcstStatusMeaning: intl.get('hzero.common.button.creat').d('新建'),
              },
              0
            );
          } else if (tabValue) {
            setCurrentTab(tabValue);
            aimDs.query();
          } else {
            lineDs.query();
          }
          notification.success();
        } else if (res && res?.failed) {
          setLoadings({ ...loadings, saveLoading: false });
          notification.error({ message: res?.message });
        } else {
          setLoadings({ ...loadings, saveLoading: false });
        }
      });
    } else {
      setLoadings({ ...loadings, saveLoading: false });
      const { selected } = lineDs;
      const saveDs = selected.length === 0 ? lineDs : selected;

      const validateArray = [];
      saveDs.forEach(async (ele) => {
        const errorMsg = ele.getValidationErrors().map((item) => item.errors[0]);
        validateArray.push(...errorMsg);
      });
      let errorMsg = ``;
      const errorTpye = validateArray.map((ele) => ele.ruleName);
      const aa = Array.from(new Set(errorTpye));
      aa.forEach((e) => {
        const aaa = validateArray.filter((item) => item.ruleName === e);
        if (e === 'valueMissing') {
          const zzz = Array.from(new Set(aaa.map((item) => item.injectionOptions.label)));
          errorMsg += zzz.join('，');
        } else {
          aaa.forEach((item) => {
            errorMsg += `${item.validationMessage}，`;
          });
        }
      });
      notification.error({
        message: `预测单保存失败，原因是【${errorMsg}】为必填但未输入，请输入后进行保存。`,
      });
    }
  };

  const handleGetReleaseData = useCallback(() => {
    const lineDs = getCurrentDs(currentTab);
    const { selected } = lineDs;
    const updateLine = [];
    selected.forEach((ele) => {
      if (ele.dirtyData || ['NEW', 'CHANGED'].includes(ele.get('fcstStatus'))) {
        updateLine.push(ele.toJSONData());
      }
    });
    // 动态字段
    const fieldCodeList = {};
    const updateLineArray = updateLine?.map((item) => {
      // 更新
      if (item.fcstHeaderId || item.fcstHeaderIdMain) {
        const { fcstHeaderIdMain } = item;

        const record = lineDs.find((ele) => ele.get('fcstHeaderIdMain') === fcstHeaderIdMain);

        const itemFcstLineList = record?.parent
          ? record.parent?.get('fcstLineList').toJS()
          : item.fcstLineList;
        const fcstLineList = itemFcstLineList?.map(
          ({ fcstDate, fcstLineType, fcstSeq, ...ele }) => {
            const fcstName = fcstLineType === 'DAY' ? `${fcstLineType}${fcstSeq}` : fcstDate;
            return {
              ...ele,
              fcstLineType,
              fcstSeq,
              fcstDate,
              fcstQuantity: item[fcstName],
            };
          }
        );
        return {
          ...item,
          fcstHeaderId: item.fcstHeaderIdMain,
          fcstLineList,
        };
      } else {
        // 根据动态列,获取数据
        const fcstLineList = cols?.map((ele) => {
          const { name, fcstLineType, fcstSeq } = ele;
          fieldCodeList[name] = undefined;
          return {
            fcstLineType,
            fcstSeq,
            fcstQuantity: item[name],
            fcstDate: name,
          };
        });
        return {
          ...item,
          fcstHeaderId: item.fcstHeaderId || item.fcstHeaderIdMain,
          ...fieldCodeList,
          fcstLineList,
        };
      }
    });
    return updateLineArray;
  }, [getCurrentDs, currentTab, cols]);

  // 发布行
  const handleLineRease = () => {
    const lineDs = getCurrentDs(currentTab);
    const { selected } = lineDs;
    setLoadings({ ...loadings, release: true });
    if (selected.some((ele) => ele.get('fcstStatus')) === 'awaitFeedback' && !allowChange) {
      notification.warning({ message: '已发布的申请不允许重新发布，请检查配置' });
      return;
    }
    if (
      selected.some((ele) => ele.get('fcstStatus')) === 'hasFeedback' &&
      !['PURCHASE', 'ALL'].includes(feedbackChangeCnf)
    ) {
      notification.warning({ message: '已反馈的申请不允许重新发布，请检查配置' });
    }
    Promise.all(
      selected.map((i) => {
        return i.validate();
      })
    ).then((status) => {
      if (status[0] === true) {
        const updateLineArray = handleGetReleaseData();
        releasefrstLines({ query: { templateHeaderId }, body: updateLineArray }).then((res) => {
          if (res && !res.failed) {
            lineDs.unSelectAll();
            lineDs.clearCachedSelected();
            lineDs.query();
            setLoadings({ ...loadings, release: false });
            notification.success();
          } else if (res && res?.failed) {
            setLoadings({ ...loadings, release: false });
            notification.error({ message: res?.message });
          } else {
            setLoadings({ ...loadings, release: false });
          }
        });
      } else {
        setLoadings({ ...loadings, release: false });
        notification.error({ message: '当前勾选行,有信息未维护' });
      }
    });
  };

  // 发布行
  const handleLineBatchRease = () => {
    const lineDs = getCurrentDs(currentTab);
    const { selected = [] } = lineDs;
    setLoadings({ ...loadings, release: true });
    const dirtyList = lineDs.toJSONData()?.map((i) => i?.fcstHeaderIdMain || i?.fcstHeaderId);
    const selectedDirtyList =
      selected.filter((i) =>
        dirtyList.includes(i.get('fcstHeaderIdMain' || i.get('fcstHeaderId')))
      ) || [];
    if (selectedDirtyList?.length > 0) {
      const selectStr = selectedDirtyList
        ?.map((i) => `${i.get('fcstNum')}-${i.get('lineNum')}`)
        ?.join(',');
      notification.warning({
        message: intl
          .get('sprm.common.forecast.selected.dirtyCheck', { selectStr })
          .d(`勾选行【${selectStr}】未保存，请保存后再发布！`),
      });
      setLoadings({ ...loadings, release: false });
      return;
    }
    Promise.all(
      selected.map((i) => {
        return i.validate(false, true);
      })
    ).then((status) => {
      if (status.some((i) => !!i)) {
        releasefrstBatchLines({
          query: { templateHeaderId },
          body: selected.map((i) => i.get('fcstHeaderIdMain' || i.get('fcstHeaderId'))),
        }).then((res) => {
          if (res && !res.failed) {
            lineDs.unSelectAll();
            lineDs.clearCachedSelected();
            lineDs.query();
            setLoadings({ ...loadings, release: false });
            notification.success();
          } else if (res && res.failed) {
            setLoadings({ ...loadings, release: false });
            notification.error({ message: res.message });
          } else {
            setLoadings({ ...loadings, release: false });
          }
        });
      } else {
        setLoadings({ ...loadings, release: false });
        notification.error({ message: '当前勾选行,有信息未维护' });
      }
    });
  };

  // 关闭行
  const handleLineClose = async () => {
    const lineDs = getCurrentDs(currentTab);
    setLoadings({ ...loadings, close: true });
    const { selected } = lineDs;
    const deleteLine = selected?.map((ele) => ({
      ...ele.toJSONData(),
      fcstHeaderId: ele.get('fcstHeaderIdMain'),
    }));
    const remoteFlag = await beforeClose({ currentTab, deleteLine });
    if (!remoteFlag) {
      setLoadings({ ...loadings, close: false });
      return false;
    }
    closefrstLines({ query: { templateHeaderId }, body: deleteLine }).then((res) => {
      if (res && !res.failed) {
        lineDs.unSelectAll();
        lineDs.clearCachedSelected();
        lineDs.query();
        setLoadings({ ...loadings, close: false });
        notification.success();
      } else if (res && res?.failed) {
        setLoadings({ ...loadings, close: false });
        notification.error({ message: res?.message });
      } else {
        setLoadings({ ...loadings, close: false });
      }
    });
  };

  // 取消行
  const handleCancel = async () => {
    const lineDs = getCurrentDs(currentTab);
    const { selected } = lineDs;
    setLoadings({ ...loadings, cancel: true });
    const deleteLine = selected?.map((ele) => ({
      ...ele.toJSONData(),
      fcstHeaderId: ele.get('fcstHeaderIdMain'),
    }));
    const remoteFlag = await beforeCancel({ currentTab, deleteLine });
    if (!remoteFlag) {
      setLoadings({ ...loadings, cancel: false });
      return false;
    }
    concelfrstLines({ query: { templateHeaderId }, body: deleteLine }).then((res) => {
      if (res && !res.failed) {
        lineDs.unSelectAll();
        lineDs.clearCachedSelected();
        lineDs.query();
        setLoadings({ ...loadings, cancel: false });
        notification.success();
      } else if (res && res?.failed) {
        setLoadings({ ...loadings, cancel: false });
        notification.error({ message: res?.message });
      } else {
        setLoadings({ ...loadings, cancel: false });
      }
    });
  };

  const newLine = () => {
    if (currentTab === 'awaitRelease') {
      const { fcstDateRangeEnd, fcstDateRangeStart } = queryDate || {};
      const initFcstDateFlag =
        fcstDateRangeEnd?.format(DEFAULT_DATE_FORMAT) !==
        fcstDateRangeStart?.format(DEFAULT_DATE_FORMAT);
      console.log(queryDate, initFcstDateFlag);
      awaitReleaseDs.create(
        {
          fcrtType: 'fcstQuantity',
          fcstStatus: 'NEW',
          fcrtTypeMeaning:
            lines.find((ele) => ele.value === 'fcstQuantity')?.meaning ||
            (predictionDimension === 'QUANTITY'
              ? '预测数量'
              : predictionDimension === 'AMOUNT_INCLUDING_TAX'
              ? '预测金额（含税）'
              : '预测金额（不含税）'),
          initFcstStartDate:
            fcstDateRangeEnd?.format(DEFAULT_DATE_FORMAT) !==
            fcstDateRangeStart?.format(DEFAULT_DATE_FORMAT),
          fcstStartDate: !initFcstDateFlag
            ? fcstDateRangeEnd?.format(DEFAULT_DATE_FORMAT)
            : undefined,
          fcstDateRangeEnd: fcstDateRangeEnd?.format(DEFAULT_DATE_FORMAT),
          fcstDateRangeStart: fcstDateRangeStart?.format(DEFAULT_DATE_FORMAT),
          fcstStatusMeaning: intl.get('hzero.common.button.creat').d('新建'),
        },
        0
      );
    } else {
      const lineDs = getCurrentDs(currentTab);
      const lineDsStatus = lineDs.toJSONData();
      if (lineDsStatus.length === 0) {
        setCurrentTab('awaitRelease');
        awaitReleaseDs.query().then(() => {
          const { fcstDateRangeEnd, fcstDateRangeStart } = queryDate || {};
          const initFcstDateFlag =
            fcstDateRangeEnd?.format(DEFAULT_DATE_FORMAT) !==
            fcstDateRangeStart?.format(DEFAULT_DATE_FORMAT);
          awaitReleaseDs.create(
            {
              fcrtType: 'fcstQuantity',
              fcstStatus: 'NEW',
              fcrtTypeMeaning:
                lines.find((ele) => ele.value === 'fcstQuantity')?.meaning ||
                (predictionDimension === 'QUANTITY'
                  ? '预测数量'
                  : predictionDimension === 'AMOUNT_INCLUDING_TAX'
                  ? '预测金额（含税）'
                  : '预测金额（不含税）'),
              initFcstStartDate:
                fcstDateRangeEnd?.format(DEFAULT_DATE_FORMAT) !==
                fcstDateRangeStart?.format(DEFAULT_DATE_FORMAT),
              fcstStartDate: !initFcstDateFlag
                ? fcstDateRangeEnd?.format(DEFAULT_DATE_FORMAT)
                : undefined,
              fcstDateRangeEnd: fcstDateRangeEnd?.format(DEFAULT_DATE_FORMAT),
              fcstDateRangeStart: fcstDateRangeStart?.format(DEFAULT_DATE_FORMAT),
              fcstStatusMeaning: intl.get('hzero.common.button.creat').d('新建'),
            },
            0
          );
        });
      } else {
        Modal.confirm({
          bodyStyle: { padding: '20px' },
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: (
            <p>
              {intl
                .get(`sprm.forecastMgt.view.message.newFrstLine`)
                .d('当前有未保存数据，请确认是否保存')}
            </p>
          ),
          onOk: () => {
            handleLineSave(1);
          },
          onCancel: () => {
            const { fcstDateRangeEnd, fcstDateRangeStart } = queryDate || {};
            const initFcstDateFlag =
              fcstDateRangeEnd?.format(DEFAULT_DATE_FORMAT) !==
              fcstDateRangeStart?.format(DEFAULT_DATE_FORMAT);
            awaitReleaseDs.create(
              {
                fcrtType: 'fcstQuantity',
                fcstStatus: 'NEW',
                fcrtTypeMeaning:
                  lines.find((ele) => ele.value === 'fcstQuantity')?.meaning ||
                  (predictionDimension === 'QUANTITY'
                    ? '预测数量'
                    : predictionDimension === 'AMOUNT_INCLUDING_TAX'
                    ? '预测金额（含税）'
                    : '预测金额（不含税）'),
                initFcstStartDate:
                  fcstDateRangeEnd?.format(DEFAULT_DATE_FORMAT) !==
                  fcstDateRangeStart?.format(DEFAULT_DATE_FORMAT),
                fcstStartDate: !initFcstDateFlag
                  ? fcstDateRangeEnd?.format(DEFAULT_DATE_FORMAT)
                  : undefined,
                fcstDateRangeEnd: fcstDateRangeEnd?.format(DEFAULT_DATE_FORMAT),
                fcstDateRangeStart: fcstDateRangeStart?.format(DEFAULT_DATE_FORMAT),
                fcstStatusMeaning: intl.get('hzero.common.button.creat').d('新建'),
              },
              0
            );
          },
        });
      }
    }
  };

  const handleSysCB = async (fcstHeaderIds) => {
    const currentDs = getCurrentDs(currentTab);
    await sysExternal(fcstHeaderIds).then((res) => {
      const result = getResponse(res);
      if (result && isArray(result)) {
        let errorMsg = '';
        result.forEach((item) => {
          if (item.errorFlag) {
            errorMsg += `${item.fcstNum}-${item.lineNum}同步失败，原因是：${item.errorMessage}`;
          }
        });
        if (errorMsg) {
          notification.error({ message: errorMsg });
        } else {
          notification.success();
        }
        currentDs.unSelectAll();
        currentDs.clearCachedSelected();
        currentDs.query();
      }
    });
  };

  const handleSynExternal = () => {
    const currentDs = getCurrentDs(currentTab);
    const { selected } = currentDs;
    const fcstHeaderIds = selected?.map(
      (ele) => ele.get('fcstHeaderId') || ele.get('fcstHeaderIdMain')
    );
    return new Promise((resolve) => {
      handleSysCB(fcstHeaderIds).then(() => {
        resolve();
      });
    });
  };

  const getCurrentDs = useCallback(
    (currentType) => {
      let currentDs = awaitReleaseDs || {};
      switch (currentType) {
        case 'awaitRelease':
          currentDs = awaitReleaseDs;
          break;
        case 'awaitFeedback':
          currentDs = awaitFeedbackDs;
          break;
        case 'hasFeedback':
          currentDs = hasFeedbackDs;
          break;
        case 'all':
          currentDs = sourceType === 'version' ? versionTableDs : allDs;
          break;
        case 'awaitApprove':
          currentDs = awaitApproveDs;
          break;
        default:
          currentDs = awaitReleaseDs;
          break;
      }
      return currentDs;
    },
    [
      templateHeaderId,
      awaitReleaseDs,
      awaitFeedbackDs,
      hasFeedbackDs,
      allDs,
      sourceType,
      awaitApproveDs,
      awaitReleaseDs,
    ]
  );

  // 审批通过
  const handleApprove = async () => {
    const eventResult = await remote.event.fireEvent('beforeApprove', { awaitApproveDs, cols });
    if (eventResult === false) {
      return;
    }
    return new Promise((resolve) => {
      Modal.confirm({
        bodyStyle: { padding: '20px' },
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: (
          <p>
            {intl.get('sprm.forecastWorkbench.model.common.confirmApprove').d('是否确认审批通过')}
          </p>
        ),
      }).then((button) => {
        if (button === 'ok') {
          aproveFrst({
            data: awaitApproveDs.selected?.map((ele) => ({
              ...ele.toData(),
              fcstHeaderId: ele.get('fcstHeaderId') || ele.get('fcstHeaderIdMain'),
            })),
          }).then((res) => {
            if (getResponse(res)) {
              resolve();
              awaitApproveDs.unSelectAll();
              awaitApproveDs.clearCachedSelected();
              awaitApproveDs.query();
            } else {
              resolve();
            }
          });
        } else {
          resolve();
        }
      });
    });
  };

  // 审批拒绝
  const handleReject = async () => {
    const eventResult = await remote.event.fireEvent('beforeReject', { awaitApproveDs, cols });
    if (eventResult === false) {
      return;
    }
    const remarkDs = new DataSet({
      dataToJSON: 'all',
      autoCreate: true,
      fields: [
        {
          required: true,
          name: 'remark',
        },
      ],
    });

    return Modal.open({
      drawer: true,
      closable: true,
      movable: false,
      destroyOnClose: true,
      key: Modal.key(),
      title: intl.get('hzero.common.button.approvalRefuse').d('审批拒绝'),
      style: { width: '450px' },
      bodyStyle: { padding: '20px' },
      children: (
        <div>
          <Form dataSet={remarkDs} useColon={false} labelLayout="float">
            <TextArea
              name="remark"
              label={intl.get('sprm.forecastMgt.model.common.rejectReason').d('审批拒绝原因')}
            />
          </Form>
        </div>
      ),
      onOk: () => {
        return new Promise(async (resolve) => {
          const validateFlag = await remarkDs.validate();
          if (validateFlag) {
            rejectFrst({
              data: awaitApproveDs.selected?.map((ele) => ({
                ...ele.toData(),
                approvalRemark: remarkDs?.current?.get('remark'),
                fcstHeaderId: ele.get('fcstHeaderId') || ele.get('fcstHeaderIdMain'),
              })),
            }).then((res) => {
              if (getResponse(res)) {
                awaitApproveDs.unSelectAll();
                awaitApproveDs.clearCachedSelected();
                awaitApproveDs.query();
                resolve(true);
              } else {
                resolve(true);
              }
            });
          } else {
            resolve(false);
          }
        });
      },
      onCancel: () => {},
    });
  };

  const HeaderBtn = observer(() => {
    const { cuxHeadBtns } = remote?.props?.process || {};
    const lineDs = getCurrentDs(currentTab);
    const { selected = [] } = lineDs;
    // 已发布的，只有开启已发布是否允许采购方变更才可以 变更/发布
    const awaitFeedbackSaveFlag = currentTab === 'awaitFeedback' && allowChange;
    // 已反馈, 只有开启采购方|| 全部都可以变更才可以 变更/发布
    const hasFeedbackSaveFlag =
      currentTab === 'hasFeedback' && ['PURCHASE', 'ALL'].includes(feedbackChangeCnf);
    const feedBackBtnFlag = ['PURCHASE', 'ALL'].includes(feedbackChangeCnf);
    const headerList = [
      {
        name: 'create',
        child: intl.get('hzero.common.button.creat').d('新建'),
        // btnComp: Button,
        btnProps: {
          onClick: newLine,
          type: 'c7n-pro',
          funcType: 'raised',
          icon: 'add',
          hidden: sourceType === 'version' && currentTab === 'all',
          color: 'primary',
          disabled: !(queryDate?.fcstDateRangeEnd || queryDate?.fcstDateRangeStart),
        },
      },
      {
        name: 'release',
        child: intl.get(`hzero.common.button.release`).d('发布'),
        // btnComp: Button,
        btnProps: {
          type: 'c7n-pro',
          icon: 'publish2',
          wait: THROTTLE_TIME,
          hidden:
            !(
              ['awaitRelease', 'all'].includes(currentTab) ||
              awaitFeedbackSaveFlag ||
              hasFeedbackSaveFlag
            ) ||
            (sourceType === 'version' && currentTab === 'all'),
          loading: loadings.saveLoading || loadings.release || loadings.delete || loadings.cancel,
          funcType: 'flat',
          disabled:
            selected.length === 0 ||
            selected.some(
              (ele) =>
                ['CLOSED', 'CANCELED', 'FEEDBACK_IN_APPROVAL', 'FEEDBACK_PEND_APPROVAL'].includes(
                  ele.get('fcstStatus')
                ) ||
                (!feedBackBtnFlag && ele.get('fcstStatus') === 'FEEDBACK') ||
                (['RELEASED', 'FEEDBACK_REJECTED'].includes(ele.get('fcstStatus')) &&
                  allowChange === 0)
            ) ||
            (isFunction(releaseBtnDisabled) ? releaseBtnDisabled(selected, state) : false),

          onClick: handleLineRease,
        },
      },
      {
        name: 'batchRelease',
        child: intl.get(`hzero.common.button.batch.release`).d('批量发布'),
        // btnComp: Button,
        btnProps: {
          type: 'c7n-pro',
          icon: 'publish2',
          wait: THROTTLE_TIME,
          hidden:
            !(
              ['awaitRelease'].includes(currentTab) ||
              awaitFeedbackSaveFlag ||
              hasFeedbackSaveFlag
            ) ||
            (sourceType === 'version' && currentTab === 'all'),
          loading: loadings.saveLoading || loadings.release || loadings.delete || loadings.cancel,
          funcType: 'flat',
          disabled:
            selected.length === 0 ||
            selected.some(
              (ele) =>
                ['CLOSED', 'CANCELED', 'FEEDBACK_IN_APPROVAL', 'FEEDBACK_PEND_APPROVAL'].includes(
                  ele.get('fcstStatus')
                ) ||
                !ele.get('fcstNum') ||
                (!feedBackBtnFlag && ele.get('fcstStatus') === 'FEEDBACK') ||
                (['RELEASED', 'FEEDBACK_REJECTED'].includes(ele.get('fcstStatus')) &&
                  allowChange === 0)
            ),
          //  ||
          // (isFunction(releaseBtnDisabled) ? releaseBtnDisabled(selected, state) : false),
          onClick: handleLineBatchRease,
        },
      },
      {
        name: 'save',
        child: intl.get('hzero.common.save').d('保存'),
        // btnComp: Button,
        btnProps: {
          type: 'c7n-pro',
          icon: 'save',
          wait: THROTTLE_TIME,
          hidden: currentTab !== 'awaitRelease',
          loading: loadings.saveLoading || loadings.release || loadings.delete || loadings.cancel,
          funcType: 'flat',
          disabled: !(queryDate.fcstDateRangeEnd || queryDate.fcstDateRangeStart),
          onClick: handleLineSave,
        },
      },
      {
        name: 'saveUpdate',
        child: intl.get('sprm.forecastWorkbench.button.saveUpdates').d('保存更新'),
        // btnComp: Button,
        btnProps: {
          type: 'c7n-pro',
          icon: 'save',
          wait: THROTTLE_TIME,
          hidden:
            !(currentTab === 'all' || awaitFeedbackSaveFlag || hasFeedbackSaveFlag) ||
            (sourceType === 'version' && currentTab === 'all'),
          loading: loadings.saveLoading || loadings.release || loadings.delete || loadings.cancel,
          funcType: 'flat',
          disabled: !(queryDate.fcstDateRangeEnd || queryDate.fcstDateRangeStart),
          onClick: handleLineSave,
        },
      },
      {
        name: 'batchDelete',
        child: intl.get(`hzero.common.button.batchDelete`).d('批量删除'),
        // btnComp: Button,
        btnProps: {
          type: 'c7n-pro',
          icon: 'delete_sweep',
          wait: THROTTLE_TIME,
          hidden:
            !['awaitRelease', 'all'].includes(currentTab) ||
            (sourceType === 'version' && currentTab === 'all'),
          loading: loadings.saveLoading || loadings.release || loadings.delete || loadings.cancel,
          funcType: 'flat',
          disabled:
            selected.length === 0 ||
            selected.some((ele) => !['NEW', 'UNRELEASED'].includes(ele.get('fcstStatus'))),

          onClick: handleLineDelete,
        },
      },
      {
        name: 'close',
        child: intl.get(`hzero.common.button.close`).d('关闭'),
        // btnComp: Button,
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'not_interested',
          wait: THROTTLE_TIME,
          hidden:
            !['hasFeedback', 'all'].includes(currentTab) ||
            (sourceType === 'version' && currentTab === 'all'),
          loading: loadings.saveLoading || loadings.release || loadings.delete || loadings.cancel,
          disabled:
            lineDs.selected.length === 0 ||
            selected.some((ele) => !['FEEDBACK'].includes(ele.get('fcstStatus'))),
          onClick: handleLineClose,
        },
      },
      {
        name: 'cancel',
        child: intl.get('hzero.common.button.cancel').d('取消'),
        // btnComp: Button,
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'cancel',
          wait: THROTTLE_TIME,
          hidden:
            !['awaitFeedback', 'all'].includes(currentTab) ||
            (sourceType === 'version' && currentTab === 'all'),
          loading: loadings.saveLoading || loadings.release || loadings.delete || loadings.cancel,
          disabled:
            !queryDate ||
            lineDs.selected.length === 0 ||
            selected.some(
              (ele) =>
                !(
                  [
                    'RELEASED',
                    'FEEDBACK_REJECTED',
                    'FEEDBACK_IN_APPROVAL',
                    'FEEDBACK_PEND_APPROVAL',
                  ].includes(ele.get('fcstStatus')) &&
                  Number(ele.get('latestReleaseVersion')) === Number(ele.get('version'))
                )
            ),

          onClick: handleCancel,
        },
      },
      {
        name: 'offlineResultEntry',
        child: intl.get('sprm.forecastWorkbench.button.offlineResultEntry').d('线下结果录入'),
        // btnComp: Button,
        btnProps: {
          type: 'c7n-pro',
          icon: 'archive',
          wait: THROTTLE_TIME,
          hidden:
            !(['awaitFeedback'].includes(currentTab) && offlineInputFlag) ||
            (sourceType === 'version' && currentTab === 'all'),
          disabled: !(queryDate.fcstDateRangeEnd || queryDate.fcstDateRangeStart),
          loading: loadings.saveLoading || loadings.release || loadings.delete || loadings.cancel,
          funcType: 'flat',
          onClick: () => handleImport({ offlineRecord: 1 }),
        },
      },
      {
        name: 'offlineResultExport',
        child: intl.get('sprm.forecastWorkbench.button.offlineResultExport').d('线下结果导出'),
        // btnComp: Button,
        btnProps: {
          type: 'c7n-pro',
          icon: 'archive',
          wait: THROTTLE_TIME,
          hidden:
            !(['awaitFeedback'].includes(currentTab) && offlineInputFlag) ||
            (sourceType === 'version' && currentTab === 'all'),
          loading: loadings.saveLoading || loadings.release || loadings.delete || loadings.cancel,
          funcType: 'flat',
          onClick: () => handleExport({ offlineRecord: 1 }),
        },
      },
      {
        name: 'approveReject',
        child: intl.get('hzero.common.button.approvalRefuse').d('审批拒绝'),
        // btnComp: Button,
        btnProps: {
          type: 'c7n-pro',
          icon: 'close',
          wait: THROTTLE_TIME,
          hidden: !['awaitApprove'].includes(currentTab),
          disabled:
            !(queryDate.fcstDateRangeEnd || queryDate.fcstDateRangeStart) ||
            !selected.length ||
            !selected.every((ele) => ele.get('fcstStatus') === 'FEEDBACK_PEND_APPROVAL'),
          loading: loadings.saveLoading || loadings.release || loadings.delete || loadings.cancel,
          funcType: 'flat',
          onClick: handleReject,
        },
      },
      {
        name: 'approved',
        child: intl.get('hzero.common.button.approvalAdopt').d('审批通过'),
        // btnComp: Button,
        btnProps: {
          type: 'c7n-pro',
          icon: 'check',
          wait: THROTTLE_TIME,
          hidden: !['awaitApprove'].includes(currentTab),
          disabled:
            !(queryDate.fcstDateRangeEnd || queryDate.fcstDateRangeStart) ||
            !selected.length ||
            !selected.every((ele) => ele.get('fcstStatus') === 'FEEDBACK_PEND_APPROVAL'),
          loading: loadings.saveLoading || loadings.release || loadings.delete || loadings.cancel,
          funcType: 'flat',
          onClick: handleApprove,
        },
      },
      {
        name: 'feedbacksyn',
        child: intl.get('sprm.forecastWorkbench.button.feedbacksyn').d('反馈重新推送外部'),
        // btnComp: Button,
        btnProps: {
          type: 'c7n-pro',
          icon: 'archive',
          wait: THROTTLE_TIME,
          hidden:
            !(currentTab === 'all' && feedbackSyncFlag) ||
            (sourceType === 'version' && currentTab === 'all'),
          disabled:
            !(queryDate.fcstDateRangeEnd || queryDate.fcstDateRangeStart) ||
            selected.some((ele) => ele.get('syncStatus') !== 'SYNC_FAILURE'),
          loading: loadings.saveLoading || loadings.release || loadings.delete || loadings.cancel,
          funcType: 'flat',
          onClick: handleSynExternal,
        },
      },
      {
        name: 'batchImport',
        child: intl.get('hzero.common.button.batchImport').d('批量导入'),
        // btnComp: Button,
        btnProps: {
          type: 'c7n-pro',
          icon: 'archive',
          wait: THROTTLE_TIME,
          disabled: !templateHeaderId,
          funcType: 'flat',
          onClick: handleImport,
          hidden: sourceType === 'version' && currentTab === 'all',
        },
      },
      {
        name: 'batchExport',
        child: selected.length
          ? intl.get(`hzero.common.checkedExport`).d('勾选导出')
          : intl.get('hzero.common.button.export').d('导出'),
        // btnComp: Button,
        btnProps: {
          type: 'c7n-pro',
          icon: 'unarchive',
          wait: THROTTLE_TIME,
          disabled: !(queryDate.fcstDateRangeEnd || queryDate.fcstDateRangeStart),
          funcType: 'flat',
          onClick: handleExport,
        },
      },
      {
        name: 'expandBtn',
        child: expandAllFlag
          ? intl.get('hzero.common.button.export.collected').d('收起')
          : intl.get('hzero.common.button.expand').d('展开'),
        // btnComp: Button,
        btnProps: {
          type: 'c7n-pro',
          icon: 'unarchive',
          wait: THROTTLE_TIME,
          disabled: !templateHeaderId || !queryDate,
          funcType: 'flat',
          onClick: () => {
            setExpandAll(!expandAllFlag);
            lineDs.query(undefined, undefined, true);
          },
        },
      },
    ];
    const processBtns = isFunction(cuxHeadBtns)
      ? cuxHeadBtns(headerList, {
          lineDs,
          selected,
          currentTab,
          state,
          templateCode,
        })
      : headerList;
    const newHeaderList = processBtns.filter((ele) => !ele.btnProps.hidden);
    return (
      <DynamicButtons
        buttons={newHeaderList}
        defaultBtnType="c7n-pro"
        maxNum={5}
        permissions={[
          { code: 'hzero.srm.requirement.forecast.purchaser.workbench.ps.btn.add', name: 'create' },
          {
            code: 'hzero.srm.requirement.forecast.purchaser.workbench.ps.btn.release',
            name: 'release',
          },
          { code: 'hzero.srm.requirement.forecast.purchaser.workbench.ps.btn.save', name: 'save' },
          {
            code: 'hzero.srm.requirement.forecast.purchaser.workbench.button.change-save',
            name: 'saveUpdate',
          },
          {
            code: 'hzero.srm.requirement.forecast.purchaser.workbench.ps.btn.close',
            name: 'close',
          },
          {
            code: 'hzero.srm.requirement.forecast.purchaser.workbench.button.batchRelease',
            name: 'batchRelease',
          },
          {
            code: 'hzero.srm.requirement.forecast.purchaser.workbench.ps.import',
            name: 'batchImport',
          },
          {
            code: 'hzero.srm.requirement.forecast.purchaser.workbench.ps.export',
            name: 'batchExport',
          },
          {
            code: 'hzero.srm.requirement.forecast.purchaser.workbench.button.reject',
            name: 'approveReject',
          },
          {
            code: 'hzero.srm.requirement.forecast.purchaser.workbench.button.approve',
            name: 'approved',
          },
          {
            code: 'hzero.srm.requirement.forecast.purchaser.workbench.button.offline-import',
            name: 'offlineResultEntry',
          },
          {
            code: 'hzero.srm.requirement.forecast.purchaser.workbench.button.offline-export',
            name: 'offlineResultExport',
          },
          {
            code: 'hzero.srm.requirement.forecast.purchaser.workbench.button.feedbacksyn',
            name: 'feedbacksyn',
          },
          {
            code: 'hzero.srm.requirement.forecast.purchaser.workbench.button.cancel',
            name: 'cancel',
          },
          {
            code: 'hzero.srm.requirement.forecast.purchaser.workbench.button.delete',
            name: 'delete',
          },
        ]}
      />
    );
  });

  const handleExport = ({ offlineRecord }) => {
    // 添加表单查询参数ddd
    const params = [];
    const lineDs = getCurrentDs(currentTab);
    setLoadings({ exportLoading: true });
    params.push({ name: 'exportType', value: 'DATA' });
    const requestUrl = `${SRM_SPRM}/v1/${organizationId}/fcst-headers/excel/export`;
    const method = 'POST';
    const fileName = '预测导出数据';
    let queryData = {};
    const fcstStatusCodeList = [];

    const [
      { tabNeedFeedback: tabNeedFeedbacks, fcrtType, ...others },
    ] = lineDs?.queryDataSet?.toData() || [{}];
    const tempKey = lineDs.getState('tempKey') || {};
    queryData.exportFcstTypeLine = fcrtType ? fcrtType.split(',') : [];
    if (currentTab === 'awaitRelease') {
      fcstStatusCodeList.push('UNRELEASED', 'NEW', 'CHANGED');
      queryData.controlExportLine = 1;
      queryData.queryType = 1;
    } else if (currentTab === 'awaitFeedback') {
      fcstStatusCodeList.push('RELEASED', 'FEEDBACK_REJECTED');
      queryData.controlExportLine = 1;
      queryData.queryType = 2;
    } else if (currentTab === 'hasFeedback') {
      fcstStatusCodeList.push('FEEDBACK');
      queryData.queryType = 3;
    } else if (currentTab === 'awaitApprove') {
      fcstStatusCodeList.push('FEEDBACK_IN_APPROVAL', 'FEEDBACK_PEND_APPROVAL');
      queryData.queryType = 4;
    }
    if (offlineRecord === 1) {
      queryData.controlExportLine = null;
      queryData.exportFcstTypeLine = ['fcstQuantity', 'feedbackQuantity'];
    }
    if (sourceType === 'version' && currentTab === 'all') {
      queryData.workbenchTab = 'viewPage';
    }
    const { fcstDateRangeStart, fcstDateRangeEnd } = queryDate;
    if (isEmpty(lineDs.selected)) {
      others.fcstStatusCodeList = fcstStatusCodeList;
      queryData = {
        ...queryData,
        ...others,
        ...tempKey,
        fcstDateRangeStart: fcstDateRangeStart?.format(DEFAULT_DATE_FORMAT),
        fcstDateRangeEnd: fcstDateRangeEnd?.format(DEFAULT_DATE_FORMAT),
        tempKey: undefined,
        supplierQueryParamStr: others.tempKey,
        templateHeaderId,
        customizeUnitCode:
          currentTab === 'all' && sourceType === 'version'
            ? 'SPRM.FORECAST_WORKBENCH.VERSION_FILTER'
            : 'SPRM.FORECAST_WORKBENCH.SEARCHBAR',
      };
    } else {
      queryData = {
        ...queryData,
        fcstDateRangeStart: fcstDateRangeStart?.format(DEFAULT_DATE_FORMAT),
        fcstDateRangeEnd: fcstDateRangeEnd?.format(DEFAULT_DATE_FORMAT),
        tempKey: undefined,
        supplierQueryParamStr: others.tempKey,
        templateHeaderId,
      };
    }
    // 判断是不是老供应商的默认值查询
    if (queryData.supplierQueryParamStr && !queryData.supplierId && !queryData.supplierCompanyId) {
      if (
        !queryData.supplierQueryParamStr.includes(':') &&
        queryData.supplierQueryParamStr.includes('-')
      ) {
        // eslint-disable-next-line prefer-destructuring
        queryData.supplierCompanyId = queryData.supplierQueryParamStr.split('-')[1];
        // eslint-disable-next-line prefer-destructuring
        queryData.supplierId = queryData.supplierQueryParamStr.split('-')[0];
      }
    }
    // 添加表单查询参数
    for (const key of Object.keys(queryData)) {
      if (queryData[key] !== undefined) {
        params.push({ name: key, value: queryData[key] });
      }
    }
    // 添加表单查询参数
    for (const key of Object.keys(tempKey)) {
      if (tempKey[key] !== undefined) {
        params.push({ name: key, value: queryData[key] });
      }
    }
    initiateAsyncExport(
      {
        requestUrl,
        queryParams: params,
        method,
        queryData: {
          ...queryData,
          fcstHeaderIds:
            sourceType === 'version' && currentTab === 'all'
              ? null
              : lineDs.selected?.map(
                  (ele) => ele.get('fcstHeaderId') || ele.get('fcstHeaderIdMain')
                ),
          ids:
            sourceType === 'version' && currentTab === 'all'
              ? lineDs.selected?.map((ele) => ele.get('id') || ele.get('idMain'))
              : null,
        },
      },
      fileName
    )
      .catch((err) => {
        if (err && getResponse(err) && err.uuid) {
          setLoadings({ exportLoading: false });
          notification.success({
            message: intl
              .get('hzero.common.notification.export.asyncWithUid', { uuid: err.uuid })
              .d(`异步导出任务已提交${err.uuid}`),
          });
        }
      })
      .then((res) => {
        if (res) {
          setLoadings({ exportLoading: false });
          notification.success();
        }
      })
      .finally(() => {
        setLoadings({ exportLoading: false });
      });
  };

  const handleImport = ({ offlineRecord }) => {
    const lineDs = getCurrentDs(currentTab);
    if (isFunction(cuxHandleImport)) {
      return cuxHandleImport({
        offlineRecord,
        detailFeedbackFlag,
        templateHeaderId,
        SprmImport,
        lineDs,
        templateCode,
      });
    }
    if (detailFeedbackFlag) {
      const importTemplateCode = 'SPRM.FCST_DETAIL_IMPORT';
      const importProps = {
        code: importTemplateCode,
        sync: false,
        auto: false,
        refreshButton: 'true',
        historyButton: 'true',
        prefixPatch: SRM_SPRM,
        args: JSON.stringify({
          tenantId: organizationId,
          templateCode: importTemplateCode,
          offlineRecord,
          templateHeaderId,
        }),
        autoRefreshInterval: 5000,
        backPath: undefined,
        tenantId: organizationId, // 租户的传
        title: 'hzero.common.button.batchImport',
        key: `/sprm/forecast-workbench/data-import/${importTemplateCode}`,
      };
      Modal.open({
        key: Modal.key(),
        children: <SprmImport {...importProps} />,
        closable: false,
        movable: false,
        destroyOnClose: true,
        onCancel: () => {},
        style: { width: '1200px', marginTop: '-30px' },
        onOk: () => {
          lineDs.query();
        },
        footer: (okBtn) => <div>{okBtn}</div>,
      });
    } else if (offlineRecord === 1) {
      openTab({
        key: '/sprm/forecast-workbench/offline-import',
        title: 'hzero.common.button.offlineResultEntry',
        search: queryString.stringify({
          backPath: `/sprm/forecast-workbench/list`,
          auto: true,
          offlineRecord,
          templateHeaderId,
          templateCode,
        }),
      });
    } else {
      openTab({
        key: '/sprm/forecast-workbench/import',
        title: 'hzero.common.button.batchImport',
        search: queryString.stringify({
          backPath: `/sprm/forecast-workbench/list`,
          auto: true,
          offlineRecord,
          templateCode,
          templateHeaderId,
        }),
      });
    }
  };

  const onChangeField = ({ name, value, dataSet, record }) => {
    const currentDs = getCurrentDs(currentTab);
    if (name === 'tempKey') {
      if (record.getField(name)?.get('lovCode') === 'SSLM.SUPPLIER_CHOOSE') {
        // eslint-disable-next-line no-unused-expressions
        currentDs.setState('tempKey', {
          supplierCompanyId: value?.supplierCompanyIds,
          supplierId: value?.extSupplierIds,
        });
      } else {
        // eslint-disable-next-line no-unused-expressions
        currentDs.setState('tempKey', {
          supplierCompanyId: value?.supplierCompanyId,
          supplierId: value?.supplierId,
        });
      }
    } else if (name === 'fcrtType' && isEmpty(value)) {
      // eslint-disable-next-line no-unused-expressions
      dataSet.queryDataSet?.current?.set({ fcrtType: undefined });
      baseLine = 'fcstQuantity';
    } else if (name === 'fcrtType') {
      // eslint-disable-next-line no-unused-expressions
      dataSet.queryDataSet?.current?.set({ fcrtType: value });
      // eslint-disable-next-line prefer-destructuring
      baseLine = value.includes('fcstQuantity') ? 'fcstQuantity' : value[0];
    } else if (!value) {
      // eslint-disable-next-line no-unused-expressions
      dataSet.queryDataSet?.current?.set({ [name]: undefined });
    }
  };

  const initTab = (props) => {
    if (props?.value?.cache) {
      const tabConfig = props.value.cache['SPRM.FORECAST_WORKBENCH.TAB'];
      const key = tabConfig.getAllValue()?.activeKey;
      if (key && !initFlag) {
        setInitFlag(true);
        setCurrentTab(key);
      }
    }
  };

  const changeTab = useCallback(
    (value) => {
      const aimDs = getCurrentDs(value);
      const lineDs = getCurrentDs(currentTab);
      const lineDsStatus = lineDs.toJSONData();

      if (lineDsStatus.length === 0) {
        setCurrentTab(value);
        aimDs.query();
      } else {
        Modal.confirm({
          bodyStyle: { padding: '20px' },
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: (
            <p>
              {intl
                .get(`sprm.forecastMgt.view.message.newFrstLine`)
                .d('当前有未保存数据，请确认是否保存')}
            </p>
          ),
          onOk: () => {
            handleLineSave(0, value); // 新建行的切换保存,并新建+保存行并切换tab;
          },
          onCancel: () => {
            lineDs.reset();
            setCurrentTab(value);
            aimDs.query();
          },
        });
      }
    },
    [templateHeaderId, currentTab]
  );

  const resetQueryDs = () => {
    const currentDs = getCurrentDs(currentTab);
    // eslint-disable-next-line no-unused-expressions
    currentDs?.setState('tempKey', null);
    // eslint-disable-next-line no-unused-expressions
    currentDs.queryDataSet?.current.reset();
  };

  const handleQuery = ({ params = {} }) => {
    const clearParams = {}; // 清理
    const currentDs = getCurrentDs(currentTab);
    // eslint-disable-next-line no-unused-expressions
    const dataObj = currentDs.queryDataSet?.current?.toData() || {};
    if (dataObj) {
      for (const key in dataObj) {
        if (!['itemNameAndCode'].includes(key)) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    // eslint-disable-next-line no-unused-expressions
    currentDs.queryDataSet.current
      ? currentDs.queryDataSet.current.set({
          ...params,
          ...clearParams,
        })
      : currentDs.queryDataSet.loadData([
          {
            ...params,
            ...clearParams,
          },
        ]);
    console.log(params);
    currentDs.query(currentDs?.page, params);
  };

  const cuxTabsRender = remote
    ? remote.process('SPRM_FORECAST_WORKBENCH_TAB_RENDER', null, {
        countMap,
        templateHeaderId,
        currentTab,
        queryDate,
        setState,
      })
    : null;

  const renderTabContent = () => {
    const commonProps = {
      virtual: true,
      virtualCell: true,
      virtualSpin: true,
    };

    return getTabsPropsCallback({
      components: customizeTabPane(
        {
          code: 'SPRM.FORECAST_WORKBENCH.TAB',
        },
        <Tabs
          keyboard={false}
          activeKey={currentTab}
          tabPosition="top"
          onChange={(val) => {
            that.changeTab(val);
          }}
        >
          {cuxTabsRender}
          <TabPane
            tab={intl.get('sprm.forecastWorkbench.title.unRelease').d('待发布')}
            key="awaitRelease"
            count={countMap?.awaitRelease}
            disabled={!(queryDate.fcstDateRangeEnd || queryDate.fcstDateRangeStart)}
          >
            <div style={{ height: 'calc(100vh - 252px)' }}>
              <SearchBarTable
                style={{ maxHeight: 'calc(100% - 22px)' }}
                searchCode="SPRM.FORECAST_WORKBENCH.SEARCHBAR"
                customizedCode="sprm-forecast-table-code"
                dataSet={awaitReleaseDs}
                columns={getColums}
                searchBarConfig={{
                  // autoQuery: false,
                  fieldProps: {
                    tempKey: { lovPara: { tenantId: organizationId } },
                  },
                  cacheKey: 'awaitRelease',
                  onClear: resetQueryDs,
                  onReset: resetQueryDs,
                  onQuery: handleQuery,
                  onFieldChange: onChangeField,
                  left: {
                    render: () => (
                      <MutlTextFieldSearch
                        name="itemNameAndCode"
                        dataSet={awaitReleaseDs}
                        placeholder={intl
                          .get('sprm.forecastWorkbench.search.itemNameAndCode')
                          .d('请输入物料名称、物料编码查询')}
                      />
                    ),
                  },
                }}
                pagination={{
                  pageSizeOptions: ['10', '20', '50', '100', '200', '500'],
                }}
                {...commonProps}
              />
            </div>
          </TabPane>
          <TabPane
            tab={intl.get('sprm.forecastWorkbench.title.released').d('已发布')}
            key="awaitFeedback"
            count={countMap?.awaitFeedback}
            disabled={!(queryDate.fcstDateRangeEnd || queryDate.fcstDateRangeStart)}
          >
            <div style={{ height: 'calc(100vh - 252px)' }}>
              <SearchBarTable
                style={{ maxHeight: 'calc(100% - 22px)' }}
                searchCode="SPRM.FORECAST_WORKBENCH.SEARCHBAR"
                dataSet={awaitFeedbackDs}
                columns={getColums}
                className="forecast-table"
                mode={tabNeedFeedback ? 'tree' : 'list'}
                selectionMode="rowbox"
                defaultRowExpanded={expandAllFlag}
                customizedCode="sprm-forecast-table-code"
                onRow={({ record }) => ({
                  className: record.get('fcrtType') !== baseLine ? 'row-differ-color' : '',
                })}
                queryFieldsLimit={3}
                searchBarConfig={{
                  // autoQuery: false,
                  fieldProps: {
                    tempKey: { lovPara: { tenantId: organizationId } },
                  },
                  cacheKey: 'awaitFeedback',
                  onFieldChange: onChangeField,
                  onQuery: handleQuery,
                  onClear: resetQueryDs,
                  onReset: resetQueryDs,
                  left: {
                    render: () => (
                      <MutlTextFieldSearch
                        name="itemNameAndCode"
                        dataSet={awaitFeedbackDs}
                        placeholder={intl
                          .get('sprm.forecastWorkbench.search.itemNameAndCode')
                          .d('请输入物料名称、物料编码查询')}
                      />
                    ),
                  },
                }}
                {...commonProps}
              />
            </div>
          </TabPane>
          <TabPane
            tab={intl.get('sprm.forecastWorkbench.title.awaitApprove').d('反馈待审批')}
            key="awaitApprove"
            count={countMap?.awaitApprove}
            disabled={!(queryDate.fcstDateRangeEnd || queryDate.fcstDateRangeStart)}
          >
            <div style={{ height: 'calc(100vh - 252px)' }}>
              <SearchBarTable
                style={{ maxHeight: 'calc(100% - 22px)' }}
                searchCode="SPRM.FORECAST_WORKBENCH.SEARCHBAR"
                dataSet={awaitApproveDs}
                className="forecast-table"
                columns={getColums}
                mode={tabNeedFeedback ? 'tree' : 'list'}
                selectionMode="rowbox"
                defaultRowExpanded={expandAllFlag}
                customizedCode="sprm-forecast-table-code"
                onRow={({ record }) => ({
                  className: record.get('fcrtType') !== baseLine ? 'row-differ-color' : '',
                })}
                queryFieldsLimit={3}
                searchBarConfig={{
                  // autoQuery: false,
                  fieldProps: {
                    tempKey: { lovPara: { tenantId: organizationId } },
                  },
                  cacheKey: 'awaitApprove',
                  onClear: resetQueryDs,
                  onReset: resetQueryDs,
                  onFieldChange: onChangeField,
                  onQuery: handleQuery,
                  left: {
                    render: () => (
                      <MutlTextFieldSearch
                        name="itemNameAndCode"
                        dataSet={awaitApproveDs}
                        placeholder={intl
                          .get('sprm.forecastWorkbench.search.itemNameAndCode')
                          .d('请输入物料名称、物料编码查询')}
                      />
                    ),
                  },
                }}
                {...commonProps}
              />
            </div>
          </TabPane>
          {tabNeedFeedback && (
            <TabPane
              tab={intl.get('sprm.forecastWorkbench.title.feedBack').d('已反馈')}
              key="hasFeedback"
              count={countMap?.hasFeedback}
              disabled={!(queryDate.fcstDateRangeEnd || queryDate.fcstDateRangeStart)}
            >
              <div style={{ height: 'calc(100vh - 252px)' }}>
                <SearchBarTable
                  style={{ maxHeight: 'calc(100% - 22px)' }}
                  searchCode="SPRM.FORECAST_WORKBENCH.SEARCHBAR"
                  dataSet={hasFeedbackDs}
                  className="forecast-table"
                  columns={getColums}
                  mode={tabNeedFeedback ? 'tree' : 'list'}
                  selectionMode="rowbox"
                  customizedCode="sprm-forecast-table-code"
                  defaultRowExpanded={expandAllFlag}
                  onRow={({ record }) => ({
                    className: record.get('fcrtType') !== baseLine ? 'row-differ-color' : '',
                  })}
                  queryFieldsLimit={3}
                  searchBarConfig={{
                    // autoQuery: false,
                    fieldProps: {
                      tempKey: { lovPara: { tenantId: organizationId } },
                    },
                    cacheKey: 'hasFeedback',
                    onClear: resetQueryDs,
                    onReset: resetQueryDs,
                    onFieldChange: onChangeField,
                    onQuery: handleQuery,
                    left: {
                      render: () => (
                        <MutlTextFieldSearch
                          name="itemNameAndCode"
                          dataSet={hasFeedbackDs}
                          placeholder={intl
                            .get('sprm.forecastWorkbench.search.itemNameAndCode')
                            .d('请输入物料名称、物料编码查询')}
                        />
                      ),
                    },
                  }}
                  {...commonProps}
                />
              </div>
            </TabPane>
          )}
          <TabPane
            tab={intl.get('sprm.forecastWorkbench.title.all').d('全部')}
            key="all"
            count={countMap?.all}
            disabled={!(queryDate.fcstDateRangeEnd || queryDate.fcstDateRangeStart)}
          >
            <div style={{ height: 'calc(100vh - 252px)' }}>
              {waitCustomize ? (
                <Spin spinning={waitCustomize} />
              ) : (
                <>
                  <SearchBarTable
                    style={{ maxHeight: 'calc(100% - 22px)' }}
                    searchCode={
                      waitCustomize
                        ? null
                        : sourceType === 'all'
                        ? 'SPRM.FORECAST_WORKBENCH.SEARCHBAR'
                        : 'SPRM.FORECAST_WORKBENCH.VERSION_FILTER'
                    }
                    dataSet={waitCustomize ? null : sourceType === 'all' ? allDs : versionTableDs}
                    className="forecast-table"
                    columns={getColums}
                    mode={tabNeedFeedback ? 'tree' : 'list'}
                    selectionMode="rowbox"
                    defaultRowExpanded={expandAllFlag}
                    customizedCode="sprm-forecast-table-code"
                    onRow={({ record }) => ({
                      className: record.get('fcrtType') !== baseLine ? 'row-differ-color' : '',
                    })}
                    queryFieldsLimit={3}
                    searchBarConfig={{
                      fieldProps: {
                        tempKey: { lovPara: { tenantId: organizationId } },
                      },
                      cacheKey: sourceType === 'all' ? 'all' : 'version',
                      onClear: resetQueryDs,
                      onReset: resetQueryDs,
                      onFieldChange: onChangeField,
                      onQuery: handleQuery,
                      right: {
                        render: () =>
                          versionViewDimension !== 'NONE' ? (
                            <ViewFilter
                              updateType={({ value }) => {
                                setWaitCustomize(true);
                                setTimeout(() => {
                                  setWaitCustomize(false);
                                  setSourceTab(value);
                                }, 100);
                                if (value === 'all') {
                                  allDs.query();
                                } else {
                                  versionTableDs.query();
                                }
                              }}
                              sourceType={sourceType}
                            />
                          ) : (
                            <></>
                          ),
                      },
                      left: {
                        render: () => (
                          <MutlTextFieldSearch
                            name="itemNameAndCode"
                            dataSet={sourceType === 'all' ? allDs : versionTableDs}
                            placeholder={intl
                              .get('sprm.forecastWorkbench.search.itemNameAndCode')
                              .d('请输入物料名称、物料编码查询')}
                          />
                        ),
                      },
                    }}
                    {...commonProps}
                  />
                </>
              )}
            </div>
          </TabPane>
        </Tabs>
      ),
      callback: initTab,
    });
  };

  const renderRemoteHeader = remote
    ? remote.render('SPRM_FOREBENCH_FUN_REMOTE_HEADER_RENDER', null, { currentTab, templateCode })
    : null;

  return (
    <Fragment>
      <Header title={HeaderComp}>
        {templateHeaderId && <HeaderBtn />}
        {renderRemoteHeader}
      </Header>
      <Content
        style={{
          padding: templateList.length > 1 ? 0 : '16px 16px 0 16px',
        }}
      >
        <Spin spinning={menuLoading}>
          {templateList.length > 1 ? (
            <Layout style={{ height: 'calc(100vh - 152px)' }}>
              <div
                className={styles['workbench-menu']}
                style={{ display: collapsed ? 'none' : 'block' }}
              >
                <div className={styles[!collapsed ? 'menu-sub-open' : 'menu-sub-off']}>
                  <div className={styles['menu-text']}>
                    <Sider trigger={null} collapsible collapsed={collapsed}>
                      <Menu
                        mode="inline"
                        id="menuLineId"
                        inlineCollapsed={collapsed}
                        defaultSelectedKeys={[templateHeaderId]}
                        selectedKeys={[templateHeaderId]}
                      >
                        {templateList?.map((item) => {
                          return (
                            <Menu.Item
                              key={item.templateHeaderId}
                              onClick={() => {
                                if (item.templateHeaderId !== templateHeaderId) {
                                  setInt(0);
                                }
                                setTemplateHeaderId(item.templateHeaderId);
                                setTemplateCode(item.templateCode);
                              }}
                            >
                              <div>
                                <div className={styles['text-style']}>
                                  <div
                                    className={
                                      styles[
                                        templateHeaderId === item.templateHeaderId
                                          ? 'text-style-span-click'
                                          : 'text-style-span'
                                      ]
                                    }
                                  >
                                    <div className={styles['text-style-tilte']}>
                                      <Tooltip title={item.templateName}>
                                        {item.templateName}
                                      </Tooltip>
                                    </div>
                                    <div className={styles['text-style-text']}>
                                      {item.templateCode}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Menu.Item>
                          );
                        })}
                      </Menu>
                    </Sider>
                  </div>
                </div>
              </div>
              <div className={styles[!collapsed ? 'workbench-page-open' : 'workbench-page-off']}>
                <a
                  onClick={() => collapsedChange(!collapsed)}
                  className={styles[collapsed ? 'menu-icon' : 'menu-icon-a']}
                >
                  <Icon className={styles['page-icon']} type="baseline-arrow_right" />
                </a>
                {isFunction(cuxRenderAlertInfo) ? cuxRenderAlertInfo() : undefined}
                {renderTabContent()}
              </div>
            </Layout>
          ) : (
            <>
              {isFunction(cuxRenderAlertInfo) ? cuxRenderAlertInfo() : undefined}
              {renderTabContent()}
            </>
          )}
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  connect(({ purchaseplatform }) => ({
    purchaseplatform,
  })),
  cuxRemote(
    {
      code: 'SPRM_FOREBENCH_FUN_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      process: {
        queryDataDom: undefined,
        cuxCol: undefined,
        cuxHeadBtns: undefined,
        cuxListDsProps: undefined,
        cuxSetInitState: undefined,
        cuxHandleImport: undefined,
        cuxRenderAlertInfo: undefined,
        beforeDeleteLine: () => true,
        beforeClose: () => true,
        beforeCancel: () => true,
        releaseBtnDisabled: undefined,
      },
      events: {
        async beforeApprove() {
          return true;
        },
        async beforeReject() {
          return true;
        },
      },
    }
  ),
  formatterCollections({
    code: [
      'sprm.common',
      'sprm.purchasePlatform',
      'hzero.common',
      'sprm.forecastMgt',
      'sprm.forecastWorkbench',
      'entity.company',
      'entity.business',
      'entity.organization',
      'entity.roles',
      'hzero.c7nProUI',
    ],
  }),
  withCustomize({
    unitCode: ['SPRM.FORECAST_WORKBENCH.TAB', 'SPRM.FORECAST_WORKBENCH.VERSION_FILTER'],
  })
)(Index);
