import React, { PureComponent, Fragment } from 'react';
import { Icon, Affix, Anchor } from 'hzero-ui';
import intl from 'utils/intl';
import styles from './index.less';

const prefix = `sqam.common.view.message.title`;

export default class RectificationAnchor extends PureComponent {
  state = {
    isShow: true,
  };

  render() {
    const { isShow } = this.state;
    const {
      modelName,
      onGetAffixContainer,
      isEffectTrackShow = true,
      problemStatus,
      newFields = {},
    } = this.props;

    return (
      <Fragment>
        <div
          className={styles['rectification-anchor']}
          style={{ right: isShow ? '150px' : '2px' }}
          onClick={() => this.setState({ isShow: !isShow })}
        >
          <Icon
            className="rectification-anchor-icon"
            type={isShow ? 'caret-right' : 'caret-left'}
          />
        </div>
        <div className={styles['rectification-anchor-container']}>
          {isShow && (
            <div className="rectification-anchor-wrapper">
              <Affix target={onGetAffixContainer}>
                <Anchor getContainer={onGetAffixContainer} offsetTop={24}>
                  {modelName === 'audit8dnotPub' && (
                    <Anchor.Link
                      href={`#sqam-${modelName}-panel-auditStage`}
                      title={
                        newFields[`#sqam-${modelName}-panel-auditStage`]
                          ? newFields[`#sqam-${modelName}-panel-auditStage`]
                          : intl.get(`${prefix}.panel.auditStage`).d('审核阶段')
                      }
                    />
                  )}
                  {modelName === 'feedback8D' && problemStatus !== 'PUBLISHED' && (
                    <Anchor.Link
                      href={`#sqam-${modelName}-panel-reviewInfo`}
                      title={
                        newFields[`#sqam-${modelName}-panel-reviewInfo`]
                          ? newFields[`#sqam-${modelName}-panel-reviewInfo`]
                          : intl.get(`${prefix}.panel.auditStage`).d('审核阶段')
                      }
                    />
                  )}
                  <Anchor.Link
                    href={`#sqam-${modelName}-panel-basic`}
                    title={
                      newFields[`#sqam-${modelName}-panel-basic`] ||
                      intl.get(`${prefix}.panel.basic`).d('基本信息')
                    }
                  />
                  <Anchor.Link
                    href={`#sqam-${modelName}-panel-question`}
                    title={
                      newFields[`#sqam-${modelName}-panel-question`]
                        ? newFields[`#sqam-${modelName}-panel-question`]
                        : intl.get(`${prefix}.panel.question`).d('问题描述')
                    }
                  />
                  <Anchor.Link
                    href={`#sqam-${modelName}-panel-groupMember`}
                    title={
                      newFields[`#sqam-${modelName}-panel-groupMember`]
                        ? newFields[`#sqam-${modelName}-panel-groupMember`]
                        : intl.get(`${prefix}.panel.groupMember`).d('小组成员')
                    }
                  />
                  <Anchor.Link
                    href={`#sqam-${modelName}-panel-promiseMaintainProvide`}
                    title={
                      newFields[`#sqam-${modelName}-panel-promiseMaintainProvide`]
                        ? newFields[`#sqam-${modelName}-panel-promiseMaintainProvide`]
                        : intl.get(`${prefix}.panel.temporaryDogged`).d('临时围堵措施')
                    }
                  />
                  <Anchor.Link
                    href={`#sqam-${modelName}-panel-shortMeature`}
                    title={
                      newFields[`#sqam-${modelName}-panel-shortMeature`] ||
                      intl.get(`${prefix}.panel.shortMeature`).d('短期措施')
                    }
                  />
                  <Anchor.Link
                    href={`#sqam-${modelName}-panel-analyzeReason`}
                    title={
                      newFields[`#sqam-${modelName}-panel-analyzeReason`] ||
                      intl.get(`${prefix}.panel.analyzeReason`).d('根本原因分析')
                    }
                  />
                  <Anchor.Link
                    href={`#sqam-${modelName}-panel-foreverDealSolution`}
                    title={
                      newFields[`#sqam-${modelName}-panel-foreverDealSolution`] ||
                      intl.get(`${prefix}.panel.foreverDealSolution`).d('永久纠正措施')
                    }
                  />
                  <Anchor.Link
                    href={`#sqam-${modelName}-panel-applyItem`}
                    title={
                      newFields[`#sqam-${modelName}-panel-applyItem`] ||
                      intl.get(`${prefix}.panel.applyItem`).d('是否适用以下项目')
                    }
                  />
                  <Anchor.Link
                    href={`#sqam-${modelName}-panel-standard`}
                    title={
                      newFields[`#sqam-${modelName}-panel-standard`] ||
                      intl.get(`${prefix}.panel.standard`).d('相关标准化')
                    }
                  />
                  <Anchor.Link
                    href={`#sqam-${modelName}-panel-congratulation`}
                    title={
                      newFields[`#sqam-${modelName}-panel-congratulation`] ||
                      intl.get(`${prefix}.panel.congratulation`).d('小组祝贺')
                    }
                  />
                  {isEffectTrackShow && (
                    <Anchor.Link
                      href={`#sqam-${modelName}-panel-effectTrack`}
                      title={
                        newFields[`#sqam-${modelName}-panel-effectTrack`] ||
                        intl.get(`${prefix}.panel.effectTrack`).d('成效追踪')
                      }
                    />
                  )}
                </Anchor>
              </Affix>
            </div>
          )}
        </div>
      </Fragment>
    );
  }
}
