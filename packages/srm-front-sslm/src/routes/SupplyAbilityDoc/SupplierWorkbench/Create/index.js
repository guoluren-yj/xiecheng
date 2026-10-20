/**
 * index.js - 供货能力申请单（采）
 * @date: 2024-05-30
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Fragment, useEffect } from 'react';
import { compose } from 'lodash';
import { routerRedux } from 'dva/router';

import { Spin, useDataSet } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import { useSetState } from '@/routes/components/utils';
import { saveAllAsSupplier } from '@/services/supplyAbilityDocService';

import { getHeaderTitle } from '../../utils';
import HeaderInfo from '../../components/HeaderInfo';
import AttachmentInfo from '../../components/AttachmentInfo';
import HeaderBtns from '../components/DetailHeaderBtns';
import { getHeaderDs } from '../Detail/stores/getHeaderDS';

import styles from '../../index.less';

const headerCode = 'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL.HEADER_INFO';

const Index = ({ dispatch, custLoading, customizeForm, customizeBtnGroup }) => {
  const headerDs = useDataSet(() => getHeaderDs(), []);

  const [state, setState] = useSetState({
    loading: false,
  });

  const { loading } = state;

  useEffect(() => {
    headerDs.create({
      initiateCamp: '1',
    });
  }, []);

  const handleSave = async () => {
    if (!headerDs.current) {
      return;
    }
    const validateFlag = await headerDs.current.validate(true);
    if (validateFlag) {
      const data = headerDs.current.toJSONData();
      const payload = {
        ...data,
        customizeUnitCode: headerCode,
      };
      setState({ loading: true });
      return saveAllAsSupplier(payload)
        .then(res => {
          if (getResponse(res)) {
            notification.success();
            const { abilityReqId } = res;
            dispatch(
              routerRedux.push({
                pathname: `/sslm/supply-ability-doc-supplier/detail/${abilityReqId}/edit`,
              })
            );
          }
        })
        .finally(() => {
          setState({ loading: false });
        });
    }
  };

  return (
    <Fragment>
      <Header title={getHeaderTitle('create')} backPath="/sslm/supply-ability-doc-supplier/list">
        <HeaderBtns
          dataSet={headerDs}
          loading={loading}
          handleSave={handleSave}
          isEdit
          customizeBtnGroup={customizeBtnGroup}
        />
      </Header>
      <Content wrapperClassName={styles['supply-ability-doc-detail-content']}>
        <Spin spinning={loading}>
          <div className="card-content-wrap">
            <HeaderInfo
              dataSet={headerDs}
              custLoading={custLoading}
              customizeForm={customizeForm}
              customizeUnitCode={headerCode}
              isEdit
              pageSource="supplier"
            />
            <AttachmentInfo dataSet={headerDs} isEdit />
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.common', 'sslm.supplyAbilityDoc', 'sslm.supplyAbility'],
  }),
  withCustomize({
    unitCode: [
      'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL.HEADER_BTNS',
      'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL.HEADER_INFO',
    ],
  })
)(Index);
