import React, { useEffect, useMemo } from 'react';
import intl from 'hzero-front/lib/utils/intl';
import { Icon, Form, Table, Output, DataSet } from "choerodon-ui/pro";
import { getCurrentLanguage } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';

import styles from "./style.less";
import config from './config';

const loadFonts = async (name, url) => {
  const font = new FontFace(name, `url(${url})`);
  await font.load();
  document.fonts.add(font);
};
const lineHeight = {
  lineHeight: '18px',
  padding: '4px 0',
};
const lineWrapStyle = {
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
};
export default formatterCollections({
  code: ['hiam.theme', 'hzero.common'],
})(props => {
  const { themeFlag, padType = 75, densityType = 'default', lineWrap, ...others } = props;
  const { theme, navColor, linkColor, buttonColor, tabColor, fileUrl } = themeFlag ? others : {};


  const fontFamily = useMemo(() => {
    if (fileUrl && document.fonts) {
      const fontName = `preview-${new Date().getTime()}`;
      loadFonts(fontName, fileUrl);
      return fontName;
    }

    return 'inherit';
  }, [fileUrl]);
  useEffect(() => {
    const language = getCurrentLanguage() || 'zh_CN';
    const demoData = config.demoData[language] || config.demoData.zh_CN;
    if (demoData.headerData) {
      headerDs.loadData([demoData.headerData]);
    }
    if (demoData.lineData && demoData.lineData.length) {
      lineDs.loadData(demoData.lineData);
    }
  }, []);
  const headerDs = useMemo(() => new DataSet(), []);
  const lineDs = useMemo(() => new DataSet(), []);
  // eslint-disable-next-line prefer-destructuring
  const lang = useMemo(() => {
    const sysLang = {
      pageTitle: intl.get('hzero.common.components.searchPage.title').d('默认标题'),
      firLeadLink: intl.get('hiam.theme.preview.lang.firLeadLink').d('一级导航'),
      secLeadLink: intl.get('hiam.theme.preview.lang.secLeadLink').d('二级导航'),
      thrLeadLink: intl.get('hiam.theme.preview.lang.thrLeadLink').d('三级导航'),
      thrLeadLinkWrap: intl.get('hiam.theme.preview.lang.thrLeadLinkWrap').d('三级导航(长度测试长度测试长度测试)'),
      menuSearch: intl.get('hzero.common.basicLayout.menuSelect').d('菜单搜索'),
      workbench: intl.get('hzero.common.title.workspace').d('工作台'),
      menuTab: intl.get('hiam.theme.preview.lang.menuTab').d('导航菜单'),
      primaryBtn: intl.get('hiam.theme.preview.lang.primaryBtn').d('主按钮'),
      no: intl.get('hiam.theme.preview.lang.no').d('编号'),
      orderInfo: intl.get('hiam.theme.preview.lang.orderInfo').d('订单基础信息'),
      lineData: intl.get('hiam.theme.preview.lang.lineData').d('明细行'),
      orderNo: intl.get('hzero.common.label.ordernumber').d('订单编号'),
      name: intl.get('hiam.theme.preview.lang.name').d('名称'),
      orderName: intl.get('hiam.theme.preview.lang.orderName').d('订单名称'),
      desc: intl.get('hzero.common.view.description').d('描述'),
      orderType: intl.get('hiam.theme.preview.lang.orderType').d('订单类型'),
      amountTax: intl.get('hiam.theme.preview.lang.amountTax').d('金额（含税）'),
      amountNoTax: intl.get('hiam.theme.preview.lang.amountNoTax').d('金额（不含税）'),
      localAmountTax: intl.get('hiam.theme.preview.lang.localAmountTax').d('本币金额（含税）'),
      localAmountNoTax: intl.get('hiam.theme.preview.lang.localAmountNoTax').d('本币金额（不含税）'),
      remark: intl.get('hzero.common.label.description').d('备注'),
      total: intl.get('hiam.theme.preview.lang.total').d('总数量'),
      commitBy: intl.get('hiam.theme.preview.lang.commitBy').d('提交者'),
      op: intl.get('hzero.common.table.column.options').d('操作'),
      edit: intl.get('hzero.common.button.edit').d('编辑'),
      delete: intl.get('hzero.common.button.delete').d('删除'),
    };
    return Object.assign({}, config.lang, sysLang);
  }, []);
  return (
    <div className={styles['theme-preview']}>
      <h3 className={styles['theme-preview-header']}>
        {intl.get('hzero.common.preview').d('预览')}
      </h3>
      <div className={styles['theme-preview-container']} style={{ fontFamily }}>
        <div className={`${styles['demo-container']} ${themeFlag ? '' : styles['old-theme']}`}>
          <header className="header" style={{ backgroundColor: navColor }}>
            <div className="logo">LOGO</div>
            <div style={{ position: 'absolute', right: '11px', top: '9px', width: '26px', height: '26px', borderRadius: "13px", backgroundColor: "#FFF" }} />
          </header>
          <section className="body">
            <div className="left">
              <div className='search'>
                <Icon type="search" />{lang.menuSearch}
              </div>
              <div className="fir-link"><div className='circle-dot' />{lang.firLeadLink}</div>
              <div className="sec-link"><div className='circle-dot' />{lang.secLeadLink}</div>
              <div className="fir-link"><div className='circle-dot' />{lang.firLeadLink}</div>
              <div className="sec-link active" style={{ color: theme }}>
                <div className='circle-dot' style={{ backgroundColor: theme }} />
                {lang.secLeadLink}
                <Icon type="expand_more" />
                <div className='mask' style={{ backgroundColor: theme }} />
              </div>
              <div className="thr-link">
                <div className='circle-dot' />
                <div style={lineWrap === 1 ? lineHeight : lineWrapStyle}>
                  {lang.thrLeadLinkWrap}
                </div>
              </div>
              <div className="thr-link"><div className='circle-dot' />{lang.thrLeadLink}</div>
              <div className="thr-link"><div className='circle-dot' />{lang.thrLeadLink}</div>
              <div className="sec-link">
                <div className='circle-dot' />
                {lang.secLeadLink}
                <Icon type="expand_less" />
              </div>
              <div className="fir-link"><div className='circle-dot' />{lang.firLeadLink}</div>
              <div className="sec-link">
                <div className='circle-dot' />
                {lang.secLeadLink}
              </div>
              <div className="sec-link">
                <div className='circle-dot' />
                {lang.secLeadLink}
              </div>
            </div>
            <div className='right'>
              <div className='tab-menu-bar'>
                <div className="item">
                  <Icon type="home" style={{ marginRight: '8px', color: "#a0a0a0", fontSize: "14px" }} />
                  <span>{lang.workbench}</span>
                  <span className='x'>&times;</span>
                </div>
                <span style={{ color: "#00000040", display: themeFlag ? "block" : "none" }}>|</span>
                <div className="item active" style={{ color: tabColor }}>{lang.menuTab}<span className='x'>&times;</span></div>
              </div>
              <div className='page-header'>
                <div className="page-title">{lang.pageTitle}</div>
                <div className='pk-btn' style={{ backgroundColor: buttonColor }}>{lang.primaryBtn}</div>
              </div>
              <div className='page-demo-content'>
                <div className="title">{lang.orderInfo}</div>
                <Form columns={3} dataSet={headerDs} labelLayout="vertical" className="c7n-pro-vertical-form-display" style={{ width: `${padType}%` }}>
                  <Output label={lang.orderNo} name="orderNo" />
                  <Output label={lang.orderName} name="orderName" />
                  <Output label={lang.orderType} name="orderType" />
                  <Output label={lang.amountTax} name="amountTax" />
                  <Output label={lang.amountNoTax} name="amountNoTax" />
                  <Output label={lang.total} name="total" />
                  <Output label={lang.localAmountTax} name="localAmountTax" />
                  <Output label={lang.localAmountNoTax} name="localAmountNoTax" />
                  <Output label={lang.remark} name="remark" />
                </Form>
                <div className="title">{lang.lineData}</div>
                <Table
                  dataSet={lineDs}
                  selectionMode='none'
                  columns={[
                    { name: 'no', title: lang.no, renderer({ text }) { return <a style={{ color: linkColor }}>{text}</a>; } },
                    { name: 'name', title: lang.name },
                    { name: 'desc', title: lang.desc },
                    { name: 'commitBy', title: lang.commitBy },
                    { name: 'op', title: lang.op, renderer() { return [<a style={{ color: linkColor, marginRight: '16px' }}>{lang.edit}</a>, <a style={{ color: linkColor }}>{lang.delete}</a>]; } },
                  ]}
                  rowHeight={densityType === 'small' ? "31px" : "39px"}
                  size={densityType}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
});
