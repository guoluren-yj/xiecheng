import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { Spin } from 'choerodon-ui';
import {
  DataSet,
  Button,
  Form,
  TextField,
  IntlField,
  Tooltip,
  Icon,
  SelectBox,
  NumberField,
  Output,
  Table,
  Lov,
} from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import { compose, isEmpty } from 'lodash';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';
import {
  fetchPriceComparisonStrategyDetail,
  publishStrategy,
  saveStrategy,
  fetchHistoryListApi,
  fetchAiCompareFlagApi,
  fetchAiSimilarUrl,
  fetchAiSkuPoolUrl,
} from '@/services/priceComparisonStrategyDefinitionService';
import qs from 'qs';

import { openCatalogTree } from '@/components/UnitTreeModal';
import { Header, Content } from 'components/Page';
import Card from '@/components/Card';
import { showStatusTag } from '../../PriceComparisonStrategyDefinition';
import HistoryVersion from '../HistoryVersion';

import { compareDS, dimensionDS } from '../tableDs';
import style from './index.less';


const { Option } = SelectBox;
const Detail = props => {
  const {
    match,
    location: { search },
  } = props;
  const {
    params: { compareRuleHeaderId, readOnlyPage },
  } = match;
  const { hasHistoryFlag } = search ? qs.parse(search?.substr(1)) : {};
  const [historyList, setHistoryList] = useState([]);
  const [readOnly, setReadOnly] = useState(true);
  const compareDs = useMemo(() => new DataSet(compareDS(readOnly)), [readOnly]);
  const dimensionDs = useMemo(() => new DataSet(dimensionDS(readOnly)), [readOnly]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [aiCompareFlag, setAiCompareFlag] = useState(false); // 是否开启智能比价
  const [aiSimilarUrl, setAiSimilarUrl] = useState('');
  const [aiSkuPoolUrl, setAiSkuPoolUrl] = useState('');

  useEffect(() => {
    return readOnlyPage === '0' ? setReadOnly(false) : setReadOnly(true);
  }, [readOnlyPage]);

  useEffect(() => {
    fetchAiCompareFlag();
  }, []);

  useEffect(() => {
    if(aiCompareFlag) {
      fetchAiSimilarUrl().then(res => {
        if(res) {
          setAiSimilarUrl(res.url)
        }
      });
      fetchAiSkuPoolUrl().then(res => {
        if(res) {
          setAiSkuPoolUrl(res.url)
        }
      });
    }
  }, [aiCompareFlag]);

  useEffect(()=> {
    fetchHistoryList();
  }, [hasHistoryFlag]);

  const fetchHistoryList = async ()=>{
    if(hasHistoryFlag === 'true'){
      const res = getResponse(await fetchHistoryListApi(compareRuleHeaderId));
      if(res){
        const list = res.filter(i=> i.historyFlag===1) || [];
        setHistoryList(list);
      }
    }
  };

  const fetchAiCompareFlag = async () => { 
    const res = getResponse(await fetchAiCompareFlagApi());
    setAiCompareFlag(res);
  };

  const fetchDetail = async () => {
    setLoading(true);
    const res = getResponse(await fetchPriceComparisonStrategyDetail(compareRuleHeaderId));
    compareDs.loadData([{ ...res }]);
    const data = dimensionDs.toData();
    // 处理比价排除策略
    // 比价排除策略存在
    data.forEach((i, index) => {
      // 清楚默认数据
      delete data[index].valueList;
      (res.conditionList || []).forEach(item => {
        if (item.dimensionCode && i.dimensionCode === item.dimensionCode) {
          data[index].valueList = item.valueList;
        }
      });
    });
    dimensionDs.loadData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDetail();
  }, [readOnly, compareRuleHeaderId]);

  const handleJumpAi = useCallback((url) => {
    const [baseUrl, search] = url.split('?');
    const params = qs.parse(search);
    params.ssoLoginUrl = window.location.origin;
    window.open(`${baseUrl}?${qs.stringify(params)}`, '_blank');
  }, []);

  const handleOpenCatalogTree = useCallback(() => {
    openCatalogTree({
      name: 'compareRuleConditionList',
      record: compareDs.current,
      whole: false,
      ...(readOnly ? { disabled: true } : { title: intl.get('small.common.model.selectCatalog').d('选择目录') }),
      alertProps: {
        message: intl.get('small.comparePrice.view.catalogAlert').d('若目录状态发生 “启用→禁用→再次启用” 的变更，则在目录禁用期间新增的商品将无法自动同步至 AI 侧。如遇此情况，请联系 AI 侧管理人员进行历史商品数据的同步处理'),
        type: 'warning',
        iconType: 'info',
        showIcon: true,
        banner: true,
        style: {
          margin: '-20px -20px 16px',
        },
      },
    });
  }, [readOnly]);

  const renderCatalogButton = () => (
    <Button funcType='link' onClick={handleOpenCatalogTree}>
      {intl.get('hzero.common.button.view').d('查看')}
    </Button>
  );

  const renderAiJumpButton = (url) => () => (
    <Button funcType='link' onClick={() => handleJumpAi(url)}>
      {intl.get('small.comparePrice.view.aiSimilarConfigBtn').d('快速跳转')}
    </Button>
  );

  // 基本信息 仅策略名称可编辑
  const headerInfoList = [
    {
      name: 'compareRuleCode',
      show: true,
      disabled: true,
    },
    {
      name: 'compareRuleName',
      show: true,
      disabled: readOnly,
    },
    {
      name: 'displayVersion',
      width: 80,
      disabled: true,
      show: true,
      renderer: ({ record }) => {
        return (
          <span>
            {record.get('subVersion')}
          </span>
        );
      },
    },
    {
      name: 'status',
      disabled: true,
      show: ({ds})=> readOnly && !ds?.current?.get('historyFlag'), // 编辑时不展示状态
      renderer: ({ record }) => {
        const { status, statusMeaning } = record.data;
        return showStatusTag(status, statusMeaning);
      },
    },
    {
      name: 'createName',
      disabled: true,
      show: true,
    },
    {
      name: 'creationDate',
      disabled: true,
      show: true,
      renderer: ({ value }) => {
        return (
          <span>
            {dateTimeRender(value)}
          </span>
        );
      },
    },
  ];

  const PriceComparisonMethod = observer(() => {
    const { compareRule } = compareDs.current.get(['compareRule', 'ruleList']);
    const addRueList = [
      {
        name: intl.get('small.comparePrice.compareRule.manualCompare').d('手动比价'),
        helpText: intl
          .get('small.comparePrice.compareRule.rule1')
          .d('需求人员自由比价，只能手动生成比价单'),
        value: 3,
      },
      {
        name: intl.get('small.comparePrice.compareRule.materialCompare').d('物料比价'),
        helpText: intl
          .get('small.comparePrice.compareRule.rule2')
          .d('根据商品关联的物料编码/69码比价，能自动生成比价单'),
        value: 2,
      },
      {
        name: intl.get('small.comparePrice.compareRule.searchCompare').d('搜索比价'),
        helpText: intl
          .get('small.comparePrice.compareRule.rule3')
          .d('搜索的商品按照一定的规则加购，只能自动生成比价单'),
        value: 4,
      },
      {
        name: intl.get('small.comparePrice.compareRule.noCompare').d('不启用比价'),
        helpText: intl.get('small.comparePrice.compareRule.rule4').d('无比价业务，且无需对比'),
        value: 1,
      },
      {
        name: intl.get('small.comparePrice.compareRule.intelligentPriceCompare').d('智能比价'),
        helpText: intl.get('small.comparePrice.compareRule.rule5').d('当加购商品所属目录开启了智能比价，能自动根据智能分类管理属性生成比价单'),
        value: 5,
        show: aiCompareFlag,
      },
    ].filter(item => item.show === undefined || item.show);

    const columns = [
      {
        name: 'dimensionCode',
        width: 180,
        renderer: ({ record }) => {
          const dimensionCode = record.get('dimensionCode');
          return dimensionCode === 'label'
            ? intl.get('small.comparePrice.view.label').d('标签')
            : intl.get('small.comparePrice.view.supplier').d('供应商');
        },
      },
      {
        name: 'dimensionValueLov',
        renderer: !readOnly ? null : ({ text }) => {
          return typeof text === 'string' ? text?.split('/')?.join('、') || '-' : '';
        },
        editor: record => {
          if (readOnly) return false;
          const dimensionCode = record.get('dimensionCode');
          return (
            <Lov
              viewMode="drawer"
              modalProps={{
                style: {
                  width: 742,
                },
                title:
                  dimensionCode === 'label'
                    ? intl.get('small.comparePrice.view.chooseLabel').d('选择标签')
                    : intl.get('small.comparePrice.view.chooseSupplier').d('选择供应商'),
              }}
              tableProps={{
                style: {
                  maxHeight: `calc(100vh - 160px)`,
                },
              }}
            />
          );
        },
      },
    ];

    // 渲染比价方式
    const renderCompareRule = () => {
      const result = addRueList.map(item => {
        return item.value === compareRule ? <>{item.name}</> : '';
      });
      return result;
    };
    const rendererRule = ({text})=>{
      return text?.split('/')?.join('、') || '-';
    };
    const ruleConfigList = [
      {
        title: intl.get('small.comparePrice.view.addRule').d('加购规则'),
        show: compareRule === 4, // // 加购规则 仅选择搜索比价时展示
        description: readOnly
          ? ''
          : intl
              .get('small.comparePrice.view.addRuleSentence')
              .d(
                '加购规则定义搜索结果中的商品，需要满足哪些必选属性，只有全部按照必选属性筛选的商品才可以加入购物车'
              ),
        children: (
          <>
            <Form useWidthPercent labelLayout={readOnly ? 'vertical' : 'float'} dataSet={compareDs} className={readOnly ? 'c7n-pro-vertical-form-display form-wrapper-def' : 'form-wrapper-def'}>
              {readOnly ? (
                <Output name="ruleList" className='ruleList-output' renderer={rendererRule} />
              ) : (
                <SelectBox name="ruleList" required style={{ marginTop: 16 }} />
              )}
            </Form>
          </>
        ),
      },
      {
        title: intl.get('small.comparePrice.view.aiCompareStrategy').d('智能比价策略'),
        show: compareRule === 5,
        description: intl.get('small.comparePrice.view.aiCompareStrategyDes').d('智能比价支持根据商品不同的分类配置不同的同款推荐策略'),
        children: (
          <Form useWidthPercent columns={3} dataSet={compareDs} labelLayout={readOnly ? 'vertical' : 'float'} className={readOnly ? 'c7n-pro-vertical-form-display form-wrapper-def' : 'form-wrapper-def'}>
            {readOnly ? (
              <Output name="compareRuleConditionListDisplay" renderer={renderCatalogButton} />
            ) : (
              <Lov
                noCache
                name="compareRuleConditionList"
                onClick={handleOpenCatalogTree}
              />
            )}
            <Output name="aiSkuPool" renderer={renderAiJumpButton(aiSkuPoolUrl)} />
            <Output name="aiSkuCategory" renderer={renderAiJumpButton(aiSimilarUrl)} />
          </Form>
        ),
      },
      {
        title: intl.get('small.comparePrice.view.compareNum').d('比价数量'),
        show: compareRule !== 1, // 未开启比价时不展示
        children: (
          <Form useWidthPercent columns={3} dataSet={compareDs} labelLayout={readOnly ? 'vertical' : 'float'} className={readOnly ? 'c7n-pro-vertical-form-display form-wrapper-def' : 'form-wrapper-def'}>
            {readOnly ? (
              <>
                <Output name="lowerLimit" />
                <Output name="upperLimit" />
              </>
            ) : (
              <>
                <NumberField
                  name="lowerLimit"
                  showHelp="tooltip"
                  help={intl.get('small.comparePrice.view.skuLowerLimit.tip').d('定义包括比价主品在内，至少要几个sku参与比价')}
                />
                <NumberField
                  showHelp="tooltip"
                  help={intl
                    .get('small.comparePrice.view.skuUpperLimit.tip')
                    .d(
                      '定义包括比价主品在内，最多几个sku参与比价 若不限制，系统默认自动生成比价单时，一个比价单最多可有21个sku'
                    )}
                  name="upperLimit"
                />
              </>
            )}
          </Form>
        ),
      },
      {
        title: intl.get('small.comparePrice.view.exlusionStrategy').d('比价排除策略'),
        show: compareRule !== 1 && compareRule !== 5, // 未开启比价时不展示
        description: readOnly
          ? intl
              .get('small.comparePrice.view.exlusionStrategySentence')
              .d('以下范围内的商品既不需要比价也不参与比价')
          : intl
              .get('small.comparePrice.view.exlusionStrategySentence2')
              .d(
                '如存在商品不需要比价，则可以在比价策略排除，配置排除后商品既不需要比价也不参与比价'
              ),
        children: (
          <>
            <Table
              dataSet={dimensionDs}
              columns={columns}
              customizable
              customizedCode="column-group"
            />
          </>
        ),
      },
    ];

    return (
      <>
        <Form useWidthPercent labelLayout={readOnly ? 'vertical' : 'float'} className={readOnly ? 'c7n-pro-vertical-form-display form-wrapper-def' : 'form-wrapper-def'} dataSet={compareDs}>
          {readOnly ? (
            <>
              <Output name="compareRule" renderer={renderCompareRule} />
            </>
          ) : (
            <SelectBox name="compareRule" className="form-wrapper-compare" required style={{ marginTop: 16 }}>
              {addRueList.map(item => (
                <Option value={item.value} key={item.value}>
                  {item.name}
                  <Tooltip placement="top" title={item.helpText} arrowPointAtCenter>
                    <Icon type="help" className='form-wrapper-select-icon' style={{ fontSize: 16, color: '#868D9C', position: 'relative', top: -2, paddingBottom: 0 }} />
                  </Tooltip>
                </Option>
              ))}
            </SelectBox>
          )}
        </Form>
        {ruleConfigList
          .filter(f => f.show)
          .map(item => {
            const { title, description, children } = item;
            return (
              <Card
                className="form-wrapper-card"
                key={title}
                title={title}
                desc={description}
                titleStyle={{ fontWeight: 600, marginBottom: description ? 8 : 16 }}
              >
                {children}
              </Card>
            );
          })}
      </>
    );
  });
  // 发布
  const handleSave = async type => {
    const flag = await compareDs.validate();
    if (!flag) return;

    const data = compareDs.toData()?.[0] || {};
    const dimensionData = dimensionDs.toData();

    const params = {
      ...data,
      ruleList: data.ruleList ? (data.ruleList || []).map(i => ({ value: i })) : undefined,
      // 不启用比价时 不传数据
      conditionList:
        data.compareRule === 1
          ? undefined
          : dimensionData.map(item => ({
              dimensionCode: item?.dimensionCode,
              valueList: item[`${item.dimensionCode === 'label' ? 'labelCode' : 'supplierId'}`].map(
                i => ({
                  value: i,
                })
              ),
            })),
      // 不启用比价时 不进行校验 && 传默认数据
      lowerLimit: data.compareRule === 1 ? 2 : data.lowerLimit,
      upperLimit: data.compareRule === 1 ? 21 : data.upperLimit,
    };
    let res;
    // 发布
    if (type === 'PUBLISH') {
      // 未保存则先保存 再发布
      const resp = isSaved ? params : getResponse(await saveStrategy(params));
      if (resp) {
        res = getResponse(await publishStrategy(resp));
      }
      if (res) {
        notification.success();
        props.history.push({
          pathname: `/small/price-comparison-strategy-definition/list`,
        });
      }
      // 保存
    } else {
      res = getResponse(await saveStrategy(params));
      if (res) {
        setIsSaved(true);
        notification.success();
      }
    }
    fetchDetail();
  };

  const ButtonList = observer(() => {
    const status = compareDs.current.get('status');
    return (
      <>
        {/* 未发布 且 编辑时展示 保存 发布按钮  */}
        <>
          {status === 'UNPUBLISHED' && !readOnly && (
            <>
              <Button
                icon="publish2"
                color="primary"
                onClick={() => {
                  handleSave('PUBLISH');
                }}
              >
                {intl.get('small.common.button.handle.publish').d('发布')}
              </Button>
              <Button icon="save" funcType="flat" loading={loading} onClick={() => handleSave()}>
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            </>
          )}
          {status === 'UNPUBLISHED' && readOnly && (
            <>
              <Button
                icon="mode_edit"
                funcType="flat"
                loading={loading}
                onClick={() => {
                  props.history.push({
                    pathname: `/small/price-comparison-strategy-definition/${compareRuleHeaderId}/0`,
                  });
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </Button>
            </>
          )}
          {!isEmpty(historyList) && readOnly && (
            <HistoryVersion history={props.history} beforeIconType="schedule" historyVersionList={historyList} />
          )}
        </>
      </>
    );
  });

  return (
    <>
      <Header
        title={
          readOnly
            ? intl.get(`small.comparePrice.view.viewDetail`).d('比价策略详情')
            : intl.get(`small.comparePrice.view.editDetail`).d('编辑比价策略')
        }
        backPath="/small/price-comparison-strategy-definition/list"
      >
        <ButtonList dataSet={compareDs} />
      </Header>
      <Content>
        <div className={style['price-comparison-def']}>
          <Spin spinning={loading}>
            <div className="template-info">
              <div className="template-info-title">
                {intl.get('small.comparePrice.view.baseInfo').d('基本信息')}
              </div>
              <Form
                labelLayout={readOnly ? 'vertical' : 'float'}
                className={readOnly ? 'c7n-pro-vertical-form-display' : ''}
                useWidthPercent
                dataSet={compareDs}
                columns={3}
                readOnly={readOnly}
              >
                {headerInfoList.filter(f => typeof f.show === 'function' ? f.show({ ds: compareDs }) : f.show !== false)
                .map(header =>
                readOnly ? (
                  <Output {...header} />
                ) : header.disabled ? (
                  <TextField {...header} />
                ) : (
                  <IntlField {...header} />
                )
              )}
              </Form>
            </div>
            <div className="invide" />
            <div className="template-rule">
              <div className="template-info-title">
                {readOnly
                ? intl.get('small.comparePrice.view.rule').d('比价策略')
                : intl.get('small.comparePrice.view.ruleConfig').d('比价策略配置')}
              </div>
              <PriceComparisonMethod />
            </div>
          </Spin>
        </div>
      </Content>
    </>
  );
};

export default compose(
  formatterCollections({
    code: ['small.comparePrice', 'small.common'],
  })
)(Detail);
