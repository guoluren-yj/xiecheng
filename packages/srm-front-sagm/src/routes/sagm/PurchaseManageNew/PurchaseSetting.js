import React, { memo, useCallback } from 'react';
import classnames from 'classnames';
import { withRouter } from 'react-router-dom';
import { DataSet, TreeSelect, Form } from 'choerodon-ui/pro';

import { getResponse } from 'utils/utils';
import intl from 'utils/intl';

import settingImag1 from '@/assets/purchase_img1.svg';
import settingImag2 from '@/assets/purchase_img2.svg';
import settingImag3 from '@/assets/purchase_img3.svg';

import { Header, Content } from 'components/Page';
import c7nModal, { confirm } from '@/utils/c7nModal';
import { saveConfig } from '@/services/PurchaseManageNewService';
import SettingCard from './component/SettingCard';
import PreviewBg from './component/PreviewBg';

import styles from './index.less';

const { TreeNode } = TreeSelect;

const PurchaseSetting = memo((props) => {
  const { enterPage = (e) => e } = props;

  const getConfig = useCallback(
    () => [
      {
        // code 固定不能改
        code: 'BUSINESS_UNIT',
        img: settingImag1,
        description: intl
          .get('sagm.purchaseManageNew.view.desc.businessOrganization')
          .d('适用于企业通过业务组织进行商品定价和权限管理'),
        onImmediateApply: () => handleBusinessUnitApply('BUSINESS_UNIT'),
        onPreview: () => handlePreview('BUSINESS_UNIT'),
      },
      {
        code: 'UNIT',
        img: settingImag2,
        description: intl
          .get('sagm.purchaseManageNew.view.desc.organizationStructure')
          .d('适用于企业通过HR组织进行商城采买权限管控'),
        onImmediateApply: () => handleCommonApply('UNIT'),
        onPreview: () => handlePreview('UNIT'),
      },
      {
        code: 'PUR_ORGANIZATION',
        img: settingImag3,
        description: intl
          .get('sagm.purchaseManageNew.view.desc.purchaseOrganization')
          .d('适用于企业通过采购组织进行商城采买权限管控'),
        onImmediateApply: () => handleCommonApply('PUR_ORGANIZATION'),
        onPreview: () => handlePreview('PUR_ORGANIZATION'),
      },
    ],
    []
  );

  const handleBusinessUnitApply = (code) => {
    const businessDs = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'business',
          label: intl.get('sagm.purchaseManageNew.model.level').d('层级'),
          required: true,
        },
      ],
      events: {
        update: ({ record, value }) => record.set('business', value),
      },
    });
    confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      content: (
        <div className={styles['purchase-setting-confirm-modal']}>
          <p className={styles.title}>
            {intl
              .get('sagm.purchaseManageNew.view.setting.confirm.tipTitle')
              .d('请选择要管理的业务组织层级')}
          </p>
          <Form dataSet={businessDs} labelLayout="float">
            <TreeSelect name="business" treeDefaultExpandAll>
              <TreeNode value="COMPANY" title={intl.get('sagm.common.model.company').d('公司')}>
                <TreeNode value="OU" title={intl.get('sagm.common.view.ou').d('业务实体')}>
                  <TreeNode
                    value="INV_ORGANIZATION"
                    title={intl.get('sagm.common.model.inventory.organization').d('库存组织')}
                  />
                </TreeNode>
              </TreeNode>
            </TreeSelect>
          </Form>
        </div>
      ),
      onOk: async () => {
        const flag = await businessDs.current.validate();
        if (flag) {
          confirm({
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            content: intl
              .get('sagm.purchaseManageNew.view.setting.secondConfirmTitle')
              .d('请根据实际业务选择采买组织来源，配置生成后无法恢复，请确认是否需要继续？'),
            onOk: () =>
              new Promise(async (resolve) => {
                const res = await saveConfig({
                  sourceType: code,
                  level: businessDs?.current?.get('business'),
                });
                // 窗口2
                // setTimeout(() => {
                //   resolve();
                //   enterPage('use', {sourceType: 'BUSINESS_UNIT', level: 'OU'});
                // }, 2000);
                resolve();
                if (getResponse(res)) {
                  enterPage('use', res);
                }
              }),
          });
          return true;
        }
        return false;
      },
    });
  };

  const handleCommonApply = (code) => {
    confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      content: intl
        .get('sagm.purchaseManageNew.view.setting.secondConfirmTitle')
        .d('请根据实际业务选择采买组织来源，配置生成后无法恢复，请确认是否需要继续？'),
      onOk: () =>
        new Promise(async (resolve) => {
          const res = await saveConfig({
            sourceType: code,
          });
          resolve();
          if (getResponse(res)) {
            enterPage('use', { sourceType: code });
          }
        }),
    });
  };

  // const loadPreviewImg = (img) => {
  //   return <img src={img} alt="img" className={styles['setting-preview-img']} />;
  // };

  const handlePreview = (code) => {
    const dom = document.querySelector(`.purchase-setting-page-content`)?.parentNode;
    const contentWidth = `${dom?.getBoundingClientRect().width}px`;
    c7nModal({
      drawer: false,
      autoCenter: true,
      maskClosable: true,
      destroyOnClose: true,
      footer: null,
      style: {
        width: contentWidth,
        height: 'calc(100vh - 84px)',
        textAlign: 'center',
        left: `calc(100vw - ${contentWidth})`,
        top: 84,
      },
      children: <PreviewBg type={code} />,
      // code === 'BUSINESS_UNIT'
      //   ? loadPreviewImg(preview1Imag1)
      //   : code === 'UNIT'
      //   ? loadPreviewImg(preview1Imag2)
      //   : loadPreviewImg(preview1Imag3),
    });
  };

  return (
    <>
      <Header title={intl.get('sagm.purchaseManageNew.view.title').d('商城采买组织管理')} />
      <Content
        className={classnames({
          'purchase-setting-page-content': true,
          [styles['purchase-setting-page-content']]: true,
        })}
      >
        <div className={styles['purchase-setting-wrap']}>
          <p className={styles['purchase-setting-title']}>
            {intl.get('sagm.purchaseManageNew.view.setting.title').d('请选择商城管理的采买组织')}
          </p>
          <p className={styles['purchase-setting-title-info']}>
            {intl
              .get('sagm.purchaseManageNew.view.setting.titleDescription')
              .d('若默认配置未满足您对采买管理的要求可通过平台增加权限配置')}
          </p>
          <div gutter={12} className={styles['purchase-setting-content']}>
            {getConfig().map((card) => (
              <div>
                <SettingCard
                  imgSrc={card.img}
                  description={card.description}
                  onImmediateApply={card.onImmediateApply}
                  onPreview={card.onPreview}
                />
              </div>
            ))}
          </div>
        </div>
      </Content>
    </>
  );
});

export default withRouter(PurchaseSetting);
