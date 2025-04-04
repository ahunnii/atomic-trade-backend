"use client";

import { useUploadFile } from "better-upload/client";
import { useEffect, useRef } from "react";

type Props = {
  route: string;
  api: string;
};

export const useFileUpload = ({ route, api }: Props) => {
  const uploadRef = useRef<string | null>(null);

  const { upload, uploadedFile, isSuccess, isError, isPending } = useUploadFile(
    {
      route,
      api,
    },
  );

  useEffect(() => {
    if (uploadedFile?.objectKey) {
      uploadRef.current = uploadedFile.objectKey;
    }
  }, [uploadedFile]);

  const uploadFile = async (file: File): Promise<string | null> => {
    await upload(file);

    // Wait for uploadRef to be updated
    const response = await new Promise((resolve) => {
      const checkUpload = setInterval(() => {
        if (uploadRef.current) {
          clearInterval(checkUpload);
          resolve({
            fileUrl: `${uploadRef.current}`,
          });
        }
      }, 100);
    });

    if (isError) {
      throw new Error("Upload failed");
    }

    const data = response as { fileUrl: string };
    return data.fileUrl;
  };

  return {
    uploadFile,
    uploadedFile,
    isUploading: isPending,
    uploadError: isError,
    uploadSuccess: isSuccess,
  };
};
