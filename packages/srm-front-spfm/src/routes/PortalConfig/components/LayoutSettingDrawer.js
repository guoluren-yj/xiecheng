/**
 * LayoutSettingDrawer - 模板设置
 * @date: 2021-06-23
 * @author: Danica <ke.wang01@gonig-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useEffect, useMemo, useState, useContext } from 'react';
import { Form, TextField, Modal, Icon, IntlField } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { connect } from 'dva';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { TopSection, SecondSection } from '_components/Section';
import UploadCard from './UploadCard';
import { Store, imageType } from '../store';
import styles from './setting.less';
import AddCardForm from './AddCardForm';

const { CheckableTag } = Tag;

const LayoutSettingDrawer = ({ pageInfo }) => {
  const {
    layoutInfo,
    setLayoutInfo,
    layoutSettingDs,
    addCardDsObject,
    handleAddCard,
    handleRemoveCard,
    logo,
    setLogo,
    diyCardList,
    loadCard,
    pageTitle,
    pageFavicon,
    setPageFavicon,
    language,
  } = useContext(Store);
  const [cardList, setCardList] = useState([]);
  const standardCardList = useMemo(() => layoutInfo.standardCardList || [], [layoutInfo]);
  const [editionCardList] = useState(layoutInfo ? layoutInfo.editionCardList : []);

  useEffect(() => {
    if (diyCardList) {
      const newList = diyCardList.filter(
        (item) => item.cardContent && item.cardContent.placeholder !== true
      );
      setCardList(newList.map((item) => item.i));
    }
  }, [diyCardList]);

  // 页面信息默认设置为系统信息
  useEffect(() => {
    layoutSettingDs.status = 'update';
    const title = layoutSettingDs.get('pageTitle');
    const favicon = layoutSettingDs.get('pageFavicon');
    const portalLogo = layoutSettingDs.get('logo');
    if (!title) {
      layoutSettingDs.set('pageTitle', pageTitle);
    }
    if (!favicon) {
      layoutSettingDs.set('pageFavicon', pageFavicon);
    }
    if (!portalLogo) {
      layoutSettingDs.set('logo', logo);
    }
  }, []);

  const changeFile = (isLogo, type, params) => {
    if (isLogo) {
      setLogo(params);
    } else {
      setPageFavicon(params);
    }
    layoutSettingDs.set(type, params); // 用来提交时获取数据
    const newList = diyCardList.map((item) => {
      if (item.cardCategory === 'Nav') {
        const fileList = isLogo ? { logo: params } : { favicon: params };
        const cardContent = {
          ...item.cardContent,
          ...fileList,
        };
        return { ...item, cardContent };
      }
      return item;
    });
    loadCard([...newList]);
  };

  // 删除icon回调
  const handleUploadRemove = (type) => {
    const isLogo = type === 'logo';
    const { logo: url, favicon } = pageInfo;
    if (isLogo) {
      changeFile(isLogo, type, {
        url,
        type: imageType(url),
      });
    } else {
      changeFile(isLogo, type, {
        url: favicon,
        type: imageType(favicon),
      });
    }
  };

  // 上传成功回调
  const handleUploadSuccess = (response, file, type) => {
    if (response) {
      const isLogo = type === 'logo';
      const params = {
        url: response,
        type: file.type,
        uid: file.uid,
      };
      changeFile(isLogo, type, params);
      notification.success();
    }
  };

  /**
   * @function updateCard - 更新标标准卡片
   */
  const updateCard = (data, checked) => {
    const { cardCode } = data;
    if (checked) {
      handleAddCard(data);
    } else {
      handleRemoveCard(cardCode);
    }
  };
  /**
   * @function addNewCard - 添加标准卡片
   */
  const addNewCard = () => {
    const addCardDs = addCardDsObject.create();
    Modal.open({
      title: intl.get('hptl.portalAssign.view.title.card.add').d('新增标准卡片'),
      key: Modal.key(),
      drawer: true,
      style: {
        width: 742,
      },
      children: <AddCardForm record={addCardDs} />,
      onOk: () => {
        const { title, type, content } = addCardDs.get(['title', 'type', 'content']);
        const params = {
          cardCode: `SRM.RICH.TEXT.${new Date().getTime()}`,
          cardCategory: 'Basic',
          isStandardCard: true,
          cardName: title,
          cardTitleStatus: 1,
          _tls: {},
          richTextObject: {},
          link: content,
          cardContentType: type,
        };
        params._tls[language] = title;
        params.richTextObject[language] = content;
        handleAddCard(params);
        setLayoutInfo({ ...layoutInfo, standardCardList: [...standardCardList, params] });
      },
    });
  };

  /**
   * @function checkoutTag - 生成卡片tag
   */
  const checkoutTag = (list = []) => {
    return list.map((item) => {
      const check = cardList.includes(item.cardCode);
      return (
        <CheckableTag
          key={item.cardCode}
          checked={check}
          onChange={(checked) => updateCard(item, checked)}
        >
          {item.cardName}
          {check ? <Icon type="done" /> : null}
        </CheckableTag>
      );
    });
  };

  return useMemo(
    () => (
      <TopSection className={styles['template-setting-section']}>
        <SecondSection title={intl.get('hptl.portalAssign.model.title.basicinfo').d('基本信息')}>
          <Form
            columns={2}
            labelLayout="float"
            record={layoutSettingDs}
            style={{ marginBottom: 32 }}
          >
            <TextField name="layoutCode" />
            <IntlField name="layoutName" />
            <IntlField name="description" />
            <IntlField name="pageTitle" />
          </Form>
        </SecondSection>
        <SecondSection title={intl.get('hptl.portalAssign.model.title.webLogo').d('网页图标')}>
          <div className="second-section-content">
            <UploadCard
              fileName="pageFavicon"
              fileUrl={pageFavicon.url}
              onUploadRemove={() => handleUploadRemove('pageFavicon')}
              onUploadSuccess={(response, file) =>
                handleUploadSuccess(response, file, 'pageFavicon')
              }
            />
          </div>
        </SecondSection>
        <SecondSection title={intl.get('hptl.portalAssign.model.title.companyLogo').d('企业LOGO')}>
          <span className="second-section-title-tip">
            {intl
              .get('hptl.portalAssign.model.uploadType.1M')
              .d('图片支持PNG、JPG、JPEG格式，且不能大于1M')}
          </span>
          <div className="second-section-content">
            <UploadCard
              fileName="logo"
              fileUrl={logo.url}
              onUploadRemove={() => handleUploadRemove('logo')}
              onUploadSuccess={(response, file) => handleUploadSuccess(response, file, 'logo')}
            />
          </div>
        </SecondSection>
        <SecondSection title={intl.get('hptl.portalAssign.view.title.standardCard').d('标准卡片')}>
          <span className="second-section-title-tip">
            {intl
              .get('hptl.portalAssign.view.portalConfig.standardCard.desc')
              .d('用户可自行定制卡片，卡片显示内容，由用户在富文本编辑器编辑内容决定')}
          </span>
          <div className="checkable-tag-wrapper" style={{ marginBottom: 32 }}>
            {checkoutTag(standardCardList)}
            <div className="add-tag" onClick={addNewCard}>
              +
            </div>
          </div>
        </SecondSection>
        <SecondSection
          title={intl.get('hptl.portalAssign.view.title.customizationCard').d('定制卡片')}
        >
          <span className="second-section-title-tip">
            {intl
              .get('hptl.portalAssign.view.portalConfig.customizationCard.desc')
              .d('定制卡片为平台预定义卡片')}
          </span>
          <div className="checkable-tag-wrapper">{checkoutTag(editionCardList)}</div>
        </SecondSection>
      </TopSection>
    ),
    [layoutSettingDs, standardCardList, editionCardList, cardList, pageFavicon, logo]
  );
};

export default formatterCollections({
  code: ['hptl.portalAssign', 'srm.oauth'],
})(
  connect(({ user = {} }) => ({
    pageInfo: user.currentUser || {},
  }))(LayoutSettingDrawer)
);
