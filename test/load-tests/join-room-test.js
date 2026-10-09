
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
  const roomId = __ENV.ROOM_ID;
  const accessKey = __ENV.ACCESS_KEY;

  if (!roomId || !accessKey) {
    throw new Error(
      'Set ROOM_ID and ACCESS_KEY using k6 environment variables.'
    );
  }

  const url = `${baseUrl}/api/v1/rooms/${encodeURIComponent(roomId)}/join`;

  const payload = JSON.stringify({
    displayName: `LoadTest-${__VU}-${__ITER}`,
    accessKey: accessKey,
  });

  const response = http.post(url, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: {
      endpoint: 'join-room',
    },
  });

  check(response, {
    'join request returned success': (r) =>
      r.status >= 200 && r.status < 300,
  });

  if (response.status < 200 || response.status >= 300) {
    console.log(
      `VU=${__VU}, status=${response.status}, body=${response.body}`
    );
  }

  sleep(1);
}
