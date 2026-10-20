/*
 * Detail - 供货能力清单审批-工作流表单
 * @Date: 2024-02-01
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import { useDataSet, Spin, Button } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { compose } from 'lodash';
import React, { Fragment, useState, useCallback, useMemo, useEffect } from 'react';
import classnames from 'classnames';

import intl from 'utils/intl';
import { Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { AFBasic } from '_components/AFCards';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import { operationRecordsModal } from '@/routes/components/OperationRecords';

import styles from '@/routes/index.less';
import { handleSupplierDetail } from '@/routes/components/utils/utils';

import HeaderInfo from '../Detail/HeaderInfo';
import CategoryMaterial from '../Detail/CategoryMaterial';
import AttachmentInfo from '../Detail/AttachmentInfo';
import wfStyles from './index.less';

import { getBasicsDS, getCategoryMaterialDS, getAttachmentDS } from '../stores/index';

const Index = ({
  location,
  customizeForm,
  customizeTable,
  match: {
    params: { supplyAbilityId },
  },
  queryTemplateConfig,
  customizeCommon,
  custLoading,
}) => {
  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [
    location.search,
  ]);
  const {
    abilityLineIds,
    templateCode,
    templateVersion,
    stageCode,
    pageCode,
    sourceType,
  } = routerParams;
  const isEdit = false;

  const [loading, setLoading] = useState(false);
  const [waitCustomize, setWaitCustomize] = useState(false);

  const basicsDs = useDataSet(() => getBasicsDS({ supplyAbilityId, isCreat: false }), []);
  const categoryMaterialDs = useDataSet(
    () => getCategoryMaterialDS({ supplyAbilityId, isEdit }),
    []
  );
  const attachmentDs = useDataSet(() => getAttachmentDS({ supplyAbilityId, isEdit }), []);

  const wfParams = {
    cuszTplStageCode: stageCode,
    cuszTplPageCode: pageCode,
    cuszTplTemplateCode: templateCode,
    cuszTplVersion: templateVersion,
  };

  useEffect(() => {
    if (waitCustomize) {
      handleQuery();
    }
  }, [waitCustomize, supplyAbilityId]);

  useEffect(() => {
    setWaitCustomize(true);
    const templateInfoPromise = new Promise(resolve => {
      resolve({
        templateCode,
        templateVersion,
      });
    });
    queryTemplateConfig(templateInfoPromise, {
      stageCode,
      pageCode,
    }).then(() => {
      setWaitCustomize(false);
    });
  }, [templateCode, templateVersion, stageCode, pageCode]);

  // 处理查询
  const handleQuery = useCallback(async () => {
    setLoading(true);
    // 设置查询参数
    basicsDs.setQueryParameter('queryParam', {
      customizeUnitCode: 'SSLM.SUPPLIER_ABLILITY_MANAGE_WF.BASIC',
      ...wfParams,
    });
    categoryMaterialDs.setQueryParameter('queryParam', {
      customizeUnitCode:
        'SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.CATEGORYS_SEARCH_BAR,SSLM.SUPPLIER_ABLILITY_MANAGE_WF.CATEGORY_MATERIALS',
      wfParams,
      abilityLineIds,
    });
    attachmentDs.setQueryParameter('queryParam', {
      customizeUnitCode: 'SSLM.SUPPLIER_ABLILITY_MANAGE_WF.ATTACHMENT',
      ...wfParams,
    });
    // 查询数据
    await basicsDs.query();
    await categoryMaterialDs.query();
    await attachmentDs.query();
    setLoading(false);
  }, [supplyAbilityId]);

  // 操作记录
  const handleOperatRecord = useCallback(() => {
    operationRecordsModal({
      documentType: 'SUPPLY_ABILITY_MANAGE',
      documentId: supplyAbilityId,
    });
  }, [supplyAbilityId]);

  // 调转360汇总查询
  const handleGoToSupplierDetail = () => {
    if (basicsDs.current) {
      const headerData = basicsDs.current.toData();
      handleSupplierDetail({ ...headerData, sourceType });
    }
  };

  // 操作按钮集合
  const contentBottomRender = useCallback(() => {
    const buttons = [
      {
        name: 'supplierInfo',
        btnComp: Button,
        btnProps: {
          icon: 'find_in_page',
          funcType: 'flat',
          onClick: () => handleGoToSupplierDetail(),
          wait: 200,
          waitType: 'throttle',
          loading,
        },
        child: intl.get('sslm.supplierReview.view.button.supplierInfo').d('查看供应商360信息'),
      },
      {
        name: 'operation',
        btnComp: Button,
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          onClick: () => handleOperatRecord(),
          wait: 200,
          waitType: 'throttle',
          loading,
        },
        child: intl.get('hzero.common.button.operation').d('操作记录'),
      },
    ];
    return <DynamicButtons buttons={buttons} permissions={getpermissionList()} />;
  }, [loading]);

  const getpermissionList = () => [
    {
      name: 'supplierInfo',
      meaning: '查看供应商360信息',
      code: 'srm.partner.suplier-ability.supply-ability-manage.button.detail.360Info',
    },
  ];

  return (
    <Fragment>
      {waitCustomize ? (
        <Spin spinning={waitCustomize} />
      ) : (
        <Spin spinning={loading}>
          <div className={classnames(styles['card-wrap'], wfStyles['sslm-supply-ability-wf'])}>
            {customizeCommon(
              {
                code: 'SSLM.SUPPLIER_ABLILITY_MANAGE_WF.AFBASIC',
                processUnitTag: 'AF-BASIC',
              },
              <AFBasic
                dataSet={basicsDs}
                titleField="documentTitle"
                tagFields={['documentDimension']}
                normalFields={['createUserName', 'creationDate']}
                contentBottomRender={contentBottomRender}
                fieldsConfig={{
                  documentTitle: {
                    render: ({ record }) => {
                      const { supplierCompanyName } = record?.get(['supplierCompanyName']);
                      return `${supplierCompanyName}${intl
                        .get('sslm.supplyAbility.view.message.title.review')
                        .d('供货能力清单评审')}`;
                    },
                  },
                }}
              />
            )}
            <Content>
              <Card id="baseInfo" bordered={false}>
                <div className={styles['card-title']}>
                  {intl.get('sslm.supplyAbility.view.message.basicInfo').d('基础信息')}
                </div>
                <HeaderInfo
                  dataSet={basicsDs}
                  customizeForm={customizeForm}
                  custLoading={custLoading}
                  customizeUnitCode="SSLM.SUPPLIER_ABLILITY_MANAGE_WF.BASIC"
                  isCreat={false}
                  isEdit={isEdit}
                />
              </Card>
            </Content>
            <Content>
              <Card id="categoryInfo" bordered={false}>
                <div className={styles['card-title']}>
                  {intl
                    .get('sslm.supplyAbility.view.message.categoryMaterialTable')
                    .d('推荐物料/品类')}
                </div>
                <CategoryMaterial
                  supplyAbilityId={supplyAbilityId}
                  dataSet={categoryMaterialDs}
                  customizeTable={customizeTable}
                  customizeUnitCode="SSLM.SUPPLIER_ABLILITY_MANAGE_WF.CATEGORY_MATERIALS"
                  customizeSearchCode="SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.CATEGORYS_SEARCH_BAR"
                  customizeForm={customizeForm}
                  custLoading={custLoading}
                  isEdit={isEdit}
                  optional // optional：true｜只更新头状态 false｜更新所有字段
                />
              </Card>
            </Content>
            <Content>
              <Card id="fileInfo" bordered={false}>
                <div className={styles['card-title']}>
                  {intl.get('hzero.common.upload.modal.title').d('附件')}
                </div>
                <AttachmentInfo
                  dataSet={attachmentDs}
                  customizeTable={customizeTable}
                  customizeUnitCode="SSLM.SUPPLIER_ABLILITY_MANAGE_WF.ATTACHMENT"
                  custLoading={custLoading}
                  isEdit={isEdit}
                  setLoading={setLoading}
                />
              </Card>
            </Content>
          </div>
        </Spin>
      )}
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.supplyAbility', 'sslm.common', 'sslm.supplierReview', 'sslm.supplierDetail'],
  }),
  withCustomize({
    isTemplate: true,
  })
)(Index);
