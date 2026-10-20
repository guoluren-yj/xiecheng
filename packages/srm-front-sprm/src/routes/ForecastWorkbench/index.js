import { connect } from 'dva';
// import { routerRedux } from 'dva/router';
// import { DataSet, Tabs, Table, DatePicker, Modal } from 'choerodon-ui/pro';
import { DataSet, Tabs, Table, DatePicker, Modal, Dropdown, Menu, Icon } from 'choerodon-ui/pro';
import React, { Fragment, useState, useMemo, useEffect } from 'react';
import { Divider, Tag } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import classnames from 'classnames';
import CommentImport from 'hzero-front-himp/lib/components/CommonImport';
import SearchBarTable from '_components/SearchBarTable';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import queryString from 'querystring';
import { openTab } from 'utils/menuTab';
import { isArray, isEmpty, compose } from 'lodash';
import { SRM_SPRM } from '_utils/config';

import { initiateAsyncExport } from 'hzero-front/lib/services/api';

import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { yesOrNoRender } from 'utils/renderer';
import { Button } from 'components/Permission';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import injectGuide from 'srm-front-boot/lib/components/Guide/injectGuideList';
import formatterCollections from 'utils/intl/formatterCollections';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import { queryMapIdpValue, checkPermission } from 'services/api';
import {
  handleQueryTemp,
  deletefrstLines,
  releasefrstLines,
  closefrstLines,
  updatefrstLines,
  queryTabCount,
  queryStartDate,
  sysExternal,
} from '@/services/forecastTemplateDefOrgService';

// import { wholeDs, operateRecordDs, historyVersionDs } from './indexDs';
import { wholeDs, historyVersionDs, operateRecordDs } from './indexDs';
import { config, getFieldType, handleFieldList } from './utils.js';
import {
  initLinesValue,
  initCols,
  dynamicArrComp,
  hisotryArrComp,
} from './../forecastComponents/util.js';
import Operation from './Operation';
import './index.less';

