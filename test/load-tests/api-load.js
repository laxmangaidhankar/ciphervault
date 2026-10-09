
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: Number(__ENV.VUS || 1),
  duration: __ENV.DURATION || '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const baseUrl = __ENV.BASE_URL;
  const path = __ENV.API_PATH || '/health';

  if (!baseUrl) {
    throw new Error('Set BASE_URL before running this test');
  }

  const response = http.get(`${baseUrl.replace(/\/$/, '')}${path}`);

  check(response, {
    'expected HTTP status': (r) => r.status === 200,
  });
}
