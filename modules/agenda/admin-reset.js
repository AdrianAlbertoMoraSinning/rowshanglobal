(function () {
  const form = document.getElementById('resetForm');
  const msg = document.getElementById('resetMsg');
  const submit = form.querySelector('button[type="submit"]');
  const newPassword = document.getElementById('newPassword');
  const confirmPassword = document.getElementById('confirmPassword');

  function getParams(value) {
    const raw = String(value || '').replace(/^[?#]/, '');
    return new URLSearchParams(raw);
  }

  const hash = getParams(window.location.hash);
  const query = getParams(window.location.search);

  const authError =
    hash.get('error_description') ||
    query.get('error_description') ||
    hash.get('error') ||
    query.get('error') ||
    '';

  const errorCode =
    hash.get('error_code') ||
    query.get('error_code') ||
    '';

  const accessToken =
    hash.get('access_token') ||
    query.get('access_token') ||
    '';

  const recoveryType =
    hash.get('type') ||
    query.get('type') ||
    '';

  if (authError) {
    const decoded = decodeURIComponent(
      authError.replace(/\+/g, ' ')
    );

    msg.textContent =
      `This password reset link cannot be used: ${decoded}. ` +
      'Return to Administration and request one new password reset email.';

    submit.disabled = true;

    console.error(
      'Password reset error:',
      errorCode,
      decoded
    );

    return;
  }

  if (!accessToken) {
    msg.textContent =
      'This password reset link is missing its recovery session, has expired, or has already been used. Return to Administration and request one new reset email.';

    submit.disabled = true;
    return;
  }

  if (recoveryType && recoveryType !== 'recovery') {
    console.warn(
      'Unexpected Supabase auth type:',
      recoveryType
    );
  }

  msg.textContent =
    'Secure recovery session detected. Enter your new administrator password.';

  form.onsubmit = async (event) => {
    event.preventDefault();

    const password = newPassword.value.trim();
    const confirm = confirmPassword.value.trim();

    if (password.length < 8) {
      msg.textContent =
        'Your new password must contain at least 8 characters.';
      return;
    }

    if (password !== confirm) {
      msg.textContent =
        'The passwords do not match.';
      return;
    }

    submit.disabled = true;
    msg.textContent = 'Updating your password…';

    try {
      await RMCData.updatePassword(
        accessToken,
        password
      );

      sessionStorage.removeItem(
        'rmc_admin_token'
      );

      newPassword.value = '';
      confirmPassword.value = '';

      msg.textContent =
        'Password updated successfully. Return to Administration and sign in using your new password.';

      history.replaceState(
        null,
        '',
        window.location.pathname
      );

    } catch (err) {
      submit.disabled = false;

      const raw = String(err?.message || '');

      console.error(
        'Password update failed:',
        err
      );

      if (/expired|invalid|jwt|token/i.test(raw)) {
        msg.textContent =
          'This password recovery session has expired or is no longer valid. Return to Administration and request one new reset email.';
      } else {
        msg.textContent =
          raw || 'Unable to update the password.';
      }
    }
  };
})();
