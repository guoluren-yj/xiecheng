import React, { Fragment, useMemo, useEffect, useState, useCallback, createContext } from 'react';
import { compose, isEmpty } from 'lodash';
import {
  DataSet,
  Button,
  Modal,
  Dropdown,
  TextArea,
  Lov,
  Select,
  Switch,
  ModalProvider,
  useDataSet,
} from 'choerodon-ui/pro';
import { Tabs, Card, Icon, Collapse } from 'choerodon-ui';
import querystring from 'querystring';
import { observer } from 'mobx-react';
import { getActiveTabKey, updateTab } from 'utils/menuTab';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import { isNil } from 'lodash';

import EditorForm from '@/routes/Components/EditorForm';
import { invoiceRuleSave, invoiceRulePublish, invoiceRuleHistory } from '@/services/taxServices';
import commonStyles from '@/routes/common.less';
import {
  formInfoDs,
  limitDs,
  productDs,
  taxDs,
  diffTaxCommodityDs,
  excessLineDs,
  lovOptionDS,
} from './mainDs';
import HistoryVersion from '../../../components/HistoryRecord/VersionRecord';
import BaseInfo from '../components/BaseInfo';
import SplitRule from '../components/SplitRule';
import Styles from './index.less';
import MergeRule from './MergeRule';
import { fetchDirectTaxTips } from './api';

export const Store = createContext();

const { TabPane } = Tabs;
const { Panel } = Collapse;

const onFormUpdate = ({ name, record }) => {
  if (name === 'mergeRemarkFlag') {
    record.set({ mergeRemarkCombo: undefined });
  }
};

