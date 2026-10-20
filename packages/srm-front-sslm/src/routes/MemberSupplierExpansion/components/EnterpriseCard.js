/*
 * @Date: 2024-07-30 14:58:35
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, useMemo, useContext, useState, useEffect } from 'react';
import { CheckBox, Tooltip, Icon, Dropdown, Menu } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import EnterpriseCardWrap from '@/routes/components/MemberSupplier/EnterpriseCardWrap';
import { Store } from '../stores';

export const EnterpriseExtra = () => {
  const { enterpriseCardDs } = useContext(Store);
  return (
    <Fragment>
      <CheckBox dataSet={enterpriseCardDs} name="interBusinessShield">
        {intl.get('sslm.memberExpansion.model.checkbox.shield').d('屏蔽')}
      </CheckBox>
      <Tooltip
        title={intl
          .get('sslm.memberExpansion.model.checkbox.shieldMsg')
          .d('若选择屏蔽，您的企业信息将不会再推送给其他采购方企业。')}
      >
        <Icon type="help" />
      </Tooltip>
    </Fragment>
  );
};

const EnterpriseCard = () => {
  const {
    isEdit,
    tagList,
    isPreview,
    dataSource,
    enterpriseStatus,
    enterpriseCardDs,
    handleEnterpriseOpera,
  } = useContext(Store);
  const { memberContactList, memberMainProductList, memberCustomizeList, ...rest } = dataSource;
  enterpriseCardDs.loadData([rest]);
  const [logo, setLogo] = useState(dataSource.logoUrl);
  const [logoLoading, setLogoLoading] = useState(false);

  const sourceKey = useMemo(() => (isPreview ? 'preview' : 'edit'), [isPreview]);

  const extraRender = () => {
    if (isEdit) {
      // 下拉操作
      const operationMenu = (
        <Menu onClick={handleEnterpriseOpera}>
          <Menu.Item key="riskInfo">
            {intl.get('sslm.memberExpansion.model.menu.fetchRiskInfo').d('重新获取风险信息')}
          </Menu.Item>
          <Menu.Item key="tagInfo">
            {intl.get('sslm.memberExpansion.model.menu.fetchTagInfo').d('重新获取标签信息')}
          </Menu.Item>
        </Menu>
      );
      return (
        <Dropdown overlay={operationMenu}>
          <Icon type="more_vert" />
        </Dropdown>
      );
    }
  };

  // logo改变的回调
  const handleLogoChange = (info = {}) => {
    const { file = {} } = info;
    if (file.status === 'uploading') {
      setLogoLoading(true);
      return;
    }
    if (file.status === 'done') {
      setLogo(file.response);
      setLogoLoading(false);
      enterpriseCardDs.current.set('logoUrl', file.response);
    }
  };

  const displayNameRender = () => {
    return <span>{dataSource.companyName}</span>;
  };

  useEffect(() => {
    setLogo(dataSource.logoUrl);
  }, [dataSource.logoUrl]);

  const formFields = [
    {
      name: 'legalRepName',
    },
    {
      name: 'registeredCapital',
    },
    {
      name: 'currencyName',
    },
    {
      name: 'buildDate',
    },
    {
      name: 'industryNames',
    },
    {
      name: 'industryCategoryNames',
    },
    {
      name: 'riskScanDate',
    },
  ];

  return (
    <div className="enterprise-card-wrap">
      <EnterpriseCardWrap
        imgSrc={logo}
        key={sourceKey}
        isEdit={isEdit}
        tagList={tagList}
        sourceKey={sourceKey}
        loading={logoLoading}
        formFields={formFields}
        dataSet={enterpriseCardDs}
        statusList={enterpriseStatus}
        extraRender={extraRender}
        onImgChange={handleLogoChange}
        displayNameRender={displayNameRender}
        labelObtainMethod={dataSource.labelObtainMethod}
      />
    </div>
  );
};

export default EnterpriseCard;
