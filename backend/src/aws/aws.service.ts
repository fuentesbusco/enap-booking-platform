import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class AwsService {
  private readonly logger = new Logger(AwsService.name);
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET', 'enap-booking-bucket');

    const hasRealCredentials = accessKeyId && secretAccessKey && 
                               accessKeyId.trim() !== '' && secretAccessKey.trim() !== '' &&
                               !accessKeyId.includes('YOUR_') && !secretAccessKey.includes('YOUR_') &&
                               !accessKeyId.includes('mock_') && !secretAccessKey.includes('mock_');

    this.s3Client = new S3Client({
      region,
      credentials: hasRealCredentials ? {
        accessKeyId,
        secretAccessKey,
      } : undefined,
    });
  }

  getS3Client(): S3Client {
    return this.s3Client;
  }

  getBucketName(): string {
    return this.bucketName;
  }

  /**
   * Sube un archivo a S3 y retorna la URL pública del objeto.
   */
  async uploadFile(fileBuffer: Buffer, folder: string, filename: string, mimeType: string): Promise<string> {
    const key = `${folder}/${Date.now()}-${filename}`;
    const accessKey = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    
    // Si se define AWS_S3_MOCK en 'false', se obliga al comportamiento real (útil para roles IAM en Lambda)
    const mockEnvVal = this.configService.get<string>('AWS_S3_MOCK');
    let isMock = true;
    
    if (mockEnvVal === 'false') {
      isMock = false;
    } else if (mockEnvVal === 'true') {
      isMock = true;
    } else {
      isMock = !accessKey || !secretKey || accessKey.trim() === '' || secretKey.trim() === '' || 
               accessKey.includes('YOUR_') || secretKey.includes('YOUR_') ||
               accessKey.includes('mock_') || secretKey.includes('mock_');
    }

    if (isMock) {
      const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
      const url = `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
      this.logger.warn(`AWS S3 mock enabled. Bypassing upload and returning mock URL: ${url}`);
      return url;
    }

    this.logger.log(`Subiendo archivo a S3: ${key} (MIME: ${mimeType})...`);

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: fileBuffer,
          ContentType: mimeType,
        }),
      );
      const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
      const url = `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
      this.logger.log(`Archivo subido exitosamente: ${url}`);
      return url;
    } catch (error) {
      this.logger.error(`Error al subir archivo a S3 (${key}):`, error);
      throw error;
    }
  }
}