const InvoiceRuleDetail = (props) => {
  const {
    match: {
      params: { ruleId },
    },
    location: { search },
    history,
  } = props;
  const [invoiceRuleId, setInvoiceRuleId] = useState();
  const [historyVersionDataLength, setHistoryDataLength] = useState(0);
  const [loading, setLoading] = useState(false);
  // const [hasEdit, setHasEdit] = useState(false);
  const [errorsMap, setErrorsMap] = useState({
    base: false,
    split: false,
    merge: false,
    other: false,
  });
  const [taxLimitTips, setTaxLimitTips] = useState([]);
  const data = querystring.parse(search.substring(1));
  const { operate, edit, cancel } = data || {};
  const isView = operate === 'view';
  const createFlag = ruleId === 'add';
  const showEdit = edit === '1';
  const showCancel = cancel === '1';
  const renderDisabled = useMemo(() => {
    return !invoiceRuleId || isView;
  }, [invoiceRuleId, isView]);

  const invoiceOptionDs = useDataSet(() => lovOptionDS({ lovCode: 'SDIM.INVOICE_TYPE' }), []);

  const formDs = useMemo(
    () =>
      new DataSet({
        ...formInfoDs(invoiceOptionDs),
        events: {
          update: onFormUpdate,
        },
      }),
    [invoiceOptionDs]
  );
  const limitAmountDs = useMemo(
    () =>
      new DataSet({
        ...limitDs(invoiceOptionDs),
      }),
    [invoiceOptionDs]
  );
  const productInfoDs = useMemo(
    () =>
      new DataSet({
        ...productDs(invoiceOptionDs),
      }),
    [invoiceOptionDs]
  );
  // 税率拆分DS
  const taxTableDs = useMemo(
    () =>
      new DataSet({
        ...taxDs(invoiceOptionDs),
      }),
    [invoiceOptionDs]
  );
  // 不同商品类别拆分
  const diffTaxCommodityTableDs = useMemo(
    () =>
      new DataSet({
        ...diffTaxCommodityDs(invoiceOptionDs),
      }),
    [invoiceOptionDs]
  );
  // 超行拆分
  const excessLineTableDs = useMemo(
    () =>
      new DataSet({
        ...excessLineDs(invoiceOptionDs),
      }),
    [invoiceOptionDs]
  );

  let recordModal;

  useEffect(() => {
    if (ruleId !== 'add') {
      setLoading(true);
      formDs.setQueryParameter('operate', operate);
      formDs.setQueryParameter('ruleId', ruleId);
      formDs.query().then((res) => {
        const { ruleNum, ruleId } = res || {};
        getHistoryVersionLength(ruleNum, ruleId);
        getSplitRuleList();
        setLoading(false);
      });
      setInvoiceRuleId(ruleId);
    } else {
      formDs.create({});
    }
  }, [
    ruleId,
    isView,
    showEdit,
    showCancel,
    formDs,
    operate,
    getSplitRuleList,
    getHistoryVersionLength,
  ]);

  useEffect(() => {
    handleFetchDirectTaxTips();
  }, [handleFetchDirectTaxTips]);

  const handleFetchDirectTaxTips = useCallback(async() => {
    const res = getResponse(await fetchDirectTaxTips());
    if (res) {
      setTaxLimitTips(res?.filter((v) => !isNil(v.singleInvoiceAmountLimit) && !isNil(v.taxpayerName)));
    }
  }, []);

  // 历史版本是否有数据
  const getHistoryVersionLength = useCallback(
    async (ruleNum, ruleId) => {
      const res = getResponse(await invoiceRuleHistory({ ruleNum, ruleId, page: 0, size: 0 }));
      setHistoryDataLength(res?.content?.length || 0);
    },
    [setHistoryDataLength]
  );

  // 查看历史版本
  const checkHistoryVersion = ({ record }) => {
    if (recordModal) {
      recordModal.close();
    }
    updateTab({
      key: getActiveTabKey(),
      search: querystring.stringify({
        operate: 'view',
        edit: 0,
      }),
    });
    history.push({
      pathname: `/ssta/invoice-rule/detail/${record.get('ruleId')}`,
      search: querystring.stringify({
        operate: 'view',
        edit: 0,
      }),
    });
  };

  const editRule = (flag) => {
    updateTab({
      key: getActiveTabKey(),
      search: querystring.stringify({
        operate: 'edit',
        cancel: flag ? 1 : 0,
      }),
    });
    history.push({
      pathname: `/ssta/invoice-rule/detail/${ruleId}`,
      search: querystring.stringify({
        operate: 'edit',
        cancel: flag ? 1 : 0,
      }),
    });
  };

  /**
   * @description: 结算策略保存发布前端校验
   * @param {*}
   * @return {Promise} 校验结果
   */
  const handleDsValidate = useCallback(() => {
    return new Promise(async (resolve) => {
      const isValid = await formDs.validate();

      const taxValidate = await taxTableDs.validate();
      const diffValidate = await diffTaxCommodityTableDs.validate();
      const productValidate = await productInfoDs.validate();
      const excessValidate = await excessLineTableDs.validate();
      const limitValidate = await limitAmountDs.validate();
      const splitValidate =
        taxValidate && diffValidate && productValidate && excessValidate && limitValidate;

      if (isValid && splitValidate) {
        setErrorsMap({
          base: false,
          split: false,
          merge: false,
          other: false,
        });
        resolve(true);
      } else {
        const initialErrors = errorsMap;
        // 平铺表格children校验，校验后会滚动到最后一个ds的第一条error记录，注意ds顺序
        initialErrors.split = [
          taxTableDs,
          diffTaxCommodityTableDs,
          productInfoDs,
          excessLineTableDs,
          limitAmountDs,
        ].some((ds) => {
          return !isEmpty(ds.getValidationErrors());
        });
        // 头校验，需要提示的在dsFieldProps里面添加validationGroup并修改校验方法，单选默认不提示
        formDs.current.getValidationErrors().forEach(({ field }) => {
          const validationGroup = field.get('validationGroup');

          if (validationGroup === 'base') {
            initialErrors.base = true;
          } else if (validationGroup === 'merge') {
            initialErrors.merge = true;
          } else if (validationGroup === 'other') {
            initialErrors.other = true;
          }
        });

        const hasError = Object.values(initialErrors).some((item) => item);
        if (hasError) {
          setErrorsMap({ ...errorsMap, ...initialErrors });
          resolve(false);
        } else {
          resolve(isValid && splitValidate);
        }
      }
    });
  }, [
    formDs,
    taxTableDs,
    diffTaxCommodityTableDs,
    productInfoDs,
    excessLineTableDs,
    limitAmountDs,
    setErrorsMap,
    errorsMap,
  ]);

  const handleToDetail = useCallback(
    (ruleId, opr, editFlag) => {
      // edit 是否显示编辑按钮
      history.push({
        pathname: `/ssta/invoice-rule/detail/${ruleId}`,
        search: querystring.stringify({ operate: opr, edit: editFlag ? 1 : 0 }),
      });
    },
    [history]
  );

  // 点击了保存
  const saveRule = async () => {
    const faRes = await handleDsValidate();
    const linRes = await excessLineTableDs.validate();
    if (!faRes) {
      notification.warning({
        message: intl.get(`hzero.common.view.message.notpassRequire`).d('请填写必填字段后保存'),
      });
      return;
    }

    if (!linRes) {
      notification.warning({
        message: intl
          .get(`ssta.invoiceRule.model.invoiceRule.max`)
          .d('超行控制行数不能大于2000行,请检查确认'),
      });
      return;
    }
    setLoading(true);
    const res = await invoiceRuleSave({
      ...formDs.current.toData(),
      ruleLines: [
        ...productInfoDs.toData(),
        ...limitAmountDs.toData(),
        ...taxTableDs.toData(),
        ...diffTaxCommodityTableDs.toData(),
        ...excessLineTableDs.toData(),
      ],
    });
    if (res) {
      if (res.failed) {
        notification.error({
          message: res.message,
        });
      } else {
        const { ruleId, ruleNum } = res || {};
        notification.success();
        // 新建点保存跳转路由，编辑点保存刷新页面
        if (createFlag) handleToDetail(ruleId, 'edit', true);
        else {
          setInvoiceRuleId(ruleId);
          formDs.setQueryParameter('operate', 'view');
          formDs.current.set('ruleId', ruleId);
          formDs.setQueryParameter('ruleId', ruleId);
          getHistoryVersionLength(ruleNum, ruleId);
          formDs.query();
          getSplitRuleList();
        }
      }
    }
    setLoading(false);
  };
  // 点击了发布
  const publishRule = async () => {
    const { enableFlag } = formDs.current?.get(['enableFlag']) || {};
    let feedback = 'ok';
    if (enableFlag === 0) {
      feedback = await Modal.confirm({
        title: intl.get('ssta.common.view.title.tip').d('提示'),
        children: intl
          .get('ssta.invoiceRule.view.message.pubulishWarning')
          .d('当前规则为禁用状态，发布后将直接生效变为“已发布”，请确认是否发布？'),
      });
    }

    if (feedback !== 'ok') return false;

    const faRes = await handleDsValidate();
    const linRes = await excessLineTableDs.validate();
    if (!faRes) {
      notification.warning({
        message: intl.get(`hzero.common.view.message.notpassRequire`).d('请填写必填字段后保存'),
      });
      return;
    }
    if (!linRes) {
      notification.warning({
        message: intl
          .get(`ssta.invoiceRule.model.invoiceRule.max`)
          .d('超行控制行数不能大于2000行,请检查确认'),
      });
      return;
    }
    setLoading(true);
    const res = await invoiceRulePublish({
      ...formDs.current.toData(),
      ruleLines: [
        ...productInfoDs.toData(),
        ...limitAmountDs.toData(),
        ...taxTableDs.toData(),
        ...diffTaxCommodityTableDs.toData(),
        ...excessLineTableDs.toData(),
      ],
    });
    if (res) {
      if (res.failed) {
        notification.error({
          message: res.message,
        });
      } else {
        notification.success();
        history.push({
          pathname: `/ssta/invoice-rule/list`,
        });
      }
    }
    setLoading(false);
  };

  const getSplitRuleList = useCallback(() => {
    const id = formDs.current?.get('ruleId');
    if (id) {
      const list = [
        { ds: productInfoDs, type: 'special_commodity_split' },
        { ds: limitAmountDs, type: 'amount_limit_split' },
        { ds: taxTableDs, type: 'diff_rate_split' },
        {
          ds: diffTaxCommodityTableDs,
          type: 'diff_tax_commodity_split',
        },
        { ds: excessLineTableDs, type: 'excess_line_split' },
      ];
      list.forEach((item) => {
        item.ds.setQueryParameter('ruleId', id);
        item.ds.setQueryParameter('ruleType', item.type);
        item.ds.setQueryParameter('size', 0);
        item.ds.query();
      });
    }
  }, [
    formDs,
    productInfoDs,
    limitAmountDs,
    taxTableDs,
    diffTaxCommodityTableDs,
    excessLineTableDs,
  ]);

  const headerBtns = () => {
    const { ruleNum, ruleId, ruleStatus, snapshotFlag } =
      formDs.current?.get(['ruleNum', 'ruleId', 'ruleStatus', 'snapshotFlag']) || {};
    const btns = [
      showEdit && isView && Number(snapshotFlag) === 1 && (
        <Button icon="mode_edit" funcType="flat" onClick={() => editRule(true)} loading={loading}>
          {intl.get(`hzero.common.button.editable`).d('编辑')}
        </Button>
      ),
      !isView && (
        <Button icon="publish2" color="primary" onClick={() => publishRule()} loading={loading}>
          {intl.get('hzero.common.button.release').d('发布')}
        </Button>
      ),
      !isView && (
        <Button icon="save" funcType="flat" onClick={() => saveRule()} loading={loading}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      ),
      // showCancel && !isView && (
      //   <Button icon="cancel" funcType="flat" onClick={() => cancelEditRule()} loading={loading}>
      //     {intl.get(`ssta.invoiceRule.model.invoiceRule.cancelEdit`).d('取消编辑')}
      //   </Button>
      // ),
      ruleStatus === 'PUBLISH' && historyVersionDataLength > 0 && (
        <Dropdown
          placement="bottomRight"
          overlay={
            <HistoryVersion
              primaryKey="ruleId"
              onClick={checkHistoryVersion}
              readTransport={{
                url: `/ssta/v1/${getCurrentOrganizationId()}/direct-invoice-rules/history/page?ruleNum=${ruleNum}&ruleId=${ruleId}&page=0`,
                method: 'GET',
              }}
              fieldsConfig={{
                userName: { alias: 'updateUserName' },
                loginName: { alias: 'updateLoginName' },
                time: { alias: 'creationDate' },
              }}
            />
          }
        >
          <Button funcType="flat" icon="schedule">
            {intl.get('hzero.common.button.historyVerison').d('历史版本')}
            <Icon type="expand_more" />
          </Button>
        </Dropdown>
      ),
    ];
    return btns;
  };

  const couponColumns = useMemo(() => {
    return [
      {
        name: 'invoiceSpecialMark',
        editor: Select,
      },
      {
        name: 'defaultCommodityType',
        editor: Select,
      },
      {
        name: 'defaultRateType',
        editor: Select,
      },
      {
        name: 'defaultCommodityIdLov',
        editor: Lov,
        help: intl
          .get(`ssta.invoiceRule.view.help.defaultCommodityId`)
          .d(
            '一般增值税发票票面字段，配置后，应用该规则开具的税票对应的【货物或应税劳务、服务名称/项目名称】若未找到对应的值，将自动填充缺省值'
          ),
      },
      {
        name: 'defaultPayee',
        disabled: renderDisabled,
        help: intl
          .get(`ssta.invoiceRule.view.help.defaultPayee`)
          .d(
            '一般增值税发票票面字段，配置后，应用该规则开具的税票对应字段将自动填空维护的值；全电票等无该字段的票样，配置后也不填充'
          ),
      },
      {
        name: 'defaultReviewer',
        disabled: renderDisabled,
        help: intl
          .get(`ssta.invoiceRule.view.help.defaultReviewer`)
          .d(
            '一般增值税发票票面字段，配置后，应用该规则开具的税票对应字段将自动填空维护的值；全电票等无该字段的票样，配置后也不填充'
          ),
      },
      {
        name: 'defaultInvoiceBy',
        disabled: renderDisabled,
        help: intl
          .get(`ssta.invoiceRule.view.help.defaultInvoiceBy`)
          .d('一般增值税发票票面字段，配置后，应用该规则开具的税票对应字段将自动填空维护的值'),
      },
      {
        name: 'defaultRemark',
        editor: TextArea,
        disabled: renderDisabled,
        resize: 'vertical',
        newLine: true,
        help: intl
          .get(`ssta.invoiceRule.view.help.defaultRemark`)
          .d('若【备注】与【备注合并】处皆配置，优先展示此处所维护的默认值'),
        colSpan: 2,
      },
    ];
  }, [renderDisabled]);

  const draweeColumns = useMemo(() => {
    return [
      {
        name: 'defaultReceiver',
        disabled: renderDisabled,
        help: intl
          .get(`ssta.invoiceRule.view.help.sendFileToReceiverWhenInving`)
          .d('开具电子发票时可选择是否将版式文件推送交付受票方(手机短信、电子邮箱)'),
      },
      {
        name: 'defaultRecipientAddress',
        disabled: renderDisabled,
        help: intl
          .get(`ssta.invoiceRule.view.help.defaultRecipientAddress`)
          .d(
            '非增值税票面字段，配置后，对应开票申请单以及其关联的发票申请单关联字段将自动填充，若匹配到多个或发票申请单上已存在相关值，则不填充'
          ),
      },
      {
        name: 'defaultRecipientPhone',
        disabled: renderDisabled,
        help: intl
          .get(`ssta.invoiceRule.view.help.defaultRecipientPhone`)
          .d(
            '非增值税票面字段，配置后，对应开票申请单以及其关联的发票申请单关联字段将自动填充，若匹配到多个或发票申请单上已存在相关值，则不填充'
          ),
        newLine: true,
      },
      {
        name: 'pushPhoneFlag',
        editor: Switch,
        disabled: renderDisabled,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'defaultRecipientEmail',
        disabled: renderDisabled,
        newLine: true,
      },
      {
        name: 'pushEmailFlag',
        editor: Switch,
        disabled: renderDisabled,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
    ];
  }, [renderDisabled]);

  const otherColumns = useMemo(() => {
    return [
      {
        name: 'paperInvoiceType',
        editor: Select,
      },
      {
        name: 'pushPriceFlag',
        editor: Select,
      },
      {
        name: 'taxIncludedPriceFlag',
        editor: Select,
      },
      {
        name: 'invoiceListMark',
        editor: Select,
      },
    ];
  }, []);

  const title =
    ruleId === 'add'
      ? intl.get('ssta.invoiceRule.view.title.invoiceRuleAdd').d('新建开票规则')
      : isView
      ? intl.get('ssta.invoiceRule.view.title.invoiceRuleView').d('查看开票规则')
      : intl.get('ssta.invoiceRule.view.title.invoiceRuleUpdate').d('编辑开票规则');

  const isAdd = createFlag && !formDs?.current?.get('ruleId');

  const storeValue = useMemo(() => {
    return {
      formDs,
      editFlag: !isView,
    };
  }, [isView, formDs]);

  if (!formDs?.current) return;

  return (
    <Fragment>
      <Store.Provider value={storeValue}>
        <ModalProvider location={location}>
          <Header title={title} backPath="/ssta/invoice-rule/list">
            {headerBtns()}
          </Header>

          {isAdd ? (
            <Content
              className={commonStyles[`collapse-content`]}
              wrapperClassName={commonStyles[`collapse-content-wrap`]}
            >
              <Collapse
                ghost
                trigger="icon"
                expandIconPosition="text-right"
                defaultActiveKey={['baseInfo']}
              >
                <Panel
                  showArrow={false}
                  key="baseInfo"
                  header={intl.get(`ssta.costSheet.view.message.panel.baseInfos`).d('基本信息')}
                >
                  <BaseInfo formDs={formDs} loading={loading} isView={isView} />
                </Panel>
              </Collapse>
            </Content>
          ) : (
            <div
              className={`${commonStyles['ssta-detail-content']} ${Styles['settle-strategy-detail']}`}
            >
              <Tabs tabPosition="left">
                <TabPane
                  tab={intl.get(`ssta.costSheet.view.message.panel.baseInfos`).d('基本信息')}
                  key="base"
                >
                  <BaseInfo formDs={formDs} loading={loading} isView={isView} />
                </TabPane>

                <TabPane
                  tab={intl.get(`ssta.invoiceRule.model.invoiceRule.splitRule`).d('拆分规则')}
                  key="split"
                >
                  <SplitRule
                    taxTableDs={taxTableDs}
                    productInfoDs={productInfoDs}
                    limitAmountDs={limitAmountDs}
                    diffTaxCommodityTableDs={diffTaxCommodityTableDs}
                    excessLineTableDs={excessLineTableDs}
                    renderDisabled={renderDisabled}
                    formDs={formDs}
                    taxLimitTips={taxLimitTips}
                  />
                </TabPane>

                <TabPane
                  tab={intl.get(`ssta.invoiceRule.model.invoiceRule.mergeRule`).d('合并规则')}
                  key="merge"
                >
                  <MergeRule />
                </TabPane>
                <TabPane
                  tab={intl.get(`ssta.costSheet.view.message.panel.othersInf`).d('其他信息')}
                  key="other"
                >
                  <div className="strategy-panel-wrapper">
                    <Card
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={intl.get(`ssta.invoiceRule.view.title.couponInfo`).d('票面信息')}
                    >
                      <EditorForm
                        useWidthPercent
                        columns={3}
                        useColon={false}
                        dataSet={formDs}
                        editorFlag={!isView}
                        editorColumns={couponColumns}
                      />
                    </Card>
                    <Card
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={intl.get(`ssta.invoiceRule.view.title.draweeInfo`).d('受票人信息')}
                    >
                      <EditorForm
                        useWidthPercent
                        columns={3}
                        useColon={false}
                        dataSet={formDs}
                        editorFlag={!isView}
                        editorColumns={draweeColumns}
                      />
                    </Card>
                    <Card
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={intl.get(`ssta.costSheet.view.message.panel.othersInf`).d('其他信息')}
                    >
                      <EditorForm
                        useWidthPercent
                        columns={3}
                        useColon={false}
                        dataSet={formDs}
                        editorFlag={!isView}
                        editorColumns={otherColumns}
                      />
                    </Card>
                  </div>
                </TabPane>
              </Tabs>
            </div>
          )}
        </ModalProvider>
      </Store.Provider>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['ssta.common', 'ssta.invoiceRule', 'ssta.settleStrategy', 'ssta.costSheet'],
  }),
  withCustomize({
    unitCode: [],
  }),
  observer
)(InvoiceRuleDetail);
