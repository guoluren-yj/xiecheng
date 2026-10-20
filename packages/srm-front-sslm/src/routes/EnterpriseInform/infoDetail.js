import React, { memo, useEffect, useCallback, Fragment, useRef, useState } from 'react';
import { Collapse, Spin, Row, Col, Table, Tabs, Icon, Form, Affix } from 'hzero-ui';
import intl from 'utils/intl';
import { getCurrentUser, getCurrentLanguage } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  compose,
  equals,
  isString,
  min,
  max,
  sum,
  isNumber,
  camelCase,
  flattenDeep,
  round,
  isEmpty,
  chunk,
} from 'lodash';
import UploadModal from 'srm-front-boot/lib/components/Upload/index';
import TransferLov from 'srm-front-cuz/lib/components/Customize/LovMulti/index';
import { dateRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';

import { formatInternationalTel } from '@/routes/components/utils';
import styles from '@/routes/index.less';
import { useSetState, getPlatformTabs } from './utils';
import Upload from './components/UploadModal';

const { Panel } = Collapse;
const FormItem = Form.Item;
const { TabPane } = Tabs;

const locale = getCurrentUser()?.language?.replace('_', '-');
const language = getCurrentLanguage();

const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

const fullItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

const getWidthFromWord = (
  word,
  minWidth = 80,
  maxWidth,
  defaultWidth = 100,
  fontWidth = 14,
  paddingWidth = 36
) => {
  let ret = defaultWidth;
  if (isString(word)) {
    ret = word.length * fontWidth;
    if (min) {
      ret = max([ret, minWidth]);
    }
    if (max) {
      ret = min([ret, maxWidth]);
    }
    ret += paddingWidth;
  }
  return ret + 16;
};

// Table表格配置表
const isTable = {
  sslmInvestgContact: true, // 联系人信息
  sslmInvestgAddress: true, // 地址信息
  sslmInvestgFin: true, // 近三年财务状况
  sslmInvestgFinBranch: true, // 分支机构
  sslmInvestgProservice: true, // 产品及服务
  sslmInvestgAuth: true, // 资质信息
  sslmInvestgBankAccount: true, // 开户行信息
  sslmInvestgCustomer: true, // 主要客户情况
  sslmInvestgSubSupplier: true, // 分供方情况
  sslmInvestgEquipment: true, // 设备信息
  sslmInvestgAttachment: true, // 附件信息
  sslmInvestgReserve1: true, // 预留表格页签1
  sslmInvestgReserve2: true, // 预留表格页签2
  sslmInvestgReserve5: true, // 预留表格页签3
  sslmInvestgReserve6: true, // 预留表格页签4
  sslmInvestgReserve7: true, // 预留表格页签5
  sslmInvestgReserve8: true, // 预留表格页签6
  sslmInvestgReserve9: true, // 预留表格页签7
};

// 调查表接口配置表
const urls = {
  sslmInvestgBasic: 'basics',
  sslmInvestgBusiness: 'business',
  sslmInvestgProservice: 'proservices',
  sslmInvestgFin: 'finances',
  sslmInvestgFinBranch: 'finances-branchs',
  sslmInvestgAuth: 'authes',
  sslmInvestgContact: 'contacts',
  sslmInvestgAddress: 'addresses',
  sslmInvestgBankAccount: 'bank-accounts',
  sslmInvestgCustomer: 'customers',
  sslmInvestgSubSupplier: 'sub-suppliers',
  sslmInvestgEquipment: 'equipments',
  sslmInvestgRd: 'rds',
  sslmInvestgProduce: 'produces',
  sslmInvestgQa: 'qas',
  sslmInvestgCustservice: 'custservices',
  sslmInvestgAttachment: 'attachments',
  sslmInvestgReserve1: 'reserve1',
  sslmInvestgReserve2: 'reserve2',
  sslmInvestgReserve3: 'reserve3',
  sslmInvestgReserve4: 'reserve4',
  sslmInvestgReserve5: 'reserve5',
  sslmInvestgReserve6: 'reserve6',
  sslmInvestgReserve7: 'reserve7',
  sslmInvestgReserve8: 'reserve8',
  sslmInvestgReserve9: 'reserve9',
  sslmInvestgReserve10: 'reserve10',
  sslmInvestgReserve11: 'reserve11',
  sslmInvestgReserve12: 'reserve12',
  sslmInvestgReserve13: 'reserve13',
  sslmInvestgReserve14: 'reserve14',
};

const Index = ({
  dispatch,
  changeReqId,
  companyId,
  partnerTenantId,
  source = '',
  changeLevel,
  detailHeader = {},
  ...rest
}) => {
  // tab切换配置表
  const isTab = {
    // sslmInvestgFin: {
    //   // 近三年财务状况
    //   configDescription: intl
    //     .get('sslm.enterpriseInform.view.model.sslmInvestgFin.title')
    //     .d('财务信息'),
    //   configName: 'caiwuxinxi',
    // },
    // sslmInvestgFinBranch: {
    //   // 分支机构
    //   configDescription: intl
    //     .get('sslm.enterpriseInform.view.model.sslmInvestgFinBranch.title')
    //     .d('财务信息'),
    //   configName: 'caiwuxinxi',
    // },
    // sslmInvestgContact: {
    //   // "联系人信息"
    //   configDescription: intl
    //     .get('sslm.enterpriseInform.view.model.sslmInvestgContact.title')
    //     .d('联系人及地址'),
    //   configName: 'lianxirenjidizhi',
    // },
    // sslmInvestgAddress: {
    //   // "地址信息"
    //   configDescription: intl
    //     .get('sslm.enterpriseInform.view.model.sslmInvestgAddress.title')
    //     .d('联系人及地址'),
    //   configName: 'lianxirenjidizhi',
    // },
    // sslmInvestgCustomer: {
    //   // "主要客户情况"
    //   configDescription: intl
    //     .get('sslm.enterpriseInform.view.model.sslmInvestgCustomer.title')
    //     .d('合作伙伴'),
    //   configName: 'hezuohuoban',
    // },
    // sslmInvestgSubSupplier: {
    //   // "分供方情况"
    //   configDescription: intl
    //     .get('sslm.enterpriseInform.view.model.sslmInvestgSub.title')
    //     .d('合作伙伴'),
    //   configName: 'hezuohuoban',
    // },
    // sslmInvestgRd: {
    //   // "研发能力"
    //   configDescription: intl
    //     .get('sslm.enterpriseInform.view.model.sslmInvestgProduce.title')
    //     .d('研发与生产'),
    //   configName: 'yanfayushengchan',
    // },
    // sslmInvestgProduce: {
    //   // "研发能力"
    //   configDescription: intl
    //     .get('sslm.enterpriseInform.view.model.sslmInvestgProduce.title')
    //     .d('研发与生产'),
    //   configName: 'yanfayushengchan',
    // },
    // sslmInvestgQa: {
    //   // "质保能力"
    //   configDescription: intl
    //     .get('sslm.enterpriseInform.view.model.sslmInvestgQa.title')
    //     .d('质保与售后'),
    //   configName: 'zhibaoyushouhou',
    // },
    // sslmInvestgCustservice: {
    //   // "售后服务"
    //   configDescription: intl
    //     .get('sslm.enterpriseInform.view.model.sslmInvestgCust.title')
    //     .d('质保与售后'),
    //   configName: 'zhibaoyushouhou',
    // },
  };

  const { hideConfigNames = [] } = detailHeader || {};
  const [state, setState] = useSetState({
    configList: [],
    configData: {},
    platform: [],
  });

  const { configList, configData, platform } = state;

  useEffect(() => {
    if (changeLevel && changeReqId && partnerTenantId) {
      // 非平台级才处理调查表
      if (changeLevel !== 'PLATFORM') {
        dispatch({
          type: 'enterpriseInform/queryInfoChangeApprovalDetail',
          payload: { changeReqId, partnerTenantId },
        }).then(res => {
          const {
            investigateConfigHeaders = [],
            investigateConfigLines = [],
            investigateConfigComponents = [],
          } = res || {};
          const configList_ = [];
          const configData_ = {};
          investigateConfigLines.forEach(item => {
            const { investgCfHeaderId } = item;
            if (configData_[investgCfHeaderId]) {
              configData_[investgCfHeaderId].push({
                ...item,
                fieldCode: camelCase(item.fieldCode),
                props: [],
              });
            } else {
              configData_[investgCfHeaderId] = [
                { ...item, fieldCode: camelCase(item.fieldCode), props: [] },
              ];
            }
          });
          investigateConfigHeaders.forEach(item => {
            const { configName } = item;
            if (isTab[configName]) {
              const index = configList_.findIndex(
                value => value.tab && value.configName === isTab[item.configName].configName
              );
              if (index >= 0) {
                configList_[index].tablist.push(item);
              } else {
                configList_.push({
                  tablist: [item],
                  tab: true,
                  investgCfHeaderId: item.investgCfHeaderId,
                  ...isTab[configName],
                });
              }
            } else {
              configList_.push(item);
            }
          });
          investigateConfigComponents.forEach(item => {
            const { investgCfHeaderId, investgCfLineId } = item;
            if (configData_[investgCfHeaderId]) {
              configData_[investgCfHeaderId].forEach(n => {
                if (n.investgCfLineId === investgCfLineId) {
                  n.props.push(item);
                }
              });
            }
          });
          // 展示菜单处理
          const configName = investigateConfigHeaders.map(n => n.configName);
          const platform_ = getPlatformTabs({ changeLevel, configName, source, hideConfigNames });
          setState({
            configList: configList_,
            configData: configData_,
            platform: platform_,
          });
        });
      } else {
        const platform_ = getPlatformTabs({ changeLevel, source, hideConfigNames });
        setState({
          platform: platform_,
        });
      }
    }
  }, [changeLevel, changeReqId, partnerTenantId, JSON.stringify(hideConfigNames)]);

  const queryInvestigate = useCallback(
    url =>
      dispatch({
        type: 'enterpriseInform/queryInvestigate',
        payload: {
          partnerTenantId,
          changeReqId,
          url,
          desensitize: false,
        },
      }),
    [changeReqId]
  );

  const queryPlatformInfo = useCallback(
    (url, isPlatform, code, desensitize) =>
      dispatch({
        type: 'enterpriseInform/queryPlatformInfo',
        payload: {
          partnerTenantId,
          changeReqId,
          companyId,
          url,
          isPlatform,
          dataSource: 1, // 1企业信息变更 2供应商信息变更
          customizeUnitCode: code,
          customizeTenantId: partnerTenantId,
          desensitize,
        },
      }),
    [changeReqId, companyId]
  );

  const getAffixTarget = () => {
    switch (source) {
      case 'enterpriseCompare': // 企业信息变更明细对比
        return document.getElementsByClassName('enterpriseCompare')[0];
      case 'enterpriseApprove': // 平台级审批
        return document.getElementsByClassName('enterpriseApprove')[0];
      case 'enterpriseConfirm': // 租户级审批
        return document.getElementsByClassName('enterpriseConfirm')[0];
      default:
        return document.body;
    }
  };

  return (
    <Fragment>
      <Affix target={getAffixTarget}>
        <Row style={{ backgroundColor: '#fff', lineHeight: '44px' }}>
          <Col span={12}>
            <h3 style={{ marginLeft: 16 }}>
              {intl.get('sslm.enterpriseInform.view.title.beforeChange').d('变更前')}
            </h3>
          </Col>
          <Col span={12}>
            <h3 style={{ marginLeft: 22 }}>
              {intl.get('sslm.enterpriseInform.view.title.afterChange').d('变更后')}
            </h3>
          </Col>
        </Row>
      </Affix>
      <div style={{ display: 'flex' }}>
        <ScrollArea
          configList={configList}
          queryInvestigate={queryInvestigate}
          queryPlatformInfo={queryPlatformInfo}
          configData={configData}
          platform={platform}
          changeLevel={changeLevel}
          source={source}
          changeReqId={changeReqId}
          {...rest}
        />
      </div>
    </Fragment>
  );
};

export default compose(
  formatterCollections({ code: ['sslm.enterpriseInform', 'spfm.enterprise', 'spfm.bank'] }),
  Form.create({ fieldNameProp: null })
)(Index);

const ScrollArea = memo(
  ({
    configList = [],
    queryInvestigate,
    queryPlatformInfo,
    configData,
    platform = [],
    changeReqId,
    ...rest
  }) => {
    const [width, setWidth] = useState(0);
    const self = useRef(null);
    const [collapsed, setCollapsed] = useState([]);
    useEffect(() => {
      setWidth(self.current.clientWidth);
    }, []);

    return (
      <div ref={self} style={{ flex: 1 }}>
        {platform
          .filter(({ only }) => only)
          .map(item => (
            <PlatformCollapse
              {...item}
              width={width}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              queryPlatformInfo={queryPlatformInfo}
              key={item.configName}
              changeReqId={changeReqId}
              {...rest}
            />
          ))}
        {configList.map(item => (
          <RowCollapse
            {...item}
            width={width}
            queryInvestigate={queryInvestigate}
            configData={configData}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            changeReqId={changeReqId}
          />
        ))}
      </div>
    );
  },
  equals
);

// 处理调查表配置属性
const getComponentProps = (props = []) => {
  const allProps = {};
  props.forEach(prop => {
    const dealProp = prop.attributeValue;
    if (dealProp !== undefined) {
      allProps[prop.attributeName] = dealProp;
    }
  });
  return allProps;
};

const ColCollapse = ({
  loading,
  oldData,
  newData,
  investgCfHeaderId,
  configDescription,
  configName,
  tab = false,
  configData = {},
  tablist = [],
  collapsed,
  setCollapsed,
}) => {
  const data = oldData || newData || [];
  let isChangeFlag = false;
  if (tab) {
    for (let o = 0; o < tablist.length; o += 1) {
      const displayKeys = (configData[tablist[o].investgCfHeaderId] || []).map(i => i.fieldCode);
      const flagData = flattenDeep(data[o]);
      if (
        !!flagData.find(
          (da = {}) =>
            displayKeys.filter(item => da[`${item}StateFlag`] !== 'original').length > 0 ||
            da.internationalTelCodeStateFlag === 'update'
        ) ||
        false
      ) {
        isChangeFlag = true;
        break;
      }
    }
  } else {
    const flagData = flattenDeep(data);
    const displayKeys = (configData[investgCfHeaderId] || []).map(i => i.fieldCode);
    isChangeFlag =
      !!flagData.find(
        (da = {}) =>
          displayKeys.filter(item => da[`${item}StateFlag`] !== 'original').length > 0 ||
          da.internationalTelCodeStateFlag === 'update'
      ) || false;
  }

  useEffect(() => {
    if (isChangeFlag) {
      setCollapsed(prevState => [...prevState, configName]);
    }
  }, [isChangeFlag]);

  return (
    !loading && (
      <div style={{ flex: 1, overflow: 'scroll' }} className="ued-detail-wrapper">
        <Collapse
          className="form-collapse"
          onChange={key => setCollapsed(key)}
          activeKey={collapsed}
        >
          <Panel
            key={configName}
            id={configName}
            header={
              <Fragment>
                <h3>{configDescription}</h3>
                <a>
                  {collapsed.includes(configName)
                    ? intl.get('hzero.common.button.up').d('收起')
                    : intl.get('hzero.common.button.expand').d('展开')}
                  {<Icon type={collapsed.includes(configName) ? 'up' : 'down'} />}
                </a>
              </Fragment>
            }
            showArrow={false}
          >
            <Spin spinning={loading}>
              {tab ? (
                <Tabs animated={false}>
                  {tablist.map((value, i) => {
                    let com = null;
                    if (isTable[value.configName]) {
                      const columns = (configData[value.investgCfHeaderId] || []).map(
                        ({ fieldDescription, fieldCode, componentType, ...other }) => {
                          const componentProps = getComponentProps(other.props);
                          return {
                            title: fieldDescription,
                            dataIndex: fieldCode,
                            width: componentProps.mobilephoneFlag
                              ? 250
                              : getWidthFromWord(fieldDescription),
                            onCell: () => {
                              return {
                                style: {
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                },
                                onClick: e => {
                                  const { target } = e;
                                  if (target.style.whiteSpace === 'normal') {
                                    target.style.whiteSpace = 'nowrap';
                                  } else {
                                    target.style.whiteSpace = 'normal';
                                  }
                                },
                              };
                            },
                            render: (val, record) => {
                              let newValue = val;
                              if (
                                value.configName === 'sslmInvestgFin' &&
                                (fieldCode === 'totalAssets' ||
                                  fieldCode === 'totalLiabilities' ||
                                  fieldCode === 'currentAssets' ||
                                  fieldCode === 'currentLiabilities' ||
                                  fieldCode === 'revenue' ||
                                  fieldCode === 'netProfit')
                              ) {
                                newValue =
                                  language === 'en_US' ? (val ? round(val / 100, 4) : val) : val;
                              }
                              return (
                                <div
                                  className={
                                    record.firmChangeBeanStateFlag === 'insert' ||
                                    (componentProps.mobilephoneFlag &&
                                      record.internationalTelCodeStateFlag !== 'original') ||
                                    record[`${fieldCode}StateFlag`] !== 'original'
                                      ? styles['sslm-compare-info-style']
                                      : ''
                                  }
                                >
                                  {componentType === 'InputNumber' && componentProps.allowThousandth
                                    ? newValue &&
                                      parseFloat(newValue).toLocaleString(locale, {
                                        maximumFractionDigits: componentProps.precision || 4,
                                      })
                                    : componentProps.mobilephoneFlag
                                    ? formatInternationalTel(record.internationalTelMeaning, val)
                                    : componentType_[componentType]
                                    ? componentType_[componentType](
                                        val,
                                        fieldCode,
                                        record,
                                        other,
                                        componentProps
                                      )
                                    : val}
                                </div>
                              );
                            },
                          };
                        }
                      );
                      const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0)));
                      com = (
                        <Table
                          style={{ margin: '0px' }}
                          dataSource={data[i]}
                          columns={columns}
                          bordered
                          pagination={false}
                          scroll={{ x: scrollX }}
                        />
                      );
                    } else {
                      const data_ = (data[i] && data[i][0]) || {};
                      com = (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                          }}
                        >
                          {(configData[value.investgCfHeaderId] || []).map(
                            ({ fieldDescription, fieldCode, componentType, ...other }) => (
                              <Row
                                style={{
                                  width: '48%',
                                  maxWidth: '48%',
                                  minWidth: '48%',
                                  marginBottom: '16px',
                                }}
                              >
                                <Col span={14}>{fieldDescription}:</Col>
                                <Col
                                  span={10}
                                  style={{
                                    color:
                                      // newData &&
                                      data_[`${fieldCode}StateFlag`] !== 'original' && 'red',
                                    wordWrap: 'break-word',
                                  }}
                                >
                                  {componentType_[componentType]
                                    ? componentType_[componentType](
                                        data_[fieldCode],
                                        fieldCode,
                                        data_,
                                        other
                                      )
                                    : data_[fieldCode]}
                                </Col>
                              </Row>
                            )
                          )}
                        </div>
                      );
                    }
                    return (
                      <TabPane tab={value.configDescription} key={value.investgCfHeaderId}>
                        {com}
                      </TabPane>
                    );
                  })}
                </Tabs>
              ) : isTable[configName] ? (
                (() => {
                  const columns =
                    isTable[configName] &&
                    (configData[investgCfHeaderId] || []).map(
                      ({ fieldDescription, fieldCode, componentType, ...other }) => {
                        const componentProps = getComponentProps(other.props);
                        return {
                          title: fieldDescription,
                          dataIndex: fieldCode,
                          width: componentProps.mobilephoneFlag
                            ? 250
                            : getWidthFromWord(fieldDescription),
                          onCell: () => {
                            return {
                              style: {
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              },
                              onClick: e => {
                                const { target } = e;
                                if (target.style.whiteSpace === 'normal') {
                                  target.style.whiteSpace = 'nowrap';
                                } else {
                                  target.style.whiteSpace = 'normal';
                                }
                              },
                            };
                          },
                          render: (val, record) => {
                            let newValue = val;
                            if (
                              configName === 'sslmInvestgFin' &&
                              (fieldCode === 'totalAssets' ||
                                fieldCode === 'totalLiabilities' ||
                                fieldCode === 'currentAssets' ||
                                fieldCode === 'currentLiabilities' ||
                                fieldCode === 'revenue' ||
                                fieldCode === 'netProfit')
                            ) {
                              newValue =
                                language === 'en_US' ? (val ? round(val / 100, 4) : val) : val;
                            }
                            return (
                              <div
                                className={
                                  record.firmChangeBeanStateFlag === 'insert' ||
                                  (componentProps.mobilephoneFlag &&
                                    record.internationalTelCodeStateFlag !== 'original') ||
                                  record[`${fieldCode}StateFlag`] !== 'original'
                                    ? styles['sslm-compare-info-style']
                                    : ''
                                }
                              >
                                {componentType === 'InputNumber' && componentProps.allowThousandth
                                  ? newValue &&
                                    parseFloat(newValue).toLocaleString(locale, {
                                      maximumFractionDigits: componentProps.precision || 4,
                                    })
                                  : componentProps.mobilephoneFlag
                                  ? formatInternationalTel(record.internationalTelMeaning, val)
                                  : configName === 'sslmInvestgAddress' && fieldCode === 'regionId'
                                  ? record.regionPathName
                                  : ['attachmentType', 'authenticationType'].includes(fieldCode)
                                  ? record[`${fieldCode}Meaning`] || val
                                  : componentType_[componentType]
                                  ? componentType_[componentType](
                                      val,
                                      fieldCode,
                                      record,
                                      other,
                                      componentProps
                                    )
                                  : val}
                              </div>
                            );
                          },
                        };
                      }
                    );
                  const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0)));
                  return (
                    <Table
                      style={{ margin: '0px' }}
                      dataSource={data}
                      columns={columns}
                      bordered
                      pagination={false}
                      scroll={{ x: scrollX }}
                    />
                  );
                })()
              ) : (
                (() => {
                  const data_ = data[0] || {};
                  return (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                      }}
                    >
                      {(configData[investgCfHeaderId] || []).map(
                        ({ fieldDescription, fieldCode, componentType, ...other }) => {
                          let newFieldValue = data_[fieldCode];
                          if (
                            configName === 'sslmInvestgBasic' &&
                            fieldCode === 'registeredCapital'
                          ) {
                            const formatValue =
                              language === 'en_US'
                                ? newFieldValue
                                  ? round(newFieldValue / 100, 8)
                                  : newFieldValue
                                : newFieldValue;
                            newFieldValue =
                              formatValue &&
                              parseFloat(formatValue).toLocaleString(locale, {
                                maximumFractionDigits: 8,
                              });
                          }
                          return (
                            <Row
                              style={{
                                width: '48%',
                                maxWidth: '48%',
                                minWidth: '48%',
                                marginBottom: '16px',
                              }}
                            >
                              <Col
                                span={12}
                                title={fieldDescription}
                                style={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {fieldDescription}:
                              </Col>
                              <Col
                                span={12}
                                style={{
                                  color:
                                    // newData &&
                                    data_[`${fieldCode}StateFlag`] !== 'original' && 'red',
                                  wordWrap: 'break-word',
                                }}
                              >
                                {componentType_[componentType]
                                  ? componentType_[componentType](
                                      data_[fieldCode],
                                      fieldCode,
                                      data_,
                                      other
                                    )
                                  : newFieldValue}
                              </Col>
                            </Row>
                          );
                        }
                      )}
                    </div>
                  );
                })()
              )}
            </Spin>
          </Panel>
        </Collapse>
      </div>
    )
  );
};

