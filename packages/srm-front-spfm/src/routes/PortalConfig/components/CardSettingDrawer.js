/**
 * @author: Danica <ke.wang01@gonig-link.com>
 * @since: 2021-06-24 14:23:03
 * @lastTime: 2021-06-25 14:27:58
 * @description: 卡片设置
 * @copyright: Copyright (c) 2020, Hand
 */

import React, { useCallback, useState, useContext, useMemo } from 'react';
import {
  Table,
  Form,
  TextField,
  IntlField,
  RichText,
  Select,
  CheckBox,
  // NumberField,
  IconPicker,
  Modal,
  Icon,
  ColorPicker,
  Button,
} from 'choerodon-ui/pro';
import {
  LOGINLIST,
  LOGINTYPELIST,
  defaultRegisterLink,
  enterpriseRecoveryLink,
} from 'srm-front-boot/lib/components/PortalCard/util';
import { TopSection, SecondSection } from '_components/Section';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import intl from 'utils/intl';

import { PROTAL_CARD_CONTENT_TYPE } from '@/utils/utils';
import styles from './setting.less';
// eslint-disable-next-line
import { Store, TITLECARDSOURCE } from '../store';
import FormatterForm from './FormatterForm';
import UploadImage from './UploadImage';

const { Column } = Table;
const { RichTextViewer } = RichText;

