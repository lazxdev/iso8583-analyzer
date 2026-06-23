import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { ParsedIsoMessage } from './../src/iso8583/iso8583.service';

describe('AppController (e2e)', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.useStaticAssets(join(__dirname, '..', 'public'));
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('hbs');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET) - should render the index view successfully', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(res.text).toContain('ISO 8583');
        expect(res.text).toContain('Analyzer');
      });
  });

  it('/api/parse (POST) - should parse a valid ISO 8583 message', () => {
    const rawMessage =
      '0800822000000000000004000000000000000623085400000002301';
    return request(app.getHttpServer())
      .post('/api/parse')
      .send({ message: rawMessage })
      .expect(201)
      .expect((res) => {
        const body = res.body as ParsedIsoMessage;
        expect(body.isValid).toBe(true);
        expect(body.mti.value).toBe('0800');
        expect(body.fields['70'].rawValue).toBe('301');
      });
  });
});