const PlatformColCollapse = ({
  source,
  loading,
  oldData,
  newData,
  configDescription,
  configName,
  tablist = [],
  isTables = false,
  custLoading = false,
  customizeTable,
  customizeForm,
  code,
  form,
  form: { getFieldDecorator },
  collapseCodeList = [],
  collapseCode = '',
  changeLevel,
  activeCollapseList = [],
  collapsed,
  setCollapsed,
}) => {
  const data = newData || oldData || (isTables ? [] : {});
  const isChangeFlag = isTables
    ? !!data.find((da = {}) =>
        tablist.some(
          item =>
            da[`${item.fieldCode}Flag`] === 'UPDATE' ||
            da.internationalTelCodeFlag === 'UPDATE' ||
            ['CREATE', 'DELETE', 'UPDATE'].includes(da.objectFlag)
        )
      )
    : tablist.some(
        item =>
          data[`${item.fieldCode}Flag`] === 'UPDATE' ||
          data.internationalTelCodeFlag === 'UPDATE' || // 国别码
          data.serviceAreaFlag === 'UPDATE' || // 送货服务范围
          data.saleFlagFlag === 'UPDATE' || // 主要身份-销售
          data.purchaseFlagFlag === 'UPDATE' || // 主要身份-采购
          data.industryCategoryFlag === 'UPDATE' || // 主营品类
          data.industryFlag === 'UPDATE' || // 行业类型
          data.manufacturerFlagFlag === 'UPDATE' || // 制造商
          data.traderFlagFlag === 'UPDATE' || // 贸易商
          data.servicerFlagFlag === 'UPDATE' || // 服务商
          data.agentFlagFlag === 'UPDATE' || // 代理商
          data.integrationFlagFlag === 'UPDATE' || // 集成商
          data.contractorFlagFlag === 'UPDATE' || // 承包商
          data.dealerFlagFlag === 'UPDATE' || // 经销商
          data.registeredRegionIdFlag === 'UPDATE'
      );

  let finallyList = [];
  if (configName === 'registInform_platform') {
    const { domesticForeignRelation, idType, certificationType } = data;
    if (domesticForeignRelation !== 2) {
      // 境内境外
      finallyList = tablist.filter(n => {
        if (certificationType && n.fieldCode === 'domesticForeignRelation') {
          return false;
        }
        if (
          !certificationType &&
          ['certificationType', 'certificationRegionId'].includes(n.fieldCode)
        ) {
          return false;
        }
        return (
          n.domesticForeignRelation === domesticForeignRelation ||
          n.domesticForeignRelation === 'all'
        );
      });
    } else {
      // 个人
      finallyList = tablist
        .filter(n => n.domesticForeignRelation === domesticForeignRelation)
        .map(n => ({
          ...n,
          fieldDescription:
            n.fieldCode === 'idNum'
              ? idType === 'I'
                ? intl.get('sslm.enterpriseInform.model.personal.idNum').d('身份证号')
                : intl.get('sslm.enterpriseInform.model.personal.passport').d('护照号/通行证号')
              : n.fieldDescription,
          fieldCode:
            n.fieldCode === 'idNum' ? (idType === 'I' ? 'idNum' : 'passport') : n.fieldCode,
        }));
    }
  } else {
    finallyList = tablist;
  }

  const chunkList = chunk(finallyList, 2);
  const renderForm = useCallback(() => {
    return (
      <Form className={styles['wrap-from']} custLoading={custLoading}>
        {!isEmpty(chunkList) &&
          chunkList.map(list => {
            return (
              <Row gutter={48} className={styles['wrap-from-row']}>
                {list.map(item => {
                  const { fieldDescription, fieldCode, render } = item;
                  // 整行展示
                  const isFull = [
                    'businessScope',
                    'description',
                    'interBusinessShield',
                    'addressDetail',
                  ].includes(fieldCode);
                  const itemLayout = isFull ? fullItemLayout : formItemLayout;
                  return (
                    <Col span={isFull ? 24 : 12}>
                      <FormItem {...itemLayout} label={fieldDescription}>
                        {getFieldDecorator(fieldCode, {
                          initialValue: data[fieldCode],
                        })(
                          <span style={{ color: data[`${fieldCode}Flag`] === 'UPDATE' && 'red' }}>
                            {render ? render(data[fieldCode], data || {}) : data[fieldCode]}
                          </span>
                        )}
                      </FormItem>
                    </Col>
                  );
                })}
              </Row>
            );
          })}
      </Form>
    );
  }, [chunkList]);

  // 有折叠栏个性化，并且显示
  const isCollapsedCust = isEmpty(collapseCodeList)
    ? true
    : collapseCodeList.includes(collapseCode);
  let newIsChangeFlag = isChangeFlag;
  if (!isEmpty(activeCollapseList)) {
    const custConfig = activeCollapseList.find(item => item.configName === collapseCode);
    newIsChangeFlag = custConfig ? custConfig.activeFlag : isChangeFlag;
  }

  useEffect(() => {
    if (newIsChangeFlag) {
      setCollapsed(prevState => [...prevState, configName]);
    }
  }, [newIsChangeFlag]);

  return (
    !loading &&
    isCollapsedCust && (
      <div style={{ flex: 1, overflow: 'scroll' }} className="ued-detail-wrapper">
        <Collapse
          className="form-collapse"
          onChange={key => setCollapsed(key)}
          activeKey={collapsed}
        >
          <Panel
            key={configName}
            id={configName}
            header={
              <Fragment>
                <h3>{configDescription}</h3>
                <a>
                  {collapsed.includes(configName)
                    ? intl.get('hzero.common.button.up').d('收起')
                    : intl.get('hzero.common.button.expand').d('展开')}
                  {<Icon type={collapsed.includes(configName) ? 'up' : 'down'} />}
                </a>
              </Fragment>
            }
            showArrow={false}
          >
            <Spin spinning={loading}>
              {isTables
                ? (() => {
                    const columns = tablist.map(
                      ({ fieldDescription, fieldCode, width, render }) => ({
                        title: fieldDescription,
                        dataIndex: fieldCode,
                        width,
                        onCell: () => {
                          return {
                            style: {
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            },
                            onClick: e => {
                              const { target } = e;
                              if (target.style.whiteSpace === 'normal') {
                                target.style.whiteSpace = 'nowrap';
                              } else {
                                target.style.whiteSpace = 'normal';
                              }
                            },
                          };
                        },
                        render: (val, record) => (
                          <div
                            className={
                              ['CREATE', 'DELETE'].includes(record.objectFlag) ||
                              record[`${fieldCode}Flag`] === 'UPDATE'
                                ? styles['sslm-compare-info-style']
                                : ''
                            }
                          >
                            {render ? render(val, record || {}) : val}
                          </div>
                        ),
                      })
                    );
                    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));
                    return customizeTable ? (
                      customizeTable(
                        {
                          code,
                        },
                        <Table
                          bordered
                          style={{ margin: '0px' }}
                          dataSource={data}
                          columns={columns}
                          pagination={false}
                          custLoading={custLoading}
                          scroll={{ x: scrollX }}
                        />
                      )
                    ) : (
                      <Table
                        bordered
                        style={{ margin: '0px' }}
                        dataSource={data}
                        columns={columns}
                        pagination={false}
                        custLoading={custLoading}
                        scroll={{ x: scrollX }}
                      />
                    );
                  })()
                : (() =>
                    customizeForm
                      ? customizeForm(
                          {
                            code:
                              configName === 'registInform_platform' &&
                              data.domesticForeignRelation === 2
                                ? changeLevel !== 'PLATFORM'
                                  ? source === 'enterpriseConfirm'
                                    ? 'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.REGISTRATION_PERSONAL'
                                    : 'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.REGISTRATION_PERSONAL'
                                  : ''
                                : code,
                            form,
                            dataSource: data,
                            readOnly: true,
                          },
                          renderForm()
                        )
                      : renderForm())()}
            </Spin>
          </Panel>
        </Collapse>
      </div>
    )
  );
};

