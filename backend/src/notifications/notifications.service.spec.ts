import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mockSendMail: jest.Mock;

  beforeEach(async () => {
    mockSendMail = jest.fn().mockResolvedValue({ messageId: '123' });
    const mockCreateTransport = {
      sendMail: mockSendMail,
    };
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockCreateTransport);

    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        if (key === 'SMTP_HOST') return 'smtp.example.com';
        if (key === 'SMTP_PORT') return 587;
        if (key === 'SMTP_USER') return 'user';
        if (key === 'SMTP_PASS') return 'pass';
        if (key === 'SMTP_FROM') return 'no-reply@example.com';
        return defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: { user: 'user', pass: 'pass' },
    });
  });

  describe('sendEmail', () => {
    it('should successfully send an email', async () => {
      const result = await service.sendEmail('to@example.com', 'Test Subject', '<p>Hello</p>');
      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'no-reply@example.com',
        to: 'to@example.com',
        subject: 'Test Subject',
        html: '<p>Hello</p>',
      });
    });

    it('should return false if sendMail fails', async () => {
      mockSendMail.mockRejectedValue(new Error('Connection timeout'));
      const result = await service.sendEmail('to@example.com', 'Test Subject', '<p>Hello</p>');
      expect(result).toBe(false);
    });
  });
});
