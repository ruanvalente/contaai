export type ActionSuccess<T = void> = {
  ok: true;
  data: T;
};

export type ActionFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

export type ActionResult<T = void> = ActionSuccess<T> | ActionFailure;

export function success<T>(data: T): ActionSuccess<T> {
  return { ok: true, data };
}

export function failure(code: string, message: string): ActionFailure {
  return { ok: false, error: { code, message } };
}
