import Upload from './Upload';
import Dragger from './Dragger';
import type { UploadProps, UploadListProps, UploadChangeParam } from './interface';
import type { DraggerProps } from './Dragger';

export type { UploadProps, UploadListProps, UploadChangeParam, DraggerProps };

Upload.Dragger = Dragger;
export default Upload;
