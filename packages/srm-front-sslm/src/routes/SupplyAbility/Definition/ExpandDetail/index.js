/*
 * @Date: 2022-02-16 18:57:49
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import qs from 'querystring';
import React, { Component, Fragment } from 'react';
import { Card } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { DataSet, Button, Spin } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import { routerRedux } from 'dva/router';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { Button as PermissionButton } from 'components/Permission';

import styles from '@/routes/index.less';
import { handleSupplierDetail } from '@/routes/components/utils/utils';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import { submitExpand, abandonExpand } from '@/services/supplyAbilityService';
import BaseInfo from './BaseInfo';
import CategoryTable from './CategoryTable';
import { getBaseInfo, getCategoryList } from '../stores/getExpandDS';

const customizeUnitCode = [
  'SSLM.SUPPLIER_ABLILITY_DEFINITION.EXPAND_BASE_INFO',
  'SSLM.SUPPLIER_ABLILITY_DEFINITION.EXPAND_CATEGORY_LIST',
];

@formatterCollections({
  code: ['sslm.supplyAbility', 'sslm.common', 'sslm.supplierReview', 'sslm.supplierDetail'],
})
@WithCustomize({
  unitCode: [
    'SSLM.SUPPLIER_ABLILITY_DEFINITION.EXPAND_BASE_INFO',
    'SSLM.SUPPLIER_ABLILITY_DEFINITION.EXPAND_CATEGORY_LIST',
  ],
})
@observer
export default class ExpandDetail extends Component {
  constructor(props) {
    super(props);
    const {
      location,
      match: {
        params: { supplyAbilityExpandId },
      },
    } = this.props;
    const routerParam = qs.parse(location.search.substr(1)); // 是否从列表跳转
    const { sourceType } = routerParam;
    const isPub = props.location.pathname.match('/pub/');
    this.baseInfoDs = new DataSet(getBaseInfo({ supplyAbilityExpandId }));
    this.categoryDs = new DataSet(getCategoryList({ supplyAbilityExpandId }));
    this.state = {
      isPub,
      sourceType,
      status: '',
      optionLoading: false,
      baseInfoLoading: false,
      supplyAbilityExpandId,
    };
  }

  componentDidMount() {
    this.queryDetail();
  }

  // 查询详情
  @Bind()
  queryDetail() {
    this.setState({ baseInfoLoading: true });
    this.baseInfoDs.query().then(res => {
      if (res) {
        const { supplyAbilityExpandStatus } = res;
        this.setState({ status: supplyAbilityExpandStatus, baseInfoLoading: false });
      }
    });
    this.categoryDs.query();
  }

  // 保存回调
  @Bind()
  handleSave() {
    if (this.baseInfoDs.dirty) {
      this.setState({ optionLoading: true });
      return this.baseInfoDs.submit().finally(() => {
        this.setState({ optionLoading: false });
      });
    } else {
      notification.warning({
        message: intl.get('sslm.common.view.message.noNeedSaveData').d('暂无需要保存的数据！'),
      });
    }
  }

  // 提交审批
  @Bind
  handleSubmit() {
    const { dispatch } = this.props;
    this.setState({ optionLoading: true });
    const payload = {
      submitList: this.baseInfoDs.toData(),
      customizeUnitCode: customizeUnitCode.join(','),
    };
    return submitExpand(payload)
      .then(response => {
        const res = getResponse(response);
        if (res) {
          notification.success();
          dispatch(
            routerRedux.push({
              pathname: '/sslm/supplier-ablility-definition/list',
            })
          );
        }
      })
      .finally(() => {
        this.setState({ optionLoading: false });
      });
  }

  // 废弃回调
  @Bind()
  handldAbandon() {
    const { dispatch } = this.props;
    this.setState({ optionLoading: true });
    const payload = {
      abandonList: this.baseInfoDs.toData(),
      customizeUnitCode: customizeUnitCode.join(','),
    };
    return abandonExpand(payload)
      .then(response => {
        const res = getResponse(response);
        if (res) {
          notification.success();
          dispatch(
            routerRedux.push({
              pathname: '/sslm/supplier-ablility-definition/list',
            })
          );
        }
      })
      .finally(() => {
        this.setState({ optionLoading: false });
      });
  }

  // 操作记录
  @Bind()
  handleOperate() {
    const { supplyAbilityExpandId } = this.state;
    operationRecordsModal({
      documentId: supplyAbilityExpandId,
      documentType: 'expandAbility',
      supplyAbilityExpandId,
    });
  }

  render() {
    const { status, sourceType, optionLoading, isPub, baseInfoLoading } = this.state;
    const { customizeForm, customizeTable, custLoading } = this.props;
    const isEdit = ['NEW', 'REJECT'].includes(status) && !isPub;
    const allLoading = optionLoading || baseInfoLoading;
    return (
      <Fragment>
        <Header
          backPath={isPub ? '' : '/sslm/supplier-ablility-definition/list'}
          title={intl.get('sslm.supplyAbility.view.tab.expandSupplyAbility').d('拓展中供货能力')}
        >
          {isEdit && (
            <Fragment>
              <Button
                icon="check"
                color="primary"
                loading={allLoading}
                onClick={this.handleSubmit}
                disabled={isEmpty(this.categoryDs.toData())}
                wait={500}
                waitType="throttle"
              >
                {intl.get('sslm.common.button.submitApproval').d('提交审批')}
              </Button>
              <Button
                icon="save"
                funcType="flat"
                loading={allLoading}
                onClick={this.handleSave}
                wait={500}
                waitType="throttle"
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
              <Button
                icon="cancel"
                funcType="flat"
                loading={allLoading}
                onClick={this.handldAbandon}
                wait={500}
                waitType="throttle"
              >
                {intl.get('sslm.common.button.discard').d('废弃')}
              </Button>
            </Fragment>
          )}
          <Button
            icon="operation_service_request"
            funcType="flat"
            loading={allLoading}
            onClick={this.handleOperate}
            wait={500}
            waitType="throttle"
          >
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </Button>
          <PermissionButton
            icon="find_in_page"
            funcType="flat"
            type="c7n-pro"
            onClick={() =>
              handleSupplierDetail({ ...this.baseInfoDs?.current.toData(), sourceType })
            }
            loading={allLoading}
            permissionList={[
              {
                code: 'srm.partner.suplier-ability.supply-ability-define.ps.expand.supplier.info',
                type: 'button',
                meaning: '查看供应商360信息',
              },
            ]}
          >
            {intl.get('sslm.supplierReview.view.button.supplierInfo').d('查看供应商360信息')}
          </PermissionButton>
        </Header>
        <Content style={{ padding: 0, margin: 0, backgroundColor: 'rgba(0,0,0,0)' }}>
          <div className={styles['card-wrap']}>
            <Content>
              <Card id="baseInfo" bordered={false}>
                <div className={styles['card-title']}>
                  {intl.get('sslm.common.view.title.baseInfo').d('基础信息')}
                </div>
                <Spin dataSet={this.baseInfoDs}>
                  <BaseInfo
                    isEdit={isEdit}
                    custLoading={custLoading}
                    dataSet={this.baseInfoDs}
                    customizeForm={customizeForm}
                  />
                </Spin>
              </Card>
            </Content>
            <Content>
              <Card id="baseInfo" bordered={false} style={{ minHeight: 'calc(100vh - 488px)' }}>
                <div className={styles['card-title']}>
                  {intl.get('sslm.supplyAbility.view.title.expandedCategory').d('扩展品类/物料')}
                </div>
                <CategoryTable
                  isEdit={isEdit}
                  custLoading={custLoading}
                  dataSet={this.categoryDs}
                  customizeTable={customizeTable}
                />
              </Card>
            </Content>
          </div>
        </Content>
      </Fragment>
    );
  }
}
