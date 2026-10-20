/* eslint-disable no-param-reassign */
/**
 * 监控事件
 * @date: 2022-09-16
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useState, useEffect } from 'react';
import { DataSet, Tooltip, Modal, Table, Output } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import { SRM_DATA_SDAT } from '@/utils/config';
import StaticSearchBar from '@/components/StaticSearchBar';

import { getMsgByLovCode, getMonitorStuffData } from '@/services/monitorStuffService';
import { ReactExportButton } from './ReactExportButton';

import {
  eventsListDS,
  getDetailOneDS,
  getDetailTwoDS,
  getDetailThreeDS,
  getDetailFourDS,
  getDetailFiveDS,
  getDetailSixDS,
  getDetailSevenDS,
} from './store/MonitorStuffDS';
import { getQueryConfig } from './queryConfig';

import style from './index.less';

const { Column } = Table;

const tenantId = getCurrentOrganizationId();
const { id: userId } = getCurrentUser();

const passParams = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};

const exportRequestUrl = `${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/risk-events-export`;

const {
  options: { currentLocale, locales },
} = intl;
const intlMapObj = locales[`${currentLocale}`];

let currentModal = null; // 记录当前打开的窗口

const oneFormFieldArr = [
  'Name',
  'OperName',
  'Status',
  'EconKind',
  'RegistCapi',
  'Address',
  'CreditCode',
  'OrgNo',
  'No',
  'Scope',
]; // 详情一要渲染的表单字段
const fiveFormFieldArr = [
  'companyName',
  'findMatched',
  'operName',
  'benifitType',
  'position',
  'remark',
]; // 详情五要渲染的表单字段

function MonitorStuff(props = {}) {
  const {
    eventsListDs,
    detailOneDs,
    detailTwoDs,
    detailThreeDs,
    detailFourDs,
    detailFiveDs,
    detailSixDs,
    detailSevenDs,
  } = props.valueDs;

  const [codeMap, setCodeMap] = useState({});
  const [dimCodeMap, setDimCodeMap] = useState({}); // 维度的键值对，键为编码，值为含meaning和tag的对象
  const [options, setOptions] = useState([]); // 维度options
  const [barFilters, setBarFilters] = useState({});

  // 查询值集map
  useEffect(() => {
    // 维度编码的值集
    getMsgByLovCode({ code: 'SDAT.EVENT_DIMENSION_LEVEL_FOUR' }).then((res) => {
      const mapObj = {};
      (res || []).forEach((item) => {
        Object.assign(mapObj, { [item?.value]: { meaning: item?.meaning, tag: item?.tag } });
      });
      setCodeMap(mapObj);
    });
    // 查询维度编码数据
    getMsgByLovCode({ code: 'SDAT.EVENT_DETAIL_TYPE' }).then((res) => {
      const mapObj = {};
      (res || []).forEach((item) => {
        Object.assign(mapObj, { [item?.value]: { meaning: item?.meaning, tag: item?.tag } });
      });
      setDimCodeMap(mapObj);
    });
    // 获取维度编码树级数据
    getMonitorStuffData().then((res) => {
      const { dimensionList = [] } = res || {};
      const optionArr = formatOptions(dimensionList);
      setOptions(optionArr);
    });
  }, []);

  // 当options变化时，修改filters对象，保证表头的响应
  useEffect(() => {
    setBarFilters(getQueryConfig(false, options));
  }, [options]);

  // 退出本组件时关闭弹窗
  useEffect(() => {
    return () => {
      // eslint-disable-next-line no-unused-expressions
      currentModal?.close();
    };
  }, []);

  useEffect(() => {
    eventsListDs.query();
  }, [codeMap, options]);

  // 迭代处理树图数据
  const formatOptions = (data = []) => {
    const list = [].concat(data);

    const loopFormat = (dataArr = [], level) => {
      // eslint-disable-next-line no-unused-expressions
      (dataArr || [])?.forEach((item) => {
        const { dimensionCode = '', dimensionName = '', childList = undefined } = item || {};
        item.value =
          level === 1 ? `${dimensionCode}-${dimensionName}` : `${dimensionName}-${dimensionCode}`;
        item.meaning = dimensionName;
        // 针对第三层做特殊处理
        if (level === 2) {
          // 如果底下只有一个childList，且childList第一个元素的dimensionLevel是3
          if (childList && childList.length === 1 && childList[0].dimensionLevel === 3) {
            item.children = childList[0]?.childList;
            loopFormat(childList[0]?.childList, level + 1);
          } else if (childList && childList?.length !== 0) {
            item.children = childList;
            loopFormat(childList, level + 1);
          }
        } else {
          item.children = childList;
          if (childList && childList?.length !== 0) {
            // eslint-disable-next-line no-unused-expressions
            loopFormat(childList, level + 1);
          }
        }
      });
    };

    loopFormat(list, 1);

    return list;
  };

  const handleFilterQueryAll = ({ params }) => {
    // 处理一下时间
    const { publishDate_range: rangeTime = '' } = params;
    const [startDate = undefined, endDate = undefined] = rangeTime?.split(',') ?? [];
    eventsListDs.queryParameter = { ...params, startDate, endDate };
    eventsListDs.query();
  };

  const handleClear = () => {
    eventsListDs.queryParameter = {};
    eventsListDs.query();
  };

  const renderDimCode = ({ value }) => {
    return codeMap[value]?.meaning || '-';
  };

  const renderOverView = ({ value, record }) => {
    return (
      <a
        onClick={() => {
          handleModalOpen(record);
        }}
      >
        {value}
      </a>
    );
  };

  const renderLevel = ({ value, text }) => {
    const typeColorMap = { 0: 'dark', 1: 'green', 2: '#F2F3F5', 3: 'gold', 4: 'volcano', 5: 'red' };
    return (
      text && (
        <Tag
          color={typeColorMap[value]}
          style={{
            cursor: 'default',
            borderColor: 'transparent',
            // eslint-disable-next-line eqeqeq
            color: value == 2 && '#4E5769',
          }}
        >
          {text}
        </Tag>
      )
    );
  };

  const handleModalOpen = (record) => {
    // 先清空所有表格
    detailOneDs.loadData([]);
    detailTwoDs.loadData([]);
    detailThreeDs.loadData([]);
    detailFourDs.loadData([]);
    detailFiveDs.loadData([]);
    detailSixDs.loadData([]);
    detailSevenDs.loadData([]);
    // eslint-disable-next-line no-unused-expressions
    currentModal?.close();
    const { detail, enterpriseName, dimensionCode } = record.get([
      'dimensionCode',
      'detail',
      'enterpriseName',
    ]);
    currentModal = Modal.open({
      title: `${codeMap[dimensionCode]?.meaning ?? ''}${intl
        .get('sdat.monitorStuff.view.title.detail')
        .d('详情')}-${enterpriseName}`,
      drawer: true,
      mask: false,
      footer: (okBtn) => okBtn,
      okText: intl.get('sdat.monitorStuff.view.button.close').d('关闭'),
      children: renderTree({ detail, dimensionCode }),
      style: { width: '700px' },
    });
  };

  const renderTree = ({ detail = '{}', dimensionCode = '' }) => {
    const obj = JSON.parse(detail) || {};
    // 判断维度编码
    switch (codeMap[dimensionCode]?.tag) {
      case 'one':
        return renderOne(obj, dimensionCode);
      case 'two':
        return renderTwo(obj, dimensionCode);
      case 'three':
        return renderThree(obj, dimensionCode);
      case 'four':
        return renderFour(obj, dimensionCode);
      case 'five':
        return renderFive(obj, dimensionCode);
      case 'six':
        return renderSix(obj, dimensionCode);
      case 'seven':
        return renderSeven(obj, dimensionCode);
      default:
        return renderPenals(obj, dimensionCode);
    }
  };

  /**
   * renderPenals: 迭代生成节点
   * @param {*} obj
   * @param {*} intlPrompt
   * @returns
   */
  const renderPenals = (obj = {}, intlPrompt = '') => {
    if (!obj) return;
    // 先按照值的类型进行数据项的分离
    const keys = Object.keys(obj);
    const commonArr = [];
    const arrArr = [];
    keys.forEach((item) => {
      if (obj[item] instanceof Array) {
        arrArr.push({
          key: item,
          value: obj[item],
        });
      } else if (obj[item] instanceof Object) {
        arrArr.push({
          key: item,
          value: [obj[item]],
        });
      } else {
        commonArr.push({
          key: item,
          value: obj[item],
        });
      }
    });
    // 渲染当前obj下的普通字符项
    return (
      <>
        <div className={style['form-container']}>
          {commonArr.map((arrItem) => {
            // 先检查是否为id和keyNo
            if (/id/i.exec(arrItem?.key ?? '') || /keyno/i.exec(arrItem?.key ?? '')) return <></>;
            const titleIntl = intl
              .get(`sdat.monitorStuff.${intlPrompt}.${arrItem?.key ?? ''}`)
              .d(arrItem?.key ?? '');
            // 只有多语言存在的数据才能显示
            return (
              intlMapObj[`sdat.monitorStuff.${intlPrompt}.${arrItem?.key ?? ''}`] && (
                <div className={style['form-item']}>
                  <div className={style['item-title']}>{titleIntl}</div>
                  <div className={style['item-text']}>
                    <Tooltip
                      placement="topLeft"
                      title={renderValue(arrItem?.value ?? '-', intlPrompt || '')}
                    >
                      {renderValue(arrItem?.value ?? '-', intlPrompt || '')}
                    </Tooltip>
                  </div>
                </div>
              )
            );
          })}
        </div>
        {arrArr?.map((arrItem) => {
          if ((arrItem?.value ?? null) instanceof Array) {
            return (
              intlMapObj[`sdat.monitorStuff.${intlPrompt}.${arrItem?.key ?? ''}`] && (
                <>
                  <div className={style['second-level-title']}>
                    <span>
                      {intl
                        .get(`sdat.monitorStuff.${intlPrompt}.${arrItem?.key ?? ''}`)
                        .d(arrItem?.key ?? '')}
                    </span>
                  </div>
                  {arrItem?.value?.map((arrItemItem) => {
                    return renderPenals(arrItemItem ?? {}, `${intlPrompt}.${arrItem?.key ?? ''}`);
                  })}
                </>
              )
            );
          }
          return (
            intlMapObj[`sdat.monitorStuff.${intlPrompt}.${arrItem?.key ?? ''}`] && (
              <>
                <div className={style['second-level-title']}>
                  <span>
                    {intl
                      .get(`sdat.monitorStuff.${intlPrompt}.${arrItem?.key ?? ''}`)
                      .d(arrItem?.key ?? '')}
                  </span>
                </div>
                {renderPenals(arrItem?.value ?? {}, `${intlPrompt}.${arrItem?.key ?? ''}`)}
              </>
            )
          );
        })}
      </>
    );
  };

  /**
   * renderValue: 抽象一个渲染表单值的方法
   * @param {*} value
   * @returns
   */
  const renderValue = (value, dimensionCode) => {
    if (value === 'true') return intl.get('sdat.monitorStuff.view.item.yes').d('是');
    if (value === 'false') return intl.get('sdat.monitorStuff.view.item.no').d('否');
    if (!value) return '-';
    // eslint-disable-next-line eqeqeq
    if (dimensionCode === 'STOCKHOLDER' && value == '1') {
      return intl.get('sdat.monitorStuff.view.item.holdStock').d('持股');
    }
    // eslint-disable-next-line eqeqeq
    if (dimensionCode === 'STOCKHOLDER' && value == '0') {
      return intl.get('sdat.monitorStuff.view.item.amount').d('金额');
    }
    if (
      (dimensionCode === 'COMPLAINT.PartyList' ||
        dimensionCode === 'DEFENDANT.PartyList' ||
        dimensionCode === 'CASE_MAN.PartyList') &&
      // eslint-disable-next-line eqeqeq
      value == '1'
    ) {
      return intl.get('sdat.monitorStuff.view.item.accused').d('被告');
    }
    if (
      (dimensionCode === 'COMPLAINT.PartyList' ||
        dimensionCode === 'DEFENDANT.PartyList' ||
        dimensionCode === 'CASE_MAN.PartyList') &&
      // eslint-disable-next-line eqeqeq
      value == '2'
    ) {
      return intl.get('sdat.monitorStuff.view.item.accuser').d('原告');
    }
    if (
      (dimensionCode === 'COMPLAINT.PartyList' ||
        dimensionCode === 'DEFENDANT.PartyList' ||
        dimensionCode === 'CASE_MAN.PartyList') &&
      // eslint-disable-next-line eqeqeq
      value == '3'
    ) {
      return intl.get('sdat.monitorStuff.view.item.thirdParty').d('第三方人');
    }
    if (dimensionCode === 'BENEFICIARY_CHANGE') {
      return value === 'Y'
        ? intl.get('hzero.common.model.yes').d('是')
        : value === 'N'
        ? intl.get('hzero.common.model.no').d('否')
        : value;
    }
    return value;
  };

  /**
   * 生成第一种详情信息
   */
  const renderOne = (obj = {}, intlPrompt = '') => {
    detailOneDs.loadData([
      {
        beforeInfo: obj?.beforeInfo ?? '',
        afterInfo: obj?.afterInfo ?? '',
      },
    ]);
    return (
      <>
        <div className={style['form-container']}>
          {oneFormFieldArr.map((item) => {
            const titleIntl = intl
              .get(`sdat.monitorStuff.${intlPrompt}.${item ?? ''}`)
              .d(item ?? '');
            return (
              <div className={style['form-item']}>
                <div className={style['item-title']}>{titleIntl}</div>
                <div className={style['item-text']}>
                  <Tooltip
                    placement="topLeft"
                    title={renderValue(obj[item] ?? '-', intlPrompt || '')}
                  >
                    {renderValue(obj[item] ?? '-', intlPrompt || '')}
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>
        <div className={style['second-level-title']}>
          <span>
            {`${intl.get('sdat.monitorStuff.leveltitle.stuffDimension').d('事件维度')} :
            ${dimCodeMap[obj?.changeCode]?.meaning}`}
          </span>
        </div>
        <Table dataSet={detailOneDs} pagination={false} queryBar="none" autoFocus={false}>
          <Column name="beforeInfo" />
          <Column name="afterInfo" />
        </Table>
      </>
    );
  };

  /**
   * 生成第二种详情信息
   */
  const renderTwo = (obj = {}) => {
    detailTwoDs.loadData(obj?.stockList ?? []);
    return (
      <>
        <div className={style['second-level-title']}>
          <span>
            {`${intl.get('sdat.monitorStuff.leveltitle.stuffDimension').d('事件维度')} :
            ${dimCodeMap[obj?.changeCode]?.meaning}`}
          </span>
        </div>
        <Table dataSet={detailTwoDs} pagination={false} queryBar="none" autoFocus={false}>
          <Column name="StockName" />
          <Column
            name="StockPercent"
            renderer={({ record, text }) => {
              const { leftPercent, rightPercent } = record?.get(['leftPercent', 'rightPercent']);
              // 持股比例下降
              if (obj?.changeCode === 'STOCK_DOWN') {
                return (
                  <>
                    <Output value={leftPercent} style={{ color: 'red' }} />
                    {intl.get('sdat.monitorStuff.view.span.downTo').d('下降至')}
                    <Output value={rightPercent} style={{ color: 'red' }} />
                  </>
                );
              }
              // 持股比例上升
              if (obj?.changeCode === 'STOCK_UP') {
                return (
                  <>
                    <Output value={leftPercent} style={{ color: '#4fd2db' }} />
                    {intl.get('sdat.monitorStuff.view.span.upTo').d('上升至')}
                    <Output value={rightPercent} style={{ color: '#4fd2db' }} />
                  </>
                );
              }
              return text;
            }}
          />
          <Column
            name="HoldType"
            renderer={(value) =>
              // eslint-disable-next-line eqeqeq
              value == '1'
                ? intl.get('sdat.monitorStuff.view.item.holdStock').d('持股')
                : intl.get('sdat.monitorStuff.view.item.amount').d('金额')
            }
          />
          <Column name="Amount" />
        </Table>
      </>
    );
  };

  /**
   * 生成第三种详情信息
   */
  const renderThree = (obj = {}) => {
    detailThreeDs.loadData([
      {
        ...obj?.beforeInfo,
        type: intl.get('sdat.monitorStuff.SCOPE_OF_BUS.beforeInfo').d('变更前'),
      },
      {
        ...obj?.afterInfo,
        type: intl.get('sdat.monitorStuff.SCOPE_OF_BUS.afterInfo').d('变更后'),
      },
    ]);
    return (
      <>
        <div className={style['second-level-title']}>
          <span>
            {`${intl.get('sdat.monitorStuff.leveltitle.stuffDimension').d('事件维度')} :
            ${dimCodeMap[obj?.changeCode]?.meaning}`}
          </span>
        </div>
        <Table dataSet={detailThreeDs} pagination={false} queryBar="none" autoFocus={false}>
          <Column name="type" />
          <Column name="StockName" />
          <Column name="StockPercent" />
          <Column
            name="HoldType"
            renderer={(value) =>
              // eslint-disable-next-line eqeqeq
              value == '1'
                ? intl.get('sdat.monitorStuff.view.item.holdStock').d('持股')
                : intl.get('sdat.monitorStuff.view.item.amount').d('金额')
            }
          />
          <Column name="Amount" />
        </Table>
      </>
    );
  };

  /**
   * 生成第四种详情信息
   */
  const renderFour = (obj = {}) => {
    detailFourDs.loadData(obj?.stockList ?? []);
    return (
      <>
        <div className={style['second-level-title']}>
          <span>
            {`${intl.get('sdat.monitorStuff.leveltitle.stuffDimension').d('事件维度')} :
            ${dimCodeMap[obj?.changeCode]?.meaning}`}
          </span>
        </div>
        <Table dataSet={detailFourDs} pagination={false} queryBar="none" autoFocus={false}>
          <Column name="Name" />
          {(obj?.changeCode === 'EMPLOYEE_ADD' || obj?.changeCode === 'EMPLOYEE_REMOVE') && (
            <Column name="Job" />
          )}
          {obj?.changeCode === 'EMPLOYEE_CHANGE' && (
            <>
              <Column name="beforeInfo" />
              <Column name="afterInfo" />
            </>
          )}
        </Table>
      </>
    );
  };

  /**
   * 生成第五种详情信息
   */
  const renderFive = (obj = {}, intlPrompt = '') => {
    detailFiveDs.loadData(obj?.stockList ?? []);
    return (
      <>
        <div className={style['form-container']}>
          {fiveFormFieldArr.map((item) => {
            const titleIntl = intl
              .get(`sdat.monitorStuff.${intlPrompt}.${item ?? ''}`)
              .d(item ?? '');
            return (
              <div className={style['form-item']}>
                <div className={style['item-title']}>{titleIntl}</div>
                <div className={style['item-text']}>
                  <Tooltip
                    placement="topLeft"
                    title={renderValue((obj?.benefitCorp ?? [])[item] ?? '-', intlPrompt || '')}
                  >
                    {renderValue((obj?.benefitCorp ?? [])[item] ?? '-', intlPrompt || '')}
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>
        <div className={style['second-level-title']}>
          <span>
            {`${intl.get('sdat.monitorStuff.leveltitle.stuffDimension').d('事件维度')} :
            ${dimCodeMap[obj?.changeCode]?.meaning}`}
          </span>
        </div>
        <Table dataSet={detailFiveDs} pagination={false} queryBar="none" autoFocus={false}>
          {obj?.changeCode === 'BENEFIT_CHANGE' ? (
            <>
              <Column name="beforeName" />
              <Column name="afterName" />
            </>
          ) : (
            <>
              <Column name="name" />
              <Column name="benifitType" />
              <Column name="position" />
              <Column
                name="totalStockPercent"
                width={200}
                renderer={({ record, text }) => {
                  const { leftPercent, rightPercent } = record?.get([
                    'leftPercent',
                    'rightPercent',
                  ]);
                  // 工商信息/受益所有人减持
                  if (obj?.changeCode === 'BENEFIT_DOWN') {
                    return (
                      <>
                        <Output value={leftPercent} style={{ color: 'red' }} />
                        {intl.get('sdat.monitorStuff.view.span.downTo').d('下降至')}
                        <Output value={rightPercent} style={{ color: 'red' }} />
                      </>
                    );
                  }
                  // 工商信息/受益所有人增持
                  if (obj?.changeCode === 'BENEFIT_UP') {
                    return (
                      <>
                        <Output value={leftPercent} style={{ color: '#4fd2db' }} />
                        {intl.get('sdat.monitorStuff.view.span.upTo').d('上升至')}
                        <Output value={rightPercent} style={{ color: '#4fd2db' }} />
                      </>
                    );
                  }
                  return text;
                }}
              />
            </>
          )}
        </Table>
      </>
    );
  };

  /**
   * 生成第六种详情信息
   */
  const renderSix = (obj = {}) => {
    detailSixDs.loadData(obj?.stockList ?? []);
    return (
      <>
        <div className={style['second-level-title']}>
          <span>
            {`${intl.get('sdat.monitorStuff.leveltitle.stuffDimension').d('事件维度')} :
            ${dimCodeMap[obj?.changeCode]?.meaning}`}
          </span>
        </div>
        <Table dataSet={detailSixDs} pagination={false} queryBar="none" autoFocus={false}>
          <Column name="name" />
          <Column name="corpStatus" />
          <Column
            name="totalStockPercent"
            renderer={({ record, text }) => {
              const { leftPercent, rightPercent } = record?.get(['leftPercent', 'rightPercent']);
              // 工商信息/对外投资减持
              if (obj?.changeCode === 'INVEST_DOWN') {
                return (
                  <>
                    <Output value={leftPercent} style={{ color: 'red' }} />
                    {intl.get('sdat.monitorStuff.view.span.downTo').d('下降至')}
                    <Output value={rightPercent} style={{ color: 'red' }} />
                  </>
                );
              }
              // 工商信息/对外投资增持
              if (obj?.changeCode === 'INVEST_UP') {
                return (
                  <>
                    <Output value={leftPercent} style={{ color: '#4fd2db' }} />
                    {intl.get('sdat.monitorStuff.view.span.upTo').d('上升至')}
                    <Output value={rightPercent} style={{ color: '#4fd2db' }} />
                  </>
                );
              }
              return text;
            }}
          />
        </Table>
      </>
    );
  };

  /**
   * 生成第七种详情信息
   */
  const renderSeven = (obj = {}) => {
    detailSevenDs.loadData([
      {
        ...obj?.beforeInfo,
        type: intl.get('sdat.monitorStuff.SCOPE_OF_BUS.beforeInfo').d('变更前'),
      },
      {
        ...obj?.afterInfo,
        type: intl.get('sdat.monitorStuff.SCOPE_OF_BUS.afterInfo').d('变更后'),
      },
    ]);
    return (
      <>
        <div className={style['second-level-title']}>
          <span>
            {`${intl.get('sdat.monitorStuff.leveltitle.stuffDimension').d('事件维度')} :
            ${dimCodeMap[obj?.changeCode]?.meaning}`}
          </span>
        </div>
        <Table dataSet={detailSevenDs} pagination={false} queryBar="none" autoFocus={false}>
          <Column name="type" />
          <Column name="name" />
          <Column name="controlPercent" />
          <Column name="StockPercent" />
        </Table>
      </>
    );
  };

  return (
    <>
      <Header
        title={intl.get('sdat.monitorStuff.view.header.monitorStuff').d('监控事件')}
        backPath="/sdat/supplier-risk-monitor-org/list"
      >
        <ReactExportButton
          btnText={intl.get('sdat.monitorStuff.view.button.export').d('导出')}
          exportRequestUrl={exportRequestUrl}
          params={{ ...passParams }}
          ds={eventsListDs}
        />
      </Header>
      <Content>
        <StaticSearchBar
          key="monitor-org-bar"
          cacheState
          clearButton
          searchCode="SDAT.MONITOR_STUFF"
          filters={barFilters}
          dataSet={[eventsListDs]}
          onQuery={handleFilterQueryAll}
          onClear={handleClear}
          onReset={handleClear}
          showLoading={false}
          // fieldProps={fieldProps}
          defaultExpand={false}
        />
        <div className={style['table-box']}>
          <Table
            dataSet={eventsListDs}
            queryBar="none"
            border={false}
            autoHeight={{ type: 'maxHeight', diff: 40 }}
          >
            <Column name="enterpriseName" width={350} />
            <Column name="riskLevel" width={150} renderer={renderLevel} />
            <Column name="dimensionCode" width={150} renderer={renderDimCode} />
            <Column name="overview" renderer={renderOverView} />
            <Column name="publishDate" width={150} />
          </Table>
        </div>
      </Content>
    </>
  );
}

export default formatterCollections({
  code: ['sdat.monitorStuff'],
})(
  withProps(
    () => {
      const eventsListDs = new DataSet({ ...eventsListDS() });
      const detailOneDs = new DataSet({ ...getDetailOneDS() });
      const detailTwoDs = new DataSet({ ...getDetailTwoDS() });
      const detailThreeDs = new DataSet({ ...getDetailThreeDS() });
      const detailFourDs = new DataSet({ ...getDetailFourDS() });
      const detailFiveDs = new DataSet({ ...getDetailFiveDS() });
      const detailSixDs = new DataSet({ ...getDetailSixDS() });
      const detailSevenDs = new DataSet({ ...getDetailSevenDS() });
      const valueDs = {
        eventsListDs,
        detailOneDs,
        detailTwoDs,
        detailThreeDs,
        detailFourDs,
        detailFiveDs,
        detailSixDs,
        detailSevenDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(MonitorStuff)
);
