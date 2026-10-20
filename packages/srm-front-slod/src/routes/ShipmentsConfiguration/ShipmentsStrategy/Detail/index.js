/*
 * @Description: index
 * @Date: 2021-11-24 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, useEffect, useMemo, useState, createContext } from 'react';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import { compose, isNil } from 'lodash';
import qs from 'querystring';
import { observer } from 'mobx-react-lite';
import { getResponse } from 'utils/utils';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { Header } from 'components/Page';

import {
  deleteOnChangeStr,
  pubOnChangeDetail,
  saveOnChangeStr,
} from '@/services/ShipmentsConfigurationService';
import DetailHeaderinfo from './detailHeaderInfo';
// import DetailCharts from './flowCharts';
import NewCharts from './newCharts';
import { formDS } from './store/detailHeaderInfoDS';
import { chartsDS, chartsAddDS } from './store/chartsDS';
import Buttonv from '../../components/DetailVersionBtn';

import styles from './index.less';

export const Store = createContext();

const DetailIndex = (props) => {
  const { form, history, math = {}, location } = props;
  const { search } = location || {};

  const chartsRef = React.useRef({});
  const { id, from, classify, dataVersion } = qs?.parse(search?.substr(1));
  const [canEditLineFlag, useCanEdit] = useState(0);
  const formDs = useMemo(() => new DataSet(formDS(id)), [id, math?.id]);
  const chartsDs = useMemo(() => new DataSet(chartsDS(formDs, !isNil(math?.id))), [id, math?.id]);
  const chartsAddDs = useMemo(() => new DataSet(chartsAddDS()), [id, math?.id]);
  useEffect(() => {
    formDs.clear();
    queryHeaderInfo();
  }, [id, math?.id]);

  const queryHeaderInfo = () => {
    if (id || math?.id) {
      formDs.setQueryParameter('params', {
        strategyHeaderId: id || math?.id,
        flag: !isNil(math?.id), // 判断是否引用推荐配置
      });
      formDs.query().then((res) => {
        if (getResponse(res)) {
          useCanEdit(res.canEditLineFlag);
        }
      });
    }
  };

  const menuClick = (menu) => {
    history.push({
      pathname: `/slod/shipments-configuration/detail`,
      search: `?id=${id}&from=strategy&classify=history&dataVersion=${menu}`,
    });
    if (chartsRef.current) chartsRef.current.clearText(menu);
  };

  /**
   * 明细页保存
   */
  const saveOnChange = async () => {
    const headerFlag = await formDs.validate();
    if (headerFlag) {
      const params = { ...formDs?.current?.toData(), strategyLines: [] };
      const res = getResponse(await saveOnChangeStr(params));
      if (res) {
        notification.success();
        if (!id) {
          history.push({
            pathname: `/slod/shipments-configuration/detail`,
            search: `?id=${res?.strategyHeaderId}&from=strategy`,
          });
        }
        queryHeaderInfo();
      }
    }
  };

  /**
   * 删除数据
   */
  const deleteOnChange = async () => {
    const params = formDs?.current?.toData();
    if (!formDs?.current?.get('_token')) return;
    Modal.confirm({
      contentStyle: { width: '550px' },
      title: intl.get('slod.deliveryWorkbench.view.message.hint').d(`提示`),
      children: intl.get('slod.deliveryWorkbench.view.message.delete').d(`确认删除？`),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: async () => {
        const res = getResponse(await deleteOnChangeStr([params]));
        if (getResponse(res)) {
          notification.success();
          history.replace({
            from,
          });
          history.push({
            pathname: `/slod/shipments-configuration/list`,
            from: `strategy`,
          });
        }
      },
    });
  };

  /**
   * 发布
   */
  const pubOnChange = async () => {
    const params = {
      ...formDs?.current?.toData(),
      strategyLines: [],
    };
    const headerFlag = await formDs.validate();
    if (!formDs?.current?.get('_token')) return;
    if (headerFlag) {
      const res = getResponse(await pubOnChangeDetail(params));
      if (getResponse(res)) {
        notification.success();
        history.push({
          pathname: `/slod/shipments-configuration/list`,
          from: `strategy`,
        });
      }
    }
  };

  const onEditorOnChange = () => {
    history.push({
      pathname: `/slod/shipments-configuration/detail`,
      search: `?id=${id}&from=strategy`,
    });
  };

  /**
   * 头按钮-组件
   */
  const HeaderBtn = observer(() => {
    return (
      <>
        {classify !== 'history' && id && (
          <Button
            disabled={!id || classify === 'history' || !formDs?.current?.get('_token')}
            icon="publish2"
            type="c7n-pro"
            color="primary"
            onClick={() => pubOnChange()}
          >
            {intl.get(`slod.shipmentsConfiguration.view.title.detail.publish`).d('发布')}
          </Button>
        )}
        {classify !== 'history' && (
          <Button
            icon="save"
            funcType={id && 'flat'}
            type="c7n-pro"
            color={!id && 'primary'}
            onClick={() => saveOnChange()}
            disabled={classify === 'history'}
          >
            {intl.get(`slod.shipmentsConfiguration.view.title.detail.save`).d('保存')}
          </Button>
        )}
        {classify !== 'history' && id && (
          <Button
            disabled={!id || classify === 'history' || !formDs?.current?.get('_token')}
            icon="delete"
            type="c7n-pro"
            funcType="flat"
            onClick={() => deleteOnChange()}
          >
            {intl.get(`slod.shipmentsConfiguration.view.title.detail.delete`).d('删除')}
          </Button>
        )}
        {classify === 'history' && !dataVersion && (
          <Button
            icon="mode_edit"
            type="c7n-pro"
            color="primary"
            onClick={() => onEditorOnChange()}
          >
            {intl.get(`slod.shipmentsConfiguration.view.title.detail.editor`).d('编辑')}
          </Button>
        )}
        {id && <Buttonv id={id} menuClick={menuClick} />}
      </>
    );
  });

  const onBack = () => {
    history.replace({
      from,
    });
  };

  const formProps = {
    formDs,
    id: id || math?.id,
    urlFlag: !isNil(math?.id),
    classify: classify || math?.classify,
  };

  const chartsProps = {
    form,
    formDs,
    chartsDs,
    chartsAddDs,
    dataVersion,
    urlFlag: !isNil(math?.id),
    canFlag: canEditLineFlag,
    strategyHeaderId: id || math?.id,
    classify: classify || math?.classify,
    headerShowFlag: math?.headerShowFlag,
    queryHeaderInfo,
  };

  const backList = `/slod/shipments-configuration/list`;
  return (
    <Fragment>
      {!math?.headerShowFlag && (
        <>
          <Header
            title={
              classify === 'history'
                ? dataVersion
                  ? `${intl
                      .get('slod.deliveryWorkbench.view.title.policyDetailsReadly')
                      .d('查看策略明细')}-v${dataVersion}`
                  : intl
                      .get('slod.deliveryWorkbench.view.title.policyDetailsReadly')
                      .d('查看策略明细')
                : intl.get('slod.deliveryWorkbench.view.title.policyDetails').d('编辑策略明细')
            }
            backPath={backList}
            onBack={() => onBack()}
          >
            <HeaderBtn />
          </Header>
          <div>
            <div className={styles['content-header']}>
              <h3 className={styles['page-title']}>
                {intl
                  .get(`slod.shipmentsConfiguration.view.title.detail.basicInformation`)
                  .d('基本信息')}
              </h3>
              <DetailHeaderinfo {...formProps} />
            </div>
            {(id || math?.id) && (
              // <Content className={styles['content-line']}>
              <div className={styles['content-line']}>
                <Store.Provider value={chartsProps}>
                  <NewCharts ref={chartsRef} />
                </Store.Provider>
              </div>
              // </Content>
            )}
          </div>
        </>
      )}
      {math?.headerShowFlag && (
        <>
          <div style={{ marginBottom: 32 }}>
            <h4 className={styles['info-title']}>
              <div className={styles.block} />
              {intl
                .get(`slod.shipmentsConfiguration.view.title.detail.basicInformation`)
                .d('基本信息')}
            </h4>
            <DetailHeaderinfo {...formProps} />
          </div>
          <div>
            <h4 className={styles['info-title']}>
              <div className={styles.block} />
              {intl
                .get(`slod.shipmentsConfiguration.view.title.detail.detailStrategy`)
                .d('策略明细')}
            </h4>
            <Store.Provider value={chartsProps}>
              <NewCharts ref={chartsRef} />
            </Store.Provider>
          </div>
        </>
      )}
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['hzero.common', 'slod.shipmentsConfiguration', 'slod.common', 'slod.deliveryWorkbench'],
  })
)(DetailIndex);