const RowCollapse = ({
  width,
  queryInvestigate,
  configName,
  configDescription,
  tab = false,
  tablist = [],
  collapsed,
  setCollapsed,
  changeReqId,
  ...rest
}) => {
  const [state, setState] = useSetState({
    loading: true,
    oldData: null,
    newData: null,
  });

  const { loading, oldData, newData } = state;

  useEffect(() => {
    if (urls[configName]) {
      queryInvestigate(urls[configName]).then(res => {
        if (res) {
          setState({
            loading: false,
            oldData: res[0] || [],
            newData: res[1] || [],
          });
        }
      });
    } else {
      Promise.all(tablist.map(item => queryInvestigate(urls[item.configName]))).then(res => {
        if (res) {
          setState({
            loading: false,
            oldData: [(res[0] && res[0][0]) || [], (res[1] && res[1][0]) || []],
            newData: [(res[0] && res[0][1]) || [], (res[1] && res[1][1]) || []],
          });
        }
      });
    }
  }, [changeReqId]);

  return (
    <div
      id={configDescription}
      key={configName}
      style={{ marginTop: '10px', display: 'flex', width: `${width}px` }}
    >
      <ColCollapse
        {...{
          loading,
          oldData,
          configName,
          configDescription,
          tab,
          tablist,
          collapsed,
          setCollapsed,
          ...rest,
        }}
      />
      <div style={{ width: '10px' }} />
      <ColCollapse
        {...{
          loading,
          newData,
          configName,
          configDescription,
          tab,
          tablist,
          collapsed,
          setCollapsed,
          ...rest,
        }}
      />
    </div>
  );
};

