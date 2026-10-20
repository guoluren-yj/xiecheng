/*
 * @Date: 2024-08-08 11:28:55
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment } from 'react';
import { Tag } from 'choerodon-ui';

import intl from 'utils/intl';

import Contact from '@/routes/components/MemberSupplier/Contact';
import CustomArea from '../components/CustomArea';
import CustomCard, { CustomExtra } from '../components/CustomCard';
import ProductIntroduce from '../components/ProductIntroduce';
import EnterpriseCard, { EnterpriseExtra } from '../components/EnterpriseCard';

export const getCardList = ({ isEdit, customCard = [] }) =>
  [
    {
      key: 'enterprise',
      title: ({ dataSource }) => {
        return (
          <Fragment>
            <span>
              {intl.get('sslm.memberExpansion.view.cardTitle.enterpriseCard').d('企业卡片')}
            </span>
            {!isEdit && !dataSource.interBusinessShield && (
              <Tag color="green" border={false} style={{ marginLeft: 8 }}>
                {intl.get('sslm.common.view.field.publicDisplay').d('公开显示')}
              </Tag>
            )}
          </Fragment>
        );
      },
      help: intl
        .get('sslm.memberExpansion.view.cardTitle.enterpriseCardHelp')
        .d('点击LOGO可以替换图片'),
      extra: EnterpriseExtra,
      component: EnterpriseCard,
    },
    {
      key: 'contact',
      title: intl.get('sslm.common.view.title.contactInfo').d('联系人信息'),
      help: intl
        .get('sslm.memberExpansion.view.contactInfo.help')
        .d(
          '此处维护的联系人账号信息将对外展示，用来接收采购方发出的邀约。如果无法选择到您需要的账号，请联系对应人员注册或联系管理员创建账号。'
        ),
      component: Contact,
    },
    {
      key: 'productIntroduce',
      title: intl.get('sslm.common.view.field.productIntroduce').d('主要产品介绍'),
      component: ProductIntroduce,
    },
    ...customCard.map(card => ({
      title: card.customizeTitle,
      key: card.memberCustomizeId,
      extra: CustomExtra,
      component: CustomCard,
      componentProps: { data: card },
    })),
    isEdit && {
      key: 'customArea',
      title: intl.get('sslm.memberExpansion.view.title.customArea').d('其他自定义区域'),
      component: CustomArea,
    },
  ].filter(Boolean);
