import { Test, TestingModule } from '@nestjs/testing';
import { AwsService } from './aws.service';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => {
      return {
        send: jest.fn().mockResolvedValue({}),
      };
    }),
    PutObjectCommand: jest.fn().mockImplementation((args) => args),
  };
});

describe('AwsService', () => {
  let service: AwsService;
  let configService: ConfigService;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string, fallback?: any) => {
        if (key === 'AWS_ACCESS_KEY_ID') return 'mock-key';
        if (key === 'AWS_SECRET_ACCESS_KEY') return 'mock-secret';
        if (key === 'AWS_REGION') return 'us-east-1';
        if (key === 'AWS_S3_BUCKET') return 'mock-bucket';
        return fallback;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AwsService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AwsService>(AwsService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should upload a file and return the S3 URL', async () => {
    const buffer = Buffer.from('test file contents');
    const folder = 'receipts';
    const filename = 'receipt.pdf';
    const mimeType = 'application/pdf';

    const url = await service.uploadFile(buffer, folder, filename, mimeType);
    expect(url).toBe('https://mock-bucket.s3.us-east-1.amazonaws.com/receipts/' + url.split('/receipts/')[1]);
  });
});
