"use client";

import { useEffect, useRef, useState } from "react";
import { useUploadFiles } from "better-upload/client";

type Props = {
  route: string;
  api: string;
};

export const useMultiFileUpload = ({ route, api }: Props) => {
  const uploadRef = useRef<string[]>([]);

  const { upload, uploadedFiles, isSuccess, isError, isPending } =
    useUploadFiles({
      route,
      api,
    });

  useEffect(() => {
    if (uploadedFiles && uploadedFiles.length > 0) {
      const urls = uploadedFiles.map((file) => file.objectKey);
      uploadRef.current = urls;
    }
  }, [uploadedFiles]);

  const uploadFiles = async (files: FileList | File[]) => {
    await upload(files);

    // Wait for uploadedFiles to be available
    const response = await new Promise<string[]>((resolve) => {
      const checkUpload = setInterval(() => {
        if (uploadRef.current) {
          clearInterval(checkUpload);
          resolve(uploadRef.current);
        }
      }, 100);
    });

    if (isError) {
      throw new Error("Upload failed");
    }

    return response;
  };

  return {
    uploadFiles,
    uploadedFiles,
    isUploading: isPending,
    uploadError: isError,
    uploadSuccess: isSuccess,
  };
};
