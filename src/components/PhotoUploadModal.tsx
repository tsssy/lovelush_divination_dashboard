import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner';
import CONFIG from '../config.js';
import authApiService from '../api_services/auth.js';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (photoUrl: string) => void;
  subAccountId: string;
  userSession: any; // Pass the user session from parent
  isUploading?: boolean;
}

export function PhotoUploadModal({ isOpen, onClose, onUploadComplete, subAccountId, userSession, isUploading = false }: PhotoUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadData, setUploadData] = useState<{
    upload_url: string;
    public_url: string;
    filename: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setUploading(false);
    }
  }, [isOpen, previewUrl]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Get presigned URL when file is selected
      await getPresignedUrl(file);
    }
  };

  const getPresignedUrl = async (file: File) => {
    try {
      toast('Getting upload authorization...', { duration: 2000 });

      const response = await fetch(`${CONFIG.api.base_url}/api/v1/agents/upload/presigned-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userSession.access_token}`
        },
        body: JSON.stringify({
          subaccount_id: subAccountId,
          file_type: file.type,
          upload_type: 'photos'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }

      const data = await response.json();
      
      setUploadData({
        upload_url: data.upload_url,
        public_url: data.public_url,
        filename: data.file_key.split('/').pop() || 'uploaded_image.jpg'
      });

      toast.success('Upload authorized! Ready to upload.');
      
    } catch (error) {
      console.error('Error getting presigned URL:', error);
      toast.error('Failed to get upload authorization');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadData) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    
    try {
      // Step 1: Upload directly to Cloudflare using presigned URL
      toast('Uploading to Cloudflare...', { duration: 3000 });
      
      console.log('🔄 Uploading to Cloudflare:', {
        url: uploadData.upload_url,
        fileType: selectedFile.type,
        fileName: uploadData.filename,
        fileSize: selectedFile.size
      });
      
      const response = await fetch(uploadData.upload_url, {
        method: 'PUT',
        headers: {
          'Content-Type': selectedFile.type
        },
        body: selectedFile
      });

      console.log('📤 Cloudflare response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        throw new Error(`Cloudflare upload failed: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Upload to Cloudflare successful');

      // Success! Just return the URL to parent component
      onUploadComplete(uploadData.public_url);
      toast.success('Photo uploaded successfully! Don\'t forget to save your changes.');
      
      // Reset and close
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadData(null);
      onClose();
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading && !isUploading) {
      setSelectedFile(null);
      setPreviewUrl(null);
      onClose();
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  // Cleanup preview URL on component unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Photo</DialogTitle>
          <DialogDescription>
            Select an image file to upload. Maximum file size is 5MB.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="photo-upload">Choose Image File</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="photo-upload"
            />
            <Button 
              variant="outline" 
              onClick={handleChooseFile}
              disabled={uploading || isUploading}
              className="w-full"
            >
              {selectedFile ? 'Change File' : 'Choose File'}
            </Button>
          </div>

          {selectedFile && (
            <div className="space-y-2">
              <Label>Selected File</Label>
              <div className="text-sm text-muted-foreground">
                <p>Name: {selectedFile.name}</p>
                <p>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <p>Type: {selectedFile.type}</p>
              </div>
            </div>
          )}

          {uploadData && (
            <div className="space-y-2">
              <Label>Upload Information</Label>
              <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                <p>✅ Upload authorized</p>
                <p>Filename: {uploadData.filename}</p>
                <p>Ready to upload!</p>
              </div>
            </div>
          )}

          {previewUrl && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="flex justify-center">
                <div className="w-32 h-32 border rounded-lg overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={uploading || isUploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!selectedFile || !uploadData || uploading || isUploading}
            >
              {uploading || isUploading ? '⏳ Uploading...' : 
               !selectedFile ? 'Select Photo First' :
               !uploadData ? '⏳ Preparing...' : 
               'Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}