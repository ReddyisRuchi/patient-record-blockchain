// Lightweight API client for frontend components (uses same-origin cookies)
async function request(method, path, body) {
  const headers = { "Content-Type": "application/json" };

  const res = await fetch(path, {
    method,
    headers,
    credentials: "same-origin",
    body: body ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  try {
    payload = await res.json();
  } catch (e) {
    // non-json response
  }

  if (!res.ok) {
    const msg = (payload && payload.message) || res.statusText || "Request failed";
    const err = new Error(msg);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}

export async function get(path) {
  return request("GET", path);
}

export async function post(path, body) {
  return request("POST", path, body);
}

export async function put(path, body) {
  return request("PUT", path, body);
}

export async function del(path) {
  return request("DELETE", path);
}

const api = { get, post, put, del };

export default api;
