import { connect } from 'dva';
import { Icon, DataSet, Tabs, Modal, Table } from 'choerodon-ui/pro'; //  Table, Tooltip
import React, { Fragment, useState, useMemo, useEffect, useCallback } from 'react';
import { Menu, Layout, Spin, Tag, Tooltip } from 'choerodon-ui';
import intl from 'utils/intl';
// import { Button } from 'components/Permission';
import { observer } from 'mobx-react-lite';
import queryString from 'querystring';
import { openTab } from 'utils/menuTab';

import { isArray, isEmpty, compose, isFunction } from 'lodash';
import { SRM_SPRM } from '_utils/config';
import cuxRemote from 'hzero-front/lib/utils/remote';
import notification from 'utils/notification';
import DynamicButtons from '_components/DynamicButtons';
import { Header, Content } from 'components/Page';
import injectGuide from 'srm-front-boot/lib/components/Guide/injectGuideList';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import { queryMapIdpValue } from 'services/api';
import { initiateAsyncExport } from 'hzero-front/lib/services/api';
import {
  handleQueryTemp,
  feedbackfrstLines,
  saveLineFeedInfo,
  queryTabCount,
  fetchAllFrst,
  fetchQueryDate,
} from '@/services/forecastTemplateDefOrgService';
import SprmImport from '@/routes/components/Imports';
import { config } from './utils.js';
import {
  initLinesValue,
  initCols,
  getFieldType,
  dynamicArrComp,
  hisotryArrComp,
} from '../forecastComponents/util.js';

import { wholeDs, historyVersionDs } from './indexDs'; // operateRecordDs  historyVersionDs
// import Operation from './Operation';
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

