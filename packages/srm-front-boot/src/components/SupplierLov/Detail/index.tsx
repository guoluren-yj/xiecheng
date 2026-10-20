/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import classnames from 'classnames';
import type { Record } from 'choerodon-ui/dataset';
import DataSet from 'choerodon-ui/dataset';

import intl from '@/utils/intl';
import {
  MORE_TABS,
  stylePrefix,
  supplierCategoryDSConfig,
  supplierAvailableDSConfig,
  contactDSConfig,
  attachmentDSConfig,
  bankInfoDSConfig,
  performanceEvaluationDSConfig,
} from '../store';
import SupplierAvailable from './SupplierAvailable';
import SupplierCategory from './SupplierCategory';
import Contact from './Contact';
import Attachment from './Attachment';
import BankInfo from './BankInfo';
import PerformanceEvaluation from './PerformanceEvaluation';
import QualificationDocuments from './QualificationDocuments';

const CARD_PADDING = 16;
const CARD_TITLE_HEIGHT = 14;

const DetailModal = ({ supplierRecord, remote }: { supplierRecord: Record, remote: any }) => {
  const contentRef: any = useRef();
  const supplierAvailableRef: any = useRef();
  const supplierCategoryRef: any = useRef();
  const contactNameRef: any = useRef();
  const qualificationDocumentsRef: any = useRef();
  const bankInfoRef: any = useRef();
  const performanceEvaluationRef: any = useRef();
  const [activeTabKey, setActiveTabKey] = useState(MORE_TABS.SUPPLIER_AVAILABLE);
  const [activeBasicAttachment, setActiveBasicAttachment] = useState(true);

  // 供货能力
  const supplierAvailableDs = useMemo(
    () => new DataSet(supplierAvailableDSConfig({ supplierRecord })),
    []
  );
  // 供应商分类
  const supplierCategoryDs = useMemo(
    () => new DataSet(supplierCategoryDSConfig({ supplierRecord })),
    []
  );
  // 联系人
  const contactDs = useMemo(() => new DataSet(contactDSConfig({ supplierRecord })), []);
  // 附件
  const attachmentDs = useMemo(() => new DataSet(attachmentDSConfig({ supplierRecord })), []);
  // 银行信息
  const bankInfoDs = useMemo(() => new DataSet(bankInfoDSConfig({ supplierRecord })), []);
  // 绩效考核
  const performanceEvaluationDs = useMemo(
    () => new DataSet(performanceEvaluationDSConfig({ supplierRecord })),
    []
  );

  useEffect(() => {
    supplierAvailableDs.query();
    supplierCategoryDs.query();
    contactDs.query();
    attachmentDs.query();
    bankInfoDs.query();
    performanceEvaluationDs.query();
  }, []);

  const handleChangeTab = useCallback(tabKey => {
    // 下面触发scroll事件，scroll事件内也会更新tabKey，故此处增加延时强制设置tabkey
    setTimeout(() => setActiveTabKey(tabKey));
    const { scrollHeight, offsetHeight } = contentRef.current;
    if (scrollHeight === offsetHeight) {
      return;
    }
    const supplierCategoryAnchor = supplierCategoryRef.current?.offsetTop || 0;
    const contactNameAnchor = contactNameRef.current?.offsetTop || 0;
    const qualificationDocumentsAnchor = qualificationDocumentsRef.current?.offsetTop || 0;
    const bankInfoAnchor = bankInfoRef.current?.offsetTop || 0;
    const performanceEvaluationAnchor = performanceEvaluationRef.current?.offsetTop || 0;
    switch (tabKey) {
      case MORE_TABS.SUPPLIER_AVAILABLE:
        contentRef.current.scrollTop = 0;
        break;
      case MORE_TABS.SUPPLIER_CATEGORY:
        contentRef.current.scrollTop = Math.max(supplierCategoryAnchor - CARD_PADDING, 0);
        break;
      case MORE_TABS.CONTACT_PERSON:
        contentRef.current.scrollTop = Math.max(contactNameAnchor - CARD_PADDING, 0);
        break;
      case MORE_TABS.QUALIFICATION_DOCUMENTS:
        contentRef.current.scrollTop = Math.max(qualificationDocumentsAnchor - CARD_PADDING, 0);
        break;
      case MORE_TABS.BANK_INFO:
        contentRef.current.scrollTop = Math.max(bankInfoAnchor - CARD_PADDING, 0);
        break;
      case MORE_TABS.PERFORMANCE_EVALUATION:
        contentRef.current.scrollTop = Math.max(performanceEvaluationAnchor - CARD_PADDING, 0);
        break;
      default:
        break;
    }
  }, []);

  const handleScroll = useCallback(
    event => {
      const element: HTMLElement = event.target;
      const { scrollTop } = element;
      // 供货能力清单
      const supplierAvailableAnchor = supplierAvailableRef.current?.offsetTop || 0;
      const supplierCategoryAnchor = supplierCategoryRef.current?.offsetTop || 0;
      const contactNameAnchor = contactNameRef.current?.offsetTop || 0;
      const qualificationDocumentsAnchor = qualificationDocumentsRef.current?.offsetTop || 0;
      const bankInfoAnchor = bankInfoRef.current?.offsetTop || 0;
      if (scrollTop < supplierAvailableAnchor + CARD_TITLE_HEIGHT) {
        setActiveTabKey(MORE_TABS.SUPPLIER_AVAILABLE);
      } else if (scrollTop < supplierCategoryAnchor + CARD_TITLE_HEIGHT) {
        setActiveTabKey(MORE_TABS.SUPPLIER_CATEGORY);
      } else if (scrollTop < contactNameAnchor + CARD_TITLE_HEIGHT) {
        setActiveTabKey(MORE_TABS.CONTACT_PERSON);
      } else if (scrollTop < qualificationDocumentsAnchor + CARD_TITLE_HEIGHT) {
        setActiveTabKey(MORE_TABS.QUALIFICATION_DOCUMENTS);
      } else if (scrollTop < bankInfoAnchor + CARD_TITLE_HEIGHT) {
        setActiveTabKey(MORE_TABS.BANK_INFO);
      } else {
        setActiveTabKey(MORE_TABS.PERFORMANCE_EVALUATION);
      }
    },
    [activeTabKey]
  );

  // 卡片按钮切换
  const handleCardBtnChange = useCallback((btnType = '') => {
    setActiveBasicAttachment(btnType === 'attachment');
  }, []);

  return (
    <div className={`${stylePrefix}-detail-content`}>
      <div className={`${stylePrefix}-detail-content-left`}>
        <div
          key={MORE_TABS.SUPPLIER_AVAILABLE}
          className={classnames(`${stylePrefix}-detail-content-left-item`, {
            [`${stylePrefix}-detail-content-left-item-active`]:
              activeTabKey === MORE_TABS.SUPPLIER_AVAILABLE,
          })}
          onClick={() => handleChangeTab(MORE_TABS.SUPPLIER_AVAILABLE)}
        >
          {intl.get('srm.common.supplier.model.supplierAvailable').d('供货能力清单')}
        </div>
        <div
          key={MORE_TABS.SUPPLIER_CATEGORY}
          className={classnames(`${stylePrefix}-detail-content-left-item`, {
            [`${stylePrefix}-detail-content-left-item-active`]:
              activeTabKey === MORE_TABS.SUPPLIER_CATEGORY,
          })}
          onClick={() => handleChangeTab(MORE_TABS.SUPPLIER_CATEGORY)}
        >
          {intl.get('srm.common.supplier.model.supplierCategory').d('供应商分类')}
        </div>
        <div
          key={MORE_TABS.CONTACT_PERSON}
          className={classnames(`${stylePrefix}-detail-content-left-item`, {
            [`${stylePrefix}-detail-content-left-item-active`]:
              activeTabKey === MORE_TABS.CONTACT_PERSON,
          })}
          onClick={() => handleChangeTab(MORE_TABS.CONTACT_PERSON)}
        >
          {intl.get('srm.common.supplier.model.contactName').d('联系人')}
        </div>
        <div
          key={MORE_TABS.QUALIFICATION_DOCUMENTS}
          className={classnames(`${stylePrefix}-detail-content-left-item`, {
            [`${stylePrefix}-detail-content-left-item-active`]:
              activeTabKey === MORE_TABS.QUALIFICATION_DOCUMENTS,
          })}
          onClick={() => handleChangeTab(MORE_TABS.QUALIFICATION_DOCUMENTS)}
        >
          {intl.get('srm.common.supplier.model.attachmentInform').d('附件信息')}
        </div>
        <div
          key={MORE_TABS.BANK_INFO}
          className={classnames(`${stylePrefix}-detail-content-left-item`, {
            [`${stylePrefix}-detail-content-left-item-active`]:
              activeTabKey === MORE_TABS.BANK_INFO,
          })}
          onClick={() => handleChangeTab(MORE_TABS.BANK_INFO)}
        >
          {intl.get('srm.common.supplier.model.backInfo').d('银行信息')}
        </div>
        <div
          key={MORE_TABS.PERFORMANCE_EVALUATION}
          className={classnames(`${stylePrefix}-detail-content-left-item`, {
            [`${stylePrefix}-detail-content-left-item-active`]:
              activeTabKey === MORE_TABS.PERFORMANCE_EVALUATION,
          })}
          onClick={() => handleChangeTab(MORE_TABS.PERFORMANCE_EVALUATION)}
        >
          {intl.get('srm.common.supplier.model.performanceEvaluation').d('绩效考核信息')}
        </div>
      </div>
      <div
        ref={contentRef}
        className={`${stylePrefix}-detail-content-right`}
        onScroll={handleScroll}
      >
        <div id="supplierAvailable" className={`${stylePrefix}-card`} ref={supplierAvailableRef}>
          <div className={`${stylePrefix}-card-title`}>
            {intl.get('srm.common.supplier.model.supplierAvailable').d('供货能力清单')}
          </div>
          <div className={`${stylePrefix}-card-content`}>
            <SupplierAvailable dataSet={supplierAvailableDs} remote={remote}/>
          </div>
        </div>
        <div id="supplierCategory" className={`${stylePrefix}-card`} ref={supplierCategoryRef}>
          <div className={`${stylePrefix}-card-title`}>
            {intl.get('srm.common.supplier.model.supplierCategory').d('供应商分类')}
          </div>
          <div className={`${stylePrefix}-card-content`}>
            <SupplierCategory dataSet={supplierCategoryDs} />
          </div>
        </div>
        <div id="contactName" className={`${stylePrefix}-card`} ref={contactNameRef}>
          <div className={`${stylePrefix}-card-title`}>
            {intl.get('srm.common.supplier.model.contactName').d('联系人')}
          </div>
          <div className={`${stylePrefix}-card-content`}>
            <Contact dataSet={contactDs} />
          </div>
        </div>
        <div
          id="qualificationDocuments"
          className={classnames(`${stylePrefix}-card`, `${stylePrefix}-card-extra`)}
          ref={qualificationDocumentsRef}
        >
          <div className={`${stylePrefix}-card-header`}>
            <div className={`${stylePrefix}-card-header-button`}>
              <div
                className={activeBasicAttachment ? `${stylePrefix}-card-header-button-active` : ''}
                onClick={() => handleCardBtnChange('attachment')}
              >
                <span>
                  {intl.get('srm.common.supplier.model.attachmentInform').d('附件信息')}
                </span>
              </div>
              <div
                className={!activeBasicAttachment ? `${stylePrefix}-card-header-button-active` : ''}
                onClick={() => handleCardBtnChange('qualification')}
              >
                <span>
                  {intl.get('srm.common.supplier.model.qualificationDocuments').d('调查表资质附件')}
                </span>
              </div>
            </div>
          </div>
          <div className={`${stylePrefix}-card-title`}>
            {activeBasicAttachment
              ? intl.get('srm.common.supplier.model.attachmentInform').d('附件信息')
              : intl.get('srm.common.supplier.model.qualificationDocuments').d('调查表资质附件')
            }
          </div>
        </div>
        {/* 拆开是为了防止切换按钮时计算滚动高度不准确问题 */}
        <div className={classnames(`${stylePrefix}-card-content`, `${stylePrefix}-card-content-extra`)}>
          <div
            style={{ display: activeBasicAttachment ? 'block' : 'none' }}
          >
            <Attachment dataSet={attachmentDs} />
          </div>
          <div
            style={{ display: !activeBasicAttachment ? 'block' : 'none' }}
          >
            <QualificationDocuments supplierRecord={supplierRecord} />
          </div>
        </div>
        <div id="bankInfo" className={`${stylePrefix}-card`} ref={bankInfoRef}>
          <div className={`${stylePrefix}-card-title`}>
            {intl.get('srm.common.supplier.model.backInfo').d('银行信息')}
          </div>
          <div className={`${stylePrefix}-card-content`}>
            <BankInfo dataSet={bankInfoDs} />
          </div>
        </div>
        <div
          id="performanceEvaluation"
          className={`${stylePrefix}-card`}
          ref={performanceEvaluationRef}
        >
          <div className={`${stylePrefix}-card-title`}>
            {intl.get('srm.common.supplier.model.performanceEvaluation').d('绩效考核信息')}
          </div>
          <div className={`${stylePrefix}-card-content`}>
            <PerformanceEvaluation dataSet={performanceEvaluationDs} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