const defaultLoginLinks = LOGINLIST.filter(item => item.link !== enterpriseRecoveryLink);
function CardSettingDrawer() {
  const {
    cardSettingDsObject,
    layoutInfo,
    layout = [],
    language = 'zh_CN',
    languageList = [],
    diyCardList,
    loadCard,
    cardData,
    setCardData,
  } = useContext(Store); // Store中读取卡片设置DS和布局信息
  const cardContent = useMemo(() => cardData.cardContent || {}, [cardData]); // 自定义内容
  const [cardCategory, setCardCategory] = useState('');
  // 所有卡片列表 用来获取卡片代码和名称
  const allCardList = useMemo(
    () => (layoutInfo ? [...layoutInfo.standardCardList, ...layoutInfo.editionCardList] : []),
    [layoutInfo]
  );
  const [hasTitle, setHasTitle] = useState(true); // 是否展示标题
  // record-反显
  const settingDs = useMemo(() => {
    if (!cardSettingDsObject) return;
    const cardInfo = allCardList.find(n => String(n.cardCode) === cardData.i) || {}; // 接口返回的基础信息
    const curCardLayout = layout.find(n => String(n.i) === cardData.i); // 布局信息
    let registerInfo = {};
    // 没有配置过注册链接则展示默认注册信息
    if (cardContent.registerEnabledFlag === undefined) {
      registerInfo = {
        registerEnabledFlag: 1,
        registerLink: defaultRegisterLink,
      };
    }
    const record = cardSettingDsObject.create(
      {
        ...cardInfo,
        ...cardContent,
        ...cardData,
        ...curCardLayout,
        ...registerInfo,
      },
      0
    );

    if (cardData.cardCategory === 'Login') {
      const { loginDs, loginTypeDs } = record.dataSet.children;
      const { loginList = defaultLoginLinks, loginTypeList = LOGINTYPELIST } = cardContent;
      loginList.forEach((item, ind) => {
        loginDs.create(item, ind);
      });
      loginTypeList.forEach((item, ind) => {
        loginTypeDs.create(item, ind);
      });
    }
    setCardCategory(cardData.cardCategory);
    setHasTitle(
      TITLECARDSOURCE.includes(cardData.cardCategory) &&
        cardContent.cardContentType !== PROTAL_CARD_CONTENT_TYPE.CUSTOMIZE
    );
    return record;
  }, [layoutInfo, cardSettingDsObject, cardData, cardContent]);
  const [hasTitleItem, setHasTitleItem] = useState(cardData.cardContent.cardTitleStatus); // 是否展示标题项
  const [cardContentType, setCardContentType] = useState(cardData.cardContent.cardContentType);
  // 修改footer信息
  const updateFooter = list => {
    let newCardContent = [];
    const newList = diyCardList.map(item => {
      if (item.cardCategory === 'Footer') {
        newCardContent = {
          ...item.cardContent,
          footerList: [...list],
        };
        return { ...item, cardContent: newCardContent };
      }
      return item;
    });
    setCardData({
      ...cardData,
      cardContent: { ...newCardContent, footerList: list },
    });
    loadCard([...newList]);
  };

  const formatterModalTitle = {
    upload: intl.get('hzero.common.upload.upload').d('上传附件'),
    footerAdd: intl.get('hptl.portalAssign.model.portalConfig.footer.addInfoline').d('新增信息栏'),
    footerEdit: intl
      .get('hptl.portalAssign.model.portalConfig.footer.editInfoline')
      .d('编辑信息栏'),
    basic: intl
      .get('hptl.portalAssign.model.protalConfig.inputMultilingualInfo')
      .d('输入多语言信息'),
  };

  /**
   * @function openFormatterModal - 打开底部信息弹窗
   */
  const openFormatterModal = (ds, type, ind) => {
    Modal.open({
      className: styles['card-setting-drawer'],
      title:
        formatterModalTitle[type] ||
        intl.get('hptl.portalAssign.model.portalConfig.footer.infoline').d('添加信息栏'),
      key: Modal.key(),
      drawer: true,
      style: {
        width: 742,
      },
      children: <FormatterForm record={ds} type={type} languageList={languageList} />,
      onOk: () => {
        if (type === 'footerAdd') {
          const { footerList = [] } = cardContent;
          const newFooterList = [...footerList, ds.toData()];
          updateFooter(newFooterList);
        } else if (type === 'footerEdit') {
          const { footerList = [] } = cardContent;
          const newFooterList = footerList.fill(ds.toData(), ind, ind + 1);
          updateFooter(newFooterList);
        }
      },
    });
  };

  /**
   * banner附件
   * @param {record} 行信息
   */
  const renderUpload = useCallback(({ record }) => {
    return (
      <a
        onClick={() => {
          openFormatterModal(record, 'upload');
        }}
      >
        {intl.get('hzero.common.upload.upload').d('上传附件')}
      </a>
    );
  }, []);

  /**
   * @function handleTitle - 更新标题状态
   * @param {value} 状态
   */
  const handleTitle = useCallback(value => {
    if (!value) {
      setHasTitleItem(false);
      settingDs.set('title', '');
      settingDs.set('_tls', {});
      settingDs.set('icon', '');
    } else {
      setHasTitleItem(true);
    }
  }, []);

  /**
   * @function handleCardContentType - 更新卡片内容类型
   * @param {value} 卡片内容类型
   */
  const handleCardContentType = useCallback(value => {
    setCardContentType(value);
  }, []);

  /**
   * @function handleDelFooterItem - 删除页脚信息
   * @param {index} 删除信息下标
   */
  const handleDelFooterItem = useCallback(
    index => {
      const { footerList = [] } = cardContent;
      const newFooterList = footerList.filter((item, i) => i !== index);
      updateFooter(newFooterList);
    },
    [cardContent]
  );

  /**
   * @function handleEditFooterItem - 编辑页脚信息
   * @param {index} 删除信息下标
   */
  const handleEditFooterItem = useCallback(
    (index, ds, footerItem) => {
      openFormatterModal(ds.create(footerItem, index), 'footerEdit', index);
      // updateFooter(newFooterList);
    },
    [cardContent]
  );

  /**
   * 标题相关DOM
   */
  const renderTitle = useMemo(() => {
    if (hasTitle) {
      return [
        <SecondSection title={intl.get('srm.oauth.resourceDownload.data.title').d('标题')}>
          <Form columns={2} record={settingDs} labelLayout="float" style={{ marginBottom: 32 }}>
            <CheckBox name="cardTitleStatus" onChange={handleTitle} />
            <IntlField name="title" hidden={!hasTitleItem} />
            <IconPicker name="icon" hidden={!hasTitleItem} popupCls={styles['icon-picker']} />
          </Form>
        </SecondSection>,
      ];
    } else {
      return null;
    }
  }, [hasTitle, hasTitleItem]);

  /**
   * 导航专属DOM
   */
  const renderNavDom = useMemo(() => {
    if (cardCategory === 'Nav') {
      const linkDs = settingDs.dataSet.children.navLinkDs;
      if (cardContent.navList) {
        cardContent.navList.forEach((item, ind) => {
          linkDs.create(
            {
              ...item,
              position: item.position || ind + 1,
            },
            ind
          );
        });
      }

      return [
        <SecondSection title={intl.get('hptl.portalAssign.model.protalConfig.property').d('属性')}>
          <Form columns={2} record={settingDs} labelLayout="float" style={{ marginBottom: 32 }}>
            <Select name="defaultLanguage">
              {languageList.map(item => (
                <Select.Option value={item.code}>{item.name}</Select.Option>
              ))}
            </Select>
            <CheckBox name="useBrowserLanguage" showHelp="tooltip" />
          </Form>
        </SecondSection>,
        <SecondSection title={intl.get('hptl.portalAssign.model.portalAssign.linkUrl').d('链接')}>
          <div style={{ marginTop: -8, marginBottom: 16 }}>
            <span className={styles['item-tip']}>
              {intl.get('hptl.portalAssign.model.desc.prefix').d('可配置参数')}：{`{prefix}`}
            </span>
            <span className={styles['item-tip']}>
              <span>
                {intl
                  .get('hptl.portalAssign.model.prefix.tooltip')
                  .d(
                    '参数说明: 取二级域名https://之后，dev.isrm./test.isrm./isrm.之前的部分作为前缀参数'
                  )}
              </span>
              <br />
              <span>
                {intl.get('hptl.portalAssign.model.prefix.tooltip.example').d('用法示例')}
                ：http://{`{prefix}`}.dev.going-buy.com
              </span>
            </span>
          </div>
          <Table
            dataSet={linkDs}
            buttons={['add', 'delete']}
            autoFocus
            editMode="cell"
            style={{ maxHeight: 420 }}
            customizedCode="SPFM.LINK_URL.TABLE"
          >
            <Column name="name" editor />
            <Column name="link" editor />
            <Column name="blankEnabled" width={130} editor />
            <Column name="position" width={70} editor />
          </Table>
        </SecondSection>,
      ];
    } else {
      return null;
    }
  }, [cardCategory, cardData]);

  /**
   * banner专属DOM
   */
  const renderBannerDom = useMemo(() => {
    if (cardCategory === 'Banner') {
      const { bannerDs } = settingDs.dataSet.children;
      const { bannerList = [] } = cardContent;
      if (bannerList.length) {
        bannerList.forEach((item, ind) => {
          bannerDs.create(
            {
              ...item,
              file: item.file && item.file[language],
            },
            ind
          );
        });
      }
      return [
        <SecondSection
          title={intl.get('hptl.portalAssign.model.portalConfig.title.portalImg').d('门户图片')}
        >
          <div style={{ marginTop: -8, marginBottom: 16 }}>
            <span className={styles['item-tip']}>
              {intl
                .get('hptl.portalAssign.model.portalConfig.title.portalImgMsg')
                .d(
                  '登录栏背景图片设置，图片格式为JPEG、PNG，建议图片大小897*294（上传图片后可返回“配置布局“页面以拖拽的方式手动调整图片大小）'
                )}
            </span>
          </div>
          <Table
            dataSet={bannerDs}
            buttons={['add', 'delete']}
            editMode="cell"
            autoFocus
            style={{ maxHeight: 'calc(100vh - 440px)' }}
            customizedCode="SPFM.PORTAL_IMG.TABLE"
          >
            <Column name="name" editor />
            <Column name="link" editor />
            <Column name="file" renderer={renderUpload} />
            <Column name="blankEnabled" width={130} editor />
            <Column name="position" width={70} editor />
            <Column name="enabledFlag" width={70} editor />
          </Table>
        </SecondSection>,
      ];
    } else {
      return null;
    }
  }, [cardCategory, cardData, settingDs]);

  /**
   * login专属DOM
   */
  const renderLoginDom = useMemo(() => {
    if (cardCategory === 'Login') {
      const { loginDs, loginTypeDs } = settingDs.dataSet.children;
      return [
        <SecondSection
          title={intl.get('hptl.portalAssign.view.navbar.registerSetting').d('注册配置')}
        >
          <Form record={settingDs} labelLayout="float" style={{ marginBottom: 32 }}>
            <CheckBox name="registerEnabledFlag" style={{ marginTop: -10 }} />
            <div>
              <TextField name="registerLink" style={{ width: 343 }} />
              <Button
                funcType="flat"
                icon="undo"
                onClick={() => {
                  settingDs.set('registerLink', defaultRegisterLink);
                }}
              >
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
            </div>
          </Form>
        </SecondSection>,
        <SecondSection title={intl.get('hptl.portalAssign.view.navbar.loginSetting').d('登录配置')}>
          <Table
            dataSet={loginTypeDs}
            editMode="cell"
            pagination={false}
            className={styles['login-table-content']}
            selectionMode="none"
            style={{ marginBottom: 32 }}
            customizedCode="SPFM.LOGIN_SETTING.TABLE"
          >
            <Column name="title" editor />
            <Column name="enabled" editor />
            <Column name="position" editor />
          </Table>
        </SecondSection>,
        <SecondSection title={intl.get('hptl.common.model.portal.linkUrlConfig').d('链接配置')}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ marginTop: -8, marginBottom: 16 }}>
              <span className={styles['item-tip']}>
                {intl.get('hptl.portalAssign.model.desc.prefix').d('可配置参数')}：{`{prefix}`}
              </span>
              <span className={styles['item-tip']}>
                <span>
                  {intl
                    .get('hptl.portalAssign.model.prefix.tooltip')
                    .d(
                      '参数说明: 取二级域名https://之后，dev.isrm./test.isrm./isrm.之前的部分作为前缀参数'
                    )}
                </span>
                <br />
                <span>
                  {intl.get('hptl.portalAssign.model.prefix.tooltip.example').d('用法示例')}
                  ：http://{`{prefix}`}.dev.going-buy.com
                </span>
              </span>
            </div>
            <Table
              dataSet={loginDs}
              buttons={[
                <Button
                  funcType="flat"
                  icon="playlist_add"
                  onClick={() => {
                    if (loginDs.length >= 4) {
                      notification.error({
                        message: intl
                          .get('hptl.portalAssign.model.login.link.max')
                          .d('链接配置最多4条'),
                      });
                      return false;
                    }
                    loginDs.create({}, 0);
                  }}
                >
                  {intl.get('hzero.common.button.add').d('新增')}
                </Button>,
                'delete',
                [
                  'reset',
                  {
                    afterClick: () => {
                      const newLink = settingDs.get('registerLink');
                      const flag = settingDs.get('registerEnabledFlag');
                      setCardData({
                        ...cardData,
                        registerLink: newLink,
                        cardContent: {
                          ...cardContent,
                          loginList: defaultLoginLinks,
                          registerLink: newLink,
                          registerEnabledFlag: flag,
                        },
                      });
                    },
                  },
                ],
              ]}
              editMode="cell"
              pagination={false}
              className={styles['login-table-content']}
              customizedCode="SPFM.LINK_URL_CONFIG.TABLE"
            >
              <Column name="title" width={120} editor />
              <Column name="link" editor />
              <Column name="enabled" width={100} editor />
              <Column name="blankEnabled" width={130} editor />
              <Column name="position" width={100} editor />
            </Table>
          </div>
        </SecondSection>,
      ];
    } else {
      return null;
    }
  }, [cardCategory, cardContent, settingDs, cardData]);
  /**
   * RichText toolbar
   */
  const renderCustomToolbar = props => {
    const { record } = settingDs.getField(language);
    return (
      <div id={props.id}>
        <button type="button" className="ql-bold" />
        <button type="button" className="ql-italic" />
        <button type="button" className="ql-underline" />
        <button type="button" className="ql-strike" />
        <button type="button" className="ql-blockquote" />
        <button type="button" className="ql-list" value="ordered" />
        <button type="button" className="ql-list" value="bullet" />
        <button type="button" className={styles['ql-image-custom']}>
          <Icon type="image-o" />
          <UploadImage result={{}} record={record} showUploadList={false} language={language} />
        </button>
        <button type="button" className="ql-link" />
        <select className="ql-color" />
      </div>
    );
  };

  /**
   * 基础卡片专属DOM
   */
  const renderBasicDom = useMemo(() => {
    if (cardCategory === 'Basic') {
      if (
        [PROTAL_CARD_CONTENT_TYPE.IFRAME, PROTAL_CARD_CONTENT_TYPE.CUSTOMIZE].includes(
          cardContentType
        )
      ) {
        return [
          <SecondSection
            title={intl.get('hptl.portalAssign.model.protalConfig.pageLink').d('页面地址')}
          >
            <Form columns={2} record={settingDs} labelLayout="float">
              <TextField
                name="link"
                showHelp="newLine"
                help={
                  cardContentType === PROTAL_CARD_CONTENT_TYPE.CUSTOMIZE &&
                  intl
                    .get('hptl.portalAssign.model.protalConfig.pageLink.customizeHelp')
                    .d('自定义卡片的地址不需要加http://或者https://前缀，请直接输入页面路由')
                }
              />
            </Form>
          </SecondSection>,
        ];
      }
      return [
        <SecondSection
          title={
            <div>
              {intl.get('hptl.portalAssign.model.protalConfig.richText').d('富文本')}
              <Icon
                type="language"
                style={{
                  fontSize: 14,
                  opacity: 0.8,
                  marginLeft: 3,
                  marginTop: -2,
                  cursor: 'pointer',
                }}
                onClick={() => openFormatterModal(settingDs, 'basic')}
              />
            </div>
          }
        >
          <Form record={settingDs} labelLayout="float">
            <RichText name={language} style={{ height: 340 }} toolbar={renderCustomToolbar} />
          </Form>
        </SecondSection>,
      ];
    } else {
      return null;
    }
  }, [cardCategory, cardContentType, settingDs]);

  /**
   * 底部卡片专属DOM
   */
  const renderFooterDom = useMemo(() => {
    if (cardCategory === 'Footer') {
      const { footerDs } = settingDs.dataSet.children;
      const { footerList = [] } = cardContent;
      if (footerList.length) {
        footerDs.removeAll();
        footerList.forEach((item, ind) => {
          footerDs.create(
            {
              ...item,
              // content: item.file && item.file[language],
              content: item.richTextObject,
            },
            ind
          );
        });
      }
      return [
        <SecondSection
          title={intl.get('hptl.portalAssign.model.title.footer.info').d('设置底部信息栏')}
        >
          <div style={{ marginBottom: 16 }}>
            <div className={styles['item-tip']} style={{ marginTop: -8, marginBottom: 16 }}>
              <span>
                {intl
                  .get('hptl.portalAssign.model.portalConfig.footer.edit.desc')
                  .d('可配置与企业相关的跳转链接或服务')}
              </span>
            </div>
            <div className={styles['footer-content']}>
              {footerList.map((item, index) => {
                return (
                  <div className="footer-item">
                    <RichTextViewer className="footer-rich-viewer" deltaOps={item[language]} />
                    <Icon
                      type="close"
                      className="close-icon"
                      onClick={() => {
                        handleDelFooterItem(index);
                      }}
                    />
                    <Icon
                      type="mode_edit"
                      className="edit-icon"
                      onClick={() => {
                        handleEditFooterItem(index, footerDs, item);
                      }}
                    />
                  </div>
                );
              })}
              <div
                className="footer-add"
                onClick={() => openFormatterModal(footerDs.create(), 'footerAdd')}
              >
                <p className="add-icon">+</p>
                <p>
                  {intl
                    .get('hptl.portalAssign.model.portalConfig.footer.addInfoline')
                    .d('新增信息栏')}
                </p>
              </div>
            </div>
          </div>
        </SecondSection>,
        <SecondSection
          title={intl.get('hptl.portalAssign.model.title.footer.filing').d('设置底部备案号')}
        >
          <Form columns={2} record={settingDs} labelLayout="float">
            <IntlField name="footerRemarks" />
          </Form>
        </SecondSection>,
      ];
    } else {
      return null;
    }
  }, [cardCategory, cardData, cardContent, settingDs]);
  return useMemo(
    () => (
      <TopSection className={styles['card-setting-wrap']}>
        <SecondSection title={intl.get('hptl.portalAssign.model.title.basicinfo').d('基本信息')}>
          <Form columns={2} record={settingDs} labelLayout="float" style={{ marginBottom: 32 }}>
            <TextField name="cardCode" />
            <TextField name="cardName" />
            <Select name="cardContentType" onChange={handleCardContentType} disabled>
              <Select.Option value={PROTAL_CARD_CONTENT_TYPE.RICH_TEXT}>
                {intl.get('hptl.portalAssign.model.protalConfig.richText').d('富文本')}
              </Select.Option>
              <Select.Option value={PROTAL_CARD_CONTENT_TYPE.IFRAME}>
                {intl.get('hptl.portalAssign.model.protalConfig.referencePage').d('引用页面')}
              </Select.Option>
              <Select.Option value={PROTAL_CARD_CONTENT_TYPE.CUSTOMIZE}>
                {intl.get('hptl.portalAssign.model.protalConfig.customizeCard').d('自定义卡片')}
              </Select.Option>
            </Select>
            {cardCategory === 'Login' && <ColorPicker name="backgroundColor" />}
          </Form>
        </SecondSection>
        {/* 渲染标题DOM */}
        {renderTitle}
        {/* 渲染导航专属DOM */}
        {renderNavDom}
        {/* 渲染banner专属DOM */}
        {renderBannerDom}
        {/* 渲染login专属DOM */}
        {renderLoginDom}
        {/* 渲染基础卡片专属DOM */}
        {renderBasicDom}
        {/* 渲染底部卡片专属DOM */}
        {renderFooterDom}
      </TopSection>
    ),
    [
      settingDs,
      cardCategory,
      hasTitle,
      hasTitleItem,
      cardContent,
      cardData,
      cardContentType,
      handleCardContentType,
    ]
  );
}

export default formatterCollections({
  code: ['hptl.portalAssign', 'srm.oauth', 'hptl.common'],
})(CardSettingDrawer);