const Index = ({ remote }) => {
  const { cuxRenderAlertInfo = null } = remote?.props?.process || {};
  injectGuide(`/sprm/forecast-supplier-workbench/list`, config);
  const [templateHeaderId, setTemplateHeaderId] = useState(null);
  const [templateCode, setTemplateCode] = useState(null);
  const [templateList, setTemplateList] = useState([]);
  const [defaultQueryDate, setDefaultQueryDate] = useState(null);
  const lineDs = useMemo(() => new DataSet(wholeDs({ templateHeaderId })), [templateHeaderId]);
  const historyDs = useMemo(() => new DataSet(historyVersionDs()), []);
  // const [showLines, setLines] = useState(initLinesValue);
  const [currentTab, setCurrentTab] = useState('released');
  // const operateLineDs = new DataSet(operateRecordDs());
  const [queryDate, setQueryDate] = useState(undefined);
  const [countMap, setCountMap] = useState({});
  const [loadings, setLoadings] = useState({});
  const [detailFeedBackFlag, setDetailFeekBackFlag] = useState(0);
  const [feedbackChangeCnf, setFeedbackChangeCnf] = useState('ALL');
  const [predictionDimensionCnf, setPredictionDimensionCnf] = useState('QUANTITY');
  const [tabNeedFeedback, setNeedFeedback] = useState(1); // 供应商是否需要反馈,展示1行还是3行
  const [state, setState] = useSetState({
    numline: initLinesValue(),
    taxLine: initLinesValue(),
    notTaxLine: initLinesValue(),
    cols: initCols,
    collapsed: false, // 设置菜单初始折叠参数
    menuLoading: false,
  });

  const { cols, collapsed, menuLoading, numline, taxLine, notTaxLine } = state;

  useEffect(() => {
    setState({ menuLoading: true });
    Promise.all([
      fetchAllFrst(),
      queryMapIdpValue({
        numline: 'SPRM.FCST_CATEGORY',
        taxLine: 'SPRM.FCST_CATEGORY_AMOUNT_INCLUDING_TAX',
        notTaxLine: 'SPRM.FCST_CATEGORY_AMOUNT_EXCLUDING_TAX',
      })
    ]).then((result) => {
      const [res1, res2] = result?.map((item) => getResponse(item));
      if (res1 && res2) {
        setState({ ...res2 });
        // const newShowLines =
        //   res1[0]?.predictionDimensionCnf === 'QUANTITY'
        //     ? res2?.numline
        //     : res1[0]?.predictionDimensionCnf === 'AMOUNT_INCLUDING_TAX'
        //     ? res2?.taxLine
        //     : res2?.notTaxLine;
        // setLines(newShowLines);
        setTemplateList(res1);
        setTemplateHeaderId(res1[0]?.templateHeaderId);
        setTemplateCode(res1[0]?.templateCode);
        setNeedFeedback(res1[0]?.needFeedback);
        setPredictionDimensionCnf(res1[0]?.predictionDimensionCnf);
      }
      setState({ menuLoading: false });
    });
  }, [1]);

  useEffect(() => {
    if (templateHeaderId) {
      setQueryDate(undefined);
      setCountMap({});
      // initQueryDateDs.reset();
      historyDs.setQueryParameter('templateHeaderId', templateHeaderId);
      lineDs.setQueryParameter('templateHeaderId', templateHeaderId);
      const newShowLines =
        predictionDimensionCnf === 'QUANTITY'
          ? numline
          : predictionDimensionCnf === 'AMOUNT_INCLUDING_TAX'
            ? taxLine
            : notTaxLine;
      // setLines(newShowLines);
      lineDs.setQueryParameter('lines', newShowLines);
      fetchQueryDate({
        templateHeaderId,
        size: 1,
        page: 0,
      }).then((res) => {
        if (getResponse(res)) {
          if (!isEmpty(res.content)) {
            setQueryDate(res.content[0].fcstStartDate);
            setDefaultQueryDate(res.content[0]);
            handleChange(res.content[0]);
          } else {
            setQueryDate(null);
            setDefaultQueryDate(null);
          }
        }
      });
    }
  }, [templateHeaderId, lineDs, predictionDimensionCnf, numline, taxLine, notTaxLine]);

  useEffect(() => {
    if (templateHeaderId) {
      historyDs.setQueryParameter('templateHeaderId', templateHeaderId);
      lineDs.setQueryParameter('templateHeaderId', templateHeaderId);
      // historyDs.setQueryParameter('lines', showLines);
    }
  }, [templateHeaderId, historyDs, lineDs]);

  const collapsedChange = (type) => {
    setState({ collapsed: type });
  };

  // 保存行
  const handleLineSave = async () => {
    setLoadings({ ...loadings, saveLoading: true });
    const validateFlag = await lineDs.validate();
    const updateLine = lineDs.toJSONData();
    if (validateFlag) {
      const updateLineArray = updateLine?.map((item) => {
        // 更新
        const { fcstHeaderIdMain } = item;

        const record = lineDs.find((ele) => ele.get('fcstHeaderIdMain') === fcstHeaderIdMain);

        const itemFcstLineList = record?.parent
          ? record.parent?.get('fcstLineList').toJS()
          : item.fcstLineList;

        const fcstLineList = itemFcstLineList?.map(({ fcstDate, ...ele }) => {
          return {
            ...ele,
            fcstDate,
            feedbackQuantity: item[fcstDate], // 反馈数量
          };
        });
        return {
          ...item,
          fcstStartDate: queryDate,
          fcstHeaderId: item.fcstHeaderId || item.fcstHeaderIdMain,
          fcstLineList,
        };
      });
      saveLineFeedInfo(updateLineArray).then((res) => {
        if (res && !res.failed) {
          setLoadings({ ...loadings, saveLoading: true });
          lineDs.unSelectAll();
          lineDs.clearCachedSelected();
          lineDsResultMap();
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
      notification.error({ message: '当前行有必填信息未填写' });
    }
  };

  const handleChange = (moment) => {
    if (moment) {
      handleQueryTemp({ fcstStartDate: moment.fcstStartDate, templateHeaderId }).then(
        async (res) => {
          if (getResponse(res) && res) {
            const {
              dynamicColumnFields = [],
              fields = [],
              allowChange,
              needFeedback,
              feedbackAutoFill,
              detailFeedbackFlag,
              predictionDimensionCnf: predictionDimensionCnf1,
              feedbackChangeCnf: feedbackChangeCnf1,
            } = res;
            setFeedbackChangeCnf(feedbackChangeCnf1);
            setPredictionDimensionCnf(predictionDimensionCnf1);
            baseLine = needFeedback ? 'fcstQuantity' : 'feedbackQuantity';
            setDetailFeekBackFlag(res?.detailFeedbackFlag);
            const newShowLines =
              predictionDimensionCnf1 === 'QUANTITY'
                ? numline
                : predictionDimensionCnf1 === 'AMOUNT_INCLUDING_TAX'
                  ? taxLine
                  : notTaxLine;
            // setLines(newShowLines);
            historyDs.setQueryParameter('predictionDimensionCnf', predictionDimensionCnf1);
            lineDs.setQueryParameter('predictionDimensionCnf', predictionDimensionCnf1);
            // historyDs.setQueryParameter('lines', newShowLines);
            lineDs.setQueryParameter('lines', newShowLines);
            // 供应商逻辑+操作记录
            const supplierFields = fields.filter(
              (i) =>
                [
                  'supplierId',
                  'supplierCode',
                  'supplierName',
                  'supplierTenantId',
                  'allLine',
                  'supplierCompanyId',
                  'supplierCompanyNum',
                  'supplierCompanyCode',
                  'supplierCompanyName',
                ].includes(i.fieldCode) && i.required
            );
            fields.splice(
              fields.findIndex((e) =>
                [
                  'supplierId',
                  'supplierCode',
                  'supplierName',
                  'supplierTenantId',
                  'supplierCompanyId',
                  'supplierCompanyNum',
                  'supplierCompanyCode',
                  'supplierCompanyName',
                ].includes(e.fieldCode)
              ),
              0,
              {
                fieldCode: 'supplierLov',
                showFieldFlag: supplierFields.some((i) => i.showFieldFlag) ? 1 : 0,
                lovInfo: {},
                editor: false,
                fixed: supplierFields.find((ele) => ele.fieldCode === 'supplierId')?.fixed,
                width: supplierFields.find((ele) => ele.fieldCode === 'supplierId')?.width,
                fieldName: intl.get(`sprm.forecastMgt.model.common.supplierLov`).d('供应商'),
              },
              {
                fieldCode: 'displaySupplierName',
                showFieldFlag: supplierFields.some((i) => i.showFieldFlag) ? 1 : 0,
                lovInfo: {},
                fixed: fields.find((ele) => ele.fieldCode === 'supplierName')?.fixed,
                width: fields.find((ele) => ele.fieldCode === 'supplierName')?.width,
                fieldName: intl
                  .get(`sprm.forecastMgt.model.common.displaySupplierName`)
                  .d('供应商名称'),
              }
            );
            // 虚拟字段逻辑
            if (!fields.some((e) => e.fcstFieldType === 'CUSTOMIZE')) {
              if (needFeedback === 1) {
                fields.push({
                  fieldCode: 'fcrtType',
                  fieldType: 'INPUT',
                  fieldName: intl.get(`hzero.common.model.common.entryCategory`).d('类别'),
                  editable: 0,
                  showFieldFlag: 1,
                  lovInfo: {},
                  required: 0,
                });
              }
              fields.push(
                {
                  fieldCode: 'dynamicCol',
                  fieldType: 'INPUT',
                  editable: 0,
                  showFieldFlag: 1,
                  lovInfo: {},
                  required: 0,
                },
                predictionDimensionCnf1 === 'QUANTITY'
                  ? {
                    fieldCode: 'sumQiantity',
                    fieldType: 'INPUT',
                    editable: 0,
                    showFieldFlag: 1,
                    type: 'number',
                    fieldName: intl
                      .get(`sprm.forecastMgt.model.common.sumQiantity`)
                      .d('预测总量'),
                    lovInfo: {},
                    required: 0,
                  }
                  : {
                    fieldCode: 'sumAmount',
                    fieldType: 'INPUT',
                    editable: 0,
                    showFieldFlag: 1,
                    type: 'number',
                    fieldName: intl.get(`sprm.forecastMgt.model.common.sumAmount`).d('预测总额'),
                    lovInfo: {},
                    required: 0,
                  }
              );
              fields.splice(
                fields.findIndex((e) => e.fieldCode === 'itemId'),
                0,
                {
                  fieldCode: 'itemName',
                  fieldName: intl.get(`sprm.forecastMgt.model.common.itemId`).d('物料编码'),
                  fieldType: 'INPUT',
                  editable: 0,
                  showFieldFlag: 1,
                }
              );
            }

            dynamicColumnFields.forEach((ele) => {
              const { required, fieldCode, fieldName } = ele;
              lineDs.addField(ele.fieldCode, {
                required,
                name: fieldCode,
                type: 'number',
                precision: 10,
                min: 0,
                label: fieldName,
              });
              historyDs.addField(ele.fieldCode, {
                name: fieldCode,
                label: fieldName,
                type: 'number',
              });
            });
            fields.forEach((ele) => {
              const { required, lovCode, fieldType, fieldName, fieldCode, lovInfo } = ele;
              const { valueField, displayField } = lovInfo || {};
              const type = getFieldType(fieldType);
              const checkedValueSetting = type === 'boolean' ? { trueValue: 1, falseValue: 0 } : {};
              const dsFields = lineDs.getField(fieldCode);
              if (dsFields) {
                dsFields.set('lovCode', lovCode);
                dsFields.set('label', fieldName);
              } else if (lovCode && fieldType === 'SELECT') {
                lineDs.addField(ele.fieldCode, {
                  required,
                  type,
                  lookupCode: lovCode,
                  label: fieldName,
                });
              } else if (lovCode && !['INPUT', 'INPUT_NUMBER', 'DATE_PICKER'].includes(fieldType)) {
                lineDs.addField(ele.fieldCode, {
                  required,
                  type,
                  lovCode,
                  label: fieldName,
                  transformRequest: (value) => (value ? value[valueField] : undefined),
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
              } else if (fieldCode === 'supplierId') {
                const supplierField = lineDs.getField('supplierLov');
                supplierField.set(lovCode, lovCode);
              } else {
                lineDs.addField(ele.fieldCode, {
                  type,
                  label: fieldName,
                  ...checkedValueSetting,
                });
              }
            });
            lineDs.removeEventListener('query');
            lineDs.setQueryParameter('currentTab', currentTab);
            lineDs.setQueryParameter('fcstStartDate', moment.fcstStartDate);
            lineDs.setQueryParameter('feedbackAutoFill', feedbackAutoFill);
            lineDs.setQueryParameter('tabNeedFeedback', needFeedback);
            historyDs.setQueryParameter('tabNeedFeedback', needFeedback);
            lineDs.addEventListener('query', () => {
              queryPurchaseCount({
                templateHeaderId,
                fcstStartDate: moment.fcstStartDate,
              });
            });
            setNeedFeedback(needFeedback);
            setFeedbackChangeCnf(feedbackChangeCnf1);
            lineDsResultMap();
            // setQueryDate(moment.fcstStartDate);
            const dynamicArr = dynamicArrComp(
              dynamicColumnFields,
              {
                allowChange,
                feedbackChangeCnf: feedbackChangeCnf1,
                needFeedback,
                detailFeedbackFlag,
                predictionDimensionCnf: predictionDimensionCnf1,
                lineDs,
              },
              'supplier'
            );
            const fixedFields = [];

            const hisotryArr = hisotryArrComp(dynamicColumnFields, {
              detailFeedbackFlag,
              predictionDimensionCnf: predictionDimensionCnf1,
            });
            const historyCols = [
              {
                name: 'version',
                lock: 'right',
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
                renderer: ({ record, text }) => {
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
                  if (['RELEASED', 'FEEDBACK', 'CLOSED'].includes(fcstStatus)) {
                    color = 'green';
                  }
                  return ['fcstQuantity'].includes(record.get('fcrtType')) ? (
                    // 新建,待发布,  已发布,已反馈 关闭
                    <span>
                      <Tag color={color} style={{ border: 'none' }}>
                        {fcstStatusMeaning}
                      </Tag>
                    </span>
                  ) : (
                    <RenderWhiteboard fcrtType={record.get('fcrtType')} text={text} />
                  );
                },
              },
              {
                name: 'fcrtType',
                lock: 'left',
                renderer: ({ record }) => record.get('fcrtTypeMeaning'),
              },
              predictionDimensionCnf1 === 'QUANTITY'
                ? {
                  name: 'sumQiantity',
                  lock: 'left',
                  renderer: ({ text, value, record }) => (
                    <span
                      style={{
                        color:
                          !['feedbackQuantity', 'fcstQuantity'].includes(
                            record.get('fcrtType')
                          ) && value < 0
                            ? 'red'
                            : '#333',
                      }}
                    >
                      {text}
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
                      {text}
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
            const lockObj = { L: 'left', R: 'right', N: false };
            fields
              .filter(
                (ele) =>
                  ele.showFieldFlag === 1 &&
                  ![
                    'supplierId',
                    'supplierCode',
                    'supplierName',
                    'supplierTenantId',
                    'supplierCompanyId',
                    'supplierCompanyNum',
                    'supplierCompanyCode',
                    'supplierCompanyName',
                  ].includes(ele.fieldCode)
              )
              .forEach(({ fieldCode, width, supplierEditable, fixed }) => {
                // eslint-disable-next-line no-empty
                if (fieldCode === 'actionLine') {
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
                                handleVersion({
                                  historyCols,
                                  record,
                                  predictionDimensionCnf1,
                                  newShowLines,
                                });
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
                  fixedFields.push(...dynamicArr);
                } else if (fieldCode === 'fcrtType') {
                  fixedFields.push({
                    lock: lockObj[fixed] || false,
                    name: 'fcrtType',
                    width,
                    renderer: ({ record }) => record.get('fcrtTypeMeaning'),
                  });
                } else if (fieldCode === 'sumQiantity' && predictionDimensionCnf1 === 'QUANTITY') {
                  fixedFields.push({
                    name: 'sumQiantity',
                    lock: lockObj[fixed] || false,
                    renderer: ({ text, value }) => (
                      <span style={{ color: Number(value) < 0 ? 'red' : '#333' }}>{text}</span>
                    ),
                  });
                } else if (fieldCode === 'sumAmount' && predictionDimensionCnf1 !== 'QUANTITY') {
                  fixedFields.push({
                    name: 'sumAmount',
                    lock: lockObj[fixed] || false,
                    renderer: ({ text, value }) => (
                      <span style={{ color: Number(value) < 0 ? 'red' : '#333' }}>{text}</span>
                    ),
                  });
                } else if (supplierEditable === 1) {
                  fixedFields.push({
                    name: fieldCode,
                    lock: lockObj[fixed] || false,
                    editor: (record) =>
                      supplierEditable === 1 &&
                      record.get('fcrtType') === 'feedbackQuantity' &&
                      !['CLOSED', 'FEEDBACK_IN_APPROVAL', 'FEEDBACK_PEND_APPROVAL'].includes(
                        record.get('fcstStatus')
                      ) &&
                      ((record.get('fcstStatus') === 'FEEDBACK' &&
                        ['SUPPLIER', 'ALL'].includes(feedbackChangeCnf1)) ||
                        record.get('fcstStatus') !== 'FEEDBACK'),
                    renderer: ({ record, text }) => {
                      return (record.get('fcrtType') === baseLine && !supplierEditable) ||
                        (supplierEditable === 1 && record.get('fcrtType') === 'feedbackQuantity') ||
                        record.get('fcrtType') === 'fcstQuantity' ? (
                        <span>{text}</span>
                      ) : (
                        <span />
                      );
                    },
                  });
                } else if (fieldCode === 'syncStatus') {
                  fixedFields.push({
                    name: 'syncStatus',
                    width: 120,
                    lock: lockObj[fixed] || false,
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
                } else if (fieldCode === 'fcstStatus') {
                  fixedFields.push({
                    name: 'fcstStatus',
                    width,
                    headerStyle: { paddingLeft: 38 },
                    lock: lockObj[fixed] || false,
                    renderer: ({ record, text }) => {
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
                      if (['RELEASED', 'FEEDBACK', 'CLOSED'].includes(fcstStatus)) {
                        color = 'green';
                      }
                      return fieldCode === 'fcstStatus' &&
                        ['fcstQuantity'].includes(record.get('fcrtType')) ? (
                        // 新建,待发布,  已发布,已反馈 关闭
                        <span>
                          <Tag color={color} style={{ border: 'none' }}>
                            {fcstStatusMeaning}
                          </Tag>
                        </span>
                      ) : (
                        <RenderWhiteboard fcrtType={record.get('fcrtType')} text={text} />
                      );
                    },
                  });
                } else {
                  fixedFields.push({
                    name: fieldCode,
                    width,
                    lock: lockObj[fixed] || false,
                    editor: (record) =>
                      supplierEditable &&
                      needFeedback &&
                      record.get('fcrtType') === 'feedbackQuantity',
                    renderer: ({ record, text }) => {
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
                      if (['RELEASED', 'FEEDBACK', 'CLOSED'].includes(fcstStatus)) {
                        color = 'green';
                      }
                      return fieldCode === 'fcstStatus' &&
                        ['fcstQuantity'].includes(record.get('fcrtType')) ? (
                        // 新建,待发布,  已发布,已反馈 关闭
                        <span>
                          <Tag color={color} style={{ border: 'none' }}>
                            {fcstStatusMeaning}
                          </Tag>
                        </span>
                      ) : (
                        <RenderWhiteboard fcrtType={record.get('fcrtType')} text={text} />
                      );
                    },
                  });
                }
              });
            setState({
              cols: fixedFields.filter((ele) =>
                predictionDimensionCnf1 === 'QUANTITY'
                  ? ele.name !== 'sumAmount'
                  : ele.name !== 'sumQiantity'
              ),
            });
          }
        }
      );
    }
  };

  const RenderWhiteboard = observer((data) => {
    const { fcrtType, text } = data;
    return fcrtType === baseLine ? <span>{text || '-'}</span> : '-';
  });

  const handleVersion = (params) => {
    const newRes = [];
    const resultTableData = {}; // 获取动态week,day,year的值
    const { record, historyCols, newShowLines } = params;
    const fcstHeaderId = record.get('fcstHeaderId') || record.get('fcstHeaderIdMain');
    historyDs.setQueryParameter('fcstHeaderId', fcstHeaderId);
    historyDs.setQueryParameter('version', record.get('version'));
    historyDs.setQueryParameter('queryDate', queryDate);
    console.log(newShowLines);
    historyDs.query().then((result) => {
      result.forEach((item) => {
        const { fcstLineSumMap = {}, fcstLineVerList = [], changeFieldLineMap = {} } = item;
        const typeDef = tabNeedFeedback
          ? newShowLines
          : [
            {
              value: 'fcstQuantity',
              meaning:
                newShowLines.find((ele) => ele.value === 'fcstQuantity')?.meaning ||
                (predictionDimensionCnf === 'QUANTITY'
                  ? '预测数量'
                  : predictionDimensionCnf === 'AMOUNT_INCLUDING_TAX'
                    ? '预测金额（含税）'
                    : '预测金额（不含税）'),
              orderSeq: 10,
            },
          ];
        const othersLine = typeDef
          .filter(
            (ele) =>
              ![
                'fcstAmountIncTax',
                'feedbackAmountIncTax',
                'fcstAmountExcTax',
                'feedbackAmountExcTax',
              ].includes(ele.value)
          )
          .map(({ value: ele, meaning, description }) => {
            fcstLineVerList.forEach((i) => {
              const { fcstDate } = i;
              resultTableData[fcstDate] = i[ele];
              const changeLine = changeFieldLineMap[fcstDate];
              const changedKey = changeLine
                ? changeLine.find((e) => e.fieldName === ele)
                : undefined;

              if (changedKey && ['fcstQuantity', 'feedbackQuantity'].includes(ele)) {
                resultTableData[`${fcstDate}Color`] =
                  changedKey && ele !== 'diffQiantity'
                    ? String(changedKey.oldValue || 'null')
                    : null;
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
              forecastCategoryType: description,
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
        <div>
          <Table
            dataSet={historyDs}
            columns={historyCols}
            style={{ maxHeight: 'calc(100vh - 180px)' }}
          />
        </div>
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => { },
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  const lineDsResultMap = async (props = {}) => {
    const { params = {} } = props;
    // eslint-disable-next-line no-unused-expressions
    lineDs.queryDataSet.current
      ? lineDs.queryDataSet.current.set({
        ...params,
      })
      : lineDs.queryDataSet.loadData([
        {
          ...params,
        },
      ]);

    await lineDs.query().then(() => {
      setLoadings({});
    });
  };

  const onChangeField = ({ name, value, record }) => {
    if (name === 'queryDate') {
      setQueryDate(value?.fcstStartDate);
      handleChange(value);
    }
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

  // 查询数量
  const queryPurchaseCount = async (fcstStartDate) => {
    await queryTabCount({
      ...fcstStartDate,
      fcstFeedBackWorkbench: 1,
      templateHeaderId,
      onlyCountLimit: 100,
    }).then((res) => {
      setCountMap(res);
    });
  };

  const HeaderComp = () => {
    return (
      <div>
        <span style={{ fontSize: 16, fontWeight: 500 }}>
          {intl.get('sprm.forecastMgt.model.common.forecastSupplierWorkbench').d('预测反馈工作台')}
        </span>
        {/* {templateHeaderId && (
          <>
            <Divider type="vertical" />
            <Lov
              dataSet={initQueryDateDs}
              name="queryDate"
              placeholder={intl
                .get('sprm.forecastMgt.model.enterQueryDate')
                .d('请输入预测起始日期')}
              style={{ fontSize: '12px' }}
              onChange={handleChange}
              showValidation="tooltip"
              required
            />
          </>
        )} */}
      </div>
    );
  };

  const HeaderBtn = observer(({ currentDs }) => {
    console.log(3232233232, 'test')
    const { cuxHeadBtns } = remote?.props?.process || {};
    const { selected = [] } = currentDs;
    const feedBackBtnFlag = ['SUPPLIER', 'ALL'].includes(feedbackChangeCnf);
    const headerList = [
      {
        name: 'feedback',
        child: intl.get('sprm.common.button.frstFeedBack').d('反馈'),
        btnProps: {
          onClick: handleLineFeedback,
          type: 'c7n-pro',
          funcType: 'raised',
          icon: 'record_test',
          color: 'primary',
          wait: THROTTLE_TIME,
          loading: loadings.feedback || loadings.saveLoading,
          hidden:
            !tabNeedFeedback ||
            !(
              currentTab !== 'feedBack' ||
              (currentTab === 'feedBack' && ['SUPPLIER', 'ALL'].includes(feedbackChangeCnf))
            ),
          disabled:
            selected.length === 0 ||
            selected.some(
              (ele) =>
                ['CLOSED', 'FEEDBACK_IN_APPROVAL', 'FEEDBACK_PEND_APPROVAL'].includes(
                  ele.get('fcstStatus')
                ) ||
                (!feedBackBtnFlag && ele.get('fcstStatus') === 'FEEDBACK')
            ),
        },
      },
      {
        name: 'save',
        child: intl.get('hzero.common.save').d('保存'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'save',
          wait: THROTTLE_TIME,
          loading: loadings.feedback || loadings.saveLoading,
          funcType: 'flat',
          onClick: handleLineSave,
        },
      },
      {
        name: 'saveUpdate',
        child: intl.get('sprm.forecastWorkbench.button.saveUpdates').d('保存更新'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'save',
          wait: THROTTLE_TIME,
          hidden: !(
            ['all', 'feedBack'].includes(currentTab) &&
            ['ALL', 'SUPPLIER'].includes(feedbackChangeCnf)
          ),
          loading: loadings.feedback || loadings.saveLoading,
          funcType: 'flat',
          onClick: handleLineSave,
        },
      },
      {
        name: 'import',
        child: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
        // btnComp: Button,
        btnProps: {
          type: 'c7n-pro',
          icon: 'archive',
          wait: THROTTLE_TIME,
          funcType: 'flat',
          disabled: !templateHeaderId,
          onClick: handleImport,
        },
      },
      {
        name: 'batchExport',
        child:
          isArray(selected) && !isEmpty(selected)
            ? intl.get(`hzero.common.checkedExport`).d('勾选导出')
            : intl.get('hzero.common.button.export').d('导出'),
        // btnComp: Button,
        btnProps: {
          type: 'c7n-pro',
          icon: 'unarchive',
          wait: THROTTLE_TIME,
          disabled: !templateHeaderId || !queryDate,
          funcType: 'flat',
          onClick: handleExport,
        },
      },
    ];
    const processBtns = isFunction(cuxHeadBtns)
      ? cuxHeadBtns(headerList, {
        lineDs: currentDs,
        selected,
        currentTab,
      })
      : headerList;
    const newHeaderList = processBtns.filter((ele) => !ele?.btnProps?.hidden);
    return (
      <DynamicButtons
        buttons={newHeaderList}
        defaultBtnType="c7n-pro"
        maxNum={5}
        permissions={[
          {
            code: 'hzero.srm.requirement.forecast.supplier.workbench.ps.import',
            name: 'import',
          },
          {
            code: 'hzero.srm.requirement.forecast.supplier.workbench.ps.btn.save',
            name: 'saveUpdate',
          },
          {
            code: 'hzero.srm.requirement.forecast.supplier.workbench.ps.btn.save',
            name: 'save',
          },
          {
            code: 'hzero.srm.requirement.forecast.supplier.workbench.ps.btn.feedback',
            name: 'feedback', // 反馈
          },
          {
            code: 'hzero.srm.requirement.forecast.supplier.workbench.ps.export',
            name: 'expose', // 导出
          },
        ]}
      />
    );
  }, []);

  const handleImport = () => {
    if (detailFeedBackFlag === 1) {
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
          templateHeaderId,
        }),
        autoRefreshInterval: 5000,
        backPath: undefined,
        tenantId: organizationId, // 租户的传
        action: 'hzero.common.viewtitle.batchImport',
        key: `/sprm/forecast-workbench/data-import/${importTemplateCode}`,
      };
      Modal.open({
        key: Modal.key(),
        children: <SprmImport {...importProps} />,
        closable: false,
        movable: false,
        destroyOnClose: true,
        onCancel: () => { },
        style: { width: '1200px', marginTop: '-30px' },
        onOk: () => {
          lineDs.query();
        },
        footer: (okBtn) => <div>{okBtn}</div>,
      });
    } else {
      openTab({
        key: '/sprm/forecast-supplier-workbench/import',
        title: 'hzero.common.viewtitle.batchImport',
        search: queryString.stringify({
          backPath: `/sprm/forecast-supplier-workbench/list`,
          auto: true,
          templateHeaderId,
          templateCode,
        }),
      });
    }
  };

  const handleExport = () => {
    // 添加表单查询参数
    const params = [];
    setLoadings({ exportLoading: true });
    params.push({ name: 'exportType', value: 'DATA' });
    const requestUrl = `${SRM_SPRM}/v1/${organizationId}/fcst-headers/excel/export`;
    const method = 'POST';
    const fileName = '预测导出数据';
    let queryData = {};
    const fcstStatusCodeList = [];

    if (!tabNeedFeedback) {
      fcstStatusCodeList.push(
        'FEEDBACK',
        'RELEASED',
        'CHANGED',
        'CLOSED',
        'FEEDBACK_IN_APPROVAL',
        'FEEDBACK_PEND_APPROVAL',
        'FEEDBACK_REJECTED'
      );
    } else if (currentTab === 'released') {
      fcstStatusCodeList.push('RELEASED', 'FEEDBACK_REJECTED');
      queryData.controlExportLine = 1;
      queryData.fcstFeedBackWorkbench = 1;
    } else if (currentTab === 'feedBack') {
      fcstStatusCodeList.push('FEEDBACK', 'CHANGED');
    } else if (currentTab === 'all') {
      fcstStatusCodeList.push(
        'FEEDBACK',
        'RELEASED',
        'CHANGED',
        'CLOSED',
        'FEEDBACK_IN_APPROVAL',
        'FEEDBACK_PEND_APPROVAL',
        'FEEDBACK_REJECTED'
      );
    }

    if (isEmpty(lineDs.selected)) {
      const [
        { tabNeedFeedback: tabNeedFeedbacks, fcrtType, ...others },
      ] = lineDs?.queryDataSet?.toData() || [{}];
      others.fcstStatusCodeList = fcstStatusCodeList;
      queryData = {
        ...others,
        ...queryData,
        tempKey: undefined,
        supplierQueryParamStr: others.tempKey,
        exportFcstTypeLine: typeof fcrtType === 'string' ? fcrtType.split(',') : [],
        fcstStartDate: queryDate,
        templateHeaderId,
        customizeUnitCode: 'SPRM.FORECAST_SUPPLIER_WORKBENCH.SEARCHBAR',
      };
    } else {
      const [
        { tabNeedFeedback: tabNeedFeedbacks, fcrtType, ...others },
      ] = lineDs?.queryDataSet?.toData() || [{}];
      queryData = {
        ...queryData,
        tempKey: undefined,
        supplierQueryParamStr: others.tempKey,
        fcstStartDate: queryDate,
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
    initiateAsyncExport(
      {
        requestUrl,
        queryParams: params,
        method,
        queryData: {
          ...queryData,
          fcstHeaderIds: lineDs.selected?.map(
            (ele) => ele.get('fcstHeaderId') || ele.get('fcstHeaderIdMain')
          ),
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
    // }
  };

  // 反馈行
  const handleLineFeedback = () => {
    const { selected } = lineDs;
    setLoadings({ ...loadings, feedback: true });
    const updateLine = selected?.map((ele) => ele.toJSONData());
    Promise.all(
      selected?.map((i) => {
        // eslint-disable-next-line no-param-reassign
        i.status = 'update';
        return i.validate();
      })
    ).then((status) => {
      if (status[0] === true) {
        const updateLineArray = updateLine.map((item) => {
          // 更新
          const { fcstHeaderIdMain } = item;

          const record = lineDs.find((ele) => ele.get('fcstHeaderIdMain') === fcstHeaderIdMain);

          const itemFcstLineList = record?.parent
            ? record.parent?.get('fcstLineList').toJS()
            : item.fcstLineList;
          const fcstLineList = itemFcstLineList.map(({ fcstDate, ...ele }) => {
            return {
              ...ele,
              fcstDate,
              feedbackQuantity: item[fcstDate], // 反馈数量
            };
          });
          return {
            ...item,
            fcstStartDate: queryDate,
            fcstHeaderId: item.fcstHeaderId || item.fcstHeaderIdMain,
            fcstLineList,
          };
        });
        feedbackfrstLines(updateLineArray).then(async (res) => {
          if (res && !res.failed) {
            lineDs.unSelectAll();
            lineDs.clearCachedSelected();
            lineDsResultMap();
            notification.success();
          } else if (res && res.failed) {
            setLoadings({ ...loadings, feedback: false });
            notification.error({ message: res.message });
          } else {
            setLoadings({ ...loadings, feedback: false });
          }
        });
      } else {
        setLoadings({ ...loadings, feedback: false });
        notification.error({ message: '当前勾选行,有信息未维护' });
      }
    });
  };

  const resetQueryDs = () => {
    // eslint-disable-next-line no-unused-expressions
    lineDs.queryDataSet?.current?.reset();
  };

  const renderTabContent = () => {
    const commonProps = {
      virtual: true,
      virtualCell: true,
      virtualSpin: true,
      pagination: {
        pageSizeOptions: ['10', '20', '50', '100', '200', '500'],
      },
    };

    return (
      <>
        {isFunction(cuxRenderAlertInfo) ? cuxRenderAlertInfo() : null}
        {tabNeedFeedback === 1 ? (
          <Tabs
            keyboard={false}
            defaultActiveKey={currentTab}
            onChange={(value) => {
              const lineDsStatus = lineDs.toJSONData();
              if (lineDsStatus.length === 0) {
                setCurrentTab(value);
                lineDs.loadData();
                lineDs.unSelectAll();
                lineDs.clearCachedSelected();
                lineDs.setQueryParameter('currentTab', value || currentTab);
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
                    lineDs.loadData();
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
              tab={intl.get('sprm.forecastWorkbench.title.unFeedBack').d('待反馈')}
              key="released"
              disabled={!queryDate}
              count={countMap?.awaitFeedback}
            />
            <TabPane
              tab={intl.get('sprm.forecastWorkbench.title.feedBack').d('已反馈')}
              key="feedBack"
              disabled={!queryDate}
              count={countMap?.hasFeedback}
            />
            <TabPane
              tab={intl.get('sprm.forecastWorkbench.title.all').d('全部')}
              key="all"
              count={countMap?.all}
              disabled={!queryDate}
            />
          </Tabs>
        ) : null}
        <div
          style={{ height: 'calc(100vh - 252px)' }}
          key={`${templateHeaderId}-${defaultQueryDate?.fcstStartDate}`}
        >
          <SearchBarTable
            style={{ maxHeight: 'calc(100% - 22px)' }}
            searchCode="SPRM.FORECAST_SUPPLIER_WORKBENCH.SEARCHBAR"
            dataSet={lineDs}
            columns={cols}
            // cacheState
            cacheKey={`${templateHeaderId}-${defaultQueryDate?.fcstStartDate}`}
            selectionMode="rowbox"
            expandedRender
            defaultRowExpanded
            onRow={({ record }) => ({
              className: record.get('fcrtType') !== 'fcstQuantity' ? 'row-differ-color' : '',
            })}
            mode={tabNeedFeedback ? 'tree' : 'list'}
            queryFieldsLimit={3}
            className={styles['forecast-table']}
            searchBarConfig={{
              onQuery: lineDsResultMap,
              autoQuery: false,
              cacheKey: `${templateHeaderId}-${defaultQueryDate?.fcstStartDate}`,
              onClear: resetQueryDs,
              onReset: resetQueryDs,
              onFieldChange: onChangeField,
              fieldProps: {
                queryDate: {
                  lovPara: {
                    tenantId: organizationId,
                    templateHeaderId,
                  },
                  required: true,
                  defaultValue: defaultQueryDate,
                },
                tempKey: { lovPara: { tenantId: organizationId } },
              },
              editorProps: {
                fcstStatus: {
                  optionsFilter: (options) =>
                    [
                      'RELEASED',
                      'FEEDBACK',
                      'FEEDBACK_REJECTED',
                      'CLOSED',
                      'CHANGED',
                      'FEEDBACK_IN_APPROVAL',
                      'FEEDBACK_PEND_APPROVAL',
                    ].includes(options.get('value')),
                },
                queryDate: { clearButton: false },
              },
              left: {
                render: () => (
                  <MutlTextFieldSearch
                    name="itemNameAndCode"
                    dataSet={lineDs}
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
      </>
    );
  };

  return (
    <Fragment>
      <Header title={<HeaderComp />}>{<HeaderBtn currentDs={lineDs} />}</Header>
      <Content
        style={{
          padding: templateList.length > 1 ? 0 : '16px 16px 0 16px',
        }}
      >
        <Spin spinning={menuLoading}>
          {templateList.length > 1 ? (
            <Layout style={{ height: 'calc(100vh - 152px)' }}>
              <div className={styles['workbench-menu']}>
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
                                setTemplateHeaderId(item.templateHeaderId);
                                setTemplateCode(item.templateCode);
                                setNeedFeedback(item?.needFeedback);
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
                {renderTabContent()}
              </div>
            </Layout>
          ) : (
            renderTabContent()
          )}
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  connect(),
  cuxRemote(
    {
      code: 'SPRM_FOREBENCH_FEE_FUN_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      process: {
        cuxRenderAlertInfo: undefined,
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
    ],
  })
)(Index);
