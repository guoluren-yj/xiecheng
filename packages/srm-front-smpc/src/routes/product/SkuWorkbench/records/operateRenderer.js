import React from 'react';
import intl from 'utils/intl';

import OverflowTip from '@/components/OverflowTip';
import './styles.less';

const getActionProps = (actionCode, operationResult) => {
  const shelfFail = operationResult === 'SHELF_FAILED';
  const _propsMap = {
    NEW: { icon: 'add' },
    PUBLISH: { icon: 'check' },
    FEEDBACK_CONFIRM: { icon: 'check' },
    EC_WFL: { icon: 'check' },
    APPROVAL: {
      icon: 'authorize',
      defaultContent: intl.get('smpc.product.view.pass').d('通过'),
      contentLabel: intl.get('smpc.product.view.approvalIdea').d('审批意见'),
      colors: ['#47b883', '#F56349'],
      classNames: ['color-green'],
    },
    AUTO_SHELF: {
      icon: 'authorize',
      colors: ['#47b883', '#F56349'],
      classNames: ['color-green'],
    },
    // 工作流审批通过
    WFL_APPROVED: {
      icon: 'authorize',
      colors: ['#47b883', '#F56349'],
      classNames: ['color-green', 'pointer'],
    },
    WFL_REJECTED: {
      icon: 'authorize',
      colors: ['#f56649', '#F56349'],
      classNames: ['color-red', 'pointer'],
    },
    // 工作流撤回
    WFL_REVERTED: {
      icon: 'reply',
      colors: ['#e5e5e5', '#F56349'],
      classNames: ['pointer'],
    },
    // 工作流审批通过失效申请
    WFL_APPROVED_INVALID: {
      icon: 'authorize',
      colors: ['#47b883', '#F56349'],
      classNames: ['color-green', 'pointer'],
    },
    // 工作流审批拒绝失效申请
    WFL_REJECTED_INVALID: {
      icon: 'authorize',
      colors: ['#F56349', '#F56349'],
      classNames: ['color-red', 'pointer'],
    },
    APPROVAL_SHELF: {
      icon: 'authorize',
      defaultContent: intl.get('smpc.product.view.pass').d('通过'),
      contentLabel: intl.get('smpc.product.view.approvalIdea').d('审批意见'),
      colors: ['#47b883', '#F56349'],
      classNames: ['color-green'],
    },
    REJECT: {
      icon: 'authorize',
      contentLabel: intl.get('smpc.product.view.approvalIdea').d('审批意见'),
      colors: ['#f56649', '#F56349'],
      classNames: ['color-red'],
    },
    SHELF: {
      icon: 'publish-o',
      colors: ['#47b883', '#F56349'],
      classNames: [shelfFail ? 'color-red' : 'color-green'],
    },
    UNSHELF: { icon: 'get_app-o' },
    VALID: {
      icon: 'verified_user-o',
      colors: ['#e5e5e5', '#F56349'],
    },
    INVALID: {
      icon: 'cancel_presentation',
    },
    PRICE_VALID: {
      icon: 'verified_user-o',
      colors: ['#e5e5e5', '#F56349'],
    },
    PRICE_INVALID: {
      icon: operationResult === 'UNSHELF' ? 'get_app-o' : 'cancel_presentation',
      colors: ['#e5e5e5', '#F56349'],
    },
    RECOVERY: {
      icon: 'reply',
    },
    DISCARD: {
      icon: 'cancel',
    },
    // 电商变更了平台分类
    CATEGORY_CHANGE: {
      icon: 'mode_edit',
    },
    PUBLISH_OFF: {
      icon: 'check',
    },
  };
  const _props = _propsMap[actionCode] || {};
  if (operationResult === 'SHELF_FAILED') {
    const { colors = [] } = _props;
    colors[0] = '#F56349'; // 红色
  }
  return { icon: 'add', ..._props };
};

