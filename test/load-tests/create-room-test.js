
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '10s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';

  const response = http.post(
    `${baseUrl}/api/v1/rooms`,
    JSON.stringify({
      roomName: `Load Test Room ${__VU}-${__ITER}`,
      displayName: `Load Test User ${__VU}`,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const success = check(response, {
    'room created successfully': (r) => r.status === 201,
  });

  if (!success) {
    console.log(
      `VU=${__VU}, status=${response.status}, body=${response.body}`
    );
  }

  sleep(1);
}
