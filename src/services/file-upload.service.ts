interface FileUploadResponse {
  success: boolean;
  urls?: string[];
  message?: string;
  error?: string;
}

class FileUploadService {
  private baseUrl = 'http://localhost:8200';

  private getAuthHeaders(): HeadersInit {
    let token = null;
    
    if (typeof window !== 'undefined') {
      // Redux Persist saves the state under 'persist:root'
      const persistRoot = localStorage.getItem('persist:root');
      if (persistRoot) {
        try {
          const root = JSON.parse(persistRoot);
          if (root.auth) {
            // The auth slice itself is a stringified JSON in the persisting object
            const auth = JSON.parse(root.auth);
            token = auth.token;
          }
        } catch (e) {
          // Silently fail if there's a parsing error
          console.error('Error parsing token from storage:', e);
        }
      }
    }
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  async uploadHotelImages(files: File[]): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${this.baseUrl}/api/upload/hotel-images`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const data: FileUploadResponse = await response.json();
      
      if (!data.success || !data.urls) {
        throw new Error(data.error || 'Upload failed');
      }

      return data.urls;
    } catch (error) {
      console.error('Hotel image upload error:', error);
      throw error;
    }
  }

  async uploadRoomImages(files: File[]): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${this.baseUrl}/api/upload/room-images`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const data: FileUploadResponse = await response.json();
      
      if (!data.success || !data.urls) {
        throw new Error(data.error || 'Upload failed');
      }

      return data.urls;
    } catch (error) {
      console.error('Room image upload error:', error);
      throw error;
    }
  }

  async uploadRoomTypeImages(files: File[]): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${this.baseUrl}/api/upload/room-type-images`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const data: FileUploadResponse = await response.json();
      
      if (!data.success || !data.urls) {
        throw new Error(data.error || 'Upload failed');
      }

      return data.urls;
    } catch (error) {
      console.error('Room type image upload error:', error);
      throw error;
    }
  }

  async uploadGeneralFiles(files: File[], folder?: string): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    if (folder) {
      formData.append('folder', folder);
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/upload/general`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const data: FileUploadResponse = await response.json();
      
      if (!data.success || !data.urls) {
        throw new Error(data.error || 'Upload failed');
      }

      return data.urls;
    } catch (error) {
      console.error('General file upload error:', error);
      throw error;
    }
  }
}

export const fileUploadService = new FileUploadService();
export default fileUploadService;
