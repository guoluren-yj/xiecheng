/*
 * @Date: 2023-04-06 10:19:06
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { compose } from 'lodash';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import { Button, useDataSet, Spin } from 'choerodon-ui/pro';
import React, { Fragment, useState, useCallback, useEffect, useMemo } from 'react';
import remote from 'utils/remote';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getResponse, filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { saveAll } from '@/services/supplierInformService';
import { querySupplierInfoById } from '@/services/commonService';
import { getSupplierLovConfig } from '@/routes/components/utils/utils';

import Detail from './Detail';
import styles from './styles.less';
import { getBasicDS } from '../stores/getBasicDS';

const Index = ({ dispatch, location, custLoading, customizeForm, supplierInformCreateRemote }) => {
  const [loading, setLoading] = useState(false);
  const [showOldModal, setShowOldModal] = useState(false);
  const [otherModalProps, setOtherModalProps] = useState({}); // 增加SupplierLov筛选条件
  // 标准dsprops
  const headerDsProps = getBasicDS();
  // 埋点修改后的ds属性
  const newHeaderDsProps = supplierInformCreateRemote
    ? supplierInformCreateRemote.process(
        'SSLM_SUPPLIER_INFORM_NEW_CREATE_PROCESS',
        headerDsProps,
        {}
      )
    : headerDsProps;
  const dataSet = useDataSet(() => newHeaderDsProps, [showOldModal]);
  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [
    location.search,
  ]);
  const { supplierCompanyId } = routerParams;

  useEffect(() => {
    getSupplierLovConfig(setShowOldModal);
  }, []);

  useEffect(() => {
    handleCreateInfo();
    handleOtherParams();
  }, [dataSet, supplierCompanyId]);

  const handleOtherParams = useCallback(async () => {
    if (supplierInformCreateRemote) {
      const res = await supplierInformCreateRemote.process(
        'SSLM_SUPPLIER_INFORM_NEW_CREATE_SUPPLIER_LOV_OTHER_MODAL_PROPS',
        { dataSet }
      );
      setOtherModalProps(res);
    }
  }, [dataSet]);

  // 供应商管理工作台-操作指引跳转过来的新建
  const handleCreateInfo = useCallback(async () => {
    if (supplierCompanyId) {
      querySupplierInfoById({ supplierCompanyId }).then(response => {
        const res = getResponse(response);
        if (res) {
          const {
            partnerTenantId,
            partnerCompanyId,
            supplierCompanyNum,
            supplierCompanyName,
            ...others
          } = res;
          dataSet.create({
            supplierTenantId: partnerTenantId,
            supplierCompanyId: partnerCompanyId,
            supplierCompanyNum,
            supplierCompanyName,
            ...others,
          });
        }
      });
    } else {
      // 埋点 修改后的初始化ds方法
      if (supplierInformCreateRemote.event) {
        const eventProps = {
          dataSet,
        };
        // 默认返回true,当返回false时走二开逻辑不走标准逻辑
        const res = await supplierInformCreateRemote.event.fireEvent(
          'cuxHandleCreateInfo',
          eventProps
        );
        if (!res) {
          return;
        }
      }
      dataSet.create({}); // 清空缓存数据-路由参数从有到无
    }
  }, [dataSet, supplierCompanyId]);

  // 保存回调
  const handleSave = useCallback(async () => {
    const validateFlag = dataSet.current && (await dataSet.current.validate(true));
    if (validateFlag) {
      const payload = {
        supplierChangeReq: dataSet.current.toJSONData(),
        customizeUnitCode: ['SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.BASIC'],
      };
      setLoading(true);
      return saveAll(payload)
        .then(response => {
          const res = getResponse(response);
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: '/sslm/supplier-inform-change-new/detail/edit',
                search: querystring.stringify(
                  filterNullValueObject({
                    changeReqId: res.changeReqId,
                    investgHeaderId: res.investgHeaderId,
                    investigateTemplateId: res.investigateTemplateId,
                  })
                ),
              })
            );
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [dataSet]);

  return (
    <Fragment>
      <Header
        backPath="/sslm/supplier-inform-change-new/list"
        title={intl.get('sslm.common.view.message.createApplication').d('新建申请单')}
      >
        <Button icon="save" color="primary" loading={loading} onClick={handleSave}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      </Header>
      <Content wrapperClassName={styles['supplier-info-create']}>
        <Spin spinning={loading}>
          <Detail
            dataSet={dataSet}
            custLoading={custLoading}
            customizeForm={customizeForm}
            showOldModal={showOldModal}
            otherModalProps={otherModalProps}
          />
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.common', 'sslm.supplierInform'],
  }),
  withCustomize({
    unitCode: ['SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.BASIC'],
  }),
  remote({
    code: 'SSLM_SUPPLIER_INFORM_NEW_CREATE', // 对应二开模块暴露的Expose的编码
    name: 'supplierInformCreateRemote', // 默认 'remote'， 如有属性冲突可以改此属性
  })
)(Index);