export default function operateRenderer({ record }, { rowRecord, isSup }, goBack) {
  const {
    realName,
    operationTime: time,
    operationCode = '',
    operationParam,
    operationCodeMeaning,
    // operationContent,
    operationResult,
    operationResultMeaning,
    operationContentMeaning,
    operationUser,
    operationUserType,
    operationParamMeaning,
  } = record.toData();
  const skuName = rowRecord.get('skuName');
  const { icon, colors = [], classNames = [] } = getActionProps(operationCode, operationResult);

  const isInvalidApply = ['APPROVAL_INVALID', 'REJECT_INVALID', 'LAUNCH_INVALID'].includes(
    operationCode
  );
  const shelfFail = operationResult === 'SHELF_FAILED';
  let _skuName = skuName;
  let _realName = !realName
    ? isSup
      ? intl.get('smpc.product.view.purchase').d('采购方')
      : intl.get('smpc.product.view.supplier').d('供应商')
    : realName;
  const isSystem = [0, 1].includes(operationUser) && ![1, 2].includes(operationUserType); // operationUserType 0、历史数据 1、系统 2、电商
  // 针对匿名用户
  if (isSystem) {
    _realName = intl.get('smpc.product.view.realName').d('系统');
  }
  if (isInvalidApply) {
    _skuName = intl.get('smpc.product.view.invalidApply').d('失效申请');
  }

  const isApprove =
    (operationCode.includes('APPROVAL') ||
      operationCode.includes('REJECT') ||
      operationCode === 'AUTO_SHELF') &&
    operationCode !== 'WFL_APPROVAL_SHELF'; // 工作流触发的审批通过并上架

  const isWorkFlow = operationCode.includes('WFL');
  const isReject = operationCode.includes('REJECT');
  const selfName = classNames.join(' ');

  const getAction = () => {
    if (isApprove) {
      return intl.get('sagm.common.view.approval').d('审批了');
    } else return operationCodeMeaning;
  };

  const renderECWFL = () => {
    return (
      <>
        <span className="sku-createby">{_realName}</span>
        <span className="operate-action">
          {intl
            .getHTML(`smpc.product.view.ecWflSubmit`, {
              value: _skuName,
            })
            .d(
              <>
                提交
                <span className="sku-text">
                  【<b>{_skuName}</b>】
                </span>
                至审批
              </>
            )}
        </span>
      </>
    );
  };

  const getHeader = () => {
    if (operationCode === 'CATEGORY_CHANGE') {
      return (
        <div className="sku-wrapper">
          {intl.get('smpc.product.view.ecChangeCategory').d('电商变更了平台分类')}
        </div>
      );
    }
    return isWorkFlow && !['WFL_REVERTED', 'WFL_APPROVAL_SHELF'].includes(operationCode) ? (
      <div className="sku-wrapper">
        {operationCode === 'EC_WFL' ? (
          renderECWFL()
        ) : (
          <span className={`${selfName}`} onClick={() => goBack && goBack()}>
            {operationCodeMeaning}
          </span>
        )}
      </div>
    ) : (
      <div className="sku-wrapper">
        <span className="sku-createby">{_realName}</span>
        <span className="operate-action">{getAction(operationCode)}</span>
        {operationCode !== 'PUBLISH_OFF' && (
          <span className="sku-text">
            【
            <span className="sku-name">
              <OverflowTip>{_skuName}</OverflowTip>
            </span>
            】
          </span>
        )}
        {/* 下架审批 */}
        {['WFL_BATCH_APPROVED', 'WFL_BATCH_REJECTED', 'WFL_BATCH_REVERTED', 'PUBLISH_OFF'].includes(
          operationCode
        ) && (
          <span className="sku-text">
            【
            <span className="sku-name">
              {intl.get('sagm.common.view.publishOff').d('下架审批')}
            </span>
            】
          </span>
        )}
        {isApprove && (
          <>
            <span className="operate-text-result-prefix">
              {intl.get('sagm.common.view.approveResultPrefix').d('，审批结果为：')}
            </span>
            <span className={`sku-name ${selfName}`}>【{operationCodeMeaning}】</span>
          </>
        )}
        {/* 上架 */}
        {operationCode === 'SHELF' && (
          <>
            <span className="operate-text-result-prefix">
              {intl.get('sagm.common.view.resultPrefix').d('，结果为：')}
            </span>
            <span className={`sku-name ${selfName}`}>
              {shelfFail
                ? `【${operationResultMeaning}】`
                : intl.get('sagm.common.view.shelfSuccess').d('上架成功')}
            </span>
          </>
        )}
      </div>
    );
  };
  const content = operationContentMeaning;
  const isFeedback = ['FEEDBACK', 'FEEDBACK_CONFIRM'].includes(operationCode);
  const validFlag = ['PRICE_VALID', 'PRICE_INVALID'].includes(operationCode);

  const color = colors[0] || '#e5e5e5';
  return {
    icon,
    time,
    color,
    header: (
      <div className="operate-action">
        {/* 商品反馈等操作 */}
        {operationParam ? (
          <div className="sku-wrapper">
            <span className="sku-createby">{_realName}</span>
            {!isFeedback && !validFlag && <span>【{operationParam}】</span>}
            <span className="operate-action">{getAction(operationCode)}</span>
            <span className="sku-text">
              【<span className="sku-name">{_skuName}</span>】
            </span>
            {validFlag && <span>{intl.get('smpc.product.view.ofPrice').d('的价格')}</span>}
            <span className="sku-operate-meaning">{operationParamMeaning}</span>
          </div>
        ) : !isInvalidApply ? (
          // 非失效操作
          getHeader()
        ) : (
          <div className="sku-wrapper">
            <span className="sku-createby">{_realName}</span>
            <span className="operate-action">
              {getAction(operationCode)}
              {/* {intl.get('smpc.product.view.le').d('了')} */}
            </span>
            <span className="sku-text">
              <span className="sku-name">{_skuName}</span>
            </span>
          </div>
        )}
      </div>
    ),
    content: !isWorkFlow ? (
      <div className="operate-content">
        <span
          hidden={['SHELF'].includes(operationCode) || !shelfFail}
          style={{ color: colors[1], fontWeight: 500, marginBottom: 8 }}
        >
          {operationResultMeaning}
        </span>
        <div hidden={!content} className={`operate-content-reason ${isReject ? selfName : ''}`}>
          <span>
            {' '}
            {isFeedback
              ? intl.get('smpc.product.model.remark').d('备注')
              : intl.get('smpc.product.view.reason').d('原因')}
            ：
          </span>
          <span>{content}</span>
        </div>
      </div>
    ) : (
      operationCode === 'WFL_REVERTED' && (
        <div className="operate-content">
          <div hidden={!content} className="operate-content-reason">
            <span>{content}</span>
          </div>
        </div>
      )
    ),
  };
}
