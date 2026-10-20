import type { AnchorHTMLAttributes, FunctionComponent, ReactNode} from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import type { AttachmentValue } from 'choerodon-ui/dataset/configure';
import isFunction from 'lodash/isFunction';
import isPromise from 'is-promise';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { $l as ui$l } from 'choerodon-ui/pro/lib/locale-context';
import type { ButtonProps } from 'choerodon-ui/pro/lib/button/interface';
import attachmentConfig from './attachmentConfig';

export type AttachmentTplInfo = { key?: string; fileName: string; download: string | Function; };

const $l: any = ui$l;

export interface AttachmentRemarkProps extends Omit<ButtonProps, "help"> {
  help?: ReactNode;
  readOnly?: boolean;
  tplProps?: AttachmentValue;
}

const AttachmentRemark: FunctionComponent<AttachmentRemarkProps> = function TempalteDownload(props) {
  const { tplProps, target, color = ButtonColor.primary, help, readOnly, prefixCls } = props;
  const { attachmentUUID, bucketName, bucketDirectory, storageCode, isPublic } = tplProps || {};

  const classes = [`${prefixCls}-remark-wrapper`];
  // eslint-disable-next-line prefer-destructuring
  const getTemplateDownloadUrl: ((props: AttachmentValue) => AttachmentTplInfo[] | Promise<AttachmentTplInfo[]>) | undefined = attachmentConfig.getTemplateDownloadUrl;
  const downloadUrls: AttachmentTplInfo[] | Promise<AttachmentTplInfo[]> = useMemo(() => attachmentUUID && getTemplateDownloadUrl ? getTemplateDownloadUrl({
    attachmentUUID,
    bucketName,
    bucketDirectory,
    storageCode,
    isPublic,
  } as any) : [], [
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
        const clickProps: AnchorHTMLAttributes<HTMLAnchorElement> = { href: "" };
        if (isFunction(item.download)) {
          clickProps.onClick = item.download;
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
