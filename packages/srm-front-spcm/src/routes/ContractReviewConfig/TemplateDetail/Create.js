/*
 * Create - 新建详情
 * @Date: 2025-03-10 10:19:06
 * @Author: CDJ
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, useState, useEffect } from 'react';
import { compose } from 'lodash';
import { routerRedux } from 'dva/router';

import { Button, useDataSet, Spin } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { Header, Content } from 'components/Page';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { createReviewTemplate } from "@/services/contractReviewConfigService";

import HeaderInfo from "./components/HeaderInfo";
import { getHeaderDs } from "./stores/getHeaderDS";
import { getUnitCodes } from "./utils/utils";

import styles from "./styles.less";

const Create = ({ dispatch, custLoading, customizeForm }) => {

  const [loading, setLoading] = useState(false);

  const headerDs = useDataSet(() => getHeaderDs(), []);

  useEffect(() => {
    headerDs.create({});
  }, []);

  // 保存
  const handleSave = async () => {
    const validateFlag = await headerDs.validate();
    if(validateFlag){
      setLoading(true);
      const data = headerDs.current?.toJSONData() || {};
      const payload = {
        data,
        customizeUnitCode: getUnitCodes.headerCode,
      };
      return createReviewTemplate(payload).then((res) => {
        if(getResponse(res)){
          notification.success();
          goToDetail(res);
        }
      }).finally(() => setLoading(false));
    }
  };

  // 跳转
  const goToDetail = (params= {}) => {
    const { reviewTemplateId } = params;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-review-config/template/detail/${reviewTemplateId}/edit`,
      })
    );
  };

  return (
    <Fragment>
      <Header
        backPath="/spcm/contract-review-config/list"
        title={intl.get('hzero.common.view.title.create').d('新建')}
      >
        <Button icon="save" color="primary" loading={loading} onClick={handleSave}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      </Header>
      <Content wrapperClassName={styles['spcm-contract-review-config-detail']}>
        <Spin spinning={loading}>
          <HeaderInfo
            dataSet={headerDs}
            custLoading={custLoading}
            customizeForm={customizeForm}
            isEdit
            formCode="SPCM_CONTRACT_REVIEW_CONFIG_DETAIL.TEMPLATE_HEADER"
          />
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'spcm.common',
      'spcm.contractReview',
    ],
  }),
  withCustomize({
    unitCode: ['SPCM_CONTRACT_REVIEW_CONFIG_DETAIL.TEMPLATE_HEADER'],
  })
)(Create);