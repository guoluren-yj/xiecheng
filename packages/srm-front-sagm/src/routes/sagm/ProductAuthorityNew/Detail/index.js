import React, { useMemo, useState, useRef } from 'react';
import { Button } from 'choerodon-ui/pro';
import qs from 'qs';
import { flowRight } from 'lodash';

import intl from 'utils/intl';

import { updateTab } from 'utils/menuTab';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';

import HistoryPop from '@/components/HistoryPop';

import ProductAuthorityContext from '../ProductAuthorityContext';
import { fetchAuthorityHisVersion } from '../api';
import Detail from './Detail';

import './styles.less';

// type matchParams = { status: 'edit' | 'read' | 'create };

const AuthorityDetail = (props) => {
  // push({pathname: '', state:{init:{}}})
  const {
    match: {
      params: { status },
    },
    // init：采买权限基本信息表单默认值 新建不传， 编辑取行上的对应字段
    location: { pathname, search, state },
    history: { push },
  } = props;
  const { init = {}, versionNum, authorityListCode, publishConfirmFlag, isChildNode } = state || {};

  const readOnly = status === 'read';
  const isCreate = status === 'create';

  const childRef = useRef();

  const [currentStep, setCurrentStep] = useState(0);
  const _viewSkuBackPath = pathname + search;
  const {
    authorityListId,
    agreementHeaderType,
    statusCode,
    versionFlag,
    viewSkuBackPath = _viewSkuBackPath,
    path = '/s2-mall/sagm/product-authority/list',
  } = qs.parse(search.substr(1));

  const title = !authorityListId
    ? intl.get('sagm.productAuthority.view.title.new').d('新建采买权限')
    : ['edit', 'create'].includes(status)
    ? intl.get('sagm.productAuthority.view.title.edit').d('编辑采买权限')
    : intl.get('sagm.productAuthority.view.title.new.view').d('查看采买权限详情');

  const handleStep = (operateStep) => {
    // 保存并下一步
    setCurrentStep((pre) => pre + operateStep);
  };

  const headerBtns = useMemo(() => {
    let btns = [];
    if (!Number(versionFlag)) {
      const canEdit = statusCode !== 'PUBLISHED' && statusCode !== 'EXECUTING'; // 除了已发布、执行中 显示编辑、发布
      btns = [
        {
          name: 'publish',
          child: intl.get('sagm.common.model.publish').d('发布'), // 已发布的不能编辑，无需控制
          show: status === 'edit' || (isCreate && currentStep === 2),
          btnProps: {
            icon: 'near_me',
            color: 'primary',
            onClick: () => {
              if (childRef.current.handleSave) {
                return childRef.current.handleSave(
                  false,
                  () => {
                    push('/s2-mall/sagm/product-authority/list');
                  },
                  'publish'
                );
              }
            },
          },
        },
        {
          name: 'save',
          child: intl.get('hzero.common.button.save').d('保存'),
          show: status === 'edit' || (isCreate && currentStep === 2),
          btnProps: {
            funcType: 'flat',
            icon: 'save',
            onClick: () => {
              if (childRef.current.handleSave) {
                return childRef.current.handleSave(false);
              }
            },
          },
        },
        {
          name: 'next',
          child: intl.get('hzero.common.button.next').d('下一步'),
          show: isCreate && authorityListId && currentStep <= 1,
          btnProps: {
            icon: 'recover',
            color: 'primary',
            onClick: () => {
              if (currentStep === 0) {
                handleStep(+1);
                return;
              }
              if (childRef.current.handleSave) {
                return childRef.current.handleSave(
                  false,
                  () => {
                    handleStep(+1);
                  },
                  'next'
                );
              }
            },
          },
        },
        {
          name: 'saveAndNext',
          child: intl.get('sagm.common.button.saveAndNext').d('保存并下一步'),
          show: !authorityListId && currentStep === 0,
          btnProps: {
            color: 'primary',
            icon: 'recover',
            onClick: () => {
              if (childRef.current.handleSave) {
                return childRef.current.handleSave(true, (res) => {
                  const {
                    channel,
                    controlRange,
                    agreementType,
                    agreementHeaderId,
                    agreementHeaderNum,
                  } = res;
                  const _init = {
                    channel,
                    controlRange,
                    agreementType,
                    agreementHeaderId,
                    agreementHeaderNum,
                  };
                  updateTab({
                    key: '/s2-mall/sagm/product-authority',
                    search: qs.stringify({
                      authorityListId: res.authorityListId,
                      agreementHeaderType: res.agreementHeaderType,
                    }),
                    state: {
                      init: _init,
                    },
                  });
                  push({
                    pathname: '/s2-mall/sagm/product-authority/detail/create',
                    search: qs.stringify({
                      authorityListId: res.authorityListId,
                      agreementHeaderType: res.agreementHeaderType,
                    }),
                    state: {
                      init: _init,
                    },
                  });
                  handleStep(+1);
                });
              }
            },
          },
        },
        {
          name: 'next',
          child: intl.get('hzero.common.button.previous').d('上一步'),
          show: isCreate && authorityListId && currentStep > 0,
          btnProps: {
            funcType: 'flat',
            icon: 'reply',
            onClick: () => handleStep(-1),
          },
        },
        {
          name: 'edit',
          child: intl.get('hzero.common.button.edit').d('编辑'),
          show: readOnly && canEdit,
          btnProps: {
            funcType: 'flat',
            icon: 'mode_edit',
            onClick: () => {
              if (childRef.current.handleEdit) {
                childRef.current.handleEdit((data = {}) => {
                  const { init = {}, authorityListId, agreementHeaderType, statusCode } = data;
                  push({
                    pathname: `/s2-mall/sagm/product-authority/detail/edit`,
                    search: qs.stringify({
                      authorityListId,
                      agreementHeaderType,
                      statusCode,
                    }),
                    state: {
                      init,
                    },
                  });
                });
              }
            },
          },
        },
        {
          name: 'historyVersion',
          show: readOnly && versionNum > 1 && !isChildNode,
          child: HistoryPop,
          compProps: {
            icon: 'schedule',
            currentVersionNum: versionNum,
            btnText: intl.get('sagm.common.model.historyVersion').d('历史版本'),
            onItemClick: ({ authorityListId }) => {
              if (childRef.current.handleEdit) {
                childRef.current.handleEdit((data = {}) => {
                  const { init = {}, agreementHeaderType, statusCode } = data;
                  push({
                    pathname: `/s2-mall/sagm/product-authority/detail/read`,
                    search: qs.stringify({
                      authorityListId,
                      agreementHeaderType,
                      statusCode,
                      versionFlag: 1,
                    }),
                    state: {
                      init,
                    },
                  });
                });
              }
            },
            fetchApi: fetchAuthorityHisVersion,
            params: {
              authorityListCode,
              page: 0,
              size: 100, // 之前接口是有分页的，pop模式无， 100模拟全部页数据，足够用
            },
          },
        },
      ].filter((f) => f.show);
    }
    return btns.map((b) => {
      const { child: Child, btnProps = {}, compProps = {} } = b;
      return typeof Child === 'string' ? (
        <Button {...btnProps}>{Child}</Button>
      ) : (
        <Child {...compProps} />
      );
    });
  }, [authorityListId, status, currentStep]);

  const detailProps = {
    readOnly,
    authorityListId,
    viewSkuBackPath,
    path,
    publishConfirmFlag,
    type: status,
    agreementHeaderType,
    init,
    versionFlag,
    currentStep,
    stepChange: (step) => {
      setCurrentStep(step);
    },
  };
  return (
    <>
      <Header title={title} backPath={`${pathname.split('/detail')[0]}/list`}>
        {/* <DynamicButtons buttons={headerBtns} defaultBtnType="c7n-pro" /> */}
        {headerBtns}
      </Header>
      <Content className="authority-content" style={{ padding: 0 }}>
        <ProductAuthorityContext.Provider value={{ routeState: state }}>
          <Detail
            {...detailProps}
            onRef={(ref) => {
              childRef.current = ref;
            }}
          />
        </ProductAuthorityContext.Provider>
      </Content>
    </>
  );
};
export default flowRight(
  formatterCollections({
    code: ['sagm.common', 'sagm.productAuthority', 'small.common.model', 'hzero.common'],
  })
)(AuthorityDetail);
