import React, { useRef, useState, useEffect } from 'react';
import classnames from 'classnames';
import DocumentTitle from 'react-document-title';
import { debounce, isNil } from 'lodash';
import { Modal } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import request from 'utils/request';
import { PHONE } from 'utils/regExp';
import common from './common.less';
import product from './product.less';
import CaptchaModal from './CaptchaModal';

export default function Introduction() {
  const navRef = useRef();
  const navOffsetTop = useRef(0);
  const [{
    isMobile,
    navFixed,
    navTab,
    manageTab,
    manage01Tab,
    manage02Tab,
    manage03Tab,
    manage04Tab,
    purchaseTab,
    overviewTab,
    adsMessage,
    formValue,
  }, setState] = useState({
    isMobile: window.location.pathname.includes('/mobile'),
    navFixed: false,
    navTab: 'manage',
    manageTab: 'manage1',
    manage01Tab: 'manage01-1',
    manage02Tab: 'manage02-1',
    manage03Tab: 'manage03-1',
    manage04Tab: 'manage04-1',
    purchaseTab: 'purchase1',
    overviewTab: 'overview1',
    adsMessage: '',
    formValue: {
      name: '',
      companyName: '',
      phone: '',
    },
  });

  const updateState = (newState) => {
    setState(prevState => ({
      ...prevState,
      ...newState,
    }));
  };

  const handleChangeFormValue = (event, fieldName) => {
    updateState({
      formValue: {
        ...formValue,
        [fieldName]: (event && event.target && event.target.value) || '',
        adsMessage: '',
      },
    });
  };

  const handleScroll = (event) => {
    const scrollEl = event && event.target;
    if (!scrollEl) return;
    const scrollTop = scrollEl.scrollTop;
    const scrollLeft = scrollEl.scrollLeft;
    const offsetTop = (navRef.current && navRef.current.offsetTop) || 0;
    if (offsetTop > 0) {
      navOffsetTop.current = offsetTop;
    }
    const fixdTop = navOffsetTop.current || offsetTop;
    if (scrollTop === 0 && navFixed) {
      return;
    }
    if (scrollTop > fixdTop) {
      updateState({
        navFixed: true,
      });
    } else {
      updateState({
        navFixed: false,
      });
    }
  };

  const submit = debounce(() => {
    // 固定调dev的接口
    request('https://gateway.dev.isrm.going-link.com/marmot/v1/30/marmot-api-public/JS3h7iaCxujxhwsGtWOKG3upyxEibL4icvUkCL0TLYs489HvpdibU0cxa9GrYvIB3l0Y', {
      method: 'POST',
      responseType: 'text',
      body: {
        name: formValue.name,
        companyName: formValue.companyName,
        phone: formValue.phone,
      },
    });
    Modal.info({
      title: '提交成功！',
      autoCenter: true,
      movable: false,
      maskClosable: true,
      style: { width: isMobile ? '300px' : '400px' },
      className: isMobile? product['confirm-modal-mobile'] : undefined,
      okText: '确定',
    });
    updateState({
      formValue: {
        name: '',
        companyName: '',
        phone: '',
      },
    });
  }, 300);

  const openCatchModal = () => {
    updateState({
      adsMessage: '',
    });
    const { name, companyName, phone } = formValue;
    if (!name || !companyName || !phone) {
      updateState({
        adsMessage: '请填写完整信息',
      });
      return;
    }
    if (!PHONE.test(phone)) {
      updateState({
        adsMessage: '手机号码格式不正确',
      });
      return;
    }
    Modal.open({
      title: '请拖动下方滑块完成验证',
      autoCenter: true,
      movable: false,
      closable: true,
      maskClosable: true,
      style: { width: isMobile ? '300px' : '400px' },
      className: isMobile? product['catch-modal-mobile'] : undefined,
      children: <CaptchaModal onSuccess={submit} isMobile={isMobile} />,
      footer: null,
    });
  }

  return (
    <DocumentTitle title='甄云SRM'>
      <div 
        className={classnames(common.main, product.main)} 
        style={{ height: '100%', overflow: 'hidden' }}
      >
        <div onScroll={handleScroll} style={{ height: '100%', overflow: 'auto' }}>
          <div className='banner'>
            <div className='l-container clearfix'>
              <div className='banner-main'>
                <div className="banner-info">
                  <h1>甄云数字化采购平台</h1>
                  <p>为企业采购持续提效、持续赋能、深度协同</p>
                </div>
              </div>
            </div>
          </div>
          <div className={`l-nav ${navFixed ? 'nav-fixed' :''}`} ref={navRef}>
            <ul className="clearfix" id="navTarget">
              <li 
                onClick={() => updateState({ navTab: 'manage' })}
                className={navTab === 'manage' ? "active" : ''}
              >
                <a href="#manage">供应商管理</a>
              </li>
              <li
                onClick={() => updateState({ navTab: 'zhxy' })}
                className={navTab === 'zhxy' ? "active" : ''}
              >
                <a href="#zhxy">智慧寻源</a>
              </li>
              <li
                onClick={() => updateState({ navTab: 'mjxt' })}
                className={navTab === 'mjxt' ? "active" : ''}
              >
                <a href="#mjxt">敏捷协同</a>
              </li>
              <li
                onClick={() => updateState({ navTab: 'cgsc' })}
                className={navTab === 'cgsc' ? "active" : ''}
              >
                <a href="#cgsc">采购商城</a>
              </li>
              <li
                onClick={() => updateState({ navTab: 'zpsl' })}
                className={navTab === 'zpsl' ? "active" : ''}
              >
                <a href="#zpsl">甄品速览</a>
              </li>
              <li
                onClick={() => updateState({ navTab: 'ad' })}
                className={navTab === 'ad' ? "active" : ''}
              >
                <a href="#adTarget">联系我们</a>
              </li>
              <li
                onClick={() => updateState({ navTab: 'jjfa' })}
                className={navTab === 'jjfa' ? "active" : ''}
              >
                <a href="#jjfa">解决方案</a>
              </li>
            </ul>
          </div>
          <div className="manage l-section" id="manage" data-loaded="true">
            <div className="l-container" id="manageTarget">
              <div className="l-title element-entrance-1 ee-enter">
                <h2>供应商全方位闭环管理</h2>
                <p>帮您建立更优质的供方体系，阳光透明</p>
              </div>
              <div className="l-body element-entrance-1 ee-enter">
                <div className="tab manage-tab" data-index="3" data-direction="cross">
                  <div style={{ textAlign: 'center' }}>
                    <ul style={{ display: 'inline-flex' }} className="tab_btn clearfix">
                      <li key='manage1' className={manageTab === 'manage1' ? "active" : ''}>
                        <h3 onClick={() => updateState({ manageTab: 'manage1' })}>
                          <span>供应商全生命周期管理</span>
                        </h3>
                      </li>
                      <li key='manage2' className={manageTab === 'manage2' ? "active" : ''}>
                        <h3 onClick={() => updateState({ manageTab: 'manage2' })}>
                          <span>动态风险监控</span>
                        </h3>
                      </li>
                      <li key='manage3' className={manageTab === 'manage3' ? "active" : ''}>
                        <h3 onClick={() => updateState({ manageTab: 'manage3' })}>
                          <span>绩效管理</span>
                        </h3>
                      </li>
                    </ul>
                    <span className="active-line"></span>
                  </div>
                  <ul className="tab_item clearfix">
                    <li className={manageTab === 'manage1' ? "show" : "hide"}>
                      <div className="content-box">
                        <div className="l-content-left">
                          <div className="solution-img-box">
                            <img src="https://www.going-link.com/image/202105/20210515151036_8896517.png" alt="https://www.going-link.com/manage-img-01.png" />
                          </div>
                        </div>
                        <div className="l-content-right">
                          <div className="solution-info-box">
                            <h3>
                              <span>供应商全生命周期管理</span>
                            </h3>
                            <ul>
                              <li>
                                <p>
                                  <i  className='right-icon' ></i>
                                  <span>全生命周期</span>
                                  <span>覆盖准入、建立、发展、淘汰全生命周期管理</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i  className='right-icon' ></i>
                                  <span>准入及认证</span>
                                  <span>支持合作邀请，供应商档案及维护，物料认证</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i  className='right-icon' ></i>
                                  <span>发展及分级</span>
                                  <span>基于绩效模型、资质管理等进行供应商分级</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i  className='right-icon' ></i>
                                  <span>优化改善</span>
                                  <span>进行整改、淘汰、配额调整、寻源限制等</span>
                                </p>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li className={manageTab === 'manage2' ? "show" : "hide"}>
                      <div className="content-box">
                        <div className="l-content-left">
                          <div className="solution-img-box">
                            <img src="https://www.going-link.com/image/202105/20210515151052_7623841.png" alt="https://www.going-link.com/manage-img-02.png" />
                          </div>
                        </div>
                        <div className="l-content-right">
                          <div className="solution-info-box">
                            <h3>
                              <span>动态化供应商风险监控</span>
                            </h3>
                            <ul>
                              <li>
                                <p>
                                  <i className='right-icon' ></i>
                                  <span>源头把控</span>
                                  <span>对接RiskRaider，保障注册信息真实可靠,为供应商准入增加过滤</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i  className='right-icon' ></i>
                                  <span>征信平台赋能</span>
                                  <span>第一时间了解供应商企业舆情动态</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i  className='right-icon' ></i>
                                  <span>全流程</span>
                                  <span>重点供应商重点跟踪，全流程及时监控</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i  className='right-icon' ></i>
                                  <span>变动通知</span>
                                  <span>供应商变动信息及时通知企业，增加供应商管理依据</span>
                                </p>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li className={manageTab === 'manage3' ? "show" : "hide"}>
                      <div className="content-box">
                        <div className="l-content-left">
                          <div className="solution-img-box">
                            <img src="https://www.going-link.com/image/202105/20210515151058_7662856.png" alt="https://www.going-link.com/manage-img-03.png" />
                          </div>
                        </div>
                        <div className="l-content-right">
                          <div className="solution-info-box">
                            <h3>
                              <span>供应商绩效考核</span>
                            </h3>
                            <ul>
                              <li>
                                <p>
                                  <i  className='right-icon' ></i>
                                  <span>统一模板</span>
                                  <span>根据品类建立同行业考核模块，便于横向对比</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i  className='right-icon' ></i>
                                  <span>手动/自动打分</span>
                                  <span>人工手动在系统中录入绩效数据或系统定期自动抓取数据</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i  className='right-icon' ></i>
                                  <span>供应商整改</span>
                                  <span>根据每季度的评分总结年度供应商绩效，进行横向评比和筛选，督促引导供应商整改</span>
                                </p>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="manage manage-01 l-section" id="zhxy" data-loaded="true">
            <div className="l-container" id="manage01Target">
              <div className="l-title element-entrance-1 ee-enter">
                <h2>智慧寻源，高效定商定价</h2>
                <p>覆盖企业所有定价行为，合规透明，综合降低采购成本</p>
              </div>
              <div className="l-body element-entrance-1 ee-enter">
                <div className="tab manage-tab-01" data-index="4" data-direction="cross">
                  <div className="scroll-tab">
                    <div style={{ textAlign: 'center' }}>
                      <ul style={{ display: 'inline-flex' }} className="tab_btn clearfix">
                        <li className={manage01Tab === 'manage01-1' ? 'active' : ''}>
                          <h3 onClick={() => updateState({ manage01Tab: 'manage01-1' })}>
                            <span>多策略寻源</span>
                          </h3>
                        </li>
                        <li className={manage01Tab === 'manage01-2' ? 'active' : ''}>
                          <h3 onClick={() => updateState({ manage01Tab: 'manage01-2' })}>
                            <span>智能价格管控</span>
                          </h3>
                        </li>
                        <li className={manage01Tab === 'manage01-3' ? 'active' : ''}>
                          <h3 onClick={() => updateState({ manage01Tab: 'manage01-3' })}>
                            <span>海量供应商整合</span>
                          </h3>
                        </li>
                        <li className={manage01Tab === 'manage01-4' ? 'active' : ''}>
                          <h3 onClick={() => updateState({ manage01Tab: 'manage01-4' })}>
                            <span>电子化合同管理</span>
                          </h3>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <span className="active-line"></span>
                  <ul className="tab_item clearfix">
                    <li className={manage01Tab === 'manage01-1' ? 'show' : 'hide'}>
                      <div className="content-box">
                        <div className="solution-img-box mb">
                          <img src="https://www.going-link.com/image/202209/20220919183701_2092376.png" alt="https://www.going-link.com/manage-img-04.png" />
                        </div>
                        <div className="l-content-left">
                          <div className="solution-info-box">
                            <h3>
                              <span>多策略寻源，满足多场景应用</span>
                            </h3>
                            <ul>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>多场景满足</span>
                                  <span> 不同采购场景，采取不同寻源策略，实现采购线上化管控</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>招投标</span>
                                  <span>支持公开，邀请，代理等不同招投标方式，适合金额高、技术参数复杂，需要考虑总成本的采购</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>询报价</span>
                                  <span>快速匹配高性价比供应商，适合低金额，以价格为主要决标要素的采购</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span> 竞价</span>
                                  <span>供应商之间相互竞价，还价历史清晰可查，适合标准化程度高、定制件、供方资源丰富的采购</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span> 竞标大厅</span>
                                  <span> 实时呈现供应商排名，支持修改报价，适合拍卖等形式</span>
                                </p>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="l-content-right">
                          <div className="solution-img-box pc">
                            <img src="https://www.going-link.com/image/202209/20220919183701_2092376.png" alt="https://www.going-link.com/manage-img-04.png" />
                          </div>
                        </div>
                      </div>
                    </li>
                    <li className={manage01Tab === 'manage01-2' ? 'show' : 'hide'}>
                      <div className="content-box">
                        <div className="solution-img-box mb">
                          <img src="https://www.going-link.com/image/202209/20220919183724_1665738.png" alt="https://www.going-link.com/manage-img-05.png" />
                        </div>
                        <div className="l-content-left">
                          <div className="solution-info-box">
                            <h3>
                              <span>智能价格管控，综合降低采购成本(TCO)</span>
                            </h3>
                            <ul>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>自动询价</span>
                                  <span>支持询价自动发布，供应商自主报价，自动核价，减少繁琐事务</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>价格库</span>
                                  <span>价格走势清晰可见，为购买提供历史价格参考，便于价格决策</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>谈判工具</span>
                                  <span>通过竞价、成本明细、价格库等工具提升谈判能力，降低采购价格</span>
                                </p>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="l-content-right">
                          <div className="solution-img-box pc">
                            <img src="https://www.going-link.com/image/202209/20220919183724_1665738.png" alt="https://www.going-link.com/manage-img-05.png" />
                          </div>
                        </div>
                      </div>
                    </li>
                    <li className={manage01Tab === 'manage01-3' ? 'show' : 'hide'}>
                      <div className="content-box">
                        <div className="solution-img-box mb">
                          <img src="https://www.going-link.com/image/202105/20210515151624_2652635.png" alt="https://www.going-link.com/manage-img-06.png" />
                        </div>
                        <div className="l-content-left">
                          <div className="solution-info-box">
                            <h3>
                              <span>海量供应商整合，扩展寻源空间</span>
                            </h3>
                            <ul>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span> 合作供应商</span>
                                  <span>订单可定向发给指定某合作供应商、也可在已合作供应商内公开</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>全平台</span>
                                  <span>同时也支持全平台公开寻源供应商邀请</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span> 智能匹配</span>
                                  <span>按照物料品类，为客户提供潜在货源智能推荐</span>
                                </p>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="l-content-right">
                          <div className="solution-img-box pc">
                            <img src="https://www.going-link.com/image/202105/20210515151624_2652635.png" alt="https://www.going-link.com/manage-img-06.png" />
                          </div>
                        </div>
                      </div>
                    </li>
                    <li className={manage01Tab === 'manage01-4' ? 'show' : 'hide'}>
                      <div className="content-box">
                        <div className="solution-img-box mb">
                          <img src="https://www.going-link.com/image/202105/20210515151631_8976814.png" alt="https://www.going-link.com/manage-img-07.png" />
                        </div> 
                        <div className="l-content-left">
                          <div className="solution-info-box">
                            <h3>
                              <span>电子化的采购合同管理，高效便捷</span>
                            </h3>
                            <ul>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>智能识别</span>
                                  <span>文本识别为结构化数据，模板库标签自动识别，自动替换</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span> 风险预警</span>
                                  <span>在线编辑，对篡改进行标记，基于历史风险条款，高风险预警</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>在线签章</span>
                                  <span>采购方供应商在线合同确认，进行在线电子签章</span>
                                </p>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="l-content-right">
                          <div className="solution-img-box pc">
                            <img src="https://www.going-link.com/image/202105/20210515151631_8976814.png" alt="https://www.going-link.com/manage-img-07.png" />
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="manage manage-02 l-section" id="mjxt" data-loaded="true">
            <div className="l-container" id="manage02Target">
              <div className="l-title element-entrance-1 ee-enter">
                <h2>敏捷协同，互联互通</h2>
                <p>实现采购企业与供应链伙伴之间深度协同，提升效能</p>
              </div>
              <div className="l-body element-entrance-1 ee-enter">
                <div className="tab manage-tab-02" data-index="5" data-direction="cross">
                  <div className="scroll-tab">
                    <div style={{ textAlign: 'center' }}>
                      <ul style={{ display: 'inline-flex' }} className="tab_btn clearfix">
                        <li className={manage02Tab === 'manage02-1' ? "active" : ''}>
                          <h3 onClick={() => updateState({ manage02Tab: 'manage02-1' })}>
                            <span>预测计划协同</span>
                          </h3>
                        </li>
                        <li className={manage02Tab === 'manage02-2' ? "active" : ''}>
                          <h3 onClick={() => updateState({ manage02Tab: 'manage02-2' })}>
                            <span> 订单协同</span>
                          </h3>
                        </li>
                        <li className={manage02Tab === 'manage02-3' ? "active" : ''}>
                          <h3 onClick={() => updateState({ manage02Tab: 'manage02-3' })}>
                            <span> 送收货协同</span>
                          </h3>
                        </li>
                        <li className={manage02Tab === 'manage02-4' ? "active" : ''}>
                          <h3 onClick={() => updateState({ manage02Tab: 'manage02-4' })}>
                            <span> 质量协同</span>
                          </h3>
                        </li>
                        <li className={manage02Tab === 'manage02-5' ? "active" : ''}>
                          <h3 onClick={() => updateState({ manage02Tab: 'manage02-5' })}>
                            <span> 财务结算协同</span>
                          </h3>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <span className="active-line"></span>
                  <ul className="tab_item clearfix">
                    <li className={manage02Tab === 'manage02-1' ? "show" : 'hide'}>
                      <div className="content-box">
                        <div className="l-content-left">
                          <div className="solution-img-box">
                            <img src="https://www.going-link.com/image/202105/20210515152413_3452654.png" alt="https://www.going-link.com/manage-img-08.png" />
                          </div>
                        </div>
                        <div className="l-content-right">
                          <div className="solution-info-box">
                            <h3>
                              <span>预测及计划协同，明确供应需求</span>
                            </h3>
                            <ul>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>信息互通</span>
                                  <span>共享采供双方需求信息、产能与交付信息，提升整体预测精度</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>按需配送</span>
                                  <span>基于送货计划拉动供应商按需配送，让供应商每笔来料都准时、准确、可控，降低整体库存水平，提升供应链效率</span>
                                </p>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li className={manage02Tab === 'manage02-2' ? "show" : 'hide'}>
                      <div className="content-box">
                        <div className="l-content-left">
                          <div className="solution-img-box">
                            <img src="https://www.going-link.com/image/202306/20230629135827_5914567.png" alt="https://www.going-link.com/20210515152427_1968421.png" />
                          </div>
                        </div>
                        <div className="l-content-right">
                          <div className="solution-info-box">
                            <h3>
                              <span>订单协同，灵活配置</span>
                            </h3>
                            <ul>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>采购申请自动化</span>
                                  <span>内建数据取值关系，只需要点击几步整张采购申请即可录入</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>一键式转单</span>
                                      <span>基于采购申请、寻源结果等规则自动创建订单，减少人工操作</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>订单中心</span>
                                  <span>实时准确传递交期、进度、质量要求、技术要求等相关信息</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>份额管理</span>
                                    <span>支持执行采购协议，按照配额比例快速下单</span>
                                </p>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li className={manage02Tab === 'manage02-3' ? "show" : 'hide'}>
                      <div className="content-box">
                        <div className="l-content-left">
                          <div className="solution-img-box">
                            <img src="https://www.going-link.com/image/202105/20210515152435_1153758.png" alt="https://www.going-link.com/manage-img-10.png" />
                          </div>
                        </div>
                        <div className="l-content-right">
                          <div className="solution-info-box">
                            <h3>
                              <span>物流收货协同，快速响应</span>
                            </h3>
                            <ul>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>整合物流数据</span>
                                  <span>实现企业和供应商之间的物流信息协同，建立需求拉动、敏捷高效的物流配送体系，物流节点状态可视化，进度实时追踪</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>复杂收货场景</span>
                                  <span>支持配置化实现各种收货模式，合理管控收货流程，应对复杂收货场景</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>送货单条码化</span>
                                  <span>送货通知单可自动生成条码，方便采购商进行扫码入库</span>
                                </p>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li className={manage02Tab === 'manage02-4' ? "show" : 'hide'}>
                      <div className="content-box">
                        <div className="l-content-left">
                          <div className="solution-img-box">
                            <img src="https://www.going-link.com/image/202306/20230629135905_2368165.png" alt="https://www.going-link.com/20210515152451_8468534.png" />
                          </div>
                        </div>
                        <div className="l-content-right">
                          <div className="solution-info-box">
                            <h3>
                              <span>质量协同 闭环全过程追溯</span>
                            </h3>
                            <ul>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span> 8D</span>
                                  <span>支持各个环节不合格品的索赔管理，由供应商及时反馈问题原因并提交临时&amp;永久解决措施；</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>索赔</span>
                                  <span>每一笔索赔追溯到原始订单，全流程清晰可查询</span>
                                </p>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li className={manage02Tab === 'manage02-5' ? "show" : 'hide'}>
                      <div className="content-box">
                        <div className="l-content-left">
                          <div className="solution-img-box">
                            <img src="https://www.going-link.com/image/202105/20210515152518_3966147.png" alt="https://www.going-link.com/manage-img-12.png" />
                          </div>
                        </div>
                        <div className="l-content-right">
                          <div className="solution-info-box">
                            <h3>
                              <span>财务结算协同，一键自动处理</span>
                            </h3>
                            <ul>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>结算中心</span>
                                  <span>搭建统一的应付结算平台，支持多类数据来源、多种协同方式、多样化结算模式</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>电子发票</span>
                                  <span>在线进行发票审批，自动创建电子发票，一键导入ERP，节省发票预制工作量</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span> OCR</span>
                                  <span>结合OCR影像识别、发票验真、直连开票，实现电子发票管理</span>
                                </p>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="manage manage-03 l-section" id="cgsc" data-loaded="true">
            <div className="l-container" id="manage03Target">
              <div className="l-title element-entrance-1 ee-enter">
                <h2>非生物资采购商城</h2>
                <p>选择权下放给业务，解放采购生产力</p>
              </div>
              <div className="l-body element-entrance-1 ee-enter">
                <div className="tab manage-tab-03" data-index="4" data-direction="cross">
                  <div className="scroll-tab">
                    <div style={{ textAlign: 'center' }}>
                      <ul style={{ display: 'inline-flex' }} className="tab_btn clearfix">
                        <li className={manage03Tab === 'manage03-1' ? "active" : ''}>
                          <h3 onClick={() => updateState({ manage03Tab: 'manage03-1' })}>
                            <span>大型电商对接</span>
                          </h3>
                        </li>
                        <li className={manage03Tab === 'manage03-2' ? "active" : ''}>
                          <h3 onClick={() => updateState({ manage03Tab: 'manage03-2' })}>
                            <span> 跨平台比价</span>
                          </h3>
                        </li>
                        <li className={manage03Tab === 'manage03-3' ? "active" : ''}>
                          <h3 onClick={() => updateState({ manage03Tab: 'manage03-3' })}>
                            <span> 多场景电商</span>
                          </h3>
                        </li>
                        <li className={manage03Tab === 'manage03-4' ? "active" : ''}>
                          <h3 onClick={() => updateState({ manage03Tab: 'manage03-4' })}>
                            <span> 目录化采购</span>
                          </h3>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <span className="active-line"></span>
                  <ul className="tab_item clearfix">
                    <li className={manage03Tab === 'manage03-1' ? "show" : 'hide'}>
                      <div className="content-box">
                        <div className="l-content-left">
                          <h3>整合优质电商，畅享全品类采购</h3>
                          <div className="solution-img-box">
                            <img src="https://www.going-link.com/image/202303/20230324142720_6772517.png" className="pc" alt="https://www.going-link.com/大型电商对接.png" />
                            <img src="https://www.going-link.com/image/202303/20230324142725_4287431.png" className="mb" alt="https://www.going-link.com/大型电商对接配图移动.png" />
                          </div>
                        </div>
                      </div>
                    </li>
                    <li className={manage03Tab === 'manage03-2' ? "show" : 'hide'}>
                      <div className="content-box">
                        <div className="l-content-left">
                          <div className="solution-img-box">
                            <img src="https://www.going-link.com/image/202105/20210515152630_3932761.png" alt="https://www.going-link.com/manage-img-13.png" />
                          </div>
                        </div>
                        <div className="l-content-right">
                          <div className="solution-info-box">
                            <h3>
                              <span> 支撑跨平台商品比价</span>
                            </h3>
                            <ul>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>高效搜索</span>
                                  <span>搜索结果更精确，精准</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>同质比价</span>
                                  <span>按照采购商品同质进行跨平台智能比价</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>智能推荐</span>
                                  <span>根据采购人行为及目标商品，智能推荐最优商品</span>
                                </p>
                                </li>
                                <li>
                                  <p>
                                    <i className='right-icon'></i>
                                    <span>拍照购</span>
                                    <span>通过拍照或上传图片系统自动识别所需购买的商品</span>
                                  </p>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </li>
                      <li className={manage03Tab === 'manage03-3' ? "show" : 'hide'}>
                      <div className="content-box">
                        <div className="l-content-left">
                          <div className="solution-img-box">
                            <img src="https://www.going-link.com/image/202306/20230629140012_9745783.png" alt="https://www.going-link.com/20210515152650_3052618.png" />
                          </div>
                        </div>
                        <div className="l-content-right">
                          <div className="solution-info-box">
                            <h3>
                              <span>支持电商采购多场景</span>
                            </h3>
                            <p></p>
                            <p>通过“微服务+规则引擎”，实现了 “积木化”配置，快速组合出企业所需采购管理平台，支持：</p>
                            <ul>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>企业福利商城场景</span>
                                  <span></span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>企业闲置物资交易平台</span>
                                  <span></span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>采销一体场景</span>
                                  <span></span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>采购能力输出场景</span>
                                  <span></span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>门店连锁交易</span>
                                  <span></span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span>……</span>
                                </p>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li className={manage03Tab === 'manage03-4' ? "show" : 'hide'}>
                      <div className="content-box">
                        <div className="l-content-left">
                          <div className="solution-img-box">
                            <img src="https://www.going-link.com/image/202105/20210515152703_3055347.png" alt="https://www.going-link.com/manage-img-15.png" />
                          </div>
                        </div>
                        <div className="l-content-right">
                          <div className="solution-info-box">
                            <h3>
                              <span>信息互通</span>
                            </h3>
                            <p>采购方在商城上采购自有供应商的各类商品，以及完成订单、结算、售后等的协同</p>
                            <ul>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span></span>
                                  <span> 自主把控商品定价权，定价方式灵活，商品上架更便利</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span></span>
                                  <span>关联价格库生成商品，供应商、物料，价格统一联动管理</span>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <i className='right-icon'></i>
                                  <span></span>
                                  <span>满足企业内部较为复杂的采买权限管控，不同采买权限，对应不同商品价格</span>
                                </p>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="overview overview-new l-section" id="zpsl" data-loaded="true">
            <div className="l-container" id="decisionTarget">
              <div className="l-title element-entrance-1 ee-enter">
                <h2>甄品速览 一 甄云产品最新动态</h2>
              </div>
              <div className="l-body element-entrance-1 ee-enter">
                <div className="top-content mb">
                  <ul className="clearfix">
                    <li
                      key='overview1'
                      className={overviewTab === 'overview1' ? 'active' : ''}
                      onClick={() => updateState({ overviewTab: 'overview1' })}
                    >
                      <h3 className=""><img src="https://www.going-link.com/image/202301/20230116140301_4138536.svg" alt="https://www.going-link.com/20220912222710_6755237.svg" /> <span>采购效率提升</span> </h3>
                    </li>
                    <li
                      key='overview2'
                      className={overviewTab === 'overview2' ? 'active' : ''}
                      onClick={() => updateState({ overviewTab: 'overview2' })}
                    >
                      <h3><img src="https://www.going-link.com/image/202209/20220912222729_6902167.svg" alt="https://www.going-link.com/overview-icon-002.svg" /> <span>生态资源服务</span> </h3>
                    </li>
                    <li
                      key='overview3'
                      className={overviewTab === 'overview3' ? 'active' : ''}
                      onClick={() => updateState({ overviewTab: 'overview3' })}
                    >
                      <h3><img src="https://www.going-link.com/image/202209/20220912222737_6303261.svg" alt="https://www.going-link.com/overview-icon-003.svg" /> <span>智能决策</span> </h3>
                    </li>
                    <li
                      key='overview4'
                      className={overviewTab === 'overview4' ? 'active' : ''}
                      onClick={() => updateState({ overviewTab: 'overview4' })}
                    >
                      <h3><img src="https://www.going-link.com/image/202301/20230116140208_9357218.svg" alt="https://www.going-link.com/智能决策icon移动端.svg" /> <span>生态资源辅助运营</span> </h3>
                    </li>
                  </ul>
                </div>
                <div key='overviewTab1' className={`content-l ${overviewTab === 'overview1' ? 'active' : ''}`}>
                  <div className="card">
                  <h3><img src="https://www.going-link.com/image/202209/20220912222511_471875.svg" alt="https://www.going-link.com/overview-icon-01.svg" />采购效率提升</h3>
                  <ul>
                    <li className="content-l-s">
                      <a href="javascript:void(0);">
                        <h3><img src="https://www.going-link.com/image/202209/20220912222523_7031457.svg" alt="https://www.going-link.com/overview-icon-02.svg" />甄云即刻
                        </h3>
                        <h4>智能客服</h4>
                        <p>7*24h智能问答服务，减少重复无效沟通</p>
                        <h4>采购助手</h4>
                        <p>对话式拉取数据，操作高频单据，自动推送业务预警，响应采供双方问题</p>
                      </a>
                    </li>
                    <li>
                      <a href="javascript:void(0);">
                        <h3><img src="https://www.going-link.com/image/202301/20230115114358_1861436.svg" alt="https://www.going-link.com/ocr识别icon.svg" />OCR识别
                        </h3>
                        <p>无需手工输入，自动识别发票或营业执照</p>
                      </a>
                    </li>
                  </ul>
                  </div>
                </div>
                <div key='overviewTab2' className={`content-c ${overviewTab === 'overview2' ? 'active' : ''}`}>
                <div className="card">
                  <h3><img src="https://www.going-link.com/image/202209/20220912222544_3644835.svg" alt="https://www.going-link.com/overview-icon-05.svg" />生态资源服务
                  </h3>
                  <ul>
                    <li>
                      <a href="javascript:void(0);">
                        <h3><img src="https://www.going-link.com/image/202301/20230115114424_874871.svg" alt="https://www.going-link.com/电子签章icon.svg" />电子签章
                          </h3>
                        <p>在线签署，安全高效</p>
                      </a>
                    </li>
                    <li>
                      <a href="javascript:void(0);">
                        <h3><img src="https://www.going-link.com/image/202301/20230115114433_546348.svg" alt="https://www.going-link.com/供应商风险控制icon.svg" />供应商风险控制
                          </h3>
                        <p>供应商风险扫描、监控、预警</p>
                      </a>
                    </li>
                    <li>
                      <a href="javascript:void(0);">
                        <h3><img src="https://www.going-link.com/image/202301/20230115114444_1385361.svg" alt="https://www.going-link.com/发票验真icon.svg" /> 发票验真
                          </h3>
                        <p>查验发票真伪，降低税务风险</p>
                      </a>
                    </li>
                  </ul>
                  <ul>
                    <li>
                      <a href="javascript:void(0);">
                        <h3><img src="https://www.going-link.com/image/202301/20230115114501_6753874.svg" alt="https://www.going-link.com/直连开票icon.svg" />直连开票
                          </h3>
                        <p>供应商直连开票，实现发票流程自动化</p>
                      </a>
                    </li>
                    <li>
                      <a href="javascript:void(0);">
                        <h3><img src="https://www.going-link.com/image/202301/20230115114509_145318.svg" alt="https://www.going-link.com/云仓一体icon.svg" />云仓一体
                          </h3>
                        <p>云端数据与本地数据的融合建模与分析</p>
                      </a>
                    </li>
                    <li>
                      <a href="javascript:void(0);">
                        <h3><img src="https://www.going-link.com/image/202301/20230115114516_3437184.svg" alt="https://www.going-link.com/智能货柜icon.svg" />智能货柜
                          </h3>
                        <p>无人货柜，自助领料，供应商自动补货</p>
                      </a>
                    </li>
                  </ul>
                  </div>
                </div>
                <div key='overviewTab3' className={`content-rs ${overviewTab === 'overview3' ? 'active' : ''}`}>
                <div className="card">
                  <h3><img src="https://www.going-link.com/image/202301/20230114192607_6691384.svg" alt="https://www.going-link.com/1.svg" />生态资源辅助运营</h3>
                  <ul>
                    <li>
                      <a href="javascript:void(0);">
                        <h3>
                          <img src="https://www.going-link.com/image/202301/20230115114800_2806742.svg" alt="https://www.going-link.com/物流查询icon.svg" />物流查询
                        </h3>
                        <p>实时追踪物流进度</p>
                      </a>
                    </li>
                    <li>
                      <a href="javascript:void(0);">
                        <h3>
                          <img src="https://www.going-link.com/image/202301/20230115114809_3741453.svg" alt="https://www.going-link.com/价格指数icon.svg" />价格指数
                        </h3>
                        <p>大宗原材料价格工具</p>
                      </a>
                    </li>
                  </ul>
                  </div>
                </div>
                <div key='overviewTab4' className={`content-r ${overviewTab === 'overview4' ? 'active' : ''}`}>
                <div className="card">
                  <h3><img src="https://www.going-link.com/image/202301/20230115114656_4942876.svg" alt="https://www.going-link.com/智能决策icon.svg" />智能决策</h3>
                  <ul>
                    <li>
                      <a href="javascript:void(0);">
                        <h3><img src="https://www.going-link.com/image/202301/20230115114706_2521547.svg" alt="https://www.going-link.com/智能比价icon.svg" />智能比价
                          </h3>
                        <p>基于NLP技术，计算商品相似度，自动识别同款商品进行比价</p>
                      </a>
                    </li>
                    <li>
                      <a href="javascript:void(0);">
                        <h3><img src="https://www.going-link.com/image/202301/20230115114713_6613687.svg" alt="https://www.going-link.com/数据订阅icon.svg" />数据订阅
                          </h3>
                        <p>构建高效、智能的数据分析模型</p>
                      </a>
                    </li>
                  </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="ads">
            <div className="l-container" id="adTarget">
              <div className="ad-info">
                <h3>留下您的联系方式</h3>
                <p>商务合作咨询 非供应商入口</p>
              </div>
              <div class="demo-form adform">
              <div class="form">
                <div class="label-box">
                  <input
                    value={formValue.name}
                    onChange={v => handleChangeFormValue(v, 'name')}
                    type="text"
                    class="name-input"
                    placeholder="姓名"
                  />
                </div>
                <div class="label-box">
                  <input
                    value={formValue.companyName}
                    onChange={v => handleChangeFormValue(v, 'companyName')}
                    type="text"
                    class="enterprise-input"
                    placeholder="公司名称"
                  />
                  <div class="select-btn"></div><div class="select-list"><ul></ul></div>
                </div>
                <div class="label-box">
                  <input
                    value={formValue.phone}
                    onChange={v => handleChangeFormValue(v, 'phone')}
                    type="text"
                    class="phone-input"
                    placeholder="手机号"
                  />
                </div>
                <div class="label-box">
                  <a
                    href="javascript:void(0);"
                    class="l-btn green commit"
                    onClick={openCatchModal}
                    style={{ height: '36px', lineHeight: '36px', display: 'inline-block', float: 'unset' }}
                  >
                    立即提交<i class="arrow-right"></i>
                  </a>
                </div>
              </div>
              <div class="tip-info">
                <p class="message-info">{adsMessage}</p>
              </div>
              </div>
              <div className="ads-content">
                <div>
                  商务合作: 181-0262-3994
                </div>
                <div>
                  xiaolin.zhong@going-link.com
                </div>
              </div>
            </div>
          </div>
          <div id='jjfa' class="nav-dropdown-box solution" style={{ pointerEvents: 'auto' }}>
            <div className="l-title element-entrance-1 ee-enter">
              <h2>行业解决方案</h2>
            </div>
            <div class="l-container">
              <div class="nav-dropdown-item">
                <div class="nav-dropdown-items">
                  <a>
                    <h3> 家居行业</h3>
                    <p>解决家居品类庞杂、需求多元 协同高问题</p>
                    <img src="https://www.going-link.com/image/202303/20230309105908_5486317.jpg" alt="" />
                    <img src="https://www.going-link.com/image/202303/20230309105912_4091832.jpg" alt="" />
                  </a>
                </div>
              </div>
              <div class="nav-dropdown-item">
                <div class="nav-dropdown-items">
                  <a>
                    <h3> 连锁零售行业</h3>
                    <p>解决门店低值易耗品采购流程冗长、扩张采购重复执行</p>
                    <img src="https://www.going-link.com/image/202303/20230309105920_9237316.jpg" alt="" />
                    <img src="https://www.going-link.com/image/202303/20230309105935_936843.jpg" alt="" />
                  </a>
                </div>
              </div>
              <div class="nav-dropdown-item">
                <div class="nav-dropdown-items">
                  <a>
                    <h3> 食品行业</h3>
                    <p>实现供应商管理、寻源、订单质量管理等采购数字化</p>
                    <img src="https://www.going-link.com/image/202303/20230309105939_3177542.jpg" alt="" />
                    <img src="https://www.going-link.com/image/202303/20230309105948_1212713.jpg" alt="" />
                  </a>
                </div>
              </div>
              <div class="nav-dropdown-item">
                <div class="nav-dropdown-items">
                  <a>
                    <h3> 医药行业</h3>
                    <p>全流程全生命周期数字化升级 实现可追溯、可视化</p>
                    <img src="https://www.going-link.com/image/202303/20230309105953_171267.jpg" alt="" />
                    <img src="https://www.going-link.com/image/202303/20230309105956_9727158.jpg" alt="" />
                  </a>
                </div>
              </div>
              <div class="nav-dropdown-item">
                <div class="nav-dropdown-items">
                  <a >
                    <h3> 互联网行业</h3>
                    <p>商品标准化处理，实现集采降本和优化采购体验</p>
                    <img src="https://www.going-link.com/image/202303/20230309110005_8417643.jpg" alt="" />
                    <img src="https://www.going-link.com/image/202303/20230309110016_4117652.jpg" alt="" />
                  </a>
                </div>
              </div>
              <div class="nav-dropdown-item">
                <div class="nav-dropdown-items">
                  <a>
                    <h3> 服装行业</h3>
                    <p>提升供应商协同效率，设置报价模板，实现报价单合理性</p>
                    <img src="https://www.going-link.com/image/202303/20230309110021_2231786.jpg" alt="" />
                    <img src="https://www.going-link.com/image/202303/20230309110030_7574532.jpg" alt="" />
                  </a>
                </div>
              </div>
              <div class="nav-dropdown-item">
                <div class="nav-dropdown-items">
                  <a>
                    <h3> 化工行业</h3>
                    <p>价格指数提供采购窗口，目录化+电商化采购，发挥集采优势</p>
                    <img src="https://www.going-link.com/image/202303/20230309110034_7496324.jpg" alt="" />
                    <img src="https://www.going-link.com/image/202303/20230309110038_9711574.jpg" alt="" />
                  </a>
                </div>
              </div>
              <div class="nav-dropdown-item">
                <div class="nav-dropdown-items">
                  <a>
                    <h3> 白酒行业</h3>
                    <p>开发图片管理功能，同步版本信息，改善操作体验</p>
                    <img src="https://www.going-link.com/image/202303/20230309110043_8008273.jpg" alt="" />
                    <img src="https://www.going-link.com/image/202303/20230309110047_8762574.jpg" alt="" />
                  </a>
                </div>
              </div>
              <div class="nav-dropdown-item">
                <div class="nav-dropdown-items">
                  <a>
                    <h3> 化妆品行业</h3>
                    <p>解决新品开发寻源效率低、提升与OEM厂商协同效率</p>
                    <img src="https://www.going-link.com/image/202303/20230309110054_4295812.jpg" alt="" />
                    <img src="https://www.going-link.com/image/202303/20230309110103_2484512.jpg" alt="" />
                  </a>
                </div>
              </div>
              <div class="nav-dropdown-item">
                <div class="nav-dropdown-items">
                  <a>
                    <h3> 家电电子行业</h3>
                    <p>推出多种寻源模式，解决成本难以控制问题。</p>
                    <img src="https://www.going-link.com/image/202303/20230312210225_9623642.jpg" alt="" />
                    <img src="https://www.going-link.com/image/202303/20230312210232_3448143.jpg" alt="" />
                  </a>
                </div>
              </div>
              <div class="nav-dropdown-item">
                <div class="nav-dropdown-items">
                  <a>
                    <h3> 物管行业解决方案</h3>
                    <p>解决需求分散、品类庞杂、频次高、场景多、供应商众多等难题</p>
                    <img src="https://www.going-link.com/image/202309/20230914155334_3763182.jpg" alt="" />
                    <img src="https://www.going-link.com/image/202309/20230914155334_6114512.jpg" alt="" />
                  </a>
                </div>
              </div>
              <div class="nav-dropdown-item">
                <div class="nav-dropdown-items">
                  <a>
                    <h3> 光伏行业解决方案</h3>
                    <p>数字化、智能化提高光伏行业精细化管理水平</p>
                    <img src="https://www.going-link.com/image/202309/20230914155900_637683.jpg" alt="" />
                    <img src="https://www.going-link.com/image/202309/20230914155903_5272738.jpg" alt="" />
                  </a>
                </div>
              </div>
              <div class="nav-dropdown-item">
                <div class="nav-dropdown-items">
                  <a>
                    <h3> 汽车零部件解决方案</h3>
                    <p>构建协同中心、价格中心，强化上下游联动</p>
                    <img src="https://www.going-link.com/image/202309/20230914160114_5258653.jpg" alt="" />
                    <img src="https://www.going-link.com/image/202309/20230914160117_2755481.jpg" alt="" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DocumentTitle>
  );
}