/**
 * index.js 收货管理配置-新
 * @date: 2022-11-14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import React, { useMemo, useEffect, useRef, useState, createContext } from 'react';
import { DataSet, Table, Button, Modal, Spin, CheckBox, Icon } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { TableBoxSizing } from 'choerodon-ui/pro/lib/table/enum';
import { Alert, Tooltip } from 'choerodon-ui';

import { connect } from 'dva';
import qs from 'querystring';
import { routerRedux } from 'dva/router';
import { isEmpty, isNil } from 'lodash';
import { stringify } from 'querystring';
import { observer } from 'mobx-react-lite';
import intl from 'srm-front-boot/lib/utils/intl/index.js';
import notification from 'hzero-front/lib/utils/notification';
import { getResponse } from 'hzero-front/lib/utils/utils/index';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils/user';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections.js';
import { refreshTab, getActiveTabKey } from 'hzero-front/lib/utils/menuTab';

import SlodStatusHOC, { recursion } from '@/utils/utils';
import { handleDelete, headerFetchInfo, saveDetailInfo } from '@/services/receiptManageConfigService';
import CustomForm, { indexDataSet } from '@/routes/components/CustomFormAndTableWrapper';
import { formColumns, lineColumns } from './methods';
import { flowChartsDS } from './store/flowChartsDataSet';
import Card from './returnCard';
import NewCharts from './flowCharts';
import { lineDataColumns } from '../_utils';

import styles from "./index.less";

export const Store: any = createContext({});

const organizationId = getCurrentOrganizationId();
interface BtnProps {
  dataSet?: DataSet;
  selected?: any,
}

const Detail = (props) => {
  const {
    history,
    workFlag,
    match = {},
    location = {},
    receiptManageConfig = {},
    nodeStrategyId, // 列表页引用策略配置使用
  } = props;
  const {
    chartList = {}
  } = receiptManageConfig;
  const { params = {} } = match;
  const { search } = location || {};
  const retRef: any = useRef({})
  const formRef: any = useRef(null)
  const flowChartsRef: any = useRef({})
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [trxLineCount, settrxLineCount] = useState(0);
  const [reverseEnable, setReverseEnable] = useState(0);
  const [checkoutBoxFlag, SetCheckoutBoxFlag] = useState(false);
  const [reverseEnableFlag, setReverseEnableFlag] = useState(false);
  const { tabsKey, editor, edKey=null } = qs.parse(search?.substr(1));

  const { nodeCreateFormParams, reverseCreateFormParams } = formColumns({ workFlag })
  const { delivery = [], returned = [], nodeLoad, nodeFetchList, returnFetchList } = lineColumns(retRef, workFlag);
  const flowChartsDs = useMemo(() => new DataSet(flowChartsDS()), [tabsKey === 'strategy']);
  const nodeDs = useMemo(() => new DataSet(indexDataSet({
    id: 'mappingId',
    componentData: delivery,
    read: nodeFetchList,
    load: nodeLoad,
  })), [tabsKey === 'node']);

  const returnDs = useMemo(() => new DataSet(indexDataSet({
    id: 'reverseConfigId',
    componentData: returned,
    read: returnFetchList,
    load: nodeLoad,
  })), [tabsKey === 'node']);


  useEffect(() => {
    handleQueryHeaderInfo();
  }, [workFlag]);

  useEffect(() => {
    nodeDs.setQueryParameter('params', {
      nodeConfigType: 1,
      nodeConfigId: params.id || nodeStrategyId,
      asyncCountFlag: 'DEFAULT',
    });
    returnDs.setQueryParameter('params', {
      nodeConfigType: 0,
      nodeConfigId: params.id || nodeStrategyId,
      asyncCountFlag: 'DEFAULT',
    });
    nodeDs.query();
    returnDs.query();
  }, [tabsKey === 'node']);

  /**
   * 收货管理配置 - 查询明细头信息
   * @delivery {*} params
   * return object
   */
  const handleQueryHeaderInfo = () => {
    try {
      setLoading(true);
      headerFetchInfo({ id: params.id || nodeStrategyId, tabsKey, nodeStrategyId: nodeStrategyId }).then(res => {
        if (getResponse(res)) {
          const reverse = [1].includes(res?.reverseEnable);
          const checkFlag = ['ASN', 'PLAN'].includes(res?.nodeOrderType);
          formRef?.current?.ds.loadData([res]);
          settrxLineCount(res.trxLineCount);
          setReverseEnableFlag(reverse);
          SetCheckoutBoxFlag(checkFlag);
          setReverseEnable(res.reverseEnable);
          setLoading(false);
        }
      })
    } catch (e) {
      throw (e)
    } finally {
      setTimeout(() => setLoading(false), 200);
    }
  }
  /**
   * 收货管理配置 - 保存数据
   * @delivery {*} params
   * return arr
 */
  const handleSaveInfo = async () => {
    const list = tabsKey !== 'node' &&
      recursion([flowChartsRef?.current?.chartList], 'children', [])
      || [];
    const flag = await formRef.current?.ds.validate();
    const nodeParams = {
      ...formRef.current?.ds?.current?.toJSONData(),
      rcvExtMappingList: nodeDs.toData(),
      rcvReverseConfigList: returnDs.toData(),
      reverseEnable,
    };
    const strategyParams = {
      ...formRef.current?.ds?.current?.toJSONData(),
      rcvStrategyLineList: list,
    };
    if (isNil(formRef.current?.ds?.current?.get('_token'))) return;
    if (flag) {
      setBtnLoading(true);
      const res = await saveDetailInfo({
        params: tabsKey === 'node' ? nodeParams :
          strategyParams,
        tabsKey,
      });
      if (getResponse(res)) {
        if (tabsKey === 'node') {
          Promise.all([
            handleQueryHeaderInfo(),
            nodeDs.query(),
            returnDs.query()
          ]).then(() => {
            setBtnLoading(false);
            (notification as any).success();
          }).catch((e) => {
            setBtnLoading(false);
            throw (e);
          }).finally(() => {
            setBtnLoading(false);
          })
        } else {
          handleQueryHeaderInfo(),
            flowChartsRef?.current?.clearText();
          (notification as any).success();
          setBtnLoading(false);
        }
      } else {
        setBtnLoading(false);
      }
    }
  };

  /**
     * 收货管理配置 - 是否启用退货标识
     * @delivery {*} params
     * return flag & number
   */
  const handleCeckBoxChange = (value, oldValue) => {
    const reverse = value ? 1 : 0;
    setReverseEnable(reverse);
    setReverseEnableFlag(value);
    value && returnDs.query();
  }

  /**
   * 收货管理配置 - 主按钮删除
   * @delivery {*} params
   * return
 */
  const handleDeleteInfo = () => {
    if (isNil(formRef.current?.ds?.current?.get('_token'))) return;
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: tabsKey === 'node' ? intl.get('sinv.receiptManage.view.title.deleteNodeNow').d('确认删除当前节点？') :
        intl.get('sinv.receiptManage.view.title.deleteStrategyNow').d('确认删除当前策略？'),
      onOk: async () => {
        const data = [
          formRef?.current?.ds?.current?.toJSONData(),
        ];
        setBtnLoading(true);
        const res = await handleDelete(data, tabsKey);
        if (getResponse(res)) {
          onBack();
          (notification as any).success();
          history.push({
            pathname: `/sinv/receipt-manage-config/list`,
            tabsKey,
          });
        } else {
          setBtnLoading(false);
        };
      }
    });
  }

  const handleBackPath = (editor) => {
    history.push({
      pathname: `/sinv/receipt-manage-config/detail/${params.id || nodeStrategyId}`,
      search: `?tabsKey=${tabsKey}&editor=${editor}`,
    });
    handleQueryHeaderInfo();
  };

  /**
     * 收货管理配置 - 行按钮删除
     * @delivery {*} params
     * return
   */
  const handleDeleteLine = (dataSet, type) => {
    const lines = dataSet?.selected.map((item: any) => item.toData()) || [];
    const id = type === 'system' ? 'mappingId' : 'reverseConfigId';
    const deleteFlag = lines.some((i) => i[id]);
    if (deleteFlag) {
      if (!isEmpty(lines)) {
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm').d('提示'),
          children: intl.get('sinv.receiptManage.view.message.delete').d('确认删除选中行？'),
          onOk: async () => {
            try {
              setBtnLoading(true);
              const res = getResponse(await handleDelete(lines, type));
              if (res) {
                (notification as any).success();
                dataSet.query();
              }
            } catch (e) {
              throw (e)
            } finally {
              setBtnLoading(false);
            }
          },
        });
      }
    } else {
      dataSet.remove(dataSet.selected);
    }
  };

  /**
     * 收货管理配置 - 行按钮
     * @delivery {*} params
     * return element
   */
  const buttons = (ds, type) => {
    const Buttons = observer((propsParam: BtnProps): any => {
      const { dataSet } = propsParam;
      const selected = dataSet?.selected.map((item: any) => item.toData());
      const name = type === 'system' ? 'mappingId' : 'reverseConfigId';
      const btns = [
        <>
          <Button
            icon="playlist_add"
            funcType={FuncType.flat}
            color={ButtonColor.primary}
            loading={btnLoading}
            onClick={() => dataSet?.create({
              name: '',
              nodeConfigId: params.id || nodeStrategyId,
              tenantId: organizationId,
            }, 0)}
          >
            {intl.get('hzero.common.button.add').d('新增')}
          </Button>
          <Button
            icon="delete_sweep"
            funcType={FuncType.flat}
            color={ButtonColor.primary}
            disabled={isEmpty(selected)}
            loading={btnLoading}
            onClick={() => handleDeleteLine(dataSet, type)}
          >
            {intl.get('hzero.common.button.batchDelete').d('批量删除')}
          </Button>
        </>,
      ];
      return btns;
    });
    return [<Buttons dataSet={ds} />];
  };

  /**
     * 收货管理配置 - 返回列表
     * @delivery {*} params
     * return
   */
  const onBack = () => {
    history.replace({
      tabsKey,
    });
  };

  const modalProps = {
    tabsKey,
    column: 3,
    deps: workFlag,
    spinning: loading,
    readOnly: editor === "0"? true : false,
    componentData: tabsKey === 'node' ?
      nodeCreateFormParams : reverseCreateFormParams,
    nodeStrategyId,
  };
  const chartsProps = {
    editor,
    tabsKey,
    formRef,
    workFlag,
    chartList,
    flowChartsDs,
    readOnly: editor === "0" ? true : false,
    chartsId: params.id || nodeStrategyId,
    handleQueryHeaderInfo,
    nodeStrategyId,
  };

  const pathListUrl = '/sinv/receipt-manage-config/list';
  return <>
    {isNil(nodeStrategyId) ?
      (<div className={styles["header-style"]}>
        {tabsKey !== 'node' && !edKey && editor === "1" && <div>
          <div className={styles["back-style"]}>
            <Tooltip
              title={intl.get('hzero.common.button.back').d('返回')}
              placement="bottom"
              // getTooltipContainer={(that) => that}
            >
              <div onClick={()=>handleBackPath("0")} className={styles['back-style-dev']}>
              <Icon type="arrow_back" className={styles["back-style-icon"]} />
              </div>
            </Tooltip>
          </div>
        </div>}
        <Header
        className={tabsKey !== 'node' && edKey && editor === "0" && styles['header-style-box']}
        title={tabsKey === 'node' ?
          intl.get('sinv.receiptManage.view.title.receiptNodeManage').d('编辑业务节点') :
          editor === "1" ? intl.get('sinv.receiptManage.view.title.receiptStrategyManage').d('编辑业务策略') :
            intl.get('sinv.receiptManage.view.title.receiptStrategyManageRead').d('查看业务策略')}
        backPath={tabsKey === 'node'?pathListUrl :  !edKey && editor === "1" ?  '' : pathListUrl}
        onBack={() => onBack()}
      >
        <>
          {editor === "1" && (
            <Button
              icon="save"
              color={ButtonColor.primary}
              // funcType={FuncType.flat}
              onClick={handleSaveInfo}
              loading={btnLoading || loading}
              disabled={isNil(formRef.current?.ds?.current?.get('_token'))}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          )}
          {editor === "1" && (
            <Button
              icon="delete"
              funcType={FuncType.flat}
              onClick={handleDeleteInfo}
              loading={btnLoading || loading}
              disabled={tabsKey === 'node' && trxLineCount > 0 || isNil(formRef.current?.ds?.current?.get('_token'))}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          )}
          {editor === "0" && (
            <Button
              icon="mode_edit"
              // funcType={FuncType.flat}
              color={ButtonColor.primary}
              onClick={()=>handleBackPath("1")}
              loading={btnLoading || loading}
            >
              {intl.get('sinv.receiptManage.view.button.edit').d('编辑')}
            </Button>
          )}
        </>
        </Header>
      </div>)
      : null
    }
    <div className={nodeStrategyId ? styles['content-hidden'] : styles['content-auto']}>
      {nodeStrategyId ? (<>
        <div>
          <h3 className={styles['title-h3']} id="delivery-downstream">
            <div className={styles.block} />
            {intl.get(`sinv.receiptManage.view.title.receipHeaderInfo`).d('基础信息')}
          </h3>
        </div>
        <Spin spinning={loading}>
          <CustomForm  {...modalProps} ref={formRef} />
          <div />
        </Spin>
      </>) : (
          <Content
            className={styles['content-marg-header']}
          >
        <div>
          <h3 className={styles['page-title']}>
            {intl.get(`sinv.receiptManage.view.title.receipHeaderInfo`).d('基础信息')}
          </h3>
        </div>
        <Spin spinning={loading}>
          <CustomForm  {...modalProps} ref={formRef} />
          <div />
        </Spin>
      </Content>)}
      {tabsKey === 'node' && (
        <>
          <Content className={styles['content-marg']}>
            <div>
              <h3 className={styles['page-title']}>
                {intl.get(`sinv.receiptManage.view.title.tenantDeliveryLineInfo`).d('租户收货类型明细')}
              </h3>
              <Alert
                banner
                closable
                type="info"
                style={{ marginBottom: 8, color: "#1890ff"}}
                message={intl.get(`sinv.receiptManage.view.title.detailDeliveryTitleLabel`).
                  d('支持维护不同系统来源的收货类型编码及描述，请至少填写一个收货类型')}
              />
            </div>
            <Table
                dataSet={nodeDs}
                boxSizing={TableBoxSizing.wrapper}
                style={{ maxHeight: 530 }}
                columns={lineDataColumns(delivery)}
                buttons={buttons(nodeDs, 'system')}
                customizable
                customizedCode="new-strategy-receiptManageConfig-workbench"
                />
          </Content>
          <Content className={styles['content-marg']}>
            <div>
              <div className={styles['return-tit']}>
                <h3 className={styles['page-title']}>
                  {intl.get(`sinv.receiptManage.view.title.tenantReturnLineInfo`).d('租户退货类型明细')}
                </h3>
                <Alert
                  // className={styles['alter-col']}
                  banner
                  closable
                  type="info"
                  style={{ marginBottom: 8, color: "#1890ff" }}
                  message={intl.get(`sinv.receiptManage.view.title.detailReturnTitleLabel`).
                    d('支持维护不同系统来源的退货类型编码及描述，如果没有退货，则无需维护，如有，则至少维护一个退货类型')}
                />
                {reverseEnableFlag && (
                  <div className={styles['check-box-return']}>
                    <CheckBox disabled={workFlag ? !workFlag : checkoutBoxFlag} checked={reverseEnableFlag} onChange={handleCeckBoxChange}>
                      {intl.get(`sinv.receiptManage.view.title.returnOpen`).d('启用退货')}
                    </CheckBox>
                  </div>
                )}
              </div>
            </div>
            {reverseEnableFlag && (
              <Table
              boxSizing={TableBoxSizing.wrapper}
              style={{ maxHeight: 530 }}
               columns={lineDataColumns(returned)}
               dataSet={returnDs}
               buttons={buttons(returnDs, 'reverse')}
               customizable
               customizedCode="new-strategy-receiptManageConfig-workbench"
               />
            )}
            {!reverseEnableFlag && (
              <Card
                type={tabsKey}
                handleCeckBoxChange={handleCeckBoxChange}
                checkoutBoxFlag={workFlag ? !workFlag : checkoutBoxFlag}
              />)}
          </Content>
        </>
      )}

      {tabsKey === 'strategy' && nodeStrategyId ? (
        <Store.Provider value={chartsProps}>
          <NewCharts ref={flowChartsRef} />
        </Store.Provider>
      ) : tabsKey === 'strategy' && (
        <Content className={styles['content-marg']}>
          <Store.Provider value={chartsProps}>
            <NewCharts ref={flowChartsRef} />
          </Store.Provider>
        </Content>
      )
      }
    </div>
  </>
};


export default formatterCollections({
  code: ['sinv.receiptManage', 'hzero.common'],
})(
  connect(({ _, receiptManageConfig = {} }) => ({
    _,
    receiptManageConfig,
  }))(SlodStatusHOC(Detail))
);
