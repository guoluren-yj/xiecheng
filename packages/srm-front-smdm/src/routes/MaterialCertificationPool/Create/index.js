import React, { Fragment, useState, memo, useEffect } from 'react';
import { compose } from 'lodash';

import intl from 'utils/intl';
import { connect } from 'dva';
import queryString from 'querystring';
import { routerRedux } from 'dva/router';
import { observer } from 'mobx-react-lite';
import { getResponse, filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { Button } from 'choerodon-ui/pro';
import cuxRemote from 'hzero-front/lib/utils/remote';
import { Form, Lov, TextField, useDataSet, DateTimePicker, Select } from 'choerodon-ui/pro';

import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';

import { headerInfoDS } from '../stores/listDs';
import {
  createItemAuthReq,
  saveItemAuth,
  confirmItemAuth,
} from '@/services/materialCertificationPoolService';

// 设置smdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';

const Index = function Index(props) {
  const { dispatch, customizeForm, remote, location } = props;

  const formData = JSON.parse(window.sessionStorage.getItem('itemAuthCreateFromData'));

  const [itemAuthReqHeaderId, setItemAuthReqHeaderId] = useState(null);

  const [isSelectCreateFlag] = useState(!!formData?.sourcePlatform);

  const [awaitAuthConQuote, setAwaitAuthConQuote] = useState('0');

  const formDs = useDataSet(
    () =>
      headerInfoDS({
        itemAuthReqHeaderId,
        isSelectCreateFlag,
        setAwaitAuthConQuote,
      }),
    [itemAuthReqHeaderId, isSelectCreateFlag, setAwaitAuthConQuote]
  );

  const { handleHeadBtn } = remote?.props?.process ?? {};

  const getDetailInfo = async () => {
    const formFlag = await formDs.validate();

    if (formFlag) {
      return {
        ...formDs.current?.toData(),
      };
    } else {
      return false;
    }
  };

  const updateDetailInfo = (data) => {
    if (itemAuthReqHeaderId) {
      formDs.query();
    } else {
      setItemAuthReqHeaderId(data?.itemAuthReqHeaderId);
    }
  };

  const handleSure = () => {
    return new Promise(async (resolve) => {
      const detailInfo = await getDetailInfo();

      if (detailInfo) {
        confirmItemAuth({
          ...detailInfo,
          customizeUnitCode: 'SMDM.ITEM_AUTH_CREATE_MODAL.FORM',
        })
          .then((res) => {
            if (getResponse(res)) {
              notification.success();
              if (res?.queryFlag) {
                const { itemAuthReqHeaderId, nodeCode } = res;
                const search = {
                  node: nodeCode,
                };
                dispatch(
                  routerRedux.push({
                    pathname: `/smdm/material-certification-pool/edit/${itemAuthReqHeaderId}`,
                    search: queryString.stringify(filterNullValueObject(search)),
                  })
                );
              } else {
                dispatch(
                  routerRedux.push({
                    pathname: `/smdm/material-certification-pool/list`,
                  })
                );
              }
              resolve();
            } else {
              resolve();
            }
          })
          .finally(() => {
            resolve();
          });
      } else {
        resolve();
      }
    });
  };

  const handleSave = () => {
    return new Promise(async (resolve) => {
      const detailInfo = await getDetailInfo();

      if (detailInfo) {
        const requset = detailInfo.itemAuthReqHeaderId ? saveItemAuth : createItemAuthReq;
        requset({
          body: {
            ...detailInfo,
          },
          query: {
            customizeUnitCode: 'SMDM.ITEM_AUTH_CREATE_MODAL.FORM',
          },
        })
          .then((res) => {
            if (getResponse(res)) {
              notification.success();
              updateDetailInfo(res);
              resolve();
            } else {
              resolve();
            }
          })
          .finally(() => {
            resolve();
          });
      } else {
        resolve();
      }
    });
  };

  useEffect(() => {
    formDs.setState('awaitAuthConQuote', awaitAuthConQuote);
  }, [formDs, awaitAuthConQuote]);

  useEffect(() => {
    if (itemAuthReqHeaderId) {
      formDs.query();
    } else {
      formDs.loadData([]);
      const initCuxFn = async () => {
        if (remote) {
          const res = await remote.process('cuxCreateHeader', {}, { formDs, location });
          formDs.create({ ...formData, isSelectCreateFlag, ...(res || {}) });
        } else {
          formDs.create({ ...formData, isSelectCreateFlag });
        }
      };
      initCuxFn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formDs, itemAuthReqHeaderId, isSelectCreateFlag]);

  const HeaderBtn = observer(() => {
    const headerButtons = [
      {
        name: 'sure',
        btnType: 'c7n-pro',
        noNest: true,
        btnProps: { onClick: () => handleSure() },
        child: (text) => (
          <Button
            icon="done"
            type="c7n-pro"
            color="primary"
            funcType="raised"
            wait={500}
            onClick={() => handleSure()}
          >
            {text || intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
        ),
      },
      {
        name: 'save',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'save',
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: () => handleSave(),
        },
        child: intl.get(`hzero.common.btn.save`).d('保存'),
      },
    ];
    if (handleHeadBtn && typeof handleHeadBtn === 'function') {
      handleHeadBtn({ headerButtons, getDetailInfo, formDs, dispatch });
    }

    return (
      <>
        <DynamicButtons defaultBtnType="c7n-pro" buttons={headerButtons} maxNum={5} />
      </>
    );
  });

  return (
    <Fragment>
      <Header
        backPath="/smdm/material-certification-pool/list"
        title={intl.get(`${commonPrompt}.createItemAuth`).d('新建物料认证申请单')}
      >
        <HeaderBtn />
      </Header>

      <Content>
        <h3 className="content-title">
          {intl.get(`${commonPrompt}.materialCA.baseInfo`).d('基本信息')}
        </h3>
        {customizeForm(
          {
            code: 'SMDM.ITEM_AUTH_CREATE_MODAL.FORM',
            __force_record_to_update__: true,
            dataSet: formDs,
          },
          <Form
            dataSet={formDs}
            showLines={6}
            columns={3}
            labelLayout="float"
            useColon={false}
            useWidthPercent
          >
            <TextField name="reqHeaderNum" />
            <TextField name="createdByName" />
            <DateTimePicker name="creationDate" />

            <Lov name="companyId" />
            <Lov name="supplierId" />
            <Lov
              name="categoryId"
              tableProps={{
                mode: 'tree',
                selectionMode: 'rowbox',
                virtual: true,
                style: { maxHeight: '500px' },
              }}
            />

            <Lov name="supplierCategoryId" />
            <Lov name="unitId" />
            <Lov name="prTypeId" />
            <TextField name="sourcePlatform" />

            <Lov name="strategyName" />
            <Select name="autoMatchStrategyNumFlag" clearButton={false} />
            {isSelectCreateFlag && <Select name="awaitAuthConQuote" clearButton={false} />}
          </Form>
        )}
      </Content>
    </Fragment>
  );
};

export default compose(
  connect(),
  formatterCollections({
    code: ['smdm.common', 'sprm.common'],
  }),
  cuxRemote(
    {
      code: 'SMDM_MATERIAL_CERTIFICATION_POOL_CREAT', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      process: {
        handleHeadBtn: undefined,
      },
    }
  ),
  withCustomize({
    unitCode: ['SMDM.ITEM_AUTH_CREATE_MODAL.FORM'],
  })
)(memo(Index));
