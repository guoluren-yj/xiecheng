import React, { Fragment, useMemo, useContext, useCallback, useState } from 'react';
import intl from 'utils/intl';
import classNames from 'classnames';
import { throttle } from 'lodash';
import { Header, Content } from 'components/Page';
import { Button, Spin } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

// import { collectDsListErrors } from '@/routes/PayTermsCtrl/utils/utils';
import { collectDsListErrors } from '../../PayTermsCtrl/utils/utils';
import BasicForm from './components/BasicForm';
import LineTable from './components/LineTable';
import CardContent from '../components/CardContent';
import { saveCurrent, releaseCurrent } from '../utils/api';
import { langPrefixCode, UpdateCustomizeCode } from '../utils/constant';
import type { StoreValueType} from './stores/StoreProvider';
import StoreProvider, { Store } from './stores/StoreProvider';
import { getSubTitle, getNotificationErrors, notificationWaringTips } from '../utils/utils';

import styles from "../index.less";


const Index = () => {
  const { loading, headerDS, lineDS, history, subRelationCurId = '' } = useContext(Store) as StoreValueType;
  const displaySubRelationNum = headerDS.current?.get('displaySubRelationNum');


  // 保存、发布 按钮loading
  const [buttonLoading, setButtonLoading] = useState(false);

  // 面板列表
  const CardList = useMemo(() => {
    return [
      {
        key: 'basicForm',
        header: intl.get(`${langPrefixCode}.model.common.basicInformation`).d('基础信息'),
        content: <BasicForm />,
      },
      {
        key: 'lineTable',
        header: intl.get(`${langPrefixCode}.model.common.itemTitle`).d('物料'),
        content: <LineTable />,
      },
    ];
  }, []);

  // 获取数据
  const getPageData = async () => {
    let validationFlag: boolean = false; // 校验信息flag
    let errorMessage: string = ''; // 错误提示信息

    // eslint-disable-next-line no-unused-expressions
    headerDS.current?.set('status', 'update'); // 设置状态为更新 以便走ds校验
    const validationFlags = await Promise.all([headerDS.validate(), lineDS.validate()]);
    validationFlag = validationFlags.every((validateFlag) => validateFlag);

    // 校验不通过
    if(!validationFlag) {
      const dsListError = collectDsListErrors([headerDS, lineDS]);
      // 提示内容
      errorMessage = getNotificationErrors(dsListError);
    };

    const [headerData] = headerDS.toData();
    const lineData = lineDS.toData();
    return {
      validationFlag,
      errorMessage,
      headerData,
      lineData,
      customizeUnitCode: Object.values(UpdateCustomizeCode).join(','),
    };
  };

  // 保存
  const saveSubRelation = useCallback(throttle(async () => {
    setButtonLoading(true);
    const subData = await getPageData();
    const { validationFlag = false, errorMessage = '', lineData = [], headerData = [], customizeUnitCode } = subData;
    if(!lineData.length) { // 维护单 物料至少维护一行数据
      const itemValidationTip = intl.get(`${langPrefixCode}.model.view.message.itemValidationTip`).d('物料行至少维护一条数据！');
      notificationWaringTips(itemValidationTip);
      setButtonLoading(false);
      return;
    }
    if(!validationFlag) { // 校验不通过 提示
      if(errorMessage) {
        notificationWaringTips(errorMessage);
      }
      setButtonLoading(false);
    } else {
      const result = getResponse(await saveCurrent({
        subRelationCurId,
        ...headerData,
        subRelationItemCurList: lineData,
        customizeUnitCode,
      }));
      if(!result) { // 如果失败了 直接return
        setButtonLoading(false);
        return;
      }
      if(result && !subRelationCurId) { // 如果是新建状态 id不存在 跳转
        const { subRelationCurId: subCurId } = result;
        history.push({
          pathname: `/smdm/substitute-relation/update/${subCurId}`,
        });
        setButtonLoading(false);
      } else { // 否则 刷新页面
        Promise.all([headerDS.query(), lineDS.query()]).then(res=>res).finally(()=> {
          setButtonLoading(false);
        });
      }
    }
  }, 1200), [subRelationCurId, headerDS, lineDS]);

  // 发布
  const releaseSubRelation = useCallback(throttle(async () => {
    setButtonLoading(true);
    const subData = await getPageData();
    const { validationFlag = false, errorMessage='', lineData = [], headerData = [], customizeUnitCode } = subData;
    if(!lineData.length) { // 维护单 物料至少维护一行数据
      const itemValidationTip = intl.get(`${langPrefixCode}.model.view.message.itemValidationTip`).d('物料行至少有一条数据！');
      notificationWaringTips(itemValidationTip);
      setButtonLoading(false);
      return;
    }
    if(!validationFlag) { // 校验不通过 提示
      if(errorMessage) {
        notificationWaringTips(errorMessage);
      }
      setButtonLoading(false);
    } else {
      const result = getResponse(await releaseCurrent({
        subRelationCurId,
        ...headerData,
        subRelationItemCurList: lineData,
        customizeUnitCode,
      }));
      if(!result) {
        setButtonLoading(false);
        return; // 失败 return
      }
      history.push({ // 否则返回列表页面
        pathname: `/smdm/substitute-relation/list`,
      });
    }
  }, 1200), [subRelationCurId, headerDS, lineDS]);


  return (
    <Fragment>
      <Header
        title={getSubTitle('update', displaySubRelationNum)}
        backPath='/smdm/substitute-relation/list'
      >
        <Button color={ButtonColor.primary} loading={buttonLoading} onClick={releaseSubRelation}>{intl.get('hzero.common.button.publish').d('发布')}</Button>
        <Button loading={buttonLoading} onClick={saveSubRelation}>{intl.get('hzero.common.button.save').d('保存')}</Button>
      </Header>
      <Content className={classNames(styles['smdm-sub-relation-entry-content'])}>
        <Spin spinning={loading}>
          {
            CardList.map(card => <CardContent {...card} />)
          }
        </Spin>
      </Content>
    </Fragment>
  );
};

const SubDetailIndex = props => {
  return (
    <StoreProvider {...props}><Index /></StoreProvider>
  );
};

export default formatterCollections({
  code: ['smdm.subRelation', 'hzero.common', 'smdm.payTermsCtrl'],
})(
    withCustomize({
      unitCode: Object.values(UpdateCustomizeCode),
    })(SubDetailIndex)
);