const PlatformCollapse = ({
  width,
  newKey,
  oldKey,
  queryPlatformInfo,
  configName,
  url,
  isPlatform = false,
  configDescription,
  tab = false,
  changeLevel,
  source,
  collapsed,
  setCollapsed,
  changeReqId,
  ...rest
}) => {
  const [state, setState] = useSetState({
    loading: true,
    oldData: null,
    newData: null,
  });

  const { loading, oldData, newData } = state;

  let code = '';
  const desensitize = false;
  if (changeLevel !== 'PLATFORM') {
    // 平台级无个性化
    switch (source) {
      case 'enterpriseCompare': // 企业信息变更 --- 明细对比
        switch (configName) {
          case 'bankInform_platform': // 银行信息
            code = 'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.BANK_INFO';
            break;
          case 'invoiceInform_platform': // 开票信息
            code = 'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.INVOICE_INFO';
            break;
          case 'other_information': // 其它信息
            code = 'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.OTHER_INFO';
            break;
          case 'contactInform_platform': // 联系人
            code = 'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.CONTACT_INFO';
            break;
          case 'addressInform_platform': // 地址
            code = 'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.ADDRESS_INFO';
            break;
          case 'attachment_info': // 附件
            code = 'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.ATTA_INFO';
            break;
          case 'financialInform_platform': // 财务状况
            code = 'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.FINANCIAL_INFO';
            break;
          case 'registInform_platform': // 登记信息
            code = 'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.REGISTRATION_OVERSEAS';
            break;
          case 'registeBusinessInform_platform': // 业务信息
            code = 'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.BUSINESS_INFO';
            break;
          case 'supplier_classify': // 供应商分类
            code = 'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.SUPPLIER_CLASSIFY';
            break;
          default:
            break;
        }
        break;
      case 'enterpriseConfirm': // 企业信息变更审批 --- 租户级
        switch (configName) {
          case 'bankInform_platform': // 银行信息
            code = 'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.BANK_INFO';
            break;
          case 'invoiceInform_platform': // 开票信息
            code = 'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.INVOICE_INFO';
            break;
          case 'other_information': // 其它信息
            code = 'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.OTHER_INFO';
            break;
          case 'contactInform_platform': // 联系人
            code = 'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.CONT_INFO';
            break;
          case 'addressInform_platform': // 地址
            code = 'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.ADDRESS_INFO';
            break;
          case 'attachment_info': // 附件
            code = 'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.ATT_INFO';
            break;
          case 'financialInform_platform': // 财务状况
            code = 'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.FINANCIAL_INFO';
            break;
          case 'registInform_platform': // 登记信息
            code = 'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.REGISTRATION_OVERSEAS';
            break;
          case 'registeBusinessInform_platform': // 业务信息
            code = 'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.BUSINESS_INFO';
            break;
          case 'supplier_classify': // 供应商分类
            code = 'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.SUPPLIER_CLASSIFY';
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    if (url) {
      queryPlatformInfo(url, isPlatform, code, desensitize).then(res => {
        if (res) {
          setState({
            loading: false,
            oldData: res[oldKey],
            newData: res[newKey],
          });
        }
      });
    }
  }, [changeReqId]);

  return (
    <div id={configDescription} key={configName} style={{ display: 'flex', width: `${width}px` }}>
      <PlatformColCollapse
        {...{
          source,
          loading,
          oldData,
          configName,
          configDescription,
          tab,
          code,
          changeLevel,
          collapsed,
          setCollapsed,
          ...rest,
        }}
      />
      <div style={{ width: '10px' }} />
      <PlatformColCollapse
        {...{
          source,
          loading,
          newData,
          configName,
          configDescription,
          tab,
          code,
          changeLevel,
          collapsed,
          setCollapsed,
          ...rest,
        }}
      />
    </div>
  );
};

const componentType_ = {
  Upload: (val, fieldCode, data, other = {}, componentProps) => {
    return componentProps && componentProps?.isAttachmentUrl ? (
      <Upload
        fileSize={500 * 1024 * 1024}
        record={data}
        fieldCode={fieldCode}
        isViewOnly
        {...other}
        filePreview
      />
    ) : (
      <UploadModal
        attachmentUUID={val}
        filePreview
        bucketName={PRIVATE_BUCKET}
        bucketDirectory="spfm-comp"
        viewOnly
      />
    );
  },
  ValueList: (val, fieldCode, data) => data[`${fieldCode}Meaning`] || val,
  Lov: (val, fieldCode, data) => data[`${fieldCode}Meaning`] || val,
  Switch: val =>
    +val === 1
      ? intl.get('hzero.common.status.yes').d('是')
      : intl.get('hzero.common.status.no').d('否'),
  Checkbox: val =>
    +val === 1
      ? intl.get('hzero.common.status.yes').d('是')
      : intl.get('hzero.common.status.no').d('否'),
  DatePicker: val => dateRender(val),
  TransferLov: (val, fieldCode, data, other = {}) => {
    const { lovCode = '', tenantId, props = [] } = other;
    const queryUsePostAttribute = props.find(item => item.attributeName === 'queryUsePost');
    const postFlag = queryUsePostAttribute ? queryUsePostAttribute.attributeValue : false;
    // 判断是否是采购方定义的值集
    const organizationLov =
      props.find(({ attributeName }) => attributeName === 'isOrganizationLov') || {};
    const isOrganizationLovFlag = organizationLov.attributeValue;
    // 获取url采购方tenantId
    const { pathname } = window.location;
    const partnerTenantId = (pathname.split('detail/')[1] || '').split('/')[3];
    const originTenantId = isOrganizationLovFlag ? partnerTenantId : undefined;
    return (
      <TransferLov
        code={lovCode}
        value={val}
        queryParams={{ tenantId }}
        viewOnly
        queryUsePost={!!postFlag}
        originTenantId={originTenantId}
      />
    );
  },
};