const organizationId = getCurrentOrganizationId();
const { TabPane } = Tabs;
let baseLine = 'fcstQuantity';
let historyCol = [];
let queryCountData;
const Index = () => {
  injectGuide(`/sprm/forecast-workbench/list`, config);
  const lineDs = useMemo(() => new DataSet(wholeDs()), [showLines]);
  const historyDs = useMemo(() => new DataSet(historyVersionDs()), [showLines]);
  const operateLineDs = new DataSet(operateRecordDs());
  const [currentTab, setCurrentTab] = useState('awaitRelease');
  const [initTemplateData, setTemplateData] = useState({ tabNeedFeedback: 1, allowChange: 0 }); // ds初始化数据
  const [showLines, setLines] = useState(initLinesValue); // 初始化预测行：预测数量 反馈数量 比差
  const [queryDate, setQueryDate] = useState(undefined);
  const [countMap, setCountMap] = useState({}); // 各个tab表格数量
  const [loadings, setLoadings] = useState({});
  const [initStartDate, setStartDate] = useState([]); // 初始化的日期
  const [cols, seCols] = useState(initCols);
  const [fixedInitFields, setFixedFileds] = useState([]);
  const [init, setInt] = useState(0); // 是否查询过模板
  const [resFields, setResFields] = useState({});
  const [permissionsMaps, setPermissionsMap] = useState({});

  useEffect(() => {
    // /v1/{organizationId}/fcst-headers/list/fcst-start-date
    queryStartDate().then(res => {
      const result = getResponse(res);
      if (isArray(result)) {
        setStartDate(result);
      }
    });
    const code = [
      'hzero.srm.requirement.forecast.purchaser.workbench.ps.import',
      'hzero.srm.requirement.forecast.purchaser.workbench.ps.export',
      'hzero.srm.requirement.forecast.purchaser.workbench.button.offline-import',
      'hzero.srm.requirement.forecast.purchaser.workbench.button.offline-export',
      'hzero.srm.requirement.forecast.purchaser.workbench.button.feedbacksyn',
    ];
    const permissionsMap = new Map();
    checkPermission(code).then(res => {
      const checkRes = getResponse(res);
      if (isArray(checkRes)) {
        (checkRes || []).forEach(item => {
          permissionsMap[item.code] = item.approve;
        });
      }
      setPermissionsMap(permissionsMap);
    });
    queryMapIdpValue({
      line: 'SPRM.FCST_CATEGORY',
    }).then(res => {
      const result = getResponse(res);
      if (result) {
        const { line } = res;
        setLines(line);
        lineDs.setState('lines', line);
      }
    });
  }, []);

  // 设置动态列
  const handleChange = moment => {
    if (moment) {
      handleQueryTemp({ fcstStartDate: moment.format(DEFAULT_DATE_FORMAT) }).then(res => {
        if (res && !res.failed) {
          const {
            dynamicColumnFields,
            fields,
            allowChange,
            offlineInputFlag,
            needFeedback,
            detailFeedbackFlag,
            predictionDimensionCnf,
            feedbackChangeCnf,
            feedbackSyncFlag,
          } = res;
          setTemplateData({
            allowChange,
            needFeedback,
            offlineInputFlag,
            tabNeedFeedback: needFeedback,
            feedbackChangeCnf,
            detailFeedbackFlag,
            feedbackSyncFlag,
          });
          setResFields({ dynamicColumnFields, fields });
          dynamicColumnFields.forEach(ele => {
            const { required, fieldCode, fieldName } = ele;
            lineDs.addField(ele.fieldCode, {
              required,
              name: fieldCode,
              type: 'number',
              min: 0,
              precision: 10,
              label: fieldName,
            });
            historyDs.addField(ele.fieldCode, {
              name: fieldCode,
              label: fieldName,
              type: 'number',
            });
          });

          const fixedFields = fixedInitFields;

          // 模版查询设置
          if (!init) {
            const lockObj = { L: 'left', R: 'right', N: false };
            // 虚拟字段/供应商字段逻辑处理
            const showFieldsList = handleFieldList({
              fields,
              allowChange,
              needFeedback,
              predictionDimensionCnf,
            });
            // ds逻辑处理
            showFieldsList.forEach(ele => {
              const { required, lovCode, fieldType, fieldName, fieldCode, lovInfo } = ele;
              const { valueField, displayField } = lovInfo || {};
              const type = getFieldType(fieldType);
              const checkedValueSetting = type === 'boolean' ? { trueValue: 1, falseValue: 0 } : {};
              const dsFields = lineDs.getField(fieldCode);
              // 更改已存在的数据的必输性，值集，字段名
              if (dsFields) {
                dsFields.set('required', required);
                dsFields.set('lovCode', lovCode);
                dsFields.set('label', fieldName);
              } else if (lovCode && fieldType === 'SELECT') {
                // 更改个性化字段且为下拉框数据 的 必输性，值集，字段名
                lineDs.addField(ele.fieldCode, {
                  required,
                  type,
                  lookupCode: lovCode,
                  label: fieldName,
                });
              } else if (lovCode && !['INPUT', 'INPUT_NUMBER', 'DATE_PICKER'].includes(fieldType)) {
                // 更改个性化字段且为Lov数据  的必输性，下拉框,值集，字段名
                lineDs.addField(ele.fieldCode, {
                  required,
                  type,
                  lovCode,
                  label: fieldName,
                  transformRequest: value => (value ? value[valueField] : undefined),
                  transformResponse: (value, object) => {
                    return object
                      ? {
                          ...object,
                          [valueField]: object ? object[fieldCode] : null,
                          [displayField]: object ? object[`${fieldCode}Meaning`] : null,
                        }
                      : {};
                  },
                });
              } else {
                // 其余字段
                lineDs.addField(ele.fieldCode, {
                  required,
                  type,
                  lovCode,
                  label: fieldName,
                  ...checkedValueSetting,
                });
              }
            });
            // 标准字段设置cols
            showFieldsList.forEach(({ fieldCode, editable, width, fixed }) => {
              // 操作记录
              if (fieldCode === 'actionLine') {
                fixedFields.push({
                  name: 'actionLine',
                  width: 90,
                  lock: lockObj[fixed] || false,
                  renderer: ({ record }) =>
                    record.get('fcrtType') === 'fcstQuantity' ? (
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
                      <span />
                    ),
                });
              } else if (fieldCode === 'customizeVersion') {
                fixedFields.push({
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
              } else if (fieldCode === 'dynamicCol') {
                fixedFields.push({ name: 'dynamicCol' });
              } else if (fieldCode === 'sumQiantity' && predictionDimensionCnf === 'QUANTITY') {
                fixedFields.push({
                  name: 'sumQiantity',
                  lock: lockObj[fixed] || false,
                  renderer: ({ text, value }) => (
                    <span style={{ color: Number(value) < 0 ? 'red' : '#333' }}>{text}</span>
                  ),
                });
              } else if (fieldCode === 'sumAmount' && predictionDimensionCnf !== 'QUANTITY') {
                fixedFields.push({
                  name: 'sumAmount',
                  lock: lockObj[fixed] || false,
                  renderer: ({ text, value }) => (
                    <span style={{ color: Number(value) < 0 ? 'red' : '#333' }}>{text}</span>
                  ),
                });
              } else if (fieldCode === 'fcstStatus') {
                fixedFields.push({
                  name: 'fcstStatus',
                  lock: lockObj[fixed] || false,
                  width,
                  renderer: ({ record }) => (
                    <RenderTag
                      fieldCode={fieldCode}
                      fcrtType={record.get('fcrtType')}
                      record={record}
                    />
                  ),
                });
              } else {
                fixedFields.push({
                  name: fieldCode,
                  width,
                  lock: lockObj[fixed] || false,
                  renderer: ({ record, text }) => (
                    <RenderWhiteboard
                      fieldCode={fieldCode}
                      fcrtType={record.get('fcrtType')}
                      text={text}
                    />
                  ),
                  editor: record => editable === 1 && ['NEW'].includes(record.get('fcstStatus')),
                });
              }
            });
            setInt(1);
            setFixedFileds(fixedFields);
          }
          lineDs.setQueryParameter('tabNeedFeedback', needFeedback);
          lineDs.setQueryParameter('currentTab', currentTab);
          lineDs.setQueryParameter('fcstStartDate', moment.format(DEFAULT_DATE_FORMAT));
          queryCountData = moment.format(DEFAULT_DATE_FORMAT);
          lineDsResultMap();
          setQueryDate(moment.format(DEFAULT_DATE_FORMAT));
          const dynamicArr = dynamicArrComp(
            dynamicColumnFields,
            {
              allowChange,
              feedbackChangeCnf,
              needFeedback,
              detailFeedbackFlag,
              lineDs,
            },
            'purchase'
          );
          const colums = [];
          fixedFields.forEach(ele => {
            if (ele.name === 'dynamicCol') {
              colums.push(...dynamicArr);
            } else {
              colums.push(ele);
            }
          });
          seCols(colums);

          const hisotryArr = hisotryArrComp(dynamicColumnFields, {
            detailFeedbackFlag,
            predictionDimensionCnf,
            viewedBy: 'purchase',
          });
          const historyCols = [
            {
              name: 'version',
              lock: 'left',
              renderer: ({ record, text }) =>
                record.get('fcrtType') === 'fcstQuantity' ? text : <span />,
            },
            {
              name: 'itemCode',
              lock: 'left',
              renderer: ({ record, text }) =>
                record.get('fcrtType') === 'fcstQuantity' ? text : <span />,
            },
            {
              name: 'fcstStatus',
              lock: 'left',
              renderer: ({ record, text }) =>
                record.get('fcrtType') === 'fcstQuantity' ? text : <span />,
            },
            {
              name: 'fcrtType',
              lock: 'left',
              renderer: ({ record }) => record.get('fcrtTypeMeaning'),
            },
            predictionDimensionCnf === 'QUANTITY'
              ? {
                  name: 'sumQiantity',
                  lock: 'left',
                  renderer: ({ text, value, record }) => (
                    <span
                      style={{
                        color:
                          !['feedbackQuantity', 'fcstQuantity'].includes(record.get('fcrtType')) &&
                          value < 0
                            ? 'red'
                            : '#333',
                      }}
                    >
                      {!record.get('forecastCategoryType') ? text : yesOrNoRender(Number(value))}
                    </span>
                  ),
                }
              : {
                  name: 'sumAmount',
                  lock: 'left',
                  renderer: ({ text, value, record }) => (
                    <span
                      style={{
                        color:
                          !['feedbackAmountIncTax', 'fcstAmountIncTax'].includes(
                            record.get('fcrtType')
                          ) && value < 0
                            ? 'red'
                            : '#333',
                      }}
                    >
                      {!record.get('forecastCategoryType') ? text : yesOrNoRender(Number(value))}
                    </span>
                  ),
                },
          ].concat(hisotryArr, [
            {
              name: 'fcstNum',
              lock: 'left',
              renderer: ({ record, text }) =>
                record.get('fcrtType') === 'fcstQuantity' ? text : <span />,
            },
            {
              name: 'lineNum',
              lock: 'left',
              renderer: ({ record, text }) =>
                record.get('fcrtType') === 'fcstQuantity' ? text : <span />,
            },
          ]);
          historyCol = historyCols;
        } else if (res && res.failed) {
          notification.error({ message: res.message });
        }
      });
    }
  };

  const RenderWhiteboard = observer(data => {
    const { fcrtType, text, fieldCode } = data;
    return fcrtType === baseLine || fieldCode === 'fcrtType' ? <span>{text}</span> : <span />;
  });

  const RenderTag = observer(data => {
    const { fcrtType, record } = data;
    return fcrtType === baseLine ? (
      <span>
        {[
          'NEW',
          'UNRELEASED',
          'CHANGED',
          'FEEDBACK_IN_APPROVAL',
          'FEEDBACK_PEND_APPROVAL',
          'FEEDBACK_REJECTED',
        ].includes(record.get('fcstStatus')) ? (
          <Tag color="yellow" style={{ border: 'none' }}>
            {record.get('fcstStatusMeaning')}
          </Tag>
        ) : null}
        {['RELEASED', 'FEEDBACK', 'CLOSED'].includes(record.get('fcstStatus')) ? (
          <Tag color="green" style={{ border: 'none' }}>
            {record.get('fcstStatusMeaning')}
          </Tag>
        ) : null}
      </span>
    ) : (
      <span />
    );
  });

  // 查询数量
  const queryPurchaseCount = fcstStartDate => {
    queryTabCount(fcstStartDate || { fcstStartDate: queryDate }).then(res => {
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

  const cellRenderer = view => {
    if (view === 'date') {
      return dayRenderer;
    }
  };

  const HeaderComp = () => {
    return (
      <div>
        <span style={{ fontSize: 14, fontWeight: 500 }}>
          {intl.get('sprm.forecastMgt.model.common.forecastWorkbench').d('预测管理工作台')}
        </span>
        <Divider type="vertical" />
        <DatePicker
          style={{ fontSize: '12px' }}
          onChange={handleChange}
          value={queryDate}
          cellRenderer={cellRenderer}
          className={classnames('required-edit-alert', 'required-edit-alert-two')}
          placeholder={intl.get('sprm.forecastMgt.model.enterQueryDate').d('请输入预测起始日期')}
          required
        />
      </div>
    );
  };

  // 删除采购申请行
  const handleLineDelete = () => {
    const { selected } = lineDs;
    const deleUpdateArr = selected.filter(
      ele => ele.get('fcstHeaderId') || ele.get('fcstHeaderIdMain')
    );
    if (deleUpdateArr.length > 0) {
      const deleteLine = deleUpdateArr.map(ele => ({
        fcstHeaderId: ele.get('fcstHeaderId') || ele.get('fcstHeaderIdMain'),
        fcstStatus: ele.get('fcstStatus'),
        _token: ele.get('_token'),
      }));
      deletefrstLines(deleteLine).then(res => {
        if (res && !res.failed) {
          lineDs.unSelectAll();
          lineDs.clearCachedSelected();
          lineDsResultMap();
          notification.success();
        } else {
          setLoadings({ ...loadings, saveLoading: false });
          notification.error({ message: res.message });
        }
      });
    } else {
      lineDs.remove(selected);
    }
  };

  const actionHistory = (record, activeCols) => {
    operateLineDs.setQueryParameter(
      'fcstHeaderId',
      record.get('fcstHeaderId') || record.get('fcstHeaderIdMain')
    );
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
      footer: okBtn => okBtn,
    });
  };

  const handleVersion = params => {
    const newRes = [];
    const resultTableData = {}; // 获取动态week,day,year的值
    const { record } = params;
    historyDs.setQueryParameter(
      'fcstHeaderId',
      record.get('fcstHeaderId') || record.get('fcstHeaderIdMain')
    );
    const fcstHeaderId = record.get('fcstHeaderId') || record.get('fcstHeaderIdMain');
    historyDs.setQueryParameter('version', record.get('version'));
    historyDs.setQueryParameter('queryDate', queryDate);
    historyDs.query().then(result => {
      result.forEach(item => {
        const { fcstLineSumMap = {}, fcstLineVerList = [], changeFieldLineMap = {} } = item;
        const typeDef = initTemplateData.tabNeedFeedback
          ? showLines
          : [
              {
                value: 'fcstQuantity',
                meaning: '预测数量',
                orderSeq: 10,
              },
            ];
        const othersLine = typeDef.map(({ value: ele, meaning }) => {
          fcstLineVerList.forEach(i => {
            const { fcstDate } = i;
            resultTableData[fcstDate] = i[ele];
            const changeLine = changeFieldLineMap[fcstDate];
            const changedKey = changeLine ? changeLine.find(e => e.fieldName === ele) : undefined;
            if (changedKey && ['fcstQuantity', 'feedbackQuantity'].includes(ele)) {
              resultTableData[`${fcstDate}Color`] =
                changedKey && ele !== 'diffQiantity' ? String(changedKey.oldValue || 'null') : null;
            } else {
              resultTableData[`${fcstDate}Color`] = undefined;
            }
          });

          return {
            ...item,
            fcstHeaderIdMain: ele === 'fcstQuantity' ? fcstHeaderId : `${fcstHeaderId}_${ele}`,
            fcstHeaderId: ele === 'fcstQuantity' ? undefined : fcstHeaderId,
            fcrtType: ele,
            fcrtTypeMeaning: meaning,
            ...resultTableData,
            sumQiantity: fcstLineSumMap.sum ? fcstLineSumMap.sum[ele] : null,
            sumAmount: fcstLineSumMap.sum ? fcstLineSumMap.sum[ele] : null,
            sumByDay: fcstLineSumMap.sumByDay ? fcstLineSumMap.sumByDay[ele] : null,
            sumByMonth: fcstLineSumMap.sumByMonth ? fcstLineSumMap.sumByMonth[ele] : null,
            sumByWeek: fcstLineSumMap.sumByWeek ? fcstLineSumMap.sumByWeek[ele] : null,
            sumByYear: fcstLineSumMap.sumByYear ? fcstLineSumMap.sumByYear[ele] : null,
          };
        });
        newRes.push(...othersLine);
      });

      historyDs.loadData(newRes);
    });
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '1090px' },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get(`hzero.common.button.historyVerison`).d('历史版本'),
      children: (
        <div style={{ height: 'calc(100vh - 150px)' }}>
          <Table
            dataSet={historyDs}
            columns={historyCol}
            style={{ maxHeight: 'calc(100% - 22px)' }}
          />
        </div>
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: okBtn => okBtn,
    });
  };

  // 保存行
  const handleLineSave = async (createFlag, tabValue) => {
    setLoadings({ ...loadings, saveLoading: true });
    const updateLine = lineDs.toJSONData();
    const validateFlag = await lineDs.validate();
    if (validateFlag) {
      // 动态字段
      const { dynamicColumnFields = [] } = resFields;
      const fieldCodeList = {};
      const updateLineArray = updateLine.map(item => {
        // 更新
        if (item.fcstHeaderIdMain || item.fcstHeaderId) {
          const { fcstHeaderIdMain } = item;

          const record = lineDs.find(ele => ele.get('fcstHeaderIdMain') === fcstHeaderIdMain);

          const itemFcstLineList = record?.parent
            ? record.parent?.get('fcstLineList').toJS()
            : item.fcstLineList;
          const fcstLineList = itemFcstLineList.map(({ fcstDate, ...ele }) => {
            return {
              ...ele,
              fcstDate,
              fcstQuantity: item[fcstDate],
            };
          });
          return {
            ...item,
            fcstHeaderId: item.fcstHeaderIdMain || item.fcstHeaderId,
            fcstStartDate: queryDate,
            fcstLineList,
          };
        } else {
          // 根据动态列,获取数据
          const fcstLineList = dynamicColumnFields.map(ele => {
            const { fcstLineType, fcstSeq, fieldCode, cycleStartTime, cycleEndTime } = ele;
            fieldCodeList[fieldCode] = undefined;
            return {
              fcstLineType,
              cycleStartTime,
              cycleEndTime,
              fcstSeq,
              fcstQuantity: item[fieldCode],
              fcstDate: fieldCode,
            };
          });
          return {
            ...item,
            fcstHeaderId: item.fcstHeaderId || item.fcstHeaderIdMain,
            fcstStartDate: queryDate,
            ...fieldCodeList,
            fcstLineList,
          };
        }
      });
      updatefrstLines(updateLineArray).then(res => {
        if (res && !res.failed) {
          lineDs.unSelectAll();
          lineDs.clearCachedSelected();
          setLoadings({ ...loadings, saveLoading: false });
          if (createFlag) {
            setCurrentTab('awaitRelease');
            lineDs.setQueryParameter('currentTab', 'awaitRelease');
            lineDsResultMap({}, 1);
          } else if (tabValue) {
            setCurrentTab(tabValue);
            lineDs.setQueryParameter('currentTab', tabValue);
            lineDsResultMap();
          } else {
            lineDsResultMap();
          }
          notification.success();
        } else if (res && res.failed) {
          setLoadings({ ...loadings, saveLoading: false });
          notification.error({ message: res.message });
        } else {
          setLoadings({ ...loadings, saveLoading: false });
        }
      });
    } else {
      setLoadings({ ...loadings, saveLoading: false });
      const { selected } = lineDs;
      const saveDs = selected.length === 0 ? lineDs : selected;

      const validateArray = [];
      saveDs.forEach(async ele => {
        const errorMsg = ele.getValidationErrors().map(item => item.errors[0]);
        validateArray.push(...errorMsg);
      });
      let errorMsg = ``;
      const errorTpye = validateArray.map(ele => ele.ruleName);
      const aa = Array.from(new Set(errorTpye));
      aa.forEach(e => {
        const aaa = validateArray.filter(item => item.ruleName === e);
        if (e === 'valueMissing') {
          const zzz = Array.from(new Set(aaa.map(item => item.injectionOptions.label)));
          errorMsg += zzz.join('，');
        } else {
          aaa.forEach(item => {
            errorMsg += `${item.validationMessage}，`;
          });
        }
      });
      notification.error({
        message: `预测单保存失败，原因是【${errorMsg}】为必填但未输入，请输入后进行保存。`,
      });
    }
  };

  // 发布行
  const handleLineRease = () => {
    const { selected } = lineDs;
    setLoadings({ ...loadings, release: true });
    if (
      selected.some(ele => ele.get('fcstStatus')) === 'awaitFeedback' &&
      !initTemplateData.allowChange
    ) {
      notification.warning({ message: '已发布的申请不允许重新发布，请检查配置' });
      return;
    }
    if (
      selected.some(ele => ele.get('fcstStatus')) === 'hasFeedback' &&
      !['PURCHASE', 'ALL'].includes(initTemplateData.feedbackChangeCnf)
    ) {
      notification.warning({ message: '已反馈的申请不允许重新发布，请检查配置' });
    }
    Promise.all(
      selected.map(i => {
        // eslint-disable-next-line no-param-reassign
        i.status = 'update';
        return i.validate();
      })
    ).then(status => {
      if (status[0] === true) {
        const updateLine = [];
        selected.forEach(ele => {
          if (ele.dirtyData || ['CHANGED', 'NEW'].includes(ele.get('fcstStatus'))) {
            updateLine.push(ele.toJSONData());
          }
        });
        // 动态字段
        const { dynamicColumnFields } = resFields;
        const fieldCodeList = {};
        const updateLineArray = updateLine.map(item => {
          // 更新
          if (item.fcstHeaderId || item.fcstHeaderIdMain) {
            const { fcstHeaderIdMain } = item;

            const record = lineDs.find(ele => ele.get('fcstHeaderIdMain') === fcstHeaderIdMain);

            const itemFcstLineList = record?.parent
              ? record.parent?.get('fcstLineList').toJS()
              : item.fcstLineList;
            const fcstLineList = itemFcstLineList.map(({ fcstDate, ...ele }) => {
              return {
                ...ele,
                fcstDate,
                fcstQuantity: item[fcstDate],
              };
            });
            return {
              ...item,
              fcstStartDate: queryDate,
              fcstHeaderId: item.fcstHeaderIdMain,
              fcstLineList,
            };
          } else {
            // 根据动态列,获取数据
            const fcstLineList = dynamicColumnFields.map(ele => {
              const { fcstLineType, fcstSeq, fieldCode, cycleStartTime, cycleEndTime } = ele;
              fieldCodeList[fieldCode] = undefined;
              return {
                fcstLineType,
                fcstSeq,
                cycleStartTime,
                cycleEndTime,
                fcstQuantity: item[fieldCode],
                fcstDate: fieldCode,
              };
            });
            return {
              ...item,
              fcstHeaderId: item.fcstHeaderId || item.fcstHeaderIdMain,
              fcstStartDate: queryDate,
              ...fieldCodeList,
              fcstLineList,
            };
          }
        });
        releasefrstLines(updateLineArray).then(res => {
          if (res && !res.failed) {
            lineDs.unSelectAll();
            lineDs.clearCachedSelected();
            lineDsResultMap();
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
  const handleLineClose = () => {
    const { selected } = lineDs;
    setLoadings({ ...loadings, close: true });
    const deleteLine = selected?.map(ele => ({
      ...ele.toJSONData(),
      fcstHeaderId: ele.get('fcstHeaderIdMain'),
      fcstStartDate: queryDate,
    }));
    closefrstLines(deleteLine).then(res => {
      if (res && !res.failed) {
        lineDs.unSelectAll();
        lineDs.clearCachedSelected();
        lineDsResultMap();
        notification.success();
      } else if (res && res.failed) {
        setLoadings({ ...loadings, close: false });
        notification.error({ message: res.message });
      } else {
        setLoadings({ ...loadings, close: false });
      }
    });
  };

  const lineDsResultMap = (params = {}, createFlag) => {
    const { params: query } = params;
    // eslint-disable-next-line no-unused-expressions
    lineDs.queryDataSet?.current?.set({
      ...query,
      tabNeedFeedback: initTemplateData.tabNeedFeedback,
    });
    queryPurchaseCount({
      fcstStartDate: queryCountData,
    });
    lineDs.query().then(() => {
      setLoadings({});
      if (createFlag === 1) {
        lineDs.setQueryParameter('currentTab', 'awaitRelease');
        lineDs.create(
          {
            fcrtType: 'fcstQuantity',
            fcstStatus: 'NEW',
            fcstStatusMeaning: intl.get('hzero.common.button.creat').d('新建'),
          },
          0
        );
      }
    });
  };

  const resetQueryDs = () => {
    // eslint-disable-next-line no-unused-expressions
    lineDs.queryDataSet?.current?.reset();
  };

  const newLine = () => {
    if (currentTab === 'awaitRelease') {
      lineDs.create(
        {
          fcrtType: 'fcstQuantity',
          fcstStatus: 'NEW',
          fcstStatusMeaning: intl.get('hzero.common.button.creat').d('新建'),
        },
        0
      );
    } else {
      const lineDsStatus = lineDs.toJSONData();
      if (lineDsStatus.length === 0) {
        setCurrentTab('awaitRelease');
        lineDs.setQueryParameter('currentTab', 'awaitRelease');
        lineDsResultMap({}, 1);
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
        });
      }
    }
  };

  const handleSysCB = async fcstHeaderIds => {
    await sysExternal(fcstHeaderIds).then(res => {
      const result = getResponse(res);
      if (result && isArray(result)) {
        let errorMsg = '';
        result.forEach(item => {
          if (item.errorFlag) {
            errorMsg += `${item.fcstNum}-${item.lineNum}同步失败，原因是：${item.errorMessage}`;
          }
        });
        if (errorMsg) {
          notification.error({ message: errorMsg });
        } else {
          notification.success();
        }
        lineDs.unSelectAll();
        lineDs.clearCachedSelected();
        lineDs.query();
      }
    });
  };

  const handleSynExternal = () => {
    const { selected } = lineDs;
    const fcstHeaderIds = selected?.map(
      ele => ele.get('fcstHeaderId') || ele.get('fcstHeaderIdMain')
    );
    return new Promise(resolve => {
      handleSysCB(fcstHeaderIds).then(() => {
        resolve();
      });
    });
  };

  const HeaderBtn = observer(() => {
    const { selected } = lineDs;
    // 已发布的，只有开启已发布是否允许采购方变更才可以 变更/发布
    const awaitFeedbackSaveFlag = currentTab === 'awaitFeedback' && initTemplateData.allowChange;
    // 已反馈, 只有开启采购方|| 全部都可以变更才可以 变更/发布
    const hasFeedbackSaveFlag =
      currentTab === 'hasFeedback' &&
      ['PURCHASE', 'ALL'].includes(initTemplateData.feedbackChangeCnf);
    const feedBackBtnFlag = ['PURCHASE', 'ALL'].includes(initTemplateData.feedbackChangeCnf);
    const headerList = [
      <Button
        onClick={newLine}
        permissionList={[{ code: 'hzero.srm.requirement.forecast.purchaser.workbench.ps.btn.add' }]}
        color="primary"
        type="c7n-pro"
        funcType="raised"
        disabled={!queryDate}
        icon="add"
      >
        {intl.get('hzero.common.button.creat').d('新建')}
      </Button>,
      (['awaitRelease', 'all'].includes(currentTab) ||
        awaitFeedbackSaveFlag ||
        hasFeedbackSaveFlag) && (
        <Button
          onClick={() => handleLineRease()}
          permissionList={[
            { code: 'hzero.srm.requirement.forecast.purchaser.workbench.ps.btn.release' },
          ]}
          type="c7n-pro"
          loading={loadings.saveLoading || loadings.release || loadings.delete}
          funcType="flat"
          disabled={
            selected.length === 0 ||
            selected.some(
              ele =>
                ['CLOSED', 'FEEDBACK_IN_APPROVAL', 'FEEDBACK_PEND_APPROVAL'].includes(
                  ele.get('fcstStatus')
                ) ||
                (!feedBackBtnFlag && ele.get('fcstStatus') === 'FEEDBACK') ||
                (['RELEASED', 'FEEDBACK_REJECTED'].includes(ele.get('fcstStatus')) &&
                  initTemplateData.allowChange === 0)
            )
          }
          icon="publish2"
        >
          {intl.get(`hzero.common.button.release`).d('发布')}
        </Button>
      ),
      currentTab === 'awaitRelease' && (
        <Button
          onClick={() => handleLineSave()}
          permissionList={[
            {
              code: 'hzero.srm.requirement.forecast.purchaser.workbench.ps.btn.save',
            },
          ]}
          funcType="flat"
          disabled={
            currentTab === 'all' &&
            selected.length !== 0 &&
            selected.some(ele => ['CLOSED'].includes(ele.get('fcstStatus')))
          }
          loading={loadings.saveLoading || loadings.release || loadings.delete}
          icon="save"
          type="c7n-pro"
        >
          {intl.get('hzero.common.save').d('保存')}
        </Button>
      ),
      (currentTab === 'all' || awaitFeedbackSaveFlag || hasFeedbackSaveFlag) && (
        <Button
          onClick={() => handleLineSave()}
          permissionList={[
            {
              code: 'hzero.srm.requirement.forecast.purchaser.workbench.button.change-save',
            },
          ]}
          funcType="flat"
          disabled={
            currentTab === 'all' &&
            selected.length !== 0 &&
            selected.some(ele => ['CLOSED'].includes(ele.get('fcstStatus')))
          }
          loading={loadings.saveLoading || loadings.release || loadings.delete}
          icon="save"
          type="c7n-pro"
        >
          {intl.get('sprm.forecastWorkbench.button.saveUpdates').d('保存更新')}
        </Button>
      ),
      ['hasFeedback', 'all'].includes(currentTab) && (
        <Button
          onClick={() => handleLineClose()}
          permissionList={[
            { code: 'hzero.srm.requirement.forecast.purchaser.workbench.ps.btn.close' },
          ]}
          type="c7n-pro"
          funcType="flat"
          disabled={
            lineDs.selected.length === 0 ||
            selected.some(ele => !['FEEDBACK'].includes(ele.get('fcstStatus')))
          }
          loading={loadings.saveLoading || loadings.release || loadings.delete || loadings.close}
          icon="not_interested"
        >
          {intl.get(`hzero.common.button.close`).d('关闭')}
        </Button>
      ),
      ['awaitRelease', 'all'].includes(currentTab) && (
        <Button
          onClick={handleLineDelete}
          type="c7n-pro"
          funcType="flat"
          icon="delete"
          disabled={
            !queryDate ||
            lineDs.selected.length === 0 ||
            selected.some(ele => !['NEW', 'UNRELEASED'].includes(ele.get('fcstStatus')))
          }
          loading={loadings.saveLoading || loadings.release || loadings.delete}
          permissionList={[
            {
              code: 'hzero.srm.requirement.forecast.purchaser.workbench.ps.btn.delete',
            },
          ]}
        >
          {intl.get(`hzero.common.button.delete`).d('删除')}
        </Button>
      ),
      ['awaitFeedback'].includes(currentTab) && initTemplateData.offlineInputFlag && (
        <Button
          onClick={() => handleImport({ offlineRecord: 1 })}
          type="c7n-pro"
          icon="archive"
          className="offline-entry-btn"
          key="import"
          funcType="flat"
          permissionList={[
            {
              code: 'hzero.srm.requirement.forecast.purchaser.workbench.button.offline-import',
            },
          ]}
        >
          {intl.get('sprm.forecastWorkbench.button.offlineResultEntry').d('线下结果录入')}
        </Button>
      ),
      ['awaitFeedback'].includes(currentTab) && initTemplateData.offlineInputFlag && (
        <Button
          onClick={() => handleExport({ offlineRecord: 1 })}
          type="c7n-pro"
          icon="archive"
          className="offline-entry-btn"
          key="import"
          permissionList={[
            {
              code: 'hzero.srm.requirement.forecast.purchaser.workbench.button.offline-export',
            },
          ]}
          funcType="flat"
        >
          {intl.get('sprm.forecastWorkbench.button.offlineResultExport').d('线下结果导出')}
        </Button>
      ),
      currentTab === 'all' && initTemplateData.feedbackSyncFlag && (
        <Button
          onClick={handleSynExternal}
          type="c7n-pro"
          icon="archive"
          key="import"
          funcType="flat"
          disabled={
            !queryDate ||
            lineDs.selected.length === 0 ||
            selected.some(ele => ele.get('syncStatus') !== 'SYNC_FAILURE')
          }
          permissionList={[
            { code: 'hzero.srm.requirement.forecast.purchaser.workbench.button.feedbacksyn' },
          ]}
        >
          {intl.get('sprm.forecastWorkbench.button.feedbacksyn').d('反馈重新推送外部')}
        </Button>
      ),
      <Button
        onClick={handleImport}
        type="c7n-pro"
        icon="archive"
        key="import"
        funcType="flat"
        permissionList={[{ code: 'hzero.srm.requirement.forecast.purchaser.workbench.ps.import' }]}
      >
        {intl.get('hzero.common.button.batchImport').d('批量导入')}
      </Button>,
      <Button
        onClick={handleExport}
        icon="unarchive"
        key="export"
        permissionList={[{ code: 'hzero.srm.requirement.forecast.purchaser.workbench.ps.export' }]}
        funcType="flat"
        loading={loadings.exportLoading}
      >
        {isArray(lineDs.selected) && isEmpty(lineDs.selected)
          ? intl.get('hzero.common.button.export').d('导出')
          : intl.get(`hzero.common.checkedExport`).d('勾选导出')}
      </Button>,
    ].filter(ele => ele);
    if (headerList.length <= 5) {
      return headerList;
    } else {
      const otherBtn = [];
      const otherDrop = [];
      headerList.forEach((ele, index) => {
        if (index < 4) {
          otherBtn.push(ele);
        } else {
          const {
            props: { permissionList },
          } = ele;
          const code =
            permissionList && isArray(permissionList) && permissionList[0]
              ? permissionList[0].code
              : undefined;
          if ((code && permissionsMaps[code]) || !code) {
            otherDrop.push(ele);
          }
        }
      });
      const overlay = (
        <Menu>
          {otherDrop.map(ele => (
            <Menu.Item key={ele.key} style={{ padding: 0 }}>
              <div className="forecast-menu-button">{ele}</div>
            </Menu.Item>
          ))}
        </Menu>
      );

      otherBtn.push(
        <Dropdown overlay={overlay}>
          <Icon type="more_horiz" />
        </Dropdown>
      );
      return otherBtn;
    }
  });

  const handleExport = ({ offlineRecord }) => {
    // 添加表单查询参数
    const params = [];
    setLoadings({ exportLoading: true });
    params.push({ name: 'exportType', value: 'DATA' });
    const requestUrl = `${SRM_SPRM}/v1/${organizationId}/fcst-headers/excel/export`;
    const method = 'POST';
    const fileName = '预测导出数据';
    let queryData = {};
    const fcstStatusCodeList = [];

    const [
      { tabNeedFeedback: tabNeedFeedbacks, fcrtType, ...others },
    ] = lineDs.queryDataSet.toData();
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
      fcstStatusCodeList.push('FEEDBACK', 'FEEDBACK_IN_APPROVAL', 'FEEDBACK_PEND_APPROVAL');
      queryData.queryType = 3;
    }
    if (offlineRecord === 1) {
      queryData.controlExportLine = null;
      queryData.exportFcstTypeLine = ['fcstQuantity', 'feedbackQuantity'];
    }
    if (isEmpty(lineDs.selected)) {
      others.fcstStatusCodeList = fcstStatusCodeList;
      queryData = {
        ...queryData,
        ...others,
        fcstStartDate: queryDate,
        tempKey: undefined,
        supplierQueryParamStr: others.tempKey,
        customizeUnitCode: 'SPRM.FORECAST_WORKBENCH.SEARCHBAR',
      };
    } else {
      queryData = {
        ...queryData,
        fcstStartDate: queryDate,
        tempKey: undefined,
        supplierQueryParamStr: others.tempKey,
        fcstHeaderIds: lineDs?.selected?.map(
          ele => ele.get('fcstHeaderId') || ele.get('fcstHeaderIdMain')
        ),
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
    initiateAsyncExport({ requestUrl, queryParams: params, method, queryData }, fileName)
      .catch(err => {
        if (err && getResponse(err) && err.uuid) {
          setLoadings({ exportLoading: false });
          notification.success({
            message: intl
              .get('hzero.common.notification.export.asyncWithUid', { uuid: err.uuid })
              .d(`异步导出任务已提交${err.uuid}`),
          });
        }
      })
      .then(res => {
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
    if (initTemplateData.detailFeedbackFlag) {
      const templateCode = 'SPRM.FCST_DETAIL_IMPORT';
      const importProps = {
        code: templateCode,
        sync: false,
        auto: false,
        refreshButton: 'true',
        historyButton: 'true',
        prefixPatch: SRM_SPRM,
        args: JSON.stringify({
          tenantId: organizationId,
          templateCode,
          offlineRecord,
        }),
        autoRefreshInterval: 5000,
        backPath: undefined,
        tenantId: organizationId, // 租户的传
        action: 'hzero.common.viewtitle.batchImport',
        key: `/sprm/forecast-workbench/data-import/${templateCode}`,
      };
      Modal.open({
        key: Modal.key(),
        children: <CommentImport {...importProps} />,
        closable: false,
        movable: false,
        destroyOnClose: true,
        onCancel: () => {},
        style: { width: '1200px', marginTop: '-30px' },
        onOk: () => {
          lineDs.query();
        },
        footer: okBtn => <div>{okBtn}</div>,
      });
    } else if (offlineRecord === 1) {
      openTab({
        key: '/sprm/forecast-workbench/offline-import',
        title: 'hzero.common.button.offlineResultEntry',
        search: queryString.stringify({
          backPath: `/sprm/forecast-workbench/list`,
          auto: true,
          offlineRecord,
        }),
      });
    } else {
      openTab({
        key: '/sprm/forecast-workbench/import',
        title: 'hzero.common.viewtitle.batchImport',
        search: queryString.stringify({
          backPath: `/sprm/forecast-workbench/list`,
          auto: true,
          offlineRecord,
        }),
      });
    }
  };

  const onChangeField = ({ name, value, record }) => {
    if (name === 'tempKey') {
      if (record.getField(name)?.get('lovCode') === 'SSLM.SUPPLIER_CHOOSE') {
        // eslint-disable-next-line no-unused-expressions
        lineDs.queryDataSet?.current?.set({
          supplierCompanyId: value?.supplierCompanyIds,
          supplierId: value?.extSupplierIds,
        });
      } else {
        // eslint-disable-next-line no-unused-expressions
        lineDs.queryDataSet?.current?.set({
          supplierCompanyId: value?.supplierCompanyId,
          supplierId: value?.supplierId,
        });
      }
    } else if (name === 'fcrtType' && isEmpty(value)) {
      // eslint-disable-next-line no-unused-expressions
      lineDs.queryDataSet?.current?.set({ fcrtType: undefined });
      baseLine = 'fcstQuantity';
    } else if (name === 'fcrtType') {
      // eslint-disable-next-line no-unused-expressions
      lineDs.queryDataSet?.current?.set({ fcrtType: value });
      // eslint-disable-next-line prefer-destructuring
      baseLine = value.includes('fcstQuantity') ? 'fcstQuantity' : value[0];
    } else if (!value) {
      // eslint-disable-next-line no-unused-expressions
      lineDs.queryDataSet?.current?.set({ [name]: undefined });
    }
  };

  return (
    <Fragment>
      <Header title={<HeaderComp />}>
        <HeaderBtn />
      </Header>
      <Content>
        <Tabs
          keyboard={false}
          activeKey={currentTab}
          defaultActiveKey={currentTab}
          onChange={value => {
            const lineDsStatus = lineDs.toJSONData();
            if (lineDsStatus.length === 0) {
              setCurrentTab(value);
              lineDs.unSelectAll();
              lineDs.clearCachedSelected();
              lineDs.setQueryParameter('currentTab', value);
              lineDsResultMap();
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
                  setCurrentTab(value);
                  lineDs.setQueryParameter('currentTab', value);
                  lineDsResultMap();
                },
              });
            }
          }}
          tabPosition="top"
        >
          <TabPane
            tab={intl.get('sprm.forecastWorkbench.title.unRelease').d('待发布')}
            key="awaitRelease"
            count={countMap?.awaitRelease}
            disabled={!queryDate}
          />
          <TabPane
            tab={intl.get('sprm.forecastWorkbench.title.released').d('已发布')}
            key="awaitFeedback"
            count={countMap?.awaitFeedback}
            disabled={!queryDate}
          />
          {initTemplateData.tabNeedFeedback && (
            <TabPane
              tab={intl.get('sprm.forecastWorkbench.title.feedBack').d('已反馈')}
              key="hasFeedback"
              count={countMap?.hasFeedback}
              disabled={!queryDate}
            />
          )}
          <TabPane
            tab={intl.get('sprm.forecastWorkbench.title.all').d('全部')}
            key="all"
            count={countMap?.all}
            disabled={!queryDate}
          />
        </Tabs>
        <div style={{ height: 'calc(100vh - 252px)' }}>
          <SearchBarTable
            style={{ maxHeight: 'calc(100% - 22px)' }}
            searchCode="SPRM.FORECAST_WORKBENCH.SEARCHBAR"
            dataSet={lineDs}
            className="forecast-table"
            autoQuery={false}
            columns={cols}
            mode={
              currentTab !== 'awaitRelease' && initTemplateData.tabNeedFeedback ? 'tree' : 'list'
            }
            selectionMode="rowbox"
            defaultRowExpanded
            data={[]}
            onRow={({ record }) => ({
              className: record.get('fcrtType') !== baseLine ? 'row-differ-color' : '',
            })}
            queryFieldsLimit={3}
            // cacheKey={currentTab}
            cacheState
            virtual
            virtualCell
            virtualSpin
            searchBarConfig={{
              onQuery: lineDsResultMap,
              autoQuery: false,
              fieldProps: {
                tempKey: { lovPara: { tenantId: organizationId } },
              },
              // cacheKey: currentTab,
              onClear: resetQueryDs,
              onReset: resetQueryDs,
              onFieldChange: onChangeField,
              left: {
                render: () => (
                  <MutlTextFieldSearch
                    name="itemNameAndCode"
                    handleQuery={lineDsResultMap}
                    dataSet={lineDs}
                    placeholder={intl
                      .get('sprm.forecastWorkbench.search.itemNameAndCode')
                      .d('请输入物料名称、物料编码查询')}
                  />
                ),
              },
            }}
          />
        </div>
      </Content>
    </Fragment>
  );
};

export default compose(
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
    ],
  }),
  connect()
)(Index);
