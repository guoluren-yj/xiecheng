import React, { useMemo, useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { Header } from 'components/Page';
import { TopSection } from '_components/Section';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { getActiveTabKey } from 'utils/menuTab';
import { noop } from 'lodash';

import { saveFileTemplate } from '@/services/fileTemplateManageService';

import { HeaderInfo, TemplateTable } from './CardList';
import { StoreContext } from './store/StoreProvider';

import Style from './index.less';

const Page = observer(() => {
  const {
    commonDs: { headerDs, templateTableDs } = {},
    pageSourceCategory,
    history,
    getCustomizeUnitCode = noop,
  } = useContext(StoreContext);

  // operate loading
  const [operateLoading, setOperateLoading] = useState(false);

  useEffect(() => {
    if (pageSourceCategory === 'update') {
      fetchPageData();
    }
  }, [pageSourceCategory]);

  // set loading
  const handleSetOperateLoading = (loading) => {
    setOperateLoading(loading ?? !operateLoading);
  };

  //  fetch update page
  const fetchPageData = async () => {
    try {
      handleSetOperateLoading(true);

      const list = [headerDs?.query(), templateTableDs?.query()];
      await Promise.all(list);
      handleSetOperateLoading(false);
    } catch (e) {
      handleSetOperateLoading(false);
      throw e;
    }
  };

  // validate submit Data
  const validatePageData = () => {
    const list = [headerDs?.validate(), templateTableDs?.validate()];
    return Promise.all(list).then((res) => {
      return res?.every((i) => i);
    });
  };

  // Integrate page data
  const getPageData = () => {
    return {
      ...(headerDs?.toJSONData()?.[0] || {}),
      tenantId: getCurrentOrganizationId(),
      fileTemplateList: templateTableDs?.toJSONData(),
      customizeUnitCode: getCustomizeUnitCode(['updateBaseInfo']),
    };
  };

  // click save button
  const handleSave = async () => {
    try {
      const flag = await validatePageData();
      if (!flag) {
        notification.warning({
          message: intl
            .get('ssrc.fileTemplateManage.view.message.submitMessage')
            .d('保存前请填写完整相关信息'),
        });
        return;
      }
      const pageData = getPageData();
      return saveFileTemplate(pageData).then((res) => {
        if (!getResponse(res)) return;
        if (pageSourceCategory === 'update') {
          fetchPageData();
          return;
        }
        if (pageSourceCategory === 'create' && res.fileManageId) {
          history.push({
            pathname: `${getActiveTabKey()}/update/${res.fileManageId}`,
          });
        }
      });
    } catch (err) {
      throw err;
    }
  };

  // get title
  const title = useMemo(() => {
    return pageSourceCategory === 'create'
      ? intl.get('ssrc.fileTemplateManage.view.title.createTitle').d('新建模板')
      : intl.get('ssrc.fileTemplateManage.view.title.updateTitle').d('编辑模板');
  }, [pageSourceCategory]);

  return (
    <div className={Style['ssrc-file-template-manage-wrapper']}>
      <Header title={title} backPath={`${getActiveTabKey()}/workbench-list`}>
        <Button icon="save" color="primary" loading={operateLoading} onClick={handleSave}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      </Header>
      <div className={Style['file-template-content-wrapper']}>
        <TopSection
          title={intl.get('ssrc.common.view.message.basicInfos').d('基础信息')}
          className={Style['common-top-section-card']}
        >
          <HeaderInfo />
        </TopSection>
        {pageSourceCategory !== 'create' && (
          <TopSection
            title={intl.get('ssrc.fileTemplateManage.view.title.card.template').d('模板')}
            className={Style['common-top-section-card']}
          >
            <TemplateTable />
          </TopSection>
        )}
      </div>
    </div>
  );
});

export default Page;
