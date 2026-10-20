/*
 * @Date: 2023-11-03 16:56:26
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { head, compose } from 'lodash';
import React, { Fragment, useCallback, useState, useEffect } from 'react';
import { useDataSet, Button, Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import remote from 'utils/remote';
import { routerRedux } from 'dva/router';
import { queryUnifyIdpValue } from 'services/api';
import { Header, Content } from 'components/Page';
import { TopSection } from '_components/Section';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import Basic from '../components/Basic';
import { getBasicDs } from '../stores/getBasicDS';

const tenantId = getCurrentOrganizationId();

const Create = ({ dispatch, custLoading, customizeForm, appraisalPurchaserCreateRemote }) => {
  const [spinning, setSpinning] = useState(false);

  const dataSet = useDataSet(() => {
    const dsProps = getBasicDs({ remote: appraisalPurchaserCreateRemote, editFlag: true });
    return appraisalPurchaserCreateRemote
      ? appraisalPurchaserCreateRemote.process(
          'SSLM_APPRAISAL_PURCHASER_CREATE_BASIC_DS_PROPS',
          dsProps,
          {}
        )
      : dsProps;
  }, [appraisalPurchaserCreateRemote]);

  useEffect(() => {
    queryUnifyIdpValue('SSLM.KPI_EVAL_DIM_GROUP', {
      tenantId,
    }).then(response => {
      const res = getResponse(response);
      if (res) {
        dataSet.setState('defaultCompany', head(res)); // 集团级维度时，默认的公司
      }
    });
    if (appraisalPurchaserCreateRemote) {
      appraisalPurchaserCreateRemote.event.fireEvent('cuxHandleInitValue', {
        dataSet,
      });
    }
  }, []);

  const handleSave = useCallback(() => {
    setSpinning(true);
    return dataSet
      .submit()
      .then(response => {
        if (response && response.success) {
          const data = head(response.content || []);
          if (data) {
            const { evalTplId, evalHeaderId, evalGranularity } = data;
            dispatch(
              routerRedux.push({
                pathname: `/sslm/appraisal-purchaser/detail/${evalTplId}/${evalHeaderId}/${evalGranularity}/edit`,
              })
            );
          }
        }
      })
      .finally(() => {
        setSpinning(false);
      });
  }, []);

  return (
    <Fragment>
      <Header
        backPath="/sslm/appraisal-purchaser"
        title={intl.get('sslm.appraisalPurchaser.view.title.createAppraisal').d('新建考评档案')}
      >
        <Button color="primary" icon="save" onClick={handleSave}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      </Header>
      <Content style={{ padding: 20 }}>
        <Spin spinning={spinning}>
          <TopSection title={intl.get('sslm.common.view.title.baseInfo').d('基础信息')}>
            <Basic
              baseInfoEdit
              dataSet={dataSet}
              custLoading={custLoading}
              customizeForm={customizeForm}
              customizeUnitCode="SSLM.APPRAISAL_PURCHASER_DETAIL.BASIC"
            />
          </TopSection>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.common', 'sslm.appraisalPurchaser', 'sslm.supplierDocManage'],
  }),
  withCustomize({
    unitCode: ['SSLM.APPRAISAL_PURCHASER_DETAIL.BASIC'],
  }),
  remote({
    code: 'SSLM_APPRAISAL_PURCHASER_CREATE',
    name: 'appraisalPurchaserCreateRemote',
  })
)(Create);
