import type { FunctionComponent, ReactElement, ReactNode} from 'react';
import React, { Children, cloneElement, isValidElement, useContext, useMemo, useRef } from 'react';
import type { ObservableMap } from 'mobx';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react-lite';
// @ts-ignore
import { Trigger, Button } from 'choerodon-ui/pro';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { Action } from 'choerodon-ui/pro/lib/trigger/enum';
import type { ButtonProps } from 'choerodon-ui/pro/lib/button/Button';
import { $l } from 'choerodon-ui/pro/lib/locale-context';
import isFragment from 'choerodon-ui/pro/lib/_util/isFragment';
import { iteratorReduce } from 'choerodon-ui/pro/lib/_util/iteratorUtils';
import type { UrlAttachmentProps } from './UrlAttachment';
import type UrlAttachment from './UrlAttachment';
import { BUILT_IN_PLACEMENTS, showValidationMessage } from './utils';

export interface AttachmentGroupProps extends ButtonProps {
  viewMode: 'list' | 'popup';
  label?: ReactNode;
  colSpan?: number;
  rowSpan?: number;
  text?: ReactNode;
  count?: number;
}

type GetRef = (attachment: UrlAttachment | null, index: number) => void;

function getRefCallback(callback, index) {
  return item => callback(item, index);
}

function normalizeAttachments(children: ReactNode, getRef?: GetRef, index = { count: 0 }): ReactNode {
  return Children.map(children, (child) => {
    if (isFragment(child)) {
      return normalizeAttachments(child.props.children, getRef, index);
    }
    if (isValidElement<UrlAttachmentProps>(child) && (child.type as any).__PRO_ATTACHMENT) {
      const props: UrlAttachmentProps & { ref?: GetRef } = { viewMode: 'list', readOnly: true, __inGroup: true };
      if (getRef) {
        const { count } = index;
        props.ref = getRefCallback(getRef, count);
        index.count = count + 1;
      }
      return cloneElement<UrlAttachmentProps>(child, props);
    }
    return undefined;
  });
}

const AttachmentGroup: FunctionComponent<AttachmentGroupProps> = function AttachmentGroup(props) {
  const { viewMode, children, hidden, text, count, ...buttonProps } = props;
  const hasCount = count !== undefined;
  const { getProPrefixCls, getConfig } = useContext(ConfigContext);
  const listRef = useRef<ObservableMap<number, UrlAttachment>>(observable.map());
  const prefixCls = getProPrefixCls('attachment');
  const computedCount = hasCount ? count : iteratorReduce<UrlAttachment, number>(listRef.current.values(), (sum, attachment) => sum + (attachment.count || 0), 0);
  const attachments = useMemo((): ReactElement | undefined => children ? (
    <div className={`${prefixCls}-group`}>
      {
        normalizeAttachments(children, hasCount ? undefined : action((attachment, index) => {
          if (attachment) {
            listRef.current.set(index, attachment);
          } else {
            listRef.current.delete(index);
          }
        }))
      }
    </div>
  ) : undefined, [children, hasCount, viewMode, prefixCls]);
  const renderEmpty = (): ReactElement | undefined => {
    if (computedCount === 0) {
      return (
        <div className={`${prefixCls}-empty`}>
          {getConfig('renderEmpty')('UrlAttachment')}
        </div>
      );
    }
  };
  const content: ReactElement = (
    <>
      {renderEmpty()}
      {attachments}
    </>
  );
  const renderGroup = (): ReactElement | null => {
    if (hidden) {
      return null;
    }
    if (viewMode === 'list') {
      return content;
    }
    return (
      <Trigger
        prefixCls={prefixCls}
        popupContent={content}
        action={[Action.hover, Action.focus]}
        builtinPlacements={BUILT_IN_PLACEMENTS}
        popupPlacement="bottomLeft"
        forceRender={!hasCount}
      >
        <Button
          icon="attach_file"
          funcType={FuncType.link}
          color={ButtonColor.primary}
          {...buttonProps}
        >
          {text || $l('Attachment', 'view_attachment')} {computedCount || undefined}
        </Button>
      </Trigger>
    );
  };

  return renderGroup();
};

AttachmentGroup.defaultProps = {
  viewMode: 'popup',
};

AttachmentGroup.displayName = 'AttachmentGroup';

export default observer(AttachmentGroup);
