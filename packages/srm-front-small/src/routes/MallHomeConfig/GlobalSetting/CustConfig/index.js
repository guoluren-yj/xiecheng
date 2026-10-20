import React, { useMemo, useEffect } from 'react';
import { compose } from 'lodash';
import { connect } from 'dva';
import { Form, DataSet, Select, NumberField, CheckBox } from 'choerodon-ui/pro';

import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { fetchCustConfig } from '@/services/mallHomeConfigService';
import ComContent from '../../common/ComContent';
import SortSearch from './SortSearch';
import SortMenu from './SortMenu';
import SortMallMenu from './SortMallMenu';

const organizationId = getCurrentOrganizationId(); // 租户ID

function CustConfig({ returnList = e => e }) {
  const ds = useMemo(() => {
    return new DataSet({
      autoQuery: false,
      autoCreate: true,
      fields: [
        {
          name: 'purchasFileSize',
          required: true,
          min: 5,
          max: 100,
          label: intl
            .get('small.mallHomeConfig.custConfig.fields.preUuidSize')
            .d('采购申请附件大小'),
        },
        {
          name: 'manualFileSize',
          required: true,
          min: 5,
          max: 100,
          label: intl.get('small.mallHomeConfig.custConfig.fields.uuidSize').d('手工申请附件大小 '),
        },
        {
          name: 'defaultSort',
          label: intl.get('small.mallHomeConfig.custConfig.fields.defaultSort').d('默认排序'),
          lookupCode: 'SMAL.QUERY_DEFAULT_SORT',
        },
        {
          name: 'stockMode',
          required: true,
          label: intl.get('small.mallHomeConfig.custConfig.fields.stockMode').d('默认显示'),
          lookupCode: 'SMAL.PRODUCT_FILTER_TYPE',
          defaultValue: 0,
        },
        // {
        //   name: 'unitShowType',
        //   label: intl.get('small.mallHomeConfig.custConfig.fields.unitShowType').d('显示方式'),
        //   lookupCode: 'SMAL.UNIT_ALIAS_CONFIG',
        // },
        {
          name: 'pageJumpConfig',
          label: intl.get('small.mallHomeConfig.custConfig.fields.pageJumpNew').d('跳转新页面'),
          trueValue: 'JUMP_NEW',
          falseValue: 'NO_JUMP',
          // lookupCode: 'SMAL.PAGE_JUMP_TYPE',
        },
        {
          name: 'botShowConfig',
          label: intl.get('small.mallHomeConfig.view.show').d('显示'),
          trueValue: 'SHOW',
          falseValue: 'HIDE',
          // lookupCode: 'SMAL.BOT_SHOW_CONFIG',
        },
        {
          name: 'waitPayShowConfig',
          label: intl.get('small.mallHomeConfig.custConfig.fields.waitPayShowFlag').d('显示待支付'),
          trueValue: 'SHOW',
          falseValue: 'HIDE',
          // lookupCode: 'SMAL.SHOW_CONFIG',
        },
        {
          name: 'waitApproveShowConfig',
          label: intl
            .get('small.mallHomeConfig.custConfig.fields.waitApproveShowFlag')
            .d('显示待审批'),
            trueValue: 'SHOW',
            falseValue: 'HIDE',
          // lookupCode: 'SMAL.SHOW_CONFIG',
        },
      ],
    });
  }, []);

  const itemList = [
    {
      code: 'A',
      title: intl.get('small.mallHomeConfig.view.custConfig.A').d('附件大小限制'),
      id: 'small-MallHomeConfig-cust-A',
      desc: intl
        .get('small.mallHomeConfig.view.custConfig.Adesc')
        .d('可对商城目录化/电商采购申请附件、手工申请附件的大小进行配置。单位为m，最大限制100m。'),
      children: (
        <>
          <NumberField name="purchasFileSize" style={{marginRight: 16, width: 213}} />
          <NumberField name="manualFileSize" style={{width: 213}} />
        </>
      ),
    },
    {
      code: 'C',
      title: intl.get('small.mallHomeConfig.view.custConfig.C').d('商城搜索条件配置'),
      id: 'small-MallHomeConfig-cust-C',
      desc: intl
        .get('small.mallHomeConfig.view.custConfig.Cdesc1')
        .d(
          '可配置商城搜索条件是否显示并对其进行拖拽排序，第一个为默认搜索条件，请注意【商品】不可隐藏。'
        ),
      children: (
        <div colSpan={3}>
          <SortSearch dataSet={ds} />
        </div>
      ),
    },
    {
      code: 'B',
      title: intl.get('small.mallHomeConfig.view.custConfig.B').d('搜索结果排序'),
      id: 'small-MallHomeConfig-cust-B',
      desc: intl
        .get('small.mallHomeConfig.view.custConfig.Bdesc1')
        .d(
          '可对商城搜索结果进行默认排序方式'
        ),
      children: (
        <>
          <Select name="defaultSort" style={{width: 213}} />
          <div />
        </>
      ),
    },
    {
      code: 'J',
      title: intl.get('small.mallHomeConfig.view.custConfig.J').d('主站搜索页无货商品展示配置'),
      id: 'small-MallHomeConfig-cust-J',
      desc: (
        <p style={{marginBottom: 16}}>
          {intl
            .get('small.mallHomeConfig.view.custConfig.Jdesc1')
            .d('可配置主站搜索页默认显示商品范围')}
        </p>
      ),
      children: (
        <>
          <Select name="stockMode" style={{width: 213}} />
          <div />
        </>
      ),
    },
    {
      code: 'D',
      title: intl.get('small.mallHomeConfig.view.custConfig.D').d('快速链接配置'),
      id: 'small-MallHomeConfig-cust-D',
      desc: intl
        .get('small.mallHomeConfig.view.custConfig.Ddesc1')
        .d('可配置商城首页banner右侧的快速链接并对其进行拖拽排序。'),
      children: (
        <div colSpan={3}>
          <SortMenu dataSet={ds} />
        </div>
      ),
    },
    // {
    //   code: 'E',
    //   title: intl.get('small.mallHomeConfig.view.custConfig.E').d('商城选买组织名称显示配置'),
    //   id: 'small-MallHomeConfig-cust-E',
    //   desc: intl
    //     .get('small.mallHomeConfig.view.custConfig.Edesc1')
    //     .d('可配置主站采买组织名称的显示方式'),
    //   children: (
    //     <>
    //       <Select name="unitShowType" />
    //       <div />
    //     </>
    //   ),
    // },
    {
      code: 'F',
      title: intl.get('small.mallHomeConfig.view.custConfig.F').d('商城主站页面跳转配置'),
      id: 'small-MallHomeConfig-cust-F',
      desc: intl
        .get('small.mallHomeConfig.view.custConfig.Fdesc1')
        .d('可配置主站页面跳转是否打开新的tab页，还是在原页面上加载'),
      children: (
        <>
          <CheckBox name="pageJumpConfig" />
          {/* <Select name="pageJumpConfig" /> */}
          <div />
        </>
      ),
    },
    {
      code: 'G',
      title: intl.get('small.mallHomeConfig.view.custConfig.G').d('智能客服开启配置'),
      id: 'small-MallHomeConfig-cust-G',
      desc: intl.get('small.mallHomeConfig.view.custConfig.Gdesc1').d('可配置智能客服'),
      children: (
        <>
          <CheckBox name="botShowConfig" />
          <div />
        </>
      ),
    },
    {
      code: 'H',
      title: intl.get('small.mallHomeConfig.view.custConfig.H').d('我的订单显示阶段配置'),
      id: 'small-MallHomeConfig-cust-H',
      desc: intl
        .get('small.mallHomeConfig.view.custConfig.Hdesc1')
        .d('可配置主站我的订单待支付/待审批阶段是否展示'),
      children: (
        <>
          <CheckBox name="waitPayShowConfig" style={{marginRight: 16, width: 213}} />
          <CheckBox name="waitApproveShowConfig" />
        </>
      ),
    },
    {
      code: 'I',
      title: intl.get('small.mallHomeConfig.view.custConfig.I').d('我的商城菜单配置'),
      id: 'small-MallHomeConfig-cust-I',
      desc: intl
        .get('small.mallHomeConfig.view.custConfig.Idesc1')
        .d('可对我的商城中左侧菜单进行拖拽排序'),
      children: (
        <>
          <SortMallMenu name="myMallSortMenu" dataSet={ds} />
          <div />
        </>
      ),
    },
  ];

  useEffect(() => {
    fetchDetail();
    returnList({ ds, itemList });
  }, []);

  async function fetchDetail() {
    const res = (await getResponse(fetchCustConfig())) || {};
    ds.current.set({
      ...res,
      tenantId: organizationId,
      purchasFileSize: res.purchasFileSize || 100,
      manualFileSize: res.manualFileSize || 100,
      pageJumpConfig: res.pageJumpConfig || 'JUMP_NEW',
      botShowConfig: res.botShowConfig || 'SHOW',
      waitPayShowConfig: res.waitPayShowConfig || 'SHOW',
      waitApproveShowConfig: res.waitApproveShowConfig || 'SHOW',
    });
  }

  return (
    <div className="config-list-content-list">
      <Form dataSet={ds} columns={3} labelLayout="float">
        {itemList
          .filter(i => i.visible !== false)
          .map((m, j) => {
            return (
              <div colSpan={3}>
                <div colSpan={3}>
                  <ComContent
                    id={m.id}
                    title={m.title}
                    style={{ marginBottom: 8, marginTop: j > 0 ? 16 : 0 }}
                  >
                    <p style={{ marginBottom: 16 }}>{m.desc}</p>
                  </ComContent>
                </div>
                {m.children}
              </div>
            );
          })}
      </Form>
    </div>
  );
}

export default compose(
  connect(({ mallHome }) => ({
    mallHome,
  }))
)(CustConfig);
