import React, { AnchorHTMLAttributes, FunctionComponent, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import { AttachmentValue, AttachmentTplInfo } from 'choerodon-ui/dataset/configure';
import isFunction from 'lodash/isFunction';
import isPromise from 'is-promise';
import { ButtonColor } from '../button/enum';
import { $l } from '../locale-context';
import { ButtonProps } from '../button/interface';

export interface AttachmentRemarkProps extends Omit<ButtonProps, "help"> {
  help?: ReactNode;
  readOnly?: boolean;
  tplProps?: AttachmentValue;
}

const AttachmentRemark: FunctionComponent<AttachmentRemarkProps> = function TempalteDownload(props) {
  const { tplProps, target, color = ButtonColor.primary, help, readOnly, prefixCls } = props;
  const { attachmentUUID, bucketName, bucketDirectory, storageCode, isPublic } = tplProps || {};

  const classes = [`${prefixCls}-remark-wrapper`];
  const { getConfig } = useContext(ConfigContext);
  const { getTemplateDownloadUrl } = getConfig('attachment');
  const downloadUrls: AttachmentTplInfo[] | Promise<AttachmentTplInfo[]> = useMemo(() => attachmentUUID && getTemplateDownloadUrl && getTemplateDownloadUrl({
    attachmentUUID,
    bucketName,
    bucketDirectory,
    storageCode,
    isPublic,
  } as any) || [], [
    getTemplateDownloadUrl, attachmentUUID, bucketName, bucketDirectory, storageCode, isPublic,
  ]);
  const [tplDownloadUrls, setTplDownloadUrls] = useState<AttachmentTplInfo[]>([]);

  useEffect(() => {
    if (isPromise(downloadUrls)) {
      downloadUrls.then(url => setTplDownloadUrls(url));
    } else {
      setTplDownloadUrls(downloadUrls);
    }
  }, [downloadUrls]);

  const downloadProps = {
    target,
    color,
  };
  if (!help && (readOnly || !tplDownloadUrls.length)) return null;
  return (
    <div className={classes.join(' ')}>
      <header className={`${prefixCls}-header`}>
        <span className={`${prefixCls}-header-label`}>{$l('Attachment', 'attachment_remark')}</span>
      </header>
      <section className={`${prefixCls}-help`}>{help}</section>
      {!readOnly && !!tplDownloadUrls.length && renderTplList({
        prefixCls, listInfo: tplDownloadUrls, downloadProps,
      })}
    </div>
  );
};

function renderTplList(opts: {
  prefixCls?: string, tplLoading?: boolean, listInfo: AttachmentTplInfo[],
  downloadProps: { target?: string, color: ButtonColor }
}) {
  const { prefixCls, listInfo, downloadProps } = opts;
  return (
    <section className={`${prefixCls}-tpl-list`}>
      {$l('Attachment', 'attachment_ref_tpl')}:&nbsp;
      {listInfo.map(item => {
        // eslint-disable-next-line no-script-url
        const clickProps: AnchorHTMLAttributes<HTMLAnchorElement> = { href: "javascript:void(0);" };
        if (isFunction(item.download)) {
          clickProps.onClick = item.download;
          clickProps.target = "_self";
        } else if (typeof item.download === "string") {
          clickProps.target = "_blank";
          clickProps.download = true;
          clickProps.href = item.download;
        } else return null;
        return (
          <a {...downloadProps} {...clickProps} key={item.key} className={`${prefixCls}-tpl-list-item`}>{item.fileName || "no-file-name"}</a>
        );
      })}
    </section>
  );
}

AttachmentRemark.displayName = 'AttachmentRemark';

export default AttachmentRemark;
