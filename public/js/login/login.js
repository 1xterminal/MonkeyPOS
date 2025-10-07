$(document).ready(() => {
  const $loginForm = $('#login-form');
  const $empId = $('#employee-id');
  const $pass = $('#password');
  const $errorMessage = $('#login-error-message');

  $loginForm.on('submit', function (event) {
    event.preventDefault(); // stop HTML form reload

    const employeeId = $empId.val().trim();
    const password = $pass.val().trim();
    $errorMessage.text('');

    if (employeeId === '' || password === '') {
      $errorMessage.text('ID Karyawan dan Kata Sandi tidak boleh kosong.');
      return;
    }

    // Get all users from localStorage using the helper
    const users = Storage.getLocal('users', []);

    // Find existing user or create a new one
    let foundUser = users.find(u => u.id === employeeId);

    if (!foundUser) {
      // Auto-register new user
      foundUser = {
        id: employeeId,
        name: employeeId,
        password: password
      };
      users.push(foundUser);
      // Save updated users list using the helper
      Storage.setLocal('users', users); // <-- UPDATED
    } else if (foundUser.password !== password) {
      $errorMessage.text('Password salah untuk ID ini.');
      return;
    }

    // Save session using the helper
    const currentUser = {
      id: foundUser.id,
      name: foundUser.name
    };
    Storage.setSession('currentUser', currentUser); // <-- UPDATED

    // Redirect to dashboard
    window.location.href = '/pages/dashboard/dashboard.html';
  });
});