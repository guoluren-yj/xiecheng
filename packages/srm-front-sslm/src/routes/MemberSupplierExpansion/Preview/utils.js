/*
 * @Date: 2024-08-08 12:53:03
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

import Register from '@/routes/components/MemberSupplier/Register';
import Business from '@/routes/components/MemberSupplier/Business';
import Contact from '@/routes/components/MemberSupplier/Contact';
import CustomCard from '../components/CustomCard';
import EnterpriseCard from '../components/EnterpriseCard';
import PreviewProduct from '../components/PreviewProduct';
import PreviewEnterprise from '../components/PreviewEnterprise';

export const getPreviewCard = ({ activeKey, customCard }) =>
  [
    {
      key: 'enterprise',
      title: intl.get('sslm.memberExpansion.view.cardTitle.enterpriseCard').d('企业卡片'),
      component: EnterpriseCard,
      hidden: activeKey !== 'findSupplier',
    },
    {
      key: 'previewEnterprise',
      component: PreviewEnterprise,
      hidden: activeKey !== 'supplierDetail',
    },
    {
      key: 'register',
      title: intl.get('spfm.enterprise.view.message.page.regInfo').d('登记信息'),
      component: Register,
      hidden: activeKey !== 'supplierDetail',
    },
    {
      key: 'business',
      title: intl.get('sslm.common.view.field.businessInfo').d('业务信息'),
      component: Business,
      hidden: activeKey !== 'supplierDetail',
    },
    {
      key: 'contact',
      title: intl.get('sslm.common.view.title.contactInfo').d('联系人信息'),
      component: Contact,
      hidden: activeKey !== 'supplierDetail',
    },
    {
      key: 'productIntroduce',
      title: intl.get('sslm.common.view.field.productIntroduce').d('主要产品介绍'),
      component: PreviewProduct,
    },
    ...customCard.map(card => ({
      title: card.customizeTitle,
      key: card.memberCustomizeId,
      component: CustomCard,
      componentProps: { data: card },
      hidden: activeKey !== 'supplierDetail',
    })),
  ].filter(n => !n.hidden);
