export interface IStorageRepository {
  uploadFile(file: File): Promise<string>;
  downloadFile(name: string): Promise<File>;
}

